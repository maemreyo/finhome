-- Property Seeding Script for FinHome
-- Comprehensive Vietnamese real estate property data
-- Run this script to populate the properties table with realistic data

-- Delete existing properties (for development only)
-- DELETE FROM properties;

-- ==================================================
-- HO CHI MINH CITY PROPERTIES
-- ==================================================

-- DISTRICT 1 - Premium CBD Properties
INSERT INTO properties (
    title, description, property_type, status, 
    province, district, city, ward, street_address, address,
    latitude, longitude,
    total_area, usable_area, bedrooms, bathrooms, floors, year_built,
    list_price, price_per_sqm,
    legal_status, ownership_type,
    images, features, amenities,
    neighborhood_data, investment_metrics,
    is_featured, published_at
) VALUES 

-- Luxury Apartments in District 1
(
    'Vinhomes Central Park - Căn hộ cao cấp 3PN view sông',
    'Căn hộ 3 phòng ngủ tại Vinhomes Central Park với view sông Sài Gòn tuyệt đẹp. Nội thất cao cấp, tiện ích đầy đủ bao gồm hồ bơi, gym, shopping mall. Vị trí đắc địa tại quận Bình Thạnh.',
    'apartment', 'for_sale',
    'Ho Chi Minh City', 'Binh Thanh', 'Ho Chi Minh City', 'Ward 22', 'Nguyen Huu Canh Street', '208 Nguyen Huu Canh, Ward 22, Binh Thanh District, Ho Chi Minh City',
    10.7962, 106.7198,
    98.5, 85.2, 3, 2, NULL, 2018,
    7500000000, 76142000,
    'red_book', 'individual',
    '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750", "https://images.unsplash.com/photo-1493809842364-78817add7ffb"]',
    '["luxury_finishes", "river_view", "gym", "swimming_pool", "shopping_mall"]',
    ARRAY['Swimming Pool', 'Gym', 'Security 24/7', 'Parking', 'Shopping Mall'],
    '{"walkScore": 95, "schoolRating": 9, "hospitalNearby": true, "publicTransport": "Metro Line 1"}',
    '{"estimatedRoi": 8.2, "rentalYield": 4.8, "appreciationRate": 12, "riskScore": 3}',
    true, NOW()
),

(
    'The Manor - Officetel cho thuê tại Q.Bình Thạnh',
    'Officetel 45m² tại The Manor, thiết kế hiện đại, đầy đủ nội thất. Phù hợp cho thuê hoặc ở. Giá thuê dự kiến 15-18 triệu/tháng.',
    'apartment', 'for_sale',
    'Ho Chi Minh City', 'Binh Thanh', 'Ho Chi Minh City', 'Ward 22', 'Nguyen Huu Canh Street', '91 Nguyen Huu Canh, Ward 22, Binh Thanh District, Ho Chi Minh City',
    10.7965, 106.7201,
    45.0, 42.0, 1, 1, NULL, 2019,
    3200000000, 71111000,
    'red_book', 'individual',
    '["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6"]',
    '["modern_design", "furnished", "city_view", "investment_potential"]',
    ARRAY['Furnished', 'High-speed Internet', 'Security', 'Elevator'],
    '{"walkScore": 92, "schoolRating": 8, "hospitalNearby": true, "publicTransport": "Bus routes"}',
    '{"estimatedRoi": 10.5, "rentalYield": 5.6, "appreciationRate": 15, "riskScore": 4}',
    false, NOW()
),

-- DISTRICT 2 - Thu Duc City (New Urban Area)
(
    'Masteri Thao Dien - Căn hộ 2PN view landmark',
    'Căn hộ 2 phòng ngủ tại Masteri Thao Dien với view Landmark 81. Khu vực an ninh, nhiều expat sinh sống. Tiềm năng cho thuê cao.',
    'apartment', 'for_sale',
    'Ho Chi Minh City', 'Thu Duc', 'Ho Chi Minh City', 'Thao Dien', 'Xa Lo Ha Noi Street', 'Xa Lo Ha Noi, Thao Dien Ward, Thu Duc City, Ho Chi Minh City',
    10.8074, 106.7390,
    75.5, 68.0, 2, 2, NULL, 2017,
    5800000000, 76821000,
    'red_book', 'individual',
    '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688", "https://images.unsplash.com/photo-1484154218962-a197022b5858"]',
    '["landmark_view", "expat_community", "security", "rental_potential"]',
    ARRAY['Swimming Pool', 'Gym', 'Playground', 'Security 24/7', 'Parking'],
    '{"walkScore": 88, "schoolRating": 9, "expatCommunity": true, "publicTransport": "Metro Line 1 planned"}',
    '{"estimatedRoi": 9.8, "rentalYield": 5.2, "appreciationRate": 18, "riskScore": 2}',
    true, NOW()
),

(
    'Empire City - Penthouse 4PN sang trọng',
    'Penthouse 4 phòng ngủ tại Empire City với tầm nhìn 360 độ toàn thành phố. Nội thất cao cấp từ Châu Âu, sân vườn riêng.',
    'apartment', 'for_sale',
    'Ho Chi Minh City', 'Thu Duc', 'Ho Chi Minh City', 'Thao Dien', 'Mai Chi Tho Street', '391 Mai Chi Tho, Thao Dien Ward, Thu Duc City, Ho Chi Minh City',
    10.8021, 106.7356,
    185.0, 165.0, 4, 3, NULL, 2020,
    18500000000, 100000000,
    'red_book', 'individual',
    '["https://images.unsplash.com/photo-1613490493576-7fde63acd811", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"]',
    '["penthouse", "360_view", "luxury_finishes", "private_garden", "european_furniture"]',
    ARRAY['Private Garden', 'Premium Gym', 'Infinity Pool', 'Concierge', 'Wine Cellar'],
    '{"walkScore": 85, "schoolRating": 9, "luxuryRating": 10, "publicTransport": "Private transport recommended"}',
    '{"estimatedRoi": 7.5, "rentalYield": 3.8, "appreciationRate": 20, "riskScore": 1}',
    true, NOW()
),

-- DISTRICT 7 - Family-friendly area
(
    'Sunrise City - Căn hộ gia đình 3PN',
    'Căn hộ 3 phòng ngủ tại Sunrise City, khu vực an toàn cho gia đình có trẻ em. Gần trường quốc tế, bệnh viện FV.',
    'apartment', 'for_sale',
    'Ho Chi Minh City', 'District 7', 'Ho Chi Minh City', 'Tan Phong', 'Nguyen Huu Tho Street', 'Nguyen Huu Tho, Tan Phong Ward, District 7, Ho Chi Minh City',
    10.7256, 106.7019,
    95.0, 82.0, 3, 2, NULL, 2016,
    6200000000, 65263000,
    'red_book', 'individual',
    '["https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"]',
    '["family_friendly", "international_school_nearby", "hospital_nearby", "safe_area"]',
    ARRAY['Playground', 'Swimming Pool', 'Security 24/7', 'School Bus', 'Medical Center'],
    '{"walkScore": 78, "schoolRating": 10, "familyFriendly": true, "publicTransport": "Bus routes"}',
    '{"estimatedRoi": 8.8, "rentalYield": 4.5, "appreciationRate": 10, "riskScore": 2}',
    false, NOW()
),

-- Villas and Houses
(
    'Riviera Villas - Biệt thự đơn lập 5PN có hồ bơi',
    'Biệt thự đơn lập 5 phòng ngủ tại khu Riviera với thiết kế châu Âu, hồ bơi riêng, sân vườn rộng. Phù hợp cho gia đình lớn.',
    'villa', 'for_sale',
    'Ho Chi Minh City', 'District 7', 'Ho Chi Minh City', 'Tan Phong', 'Riverside Street', 'Riviera Villa Complex, Tan Phong Ward, District 7, Ho Chi Minh City',
    10.7289, 106.6987,
    350.0, 280.0, 5, 4, 3, 2015,
    25000000000, 71428000,
    'red_book', 'individual',
    '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9", "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4"]',
    '["villa", "private_pool", "garden", "european_style", "luxury_living"]',
    ARRAY['Private Pool', 'Garden', 'Garage', 'Security 24/7', 'Club House'],
    '{"walkScore": 65, "schoolRating": 9, "luxuryRating": 9, "publicTransport": "Private car recommended"}',
    '{"estimatedRoi": 6.5, "rentalYield": 3.2, "appreciationRate": 8, "riskScore": 3}',
    true, NOW()
),

-- ==================================================
-- HANOI PROPERTIES
-- ==================================================

-- Ba Dinh District - Government area
(
    'Lotte Center - Căn hộ cao cấp view Hồ Tây',
    'Căn hộ 2 phòng ngủ tại Lotte Center với view Hồ Tây tuyệt đẹp. Vị trí trung tâm Ba Đình, gần các cơ quan chính phủ.',
    'apartment', 'for_sale',
    'Hanoi', 'Ba Dinh', 'Hanoi', 'Lieu Giai', 'Lieu Giai Street', '54 Lieu Giai, Ba Dinh District, Hanoi',
    21.0227, 105.8194,
    88.0, 75.0, 2, 2, NULL, 2018,
    8500000000, 96590000,
    'red_book', 'individual',
    '["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750"]',
    '["west_lake_view", "central_location", "luxury_tower", "government_area"]',
    ARRAY['Swimming Pool', 'Gym', 'Sky Bar', 'Concierge', 'Parking'],
    '{"walkScore": 95, "schoolRating": 9, "governmentArea": true, "publicTransport": "Multiple bus lines"}',
    '{"estimatedRoi": 7.8, "rentalYield": 4.2, "appreciationRate": 12, "riskScore": 2}',
    true, NOW()
),

-- Dong Da District - University area
(
    'Times City - Căn hộ cho thuê sinh viên',
    'Căn hộ 2 phòng ngủ tại Times City, gần nhiều trường đại học. Tiềm năng cho thuê sinh viên và gia đình trẻ cao.',
    'apartment', 'for_sale',
    'Hanoi', 'Dong Da', 'Hanoi', 'Thanh Xuan Bac', 'Minh Khai Street', '458 Minh Khai, Dong Da District, Hanoi',
    21.0048, 105.8542,
    72.0, 62.0, 2, 1, NULL, 2019,
    4800000000, 66666000,
    'red_book', 'individual',
    '["https://images.unsplash.com/photo-1493809842364-78817add7ffb", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"]',
    '["university_area", "student_rental", "young_family", "convenient_location"]',
    ARRAY['Swimming Pool', 'Study Room', 'Gym', 'Security', 'Parking'],
    '{"walkScore": 90, "schoolRating": 10, "universityNearby": true, "publicTransport": "Metro Line 2"}',
    '{"estimatedRoi": 9.2, "rentalYield": 5.8, "appreciationRate": 8, "riskScore": 3}',
    false, NOW()
),

-- ==================================================
-- DA NANG PROPERTIES
-- ==================================================

(
    'Muong Thanh Da Nang - Căn hộ resort view biển',
    'Căn hộ 2 phòng ngủ view biển trực diện tại Đà Nẵng. Phù hợp cho nghỉ dưỡng và đầu tư cho thuê du lịch.',
    'apartment', 'for_sale',
    'Da Nang', 'Hai Chau', 'Da Nang', 'Thuan Phuoc', 'Vo Nguyen Giap Street', '962 Vo Nguyen Giap, Thuan Phuoc Ward, Hai Chau District, Da Nang',
    16.0544, 108.2284,
    68.0, 58.0, 2, 1, NULL, 2017,
    3800000000, 55882000,
    'red_book', 'individual',
    '["https://images.unsplash.com/photo-1571896349842-33c89424de2d", "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9"]',
    '["ocean_view", "resort_style", "tourism_rental", "beachfront"]',
    ARRAY['Beach Access', 'Swimming Pool', 'Restaurant', 'Spa', 'Tour Desk'],
    '{"walkScore": 75, "tourismRating": 10, "beachfront": true, "publicTransport": "Airport shuttle"}',
    '{"estimatedRoi": 11.5, "rentalYield": 7.2, "appreciationRate": 15, "riskScore": 4}',
    true, NOW()
),

-- ==================================================
-- CAN THO PROPERTIES
-- ==================================================

(
    'Can Tho Center - Shophouse kinh doanh',
    'Shophouse 4 tầng tại trung tâm Cần Thơ, mặt tiền đường lớn. Tầng trệt kinh doanh, 3 tầng trên ở hoặc cho thuê văn phòng.',
    'commercial', 'for_sale',
    'Can Tho', 'Ninh Kieu', 'Can Tho', 'Xuan Khanh', 'Hoa Binh Street', '123 Hoa Binh, Xuan Khanh Ward, Ninh Kieu District, Can Tho',
    10.0302, 105.7925,
    120.0, 400.0, 8, 4, 4, 2020,
    12000000000, 100000000,
    'red_book', 'individual',
    '["https://images.unsplash.com/photo-1560472354-b33ff0c44a43", "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab"]',
    '["shophouse", "commercial", "main_street", "investment_potential"]',
    ARRAY['Street Front', 'Parking', 'Security', 'Multiple Floors', 'Commercial License'],
    '{"walkScore": 92, "commercialRating": 9, "footTraffic": "high", "publicTransport": "Central location"}',
    '{"estimatedRoi": 12.8, "rentalYield": 8.5, "appreciationRate": 10, "riskScore": 3}',
    false, NOW()
),

-- ==================================================
-- AFFORDABLE HOUSING OPTIONS
-- ==================================================

(
    'Ehome 3 - Căn hộ giá rẻ cho gia đình trẻ',
    'Căn hộ 2 phòng ngủ giá phải chăng tại Ehome 3, Bình Tân. Phù hợp cho gia đình trẻ mua nhà lần đầu.',
    'apartment', 'for_sale',
    'Ho Chi Minh City', 'Binh Tan', 'Ho Chi Minh City', 'Binh Tri Dong A', 'An Duong Vuong Street', 'An Duong Vuong, Binh Tri Dong A Ward, Binh Tan District, Ho Chi Minh City',
    10.7543, 106.6132,
    65.0, 55.0, 2, 1, NULL, 2019,
    2100000000, 32307000,
    'red_book', 'individual',
    '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"]',
    '["affordable", "first_time_buyer", "young_family", "good_value"]',
    ARRAY['Swimming Pool', 'Playground', 'Security', 'Parking', 'Supermarket'],
    '{"walkScore": 70, "schoolRating": 7, "affordability": 9, "publicTransport": "Bus routes"}',
    '{"estimatedRoi": 8.5, "rentalYield": 6.2, "appreciationRate": 12, "riskScore": 4}',
    false, NOW()
),

(
    'Vĩnh Lộc New Town - Nhà phố liền kề giá tốt',
    'Nhà phố 3 tầng tại Vĩnh Lộc, Bình Chánh. Khu vực đang phát triển, giá tốt cho đầu tư dài hạn.',
    'townhouse', 'for_sale',
    'Ho Chi Minh City', 'Binh Chanh', 'Ho Chi Minh City', 'Vinh Loc A', 'Vinh Loc New Town', 'Vinh Loc New Town, Vinh Loc A Commune, Binh Chanh District, Ho Chi Minh City',
    10.6892, 106.5845,
    80.0, 180.0, 4, 3, 3, 2021,
    4500000000, 56250000,
    'red_book', 'individual',
    '["https://images.unsplash.com/photo-1523217582562-09d0def993a6", "https://images.unsplash.com/photo-1572120360610-d971b9d7767c"]',
    '["townhouse", "developing_area", "good_investment", "long_term_potential"]',
    ARRAY['Parking', 'Garden', 'Security', 'Community Center', 'School Nearby'],
    '{"walkScore": 55, "schoolRating": 6, "developmentPotential": 8, "publicTransport": "Bus planned"}',
    '{"estimatedRoi": 10.2, "rentalYield": 5.5, "appreciationRate": 20, "riskScore": 5}',
    false, NOW()
);

-- Add some properties with different statuses
INSERT INTO properties (
    title, description, property_type, status, 
    province, district, city, ward, street_address, address,
    latitude, longitude,
    total_area, usable_area, bedrooms, bathrooms, year_built,
    list_price, price_per_sqm,
    legal_status, ownership_type,
    images, features, amenities,
    is_featured, published_at
) VALUES 
(
    'Landmark 81 - Căn hộ đã bán',
    'Căn hộ cao cấp tại Landmark 81 đã được bán thành công.',
    'apartment', 'sold',
    'Ho Chi Minh City', 'Binh Thanh', 'Ho Chi Minh City', 'Ward 22', 'Nguyen Huu Canh Street', 'Landmark 81, Ward 22, Binh Thanh District, Ho Chi Minh City',
    10.7946, 106.7197,
    95.0, 82.0, 3, 2, 2018,
    12000000000, 126315000,
    'red_book', 'individual',
    '["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00"]',
    '["luxury", "tallest_building", "premium_location"]',
    ARRAY['Sky Bar', 'Observatory', 'Premium Services'],
    true, NOW()
),
(
    'Saigon Pearl - Căn hộ cho thuê',
    'Căn hộ 2 phòng ngủ tại Saigon Pearl cho thuê với giá 25 triệu/tháng.',
    'apartment', 'for_rent',
    'Ho Chi Minh City', 'Binh Thanh', 'Ho Chi Minh City', 'Ward 22', 'Nguyen Huu Canh Street', 'Saigon Pearl, Ward 22, Binh Thanh District, Ho Chi Minh City',
    10.7925, 106.7189,
    78.0, 68.0, 2, 2, 2016,
    6500000000, 83333000,
    'red_book', 'individual',
    '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"]',
    '["river_view", "luxury_rental", "furnished"]',
    ARRAY['Swimming Pool', 'Gym', 'Concierge'],
    false, NOW()
);

-- Update view counts and add some variety
UPDATE properties SET view_count = FLOOR(RANDOM() * 1000) + 50;
UPDATE properties SET tags = ARRAY['luxury', 'investment'] WHERE property_type = 'villa';
UPDATE properties SET tags = ARRAY['family', 'convenient'] WHERE bedrooms >= 3;
UPDATE properties SET tags = ARRAY['studio', 'young_professional'] WHERE bedrooms = 1;

-- Add some properties without full data to test edge cases
INSERT INTO properties (
    title, property_type, status,
    province, district, city,
    list_price,
    published_at
) VALUES 
(
    'Căn hộ cần cập nhật thông tin',
    'apartment', 'for_sale',
    'Ho Chi Minh City', 'District 1', 'Ho Chi Minh City',
    5000000000,
    NOW()
);

COMMIT;