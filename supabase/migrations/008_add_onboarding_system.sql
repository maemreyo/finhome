-- Add onboarding and analytics system support
-- Migration 008: Add onboarding progress tracking and analytics events

-- =============================================
-- ADD ONBOARDING SUPPORT TO USER_PREFERENCES
-- =============================================

-- Add onboarding_progress column to user_preferences
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS onboarding_progress JSONB DEFAULT '{}';

-- Add onboarding_completed column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- =============================================
-- CREATE ANALYTICS_EVENTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User information (nullable for anonymous events)
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    
    -- Event information
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    
    -- Context information
    session_id TEXT,
    user_agent TEXT,
    ip_address INET,
    page_url TEXT,
    referrer TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE analytics_events IS 'Stores user interaction and system events for analytics';
COMMENT ON COLUMN analytics_events.event_type IS 'Type of event (e.g., onboarding_tour_started, plan_created, etc.)';
COMMENT ON COLUMN analytics_events.event_data IS 'JSON data specific to the event type';
COMMENT ON COLUMN analytics_events.user_id IS 'User who triggered the event (nullable for anonymous events)';

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on analytics_events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy for analytics_events - only allow inserts and reads by authenticated users
CREATE POLICY "Users can insert their own analytics events" ON analytics_events
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can read their own analytics events" ON analytics_events
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Admins can read all analytics events
CREATE POLICY "Admins can read all analytics events" ON analytics_events
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND subscription_tier = 'professional'
        )
    );

-- =============================================
-- ONBOARDING HELPER FUNCTIONS
-- =============================================

-- Function to get user onboarding status
CREATE OR REPLACE FUNCTION get_user_onboarding_status(user_uuid UUID)
RETURNS TABLE (
    has_completed_onboarding BOOLEAN,
    onboarding_progress JSONB,
    recommended_tour TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.onboarding_completed,
        up.onboarding_progress,
        CASE 
            WHEN up.onboarding_completed = false OR up.onboarding_completed IS NULL THEN 'first_time_user'
            WHEN (SELECT COUNT(*) FROM financial_plans WHERE user_id = user_uuid) = 0 THEN 'financial_planning_intro'
            ELSE 'dashboard_features'
        END as recommended_tour
    FROM user_profiles up
    LEFT JOIN user_preferences pref ON up.id = pref.user_id
    WHERE up.id = user_uuid;
END;
$$;

-- Function to track onboarding event
CREATE OR REPLACE FUNCTION track_onboarding_event(
    p_user_id UUID,
    p_event_type TEXT,
    p_event_data JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO analytics_events (user_id, event_type, event_data)
    VALUES (p_user_id, p_event_type, p_event_data)
    RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$;

-- =============================================
-- ANALYTICS EVENTS INDEXES
-- =============================================

-- Indexes for analytics_events performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id_created 
ON analytics_events (user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type 
ON analytics_events (event_type);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at 
ON analytics_events (created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id 
ON analytics_events (session_id);

-- =============================================
-- INDEXES AND PERFORMANCE OPTIMIZATIONS
-- =============================================

-- Index for onboarding progress queries
CREATE INDEX IF NOT EXISTS idx_user_preferences_onboarding 
ON user_preferences USING GIN (onboarding_progress);

-- Index for onboarding completed status
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding_completed 
ON user_profiles (onboarding_completed) 
WHERE onboarding_completed = false;

-- =============================================
-- GRANTS AND PERMISSIONS
-- =============================================

-- Grant permissions for analytics_events
GRANT SELECT, INSERT ON analytics_events TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_user_onboarding_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION track_onboarding_event(UUID, TEXT, JSONB) TO authenticated;

-- =============================================
-- DATA MIGRATION
-- =============================================

-- Initialize onboarding_progress for existing users
UPDATE user_preferences 
SET onboarding_progress = '{}'
WHERE onboarding_progress IS NULL;

-- Mark users who have financial plans as having completed basic onboarding
UPDATE user_profiles 
SET onboarding_completed = true
WHERE id IN (
    SELECT DISTINCT user_id 
    FROM financial_plans 
    WHERE status = 'active'
)
AND (onboarding_completed IS NULL OR onboarding_completed = false);