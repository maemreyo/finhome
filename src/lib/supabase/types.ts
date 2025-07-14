// Database types for Supabase

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
          full_name: string | null
          phone_number: string | null
          date_of_birth: string | null
          avatar_url: string | null
          location: Json | null
          occupation: string | null
          company_name: string | null
          annual_income: number | null
          monthly_expenses: number | null
          current_assets: number | null
          current_debts: number | null
          subscription_tier: 'free' | 'premium' | 'professional'
          subscription_expires_at: string | null
          onboarding_completed: boolean
          experience_points: number
          achievement_badges: string[]
          preferred_language: string
          currency_format: string
          notification_preferences: Json
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          phone_number?: string | null
          date_of_birth?: string | null
          avatar_url?: string | null
          location?: Json | null
          occupation?: string | null
          company_name?: string | null
          annual_income?: number | null
          monthly_expenses?: number | null
          current_assets?: number | null
          current_debts?: number | null
          subscription_tier?: 'free' | 'premium' | 'professional'
          subscription_expires_at?: string | null
          onboarding_completed?: boolean
          experience_points?: number
          achievement_badges?: string[]
          preferred_language?: string
          currency_format?: string
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          phone_number?: string | null
          date_of_birth?: string | null
          avatar_url?: string | null
          location?: Json | null
          occupation?: string | null
          company_name?: string | null
          annual_income?: number | null
          monthly_expenses?: number | null
          current_assets?: number | null
          current_debts?: number | null
          subscription_tier?: 'free' | 'premium' | 'professional'
          subscription_expires_at?: string | null
          onboarding_completed?: boolean
          experience_points?: number
          achievement_badges?: string[]
          preferred_language?: string
          currency_format?: string
          notification_preferences?: Json
          updated_at?: string
          last_login_at?: string | null
        }
      }
      properties: {
        Row: {
          id: string
          property_name: string
          property_type: 'apartment' | 'house' | 'villa' | 'townhouse' | 'commercial'
          address: string | null
          district: string | null
          city: string | null
          ward: string | null
          coordinates: unknown | null
          area_sqm: number | null
          bedrooms: number | null
          bathrooms: number | null
          floor_number: number | null
          total_floors: number | null
          listed_price: number
          market_value_estimate: number | null
          price_per_sqm: number | null
          amenities: string[] | null
          property_features: Json | null
          legal_status: 'red_book' | 'pink_book' | 'pending' | 'disputed' | null
          ownership_type: 'individual' | 'joint' | 'company' | null
          neighborhood_data: Json | null
          investment_metrics: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_name: string
          property_type: 'apartment' | 'house' | 'villa' | 'townhouse' | 'commercial'
          address?: string | null
          district?: string | null
          city?: string | null
          ward?: string | null
          coordinates?: unknown | null
          area_sqm?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          floor_number?: number | null
          total_floors?: number | null
          listed_price: number
          market_value_estimate?: number | null
          price_per_sqm?: number | null
          amenities?: string[] | null
          property_features?: Json | null
          legal_status?: 'red_book' | 'pink_book' | 'pending' | 'disputed' | null
          ownership_type?: 'individual' | 'joint' | 'company' | null
          neighborhood_data?: Json | null
          investment_metrics?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_name?: string
          property_type?: 'apartment' | 'house' | 'villa' | 'townhouse' | 'commercial'
          address?: string | null
          district?: string | null
          city?: string | null
          ward?: string | null
          coordinates?: unknown | null
          area_sqm?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          floor_number?: number | null
          total_floors?: number | null
          listed_price?: number
          market_value_estimate?: number | null
          price_per_sqm?: number | null
          amenities?: string[] | null
          property_features?: Json | null
          legal_status?: 'red_book' | 'pink_book' | 'pending' | 'disputed' | null
          ownership_type?: 'individual' | 'joint' | 'company' | null
          neighborhood_data?: Json | null
          investment_metrics?: Json | null
          updated_at?: string
        }
      }
      financial_plans: {
        Row: {
          id: string
          user_id: string
          plan_name: string
          plan_description: string | null
          plan_type: 'home_purchase' | 'investment' | 'upgrade' | 'refinance'
          property_id: string | null
          custom_property_data: Json | null
          purchase_price: number
          down_payment: number
          additional_costs: number
          monthly_income: number
          monthly_expenses: number
          current_savings: number
          other_debts: number
          expected_rental_income: number | null
          expected_appreciation_rate: number | null
          investment_horizon_years: number | null
          plan_status: 'draft' | 'active' | 'completed' | 'archived'
          is_public: boolean
          view_count: number
          cached_calculations: Json | null
          calculations_last_updated: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_name: string
          plan_description?: string | null
          plan_type?: 'home_purchase' | 'investment' | 'upgrade' | 'refinance'
          property_id?: string | null
          custom_property_data?: Json | null
          purchase_price: number
          down_payment: number
          additional_costs?: number
          monthly_income: number
          monthly_expenses: number
          current_savings: number
          other_debts?: number
          expected_rental_income?: number | null
          expected_appreciation_rate?: number | null
          investment_horizon_years?: number | null
          plan_status?: 'draft' | 'active' | 'completed' | 'archived'
          is_public?: boolean
          view_count?: number
          cached_calculations?: Json | null
          calculations_last_updated?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_name?: string
          plan_description?: string | null
          plan_type?: 'home_purchase' | 'investment' | 'upgrade' | 'refinance'
          property_id?: string | null
          custom_property_data?: Json | null
          purchase_price?: number
          down_payment?: number
          additional_costs?: number
          monthly_income?: number
          monthly_expenses?: number
          current_savings?: number
          other_debts?: number
          expected_rental_income?: number | null
          expected_appreciation_rate?: number | null
          investment_horizon_years?: number | null
          plan_status?: 'draft' | 'active' | 'completed' | 'archived'
          is_public?: boolean
          view_count?: number
          cached_calculations?: Json | null
          calculations_last_updated?: string | null
          updated_at?: string
        }
      }
      loan_terms: {
        Row: {
          id: string
          financial_plan_id: string
          loan_amount: number
          loan_term_years: number
          loan_term_months: number
          promotional_rate: number | null
          promotional_period_months: number
          regular_rate: number
          rate_type: 'fixed' | 'variable' | 'mixed'
          grace_period_months: number
          grace_period_type: 'principal_only' | 'full_payment' | 'none' | null
          bank_name: string | null
          loan_product_name: string | null
          bank_contact_info: Json | null
          origination_fee: number
          processing_fee: number
          early_payment_penalty_rate: number
          late_payment_penalty_rate: number
          mortgage_insurance_required: boolean
          mortgage_insurance_rate: number | null
          property_insurance_required: boolean
          monthly_payment_promotional: number | null
          monthly_payment_regular: number | null
          total_interest: number | null
          total_payments: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          financial_plan_id: string
          loan_amount: number
          loan_term_years: number
          promotional_rate?: number | null
          promotional_period_months?: number
          regular_rate: number
          rate_type?: 'fixed' | 'variable' | 'mixed'
          grace_period_months?: number
          grace_period_type?: 'principal_only' | 'full_payment' | 'none' | null
          bank_name?: string | null
          loan_product_name?: string | null
          bank_contact_info?: Json | null
          origination_fee?: number
          processing_fee?: number
          early_payment_penalty_rate?: number
          late_payment_penalty_rate?: number
          mortgage_insurance_required?: boolean
          mortgage_insurance_rate?: number | null
          property_insurance_required?: boolean
          monthly_payment_promotional?: number | null
          monthly_payment_regular?: number | null
          total_interest?: number | null
          total_payments?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          financial_plan_id?: string
          loan_amount?: number
          loan_term_years?: number
          promotional_rate?: number | null
          promotional_period_months?: number
          regular_rate?: number
          rate_type?: 'fixed' | 'variable' | 'mixed'
          grace_period_months?: number
          grace_period_type?: 'principal_only' | 'full_payment' | 'none' | null
          bank_name?: string | null
          loan_product_name?: string | null
          bank_contact_info?: Json | null
          origination_fee?: number
          processing_fee?: number
          early_payment_penalty_rate?: number
          late_payment_penalty_rate?: number
          mortgage_insurance_required?: boolean
          mortgage_insurance_rate?: number | null
          property_insurance_required?: boolean
          monthly_payment_promotional?: number | null
          monthly_payment_regular?: number | null
          total_interest?: number | null
          total_payments?: number | null
          updated_at?: string
        }
      }
      scenarios: {
        Row: {
          id: string
          financial_plan_id: string
          scenario_name: string
          scenario_type: 'baseline' | 'optimistic' | 'pessimistic' | 'alternative' | 'stress_test'
          scenario_description: string | null
          modified_parameters: Json
          assumptions: Json | null
          calculated_results: Json | null
          key_metrics: Json | null
          comparison_baseline_id: string | null
          performance_vs_baseline: Json | null
          is_favorite: boolean
          user_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          financial_plan_id: string
          scenario_name: string
          scenario_type?: 'baseline' | 'optimistic' | 'pessimistic' | 'alternative' | 'stress_test'
          scenario_description?: string | null
          modified_parameters: Json
          assumptions?: Json | null
          calculated_results?: Json | null
          key_metrics?: Json | null
          comparison_baseline_id?: string | null
          performance_vs_baseline?: Json | null
          is_favorite?: boolean
          user_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          financial_plan_id?: string
          scenario_name?: string
          scenario_type?: 'baseline' | 'optimistic' | 'pessimistic' | 'alternative' | 'stress_test'
          scenario_description?: string | null
          modified_parameters?: Json
          assumptions?: Json | null
          calculated_results?: Json | null
          key_metrics?: Json | null
          comparison_baseline_id?: string | null
          performance_vs_baseline?: Json | null
          is_favorite?: boolean
          user_notes?: string | null
          updated_at?: string
        }
      }
      interest_rates: {
        Row: {
          id: string
          bank_name: string
          bank_code: string | null
          rate_type: 'promotional' | 'standard' | 'vip' | 'prime'
          loan_term_years: number
          interest_rate: number
          minimum_loan_amount: number | null
          maximum_loan_amount: number | null
          minimum_down_payment_percent: number | null
          effective_date: string
          expiry_date: string | null
          is_current: boolean
          special_conditions: string[] | null
          source_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bank_name: string
          bank_code?: string | null
          rate_type: 'promotional' | 'standard' | 'vip' | 'prime'
          loan_term_years: number
          interest_rate: number
          minimum_loan_amount?: number | null
          maximum_loan_amount?: number | null
          minimum_down_payment_percent?: number | null
          effective_date: string
          expiry_date?: string | null
          is_current?: boolean
          special_conditions?: string[] | null
          source_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bank_name?: string
          bank_code?: string | null
          rate_type?: 'promotional' | 'standard' | 'vip' | 'prime'
          loan_term_years?: number
          interest_rate?: number
          minimum_loan_amount?: number | null
          maximum_loan_amount?: number | null
          minimum_down_payment_percent?: number | null
          effective_date?: string
          expiry_date?: string | null
          is_current?: boolean
          special_conditions?: string[] | null
          source_url?: string | null
          updated_at?: string
        }
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
    }
    Enums: {
      subscription_tier: 'free' | 'premium' | 'professional'
      property_type: 'apartment' | 'house' | 'villa' | 'townhouse' | 'commercial'
      plan_type: 'home_purchase' | 'investment' | 'upgrade' | 'refinance'
      plan_status: 'draft' | 'active' | 'completed' | 'archived'
      rate_type: 'fixed' | 'variable' | 'mixed'
      scenario_type: 'baseline' | 'optimistic' | 'pessimistic' | 'alternative' | 'stress_test'
      legal_status: 'red_book' | 'pink_book' | 'pending' | 'disputed'
      ownership_type: 'individual' | 'joint' | 'company'
      rate_category: 'promotional' | 'standard' | 'vip' | 'prime'
    }
  }
}