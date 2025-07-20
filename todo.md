# FinHome Development Plan - Mock Data & Admin Dashboard Strategy

## Current Project Status: MVP 85% Complete ✅

### 📊 **Mock Data Analysis & Dashboard Management Strategy**

#### **Mock Data Usage Patterns Identified**

**🔴 HIGH MOCK DATA USAGE (Needs Admin Dashboard)**
- **Achievement System**: Hardcoded achievements, rewards, points (`AchievementSystem.tsx`)
- **Notification Templates**: Mock notifications with static content (`NotificationCenter.tsx`)
- **Marketing Content**: Hardcoded features, testimonials, pricing (`LandingPage components`)
- **Property Market Data**: Mock neighborhood data, market trends (`PropertyService`)
- **Onboarding Content**: Static tour steps and help content (`OnboardingTour.tsx`)

**🟡 PARTIAL MOCK DATA (Database + Mock Enhancement)**
- **Bank Service**: Real rates from database + mock recommendations
- **Financial Calculations**: Real loan calculations + mock ROI projections
- **User Stats**: Real user data + mock gamification metrics
- **Property Portfolio**: Database structure + mock market analytics

**🟢 REAL DATABASE USAGE (Working Correctly)**
- User authentication and profiles
- Financial plans and scenarios
- Bank interest rates (Vietnamese banks)
- Property listings structure
- Subscription and billing data

---

## 🎯 **Priority Action Plan**

### **Phase 1: Database Setup (Week 1)**
- [ ] Set up Supabase database following setup guide
- [ ] Run database migrations for unified schema
- [ ] Configure environment variables and authentication
- [ ] Test database connections and basic CRUD operations

### **Phase 2: Core Admin Dashboard (Week 2)**
**HIGH PRIORITY - These need admin management screens:**

1. **Bank Rate Management Dashboard** 🏦
   - [ ] Create `/admin/banks` - Manage Vietnamese banks
   - [ ] Create `/admin/rates` - Update interest rates
   - [ ] Create `/admin/loan-products` - Manage loan products
   - **Why Admin**: Rates change frequently, need quick updates

2. **Achievement System Management** 🏆
   - [ ] Create `/admin/achievements` - Manage achievement definitions
   - [ ] Create achievement editor with rewards/points system
   - [ ] Connect to database instead of hardcoded arrays
   - **Why Admin**: User engagement system needs flexibility

3. **Notification Management** 📧
   - [ ] Create `/admin/notifications` - Manage notification templates
   - [ ] Create notification composer with delivery rules
   - [ ] Replace mock notifications with database-driven system
   - **Why Admin**: Communication templates need regular updates

### **Phase 3: Content Management (Week 3)**
**MEDIUM PRIORITY - Content that changes occasionally:**

4. **Marketing Content Dashboard** 📢
   - [ ] Create `/admin/marketing` - Manage landing page content
   - [ ] Create testimonials, features, pricing editor
   - [ ] Connect to database instead of hardcoded content
   - **Why Admin**: Marketing needs rapid iteration capability

5. **Onboarding Flow Management** 🎓
   - [ ] Create `/admin/onboarding` - Manage onboarding steps
   - [ ] Create help content editor
   - [ ] Replace static tour with dynamic content
   - **Why Admin**: User experience needs optimization over time

### **Phase 4: Advanced Features (Week 4)**
**LOW PRIORITY - Keep as integrated APIs:**

6. **Property Market Data** 🏠
   - [ ] Integrate with external property APIs
   - [ ] Create data sync jobs for market trends
   - **Decision**: External API integration, not admin managed

7. **User Activity Monitoring** 📈
   - [ ] Auto-generate from user actions
   - [ ] Create analytics dashboard
   - **Decision**: System-generated, not admin managed

---

## 🏗️ **Admin Dashboard Architecture**

### **Database Schema Additions Needed**
```sql
-- Content management tables
CREATE TABLE admin_content (
  id UUID PRIMARY KEY,
  content_type TEXT, -- 'achievement', 'notification', 'marketing'
  content_key TEXT,
  content_data JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin user roles
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT DEFAULT 'admin',
  permissions TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Admin Dashboard Routes Structure**
```
/admin/
├── dashboard/          # Admin overview
├── banks/             # Bank management
├── rates/             # Interest rate management
├── achievements/      # Achievement system
├── notifications/     # Notification templates
├── marketing/         # Marketing content
├── onboarding/        # Onboarding flow
├── users/             # User management
└── settings/          # System settings
```

---

## 🔧 **Technical Implementation Strategy**

### **Mock Data Migration Priority**
1. **Keep as Database-Seeded** (One-time setup):
   - Vietnamese bank information
   - Property types and legal statuses
   - Base system configurations
   - Currency and locale settings

2. **Convert to Admin-Managed** (Frequent updates):
   - Achievement definitions and rewards
   - Notification templates and content
   - Marketing content and pricing
   - Onboarding steps and help content

3. **Integrate with External APIs** (Real-time data):
   - Property market data
   - Real-time bank rates
   - Economic indicators
   - Currency exchange rates

### **Development Approach**
- ✅ **Use hardcoded data initially** for rapid development
- ✅ **Create admin management screens** for content that changes
- ✅ **Integrate external APIs** for real-time market data
- ✅ **Database seed** for static configuration data

---

## 📋 **Current TODO Status**

### ✅ **Completed**
- [x] Complete financial plan management system
- [x] Plan list page with filtering and detail views
- [x] Add missing translations for PlansPage
- [x] Authentication system fully implemented
- [x] Database schema designed and ready
- [x] Core UI components and design system

### ✅ **Completed**
- [x] Complete financial plan management system
- [x] Plan list page with filtering and detail views
- [x] Add missing translations for PlansPage
- [x] Authentication system fully implemented
- [x] Database schema designed and ready
- [x] Core UI components and design system
- [x] Fix timeline utilities file to align with ScenarioTimelineEvent interface
  - [x] Add missing event types to ScenarioTimelineEvent interface
  - [x] Remove invalid properties from timeline event objects  
  - [x] Fix property references (.name to .plan_name)
  - [x] Ensure all events use valid ScenarioTimelineEvent properties

### 🔄 **In Progress**
- [x] Research property management implementation status
- [ ] Set up Supabase database and connect real data
- [ ] Create admin dashboard architecture
- [ ] Migrate mock data to admin-managed system
- [x] **URGENT: Fix Dashboard Dark Mode & i18n Issues**
  - [x] Fix dark mode styling in recent activity section (white colors)
  - [x] Fix dark mode styling in FinancialOverview component (gradient cards, icons, text)
  - [x] Fix dark mode styling in quick actions section
  - [x] Fix dark mode styling in placeholder sections (analytics, calendar)
  - [x] Audit and fix i18n keys structure (Dashboard.quickActions.items structure)
  - [x] Ensure consistent dark theme across dashboard components
- [x] **API Schema Consistency Analysis**
  - [x] Research API routes in /src/app/api/ directory
  - [x] Compare API routes with database schema and types
  - [x] Identify missing functionality and inconsistencies

### 📝 **Next Actions**
1. **Week 1**: Set up Supabase database
2. **Week 2**: Create core admin dashboard screens
3. **Week 3**: Migrate mock data to admin-managed system
4. **Week 4**: Polish and testing

---

## 🎯 **Key Decisions Made**

1. **Admin Dashboard Strategy**: Create management screens for frequently changing content
2. **Mock Data Approach**: Keep hardcoded data for rapid development, migrate to admin when needed
3. **External API Integration**: Use APIs for real-time market data rather than manual management
4. **Database Seeding**: Use for static configuration data and base system setup

**Next Immediate Action**: Set up Supabase database following the setup guide, then create the bank rate management dashboard as the first admin screen.