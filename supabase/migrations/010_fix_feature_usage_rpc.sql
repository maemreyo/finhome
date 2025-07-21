-- Migration: Fix RPC function issues in feature usage tracking
-- Date: 2025-07-21
-- Description: Fix ambiguous column references and NULL constraint violations

-- Drop and recreate function to get current feature usage with proper aliasing
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
  v_usage_count INTEGER;
  v_last_used TIMESTAMP WITH TIME ZONE;
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

  -- Get usage data for current period
  SELECT 
    fu.usage_count,
    fu.last_used
  INTO 
    v_usage_count,
    v_last_used
  FROM feature_usage fu
  WHERE fu.user_id = p_user_id
    AND fu.feature_key = p_feature_key
    AND fu.period_start = v_period_start
    AND fu.period_end = v_period_end
  LIMIT 1;

  -- Return usage data (use 0 if no record found)
  RETURN QUERY
  SELECT 
    COALESCE(v_usage_count, 0) as usage_count,
    v_period_start as period_start,
    v_period_end as period_end,
    v_last_used as last_used;
END;
$$;

-- Fix increment function to ensure feature_name is populated when needed
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
    feature_name,  -- Also populate feature_name for backward compatibility
    feature_key, 
    usage_count, 
    period_type, 
    period_start, 
    period_end, 
    last_used
  )
  VALUES (
    p_user_id, 
    p_feature_key,  -- Use feature_key as feature_name too
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
  RETURNING feature_usage.usage_count INTO v_current_count;

  -- Return the current usage data
  RETURN QUERY
  SELECT 
    v_current_count as current_count,
    v_period_start as period_start,
    v_period_end as period_end;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION increment_feature_usage TO authenticated;
GRANT EXECUTE ON FUNCTION get_feature_usage TO authenticated;