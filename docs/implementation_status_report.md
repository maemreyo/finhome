# Báo cáo trạng thái triển khai: Onboarding và Monetization (Cập nhật)

**Ngày:** 21 tháng 7 năm 2025
**Dự án:** FinHome

Báo cáo này phân tích trạng thái hiện tại của các tính năng Onboarding và Monetization trong dự án FinHome, dựa trên các tài liệu thiết kế và mã nguồn đã được kiểm tra (bao gồm cả các thay đổi đã staged, chưa staged và các file mới).

## 1. Onboarding

### Trạng thái hiện tại:
*   **Logic quản lý Onboarding (`src/hooks/useOnboarding.ts`):** Đã được triển khai khá đầy đủ. Hook này quản lý các bước, tiến độ của người dùng trong các tour, và lưu trữ trạng thái vào cơ sở dữ liệu thông qua `DashboardService`. Nó cũng bao gồm logic để kiểm tra xem người dùng có cần onboarding hay không.
*   **Cấu hình Tour (`src/config/onboardingTours.ts`):** Các tour (ví dụ: `FIRST_TIME_USER_TOUR`, `FINANCIAL_PLANNING_TOUR`, `DASHBOARD_FEATURES_TOUR`) đã được định nghĩa rõ ràng, sử dụng cấu trúc `Step` của thư viện `react-joyride`.
*   **Thư viện:** `react-joyride` đã được cài đặt trong `package.json`.
*   **Triển khai UI của Joyride (`src/components/onboarding/OnboardingTour.tsx`):** Component `OnboardingTour` mới đã được thêm vào, tích hợp với `useOnboarding` hook và sử dụng `react-joyride` để hiển thị tour. Nó bao gồm một `CustomTooltip` tùy chỉnh và một `WelcomeModal` với hiệu ứng `framer-motion`. Điều này trực tiếp giải quyết vấn đề "Triển khai UI của Joyride" đã được xác định là thiếu trong báo cáo trước.
*   **Dịch vụ Onboarding (`src/lib/services/onboardingService.ts`):** Lớp `OnboardingService` mới đã được thêm vào để quản lý việc lưu trữ tiến độ onboarding vào Supabase, ghi lại các sự kiện phân tích (`analytics_events`), và cung cấp logic `getRecommendedTour` để đề xuất tour phù hợp.
*   **Bản địa hóa (`messages/en/onboarding.json`, `messages/vi/onboarding.json`):** Các file dịch thuật mới đã được thêm vào, cung cấp nội dung cho các thông báo, điều khiển và các bước trong tour onboarding bằng cả tiếng Anh và tiếng Việt. Điều này giải quyết vấn đề "Nội dung bản địa hóa" đã được xác định trước đó.
*   **Migration DB (`supabase/migrations/008_add_onboarding_system.sql`):** Migration này thêm cột `onboarding_progress` vào `user_preferences` và `onboarding_completed` vào `user_profiles`, cùng với việc tạo bảng `analytics_events` và các hàm/chính sách RLS hỗ trợ.

### Các phần chưa hoàn thiện/placeholder:
*   **Kích hoạt tour động:** Mặc dù `useOnboardingCheck` và `OnboardingService.getRecommendedTour` cung cấp logic để xác định tour được khuyến nghị, cơ chế tự động kích hoạt `OnboardingTour` component dựa trên kết quả này (ví dụ: hiển thị tour ngay khi người dùng đăng nhập lần đầu hoặc truy cập một trang cụ thể) cần được triển khai rõ ràng trong luồng ứng dụng chính (ví dụ: trong `layout.tsx` hoặc các trang cụ thể).

## 2. Monetization

### Trạng thái hiện tại:
*   **Chiến lược kiếm tiền (`monetization_strategy.md`):** Mô hình Freemium/Premium đã được định nghĩa rõ ràng.
*   **Schema cơ sở dữ liệu (`supabase/migrations/001_finhome_unified_schema.sql`):** Đã bao gồm các bảng `subscriptions` và `billing_history` với các trường cần thiết cho việc tích hợp Stripe.
*   **Định nghĩa API (`nextjs_api_architecture.md`):** Các API endpoint liên quan đến subscription và webhook của Stripe đã được định nghĩa.
*   **Thư viện:** Các thư viện Stripe (`stripe`, `@stripe/stripe-js`) đã được cài đặt.
*   **Bản địa hóa (`messages/en/subscription.json`, `messages/vi/subscription.json`):** Các file dịch thuật mới đã được thêm vào, cung cấp nội dung cho các gói đăng ký, cổng tính năng, lời nhắc nâng cấp, v.v.
*   **Cấu hình gói đăng ký (`src/config/subscriptionPlans.ts`):** File này định nghĩa chi tiết các gói `SUBSCRIPTION_PLANS` (Miễn phí, Cao cấp, Chuyên nghiệp) với giá, tính năng, giới hạn và `stripeIds`. Nó cũng định nghĩa `FEATURE_GATES` với logic `checkAccess` cho từng tính năng, bao gồm cả giới hạn sử dụng.
*   **Hooks đăng ký (`src/hooks/useSubscription.ts`):** Các hook như `useSubscription`, `useFeatureAccess`, `useBilling`, `useSubscriptionAnalytics` đã được triển khai để quản lý trạng thái đăng ký, kiểm tra quyền truy cập tính năng và lấy dữ liệu thanh toán.
*   **Dịch vụ đăng ký (`src/lib/services/subscriptionService.ts`):** Lớp `SubscriptionService` xử lý tương tác với Supabase cho dữ liệu đăng ký, thanh toán và sử dụng tính năng. Nó bao gồm logic `evaluateFeatureAccess` để kiểm tra quyền truy cập dựa trên cấp độ và giới hạn.
*   **Component cổng tính năng (`src/components/subscription/FeatureGate.tsx`):** Component này triển khai tính năng cổng tính năng, hiển thị nội dung có điều kiện và có thể hiển thị `UpgradePrompt`.
*   **Component huy hiệu đăng ký (`src/components/subscription/SubscriptionBadge.tsx`):** Cung cấp các huy hiệu trực quan cho trạng thái đăng ký, dùng thử, tính năng cao cấp và giới hạn sử dụng.
*   **Component lời nhắc nâng cấp (`src/components/subscription/UpgradePrompt.tsx`):** Hiển thị các lời nhắc nâng cấp khác nhau (modal, banner, inline, tooltip) để khuyến khích người dùng nâng cấp.
*   **Provider đăng ký (`src/components/subscription/SubscriptionProvider.tsx`):** Cung cấp context cho trạng thái và hành động đăng ký trên toàn ứng dụng.
*   **Trang quản lý đăng ký (Untracked: `src/app/[locale]/(dashboard)/subscription/page.tsx`, `src/app/[locale]/(dashboard)/subscription/checkout/page.tsx`, `src/app/[locale]/(dashboard)/subscription/success/page.tsx`):** Sự tồn tại của các file này cho thấy các trang UI chính để quản lý đăng ký, thanh toán và xác nhận thành công đang được xây dựng.
*   **Trang thanh toán (Untracked: `src/app/[locale]/(dashboard)/billing/page.tsx`):** File này có thể sẽ hiển thị lịch sử thanh toán và các tùy chọn quản lý thanh toán.
*   **API tạo phiên thanh toán Stripe (Unstaged: `src/app/api/stripe/create-checkout-session/route.ts`):** File này đã được cập nhật để tạo phiên thanh toán Stripe Checkout, bao gồm việc tạo/truy xuất khách hàng Stripe, chuyển thông tin gói và metadata.
*   **Webhook xử lý Stripe (Unstaged: `src/app/api/stripe/webhooks/route.ts`):** File này đã được cập nhật để xử lý các sự kiện webhook của Stripe (tạo/cập nhật/hủy đăng ký, thanh toán thành công/thất bại) và gọi các phương thức tương ứng trong `SubscriptionService` để đồng bộ hóa dữ liệu.
*   **Component demo tính năng (`src/components/subscription/FeatureDemo.tsx`):** Component này là một bản demo các mẫu cổng tính năng và các thành phần liên quan đến đăng ký.
*   **Component hiển thị gói đăng ký (`src/components/subscription/SubscriptionPlansCard.tsx`):** Component này hiển thị các gói đăng ký và cho phép người dùng chọn gói.

### Các phần chưa hoàn thiện/placeholder:
*   **Logic tích hợp Stripe (Server-side):** Mặc dù các tuyến API đã được cập nhật để xử lý các phiên thanh toán và webhook, việc đảm bảo tất cả các trường hợp cạnh (edge cases) của Stripe (ví dụ: xử lý lỗi thanh toán phức tạp, hoàn tiền, thay đổi gói giữa kỳ) được xử lý đúng cách trong `src/app/api/stripe/webhooks/route.ts` và `SubscriptionService` cần được kiểm tra kỹ lưỡng.
*   **Theo dõi sử dụng (Persistent Usage Tracking):** `SubscriptionService.trackFeatureUsage` hiện đang sử dụng `localStorage` làm dự phòng. Để có tính năng giới hạn sử dụng mạnh mẽ và đáng tin cậy, dữ liệu sử dụng cần được lưu trữ và quản lý trong cơ sở dữ liệu (ví dụ: trong bảng `feature_usage` đã được định nghĩa trong schema). Đây là một **giải pháp tạm thời** cần được cải thiện.
*   **Nội dung tĩnh/demo:**
    *   `src/components/subscription/FeatureDemo.tsx` vẫn chứa dữ liệu **mock/placeholder** cho mục đích trình diễn (ví dụ: giá trị cứng cho `LimitBadge`, kết quả mô phỏng Monte Carlo, `alert` đơn giản cho tính toán nâng cao). Điều này là bình thường đối với một component demo.
    *   Phần FAQ trong `src/components/subscription/SubscriptionPlansCard.tsx` chứa nội dung **placeholder** cứng. Nội dung này nên được quản lý thông qua hệ thống i18n hoặc một CMS.
*   **Cơ hội B2B và Dịch vụ giá trị gia tăng:** Các ý tưởng này vẫn là các khái niệm cấp cao trong `monetization_strategy.md` và chưa có bất kỳ triển khai cụ thể nào trong mã nguồn.

## Tóm tắt chung:

Dự án FinHome đã có những bước tiến đáng kể trong việc triển khai cả hệ thống Onboarding và Monetization.
*   **Onboarding** đã có một hệ thống khá hoàn chỉnh từ UI, logic đến DB, với các vấn đề về bản địa hóa và triển khai UI đã được giải quyết.
*   **Monetization** đã có một nền tảng vững chắc với việc tích hợp Stripe đang được triển khai tích cực, các component UI quan trọng đã có và logic cổng tính năng đã được thiết lập.

Tuy nhiên, vẫn còn một số khu vực cần hoàn thiện, đặc biệt là việc chuyển đổi theo dõi sử dụng tính năng từ `localStorage` sang cơ sở dữ liệu để đảm bảo tính nhất quán và đáng tin cậy, cũng như hoàn thiện các chi tiết nhỏ trong UI và logic xử lý Stripe.