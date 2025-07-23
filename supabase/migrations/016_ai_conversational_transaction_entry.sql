-- FinHome AI Conversational Transaction Entry System
-- Adds support for natural language transaction parsing with AI learning capabilities
-- Part of Ticket 21: AI-Powered Conversational Transaction Entry

-- =============================================
-- AI CORRECTION TRACKING SYSTEM
-- =============================================

-- Table to store user corrections for AI learning
CREATE TABLE user_ai_corrections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User context
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Original AI parsing data
    input_text TEXT NOT NULL,
    original_suggestion JSONB NOT NULL, -- Original AI parsed transaction
    corrected_data JSONB NOT NULL,      -- User's corrected version
    
    -- Correction metadata
    correction_type TEXT NOT NULL CHECK (correction_type IN (
        'category_change',
        'amount_change', 
        'description_change',
        'transaction_type_change',
        'tags_change',
        'wallet_change',
        'multiple_changes'
    )),
    
    -- Learning context
    confidence_before DECIMAL(3,2) DEFAULT 0.5, -- AI's original confidence
    pattern_frequency INTEGER DEFAULT 1,        -- How often this pattern occurs
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Indexing for performance
    CONSTRAINT valid_confidence CHECK (confidence_before >= 0.0 AND confidence_before <= 1.0)
);

-- =============================================
-- AI PARSING SESSIONS
-- =============================================

-- Table to track AI parsing sessions for analytics and improvement
CREATE TABLE ai_parsing_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User and context
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_id UUID DEFAULT uuid_generate_v4(), -- Group related parsings
    
    -- Input data
    input_text TEXT NOT NULL,
    parsing_language TEXT DEFAULT 'vi',
    
    -- AI processing data
    ai_model_used TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    
    -- Results
    transactions_parsed INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.0,
    avg_confidence DECIMAL(3,2) DEFAULT 0.5,
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN (
        'processing', 'completed', 'failed', 'partially_failed'
    )),
    error_message TEXT,
    
    -- Parsed results (for analysis)
    parsed_transactions JSONB,
    user_corrections JSONB, -- Store any corrections made
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- AI LEARNING PATTERNS
-- =============================================

-- Table to store learned patterns for improved suggestions
CREATE TABLE ai_learning_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User context (can be global or user-specific)
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_global BOOLEAN DEFAULT false, -- Global patterns vs user-specific
    
    -- Pattern identification
    pattern_type TEXT NOT NULL CHECK (pattern_type IN (
        'merchant_category',    -- "Highlands Coffee" -> food_dining
        'description_category', -- "trà sữa" -> food_dining  
        'amount_range',         -- Coffee shops typically 25k-50k
        'keyword_category',     -- "xăng" -> transportation
        'context_category'      -- Time/location based patterns
    )),
    
    -- Pattern data
    trigger_text TEXT NOT NULL,           -- What triggers this pattern
    predicted_category_id UUID,           -- Suggested category
    predicted_amount_range JSONB,         -- {"min": 25000, "max": 50000}
    predicted_tags TEXT[] DEFAULT '{}',   -- Suggested tags
    
    -- Pattern strength
    confidence_score DECIMAL(3,2) DEFAULT 0.5,
    usage_count INTEGER DEFAULT 1,
    success_rate DECIMAL(5,2) DEFAULT 100.0,
    
    -- Pattern validity
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_confidence_pattern CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    CONSTRAINT valid_success_rate CHECK (success_rate >= 0.0 AND success_rate <= 100.0)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User AI corrections indexes
CREATE INDEX idx_user_ai_corrections_user_id ON user_ai_corrections(user_id);
CREATE INDEX idx_user_ai_corrections_created_at ON user_ai_corrections(created_at DESC);
CREATE INDEX idx_user_ai_corrections_correction_type ON user_ai_corrections(correction_type);
CREATE INDEX idx_user_ai_corrections_input_text ON user_ai_corrections USING gin(to_tsvector('english', input_text));

-- AI parsing sessions indexes  
CREATE INDEX idx_ai_parsing_sessions_user_id ON ai_parsing_sessions(user_id);
CREATE INDEX idx_ai_parsing_sessions_session_id ON ai_parsing_sessions(session_id);
CREATE INDEX idx_ai_parsing_sessions_created_at ON ai_parsing_sessions(created_at DESC);
CREATE INDEX idx_ai_parsing_sessions_status ON ai_parsing_sessions(status);

-- AI learning patterns indexes
CREATE INDEX idx_ai_learning_patterns_user_id ON ai_learning_patterns(user_id);
CREATE INDEX idx_ai_learning_patterns_pattern_type ON ai_learning_patterns(pattern_type);
CREATE INDEX idx_ai_learning_patterns_trigger_text ON ai_learning_patterns USING gin(to_tsvector('english', trigger_text));
CREATE INDEX idx_ai_learning_patterns_active ON ai_learning_patterns(is_active) WHERE is_active = true;
CREATE INDEX idx_ai_learning_patterns_confidence ON ai_learning_patterns(confidence_score DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all AI tables
ALTER TABLE user_ai_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_parsing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learning_patterns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_ai_corrections
CREATE POLICY "Users can view their own AI corrections" 
    ON user_ai_corrections FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI corrections" 
    ON user_ai_corrections FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI corrections" 
    ON user_ai_corrections FOR UPDATE 
    USING (auth.uid() = user_id);

-- RLS Policies for ai_parsing_sessions
CREATE POLICY "Users can view their own parsing sessions" 
    ON ai_parsing_sessions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own parsing sessions" 
    ON ai_parsing_sessions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own parsing sessions" 
    ON ai_parsing_sessions FOR UPDATE 
    USING (auth.uid() = user_id);

-- RLS Policies for ai_learning_patterns  
CREATE POLICY "Users can view their own patterns and global patterns" 
    ON ai_learning_patterns FOR SELECT 
    USING (auth.uid() = user_id OR is_global = true);

CREATE POLICY "Users can insert their own patterns" 
    ON ai_learning_patterns FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patterns" 
    ON ai_learning_patterns FOR UPDATE 
    USING (auth.uid() = user_id);

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Function to log AI corrections
CREATE OR REPLACE FUNCTION log_ai_correction(
    p_user_id UUID,
    p_input_text TEXT,
    p_original_suggestion JSONB,
    p_corrected_data JSONB,
    p_correction_type TEXT,
    p_confidence_before DECIMAL DEFAULT 0.5
) RETURNS UUID AS $$
DECLARE
    correction_id UUID;
BEGIN
    INSERT INTO user_ai_corrections (
        user_id,
        input_text,
        original_suggestion,
        corrected_data,
        correction_type,
        confidence_before
    ) VALUES (
        p_user_id,
        p_input_text,
        p_original_suggestion, 
        p_corrected_data,
        p_correction_type,
        p_confidence_before
    ) RETURNING id INTO correction_id;
    
    RETURN correction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get AI learning patterns for a user
CREATE OR REPLACE FUNCTION get_ai_patterns_for_user(
    p_user_id UUID,
    p_pattern_type TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 50
) RETURNS TABLE (
    id UUID,
    pattern_type TEXT,
    trigger_text TEXT,
    predicted_category_id UUID,
    predicted_amount_range JSONB,
    predicted_tags TEXT[],
    confidence_score DECIMAL,
    usage_count INTEGER,
    success_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        alp.id,
        alp.pattern_type,
        alp.trigger_text,
        alp.predicted_category_id,
        alp.predicted_amount_range,
        alp.predicted_tags,
        alp.confidence_score,
        alp.usage_count,
        alp.success_rate
    FROM ai_learning_patterns alp
    WHERE 
        (alp.user_id = p_user_id OR alp.is_global = true)
        AND alp.is_active = true
        AND (p_pattern_type IS NULL OR alp.pattern_type = p_pattern_type)
    ORDER BY 
        alp.confidence_score DESC,
        alp.usage_count DESC,
        alp.success_rate DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update AI pattern usage
CREATE OR REPLACE FUNCTION update_ai_pattern_usage(
    p_pattern_id UUID,
    p_success BOOLEAN DEFAULT true
) RETURNS VOID AS $$
BEGIN
    UPDATE ai_learning_patterns 
    SET 
        usage_count = usage_count + 1,
        success_rate = CASE 
            WHEN p_success THEN 
                ((success_rate * (usage_count - 1)) + 100.0) / usage_count
            ELSE 
                ((success_rate * (usage_count - 1)) + 0.0) / usage_count
        END,
        last_used_at = now(),
        updated_at = now()
    WHERE id = p_pattern_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all AI tables
CREATE TRIGGER update_user_ai_corrections_updated_at 
    BEFORE UPDATE ON user_ai_corrections 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_ai_parsing_sessions_updated_at 
    BEFORE UPDATE ON ai_parsing_sessions 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_ai_learning_patterns_updated_at 
    BEFORE UPDATE ON ai_learning_patterns 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =============================================
-- INITIAL GLOBAL PATTERNS (VIETNAMESE)
-- =============================================

-- Insert some initial global patterns for Vietnamese transaction parsing
INSERT INTO ai_learning_patterns (
    pattern_type, trigger_text, predicted_tags, confidence_score, is_global, user_id
) VALUES
-- Food & Dining patterns
('keyword_category', 'trà sữa', ARRAY['#trà_sữa', '#đồ_uống'], 0.95, true, NULL),
('keyword_category', 'cà phê', ARRAY['#cà_phê', '#đồ_uống'], 0.95, true, NULL),
('keyword_category', 'phở', ARRAY['#phở', '#ăn_sáng'], 0.90, true, NULL),
('keyword_category', 'cơm', ARRAY['#cơm', '#ăn_trưa'], 0.85, true, NULL),

-- Transportation patterns  
('keyword_category', 'grab', ARRAY['#grab', '#di_chuyển'], 0.90, true, NULL),
('keyword_category', 'xăng', ARRAY['#xăng', '#xe'], 0.95, true, NULL),
('keyword_category', 'taxi', ARRAY['#taxi', '#di_chuyển'], 0.90, true, NULL),

-- Shopping patterns
('keyword_category', 'mua sắm', ARRAY['#mua_sắm', '#shopping'], 0.85, true, NULL),
('keyword_category', 'siêu thị', ARRAY['#siêu_thị', '#thực_phẩm'], 0.85, true, NULL),

-- Income patterns
('keyword_category', 'lương', ARRAY['#lương', '#thu_nhập'], 0.95, true, NULL),
('keyword_category', 'thưởng', ARRAY['#thưởng', '#bonus'], 0.90, true, NULL);

-- =============================================
-- COMMENTS AND DOCUMENTATION
-- =============================================

COMMENT ON TABLE user_ai_corrections IS 'Stores user corrections to AI suggestions for learning and improvement';
COMMENT ON TABLE ai_parsing_sessions IS 'Tracks AI parsing sessions for analytics and performance monitoring';  
COMMENT ON TABLE ai_learning_patterns IS 'Stores learned patterns for improved AI suggestions';

COMMENT ON COLUMN user_ai_corrections.correction_type IS 'Type of correction made by user (category_change, amount_change, etc.)';
COMMENT ON COLUMN ai_parsing_sessions.success_rate IS 'Percentage of transactions parsed correctly in this session';
COMMENT ON COLUMN ai_learning_patterns.is_global IS 'Whether this pattern applies to all users or just specific user';