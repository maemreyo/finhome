-- Migration: 003_seed_data.sql
-- Description: Insert initial seed data
-- Created: 2024-01-15
-- Author: FinHome Development Team

BEGIN;

-- Check if migration has already been applied
IF EXISTS (SELECT 1 FROM schema_migrations WHERE version = '003') THEN
    RAISE EXCEPTION 'Migration 003 has already been applied';
END IF;

-- Apply seed data
\i seed_data.sql

-- Record migration
INSERT INTO schema_migrations (version, description) 
VALUES ('003', 'Inserted initial seed data including banks, rates, and achievements');

COMMIT;