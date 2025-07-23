## Ticket 3: Triển khai tính năng đính kèm ảnh hóa đơn (Attach Receipt Images)

**Mục tiêu:** Cho phép người dùng đính kèm ảnh hóa đơn vào các giao dịch, tăng cường khả năng ghi chép chi tiết và đáng tin cậy.

**Mô tả:**
Ticket này sẽ triển khai chức năng cho phép người dùng chụp ảnh hoặc chọn ảnh từ thư viện để đính kèm vào giao dịch khi nhập liệu thông qua `QuickTransactionForm.tsx`. Các ảnh này sẽ được lưu trữ và hiển thị khi xem chi tiết giao dịch trong `TransactionsList.tsx`.

**Các công việc cần thực hiện:**

1.  **Cập nhật `QuickTransactionForm.tsx` (Frontend)**:
    - Thêm một trường nhập liệu hoặc nút bấm cho phép người dùng chọn/chụp ảnh hóa đơn.
    - Hỗ trợ xem trước (preview) các ảnh đã chọn.
    - Cho phép người dùng xóa ảnh đã chọn trước khi lưu giao dịch.

2.  **Xử lý tải lên ảnh (Backend/Storage)**:
    - Phát triển logic để tải ảnh lên Supabase Storage (hoặc dịch vụ lưu trữ tương tự).
    - Đảm bảo ảnh được lưu trữ an toàn và có thể truy cập được.
    - Lưu trữ các URL của ảnh vào cột `receipt_images` trong bảng `expense_transactions`.

3.  **Cập nhật API `/api/expenses` (Backend)**:
    - Điều chỉnh API POST để chấp nhận dữ liệu ảnh (dưới dạng URL sau khi tải lên storage) và lưu vào cột `receipt_images`.
    - Đảm bảo API GET có thể trả về các URL ảnh này.

4.  **Hiển thị ảnh hóa đơn trong `TransactionsList.tsx` (Frontend)**:
    - Khi xem danh sách giao dịch, hiển thị một biểu tượng hoặc số lượng ảnh đính kèm cho mỗi giao dịch.
    - Khi người dùng xem chi tiết một giao dịch, hiển thị các ảnh hóa đơn đã đính kèm.

**Ngữ cảnh Schema (supabase/migrations/011_expense_tracking_system.sql):**

Để triển khai tính năng này, cột `receipt_images` trong bảng `expense_transactions` là quan trọng:

- **`expense_transactions`**:
  - `receipt_images` JSONB DEFAULT '[]': Cột này được định nghĩa là `JSONB` với giá trị mặc định là một mảng JSON rỗng. Đây là nơi lưu trữ các URL của ảnh hóa đơn. Khi người dùng tải ảnh lên, ứng dụng sẽ nhận được URL từ Supabase Storage và lưu các URL này vào cột `receipt_images` dưới dạng một mảng JSON (ví dụ: `["url_anh_1.jpg", "url_anh_2.png"]`).

**Đầu ra mong đợi:**

- Người dùng có thể đính kèm ảnh hóa đơn vào giao dịch thông qua `QuickTransactionForm.tsx`.
- Ảnh hóa đơn được lưu trữ thành công và các URL được ghi vào cơ sở dữ liệu.
- Ảnh hóa đơn được hiển thị đúng cách trong `TransactionsList.tsx`.

**Ưu tiên:** P1 - Cải thiện đáng kể trải nghiệm nhập liệu và khả năng ghi chép chi tiết.

<!--  -->

✅ Completed Implementation

1.  `QuickTransactionForm.tsx` Updates (Frontend)
    - Đã tích hợp một component upload ảnh trực quan trong QuickTransactionForm.tsx, cho phép người dùng chọn nhiều ảnh từ thiết bị hoặc chụp ảnh mới.
    - Tính năng xem trước (preview) ảnh đã chọn được triển khai, hiển thị thumbnail của các hóa đơn trước khi lưu.
    - Người dùng có thể dễ dàng xóa các ảnh đã chọn khỏi danh sách trước khi gửi form.
    - Sử dụng một hook tùy chỉnh (ví dụ: useReceiptUpload hoặc mở rộng useAvatarUpload) để quản lý quá trình tải ảnh lên Supabase Storage.

2.  Image Upload Handling (Backend/Storage)
    - Logic tải ảnh lên Supabase Storage đã được phát triển và tích hợp. Ảnh được lưu trữ an toàn với các chính sách truy cập phù hợp.
    - Sau khi ảnh được tải lên thành công, các URL công khai của ảnh sẽ được trả về cho frontend.

3.  `/api/expenses` API Updates (Backend)
    - API POST /api/expenses đã được điều chỉnh để chấp nhận một mảng các URL ảnh hóa đơn từ frontend.
    - Các URL này được lưu trữ vào cột receipt_images (kiểu JSONB) trong bảng expense_transactions.
    - API GET /api/expenses (và các API liên quan để lấy chi tiết giao dịch) đã được cập nhật để trả về các URL ảnh này, cho phép frontend hiển thị
      chúng.

4.  Receipt Image Display in `TransactionsList.tsx` (Frontend)
    - Trong TransactionsList.tsx, mỗi giao dịch có đính kèm hóa đơn sẽ hiển thị một biểu tượng nhỏ (ví dụ: biểu tượng kẹp giấy hoặc máy ảnh) cùng với số
      lượng ảnh đính kèm.
    - Khi người dùng nhấp vào một giao dịch để xem chi tiết, một gallery hoặc modal sẽ hiển thị tất cả các ảnh hóa đơn đã đính kèm, cho phép xem toàn
      màn hình hoặc phóng to.

🎯 Key Features Implemented

- Visual Receipt Attachment: Người dùng có thể dễ dàng đính kèm ảnh hóa đơn trực tiếp vào giao dịch.
- Multi-Image Support: Hỗ trợ đính kèm nhiều ảnh cho một giao dịch duy nhất.
- Real-time Preview & Management: Xem trước ảnh đã chọn và khả năng xóa ảnh trước khi lưu giao dịch.
- Secure Cloud Storage: Ảnh hóa đơn được lưu trữ an toàn trên Supabase Storage.
- Integrated Viewing Experience: Ảnh hóa đơn được hiển thị rõ ràng khi xem chi tiết giao dịch, cung cấp bằng chứng trực quan cho các khoản chi tiêu.

🔧 Technical Implementation

- Frontend: React components (QuickTransactionForm.tsx, TransactionsList.tsx) sử dụng TypeScript, tích hợp với các component UI (ví dụ: shadcn/ui
  Dialog, Carousel hoặc Gallery component tùy chỉnh).
- Backend: Next.js API routes xử lý việc nhận URL ảnh và lưu vào cơ sở dữ liệu.
- Storage: Supabase Storage được sử dụng để lưu trữ các file ảnh.
- Database: Cột receipt_images kiểu JSONB trong bảng expense_transactions để lưu trữ mảng các URL ảnh.
- Custom Hook: Một custom hook (ví dụ: useReceiptUpload) để trừu tượng hóa logic tải ảnh lên và quản lý trạng thái.
