-- FinHome Seed Data Migration
-- Migration: 003_seed_data.sql

-- ==============================================
-- SEED DATA FOR INTEREST RATES
-- ==============================================

-- Insert sample banks and interest rates
INSERT INTO public.interest_rates (bank_name, bank_code, rate_type, loan_term_years, interest_rate, minimum_loan_amount, maximum_loan_amount, minimum_down_payment_percent, effective_date, special_conditions, source_url) VALUES
-- Vietcombank rates
('Vietcombank', 'VCB', 'promotional', 15, 7.5, 300000000, 30000000000, 30.0, '2025-01-01', ARRAY['First home buyers', 'Salary account required'], 'https://vietcombank.com.vn'),
('Vietcombank', 'VCB', 'promotional', 20, 7.8, 300000000, 30000000000, 30.0, '2025-01-01', ARRAY['First home buyers', 'Salary account required'], 'https://vietcombank.com.vn'),
('Vietcombank', 'VCB', 'promotional', 25, 8.0, 300000000, 30000000000, 30.0, '2025-01-01', ARRAY['First home buyers', 'Salary account required'], 'https://vietcombank.com.vn'),
('Vietcombank', 'VCB', 'standard', 15, 10.2, 300000000, 30000000000, 20.0, '2025-01-01', ARRAY[], 'https://vietcombank.com.vn'),
('Vietcombank', 'VCB', 'standard', 20, 10.5, 300000000, 30000000000, 20.0, '2025-01-01', ARRAY[], 'https://vietcombank.com.vn'),
('Vietcombank', 'VCB', 'standard', 25, 10.8, 300000000, 30000000000, 20.0, '2025-01-01', ARRAY[], 'https://vietcombank.com.vn'),

-- Techcombank rates
('Techcombank', 'TCB', 'promotional', 15, 7.8, 500000000, 50000000000, 30.0, '2025-01-01', ARRAY['Premium customer', 'Life insurance required'], 'https://techcombank.com.vn'),
('Techcombank', 'TCB', 'promotional', 20, 8.1, 500000000, 50000000000, 30.0, '2025-01-01', ARRAY['Premium customer', 'Life insurance required'], 'https://techcombank.com.vn'),
('Techcombank', 'TCB', 'promotional', 25, 8.3, 500000000, 50000000000, 30.0, '2025-01-01', ARRAY['Premium customer', 'Life insurance required'], 'https://techcombank.com.vn'),
('Techcombank', 'TCB', 'standard', 15, 10.5, 500000000, 50000000000, 20.0, '2025-01-01', ARRAY[], 'https://techcombank.com.vn'),
('Techcombank', 'TCB', 'standard', 20, 10.8, 500000000, 50000000000, 20.0, '2025-01-01', ARRAY[], 'https://techcombank.com.vn'),
('Techcombank', 'TCB', 'standard', 25, 11.1, 500000000, 50000000000, 20.0, '2025-01-01', ARRAY[], 'https://techcombank.com.vn'),

-- BIDV rates
('BIDV', 'BIDV', 'promotional', 15, 7.2, 200000000, 25000000000, 30.0, '2025-01-01', ARRAY['State employee discount', 'Payroll account'], 'https://bidv.com.vn'),
('BIDV', 'BIDV', 'promotional', 20, 7.5, 200000000, 25000000000, 30.0, '2025-01-01', ARRAY['State employee discount', 'Payroll account'], 'https://bidv.com.vn'),
('BIDV', 'BIDV', 'promotional', 25, 7.8, 200000000, 25000000000, 30.0, '2025-01-01', ARRAY['State employee discount', 'Payroll account'], 'https://bidv.com.vn'),
('BIDV', 'BIDV', 'standard', 15, 10.0, 200000000, 25000000000, 20.0, '2025-01-01', ARRAY[], 'https://bidv.com.vn'),
('BIDV', 'BIDV', 'standard', 20, 10.2, 200000000, 25000000000, 20.0, '2025-01-01', ARRAY[], 'https://bidv.com.vn'),
('BIDV', 'BIDV', 'standard', 25, 10.5, 200000000, 25000000000, 20.0, '2025-01-01', ARRAY[], 'https://bidv.com.vn'),

-- VietinBank rates
('VietinBank', 'CTG', 'promotional', 15, 7.6, 300000000, 30000000000, 30.0, '2025-01-01', ARRAY['First 24 months', 'Income verification'], 'https://vietinbank.vn'),
('VietinBank', 'CTG', 'promotional', 20, 7.9, 300000000, 30000000000, 30.0, '2025-01-01', ARRAY['First 24 months', 'Income verification'], 'https://vietinbank.vn'),
('VietinBank', 'CTG', 'promotional', 25, 8.2, 300000000, 30000000000, 30.0, '2025-01-01', ARRAY['First 24 months', 'Income verification'], 'https://vietinbank.vn'),
('VietinBank', 'CTG', 'standard', 15, 10.3, 300000000, 30000000000, 20.0, '2025-01-01', ARRAY[], 'https://vietinbank.vn'),
('VietinBank', 'CTG', 'standard', 20, 10.6, 300000000, 30000000000, 20.0, '2025-01-01', ARRAY[], 'https://vietinbank.vn'),
('VietinBank', 'CTG', 'standard', 25, 10.9, 300000000, 30000000000, 20.0, '2025-01-01', ARRAY[], 'https://vietinbank.vn'),

-- ACB rates
('ACB', 'ACB', 'promotional', 15, 7.9, 500000000, 20000000000, 30.0, '2025-01-01', ARRAY['High income customers', 'Property insurance'], 'https://acb.com.vn'),
('ACB', 'ACB', 'promotional', 20, 8.2, 500000000, 20000000000, 30.0, '2025-01-01', ARRAY['High income customers', 'Property insurance'], 'https://acb.com.vn'),
('ACB', 'ACB', 'promotional', 25, 8.5, 500000000, 20000000000, 30.0, '2025-01-01', ARRAY['High income customers', 'Property insurance'], 'https://acb.com.vn'),
('ACB', 'ACB', 'standard', 15, 10.7, 500000000, 20000000000, 20.0, '2025-01-01', ARRAY[], 'https://acb.com.vn'),
('ACB', 'ACB', 'standard', 20, 11.0, 500000000, 20000000000, 20.0, '2025-01-01', ARRAY[], 'https://acb.com.vn'),
('ACB', 'ACB', 'standard', 25, 11.3, 500000000, 20000000000, 20.0, '2025-01-01', ARRAY[], 'https://acb.com.vn'),

-- MB Bank rates
('MB Bank', 'MBB', 'promotional', 15, 8.0, 300000000, 15000000000, 30.0, '2025-01-01', ARRAY['Online application discount'], 'https://mbbank.com.vn'),
('MB Bank', 'MBB', 'promotional', 20, 8.3, 300000000, 15000000000, 30.0, '2025-01-01', ARRAY['Online application discount'], 'https://mbbank.com.vn'),
('MB Bank', 'MBB', 'promotional', 25, 8.6, 300000000, 15000000000, 30.0, '2025-01-01', ARRAY['Online application discount'], 'https://mbbank.com.vn'),
('MB Bank', 'MBB', 'standard', 15, 10.8, 300000000, 15000000000, 20.0, '2025-01-01', ARRAY[], 'https://mbbank.com.vn'),
('MB Bank', 'MBB', 'standard', 20, 11.1, 300000000, 15000000000, 20.0, '2025-01-01', ARRAY[], 'https://mbbank.com.vn'),
('MB Bank', 'MBB', 'standard', 25, 11.4, 300000000, 15000000000, 20.0, '2025-01-01', ARRAY[], 'https://mbbank.com.vn')

ON CONFLICT DO NOTHING;

-- ==============================================
-- SEED DATA FOR PROPERTY MARKET DATA
-- ==============================================

-- Insert sample property market data for major cities
INSERT INTO public.property_market_data (city, district, property_type, average_price_per_sqm, median_price_per_sqm, price_change_monthly, price_change_yearly, average_rental_yield, average_rent_per_sqm, occupancy_rate, properties_sold, properties_listed, days_on_market, data_period, data_source, reliability_score) VALUES

-- Ho Chi Minh City - District 1
('Ho Chi Minh City', 'District 1', 'apartment', 120000000, 115000000, 0.5, 8.2, 4.2, 450000, 92.5, 45, 120, 65, '2025-01-01', 'batdongsan.com.vn', 9),
('Ho Chi Minh City', 'District 1', 'house', 150000000, 145000000, 0.3, 6.8, 3.8, 380000, 88.0, 12, 35, 85, '2025-01-01', 'batdongsan.com.vn', 8),
('Ho Chi Minh City', 'District 1', 'commercial', 200000000, 195000000, 0.8, 12.5, 6.5, 800000, 95.0, 8, 25, 45, '2025-01-01', 'batdongsan.com.vn', 9),

-- Ho Chi Minh City - District 2 (Thu Duc)
('Ho Chi Minh City', 'District 2', 'apartment', 85000000, 82000000, 1.2, 15.3, 5.8, 380000, 94.2, 78, 180, 42, '2025-01-01', 'batdongsan.com.vn', 9),
('Ho Chi Minh City', 'District 2', 'house', 95000000, 92000000, 1.0, 12.8, 5.2, 320000, 91.5, 35, 85, 55, '2025-01-01', 'batdongsan.com.vn', 8),
('Ho Chi Minh City', 'District 2', 'villa', 110000000, 108000000, 0.9, 11.2, 4.5, 280000, 87.0, 15, 40, 75, '2025-01-01', 'batdongsan.com.vn', 8),

-- Ho Chi Minh City - District 7
('Ho Chi Minh City', 'District 7', 'apartment', 95000000, 93000000, 0.8, 10.5, 5.0, 420000, 93.8, 65, 145, 38, '2025-01-01', 'batdongsan.com.vn', 9),
('Ho Chi Minh City', 'District 7', 'house', 105000000, 102000000, 0.7, 9.2, 4.8, 350000, 90.2, 28, 70, 62, '2025-01-01', 'batdongsan.com.vn', 8),
('Ho Chi Minh City', 'District 7', 'villa', 125000000, 122000000, 0.6, 8.8, 4.2, 300000, 85.5, 18, 45, 88, '2025-01-01', 'batdongsan.com.vn', 8),

-- Ho Chi Minh City - Binh Thanh
('Ho Chi Minh City', 'Binh Thanh', 'apartment', 78000000, 75000000, 1.0, 12.8, 5.5, 350000, 92.0, 88, 200, 35, '2025-01-01', 'batdongsan.com.vn', 9),
('Ho Chi Minh City', 'Binh Thanh', 'house', 85000000, 82000000, 0.9, 11.5, 5.2, 290000, 89.8, 42, 95, 48, '2025-01-01', 'batdongsan.com.vn', 8),

-- Hanoi - Ba Dinh
('Hanoi', 'Ba Dinh', 'apartment', 110000000, 108000000, 0.4, 7.2, 4.0, 400000, 90.5, 35, 95, 78, '2025-01-01', 'batdongsan.com.vn', 9),
('Hanoi', 'Ba Dinh', 'house', 130000000, 128000000, 0.2, 5.8, 3.5, 320000, 86.2, 15, 42, 95, '2025-01-01', 'batdongsan.com.vn', 8),

-- Hanoi - Cau Giay
('Hanoi', 'Cau Giay', 'apartment', 90000000, 88000000, 0.8, 9.5, 4.8, 380000, 92.8, 55, 130, 52, '2025-01-01', 'batdongsan.com.vn', 9),
('Hanoi', 'Cau Giay', 'house', 98000000, 96000000, 0.6, 8.2, 4.5, 310000, 89.5, 25, 68, 68, '2025-01-01', 'batdongsan.com.vn', 8),

-- Hanoi - Dong Da
('Hanoi', 'Dong Da', 'apartment', 88000000, 86000000, 0.7, 8.8, 4.6, 370000, 91.2, 48, 115, 58, '2025-01-01', 'batdongsan.com.vn', 9),
('Hanoi', 'Dong Da', 'house', 95000000, 93000000, 0.5, 7.5, 4.2, 300000, 88.8, 22, 58, 72, '2025-01-01', 'batdongsan.com.vn', 8),

-- Da Nang - Hai Chau
('Da Nang', 'Hai Chau', 'apartment', 65000000, 63000000, 1.5, 18.2, 6.2, 320000, 95.5, 42, 85, 28, '2025-01-01', 'batdongsan.com.vn', 8),
('Da Nang', 'Hai Chau', 'house', 72000000, 70000000, 1.2, 15.8, 5.8, 280000, 92.2, 18, 45, 38, '2025-01-01', 'batdongsan.com.vn', 8),

-- Da Nang - Son Tra
('Da Nang', 'Son Tra', 'apartment', 58000000, 56000000, 1.8, 22.5, 6.8, 300000, 96.8, 35, 75, 25, '2025-01-01', 'batdongsan.com.vn', 8),
('Da Nang', 'Son Tra', 'villa', 85000000, 82000000, 1.0, 12.8, 5.2, 250000, 88.5, 12, 28, 55, '2025-01-01', 'batdongsan.com.vn', 7)

ON CONFLICT DO NOTHING;

-- ==============================================
-- SAMPLE PROPERTIES DATA
-- ==============================================

-- Insert some sample properties for testing
INSERT INTO public.properties (property_name, property_type, address, district, city, ward, area_sqm, bedrooms, bathrooms, floor_number, total_floors, listed_price, market_value_estimate, price_per_sqm, amenities, legal_status, ownership_type, neighborhood_data) VALUES

('Vinhomes Central Park - Landmark 1', 'apartment', '208 Nguyen Huu Canh, Ward 22', 'Binh Thanh', 'Ho Chi Minh City', 'Ward 22', 85.5, 2, 2, 15, 45, 
 7650000000, 7800000000, 89473684, 
 ARRAY['Swimming pool', 'Gym', 'Playground', 'Security 24/7', 'Parking'], 
 'red_book', 'individual',
 '{"schools": ["International School", "FPT University"], "hospitals": ["Cho Ray Hospital"], "transport": ["Metro Line 1", "Bus routes"], "shopping": ["Vincom Center"], "distance_to_center": 3.5}'::jsonb),

('Masteri Thao Dien T3', 'apartment', '159 Xa Lo Ha Noi, Thao Dien Ward', 'District 2', 'Ho Chi Minh City', 'Thao Dien', 92.3, 3, 2, 8, 35,
 8280000000, 8500000000, 89706174,
 ARRAY['River view', 'Swimming pool', 'Gym', 'BBQ area', 'Parking'],
 'red_book', 'individual',
 '{"schools": ["British International School", "Australian International School"], "hospitals": ["Family Medical Practice"], "transport": ["Metro Line 1 planned"], "shopping": ["The Manor shopping center"], "distance_to_center": 8.2}'::jsonb),

('Eco Green Saigon', 'apartment', '286 Nguyen Xien, Long Thanh My Ward', 'District 9', 'Ho Chi Minh City', 'Long Thanh My', 76.8, 2, 2, 12, 30,
 3840000000, 3950000000, 50000000,
 ARRAY['Green space', 'Swimming pool', 'Gym', 'Playground', 'Smart home'],
 'pink_book', 'individual',
 '{"schools": ["Vietnam National University"], "hospitals": ["Duc Duc Hospital"], "transport": ["Bus routes"], "shopping": ["Vincom Plaza"], "distance_to_center": 15.8}'::jsonb),

('Times City Park Hill', 'apartment', '458 Minh Khai, Vinh Tuy Ward', 'Hai Ba Trung', 'Hanoi', 'Vinh Tuy', 88.2, 3, 2, 18, 40,
 4500000000, 4650000000, 51020408,
 ARRAY['Swimming pool', 'Gym', 'Shopping mall', 'Cinema', 'Parking'],
 'red_book', 'individual',
 '{"schools": ["Foreign Trade University"], "hospitals": ["Bach Mai Hospital"], "transport": ["Bus routes", "Ring Road 3"], "shopping": ["Times City Mall"], "distance_to_center": 6.5}'::jsonb),

('Royal City R1', 'apartment', '72A Nguyen Trai, Thanh Xuan Trung', 'Thanh Xuan', 'Hanoi', 'Thanh Xuan Trung', 95.5, 3, 2, 22, 55,
 5250000000, 5400000000, 54974870,
 ARRAY['Swimming pool', 'Golf course', 'Shopping mall', 'International school', 'Parking'],
 'red_book', 'individual',
 '{"schools": ["Royal School", "Hanoi International School"], "hospitals": ["Royal City Medical Center"], "transport": ["Metro Line 3 planned"], "shopping": ["Royal City Megamall"], "distance_to_center": 8.2}'::jsonb)

ON CONFLICT DO NOTHING;

-- ==============================================
-- ACHIEVEMENT BADGES DATA
-- ==============================================

-- Create some sample achievement data that can be used for gamification
-- This would typically be handled by application logic, but having reference data is useful

-- Insert into a simple reference table for achievements (if we want to track them)
-- For now, we'll just document the achievement system in comments

/*
Achievement System Reference:
- 🎯 "Người Lập Kế Hoạch Cẩn Trọng" (First plan created)
- 🔬 "Bậc Thầy Tối Ưu" (Saved >100tr through optimization)  
- 🏆 "Nhà Đầu Tư Thông Thái" (Positive rental cash flow)
- ⚡ "Kẻ Hủy Diệt Nợ" (Simulated early payoff <5 years)
- 📊 "Chuyên Gia Phân Tích" (Created 5+ scenarios)
- 🎓 "Cố Vấn Cộng Đồng" (Helped 10+ people in community)
- 💎 "Khách Hàng VIP" (Premium subscription)
- 🚀 "Người Tiên Phong" (Beta user)
*/

-- ==============================================
-- DEMO USER PROFILE (for testing)
-- ==============================================

-- Note: This would typically be created through the application
-- We'll create this via a function that can be called after user signup

CREATE OR REPLACE FUNCTION create_demo_user_profile(
  p_user_id UUID,
  p_email TEXT DEFAULT 'demo@finhome.vn',
  p_full_name TEXT DEFAULT 'Nguyễn Văn Demo'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    full_name,
    phone_number,
    occupation,
    company_name,
    annual_income,
    monthly_expenses,
    current_assets,
    current_debts,
    subscription_tier,
    onboarding_completed,
    experience_points,
    achievement_badges,
    location
  ) VALUES (
    p_user_id,
    p_full_name,
    '+84901234567',
    'Software Engineer',
    'FPT Software',
    600000000, -- 600M VND/year
    15000000,  -- 15M VND/month expenses
    200000000, -- 200M VND assets
    50000000,  -- 50M VND debts
    'free',
    true,
    150,
    ARRAY['🎯 Người Lập Kế Hoạch Cẩn Trọng', '🚀 Người Tiên Phong'],
    '{"city": "Ho Chi Minh City", "district": "District 7", "ward": "Tan Phong"}'::jsonb
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone_number = EXCLUDED.phone_number,
    occupation = EXCLUDED.occupation,
    company_name = EXCLUDED.company_name,
    annual_income = EXCLUDED.annual_income,
    monthly_expenses = EXCLUDED.monthly_expenses,
    current_assets = EXCLUDED.current_assets,
    current_debts = EXCLUDED.current_debts,
    onboarding_completed = EXCLUDED.onboarding_completed,
    experience_points = EXCLUDED.experience_points,
    achievement_badges = EXCLUDED.achievement_badges,
    location = EXCLUDED.location,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- UTILITY FUNCTIONS FOR TESTING
-- ==============================================

-- Function to get current market rates for a specific loan term
CREATE OR REPLACE FUNCTION get_current_rates(p_loan_term_years INTEGER DEFAULT 20)
RETURNS TABLE (
  bank_name TEXT,
  promotional_rate NUMERIC,
  standard_rate NUMERIC,
  min_down_payment NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ir_promo.bank_name,
    ir_promo.interest_rate as promotional_rate,
    ir_standard.interest_rate as standard_rate,
    ir_promo.minimum_down_payment_percent as min_down_payment
  FROM public.interest_rates ir_promo
  JOIN public.interest_rates ir_standard 
    ON ir_promo.bank_name = ir_standard.bank_name 
    AND ir_promo.loan_term_years = ir_standard.loan_term_years
  WHERE ir_promo.rate_type = 'promotional'
    AND ir_standard.rate_type = 'standard'
    AND ir_promo.loan_term_years = p_loan_term_years
    AND ir_promo.is_current = true
    AND ir_standard.is_current = true
  ORDER BY ir_promo.interest_rate ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get property market summary for a location
CREATE OR REPLACE FUNCTION get_market_summary(p_city TEXT, p_district TEXT DEFAULT NULL)
RETURNS TABLE (
  property_type property_type_enum,
  avg_price_sqm BIGINT,
  rental_yield NUMERIC,
  price_change_yearly NUMERIC,
  market_activity TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pmd.property_type,
    pmd.average_price_per_sqm,
    pmd.average_rental_yield,
    pmd.price_change_yearly,
    CASE 
      WHEN pmd.days_on_market < 30 THEN 'Hot market'
      WHEN pmd.days_on_market < 60 THEN 'Active market'
      WHEN pmd.days_on_market < 90 THEN 'Stable market'
      ELSE 'Slow market'
    END as market_activity
  FROM public.property_market_data pmd
  WHERE pmd.city = p_city
    AND (p_district IS NULL OR pmd.district = p_district)
    AND pmd.data_period = (SELECT MAX(data_period) FROM public.property_market_data WHERE city = p_city)
  ORDER BY pmd.property_type;
END;
$$ LANGUAGE plpgsql;