-- Migration: 002_rls_policies.sql  
-- Description: Apply Row Level Security policies
-- Created: 2024-01-15
-- Author: FinHome Development Team

BEGIN;

-- Check if migration has already been applied
IF EXISTS (SELECT 1 FROM schema_migrations WHERE version = '002') THEN
    RAISE EXCEPTION 'Migration 002 has already been applied';
END IF;

-- Apply RLS policies
\i rls_policies.sql

-- Record migration
INSERT INTO schema_migrations (version, description) 
VALUES ('002', 'Applied Row Level Security policies for data protection');

COMMIT;