## Ticket 11: Báo cáo tùy chỉnh & Dự báo tài chính (Custom Reports & Financial Forecasting)

**Mục tiêu:** Cung cấp cho người dùng khả năng tạo các báo cáo tài chính tùy chỉnh và xem dự báo tài chính, giúp họ đưa ra quyết định thông minh hơn về tiền bạc.

**Mô tả:**
Ticket này sẽ mở rộng chức năng phân tích hiện có trong `ExpenseAnalytics.tsx` hoặc tạo một phần báo cáo riêng biệt. Người dùng sẽ có thể tạo các báo cáo dựa trên các tiêu chí tùy chỉnh (ví dụ: chi tiêu theo thẻ, chi tiêu theo thương gia, chi tiêu trong một khoảng thời gian cụ thể). Ngoài ra, ứng dụng sẽ cung cấp các dự báo đơn giản về dòng tiền hoặc khả năng đạt mục tiêu dựa trên thói quen chi tiêu hiện tại.

**Các công việc cần thực hiện:**

1.  **Giao diện tạo báo cáo tùy chỉnh (Frontend)**:
    -   Trong `ExpenseAnalytics.tsx` hoặc một trang mới, thêm các bộ lọc và tùy chọn cho phép người dùng chọn:
        -   Khoảng thời gian (tùy chỉnh ngày bắt đầu/kết thúc).
        -   Lọc theo ví, danh mục, loại giao dịch, tags, thương gia.
        -   Tùy chọn nhóm dữ liệu (theo ngày, tuần, tháng, danh mục).
    -   Hiển thị kết quả báo cáo dưới dạng bảng và/hoặc biểu đồ.

2.  **Logic truy vấn báo cáo tùy chỉnh (Backend)**:
    -   Mở rộng API `/api/expenses` (GET) để hỗ trợ các bộ lọc và nhóm dữ liệu phức tạp hơn, hoặc tạo một API mới chuyên dụng cho báo cáo (`/api/expenses/reports`).
    -   Đảm bảo hiệu suất truy vấn tốt cho các tập dữ liệu lớn.

3.  **Triển khai tính năng dự báo tài chính (Frontend & Backend)**:
    -   **Dự báo dòng tiền đơn giản**: Dựa trên thu nhập và chi tiêu trung bình hàng tháng của người dùng, dự báo số dư ví trong tương lai gần (ví dụ: 3-6 tháng tới).
    -   **Dự báo đạt mục tiêu**: Trong `GoalManager.tsx`, ngoài việc hiển thị số tiền cần tiết kiệm hàng tháng, dự báo ngày người dùng có thể đạt được mục tiêu nếu họ tiếp tục tiết kiệm với tốc độ hiện tại.
    -   Logic dự báo sẽ cần phân tích dữ liệu từ `expense_transactions` và `expense_goals`.

**Ngữ cảnh Schema (supabase/migrations/011_expense_tracking_system.sql):**

Các bảng sau đây là nguồn dữ liệu chính cho báo cáo tùy chỉnh và dự báo tài chính:

-   **`expense_transactions`**: Bảng chứa dữ liệu chi tiết nhất về mọi giao dịch, là nền tảng cho mọi báo cáo và dự báo.
    -   `amount`, `transaction_date`, `wallet_id`, `expense_category_id`, `income_category_id`, `merchant_name`, `tags`: Tất cả các cột này sẽ được sử dụng làm tiêu chí lọc và nhóm trong báo cáo.

-   **`expense_wallets`**: Cần thiết để lọc báo cáo theo ví.

-   **`expense_categories`**, **`income_categories`**: Cần thiết để lọc báo cáo theo danh mục và hiển thị tên danh mục trong báo cáo.

-   **`expense_goals`**: Quan trọng cho tính năng dự báo đạt mục tiêu.
    -   `target_amount`, `current_amount`, `target_date`, `monthly_target`: Dữ liệu mục tiêu.

-   **`expense_analytics_monthly`**: Bảng này có thể được sử dụng để tăng tốc các báo cáo tổng hợp theo tháng, hoặc làm cơ sở cho các dự báo dài hạn hơn.

**Đầu ra mong đợi:**
-   Người dùng có thể tạo các báo cáo tài chính tùy chỉnh với nhiều bộ lọc và tùy chọn nhóm.
-   Ứng dụng cung cấp các dự báo đơn giản về dòng tiền và khả năng đạt mục tiêu.
-   Giao diện người dùng trực quan để tạo và xem các báo cáo/dự báo này.

**Ưu tiên:** P3 - Nâng cao khả năng phân tích và lập kế hoạch chiến lược cho người dùng.
