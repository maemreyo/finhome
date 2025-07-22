## Ticket 14: Triển khai phương pháp ngân sách Kakeibo (Implement Kakeibo Budgeting Method)

**Mục tiêu:** Cung cấp một phương pháp quản lý tài chính độc đáo, khuyến khích người dùng chú tâm hơn vào chi tiêu và tiết kiệm thông qua việc ghi chép thủ công và tự vấn.

**Mô tả:**
Ticket này sẽ giới thiệu phương pháp ngân sách Kakeibo, một hệ thống quản lý tiền của Nhật Bản tập trung vào việc ghi chép chi tiêu bằng tay và tự vấn. Mặc dù ứng dụng là kỹ thuật số, chúng ta sẽ mô phỏng các nguyên tắc cốt lõi của Kakeibo: ghi chép chi tiêu hàng ngày, phân loại chi tiêu thành các nhóm (ví dụ: Survival, Optional, Culture, Extra), và tự vấn vào cuối mỗi tuần/tháng.

**Các công việc cần thực hiện:**

1.  **Cập nhật `BudgetManager.tsx` (Frontend)**:
    -   Thêm tùy chọn "Phương pháp Kakeibo" vào phần tạo ngân sách hoặc một phần riêng cho các "phương pháp ngân sách" (nếu đã có từ Ticket 4/10).
    -   Khi chọn Kakeibo, giao diện sẽ hướng dẫn người dùng thiết lập ngân sách theo các nhóm chi tiêu của Kakeibo (ví dụ: Survival, Optional, Culture, Extra).
    -   Cần có một cách để người dùng ánh xạ các danh mục chi tiêu hiện có của họ vào các nhóm Kakeibo.

2.  **Cập nhật API `/api/expenses/budgets` (Backend)**:
    -   Mở rộng API POST/PUT để hỗ trợ lưu trữ thông tin ngân sách theo phương pháp Kakeibo.
    -   Nếu đã thêm cột `budget_method` trong Ticket 4, hãy sử dụng nó để đánh dấu ngân sách này là "kakeibo".

3.  **Thiết kế UI/UX cho Kakeibo (Frontend)**:
    -   Tạo một giao diện trực quan trong `BudgetManager.tsx` hoặc một component mới để người dùng có thể ghi lại chi tiêu hàng ngày theo các nhóm Kakeibo.
    -   Bao gồm các câu hỏi tự vấn cuối tuần/cuối tháng (ví dụ: "Bạn đã chi bao nhiêu tiền?", "Bạn muốn tiết kiệm bao nhiêu?", "Bạn đã chi tiêu như thế nào để cải thiện bản thân?").
    -   Hiển thị tổng quan chi tiêu theo từng nhóm Kakeibo.

**Ngữ cảnh Schema (supabase/migrations/011_expense_tracking_system.sql):**

Các bảng sau đây là quan trọng cho việc triển khai phương pháp Kakeibo:

-   **`expense_budgets`**: Bảng này sẽ lưu trữ thông tin ngân sách Kakeibo.
    -   `total_budget`: Tổng số tiền người dùng muốn quản lý theo Kakeibo.
    -   `category_budgets` (JSONB): Cột này sẽ rất hữu ích để lưu trữ phân bổ chi tiết cho từng nhóm Kakeibo (ví dụ: `{"survival": X, "optional": Y, ...}`) và cách các danh mục chi tiêu của người dùng được ánh xạ vào các nhóm này.
    -   Nếu đã thêm cột `budget_method` (TEXT hoặc ENUM), giá trị sẽ là 'kakeibo'.

-   **`expense_categories`**: Cần thiết để người dùng có thể ánh xạ các danh mục chi tiêu hiện có của họ vào các nhóm Kakeibo.

-   **`expense_transactions`**: Dữ liệu giao dịch sẽ được sử dụng để theo dõi chi tiêu thực tế so với ngân sách Kakeibo.

**Đầu ra mong đợi:**
-   Người dùng có thể tạo ngân sách dựa trên phương pháp Kakeibo.
-   Hệ thống hỗ trợ ghi chép và phân loại chi tiêu theo các nhóm Kakeibo.
-   Giao diện người dùng khuyến khích tự vấn và theo dõi chi tiêu một cách chú tâm.

**Ưu tiên:** P2 - Cung cấp một công cụ lập ngân sách độc đáo, nâng cao khả năng lập kế hoạch tài chính và sự chú tâm.
