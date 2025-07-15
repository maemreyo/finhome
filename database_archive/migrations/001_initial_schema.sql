-- Migration: 001_initial_schema.sql
-- Description: Initial database schema setup for FinHome
-- Created: 2024-01-15
-- Author: FinHome Development Team

-- This migration creates the complete initial schema for the FinHome application
-- It includes all tables, types, indexes, triggers, and constraints

BEGIN;

-- Check if migration has already been applied
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'schema_migrations') THEN
        IF EXISTS (SELECT 1 FROM schema_migrations WHERE version = '001') THEN
            RAISE EXCEPTION 'Migration 001 has already been applied';
        END IF;
    ELSE
        -- Create migrations tracking table
        CREATE TABLE schema_migrations (
            version VARCHAR(255) PRIMARY KEY,
            applied_at TIMESTAMPTZ DEFAULT NOW(),
            description TEXT
        );
    END IF;
END $$;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Import the complete schema
\i schema.sql

-- Record migration
INSERT INTO schema_migrations (version, description) 
VALUES ('001', 'Initial database schema with all tables, types, and constraints');

COMMIT;