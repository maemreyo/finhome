## Ticket 34: Bảo mật Cấp cao cho Dữ liệu Sửa lỗi AI của Người dùng (High-Level Security for User's AI Correction Data)

**Mục tiêu:** Thiết kế và triển khai các biện pháp bảo mật đa lớp để bảo vệ tuyệt đối bảng dữ liệu `user_ai_corrections`, đảm bảo dữ liệu nhạy cảm về hành vi tài chính của người dùng được bảo vệ khỏi mọi truy cập trái phép và nguy cơ rò rỉ.

**Mô tả:**
Bảng `user_ai_corrections` (được đề xuất trong Ticket 21) chứa thông tin cực kỳ nhạy cảm: mối liên kết giữa văn bản gốc người dùng nhập, đề xuất ban đầu của AI, và sự điều chỉnh chính xác của họ. Dữ liệu này không chỉ là tài sản quý giá để cải thiện mô hình mà còn là một mục tiêu tấn công giá trị cao. Bất kỳ sự rò rỉ nào từ bảng dữ liệu này cũng sẽ gây ra thiệt hại nghiêm trọng về lòng tin của người dùng và uy tín của sản phẩm. Do đó, việc bảo mật cho nó phải được ưu tiên ở mức cao nhất.

**Các công việc cần thực hiện:**

1.  **Triển khai Mã hóa Toàn diện (Backend/DevOps):**
    -   **Mã hóa khi lưu trữ (Encryption at Rest):** Đảm bảo toàn bộ dữ liệu trong bảng `user_ai_corrections` được mã hóa ở cấp độ cơ sở dữ liệu.
    -   **Mã hóa trên đường truyền (Encryption in Transit):** Bắt buộc sử dụng các giao thức mã hóa mạnh (TLS 1.2 trở lên) cho mọi kết nối đến và đi từ cơ sở dữ liệu.
    -   **Mã hóa cấp ứng dụng (Application-Level Encryption):** Cân nhắc mã hóa các trường dữ liệu nhạy cảm nhất (ví dụ: `input_text`, `original_suggestion`) ngay ở tầng ứng dụng trước khi lưu vào cơ sở dữ liệu.

2.  **Thiết lập Kiểm soát Truy cập Nghiêm ngặt (Backend/DevOps):**
    -   **Nguyên tắc Đặc quyền Tối thiểu (Principle of Least Privilege):** Chỉ cấp quyền truy cập (đọc/ghi) vào bảng này cho các dịch vụ (service accounts) thực sự cần thiết (ví dụ: service ghi log và service phân tích ẩn danh).
    -   **Cấm truy cập trực tiếp:** Không một nhân viên nào, kể cả lập trình viên hay quản trị viên, có quyền truy cập trực tiếp vào dữ liệu thô của bảng này, trừ khi thông qua một quy trình phê duyệt và giám sát đặc biệt cho mục đích gỡ lỗi khẩn cấp.

3.  **Xây dựng Hệ thống Giám sát và Cảnh báo (DevOps):**
    -   **Ghi nhật ký chi tiết (Detailed Logging):** Ghi lại toàn bộ các hành động truy cập vào bảng: ai (hoặc service nào) truy cập, truy cập vào bản ghi nào, thời gian nào, và hành động là gì (đọc/ghi/xóa).
    -   **Thiết lập cảnh báo bất thường:** Cấu hình cảnh báo tự động khi phát hiện các hoạt động đáng ngờ, ví dụ: một service cố gắng đọc một lượng lớn bản ghi trong một thời gian ngắn, hoặc có truy cập từ một địa chỉ IP không xác định.

4.  **Quy trình Ẩn danh hóa Dữ liệu cho Phân tích (Backend):**
    -   **Nhiệm vụ:** Trước khi sử dụng dữ liệu này để phân tích hoặc cải thiện mô hình, phải tạo ra một phiên bản dữ liệu đã được ẩn danh (anonymized) hoặc bút danh hóa (pseudonymized).
    -   **Logic:** Tạo một quy trình (ví dụ: một script ETL) để sao chép dữ liệu sang một bảng phân tích riêng, trong đó các thông tin định danh cá nhân như `user_id` đã được loại bỏ hoặc thay thế bằng một định danh giả.

**Ngữ cảnh Schema:**
-   Ticket này định hình toàn bộ các chính sách bảo mật và quy tắc truy cập xung quanh việc tạo và sử dụng bảng `user_ai_corrections`. Các quyết định trong ticket này phải được thực hiện trước hoặc song song với việc tạo ra bảng dữ liệu đó.

**Đầu ra mong đợi:**
-   Một kho lưu trữ dữ liệu sửa lỗi AI được bảo mật ở mức cao nhất.
-   Giảm thiểu tối đa rủi ro bị tấn công và rò rỉ dữ liệu nhạy cảm của người dùng.
-   Tuân thủ các tiêu chuẩn và quy định hàng đầu về bảo vệ dữ liệu (như GDPR, dù không bắt buộc nhưng là một tiêu chuẩn tốt để hướng tới).
-   Duy trì và củng cố lòng tin của người dùng, vốn là tài sản quý giá nhất của sản phẩm.

**Ưu tiên:** P1 - Quan trọng. Bảo mật không phải là một tính năng, mà là một yêu cầu nền tảng. Phải được thiết kế và triển khai ngay từ đầu, không phải là một giải pháp chắp vá sau này.