# Database Schema for Gemini API Key Management

## Tables to Create

### 1. gemini_api_keys
Main table for storing encrypted API keys
```sql
CREATE TABLE gemini_api_keys (
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
```

### 2. gemini_key_audit_log  
Audit trail for all key operations
```sql
CREATE TABLE gemini_key_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_id UUID REFERENCES gemini_api_keys(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  details JSONB
);
```

### 3. gemini_key_usage_stats
Daily usage statistics per key
```sql
CREATE TABLE gemini_key_usage_stats (
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
```

### 4. Add admin flag to user_profiles
```sql
ALTER TABLE user_profiles 
ADD COLUMN is_admin BOOLEAN DEFAULT false;
```

## Indexes
```sql
CREATE INDEX idx_gemini_keys_active ON gemini_api_keys(is_active);
CREATE INDEX idx_gemini_keys_priority ON gemini_api_keys(priority DESC);
CREATE INDEX idx_audit_log_key_id ON gemini_key_audit_log(key_id);
CREATE INDEX idx_usage_stats_key_date ON gemini_key_usage_stats(key_id, date);
```

## Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE gemini_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE gemini_key_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE gemini_key_usage_stats ENABLE ROW LEVEL SECURITY;

-- Admin only policies
CREATE POLICY "Admin only access to gemini keys" ON gemini_api_keys
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );
```