// lib/supabase/types.ts  
// TypeScript types generated from FinHome unified database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          phone: string | null
          date_of_birth: string | null
          occupation: string | null
          company: string | null
          monthly_income: number | null
          city: string | null
          district: string | null
          address: string | null
          location: Json | null
          currency: string
          language: string
          timezone: string
          preferred_language: string
          currency_format: string
          subscription_tier: 'free' | 'premium' | 'professional'
          subscription_expires_at: string | null
          annual_income: number | null
          monthly_expenses: number | null
          current_assets: number | null
          current_debts: number | null
          experience_points: number
          achievement_badges: string[]
          onboarding_completed: boolean
          notification_preferences: Json
          created_at: string
          updated_at: string
          last_login_at: string | null
          is_active: boolean
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          occupation?: string | null
          company?: string | null
          monthly_income?: number | null
          city?: string | null
          district?: string | null
          address?: string | null
          location?: Json | null
          currency?: string
          language?: string
          timezone?: string
          preferred_language?: string
          currency_format?: string
          subscription_tier?: 'free' | 'premium' | 'professional'
          subscription_expires_at?: string | null
          annual_income?: number | null
          monthly_expenses?: number | null
          current_assets?: number | null
          current_debts?: number | null
          experience_points?: number
          achievement_badges?: string[]
          onboarding_completed?: boolean
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          occupation?: string | null
          company?: string | null
          monthly_income?: number | null
          city?: string | null
          district?: string | null
          address?: string | null
          location?: Json | null
          currency?: string
          language?: string
          timezone?: string
          preferred_language?: string
          currency_format?: string
          subscription_tier?: 'free' | 'premium' | 'professional'
          subscription_expires_at?: string | null
          annual_income?: number | null
          monthly_expenses?: number | null
          current_assets?: number | null
          current_debts?: number | null
          experience_points?: number
          achievement_badges?: string[]
          onboarding_completed?: boolean
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          is_active?: boolean
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          email_notifications: boolean
          push_notifications: boolean
          achievement_notifications: boolean
          market_update_notifications: boolean
          payment_reminder_notifications: boolean
          theme: 'light' | 'dark'
          dashboard_layout: 'grid' | 'list'
          dashboard_widgets: Json
          profile_visibility: 'public' | 'private' | 'friends'
          allow_data_sharing: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_notifications?: boolean
          push_notifications?: boolean
          achievement_notifications?: boolean
          market_update_notifications?: boolean
          payment_reminder_notifications?: boolean
          theme?: 'light' | 'dark'
          dashboard_layout?: 'grid' | 'list'
          dashboard_widgets?: Json
          profile_visibility?: 'public' | 'private' | 'friends'
          allow_data_sharing?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_notifications?: boolean
          push_notifications?: boolean
          achievement_notifications?: boolean
          market_update_notifications?: boolean
          payment_reminder_notifications?: boolean
          theme?: 'light' | 'dark'
          dashboard_layout?: 'grid' | 'list'
          dashboard_widgets?: Json
          profile_visibility?: 'public' | 'private' | 'friends'
          allow_data_sharing?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          status: 'active' | 'inactive' | 'trialing' | 'past_due' | 'canceled' | 'unpaid'
          plan_name: string | null
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          trial_start: string | null
          trial_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          status?: 'active' | 'inactive' | 'trialing' | 'past_due' | 'canceled' | 'unpaid'
          plan_name?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          trial_start?: string | null
          trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          status?: 'active' | 'inactive' | 'trialing' | 'past_due' | 'canceled' | 'unpaid'
          plan_name?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          trial_start?: string | null
          trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      billing_history: {
        Row: {
          id: string
          user_id: string
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          amount_paid: number
          currency: string
          status: string
          invoice_url: string | null
          invoice_pdf: string | null
          billing_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          amount_paid: number
          currency?: string
          status: string
          invoice_url?: string | null
          invoice_pdf?: string | null
          billing_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          amount_paid?: number
          currency?: string
          status?: string
          invoice_url?: string | null
          invoice_pdf?: string | null
          billing_reason?: string | null
          created_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          id: string
          title: string
          property_name: string | null
          description: string | null
          property_type: 'apartment' | 'house' | 'villa' | 'townhouse' | 'land' | 'commercial'
          status: 'for_sale' | 'sold' | 'for_rent' | 'rented' | 'off_market'
          province: string
          district: string
          city: string
          ward: string | null
          street_address: string | null
          address: string | null
          latitude: number | null
          longitude: number | null
          total_area: number | null
          area_sqm: number | null
          usable_area: number | null
          bedrooms: number | null
          bathrooms: number | null
          floors: number | null
          floor_number: number | null
          total_floors: number | null
          year_built: number | null
          list_price: number
          listed_price: number | null
          price_per_sqm: number | null
          market_value_estimate: number | null
          legal_status: string | null
          ownership_type: string | null
          images: Json
          features: Json
          amenities: string[] | null
          property_features: Json | null
          neighborhood_data: Json | null
          investment_metrics: Json | null
          slug: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
          published_at: string | null
          is_featured: boolean
          view_count: number
          source_url: string | null
          source_platform: string | null
          external_id: string | null
        }
        Insert: {
          id?: string
          title: string
          property_name?: string | null
          description?: string | null
          property_type: 'apartment' | 'house' | 'villa' | 'townhouse' | 'land' | 'commercial'
          status?: 'for_sale' | 'sold' | 'for_rent' | 'rented' | 'off_market'
          province: string
          district: string
          city: string
          ward?: string | null
          street_address?: string | null
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          total_area?: number | null
          area_sqm?: number | null
          usable_area?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          floors?: number | null
          floor_number?: number | null
          total_floors?: number | null
          year_built?: number | null
          list_price: number
          listed_price?: number | null
          price_per_sqm?: number | null
          market_value_estimate?: number | null
          legal_status?: string | null
          ownership_type?: string | null
          images?: Json
          features?: Json
          amenities?: string[] | null
          property_features?: Json | null
          neighborhood_data?: Json | null
          investment_metrics?: Json | null
          slug?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
          is_featured?: boolean
          view_count?: number
          source_url?: string | null
          source_platform?: string | null
          external_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          property_name?: string | null
          description?: string | null
          property_type?: 'apartment' | 'house' | 'villa' | 'townhouse' | 'land' | 'commercial'
          status?: 'for_sale' | 'sold' | 'for_rent' | 'rented' | 'off_market'
          province?: string
          district?: string
          city?: string
          ward?: string | null
          street_address?: string | null
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          total_area?: number | null
          area_sqm?: number | null
          usable_area?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          floors?: number | null
          floor_number?: number | null
          total_floors?: number | null
          year_built?: number | null
          list_price?: number
          listed_price?: number | null
          price_per_sqm?: number | null
          market_value_estimate?: number | null
          legal_status?: string | null
          ownership_type?: string | null
          images?: Json
          features?: Json
          amenities?: string[] | null
          property_features?: Json | null
          neighborhood_data?: Json | null
          investment_metrics?: Json | null
          slug?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
          is_featured?: boolean
          view_count?: number
          source_url?: string | null
          source_platform?: string | null
          external_id?: string | null
        }
        Relationships: []
      }
      financial_plans: {
        Row: {
          id: string
          user_id: string
          plan_name: string
          description: string | null
          plan_type: 'home_purchase' | 'investment' | 'upgrade' | 'refinance'
          status: 'draft' | 'active' | 'completed' | 'archived'
          property_id: string | null
          custom_property_data: Json | null
          target_age: number | null
          current_monthly_income: number | null
          monthly_income: number | null
          current_monthly_expenses: number | null
          monthly_expenses: number | null
          current_savings: number | null
          dependents: number
          purchase_price: number | null
          down_payment: number | null
          additional_costs: number
          other_debts: number
          target_property_type: 'apartment' | 'house' | 'villa' | 'townhouse' | 'land' | 'commercial' | null
          target_location: string | null
          target_budget: number | null
          target_timeframe_months: number | null
          investment_purpose: string | null
          desired_features: Json
          down_payment_target: number | null
          risk_tolerance: 'conservative' | 'moderate' | 'aggressive' | null
          investment_horizon_months: number | null
          expected_roi: number | null
          preferred_banks: string[] | null
          expected_rental_income: number | null
          expected_appreciation_rate: number | null
          emergency_fund_target: number | null
          education_fund_target: number | null
          retirement_fund_target: number | null
          other_goals: Json
          feasibility_score: number | null
          recommended_adjustments: Json
          is_public: boolean
          view_count: number
          cached_calculations: Json | null
          calculations_last_updated: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          plan_name: string
          description?: string | null
          plan_type?: 'home_purchase' | 'investment' | 'upgrade' | 'refinance'
          status?: 'draft' | 'active' | 'completed' | 'archived'
          property_id?: string | null
          custom_property_data?: Json | null
          target_age?: number | null
          current_monthly_income?: number | null
          monthly_income?: number | null
          current_monthly_expenses?: number | null
          monthly_expenses?: number | null
          current_savings?: number | null
          dependents?: number
          purchase_price?: number | null
          down_payment?: number | null
          additional_costs?: number
          other_debts?: number
          target_property_type?: 'apartment' | 'house' | 'villa' | 'townhouse' | 'land' | 'commercial' | null
          target_location?: string | null
          target_budget?: number | null
          target_timeframe_months?: number | null
          investment_purpose?: string | null
          desired_features?: Json
          down_payment_target?: number | null
          risk_tolerance?: 'conservative' | 'moderate' | 'aggressive' | null
          investment_horizon_months?: number | null
          expected_roi?: number | null
          preferred_banks?: string[] | null
          expected_rental_income?: number | null
          expected_appreciation_rate?: number | null
          emergency_fund_target?: number | null
          education_fund_target?: number | null
          retirement_fund_target?: number | null
          other_goals?: Json
          feasibility_score?: number | null
          recommended_adjustments?: Json
          is_public?: boolean
          view_count?: number
          cached_calculations?: Json | null
          calculations_last_updated?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          plan_name?: string
          description?: string | null
          plan_type?: 'home_purchase' | 'investment' | 'upgrade' | 'refinance'
          status?: 'draft' | 'active' | 'completed' | 'archived'
          property_id?: string | null
          custom_property_data?: Json | null
          target_age?: number | null
          current_monthly_income?: number | null
          monthly_income?: number | null
          current_monthly_expenses?: number | null
          monthly_expenses?: number | null
          current_savings?: number | null
          dependents?: number
          purchase_price?: number | null
          down_payment?: number | null
          additional_costs?: number
          other_debts?: number
          target_property_type?: 'apartment' | 'house' | 'villa' | 'townhouse' | 'land' | 'commercial' | null
          target_location?: string | null
          target_budget?: number | null
          target_timeframe_months?: number | null
          investment_purpose?: string | null
          desired_features?: Json
          down_payment_target?: number | null
          risk_tolerance?: 'conservative' | 'moderate' | 'aggressive' | null
          investment_horizon_months?: number | null
          expected_roi?: number | null
          preferred_banks?: string[] | null
          expected_rental_income?: number | null
          expected_appreciation_rate?: number | null
          emergency_fund_target?: number | null
          education_fund_target?: number | null
          retirement_fund_target?: number | null
          other_goals?: Json
          feasibility_score?: number | null
          recommended_adjustments?: Json
          is_public?: boolean
          view_count?: number
          cached_calculations?: Json | null
          calculations_last_updated?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_plans_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_plans_property_id_fkey"
            columns: ["property_id"]
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ]
      }
      loan_calculations: {
        Row: {
          id: string
          user_id: string | null
          financial_plan_id: string | null
          calculation_name: string
          property_price: number
          down_payment_amount: number
          loan_amount: number
          interest_rate: number
          loan_term_months: number
          monthly_income: number | null
          monthly_expenses: number | null
          monthly_payment: number
          total_interest: number
          total_payment: number
          loan_to_value_ratio: number | null
          debt_to_income_ratio: number | null
          bank_name: string | null
          bank_product_name: string | null
          amortization_schedule: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          financial_plan_id?: string | null
          calculation_name?: string
          property_price: number
          down_payment_amount: number
          loan_amount: number
          interest_rate: number
          loan_term_months: number
          monthly_income?: number | null
          monthly_expenses?: number | null
          monthly_payment: number
          total_interest: number
          total_payment: number
          loan_to_value_ratio?: number | null
          debt_to_income_ratio?: number | null
          bank_name?: string | null
          bank_product_name?: string | null
          amortization_schedule?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          financial_plan_id?: string | null
          calculation_name?: string
          property_price?: number
          down_payment_amount?: number
          loan_amount?: number
          interest_rate?: number
          loan_term_months?: number
          monthly_income?: number | null
          monthly_expenses?: number | null
          monthly_payment?: number
          total_interest?: number
          total_payment?: number
          loan_to_value_ratio?: number | null
          debt_to_income_ratio?: number | null
          bank_name?: string | null
          bank_product_name?: string | null
          amortization_schedule?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_calculations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_calculations_financial_plan_id_fkey"
            columns: ["financial_plan_id"]
            referencedRelation: "financial_plans"
            referencedColumns: ["id"]
          }
        ]
      }
      banks: {
        Row: {
          id: string
          bank_code: string
          bank_name: string
          bank_name_en: string | null
          logo_url: string | null
          website_url: string | null
          hotline: string | null
          email: string | null
          headquarters_address: string | null
          loan_products: Json
          special_offers: Json
          is_active: boolean
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bank_code: string
          bank_name: string
          bank_name_en?: string | null
          logo_url?: string | null
          website_url?: string | null
          hotline?: string | null
          email?: string | null
          headquarters_address?: string | null
          loan_products?: Json
          special_offers?: Json
          is_active?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bank_code?: string
          bank_name?: string
          bank_name_en?: string | null
          logo_url?: string | null
          website_url?: string | null
          hotline?: string | null
          email?: string | null
          headquarters_address?: string | null
          loan_products?: Json
          special_offers?: Json
          is_active?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      bank_interest_rates: {
        Row: {
          id: string
          bank_id: string
          product_name: string
          loan_type: string
          interest_rate: number
          min_rate: number | null
          max_rate: number | null
          min_loan_amount: number | null
          max_loan_amount: number | null
          max_ltv_ratio: number | null
          min_term_months: number | null
          max_term_months: number | null
          min_income: number | null
          required_documents: Json
          eligibility_criteria: Json
          processing_fee: number | null
          processing_fee_percentage: number | null
          early_payment_fee: number | null
          effective_date: string
          expiry_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bank_id: string
          product_name: string
          loan_type: string
          interest_rate: number
          min_rate?: number | null
          max_rate?: number | null
          min_loan_amount?: number | null
          max_loan_amount?: number | null
          max_ltv_ratio?: number | null
          min_term_months?: number | null
          max_term_months?: number | null
          min_income?: number | null
          required_documents?: Json
          eligibility_criteria?: Json
          processing_fee?: number | null
          processing_fee_percentage?: number | null
          early_payment_fee?: number | null
          effective_date: string
          expiry_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bank_id?: string
          product_name?: string
          loan_type?: string
          interest_rate?: number
          min_rate?: number | null
          max_rate?: number | null
          min_loan_amount?: number | null
          max_loan_amount?: number | null
          max_ltv_ratio?: number | null
          min_term_months?: number | null
          max_term_months?: number | null
          min_income?: number | null
          required_documents?: Json
          eligibility_criteria?: Json
          processing_fee?: number | null
          processing_fee_percentage?: number | null
          early_payment_fee?: number | null
          effective_date?: string
          expiry_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_interest_rates_bank_id_fkey"
            columns: ["bank_id"]
            referencedRelation: "banks"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'info' | 'success' | 'warning' | 'error' | 'achievement'
          title: string
          message: string
          action_url: string | null
          icon: string | null
          image_url: string | null
          is_read: boolean
          is_archived: boolean
          is_sent: boolean
          sent_at: string | null
          delivery_channels: string[]
          priority: number
          created_at: string
          read_at: string | null
          expires_at: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          user_id: string
          type: 'info' | 'success' | 'warning' | 'error' | 'achievement'
          title: string
          message: string
          action_url?: string | null
          icon?: string | null
          image_url?: string | null
          is_read?: boolean
          is_archived?: boolean
          is_sent?: boolean
          sent_at?: string | null
          delivery_channels?: string[]
          priority?: number
          created_at?: string
          read_at?: string | null
          expires_at?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'info' | 'success' | 'warning' | 'error' | 'achievement'
          title?: string
          message?: string
          action_url?: string | null
          icon?: string | null
          image_url?: string | null
          is_read?: boolean
          is_archived?: boolean
          is_sent?: boolean
          sent_at?: string | null
          delivery_channels?: string[]
          priority?: number
          created_at?: string
          read_at?: string | null
          expires_at?: string | null
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      achievements: {
        Row: {
          id: string
          name: string
          name_vi: string
          description: string
          description_vi: string
          achievement_type: 'milestone' | 'usage' | 'financial' | 'social' | 'learning'
          required_actions: Json
          required_value: number | null
          experience_points: number
          badge_icon: string | null
          badge_color: string
          is_active: boolean
          is_hidden: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_vi: string
          description: string
          description_vi: string
          achievement_type: 'milestone' | 'usage' | 'financial' | 'social' | 'learning'
          required_actions: Json
          required_value?: number | null
          experience_points?: number
          badge_icon?: string | null
          badge_color?: string
          is_active?: boolean
          is_hidden?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_vi?: string
          description?: string
          description_vi?: string
          achievement_type?: 'milestone' | 'usage' | 'financial' | 'social' | 'learning'
          required_actions?: Json
          required_value?: number | null
          experience_points?: number
          badge_icon?: string | null
          badge_color?: string
          is_active?: boolean
          is_hidden?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
          progress_data: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
          progress_data?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
          progress_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          }
        ]
      }
      app_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          setting_type: string
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          setting_type: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          setting_type?: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_monthly_payment: {
        Args: {
          principal: number
          annual_rate: number
          term_months: number
        }
        Returns: number
      }
      update_plan_calculations: {
        Args: {
          plan_id: string
        }
        Returns: undefined
      }
      is_admin: {
        Args: {
          user_uuid: string
        }
        Returns: boolean
      }
      get_current_rates: {
        Args: {
          p_loan_term_years?: number
        }
        Returns: {
          bank_name: string
          promotional_rate: number
          standard_rate: number
          min_down_payment: number
        }[]
      }
      get_market_summary: {
        Args: {
          p_city: string
          p_district?: string
        }
        Returns: {
          property_type: 'apartment' | 'house' | 'villa' | 'townhouse' | 'land' | 'commercial'
          avg_price_sqm: number
          rental_yield: number
          price_change_yearly: number
          market_activity: string
        }[]
      }
      create_demo_user_profile: {
        Args: {
          p_user_id: string
          p_email?: string
          p_full_name?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      user_subscription_tier: 'free' | 'premium' | 'professional'
      subscription_status: 'active' | 'inactive' | 'trialing' | 'past_due' | 'canceled' | 'unpaid'
      property_type: 'apartment' | 'house' | 'villa' | 'townhouse' | 'land' | 'commercial'
      property_status: 'for_sale' | 'sold' | 'for_rent' | 'rented' | 'off_market'
      legal_status_enum: 'red_book' | 'pink_book' | 'pending' | 'disputed'
      ownership_type_enum: 'individual' | 'joint' | 'company'
      plan_status: 'draft' | 'active' | 'completed' | 'archived'
      plan_type_enum: 'home_purchase' | 'investment' | 'upgrade' | 'refinance'
      rate_type_enum: 'fixed' | 'variable' | 'mixed'
      rate_category_enum: 'promotional' | 'standard' | 'vip' | 'prime'
      notification_type: 'info' | 'success' | 'warning' | 'error' | 'achievement'
      achievement_type: 'milestone' | 'usage' | 'financial' | 'social' | 'learning'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience type exports
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']
export type Property = Database['public']['Tables']['properties']['Row']
export type FinancialPlan = Database['public']['Tables']['financial_plans']['Row']
export type LoanCalculation = Database['public']['Tables']['loan_calculations']['Row']
export type Bank = Database['public']['Tables']['banks']['Row']
export type BankInterestRate = Database['public']['Tables']['bank_interest_rates']['Row']
export type Achievement = Database['public']['Tables']['achievements']['Row']
export type UserAchievement = Database['public']['Tables']['user_achievements']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type AppSetting = Database['public']['Tables']['app_settings']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type BillingHistory = Database['public']['Tables']['billing_history']['Row']

// Enum types
export type UserSubscriptionTier = Database['public']['Enums']['user_subscription_tier']
export type PropertyType = Database['public']['Enums']['property_type']
export type PropertyStatus = Database['public']['Enums']['property_status']
export type PlanStatus = Database['public']['Enums']['plan_status']
export type NotificationType = Database['public']['Enums']['notification_type']
export type AchievementType = Database['public']['Enums']['achievement_type']

// Insert and Update types
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']
export type PropertyInsert = Database['public']['Tables']['properties']['Insert']
export type PropertyUpdate = Database['public']['Tables']['properties']['Update']
export type FinancialPlanInsert = Database['public']['Tables']['financial_plans']['Insert']
export type FinancialPlanUpdate = Database['public']['Tables']['financial_plans']['Update']
export type LoanCalculationInsert = Database['public']['Tables']['loan_calculations']['Insert']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']