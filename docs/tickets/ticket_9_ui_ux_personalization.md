## Ticket 9: Cá nhân hóa UI/UX: Biểu tượng & Màu sắc danh mục/ví (UI/UX Personalization: Custom Category/Wallet Icons & Colors)

**Mục tiêu:** Nâng cao trải nghiệm người dùng bằng cách cho phép họ cá nhân hóa giao diện thông qua việc tùy chỉnh biểu tượng và màu sắc cho các danh mục chi tiêu/thu nhập và ví.

**Mô tả:**
Ticket này sẽ triển khai các tính năng cho phép người dùng chọn hoặc tải lên các biểu tượng tùy chỉnh và chọn màu sắc yêu thích cho các danh mục chi tiêu/thu nhập và ví của họ. Điều này sẽ giúp người dùng tạo ra một không gian tài chính phản ánh phong cách và sở thích cá nhân của họ.

**Các công việc cần thực hiện:**

1.  **Cập nhật form quản lý ví (Frontend - `WalletManager.tsx` hoặc form tạo/sửa ví):**
    -   Thêm bộ chọn màu (color picker) để người dùng có thể chọn màu cho ví.
    -   Thêm tùy chọn chọn biểu tượng (icon picker) từ một thư viện biểu tượng có sẵn hoặc cho phép tải lên biểu tượng tùy chỉnh (nếu có thể).

2.  **Cập nhật form quản lý danh mục (Frontend - nếu có form riêng hoặc trong `BudgetManager.tsx`):**
    -   Tương tự như ví, thêm bộ chọn màu và tùy chọn chọn biểu tượng cho các danh mục chi tiêu và thu nhập.

3.  **Cập nhật API `/api/expenses/wallets` (Backend):**
    -   Đảm bảo API PUT/POST có thể nhận và lưu trữ các giá trị `icon` và `color` mới cho ví.

4.  **Cập nhật API cho danh mục (Backend - nếu có hoặc cần tạo):**
    -   Nếu chưa có API để quản lý danh mục (`expense_categories`, `income_categories`), cần tạo các API PUT/POST tương ứng để cho phép cập nhật các trường `icon` và `color`.

5.  **Hiển thị các tùy chỉnh (Frontend - `TransactionsList.tsx`, `ExpenseAnalytics.tsx`, v.v.):**
    -   Đảm bảo rằng các biểu tượng và màu sắc đã tùy chỉnh được hiển thị chính xác và nhất quán trên toàn bộ ứng dụng (ví dụ: trong danh sách giao dịch, biểu đồ phân tích, quản lý ngân sách).

**Ngữ cảnh Schema (supabase/migrations/011_expense_tracking_system.sql):**

Các bảng sau đây đã có sẵn các cột cần thiết để lưu trữ thông tin cá nhân hóa:

-   **`expense_wallets`**:
    -   `icon` TEXT DEFAULT 'wallet': Cột này sẽ lưu trữ tên biểu tượng hoặc URL của biểu tượng tùy chỉnh.
    -   `color` TEXT DEFAULT '#3B82F6': Cột này sẽ lưu trữ mã màu (ví dụ: hex code).

-   **`expense_categories`**:
    -   `icon` TEXT NOT NULL DEFAULT 'circle': Tương tự như ví, lưu trữ tên biểu tượng hoặc URL.
    -   `color` TEXT NOT NULL DEFAULT '#3B82F6': Lưu trữ mã màu.

-   **`income_categories`**:
    -   `icon` TEXT NOT NULL DEFAULT 'circle': Tương tự.
    -   `color` TEXT NOT NULL DEFAULT '#10B981': Tương tự.

Việc triển khai sẽ tập trung vào việc phát triển giao diện người dùng để người dùng có thể tương tác với các cột `icon` và `color` này, cũng như đảm bảo các API backend xử lý việc cập nhật dữ liệu một cách chính xác.

**Đầu ra mong đợi:**
-   Người dùng có thể dễ dàng thay đổi biểu tượng và màu sắc cho ví và các danh mục của họ.
-   Các tùy chỉnh này được lưu trữ và hiển thị nhất quán trên toàn bộ ứng dụng.
-   Giao diện người dùng trở nên cá nhân hóa và trực quan hơn.

**Ưu tiên:** P2 - Nâng cao trải nghiệm người dùng và sự gắn kết thông qua cá nhân hóa.
