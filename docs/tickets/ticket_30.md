## Ticket 30: Phân tích và Giảm thiểu Rủi ro Quyền riêng tư Dữ liệu với Nhà cung cấp AI (Analyze and Mitigate Data Privacy Risks with AI Provider)

**Mục tiêu:** Đảm bảo tính năng nhập liệu hội thoại (Ticket 21) tuân thủ các tiêu chuẩn cao nhất về quyền riêng tư và bảo mật dữ liệu người dùng, bằng cách chủ động phân tích, đánh giá và triển khai các biện pháp giảm thiểu rủi ro khi làm việc với API của bên thứ ba (Gemini AI).

**Mô tả:**
Tính năng nhập liệu hội thoại yêu cầu gửi toàn bộ chuỗi văn bản do người dùng nhập (vốn chứa thông tin tài chính và cá nhân cực kỳ nhạy cảm) đến máy chủ của nhà cung cấp AI. Điều này tạo ra một rủi ro tiềm tàng: dữ liệu của người dùng có thể bị lưu trữ, phân tích hoặc sử dụng cho các mục đích ngoài tầm kiểm soát của chúng ta, gây lo ngại về quyền riêng tư và có thể vi phạm các quy định về bảo vệ dữ liệu. Ticket này nhằm mục đích giải quyết triệt để rủi ro đó trước khi tính năng được phát hành.

**Các công việc cần thực hiện:**

1.  **Nghiên cứu Pháp lý & Chính sách (Legal & Policy Review):**
    -   **Nhiệm vụ:** Rà soát kỹ lưỡng Điều khoản Dịch vụ (Terms of Service) và Chính sách Quyền riêng tư của API Gemini, đặc biệt tập trung vào các điều khoản liên quan đến:
        -   Lưu giữ dữ liệu (Data Retention): Dữ liệu được lưu trong bao lâu?
        -   Sử dụng dữ liệu (Data Usage): Dữ liệu có được dùng để huấn luyện các mô hình AI của họ không?
        -   Ẩn danh và Tổng hợp: Họ có cam kết nào về việc ẩn danh hóa dữ liệu không?
    -   **Kết quả:** Một tài liệu tóm tắt các rủi ro và cam kết từ phía nhà cung cấp.

2.  **Triển khai các Biện pháp Kỹ thuật (Backend):**
    -   **Nhiệm vụ:** Dựa trên kết quả nghiên cứu, triển khai các biện pháp bảo vệ cần thiết.
    -   **Ví dụ:** Nếu chính sách cho phép, cần gửi một cờ (flag) trong header của API request để yêu cầu không lưu trữ hoặc không sử dụng dữ liệu cho việc huấn luyện.
    -   **Nghiên cứu:** Tìm hiểu xem API có cung cấp các phiên bản dành cho doanh nghiệp (enterprise-grade) với cam kết bảo mật cao hơn không và đánh giá chi phí.

3.  **Cập nhật Chính sách Quyền riêng tư của Sản phẩm (Frontend & Legal):**
    -   **Nhiệm vụ:** Soạn thảo và cập nhật Chính sách Quyền riêng tư của ứng dụng để phản ánh một cách minh bạch, rõ ràng về việc sử dụng dịch vụ AI của bên thứ ba để xử lý dữ liệu giao dịch.
    -   **Nội dung cần có:**
        -   Loại dữ liệu nào được gửi đi.
        -   Mục đích của việc gửi dữ liệu.
        -   Tên của nhà cung cấp dịch vụ AI.
        -   Một liên kết đến chính sách quyền riêng tư của họ.
    -   Hiển thị một thông báo hoặc yêu cầu người dùng đồng ý (consent) một cách rõ ràng trước khi họ sử dụng tính năng này lần đầu tiên.

**Ngữ cảnh Schema:**
-   Không tác động trực tiếp đến schema cơ sở dữ liệu hiện tại (`expense_transactions`, `users`...).
-   Tuy nhiên, công việc này là điều kiện tiên quyết về mặt pháp lý và đạo đức để có thể triển khai Ticket 21 và lưu trữ dữ liệu vào bảng `user_ai_corrections` trong tương lai.

**Đầu ra mong đợi:**
-   Một báo cáo đánh giá rủi ro chi tiết về nhà cung cấp AI.
-   Các biện pháp kỹ thuật cần thiết đã được triển khai ở backend.
-   Chính sách Quyền riêng tư của ứng dụng được cập nhật và công bố.
-   Xây dựng được lòng tin từ người dùng thông qua sự minh bạch, đảm bảo rằng dữ liệu của họ được xử lý một cách an toàn và có trách nhiệm.

**Ưu tiên:** P1 - Quan trọng. Phải được hoàn thành trước khi tính năng AI (Ticket 21) được phát hành cho người dùng cuối.