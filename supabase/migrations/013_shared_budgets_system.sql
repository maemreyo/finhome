-- FinHome Shared Budgets System Migration
-- Adds comprehensive shared budget functionality for shared wallets
-- Part of Ticket 6: Optimized Shared Wallets

-- =============================================
-- SHARED BUDGET TYPES
-- =============================================

CREATE TYPE budget_period_type AS ENUM ('weekly', 'monthly', 'quarterly', 'yearly', 'custom');
CREATE TYPE budget_alert_type AS ENUM ('percentage', 'amount_remaining', 'amount_spent');

-- =============================================
-- SHARED BUDGET TABLES
-- =============================================

-- Main shared budgets table
CREATE TABLE shared_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Wallet association
    shared_wallet_id UUID NOT NULL REFERENCES shared_expense_wallets(id) ON DELETE CASCADE,
    
    -- Budget identification
    name TEXT NOT NULL,
    description TEXT,
    
    -- Period configuration
    budget_period budget_period_type DEFAULT 'monthly',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Budget amounts
    total_budget DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK (total_budget >= 0),
    total_spent DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
    total_allocated DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK (total_allocated >= 0),
    
    -- Alert configuration
    alert_threshold_percentage INTEGER DEFAULT 80 CHECK (alert_threshold_percentage BETWEEN 0 AND 100),
    enable_category_alerts BOOLEAN DEFAULT true,
    enable_overspending_alerts BOOLEAN DEFAULT true,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_template BOOLEAN DEFAULT false,
    
    -- Audit fields
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Category allocations for shared budgets
CREATE TABLE shared_budget_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Budget association
    shared_budget_id UUID NOT NULL REFERENCES shared_budgets(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES expense_categories(id) ON DELETE CASCADE,
    
    -- Allocation amounts
    allocated_amount DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK (allocated_amount >= 0),
    spent_amount DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK (spent_amount >= 0),
    
    -- Alert configuration for this category
    category_alert_threshold DECIMAL(15,2),
    enable_category_notifications BOOLEAN DEFAULT true,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    
    -- Ensure unique category per budget
    UNIQUE(shared_budget_id, category_id)
);

-- Budget activity log for audit trail
CREATE TABLE shared_budget_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Budget association
    shared_budget_id UUID NOT NULL REFERENCES shared_budgets(id) ON DELETE CASCADE,
    
    -- Activity details
    activity_type TEXT NOT NULL, -- 'created', 'updated', 'category_added', 'category_updated', 'overspent', 'alert_triggered'
    description TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    
    -- User who performed the action
    performed_by UUID REFERENCES auth.users(id),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- =============================================
-- INDEXES
-- =============================================

-- Performance indexes
CREATE INDEX idx_shared_budgets_wallet_id ON shared_budgets(shared_wallet_id);
CREATE INDEX idx_shared_budgets_period ON shared_budgets(start_date, end_date);
CREATE INDEX idx_shared_budgets_active ON shared_budgets(is_active) WHERE is_active = true;

CREATE INDEX idx_shared_budget_categories_budget_id ON shared_budget_categories(shared_budget_id);
CREATE INDEX idx_shared_budget_categories_category_id ON shared_budget_categories(category_id);
CREATE INDEX idx_shared_budget_categories_active ON shared_budget_categories(is_active) WHERE is_active = true;

CREATE INDEX idx_shared_budget_activities_budget_id ON shared_budget_activities(shared_budget_id);
CREATE INDEX idx_shared_budget_activities_date ON shared_budget_activities(created_at);
CREATE INDEX idx_shared_budget_activities_type ON shared_budget_activities(activity_type);

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger to update updated_at on shared_budgets
CREATE OR REPLACE FUNCTION update_shared_budgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shared_budgets_updated_at
    BEFORE UPDATE ON shared_budgets
    FOR EACH ROW
    EXECUTE FUNCTION update_shared_budgets_updated_at();

-- Trigger to update updated_at on shared_budget_categories
CREATE OR REPLACE FUNCTION update_shared_budget_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shared_budget_categories_updated_at
    BEFORE UPDATE ON shared_budget_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_shared_budget_categories_updated_at();

-- Trigger to update total_allocated when category allocations change
CREATE OR REPLACE FUNCTION update_shared_budget_total_allocated()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the total_allocated for the budget
    UPDATE shared_budgets 
    SET total_allocated = (
        SELECT COALESCE(SUM(allocated_amount), 0)
        FROM shared_budget_categories 
        WHERE shared_budget_id = COALESCE(NEW.shared_budget_id, OLD.shared_budget_id)
        AND is_active = true
    )
    WHERE id = COALESCE(NEW.shared_budget_id, OLD.shared_budget_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_budget_total_allocated_on_insert
    AFTER INSERT ON shared_budget_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_shared_budget_total_allocated();

CREATE TRIGGER update_budget_total_allocated_on_update
    AFTER UPDATE ON shared_budget_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_shared_budget_total_allocated();

CREATE TRIGGER update_budget_total_allocated_on_delete
    AFTER DELETE ON shared_budget_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_shared_budget_total_allocated();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE shared_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_budget_activities ENABLE ROW LEVEL SECURITY;

-- Shared budgets policies
CREATE POLICY "Users can view shared budgets if they're wallet members" ON shared_budgets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM shared_wallet_members swm
            WHERE swm.shared_wallet_id = shared_budgets.shared_wallet_id
            AND swm.user_id = auth.uid()
            AND swm.is_active = true
        )
    );

CREATE POLICY "Users can create shared budgets if they can manage budget" ON shared_budgets
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM shared_wallet_members swm
            WHERE swm.shared_wallet_id = shared_budgets.shared_wallet_id
            AND swm.user_id = auth.uid()
            AND swm.can_manage_budget = true
            AND swm.is_active = true
        )
    );

CREATE POLICY "Users can update shared budgets if they can manage budget" ON shared_budgets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM shared_wallet_members swm
            WHERE swm.shared_wallet_id = shared_budgets.shared_wallet_id
            AND swm.user_id = auth.uid()
            AND swm.can_manage_budget = true
            AND swm.is_active = true
        )
    );

CREATE POLICY "Users can delete shared budgets if they can manage budget" ON shared_budgets
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM shared_wallet_members swm
            WHERE swm.shared_wallet_id = shared_budgets.shared_wallet_id
            AND swm.user_id = auth.uid()
            AND swm.can_manage_budget = true
            AND swm.is_active = true
        )
    );

-- Shared budget categories policies
CREATE POLICY "Users can view budget categories if they can view budget" ON shared_budget_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM shared_budgets sb
            JOIN shared_wallet_members swm ON swm.shared_wallet_id = sb.shared_wallet_id
            WHERE sb.id = shared_budget_categories.shared_budget_id
            AND swm.user_id = auth.uid()
            AND swm.is_active = true
        )
    );

CREATE POLICY "Users can manage budget categories if they can manage budget" ON shared_budget_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM shared_budgets sb
            JOIN shared_wallet_members swm ON swm.shared_wallet_id = sb.shared_wallet_id
            WHERE sb.id = shared_budget_categories.shared_budget_id
            AND swm.user_id = auth.uid()
            AND swm.can_manage_budget = true
            AND swm.is_active = true
        )
    );

-- Shared budget activities policies
CREATE POLICY "Users can view budget activities if they can view budget" ON shared_budget_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM shared_budgets sb
            JOIN shared_wallet_members swm ON swm.shared_wallet_id = sb.shared_wallet_id
            WHERE sb.id = shared_budget_activities.shared_budget_id
            AND swm.user_id = auth.uid()
            AND swm.is_active = true
        )
    );

-- Only system can insert activities (via triggers/functions)
CREATE POLICY "System can insert budget activities" ON shared_budget_activities
    FOR INSERT WITH CHECK (true);

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Function to get budget summary for a shared wallet
CREATE OR REPLACE FUNCTION get_shared_wallet_budget_summary(wallet_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    user_has_access BOOLEAN;
BEGIN
    -- Check if user has access to this wallet
    SELECT EXISTS (
        SELECT 1 FROM shared_wallet_members swm
        WHERE swm.shared_wallet_id = wallet_id
        AND swm.user_id = auth.uid()
        AND swm.is_active = true
    ) INTO user_has_access;
    
    IF NOT user_has_access THEN
        RAISE EXCEPTION 'Access denied to wallet %', wallet_id;
    END IF;
    
    -- Get budget summary
    SELECT jsonb_build_object(
        'total_budgets', COUNT(*),
        'active_budgets', COUNT(*) FILTER (WHERE is_active = true),
        'total_budget_amount', COALESCE(SUM(total_budget) FILTER (WHERE is_active = true), 0),
        'total_spent_amount', COALESCE(SUM(total_spent) FILTER (WHERE is_active = true), 0),
        'total_allocated_amount', COALESCE(SUM(total_allocated) FILTER (WHERE is_active = true), 0),
        'budgets_over_threshold', COUNT(*) FILTER (
            WHERE is_active = true 
            AND total_budget > 0 
            AND (total_spent / total_budget * 100) > alert_threshold_percentage
        )
    )
    FROM shared_budgets
    WHERE shared_wallet_id = wallet_id
    INTO result;
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Function to update budget spending based on transactions
CREATE OR REPLACE FUNCTION update_shared_budget_spending()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    budget_record RECORD;
BEGIN
    -- Only process expense transactions
    IF COALESCE(NEW.transaction_type, OLD.transaction_type) != 'expense' THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Find active budgets for this wallet that cover the transaction date
    FOR budget_record IN 
        SELECT sb.id as budget_id, sb.shared_wallet_id
        FROM shared_budgets sb
        WHERE sb.shared_wallet_id = COALESCE(NEW.shared_wallet_id, OLD.shared_wallet_id)
        AND sb.is_active = true
        AND COALESCE(NEW.transaction_date, OLD.transaction_date) BETWEEN sb.start_date AND sb.end_date
    LOOP
        -- Recalculate total spent for this budget
        UPDATE shared_budgets 
        SET total_spent = (
            SELECT COALESCE(SUM(swt.amount), 0)
            FROM shared_wallet_transactions swt
            WHERE swt.shared_wallet_id = budget_record.shared_wallet_id
            AND swt.transaction_type = 'expense'
            AND swt.is_approved = true
            AND swt.transaction_date BETWEEN 
                (SELECT start_date FROM shared_budgets WHERE id = budget_record.budget_id) AND
                (SELECT end_date FROM shared_budgets WHERE id = budget_record.budget_id)
        )
        WHERE id = budget_record.budget_id;
        
        -- Update category spending
        UPDATE shared_budget_categories sbc
        SET spent_amount = (
            SELECT COALESCE(SUM(swt.amount), 0)
            FROM shared_wallet_transactions swt
            WHERE swt.shared_wallet_id = budget_record.shared_wallet_id
            AND swt.expense_category_id = sbc.category_id
            AND swt.transaction_type = 'expense'
            AND swt.is_approved = true
            AND swt.transaction_date BETWEEN 
                (SELECT start_date FROM shared_budgets WHERE id = budget_record.budget_id) AND
                (SELECT end_date FROM shared_budgets WHERE id = budget_record.budget_id)
        )
        WHERE shared_budget_id = budget_record.budget_id;
    END LOOP;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply trigger to update budget spending on transaction changes
CREATE TRIGGER update_shared_budget_spending_on_transaction
    AFTER INSERT OR UPDATE OR DELETE ON shared_wallet_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_shared_budget_spending();

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant appropriate permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON shared_budgets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON shared_budget_categories TO authenticated;
GRANT SELECT ON shared_budget_activities TO authenticated;
GRANT INSERT ON shared_budget_activities TO service_role;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_shared_wallet_budget_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_shared_budget_spending() TO authenticated;