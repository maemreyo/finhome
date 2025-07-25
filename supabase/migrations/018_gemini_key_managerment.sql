-- Migration: 001_gemini_key_management.sql
-- Description: Add tables for Gemini API key management system
-- Created: 2025-07-24

-- 1. Add admin flag to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. Create main gemini_api_keys table
CREATE TABLE IF NOT EXISTS gemini_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  encrypted_key TEXT NOT NULL,
  encryption_iv VARCHAR(255) NOT NULL,
  encryption_tag VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_used TIMESTAMP,
  usage_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0
);

-- 3. Create audit log table
CREATE TABLE IF NOT EXISTS gemini_key_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_id UUID REFERENCES gemini_api_keys(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'used', 'failed'
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  details JSONB
);

-- 4. Create usage statistics table
CREATE TABLE IF NOT EXISTS gemini_key_usage_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_id UUID REFERENCES gemini_api_keys(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  request_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  rate_limit_count INTEGER DEFAULT 0,
  avg_response_time FLOAT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(key_id, date)
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gemini_keys_active ON gemini_api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_gemini_keys_priority ON gemini_api_keys(priority DESC);
CREATE INDEX IF NOT EXISTS idx_gemini_keys_created_by ON gemini_api_keys(created_by);
CREATE INDEX IF NOT EXISTS idx_audit_log_key_id ON gemini_key_audit_log(key_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON gemini_key_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON gemini_key_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_stats_key_date ON gemini_key_usage_stats(key_id, date);
CREATE INDEX IF NOT EXISTS idx_usage_stats_date ON gemini_key_usage_stats(date DESC);

-- 6. Enable Row Level Security
ALTER TABLE gemini_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE gemini_key_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE gemini_key_usage_stats ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies - Admin only access
CREATE POLICY "Admin only access to gemini keys" ON gemini_api_keys
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admin only access to audit log" ON gemini_key_audit_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admin only access to usage stats" ON gemini_key_usage_stats
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 8. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create trigger for updated_at
CREATE TRIGGER update_gemini_api_keys_updated_at 
    BEFORE UPDATE ON gemini_api_keys 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Insert a comment for tracking
COMMENT ON TABLE gemini_api_keys IS 'Stores encrypted Gemini API keys for rate limiting rotation';
COMMENT ON TABLE gemini_key_audit_log IS 'Audit trail for all Gemini API key operations';
COMMENT ON TABLE gemini_key_usage_stats IS 'Daily usage statistics per Gemini API key';

-- 11. Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON gemini_api_keys TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON gemini_key_audit_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON gemini_key_usage_stats TO authenticated;