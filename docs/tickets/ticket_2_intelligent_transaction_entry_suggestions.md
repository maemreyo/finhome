## Ticket 2: Triển khai gợi ý thông minh cho nhập liệu giao dịch (Intelligent Transaction Entry Suggestions)

**Mục tiêu:** Tự động hóa một phần quá trình nhập liệu bằng cách cung cấp gợi ý thông minh dựa trên thói quen của người dùng, giảm thiểu công sức nhập liệu thủ công.

**Mô tả:**
Ticket này sẽ tập trung vào việc phát triển logic backend và tích hợp frontend để `QuickTransactionForm.tsx` có thể gợi ý danh mục, mô tả hoặc thậm chí là số tiền dựa trên các giao dịch trước đây của người dùng. Đây là bước tiếp theo của "Ghi chép thông minh" đã đề cập trong Ticket 1.

**Các công việc cần thực hiện:**

1.  **Phát triển logic gợi ý thông minh (Backend)**:
    - Xây dựng hoặc mở rộng API hiện có (`/api/expenses`) để phân tích lịch sử giao dịch của người dùng.
    - Logic này sẽ xác định các mẫu lặp lại (ví dụ: "Cà phê Highlands" luôn thuộc danh mục "Ăn uống").
    - Ưu tiên gợi ý dựa trên `merchant_name`, `description`, hoặc `tags`.

2.  **Tích hợp gợi ý vào `QuickTransactionForm.tsx` (Frontend)**:
    - Sử dụng các gợi ý từ backend để cung cấp tính năng tự động hoàn thành (autocomplete) cho các trường như `description`, `expense_category_id`, `income_category_id`.
    - Khi người dùng bắt đầu gõ, ứng dụng sẽ hiển thị các gợi ý phù hợp.
    - Đảm bảo trải nghiệm người dùng mượt mà khi chọn gợi ý.

**Ngữ cảnh Schema (supabase/migrations/011_expense_tracking_system.sql):**

Để triển khai tính năng này, các bảng sau trong schema Supabase là quan trọng:

- **`expense_transactions`**: Đây là bảng chính chứa tất cả các giao dịch của người dùng. Các cột quan trọng để học hỏi thói quen và đưa ra gợi ý bao gồm:
  - `description`: Mô tả giao dịch.
  - `expense_category_id`: ID danh mục chi tiêu (liên kết với `expense_categories`).
  - `income_category_id`: ID danh mục thu nhập (liên kết với `income_categories`).
  - `merchant_name`: Tên người bán/thương gia.
  - `tags`: Mảng các thẻ (tags) được gắn với giao dịch.
  - `amount`: Số tiền giao dịch (có thể dùng để gợi ý số tiền phổ biến cho một loại giao dịch).

- **`expense_categories`**: Chứa thông tin chi tiết về các danh mục chi tiêu, bao gồm `id`, `name_vi`, `name_en`. Cần thiết để hiển thị tên danh mục gợi ý cho người dùng.

- **`income_categories`**: Tương tự như `expense_categories`, chứa thông tin chi tiết về các danh mục thu nhập (`id`, `name_vi`, `name_en`).

Logic gợi ý sẽ cần truy vấn bảng `expense_transactions` để phân tích các giao dịch trước đây của người dùng (dựa trên `user_id`) và tìm ra các cặp `(description, category)`, `(merchant_name, category)`, hoặc `(tags, category)` thường xuyên xuất hiện cùng nhau. Sau đó, sử dụng thông tin từ `expense_categories` và `income_categories` để trả về tên danh mục thân thiện với người dùng.

**Đầu ra mong đợi:**

- API backend có khả năng trả về các gợi ý giao dịch dựa trên lịch sử người dùng.
- `QuickTransactionForm.tsx` hiển thị và cho phép người dùng chọn các gợi ý thông minh cho các trường nhập liệu chính.

**Ưu tiên:** P1 - Xây dựng trên nền tảng Ticket 1, cải thiện đáng kể trải nghiệm nhập liệu.

  <!--  -->

✅ Completed Implementation

1.  Intelligent Suggestion Logic (Backend)
    - Đã phát triển một API endpoint chuyên biệt (/api/expenses/suggestions) để cung cấp các gợi ý thông minh dựa trên lịch sử giao dịch của người dùng.
    - Logic backend phân tích các mẫu lặp lại từ expense_transactions, ưu tiên các gợi ý dựa trên merchant_name, description, và tags.
    - API trả về các gợi ý cho expense_category_id, income_category_id, description, và có thể cả amount dựa trên ngữ cảnh.
    - Đảm bảo hiệu suất truy vấn và xử lý dữ liệu để cung cấp gợi ý nhanh chóng.

2.  Frontend Integration in `QuickTransactionForm.tsx`
    - QuickTransactionForm.tsx đã được tích hợp với API gợi ý thông minh thông qua custom hook useIntelligentSuggestions.ts.
    - Các trường nhập liệu như description, expense_category_id, và income_category_id hiện có tính năng tự động hoàn thành (autocomplete) và hiển thị
      danh sách gợi ý khi người dùng bắt đầu gõ.
    - Người dùng có thể dễ dàng chọn một gợi ý từ danh sách, và các trường liên quan trong form sẽ tự động được điền.
    - Trải nghiệm người dùng mượt mà, giúp giảm đáng kể thời gian và công sức nhập liệu thủ công.

🎯 Key Features Implemented

- Contextual Suggestions: Cung cấp gợi ý thông minh cho danh mục, mô tả và các trường khác dựa trên thói quen và lịch sử giao dịch của người dùng.
- Autocomplete Functionality: Tự động hoàn thành các trường nhập liệu, giúp người dùng nhập dữ liệu nhanh hơn và chính xác hơn.
- Reduced Manual Effort: Giảm thiểu đáng kể số lần người dùng phải nhập lại thông tin trùng lặp, đặc biệt cho các giao dịch thường xuyên.
- Improved Data Consistency: Khuyến khích việc sử dụng các danh mục và mô tả nhất quán, dẫn đến dữ liệu tài chính sạch hơn và dễ phân tích hơn.
- Seamless User Experience: Gợi ý được hiển thị một cách trực quan và dễ chọn, tích hợp mượt mà vào luồng nhập liệu hiện có.

🔧 Technical Implementation

- Backend: Next.js API route (/api/expenses/suggestions) xử lý logic gợi ý, truy vấn và phân tích dữ liệu từ Supabase (PostgreSQL).
- Frontend: React component QuickTransactionForm.tsx sử dụng custom hook useIntelligentSuggestions.ts để gọi API và quản lý trạng thái gợi ý.
- UI Components: Sử dụng các component UI phù hợp (ví dụ: Combobox hoặc Autocomplete từ shadcn/ui hoặc thư viện tương tự) để hiển thị danh sách gợi ý.
- Database: Tận dụng các cột description, merchant_name, tags, expense_category_id, income_category_id trong bảng expense_transactions để xây dựng mô
  hình gợi ý.
