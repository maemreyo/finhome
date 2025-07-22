## Ticket 16: Tự động phân loại giao dịch theo quy tắc (Rules-based Auto-categorization)

**Mục tiêu:** Tự động hóa việc phân loại giao dịch dựa trên các quy tắc do người dùng định nghĩa, giảm thiểu công sức nhập liệu thủ công và cải thiện tính nhất quán của dữ liệu.

**Mô tả:**
Ticket này sẽ cho phép người dùng tạo các quy tắc để tự động gán danh mục (và có thể các trường khác như tags hoặc mô tả) cho các giao dịch dựa trên các tiêu chí như tên thương gia, từ khóa trong mô tả hoặc khoảng giá trị. Các quy tắc này sẽ được áp dụng trong quá trình nhập liệu thủ công.

**Các công việc cần thực hiện:**

1.  **Giao diện quản lý quy tắc (Frontend)**:
    -   Tạo một phần mới trong ứng dụng nơi người dùng có thể định nghĩa, xem, chỉnh sửa và xóa các quy tắc phân loại.
    -   Một quy tắc có thể bao gồm: "Nếu tên thương gia chứa 'Starbucks', phân loại là 'Ăn uống'".
    -   Giao diện cần trực quan và dễ sử dụng để tạo các quy tắc phức tạp.

2.  **API quản lý quy tắc (Backend)**:
    -   Tạo các API endpoint mới (ví dụ: `/api/expenses/categorization-rules`) cho các thao tác CRUD (Create, Read, Update, Delete) trên các quy tắc này.
    -   Đảm bảo validation dữ liệu cho các quy tắc.

3.  **Logic áp dụng quy tắc (Backend)**:
    -   Triển khai logic trong quá trình tạo giao dịch (`/api/expenses` POST) để kiểm tra các giao dịch mới với các quy tắc đang hoạt động của người dùng.
    -   Nếu một giao dịch khớp với một quy tắc, tự động áp dụng danh mục/tags/mô tả đã định nghĩa trong quy tắc trước khi lưu giao dịch.
    -   Cần xử lý các trường hợp quy tắc chồng chéo (ví dụ: ưu tiên quy tắc cụ thể hơn hoặc quy tắc có độ ưu tiên cao hơn).

**Ngữ cảnh Schema (supabase/migrations/011_expense_tracking_system.sql):**

Để triển khai tính năng này, chúng ta sẽ cần một bảng mới để lưu trữ các quy tắc phân loại:

-   **Bảng mới đề xuất: `categorization_rules`**
    -   `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -   `user_id` UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    -   `rule_name` TEXT NOT NULL: Tên của quy tắc (ví dụ: "Quy tắc Starbucks").
    -   `criteria` JSONB NOT NULL: Định nghĩa các tiêu chí để khớp giao dịch (ví dụ: `{"field": "merchant_name", "operator": "contains", "value": "Starbucks"}` hoặc `{"field": "description", "operator": "matches", "value": "^Lương"}`).
    -   `action` JSONB NOT NULL: Định nghĩa hành động sẽ được thực hiện khi quy tắc khớp (ví dụ: `{"field": "expense_category_id", "value": "<uuid_cua_danh_muc_an_uong>"}` hoặc `{"field": "tags", "action": "add", "value": ["#coffee"]}`).
    -   `priority` INTEGER DEFAULT 0: Độ ưu tiên của quy tắc (quy tắc có số lớn hơn sẽ được ưu tiên).
    -   `is_active` BOOLEAN DEFAULT true: Trạng thái kích hoạt của quy tắc.
    -   `created_at` TIMESTAMPTZ DEFAULT NOW(),
    -   `updated_at` TIMESTAMPTZ DEFAULT NOW(),

-   **Các bảng hiện có sẽ được sử dụng:**
    -   **`expense_transactions`**: Các quy tắc sẽ sửa đổi các trường trong bảng này (`expense_category_id`, `income_category_id`, `description`, `tags`, `merchant_name`).
    -   **`expense_categories`**, **`income_categories`**: Được sử dụng để chọn các danh mục mục tiêu trong các quy tắc.

**Đầu ra mong đợi:**
-   Người dùng có thể định nghĩa các quy tắc tùy chỉnh để tự động phân loại giao dịch.
-   Các giao dịch mới được tự động phân loại dựa trên các quy tắc này.
-   Giảm công sức nhập liệu thủ công và cải thiện chất lượng dữ liệu.

**Ưu tiên:** P2 - Nâng cao hơn nữa trải nghiệm nhập liệu thủ công và chất lượng dữ liệu, xây dựng trên các tính năng ghi chép thông minh.
