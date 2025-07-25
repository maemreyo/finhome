-- Migration: 006_add_plan_shares_and_user_tracking.sql
-- Purpose: Add plan_shares table for email sharing functionality and user tracking to plan_status_history

-- Create plan_shares table for tracking email shares
CREATE TABLE plan_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES financial_plans(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with TEXT[] NOT NULL, -- Array of email addresses
    share_method VARCHAR(20) NOT NULL DEFAULT 'email',
    share_url TEXT NOT NULL,
    personal_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies for plan_shares
ALTER TABLE plan_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shared plans" ON plan_shares
    FOR SELECT USING (
        auth.uid() = shared_by OR 
        auth.uid() IN (
            SELECT user_id FROM financial_plans WHERE id = plan_shares.plan_id
        )
    );

CREATE POLICY "Users can create plan shares" ON plan_shares
    FOR INSERT WITH CHECK (
        auth.uid() = shared_by AND
        auth.uid() IN (
            SELECT user_id FROM financial_plans WHERE id = plan_shares.plan_id
        )
    );

CREATE POLICY "Users can update their own plan shares" ON plan_shares
    FOR UPDATE USING (auth.uid() = shared_by);

CREATE POLICY "Users can delete their own plan shares" ON plan_shares
    FOR DELETE USING (auth.uid() = shared_by);

-- Add indexes for performance
CREATE INDEX idx_plan_shares_plan_id ON plan_shares(plan_id);
CREATE INDEX idx_plan_shares_shared_by ON plan_shares(shared_by);
CREATE INDEX idx_plan_shares_created_at ON plan_shares(created_at);

-- Add trigger for updated_at
CREATE TRIGGER update_plan_shares_updated_at
    BEFORE UPDATE ON plan_shares
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Check if column already exists before adding
DO $$
BEGIN
    -- Attempt to add column only if it doesn't already exist
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='plan_status_history' 
        AND column_name='changed_by'
    ) THEN
        ALTER TABLE plan_status_history 
        ADD COLUMN changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

        -- Update existing records to have a default user (first admin user or system)
        UPDATE plan_status_history 
        SET changed_by = (
            SELECT id FROM auth.users 
            WHERE email LIKE '%admin%' 
            LIMIT 1
        )
        WHERE changed_by IS NULL;

        -- Add index for performance
        CREATE INDEX idx_plan_status_history_changed_by ON plan_status_history(changed_by);
    END IF;
END $$;

-- Add a view to get plan shares with user information
CREATE VIEW plan_shares_with_users AS
SELECT 
    ps.*,
    up.full_name as shared_by_name,
    up.email as shared_by_email,
    fp.plan_name,
    fp.description as plan_description
FROM plan_shares ps
LEFT JOIN user_profiles up ON ps.shared_by = up.id
LEFT JOIN financial_plans fp ON ps.plan_id = fp.id;

-- Grant access to the view
GRANT SELECT ON plan_shares_with_users TO authenticated;

-- Add a function to get plan share analytics
CREATE OR REPLACE FUNCTION get_plan_share_analytics(user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_shares', COALESCE(COUNT(*), 0),
        'shares_this_month', COALESCE(SUM(CASE WHEN created_at >= date_trunc('month', NOW()) THEN 1 ELSE 0 END), 0),
        'most_shared_plan', (
            SELECT json_build_object(
                'plan_id', plan_id,
                'plan_name', (SELECT plan_name FROM financial_plans WHERE id = plan_id LIMIT 1),
                'share_count', COUNT(*)
            )
            FROM plan_shares 
            WHERE shared_by = user_id 
            GROUP BY plan_id 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
        ),
        'share_methods', json_agg(DISTINCT share_method)
    ) INTO result
    FROM plan_shares
    WHERE shared_by = user_id;
    
    RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_plan_share_analytics(UUID) TO authenticated;