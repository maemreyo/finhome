-- FinHome Database Schema
-- Comprehensive database setup for Vietnamese real estate financial platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_subscription_tier AS ENUM ('free', 'premium', 'professional');
CREATE TYPE property_type AS ENUM ('apartment', 'house', 'villa', 'townhouse', 'land', 'commercial');
CREATE TYPE property_status AS ENUM ('for_sale', 'sold', 'for_rent', 'rented', 'off_market');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error', 'achievement');
CREATE TYPE achievement_type AS ENUM ('milestone', 'usage', 'financial', 'social', 'learning');
CREATE TYPE plan_status AS ENUM ('draft', 'active', 'completed', 'archived');

-- =============================================
-- USER MANAGEMENT TABLES
-- =============================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    date_of_birth DATE,
    occupation TEXT,
    monthly_income DECIMAL(15,2),
    
    -- Location data
    city TEXT,
    district TEXT,
    address TEXT,
    
    -- Preferences
    currency TEXT DEFAULT 'VND',
    language TEXT DEFAULT 'vi',
    timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
    
    -- Subscription
    subscription_tier user_subscription_tier DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~* '^(\+84|84|0)[0-9]{9,10}$')
);

-- User preferences and settings
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    achievement_notifications BOOLEAN DEFAULT true,
    market_update_notifications BOOLEAN DEFAULT true,
    payment_reminder_notifications BOOLEAN DEFAULT true,
    
    -- Display preferences
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    dashboard_layout TEXT DEFAULT 'grid' CHECK (dashboard_layout IN ('grid', 'list')),
    dashboard_widgets JSONB DEFAULT '[]',
    
    -- Privacy settings
    profile_visibility TEXT DEFAULT 'private' CHECK (profile_visibility IN ('public', 'private', 'friends')),
    allow_data_sharing BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- =============================================
-- PROPERTY & REAL ESTATE TABLES
-- =============================================

-- Properties database
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic information
    title TEXT NOT NULL,
    description TEXT,
    property_type property_type NOT NULL,
    status property_status DEFAULT 'for_sale',
    
    -- Location data (Vietnamese specific)
    province TEXT NOT NULL,
    district TEXT NOT NULL,
    ward TEXT,
    street_address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Property details
    total_area DECIMAL(10, 2), -- in square meters
    usable_area DECIMAL(10, 2),
    bedrooms INTEGER,
    bathrooms INTEGER,
    floors INTEGER,
    year_built INTEGER,
    
    -- Financial data
    list_price DECIMAL(15, 2) NOT NULL,
    price_per_sqm DECIMAL(10, 2),
    
    -- Legal and ownership
    legal_status TEXT, -- 'red_book', 'pink_book', 'sales_contract', etc.
    ownership_type TEXT, -- 'individual', 'shared', 'company'
    
    -- Media and features
    images JSONB DEFAULT '[]',
    features JSONB DEFAULT '[]',
    amenities JSONB DEFAULT '[]',
    
    -- SEO and search
    slug TEXT UNIQUE,
    tags TEXT[],
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    
    -- Data source tracking
    source_url TEXT,
    source_platform TEXT,
    external_id TEXT,
    
    CONSTRAINT valid_price CHECK (list_price > 0),
    CONSTRAINT valid_coordinates CHECK (
        (latitude IS NULL AND longitude IS NULL) OR 
        (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
    )
);

-- User property favorites
CREATE TABLE property_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, property_id)
);

-- User property investments (owned properties)
CREATE TABLE user_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    
    -- Investment details
    property_name TEXT NOT NULL,
    property_type property_type NOT NULL,
    location TEXT NOT NULL,
    
    -- Financial data
    purchase_price DECIMAL(15, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    current_value DECIMAL(15, 2),
    last_valuation_date DATE,
    
    -- Rental information
    monthly_rental_income DECIMAL(10, 2) DEFAULT 0,
    monthly_expenses DECIMAL(10, 2) DEFAULT 0,
    occupancy_rate DECIMAL(5, 2) DEFAULT 100, -- percentage
    
    -- Loan information
    loan_amount DECIMAL(15, 2) DEFAULT 0,
    loan_interest_rate DECIMAL(5, 3),
    loan_term_months INTEGER,
    monthly_payment DECIMAL(10, 2) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    CONSTRAINT valid_purchase_price CHECK (purchase_price > 0),
    CONSTRAINT valid_occupancy_rate CHECK (occupancy_rate BETWEEN 0 AND 100)
);

-- =============================================
-- FINANCIAL PLANNING TABLES
-- =============================================

-- Financial plans
CREATE TABLE financial_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Plan metadata
    plan_name TEXT NOT NULL,
    description TEXT,
    status plan_status DEFAULT 'draft',
    
    -- Personal information
    target_age INTEGER,
    current_monthly_income DECIMAL(10, 2),
    current_monthly_expenses DECIMAL(10, 2),
    current_savings DECIMAL(15, 2),
    dependents INTEGER DEFAULT 0,
    
    -- Property goals
    target_property_type property_type,
    target_location TEXT,
    target_budget DECIMAL(15, 2),
    target_timeframe_months INTEGER,
    investment_purpose TEXT, -- 'primary', 'investment', 'upgrade'
    desired_features JSONB DEFAULT '[]',
    
    -- Financial strategy
    down_payment_target DECIMAL(15, 2),
    risk_tolerance TEXT CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
    investment_horizon_months INTEGER,
    expected_roi DECIMAL(5, 2),
    preferred_banks TEXT[],
    
    -- Additional goals
    emergency_fund_target DECIMAL(15, 2),
    education_fund_target DECIMAL(15, 2),
    retirement_fund_target DECIMAL(15, 2),
    other_goals JSONB DEFAULT '[]',
    
    -- Calculated fields
    feasibility_score DECIMAL(3, 2), -- 0.00 to 1.00
    recommended_adjustments JSONB DEFAULT '[]',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    CONSTRAINT valid_feasibility_score CHECK (feasibility_score IS NULL OR feasibility_score BETWEEN 0 AND 1)
);

-- Loan calculations and scenarios
CREATE TABLE loan_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    financial_plan_id UUID REFERENCES financial_plans(id) ON DELETE CASCADE,
    
    -- Calculation metadata
    calculation_name TEXT NOT NULL DEFAULT 'Loan Calculation',
    
    -- Input parameters
    property_price DECIMAL(15, 2) NOT NULL,
    down_payment_amount DECIMAL(15, 2) NOT NULL,
    loan_amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 3) NOT NULL,
    loan_term_months INTEGER NOT NULL,
    
    -- Borrower information
    monthly_income DECIMAL(10, 2),
    monthly_expenses DECIMAL(10, 2),
    
    -- Calculated results
    monthly_payment DECIMAL(10, 2) NOT NULL,
    total_interest DECIMAL(15, 2) NOT NULL,
    total_payment DECIMAL(15, 2) NOT NULL,
    loan_to_value_ratio DECIMAL(5, 2), -- percentage
    debt_to_income_ratio DECIMAL(5, 2), -- percentage
    
    -- Bank information
    bank_name TEXT,
    bank_product_name TEXT,
    
    -- Amortization schedule (stored as JSON for performance)
    amortization_schedule JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_amounts CHECK (
        property_price > 0 AND 
        down_payment_amount >= 0 AND 
        loan_amount > 0 AND
        loan_amount = property_price - down_payment_amount
    ),
    CONSTRAINT valid_interest_rate CHECK (interest_rate > 0 AND interest_rate < 50),
    CONSTRAINT valid_loan_term CHECK (loan_term_months > 0 AND loan_term_months <= 600)
);

-- =============================================
-- BANK AND MARKET DATA TABLES
-- =============================================

-- Vietnamese banks data
CREATE TABLE banks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Bank information
    bank_code TEXT NOT NULL UNIQUE,
    bank_name TEXT NOT NULL,
    bank_name_en TEXT,
    logo_url TEXT,
    website_url TEXT,
    
    -- Contact information
    hotline TEXT,
    email TEXT,
    headquarters_address TEXT,
    
    -- Service information
    loan_products JSONB DEFAULT '[]',
    special_offers JSONB DEFAULT '[]',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank interest rates
CREATE TABLE bank_interest_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_id UUID NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
    
    -- Rate information
    product_name TEXT NOT NULL,
    loan_type TEXT NOT NULL, -- 'home_loan', 'investment_loan', 'refinance'
    interest_rate DECIMAL(5, 3) NOT NULL,
    min_rate DECIMAL(5, 3),
    max_rate DECIMAL(5, 3),
    
    -- Loan conditions
    min_loan_amount DECIMAL(15, 2),
    max_loan_amount DECIMAL(15, 2),
    max_ltv_ratio DECIMAL(5, 2), -- Loan-to-Value ratio percentage
    min_term_months INTEGER,
    max_term_months INTEGER,
    
    -- Requirements
    min_income DECIMAL(10, 2),
    required_documents JSONB DEFAULT '[]',
    eligibility_criteria JSONB DEFAULT '[]',
    
    -- Fees
    processing_fee DECIMAL(10, 2),
    processing_fee_percentage DECIMAL(5, 3),
    early_payment_fee DECIMAL(5, 3),
    
    -- Validity
    effective_date DATE NOT NULL,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_interest_rate CHECK (interest_rate > 0 AND interest_rate < 50),
    CONSTRAINT valid_ltv_ratio CHECK (max_ltv_ratio IS NULL OR max_ltv_ratio BETWEEN 0 AND 100)
);

-- =============================================
-- GAMIFICATION & USER ENGAGEMENT TABLES
-- =============================================

-- User achievements system
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Achievement metadata
    name TEXT NOT NULL UNIQUE,
    name_vi TEXT NOT NULL,
    description TEXT NOT NULL,
    description_vi TEXT NOT NULL,
    achievement_type achievement_type NOT NULL,
    
    -- Requirements
    required_actions JSONB NOT NULL, -- Conditions to unlock
    required_value INTEGER, -- Threshold value if applicable
    
    -- Rewards
    experience_points INTEGER DEFAULT 0,
    badge_icon TEXT,
    badge_color TEXT DEFAULT '#3B82F6',
    
    -- Visibility
    is_active BOOLEAN DEFAULT true,
    is_hidden BOOLEAN DEFAULT false, -- Hidden until unlocked
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievement unlocks
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    progress_data JSONB, -- Additional data about how achievement was unlocked
    
    UNIQUE(user_id, achievement_id)
);

-- User experience and levels
CREATE TABLE user_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Experience tracking
    total_experience INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    experience_in_level INTEGER DEFAULT 0,
    experience_to_next_level INTEGER DEFAULT 100,
    
    -- Activity tracking
    plans_created INTEGER DEFAULT 0,
    calculations_performed INTEGER DEFAULT 0,
    properties_viewed INTEGER DEFAULT 0,
    achievements_unlocked INTEGER DEFAULT 0,
    days_active INTEGER DEFAULT 0,
    
    -- Streaks
    current_login_streak INTEGER DEFAULT 0,
    longest_login_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- =============================================
-- NOTIFICATIONS & COMMUNICATION TABLES
-- =============================================

-- User notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Notification content
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    
    -- Media
    icon TEXT,
    image_url TEXT,
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    
    -- Additional data
    metadata JSONB DEFAULT '{}'
);

-- =============================================
-- AUDIT & ANALYTICS TABLES
-- =============================================

-- User activity tracking
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Activity details
    activity_type TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    
    -- Request details
    ip_address INET,
    user_agent TEXT,
    referer TEXT,
    
    -- Additional data
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System configuration
CREATE TABLE app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Setting details
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    setting_type TEXT NOT NULL, -- 'string', 'number', 'boolean', 'json'
    
    -- Metadata
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User profiles indexes
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_subscription ON user_profiles(subscription_tier);
CREATE INDEX idx_user_profiles_city ON user_profiles(city);

-- Properties indexes
CREATE INDEX idx_properties_location ON properties(province, district);
CREATE INDEX idx_properties_type_status ON properties(property_type, status);
CREATE INDEX idx_properties_price_range ON properties(list_price);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX idx_properties_slug ON properties(slug);

-- Property search indexes
CREATE INDEX idx_properties_search_basic ON properties(property_type, province, district, status);
CREATE INDEX idx_properties_search_price ON properties(list_price, total_area);

-- Financial plans indexes
CREATE INDEX idx_financial_plans_user_status ON financial_plans(user_id, status);
CREATE INDEX idx_financial_plans_created_at ON financial_plans(created_at DESC);

-- Loan calculations indexes
CREATE INDEX idx_loan_calculations_user ON loan_calculations(user_id);
CREATE INDEX idx_loan_calculations_plan ON loan_calculations(financial_plan_id);

-- Bank rates indexes
CREATE INDEX idx_bank_rates_active ON bank_interest_rates(bank_id, is_active, effective_date);
CREATE INDEX idx_bank_rates_loan_type ON bank_interest_rates(loan_type, interest_rate);

-- Notifications indexes
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_user_recent ON notifications(user_id, created_at DESC);

-- Activities indexes
CREATE INDEX idx_user_activities_user_type ON user_activities(user_id, activity_type, created_at DESC);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at DESC);

-- Achievement indexes
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id, unlocked_at DESC);

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_properties_updated_at BEFORE UPDATE ON user_properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_plans_updated_at BEFORE UPDATE ON financial_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banks_updated_at BEFORE UPDATE ON banks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_interest_rates_updated_at BEFORE UPDATE ON bank_interest_rates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_experience_updated_at BEFORE UPDATE ON user_experience
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INITIAL DATA COMMENTS
-- =============================================

COMMENT ON DATABASE postgres IS 'FinHome - Vietnamese Real Estate Financial Platform Database';

COMMENT ON TABLE user_profiles IS 'Extended user profile information beyond Supabase auth';
COMMENT ON TABLE properties IS 'Vietnamese real estate property listings and data';
COMMENT ON TABLE financial_plans IS 'User financial planning and goal tracking';
COMMENT ON TABLE loan_calculations IS 'Loan calculation scenarios and results';
COMMENT ON TABLE banks IS 'Vietnamese bank information and details';
COMMENT ON TABLE bank_interest_rates IS 'Current interest rates from Vietnamese banks';
COMMENT ON TABLE achievements IS 'Gamification achievement definitions';
COMMENT ON TABLE user_achievements IS 'User achievement unlock tracking';
COMMENT ON TABLE notifications IS 'User notification and messaging system';
COMMENT ON TABLE user_activities IS 'User activity and analytics tracking';