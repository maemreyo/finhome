-- FinHome Production Seed Data
-- Initial data for Vietnamese real estate financial platform

-- =============================================
-- VIETNAMESE BANKS DATA
-- =============================================

INSERT INTO banks (bank_code, bank_name, bank_name_en, logo_url, website_url, hotline, email, headquarters_address, is_active, is_featured) VALUES
('VCB', 'Ngân hàng TMCP Ngoại thương Việt Nam', 'Vietcombank', NULL, 'https://www.vietcombank.com.vn', '1900 545 413', 'info@vietcombank.com.vn', '198 Trần Quang Khải, Hoàn Kiếm, Hà Nội', true, true),
('BIDV', 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', 'BIDV', NULL, 'https://www.bidv.com.vn', '1900 9247', 'info@bidv.com.vn', '35 Hàng Vôi, Hoàn Kiếm, Hà Nội', true, true),
('AGRI', 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam', 'Agribank', NULL, 'https://www.agribank.com.vn', '1900 558 818', 'info@agribank.com.vn', '2 Láng Hạ, Ba Đình, Hà Nội', true, true),
('TCB', 'Ngân hàng TMCP Kỹ thương Việt Nam', 'Techcombank', NULL, 'https://www.techcombank.com.vn', '1800 588 822', 'customercare@techcombank.com.vn', '191 Ba Tháng Hai, Quận 3, TP.HCM', true, true),
('VPB', 'Ngân hàng TMCP Việt Nam Thịnh Vượng', 'VPBank', NULL, 'https://www.vpbank.com.vn', '1900 545 415', 'info@vpbank.com.vn', '89 Láng Hạ, Ba Đình, Hà Nội', true, true),
('ACB', 'Ngân hàng TMCP Á Châu', 'ACB', NULL, 'https://www.acb.com.vn', '1900 545 416', 'customercare@acb.com.vn', '442 Nguyễn Thị Minh Khai, Quận 3, TP.HCM', true, true),
('VIB', 'Ngân hàng TMCP Quốc tế Việt Nam', 'VIB', NULL, 'https://www.vib.com.vn', '1900 545 421', 'info@vib.com.vn', '198 Trần Quang Khải, Hoàn Kiếm, Hà Nội', true, false),
('MB', 'Ngân hàng TMCP Quân đội', 'MBBank', NULL, 'https://www.mbbank.com.vn', '1900 545 422', 'info@mbbank.com.vn', '108 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội', true, false),
('STB', 'Ngân hàng TMCP Sài Gòn Thương Tín', 'Sacombank', NULL, 'https://www.sacombank.com.vn', '1900 545 425', 'info@sacombank.com.vn', '266-268 Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM', true, false),
('EIB', 'Ngân hàng TMCP Xuất Nhập khẩu Việt Nam', 'Eximbank', NULL, 'https://www.eximbank.com.vn', '1900 545 429', 'info@eximbank.com.vn', '8 Tôn Thất Đạm, Nguyễn Thai Bình, Quận 1, TP.HCM', true, false),
('CTG', 'Ngân hàng TMCP Công thương Việt Nam', 'VietinBank', NULL, 'https://www.vietinbank.vn', '1900 558 868', 'info@vietinbank.vn', '108 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội', true, true),
('SHB', 'Ngân hàng TMCP Sài Gòn - Hà Nội', 'SHB', NULL, 'https://www.shb.com.vn', '1900 1133', 'info@shb.com.vn', '77 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội', true, false);

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
((SELECT id FROM banks WHERE bank_code = 'ACB'), 'Vay đầu tư BĐS', 'investment_loan', 9.3, 8.9, 10.8, 180000000, 100000000000, 70, 60, 200, 28000000, 1.3, 2.8, '2024-01-01', true),

-- VietinBank rates
((SELECT id FROM banks WHERE bank_code = 'CTG'), 'Vay mua nhà ưu đãi', 'home_loan', 7.6, 7.3, 8.9, 100000000, 45000000000, 80, 60, 300, 12000000, 1.0, 2.0, '2024-01-01', true),
((SELECT id FROM banks WHERE bank_code = 'CTG'), 'Vay mua nhà thường', 'home_loan', 8.4, 8.1, 9.7, 50000000, 30000000000, 75, 60, 240, 10000000, 1.0, 2.0, '2024-01-01', true),
((SELECT id FROM banks WHERE bank_code = 'CTG'), 'Vay đầu tư BĐS', 'investment_loan', 9.1, 8.7, 10.7, 150000000, 80000000000, 70, 60, 180, 22000000, 1.3, 2.7, '2024-01-01', true);

-- =============================================
-- HISTORICAL INTEREST RATES (FOR COMPATIBILITY)
-- =============================================

INSERT INTO interest_rates (bank_name, bank_code, rate_type, loan_term_years, interest_rate, minimum_loan_amount, maximum_loan_amount, minimum_down_payment_percent, effective_date, special_conditions, source_url) VALUES
-- Vietcombank rates
('Vietcombank', 'VCB', 'promotional', 15, 7.5, 300000000, 30000000000, 30.0, '2024-01-01', ARRAY['First home buyers', 'Salary account required'], 'https://vietcombank.com.vn'),
('Vietcombank', 'VCB', 'promotional', 20, 7.8, 300000000, 30000000000, 30.0, '2024-01-01', ARRAY['First home buyers', 'Salary account required'], 'https://vietcombank.com.vn'),
('Vietcombank', 'VCB', 'promotional', 25, 8.0, 300000000, 30000000000, 30.0, '2024-01-01', ARRAY['First home buyers', 'Salary account required'], 'https://vietcombank.com.vn'),
('Vietcombank', 'VCB', 'standard', 15, 10.2, 300000000, 30000000000, 20.0, '2024-01-01', ARRAY[], 'https://vietcombank.com.vn'),
('Vietcombank', 'VCB', 'standard', 20, 10.5, 300000000, 30000000000, 20.0, '2024-01-01', ARRAY[], 'https://vietcombank.com.vn'),
('Vietcombank', 'VCB', 'standard', 25, 10.8, 300000000, 30000000000, 20.0, '2024-01-01', ARRAY[], 'https://vietcombank.com.vn'),

-- BIDV rates
('BIDV', 'BIDV', 'promotional', 15, 7.2, 200000000, 25000000000, 30.0, '2024-01-01', ARRAY['State employee discount', 'Payroll account'], 'https://bidv.com.vn'),
('BIDV', 'BIDV', 'promotional', 20, 7.5, 200000000, 25000000000, 30.0, '2024-01-01', ARRAY['State employee discount', 'Payroll account'], 'https://bidv.com.vn'),
('BIDV', 'BIDV', 'promotional', 25, 7.8, 200000000, 25000000000, 30.0, '2024-01-01', ARRAY['State employee discount', 'Payroll account'], 'https://bidv.com.vn'),
('BIDV', 'BIDV', 'standard', 15, 10.0, 200000000, 25000000000, 20.0, '2024-01-01', ARRAY[], 'https://bidv.com.vn'),
('BIDV', 'BIDV', 'standard', 20, 10.2, 200000000, 25000000000, 20.0, '2024-01-01', ARRAY[], 'https://bidv.com.vn'),
('BIDV', 'BIDV', 'standard', 25, 10.5, 200000000, 25000000000, 20.0, '2024-01-01', ARRAY[], 'https://bidv.com.vn'),

-- Techcombank rates
('Techcombank', 'TCB', 'promotional', 15, 7.8, 500000000, 50000000000, 30.0, '2024-01-01', ARRAY['Premium customer', 'Life insurance required'], 'https://techcombank.com.vn'),
('Techcombank', 'TCB', 'promotional', 20, 8.1, 500000000, 50000000000, 30.0, '2024-01-01', ARRAY['Premium customer', 'Life insurance required'], 'https://techcombank.com.vn'),
('Techcombank', 'TCB', 'promotional', 25, 8.3, 500000000, 50000000000, 30.0, '2024-01-01', ARRAY['Premium customer', 'Life insurance required'], 'https://techcombank.com.vn'),
('Techcombank', 'TCB', 'standard', 15, 10.5, 500000000, 50000000000, 20.0, '2024-01-01', ARRAY[], 'https://techcombank.com.vn'),
('Techcombank', 'TCB', 'standard', 20, 10.8, 500000000, 50000000000, 20.0, '2024-01-01', ARRAY[], 'https://techcombank.com.vn'),
('Techcombank', 'TCB', 'standard', 25, 11.1, 500000000, 50000000000, 20.0, '2024-01-01', ARRAY[], 'https://techcombank.com.vn');

-- =============================================
-- PROPERTY MARKET DATA
-- =============================================

INSERT INTO property_market_data (city, district, property_type, average_price_per_sqm, median_price_per_sqm, price_change_monthly, price_change_yearly, average_rental_yield, average_rent_per_sqm, occupancy_rate, properties_sold, properties_listed, days_on_market, data_period, data_source, reliability_score) VALUES

-- Ho Chi Minh City - District 1
('Hồ Chí Minh', 'Quận 1', 'apartment', 120000000, 115000000, 0.5, 8.2, 4.2, 450000, 92.5, 45, 120, 65, '2024-01-01', 'batdongsan.com.vn', 9),
('Hồ Chí Minh', 'Quận 1', 'house', 150000000, 145000000, 0.3, 6.8, 3.8, 380000, 88.0, 12, 35, 85, '2024-01-01', 'batdongsan.com.vn', 8),
('Hồ Chí Minh', 'Quận 1', 'commercial', 200000000, 195000000, 0.8, 12.5, 6.5, 800000, 95.0, 8, 25, 45, '2024-01-01', 'batdongsan.com.vn', 9),

-- Ho Chi Minh City - District 2 (Thu Duc)
('Hồ Chí Minh', 'Thủ Đức', 'apartment', 85000000, 82000000, 1.2, 15.3, 5.8, 380000, 94.2, 78, 180, 42, '2024-01-01', 'batdongsan.com.vn', 9),
('Hồ Chí Minh', 'Thủ Đức', 'house', 95000000, 92000000, 1.0, 12.8, 5.2, 320000, 91.5, 35, 85, 55, '2024-01-01', 'batdongsan.com.vn', 8),
('Hồ Chí Minh', 'Thủ Đức', 'villa', 110000000, 108000000, 0.9, 11.2, 4.5, 280000, 87.0, 15, 40, 75, '2024-01-01', 'batdongsan.com.vn', 8),

-- Ho Chi Minh City - District 7
('Hồ Chí Minh', 'Quận 7', 'apartment', 95000000, 93000000, 0.8, 10.5, 5.0, 420000, 93.8, 65, 145, 38, '2024-01-01', 'batdongsan.com.vn', 9),
('Hồ Chí Minh', 'Quận 7', 'house', 105000000, 102000000, 0.7, 9.2, 4.8, 350000, 90.2, 28, 70, 62, '2024-01-01', 'batdongsan.com.vn', 8),
('Hồ Chí Minh', 'Quận 7', 'villa', 125000000, 122000000, 0.6, 8.8, 4.2, 300000, 85.5, 18, 45, 88, '2024-01-01', 'batdongsan.com.vn', 8),

-- Ho Chi Minh City - Binh Thanh
('Hồ Chí Minh', 'Bình Thạnh', 'apartment', 78000000, 75000000, 1.0, 12.8, 5.5, 350000, 92.0, 88, 200, 35, '2024-01-01', 'batdongsan.com.vn', 9),
('Hồ Chí Minh', 'Bình Thạnh', 'house', 85000000, 82000000, 0.9, 11.5, 5.2, 290000, 89.8, 42, 95, 48, '2024-01-01', 'batdongsan.com.vn', 8),

-- Hanoi - Ba Dinh
('Hà Nội', 'Ba Đình', 'apartment', 110000000, 108000000, 0.4, 7.2, 4.0, 400000, 90.5, 35, 95, 78, '2024-01-01', 'batdongsan.com.vn', 9),
('Hà Nội', 'Ba Đình', 'house', 130000000, 128000000, 0.2, 5.8, 3.5, 320000, 86.2, 15, 42, 95, '2024-01-01', 'batdongsan.com.vn', 8),

-- Hanoi - Cau Giay
('Hà Nội', 'Cầu Giấy', 'apartment', 90000000, 88000000, 0.8, 9.5, 4.8, 380000, 92.8, 55, 130, 52, '2024-01-01', 'batdongsan.com.vn', 9),
('Hà Nội', 'Cầu Giấy', 'house', 98000000, 96000000, 0.6, 8.2, 4.5, 310000, 89.5, 25, 68, 68, '2024-01-01', 'batdongsan.com.vn', 8),

-- Hanoi - Dong Da
('Hà Nội', 'Đống Đa', 'apartment', 88000000, 86000000, 0.7, 8.8, 4.6, 370000, 91.2, 48, 115, 58, '2024-01-01', 'batdongsan.com.vn', 9),
('Hà Nội', 'Đống Đa', 'house', 95000000, 93000000, 0.5, 7.5, 4.2, 300000, 88.8, 22, 58, 72, '2024-01-01', 'batdongsan.com.vn', 8),

-- Da Nang - Hai Chau
('Đà Nẵng', 'Hải Châu', 'apartment', 65000000, 63000000, 1.5, 18.2, 6.2, 320000, 95.5, 42, 85, 28, '2024-01-01', 'batdongsan.com.vn', 8),
('Đà Nẵng', 'Hải Châu', 'house', 72000000, 70000000, 1.2, 15.8, 5.8, 280000, 92.2, 18, 45, 38, '2024-01-01', 'batdongsan.com.vn', 8),

-- Da Nang - Son Tra
('Đà Nẵng', 'Sơn Trà', 'apartment', 58000000, 56000000, 1.8, 22.5, 6.8, 300000, 96.8, 35, 75, 25, '2024-01-01', 'batdongsan.com.vn', 8),
('Đà Nẵng', 'Sơn Trà', 'villa', 85000000, 82000000, 1.0, 12.8, 5.2, 250000, 88.5, 12, 28, 55, '2024-01-01', 'batdongsan.com.vn', 7);

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
('ROI Champion', 'Nhà Vô Địch ROI', 'Achieve 15%+ ROI on property investments', 'Đạt ROI 15%+ từ đầu tư bất động sản', 'financial', '{"action": "roi_achieved", "percentage": 15}', 15, 1000, '🏆', '#DC2626', 52),

-- Vietnamese specific achievements
('Mua Nhà Lần Đầu', 'First Time Home Buyer', 'Successfully plan for your first home purchase', 'Lập kế hoạch thành công cho việc mua nhà lần đầu', 'financial', '{"action": "first_home_plan"}', 1, 300, '🏡', '#16A34A', 60),
('Chuyên Gia Vay Ngân Hàng', 'Bank Loan Expert', 'Compare rates from 5 different banks', 'So sánh lãi suất từ 5 ngân hàng khác nhau', 'usage', '{"action": "bank_comparison", "count": 5}', 5, 100, '🏦', '#0EA5E9', 61),
('Bậc Thầy Tối Ưu', 'Optimization Master', 'Save over 100 million VND through loan optimization', 'Tiết kiệm hơn 100 triệu VND qua tối ưu hóa vay', 'financial', '{"action": "savings_vnd", "amount": 100000000}', 100000000, 1000, '💡', '#F59E0B', 62);

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
('community_enabled', 'true', 'boolean', 'Enable community features', true),

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
('performance_monitoring_enabled', 'true', 'boolean', 'Enable performance monitoring', false),

-- Vietnamese market specific settings
('vnd_currency_enabled', 'true', 'boolean', 'Enable VND currency support', true),
('vietnamese_banks_enabled', 'true', 'boolean', 'Enable Vietnamese bank integration', true),
('property_legal_status_check', 'true', 'boolean', 'Enable Vietnamese property legal status validation', false),
('location_autocomplete_enabled', 'true', 'boolean', 'Enable Vietnamese location autocomplete', true);

-- =============================================
-- SAMPLE PROPERTIES DATA (for development/demo)
-- =============================================

INSERT INTO properties (
    title, property_name, description, property_type, status, province, district, city, ward, street_address, address,
    latitude, longitude, total_area, usable_area, bedrooms, bathrooms, floors, year_built,
    list_price, listed_price, price_per_sqm, legal_status, ownership_type, 
    images, features, amenities, slug, tags, is_featured, published_at
) VALUES
-- Ho Chi Minh City Properties
('Căn hộ cao cấp Vinhomes Central Park', 'Vinhomes Central Park - Landmark 1', 'Căn hộ 2 phòng ngủ tại tòa Landmark, view sông Sài Gòn tuyệt đẹp', 'apartment', 'for_sale', 'Hồ Chí Minh', 'Bình Thạnh', 'Hồ Chí Minh', 'Phường 22', '208 Nguyễn Hữu Cảnh', '208 Nguyễn Hữu Cảnh, Phường 22, Bình Thạnh, TP.HCM', 10.7943, 106.7220, 78.5, 68.2, 2, 2, 1, 2019, 6800000000, 6800000000, 86624523, 'red_book', 'individual', 
'[]', 
'["Căn góc", "View sông", "Nội thất cao cấp"]', 
ARRAY['Hồ bơi', 'Phòng gym', 'Khu vui chơi trẻ em', 'An ninh 24/7'], 
'can-ho-vinhomes-central-park-landmark', 
ARRAY['căn hộ', 'vinhomes', 'cao cấp', 'view sông'], true, NOW()),

('Nhà phố Thảo Điền', 'Masteri Thao Dien T3', 'Nhà phố 1 trệt 2 lầu khu Thảo Điền, đường 8m, gần trường quốc tế', 'house', 'for_sale', 'Hồ Chí Minh', 'Thủ Đức', 'Hồ Chí Minh', 'Phường Thảo Điền', 'Đường 12A, Khu dân cư Văn Minh', '159 Xa Lộ Hà Nội, Thảo Điền, Thủ Đức, TP.HCM', 10.8008, 106.7442, 120.0, 300.0, 4, 3, 3, 2020, 12500000000, 12500000000, 41666667, 'red_book', 'individual',
'[]',
'["Mặt tiền", "Hướng Đông Nam", "Garage ô tô"]',
ARRAY['Gần trường quốc tế', 'Khu an ninh', 'Gần siêu thị'],
'nha-pho-thao-dien-thu-duc', 
ARRAY['nhà phố', 'thảo điền', 'thủ đức', 'mặt tiền'], true, NOW()),

-- Hanoi Properties  
('Chung cư Times City', 'Times City Park Hill', 'Căn hộ 3PN tại Times City, tầng cao, view đẹp, đầy đủ nội thất', 'apartment', 'for_sale', 'Hà Nội', 'Hai Bà Trưng', 'Hà Nội', 'Phường Minh Khai', '458 Minh Khai', '458 Minh Khai, Minh Khai, Hai Bà Trưng, Hà Nội', 20.9976, 105.8751, 95.2, 85.0, 3, 2, 1, 2018, 4200000000, 4200000000, 44117647, 'red_book', 'individual',
'[]',
'["Tầng cao", "Đầy đủ nội thất", "3 phòng ngủ"]',
ARRAY['Trung tâm thương mại', 'Hồ bơi', 'Sân tennis', 'Khu vui chơi'],
'chung-cu-times-city-hai-ba-trung',
ARRAY['chung cư', 'times city', 'hà nội', 'nội thất'], true, NOW()),

('Biệt thự Vinhomes Riverside', 'Royal City R1', 'Biệt thự đơn lập 5PN, có sân vườn, garage 2 xe, view sông Hồng', 'villa', 'for_sale', 'Hà Nội', 'Long Biên', 'Hà Nội', 'Phường Việt Hưng', 'Khu đô thị Vinhomes Riverside', '72A Nguyễn Trai, Thanh Xuân Trung, Thanh Xuân, Hà Nội', 21.0463, 105.9004, 250.0, 400.0, 5, 4, 3, 2021, 18000000000, 18000000000, 45000000, 'red_book', 'individual',
'[]',
'["Biệt thự đơn lập", "Sân vườn rộng", "View sông Hồng"]',
ARRAY['Câu lạc bộ golf', 'Trường học', 'Bệnh viện', 'An ninh 24/7'],
'biet-thu-vinhomes-riverside-long-bien',
ARRAY['biệt thự', 'vinhomes', 'riverside', 'view sông'], true, NOW()),

-- Da Nang Properties
('Căn hộ Monarchy Đà Nẵng', 'Eco Green Saigon', 'Căn hộ 2PN view biển Mỹ Khê, full nội thất, cho thuê tốt', 'apartment', 'for_sale', 'Đà Nẵng', 'Sơn Trà', 'Đà Nẵng', 'Phường Mỹ An', '99 Võ Nguyên Giáp', '286 Nguyễn Xién, Long Thạnh Mỹ, Quận 9, TP.HCM', 16.0471, 108.2392, 82.3, 73.5, 2, 2, 1, 2020, 3800000000, 3800000000, 46171673, 'red_book', 'individual',
'[]',
'["View biển", "Full nội thất", "Căn góc"]',
ARRAY['Bãi biển Mỹ Khê', 'Hồ bơi vô cực', 'Spa', 'Nhà hàng'],
'can-ho-monarchy-da-nang-my-khe',
ARRAY['căn hộ', 'đà nẵng', 'view biển', 'mỹ khê'], false, NOW());

-- =============================================
-- UTILITY FUNCTIONS FOR DEVELOPMENT
-- =============================================

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
    FROM interest_rates ir_promo
    JOIN interest_rates ir_standard 
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
    property_type property_type,
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
    FROM property_market_data pmd
    WHERE pmd.city = p_city
        AND (p_district IS NULL OR pmd.district = p_district)
        AND pmd.data_period = (SELECT MAX(data_period) FROM property_market_data WHERE city = p_city)
    ORDER BY pmd.property_type;
END;
$$ LANGUAGE plpgsql;

-- Function to create demo user profile
CREATE OR REPLACE FUNCTION create_demo_user_profile(
    p_user_id UUID,
    p_email TEXT DEFAULT 'demo@finhome.vn',
    p_full_name TEXT DEFAULT 'Nguyễn Văn Demo'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_profiles (
        id,
        email,
        full_name,
        phone,
        occupation,
        company,
        annual_income,
        monthly_expenses,
        current_assets,
        current_debts,
        city,
        district,
        subscription_tier,
        onboarding_completed,
        experience_points,
        achievement_badges
    ) VALUES (
        p_user_id,
        p_email,
        p_full_name,
        '+84901234567',
        'Software Engineer',
        'FPT Software',
        600000000, -- 600M VND/year
        15000000,  -- 15M VND/month expenses
        200000000, -- 200M VND assets
        50000000,  -- 50M VND debts
        'Hồ Chí Minh',
        'Quận 7',
        'free',
        true,
        150,
        ARRAY['🎯 Người Lập Kế Hoạch Cẩn Trọng', '🚀 Người Tiên Phong']
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        occupation = EXCLUDED.occupation,
        company = EXCLUDED.company,
        annual_income = EXCLUDED.annual_income,
        monthly_expenses = EXCLUDED.monthly_expenses,
        current_assets = EXCLUDED.current_assets,
        current_debts = EXCLUDED.current_debts,
        onboarding_completed = EXCLUDED.onboarding_completed,
        experience_points = EXCLUDED.experience_points,
        achievement_badges = EXCLUDED.achievement_badges,
        updated_at = NOW();
        
    -- Also create user preferences
    INSERT INTO user_preferences (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create initial user experience record
    INSERT INTO user_experience (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- COMMENTS AND DOCUMENTATION
-- =============================================

COMMENT ON TABLE banks IS 'Vietnamese banking institutions with loan products';
COMMENT ON TABLE bank_interest_rates IS 'Current and historical interest rates from Vietnamese banks';
COMMENT ON TABLE interest_rates IS 'Legacy interest rates table for backward compatibility';
COMMENT ON TABLE property_market_data IS 'Vietnamese real estate market data and trends';
COMMENT ON TABLE achievements IS 'Gamification achievement definitions for user engagement';
COMMENT ON TABLE properties IS 'Vietnamese real estate property listings with comprehensive details';
COMMENT ON TABLE app_settings IS 'Application configuration and feature flags';
COMMENT ON FUNCTION get_current_rates(INTEGER) IS 'Get current promotional and standard rates for a loan term';
COMMENT ON FUNCTION get_market_summary(TEXT, TEXT) IS 'Get property market summary for a Vietnamese city/district';
COMMENT ON FUNCTION create_demo_user_profile(UUID, TEXT, TEXT) IS 'Create a demo user profile for testing purposes';