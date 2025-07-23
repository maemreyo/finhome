## Ticket 35: Thiết kế Giao diện Chống "Ảo tưởng Tự động" và Khuyến khích Xác minh (Design UI to Counteract Automation Bias and Encourage Verification)

**Mục tiêu:** Giảm thiểu rủi ro người dùng tin tưởng một cách mù quáng vào kết quả của AI và không kiểm tra lại, bằng cách thiết kế một giao diện xác nhận thông minh, khuyến khích sự rà soát nhanh chóng và làm nổi bật các thông tin quan trọng nhất.

**Mô tả:**
Khi một hệ thống tự động hoạt động tốt trong hầu hết các trường hợp, người dùng có xu hướng phát triển một sự tin tưởng vô điều kiện (Automation Bias). Họ sẽ dần bỏ qua bước kiểm tra và chỉ bấm "Xác nhận" một cách máy móc. Trong bối cảnh tài chính, điều này cực kỳ nguy hiểm: một lỗi nhỏ của AI (ví dụ: nhận dạng sai một con số 0, phân loại sai một khoản chi lớn) có thể không được phát hiện, dẫn đến sổ sách tài chính bị sai lệch nghiêm trọng và làm mất đi giá trị cốt lõi của ứng dụng.

**Các công việc cần thực hiện:**

1.  **Thiết kế Lại Dialog Xác nhận với Phân cấp Trực quan (Frontend/UI/UX):**
    -   **Nhiệm vụ:** Sử dụng các nguyên tắc về phân cấp trực quan (visual hierarchy) để hướng sự chú ý của người dùng vào các yếu tố quan trọng nhất.
    -   **Logic:**
        -   Làm cho trường **Số tiền (`amount`)** và **Loại giao dịch (`transaction_type`)** trở nên nổi bật nhất, ví dụ: sử dụng font chữ lớn hơn, đậm hơn hoặc màu sắc khác biệt.
        -   Các thông tin phụ như thẻ (tags), mô tả có thể có độ ưu tiên thấp hơn.
    -   **Mục đích:** Giúp người dùng có thể "liếc" qua và xác nhận thông tin quan trọng nhất chỉ trong một giây.

2.  **Triển khai "Hàng rào An toàn" cho Giao dịch Bất thường (Frontend/Backend):**
    -   **Nhiệm vụ:** Xây dựng một cơ chế để cảnh báo người dùng về các giao dịch có giá trị lớn hoặc bất thường.
    -   **Backend:** API `/api/expenses/parse-from-text` cần được nâng cấp để phân tích và trả về một cờ (flag) như `is_unusual_transaction: true` nếu giao dịch đó lớn hơn một ngưỡng nhất định (ví dụ: 5.000.000 VNĐ) hoặc cao hơn nhiều so với mức chi tiêu trung bình của người dùng trong danh mục đó.
    -   **Frontend:** Khi nhận được cờ này, Dialog xác nhận phải hiển thị một cảnh báo rõ ràng hoặc một bước xác nhận phụ. Ví dụ: "Giao dịch này có giá trị lớn. Vui lòng kiểm tra lại số tiền là **15.000.000đ**."

3.  **Tối ưu hóa Trải nghiệm Chỉnh sửa (Frontend/UI/UX):**
    -   **Nhiệm vụ:** Làm cho việc chỉnh sửa các đề xuất của AI trở nên cực kỳ dễ dàng và trực quan.
    -   **Logic:**
        -   Mỗi trường do AI điền (Danh mục, Thẻ, Mô tả) phải trông giống như một ô nhập liệu có thể tương tác, chứ không phải là một đoạn văn bản tĩnh.
        -   Khi người dùng nhấp vào trường "Danh mục", cửa sổ chọn danh mục phải xuất hiện ngay lập tức mà không có độ trễ hay các bước phụ.

**Ngữ cảnh Schema:**
-   Cần mở rộng cấu trúc JSON trả về của API `/api/expenses/parse-from-text` để bao gồm các cờ kiểm soát như `is_unusual_transaction: true` hoặc một điểm số tin cậy `confidence_score`.
-   Để xác định một giao dịch có "bất thường" hay không, backend có thể cần truy cập và phân tích dữ liệu giao dịch lịch sử của người dùng.

**Đầu ra mong đợi:**
-   Một giao diện người dùng thông minh, không chỉ hiển thị thông tin mà còn khéo léo hướng dẫn người dùng kiểm tra lại.
-   Giảm đáng kể tỷ lệ các giao dịch bị ghi nhận sai do người dùng bỏ qua bước xác minh.
-   Tăng cường cảm giác kiểm soát và sự tin tưởng của người dùng vào hệ thống, vì họ biết rằng có các lớp bảo vệ giúp họ tránh được sai sót.

**Ưu tiên:** P2 - Cao. Tính năng này ảnh hưởng trực tiếp đến độ chính xác của dữ liệu, vốn là giá trị cốt lõi mà sản phẩm mang lại cho người dùng.