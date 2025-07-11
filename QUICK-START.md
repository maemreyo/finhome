# 🚀 Quick Start Guide - Launch Your SaaS in 1 Hour

## ⏱️ **Total Time: ~60 minutes**

Follow this guide to get your SaaS template up and running quickly.

---

## 🎯 **Phase 1: Local Setup (10 minutes)**

### **1.1 Clone & Install**
```bash
# Clone the repository
git clone https://github.com/your-username/saas-template.git
cd saas-template

# Install dependencies (use pnpm for best performance)
pnpm install

# Copy environment file
cp .env.example .env.local
```

### **1.2 Verify Installation**
```bash
# Start development server
pnpm dev

# Visit http://localhost:3000
# You should see the landing page
```

---

## 🗄️ **Phase 2: Supabase Setup (15 minutes)**

### **2.1 Create Supabase Project**
1. Go to [supabase.com](https://supabase.com) and create account
2. Click "New Project"
3. Choose organization and fill details
4. Wait for database to be ready

### **2.2 Get API Keys**
1. Go to Settings → API
2. Copy these values to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **2.3 Setup Database**
1. Go to SQL Editor in Supabase
2. Copy and paste the entire SQL from `supabase/migrations/001_initial_schema.sql`
3. Click "Run" to create all tables and policies

### **2.4 Configure Authentication**
1. Go to Authentication → Settings
2. **Site URL**: `http://localhost:3000`
3. **Redirect URLs**: `http://localhost:3000/auth/callback`
4. Enable Email confirmations
5. **Optional**: Setup Google/GitHub OAuth in Authentication → Providers

---

## 💳 **Phase 3: Stripe Setup (15 minutes)**

### **3.1 Create Stripe Account**
1. Go to [stripe.com](https://stripe.com) and create account
2. Complete account setup (can skip business details for testing)

### **3.2 Get API Keys**
1. Go to Developers → API keys
2. Copy to `.env.local`:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### **3.3 Create Products**
1. Go to Products → Create product
2. Create these 3 products:

**Product 1: Starter**
- Name: "Starter Plan"
- Price: $0/month
- Price ID: Copy and save

**Product 2: Pro** 
- Name: "Pro Plan"
- Price: $29/month
- Price ID: Copy and save

**Product 3: Enterprise**
- Name: "Enterprise Plan"  
- Price: $99/month
- Price ID: Copy and save

### **3.4 Update Pricing Config**
1. Open `src/lib/stripe/config.ts`
2. Update the `stripePriceId` fields with your actual Price IDs
3. Update environment variables:
```env
STRIPE_BASIC_PRICE_ID=price_1234567890
STRIPE_PRO_PRICE_ID=price_0987654321  
STRIPE_ENTERPRISE_PRICE_ID=price_1122334455
```

### **3.5 Setup Webhooks**
1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. **URL**: `http://localhost:3000/api/stripe/webhooks` (for local testing)
4. **Events**: Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated` 
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copy webhook signing secret to `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 📧 **Phase 4: Email Setup (10 minutes)**

### **4.1 Create Resend Account**
1. Go to [resend.com](https://resend.com)
2. Sign up with GitHub or email

### **4.2 Add Domain (Optional)**
1. Go to Domains → Add Domain
2. Add your domain (e.g., `yourdomain.com`)
3. Follow DNS setup instructions
4. **For testing**: Use `onboarding@resend.dev`

### **4.3 Get API Key**
1. Go to API Keys → Create API Key
2. Name: "SaaS Template"
3. Permission: "Sending access"
4. Copy to `.env.local`:
```env
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com
CONTACT_EMAIL=contact@yourdomain.com
```

---

## 🌐 **Phase 5: App Configuration (5 minutes)**

### **5.1 Update App Settings**
Edit `.env.local`:
```env
NEXT_PUBLIC_APP_NAME="Your SaaS Name"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_DESCRIPTION="Your SaaS Description"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### **5.2 Test Everything**
```bash
# Restart development server
pnpm dev

# Test these features:
# ✅ Sign up with email
# ✅ Check email for verification
# ✅ Sign in
# ✅ Visit dashboard  
# ✅ Try billing page
# ✅ Test contact form
```

---

## 🚀 **Phase 6: Deploy to Production (5 minutes)**

### **6.1 Push to GitHub**
```bash
git add .
git commit -m "Initial SaaS template setup"
git push origin main
```

### **6.2 Deploy to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. **Framework**: Next.js (auto-detected)
5. Add all environment variables from `.env.local`
6. **Important**: Update these for production:
```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```
7. Click "Deploy"

### **6.3 Update Webhooks**
1. Copy your Vercel URL
2. Go back to Stripe → Webhooks
3. Update endpoint URL to: `https://your-app.vercel.app/api/stripe/webhooks`
4. Update Supabase redirect URLs to your production domain

---

## ✅ **Success Checklist**

After completing all phases, verify these work:

### **Authentication**
- [ ] Sign up with email
- [ ] Email verification received
- [ ] Sign in works
- [ ] Password reset works
- [ ] Social login (if configured)

### **Billing**
- [ ] Pricing page displays correctly
- [ ] Stripe checkout works
- [ ] Subscription shows in dashboard
- [ ] Billing history displays
- [ ] Customer portal opens

### **Dashboard**
- [ ] Dashboard loads after login
- [ ] Profile page works
- [ ] Settings can be updated
- [ ] Navigation is responsive

### **Email**
- [ ] Welcome email sent
- [ ] Contact form sends email
- [ ] Password reset email works

### **General**
- [ ] Landing page looks good
- [ ] Mobile responsive
- [ ] Dark/light mode works
- [ ] No console errors

---

## 🎉 **You're Live!**

Congratulations! Your SaaS is now running in production. 

### **Next Steps:**
1. **Customize** branding and copy
2. **Add** your specific features
3. **Set up** custom domain
4. **Configure** analytics
5. **Launch** and start getting users!

### **Need Help?**
- 📖 Check the full documentation
- 🐛 Report issues on GitHub
- 💬 Join the community Discord
- 📧 Email support for urgent issues

---

**Happy launching! 🚀**