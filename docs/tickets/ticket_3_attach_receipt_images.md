## Ticket 3: Triển khai tính năng đính kèm ảnh hóa đơn (Attach Receipt Images)

**Mục tiêu:** Cho phép người dùng đính kèm ảnh hóa đơn vào các giao dịch, tăng cường khả năng ghi chép chi tiết và đáng tin cậy.

**Mô tả:**
Ticket này sẽ triển khai chức năng cho phép người dùng chụp ảnh hoặc chọn ảnh từ thư viện để đính kèm vào giao dịch khi nhập liệu thông qua `QuickTransactionForm.tsx`. Các ảnh này sẽ được lưu trữ và hiển thị khi xem chi tiết giao dịch trong `TransactionsList.tsx`.

**Các công việc cần thực hiện:**

1.  **Cập nhật `QuickTransactionForm.tsx` (Frontend)**:
    -   Thêm một trường nhập liệu hoặc nút bấm cho phép người dùng chọn/chụp ảnh hóa đơn.
    -   Hỗ trợ xem trước (preview) các ảnh đã chọn.
    -   Cho phép người dùng xóa ảnh đã chọn trước khi lưu giao dịch.

2.  **Xử lý tải lên ảnh (Backend/Storage)**:
    -   Phát triển logic để tải ảnh lên Supabase Storage (hoặc dịch vụ lưu trữ tương tự).
    -   Đảm bảo ảnh được lưu trữ an toàn và có thể truy cập được.
    -   Lưu trữ các URL của ảnh vào cột `receipt_images` trong bảng `expense_transactions`.

3.  **Cập nhật API `/api/expenses` (Backend)**:
    -   Điều chỉnh API POST để chấp nhận dữ liệu ảnh (dưới dạng URL sau khi tải lên storage) và lưu vào cột `receipt_images`.
    -   Đảm bảo API GET có thể trả về các URL ảnh này.

4.  **Hiển thị ảnh hóa đơn trong `TransactionsList.tsx` (Frontend)**:
    -   Khi xem danh sách giao dịch, hiển thị một biểu tượng hoặc số lượng ảnh đính kèm cho mỗi giao dịch.
    -   Khi người dùng xem chi tiết một giao dịch, hiển thị các ảnh hóa đơn đã đính kèm.

**Ngữ cảnh Schema (supabase/migrations/011_expense_tracking_system.sql):**

Để triển khai tính năng này, cột `receipt_images` trong bảng `expense_transactions` là quan trọng:

-   **`expense_transactions`**:
    -   `receipt_images` JSONB DEFAULT '[]': Cột này được định nghĩa là `JSONB` với giá trị mặc định là một mảng JSON rỗng. Đây là nơi lưu trữ các URL của ảnh hóa đơn. Khi người dùng tải ảnh lên, ứng dụng sẽ nhận được URL từ Supabase Storage và lưu các URL này vào cột `receipt_images` dưới dạng một mảng JSON (ví dụ: `["url_anh_1.jpg", "url_anh_2.png"]`).

**Đầu ra mong đợi:**
-   Người dùng có thể đính kèm ảnh hóa đơn vào giao dịch thông qua `QuickTransactionForm.tsx`.
-   Ảnh hóa đơn được lưu trữ thành công và các URL được ghi vào cơ sở dữ liệu.
-   Ảnh hóa đơn được hiển thị đúng cách trong `TransactionsList.tsx`.

**Ưu tiên:** P1 - Cải thiện đáng kể trải nghiệm nhập liệu và khả năng ghi chép chi tiết.
