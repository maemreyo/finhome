-- FinHome Additional Seed Data
-- Bổ sung dữ liệu seed để thay thế mock data trong dashboard pages
-- Tạo ngày: $(date)

-- =============================================
-- DEMO USER CREATION
-- =============================================
-- Create a demo user to own the seeded data
-- This user will have a known email for easy lookup

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo@finhome.vn') THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            uuid_generate_v4(),
            'authenticated',
            'authenticated',
            'demo@finhome.vn',
            crypt('password123', gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Demo User"}'
        );
    END IF;
END $$;


-- =============================================
-- FAQ DATA (cho Help Page)
-- =============================================

CREATE TABLE IF NOT EXISTS faq_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    question_vi TEXT NOT NULL,
    answer TEXT NOT NULL,
    answer_vi TEXT NOT NULL,
    category TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO faq_items (question, question_vi, answer, answer_vi, category, sort_order) VALUES
-- Getting Started
('How do I create my first financial plan?', $$Làm thế nào để tạo kế hoạch tài chính đầu tiên?$$, 'Navigate to the Plans section and click "Create New Plan". Fill in your financial information and property goals.', $$Vào mục Kế hoạch và nhấn "Tạo kế hoạch mới". Điền thông tin tài chính và mục tiêu bất động sản của bạn.$$, 'getting_started', 1),
('What information do I need to get started?', $$Tôi cần thông tin gì để bắt đầu?$$, 'You need your monthly income, expenses, current savings, and target property price.', $$Bạn cần thu nhập hàng tháng, chi phí, tiết kiệm hiện tại và giá bất động sản mục tiêu.$$, 'getting_started', 2),
('Is my financial data secure?', $$Dữ liệu tài chính của tôi có an toàn không?$$, 'Yes, we use bank-level encryption and never share your personal financial information.', $$Có, chúng tôi sử dụng mã hóa cấp ngân hàng và không bao giờ chia sẻ thông tin tài chính cá nhân của bạn.$$, 'getting_started', 3),

-- Loan Calculator
('How accurate are the loan calculations?', $$Tính toán vay có chính xác không?$$, 'Our calculations use current bank rates and standard formulas. Always verify with your bank for final terms.', $$Tính toán của chúng tôi sử dụng lãi suất ngân hàng hiện tại và công thức chuẩn. Luôn xác minh với ngân hàng để có điều khoản cuối cùng.$$, 'calculator', 4),
('Can I compare different banks?', $$Tôi có thể so sánh các ngân hàng khác nhau không?$$, 'Yes, our platform includes rates from major Vietnamese banks updated regularly.', $$Có, nền tảng của chúng tôi bao gồm lãi suất từ các ngân hàng lớn của Việt Nam được cập nhật thường xuyên.$$, 'calculator', 5),
('What fees are included in calculations?', $$Những phí nào được bao gồm trong tính toán?$$, 'We include processing fees, insurance, and other standard costs. Check with your bank for complete fee structure.', $$Chúng tôi bao gồm phí xử lý, bảo hiểm và các chi phí tiêu chuẩn khác. Kiểm tra với ngân hàng để có cấu trúc phí đầy đủ.$$, 'calculator', 6),

-- Property Investment
('How do I track my property portfolio?', $$Làm thế nào để theo dõi danh mục bất động sản?$$, 'Use the Portfolio section to add properties and track their performance over time.', $$Sử dụng mục Danh mục để thêm bất động sản và theo dõi hiệu suất theo thời gian.$$, 'investment', 7),
('Can I get market insights for my area?', $$Tôi có thể nhận thông tin thị trường cho khu vực của mình không?$$, 'Yes, we provide market data for major Vietnamese cities including price trends and rental yields.', $$Có, chúng tôi cung cấp dữ liệu thị trường cho các thành phố lớn của Việt Nam bao gồm xu hướng giá và lợi nhuận cho thuê.$$, 'investment', 8),

-- Account & Billing
('How do I upgrade my account?', $$Làm thế nào để nâng cấp tài khoản?$$, 'Go to Settings > Billing to view and upgrade your subscription plan.', $$Vào Cài đặt > Thanh toán để xem và nâng cấp gói đăng ký của bạn.$$, 'account', 9),
('Can I cancel my subscription anytime?', $$Tôi có thể hủy đăng ký bất cứ lúc nào không?$$, 'Yes, you can cancel your subscription at any time. Your access continues until the end of the billing period.', $$Có, bạn có thể hủy đăng ký bất cứ lúc nào. Quyền truy cập của bạn tiếp tục cho đến cuối kỳ thanh toán.$$, 'account', 10);

-- =============================================
-- SUPPORT TICKETS DATA (cho Help Page)
-- =============================================

CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    ticket_number TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category TEXT NOT NULL,
    assigned_to TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Sample support tickets for demo
INSERT INTO support_tickets (user_id, ticket_number, subject, description, status, priority, category, created_at) VALUES
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), 'TICK-001', 'Loan calculation seems incorrect', 'The monthly payment calculation for my 2.5B VND loan shows different results than my bank quote.', 'resolved', 'medium', 'calculator', NOW() - INTERVAL '5 days'),
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), 'TICK-002', 'Cannot add property to portfolio', 'Getting an error when trying to add my property investment to the portfolio section.', 'in_progress', 'high', 'technical', NOW() - INTERVAL '2 days'),
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), 'TICK-003', 'Request for Ho Chi Minh District 8 market data', 'Could you please add market data for District 8 in Ho Chi Minh City?', 'open', 'low', 'feature_request', NOW() - INTERVAL '1 day');

-- =============================================
-- ANALYTICS METRICS DATA (cho Analytics Page)
-- =============================================

CREATE TABLE IF NOT EXISTS analytics_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_type TEXT NOT NULL, -- 'currency', 'percentage', 'count', 'ratio'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample analytics data
INSERT INTO analytics_metrics (user_id, metric_name, metric_value, metric_type, period_start, period_end) VALUES
-- Portfolio metrics (for demo user)
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), 'total_portfolio_value', 15800000000, 'currency', '2024-01-01', '2024-01-31'),
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), 'monthly_rental_income', 45000000, 'currency', '2024-01-01', '2024-01-31'),
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), 'portfolio_roi', 8.5, 'percentage', '2024-01-01', '2024-01-31'),
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), 'debt_to_income_ratio', 35.2, 'percentage', '2024-01-01', '2024-01-31'),
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), 'properties_count', 3, 'count', '2024-01-01', '2024-01-31'),
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), 'loan_savings', 125000000, 'currency', '2024-01-01', '2024-01-31'),

-- Market performance metrics
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), 'market_performance_hcm', 12.3, 'percentage', '2024-01-01', '2024-01-31'),
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), 'market_performance_hanoi', 8.7, 'percentage', '2024-01-01', '2024-01-31'),
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), 'market_performance_danang', 15.2, 'percentage', '2024-01-01', '2024-01-31'),

-- Financial health metrics
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), 'emergency_fund_ratio', 6.5, 'ratio', '2024-01-01', '2024-01-31'),
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), 'savings_rate', 22.8, 'percentage', '2024-01-01', '2024-01-31'),
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), 'investment_diversification', 75.0, 'percentage', '2024-01-01', '2024-01-31');

-- =============================================
-- SCENARIOS DATA (cho Scenarios Pages)
-- =============================================

CREATE TABLE IF NOT EXISTS financial_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    financial_plan_id UUID REFERENCES financial_plans(id) ON DELETE CASCADE,
    scenario_name TEXT NOT NULL,
    scenario_type TEXT NOT NULL CHECK (scenario_type IN ('baseline', 'optimistic', 'pessimistic', 'alternative', 'stress_test')),
    description TEXT,
    
    -- Scenario parameters
    property_price BIGINT NOT NULL,
    down_payment BIGINT NOT NULL,
    loan_amount BIGINT NOT NULL,
    interest_rate NUMERIC(5,3) NOT NULL,
    loan_term_months INTEGER NOT NULL,
    monthly_income BIGINT,
    monthly_expenses BIGINT,
    
    -- Calculated results
    monthly_payment BIGINT NOT NULL,
    total_interest BIGINT NOT NULL,
    total_cost BIGINT NOT NULL,
    debt_to_income_ratio NUMERIC(5,2),
    loan_to_value_ratio NUMERIC(5,2),
    
    -- Risk assessment
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    risk_factors JSONB DEFAULT '[]',
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample scenarios for demo
INSERT INTO financial_scenarios (
    user_id, scenario_name, scenario_type, description,
    property_price, down_payment, loan_amount, interest_rate, loan_term_months,
    monthly_income, monthly_expenses, monthly_payment, total_interest, total_cost,
    debt_to_income_ratio, loan_to_value_ratio, risk_level, risk_factors
) VALUES
-- Baseline scenario
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), $$Kế hoạch cơ bản$$, 'baseline', $$Kế hoạch mua nhà với điều kiện thị trường hiện tại và thu nhập ổn định$$,
3000000000, 600000000, 2400000000, 8.5, 240,
50000000, 30000000, 24500000, 2880000000, 5880000000,
49.0, 80.0, 'medium', $$["Lãi suất có thể tăng", "Thu nhập cần ổn định"]$$),

-- Optimistic scenario  
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), $$Kế hoạch lạc quan$$, 'optimistic', $$Kế hoạch với lãi suất ưu đãi và thu nhập tăng trưởng tốt$$,
3000000000, 600000000, 2400000000, 7.2, 240,
55000000, 30000000, 21200000, 2188000000, 5188000000,
38.5, 80.0, 'low', $$["Phụ thuộc vào lãi suất ưu đãi", "Cần duy trì thu nhập cao"]$$),

-- Pessimistic scenario
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), $$Kế hoạch thận trọng$$, 'pessimistic', $$Kế hoạch với lãi suất cao và thu nhập giảm$$,
3000000000, 600000000, 2400000000, 10.5, 240,
45000000, 30000000, 28100000, 3744000000, 6744000000,
62.4, 80.0, 'high', $$["Lãi suất cao", "Thu nhập thấp", "Áp lực tài chính lớn"]$$),

-- Alternative scenario
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), $$Kế hoạch thay thế$$, 'alternative', $$Kế hoạch với vay ngắn hạn và trả nhanh$$,
3000000000, 900000000, 2100000000, 8.0, 180,
50000000, 30000000, 25200000, 1440000000, 4440000000,
50.4, 70.0, 'medium', $$["Áp lực thanh toán hàng tháng cao", "Tiết kiệm lãi vay"]$$),

-- Stress test scenario
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), $$Kiểm tra căng thẳng$$, 'stress_test', $$Kế hoạch trong điều kiện khó khăn nhất$$,
3000000000, 450000000, 2550000000, 12.0, 240,
40000000, 35000000, 32500000, 5250000000, 7800000000,
81.3, 85.0, 'high', $$["Lãi suất rất cao", "Thu nhập thấp", "Chi phí cao", "Rủi ro vỡ nợ"]$$);

-- =============================================
-- LABORATORY PLANS DATA (cho Laboratory Page)
-- =============================================

-- Thêm sample financial plans cho laboratory
INSERT INTO financial_plans (
    user_id, plan_name, description, plan_type, status,
    monthly_income, monthly_expenses, current_savings, dependents,
    purchase_price, down_payment, additional_costs, other_debts,
    target_property_type, target_location, risk_tolerance,
    expected_roi, is_public, cached_calculations
) VALUES
-- Plan 1: Mua nhà đầu tiên
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), $$Mua nhà đầu tiên$$, $$Kế hoạch mua căn hộ đầu tiên tại TP.HCM$$, 'home_purchase', 'active',
45000000, 18000000, 600000000, 0,
2500000000, 500000000, 50000000, 0,
'apartment', $$Hồ Chí Minh$$, 'moderate',
8.5, false, '{"monthlyPayment": 20500000, "totalInterest": 2920000000, "debtToIncomeRatio": 45.6, "affordabilityScore": 8, "roi": 8.5}'),

-- Plan 2: Đầu tư căn hộ cho thuê
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), $$Đầu tư căn hộ cho thuê$$, $$Mua căn hộ để cho thuê tại Quận 7$$, 'investment', 'completed',
45000000, 18000000, 500000000, 0,
1800000000, 400000000, 30000000, 0,
'apartment', $$Hồ Chí Minh - Quận 7$$, 'moderate',
12.3, false, '{"monthlyPayment": 15200000, "totalInterest": 1848000000, "debtToIncomeRatio": 33.8, "affordabilityScore": 7, "roi": 12.3}'),

-- Plan 3: Nâng cấp nhà ở
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), $$Nâng cấp lên nhà phố$$, $$Bán căn hộ hiện tại để mua nhà phố$$, 'upgrade', 'draft',
55000000, 25000000, 800000000, 2,
4200000000, 1200000000, 80000000, 500000000,
'house', $$Hà Nội - Cầu Giấy$$, 'conservative',
6.8, false, '{"monthlyPayment": 28500000, "totalInterest": 3840000000, "debtToIncomeRatio": 51.8, "affordabilityScore": 6, "roi": 6.8}');

-- =============================================
-- NOTIFICATIONS DATA (mẫu cho dashboard)
-- =============================================

INSERT INTO notifications (
    user_id, type, title, message, action_url, icon, is_read, priority
) VALUES
-- Sample notifications for demo
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), 'info', $$Chào mừng đến với FinHome!$$, $$Cảm ơn bạn đã tham gia FinHome. Hãy bắt đầu bằng việc tạo kế hoạch tài chính đầu tiên.$$, '/dashboard/plans/new', '🎉', false, 8),
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), 'success', $$Kế hoạch đã được lưu$$, $$Kế hoạch "Mua nhà đầu tiên" đã được lưu thành công.$$, '/dashboard/plans', '✅', false, 5),
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), 'warning', $$Lãi suất ngân hàng thay đổi$$, $$Lãi suất vay mua nhà tại Vietcombank đã tăng 0.2%. Kiểm tra kế hoạch của bạn.$$, '/dashboard/scenarios', '⚠️', true, 7),
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), 'achievement', $$Thành tích mới!$$, $$Bạn đã mở khóa thành tích "Người lập kế hoạch tài chính". +100 điểm kinh nghiệm!$$, '/dashboard/achievements', '🏆', false, 6),
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), 'info', $$Báo cáo thị trường tháng 1$$, $$Báo cáo thị trường BĐS tháng 1/2024 đã có. Giá nhà tại TP.HCM tăng 2.3%.$$, '/dashboard/analytics', '📊', true, 4);

-- =============================================
-- USER EXPERIENCE SAMPLE DATA
-- =============================================

INSERT INTO user_experience (
    user_id, total_experience, current_level, experience_in_level, experience_to_next_level,
    plans_created, calculations_performed, properties_viewed, achievements_unlocked, days_active,
    current_login_streak, longest_login_streak, last_activity_date
) VALUES
-- Sample user experience for demo
((SELECT id FROM auth.users WHERE email = 'demo@finhome.vn'), 1250, 8, 150, 200, 5, 23, 47, 8, 15, 7, 12, CURRENT_DATE);

-- =============================================
-- SAMPLE USER ACHIEVEMENTS
-- =============================================

INSERT INTO user_achievements (user_id, achievement_id, unlocked_at, progress_data) 
SELECT 
    (SELECT id FROM auth.users WHERE email = 'demo@finhome.vn') as user_id,
    id as achievement_id,
    NOW() - (RANDOM() * INTERVAL '30 days') as unlocked_at,
    '{"progress": 100, "completed": true}' as progress_data
FROM achievements 
WHERE name IN ('First Login', 'Profile Complete', 'First Property View', 'First Calculation', 'Financial Planner')
LIMIT 5;

-- =============================================
-- MARKET INSIGHTS DATA (cho Dashboard)
-- =============================================

CREATE TABLE IF NOT EXISTS market_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    title_vi TEXT NOT NULL,
    content TEXT NOT NULL,
    content_vi TEXT NOT NULL,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('trend', 'forecast', 'analysis', 'news')),
    location TEXT,
    property_type property_type,
    impact_score INTEGER CHECK (impact_score BETWEEN 1 AND 10),
    is_featured BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO market_insights (title, title_vi, content, content_vi, insight_type, location, property_type, impact_score, is_featured) VALUES
('Ho Chi Minh City apartment prices rise 2.3%', 'Giá căn hộ TP.HCM tăng 2.3%', 'Apartment prices in Ho Chi Minh City increased by 2.3% in January 2024, driven by strong demand and limited supply.', 'Giá căn hộ tại TP.HCM tăng 2.3% trong tháng 1/2024, do nhu cầu mạnh và nguồn cung hạn chế.', 'trend', 'Hồ Chí Minh', 'apartment', 8, true),
('Bank interest rates expected to stabilize', 'Lãi suất ngân hàng dự kiến ổn định', 'Vietnamese banks are expected to maintain current interest rates through Q2 2024.', 'Các ngân hàng Việt Nam dự kiến duy trì lãi suất hiện tại đến hết Q2/2024.', 'forecast', NULL, NULL, 7, true),
('Hanoi villa market shows strong growth', 'Thị trường biệt thự Hà Nội tăng trưởng mạnh', 'Villa prices in Hanoi increased by 15% year-over-year, outperforming other property types.', 'Giá biệt thự tại Hà Nội tăng 15% so với cùng kỳ năm trước, vượt trội so với các loại BĐS khác.', 'analysis', 'Hà Nội', 'villa', 9, false);

-- =============================================
-- INDEXES FOR NEW TABLES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_faq_items_category ON faq_items(category, sort_order);
CREATE INDEX IF NOT EXISTS idx_faq_items_active ON faq_items(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_metrics_user_period ON analytics_metrics(user_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_name ON analytics_metrics(metric_name, period_end DESC);

CREATE INDEX IF NOT EXISTS idx_financial_scenarios_user ON financial_scenarios(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_financial_scenarios_type ON financial_scenarios(scenario_type, is_active);
CREATE INDEX IF NOT EXISTS idx_financial_scenarios_plan ON financial_scenarios(financial_plan_id);

CREATE INDEX IF NOT EXISTS idx_market_insights_featured ON market_insights(is_featured, published_at DESC) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_market_insights_location ON market_insights(location, property_type, published_at DESC);

-- =============================================
-- RLS POLICIES FOR NEW TABLES
-- =============================================

-- FAQ items are public
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "FAQ items are publicly readable" ON faq_items
    FOR SELECT USING (is_active = true);

-- Support tickets - users can only see their own
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own support tickets" ON support_tickets
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can create support tickets" ON support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analytics metrics - users can only see their own
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own analytics" ON analytics_metrics
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Financial scenarios - users can only see their own
ALTER TABLE financial_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own scenarios" ON financial_scenarios
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Market insights are public
ALTER TABLE market_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Market insights are publicly readable" ON market_insights
    FOR SELECT USING (published_at IS NOT NULL);

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Function to get user dashboard metrics
CREATE OR REPLACE FUNCTION get_user_dashboard_metrics(p_user_id UUID)
RETURNS TABLE (
    total_plans INTEGER,
    active_plans INTEGER,
    total_portfolio_value BIGINT,
    monthly_rental_income BIGINT,
    portfolio_roi NUMERIC,
    experience_points INTEGER,
    current_level INTEGER,
    unread_notifications INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM financial_plans WHERE user_id = p_user_id),
        (SELECT COUNT(*)::INTEGER FROM financial_plans WHERE user_id = p_user_id AND status = 'active'),
        COALESCE((SELECT SUM(current_value) FROM user_properties WHERE user_id = p_user_id AND is_active = true), 0),
        COALESCE((SELECT SUM(monthly_rental_income) FROM user_properties WHERE user_id = p_user_id AND is_active = true), 0),
        COALESCE((SELECT AVG((monthly_rental_income * 12 / purchase_price * 100)) FROM user_properties WHERE user_id = p_user_id AND is_active = true), 0),
        COALESCE((SELECT total_experience FROM user_experience WHERE user_id = p_user_id), 0),
        COALESCE((SELECT current_level FROM user_experience WHERE user_id = p_user_id), 1),
        (SELECT COUNT(*)::INTEGER FROM notifications WHERE user_id = p_user_id AND is_read = false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get market summary for dashboard
CREATE OR REPLACE FUNCTION get_dashboard_market_summary()
RETURNS TABLE (
    location TEXT,
    property_type property_type,
    avg_price_change NUMERIC,
    trend_direction TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pmd.city,
        pmd.property_type,
        pmd.price_change_yearly,
        CASE 
            WHEN pmd.price_change_yearly > 5 THEN 'strong_up'
            WHEN pmd.price_change_yearly > 0 THEN 'up'
            WHEN pmd.price_change_yearly < -5 THEN 'strong_down'
            WHEN pmd.price_change_yearly < 0 THEN 'down'
            ELSE 'stable'
        END as trend_direction
    FROM property_market_data pmd
    WHERE pmd.data_period = (SELECT MAX(data_period) FROM property_market_data)
    ORDER BY pmd.price_change_yearly DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE faq_items IS 'Frequently asked questions for help system';
COMMENT ON TABLE support_tickets IS 'User support ticket system';
COMMENT ON TABLE analytics_metrics IS 'User analytics and performance metrics';
COMMENT ON TABLE financial_scenarios IS 'Financial planning scenarios and what-if analysis';
COMMENT ON TABLE market_insights IS 'Market insights and analysis for dashboard';
COMMENT ON FUNCTION get_user_dashboard_metrics(UUID) IS 'Get comprehensive dashboard metrics for a user';
COMMENT ON FUNCTION get_dashboard_market_summary() IS 'Get market summary data for dashboard display';
