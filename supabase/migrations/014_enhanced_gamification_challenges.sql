-- Enhanced Gamification Challenges System Migration
-- Adds diverse challenge types like No-Spend Days, Budget Adherence, Saving Streaks
-- Part of Ticket 7: Implement Diverse Gamification Challenges

-- =============================================
-- INSERT DIVERSE CHALLENGE TYPES
-- =============================================

-- No-Spend Challenges
INSERT INTO expense_challenges (
    name_en,
    name_vi,
    description_en,
    description_vi,
    challenge_type,
    category,
    requirement_description,
    target_value,
    duration_days,
    experience_points,
    completion_badge,
    is_active
) VALUES 
-- 3-Day No-Spend Challenge
(
    '3-Day No-Spend Challenge',
    'Thử thách 3 ngày không chi tiêu',
    'Go 3 consecutive days without any non-essential expenses',
    'Thử thách bản thân không chi tiêu không cần thiết trong 3 ngày liên tiếp',
    'special',
    'saving',
    '{"type": "no_spend_streak", "streak_days": 3, "allowed_categories": ["Bills & Utilities", "Healthcare"], "allowed_category_ids": []}',
    3,
    3,
    150,
    'diamond-shield',
    true
),
-- 7-Day No-Spend Challenge
(
    '7-Day No-Spend Challenge', 
    'Thử thách 7 ngày không chi tiêu',
    'Complete a full week without non-essential spending',
    'Hoàn thành một tuần không chi tiêu không cần thiết',
    'weekly',
    'saving',
    '{"type": "no_spend_streak", "streak_days": 7, "allowed_categories": ["Bills & Utilities", "Healthcare", "Food & Dining"], "max_daily_food": 100000}',
    7,
    7,
    400,
    'gold-trophy',
    true
),
-- Weekend No-Spend Challenge
(
    'Weekend No-Spend Challenge',
    'Thử thách cuối tuần không chi tiêu',
    'Spend no money during the weekend except for essentials',
    'Không chi tiêu trong cuối tuần ngoại trừ các chi phí thiết yếu',
    'weekly',
    'saving',
    '{"type": "weekend_no_spend", "weekend_days": ["saturday", "sunday"], "allowed_categories": ["Healthcare"]}',
    2,
    7,
    200,
    'weekend-warrior',
    true
),

-- Budget Adherence Challenges
(
    'Perfect Week Budget',
    'Tuần tuân thủ ngân sách hoàn hảo',
    'Stay within your weekly budget for all categories',
    'Tuân thủ hoàn toàn ngân sách hàng tuần cho tất cả danh mục',
    'weekly',
    'budgeting',
    '{"type": "budget_adherence", "adherence_percentage": 100, "check_categories": "all", "period": "weekly"}',
    100,
    7,
    300,
    'budget-master',
    true
),
(
    'Monthly Budget Champion',
    'Nhà vô địch ngân sách tháng',
    'Stay within 95% of your monthly budget across all categories',
    'Giữ mức chi tiêu trong vòng 95% ngân sách tháng cho tất cả danh mục',
    'monthly',
    'budgeting',
    '{"type": "budget_adherence", "adherence_percentage": 95, "check_categories": "all", "period": "monthly", "allow_overage": 0.05}',
    95,
    30,
    500,
    'gold-crown',
    true
),
(
    'Food Budget Hero',
    'Anh hùng ngân sách ăn uống',
    'Stay within your food & dining budget for 2 weeks',
    'Tuân thủ ngân sách ăn uống trong 2 tuần',
    'special',
    'budgeting',
    '{"type": "category_budget_adherence", "category": "Food & Dining", "adherence_percentage": 100, "period_days": 14}',
    100,
    14,
    250,
    'chef-hat',
    true
),

-- Saving Streak Challenges
(
    'Daily Saver Streak',
    'Chuỗi tiết kiệm hàng ngày',
    'Save money for 7 consecutive days',
    'Tiết kiệm tiền trong 7 ngày liên tiếp',
    'weekly',
    'saving',
    '{"type": "saving_streak", "streak_days": 7, "min_daily_savings": 10000, "measure": "net_positive"}',
    7,
    7,
    300,
    'savings-streak',
    true
),
(
    'Super Saver Month',
    'Tháng siêu tiết kiệm',
    'Save at least 50,000 VND every day for 30 days',
    'Tiết kiệm ít nhất 50,000 VND mỗi ngày trong 30 ngày',
    'monthly',
    'saving',
    '{"type": "daily_savings_target", "daily_target": 50000, "streak_days": 30, "measurement": "net_income_minus_expense"}',
    30,
    30,
    800,
    'super-saver',
    true
),

-- Smart Spending Challenges
(
    'Mindful Spender',
    'Người chi tiêu có ý thức',
    'Add a note or photo receipt for every transaction for 5 days',
    'Thêm ghi chú hoặc chụp hóa đơn cho mọi giao dịch trong 5 ngày',
    'special',
    'tracking',
    '{"type": "transaction_completeness", "require_notes": true, "require_receipts": false, "streak_days": 5, "min_transactions": 3}',
    5,
    5,
    200,
    'mindful-eye',
    true
),
(
    'Receipt Master',
    'Bậc thầy hóa đơn',
    'Capture receipts for all purchases over 20,000 VND for one week',
    'Chụp hóa đơn cho tất cả giao dịch trên 20,000 VND trong một tuần',
    'weekly',
    'tracking',
    '{"type": "receipt_completeness", "min_amount": 20000, "completion_rate": 100, "period_days": 7}',
    100,
    7,
    250,
    'receipt-collector',
    true
),

-- Goal-Oriented Challenges
(
    'House Fund Booster',
    'Tăng tốc quỹ mua nhà',
    'Contribute to your house savings goal for 10 consecutive days',
    'Đóng góp vào mục tiêu tiết kiệm mua nhà trong 10 ngày liên tiếp',
    'special',
    'house_goal',
    '{"type": "goal_contribution_streak", "goal_type": "buy_house", "streak_days": 10, "min_daily_amount": 25000}',
    10,
    10,
    400,
    'house-dream',
    true
),
(
    'Emergency Fund Builder',
    'Xây dựng quỹ khẩn cấp',
    'Add to your emergency fund 15 times in a month',
    'Bổ sung vào quỹ khẩn cấp 15 lần trong một tháng',
    'monthly',
    'saving',
    '{"type": "goal_contribution_frequency", "goal_type": "emergency_fund", "target_contributions": 15, "period_days": 30}',
    15,
    30,
    350,
    'safety-net',
    true
),

-- Social/Comparative Challenges
(
    'Beat Yesterday',
    'Vượt qua hôm qua',
    'Spend less today than you did yesterday for 5 consecutive days',
    'Chi tiêu ít hơn hôm nay so với hôm qua trong 5 ngày liên tiếp',
    'special',
    'saving',
    '{"type": "daily_improvement", "metric": "daily_expenses", "comparison": "previous_day", "improvement": "decrease", "streak_days": 5}',
    5,
    5,
    180,
    'improvement-arrow',
    true
),
(
    'Monthly Challenge Champion',
    'Nhà vô địch thử thách tháng',
    'Complete 3 different challenges in one month',
    'Hoàn thành 3 thử thách khác nhau trong một tháng',
    'monthly',
    'tracking',
    '{"type": "challenge_completion", "target_challenges": 3, "period_days": 30, "require_different_categories": true}',
    3,
    30,
    600,
    'challenge-master',
    true
),

-- Habit Formation Challenges
(
    'Morning Financial Check',
    'Kiểm tra tài chính buổi sáng',
    'Check your financial dashboard every morning for a week',
    'Kiểm tra bảng điều khiển tài chính mỗi sáng trong một tuần',
    'weekly',
    'tracking',
    '{"type": "habit_tracking", "habit": "morning_check", "required_time_range": "06:00-12:00", "streak_days": 7}',
    7,
    7,
    150,
    'morning-star',
    true
),
(
    'Evening Expense Review',
    'Xem lại chi tiêu buổi tối',
    'Review your daily expenses every evening for 10 days',
    'Xem lại chi tiêu hàng ngày mỗi tối trong 10 ngày',
    'special',
    'tracking',
    '{"type": "habit_tracking", "habit": "evening_review", "required_time_range": "18:00-23:59", "streak_days": 10}',
    10,
    10,
    200,
    'evening-owl',
    true
),

-- Seasonal/Special Event Challenges
(
    'Holiday Budget Defender',
    'Bảo vệ ngân sách ngày lễ',
    'Stay within holiday shopping budget during festive season',
    'Giữ ngân sách mua sắm ngày lễ trong mùa lễ hội',
    'special',
    'budgeting',
    '{"type": "seasonal_budget", "season": "holidays", "category": "Shopping", "budget_multiplier": 1.5, "period_days": 14}',
    100,
    14,
    400,
    'holiday-shield',
    true
),
(
    'New Year Financial Fresh Start',
    'Khởi đầu tài chính năm mới',
    'Set up budgets for all categories and track expenses for first week of the year',
    'Thiết lập ngân sách cho tất cả danh mục và theo dõi chi tiêu tuần đầu năm',
    'special',
    'budgeting',
    '{"type": "fresh_start", "require_budget_setup": true, "track_all_expenses": true, "period_days": 7, "min_categories": 5}',
    100,
    7,
    300,
    'new-year-star',
    false
);

-- =============================================
-- UPDATE EXISTING CHALLENGES
-- =============================================

-- Update existing basic challenges with enhanced requirement descriptions
UPDATE expense_challenges 
SET requirement_description = '{"type": "transaction_tracking", "min_transactions": 5, "period_days": 1, "categories": "all"}'
WHERE name_vi LIKE '%theo dõi chi tiêu hàng ngày%' AND requirement_description IS NULL;

UPDATE expense_challenges 
SET requirement_description = '{"type": "budget_setup", "min_categories": 3, "require_amounts": true, "period": "monthly"}'
WHERE name_vi LIKE '%thiết lập ngân sách%' AND requirement_description IS NULL;

UPDATE expense_challenges 
SET requirement_description = '{"type": "savings_goal", "goal_type": "emergency_fund", "min_amount": 100000, "period_days": 7}'
WHERE name_vi LIKE '%tiết kiệm khẩn cấp%' AND requirement_description IS NULL;

-- =============================================
-- CREATE CHALLENGE TRACKING FUNCTIONS
-- =============================================

-- Function to check no-spend streak challenges
CREATE OR REPLACE FUNCTION check_no_spend_challenge_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    challenge_record RECORD;
    user_challenge_record RECORD;
    streak_data JSONB;
    current_streak INTEGER;
    challenge_req JSONB;
    is_expense_allowed BOOLEAN;
    today_date DATE;
BEGIN
    today_date := CURRENT_DATE;
    
    -- Only process expense transactions
    IF NEW.transaction_type != 'expense' THEN
        RETURN NEW;
    END IF;
    
    -- Find active no-spend challenges for this user
    FOR challenge_record IN
        SELECT ec.*, uec.id as user_challenge_id, uec.progress_data, uec.current_progress
        FROM expense_challenges ec
        JOIN user_expense_challenges uec ON ec.id = uec.challenge_id
        WHERE uec.user_id = NEW.user_id
        AND uec.is_completed = false
        AND uec.is_abandoned = false
        AND ec.is_active = true
        AND ec.requirement_description->>'type' IN ('no_spend_streak', 'weekend_no_spend')
    LOOP
        challenge_req := challenge_record.requirement_description;
        is_expense_allowed := false;
        
        -- Check if this expense is allowed based on challenge rules
        IF challenge_req ? 'allowed_categories' THEN
            -- Check if expense category is in allowed list
            SELECT EXISTS (
                SELECT 1 FROM expense_categories cat
                WHERE cat.id = NEW.expense_category_id
                AND cat.name_vi = ANY(SELECT jsonb_array_elements_text(challenge_req->'allowed_categories'))
            ) INTO is_expense_allowed;
        END IF;
        
        -- Check special amount limits for allowed categories (e.g., max daily food)
        IF is_expense_allowed AND challenge_req ? 'max_daily_food' THEN
            -- Check if today's food spending exceeds limit
            DECLARE
                today_food_total DECIMAL(15,2);
            BEGIN
                SELECT COALESCE(SUM(amount), 0)
                INTO today_food_total
                FROM expense_transactions et
                JOIN expense_categories cat ON et.expense_category_id = cat.id
                WHERE et.user_id = NEW.user_id
                AND et.transaction_date = NEW.transaction_date
                AND cat.name_vi = 'Food & Dining'
                AND et.id != NEW.id; -- Exclude current transaction
                
                IF today_food_total + NEW.amount > (challenge_req->>'max_daily_food')::DECIMAL THEN
                    is_expense_allowed := false;
                END IF;
            END;
        END IF;
        
        -- If expense is not allowed, reset streak
        IF NOT is_expense_allowed THEN
            streak_data := COALESCE(challenge_record.progress_data, '{}'::jsonb);
            streak_data := jsonb_set(streak_data, '{current_streak}', '0');
            streak_data := jsonb_set(streak_data, '{last_reset_date}', to_jsonb(today_date));
            streak_data := jsonb_set(streak_data, '{reset_reason}', '"non_essential_expense"');
            
            UPDATE user_expense_challenges
            SET 
                progress_data = streak_data,
                current_progress = 0,
                updated_at = NOW()
            WHERE id = challenge_record.user_challenge_id;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$;

-- Function to update daily progress for various challenges
CREATE OR REPLACE FUNCTION update_daily_challenge_progress()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    challenge_record RECORD;
    user_record RECORD;
    progress_data JSONB;
    current_streak INTEGER;
    today_date DATE;
    yesterday_date DATE;
    challenge_req JSONB;
BEGIN
    today_date := CURRENT_DATE;
    yesterday_date := today_date - INTERVAL '1 day';
    
    -- Process all active challenges that need daily updates
    FOR challenge_record IN
        SELECT ec.*, uec.id as user_challenge_id, uec.user_id, uec.progress_data, 
               uec.current_progress, uec.started_at
        FROM expense_challenges ec
        JOIN user_expense_challenges uec ON ec.id = uec.challenge_id
        WHERE uec.is_completed = false
        AND uec.is_abandoned = false
        AND ec.is_active = true
        AND ec.requirement_description->>'type' IN (
            'no_spend_streak', 'saving_streak', 'daily_savings_target', 
            'habit_tracking', 'daily_improvement'
        )
    LOOP
        challenge_req := challenge_record.requirement_description;
        progress_data := COALESCE(challenge_record.progress_data, '{}'::jsonb);
        current_streak := COALESCE((progress_data->>'current_streak')::INTEGER, 0);
        
        -- Handle different challenge types
        CASE challenge_req->>'type'
            
            WHEN 'no_spend_streak' THEN
                -- Check if yesterday had no non-essential expenses
                DECLARE
                    had_non_essential_expense BOOLEAN;
                BEGIN
                    SELECT EXISTS (
                        SELECT 1 FROM expense_transactions et
                        LEFT JOIN expense_categories cat ON et.expense_category_id = cat.id
                        WHERE et.user_id = challenge_record.user_id
                        AND et.transaction_date = yesterday_date
                        AND et.transaction_type = 'expense'
                        AND (cat.name_vi IS NULL OR NOT (cat.name_vi = ANY(SELECT jsonb_array_elements_text(challenge_req->'allowed_categories'))))
                    ) INTO had_non_essential_expense;
                    
                    IF NOT had_non_essential_expense THEN
                        current_streak := current_streak + 1;
                        progress_data := jsonb_set(progress_data, '{current_streak}', to_jsonb(current_streak));
                        progress_data := jsonb_set(progress_data, '{last_success_date}', to_jsonb(yesterday_date));
                    ELSE
                        current_streak := 0;
                        progress_data := jsonb_set(progress_data, '{current_streak}', '0');
                        progress_data := jsonb_set(progress_data, '{last_reset_date}', to_jsonb(yesterday_date));
                    END IF;
                END;
                
            WHEN 'saving_streak' THEN
                -- Check if yesterday had positive savings (income > expenses)
                DECLARE
                    yesterday_net DECIMAL(15,2);
                    min_savings DECIMAL(15,2);
                BEGIN
                    min_savings := COALESCE((challenge_req->>'min_daily_savings')::DECIMAL, 0);
                    
                    SELECT COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE -amount END), 0)
                    INTO yesterday_net
                    FROM expense_transactions
                    WHERE user_id = challenge_record.user_id
                    AND transaction_date = yesterday_date;
                    
                    IF yesterday_net >= min_savings THEN
                        current_streak := current_streak + 1;
                        progress_data := jsonb_set(progress_data, '{current_streak}', to_jsonb(current_streak));
                        progress_data := jsonb_set(progress_data, '{last_success_date}', to_jsonb(yesterday_date));
                        progress_data := jsonb_set(progress_data, '{yesterday_savings}', to_jsonb(yesterday_net));
                    ELSE
                        current_streak := 0;
                        progress_data := jsonb_set(progress_data, '{current_streak}', '0');
                        progress_data := jsonb_set(progress_data, '{last_reset_date}', to_jsonb(yesterday_date));
                    END IF;
                END;
                
            ELSE
                -- Handle other challenge types
                CONTINUE;
        END CASE;
        
        -- Update the challenge progress
        UPDATE user_expense_challenges
        SET 
            current_progress = GREATEST(current_streak, current_progress),
            progress_data = progress_data,
            updated_at = NOW(),
            is_completed = (current_streak >= (challenge_req->>'streak_days')::INTEGER)
        WHERE id = challenge_record.user_challenge_id;
        
        -- Award XP if challenge is completed
        IF current_streak >= (challenge_req->>'streak_days')::INTEGER THEN
            UPDATE user_expense_challenges
            SET completed_at = NOW()
            WHERE id = challenge_record.user_challenge_id AND completed_at IS NULL;
            
            -- Add XP to user (this would integrate with existing XP system)
            -- This is a placeholder for the XP awarding logic
        END IF;
    END LOOP;
END;
$$;

-- Create trigger for real-time challenge progress tracking
CREATE TRIGGER trigger_check_no_spend_challenges
    AFTER INSERT OR UPDATE ON expense_transactions
    FOR EACH ROW
    EXECUTE FUNCTION check_no_spend_challenge_progress();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Index for challenge requirement queries
CREATE INDEX IF NOT EXISTS idx_expense_challenges_requirement_type 
ON expense_challenges ((requirement_description->>'type'));

-- Index for active challenges
CREATE INDEX IF NOT EXISTS idx_expense_challenges_active_type 
ON expense_challenges (is_active, challenge_type) WHERE is_active = true;

-- Index for user challenge progress queries
CREATE INDEX IF NOT EXISTS idx_user_challenges_active_progress 
ON user_expense_challenges (user_id, is_completed, is_abandoned) 
WHERE is_completed = false AND is_abandoned = false;

-- =============================================
-- CREATE DAILY CRON JOB (requires pg_cron extension)
-- =============================================

-- This would run daily at midnight to update challenge progress
-- SELECT cron.schedule('update-challenge-progress', '0 0 * * *', 'SELECT update_daily_challenge_progress();');

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

GRANT EXECUTE ON FUNCTION check_no_spend_challenge_progress() TO authenticated;
GRANT EXECUTE ON FUNCTION update_daily_challenge_progress() TO authenticated;
GRANT EXECUTE ON FUNCTION update_daily_challenge_progress() TO service_role;