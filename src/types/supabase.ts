export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_type: Database["public"]["Enums"]["achievement_type"]
          badge_color: string | null
          badge_icon: string | null
          created_at: string | null
          description: string
          description_vi: string
          experience_points: number | null
          id: string
          is_active: boolean | null
          is_hidden: boolean | null
          name: string
          name_vi: string
          required_actions: Json
          required_value: number | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          achievement_type: Database["public"]["Enums"]["achievement_type"]
          badge_color?: string | null
          badge_icon?: string | null
          created_at?: string | null
          description: string
          description_vi: string
          experience_points?: number | null
          id?: string
          is_active?: boolean | null
          is_hidden?: boolean | null
          name: string
          name_vi: string
          required_actions: Json
          required_value?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          achievement_type?: Database["public"]["Enums"]["achievement_type"]
          badge_color?: string | null
          badge_icon?: string | null
          created_at?: string | null
          description?: string
          description_vi?: string
          experience_points?: number | null
          id?: string
          is_active?: boolean | null
          is_hidden?: boolean | null
          name?: string
          name_vi?: string
          required_actions?: Json
          required_value?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_feature_usage: {
        Row: {
          created_at: string | null
          feature_type: string
          id: string
          last_used_at: string | null
          period_end: string
          period_start: string
          subscription_tier: string | null
          updated_at: string | null
          usage_count: number | null
          usage_period: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feature_type?: string
          id?: string
          last_used_at?: string | null
          period_end: string
          period_start: string
          subscription_tier?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_period?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          feature_type?: string
          id?: string
          last_used_at?: string | null
          period_end?: string
          period_start?: string
          subscription_tier?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_period?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_feature_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_financial_insights: {
        Row: {
          ai_model: string | null
          confidence_score: number | null
          created_at: string | null
          expires_at: string | null
          generated_at: string | null
          id: string
          insight_text: string
          insight_type: string
          invalidated_at: string | null
          invalidation_reason: string | null
          is_valid: boolean | null
          metadata: Json | null
          processing_time_ms: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_model?: string | null
          confidence_score?: number | null
          created_at?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          insight_text: string
          insight_type: string
          invalidated_at?: string | null
          invalidation_reason?: string | null
          is_valid?: boolean | null
          metadata?: Json | null
          processing_time_ms?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_model?: string | null
          confidence_score?: number | null
          created_at?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          insight_text?: string
          insight_type?: string
          invalidated_at?: string | null
          invalidation_reason?: string | null
          is_valid?: boolean | null
          metadata?: Json | null
          processing_time_ms?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_financial_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_insight_interactions: {
        Row: {
          created_at: string | null
          id: string
          insight_id: string
          interaction_data: Json | null
          interaction_type: string
          ip_address: unknown | null
          session_id: string | null
          user_agent: string | null
          user_feedback: string | null
          user_id: string
          user_rating: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          insight_id: string
          interaction_data?: Json | null
          interaction_type: string
          ip_address?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          user_feedback?: string | null
          user_id: string
          user_rating?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          insight_id?: string
          interaction_data?: Json | null
          interaction_type?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          user_feedback?: string | null
          user_id?: string
          user_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_insight_interactions_insight_id_fkey"
            columns: ["insight_id"]
            isOneToOne: false
            referencedRelation: "ai_financial_insights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insight_interactions_insight_id_fkey"
            columns: ["insight_id"]
            isOneToOne: false
            referencedRelation: "recent_ai_insights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insight_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_learning_patterns: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_global: boolean | null
          last_used_at: string | null
          pattern_type: string
          predicted_amount_range: Json | null
          predicted_category_id: string | null
          predicted_tags: string[] | null
          success_rate: number | null
          trigger_text: string
          updated_at: string | null
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          last_used_at?: string | null
          pattern_type: string
          predicted_amount_range?: Json | null
          predicted_category_id?: string | null
          predicted_tags?: string[] | null
          success_rate?: number | null
          trigger_text: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          last_used_at?: string | null
          pattern_type?: string
          predicted_amount_range?: Json | null
          predicted_category_id?: string | null
          predicted_tags?: string[] | null
          success_rate?: number | null
          trigger_text?: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_parsing_sessions: {
        Row: {
          ai_model_used: string
          avg_confidence: number | null
          created_at: string | null
          error_message: string | null
          id: string
          input_text: string
          parsed_transactions: Json | null
          parsing_language: string | null
          processing_time_ms: number | null
          session_id: string | null
          status: string
          success_rate: number | null
          tokens_used: number | null
          transactions_parsed: number | null
          updated_at: string | null
          user_corrections: Json | null
          user_id: string
        }
        Insert: {
          ai_model_used?: string
          avg_confidence?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_text: string
          parsed_transactions?: Json | null
          parsing_language?: string | null
          processing_time_ms?: number | null
          session_id?: string | null
          status?: string
          success_rate?: number | null
          tokens_used?: number | null
          transactions_parsed?: number | null
          updated_at?: string | null
          user_corrections?: Json | null
          user_id: string
        }
        Update: {
          ai_model_used?: string
          avg_confidence?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_text?: string
          parsed_transactions?: Json | null
          parsing_language?: string | null
          processing_time_ms?: number | null
          session_id?: string | null
          status?: string
          success_rate?: number | null
          tokens_used?: number | null
          transactions_parsed?: number | null
          updated_at?: string | null
          user_corrections?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          page_url: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_metrics: {
        Row: {
          created_at: string | null
          id: string
          metric_name: string
          metric_type: string
          metric_value: number
          period_end: string
          period_start: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric_name: string
          metric_type: string
          metric_value: number
          period_end: string
          period_start: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metric_name?: string
          metric_type?: string
          metric_value?: number
          period_end?: string
          period_start?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key?: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      bank_interest_rates: {
        Row: {
          bank_id: string
          created_at: string | null
          early_payment_fee: number | null
          effective_date: string
          eligibility_criteria: Json | null
          expiry_date: string | null
          id: string
          interest_rate: number
          is_active: boolean | null
          loan_type: string
          max_loan_amount: number | null
          max_ltv_ratio: number | null
          max_rate: number | null
          max_term_months: number | null
          min_income: number | null
          min_loan_amount: number | null
          min_rate: number | null
          min_term_months: number | null
          processing_fee: number | null
          processing_fee_percentage: number | null
          product_name: string
          promotional_conditions: Json | null
          promotional_end_date: string | null
          promotional_period_months: number | null
          promotional_rate: number | null
          required_documents: Json | null
          updated_at: string | null
        }
        Insert: {
          bank_id: string
          created_at?: string | null
          early_payment_fee?: number | null
          effective_date: string
          eligibility_criteria?: Json | null
          expiry_date?: string | null
          id?: string
          interest_rate: number
          is_active?: boolean | null
          loan_type: string
          max_loan_amount?: number | null
          max_ltv_ratio?: number | null
          max_rate?: number | null
          max_term_months?: number | null
          min_income?: number | null
          min_loan_amount?: number | null
          min_rate?: number | null
          min_term_months?: number | null
          processing_fee?: number | null
          processing_fee_percentage?: number | null
          product_name: string
          promotional_conditions?: Json | null
          promotional_end_date?: string | null
          promotional_period_months?: number | null
          promotional_rate?: number | null
          required_documents?: Json | null
          updated_at?: string | null
        }
        Update: {
          bank_id?: string
          created_at?: string | null
          early_payment_fee?: number | null
          effective_date?: string
          eligibility_criteria?: Json | null
          expiry_date?: string | null
          id?: string
          interest_rate?: number
          is_active?: boolean | null
          loan_type?: string
          max_loan_amount?: number | null
          max_ltv_ratio?: number | null
          max_rate?: number | null
          max_term_months?: number | null
          min_income?: number | null
          min_loan_amount?: number | null
          min_rate?: number | null
          min_term_months?: number | null
          processing_fee?: number | null
          processing_fee_percentage?: number | null
          product_name?: string
          promotional_conditions?: Json | null
          promotional_end_date?: string | null
          promotional_period_months?: number | null
          promotional_rate?: number | null
          required_documents?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_interest_rates_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "banks"
            referencedColumns: ["id"]
          },
        ]
      }
      banks: {
        Row: {
          bank_code: string
          bank_name: string
          bank_name_en: string | null
          created_at: string | null
          email: string | null
          headquarters_address: string | null
          hotline: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          loan_products: Json | null
          logo_url: string | null
          special_offers: Json | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          bank_code: string
          bank_name: string
          bank_name_en?: string | null
          created_at?: string | null
          email?: string | null
          headquarters_address?: string | null
          hotline?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          loan_products?: Json | null
          logo_url?: string | null
          special_offers?: Json | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          bank_code?: string
          bank_name?: string
          bank_name_en?: string | null
          created_at?: string | null
          email?: string | null
          headquarters_address?: string | null
          hotline?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          loan_products?: Json | null
          logo_url?: string | null
          special_offers?: Json | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      billing_history: {
        Row: {
          amount_paid: number
          billing_reason: string | null
          created_at: string
          currency: string
          id: string
          invoice_pdf: string | null
          invoice_url: string | null
          status: string
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          user_id: string
        }
        Insert: {
          amount_paid: number
          billing_reason?: string | null
          created_at?: string
          currency?: string
          id?: string
          invoice_pdf?: string | null
          invoice_url?: string | null
          status: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number
          billing_reason?: string | null
          created_at?: string
          currency?: string
          id?: string
          invoice_pdf?: string | null
          invoice_url?: string | null
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      budget_categories: {
        Row: {
          alert_sent_at: string | null
          alert_threshold_percentage: number | null
          allocated_amount: number
          budget_id: string
          category_id: string | null
          created_at: string | null
          id: string
          remaining_amount: number | null
          spent_amount: number | null
          updated_at: string | null
        }
        Insert: {
          alert_sent_at?: string | null
          alert_threshold_percentage?: number | null
          allocated_amount: number
          budget_id: string
          category_id?: string | null
          created_at?: string | null
          id?: string
          remaining_amount?: number | null
          spent_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          alert_sent_at?: string | null
          alert_threshold_percentage?: number | null
          allocated_amount?: number
          budget_id?: string
          category_id?: string | null
          created_at?: string | null
          id?: string
          remaining_amount?: number | null
          spent_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_categories_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budget_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_categories_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "expense_budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          comment_count: number | null
          content: string
          created_at: string | null
          downvotes: number | null
          financial_plan_id: string | null
          id: string
          is_featured: boolean | null
          is_moderated: boolean | null
          is_plan_shared: boolean | null
          moderation_notes: string | null
          post_type: string | null
          search_vector: unknown | null
          tags: string[] | null
          title: string
          updated_at: string | null
          upvotes: number | null
          user_id: string | null
          view_count: number | null
        }
        Insert: {
          comment_count?: number | null
          content: string
          created_at?: string | null
          downvotes?: number | null
          financial_plan_id?: string | null
          id?: string
          is_featured?: boolean | null
          is_moderated?: boolean | null
          is_plan_shared?: boolean | null
          moderation_notes?: string | null
          post_type?: string | null
          search_vector?: unknown | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
          view_count?: number | null
        }
        Update: {
          comment_count?: number | null
          content?: string
          created_at?: string | null
          downvotes?: number | null
          financial_plan_id?: string | null
          id?: string
          is_featured?: boolean | null
          is_moderated?: boolean | null
          is_plan_shared?: boolean | null
          moderation_notes?: string | null
          post_type?: string | null
          search_vector?: unknown | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_financial_plan_id_fkey"
            columns: ["financial_plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          created_at: string | null
          error_context: Json | null
          error_message: string
          error_type: string
          id: string
          resolution_notes: string | null
          resolved: boolean | null
          resolved_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_context?: Json | null
          error_message: string
          error_type: string
          id?: string
          resolution_notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_context?: Json | null
          error_message?: string
          error_type?: string
          id?: string
          resolution_notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_achievements: {
        Row: {
          badge_color: string | null
          badge_icon: string
          category: string
          created_at: string | null
          description_en: string
          description_vi: string
          experience_points: number | null
          funnel_action_data: Json | null
          id: string
          is_active: boolean | null
          name_en: string
          name_vi: string
          requirement_period_days: number | null
          requirement_type: string
          requirement_value: number
          sort_order: number | null
          triggers_funnel_action: boolean | null
          updated_at: string | null
        }
        Insert: {
          badge_color?: string | null
          badge_icon: string
          category: string
          created_at?: string | null
          description_en: string
          description_vi: string
          experience_points?: number | null
          funnel_action_data?: Json | null
          id?: string
          is_active?: boolean | null
          name_en: string
          name_vi: string
          requirement_period_days?: number | null
          requirement_type: string
          requirement_value: number
          sort_order?: number | null
          triggers_funnel_action?: boolean | null
          updated_at?: string | null
        }
        Update: {
          badge_color?: string | null
          badge_icon?: string
          category?: string
          created_at?: string | null
          description_en?: string
          description_vi?: string
          experience_points?: number | null
          funnel_action_data?: Json | null
          id?: string
          is_active?: boolean | null
          name_en?: string
          name_vi?: string
          requirement_period_days?: number | null
          requirement_type?: string
          requirement_value?: number
          sort_order?: number | null
          triggers_funnel_action?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      expense_analytics_monthly: {
        Row: {
          budget_adherence_score: number | null
          calculated_at: string | null
          category_expenses: Json | null
          category_income: Json | null
          house_goal_progress: number | null
          id: string
          month: number
          net_income: number | null
          over_budget_amount: number | null
          savings_rate: number | null
          top_expense_category: string | null
          total_expenses: number | null
          total_income: number | null
          total_saved_toward_goals: number | null
          transaction_count: number | null
          unusual_spending_detected: boolean | null
          user_id: string
          year: number
        }
        Insert: {
          budget_adherence_score?: number | null
          calculated_at?: string | null
          category_expenses?: Json | null
          category_income?: Json | null
          house_goal_progress?: number | null
          id?: string
          month: number
          net_income?: number | null
          over_budget_amount?: number | null
          savings_rate?: number | null
          top_expense_category?: string | null
          total_expenses?: number | null
          total_income?: number | null
          total_saved_toward_goals?: number | null
          transaction_count?: number | null
          unusual_spending_detected?: boolean | null
          user_id: string
          year: number
        }
        Update: {
          budget_adherence_score?: number | null
          calculated_at?: string | null
          category_expenses?: Json | null
          category_income?: Json | null
          house_goal_progress?: number | null
          id?: string
          month?: number
          net_income?: number | null
          over_budget_amount?: number | null
          savings_rate?: number | null
          top_expense_category?: string | null
          total_expenses?: number | null
          total_income?: number | null
          total_saved_toward_goals?: number | null
          transaction_count?: number | null
          unusual_spending_detected?: boolean | null
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "expense_analytics_monthly_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_budgets: {
        Row: {
          alert_sent_at: string | null
          alert_threshold_percentage: number | null
          budget_allocation: Json | null
          budget_method: string
          budget_period: string
          category_budgets: Json | null
          category_mapping: Json | null
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          name: string
          remaining_amount: number | null
          start_date: string
          total_budget: number
          total_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_sent_at?: string | null
          alert_threshold_percentage?: number | null
          budget_allocation?: Json | null
          budget_method?: string
          budget_period?: string
          category_budgets?: Json | null
          category_mapping?: Json | null
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          name: string
          remaining_amount?: number | null
          start_date: string
          total_budget: number
          total_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_sent_at?: string | null
          alert_threshold_percentage?: number | null
          budget_allocation?: Json | null
          budget_method?: string
          budget_period?: string
          category_budgets?: Json | null
          category_mapping?: Json | null
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          name?: string
          remaining_amount?: number | null
          start_date?: string
          total_budget?: number
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_budgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          category_key: Database["public"]["Enums"]["expense_category_type"]
          color: string
          created_at: string | null
          description_en: string | null
          description_vi: string | null
          icon: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name_en: string
          name_vi: string
          parent_category_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category_key: Database["public"]["Enums"]["expense_category_type"]
          color?: string
          created_at?: string | null
          description_en?: string | null
          description_vi?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name_en: string
          name_vi: string
          parent_category_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category_key?: Database["public"]["Enums"]["expense_category_type"]
          color?: string
          created_at?: string | null
          description_en?: string | null
          description_vi?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name_en?: string
          name_vi?: string
          parent_category_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_challenges: {
        Row: {
          category: string
          challenge_type: string
          completion_badge: string | null
          created_at: string | null
          description_en: string
          description_vi: string
          duration_days: number
          end_date: string | null
          experience_points: number | null
          id: string
          is_active: boolean | null
          name_en: string
          name_vi: string
          requirement_description: Json
          start_date: string | null
          target_value: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          challenge_type: string
          completion_badge?: string | null
          created_at?: string | null
          description_en: string
          description_vi: string
          duration_days: number
          end_date?: string | null
          experience_points?: number | null
          id?: string
          is_active?: boolean | null
          name_en: string
          name_vi: string
          requirement_description: Json
          start_date?: string | null
          target_value?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          challenge_type?: string
          completion_badge?: string | null
          created_at?: string | null
          description_en?: string
          description_vi?: string
          duration_days?: number
          end_date?: string | null
          experience_points?: number | null
          id?: string
          is_active?: boolean | null
          name_en?: string
          name_vi?: string
          requirement_description?: Json
          start_date?: string | null
          target_value?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      expense_goals: {
        Row: {
          color: string | null
          completed_at: string | null
          created_at: string | null
          current_amount: number | null
          deadline: string | null
          description: string | null
          funnel_stage: string | null
          goal_type: Database["public"]["Enums"]["goal_type"]
          house_purchase_data: Json | null
          icon: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          last_funnel_interaction: string | null
          monthly_target: number | null
          name: string
          progress_percentage: number | null
          start_date: string
          status: Database["public"]["Enums"]["goal_status"] | null
          target_amount: number
          target_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_amount?: number | null
          deadline?: string | null
          description?: string | null
          funnel_stage?: string | null
          goal_type?: Database["public"]["Enums"]["goal_type"]
          house_purchase_data?: Json | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          last_funnel_interaction?: string | null
          monthly_target?: number | null
          name: string
          progress_percentage?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["goal_status"] | null
          target_amount: number
          target_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_amount?: number | null
          deadline?: string | null
          description?: string | null
          funnel_stage?: string | null
          goal_type?: Database["public"]["Enums"]["goal_type"]
          house_purchase_data?: Json | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          last_funnel_interaction?: string | null
          monthly_target?: number | null
          name?: string
          progress_percentage?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["goal_status"] | null
          target_amount?: number
          target_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          custom_category: string | null
          description: string | null
          expense_category_id: string | null
          id: string
          income_category_id: string | null
          is_confirmed: boolean | null
          is_hidden: boolean | null
          location: Json | null
          merchant_name: string | null
          notes: string | null
          receipt_images: Json | null
          recurring_transaction_id: string | null
          tags: string[] | null
          transaction_date: string
          transaction_time: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          transfer_fee: number | null
          transfer_to_wallet_id: string | null
          updated_at: string | null
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          custom_category?: string | null
          description?: string | null
          expense_category_id?: string | null
          id?: string
          income_category_id?: string | null
          is_confirmed?: boolean | null
          is_hidden?: boolean | null
          location?: Json | null
          merchant_name?: string | null
          notes?: string | null
          receipt_images?: Json | null
          recurring_transaction_id?: string | null
          tags?: string[] | null
          transaction_date?: string
          transaction_time?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          transfer_fee?: number | null
          transfer_to_wallet_id?: string | null
          updated_at?: string | null
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          custom_category?: string | null
          description?: string | null
          expense_category_id?: string | null
          id?: string
          income_category_id?: string | null
          is_confirmed?: boolean | null
          is_hidden?: boolean | null
          location?: Json | null
          merchant_name?: string | null
          notes?: string | null
          receipt_images?: Json | null
          recurring_transaction_id?: string | null
          tags?: string[] | null
          transaction_date?: string
          transaction_time?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          transfer_fee?: number | null
          transfer_to_wallet_id?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_transactions_expense_category_id_fkey"
            columns: ["expense_category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_transactions_income_category_id_fkey"
            columns: ["income_category_id"]
            isOneToOne: false
            referencedRelation: "income_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_transactions_transfer_to_wallet_id_fkey"
            columns: ["transfer_to_wallet_id"]
            isOneToOne: false
            referencedRelation: "expense_wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "expense_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_wallets: {
        Row: {
          balance: number | null
          bank_account_number: string | null
          bank_id: string | null
          color: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          icon: string | null
          id: string
          include_in_budget: boolean | null
          is_active: boolean | null
          is_bank_synced: boolean | null
          is_default: boolean | null
          last_sync_at: string | null
          name: string
          updated_at: string | null
          user_id: string
          wallet_type: Database["public"]["Enums"]["wallet_type"]
        }
        Insert: {
          balance?: number | null
          bank_account_number?: string | null
          bank_id?: string | null
          color?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          include_in_budget?: boolean | null
          is_active?: boolean | null
          is_bank_synced?: boolean | null
          is_default?: boolean | null
          last_sync_at?: string | null
          name: string
          updated_at?: string | null
          user_id: string
          wallet_type?: Database["public"]["Enums"]["wallet_type"]
        }
        Update: {
          balance?: number | null
          bank_account_number?: string | null
          bank_id?: string | null
          color?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          include_in_budget?: boolean | null
          is_active?: boolean | null
          is_bank_synced?: boolean | null
          is_default?: boolean | null
          last_sync_at?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string
          wallet_type?: Database["public"]["Enums"]["wallet_type"]
        }
        Relationships: [
          {
            foreignKeyName: "expense_wallets_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_items: {
        Row: {
          answer: string
          answer_vi: string
          category: string
          created_at: string | null
          id: string
          is_active: boolean | null
          question: string
          question_vi: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          answer: string
          answer_vi: string
          category: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question: string
          question_vi: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          answer?: string
          answer_vi?: string
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question?: string
          question_vi?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      feature_usage: {
        Row: {
          created_at: string
          feature_key: string
          feature_name: string
          id: string
          last_used: string
          metadata: Json | null
          period_end: string
          period_start: string
          period_type: string
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          feature_key: string
          feature_name: string
          id?: string
          last_used?: string
          metadata?: Json | null
          period_end: string
          period_start: string
          period_type?: string
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          feature_key?: string
          feature_name?: string
          id?: string
          last_used?: string
          metadata?: Json | null
          period_end?: string
          period_start?: string
          period_type?: string
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: []
      }
      financial_plans: {
        Row: {
          additional_costs: number | null
          cached_calculations: Json | null
          calculations_last_updated: string | null
          completed_at: string | null
          created_at: string | null
          current_monthly_expenses: number | null
          current_monthly_income: number | null
          current_savings: number | null
          custom_property_data: Json | null
          dependents: number | null
          description: string | null
          desired_features: Json | null
          down_payment: number | null
          down_payment_target: number | null
          education_fund_target: number | null
          emergency_fund_target: number | null
          estimated_completion_date: string | null
          expected_appreciation_rate: number | null
          expected_rental_income: number | null
          expected_roi: number | null
          feasibility_score: number | null
          financial_progress: number | null
          id: string
          investment_horizon_months: number | null
          investment_purpose: string | null
          is_favorite: boolean | null
          is_public: boolean | null
          monthly_contribution: number | null
          monthly_expenses: number | null
          monthly_income: number | null
          notes: string | null
          other_debts: number | null
          other_goals: Json | null
          plan_name: string
          plan_type: Database["public"]["Enums"]["plan_type_enum"] | null
          preferred_banks: string[] | null
          property_id: string | null
          purchase_price: number | null
          recommended_adjustments: Json | null
          retirement_fund_target: number | null
          risk_level: string | null
          risk_tolerance: string | null
          roi: number | null
          shared_with: string[] | null
          status: Database["public"]["Enums"]["plan_status"] | null
          tags: string[] | null
          target_age: number | null
          target_budget: number | null
          target_location: string | null
          target_property_type:
            | Database["public"]["Enums"]["property_type"]
            | null
          target_timeframe_months: number | null
          total_progress: number | null
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          additional_costs?: number | null
          cached_calculations?: Json | null
          calculations_last_updated?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_monthly_expenses?: number | null
          current_monthly_income?: number | null
          current_savings?: number | null
          custom_property_data?: Json | null
          dependents?: number | null
          description?: string | null
          desired_features?: Json | null
          down_payment?: number | null
          down_payment_target?: number | null
          education_fund_target?: number | null
          emergency_fund_target?: number | null
          estimated_completion_date?: string | null
          expected_appreciation_rate?: number | null
          expected_rental_income?: number | null
          expected_roi?: number | null
          feasibility_score?: number | null
          financial_progress?: number | null
          id?: string
          investment_horizon_months?: number | null
          investment_purpose?: string | null
          is_favorite?: boolean | null
          is_public?: boolean | null
          monthly_contribution?: number | null
          monthly_expenses?: number | null
          monthly_income?: number | null
          notes?: string | null
          other_debts?: number | null
          other_goals?: Json | null
          plan_name: string
          plan_type?: Database["public"]["Enums"]["plan_type_enum"] | null
          preferred_banks?: string[] | null
          property_id?: string | null
          purchase_price?: number | null
          recommended_adjustments?: Json | null
          retirement_fund_target?: number | null
          risk_level?: string | null
          risk_tolerance?: string | null
          roi?: number | null
          shared_with?: string[] | null
          status?: Database["public"]["Enums"]["plan_status"] | null
          tags?: string[] | null
          target_age?: number | null
          target_budget?: number | null
          target_location?: string | null
          target_property_type?:
            | Database["public"]["Enums"]["property_type"]
            | null
          target_timeframe_months?: number | null
          total_progress?: number | null
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          additional_costs?: number | null
          cached_calculations?: Json | null
          calculations_last_updated?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_monthly_expenses?: number | null
          current_monthly_income?: number | null
          current_savings?: number | null
          custom_property_data?: Json | null
          dependents?: number | null
          description?: string | null
          desired_features?: Json | null
          down_payment?: number | null
          down_payment_target?: number | null
          education_fund_target?: number | null
          emergency_fund_target?: number | null
          estimated_completion_date?: string | null
          expected_appreciation_rate?: number | null
          expected_rental_income?: number | null
          expected_roi?: number | null
          feasibility_score?: number | null
          financial_progress?: number | null
          id?: string
          investment_horizon_months?: number | null
          investment_purpose?: string | null
          is_favorite?: boolean | null
          is_public?: boolean | null
          monthly_contribution?: number | null
          monthly_expenses?: number | null
          monthly_income?: number | null
          notes?: string | null
          other_debts?: number | null
          other_goals?: Json | null
          plan_name?: string
          plan_type?: Database["public"]["Enums"]["plan_type_enum"] | null
          preferred_banks?: string[] | null
          property_id?: string | null
          purchase_price?: number | null
          recommended_adjustments?: Json | null
          retirement_fund_target?: number | null
          risk_level?: string | null
          risk_tolerance?: string | null
          roi?: number | null
          shared_with?: string[] | null
          status?: Database["public"]["Enums"]["plan_status"] | null
          tags?: string[] | null
          target_age?: number | null
          target_budget?: number | null
          target_location?: string | null
          target_property_type?:
            | Database["public"]["Enums"]["property_type"]
            | null
          target_timeframe_months?: number | null
          total_progress?: number | null
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_plans_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_scenarios: {
        Row: {
          created_at: string | null
          debt_to_income_ratio: number | null
          description: string | null
          down_payment: number
          financial_plan_id: string | null
          id: string
          interest_rate: number
          is_active: boolean | null
          loan_amount: number
          loan_term_months: number
          loan_to_value_ratio: number | null
          monthly_expenses: number | null
          monthly_income: number | null
          monthly_payment: number
          property_price: number
          risk_factors: Json | null
          risk_level: string
          scenario_name: string
          scenario_type: string
          total_cost: number
          total_interest: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          debt_to_income_ratio?: number | null
          description?: string | null
          down_payment: number
          financial_plan_id?: string | null
          id?: string
          interest_rate: number
          is_active?: boolean | null
          loan_amount: number
          loan_term_months: number
          loan_to_value_ratio?: number | null
          monthly_expenses?: number | null
          monthly_income?: number | null
          monthly_payment: number
          property_price: number
          risk_factors?: Json | null
          risk_level: string
          scenario_name: string
          scenario_type: string
          total_cost: number
          total_interest: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          debt_to_income_ratio?: number | null
          description?: string | null
          down_payment?: number
          financial_plan_id?: string | null
          id?: string
          interest_rate?: number
          is_active?: boolean | null
          loan_amount?: number
          loan_term_months?: number
          loan_to_value_ratio?: number | null
          monthly_expenses?: number | null
          monthly_income?: number | null
          monthly_payment?: number
          property_price?: number
          risk_factors?: Json | null
          risk_level?: string
          scenario_name?: string
          scenario_type?: string
          total_cost?: number
          total_interest?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_scenarios_financial_plan_id_fkey"
            columns: ["financial_plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_scenarios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gemini_api_keys: {
        Row: {
          created_at: string | null
          created_by: string | null
          encrypted_key: string
          encryption_iv: string
          encryption_tag: string
          failure_count: number | null
          id: string
          is_active: boolean | null
          last_used: string | null
          name: string
          priority: number | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          encrypted_key: string
          encryption_iv: string
          encryption_tag: string
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_used?: string | null
          name: string
          priority?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          encrypted_key?: string
          encryption_iv?: string
          encryption_tag?: string
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_used?: string | null
          name?: string
          priority?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      gemini_key_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          key_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          key_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          key_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gemini_key_audit_log_key_id_fkey"
            columns: ["key_id"]
            isOneToOne: false
            referencedRelation: "gemini_api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      gemini_key_usage_stats: {
        Row: {
          avg_response_time: number | null
          created_at: string | null
          date: string
          failure_count: number | null
          id: string
          key_id: string | null
          rate_limit_count: number | null
          request_count: number | null
          success_count: number | null
        }
        Insert: {
          avg_response_time?: number | null
          created_at?: string | null
          date: string
          failure_count?: number | null
          id?: string
          key_id?: string | null
          rate_limit_count?: number | null
          request_count?: number | null
          success_count?: number | null
        }
        Update: {
          avg_response_time?: number | null
          created_at?: string | null
          date?: string
          failure_count?: number | null
          id?: string
          key_id?: string | null
          rate_limit_count?: number | null
          request_count?: number | null
          success_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gemini_key_usage_stats_key_id_fkey"
            columns: ["key_id"]
            isOneToOne: false
            referencedRelation: "gemini_api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_contributions: {
        Row: {
          amount: number
          contribution_date: string
          created_at: string | null
          description: string | null
          goal_id: string
          id: string
          is_automatic: boolean | null
          transaction_id: string | null
          user_id: string
          wallet_id: string | null
        }
        Insert: {
          amount: number
          contribution_date?: string
          created_at?: string | null
          description?: string | null
          goal_id: string
          id?: string
          is_automatic?: boolean | null
          transaction_id?: string | null
          user_id: string
          wallet_id?: string | null
        }
        Update: {
          amount?: number
          contribution_date?: string
          created_at?: string | null
          description?: string | null
          goal_id?: string
          id?: string
          is_automatic?: boolean | null
          transaction_id?: string | null
          user_id?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_contributions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "expense_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_contributions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "expense_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_contributions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_contributions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "expense_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      income_categories: {
        Row: {
          category_key: Database["public"]["Enums"]["income_category_type"]
          color: string
          created_at: string | null
          description_en: string | null
          description_vi: string | null
          icon: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name_en: string
          name_vi: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category_key: Database["public"]["Enums"]["income_category_type"]
          color?: string
          created_at?: string | null
          description_en?: string | null
          description_vi?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name_en: string
          name_vi: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category_key?: Database["public"]["Enums"]["income_category_type"]
          color?: string
          created_at?: string | null
          description_en?: string | null
          description_vi?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name_en?: string
          name_vi?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      interest_rates: {
        Row: {
          bank_code: string | null
          bank_name: string
          created_at: string | null
          effective_date: string
          expiry_date: string | null
          id: string
          interest_rate: number
          is_current: boolean | null
          loan_term_years: number
          maximum_loan_amount: number | null
          minimum_down_payment_percent: number | null
          minimum_loan_amount: number | null
          rate_type: Database["public"]["Enums"]["rate_category_enum"]
          source_url: string | null
          special_conditions: string[] | null
          updated_at: string | null
        }
        Insert: {
          bank_code?: string | null
          bank_name: string
          created_at?: string | null
          effective_date: string
          expiry_date?: string | null
          id?: string
          interest_rate: number
          is_current?: boolean | null
          loan_term_years: number
          maximum_loan_amount?: number | null
          minimum_down_payment_percent?: number | null
          minimum_loan_amount?: number | null
          rate_type: Database["public"]["Enums"]["rate_category_enum"]
          source_url?: string | null
          special_conditions?: string[] | null
          updated_at?: string | null
        }
        Update: {
          bank_code?: string | null
          bank_name?: string
          created_at?: string | null
          effective_date?: string
          expiry_date?: string | null
          id?: string
          interest_rate?: number
          is_current?: boolean | null
          loan_term_years?: number
          maximum_loan_amount?: number | null
          minimum_down_payment_percent?: number | null
          minimum_loan_amount?: number | null
          rate_type?: Database["public"]["Enums"]["rate_category_enum"]
          source_url?: string | null
          special_conditions?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      loan_calculations: {
        Row: {
          amortization_schedule: Json | null
          bank_name: string | null
          bank_product_name: string | null
          calculation_name: string
          created_at: string | null
          debt_to_income_ratio: number | null
          down_payment_amount: number
          financial_plan_id: string | null
          id: string
          interest_rate: number
          loan_amount: number
          loan_term_months: number
          loan_to_value_ratio: number | null
          monthly_expenses: number | null
          monthly_income: number | null
          monthly_payment: number
          property_price: number
          total_interest: number
          total_payment: number
          user_id: string | null
        }
        Insert: {
          amortization_schedule?: Json | null
          bank_name?: string | null
          bank_product_name?: string | null
          calculation_name?: string
          created_at?: string | null
          debt_to_income_ratio?: number | null
          down_payment_amount: number
          financial_plan_id?: string | null
          id?: string
          interest_rate: number
          loan_amount: number
          loan_term_months: number
          loan_to_value_ratio?: number | null
          monthly_expenses?: number | null
          monthly_income?: number | null
          monthly_payment: number
          property_price: number
          total_interest: number
          total_payment: number
          user_id?: string | null
        }
        Update: {
          amortization_schedule?: Json | null
          bank_name?: string | null
          bank_product_name?: string | null
          calculation_name?: string
          created_at?: string | null
          debt_to_income_ratio?: number | null
          down_payment_amount?: number
          financial_plan_id?: string | null
          id?: string
          interest_rate?: number
          loan_amount?: number
          loan_term_months?: number
          loan_to_value_ratio?: number | null
          monthly_expenses?: number | null
          monthly_income?: number | null
          monthly_payment?: number
          property_price?: number
          total_interest?: number
          total_payment?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_calculations_financial_plan_id_fkey"
            columns: ["financial_plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_calculations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_terms: {
        Row: {
          bank_contact_info: Json | null
          bank_name: string | null
          created_at: string | null
          early_payment_penalty_rate: number | null
          financial_plan_id: string | null
          grace_period_months: number | null
          id: string
          late_payment_penalty_rate: number | null
          loan_amount: number
          loan_product_name: string | null
          loan_term_months: number | null
          loan_term_years: number
          monthly_payment_promotional: number | null
          monthly_payment_regular: number | null
          mortgage_insurance_rate: number | null
          mortgage_insurance_required: boolean | null
          origination_fee: number | null
          processing_fee: number | null
          promotional_period_months: number | null
          promotional_rate: number | null
          property_insurance_required: boolean | null
          rate_type: Database["public"]["Enums"]["rate_type_enum"] | null
          regular_rate: number
          total_interest: number | null
          total_payments: number | null
          updated_at: string | null
        }
        Insert: {
          bank_contact_info?: Json | null
          bank_name?: string | null
          created_at?: string | null
          early_payment_penalty_rate?: number | null
          financial_plan_id?: string | null
          grace_period_months?: number | null
          id?: string
          late_payment_penalty_rate?: number | null
          loan_amount: number
          loan_product_name?: string | null
          loan_term_months?: number | null
          loan_term_years: number
          monthly_payment_promotional?: number | null
          monthly_payment_regular?: number | null
          mortgage_insurance_rate?: number | null
          mortgage_insurance_required?: boolean | null
          origination_fee?: number | null
          processing_fee?: number | null
          promotional_period_months?: number | null
          promotional_rate?: number | null
          property_insurance_required?: boolean | null
          rate_type?: Database["public"]["Enums"]["rate_type_enum"] | null
          regular_rate: number
          total_interest?: number | null
          total_payments?: number | null
          updated_at?: string | null
        }
        Update: {
          bank_contact_info?: Json | null
          bank_name?: string | null
          created_at?: string | null
          early_payment_penalty_rate?: number | null
          financial_plan_id?: string | null
          grace_period_months?: number | null
          id?: string
          late_payment_penalty_rate?: number | null
          loan_amount?: number
          loan_product_name?: string | null
          loan_term_months?: number | null
          loan_term_years?: number
          monthly_payment_promotional?: number | null
          monthly_payment_regular?: number | null
          mortgage_insurance_rate?: number | null
          mortgage_insurance_required?: boolean | null
          origination_fee?: number | null
          processing_fee?: number | null
          promotional_period_months?: number | null
          promotional_rate?: number | null
          property_insurance_required?: boolean | null
          rate_type?: Database["public"]["Enums"]["rate_type_enum"] | null
          regular_rate?: number
          total_interest?: number | null
          total_payments?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_terms_financial_plan_id_fkey"
            columns: ["financial_plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      market_insights: {
        Row: {
          content: string
          content_vi: string
          created_at: string | null
          id: string
          impact_score: number | null
          insight_type: string
          is_featured: boolean | null
          location: string | null
          property_type: Database["public"]["Enums"]["property_type"] | null
          published_at: string | null
          title: string
          title_vi: string
        }
        Insert: {
          content: string
          content_vi: string
          created_at?: string | null
          id?: string
          impact_score?: number | null
          insight_type: string
          is_featured?: boolean | null
          location?: string | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          published_at?: string | null
          title: string
          title_vi: string
        }
        Update: {
          content?: string
          content_vi?: string
          created_at?: string | null
          id?: string
          impact_score?: number | null
          insight_type?: string
          is_featured?: boolean | null
          location?: string | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          published_at?: string | null
          title?: string
          title_vi?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          delivery_channels: string[] | null
          expires_at: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_archived: boolean | null
          is_read: boolean | null
          is_sent: boolean | null
          message: string
          metadata: Json | null
          priority: number | null
          read_at: string | null
          sent_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          delivery_channels?: string[] | null
          expires_at?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_archived?: boolean | null
          is_read?: boolean | null
          is_sent?: boolean | null
          message: string
          metadata?: Json | null
          priority?: number | null
          read_at?: string | null
          sent_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          delivery_channels?: string[] | null
          expires_at?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_archived?: boolean | null
          is_read?: boolean | null
          is_sent?: boolean | null
          message?: string
          metadata?: Json | null
          priority?: number | null
          read_at?: string | null
          sent_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_milestones: {
        Row: {
          category: string | null
          completed_date: string | null
          created_at: string | null
          current_amount: number | null
          description: string | null
          id: string
          plan_id: string
          priority: string | null
          required_amount: number | null
          status: string | null
          target_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          completed_date?: string | null
          created_at?: string | null
          current_amount?: number | null
          description?: string | null
          id?: string
          plan_id: string
          priority?: string | null
          required_amount?: number | null
          status?: string | null
          target_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          completed_date?: string | null
          created_at?: string | null
          current_amount?: number | null
          description?: string | null
          id?: string
          plan_id?: string
          priority?: string | null
          required_amount?: number | null
          status?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_milestones_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_shares: {
        Row: {
          created_at: string
          id: string
          personal_message: string | null
          plan_id: string
          share_method: string
          share_url: string
          shared_by: string
          shared_with: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          personal_message?: string | null
          plan_id: string
          share_method?: string
          share_url: string
          shared_by: string
          shared_with: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          personal_message?: string | null
          plan_id?: string
          share_method?: string
          share_url?: string
          shared_by?: string
          shared_with?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_shares_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_status_history: {
        Row: {
          changed_by: string | null
          created_at: string | null
          id: string
          note: string | null
          plan_id: string
          status: Database["public"]["Enums"]["plan_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          note?: string | null
          plan_id: string
          status: Database["public"]["Enums"]["plan_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          note?: string | null
          plan_id?: string
          status?: Database["public"]["Enums"]["plan_status"]
        }
        Relationships: [
          {
            foreignKeyName: "plan_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_status_history_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          downvotes: number | null
          id: string
          is_moderated: boolean | null
          parent_comment_id: string | null
          post_id: string | null
          updated_at: string | null
          upvotes: number | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          is_moderated?: boolean | null
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          is_moderated?: boolean | null
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string | null
          amenities: string[] | null
          area_sqm: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string
          coordinates: unknown | null
          created_at: string | null
          description: string | null
          district: string
          external_id: string | null
          features: Json | null
          floor_number: number | null
          floors: number | null
          id: string
          images: Json | null
          investment_metrics: Json | null
          is_featured: boolean | null
          latitude: number | null
          legal_status: string | null
          list_price: number
          listed_price: number | null
          longitude: number | null
          market_value_estimate: number | null
          neighborhood_data: Json | null
          ownership_type: string | null
          price_per_sqm: number | null
          property_features: Json | null
          property_name: string | null
          property_type: Database["public"]["Enums"]["property_type"]
          province: string
          published_at: string | null
          slug: string | null
          source_platform: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["property_status"] | null
          street_address: string | null
          tags: string[] | null
          title: string
          total_area: number | null
          total_floors: number | null
          updated_at: string | null
          usable_area: number | null
          view_count: number | null
          ward: string | null
          year_built: number | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city: string
          coordinates?: unknown | null
          created_at?: string | null
          description?: string | null
          district: string
          external_id?: string | null
          features?: Json | null
          floor_number?: number | null
          floors?: number | null
          id?: string
          images?: Json | null
          investment_metrics?: Json | null
          is_featured?: boolean | null
          latitude?: number | null
          legal_status?: string | null
          list_price: number
          listed_price?: number | null
          longitude?: number | null
          market_value_estimate?: number | null
          neighborhood_data?: Json | null
          ownership_type?: string | null
          price_per_sqm?: number | null
          property_features?: Json | null
          property_name?: string | null
          property_type: Database["public"]["Enums"]["property_type"]
          province: string
          published_at?: string | null
          slug?: string | null
          source_platform?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["property_status"] | null
          street_address?: string | null
          tags?: string[] | null
          title: string
          total_area?: number | null
          total_floors?: number | null
          updated_at?: string | null
          usable_area?: number | null
          view_count?: number | null
          ward?: string | null
          year_built?: number | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string
          coordinates?: unknown | null
          created_at?: string | null
          description?: string | null
          district?: string
          external_id?: string | null
          features?: Json | null
          floor_number?: number | null
          floors?: number | null
          id?: string
          images?: Json | null
          investment_metrics?: Json | null
          is_featured?: boolean | null
          latitude?: number | null
          legal_status?: string | null
          list_price?: number
          listed_price?: number | null
          longitude?: number | null
          market_value_estimate?: number | null
          neighborhood_data?: Json | null
          ownership_type?: string | null
          price_per_sqm?: number | null
          property_features?: Json | null
          property_name?: string | null
          property_type?: Database["public"]["Enums"]["property_type"]
          province?: string
          published_at?: string | null
          slug?: string | null
          source_platform?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["property_status"] | null
          street_address?: string | null
          tags?: string[] | null
          title?: string
          total_area?: number | null
          total_floors?: number | null
          updated_at?: string | null
          usable_area?: number | null
          view_count?: number | null
          ward?: string | null
          year_built?: number | null
        }
        Relationships: []
      }
      property_favorites: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_market_data: {
        Row: {
          average_price_per_sqm: number
          average_rent_per_sqm: number | null
          average_rental_yield: number | null
          city: string
          created_at: string | null
          data_period: string
          data_source: string | null
          days_on_market: number | null
          district: string
          id: string
          median_price_per_sqm: number | null
          occupancy_rate: number | null
          price_change_monthly: number | null
          price_change_yearly: number | null
          properties_listed: number | null
          properties_sold: number | null
          property_type: Database["public"]["Enums"]["property_type"]
          reliability_score: number | null
          ward: string | null
        }
        Insert: {
          average_price_per_sqm: number
          average_rent_per_sqm?: number | null
          average_rental_yield?: number | null
          city: string
          created_at?: string | null
          data_period: string
          data_source?: string | null
          days_on_market?: number | null
          district: string
          id?: string
          median_price_per_sqm?: number | null
          occupancy_rate?: number | null
          price_change_monthly?: number | null
          price_change_yearly?: number | null
          properties_listed?: number | null
          properties_sold?: number | null
          property_type: Database["public"]["Enums"]["property_type"]
          reliability_score?: number | null
          ward?: string | null
        }
        Update: {
          average_price_per_sqm?: number
          average_rent_per_sqm?: number | null
          average_rental_yield?: number | null
          city?: string
          created_at?: string | null
          data_period?: string
          data_source?: string | null
          days_on_market?: number | null
          district?: string
          id?: string
          median_price_per_sqm?: number | null
          occupancy_rate?: number | null
          price_change_monthly?: number | null
          price_change_yearly?: number | null
          properties_listed?: number | null
          properties_sold?: number | null
          property_type?: Database["public"]["Enums"]["property_type"]
          reliability_score?: number | null
          ward?: string | null
        }
        Relationships: []
      }
      recurring_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          end_date: string | null
          expense_category_id: string | null
          frequency: Database["public"]["Enums"]["recurring_frequency"]
          frequency_interval: number | null
          id: string
          income_category_id: string | null
          is_active: boolean | null
          max_occurrences: number | null
          name: string
          next_due_date: string | null
          occurrences_created: number | null
          start_date: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          transfer_to_wallet_id: string | null
          updated_at: string | null
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          expense_category_id?: string | null
          frequency: Database["public"]["Enums"]["recurring_frequency"]
          frequency_interval?: number | null
          id?: string
          income_category_id?: string | null
          is_active?: boolean | null
          max_occurrences?: number | null
          name: string
          next_due_date?: string | null
          occurrences_created?: number | null
          start_date: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          transfer_to_wallet_id?: string | null
          updated_at?: string | null
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          expense_category_id?: string | null
          frequency?: Database["public"]["Enums"]["recurring_frequency"]
          frequency_interval?: number | null
          id?: string
          income_category_id?: string | null
          is_active?: boolean | null
          max_occurrences?: number | null
          name?: string
          next_due_date?: string | null
          occurrences_created?: number | null
          start_date?: string
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          transfer_to_wallet_id?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_expense_category_id_fkey"
            columns: ["expense_category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_income_category_id_fkey"
            columns: ["income_category_id"]
            isOneToOne: false
            referencedRelation: "income_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_transfer_to_wallet_id_fkey"
            columns: ["transfer_to_wallet_id"]
            isOneToOne: false
            referencedRelation: "expense_wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "expense_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_budget_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          performed_by: string | null
          shared_budget_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
          shared_budget_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
          shared_budget_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_budget_activities_shared_budget_id_fkey"
            columns: ["shared_budget_id"]
            isOneToOne: false
            referencedRelation: "shared_budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_budget_categories: {
        Row: {
          allocated_amount: number
          category_alert_threshold: number | null
          category_id: string
          created_at: string | null
          enable_category_notifications: boolean | null
          id: string
          is_active: boolean | null
          shared_budget_id: string
          spent_amount: number
          updated_at: string | null
        }
        Insert: {
          allocated_amount?: number
          category_alert_threshold?: number | null
          category_id: string
          created_at?: string | null
          enable_category_notifications?: boolean | null
          id?: string
          is_active?: boolean | null
          shared_budget_id: string
          spent_amount?: number
          updated_at?: string | null
        }
        Update: {
          allocated_amount?: number
          category_alert_threshold?: number | null
          category_id?: string
          created_at?: string | null
          enable_category_notifications?: boolean | null
          id?: string
          is_active?: boolean | null
          shared_budget_id?: string
          spent_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_budget_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_budget_categories_shared_budget_id_fkey"
            columns: ["shared_budget_id"]
            isOneToOne: false
            referencedRelation: "shared_budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_budgets: {
        Row: {
          alert_threshold_percentage: number | null
          budget_period:
            | Database["public"]["Enums"]["budget_period_type"]
            | null
          created_at: string | null
          created_by: string | null
          description: string | null
          enable_category_alerts: boolean | null
          enable_overspending_alerts: boolean | null
          end_date: string
          id: string
          is_active: boolean | null
          is_template: boolean | null
          name: string
          shared_wallet_id: string
          start_date: string
          total_allocated: number
          total_budget: number
          total_spent: number
          updated_at: string | null
        }
        Insert: {
          alert_threshold_percentage?: number | null
          budget_period?:
            | Database["public"]["Enums"]["budget_period_type"]
            | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          enable_category_alerts?: boolean | null
          enable_overspending_alerts?: boolean | null
          end_date: string
          id?: string
          is_active?: boolean | null
          is_template?: boolean | null
          name: string
          shared_wallet_id: string
          start_date: string
          total_allocated?: number
          total_budget?: number
          total_spent?: number
          updated_at?: string | null
        }
        Update: {
          alert_threshold_percentage?: number | null
          budget_period?:
            | Database["public"]["Enums"]["budget_period_type"]
            | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          enable_category_alerts?: boolean | null
          enable_overspending_alerts?: boolean | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          is_template?: boolean | null
          name?: string
          shared_wallet_id?: string
          start_date?: string
          total_allocated?: number
          total_budget?: number
          total_spent?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_budgets_shared_wallet_id_fkey"
            columns: ["shared_wallet_id"]
            isOneToOne: false
            referencedRelation: "shared_expense_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_expense_wallets: {
        Row: {
          balance: number | null
          color: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          expense_approval_threshold: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          owner_id: string
          require_approval_for_expenses: boolean | null
          updated_at: string | null
          wallet_type: Database["public"]["Enums"]["wallet_type"]
        }
        Insert: {
          balance?: number | null
          color?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          expense_approval_threshold?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          owner_id: string
          require_approval_for_expenses?: boolean | null
          updated_at?: string | null
          wallet_type?: Database["public"]["Enums"]["wallet_type"]
        }
        Update: {
          balance?: number | null
          color?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          expense_approval_threshold?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          owner_id?: string
          require_approval_for_expenses?: boolean | null
          updated_at?: string | null
          wallet_type?: Database["public"]["Enums"]["wallet_type"]
        }
        Relationships: [
          {
            foreignKeyName: "shared_expense_wallets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_wallet_members: {
        Row: {
          can_add_transactions: boolean | null
          can_delete_transactions: boolean | null
          can_edit_transactions: boolean | null
          can_manage_budget: boolean | null
          id: string
          invited_at: string | null
          is_active: boolean | null
          joined_at: string | null
          role: string
          shared_wallet_id: string
          user_id: string
        }
        Insert: {
          can_add_transactions?: boolean | null
          can_delete_transactions?: boolean | null
          can_edit_transactions?: boolean | null
          can_manage_budget?: boolean | null
          id?: string
          invited_at?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          role?: string
          shared_wallet_id: string
          user_id: string
        }
        Update: {
          can_add_transactions?: boolean | null
          can_delete_transactions?: boolean | null
          can_edit_transactions?: boolean | null
          can_manage_budget?: boolean | null
          id?: string
          invited_at?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          role?: string
          shared_wallet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_wallet_members_shared_wallet_id_fkey"
            columns: ["shared_wallet_id"]
            isOneToOne: false
            referencedRelation: "shared_expense_wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_wallet_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_wallet_transactions: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          description: string | null
          expense_category_id: string | null
          id: string
          income_category_id: string | null
          is_approved: boolean | null
          notes: string | null
          receipt_images: Json | null
          requires_approval: boolean | null
          shared_wallet_id: string
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          description?: string | null
          expense_category_id?: string | null
          id?: string
          income_category_id?: string | null
          is_approved?: boolean | null
          notes?: string | null
          receipt_images?: Json | null
          requires_approval?: boolean | null
          shared_wallet_id: string
          transaction_date?: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          description?: string | null
          expense_category_id?: string | null
          id?: string
          income_category_id?: string | null
          is_approved?: boolean | null
          notes?: string | null
          receipt_images?: Json | null
          requires_approval?: boolean | null
          shared_wallet_id?: string
          transaction_date?: string
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_wallet_transactions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_wallet_transactions_expense_category_id_fkey"
            columns: ["expense_category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_wallet_transactions_income_category_id_fkey"
            columns: ["income_category_id"]
            isOneToOne: false
            referencedRelation: "income_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_wallet_transactions_shared_wallet_id_fkey"
            columns: ["shared_wallet_id"]
            isOneToOne: false
            referencedRelation: "shared_expense_wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_name: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_name?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_name?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string | null
          description: string
          id: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          ticket_number: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string | null
          description: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          ticket_number: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          ticket_number?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          progress_data: Json | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          progress_data?: Json | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          progress_data?: Json | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activities: {
        Row: {
          action: string
          activity_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          referer: string | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          activity_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          referer?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          activity_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          referer?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ai_corrections: {
        Row: {
          confidence_before: number | null
          corrected_data: Json
          correction_type: string
          created_at: string | null
          id: string
          input_text: string
          original_suggestion: Json
          pattern_frequency: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confidence_before?: number | null
          corrected_data: Json
          correction_type: string
          created_at?: string | null
          id?: string
          input_text: string
          original_suggestion: Json
          pattern_frequency?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confidence_before?: number | null
          corrected_data?: Json
          correction_type?: string
          created_at?: string | null
          id?: string
          input_text?: string
          original_suggestion?: Json
          pattern_frequency?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_expense_achievements: {
        Row: {
          achievement_id: string
          current_progress: number | null
          id: string
          is_unlocked: boolean | null
          progress_percentage: number | null
          required_progress: number
          tracking_data: Json | null
          unlocked_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          current_progress?: number | null
          id?: string
          is_unlocked?: boolean | null
          progress_percentage?: number | null
          required_progress: number
          tracking_data?: Json | null
          unlocked_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          current_progress?: number | null
          id?: string
          is_unlocked?: boolean | null
          progress_percentage?: number | null
          required_progress?: number
          tracking_data?: Json | null
          unlocked_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_expense_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "expense_achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_expense_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_expense_challenges: {
        Row: {
          challenge_id: string
          completed_at: string | null
          current_progress: number | null
          id: string
          is_abandoned: boolean | null
          is_completed: boolean | null
          progress_data: Json | null
          started_at: string | null
          target_progress: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          current_progress?: number | null
          id?: string
          is_abandoned?: boolean | null
          is_completed?: boolean | null
          progress_data?: Json | null
          started_at?: string | null
          target_progress: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          current_progress?: number | null
          id?: string
          is_abandoned?: boolean | null
          is_completed?: boolean | null
          progress_data?: Json | null
          started_at?: string | null
          target_progress?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_expense_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "expense_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_expense_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_experience: {
        Row: {
          achievements_unlocked: number | null
          calculations_performed: number | null
          current_level: number | null
          current_login_streak: number | null
          days_active: number | null
          experience_in_level: number | null
          experience_to_next_level: number | null
          id: string
          last_activity_date: string | null
          longest_login_streak: number | null
          plans_created: number | null
          properties_viewed: number | null
          total_experience: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievements_unlocked?: number | null
          calculations_performed?: number | null
          current_level?: number | null
          current_login_streak?: number | null
          days_active?: number | null
          experience_in_level?: number | null
          experience_to_next_level?: number | null
          id?: string
          last_activity_date?: string | null
          longest_login_streak?: number | null
          plans_created?: number | null
          properties_viewed?: number | null
          total_experience?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievements_unlocked?: number | null
          calculations_performed?: number | null
          current_level?: number | null
          current_login_streak?: number | null
          days_active?: number | null
          experience_in_level?: number | null
          experience_to_next_level?: number | null
          id?: string
          last_activity_date?: string | null
          longest_login_streak?: number | null
          plans_created?: number | null
          properties_viewed?: number | null
          total_experience?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_experience_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          achievement_notifications: boolean | null
          allow_data_sharing: boolean | null
          created_at: string | null
          dashboard_layout: string | null
          dashboard_widgets: Json | null
          email_notifications: boolean | null
          id: string
          market_update_notifications: boolean | null
          onboarding_progress: Json | null
          payment_reminder_notifications: boolean | null
          profile_visibility: string | null
          push_notifications: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievement_notifications?: boolean | null
          allow_data_sharing?: boolean | null
          created_at?: string | null
          dashboard_layout?: string | null
          dashboard_widgets?: Json | null
          email_notifications?: boolean | null
          id?: string
          market_update_notifications?: boolean | null
          onboarding_progress?: Json | null
          payment_reminder_notifications?: boolean | null
          profile_visibility?: string | null
          push_notifications?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievement_notifications?: boolean | null
          allow_data_sharing?: boolean | null
          created_at?: string | null
          dashboard_layout?: string | null
          dashboard_widgets?: Json | null
          email_notifications?: boolean | null
          id?: string
          market_update_notifications?: boolean | null
          onboarding_progress?: Json | null
          payment_reminder_notifications?: boolean | null
          profile_visibility?: string | null
          push_notifications?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          achievement_badges: string[] | null
          address: string | null
          annual_income: number | null
          avatar_url: string | null
          city: string | null
          company: string | null
          created_at: string | null
          currency: string | null
          currency_format: string | null
          current_assets: number | null
          current_debts: number | null
          date_of_birth: string | null
          district: string | null
          email: string
          experience_points: number | null
          full_name: string
          id: string
          is_active: boolean | null
          is_admin: boolean | null
          language: string | null
          last_login_at: string | null
          location: Json | null
          monthly_expenses: number | null
          monthly_income: number | null
          notification_preferences: Json | null
          occupation: string | null
          onboarding_completed: boolean | null
          phone: string | null
          preferred_language: string | null
          subscription_expires_at: string | null
          subscription_tier:
            | Database["public"]["Enums"]["user_subscription_tier"]
            | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          achievement_badges?: string[] | null
          address?: string | null
          annual_income?: number | null
          avatar_url?: string | null
          city?: string | null
          company?: string | null
          created_at?: string | null
          currency?: string | null
          currency_format?: string | null
          current_assets?: number | null
          current_debts?: number | null
          date_of_birth?: string | null
          district?: string | null
          email: string
          experience_points?: number | null
          full_name: string
          id: string
          is_active?: boolean | null
          is_admin?: boolean | null
          language?: string | null
          last_login_at?: string | null
          location?: Json | null
          monthly_expenses?: number | null
          monthly_income?: number | null
          notification_preferences?: Json | null
          occupation?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          preferred_language?: string | null
          subscription_expires_at?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["user_subscription_tier"]
            | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          achievement_badges?: string[] | null
          address?: string | null
          annual_income?: number | null
          avatar_url?: string | null
          city?: string | null
          company?: string | null
          created_at?: string | null
          currency?: string | null
          currency_format?: string | null
          current_assets?: number | null
          current_debts?: number | null
          date_of_birth?: string | null
          district?: string | null
          email?: string
          experience_points?: number | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          is_admin?: boolean | null
          language?: string | null
          last_login_at?: string | null
          location?: Json | null
          monthly_expenses?: number | null
          monthly_income?: number | null
          notification_preferences?: Json | null
          occupation?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          preferred_language?: string | null
          subscription_expires_at?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["user_subscription_tier"]
            | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_properties: {
        Row: {
          created_at: string | null
          current_value: number | null
          id: string
          is_active: boolean | null
          last_valuation_date: string | null
          loan_amount: number | null
          loan_interest_rate: number | null
          loan_term_months: number | null
          location: string
          monthly_expenses: number | null
          monthly_payment: number | null
          monthly_rental_income: number | null
          occupancy_rate: number | null
          property_id: string | null
          property_name: string
          property_type: Database["public"]["Enums"]["property_type"]
          purchase_date: string
          purchase_price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_active?: boolean | null
          last_valuation_date?: string | null
          loan_amount?: number | null
          loan_interest_rate?: number | null
          loan_term_months?: number | null
          location: string
          monthly_expenses?: number | null
          monthly_payment?: number | null
          monthly_rental_income?: number | null
          occupancy_rate?: number | null
          property_id?: string | null
          property_name: string
          property_type: Database["public"]["Enums"]["property_type"]
          purchase_date: string
          purchase_price: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_active?: boolean | null
          last_valuation_date?: string | null
          loan_amount?: number | null
          loan_interest_rate?: number | null
          loan_term_months?: number | null
          location?: string
          monthly_expenses?: number | null
          monthly_payment?: number | null
          monthly_rental_income?: number | null
          occupancy_rate?: number | null
          property_id?: string | null
          property_name?: string
          property_type?: Database["public"]["Enums"]["property_type"]
          purchase_date?: string
          purchase_price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      ai_usage_analytics: {
        Row: {
          avg_insights_per_user: number | null
          subscription_tier: string | null
          total_insights_generated: number | null
          unique_users: number | null
          usage_date: string | null
        }
        Relationships: []
      }
      budget_overview: {
        Row: {
          alert_sent_at: string | null
          alert_threshold_percentage: number | null
          budget_allocation: Json | null
          budget_method: string | null
          budget_period: string | null
          calculated_allocation: Json | null
          category_budgets: Json | null
          category_mapping: Json | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          remaining_amount: number | null
          spending_by_category: Json | null
          start_date: string | null
          total_budget: number | null
          total_spent: number | null
          total_spent_calculated: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          alert_sent_at?: string | null
          alert_threshold_percentage?: number | null
          budget_allocation?: Json | null
          budget_method?: string | null
          budget_period?: string | null
          calculated_allocation?: never
          category_budgets?: Json | null
          category_mapping?: Json | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          remaining_amount?: number | null
          spending_by_category?: never
          start_date?: string | null
          total_budget?: number | null
          total_spent?: number | null
          total_spent_calculated?: never
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          alert_sent_at?: string | null
          alert_threshold_percentage?: number | null
          budget_allocation?: Json | null
          budget_method?: string | null
          budget_period?: string | null
          calculated_allocation?: never
          category_budgets?: Json | null
          category_mapping?: Json | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          remaining_amount?: number | null
          spending_by_category?: never
          start_date?: string | null
          total_budget?: number | null
          total_spent?: number | null
          total_spent_calculated?: never
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_budgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_shares_with_users: {
        Row: {
          created_at: string | null
          id: string | null
          personal_message: string | null
          plan_description: string | null
          plan_id: string | null
          plan_name: string | null
          share_method: string | null
          share_url: string | null
          shared_by: string | null
          shared_by_email: string | null
          shared_by_name: string | null
          shared_with: string[] | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_shares_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      recent_ai_insights: {
        Row: {
          ai_model: string | null
          average_rating: number | null
          confidence_score: number | null
          created_at: string | null
          expires_at: string | null
          generated_at: string | null
          id: string | null
          insight_text: string | null
          insight_type: string | null
          interaction_count: number | null
          invalidated_at: string | null
          invalidation_reason: string | null
          is_valid: boolean | null
          metadata: Json | null
          processing_time_ms: number | null
          subscription_tier:
            | Database["public"]["Enums"]["user_subscription_tier"]
            | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_financial_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_monthly_payment: {
        Args: { principal: number; annual_rate: number; term_months: number }
        Returns: number
      }
      cleanup_expired_ai_insights: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_batch_transactions: {
        Args: { batch_data: Json }
        Returns: Json
      }
      create_demo_user_profile: {
        Args: { p_user_id: string; p_email?: string; p_full_name?: string }
        Returns: undefined
      }
      get_ai_patterns_for_user: {
        Args: { p_user_id: string; p_pattern_type?: string; p_limit?: number }
        Returns: {
          id: string
          pattern_type: string
          trigger_text: string
          predicted_category_id: string
          predicted_amount_range: Json
          predicted_tags: string[]
          confidence_score: number
          usage_count: number
          success_rate: number
        }[]
      }
      get_current_rates: {
        Args: { p_loan_term_years?: number }
        Returns: {
          bank_name: string
          promotional_rate: number
          standard_rate: number
          min_down_payment: number
        }[]
      }
      get_dashboard_market_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          location: string
          property_type: Database["public"]["Enums"]["property_type"]
          avg_price_change: number
          trend_direction: string
        }[]
      }
      get_feature_usage: {
        Args: {
          p_user_id: string
          p_feature_key: string
          p_period_type?: string
        }
        Returns: {
          usage_count: number
          period_start: string
          period_end: string
          last_used: string
        }[]
      }
      get_market_summary: {
        Args: { p_city: string; p_district?: string }
        Returns: {
          property_type: Database["public"]["Enums"]["property_type"]
          avg_price_sqm: number
          rental_yield: number
          price_change_yearly: number
          market_activity: string
        }[]
      }
      get_plan_share_analytics: {
        Args: { user_id: string }
        Returns: Json
      }
      get_property_image_urls: {
        Args: { property_id: string }
        Returns: string[]
      }
      get_shared_wallet_budget_summary: {
        Args: { wallet_id: string }
        Returns: Json
      }
      get_user_dashboard_metrics: {
        Args: { p_user_id: string }
        Returns: {
          total_plans: number
          active_plans: number
          total_portfolio_value: number
          monthly_rental_income: number
          portfolio_roi: number
          experience_points: number
          current_level: number
          unread_notifications: number
        }[]
      }
      get_user_onboarding_status: {
        Args: { user_uuid: string }
        Returns: {
          has_completed_onboarding: boolean
          onboarding_progress: Json
          recommended_tour: string
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      increment_feature_usage: {
        Args: {
          p_user_id: string
          p_feature_key: string
          p_period_type?: string
        }
        Returns: {
          current_count: number
          period_start: string
          period_end: string
        }[]
      }
      is_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      log_ai_correction: {
        Args: {
          p_user_id: string
          p_input_text: string
          p_original_suggestion: Json
          p_corrected_data: Json
          p_correction_type: string
          p_confidence_before?: number
        }
        Returns: string
      }
      reset_feature_usage: {
        Args: { p_user_id: string; p_feature_key?: string }
        Returns: number
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      track_onboarding_event: {
        Args: { p_user_id: string; p_event_type: string; p_event_data?: Json }
        Returns: string
      }
      update_ai_pattern_usage: {
        Args: { p_pattern_id: string; p_success?: boolean }
        Returns: undefined
      }
      update_daily_challenge_progress: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_plan_calculations: {
        Args: { plan_id: string }
        Returns: undefined
      }
      validate_transaction_batch: {
        Args: { batch_data: Json }
        Returns: Json
      }
    }
    Enums: {
      achievement_type:
        | "milestone"
        | "usage"
        | "financial"
        | "social"
        | "learning"
      budget_alert_type: "percentage" | "amount_remaining" | "amount_spent"
      budget_period_type:
        | "weekly"
        | "monthly"
        | "quarterly"
        | "yearly"
        | "custom"
      expense_category_type:
        | "food_dining"
        | "transportation"
        | "shopping"
        | "bills_utilities"
        | "entertainment"
        | "healthcare"
        | "education"
        | "travel"
        | "gifts_charity"
        | "personal_care"
        | "other"
      goal_status: "active" | "paused" | "completed" | "cancelled"
      goal_type:
        | "general_savings"
        | "emergency_fund"
        | "vacation"
        | "education"
        | "buy_house"
        | "buy_car"
        | "other"
      income_category_type:
        | "salary"
        | "bonus"
        | "freelance"
        | "investment"
        | "rental"
        | "business"
        | "gift"
        | "refund"
        | "other"
      legal_status_enum: "red_book" | "pink_book" | "pending" | "disputed"
      notification_type:
        | "info"
        | "success"
        | "warning"
        | "error"
        | "achievement"
      ownership_type_enum: "individual" | "joint" | "company"
      plan_status: "draft" | "active" | "completed" | "archived"
      plan_type_enum: "home_purchase" | "investment" | "upgrade" | "refinance"
      property_status:
        | "for_sale"
        | "sold"
        | "for_rent"
        | "rented"
        | "off_market"
      property_type:
        | "apartment"
        | "house"
        | "villa"
        | "townhouse"
        | "land"
        | "commercial"
      rate_category_enum: "promotional" | "standard" | "vip" | "prime"
      rate_type_enum: "fixed" | "variable" | "mixed"
      recurring_frequency: "daily" | "weekly" | "monthly" | "yearly"
      subscription_status:
        | "active"
        | "inactive"
        | "trialing"
        | "past_due"
        | "canceled"
        | "unpaid"
      transaction_type: "income" | "expense" | "transfer"
      user_subscription_tier: "free" | "premium" | "professional"
      wallet_type:
        | "cash"
        | "bank_account"
        | "credit_card"
        | "e_wallet"
        | "investment"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      achievement_type: [
        "milestone",
        "usage",
        "financial",
        "social",
        "learning",
      ],
      budget_alert_type: ["percentage", "amount_remaining", "amount_spent"],
      budget_period_type: [
        "weekly",
        "monthly",
        "quarterly",
        "yearly",
        "custom",
      ],
      expense_category_type: [
        "food_dining",
        "transportation",
        "shopping",
        "bills_utilities",
        "entertainment",
        "healthcare",
        "education",
        "travel",
        "gifts_charity",
        "personal_care",
        "other",
      ],
      goal_status: ["active", "paused", "completed", "cancelled"],
      goal_type: [
        "general_savings",
        "emergency_fund",
        "vacation",
        "education",
        "buy_house",
        "buy_car",
        "other",
      ],
      income_category_type: [
        "salary",
        "bonus",
        "freelance",
        "investment",
        "rental",
        "business",
        "gift",
        "refund",
        "other",
      ],
      legal_status_enum: ["red_book", "pink_book", "pending", "disputed"],
      notification_type: ["info", "success", "warning", "error", "achievement"],
      ownership_type_enum: ["individual", "joint", "company"],
      plan_status: ["draft", "active", "completed", "archived"],
      plan_type_enum: ["home_purchase", "investment", "upgrade", "refinance"],
      property_status: ["for_sale", "sold", "for_rent", "rented", "off_market"],
      property_type: [
        "apartment",
        "house",
        "villa",
        "townhouse",
        "land",
        "commercial",
      ],
      rate_category_enum: ["promotional", "standard", "vip", "prime"],
      rate_type_enum: ["fixed", "variable", "mixed"],
      recurring_frequency: ["daily", "weekly", "monthly", "yearly"],
      subscription_status: [
        "active",
        "inactive",
        "trialing",
        "past_due",
        "canceled",
        "unpaid",
      ],
      transaction_type: ["income", "expense", "transfer"],
      user_subscription_tier: ["free", "premium", "professional"],
      wallet_type: [
        "cash",
        "bank_account",
        "credit_card",
        "e_wallet",
        "investment",
        "other",
      ],
    },
  },
} as const

