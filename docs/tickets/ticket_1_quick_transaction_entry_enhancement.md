## Ticket 1: Nâng cấp trải nghiệm nhập liệu giao dịch nhanh (Quick Transaction Entry Enhancement)

**Mục tiêu:** Biến việc ghi chép giao dịch thủ công trở nên nhanh chóng, thông minh và ít "ma sát" nhất, làm nền tảng cho các tính năng phân tích và gamification sau này.

**Mô tả:**
Hiện tại, `QuickTransactionForm.tsx` đã cung cấp chức năng nhập liệu cơ bản. Ticket này sẽ tập trung vào việc tối ưu hóa UI/UX và bổ sung các tính năng "ghi chép thông minh" cốt lõi.

**Các công việc cần thực hiện:**

1.  **Tối ưu hóa luồng nhập liệu (UI/UX)**:
    -   Đánh giá và tinh chỉnh `QuickTransactionForm.tsx` để đảm bảo người dùng có thể thêm một giao dịch mới chỉ với 2-3 cú chạm/click.
    -   Xem xét lại thứ tự các trường, kích thước input, và các nút bấm để tối đa hóa tốc độ nhập liệu.
    -   Đảm bảo trải nghiệm trên cả mobile và desktop đều mượt mà.

2.  **Triển khai tính năng gắn thẻ linh hoạt (Flexible Tagging)**:
    -   Cho phép người dùng thêm nhiều thẻ (tags) tùy chỉnh vào mỗi giao dịch trong `QuickTransactionForm.tsx`.
    -   Người dùng có thể gõ để tạo thẻ mới hoặc chọn từ danh sách các thẻ đã sử dụng trước đó.
    -   Các thẻ này sẽ được lưu trữ và liên kết với giao dịch.
    -   Đảm bảo các thẻ được hiển thị rõ ràng trong `TransactionsList.tsx`.

3.  **Chuẩn bị cho gợi ý thông minh (Intelligent Suggestion Foundation)**:
    -   Mặc dù logic gợi ý thông minh sẽ được phát triển ở các ticket sau, ticket này cần đảm bảo cấu trúc dữ liệu và luồng nhập liệu của `QuickTransactionForm.tsx` sẵn sàng cho việc tích hợp gợi ý tự động (ví dụ: lưu trữ lịch sử nhập liệu để học hỏi).

**Ngữ cảnh Schema (supabase/migrations/011_expense_tracking_system.sql):**

Để triển khai tính năng này, cột `tags` trong bảng `expense_transactions` là quan trọng:

-   **`expense_transactions`**:
    -   `tags` TEXT[] DEFAULT '{}': Cột này được định nghĩa là một mảng văn bản (text array) với giá trị mặc định là một mảng rỗng. Đây là nơi lưu trữ các thẻ (tags) mà người dùng gắn vào giao dịch. Việc sử dụng mảng cho phép lưu trữ nhiều thẻ cho một giao dịch.

**Đầu ra mong đợi:**
-   `QuickTransactionForm.tsx` được cải tiến về UI/UX, cho phép nhập liệu nhanh chóng.
-   Chức năng thêm/quản lý tags hoạt động đầy đủ trong `QuickTransactionForm.tsx`.
-   Các giao dịch được tạo có thể lưu trữ và hiển thị tags.
-   Cập nhật các API routes liên quan (`/api/expenses`) để hỗ trợ lưu trữ và truy vấn tags.

**Ưu tiên:** P0 - Cốt lõi, building block.