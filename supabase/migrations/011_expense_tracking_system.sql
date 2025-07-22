-- FinHome Expense Tracking System Migration
-- Adds comprehensive daily expense tracking functionality
-- Part of strategic funnel to convert users to real estate planning

-- =============================================
-- EXPENSE TRACKING TYPES
-- =============================================

-- Expense and transaction types
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');
CREATE TYPE expense_category_type AS ENUM (
    'food_dining', 'transportation', 'shopping', 'bills_utilities', 
    'entertainment', 'healthcare', 'education', 'travel', 
    'gifts_charity', 'personal_care', 'other'
);
CREATE TYPE income_category_type AS ENUM (
    'salary', 'bonus', 'freelance', 'investment', 'rental', 
    'business', 'gift', 'refund', 'other'
);
CREATE TYPE wallet_type AS ENUM ('cash', 'bank_account', 'credit_card', 'e_wallet', 'investment', 'other');
CREATE TYPE goal_type AS ENUM ('general_savings', 'emergency_fund', 'vacation', 'education', 'buy_house', 'buy_car', 'other');
CREATE TYPE goal_status AS ENUM ('active', 'paused', 'completed', 'cancelled');
CREATE TYPE recurring_frequency AS ENUM ('daily', 'weekly', 'monthly', 'yearly');

-- =============================================
-- CORE EXPENSE TABLES
-- =============================================

-- Expense categories with Vietnamese localization
CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Category identification
    category_key expense_category_type NOT NULL UNIQUE,
    name_en TEXT NOT NULL,
    name_vi TEXT NOT NULL,
    description_en TEXT,
    description_vi TEXT,
    
    -- Visual representation
    icon TEXT NOT NULL DEFAULT 'circle',
    color TEXT NOT NULL DEFAULT '#3B82F6',
    
    -- Hierarchy
    parent_category_id UUID REFERENCES expense_categories(id),
    
    -- Configuration
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Income categories with Vietnamese localization
CREATE TABLE income_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Category identification
    category_key income_category_type NOT NULL UNIQUE,
    name_en TEXT NOT NULL,
    name_vi TEXT NOT NULL,
    description_en TEXT,
    description_vi TEXT,
    
    -- Visual representation
    icon TEXT NOT NULL DEFAULT 'circle',
    color TEXT NOT NULL DEFAULT '#10B981',
    
    -- Configuration
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User wallets and accounts
CREATE TABLE expense_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Wallet details
    name TEXT NOT NULL,
    wallet_type wallet_type NOT NULL DEFAULT 'cash',
    description TEXT,
    
    -- Balance and currency
    balance DECIMAL(15,2) DEFAULT 0,
    currency TEXT DEFAULT 'VND',
    
    -- Visual representation
    icon TEXT DEFAULT 'wallet',
    color TEXT DEFAULT '#3B82F6',
    
    -- Bank integration
    bank_id UUID REFERENCES banks(id),
    bank_account_number TEXT,
    is_bank_synced BOOLEAN DEFAULT false,
    last_sync_at TIMESTAMPTZ,
    
    -- Configuration
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    include_in_budget BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, name),
    CONSTRAINT positive_balance CHECK (balance >= 0)
);

-- Main expense transactions
CREATE TABLE expense_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES expense_wallets(id) ON DELETE CASCADE,
    
    -- Transaction basic info
    transaction_type transaction_type NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency TEXT DEFAULT 'VND',
    description TEXT,
    notes TEXT,
    
    -- Categorization
    expense_category_id UUID REFERENCES expense_categories(id),
    income_category_id UUID REFERENCES income_categories(id),
    custom_category TEXT,
    tags TEXT[] DEFAULT '{}',
    
    -- Transfer specific
    transfer_to_wallet_id UUID REFERENCES expense_wallets(id),
    transfer_fee DECIMAL(15,2) DEFAULT 0,
    
    -- Date and time
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    transaction_time TIME DEFAULT CURRENT_TIME,
    
    -- Attachments and evidence
    receipt_images JSONB DEFAULT '[]',
    location JSONB,
    merchant_name TEXT,
    
    -- Recurring transaction reference
    recurring_transaction_id UUID,
    
    -- Status and metadata
    is_confirmed BOOLEAN DEFAULT true,
    is_hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_transaction_amount CHECK (amount > 0),
    CONSTRAINT valid_category_assignment CHECK (
        (transaction_type = 'expense' AND expense_category_id IS NOT NULL) OR
        (transaction_type = 'income' AND income_category_id IS NOT NULL) OR
        (transaction_type = 'transfer' AND transfer_to_wallet_id IS NOT NULL)
    ),
    CONSTRAINT valid_transfer_wallets CHECK (
        transaction_type != 'transfer' OR wallet_id != transfer_to_wallet_id
    )
);

-- Recurring transactions template
CREATE TABLE recurring_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES expense_wallets(id) ON DELETE CASCADE,
    
    -- Template details
    name TEXT NOT NULL,
    transaction_type transaction_type NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    
    -- Categorization
    expense_category_id UUID REFERENCES expense_categories(id),
    income_category_id UUID REFERENCES income_categories(id),
    
    -- Recurrence pattern
    frequency recurring_frequency NOT NULL,
    frequency_interval INTEGER DEFAULT 1, -- every N days/weeks/months
    start_date DATE NOT NULL,
    end_date DATE,
    max_occurrences INTEGER,
    
    -- Transfer specific
    transfer_to_wallet_id UUID REFERENCES expense_wallets(id),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    next_due_date DATE,
    occurrences_created INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_recurring_amount CHECK (amount > 0)
);

-- =============================================
-- BUDGETING SYSTEM
-- =============================================

-- User budgets
CREATE TABLE expense_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Budget identification
    name TEXT NOT NULL,
    description TEXT,
    
    -- Budget period
    budget_period TEXT NOT NULL DEFAULT 'monthly' CHECK (budget_period IN ('weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Budget amounts
    total_budget DECIMAL(15,2) NOT NULL,
    total_spent DECIMAL(15,2) DEFAULT 0,
    remaining_amount DECIMAL(15,2) GENERATED ALWAYS AS (total_budget - total_spent) STORED,
    
    -- Category allocations
    category_budgets JSONB DEFAULT '{}',
    
    -- Alerts and notifications
    alert_threshold_percentage DECIMAL(5,2) DEFAULT 80,
    alert_sent_at TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT positive_budget CHECK (total_budget > 0),
    CONSTRAINT valid_dates CHECK (end_date > start_date),
    CONSTRAINT valid_threshold CHECK (alert_threshold_percentage BETWEEN 0 AND 100)
);

-- Budget category allocations (for detailed tracking)
CREATE TABLE budget_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID NOT NULL REFERENCES expense_budgets(id) ON DELETE CASCADE,
    category_id UUID REFERENCES expense_categories(id),
    
    -- Allocation details
    allocated_amount DECIMAL(15,2) NOT NULL,
    spent_amount DECIMAL(15,2) DEFAULT 0,
    remaining_amount DECIMAL(15,2) GENERATED ALWAYS AS (allocated_amount - spent_amount) STORED,
    
    -- Alerts
    alert_threshold_percentage DECIMAL(5,2) DEFAULT 80,
    alert_sent_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT positive_allocation CHECK (allocated_amount > 0),
    UNIQUE(budget_id, category_id)
);

-- =============================================
-- SAVINGS GOALS SYSTEM
-- =============================================

-- User savings goals
CREATE TABLE expense_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Goal identification
    name TEXT NOT NULL,
    description TEXT,
    goal_type goal_type NOT NULL DEFAULT 'general_savings',
    
    -- Financial targets
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0,
    monthly_target DECIMAL(15,2),
    
    -- Timeline
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_date DATE,
    deadline DATE,
    
    -- Visual representation
    icon TEXT DEFAULT 'target',
    color TEXT DEFAULT '#10B981',
    image_url TEXT,
    
    -- Progress tracking
    progress_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN target_amount > 0 THEN (current_amount / target_amount * 100) ELSE 0 END
    ) STORED,
    
    -- House purchase specific fields (strategic funnel)
    house_purchase_data JSONB, -- Property type, location, budget range
    funnel_stage TEXT, -- 'initial', 'researching', 'ready_to_view', 'qualified_lead'
    last_funnel_interaction TIMESTAMPTZ,
    
    -- Status and metadata
    status goal_status DEFAULT 'active',
    is_featured BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT positive_target CHECK (target_amount > 0),
    CONSTRAINT valid_goal_dates CHECK (target_date IS NULL OR target_date >= start_date),
    CONSTRAINT valid_progress CHECK (current_amount >= 0 AND current_amount <= target_amount * 1.1) -- Allow 10% overshoot
);

-- Goal contributions (savings transactions)
CREATE TABLE goal_contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID NOT NULL REFERENCES expense_goals(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES expense_transactions(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Contribution details
    amount DECIMAL(15,2) NOT NULL,
    contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    
    -- Source
    wallet_id UUID REFERENCES expense_wallets(id),
    is_automatic BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT positive_contribution CHECK (amount > 0)
);

-- =============================================
-- SHARED WALLETS & FAMILY FEATURES
-- =============================================

-- Shared wallet system
CREATE TABLE shared_expense_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Wallet details
    name TEXT NOT NULL,
    description TEXT,
    wallet_type wallet_type NOT NULL DEFAULT 'cash',
    
    -- Balance
    balance DECIMAL(15,2) DEFAULT 0,
    currency TEXT DEFAULT 'VND',
    
    -- Visual
    icon TEXT DEFAULT 'users',
    color TEXT DEFAULT '#8B5CF6',
    
    -- Access control
    owner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    
    -- Settings
    require_approval_for_expenses BOOLEAN DEFAULT false,
    expense_approval_threshold DECIMAL(15,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT positive_shared_balance CHECK (balance >= 0)
);

-- Shared wallet members
CREATE TABLE shared_wallet_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shared_wallet_id UUID NOT NULL REFERENCES shared_expense_wallets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Permissions
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    can_add_transactions BOOLEAN DEFAULT true,
    can_edit_transactions BOOLEAN DEFAULT false,
    can_delete_transactions BOOLEAN DEFAULT false,
    can_manage_budget BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    
    UNIQUE(shared_wallet_id, user_id)
);

-- Shared wallet transactions
CREATE TABLE shared_wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shared_wallet_id UUID NOT NULL REFERENCES shared_expense_wallets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Transaction details (similar to regular transactions)
    transaction_type transaction_type NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    notes TEXT,
    
    -- Categorization
    expense_category_id UUID REFERENCES expense_categories(id),
    income_category_id UUID REFERENCES income_categories(id),
    
    -- Date and attachments
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    receipt_images JSONB DEFAULT '[]',
    
    -- Approval system
    requires_approval BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    approved_by UUID REFERENCES user_profiles(id),
    approved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT positive_shared_amount CHECK (amount > 0)
);

-- =============================================
-- GAMIFICATION FOR EXPENSE TRACKING
-- =============================================

-- Expense-specific achievements
CREATE TABLE expense_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Achievement details
    name_en TEXT NOT NULL,
    name_vi TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_vi TEXT NOT NULL,
    
    -- Type and category
    category TEXT NOT NULL CHECK (category IN ('first_time', 'streak', 'savings', 'budgeting', 'house_purchase')),
    
    -- Requirements
    requirement_type TEXT NOT NULL, -- 'transaction_count', 'savings_amount', 'streak_days', 'budget_adherence'
    requirement_value DECIMAL(15,2) NOT NULL,
    requirement_period_days INTEGER,
    
    -- Rewards
    experience_points INTEGER DEFAULT 0,
    badge_icon TEXT NOT NULL,
    badge_color TEXT DEFAULT '#3B82F6',
    
    -- House purchase funnel achievements (strategic)
    triggers_funnel_action BOOLEAN DEFAULT false,
    funnel_action_data JSONB,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User expense achievements
CREATE TABLE user_expense_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES expense_achievements(id) ON DELETE CASCADE,
    
    -- Progress tracking
    current_progress DECIMAL(15,2) DEFAULT 0,
    required_progress DECIMAL(15,2) NOT NULL,
    progress_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN required_progress > 0 THEN (current_progress / required_progress * 100) ELSE 0 END
    ) STORED,
    
    -- Status
    is_unlocked BOOLEAN DEFAULT false,
    unlocked_at TIMESTAMPTZ,
    
    -- Tracking data
    tracking_data JSONB DEFAULT '{}',
    
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, achievement_id)
);

-- Daily challenges for engagement
CREATE TABLE expense_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Challenge details
    name_en TEXT NOT NULL,
    name_vi TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_vi TEXT NOT NULL,
    
    -- Challenge type
    challenge_type TEXT NOT NULL CHECK (challenge_type IN ('daily', 'weekly', 'monthly', 'special')),
    category TEXT NOT NULL, -- 'budgeting', 'saving', 'tracking', 'house_goal'
    
    -- Requirements
    requirement_description JSONB NOT NULL,
    target_value DECIMAL(15,2),
    duration_days INTEGER NOT NULL,
    
    -- Rewards
    experience_points INTEGER DEFAULT 0,
    completion_badge TEXT,
    
    -- Availability
    is_active BOOLEAN DEFAULT true,
    start_date DATE,
    end_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User challenge participation
CREATE TABLE user_expense_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES expense_challenges(id) ON DELETE CASCADE,
    
    -- Participation tracking
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    current_progress DECIMAL(15,2) DEFAULT 0,
    target_progress DECIMAL(15,2) NOT NULL,
    
    -- Status
    is_completed BOOLEAN DEFAULT false,
    is_abandoned BOOLEAN DEFAULT false,
    
    -- Progress data
    progress_data JSONB DEFAULT '{}',
    
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, challenge_id)
);

-- =============================================
-- ANALYTICS AND REPORTING
-- =============================================

-- Pre-calculated spending analytics
CREATE TABLE expense_analytics_monthly (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Time period
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    
    -- Total amounts
    total_income DECIMAL(15,2) DEFAULT 0,
    total_expenses DECIMAL(15,2) DEFAULT 0,
    net_income DECIMAL(15,2) GENERATED ALWAYS AS (total_income - total_expenses) STORED,
    
    -- Category breakdowns
    category_expenses JSONB DEFAULT '{}',
    category_income JSONB DEFAULT '{}',
    
    -- Goal progress
    total_saved_toward_goals DECIMAL(15,2) DEFAULT 0,
    house_goal_progress DECIMAL(15,2) DEFAULT 0,
    
    -- Budget performance
    budget_adherence_score DECIMAL(5,2), -- percentage of budget categories met
    over_budget_amount DECIMAL(15,2) DEFAULT 0,
    
    -- Insights
    top_expense_category TEXT,
    unusual_spending_detected BOOLEAN DEFAULT false,
    savings_rate DECIMAL(5,2), -- percentage of income saved
    
    -- Metadata
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    transaction_count INTEGER DEFAULT 0,
    
    UNIQUE(user_id, year, month)
);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update wallet balance
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
DECLARE
    wallet_balance_change DECIMAL(15,2);
    transfer_wallet_change DECIMAL(15,2);
BEGIN
    -- Calculate balance change based on transaction type
    IF NEW.transaction_type = 'expense' THEN
        wallet_balance_change := -NEW.amount;
    ELSIF NEW.transaction_type = 'income' THEN
        wallet_balance_change := NEW.amount;
    ELSIF NEW.transaction_type = 'transfer' THEN
        wallet_balance_change := -NEW.amount - COALESCE(NEW.transfer_fee, 0);
        transfer_wallet_change := NEW.amount;
    END IF;
    
    -- Update source wallet
    UPDATE expense_wallets 
    SET balance = balance + wallet_balance_change,
        updated_at = NOW()
    WHERE id = NEW.wallet_id;
    
    -- Update destination wallet for transfers
    IF NEW.transaction_type = 'transfer' AND NEW.transfer_to_wallet_id IS NOT NULL THEN
        UPDATE expense_wallets 
        SET balance = balance + transfer_wallet_change,
            updated_at = NOW()
        WHERE id = NEW.transfer_to_wallet_id;
    END IF;
    
    -- Update budget spent amounts if expense
    IF NEW.transaction_type = 'expense' AND NEW.expense_category_id IS NOT NULL THEN
        -- Update total budget
        UPDATE expense_budgets 
        SET total_spent = total_spent + NEW.amount,
            updated_at = NOW()
        WHERE user_id = NEW.user_id 
          AND is_active = true
          AND start_date <= NEW.transaction_date 
          AND end_date >= NEW.transaction_date;
        
        -- Update category budget
        UPDATE budget_categories 
        SET spent_amount = spent_amount + NEW.amount,
            updated_at = NOW()
        WHERE budget_id IN (
            SELECT id FROM expense_budgets 
            WHERE user_id = NEW.user_id 
              AND is_active = true
              AND start_date <= NEW.transaction_date 
              AND end_date >= NEW.transaction_date
        )
        AND category_id = NEW.expense_category_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update goal progress
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE expense_goals
    SET current_amount = current_amount + NEW.amount,
        updated_at = NOW(),
        completed_at = CASE 
            WHEN current_amount + NEW.amount >= target_amount THEN NOW()
            ELSE completed_at
        END,
        status = CASE 
            WHEN current_amount + NEW.amount >= target_amount THEN 'completed'::goal_status
            ELSE status
        END
    WHERE id = NEW.goal_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check and trigger house purchase funnel
CREATE OR REPLACE FUNCTION check_house_purchase_funnel()
RETURNS TRIGGER AS $$
DECLARE
    goal_progress DECIMAL(5,2);
    should_trigger_funnel BOOLEAN := false;
BEGIN
    -- Check if this is a house purchase goal with significant progress
    IF NEW.goal_type = 'buy_house' AND NEW.status = 'active' THEN
        goal_progress := (NEW.current_amount / NEW.target_amount * 100);
        
        -- Trigger funnel at different milestones
        IF goal_progress >= 25 AND (OLD.house_purchase_data->>'funnel_stage' IS NULL OR 
                                   OLD.house_purchase_data->>'funnel_stage' = 'initial') THEN
            NEW.house_purchase_data := jsonb_set(
                COALESCE(NEW.house_purchase_data, '{}'),
                '{funnel_stage}',
                '"researching"'
            );
            should_trigger_funnel := true;
        ELSIF goal_progress >= 50 AND OLD.house_purchase_data->>'funnel_stage' = 'researching' THEN
            NEW.house_purchase_data := jsonb_set(
                NEW.house_purchase_data,
                '{funnel_stage}',
                '"ready_to_view"'
            );
            should_trigger_funnel := true;
        ELSIF goal_progress >= 80 AND OLD.house_purchase_data->>'funnel_stage' = 'ready_to_view' THEN
            NEW.house_purchase_data := jsonb_set(
                NEW.house_purchase_data,
                '{funnel_stage}',
                '"qualified_lead"'
            );
            should_trigger_funnel := true;
        END IF;
        
        -- Update last interaction timestamp
        IF should_trigger_funnel THEN
            NEW.last_funnel_interaction := NOW();
            
            -- Insert notification for funnel progression
            INSERT INTO notifications (user_id, type, title, message, action_url, metadata)
            VALUES (
                NEW.user_id,
                'achievement',
                'House Purchase Goal Milestone!',
                format('Congratulations! You''ve saved %s%% toward your house purchase goal. Ready to explore properties?', 
                       ROUND(goal_progress)),
                '/dashboard/plans/new?goal_id=' || NEW.id,
                jsonb_build_object('goal_id', NEW.id, 'progress', goal_progress, 'funnel_trigger', true)
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS
-- =============================================

-- Wallet balance update trigger
CREATE TRIGGER expense_transaction_balance_update
    AFTER INSERT ON expense_transactions
    FOR EACH ROW EXECUTE FUNCTION update_wallet_balance();

-- Goal progress update trigger
CREATE TRIGGER goal_contribution_progress_update
    AFTER INSERT ON goal_contributions
    FOR EACH ROW EXECUTE FUNCTION update_goal_progress();

-- House purchase funnel trigger
CREATE TRIGGER house_purchase_funnel_check
    BEFORE UPDATE ON expense_goals
    FOR EACH ROW EXECUTE FUNCTION check_house_purchase_funnel();

-- Updated_at triggers for new tables
CREATE TRIGGER update_expense_categories_updated_at
    BEFORE UPDATE ON expense_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_wallets_updated_at
    BEFORE UPDATE ON expense_wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_transactions_updated_at
    BEFORE UPDATE ON expense_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_budgets_updated_at
    BEFORE UPDATE ON expense_budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_goals_updated_at
    BEFORE UPDATE ON expense_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Transaction indexes
CREATE INDEX idx_expense_transactions_user_date ON expense_transactions(user_id, transaction_date DESC);
CREATE INDEX idx_expense_transactions_wallet ON expense_transactions(wallet_id, transaction_date DESC);
CREATE INDEX idx_expense_transactions_category ON expense_transactions(expense_category_id, transaction_date DESC);
CREATE INDEX idx_expense_transactions_type_date ON expense_transactions(transaction_type, transaction_date DESC);
CREATE INDEX idx_expense_transactions_recurring ON expense_transactions(recurring_transaction_id) WHERE recurring_transaction_id IS NOT NULL;

-- Budget indexes
CREATE INDEX idx_expense_budgets_user_active ON expense_budgets(user_id, is_active, start_date, end_date);
CREATE INDEX idx_budget_categories_budget ON budget_categories(budget_id, category_id);

-- Goal indexes
CREATE INDEX idx_expense_goals_user_status ON expense_goals(user_id, status, created_at DESC);
CREATE INDEX idx_expense_goals_type_status ON expense_goals(goal_type, status);
CREATE INDEX idx_expense_goals_funnel ON expense_goals(goal_type, funnel_stage) WHERE goal_type = 'buy_house';
CREATE INDEX idx_goal_contributions_goal ON goal_contributions(goal_id, contribution_date DESC);

-- Wallet indexes
CREATE INDEX idx_expense_wallets_user_active ON expense_wallets(user_id, is_active);
CREATE INDEX idx_shared_wallet_members_user ON shared_wallet_members(user_id, is_active);

-- Analytics indexes
CREATE INDEX idx_expense_analytics_user_period ON expense_analytics_monthly(user_id, year DESC, month DESC);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all new tables
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_expense_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_wallet_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_expense_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_expense_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_analytics_monthly ENABLE ROW LEVEL SECURITY;

-- Category policies (public read access)
CREATE POLICY "Anyone can view expense categories" ON expense_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view income categories" ON income_categories
    FOR SELECT USING (is_active = true);

-- Wallet policies
CREATE POLICY "Users can manage own wallets" ON expense_wallets
    FOR ALL USING (auth.uid() = user_id);

-- Transaction policies  
CREATE POLICY "Users can manage own transactions" ON expense_transactions
    FOR ALL USING (auth.uid() = user_id);

-- Budget policies
CREATE POLICY "Users can manage own budgets" ON expense_budgets
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access budget categories for own budgets" ON budget_categories
    FOR ALL USING (
        budget_id IN (
            SELECT id FROM expense_budgets WHERE user_id = auth.uid()
        )
    );

-- Goal policies
CREATE POLICY "Users can manage own goals" ON expense_goals
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own goal contributions" ON goal_contributions
    FOR ALL USING (auth.uid() = user_id);

-- Shared wallet policies
CREATE POLICY "Users can view shared wallets they're members of" ON shared_expense_wallets
    FOR SELECT USING (
        auth.uid() = owner_id OR 
        auth.uid() IN (
            SELECT user_id FROM shared_wallet_members 
            WHERE shared_wallet_id = id AND is_active = true
        )
    );

CREATE POLICY "Users can view shared wallet memberships" ON shared_wallet_members
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT owner_id FROM shared_expense_wallets 
            WHERE id = shared_wallet_id
        )
    );

-- Achievement policies
CREATE POLICY "Users can view expense achievements" ON expense_achievements
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view own achievement progress" ON user_expense_achievements
    FOR SELECT USING (auth.uid() = user_id);

-- Challenge policies
CREATE POLICY "Users can view active challenges" ON expense_challenges
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage own challenge participation" ON user_expense_challenges
    FOR ALL USING (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Users can view own analytics" ON expense_analytics_monthly
    FOR SELECT USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can manage categories" ON expense_categories
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage income categories" ON income_categories
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage achievements" ON expense_achievements
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage challenges" ON expense_challenges
    FOR ALL USING (is_admin(auth.uid()));

-- =============================================
-- INITIAL DATA SEEDING
-- =============================================

-- Seed default expense categories
INSERT INTO expense_categories (category_key, name_en, name_vi, description_en, description_vi, icon, color, sort_order) VALUES
('food_dining', 'Food & Dining', 'Ăn uống', 'Meals, groceries, restaurants', 'Bữa ăn, tạp hóa, nhà hàng', 'utensils', '#F59E0B', 1),
('transportation', 'Transportation', 'Đi lại', 'Gas, public transport, taxi', 'Xăng, xe buýt, taxi', 'car', '#3B82F6', 2),
('shopping', 'Shopping', 'Mua sắm', 'Clothing, electronics, personal items', 'Quần áo, điện tử, đồ dùng cá nhân', 'shopping-bag', '#8B5CF6', 3),
('bills_utilities', 'Bills & Utilities', 'Hóa đơn', 'Electricity, water, phone, internet', 'Điện, nước, điện thoại, internet', 'file-text', '#EF4444', 4),
('entertainment', 'Entertainment', 'Giải trí', 'Movies, games, hobbies', 'Phim ảnh, trò chơi, sở thích', 'film', '#10B981', 5),
('healthcare', 'Healthcare', 'Y tế', 'Medical, pharmacy, insurance', 'Y tế, thuốc, bảo hiểm', 'heart', '#F97316', 6),
('education', 'Education', 'Giáo dục', 'Tuition, books, courses', 'Học phí, sách, khóa học', 'book-open', '#6366F1', 7),
('travel', 'Travel', 'Du lịch', 'Vacation, business trips', 'Kỳ nghỉ, công tác', 'plane', '#14B8A6', 8),
('gifts_charity', 'Gifts & Charity', 'Quà tặng & Từ thiện', 'Presents, donations', 'Quà tặng, quyên góp', 'gift', '#EC4899', 9),
('personal_care', 'Personal Care', 'Chăm sóc cá nhân', 'Haircut, cosmetics, gym', 'Cắt tóc, mỹ phẩm, gym', 'user', '#06B6D4', 10),
('other', 'Other', 'Khác', 'Miscellaneous expenses', 'Chi phí khác', 'more-horizontal', '#6B7280', 11);

-- Seed default income categories
INSERT INTO income_categories (category_key, name_en, name_vi, description_en, description_vi, icon, color, sort_order) VALUES
('salary', 'Salary', 'Lương', 'Regular employment income', 'Thu nhập từ công việc chính', 'briefcase', '#10B981', 1),
('bonus', 'Bonus', 'Thưởng', 'Performance bonuses, 13th month', 'Thưởng hiệu suất, tháng 13', 'award', '#F59E0B', 2),
('freelance', 'Freelance', 'Freelance', 'Contract work, consulting', 'Công việc tự do, tư vấn', 'users', '#8B5CF6', 3),
('investment', 'Investment', 'Đầu tư', 'Stocks, bonds, crypto returns', 'Cổ phiếu, trái phiếu, crypto', 'trending-up', '#3B82F6', 4),
('rental', 'Rental Income', 'Thu nhập thuê', 'Property rental income', 'Thu nhập từ cho thuê nhà', 'home', '#EF4444', 5),
('business', 'Business', 'Kinh doanh', 'Business profits, sales', 'Lợi nhuận kinh doanh', 'briefcase', '#F97316', 6),
('gift', 'Gift', 'Quà tặng', 'Money gifts, lucky money', 'Tiền quà, lì xì', 'gift', '#EC4899', 7),
('refund', 'Refund', 'Hoàn tiền', 'Returns, cashback', 'Trả hàng, hoàn tiền', 'rotate-ccw', '#06B6D4', 8),
('other', 'Other Income', 'Thu nhập khác', 'Other income sources', 'Nguồn thu khác', 'plus', '#6B7280', 9);

-- Seed default expense achievements focused on house purchase funnel
INSERT INTO expense_achievements (name_en, name_vi, description_en, description_vi, category, requirement_type, requirement_value, experience_points, badge_icon, badge_color) VALUES
('First Transaction', 'Giao dịch đầu tiên', 'Record your first expense', 'Ghi lại chi tiêu đầu tiên', 'first_time', 'transaction_count', 1, 50, 'play', '#10B981'),
('Week Warrior', 'Chiến binh tuần', 'Track expenses for 7 consecutive days', 'Theo dõi chi tiêu trong 7 ngày liên tiếp', 'streak', 'streak_days', 7, 100, 'calendar', '#3B82F6'),
('Monthly Master', 'Bậc thầy tháng', 'Track expenses for 30 consecutive days', 'Theo dõi chi tiêu trong 30 ngày liên tiếp', 'streak', 'streak_days', 30, 300, 'calendar-check', '#8B5CF6'),
('First Million Saved', 'Triệu đầu tiên', 'Save your first 1,000,000 VND', 'Tiết kiệm được 1.000.000 VND đầu tiên', 'savings', 'savings_amount', 1000000, 200, 'piggy-bank', '#F59E0B'),
('House Fund Started', 'Bắt đầu quỹ mua nhà', 'Create your first house purchase goal', 'Tạo mục tiêu mua nhà đầu tiên', 'house_purchase', 'goal_count', 1, 150, 'home', '#EF4444'),
('Foundation Builder', 'Người xây móng', 'Save 50 million VND toward house purchase', 'Tiết kiệm 50 triệu VND cho mục tiêu mua nhà', 'house_purchase', 'savings_amount', 50000000, 500, 'hammer', '#F97316'),
('Dream Home Saver', 'Người tiết kiệm mua nhà', 'Save 200 million VND toward house purchase', 'Tiết kiệm 200 triệu VND cho mục tiêu mua nhà', 'house_purchase', 'savings_amount', 200000000, 1000, 'castle', '#EC4899');

-- Update some achievements to trigger funnel actions
UPDATE expense_achievements 
SET triggers_funnel_action = true,
    funnel_action_data = jsonb_build_object(
        'action', 'show_property_suggestions',
        'message', 'You''re making great progress! Ready to explore properties in your budget?'
    )
WHERE name_en IN ('Foundation Builder', 'Dream Home Saver');

COMMENT ON TABLE expense_transactions IS 'Daily expense and income transactions for personal finance tracking';
COMMENT ON TABLE expense_goals IS 'User savings goals with special focus on house purchase funnel';
COMMENT ON TABLE expense_budgets IS 'Monthly/yearly budgets with category-level tracking';
COMMENT ON TABLE shared_expense_wallets IS 'Shared wallets for family/couple expense management';