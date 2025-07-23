## Ticket 1: Nâng cấp trải nghiệm nhập liệu giao dịch nhanh (Quick Transaction Entry Enhancement)

**Mục tiêu:** Biến việc ghi chép giao dịch thủ công trở nên nhanh chóng, thông minh và ít "ma sát" nhất, làm nền tảng cho các tính năng phân tích và gamification sau này.

**Mô tả:**
Hiện tại, `QuickTransactionForm.tsx` đã cung cấp chức năng nhập liệu cơ bản. Ticket này sẽ tập trung vào việc tối ưu hóa UI/UX và bổ sung các tính năng "ghi chép thông minh" cốt lõi.

**Các công việc cần thực hiện:**

1.  **Tối ưu hóa luồng nhập liệu (UI/UX)**:
    - Đánh giá và tinh chỉnh `QuickTransactionForm.tsx` để đảm bảo người dùng có thể thêm một giao dịch mới chỉ với 2-3 cú chạm/click.
    - Xem xét lại thứ tự các trường, kích thước input, và các nút bấm để tối đa hóa tốc độ nhập liệu.
    - Đảm bảo trải nghiệm trên cả mobile và desktop đều mượt mà.

2.  **Triển khai tính năng gắn thẻ linh hoạt (Flexible Tagging)**:
    - Cho phép người dùng thêm nhiều thẻ (tags) tùy chỉnh vào mỗi giao dịch trong `QuickTransactionForm.tsx`.
    - Người dùng có thể gõ để tạo thẻ mới hoặc chọn từ danh sách các thẻ đã sử dụng trước đó.
    - Các thẻ này sẽ được lưu trữ và liên kết với giao dịch.
    - Đảm bảo các thẻ được hiển thị rõ ràng trong `TransactionsList.tsx`.

3.  **Chuẩn bị cho gợi ý thông minh (Intelligent Suggestion Foundation)**:
    - Mặc dù logic gợi ý thông minh sẽ được phát triển ở các ticket sau, ticket này cần đảm bảo cấu trúc dữ liệu và luồng nhập liệu của `QuickTransactionForm.tsx` sẵn sàng cho việc tích hợp gợi ý tự động (ví dụ: lưu trữ lịch sử nhập liệu để học hỏi).

**Ngữ cảnh Schema (supabase/migrations/011_expense_tracking_system.sql):**

Để triển khai tính năng này, cột `tags` trong bảng `expense_transactions` là quan trọng:

- **`expense_transactions`**:
  - `tags` TEXT[] DEFAULT '{}': Cột này được định nghĩa là một mảng văn bản (text array) với giá trị mặc định là một mảng rỗng. Đây là nơi lưu trữ các thẻ (tags) mà người dùng gắn vào giao dịch. Việc sử dụng mảng cho phép lưu trữ nhiều thẻ cho một giao dịch.

**Đầu ra mong đợi:**

- `QuickTransactionForm.tsx` được cải tiến về UI/UX, cho phép nhập liệu nhanh chóng.
- Chức năng thêm/quản lý tags hoạt động đầy đủ trong `QuickTransactionForm.tsx`.
- Các giao dịch được tạo có thể lưu trữ và hiển thị tags.
- Cập nhật các API routes liên quan (`/api/expenses`) để hỗ trợ lưu trữ và truy vấn tags.

**Ưu tiên:** P0 - Cốt lõi, building block.

<!--  -->

✅ Completed Implementation

1.  Optimized UI/UX & Flexible Tagging
    - Đã tái cấu trúc QuickTransactionForm.tsx để tối ưu hóa luồng nhập liệu, tập trung vào tốc độ và sự đơn giản.
    - Tích hợp một component cho phép chọn và tạo nhiều thẻ (multi-select, creatable tags), cho phép người dùng gắn thẻ giao dịch một cách linh hoạt.
    - Thứ tự các trường được sắp xếp lại một cách hợp lý để giảm thiểu thao tác của người dùng.
    - Đảm bảo form có giao diện đáp ứng (responsive), hoạt động tốt trên cả desktop và mobile.

2.  Full Tagging Functionality
    - Người dùng có thể thêm nhiều thẻ vào một giao dịch duy nhất.
    - Hệ thống hỗ trợ cả việc tạo thẻ mới ngay lập tức (on-the-fly) và chọn từ danh sách các thẻ đã tồn tại.
    - Cập nhật TransactionsList.tsx để hiển thị các thẻ được liên kết với mỗi giao dịch, sử dụng component Badge của shadcn/ui để trình bày rõ ràng và
      trực quan.

3.  Backend & Data Structure Integration
    - Nâng cấp API endpoint (/api/expenses) để xử lý và lưu trữ một mảng các thẻ (array of tags) vào cột tags (kiểu TEXT[]) trong bảng
      expense_transactions.
    - Đảm bảo logic backend xác thực (validate) và lưu trữ dữ liệu thẻ một cách chính xác.
    - Cấu trúc dữ liệu đã sẵn sàng để hỗ trợ các tính năng phân tích và gợi ý dựa trên thẻ trong tương lai.

🎯 Key Features Implemented

- Quick Entry Flow: Luồng nhập liệu được tinh giản, cho phép người dùng ghi lại một giao dịch chỉ với các thông tin cốt lõi: Số tiền, Danh mục, và Mô
  tả/Thẻ.
- Flexible Tagging System: Cho phép thêm nhiều thẻ tùy chỉnh vào bất kỳ giao dịch nào, giúp việc phân loại và tìm kiếm chi tiết hơn.
- Create & Select Tags: Người dùng có thể dễ dàng tạo thẻ mới hoặc tái sử dụng các thẻ đã có, giúp đảm bảo tính nhất quán.
- Clear Tag Display: Các thẻ được hiển thị nổi bật trong danh sách giao dịch, giúp người dùng nhanh chóng xác định bối cảnh của một khoản chi tiêu.
- Foundation for Intelligence: Cấu trúc lưu trữ thẻ linh hoạt tạo nền tảng vững chắc cho việc phát triển các tính năng gợi ý danh mục hoặc thẻ thông
  minh trong tương lai.

🔧 Technical Implementation

- Frontend: QuickTransactionForm.tsx và TransactionsList.tsx được cập nhật bằng React và TypeScript.
- UI Components: Tận dụng các component từ shadcn/ui như Input, Button, Badge, và một component tùy chỉnh cho việc nhập thẻ.
- Backend: Cập nhật Next.js API route tại /api/expenses để xử lý logic nghiệp vụ.
- Database: Sử dụng cột tags với kiểu dữ liệu TEXT[] trong bảng expense_transactions trên PostgreSQL (Supabase) để lưu trữ hiệu quả nhiều thẻ.
