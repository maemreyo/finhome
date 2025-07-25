import { Database } from "../../types/supabase"

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
export type FaqItem = Database['public']['Tables']['faq_items']['Row']
export type SupportTicket = Database['public']['Tables']['support_tickets']['Row']
export type AnalyticsMetric = Database['public']['Tables']['analytics_metrics']['Row']
export type FinancialScenario = Database['public']['Tables']['financial_scenarios']['Row']
export type MarketInsight = Database['public']['Tables']['market_insights']['Row']
export type UserExperience = Database['public']['Tables']['user_experience']['Row']
export type PlanMilestone = Database['public']['Tables']['plan_milestones']['Row']
export type PlanStatusHistory = Database['public']['Tables']['plan_status_history']['Row']
export type PlanShare = Database['public']['Tables']['plan_shares']['Row']
export type UserFavorite = Database['public']['Tables']['user_favorites']['Row']
export type FeatureUsage = Database['public']['Tables']['feature_usage']['Row']

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
export type PlanMilestoneInsert = Database['public']['Tables']['plan_milestones']['Insert']
export type PlanMilestoneUpdate = Database['public']['Tables']['plan_milestones']['Update']
export type PlanStatusHistoryInsert = Database['public']['Tables']['plan_status_history']['Insert']
export type PlanShareInsert = Database['public']['Tables']['plan_shares']['Insert']
export type PlanShareUpdate = Database['public']['Tables']['plan_shares']['Update']
export type UserFavoriteInsert = Database['public']['Tables']['user_favorites']['Insert']

// Expense tracking types
export type ExpenseTransaction = Database['public']['Tables']['expense_transactions']['Row']
export type ExpenseTransactionInsert = Database['public']['Tables']['expense_transactions']['Insert']
export type ExpenseTransactionUpdate = Database['public']['Tables']['expense_transactions']['Update']
export type ExpenseCategory = Database['public']['Tables']['expense_categories']['Row']
export type ExpenseCategoryInsert = Database['public']['Tables']['expense_categories']['Insert']
export type IncomeCategory = Database['public']['Tables']['income_categories']['Row']
export type IncomeCategoryInsert = Database['public']['Tables']['income_categories']['Insert']
export type ExpenseWallet = Database['public']['Tables']['expense_wallets']['Row']
export type ExpenseWalletInsert = Database['public']['Tables']['expense_wallets']['Insert']
export type ExpenseWalletUpdate = Database['public']['Tables']['expense_wallets']['Update']
export type ExpenseBudget = Database['public']['Tables']['expense_budgets']['Row']
export type ExpenseBudgetInsert = Database['public']['Tables']['expense_budgets']['Insert']
export type ExpenseBudgetUpdate = Database['public']['Tables']['expense_budgets']['Update']
export type ExpenseGoal = Database['public']['Tables']['expense_goals']['Row']
export type ExpenseGoalInsert = Database['public']['Tables']['expense_goals']['Insert']
export type ExpenseGoalUpdate = Database['public']['Tables']['expense_goals']['Update']
export type GoalContribution = Database['public']['Tables']['goal_contributions']['Row']
export type GoalContributionInsert = Database['public']['Tables']['goal_contributions']['Insert']
export type ExpenseAchievement = Database['public']['Tables']['expense_achievements']['Row']
export type ExpenseAchievementInsert = Database['public']['Tables']['expense_achievements']['Insert']
export type ExpenseChallenge = Database['public']['Tables']['expense_challenges']['Row']
export type ExpenseChallengeInsert = Database['public']['Tables']['expense_challenges']['Insert']
export type UserChallenge = Database['public']['Tables']['user_challenges']['Row']
export type UserChallengeInsert = Database['public']['Tables']['user_challenges']['Insert']
export type UserChallengeUpdate = Database['public']['Tables']['user_challenges']['Update']
export type BudgetCategory = Database['public']['Tables']['budget_categories']['Row']
export type BudgetCategoryInsert = Database['public']['Tables']['budget_categories']['Insert']

// New table types
export type GeminiApiKey = Database['public']['Tables']['gemini_api_keys']['Row']
export type GeminiApiKeyInsert = Database['public']['Tables']['gemini_api_keys']['Insert']
export type GeminiApiKeyUpdate = Database['public']['Tables']['gemini_api_keys']['Update']
export type GeminiKeyAuditLog = Database['public']['Tables']['gemini_key_audit_log']['Row']
export type GeminiKeyAuditLogInsert = Database['public']['Tables']['gemini_key_audit_log']['Insert']
export type SharedExpenseWallet = Database['public']['Tables']['shared_expense_wallets']['Row']
export type SharedExpenseWalletInsert = Database['public']['Tables']['shared_expense_wallets']['Insert']
export type SharedExpenseWalletUpdate = Database['public']['Tables']['shared_expense_wallets']['Update']
export type SharedWalletMember = Database['public']['Tables']['shared_wallet_members']['Row']
export type SharedWalletMemberInsert = Database['public']['Tables']['shared_wallet_members']['Insert']
export type SharedWalletMemberUpdate = Database['public']['Tables']['shared_wallet_members']['Update']
export type UserExpenseChallenge = Database['public']['Tables']['user_expense_challenges']['Row']
export type UserExpenseChallengeInsert = Database['public']['Tables']['user_expense_challenges']['Insert']
export type UserExpenseChallengeUpdate = Database['public']['Tables']['user_expense_challenges']['Update']

// Expense tracking enums
export type TransactionType = 'expense' | 'income' | 'transfer'
export type WalletType = 'cash' | 'bank_account' | 'e_wallet' | 'credit_card' | 'savings' | 'investment' | 'other'
export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly'
export type GoalType = 'general_savings' | 'emergency_fund' | 'vacation' | 'education' | 'buy_house' | 'buy_car' | 'other'
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled'
export type AchievementCategory = 'first_time' | 'streak' | 'savings' | 'budgeting' | 'house_purchase'
export type ChallengeType = 'daily' | 'weekly' | 'monthly' | 'special'
export type ChallengeCategory = 'budgeting' | 'saving' | 'tracking' | 'house_goal'

// New enums for added tables
export type GeminiKeyAction = 'created' | 'updated' | 'deleted' | 'used' | 'failed'
export type SharedWalletRole = 'owner' | 'admin' | 'member'