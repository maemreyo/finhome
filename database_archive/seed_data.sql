-- FinHome Seed Data
-- Initial data for development and production environments

-- =============================================
-- VIETNAMESE BANKS DATA
-- =============================================

INSERT INTO banks (bank_code, bank_name, bank_name_en, logo_url, website_url, hotline, email, headquarters_address, is_active, is_featured) VALUES
('VCB', 'Ngân hàng TMCP Ngoại thương Việt Nam', 'Vietcombank', 'https://logos.vn/logo-vietcombank.png', 'https://www.vietcombank.com.vn', '1900 545 413', 'info@vietcombank.com.vn', '198 Trần Quang Khải, Hoàn Kiếm, Hà Nội', true, true),
('BIDV', 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', 'BIDV', 'https://logos.vn/logo-bidv.png', 'https://www.bidv.com.vn', '1900 9247', 'info@bidv.com.vn', '35 Hàng Vôi, Hoàn Kiếm, Hà Nội', true, true),
('AGRI', 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam', 'Agribank', 'https://logos.vn/logo-agribank.png', 'https://www.agribank.com.vn', '1900 558 818', 'info@agribank.com.vn', '2 Láng Hạ, Ba Đình, Hà Nội', true, true),
('TCB', 'Ngân hàng TMCP Kỹ thương Việt Nam', 'Techcombank', 'https://logos.vn/logo-techcombank.png', 'https://www.techcombank.com.vn', '1800 588 822', 'customercare@techcombank.com.vn', '191 Ba Tháng Hai, Quận 3, TP.HCM', true, true),
('VPB', 'Ngân hàng TMCP Việt Nam Thịnh Vượng', 'VPBank', 'https://logos.vn/logo-vpbank.png', 'https://www.vpbank.com.vn', '1900 545 415', 'info@vpbank.com.vn', '89 Láng Hạ, Ba Đình, Hà Nội', true, true),
('ACB', 'Ngân hàng TMCP Á Châu', 'ACB', 'https://logos.vn/logo-acb.png', 'https://www.acb.com.vn', '1900 545 416', 'customercare@acb.com.vn', '442 Nguyễn Thị Minh Khai, Quận 3, TP.HCM', true, true),
('VIB', 'Ngân hàng TMCP Quốc tế Việt Nam', 'VIB', 'https://logos.vn/logo-vib.png', 'https://www.vib.com.vn', '1900 545 421', 'info@vib.com.vn', '198 Trần Quang Khải, Hoàn Kiếm, Hà Nội', true, false),
('MB', 'Ngân hàng TMCP Quân đội', 'MBBank', 'https://logos.vn/logo-mbbank.png', 'https://www.mbbank.com.vn', '1900 545 422', 'info@mbbank.com.vn', '108 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội', true, false),
('STB', 'Ngân hàng TMCP Sài Gòn Thương Tín', 'Sacombank', 'https://logos.vn/logo-sacombank.png', 'https://www.sacombank.com.vn', '1900 545 425', 'info@sacombank.com.vn', '266-268 Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM', true, false),
('EIB', 'Ngân hàng TMCP Xuất Nhập khẩu Việt Nam', 'Eximbank', 'https://logos.vn/logo-eximbank.png', 'https://www.eximbank.com.vn', '1900 545 429', 'info@eximbank.com.vn', '8 Tôn Thất Đạm, Nguyễn Thai Bình, Quận 1, TP.HCM', true, false);

-- =============================================
-- BANK INTEREST RATES DATA
-- =============================================

INSERT INTO bank_interest_rates (
    bank_id, product_name, loan_type, interest_rate, min_rate, max_rate,
    min_loan_amount, max_loan_amount, max_ltv_ratio, min_term_months, max_term_months,
    min_income, processing_fee_percentage, early_payment_fee,
    effective_date, is_active
) VALUES
-- Vietcombank rates
((SELECT id FROM banks WHERE bank_code = 'VCB'), 'Vay mua nhà ưu đãi', 'home_loan', 8.2, 7.8, 9.5, 100000000, 50000000000, 80, 60, 300, 15000000, 1.0, 2.0, '2024-01-01', true),
((SELECT id FROM banks WHERE bank_code = 'VCB'), 'Vay mua nhà thường', 'home_loan', 8.8, 8.5, 10.0, 50000000, 30000000000, 70, 60, 240, 10000000, 1.0, 2.0, '2024-01-01', true),
((SELECT id FROM banks WHERE bank_code = 'VCB'), 'Vay đầu tư BĐS', 'investment_loan', 9.5, 9.0, 11.0, 200000000, 100000000000, 70, 60, 180, 25000000, 1.5, 3.0, '2024-01-01', true),

-- BIDV rates
((SELECT id FROM banks WHERE bank_code = 'BIDV'), 'Vay mua nhà ưu đãi', 'home_loan', 7.8, 7.5, 9.2, 100000000, 40000000000, 85, 60, 300, 12000000, 0.8, 1.5, '2024-01-01', true),
((SELECT id FROM banks WHERE bank_code = 'BIDV'), 'Vay mua nhà thường', 'home_loan', 8.5, 8.2, 9.8, 50000000, 25000000000, 75, 60, 240, 8000000, 0.8, 1.5, '2024-01-01', true),
((SELECT id FROM banks WHERE bank_code = 'BIDV'), 'Vay đầu tư BĐS', 'investment_loan', 9.2, 8.8, 10.8, 150000000, 80000000000, 70, 60, 180, 20000000, 1.2, 2.5, '2024-01-01', true),

-- Agribank rates
((SELECT id FROM banks WHERE bank_code = 'AGRI'), 'Vay mua nhà ưu đãi', 'home_loan', 8.0, 7.7, 9.3, 80000000, 35000000000, 80, 60, 300, 10000000, 0.9, 1.8, '2024-01-01', true),
((SELECT id FROM banks WHERE bank_code = 'AGRI'), 'Vay mua nhà thường', 'home_loan', 8.6, 8.3, 9.9, 50000000, 20000000000, 75, 60, 240, 8000000, 0.9, 1.8, '2024-01-01', true),
((SELECT id FROM banks WHERE bank_code = 'AGRI'), 'Vay đầu tư BĐS', 'investment_loan', 9.3, 8.9, 10.9, 100000000, 60000000000, 65, 60, 180, 18000000, 1.3, 2.8, '2024-01-01', true),

-- Techcombank rates
((SELECT id FROM banks WHERE bank_code = 'TCB'), 'Vay mua nhà ưu đãi', 'home_loan', 7.5, 7.2, 8.8, 150000000, 60000000000, 85, 60, 360, 20000000, 1.2, 2.0, '2024-01-01', true),
((SELECT id FROM banks WHERE bank_code = 'TCB'), 'Vay mua nhà thường', 'home_loan', 8.3, 8.0, 9.5, 100000000, 40000000000, 80, 60, 300, 15000000, 1.2, 2.0, '2024-01-01', true),
((SELECT id FROM banks WHERE bank_code = 'TCB'), 'Vay đầu tư BĐS', 'investment_loan', 9.0, 8.6, 10.5, 200000000, 120000000000, 75, 60, 240, 30000000, 1.5, 2.5, '2024-01-01', true),

-- VPBank rates
((SELECT id FROM banks WHERE bank_code = 'VPB'), 'Vay mua nhà ưu đãi', 'home_loan', 8.3, 7.9, 9.6, 100000000, 45000000000, 80, 60, 300, 12000000, 1.1, 2.2, '2024-01-01', true),
((SELECT id FROM banks WHERE bank_code = 'VPB'), 'Vay mua nhà thường', 'home_loan', 8.9, 8.6, 10.2, 50000000, 30000000000, 75, 60, 240, 10000000, 1.1, 2.2, '2024-01-01', true),
((SELECT id FROM banks WHERE bank_code = 'VPB'), 'Vay đầu tư BĐS', 'investment_loan', 9.6, 9.2, 11.2, 150000000, 90000000000, 70, 60, 180, 25000000, 1.4, 3.0, '2024-01-01', true),

-- ACB rates
((SELECT id FROM banks WHERE bank_code = 'ACB'), 'Vay mua nhà ưu đãi', 'home_loan', 7.9, 7.6, 9.1, 100000000, 50000000000, 85, 60, 300, 15000000, 1.0, 1.8, '2024-01-01', true),
((SELECT id FROM banks WHERE bank_code = 'ACB'), 'Vay mua nhà thường', 'home_loan', 8.6, 8.3, 9.8, 80000000, 35000000000, 80, 60, 240, 12000000, 1.0, 1.8, '2024-01-01', true),
((SELECT id FROM banks WHERE bank_code = 'ACB'), 'Vay đầu tư BĐS', 'investment_loan', 9.3, 8.9, 10.8, 180000000, 100000000000, 70, 60, 200, 28000000, 1.3, 2.8, '2024-01-01', true);

-- =============================================
-- ACHIEVEMENT DEFINITIONS
-- =============================================

INSERT INTO achievements (
    name, name_vi, description, description_vi, achievement_type, 
    required_actions, required_value, experience_points, badge_icon, badge_color, sort_order
) VALUES
-- Getting Started Achievements
('First Login', 'Người Mới Bắt Đầu', 'Complete your first login to FinHome', 'Hoàn thành đăng nhập đầu tiên vào FinHome', 'milestone', '{"action": "login", "count": 1}', 1, 25, '🎯', '#3B82F6', 1),
('Profile Complete', 'Hồ Sơ Hoàn Chỉnh', 'Complete your user profile with all required information', 'Hoàn thành hồ sơ cá nhân với đầy đủ thông tin', 'milestone', '{"action": "profile_complete"}', 1, 50, '👤', '#10B981', 2),
('First Property View', 'Người Khám Phá', 'View your first property listing', 'Xem danh sách bất động sản đầu tiên', 'usage', '{"action": "property_view", "count": 1}', 1, 15, '🏠', '#F59E0B', 3),

-- Financial Planning Achievements
('First Calculation', 'Máy Tính Tài Chính', 'Perform your first loan calculation', 'Thực hiện tính toán vay đầu tiên', 'financial', '{"action": "loan_calculation", "count": 1}', 1, 30, '🧮', '#8B5CF6', 10),
('Financial Planner', 'Người Lập Kế Hoạch', 'Create your first financial plan', 'Tạo kế hoạch tài chính đầu tiên', 'financial', '{"action": "financial_plan", "count": 1}', 1, 100, '📊', '#EF4444', 11),
('Smart Investor', 'Nhà Đầu Tư Thông Minh', 'Add your first property to investment portfolio', 'Thêm bất động sản đầu tiên vào danh mục đầu tư', 'financial', '{"action": "property_investment", "count": 1}', 1, 150, '💎', '#06B6D4', 12),

-- Usage Achievements
('Property Explorer', 'Người Khám Phá BĐS', 'View 10 different properties', 'Xem 10 bất động sản khác nhau', 'usage', '{"action": "property_view", "count": 10}', 10, 50, '🔍', '#84CC16', 20),
('Calculation Master', 'Bậc Thầy Tính Toán', 'Perform 25 loan calculations', 'Thực hiện 25 phép tính vay', 'usage', '{"action": "loan_calculation", "count": 25}', 25, 200, '🎯', '#F97316', 21),
('Portfolio Builder', 'Người Xây Dựng Danh Mục', 'Add 5 properties to your portfolio', 'Thêm 5 bất động sản vào danh mục', 'usage', '{"action": "property_investment", "count": 5}', 5, 300, '🏗️', '#DC2626', 22),

-- Experience Level Achievements
('Level 5 Achiever', 'Đạt Cấp 5', 'Reach experience level 5', 'Đạt cấp kinh nghiệm 5', 'milestone', '{"action": "level_reached", "level": 5}', 5, 250, '⭐', '#FBBF24', 30),
('Level 10 Expert', 'Chuyên Gia Cấp 10', 'Reach experience level 10', 'Đạt cấp kinh nghiệm 10', 'milestone', '{"action": "level_reached", "level": 10}', 10, 500, '🌟', '#A855F7', 31),
('Level 20 Master', 'Bậc Thầy Cấp 20', 'Reach experience level 20', 'Đạt cấp kinh nghiệm 20', 'milestone', '{"action": "level_reached", "level": 20}', 20, 1000, '💫', '#EC4899', 32),

-- Social Achievements
('Helpful Community Member', 'Cộng Đồng Thân Thiện', 'Help other users by sharing financial plans', 'Giúp đỡ người dùng khác bằng cách chia sẻ kế hoạch tài chính', 'social', '{"action": "plan_share", "count": 3}', 3, 200, '🤝', '#14B8A6', 40),
('Knowledge Sharer', 'Người Chia Sẻ Kiến Thức', 'Share 10 property insights or tips', 'Chia sẻ 10 thông tin hoặc mẹo về bất động sản', 'social', '{"action": "insight_share", "count": 10}', 10, 400, '📚', '#6366F1', 41),

-- Special Achievements
('Early Adopter', 'Người Dùng Tiên Phong', 'Join FinHome in the first month', 'Tham gia FinHome trong tháng đầu tiên', 'milestone', '{"action": "early_signup"}', 1, 500, '🚀', '#7C3AED', 50),
('Savings Guru', 'Guru Tiết Kiệm', 'Complete a financial plan that saves 20% on loans', 'Hoàn thành kế hoạch tài chính tiết kiệm 20% lãi vay', 'financial', '{"action": "savings_achieved", "percentage": 20}', 20, 750, '💰', '#059669', 51),
('ROI Champion', 'Nhà Vô Địch ROI', 'Achieve 15%+ ROI on property investments', 'Đạt ROI 15%+ từ đầu tư bất động sản', 'financial', '{"action": "roi_achieved", "percentage": 15}', 15, 1000, '🏆', '#DC2626', 52);

-- =============================================
-- APP SETTINGS DATA
-- =============================================

INSERT INTO app_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
-- Public settings
('app_version', '"1.0.0"', 'string', 'Current application version', true),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', true),
('registration_enabled', 'true', 'boolean', 'Allow new user registrations', true),
('contact_email', '"support@finhome.vn"', 'string', 'Support contact email', true),
('contact_phone', '"1900 123 456"', 'string', 'Support hotline number', true),

-- Feature flags
('property_search_enabled', 'true', 'boolean', 'Enable property search feature', true),
('loan_calculator_enabled', 'true', 'boolean', 'Enable loan calculator feature', true),
('portfolio_tracking_enabled', 'true', 'boolean', 'Enable portfolio tracking feature', true),
('achievements_enabled', 'true', 'boolean', 'Enable achievement system', true),
('notifications_enabled', 'true', 'boolean', 'Enable notification system', true),

-- Business settings
('max_properties_per_user', '50', 'number', 'Maximum properties per user portfolio', false),
('max_financial_plans_per_user', '10', 'number', 'Maximum financial plans per user', false),
('bank_rate_update_frequency', '24', 'number', 'Hours between bank rate updates', false),
('property_data_retention_days', '365', 'number', 'Days to retain property data', false),

-- Email settings
('email_notifications_enabled', 'true', 'boolean', 'Enable email notifications', false),
('welcome_email_enabled', 'true', 'boolean', 'Send welcome email to new users', false),
('achievement_email_enabled', 'true', 'boolean', 'Send emails for achievements', false),

-- Analytics settings
('analytics_enabled', 'true', 'boolean', 'Enable user analytics tracking', false),
('error_reporting_enabled', 'true', 'boolean', 'Enable error reporting', false),
('performance_monitoring_enabled', 'true', 'boolean', 'Enable performance monitoring', false);

-- =============================================
-- SAMPLE PROPERTIES DATA (for development)
-- =============================================

INSERT INTO properties (
    title, description, property_type, status, province, district, ward, street_address,
    latitude, longitude, total_area, usable_area, bedrooms, bathrooms, floors, year_built,
    list_price, price_per_sqm, legal_status, ownership_type, 
    images, features, amenities, slug, tags, is_featured, published_at
) VALUES
-- Ho Chi Minh City Properties
('Căn hộ cao cấp Vinhomes Central Park', 'Căn hộ 2 phòng ngủ tại tòa Landmark, view sông Sài Gòn tuyệt đẹp', 'apartment', 'for_sale', 'Hồ Chí Minh', 'Bình Thạnh', 'Phường 22', '208 Nguyễn Hữu Cảnh', 10.7943, 106.7220, 78.5, 68.2, 2, 2, 1, 2019, 6800000000, 86624523, 'red_book', 'individual', 
'["https://example.com/vinhomes1.jpg", "https://example.com/vinhomes2.jpg"]', 
'["Căn góc", "View sông", "Nội thất cao cấp"]', 
'["Hồ bơi", "Phòng gym", "Khu vui chơi trẻ em", "An ninh 24/7"]', 
'can-ho-vinhomes-central-park-landmark', 
ARRAY['căn hộ', 'vinhomes', 'cao cấp', 'view sông'], true, NOW()),

('Nhà phố Thảo Điền', 'Nhà phố 1 trệt 2 lầu khu Thảo Điền, đường 8m, gần trường quốc tế', 'house', 'for_sale', 'Hồ Chí Minh', 'Thủ Đức', 'Phường Thảo Điền', 'Đường 12A, Khu dân cư Văn Minh', 10.8008, 106.7442, 120.0, 300.0, 4, 3, 3, 2020, 12500000000, 41666667, 'red_book', 'individual',
'["https://example.com/thaodien1.jpg", "https://example.com/thaodien2.jpg"]',
'["Mặt tiền", "Hướng Đông Nam", "Garage ô tô"]',
'["Gần trường quốc tế", "Khu an ninh", "Gần siêu thị"]',
'nha-pho-thao-dien-thu-duc', 
ARRAY['nhà phố', 'thảo điền', 'thủ đức', 'mặt tiền'], true, NOW()),

-- Hanoi Properties  
('Chung cư Times City', 'Căn hộ 3PN tại Times City, tầng cao, view đẹp, đầy đủ nội thất', 'apartment', 'for_sale', 'Hà Nội', 'Hai Bà Trưng', 'Phường Minh Khai', '458 Minh Khai', 20.9976, 105.8751, 95.2, 85.0, 3, 2, 1, 2018, 4200000000, 44117647, 'red_book', 'individual',
'["https://example.com/timescity1.jpg", "https://example.com/timescity2.jpg"]',
'["Tầng cao", "Đầy đủ nội thất", "3 phòng ngủ"]',
'["Trung tâm thương mại", "Hồ bơi", "Sân tennis", "Khu vui chơi"]',
'chung-cu-times-city-hai-ba-trung',
ARRAY['chung cư', 'times city', 'hà nội', 'nội thất'], true, NOW()),

('Biệt thự Vinhomes Riverside', 'Biệt thự đơn lập 5PN, có sân vườn, garage 2 xe, view sông Hồng', 'villa', 'for_sale', 'Hà Nội', 'Long Biên', 'Phường Việt Hưng', 'Khu đô thị Vinhomes Riverside', 21.0463, 105.9004, 250.0, 400.0, 5, 4, 3, 2021, 18000000000, 45000000, 'red_book', 'individual',
'["https://example.com/riverside1.jpg", "https://example.com/riverside2.jpg"]',
'["Biệt thự đơn lập", "Sân vườn rộng", "View sông Hồng"]',
'["Câu lạc bộ golf", "Trường học", "Bệnh viện", "An ninh 24/7"]',
'biet-thu-vinhomes-riverside-long-bien',
ARRAY['biệt thự', 'vinhomes', 'riverside', 'view sông'], true, NOW()),

-- Da Nang Properties
('Căn hộ Monarchy Đà Nẵng', 'Căn hộ 2PN view biển Mỹ Khê, full nội thất, cho thuê tốt', 'apartment', 'for_sale', 'Đà Nẵng', 'Sơn Trà', 'Phường Mỹ An', '99 Võ Nguyên Giáp', 16.0471, 108.2392, 82.3, 73.5, 2, 2, 1, 2020, 3800000000, 46171673, 'red_book', 'individual',
'["https://example.com/monarchy1.jpg", "https://example.com/monarchy2.jpg"]',
'["View biển", "Full nội thất", "Căn góc"]',
'["Bãi biển Mỹ Khê", "Hồ bơi vô cực", "Spa", "Nhà hàng"]',
'can-ho-monarchy-da-nang-my-khe',
ARRAY['căn hộ', 'đà nẵng', 'view biển', 'mỹ khê'], false, NOW()),

-- Investment Properties
('Shophouse The Manor Central Park', 'Shophouse mặt tiền đường lớn, kinh doanh tốt, sinh lời cao', 'commercial', 'for_sale', 'Hồ Chí Minh', 'Bình Thạnh', 'Phường 22', '208A Nguyễn Hữu Cảnh', 10.7940, 106.7215, 150.0, 120.0, 0, 2, 4, 2019, 25000000000, 166666667, 'red_book', 'individual',
'["https://example.com/shophouse1.jpg", "https://example.com/shophouse2.jpg"]',
'["Mặt tiền đường lớn", "4 tầng", "Thang máy"]',
'["Vị trí đắc địa", "Giao thông thuận lợi", "Dân cư đông đúc"]',
'shophouse-manor-central-park',
ARRAY['shophouse', 'thương mại', 'mặt tiền', 'đầu tư'], false, NOW());

-- =============================================
-- DEVELOPMENT USER DATA (for testing)
-- =============================================

-- Note: User profiles will be created when users register via Supabase Auth
-- This is just a placeholder for the structure

-- =============================================
-- INDEXES OPTIMIZATION
-- =============================================

-- Create additional indexes for better query performance
CREATE INDEX idx_properties_search_main ON properties(province, district, property_type, status, list_price);
CREATE INDEX idx_properties_featured ON properties(is_featured, published_at DESC) WHERE is_featured = true;
CREATE INDEX idx_bank_rates_lookup ON bank_interest_rates(bank_id, loan_type, is_active);
CREATE INDEX idx_achievements_type_active ON achievements(achievement_type, is_active) WHERE is_active = true;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE banks IS 'Vietnamese banking institutions with loan products';
COMMENT ON TABLE bank_interest_rates IS 'Current and historical interest rates from Vietnamese banks';
COMMENT ON TABLE achievements IS 'Gamification achievement definitions for user engagement';
COMMENT ON TABLE properties IS 'Vietnamese real estate property listings with comprehensive details';
COMMENT ON TABLE app_settings IS 'Application configuration and feature flags';