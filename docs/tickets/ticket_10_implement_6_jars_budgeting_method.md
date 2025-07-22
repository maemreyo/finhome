## Ticket 10: Triển khai phương pháp ngân sách "6 chiếc lọ" (Implement "6 Jars" Budgeting Method)

**Mục tiêu:** Cung cấp thêm một phương pháp quản lý ngân sách phổ biến và trực quan, giúp người dùng phân chia thu nhập và quản lý chi tiêu theo các mục đích cụ thể.

**Mô tả:**
Ticket này sẽ bổ sung tùy chọn cho người dùng để tạo ngân sách dựa trên phương pháp "6 chiếc lọ" (còn gọi là "6 hũ chi tiêu"). Theo phương pháp này, thu nhập sẽ được chia thành 6 phần với tỷ lệ cố định cho các mục đích khác nhau: Nhu cầu thiết yếu (55%), Tự do tài chính (10%), Giáo dục (10%), Tiết kiệm dài hạn (10%), Hưởng thụ (10%), và Cho đi (5%).

**Các công việc cần thực hiện:**

1.  **Cập nhật `BudgetManager.tsx` (Frontend)**:
    -   Thêm tùy chọn "Phương pháp 6 chiếc lọ" vào phần tạo ngân sách.
    -   Khi người dùng chọn phương pháp này và nhập tổng thu nhập (hoặc một số tiền mục tiêu), ứng dụng sẽ tự động tính toán và hiển thị số tiền phân bổ cho mỗi "lọ" dựa trên tỷ lệ đã định.
    -   Cần có một giao diện để người dùng ánh xạ các danh mục chi tiêu/thu nhập hiện có của họ vào 6 chiếc lọ này. Điều này có thể là một bước cấu hình trong quá trình tạo ngân sách.

2.  **Cập nhật API `/api/expenses/budgets` (Backend)**:
    -   Mở rộng API POST/PUT để hỗ trợ lưu trữ thông tin ngân sách theo phương pháp "6 chiếc lọ".
    -   Có thể cần lưu trữ thêm chi tiết về việc ánh xạ danh mục vào các lọ nếu logic này phức tạp.
    -   Nếu đã thêm cột `budget_method` trong Ticket 4, hãy sử dụng nó để đánh dấu ngân sách này là "6_jars".

3.  **Thiết kế UI/UX cho "6 chiếc lọ" (Frontend)**:
    -   Tạo một giao diện trực quan trong `BudgetManager.tsx` để người dùng có thể dễ dàng hình dung và theo dõi số tiền trong mỗi "lọ" của họ.
    -   Hiển thị tiến độ chi tiêu cho từng lọ.

**Ngữ cảnh Schema (supabase/migrations/011_expense_tracking_system.sql):**

Để triển khai tính năng này, các bảng sau trong schema Supabase là quan trọng:

-   **`expense_budgets`**: Bảng này sẽ lưu trữ thông tin ngân sách.
    -   `total_budget`: Sẽ là tổng thu nhập hoặc số tiền mục tiêu mà người dùng muốn phân chia.
    -   `category_budgets` (JSONB): Cột này có thể được sử dụng để lưu trữ phân bổ chi tiết cho từng "lọ" (ví dụ: `{"necessities": 5500000, "financial_freedom": 1000000, ...}`) và cách các danh mục chi tiêu của người dùng được ánh xạ vào các lọ này.
    -   Nếu đã thêm cột `budget_method` (TEXT hoặc ENUM) trong Ticket 4, giá trị sẽ là '6_jars'.

-   **`expense_categories`**: Cần thiết để người dùng có thể ánh xạ các danh mục chi tiêu hiện có của họ vào các "lọ" khác nhau.

**Đầu ra mong đợi:**
-   Người dùng có thể tạo ngân sách dựa trên phương pháp "6 chiếc lọ".
-   Hệ thống tự động tính toán và hiển thị phân bổ cho mỗi lọ.
-   Người dùng có thể ánh xạ các danh mục chi tiêu của họ vào các lọ.
-   Dữ liệu ngân sách "6 chiếc lọ" được lưu trữ và hiển thị chính xác.

**Ưu tiên:** P2 - Cung cấp thêm công cụ lập ngân sách linh hoạt, nâng cao khả năng lập kế hoạch tài chính.
