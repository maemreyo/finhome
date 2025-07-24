# Gemini API Key Management UI Implementation

## Overview
Creating a comprehensive UI for managing Gemini API keys in production environment with secure storage and real-time monitoring.

## Current Progress
1. ✅ Created ticket 40 for the feature
2. ✅ Implemented API routes (`/api/admin/gemini-keys/route.ts`)
3. 🔄 Need to create database schema
4. 🔄 Need to implement UI components
5. 🔄 Need to integrate with settings page

## Database Schema Requirements
```sql
-- Main keys table
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

-- Audit log table
CREATE TABLE gemini_key_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_id UUID REFERENCES gemini_api_keys(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'used', 'failed'
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  details JSONB
);

-- Usage statistics table
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

## Security Features
- AES-256-GCM encryption for API keys
- IV and authentication tag stored separately
- Admin-only access control
- Audit logging for all operations
- Key masking in UI (show last 4 chars only)

## UI Components Needed
1. `GeminiKeyManagement` - Main management interface
2. `AddKeyDialog` - Modal for adding new keys
3. `KeyStatusCard` - Display key status and stats
4. `KeyUsageChart` - Visual usage statistics
5. `AuditLogTable` - Show recent activities

## Integration Points
- Settings page new tab: "API Keys"
- Real-time status updates
- Integration with existing GeminiKeyManager class
- Admin role checking