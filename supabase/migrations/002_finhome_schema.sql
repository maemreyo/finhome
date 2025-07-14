-- FinHome Real Estate Financial Planning Database Schema
-- Migration: 002_finhome_schema.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For encryption functions

-- ==============================================
-- CUSTOM TYPES
-- ==============================================
CREATE TYPE subscription_tier_type AS ENUM ('free', 'premium', 'professional');
CREATE TYPE plan_status_type AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE property_type_enum AS ENUM ('apartment', 'house', 'villa', 'townhouse', 'commercial');
CREATE TYPE plan_type_enum AS ENUM ('home_purchase', 'investment', 'upgrade', 'refinance');
CREATE TYPE rate_type_enum AS ENUM ('fixed', 'variable', 'mixed');
CREATE TYPE scenario_type_enum AS ENUM ('baseline', 'optimistic', 'pessimistic', 'alternative', 'stress_test');
CREATE TYPE legal_status_enum AS ENUM ('red_book', 'pink_book', 'pending', 'disputed');
CREATE TYPE ownership_type_enum AS ENUM ('individual', 'joint', 'company');
CREATE TYPE rate_category_enum AS ENUM ('promotional', 'standard', 'vip', 'prime');
CREATE TYPE grace_period_type_enum AS ENUM ('principal_only', 'full_payment', 'none');
CREATE TYPE event_type_enum AS ENUM (
  'loan_signing', 'property_handover', 'first_payment', 'rate_change', 
  'prepayment', 'refinance', 'loan_completion', 'property_sale',
  'crisis_event', 'opportunity', 'milestone'
);

-- ==============================================
-- USER PROFILES (Extended)
-- ==============================================
-- Extends the existing profiles table with FinHome-specific fields
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Basic Information
  full_name TEXT,
  phone_number TEXT,
  date_of_birth DATE,
  
  -- Profile Data
  avatar_url TEXT,
  location JSONB, -- {city, district, ward}
  occupation TEXT,
  company_name TEXT,
  
  -- Financial Profile
  annual_income BIGINT, -- VND
  monthly_expenses BIGINT, -- VND
  current_assets BIGINT, -- VND
  current_debts BIGINT, -- VND
  
  -- App Usage
  subscription_tier subscription_tier_type DEFAULT 'free' NOT NULL,
  subscription_expires_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  
  -- Gamification
  experience_points INTEGER DEFAULT 0,
  achievement_badges TEXT[] DEFAULT '{}',
  
  -- Preferences
  preferred_language TEXT DEFAULT 'vi',
  currency_format TEXT DEFAULT 'VND',
  notification_preferences JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_subscription_tier CHECK (subscription_tier IN ('free', 'premium', 'professional'))
);

-- ==============================================
-- PROPERTIES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic Property Info
  property_name TEXT NOT NULL,
  property_type property_type_enum NOT NULL,
  
  -- Location
  address TEXT,
  district TEXT,
  city TEXT,
  ward TEXT,
  coordinates POINT, -- Lat/Long for mapping
  
  -- Property Details
  area_sqm NUMERIC(10,2),
  bedrooms INTEGER,
  bathrooms INTEGER,
  floor_number INTEGER,
  total_floors INTEGER,
  
  -- Pricing
  listed_price BIGINT NOT NULL, -- VND
  market_value_estimate BIGINT,
  price_per_sqm BIGINT,
  
  -- Additional Features
  amenities TEXT[],
  property_features JSONB, -- Flexible for various property types
  
  -- Legal & Documentation
  legal_status legal_status_enum,
  ownership_type ownership_type_enum,
  
  -- Market Data
  neighborhood_data JSONB, -- Schools, hospitals, transportation
  investment_metrics JSONB, -- Rental yield, appreciation rate
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- FINANCIAL PLANS TABLE (Core Entity)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.financial_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- Plan Identification
  plan_name TEXT NOT NULL,
  plan_description TEXT,
  plan_type plan_type_enum DEFAULT 'home_purchase',
  
  -- Property Reference
  property_id UUID REFERENCES public.properties(id),
  custom_property_data JSONB, -- For custom/unlisted properties
  
  -- Financial Inputs
  purchase_price BIGINT NOT NULL,
  down_payment BIGINT NOT NULL,
  additional_costs BIGINT DEFAULT 0, -- Fees, taxes, etc.
  
  -- Personal Financial Situation
  monthly_income BIGINT NOT NULL,
  monthly_expenses BIGINT NOT NULL,
  current_savings BIGINT NOT NULL,
  other_debts BIGINT DEFAULT 0,
  
  -- Investment Specific (nullable for home purchase)
  expected_rental_income BIGINT,
  expected_appreciation_rate NUMERIC(5,2), -- Annual %
  investment_horizon_years INTEGER,
  
  -- Plan Status & Metadata
  plan_status plan_status_type DEFAULT 'draft',
  is_public BOOLEAN DEFAULT FALSE, -- For community sharing
  view_count INTEGER DEFAULT 0,
  
  -- Calculation Cache (for performance)
  cached_calculations JSONB,
  calculations_last_updated TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT positive_amounts CHECK (
    purchase_price > 0 AND 
    down_payment > 0 AND 
    monthly_income > 0 AND
    down_payment <= purchase_price
  )
);

-- ==============================================
-- LOAN TERMS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.loan_terms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_plan_id UUID REFERENCES public.financial_plans(id) ON DELETE CASCADE,
  
  -- Basic Loan Structure
  loan_amount BIGINT NOT NULL,
  loan_term_years INTEGER NOT NULL,
  loan_term_months INTEGER GENERATED ALWAYS AS (loan_term_years * 12) STORED,
  
  -- Interest Rate Structure
  promotional_rate NUMERIC(5,2), -- Annual %
  promotional_period_months INTEGER DEFAULT 0,
  regular_rate NUMERIC(5,2) NOT NULL, -- Annual %
  rate_type rate_type_enum DEFAULT 'fixed',
  
  -- Payment Structure
  grace_period_months INTEGER DEFAULT 0,
  grace_period_type grace_period_type_enum,
  
  -- Bank & Product Info
  bank_name TEXT,
  loan_product_name TEXT,
  bank_contact_info JSONB,
  
  -- Fees & Penalties
  origination_fee BIGINT DEFAULT 0,
  processing_fee BIGINT DEFAULT 0,
  early_payment_penalty_rate NUMERIC(5,2) DEFAULT 0,
  late_payment_penalty_rate NUMERIC(5,2) DEFAULT 0,
  
  -- Legal & Insurance
  mortgage_insurance_required BOOLEAN DEFAULT FALSE,
  mortgage_insurance_rate NUMERIC(5,2),
  property_insurance_required BOOLEAN DEFAULT TRUE,
  
  -- Calculated Fields (stored for performance)
  monthly_payment_promotional BIGINT,
  monthly_payment_regular BIGINT,
  total_interest BIGINT,
  total_payments BIGINT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_loan_terms CHECK (
    loan_amount > 0 AND
    loan_term_years > 0 AND loan_term_years <= 50 AND
    regular_rate >= 0 AND regular_rate <= 50 AND
    (promotional_rate IS NULL OR promotional_rate >= 0) AND
    grace_period_months >= 0 AND grace_period_months <= 24
  )
);

-- ==============================================
-- SCENARIOS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_plan_id UUID REFERENCES public.financial_plans(id) ON DELETE CASCADE,
  
  -- Scenario Identification
  scenario_name TEXT NOT NULL,
  scenario_type scenario_type_enum DEFAULT 'alternative',
  scenario_description TEXT,
  
  -- Scenario Parameters
  modified_parameters JSONB NOT NULL, -- What changed from baseline
  assumptions JSONB, -- Economic assumptions, market conditions
  
  -- Results Cache
  calculated_results JSONB,
  key_metrics JSONB, -- NPV, IRR, payback period, etc.
  
  -- Comparison Data
  comparison_baseline_id UUID REFERENCES public.scenarios(id),
  performance_vs_baseline JSONB,
  
  -- User Interaction
  is_favorite BOOLEAN DEFAULT FALSE,
  user_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- TIMELINE EVENTS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_id UUID REFERENCES public.scenarios(id) ON DELETE CASCADE,
  
  -- Event Details
  event_type event_type_enum NOT NULL,
  event_name TEXT NOT NULL,
  event_description TEXT,
  
  -- Timing
  scheduled_date DATE NOT NULL,
  actual_date DATE, -- Null until event occurs
  event_month INTEGER NOT NULL, -- Month from loan start (0-based)
  
  -- Financial Impact
  financial_impact BIGINT, -- Positive or negative amount
  balance_after_event BIGINT,
  payment_change BIGINT, -- Change in monthly payment
  
  -- Event Data
  event_data JSONB, -- Flexible storage for event-specific data
  
  -- Visual Representation
  icon_name TEXT, -- For timeline visualization
  color_code TEXT, -- Hex color for the event
  priority_level INTEGER DEFAULT 5 CHECK (priority_level BETWEEN 1 AND 10),
  
  -- Status
  event_status TEXT DEFAULT 'scheduled' CHECK (event_status IN ('scheduled', 'completed', 'modified', 'cancelled')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- CASH FLOW PROJECTIONS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.cash_flow_projections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_id UUID REFERENCES public.scenarios(id) ON DELETE CASCADE,
  
  -- Time Period
  month_number INTEGER NOT NULL, -- 0-based from loan start
  projection_date DATE NOT NULL,
  
  -- Loan Payments
  principal_payment BIGINT NOT NULL,
  interest_payment BIGINT NOT NULL,
  total_payment BIGINT NOT NULL,
  remaining_balance BIGINT NOT NULL,
  
  -- Property Income/Expenses
  rental_income BIGINT DEFAULT 0,
  property_expenses BIGINT DEFAULT 0,
  property_taxes BIGINT DEFAULT 0,
  insurance_costs BIGINT DEFAULT 0,
  maintenance_costs BIGINT DEFAULT 0,
  
  -- Net Cash Flow
  net_cash_flow BIGINT NOT NULL,
  cumulative_cash_flow BIGINT NOT NULL,
  
  -- Property Value
  estimated_property_value BIGINT,
  equity_position BIGINT,
  
  -- Metadata
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT positive_remaining_balance CHECK (remaining_balance >= 0),
  
  -- Composite primary key for efficient queries
  UNIQUE(scenario_id, month_number)
);

-- ==============================================
-- MARKET DATA TABLES
-- ==============================================

-- Interest Rates Historical Data
CREATE TABLE IF NOT EXISTS public.interest_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Bank Information
  bank_name TEXT NOT NULL,
  bank_code TEXT, -- Official bank code
  
  -- Rate Details
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
  
  -- Additional Info
  special_conditions TEXT[],
  source_url TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Market Data
CREATE TABLE IF NOT EXISTS public.property_market_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Location
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  ward TEXT,
  
  -- Property Type
  property_type property_type_enum NOT NULL,
  
  -- Market Metrics
  average_price_per_sqm BIGINT NOT NULL,
  median_price_per_sqm BIGINT,
  price_change_monthly NUMERIC(5,2), -- Percentage
  price_change_yearly NUMERIC(5,2), -- Percentage
  
  -- Rental Market
  average_rental_yield NUMERIC(5,2),
  average_rent_per_sqm BIGINT,
  occupancy_rate NUMERIC(5,2),
  
  -- Market Activity
  properties_sold INTEGER,
  properties_listed INTEGER,
  days_on_market INTEGER,
  
  -- Time Period
  data_period DATE NOT NULL, -- Month/Year of data
  
  -- Data Source
  data_source TEXT,
  reliability_score INTEGER CHECK (reliability_score BETWEEN 1 AND 10),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicate data
  UNIQUE(city, district, ward, property_type, data_period)
);

-- ==============================================
-- COMMUNITY FEATURES TABLES
-- ==============================================

-- Community Posts
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- Post Content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'question' CHECK (post_type IN ('question', 'success_story', 'advice', 'market_insight')),
  
  -- Associated Financial Plan (optional)
  financial_plan_id UUID REFERENCES public.financial_plans(id) ON DELETE SET NULL,
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
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Full text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', title || ' ' || content)
  ) STORED
);

-- Post Comments
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  
  -- Comment Content
  content TEXT NOT NULL,
  
  -- Engagement
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  
  -- Moderation
  is_moderated BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- SYSTEM TABLES
-- ==============================================

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- Notification Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'payment_reminder', 'rate_change', 'market_update', 'achievement', 
    'community', 'system', 'marketing'
  )),
  
  -- Action
  action_url TEXT,
  action_text TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  
  -- Delivery Channels
  delivery_channels TEXT[] DEFAULT '{"in_app"}', -- in_app, email, push
  
  -- Priority
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- User-related indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription ON public.user_profiles(subscription_tier, subscription_expires_at);

-- Financial plans indexes
CREATE INDEX IF NOT EXISTS idx_financial_plans_user ON public.financial_plans(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_financial_plans_status ON public.financial_plans(plan_status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_financial_plans_public ON public.financial_plans(is_public, created_at DESC) WHERE is_public = true;

-- Scenarios and calculations
CREATE INDEX IF NOT EXISTS idx_scenarios_plan ON public.scenarios(financial_plan_id, scenario_type);
CREATE INDEX IF NOT EXISTS idx_cash_flow_scenario_month ON public.cash_flow_projections(scenario_id, month_number);

-- Timeline events
CREATE INDEX IF NOT EXISTS idx_timeline_events_scenario_date ON public.timeline_events(scenario_id, scheduled_date);

-- Market data indexes
CREATE INDEX IF NOT EXISTS idx_interest_rates_current ON public.interest_rates(bank_name, loan_term_years, effective_date DESC) 
  WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_property_market_location ON public.property_market_data(city, district, property_type, data_period DESC);

-- Community indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_user ON public.community_posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON public.community_posts(post_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_search ON public.community_posts USING gin(search_vector);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);

-- ==============================================
-- ESSENTIAL FUNCTIONS
-- ==============================================

-- Calculate Monthly Payment
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

-- Update Plan Calculations
CREATE OR REPLACE FUNCTION update_plan_calculations(plan_id UUID)
RETURNS VOID AS $$
DECLARE
  plan_record public.financial_plans;
  loan_record public.loan_terms;
BEGIN
  -- Get plan and loan data
  SELECT * INTO plan_record FROM public.financial_plans WHERE id = plan_id;
  SELECT * INTO loan_record FROM public.loan_terms WHERE financial_plan_id = plan_id;
  
  -- Update cached calculations
  UPDATE public.financial_plans 
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
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- TRIGGERS
-- ==============================================

-- Triggers for updated_at
CREATE TRIGGER handle_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_financial_plans_updated_at
  BEFORE UPDATE ON public.financial_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_loan_terms_updated_at
  BEFORE UPDATE ON public.loan_terms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_scenarios_updated_at
  BEFORE UPDATE ON public.scenarios
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_post_comments_updated_at
  BEFORE UPDATE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flow_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- User Profiles - Users can only access their own profile
CREATE POLICY "Users can view own profile" 
  ON public.user_profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.user_profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.user_profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Financial Plans - Users can only access their own plans or public ones
CREATE POLICY "Users can view own plans" 
  ON public.financial_plans FOR SELECT 
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own plans" 
  ON public.financial_plans FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans" 
  ON public.financial_plans FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans" 
  ON public.financial_plans FOR DELETE 
  USING (auth.uid() = user_id);

-- Cascade policies for related tables
CREATE POLICY "Users can access loan terms for their plans"
  ON public.loan_terms FOR ALL
  USING (
    financial_plan_id IN (
      SELECT id FROM public.financial_plans 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access scenarios for their plans"
  ON public.scenarios FOR ALL
  USING (
    financial_plan_id IN (
      SELECT id FROM public.financial_plans 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access timeline events for their scenarios"
  ON public.timeline_events FOR ALL
  USING (
    scenario_id IN (
      SELECT s.id FROM public.scenarios s
      JOIN public.financial_plans fp ON s.financial_plan_id = fp.id
      WHERE fp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access cash flow projections for their scenarios"
  ON public.cash_flow_projections FOR ALL
  USING (
    scenario_id IN (
      SELECT s.id FROM public.scenarios s
      JOIN public.financial_plans fp ON s.financial_plan_id = fp.id
      WHERE fp.user_id = auth.uid()
    )
  );

-- Market data is public read-only
CREATE POLICY "Anyone can view market data" 
  ON public.interest_rates FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can view property market data" 
  ON public.property_market_data FOR SELECT 
  USING (true);

-- Community policies
CREATE POLICY "Anyone can view public posts" 
  ON public.community_posts FOR SELECT 
  USING (true);

CREATE POLICY "Users can create posts" 
  ON public.community_posts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" 
  ON public.community_posts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view comments" 
  ON public.post_comments FOR SELECT 
  USING (true);

CREATE POLICY "Users can create comments" 
  ON public.post_comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" 
  ON public.post_comments FOR UPDATE 
  USING (auth.uid() = user_id);

-- Notification policies
CREATE POLICY "Users can view own notifications" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);