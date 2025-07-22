## Ticket 4: Triển khai quy tắc ngân sách 50/30/20 (Implement 50/30/20 Budgeting Rule)

**Mục tiêu:** Cung cấp cho người dùng một phương pháp quản lý ngân sách phổ biến và dễ áp dụng, giúp họ phân bổ thu nhập một cách hiệu quả.

**Mô tả:**
Ticket này sẽ thêm tùy chọn cho người dùng để tạo ngân sách dựa trên quy tắc 50/30/20 (50% cho Nhu cầu, 30% cho Mong muốn, 20% cho Tiết kiệm/Trả nợ). Khi người dùng chọn quy tắc này, ứng dụng sẽ tự động gợi ý phân bổ ngân sách dựa trên tổng thu nhập hoặc một số tiền mục tiêu.

**Các công việc cần thực hiện:**

1.  **Cập nhật `BudgetManager.tsx` (Frontend)**:
    -   Thêm tùy chọn "Quy tắc 50/30/20" vào phần chọn `budget_period` hoặc tạo một phần riêng cho các "phương pháp ngân sách".
    -   Khi chọn, form sẽ tự động tính toán và điền trước các giá trị `total_budget` và `category_budgets` dựa trên một số tiền đầu vào (ví dụ: thu nhập hàng tháng của người dùng hoặc một số tiền mục tiêu mà họ nhập).
    -   Cần có một cách để người dùng ánh xạ các danh mục chi tiêu hiện có của họ vào 3 nhóm: Nhu cầu, Mong muốn, Tiết kiệm/Trả nợ. Điều này có thể là một bước cấu hình ban đầu hoặc một phần của form tạo ngân sách.

2.  **Cập nhật API `/api/expenses/budgets` (Backend)**:
    -   Mở rộng API POST/PUT để xử lý việc tạo/cập nhật ngân sách theo quy tắc 50/30/20.
    -   Có thể cần thêm một trường `budget_method` vào schema `expense_budgets` nếu muốn lưu trữ phương pháp ngân sách được sử dụng.

**Ngữ cảnh Schema (supabase/migrations/011_expense_tracking_system.sql):**

Để triển khai tính năng này, các bảng sau trong schema Supabase là quan trọng:

-   **`expense_budgets`**: Bảng này sẽ lưu trữ thông tin ngân sách.
    -   `total_budget`: Sẽ được tính toán dựa trên 50/30/20 của thu nhập/số tiền mục tiêu.
    -   `category_budgets` (JSONB): Cột này có thể được sử dụng để lưu trữ phân bổ chi tiết theo danh mục sau khi người dùng ánh xạ các danh mục của họ vào 3 nhóm (Nhu cầu, Mong muốn, Tiết kiệm/Trả nợ).
    -   Có thể cần thêm một cột mới, ví dụ `budget_method` (TEXT hoặc ENUM) để lưu trữ phương pháp ngân sách được sử dụng (ví dụ: 'manual', '50_30_20', '6_jars').

-   **`expense_categories`**: Cần thiết để người dùng có thể ánh xạ các danh mục chi tiêu hiện có của họ vào các nhóm Nhu cầu/Mong muốn/Tiết kiệm.

**Đầu ra mong đợi:**
-   Người dùng có thể tạo ngân sách dựa trên quy tắc 50/30/20.
-   Hệ thống tự động gợi ý phân bổ ngân sách dựa trên quy tắc này.
-   Dữ liệu ngân sách được lưu trữ chính xác trong cơ sở dữ liệu.

**Ưu tiên:** P1 - Cải thiện khả năng lập kế hoạch tài chính, xây dựng trên tính năng ngân sách hiện có.
