## Ticket 19: Triển khai Phân tích Giao dịch bằng AI (Bình luận "Meme") (Implement AI-Powered Transaction Analysis "Meme Comments")

**Mục tiêu:** Tạo ra một tính năng độc đáo, hấp dẫn và có khả năng thu phí bằng cách sử dụng Gemini AI để đưa ra những bình luận hài hước, thông minh hoặc "meme-like" về các giao dịch mà người dùng vừa thêm vào.

**Mô tả:**
Để tăng sự tương tác và tạo ra một trải nghiệm thú vị, ticket này sẽ triển khai một tính năng phân tích sau khi giao dịch được tạo. Khi người dùng thêm một khoản chi tiêu và đã bật tính năng này, hệ thống sẽ gửi dữ liệu giao dịch đến Gemini AI để nhận về một câu bình luận ngắn gọn, hài hước. Ví dụ: khi chi 50k cho trà sữa, AI có thể bình luận: "Một ly trà sữa cho tâm hồn, một lỗ hổng cho ví tiền!".

**Các công việc cần thực hiện:**

1.  **Xây dựng API Phân tích Giao dịch (Backend):**
    -   Tạo một API endpoint mới: `POST /api/expenses/analyze-transaction`.
    -   Endpoint này sẽ nhận `transaction_id` hoặc chi tiết giao dịch vừa được tạo.
    -   **Tích hợp Gemini AI:**
        -   Xây dựng logic để tạo một prompt hiệu quả cho Gemini AI. Prompt sẽ chứa thông tin về giao dịch (số tiền, danh mục, mô tả) và yêu cầu AI tạo ra một bình luận hài hước, thông minh theo phong cách "meme".
        -   Gọi đến Gemini AI API và nhận kết quả trả về.
        -   Xử lý và làm sạch phản hồi từ AI để đảm bảo nó an toàn và phù hợp.

2.  **Tích hợp vào Luồng Nhập liệu (Frontend):**
    -   Trong component `UnifiedTransactionForm.tsx` (được tạo ở Ticket 18), sau khi một giao dịch được tạo thành công:
        -   Kiểm tra xem người dùng có bật tính năng này không (xem Ticket 20).
        -   Nếu có, gọi đến API `/api/expenses/analyze-transaction`.
        -   Hiển thị bình luận trả về từ AI một cách hấp dẫn (ví dụ: sử dụng một `toast` đặc biệt với icon robot hoặc meme, hoặc một animation nhỏ trên dashboard).

3.  **Thiết kế Prompt cho AI (Prompt Engineering):**
    -   Thử nghiệm và tinh chỉnh các prompt khác nhau để đảm bảo Gemini AI trả về các bình luận chất lượng, đa dạng và đúng văn phong mong muốn (hài hước, châm biếm nhẹ nhàng, khích lệ).
    -   Cân nhắc các yếu tố như ngôn ngữ (Tiếng Việt), độ dài và định dạng của bình luận.

**Ngữ cảnh Schema:**
-   Tính năng này chủ yếu đọc từ bảng `expense_transactions` để lấy ngữ cảnh.
-   Không yêu cầu thay đổi schema chính, nhưng nó sẽ hoạt động song song với hệ thống theo dõi sử dụng trong Ticket 20.

**Đầu ra mong đợi:**
-   Một API backend có khả năng phân tích giao dịch bằng Gemini AI và trả về một bình luận hài hước.
-   Người dùng (đã bật tính năng) sẽ nhận được một bình luận thú vị sau khi thêm giao dịch mới.
-   Tạo ra một yếu tố "bất ngờ và thú vị" (surprise and delight) cho người dùng, tăng sự gắn kết.

**Ưu tiên:** P1 - Tính năng mới, hấp dẫn, và là nền tảng cho việc thu phí.
