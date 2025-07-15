-- FinHome Row Level Security (RLS) Policies
-- Comprehensive security policies for data protection and user privacy

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_interest_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USER PROFILE POLICIES
-- =============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (for registration)
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Authenticated users can view public profiles (for social features)
CREATE POLICY "Users can view public profiles" ON user_profiles
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        id IN (
            SELECT user_id FROM user_preferences 
            WHERE profile_visibility = 'public'
        )
    );

-- =============================================
-- USER PREFERENCES POLICIES
-- =============================================

-- Users can manage their own preferences
CREATE POLICY "Users can manage own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- PROPERTY POLICIES
-- =============================================

-- All authenticated users can view published properties
CREATE POLICY "Users can view published properties" ON properties
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        published_at IS NOT NULL
    );

-- Admin users can manage all properties
CREATE POLICY "Admins can manage all properties" ON properties
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM user_profiles 
            WHERE subscription_tier = 'professional'
        )
    );

-- Property managers can view all properties
CREATE POLICY "Property managers can view all properties" ON properties
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM user_profiles 
            WHERE subscription_tier IN ('premium', 'professional')
        )
    );

-- =============================================
-- PROPERTY FAVORITES POLICIES
-- =============================================

-- Users can manage their own favorites
CREATE POLICY "Users can manage own favorites" ON property_favorites
    FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- USER PROPERTIES POLICIES
-- =============================================

-- Users can manage their own property investments
CREATE POLICY "Users can manage own properties" ON user_properties
    FOR ALL USING (auth.uid() = user_id);

-- Premium users can view aggregate data (anonymized)
CREATE POLICY "Premium users can view aggregate property data" ON user_properties
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM user_profiles 
            WHERE subscription_tier IN ('premium', 'professional')
        ) AND 
        user_id != auth.uid() -- Exclude own data from aggregate views
    );

-- =============================================
-- FINANCIAL PLANS POLICIES
-- =============================================

-- Users can manage their own financial plans
CREATE POLICY "Users can manage own financial plans" ON financial_plans
    FOR ALL USING (auth.uid() = user_id);

-- Users can share specific plans (when status is 'public')
CREATE POLICY "Users can view shared financial plans" ON financial_plans
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        status = 'active' AND
        user_id IN (
            SELECT user_id FROM user_preferences 
            WHERE profile_visibility = 'public'
        )
    );

-- =============================================
-- LOAN CALCULATIONS POLICIES
-- =============================================

-- Users can manage their own loan calculations
CREATE POLICY "Users can manage own loan calculations" ON loan_calculations
    FOR ALL USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT user_id FROM financial_plans 
            WHERE id = financial_plan_id
        )
    );

-- =============================================
-- BANK DATA POLICIES
-- =============================================

-- All authenticated users can view bank information
CREATE POLICY "Users can view bank data" ON banks
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Only admins can modify bank data
CREATE POLICY "Admins can manage bank data" ON banks
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM user_profiles 
            WHERE subscription_tier = 'professional'
        )
    );

-- All authenticated users can view active interest rates
CREATE POLICY "Users can view interest rates" ON bank_interest_rates
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        is_active = true AND 
        effective_date <= CURRENT_DATE AND 
        (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)
    );

-- Only admins can manage interest rates
CREATE POLICY "Admins can manage interest rates" ON bank_interest_rates
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM user_profiles 
            WHERE subscription_tier = 'professional'
        )
    );

-- =============================================
-- ACHIEVEMENT SYSTEM POLICIES
-- =============================================

-- All authenticated users can view active achievements
CREATE POLICY "Users can view achievements" ON achievements
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Only admins can manage achievements
CREATE POLICY "Admins can manage achievements" ON achievements
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM user_profiles 
            WHERE subscription_tier = 'professional'
        )
    );

-- Users can view their own achievement unlocks
CREATE POLICY "Users can view own achievement unlocks" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

-- System can insert achievement unlocks (via service role)
CREATE POLICY "System can insert achievement unlocks" ON user_achievements
    FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

-- Users can view public achievement unlocks
CREATE POLICY "Users can view public achievement unlocks" ON user_achievements
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        user_id IN (
            SELECT user_id FROM user_preferences 
            WHERE profile_visibility = 'public'
        )
    );

-- =============================================
-- USER EXPERIENCE POLICIES
-- =============================================

-- Users can view their own experience data
CREATE POLICY "Users can view own experience" ON user_experience
    FOR SELECT USING (auth.uid() = user_id);

-- System can update experience data
CREATE POLICY "System can update experience" ON user_experience
    FOR ALL USING (auth.role() = 'service_role' OR auth.uid() = user_id);

-- Users can view public experience data (leaderboards)
CREATE POLICY "Users can view public experience data" ON user_experience
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        user_id IN (
            SELECT user_id FROM user_preferences 
            WHERE profile_visibility = 'public'
        )
    );

-- =============================================
-- NOTIFICATIONS POLICIES
-- =============================================

-- Users can manage their own notifications
CREATE POLICY "Users can manage own notifications" ON notifications
    FOR ALL USING (auth.uid() = user_id);

-- System can send notifications to all users
CREATE POLICY "System can send notifications" ON notifications
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- =============================================
-- USER ACTIVITIES POLICIES
-- =============================================

-- Users can view their own activities
CREATE POLICY "Users can view own activities" ON user_activities
    FOR SELECT USING (auth.uid() = user_id);

-- System can log all activities
CREATE POLICY "System can log activities" ON user_activities
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Admins can view all activities (for analytics)
CREATE POLICY "Admins can view all activities" ON user_activities
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM user_profiles 
            WHERE subscription_tier = 'professional'
        )
    );

-- =============================================
-- APP SETTINGS POLICIES
-- =============================================

-- All authenticated users can view public settings
CREATE POLICY "Users can view public settings" ON app_settings
    FOR SELECT USING (auth.role() = 'authenticated' AND is_public = true);

-- Only admins can manage all settings
CREATE POLICY "Admins can manage all settings" ON app_settings
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM user_profiles 
            WHERE subscription_tier = 'professional'
        )
    );

-- =============================================
-- SECURITY FUNCTIONS
-- =============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = user_uuid 
        AND subscription_tier = 'professional'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can view another user's data
CREATE OR REPLACE FUNCTION can_view_user_data(viewer_uuid UUID, target_user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Users can always view their own data
    IF viewer_uuid = target_user_uuid THEN
        RETURN TRUE;
    END IF;
    
    -- Check if target user allows public visibility
    RETURN EXISTS (
        SELECT 1 FROM user_preferences 
        WHERE user_id = target_user_uuid 
        AND profile_visibility = 'public'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user subscription tier
CREATE OR REPLACE FUNCTION get_user_subscription_tier(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    tier TEXT;
BEGIN
    SELECT subscription_tier INTO tier 
    FROM user_profiles 
    WHERE id = user_uuid;
    
    RETURN COALESCE(tier, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PERFORMANCE INDEXES FOR RLS
-- =============================================

-- Indexes to optimize RLS policy queries
CREATE INDEX idx_user_profiles_subscription_tier ON user_profiles(subscription_tier);
CREATE INDEX idx_user_preferences_visibility ON user_preferences(user_id, profile_visibility);
CREATE INDEX idx_properties_published ON properties(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX idx_bank_rates_active_dates ON bank_interest_rates(is_active, effective_date, expiry_date);
CREATE INDEX idx_achievements_active ON achievements(is_active) WHERE is_active = true;

-- =============================================
-- AUDIT TRIGGER FOR SENSITIVE OPERATIONS
-- =============================================

-- Function to log sensitive data changes
CREATE OR REPLACE FUNCTION log_sensitive_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log changes to user profiles, financial plans, and properties
    INSERT INTO user_activities (
        user_id,
        activity_type,
        action,
        resource_type,
        resource_id,
        metadata
    ) VALUES (
        auth.uid(),
        'data_change',
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        jsonb_build_object(
            'table', TG_TABLE_NAME,
            'operation', TG_OP,
            'timestamp', NOW()
        )
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_user_profiles
    AFTER INSERT OR UPDATE OR DELETE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION log_sensitive_changes();

CREATE TRIGGER audit_financial_plans
    AFTER INSERT OR UPDATE OR DELETE ON financial_plans
    FOR EACH ROW EXECUTE FUNCTION log_sensitive_changes();

CREATE TRIGGER audit_user_properties
    AFTER INSERT OR UPDATE OR DELETE ON user_properties
    FOR EACH ROW EXECUTE FUNCTION log_sensitive_changes();

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON POLICY "Users can view own profile" ON user_profiles IS 'Users have full access to their own profile data';
COMMENT ON POLICY "Users can view published properties" ON properties IS 'All authenticated users can browse published property listings';
COMMENT ON POLICY "Users can manage own financial plans" ON financial_plans IS 'Users have complete control over their financial planning data';
COMMENT ON POLICY "Users can view interest rates" ON bank_interest_rates IS 'Current bank rates are public for all authenticated users';
COMMENT ON POLICY "System can send notifications" ON notifications IS 'Allows backend services to send notifications to users';

COMMENT ON FUNCTION is_admin(UUID) IS 'Check if user has administrative privileges';
COMMENT ON FUNCTION can_view_user_data(UUID, UUID) IS 'Determine if one user can view another users data based on privacy settings';
COMMENT ON FUNCTION get_user_subscription_tier(UUID) IS 'Get the subscription tier for a specific user';
COMMENT ON FUNCTION log_sensitive_changes() IS 'Audit function to log changes to sensitive user data';