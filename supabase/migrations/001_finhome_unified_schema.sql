-- FinHome Unified Database Schema
-- Comprehensive production-ready database for Vietnamese real estate financial platform
-- Consolidates all previous migrations into a single powerful schema

-- =============================================
-- EXTENSIONS AND CONFIGURATIONS
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- CUSTOM TYPES
-- =============================================

-- User and subscription types
CREATE TYPE user_subscription_tier AS ENUM ('free', 'premium', 'professional');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'trialing', 'past_due', 'canceled', 'unpaid');

-- Property and real estate types
CREATE TYPE property_type AS ENUM ('apartment', 'house', 'villa', 'townhouse', 'land', 'commercial');
CREATE TYPE property_status AS ENUM ('for_sale', 'sold', 'for_rent', 'rented', 'off_market');
CREATE TYPE legal_status_enum AS ENUM ('red_book', 'pink_book', 'pending', 'disputed');
CREATE TYPE ownership_type_enum AS ENUM ('individual', 'joint', 'company');

-- Financial planning types
CREATE TYPE plan_status AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE plan_type_enum AS ENUM ('home_purchase', 'investment', 'upgrade', 'refinance');
CREATE TYPE rate_type_enum AS ENUM ('fixed', 'variable', 'mixed');
CREATE TYPE rate_category_enum AS ENUM ('promotional', 'standard', 'vip', 'prime');

-- System and notification types
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error', 'achievement');
CREATE TYPE achievement_type AS ENUM ('milestone', 'usage', 'financial', 'social', 'learning');

-- =============================================
-- USER MANAGEMENT TABLES
-- =============================================

-- Extended user profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic information
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    date_of_birth DATE,
    
    -- Professional information
    occupation TEXT,
    company TEXT,
    monthly_income DECIMAL(15,2),
    
    -- Location data (Vietnamese specific)
    city TEXT,
    district TEXT,
    address TEXT,
    location JSONB, -- Flexible location storage
    
    -- Preferences
    currency TEXT DEFAULT 'VND',
    language TEXT DEFAULT 'vi',
    timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
    preferred_language TEXT DEFAULT 'vi',
    currency_format TEXT DEFAULT 'VND',
    
    -- Subscription and billing
    subscription_tier user_subscription_tier DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,
    
    -- Financial profile
    annual_income BIGINT,
    monthly_expenses BIGINT,
    current_assets BIGINT,
    current_debts BIGINT,
    
    -- Gamification
    experience_points INTEGER DEFAULT 0,
    achievement_badges TEXT[] DEFAULT '{}',
    
    -- App usage tracking
    onboarding_completed BOOLEAN DEFAULT FALSE,
    notification_preferences JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~* '^(\+84|84|0)[0-9]{9,10}$'),
    CONSTRAINT valid_subscription_tier CHECK (subscription_tier IN ('free', 'premium', 'professional'))
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

-- Subscription management (integrates with Stripe)
CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_price_id TEXT,
    status subscription_status DEFAULT 'inactive' NOT NULL,
    plan_name TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Billing history
CREATE TABLE billing_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    stripe_invoice_id TEXT UNIQUE,
    stripe_payment_intent_id TEXT,
    amount_paid INTEGER NOT NULL, -- Amount in cents
    currency TEXT DEFAULT 'vnd' NOT NULL,
    status TEXT NOT NULL, -- paid, open, void, uncollectible
    invoice_url TEXT,
    invoice_pdf TEXT,
    billing_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- PROPERTY & REAL ESTATE TABLES
-- =============================================

-- Comprehensive properties database
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic information
    title TEXT NOT NULL,
    property_name TEXT, -- For legacy compatibility
    description TEXT,
    property_type property_type NOT NULL,
    status property_status DEFAULT 'for_sale',
    
    -- Location data (Vietnamese specific)
    province TEXT NOT NULL,
    district TEXT NOT NULL,
    city TEXT NOT NULL, -- Normalized city name
    ward TEXT,
    street_address TEXT,
    address TEXT, -- Full address
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    coordinates POINT, -- For PostGIS compatibility
    
    -- Property details
    total_area DECIMAL(10, 2), -- in square meters
    area_sqm NUMERIC(10,2), -- Alternative field name for compatibility
    usable_area DECIMAL(10, 2),
    bedrooms INTEGER,
    bathrooms INTEGER,
    floors INTEGER,
    floor_number INTEGER,
    total_floors INTEGER,
    year_built INTEGER,
    
    -- Financial data
    list_price DECIMAL(15, 2) NOT NULL,
    listed_price BIGINT, -- For compatibility with existing frontend
    price_per_sqm DECIMAL(10, 2),
    market_value_estimate BIGINT,
    
    -- Legal and ownership
    legal_status TEXT,
    ownership_type TEXT,
    
    -- Features and amenities
    images JSONB DEFAULT '[]',
    features JSONB DEFAULT '[]',
    amenities TEXT[],
    property_features JSONB, -- Additional flexible features
    
    -- Market and neighborhood data
    neighborhood_data JSONB,
    investment_metrics JSONB,
    
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

-- Property favorites
CREATE TABLE property_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, property_id)
);

-- User property investments
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
    occupancy_rate DECIMAL(5, 2) DEFAULT 100,
    
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

-- Comprehensive financial plans
CREATE TABLE financial_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Plan identification
    plan_name TEXT NOT NULL,
    description TEXT,
    plan_type plan_type_enum DEFAULT 'home_purchase',
    status plan_status DEFAULT 'draft',
    
    -- Property reference
    property_id UUID REFERENCES properties(id),
    custom_property_data JSONB,
    
    -- Personal information
    target_age INTEGER,
    current_monthly_income DECIMAL(10, 2),
    monthly_income BIGINT, -- Alternative field for compatibility
    current_monthly_expenses DECIMAL(10, 2),
    monthly_expenses BIGINT, -- Alternative field for compatibility
    current_savings DECIMAL(15, 2),
    dependents INTEGER DEFAULT 0,
    
    -- Financial inputs
    purchase_price BIGINT,
    down_payment BIGINT,
    additional_costs BIGINT DEFAULT 0,
    other_debts BIGINT DEFAULT 0,
    
    -- Property goals
    target_property_type property_type,
    target_location TEXT,
    target_budget DECIMAL(15, 2),
    target_timeframe_months INTEGER,
    investment_purpose TEXT,
    desired_features JSONB DEFAULT '[]',
    
    -- Financial strategy
    down_payment_target DECIMAL(15, 2),
    risk_tolerance TEXT CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
    investment_horizon_months INTEGER,
    expected_roi DECIMAL(5, 2),
    preferred_banks TEXT[],
    
    -- Investment specific
    expected_rental_income BIGINT,
    expected_appreciation_rate NUMERIC(5,2),
    
    -- Additional goals
    emergency_fund_target DECIMAL(15, 2),
    education_fund_target DECIMAL(15, 2),
    retirement_fund_target DECIMAL(15, 2),
    other_goals JSONB DEFAULT '[]',
    
    -- Calculated fields
    feasibility_score DECIMAL(3, 2),
    recommended_adjustments JSONB DEFAULT '[]',
    
    -- Plan status & sharing
    is_public BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    
    -- Calculation cache
    cached_calculations JSONB,
    calculations_last_updated TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    CONSTRAINT valid_feasibility_score CHECK (feasibility_score IS NULL OR feasibility_score BETWEEN 0 AND 1),
    CONSTRAINT positive_amounts CHECK (
        (purchase_price IS NULL OR purchase_price > 0) AND 
        (down_payment IS NULL OR down_payment > 0) AND 
        (monthly_income IS NULL OR monthly_income > 0)
    )
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
    loan_to_value_ratio DECIMAL(5, 2),
    debt_to_income_ratio DECIMAL(5, 2),
    
    -- Bank information
    bank_name TEXT,
    bank_product_name TEXT,
    
    -- Amortization schedule
    amortization_schedule JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_calculation_amounts CHECK (
        property_price > 0 AND 
        down_payment_amount >= 0 AND 
        loan_amount > 0 AND
        loan_amount = property_price - down_payment_amount
    ),
    CONSTRAINT valid_interest_rate CHECK (interest_rate > 0 AND interest_rate < 50),
    CONSTRAINT valid_loan_term CHECK (loan_term_months > 0 AND loan_term_months <= 600)
);

-- Loan terms (for detailed loan products)
CREATE TABLE loan_terms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    financial_plan_id UUID REFERENCES financial_plans(id) ON DELETE CASCADE,
    
    -- Basic loan structure
    loan_amount BIGINT NOT NULL,
    loan_term_years INTEGER NOT NULL,
    loan_term_months INTEGER GENERATED ALWAYS AS (loan_term_years * 12) STORED,
    
    -- Interest rate structure
    promotional_rate NUMERIC(5,2),
    promotional_period_months INTEGER DEFAULT 0,
    regular_rate NUMERIC(5,2) NOT NULL,
    rate_type rate_type_enum DEFAULT 'fixed',
    
    -- Payment structure
    grace_period_months INTEGER DEFAULT 0,
    
    -- Bank & product info
    bank_name TEXT,
    loan_product_name TEXT,
    bank_contact_info JSONB,
    
    -- Fees & penalties
    origination_fee BIGINT DEFAULT 0,
    processing_fee BIGINT DEFAULT 0,
    early_payment_penalty_rate NUMERIC(5,2) DEFAULT 0,
    late_payment_penalty_rate NUMERIC(5,2) DEFAULT 0,
    
    -- Insurance
    mortgage_insurance_required BOOLEAN DEFAULT FALSE,
    mortgage_insurance_rate NUMERIC(5,2),
    property_insurance_required BOOLEAN DEFAULT TRUE,
    
    -- Calculated fields
    monthly_payment_promotional BIGINT,
    monthly_payment_regular BIGINT,
    total_interest BIGINT,
    total_payments BIGINT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_loan_terms_check CHECK (
        loan_amount > 0 AND
        loan_term_years > 0 AND loan_term_years <= 50 AND
        regular_rate >= 0 AND regular_rate <= 50
    )
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
    loan_type TEXT NOT NULL,
    interest_rate DECIMAL(5, 3) NOT NULL,
    min_rate DECIMAL(5, 3),
    max_rate DECIMAL(5, 3),
    
    -- Loan conditions
    min_loan_amount DECIMAL(15, 2),
    max_loan_amount DECIMAL(15, 2),
    max_ltv_ratio DECIMAL(5, 2),
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
    
    CONSTRAINT valid_bank_interest_rate CHECK (interest_rate > 0 AND interest_rate < 50),
    CONSTRAINT valid_bank_ltv_ratio CHECK (max_ltv_ratio IS NULL OR max_ltv_ratio BETWEEN 0 AND 100)
);

-- Historical interest rates (compatible with existing schema)
CREATE TABLE interest_rates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Bank information
    bank_name TEXT NOT NULL,
    bank_code TEXT,
    
    -- Rate details
    rate_type rate_category_enum NOT NULL,
    loan_term_years INTEGER NOT NULL,
    interest_rate NUMERIC(5,2) NOT NULL,
    
    -- Conditions
    minimum_loan_amount BIGINT,
    maximum_loan_amount BIGINT,
    minimum_down_payment_percent NUMERIC(5,2),
    
    -- Validity
    effective_date DATE NOT NULL,
    expiry_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    
    -- Additional info
    special_conditions TEXT[],
    source_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property market data
CREATE TABLE property_market_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Location
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    ward TEXT,
    
    -- Property type
    property_type property_type NOT NULL,
    
    -- Market metrics
    average_price_per_sqm BIGINT NOT NULL,
    median_price_per_sqm BIGINT,
    price_change_monthly NUMERIC(5,2),
    price_change_yearly NUMERIC(5,2),
    
    -- Rental market
    average_rental_yield NUMERIC(5,2),
    average_rent_per_sqm BIGINT,
    occupancy_rate NUMERIC(5,2),
    
    -- Market activity
    properties_sold INTEGER,
    properties_listed INTEGER,
    days_on_market INTEGER,
    
    -- Time period
    data_period DATE NOT NULL,
    
    -- Data source
    data_source TEXT,
    reliability_score INTEGER CHECK (reliability_score BETWEEN 1 AND 10),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(city, district, ward, property_type, data_period)
);

-- =============================================
-- GAMIFICATION & USER ENGAGEMENT TABLES
-- =============================================

-- Achievement definitions
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Achievement metadata
    name TEXT NOT NULL UNIQUE,
    name_vi TEXT NOT NULL,
    description TEXT NOT NULL,
    description_vi TEXT NOT NULL,
    achievement_type achievement_type NOT NULL,
    
    -- Requirements
    required_actions JSONB NOT NULL,
    required_value INTEGER,
    
    -- Rewards
    experience_points INTEGER DEFAULT 0,
    badge_icon TEXT,
    badge_color TEXT DEFAULT '#3B82F6',
    
    -- Visibility
    is_active BOOLEAN DEFAULT true,
    is_hidden BOOLEAN DEFAULT false,
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
    progress_data JSONB,
    
    UNIQUE(user_id, achievement_id)
);

-- User experience tracking
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
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMPTZ,
    
    -- Delivery
    delivery_channels TEXT[] DEFAULT '{\"in_app\"}',
    priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

-- Community posts
CREATE TABLE community_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Post content
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_type TEXT DEFAULT 'question' CHECK (post_type IN ('question', 'success_story', 'advice', 'market_insight')),
    
    -- Associated plan
    financial_plan_id UUID REFERENCES financial_plans(id) ON DELETE SET NULL,
    is_plan_shared BOOLEAN DEFAULT FALSE,
    
    -- Engagement
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    
    -- Moderation
    is_featured BOOLEAN DEFAULT FALSE,
    is_moderated BOOLEAN DEFAULT FALSE,
    moderation_notes TEXT,
    
    -- Tags
    tags TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Full text search
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', title || ' ' || content)
    ) STORED
);

-- Post comments
CREATE TABLE post_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    
    is_moderated BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SYSTEM & ANALYTICS TABLES
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

-- App configuration
CREATE TABLE app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Setting details
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    setting_type TEXT NOT NULL,
    
    -- Metadata
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature usage tracking
CREATE TABLE feature_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    feature_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 1 NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Contact form submissions
CREATE TABLE contact_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'new' NOT NULL CHECK (status IN ('new', 'read', 'replied', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- FUNCTIONS AND UTILITIES
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Calculate monthly payment function
CREATE OR REPLACE FUNCTION calculate_monthly_payment(
    principal BIGINT,
    annual_rate NUMERIC,
    term_months INTEGER
) RETURNS BIGINT AS $$
DECLARE
    monthly_rate NUMERIC;
    payment NUMERIC;
BEGIN
    IF annual_rate = 0 THEN
        RETURN principal / term_months;
    END IF;
    
    monthly_rate := annual_rate / 100.0 / 12.0;
    payment := principal * monthly_rate * power(1 + monthly_rate, term_months) / 
               (power(1 + monthly_rate, term_months) - 1);
    
    RETURN ROUND(payment);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
    );
    
    -- Create initial subscription record
    INSERT INTO public.subscriptions (user_id, status)
    VALUES (NEW.id, 'inactive');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update plan calculations
CREATE OR REPLACE FUNCTION update_plan_calculations(plan_id UUID)
RETURNS VOID AS $$
DECLARE
    plan_record financial_plans;
    loan_record loan_terms;
BEGIN
    SELECT * INTO plan_record FROM financial_plans WHERE id = plan_id;
    SELECT * INTO loan_record FROM loan_terms WHERE financial_plan_id = plan_id;
    
    IF loan_record.id IS NOT NULL THEN
        UPDATE financial_plans 
        SET 
            cached_calculations = jsonb_build_object(
                'monthly_payment', calculate_monthly_payment(
                    loan_record.loan_amount, 
                    loan_record.regular_rate, 
                    loan_record.loan_term_months
                ),
                'total_interest', loan_record.total_interest,
                'debt_to_income_ratio', (loan_record.monthly_payment_regular::NUMERIC / plan_record.monthly_income * 100)
            ),
            calculations_last_updated = NOW()
        WHERE id = plan_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Security function to check admin status
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = user_uuid 
        AND subscription_tier = 'professional'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at 
    BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_properties_updated_at 
    BEFORE UPDATE ON user_properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_plans_updated_at 
    BEFORE UPDATE ON financial_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_terms_updated_at 
    BEFORE UPDATE ON loan_terms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banks_updated_at 
    BEFORE UPDATE ON banks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_interest_rates_updated_at 
    BEFORE UPDATE ON bank_interest_rates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at 
    BEFORE UPDATE ON achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_experience_updated_at 
    BEFORE UPDATE ON user_experience
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at 
    BEFORE UPDATE ON app_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER handle_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER handle_community_posts_updated_at
    BEFORE UPDATE ON community_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER handle_post_comments_updated_at
    BEFORE UPDATE ON post_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User profiles indexes
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_subscription ON user_profiles(subscription_tier);
CREATE INDEX idx_user_profiles_city ON user_profiles(city);
CREATE INDEX idx_user_preferences_visibility ON user_preferences(user_id, profile_visibility);

-- Properties indexes
CREATE INDEX idx_properties_location ON properties(province, district);
CREATE INDEX idx_properties_type_status ON properties(property_type, status);
CREATE INDEX idx_properties_price_range ON properties(list_price);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX idx_properties_slug ON properties(slug);
CREATE INDEX idx_properties_search_main ON properties(province, district, property_type, status, list_price);
CREATE INDEX idx_properties_featured ON properties(is_featured, published_at DESC) WHERE is_featured = true;
CREATE INDEX idx_properties_published ON properties(published_at) WHERE published_at IS NOT NULL;

-- Financial plans indexes
CREATE INDEX idx_financial_plans_user_status ON financial_plans(user_id, status);
CREATE INDEX idx_financial_plans_created_at ON financial_plans(created_at DESC);
CREATE INDEX idx_financial_plans_user ON financial_plans(user_id, created_at DESC);
CREATE INDEX idx_financial_plans_public ON financial_plans(is_public, created_at DESC) WHERE is_public = true;

-- Loan calculations indexes
CREATE INDEX idx_loan_calculations_user ON loan_calculations(user_id);
CREATE INDEX idx_loan_calculations_plan ON loan_calculations(financial_plan_id);

-- Bank and rates indexes
CREATE INDEX idx_bank_rates_active ON bank_interest_rates(bank_id, is_active, effective_date);
CREATE INDEX idx_bank_rates_loan_type ON bank_interest_rates(loan_type, interest_rate);
CREATE INDEX idx_bank_rates_lookup ON bank_interest_rates(bank_id, loan_type, is_active);
CREATE INDEX idx_interest_rates_current ON interest_rates(bank_name, loan_term_years, effective_date DESC) 
    WHERE is_current = true;
CREATE INDEX idx_property_market_location ON property_market_data(city, district, property_type, data_period DESC);
CREATE INDEX idx_bank_rates_active_dates ON bank_interest_rates(is_active, effective_date, expiry_date);

-- Achievement indexes
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id, unlocked_at DESC);
CREATE INDEX idx_achievements_type_active ON achievements(achievement_type, is_active) WHERE is_active = true;
CREATE INDEX idx_achievements_active ON achievements(is_active) WHERE is_active = true;

-- Notification indexes
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_user_recent ON notifications(user_id, created_at DESC);

-- Activity indexes
CREATE INDEX idx_user_activities_user_type ON user_activities(user_id, activity_type, created_at DESC);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at DESC);

-- Subscription indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Billing indexes
CREATE INDEX idx_billing_history_user_id ON billing_history(user_id);
CREATE INDEX idx_billing_history_stripe_invoice_id ON billing_history(stripe_invoice_id);
CREATE INDEX idx_billing_history_created_at ON billing_history(created_at);

-- Feature usage indexes
CREATE INDEX idx_feature_usage_user_id ON feature_usage(user_id);
CREATE INDEX idx_feature_usage_feature_name ON feature_usage(feature_name);
CREATE INDEX idx_feature_usage_created_at ON feature_usage(created_at);

-- Community indexes
CREATE INDEX idx_community_posts_user ON community_posts(user_id, created_at DESC);
CREATE INDEX idx_community_posts_type ON community_posts(post_type, created_at DESC);
CREATE INDEX idx_community_posts_search ON community_posts USING gin(search_vector);

-- Contact submissions indexes
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_interest_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interest_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- User profile policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Users can manage own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Subscription policies
CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Billing history policies
CREATE POLICY "Users can view own billing history" ON billing_history
    FOR SELECT USING (auth.uid() = user_id);

-- Feature usage policies
CREATE POLICY "Users can view own feature usage" ON feature_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feature usage" ON feature_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Property policies
CREATE POLICY "Users can view published properties" ON properties
    FOR SELECT USING (auth.role() = 'authenticated' AND published_at IS NOT NULL);

-- Property favorites policies
CREATE POLICY "Users can manage own favorites" ON property_favorites
    FOR ALL USING (auth.uid() = user_id);

-- User properties policies
CREATE POLICY "Users can manage own properties" ON user_properties
    FOR ALL USING (auth.uid() = user_id);

-- Financial plans policies
CREATE POLICY "Users can manage own financial plans" ON financial_plans
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public financial plans" ON financial_plans
    FOR SELECT USING (auth.role() = 'authenticated' AND is_public = true);

-- Loan calculations policies
CREATE POLICY "Users can manage own loan calculations" ON loan_calculations
    FOR ALL USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT user_id FROM financial_plans 
            WHERE id = financial_plan_id
        )
    );

-- Loan terms policies
CREATE POLICY "Users can access loan terms for their plans" ON loan_terms
    FOR ALL USING (
        financial_plan_id IN (
            SELECT id FROM financial_plans 
            WHERE user_id = auth.uid()
        )
    );

-- Bank data policies (public read access)
CREATE POLICY "Users can view bank data" ON banks
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Users can view interest rates" ON bank_interest_rates
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        is_active = true AND 
        effective_date <= CURRENT_DATE AND 
        (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)
    );

CREATE POLICY "Anyone can view market data" ON interest_rates
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view property market data" ON property_market_data
    FOR SELECT USING (true);

-- Achievement policies
CREATE POLICY "Users can view achievements" ON achievements
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Users can view own achievement unlocks" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievement unlocks" ON user_achievements
    FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

-- User experience policies
CREATE POLICY "Users can view own experience" ON user_experience
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can update experience" ON user_experience
    FOR ALL USING (auth.role() = 'service_role' OR auth.uid() = user_id);

-- Notification policies
CREATE POLICY "Users can manage own notifications" ON notifications
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "System can send notifications" ON notifications
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Community policies
CREATE POLICY "Anyone can view public posts" ON community_posts
    FOR SELECT USING (true);

CREATE POLICY "Users can create posts" ON community_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON community_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view comments" ON post_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON post_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON post_comments
    FOR UPDATE USING (auth.uid() = user_id);

-- User activity policies
CREATE POLICY "Users can view own activities" ON user_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can log activities" ON user_activities
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- App settings policies
CREATE POLICY "Users can view public settings" ON app_settings
    FOR SELECT USING (auth.role() = 'authenticated' AND is_public = true);

-- Admin policies for all management tables
CREATE POLICY "Admins can manage all properties" ON properties
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM user_profiles 
            WHERE subscription_tier = 'professional'
        )
    );

CREATE POLICY "Admins can manage bank data" ON banks
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage interest rates" ON bank_interest_rates
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage achievements" ON achievements
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all activities" ON user_activities
    FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage all settings" ON app_settings
    FOR ALL USING (is_admin(auth.uid()));

-- =============================================
-- COMMENTS AND DOCUMENTATION
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
COMMENT ON TABLE subscriptions IS 'User subscription and billing management';