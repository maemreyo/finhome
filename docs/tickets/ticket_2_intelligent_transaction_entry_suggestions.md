## Ticket 2: Triển khai gợi ý thông minh cho nhập liệu giao dịch (Intelligent Transaction Entry Suggestions)

**Mục tiêu:** Tự động hóa một phần quá trình nhập liệu bằng cách cung cấp gợi ý thông minh dựa trên thói quen của người dùng, giảm thiểu công sức nhập liệu thủ công.

**Mô tả:**
Ticket này sẽ tập trung vào việc phát triển logic backend và tích hợp frontend để `QuickTransactionForm.tsx` có thể gợi ý danh mục, mô tả hoặc thậm chí là số tiền dựa trên các giao dịch trước đây của người dùng. Đây là bước tiếp theo của "Ghi chép thông minh" đã đề cập trong Ticket 1.

**Các công việc cần thực hiện:**

1.  **Phát triển logic gợi ý thông minh (Backend)**:
    -   Xây dựng hoặc mở rộng API hiện có (`/api/expenses`) để phân tích lịch sử giao dịch của người dùng.
    -   Logic này sẽ xác định các mẫu lặp lại (ví dụ: "Cà phê Highlands" luôn thuộc danh mục "Ăn uống").
    -   Ưu tiên gợi ý dựa trên `merchant_name`, `description`, hoặc `tags`.

2.  **Tích hợp gợi ý vào `QuickTransactionForm.tsx` (Frontend)**:
    -   Sử dụng các gợi ý từ backend để cung cấp tính năng tự động hoàn thành (autocomplete) cho các trường như `description`, `expense_category_id`, `income_category_id`.
    -   Khi người dùng bắt đầu gõ, ứng dụng sẽ hiển thị các gợi ý phù hợp.
    -   Đảm bảo trải nghiệm người dùng mượt mà khi chọn gợi ý.

**Ngữ cảnh Schema (supabase/migrations/011_expense_tracking_system.sql):**

Để triển khai tính năng này, các bảng sau trong schema Supabase là quan trọng:

-   **`expense_transactions`**: Đây là bảng chính chứa tất cả các giao dịch của người dùng. Các cột quan trọng để học hỏi thói quen và đưa ra gợi ý bao gồm:
    -   `description`: Mô tả giao dịch.
    -   `expense_category_id`: ID danh mục chi tiêu (liên kết với `expense_categories`).
    -   `income_category_id`: ID danh mục thu nhập (liên kết với `income_categories`).
    -   `merchant_name`: Tên người bán/thương gia.
    -   `tags`: Mảng các thẻ (tags) được gắn với giao dịch.
    -   `amount`: Số tiền giao dịch (có thể dùng để gợi ý số tiền phổ biến cho một loại giao dịch).

-   **`expense_categories`**: Chứa thông tin chi tiết về các danh mục chi tiêu, bao gồm `id`, `name_vi`, `name_en`. Cần thiết để hiển thị tên danh mục gợi ý cho người dùng.

-   **`income_categories`**: Tương tự như `expense_categories`, chứa thông tin chi tiết về các danh mục thu nhập (`id`, `name_vi`, `name_en`).

Logic gợi ý sẽ cần truy vấn bảng `expense_transactions` để phân tích các giao dịch trước đây của người dùng (dựa trên `user_id`) và tìm ra các cặp `(description, category)`, `(merchant_name, category)`, hoặc `(tags, category)` thường xuyên xuất hiện cùng nhau. Sau đó, sử dụng thông tin từ `expense_categories` và `income_categories` để trả về tên danh mục thân thiện với người dùng.

**Đầu ra mong đợi:**
-   API backend có khả năng trả về các gợi ý giao dịch dựa trên lịch sử người dùng.
-   `QuickTransactionForm.tsx` hiển thị và cho phép người dùng chọn các gợi ý thông minh cho các trường nhập liệu chính.

**Ưu tiên:** P1 - Xây dựng trên nền tảng Ticket 1, cải thiện đáng kể trải nghiệm nhập liệu.
