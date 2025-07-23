## Ticket 31: Xây dựng và Tinh chỉnh Prompt cho Mô hình AI (Prompt Engineering for AI Model)

**Mục tiêu:** Xây dựng, kiểm thử và tối ưu hóa một prompt (câu lệnh đầu vào) mạnh mẽ và chi tiết cho Gemini AI. Chất lượng của prompt này sẽ quyết định trực tiếp đến độ chính xác, tính linh hoạt và hiệu suất của toàn bộ tính năng nhập liệu hội thoại (Ticket 21).

**Mô tả:**
Prompt là "bộ não" của tính năng AI. Một prompt được thiết kế tốt sẽ hướng dẫn AI hiểu đúng ý định của người dùng, trích xuất chính xác thông tin giao dịch, và xử lý được các cách diễn đạt đa dạng, từ đơn giản đến phức tạp, bao gồm cả tiếng lóng và nhiều giao dịch trong một câu. Công việc này không chỉ là viết một câu lệnh, mà là một quy trình kỹ thuật bao gồm thiết kế, kiểm thử nghiêm ngặt và tinh chỉnh liên tục để đạt được kết quả mong muốn.

**Các công việc cần thực hiện:**

1.  **Thiết kế Prompt Phiên bản Đầu tiên (v1):**
    -   **Xây dựng bộ chỉ dẫn cốt lõi (Core Instructions):** Viết các quy tắc và hướng dẫn rõ ràng cho AI, định nghĩa vai trò của nó là một "trợ lý tài chính chuyên nghiệp".
    -   **Định nghĩa Cấu trúc JSON đầu ra:** Chỉ định rõ ràng định dạng JSON mà AI phải trả về, bao gồm các trường: `transaction_type`, `amount`, `description`, `suggested_category_id`, `suggested_tags`, `suggested_wallet_id`.
    -   **Cung cấp Ví dụ "Few-Shot":** Đưa vào prompt một vài ví dụ mẫu (input -> output) chất lượng cao để "dạy" AI cách xử lý các trường hợp phổ biến nhất.

2.  **Xây dựng Bộ Kiểm thử (Test Suite):**
    -   **Nhiệm vụ:** Tạo một file hoặc bộ dữ liệu chứa hàng loạt các chuỗi văn bản đầu vào đa dạng để kiểm thử prompt.
    -   **Các loại Test Case cần có:**
        -   **Cơ bản:** `ăn trưa 50k`, `được thưởng 2 triệu`
        -   **Có mô tả & thẻ:** `mua sách trên Tiki 350k #sách_vở #tiki`
        -   **Nhiều giao dịch:** `ăn sáng 40k, đổ xăng 100k, nhận lương 18tr`
        -   **Tiếng lóng/Từ địa phương:** `nhậu với mấy đứa bạn hết 2 xị`, `trà đá 5 cành`
        -   **Số tiền phức tạp:** `chuyển khoản 1tr5`, `tốn một triệu rưỡi`
        -   **Trường hợp mơ hồ:** `chuyển tiền cho mẹ` (thiếu số tiền), `hôm nay tiêu hơi nhiều`
        -   **Trường hợp không phải giao dịch:** `sếp thật tuyệt vời`, `hy vọng không đu đỉnh`

3.  **Quy trình Tinh chỉnh Lặp lại (Iterative Refinement Cycle):**
    -   Tạo một script tự động để chạy toàn bộ Test Suite với phiên bản prompt hiện tại.
    -   Phân tích kết quả đầu ra, xác định các trường hợp AI xử lý sai hoặc không chính xác.
    -   Cập nhật và tinh chỉnh lại prompt (thêm quy tắc, sửa đổi ví dụ, làm rõ hướng dẫn).
    -   Chạy lại Test Suite và lặp lại quy trình cho đến khi độ chính xác đạt mục tiêu đề ra (ví dụ: 95% các test case phổ biến được xử lý đúng).

4.  **Quản lý phiên bản Prompt:**
    -   Lưu trữ các phiên bản của prompt trong hệ thống quản lý phiên bản (ví dụ: Git).
    -   Ghi lại nhật ký thay đổi (changelog) cho mỗi phiên bản để tiện theo dõi và phục hồi khi cần.

**Ngữ cảnh Schema:**
-   Prompt cần được cung cấp danh sách các `expense_categories` và `income_categories` (bao gồm `id` và `name`) để có thể đề xuất `suggested_category_id` một cách chính xác. Điều này có thể yêu cầu một cơ chế để đưa danh sách danh mục vào prompt một cách linh động.

**Đầu ra mong đợi:**
-   Một prompt hoàn chỉnh, được kiểm thử kỹ lưỡng và sẵn sàng để đưa vào sử dụng trong môi trường production.
-   Một bộ Test Suite toàn diện có thể được tái sử dụng để kiểm thử hồi quy mỗi khi prompt được cập nhật.
-   Tài liệu ghi lại các quyết định thiết kế quan trọng và các phiên bản của prompt.
-   Độ chính xác cao trong việc phân tích và phân loại giao dịch từ văn bản tự nhiên của người dùng.

**Ưu tiên:** P0 - Cực kỳ quan trọng. Đây là công việc nền tảng và là yếu tố rủi ro lớn nhất của Ticket 21. Cần được bắt đầu và hoàn thành sớm nhất có thể.