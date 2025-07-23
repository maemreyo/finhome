## Ticket 17: Cố vấn tài chính cá nhân được hỗ trợ bởi AI (AI-powered Personal Financial Advisor)

**Mục tiêu:** Tận dụng Gemini AI để cung cấp cho người dùng các insight tài chính cá nhân hóa cao độ và các đề xuất hành động, biến ứng dụng thành một cố vấn tài chính chủ động và mở ra một tầng thu phí cao cấp.

**Mô tả:**
Ticket này sẽ tích hợp Gemini AI để phân tích dữ liệu tài chính được người dùng nhập thủ công (giao dịch, ngân sách, mục tiêu) và tạo ra các insight tinh vi, chủ động cùng các đề xuất phù hợp. Những insight này sẽ vượt xa các báo cáo đơn thuần, cung cấp lời khuyên có thể hành động về thói quen chi tiêu, chiến lược tiết kiệm và đạt mục tiêu. Tính năng này sẽ được định vị là một dịch vụ cao cấp.

**Các công việc cần thực hiện:**

1.  **Tích hợp Gemini AI (Backend):**
    -   Thiết lập tích hợp an toàn với Gemini AI API.
    -   Phát triển một dịch vụ backend/API endpoint mới (ví dụ: `/api/expenses/ai-insights`) có chức năng:
        -   Nhận dữ liệu tài chính của người dùng (lịch sử giao dịch tổng hợp/ẩn danh, tuân thủ ngân sách, tiến độ mục tiêu).
        -   Xây dựng một prompt phù hợp cho Gemini AI để phân tích dữ liệu này.
        -   Gửi yêu cầu insight và đề xuất từ Gemini AI.
        -   Phân tích và xác thực phản hồi của AI.
        -   Lưu trữ/cache các insight đã tạo cho người dùng.
    -   Đảm bảo quyền riêng tư và bảo mật dữ liệu khi gửi dữ liệu người dùng đến AI.

2.  **Chuẩn bị dữ liệu cho AI (Backend):**
    -   Phát triển logic để tổng hợp và chuẩn bị dữ liệu tài chính liên quan của người dùng từ `expense_transactions`, `expense_budgets`, và `expense_goals` theo định dạng phù hợp cho AI. Điều này có thể bao gồm tóm tắt chi tiêu theo danh mục theo thời gian, xác định xu hướng và tính toán sai lệch ngân sách.

3.  **Hiển thị Insight AI (Frontend):**
    -   Tạo một phần mới dành riêng hoặc nâng cao một phần hiện có (ví dụ: trong `ExpenseAnalytics.tsx` hoặc một trang "Cố vấn tài chính" mới) để hiển thị các insight và đề xuất do AI tạo ra.
    -   Trình bày các insight theo định dạng rõ ràng, hấp dẫn và có thể hành động (ví dụ: "Cố vấn AI của bạn nói:", "Mẹo cá nhân hóa:").
    -   Triển khai các yếu tố UI để làm nổi bật tính năng cao cấp này.

4.  **Móc nối thu phí (Monetization Hook):**
    -   Thiết kế giao diện người dùng để hiển thị rõ ràng đây là một tính năng cao cấp.
    -   Triển khai lời kêu gọi hành động (CTA) để nâng cấp gói đăng ký cho những người dùng chưa đăng ký hoặc đang ở gói miễn phí. Điều này có thể bao gồm việc hiển thị bản xem trước các insight với nút "Mở khóa toàn bộ Insight".

**Ngữ cảnh Schema (supabase/migrations/011_expense_tracking_system.sql):**

Tính năng này chủ yếu sẽ *đọc* từ các bảng hiện có để thu thập dữ liệu cho phân tích AI. Không cần thiết phải có các bảng cốt lõi mới cho bản thân các insight, nhưng một bảng để lưu trữ các insight đã tạo có thể hữu ích cho việc cache hoặc lịch sử.

-   **`expense_transactions`**: Nguồn dữ liệu chính về chi tiêu và thu nhập thô.
    -   `amount`, `transaction_date`, `expense_category_id`, `income_category_id`, `description`, `merchant_name`, `tags`: Tất cả các cột này cung cấp ngữ cảnh phong phú cho phân tích AI.
-   **`expense_budgets`**: Cung cấp ngữ cảnh về mục tiêu tài chính và sự tuân thủ ngân sách của người dùng.
    -   `total_budget`, `total_spent`, `budget_period`, `alert_threshold_percentage`: Hữu ích để AI đánh giá hiệu suất ngân sách.
-   **`expense_goals`**: Cung cấp ngữ cảnh về khát vọng tiết kiệm của người dùng.
    -   `target_amount`, `current_amount`, `target_date`, `monthly_target`: Cần thiết để AI đưa ra lời khuyên định hướng mục tiêu.
-   **`expense_analytics_monthly`**: Dữ liệu đã tổng hợp trước có thể là nguồn nhanh hơn cho đầu vào AI.
    -   `total_income`, `total_expenses`, `category_expenses`, `savings_rate`: Có thể cung cấp các tóm tắt cấp cao cho AI.
-   **`user_profiles`**: Để kiểm tra `subscription_tier` cho mục đích thu phí.

**Bảng mới đề xuất (Tùy chọn, để cache/lịch sử insight):**
-   **`ai_financial_insights`** (Tùy chọn, để cache/lịch sử)
    -   `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -   `user_id` UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    -   `insight_type` TEXT: ví dụ: 'spending_pattern', 'saving_opportunity', 'budget_alert'.
    -   `insight_text` TEXT NOT NULL: Insight/đề xuất thực tế do AI tạo ra.
    -   `generated_at` TIMESTAMPTZ DEFAULT NOW(),
    -   `metadata` JSONB: Bất kỳ dữ liệu bổ sung nào liên quan đến insight (ví dụ: các danh mục liên quan, khoảng thời gian).

**Đầu ra mong đợi:**
-   Một dịch vụ backend hoạt động tích hợp với Gemini AI để tạo ra các insight tài chính cá nhân hóa.
-   Một phần giao diện người dùng chuyên dụng hiển thị các insight và đề xuất do AI tạo ra.
-   Các móc nối thu phí rõ ràng cho tính năng AI cao cấp.
-   Người dùng nhận được lời khuyên có thể hành động, thông minh về thói quen tài chính của họ.

**Ưu tiên:** P0 - Chiến lược, độc đáo và trực tiếp cho phép thu phí.


<!--  -->

  ✅ Completed Implementation

  1. Secure Gemini AI Integration
  - Created /api/expenses/ai-insights API endpoint with comprehensive data preparation
  - Integrated existing Gemini AI service for financial analysis
  - Implemented request validation, caching, and error handling
  - Added privacy-focused data aggregation and anonymization

  2. Data Preparation Service
  - Comprehensive financial data aggregation from multiple sources:
    - expense_transactions - transaction history and patterns
    - expense_budgets - budget performance and compliance
    - expense_goals - savings goals and progress
    - expense_analytics_monthly - pre-calculated monthly analytics
  - Smart data processing including category breakdowns, spending trends, and goal analysis
  - Privacy-compliant data summarization for AI processing

  3. AI Financial Advisor UI Component
  - Premium-gated interface with subscription tier checking
  - Multi-tab interface: Insights, Recommendations, Personal Tips, Actions
  - Financial health scoring with visual progress indicators
  - Actionable insights with priority levels and impact scoring
  - Vietnamese localization with full bilingual support
  - Responsive design consistent with shadcn/ui design system

  4. Premium Monetization Integration
  - Subscription tier validation - Premium/Professional access required
  - Feature gating with useFeatureAccess hook integration
  - Upgrade prompts for free/basic users with compelling CTAs
  - Usage tracking for subscription limit enforcement
  - Premium feature badges and visual indicators

  5. Database Infrastructure
  - AI insights caching table (ai_financial_insights) for performance optimization
  - Usage tracking (ai_feature_usage) for subscription limits
  - Interaction analytics (ai_insight_interactions) for engagement metrics
  - Automated cleanup functions and optimized indexing
  - Row-level security and proper data access policies

  6. Integration with Existing Analytics
  - Seamless integration into ExpenseAnalytics.tsx as a new tab
  - Consistent navigation and user experience
  - Smart state management and error handling
  - Localization support for both Vietnamese and English

  🎯 Key Features Implemented

  AI-Powered Insights:
  - Spending pattern analysis with trend detection
  - Personalized saving opportunities identification
  - Budget optimization recommendations
  - Goal achievement strategies
  - Risk warnings and financial health assessment

  Premium User Experience:
  - Comprehensive financial health scoring (1-100 scale)
  - Actionable step-by-step recommendations
  - Immediate actions vs long-term strategies
  - Personalized tips based on user behavior
  - Real-time insight generation with caching

  Monetization Features:
  - Clear premium feature branding with Crown icons
  - Compelling upgrade prompts with benefit highlights
  - Feature preview for free users to drive conversions
  - Usage tracking for subscription compliance
  - Seamless upgrade flow integration

  Technical Excellence:
  - Performance optimized with 24-hour insight caching
  - Error resilient with fallback insights when AI unavailable
  - Type-safe implementation with comprehensive TypeScript interfaces
  - Secure data handling with proper validation and sanitization
  - Scalable architecture supporting multiple insight types and time periods

  🔧 Technical Implementation

  - Backend: Next.js API route with Gemini AI integration
  - Frontend: React component with hooks for subscription management
  - Database: PostgreSQL with RLS and optimized indexing
  - AI Service: Google Gemini 2.0 Flash with structured prompts
  - Caching: 24-hour server-side caching for performance
  - Security: Row-level security, input validation, and privacy compliance
  - Monetization: Complete integration with existing subscription system

  The implementation provides a sophisticated AI-powered financial advisor that serves as a premium feature to drive subscription upgrades while delivering genuine
  value through personalized financial insights and actionable recommendations for Vietnamese users.