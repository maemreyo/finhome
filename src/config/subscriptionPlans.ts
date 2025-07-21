// src/config/subscriptionPlans.ts
// Configuration for subscription plans and features

import { SubscriptionPlan, FeatureGate } from '@/types/subscription'
import { UserSubscriptionTier } from '@/lib/supabase/types'

// Subscription plans configuration based on monetization strategy
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    nameVi: 'Miễn phí',
    description: 'Perfect for getting started with basic financial planning',
    descriptionVi: 'Hoàn hảo để bắt đầu với lập kế hoạch tài chính cơ bản',
    tier: 'free',
    price: {
      monthly: 0,
      yearly: 0,
      currency: 'VND'
    },
    stripeIds: {
      monthly: '',
      yearly: ''
    },
    features: [
      {
        id: 'basic_planning',
        name: 'Basic Financial Planning',
        nameVi: 'Lập kế hoạch tài chính cơ bản',
        description: 'Create up to 2 active financial plans',
        descriptionVi: 'Tạo tối đa 2 kế hoạch tài chính đang hoạt động',
        included: true,
        category: 'core'
      },
      {
        id: 'basic_calculations',
        name: 'Basic Loan Calculations',
        nameVi: 'Tính toán vay cơ bản',
        description: 'Simple principal and interest calculations',
        descriptionVi: 'Tính toán gốc và lãi đơn giản',
        included: true,
        category: 'core'
      },
      {
        id: 'property_search_basic',
        name: 'Basic Property Search',
        nameVi: 'Tìm kiếm bất động sản cơ bản',
        description: 'Limited filters and basic property information',
        descriptionVi: 'Bộ lọc giới hạn và thông tin bất động sản cơ bản',
        included: true,
        category: 'core'
      },
      {
        id: 'public_market_data',
        name: 'Public Market Data',
        nameVi: 'Dữ liệu thị trường công khai',
        description: 'Basic interest rates and pricing information',
        descriptionVi: 'Lãi suất cơ bản và thông tin giá cả',
        included: true,
        category: 'core'
      }
    ],
    limits: {
      maxActivePlans: 2,
      maxDraftPlans: 5,
      maxScenarios: 1,
      maxCalculationsPerMonth: 50,
      maxPropertySearches: 20,
      maxPropertyViews: 100,
      accessToRealTimeData: false,
      accessToHistoricalData: false,
      maxSharedPlans: 0,
      collaborationEnabled: false,
      advancedAnalytics: false,
      customReports: false,
      exportCapabilities: [],
      prioritySupport: false,
      accessToWebinars: false,
      accessToExpertContent: false,
      experienceBoost: 1.0,
      exclusiveBadges: false,
      adFree: false,
      customBranding: false,
      apiAccess: false
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    nameVi: 'Cao cấp',
    description: 'Unlock the full power of FinHome for serious property investors',
    descriptionVi: 'Mở khóa toàn bộ sức mạnh của FinHome cho các nhà đầu tư bất động sản nghiêm túc',
    tier: 'premium',
    price: {
      monthly: 299000, // 299,000 VND (~$12.50)
      yearly: 2990000, // 2,990,000 VND (~$125, ~17% discount)
      currency: 'VND'
    },
    stripeIds: {
      monthly: 'price_premium_monthly_vnd',
      yearly: 'price_premium_yearly_vnd'
    },
    popular: true,
    trial: {
      enabled: true,
      days: 14
    },
    features: [
      {
        id: 'unlimited_plans',
        name: 'Unlimited Financial Plans',
        nameVi: 'Kế hoạch tài chính không giới hạn',
        description: 'Create and manage unlimited financial plans',
        descriptionVi: 'Tạo và quản lý kế hoạch tài chính không giới hạn',
        included: true,
        highlighted: true,
        category: 'core'
      },
      {
        id: 'advanced_calculations',
        name: 'Advanced Loan Calculations',
        nameVi: 'Tính toán vay nâng cao',
        description: 'Multi-stage rates, prepayment analysis, stress testing',
        descriptionVi: 'Lãi suất đa giai đoạn, phân tích trả trước, kiểm tra sức chịu đựng',
        included: true,
        highlighted: true,
        category: 'advanced'
      },
      {
        id: 'scenario_comparison',
        name: 'Advanced Scenario Comparison',
        nameVi: 'So sánh kịch bản nâng cao',
        description: 'Unlimited scenarios, sensitivity analysis, advanced charts',
        descriptionVi: 'Kịch bản không giới hạn, phân tích độ nhạy, biểu đồ nâng cao',
        included: true,
        highlighted: true,
        category: 'advanced'
      },
      {
        id: 'real_time_data',
        name: 'Real-time Market Data',
        nameVi: 'Dữ liệu thị trường thời gian thực',
        description: 'Live interest rates, property trends, market insights',
        descriptionVi: 'Lãi suất trực tiếp, xu hướng bất động sản, thông tin thị trường',
        included: true,
        category: 'premium'
      },
      {
        id: 'collaboration',
        name: 'Collaboration Features',
        nameVi: 'Tính năng cộng tác',
        description: 'Share plans with family, comments, version history',
        descriptionVi: 'Chia sẻ kế hoạch với gia đình, bình luận, lịch sử phiên bản',
        included: true,
        category: 'premium'
      },
      {
        id: 'priority_support',
        name: 'Priority Support',
        nameVi: 'Hỗ trợ ưu tiên',
        description: 'Faster customer support response times',
        descriptionVi: 'Thời gian phản hồi hỗ trợ khách hàng nhanh hơn',
        included: true,
        category: 'support'
      },
      {
        id: 'ad_free',
        name: 'Ad-free Experience',
        nameVi: 'Trải nghiệm không quảng cáo',
        description: 'Clean interface without advertisements',
        descriptionVi: 'Giao diện sạch sẽ không có quảng cáo',
        included: true,
        category: 'premium'
      },
      {
        id: 'expert_content',
        name: 'Exclusive Content & Webinars',
        nameVi: 'Nội dung độc quyền & Webinar',
        description: 'Expert analysis, investment strategy webinars',
        descriptionVi: 'Phân tích chuyên gia, webinar chiến lược đầu tư',
        included: true,
        category: 'premium'
      },
      {
        id: 'experience_boost',
        name: 'Gamification Boost',
        nameVi: 'Tăng tốc Gamification',
        description: '50% faster XP gain, exclusive badges',
        descriptionVi: 'Tăng XP nhanh hơn 50%, huy hiệu độc quyền',
        included: true,
        category: 'premium'
      }
    ],
    limits: {
      maxActivePlans: null, // unlimited
      maxDraftPlans: null,
      maxScenarios: null,
      maxCalculationsPerMonth: null,
      maxPropertySearches: null,
      maxPropertyViews: null,
      accessToRealTimeData: true,
      accessToHistoricalData: true,
      maxSharedPlans: null,
      collaborationEnabled: true,
      advancedAnalytics: true,
      customReports: true,
      exportCapabilities: ['pdf', 'excel'],
      prioritySupport: true,
      accessToWebinars: true,
      accessToExpertContent: true,
      experienceBoost: 1.5,
      exclusiveBadges: true,
      adFree: true,
      customBranding: false,
      apiAccess: false
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    nameVi: 'Chuyên nghiệp',
    description: 'Advanced tools for real estate professionals and serious investors',
    descriptionVi: 'Công cụ nâng cao cho chuyên gia bất động sản và nhà đầu tư nghiêm túc',
    tier: 'professional',
    price: {
      monthly: 599000, // 599,000 VND (~$25)
      yearly: 5990000, // 5,990,000 VND (~$250, ~17% discount)
      currency: 'VND'
    },
    stripeIds: {
      monthly: 'price_professional_monthly_vnd',
      yearly: 'price_professional_yearly_vnd'
    },
    trial: {
      enabled: true,
      days: 7
    },
    features: [
      {
        id: 'all_premium_features',
        name: 'All Premium Features',
        nameVi: 'Tất cả tính năng Cao cấp',
        description: 'Everything included in Premium plan',
        descriptionVi: 'Mọi thứ bao gồm trong gói Cao cấp',
        included: true,
        category: 'core'
      },
      {
        id: 'monte_carlo_analysis',
        name: 'Monte Carlo Analysis',
        nameVi: 'Phân tích Monte Carlo',
        description: 'Advanced risk modeling and probability analysis',
        descriptionVi: 'Mô hình rủi ro nâng cao và phân tích xác suất',
        included: true,
        highlighted: true,
        category: 'analytics'
      },
      {
        id: 'api_access',
        name: 'API Access',
        nameVi: 'Truy cập API',
        description: 'Integrate FinHome data with your own tools',
        descriptionVi: 'Tích hợp dữ liệu FinHome với công cụ của bạn',
        included: true,
        highlighted: true,
        category: 'advanced'
      },
      {
        id: 'custom_branding',
        name: 'Custom Branding',
        nameVi: 'Thương hiệu tùy chỉnh',
        description: 'White-label reports with your company branding',
        descriptionVi: 'Báo cáo nhãn trắng với thương hiệu công ty của bạn',
        included: true,
        category: 'premium'
      },
      {
        id: 'advanced_export',
        name: 'Advanced Export Options',
        nameVi: 'Tùy chọn xuất nâng cao',
        description: 'Export to CSV, detailed PDF reports, PowerPoint',
        descriptionVi: 'Xuất ra CSV, báo cáo PDF chi tiết, PowerPoint',
        included: true,
        category: 'analytics'
      },
      {
        id: 'bulk_analysis',
        name: 'Bulk Property Analysis',
        nameVi: 'Phân tích bất động sản hàng loạt',
        description: 'Analyze multiple properties simultaneously',
        descriptionVi: 'Phân tích nhiều bất động sản cùng lúc',
        included: true,
        category: 'advanced'
      },
      {
        id: 'dedicated_support',
        name: 'Dedicated Support',
        nameVi: 'Hỗ trợ chuyên dụng',
        description: 'Dedicated account manager and phone support',
        descriptionVi: 'Quản lý tài khoản chuyên dụng và hỗ trợ qua điện thoại',
        included: true,
        category: 'support'
      }
    ],
    limits: {
      maxActivePlans: null,
      maxDraftPlans: null,
      maxScenarios: null,
      maxCalculationsPerMonth: null,
      maxPropertySearches: null,
      maxPropertyViews: null,
      accessToRealTimeData: true,
      accessToHistoricalData: true,
      maxSharedPlans: null,
      collaborationEnabled: true,
      advancedAnalytics: true,
      customReports: true,
      exportCapabilities: ['pdf', 'excel', 'csv', 'powerpoint'],
      prioritySupport: true,
      accessToWebinars: true,
      accessToExpertContent: true,
      experienceBoost: 2.0,
      exclusiveBadges: true,
      adFree: true,
      customBranding: true,
      apiAccess: true
    }
  }
]

// Feature gates configuration
export const FEATURE_GATES: FeatureGate[] = [
  {
    key: 'unlimited_plans',
    name: 'Unlimited Plans',
    nameVi: 'Kế hoạch không giới hạn',
    description: 'Create unlimited financial plans',
    descriptionVi: 'Tạo kế hoạch tài chính không giới hạn',
    requiredTier: 'premium',
    category: 'core',
    checkAccess: async (user, usage) => {
      if (user.subscription_tier === 'free') {
        // Free users limited to 2 active plans
        const planCount = usage?.activePlans || 0
        if (planCount >= 2) {
          return {
            hasAccess: false,
            reason: 'limit_exceeded',
            upgradeRequired: 'premium',
            currentUsage: planCount,
            limit: 2
          }
        }
      }
      return { hasAccess: true }
    }
  },
  {
    key: 'advanced_calculations',
    name: 'Advanced Calculations',
    nameVi: 'Tính toán nâng cao',
    description: 'Multi-stage rates and advanced loan features',
    descriptionVi: 'Lãi suất đa giai đoạn và tính năng vay nâng cao',
    requiredTier: 'premium',
    category: 'advanced',
    checkAccess: async (user) => {
      const tierOrder: UserSubscriptionTier[] = ['free', 'premium', 'professional']
      const userTierIndex = tierOrder.indexOf(user.subscription_tier || 'free')
      const requiredTierIndex = tierOrder.indexOf('premium')
      
      if (userTierIndex < requiredTierIndex) {
        return {
          hasAccess: false,
          reason: 'subscription_required',
          upgradeRequired: 'premium'
        }
      }
      return { hasAccess: true }
    }
  },
  {
    key: 'scenario_comparison',
    name: 'Scenario Comparison',
    nameVi: 'So sánh kịch bản',
    description: 'Compare multiple financial scenarios',
    descriptionVi: 'So sánh nhiều kịch bản tài chính',
    requiredTier: 'premium',
    category: 'advanced',
    checkAccess: async (user, usage) => {
      if (user.subscription_tier === 'free') {
        // Free users limited to 1 scenario per plan
        const scenarioCount = usage?.scenarios || 0
        if (scenarioCount >= 1) {
          return {
            hasAccess: false,
            reason: 'limit_exceeded',
            upgradeRequired: 'premium',
            currentUsage: scenarioCount,
            limit: 1
          }
        }
      }
      return { hasAccess: true }
    }
  },
  {
    key: 'real_time_data',
    name: 'Real-time Data',
    nameVi: 'Dữ liệu thời gian thực',
    description: 'Access to real-time market data and rates',
    descriptionVi: 'Truy cập dữ liệu thị trường và lãi suất thời gian thực',
    requiredTier: 'premium',
    category: 'premium',
    checkAccess: async (user) => {
      if (user.subscription_tier === 'free') {
        return {
          hasAccess: false,
          reason: 'subscription_required',
          upgradeRequired: 'premium'
        }
      }
      return { hasAccess: true }
    }
  },
  {
    key: 'monte_carlo_analysis',
    name: 'Monte Carlo Analysis',
    nameVi: 'Phân tích Monte Carlo',
    description: 'Advanced probability and risk analysis',
    descriptionVi: 'Phân tích xác suất và rủi ro nâng cao',
    requiredTier: 'professional',
    category: 'analytics',
    checkAccess: async (user) => {
      if (user.subscription_tier !== 'professional') {
        return {
          hasAccess: false,
          reason: 'subscription_required',
          upgradeRequired: 'professional'
        }
      }
      return { hasAccess: true }
    }
  },
  {
    key: 'api_access',
    name: 'API Access',
    nameVi: 'Truy cập API',
    description: 'Programmatic access to FinHome data',
    descriptionVi: 'Truy cập lập trình vào dữ liệu FinHome',
    requiredTier: 'professional',
    category: 'advanced',
    checkAccess: async (user) => {
      if (user.subscription_tier !== 'professional') {
        return {
          hasAccess: false,
          reason: 'subscription_required',
          upgradeRequired: 'professional'
        }
      }
      return { hasAccess: true }
    }
  }
]

// Helper functions
export function getPlanById(planId: string): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId) || null
}

export function getPlanByTier(tier: UserSubscriptionTier): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS.find(plan => plan.tier === tier) || null
}

export function getFeatureGate(featureKey: string): FeatureGate | null {
  return FEATURE_GATES.find(gate => gate.key === featureKey) || null
}

export function formatPrice(price: number, currency = 'VND'): string {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(price)
}

export function calculateYearlyDiscount(plan: SubscriptionPlan): number {
  if (plan.price.monthly === 0) return 0
  const monthlyTotal = plan.price.monthly * 12
  const savings = monthlyTotal - plan.price.yearly
  return Math.round((savings / monthlyTotal) * 100)
}