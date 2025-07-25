-- 005_add_plan_progress_tracking
-- Migration: Add plan progress tracking capabilities
-- This addresses the missing plan progress, milestones, and favorites functionality

-- Add missing fields to financial_plans table
ALTER TABLE financial_plans 
ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE,
ADD COLUMN roi DECIMAL(5,2),
ADD COLUMN total_progress INTEGER DEFAULT 0 CHECK (total_progress >= 0 AND total_progress <= 100),
ADD COLUMN financial_progress INTEGER DEFAULT 0 CHECK (financial_progress >= 0 AND financial_progress <= 100),
ADD COLUMN monthly_contribution BIGINT DEFAULT 0,
ADD COLUMN estimated_completion_date DATE,
ADD COLUMN risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
ADD COLUMN tags TEXT[] DEFAULT '{}',
ADD COLUMN notes TEXT,
ADD COLUMN shared_with TEXT[] DEFAULT '{}';

-- Create plan_milestones table
CREATE TABLE plan_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES financial_plans(id) ON DELETE CASCADE,
    
    -- Milestone details
    title TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('financial', 'legal', 'property', 'admin', 'personal')) DEFAULT 'financial',
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    
    -- Financial tracking
    required_amount BIGINT,
    current_amount BIGINT DEFAULT 0,
    
    -- Timeline
    target_date DATE,
    completed_date DATE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_amounts CHECK (
        (required_amount IS NULL OR required_amount >= 0) AND
        (current_amount IS NULL OR current_amount >= 0) AND
        (required_amount IS NULL OR current_amount IS NULL OR current_amount <= required_amount)
    ),
    CONSTRAINT valid_completion CHECK (
        (status != 'completed') OR (completed_date IS NOT NULL)
    )
);

-- Create plan_status_history table to track status changes
CREATE TABLE plan_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES financial_plans(id) ON DELETE CASCADE,
    
    -- Status tracking
    status plan_status NOT NULL,
    note TEXT,
    changed_by UUID REFERENCES user_profiles(id),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_favorites table for various entities
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Favorited entity
    entity_type TEXT NOT NULL CHECK (entity_type IN ('property', 'financial_plan', 'bank', 'scenario')),
    entity_id UUID NOT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one favorite per user per entity
    UNIQUE(user_id, entity_type, entity_id)
);

-- Add indexes for performance
CREATE INDEX idx_plan_milestones_plan_id ON plan_milestones(plan_id);
CREATE INDEX idx_plan_milestones_status ON plan_milestones(status);
CREATE INDEX idx_plan_milestones_target_date ON plan_milestones(target_date);
CREATE INDEX idx_plan_status_history_plan_id ON plan_status_history(plan_id);
CREATE INDEX idx_plan_status_history_created_at ON plan_status_history(created_at);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_entity ON user_favorites(entity_type, entity_id);
CREATE INDEX idx_financial_plans_is_favorite ON financial_plans(is_favorite) WHERE is_favorite = true;

-- Create trigger to update plan progress based on milestones
CREATE OR REPLACE FUNCTION update_plan_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_milestones INTEGER;
    completed_milestones INTEGER;
    financial_milestones INTEGER;
    completed_financial_milestones INTEGER;
    new_total_progress INTEGER;
    new_financial_progress INTEGER;
BEGIN
    -- Count total and completed milestones
    SELECT 
        COUNT(*), 
        COUNT(*) FILTER (WHERE status = 'completed')
    INTO total_milestones, completed_milestones
    FROM plan_milestones 
    WHERE plan_id = COALESCE(NEW.plan_id, OLD.plan_id);
    
    -- Count financial milestones specifically
    SELECT 
        COUNT(*), 
        COUNT(*) FILTER (WHERE status = 'completed')
    INTO financial_milestones, completed_financial_milestones
    FROM plan_milestones 
    WHERE plan_id = COALESCE(NEW.plan_id, OLD.plan_id) 
    AND category = 'financial';
    
    -- Calculate progress percentages
    new_total_progress := CASE 
        WHEN total_milestones = 0 THEN 0 
        ELSE (completed_milestones * 100 / total_milestones) 
    END;
    
    new_financial_progress := CASE 
        WHEN financial_milestones = 0 THEN 0 
        ELSE (completed_financial_milestones * 100 / financial_milestones) 
    END;
    
    -- Update the financial plan
    UPDATE financial_plans 
    SET 
        total_progress = new_total_progress,
        financial_progress = new_financial_progress,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.plan_id, OLD.plan_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_plan_progress
    AFTER INSERT OR UPDATE OR DELETE ON plan_milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_plan_progress();

-- Create trigger to automatically create status history
CREATE OR REPLACE FUNCTION create_status_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create history for status changes
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO plan_status_history (plan_id, status, note, changed_by)
        VALUES (
            NEW.id, 
            NEW.status, 
            CASE 
                WHEN TG_OP = 'INSERT' THEN 'Plan created'
                ELSE 'Status updated'
            END,
            NEW.user_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_status_history
    AFTER INSERT OR UPDATE ON financial_plans
    FOR EACH ROW
    EXECUTE FUNCTION create_status_history();

-- Add RLS policies
ALTER TABLE plan_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Policies for plan_milestones
CREATE POLICY "Users can view milestones for their plans" ON plan_milestones
    FOR SELECT USING (
        plan_id IN (
            SELECT id FROM financial_plans WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage milestones for their plans" ON plan_milestones
    FOR ALL USING (
        plan_id IN (
            SELECT id FROM financial_plans WHERE user_id = auth.uid()
        )
    );

-- Policies for plan_status_history
CREATE POLICY "Users can view status history for their plans" ON plan_status_history
    FOR SELECT USING (
        plan_id IN (
            SELECT id FROM financial_plans WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create status history for their plans" ON plan_status_history
    FOR INSERT WITH CHECK (
        plan_id IN (
            SELECT id FROM financial_plans WHERE user_id = auth.uid()
        )
    );

-- Policies for user_favorites
CREATE POLICY "Users can manage their own favorites" ON user_favorites
    FOR ALL USING (user_id = auth.uid());

-- Add comments for documentation
COMMENT ON TABLE plan_milestones IS 'Tracks milestones and progress for financial plans';
COMMENT ON TABLE plan_status_history IS 'Audit trail for financial plan status changes';
COMMENT ON TABLE user_favorites IS 'User favorites for properties, plans, and other entities';
COMMENT ON COLUMN financial_plans.is_favorite IS 'Whether the user has marked this plan as favorite';
COMMENT ON COLUMN financial_plans.roi IS 'Return on investment percentage for investment plans';
COMMENT ON COLUMN financial_plans.total_progress IS 'Overall completion percentage (0-100)';
COMMENT ON COLUMN financial_plans.financial_progress IS 'Financial milestones completion percentage (0-100)';
COMMENT ON COLUMN financial_plans.monthly_contribution IS 'Monthly savings contribution towards plan goals';
COMMENT ON COLUMN financial_plans.estimated_completion_date IS 'Estimated date when all plan goals will be achieved';