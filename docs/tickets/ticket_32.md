## Ticket 32: Quản lý và Tối ưu hóa Chi phí API của Mô hình AI (Manage and Optimize AI Model API Costs)

**Mục tiêu:** Xây dựng một chiến lược toàn diện để theo dõi, kiểm soát và tối ưu hóa chi phí phát sinh từ việc gọi API Gemini, đảm bảo tính bền vững về mặt tài chính cho tính năng nhập liệu hội thoại khi mở rộng quy mô người dùng.

**Mô tả:**
Mỗi yêu cầu phân tích văn bản của người dùng đều tương ứng với một lệnh gọi API và phát sinh chi phí. Nếu không được quản lý chặt chẽ, tổng chi phí này có thể tăng lên nhanh chóng, ảnh hưởng trực tiếp đến lợi nhuận và tính khả thi của sản phẩm, đặc biệt là với một lượng lớn người dùng hoạt động thường xuyên. Ticket này tập trung vào việc triển khai các cơ chế kỹ thuật và chiến lược kinh doanh để giữ chi phí ở mức có thể kiểm soát được.

**Các công việc cần thực hiện:**

1.  **Thiết lập Hệ thống Giám sát & Cảnh báo (Backend & DevOps):**
    -   **Nhiệm vụ:** Tích hợp và cấu hình bảng điều khiển giám sát chi phí (ví dụ: Google Cloud Billing).
    -   Tạo các biểu đồ để theo dõi chi phí theo thời gian thực, theo ngày, theo tuần.
    -   Thiết lập các cảnh báo tự động (ví dụ: gửi email/slack) khi chi phí hàng ngày hoặc hàng tháng vượt qua một ngưỡng ngân sách đã định trước (ví dụ: 75% ngân sách).

2.  **Triển khai Cơ chế Giới hạn & Ngăn chặn Lạm dụng (Backend):**
    -   **Giới hạn tỷ lệ (Rate Limiting):** Thiết lập một giới hạn hợp lý về số lần gọi API cho mỗi người dùng trong một khoảng thời gian ngắn (ví dụ: 20 yêu cầu/phút) để ngăn chặn các hành vi spam hoặc lỗi vòng lặp từ client.
    -   **Ngân sách sử dụng (Usage Quota):** Cân nhắc áp dụng một hạn ngạch sử dụng hàng tháng cho người dùng ở các gói khác nhau. Ví dụ:
        -   *Gói Miễn phí:* 100 lượt phân tích AI/tháng.
        -   *Gói Trả phí:* Không giới hạn hoặc giới hạn cao hơn nhiều.
    -   Cần một API để kiểm tra hạn ngạch còn lại của người dùng trước khi thực hiện lệnh gọi.

3.  **Tối ưu hóa Token và Lựa chọn Mô hình (Backend/Prompt Engineering):**
    -   **Tối ưu hóa Prompt (Token Reduction):** Rà soát lại prompt (từ Ticket 31) để làm cho nó ngắn gọn nhất có thể mà không làm giảm độ chính xác. Mỗi token được cắt giảm là một khoản tiết kiệm chi phí trực tiếp.
    -   **Nghiên cứu các mô hình thay thế:** Đánh giá xem có các mô hình AI nhỏ hơn, rẻ hơn nhưng vẫn đủ khả năng xử lý các yêu cầu đơn giản hay không. Có thể xây dựng một bộ định tuyến (router) để chuyển các yêu cầu đơn giản đến mô hình rẻ tiền và các yêu cầu phức tạp đến Gemini.

4.  **Triển khai Caching Thông minh (Backend):**
    -   **Nhiệm vụ:** Xây dựng một lớp cache (ví dụ: sử dụng Redis) cho API `/api/expenses/parse-from-text`.
    -   **Logic:** Key của cache sẽ là một hash của chuỗi văn bản đầu vào của người dùng. Nếu một yêu cầu với cùng một chuỗi văn bản được gửi lại trong một khoảng thời gian ngắn (ví dụ: 1 giờ), hệ thống sẽ trả về kết quả từ cache thay vì gọi lại API Gemini.

**Ngữ cảnh Schema:**
-   Có thể cần thêm một cột vào bảng `users` (hoặc bảng `subscriptions`) để lưu số lượt gọi API đã sử dụng trong tháng: `ai_requests_this_month`.
-   Cần một cơ chế (ví dụ: cron job) để reset bộ đếm này vào đầu mỗi tháng.

**Đầu ra mong đợi:**
-   Một hệ thống giám sát chi phí API minh bạch và hiệu quả.
-   Các biện pháp kiểm soát được triển khai để ngăn chặn chi phí vượt ngoài tầm kiểm soát và chống lạm dụng.
-   Giảm thiểu chi phí trên mỗi yêu cầu thông qua việc tối ưu hóa prompt và caching.
-   Một cơ sở dữ liệu vững chắc để xây dựng mô hình định giá cho các gói dịch vụ, đảm bảo tính năng AI không chỉ là một trung tâm chi phí mà còn có thể tạo ra doanh thu.

**Ưu tiên:** P1 - Quan trọng. Cần được thực hiện song song với quá trình phát triển và phải hoàn thành trước khi tính năng được phát hành rộng rãi.