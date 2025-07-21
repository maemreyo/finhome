-- Migration: Update feature usage tracking table
-- Date: 2025-07-21
-- Description: Update existing feature_usage table for persistent tracking to replace localStorage

-- Check if feature_usage table exists and update it
DO $$
BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_usage' AND column_name = 'feature_key') THEN
    ALTER TABLE feature_usage ADD COLUMN feature_key VARCHAR(100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_usage' AND column_name = 'usage_count') THEN
    ALTER TABLE feature_usage ADD COLUMN usage_count INTEGER NOT NULL DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_usage' AND column_name = 'period_type') THEN
    ALTER TABLE feature_usage ADD COLUMN period_type VARCHAR(20) NOT NULL DEFAULT 'monthly';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_usage' AND column_name = 'period_start') THEN
    ALTER TABLE feature_usage ADD COLUMN period_start TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_usage' AND column_name = 'period_end') THEN
    ALTER TABLE feature_usage ADD COLUMN period_end TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_usage' AND column_name = 'last_used') THEN
    ALTER TABLE feature_usage ADD COLUMN last_used TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_usage' AND column_name = 'metadata') THEN
    ALTER TABLE feature_usage ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_usage' AND column_name = 'updated_at') THEN
    ALTER TABLE feature_usage ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- Migrate data from feature_name to feature_key if needed
UPDATE feature_usage 
SET feature_key = feature_name 
WHERE feature_key IS NULL AND feature_name IS NOT NULL;

-- Set feature_key as NOT NULL after migration
ALTER TABLE feature_usage ALTER COLUMN feature_key SET NOT NULL;

-- Set period_start and period_end for existing records
UPDATE feature_usage 
SET 
  period_start = date_trunc('month', created_at),
  period_end = date_trunc('month', created_at) + INTERVAL '1 month' - INTERVAL '1 second'
WHERE period_start IS NULL OR period_end IS NULL;

-- Set period columns as NOT NULL after migration
ALTER TABLE feature_usage ALTER COLUMN period_start SET NOT NULL;
ALTER TABLE feature_usage ALTER COLUMN period_end SET NOT NULL;

-- Create indexes for efficient queries (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature_key ON feature_usage(feature_key);
CREATE INDEX IF NOT EXISTS idx_feature_usage_period ON feature_usage(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_feature_usage_last_used ON feature_usage(last_used);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'feature_usage' 
    AND constraint_name = 'feature_usage_user_feature_period_unique'
  ) THEN
    ALTER TABLE feature_usage 
    ADD CONSTRAINT feature_usage_user_feature_period_unique 
    UNIQUE(user_id, feature_key, period_start, period_end);
  END IF;
END $$;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own feature usage" ON feature_usage;
DROP POLICY IF EXISTS "Users can insert their own feature usage" ON feature_usage;
DROP POLICY IF EXISTS "Users can update their own feature usage" ON feature_usage;

CREATE POLICY "Users can view their own feature usage" ON feature_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feature usage" ON feature_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feature usage" ON feature_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Drop and recreate function to increment feature usage
DROP FUNCTION IF EXISTS increment_feature_usage(UUID, VARCHAR(100), VARCHAR(20));

CREATE OR REPLACE FUNCTION increment_feature_usage(
  p_user_id UUID,
  p_feature_key VARCHAR(100),
  p_period_type VARCHAR(20) DEFAULT 'monthly'
)
RETURNS TABLE(
  current_count INTEGER,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_period_start TIMESTAMP WITH TIME ZONE;
  v_period_end TIMESTAMP WITH TIME ZONE;
  v_current_count INTEGER;
BEGIN
  -- Calculate period boundaries based on type
  CASE p_period_type
    WHEN 'daily' THEN
      v_period_start := date_trunc('day', NOW());
      v_period_end := v_period_start + INTERVAL '1 day' - INTERVAL '1 second';
    WHEN 'monthly' THEN
      v_period_start := date_trunc('month', NOW());
      v_period_end := v_period_start + INTERVAL '1 month' - INTERVAL '1 second';
    WHEN 'yearly' THEN
      v_period_start := date_trunc('year', NOW());
      v_period_end := v_period_start + INTERVAL '1 year' - INTERVAL '1 second';
    ELSE
      RAISE EXCEPTION 'Invalid period_type: %', p_period_type;
  END CASE;

  -- Insert or update usage record using the constraint name
  INSERT INTO feature_usage (
    user_id, 
    feature_key, 
    usage_count, 
    period_type, 
    period_start, 
    period_end, 
    last_used
  )
  VALUES (
    p_user_id, 
    p_feature_key, 
    1, 
    p_period_type, 
    v_period_start, 
    v_period_end, 
    NOW()
  )
  ON CONFLICT ON CONSTRAINT feature_usage_user_feature_period_unique
  DO UPDATE SET
    usage_count = feature_usage.usage_count + 1,
    last_used = NOW(),
    updated_at = NOW()
  RETURNING usage_count INTO v_current_count;

  -- Return the current usage data
  RETURN QUERY
  SELECT 
    v_current_count,
    v_period_start,
    v_period_end;
END;
$$;

-- Drop and recreate function to get current feature usage
DROP FUNCTION IF EXISTS get_feature_usage(UUID, VARCHAR(100), VARCHAR(20));

CREATE OR REPLACE FUNCTION get_feature_usage(
  p_user_id UUID,
  p_feature_key VARCHAR(100),
  p_period_type VARCHAR(20) DEFAULT 'monthly'
)
RETURNS TABLE(
  usage_count INTEGER,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  last_used TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_period_start TIMESTAMP WITH TIME ZONE;
  v_period_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate period boundaries
  CASE p_period_type
    WHEN 'daily' THEN
      v_period_start := date_trunc('day', NOW());
      v_period_end := v_period_start + INTERVAL '1 day' - INTERVAL '1 second';
    WHEN 'monthly' THEN
      v_period_start := date_trunc('month', NOW());
      v_period_end := v_period_start + INTERVAL '1 month' - INTERVAL '1 second';
    WHEN 'yearly' THEN
      v_period_start := date_trunc('year', NOW());
      v_period_end := v_period_start + INTERVAL '1 year' - INTERVAL '1 second';
    ELSE
      RAISE EXCEPTION 'Invalid period_type: %', p_period_type;
  END CASE;

  -- Return usage data for current period
  RETURN QUERY
  SELECT 
    COALESCE(fu.usage_count, 0),
    v_period_start,
    v_period_end,
    fu.last_used
  FROM (
    SELECT 
      usage_count,
      last_used
    FROM feature_usage
    WHERE user_id = p_user_id
      AND feature_key = p_feature_key
      AND period_start = v_period_start
      AND period_end = v_period_end
    LIMIT 1
  ) fu
  RIGHT JOIN (SELECT 1) dummy ON true;
END;
$$;

-- Drop and recreate function to reset feature usage (for admin purposes)
DROP FUNCTION IF EXISTS reset_feature_usage(UUID, VARCHAR(100));

CREATE OR REPLACE FUNCTION reset_feature_usage(
  p_user_id UUID,
  p_feature_key VARCHAR(100) DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Only allow admins to reset usage
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Reset usage for specific feature or all features
  IF p_feature_key IS NOT NULL THEN
    DELETE FROM feature_usage 
    WHERE user_id = p_user_id AND feature_key = p_feature_key;
  ELSE
    DELETE FROM feature_usage 
    WHERE user_id = p_user_id;
  END IF;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON feature_usage TO authenticated;
GRANT EXECUTE ON FUNCTION increment_feature_usage TO authenticated;
GRANT EXECUTE ON FUNCTION get_feature_usage TO authenticated;
GRANT EXECUTE ON FUNCTION reset_feature_usage TO authenticated;