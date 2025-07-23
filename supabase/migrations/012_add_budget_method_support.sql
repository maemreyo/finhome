-- Migration: Add budget method support for 50/30/20 and other methodologies
-- Created: 2025-01-xx
-- Purpose: Enable users to create budgets using different methodologies like 50/30/20 rule

-- Add budget_method column to expense_budgets table
ALTER TABLE expense_budgets 
ADD COLUMN budget_method TEXT NOT NULL DEFAULT 'manual' 
CHECK (budget_method IN ('manual', '50_30_20', '6_jars', 'envelope', 'zero_based', 'kakeibo'));

-- Add category_mapping column to store how categories map to budget groups
ALTER TABLE expense_budgets 
ADD COLUMN category_mapping JSONB DEFAULT '{}';

-- Add budget_allocation column to store method-specific allocations
ALTER TABLE expense_budgets 
ADD COLUMN budget_allocation JSONB DEFAULT '{}';

-- Add comments for the new columns
COMMENT ON COLUMN expense_budgets.budget_method IS 'Budget methodology: manual, 50_30_20, 6_jars, envelope, zero_based, kakeibo';
COMMENT ON COLUMN expense_budgets.category_mapping IS 'Maps expense categories to budget groups (e.g., needs, wants, savings)';
COMMENT ON COLUMN expense_budgets.budget_allocation IS 'Stores method-specific budget allocations and rules';

-- Create index for querying budgets by method
CREATE INDEX idx_expense_budgets_method ON expense_budgets(user_id, budget_method, is_active);

-- Update the existing budget policies to include new columns
-- The existing RLS policies should automatically cover the new columns

-- Create a view for easier querying of budget with method details
CREATE OR REPLACE VIEW budget_overview AS 
SELECT 
    b.*,
    CASE 
        WHEN b.budget_method = '50_30_20' THEN 
            jsonb_build_object(
                'needs', (b.total_budget * 0.5),
                'wants', (b.total_budget * 0.3),
                'savings', (b.total_budget * 0.2)
            )
        WHEN b.budget_method = '6_jars' THEN
            jsonb_build_object(
                'necessities', (b.total_budget * 0.55),
                'education', (b.total_budget * 0.10),
                'ltss', (b.total_budget * 0.10),
                'play', (b.total_budget * 0.10),
                'financial_freedom', (b.total_budget * 0.10),
                'give', (b.total_budget * 0.05)
            )
        ELSE b.budget_allocation
    END as calculated_allocation,
    (
        SELECT 
            COALESCE(SUM(spent_amount), 0) 
        FROM budget_categories 
        WHERE budget_id = b.id
    ) as total_spent_calculated,
    (
        SELECT 
            jsonb_object_agg(
                COALESCE(ec.name_vi, 'Uncategorized'),
                bc.spent_amount
            )
        FROM budget_categories bc
        LEFT JOIN expense_categories ec ON bc.category_id = ec.id
        WHERE bc.budget_id = b.id
    ) as spending_by_category
FROM expense_budgets b;

-- Grant access to the view
GRANT SELECT ON budget_overview TO authenticated;

-- Note: Views inherit RLS from underlying tables (expense_budgets)
-- No need to enable RLS on the view itself