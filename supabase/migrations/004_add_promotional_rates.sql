-- 004_add_promotional_rates.sql
-- Migration: Add promotional rate fields to bank_interest_rates table
-- This addresses the missing promotional rate fields identified in the log analysis

-- Add promotional rate fields to bank_interest_rates table
ALTER TABLE bank_interest_rates 
ADD COLUMN promotional_rate DECIMAL(5, 3),
ADD COLUMN promotional_period_months INTEGER,
ADD COLUMN promotional_conditions JSONB DEFAULT '[]',
ADD COLUMN promotional_end_date DATE;

-- Add constraints for promotional rates
ALTER TABLE bank_interest_rates 
ADD CONSTRAINT valid_promotional_rate CHECK (
    promotional_rate IS NULL OR (promotional_rate > 0 AND promotional_rate < 50)
),
ADD CONSTRAINT valid_promotional_period CHECK (
    promotional_period_months IS NULL OR promotional_period_months > 0
),
ADD CONSTRAINT promotional_consistency CHECK (
    (promotional_rate IS NULL AND promotional_period_months IS NULL) OR
    (promotional_rate IS NOT NULL AND promotional_period_months IS NOT NULL)
);

-- Add index for promotional rate queries
CREATE INDEX idx_bank_rates_promotional ON bank_interest_rates(
    bank_id, 
    is_active, 
    promotional_rate, 
    promotional_end_date
) WHERE promotional_rate IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN bank_interest_rates.promotional_rate IS 'Special promotional interest rate (if applicable)';
COMMENT ON COLUMN bank_interest_rates.promotional_period_months IS 'Duration of promotional rate in months';
COMMENT ON COLUMN bank_interest_rates.promotional_conditions IS 'JSON array of conditions for promotional rate';
COMMENT ON COLUMN bank_interest_rates.promotional_end_date IS 'End date for promotional rate eligibility';