## Ticket 33: Tối ưu hóa Độ trễ và Trải nghiệm Chờ cho API AI (Optimize Latency and Waiting Experience for AI API)

**Mục tiêu:** Đảm bảo thời gian phản hồi của tính năng nhập liệu hội thoại (Ticket 21) nhanh và mượt mà, giảm thiểu cảm giác chờ đợi của người dùng sau khi gửi yêu cầu, nhằm duy trì một trải nghiệm "tức thì" và không gây gián đoạn.

**Mô tả:**
Các mô hình ngôn ngữ lớn như Gemini thường cần từ 1 đến vài giây để xử lý một yêu cầu. Khoảng thời gian trễ này, dù nhỏ, có thể phá vỡ luồng tương tác tự nhiên và làm người dùng cảm thấy tính năng "chậm" hoặc "đơ". Ticket này tập trung vào việc triển khai các kỹ thuật ở cả frontend và backend để che giấu (mask) và giảm thiểu độ trễ, biến thời gian chờ đợi thành một phần của trải nghiệm tích cực.

**Các công việc cần thực hiện:**

1.  **Đo lường và Phân tích Độ trễ (Backend & Frontend):**
    -   **Nhiệm vụ:** Thiết lập logging chi tiết để đo lường chính xác thời gian xử lý từ đầu đến cuối (end-to-end):
        -   Thời gian từ lúc client gửi request.
        -   Thời gian chờ API Gemini xử lý (server processing time).
        -   Thời gian dữ liệu truyền về client.
        -   Thời gian để client render dialog xác nhận.
    -   **Mục tiêu:** Xác định chính xác các "nút thắt cổ chai" gây ra độ trễ lớn nhất.

2.  **Triển khai Giao diện Người dùng Tối ưu (Optimistic UI) (Frontend):**
    -   **Nhiệm vụ:** Cung cấp phản hồi trực quan ngay lập tức cho người dùng.
    -   **Logic:** Ngay sau khi người dùng nhấn gửi, vô hiệu hóa ô nhập liệu và hiển thị ngay một chỉ báo tải (loading indicator) hoặc một animation tinh tế (ví dụ: một dòng chữ "AI đang phân tích..." với hiệu ứng gõ phím).
    -   **Lợi ích:** Điều này cho người dùng biết hệ thống đã nhận yêu cầu và đang làm việc, thay vì để giao diện "đứng hình" một cách khó hiểu.

3.  **Nghiên cứu và Triển khai API Streaming (Backend & Frontend):**
    -   **Nhiệm vụ:** Điều tra xem API Gemini có hỗ trợ chế độ streaming (truyền dữ liệu theo dòng) hay không.
    -   **Logic tiềm năng:** Nếu có, thay vì chờ nhận toàn bộ file JSON kết quả, client có thể nhận và hiển thị từng phần của kết quả ngay khi nó được tạo ra. Ví dụ, với câu lệnh `"ăn sáng 40k, đổ xăng 100k"`, dialog có thể hiện ra giao dịch "ăn sáng" trước, rồi một giây sau hiện tiếp giao dịch "đổ xăng".
    -   **Lợi ích:** Tạo cảm giác hệ thống đang "suy nghĩ" và phản hồi liên tục, làm cho thời gian chờ đợi trở nên năng động hơn.

4.  **Tối ưu hóa Vị trí Triển khai (Backend/DevOps):**
    -   **Nhiệm vụ:** Đảm bảo rằng máy chủ backend của ứng dụng được triển khai ở vùng địa lý (region) gần nhất có thể với máy chủ API của Gemini.
    -   **Lợi ích:** Giảm thiểu đáng kể độ trễ mạng (network latency), vốn là một phần quan trọng trong tổng thời gian phản hồi.

**Ngữ cảnh Schema:**
-   Không ảnh hưởng trực tiếp đến schema cơ sở dữ liệu.
-   Tuy nhiên, nó ảnh hưởng sâu sắc đến kiến trúc của API `/api/expenses/parse-from-text` (có thể cần hỗ trợ streaming) và thiết kế của các component giao diện người dùng liên quan đến việc hiển thị trạng thái tải.

**Đầu ra mong đợi:**
-   Thời gian từ lúc người dùng gửi yêu cầu đến lúc thấy kết quả đầu tiên được giảm thiểu tối đa.
-   Trải nghiệm người dùng mượt mà, không có cảm giác "khựng" hay phải chờ đợi trong vô vọng.
-   Người dùng nhận được phản hồi trực quan và hữu ích trong suốt quá trình xử lý của AI.
-   Một hệ thống được tối ưu hóa về hiệu suất, sẵn sàng cho việc mở rộng quy mô mà không làm suy giảm trải nghiệm người dùng.

**Ưu tiên:** P2 - Cao. Mặc dù không phải là một lỗi chặn (blocker), độ trễ ảnh hưởng trực tiếp đến sự hài lòng, tỷ lệ giữ chân và đánh giá của người dùng về tính năng. Cần được giải quyết trước khi phát hành rộng rãi.