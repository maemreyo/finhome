-- FinHome AI Financial Insights Migration
-- Adds AI-powered personal financial advisor functionality

-- =============================================
-- AI FINANCIAL INSIGHTS TABLE
-- =============================================

-- Table to cache AI-generated financial insights
CREATE TABLE ai_financial_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Insight classification
    insight_type TEXT NOT NULL CHECK (insight_type IN ('spending_analysis', 'budget_optimization', 'saving_opportunities', 'goal_recommendations', 'comprehensive')),
    
    -- Generated insight data (stored as JSON)
    insight_text TEXT NOT NULL,
    
    -- Generation metadata
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    
    -- Additional context data
    metadata JSONB DEFAULT '{}',
    
    -- AI service metadata
    ai_model TEXT DEFAULT 'gemini-2.0-flash',
    confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
    processing_time_ms INTEGER,
    
    -- Status tracking
    is_valid BOOLEAN DEFAULT true,
    invalidated_at TIMESTAMPTZ,
    invalidation_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- AI INSIGHT USAGE TRACKING
-- =============================================

-- Track user engagement with AI insights
CREATE TABLE ai_insight_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    insight_id UUID NOT NULL REFERENCES ai_financial_insights(id) ON DELETE CASCADE,
    
    -- Interaction details
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('viewed', 'dismissed', 'acted_upon', 'shared', 'rated')),
    interaction_data JSONB DEFAULT '{}',
    
    -- User feedback
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    user_feedback TEXT,
    
    -- Tracking
    session_id TEXT,
    user_agent TEXT,
    ip_address INET,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- AI FEATURE USAGE LIMITS
-- =============================================

-- Track usage for premium feature limits
CREATE TABLE ai_feature_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Usage tracking
    feature_type TEXT NOT NULL DEFAULT 'ai_insights',
    usage_count INTEGER DEFAULT 0,
    usage_period TEXT NOT NULL DEFAULT 'monthly' CHECK (usage_period IN ('daily', 'weekly', 'monthly', 'yearly')),
    
    -- Time period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Metadata
    last_used_at TIMESTAMPTZ,
    subscription_tier TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, feature_type, period_start, period_end)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- AI insights indexes
CREATE INDEX idx_ai_insights_user_type ON ai_financial_insights(user_id, insight_type, generated_at DESC);
CREATE INDEX idx_ai_insights_expiry ON ai_financial_insights(expires_at) WHERE is_valid = true;
CREATE INDEX idx_ai_insights_user_recent ON ai_financial_insights(user_id, generated_at DESC) WHERE is_valid = true;

-- Interaction tracking indexes
CREATE INDEX idx_ai_interactions_user ON ai_insight_interactions(user_id, created_at DESC);
CREATE INDEX idx_ai_interactions_insight ON ai_insight_interactions(insight_id, interaction_type);

-- Usage tracking indexes
CREATE INDEX idx_ai_usage_user_period ON ai_feature_usage(user_id, usage_period, period_start, period_end);
CREATE INDEX idx_ai_usage_feature ON ai_feature_usage(feature_type, period_start) WHERE subscription_tier IS NOT NULL;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on new tables
ALTER TABLE ai_financial_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insight_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feature_usage ENABLE ROW LEVEL SECURITY;

-- AI insights policies
CREATE POLICY "Users can access own AI insights" ON ai_financial_insights
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can track own AI interactions" ON ai_insight_interactions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own AI usage" ON ai_feature_usage
    FOR SELECT USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can manage AI insights" ON ai_financial_insights
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view AI interactions" ON ai_insight_interactions
    FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage AI usage" ON ai_feature_usage
    FOR ALL USING (is_admin(auth.uid()));

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to clean up expired AI insights
CREATE OR REPLACE FUNCTION cleanup_expired_ai_insights()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete expired insights older than 7 days
    DELETE FROM ai_financial_insights 
    WHERE expires_at < NOW() - INTERVAL '7 days'
    AND is_valid = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Mark recently expired insights as invalid
    UPDATE ai_financial_insights 
    SET is_valid = false,
        invalidated_at = NOW(),
        invalidation_reason = 'expired'
    WHERE expires_at < NOW() 
    AND is_valid = true;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to track AI feature usage
CREATE OR REPLACE FUNCTION track_ai_feature_usage()
RETURNS TRIGGER AS $$
DECLARE
    current_period_start DATE;
    current_period_end DATE;
    user_tier TEXT;
BEGIN
    -- Get user subscription tier
    SELECT subscription_tier INTO user_tier
    FROM user_profiles 
    WHERE id = NEW.user_id;
    
    -- Calculate current period dates (monthly)
    current_period_start := DATE_TRUNC('month', CURRENT_DATE);
    current_period_end := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE;
    
    -- Insert or update usage record
    INSERT INTO ai_feature_usage (
        user_id, 
        feature_type, 
        usage_count, 
        period_start, 
        period_end,
        last_used_at,
        subscription_tier
    )
    VALUES (
        NEW.user_id,
        'ai_insights',
        1,
        current_period_start,
        current_period_end,
        NOW(),
        user_tier
    )
    ON CONFLICT (user_id, feature_type, period_start, period_end)
    DO UPDATE SET
        usage_count = ai_feature_usage.usage_count + 1,
        last_used_at = NOW(),
        subscription_tier = user_tier,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to track AI insights usage
CREATE TRIGGER track_ai_insights_usage
    AFTER INSERT ON ai_financial_insights
    FOR EACH ROW EXECUTE FUNCTION track_ai_feature_usage();

-- Updated_at triggers
CREATE TRIGGER update_ai_insights_updated_at
    BEFORE UPDATE ON ai_financial_insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_usage_updated_at
    BEFORE UPDATE ON ai_feature_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- HELPER VIEWS
-- =============================================

-- View for recent valid AI insights
CREATE VIEW recent_ai_insights AS
SELECT 
    ai.*,
    up.subscription_tier,
    COUNT(aii.id) as interaction_count,
    AVG(aii.user_rating) as average_rating
FROM ai_financial_insights ai
JOIN user_profiles up ON ai.user_id = up.id
LEFT JOIN ai_insight_interactions aii ON ai.id = aii.insight_id
WHERE ai.is_valid = true 
  AND ai.expires_at > NOW()
GROUP BY ai.id, up.subscription_tier;

-- View for AI usage analytics (admin)
CREATE VIEW ai_usage_analytics AS
SELECT 
    DATE_TRUNC('day', afu.created_at) as usage_date,
    afu.subscription_tier,
    COUNT(DISTINCT afu.user_id) as unique_users,
    SUM(afu.usage_count) as total_insights_generated,
    AVG(afu.usage_count) as avg_insights_per_user
FROM ai_feature_usage afu
WHERE afu.feature_type = 'ai_insights'
GROUP BY DATE_TRUNC('day', afu.created_at), afu.subscription_tier
ORDER BY usage_date DESC;

-- =============================================
-- SCHEDULED CLEANUP
-- =============================================

-- Add cleanup job (requires pg_cron extension)
-- SELECT cron.schedule('ai-insights-cleanup', '0 2 * * *', 'SELECT cleanup_expired_ai_insights();');

COMMENT ON TABLE ai_financial_insights IS 'AI-generated financial insights and recommendations for users';
COMMENT ON TABLE ai_insight_interactions IS 'User interactions and feedback on AI insights';
COMMENT ON TABLE ai_feature_usage IS 'Usage tracking for AI features and subscription limits';
COMMENT ON FUNCTION cleanup_expired_ai_insights() IS 'Cleans up expired AI insights to manage storage';
COMMENT ON FUNCTION track_ai_feature_usage() IS 'Tracks AI feature usage for subscription limit enforcement';