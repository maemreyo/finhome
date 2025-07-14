# 🚀 Next.js API Routes Architecture
## Real Estate Financial Planning Application

---

## 📋 **API STRUCTURE OVERVIEW**

### **File Structure (App Router)**
```
app/
├── api/
│   ├── auth/
│   ├── users/
│   ├── plans/
│   ├── calculations/
│   ├── market-data/
│   ├── community/
│   ├── notifications/
│   ├── admin/
│   └── webhooks/
├── (auth)/
├── dashboard/
└── ...
```

### **API Design Principles**
- **RESTful Design**: Standard HTTP methods và status codes
- **Consistent Response Format**: Unified error/success responses
- **Input Validation**: Zod schemas cho all endpoints
- **Rate Limiting**: Protect against abuse
- **Caching Strategy**: Redis/Next.js cache cho performance
- **Real-time Updates**: WebSocket integration where needed

---

## 🔐 **1. AUTHENTICATION & USER MANAGEMENT**

### **Auth Routes**
```typescript
// app/api/auth/[...nextauth]/route.ts
// Supabase Auth integration với NextAuth.js

// app/api/auth/signup/route.ts
POST /api/auth/signup
Request: { email, password, fullName, phone? }
Response: { user, session, onboardingRequired: boolean }

// app/api/auth/verify/route.ts  
POST /api/auth/verify
Request: { token, email }
Response: { success: boolean, redirectUrl?: string }

// app/api/auth/forgot-password/route.ts
POST /api/auth/forgot-password
Request: { email }
Response: { message: string }

// app/api/auth/reset-password/route.ts
POST /api/auth/reset-password
Request: { token, newPassword }
Response: { success: boolean }
```

### **User Profile Management**
```typescript
// app/api/users/profile/route.ts
GET /api/users/profile
Response: UserProfile

PUT /api/users/profile
Request: Partial<UserProfile>
Response: UserProfile

// app/api/users/onboarding/route.ts
POST /api/users/onboarding
Request: { 
  personalInfo: PersonalInfo,
  financialProfile: FinancialProfile,
  preferences: UserPreferences 
}
Response: { completed: boolean, nextStep?: string }

// app/api/users/subscription/route.ts
GET /api/users/subscription
Response: SubscriptionInfo

POST /api/users/subscription/upgrade
Request: { tier: 'premium' | 'professional', paymentMethod }
Response: { subscriptionId, status, expiresAt }

// app/api/users/preferences/route.ts
GET /api/users/preferences
PUT /api/users/preferences
Request: UserPreferences
Response: UserPreferences
```

---

## 📊 **2. FINANCIAL PLANNING CORE**

### **Financial Plans CRUD**
```typescript
// app/api/plans/route.ts
GET /api/plans
Query: { page?, limit?, status?, type? }
Response: { 
  plans: FinancialPlan[], 
  pagination: PaginationInfo,
  summary: DashboardSummary 
}

POST /api/plans
Request: CreateFinancialPlanRequest
Response: { 
  plan: FinancialPlan, 
  loanTerms: LoanTerms,
  baselineScenario: Scenario 
}

// app/api/plans/[planId]/route.ts
GET /api/plans/[planId]
Response: {
  plan: FinancialPlan,
  loanTerms: LoanTerms,
  scenarios: Scenario[],
  timeline: TimelineEvent[],
  marketContext: MarketContext
}

PUT /api/plans/[planId]
Request: UpdateFinancialPlanRequest
Response: FinancialPlan

DELETE /api/plans/[planId]
Response: { success: boolean }

// app/api/plans/[planId]/duplicate/route.ts
POST /api/plans/[planId]/duplicate
Request: { name: string, modifications?: PlanModifications }
Response: FinancialPlan
```

### **Loan Terms & Calculations**
```typescript
// app/api/plans/[planId]/loan-terms/route.ts
GET /api/plans/[planId]/loan-terms
Response: LoanTerms

PUT /api/plans/[planId]/loan-terms
Request: UpdateLoanTermsRequest
Response: {
  loanTerms: LoanTerms,
  updatedCalculations: CalculationResults,
  impactAnalysis: ImpactAnalysis
}

// app/api/plans/[planId]/scenarios/route.ts
GET /api/plans/[planId]/scenarios
Response: Scenario[]

POST /api/plans/[planId]/scenarios
Request: CreateScenarioRequest
Response: {
  scenario: Scenario,
  calculations: CalculationResults,
  comparison: ComparisonResults
}

// app/api/plans/[planId]/scenarios/[scenarioId]/route.ts
GET /api/plans/[planId]/scenarios/[scenarioId]
PUT /api/plans/[planId]/scenarios/[scenarioId]  
DELETE /api/plans/[planId]/scenarios/[scenarioId]
```

---

## 🧮 **3. CALCULATIONS & SIMULATIONS**

### **Core Calculation Engine**
```typescript
// app/api/calculations/loan-payment/route.ts
POST /api/calculations/loan-payment
Request: {
  principal: number,
  annualRate: number,
  termYears: number,
  gracePeriod?: number,
  promotionalRate?: number,
  promotionalMonths?: number
}
Response: {
  monthlyPayment: number,
  totalInterest: number,
  totalPayments: number,
  schedule: PaymentSchedule[]
}

// app/api/calculations/cash-flow/route.ts
POST /api/calculations/cash-flow
Request: CashFlowCalculationRequest
Response: {
  monthlyProjections: CashFlowProjection[],
  summary: CashFlowSummary,
  alerts: FinancialAlert[]
}

// app/api/calculations/affordability/route.ts
POST /api/calculations/affordability
Request: AffordabilityRequest
Response: {
  maxLoanAmount: number,
  maxPropertyPrice: number,
  recommendedDownPayment: number,
  riskAssessment: RiskAssessment,
  recommendations: Recommendation[]
}

// app/api/calculations/prepayment/route.ts
POST /api/calculations/prepayment
Request: {
  currentBalance: number,
  prepaymentAmount: number,
  prepaymentMonth: number,
  currentTerms: LoanTerms
}
Response: {
  newSchedule: PaymentSchedule[],
  interestSaved: number,
  timeReduced: number,
  penalties?: number
}
```

### **What-If Analysis Engine**
```typescript
// app/api/calculations/what-if/route.ts
POST /api/calculations/what-if
Request: {
  baseScenario: Scenario,
  modifications: WhatIfModification[],
  analysisType: 'stress_test' | 'optimization' | 'comparison'
}
Response: {
  results: WhatIfResults[],
  comparison: ComparisonMatrix,
  recommendations: string[]
}

// app/api/calculations/stress-test/route.ts
POST /api/calculations/stress-test
Request: {
  scenario: Scenario,
  stressFactors: {
    interestRateIncrease?: number,
    incomeReduction?: number,
    propertyValueDrop?: number,
    rentalVacancy?: number
  }
}
Response: StressTestResults

// app/api/calculations/optimization/route.ts
POST /api/calculations/optimization
Request: OptimizationRequest
Response: {
  optimizedScenarios: Scenario[],
  improvements: Improvement[],
  tradeoffs: Tradeoff[]
}
```

---

## 📈 **4. MARKET DATA & EXTERNAL INTEGRATIONS**

### **Interest Rates & Banking Data**
```typescript
// app/api/market-data/interest-rates/route.ts
GET /api/market-data/interest-rates
Query: { 
  bankName?, 
  loanTermYears?, 
  minAmount?, 
  maxAmount?,
  rateType? 
}
Response: {
  rates: InterestRate[],
  trends: RateTrend[],
  recommendations: BankRecommendation[]
}

// app/api/market-data/banks/[bankCode]/products/route.ts
GET /api/market-data/banks/[bankCode]/products
Response: {
  bank: BankInfo,
  loanProducts: LoanProduct[],
  currentPromos: Promotion[]
}

// app/api/market-data/rate-alerts/route.ts
POST /api/market-data/rate-alerts
Request: RateAlertRequest
Response: { alertId: string, active: boolean }

GET /api/market-data/rate-alerts
Response: RateAlert[]
```

### **Property Market Data**
```typescript
// app/api/market-data/property-prices/route.ts
GET /api/market-data/property-prices
Query: { 
  city, 
  district?, 
  ward?, 
  propertyType?, 
  timeframe? 
}
Response: {
  currentPrices: PropertyPrice[],
  trends: PriceTrend[],
  marketAnalysis: MarketAnalysis
}

// app/api/market-data/rental-yields/route.ts
GET /api/market-data/rental-yields
Query: { city, district?, propertyType? }
Response: {
  averageYield: number,
  yieldRange: { min: number, max: number },
  occupancyRates: OccupancyData[],
  trends: YieldTrend[]
}

// app/api/market-data/property-search/route.ts
GET /api/market-data/property-search
Query: { 
  location, 
  priceRange, 
  propertyType, 
  bedrooms?,
  amenities? 
}
Response: {
  properties: PropertyListing[],
  marketInsights: MarketInsights,
  investmentAnalysis: InvestmentAnalysis[]
}
```

---

## 📊 **5. TIMELINE & VISUALIZATION**

### **Timeline Management**
```typescript
// app/api/plans/[planId]/timeline/route.ts
GET /api/plans/[planId]/timeline
Query: { scenarioId?, startDate?, endDate? }
Response: {
  events: TimelineEvent[],
  milestones: Milestone[],
  criticalDates: CriticalDate[],
  visualConfig: TimelineConfig
}

POST /api/plans/[planId]/timeline/events
Request: CreateTimelineEventRequest
Response: TimelineEvent

// app/api/plans/[planId]/timeline/[eventId]/route.ts
PUT /api/plans/[planId]/timeline/[eventId]
DELETE /api/plans/[planId]/timeline/[eventId]

// app/api/plans/[planId]/timeline/simulate/route.ts
POST /api/plans/[planId]/timeline/simulate
Request: {
  modifications: TimelineModification[],
  whatIfScenario: WhatIfScenario
}
Response: {
  modifiedTimeline: TimelineEvent[],
  impact: ImpactAnalysis,
  recommendations: string[]
}
```

### **Data Export & Reporting**
```typescript
// app/api/plans/[planId]/export/route.ts
GET /api/plans/[planId]/export
Query: { format: 'pdf' | 'excel' | 'csv', sections?: string[] }
Response: File download or { downloadUrl: string }

// app/api/plans/[planId]/reports/route.ts
GET /api/plans/[planId]/reports
Query: { reportType: 'summary' | 'detailed' | 'comparison' }
Response: {
  report: FinancialReport,
  charts: ChartData[],
  insights: string[]
}

// app/api/plans/[planId]/share/route.ts
POST /api/plans/[planId]/share
Request: { 
  shareType: 'public' | 'link' | 'advisor',
  permissions: SharePermissions,
  expiresAt?: Date 
}
Response: { shareId: string, shareUrl: string }

GET /api/plans/shared/[shareId]/route.ts
Response: SharedPlanView
```

---

## 👥 **6. COMMUNITY FEATURES**

### **Community Posts & Discussions**
```typescript
// app/api/community/posts/route.ts
GET /api/community/posts
Query: { 
  page?, 
  limit?, 
  postType?, 
  tags?, 
  sortBy?: 'recent' | 'popular' | 'trending' 
}
Response: {
  posts: CommunityPost[],
  pagination: PaginationInfo,
  trending: TrendingTopic[]
}

POST /api/community/posts
Request: CreatePostRequest
Response: CommunityPost

// app/api/community/posts/[postId]/route.ts
GET /api/community/posts/[postId]
Response: {
  post: CommunityPost,
  comments: Comment[],
  relatedPosts: CommunityPost[]
}

PUT /api/community/posts/[postId]
DELETE /api/community/posts/[postId]

// app/api/community/posts/[postId]/comments/route.ts
GET /api/community/posts/[postId]/comments
POST /api/community/posts/[postId]/comments
Request: CreateCommentRequest
Response: Comment

// app/api/community/posts/[postId]/vote/route.ts
POST /api/community/posts/[postId]/vote
Request: { voteType: 'up' | 'down' }
Response: { score: number, userVote: string }
```

### **Knowledge Hub & Resources**
```typescript
// app/api/community/knowledge-hub/route.ts
GET /api/community/knowledge-hub
Query: { category?, difficulty?, searchTerm? }
Response: {
  articles: KnowledgeArticle[],
  categories: Category[],
  featuredContent: FeaturedContent[]
}

// app/api/community/knowledge-hub/[articleId]/route.ts
GET /api/community/knowledge-hub/[articleId]
Response: {
  article: KnowledgeArticle,
  relatedCalculators: Calculator[],
  userProgress: UserProgress
}

// app/api/community/achievements/route.ts
GET /api/community/achievements
Response: {
  userAchievements: Achievement[],
  available: Achievement[],
  leaderboard: LeaderboardEntry[]
}

POST /api/community/achievements/claim/[achievementId]
Response: { claimed: boolean, reward?: Reward }
```

---

## 🔔 **7. NOTIFICATIONS & ALERTS**

### **Notification System**
```typescript
// app/api/notifications/route.ts
GET /api/notifications
Query: { 
  page?, 
  limit?, 
  type?, 
  read?: boolean,
  priority? 
}
Response: {
  notifications: Notification[],
  unreadCount: number,
  pagination: PaginationInfo
}

POST /api/notifications/mark-read
Request: { notificationIds: string[] | 'all' }
Response: { updated: number }

// app/api/notifications/preferences/route.ts
GET /api/notifications/preferences
PUT /api/notifications/preferences
Request: NotificationPreferences
Response: NotificationPreferences

// app/api/notifications/send/route.ts (Internal/Admin only)
POST /api/notifications/send
Request: SendNotificationRequest
Response: { sent: boolean, deliveryStatus: DeliveryStatus[] }
```

### **Alert Management**
```typescript
// app/api/alerts/financial/route.ts
GET /api/alerts/financial
Response: {
  activeAlerts: FinancialAlert[],
  dismissed: FinancialAlert[],
  recommendations: AlertRecommendation[]
}

POST /api/alerts/financial/dismiss/[alertId]
Response: { dismissed: boolean }

// app/api/alerts/market/route.ts
GET /api/alerts/market
POST /api/alerts/market
Request: CreateMarketAlertRequest
Response: MarketAlert

// app/api/alerts/payment-reminders/route.ts
GET /api/alerts/payment-reminders
Response: PaymentReminder[]
```

---

## 📊 **8. ANALYTICS & DASHBOARD**

### **User Dashboard APIs**
```typescript
// app/api/dashboard/summary/route.ts
GET /api/dashboard/summary
Response: {
  overview: DashboardOverview,
  activePlans: PlanSummary[],
  alerts: Alert[],
  recentActivity: Activity[],
  marketInsights: MarketInsight[],
  recommendations: Recommendation[]
}

// app/api/dashboard/financial-health/route.ts
GET /api/dashboard/financial-health
Response: {
  healthScore: number,
  factors: HealthFactor[],
  trends: HealthTrend[],
  improvements: ImprovementSuggestion[]
}

// app/api/dashboard/portfolio/route.ts
GET /api/dashboard/portfolio
Response: {
  totalValue: number,
  properties: PropertySummary[],
  performance: PerformanceMetrics,
  diversification: DiversificationAnalysis
}
```

### **Analytics & Reporting**
```typescript
// app/api/analytics/user-behavior/route.ts (Internal)
GET /api/analytics/user-behavior
Query: { timeframe, metrics, segmentation? }
Response: AnalyticsData

// app/api/analytics/plan-performance/route.ts
GET /api/analytics/plan-performance
Response: {
  aggregatedMetrics: PlanMetrics,
  benchmarks: IndustryBenchmark[],
  userRanking: UserRanking
}

// app/api/analytics/market-trends/route.ts
GET /api/analytics/market-trends
Query: { location?, propertyType?, timeframe? }
Response: {
  trends: MarketTrend[],
  predictions: MarketPrediction[],
  opportunities: InvestmentOpportunity[]
}
```

---

## 🛠️ **9. ADMIN & SYSTEM APIS**

### **Admin Management**
```typescript
// app/api/admin/users/route.ts
GET /api/admin/users
Query: { page?, limit?, status?, subscription? }
Response: {
  users: AdminUserView[],
  stats: UserStats,
  pagination: PaginationInfo
}

// app/api/admin/content-moderation/route.ts
GET /api/admin/content-moderation
Response: {
  flaggedContent: FlaggedContent[],
  moderationQueue: ModerationItem[],
  autoModStats: AutoModStats
}

POST /api/admin/content-moderation/[itemId]/action
Request: { action: 'approve' | 'reject' | 'edit', reason?: string }
Response: { processed: boolean }

// app/api/admin/system-health/route.ts
GET /api/admin/system-health
Response: {
  dbPerformance: DatabaseMetrics,
  apiLatency: LatencyMetrics,
  errorRates: ErrorRates,
  userActivity: ActivityMetrics
}
```

### **Data Management**
```typescript
// app/api/admin/market-data/sync/route.ts
POST /api/admin/market-data/sync
Request: { dataSource: string, forceUpdate?: boolean }
Response: { 
  synced: boolean, 
  recordsUpdated: number,
  errors: string[] 
}

// app/api/admin/backup/route.ts
POST /api/admin/backup/create
Response: { backupId: string, status: 'initiated' }

GET /api/admin/backup/status/[backupId]
Response: BackupStatus
```

---

## 🌐 **10. WEBHOOKS & INTEGRATIONS**

### **External Webhooks**
```typescript
// app/api/webhooks/stripe/route.ts
POST /api/webhooks/stripe
Headers: { 'stripe-signature': string }
Request: StripeWebhookEvent
Response: { received: boolean }

// app/api/webhooks/banking/rate-updates/route.ts
POST /api/webhooks/banking/rate-updates
Headers: { 'x-api-key': string }
Request: BankRateUpdateEvent
Response: { processed: boolean }

// app/api/webhooks/property-data/route.ts
POST /api/webhooks/property-data
Request: PropertyDataUpdateEvent
Response: { updated: boolean }
```

### **Third-party Integrations**
```typescript
// app/api/integrations/banks/connect/route.ts
POST /api/integrations/banks/connect
Request: { bankCode: string, credentials: BankCredentials }
Response: { connected: boolean, accountInfo: BankAccount }

// app/api/integrations/property-portals/search/route.ts
GET /api/integrations/property-portals/search
Query: PropertySearchQuery
Response: {
  results: PropertyListing[],
  sources: DataSource[],
  marketAnalysis: MarketAnalysis
}
```

---

## 🔄 **11. REAL-TIME FEATURES**

### **WebSocket/Server-Sent Events**
```typescript
// app/api/realtime/plan-updates/route.ts
GET /api/realtime/plan-updates (SSE)
Headers: { 'Accept': 'text/event-stream' }
Response: EventStream<PlanUpdateEvent>

// app/api/realtime/market-alerts/route.ts
GET /api/realtime/market-alerts (SSE)
Response: EventStream<MarketAlertEvent>

// app/api/realtime/calculations/route.ts
POST /api/realtime/calculations
Request: { calculationType, parameters }
Response: EventStream<CalculationProgress>
```

---

## 🔧 **MIDDLEWARE & UTILITIES**

### **Common Middleware Pattern**
```typescript
// middleware/auth.ts
export const withAuth = (handler: NextApiHandler) => {
  return async (req: NextRequest) => {
    const session = await getSession(req);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }
    return handler(req);
  };
};

// middleware/rate-limit.ts
export const withRateLimit = (
  handler: NextApiHandler,
  options: RateLimitOptions
) => {
  return async (req: NextRequest) => {
    const identifier = getClientIdentifier(req);
    const allowed = await checkRateLimit(identifier, options);
    
    if (!allowed) {
      return new Response('Too Many Requests', { status: 429 });
    }
    
    return handler(req);
  };
};

// middleware/validation.ts
export const withValidation = <T>(
  handler: NextApiHandler,
  schema: ZodSchema<T>
) => {
  return async (req: NextRequest) => {
    try {
      const body = await req.json();
      const validatedData = schema.parse(body);
      req.validatedData = validatedData;
      return handler(req);
    } catch (error) {
      return new Response('Invalid Input', { status: 400 });
    }
  };
};
```

---

## 📊 **RESPONSE FORMATS & ERROR HANDLING**

### **Standard Response Format**
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  meta?: {
    pagination?: PaginationInfo;
    requestId?: string;
    timestamp: string;
  };
}

// Success Response
{
  "success": true,
  "data": { /* actual data */ },
  "meta": {
    "requestId": "req_123",
    "timestamp": "2025-07-12T10:30:00Z"
  }
}

// Error Response
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": { "field": "email", "issue": "Invalid format" }
  },
  "meta": {
    "requestId": "req_124",
    "timestamp": "2025-07-12T10:31:00Z"
  }
}
```

### **Error Codes**
```typescript
enum ApiErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Business Logic
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  PLAN_LIMIT_EXCEEDED = 'PLAN_LIMIT_EXCEEDED',
  INVALID_LOAN_TERMS = 'INVALID_LOAN_TERMS',
  
  // External Services
  BANK_API_ERROR = 'BANK_API_ERROR',
  MARKET_DATA_UNAVAILABLE = 'MARKET_DATA_UNAVAILABLE',
  
  // System
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}
```

---

## 🚀 **IMPLEMENTATION PRIORITY**

### **Phase 1 - MVP APIs (Month 1-2)**
```
✅ Auth APIs (signup, login, profile)
✅ Basic Plan CRUD
✅ Core Calculations (loan payment, cash flow)
✅ Simple Timeline
✅ Export functionality
```

### **Phase 2 - Advanced Features (Month 3-4)**
```
✅ Scenario modeling
✅ What-if analysis
✅ Market data integration
✅ Real-time calculations
✅ Advanced timeline features
```

### **Phase 3 - Community & Analytics (Month 5-6)**
```
✅ Community APIs
✅ Notification system
✅ Analytics dashboard
✅ Admin tools
✅ Third-party integrations
```

---

## 💡 **BEST PRACTICES & RECOMMENDATIONS**

### **Performance Optimization**
1. **Caching Strategy**: Redis for market data, Next.js cache for static content
2. **Database Optimization**: Connection pooling, query optimization
3. **API Response Optimization**: Compression, pagination, field selection
4. **Background Jobs**: Heavy calculations in queues (Bull/BullMQ)

### **Security Measures**
1. **Input Validation**: Zod schemas for all inputs
2. **Rate Limiting**: Per-user và per-IP limits
3. **CORS Configuration**: Proper origin restrictions
4. **API Key Management**: Secure external API keys
5. **Audit Logging**: Track all sensitive operations

### **Monitoring & Observability**
1. **Error Tracking**: Sentry integration
2. **Performance Monitoring**: APM tools
3. **API Analytics**: Request/response metrics
4. **Business Metrics**: User engagement, conversion rates

---

**📞 API Architecture Contact:**
- **API Version:** 1.0
- **Framework:** Next.js 15.3.5 App Router
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **Status:** Ready for Implementation

---

*This API architecture provides a comprehensive foundation for building a scalable, secure, and performant real estate financial planning application with Next.js and Supabase.*
