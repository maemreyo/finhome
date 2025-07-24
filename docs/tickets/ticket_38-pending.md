## Ticket 38: Xây dựng Cơ chế Dự phòng và Chống chịu Lỗi cho API AI (Build Fallback and Fault-Tolerance Mechanisms for AI API)

**Mục tiêu:** Đảm bảo ứng dụng vẫn hoạt động ổn định và người dùng vẫn có thể nhập liệu giao dịch ngay cả khi API của bên thứ ba (Gemini AI) gặp sự cố, hoạt động chậm, hoặc không khả dụng, qua đó duy trì sự tin cậy và trải nghiệm liền mạch cho người dùng.

**Mô tả:**
Tính năng nhập liệu hội thoại phụ thuộc hoàn toàn vào dịch vụ của một bên thứ ba. Bất kỳ sự gián đoạn nào từ phía họ (sập dịch vụ, lỗi mạng, thay đổi chính sách đột ngột) sẽ trực tiếp làm tê liệt tính năng cốt lõi của chúng ta. Ticket này tập trung vào việc xây dựng một kiến trúc vững chắc, có khả năng chống chịu lỗi và đảm bảo trải nghiệm người dùng không bị gián đoạn.

**Các công việc cần thực hiện:**

1.  **Triển khai Cơ chế Timeout và Thử lại Thông minh (Backend):**
    -   **Nhiệm vụ:** Thiết lập một ngưỡng thời gian chờ (timeout) hợp lý cho mỗi lệnh gọi API (ví dụ: 10 giây).
    -   **Logic:** Nếu không nhận được phản hồi trong khoảng thời gian này, hệ thống nên tự động thử lại một số lần nhất định (ví dụ: 2 lần) với khoảng cách tăng dần (exponential backoff) để tránh tạo gánh nặng cho dịch vụ đang gặp sự cố.

2.  **Xây dựng Logic Dự phòng (Fallback) về Form Truyền thống (Backend & Frontend):**
    -   **Nhiệm vụ:** Đây là phần quan trọng nhất. Nếu sau khi thử lại mà API vẫn không phản hồi hoặc trả về lỗi hệ thống (mã 5xx), hệ thống phải tự động chuyển sang chế độ dự phòng.
    -   **Backend:** API `/api/expenses/parse-from-text` sẽ không trả về lỗi 500 cho client. Thay vào đó, nó sẽ trả về một mã lỗi đặc biệt (ví dụ: `AI_SERVICE_UNAVAILABLE`).
    -   **Frontend:** Khi nhận được mã lỗi này, giao diện sẽ tự động ẩn ô nhập liệu AI và hiển thị lại form nhập liệu truyền thống. Dữ liệu văn bản mà người dùng đã nhập sẽ được giữ lại và điền sẵn vào trường "Mô tả" của form để họ không phải nhập lại.

3.  **Thiết lập "Cầu dao Ngắt mạch" (Circuit Breaker Pattern) (Backend):**
    -   **Nhiệm vụ:** Triển khai mẫu thiết kế Circuit Breaker để bảo vệ hệ thống khỏi việc liên tục gọi một dịch vụ đang bị lỗi.
    -   **Logic:** Nếu hệ thống ghi nhận một tỷ lệ lỗi cao từ API Gemini trong một khoảng thời gian ngắn, "cầu dao" sẽ "ngắt". Tất cả các yêu cầu tiếp theo trong một khoảng thời gian nhất định sẽ không gọi đến API Gemini nữa mà được chuyển thẳng đến logic dự phòng. Sau đó, hệ thống sẽ thử gửi một vài yêu cầu để kiểm tra xem dịch vụ đã phục hồi chưa.

4.  **Thông báo cho Người dùng một cách Minh bạch (Frontend/UI/UX):**
    -   **Nhiệm vụ:** Khi chế độ dự phòng được kích hoạt, cần hiển thị một thông báo nhỏ, không gây hoang mang cho người dùng.
    -   **Ví dụ:** "Trợ lý AI đang tạm thời bảo trì. Bạn có thể sử dụng form nhập liệu thông thường nhé."

**Ngữ cảnh Schema:**
-   Ảnh hưởng đến kiến trúc xử lý lỗi của API `/api/expenses/parse-from-text`.
-   Yêu cầu sự phối hợp chặt chẽ giữa logic backend và xử lý trạng thái của frontend để chuyển đổi mượt mà giữa chế độ AI và chế độ dự phòng.

**Đầu ra mong đợi:**
-   Một hệ thống có khả năng chống chịu lỗi cao, không bị ảnh hưởng nặng nề bởi sự cố từ bên thứ ba.
-   Trải nghiệm người dùng liền mạch, không bị chặn đứng khi có sự cố xảy ra.
-   Tăng cường độ tin cậy và sự ổn định chung của sản phẩm.

**Ưu tiên:** P1 - Quan trọng. Đây là một yêu cầu nền tảng về kiến trúc để đảm bảo độ tin cậy của dịch vụ. Phải được thiết kế và triển khai trước khi ra mắt.