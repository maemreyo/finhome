# 🚀 FinHome Supabase Setup Guide
## Complete Production-Ready Database Setup

---

## 📋 **TABLE OF CONTENTS**
1. [Prerequisites](#prerequisites)
2. [Create Supabase Project](#create-supabase-project)
3. [Environment Configuration](#environment-configuration)
4. [Database Schema Setup](#database-schema-setup)
5. [Authentication Configuration](#authentication-configuration)
6. [Row Level Security (RLS)](#row-level-security-rls)
7. [Testing the Setup](#testing-the-setup)
8. [Production Deployment](#production-deployment)
9. [Monitoring & Maintenance](#monitoring--maintenance)

---

## 🎯 **PREREQUISITES**

Before starting, ensure you have:
- A Supabase account (free tier is sufficient for development)
- Node.js 18+ installed
- Git repository set up
- Basic understanding of PostgreSQL and SQL

---

## 🆕 **CREATE SUPABASE PROJECT**

### **Step 1: Access Supabase Dashboard**
1. Navigate to [https://supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Sign in with GitHub, Google, or email

### **Step 2: Create New Project**
1. Click "New Project"
2. Select your organization (personal or team)
3. Fill in project details:
   - **Project Name**: `FinHome Production` (or your preference)
   - **Database Password**: Generate a strong password (save this securely)
   - **Region**: Choose closest to your target users (e.g., `ap-southeast-1` for Vietnam)
   - **Pricing Plan**: Start with "Free" for development

4. Click "Create new project"
5. Wait 2-3 minutes for provisioning

### **Step 3: Save Project Credentials**
Once created, go to **Settings > API** and save:
- **Project URL**: `https://xxx.supabase.co`
- **Project API Keys**:
  - `anon` (public key)
  - `service_role` (secret key - keep secure)

---

## 🔧 **ENVIRONMENT CONFIGURATION**

### **Step 1: Update Environment Variables**
Create/update your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_NAME=FinHome
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Internationalization
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_SUPPORTED_LOCALES=en,vi
```

### **Step 2: Verify Environment Variables**
Add to your `.env.example` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_NAME=FinHome
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🗄️ **DATABASE SCHEMA SETUP**

### **Step 1: Access SQL Editor**
1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New query"

### **Step 2: Run Migration Script**
Copy and paste the contents of `supabase/migrations/001_finhome_unified_schema.sql`:

```sql
-- FinHome Unified Database Schema
-- Run this entire script in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_subscription_tier AS ENUM ('free', 'premium', 'professional');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'trialing', 'past_due', 'canceled', 'unpaid');
CREATE TYPE property_type AS ENUM ('apartment', 'house', 'villa', 'townhouse', 'land', 'commercial');
CREATE TYPE property_status AS ENUM ('for_sale', 'sold', 'for_rent', 'rented', 'off_market');
CREATE TYPE legal_status_enum AS ENUM ('red_book', 'pink_book', 'pending', 'disputed');
CREATE TYPE ownership_type_enum AS ENUM ('individual', 'joint', 'company');
CREATE TYPE plan_status AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE plan_type_enum AS ENUM ('home_purchase', 'investment', 'upgrade', 'refinance');
CREATE TYPE rate_type_enum AS ENUM ('fixed', 'variable', 'mixed');
CREATE TYPE rate_category_enum AS ENUM ('promotional', 'standard', 'vip', 'prime');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error', 'achievement');
CREATE TYPE achievement_type AS ENUM ('milestone', 'usage', 'financial', 'social', 'learning');

-- [Continue with the rest of the schema from the migration file]
```

### **Step 3: Run Seed Data**
After the main schema, run `supabase/migrations/002_seed_data.sql`:

```sql
-- Insert sample Vietnamese banks and interest rates
INSERT INTO banks (bank_code, bank_name, bank_name_en, is_active, is_featured) VALUES
('VCB', 'Vietcombank', 'Joint Stock Commercial Bank for Foreign Trade of Vietnam', true, true),
('TCB', 'Techcombank', 'Technological and Commercial Joint Stock Bank', true, true),
('BIDV', 'BIDV', 'Bank for Investment and Development of Vietnam', true, true),
('VTB', 'VietinBank', 'Vietnam Joint Stock Commercial Bank for Industry and Trade', true, true),
('ACB', 'ACB', 'Asia Commercial Joint Stock Bank', true, true),
('MBB', 'MB Bank', 'Military Commercial Joint Stock Bank', true, true),
('CTG', 'VietinBank', 'Vietnam Joint Stock Commercial Bank for Industry and Trade', true, false),
('SHB', 'SHB', 'Saigon Hanoi Commercial Joint Stock Bank', true, false);

-- Insert current interest rates (update these regularly)
INSERT INTO bank_interest_rates (bank_id, product_name, loan_type, interest_rate, min_rate, max_rate, min_loan_amount, max_loan_amount, max_ltv_ratio, min_term_months, max_term_months, effective_date, is_active) VALUES
((SELECT id FROM banks WHERE bank_code = 'VCB'), 'VCB Home Loan', 'home_purchase', 10.50, 9.50, 12.00, 300000000, 30000000000, 80, 120, 300, '2025-01-01', true),
((SELECT id FROM banks WHERE bank_code = 'TCB'), 'TCB Real Estate Loan', 'home_purchase', 10.80, 9.80, 12.50, 500000000, 50000000000, 85, 120, 360, '2025-01-01', true),
((SELECT id FROM banks WHERE bank_code = 'BIDV'), 'BIDV Home Loan', 'home_purchase', 10.20, 9.20, 11.50, 200000000, 20000000000, 80, 120, 300, '2025-01-01', true);

-- Insert sample achievements
INSERT INTO achievements (name, name_vi, description, description_vi, achievement_type, required_actions, experience_points, badge_color, is_active) VALUES
('First Plan', 'Kế Hoạch Đầu Tiên', 'Created your first financial plan', 'Tạo kế hoạch tài chính đầu tiên', 'milestone', '{"create_plan": 1}', 100, '#4CAF50', true),
('Home Owner', 'Chủ Nhà', 'Completed a home purchase plan', 'Hoàn thành kế hoạch mua nhà', 'milestone', '{"complete_home_purchase": 1}', 500, '#2196F3', true),
('Property Investor', 'Nhà Đầu Tư', 'Created an investment property plan', 'Tạo kế hoạch đầu tư bất động sản', 'milestone', '{"create_investment_plan": 1}', 300, '#FF9800', true);
```

### **Step 4: Verify Schema**
1. Go to **Database > Tables** in Supabase Dashboard
2. You should see all tables created:
   - `user_profiles`
   - `properties`
   - `financial_plans`
   - `banks`
   - `bank_interest_rates`
   - `notifications`
   - `achievements`
   - And more...

---

## 🔐 **AUTHENTICATION CONFIGURATION**

### **Step 1: Configure Auth Settings**
1. Go to **Authentication > Settings**
2. Configure the following:

**Site URL**: `http://localhost:3000` (development) or your production URL

**Redirect URLs**: Add these allowed URLs:
```
http://localhost:3000
http://localhost:3000/auth/callback
http://localhost:3000/en/auth/reset-password
http://localhost:3000/vi/auth/reset-password
https://your-domain.com (for production)
https://your-domain.com/auth/callback (for production)
https://your-domain.com/en/auth/reset-password (for production)
https://your-domain.com/vi/auth/reset-password (for production)
```

### **Step 2: Enable Email Authentication**
1. In **Authentication > Providers**
2. Enable "Email" if not already enabled
3. Configure email templates (optional):
   - **Confirm signup**: Customize welcome email
   - **Reset password**: Customize reset email
   - **Change email**: Customize change email

### **Step 3: Configure OAuth Providers (Optional)**
To enable Google and GitHub login:

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. In Supabase: **Authentication > Providers > Google**
4. Add your Google Client ID and Secret
5. Add redirect URL: `https://your-project-id.supabase.co/auth/v1/callback`

**GitHub OAuth:**
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. In Supabase: **Authentication > Providers > GitHub**
4. Add your GitHub Client ID and Secret

### **Step 4: Test Authentication**
The authentication is already implemented in the app:
- Sign up: `/[locale]/auth/signup`
- Sign in: `/[locale]/auth/login`
- Reset password: `/[locale]/auth/forgot-password`

---

## 🔒 **ROW LEVEL SECURITY (RLS)**

### **Step 1: Enable RLS**
Run this SQL to enable Row Level Security:

```sql
-- Enable RLS on all user tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
```

### **Step 2: Create Security Policies**
```sql
-- User profiles - users can only access their own data
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Financial plans - users can access their own plans or public ones
CREATE POLICY "Users can view own plans" ON financial_plans FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can create own plans" ON financial_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plans" ON financial_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own plans" ON financial_plans FOR DELETE USING (auth.uid() = user_id);

-- Loan calculations - users can access calculations for their plans
CREATE POLICY "Users can access own calculations" ON loan_calculations FOR ALL 
USING (
    auth.uid() = user_id OR 
    financial_plan_id IN (
        SELECT id FROM financial_plans WHERE user_id = auth.uid()
    )
);

-- Subscriptions - users can only access their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage subscriptions" ON subscriptions FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Notifications - users can only access their own notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Public data (no restrictions)
CREATE POLICY "Anyone can view banks" ON banks FOR SELECT USING (true);
CREATE POLICY "Anyone can view interest rates" ON bank_interest_rates FOR SELECT USING (true);
CREATE POLICY "Anyone can view properties" ON properties FOR SELECT USING (true);
CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);
```

### **Step 3: Test RLS**
1. Create a test user account
2. Try accessing data through the API
3. Verify users can only access their own data

---

## 🧪 **TESTING THE SETUP**

### **Step 1: Test Database Connection**
Run this in your app:

```typescript
// Test in your Next.js app
import { supabase } from '@/lib/supabase/client'

// Test connection
async function testConnection() {
  const { data, error } = await supabase
    .from('banks')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('Database connection failed:', error)
  } else {
    console.log('Database connected successfully:', data)
  }
}

testConnection()
```

### **Step 2: Test Authentication**
1. Visit `/en/auth/signup` in your app
2. Create a new account
3. Check your email for verification
4. Verify login works at `/en/auth/login`

### **Step 3: Test User Profile Creation**
After signing up, check if user profile is created automatically:

```sql
-- Run in Supabase SQL Editor
SELECT * FROM user_profiles;
```

### **Step 4: Test Financial Plan Creation**
1. Sign in to your app
2. Navigate to financial planning section
3. Create a test financial plan
4. Verify data is saved correctly

---

## 🚀 **PRODUCTION DEPLOYMENT**

### **Step 1: Create Production Project**
1. Create a new Supabase project for production
2. Use a secure database password
3. Choose appropriate region for your users

### **Step 2: Configure Production Environment**
```bash
# Production environment variables
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### **Step 3: Set Up Database Backup**
1. Go to **Settings > Database**
2. Enable **Point-in-time recovery**
3. Configure backup retention period

### **Step 4: Monitor Performance**
1. Enable **Database > Logs**
2. Set up alerts for:
   - High CPU usage
   - Slow queries
   - Connection limits

---

## 📊 **MONITORING & MAINTENANCE**

### **Daily Tasks**
- Monitor authentication metrics
- Check for unusual activity in logs
- Verify backup completion

### **Weekly Tasks**
- Review slow queries and optimize
- Update interest rate data
- Check storage usage

### **Monthly Tasks**
- Review and update security policies
- Analyze user growth patterns
- Update Vietnamese market data

### **Quarterly Tasks**
- Review database performance
- Update bank information
- Security audit

---

## 🎯 **AUTHENTICATION FEATURES**

### **✅ Currently Implemented**
- ✅ Email/password authentication
- ✅ OAuth with Google and GitHub
- ✅ User registration with email verification
- ✅ Password reset functionality
- ✅ User profile management
- ✅ Protected routes
- ✅ Session management
- ✅ Real-time auth state updates

### **📁 Authentication Files**
- `src/lib/supabase/client.ts` - Client-side Supabase config
- `src/lib/supabase/server.ts` - Server-side Supabase config
- `src/lib/supabase/types.ts` - TypeScript type definitions
- `src/hooks/useAuth.ts` - Authentication hooks
- `src/components/auth/SignUpForm.tsx` - Sign up form
- `src/components/auth/LoginForm.tsx` - Login form

### **🔐 Authentication Flow**
1. User visits signup/login page
2. Enters credentials or clicks OAuth provider
3. Supabase handles authentication
4. User profile is created/updated automatically
5. User is redirected to dashboard
6. Session is maintained across page refreshes

---

## 🆘 **TROUBLESHOOTING**

### **Common Issues**

**1. "Invalid API key" Error**
- Verify environment variables are correct
- Check if project is properly provisioned
- Ensure no spaces in environment variable values

**2. "Row Level Security" Errors**
- Verify RLS policies are created correctly
- Check if user is authenticated
- Ensure policies allow the intended access

**3. "Schema not found" Errors**
- Verify migration script ran successfully
- Check if all extensions are enabled
- Ensure public schema is being used

**4. Authentication Redirect Issues**
- Check redirect URLs in Supabase dashboard
- Verify site URL configuration
- Ensure callback URLs are correct

### **Getting Help**
- Check Supabase documentation: https://supabase.com/docs
- Join Supabase Discord: https://discord.supabase.com
- Review GitHub issues: https://github.com/supabase/supabase

---

## 📞 **SUPPORT INFORMATION**

- **Documentation Version**: 1.0
- **Last Updated**: January 15, 2025
- **Supabase Version**: Latest
- **Database**: PostgreSQL 15+
- **Status**: Production Ready

---

**🎉 Congratulations! Your FinHome Supabase setup is complete and ready for production use. The authentication system is fully implemented and your Vietnamese real estate financial planning platform is ready to serve users.**

*This setup provides a secure, scalable foundation for your real estate financial planning application with comprehensive authentication and user management capabilities.*