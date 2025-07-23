## Ticket 21: Nhập liệu Giao dịch Hội thoại bằng AI (AI-Powered Conversational Transaction Entry)

**Mục tiêu:** Cách mạng hóa trải nghiệm nhập liệu giao dịch bằng cách thay thế hoàn toàn form truyền thống bằng một giao diện hội thoại. Người dùng chỉ cần viết một câu tự nhiên, và AI sẽ tự động phân tích, phân loại và chuẩn bị giao dịch để xác nhận.

**Mô tả:**
Thay vì yêu cầu người dùng đi qua nhiều bước (nhập số tiền, chọn loại, chọn ví, chọn danh mục, thêm thẻ), hệ thống mới sẽ cho phép họ nhập một chuỗi văn bản duy nhất như một cuộc trò chuyện. Ví dụ:

-   `"tiêu 25k trà sữa với bạn bè"`
-   `"hôm nay được thưởng 5 triệu, sếp thật tuyệt vời"`
-   `"đầu tư thêm 50 triệu vào chứng khoán, hy vọng không đu đỉnh"`
-   `"ăn sáng phở 40k, đổ xăng 50k, và nhận lương 15tr"`

AI sẽ phân tích câu này và tự động điền vào một bản nháp giao dịch để người dùng xác nhận.

**Các công việc cần thực hiện:**

1.  **Xây dựng API Phân tích Chuỗi Văn bản (Backend):**
    -   Tạo một API endpoint hoàn toàn mới: `POST /api/expenses/parse-from-text`.
    -   **Tích hợp Gemini AI:**
        -   Đây là phần cốt lõi. Cần xây dựng một prompt (câu lệnh) cực kỳ mạnh mẽ và chi tiết cho Gemini AI.
        -   Prompt phải hướng dẫn AI nhận dạng và trích xuất nhiều giao dịch từ một chuỗi duy nhất, và với mỗi giao dịch, phải trả về một cấu trúc JSON rõ ràng bao gồm:
            -   `transaction_type`: ('expense', 'income', 'transfer')
            -   `amount`: (số tiền)
            -   `description`: (mô tả được suy ra, ví dụ: "trà sữa")
            -   `suggested_category_id`: (ID của danh mục được AI đề xuất)
            -   `suggested_tags`: (một mảng các thẻ được AI đề xuất, ví dụ: `["#trà_sữa", "#bạn_bè"]`)
            -   `suggested_wallet_id`: (có thể là ví mặc định hoặc suy luận trong tương lai)

2.  **Thiết kế Giao diện Nhập liệu Hội thoại (Frontend):**
    -   Trong `UnifiedTransactionForm.tsx` (từ Ticket 18), thay thế hoặc bổ sung một trường nhập văn bản lớn, duy nhất.
    -   Khi người dùng nhập xong và nhấn gửi, gọi đến API `/api/expenses/parse-from-text`.

3.  **Xây dựng Dialog Xác nhận & Chỉnh sửa (Frontend):**
    -   Sau khi nhận được kết quả từ API, hiển thị một dialog xác nhận (confirmation dialog).
    -   Dialog này sẽ liệt kê một hoặc nhiều giao dịch mà AI đã phân tích.
    -   Mỗi giao dịch phải hiển thị rõ các trường đã được AI điền: Số tiền, Mô tả, Danh mục, Thẻ.
    -   **Quan trọng:** Tất cả các trường này phải có thể **chỉnh sửa trực tiếp** ngay trong dialog. Nếu AI phân loại sai, người dùng có thể chọn lại danh mục hoặc sửa thẻ ngay lập tức.
    -   Nút "Xác nhận" cuối cùng sẽ gửi các giao dịch (đã được chỉnh sửa nếu có) để lưu vào CSDL.

4.  **Triển khai Cơ chế Học hỏi từ Chỉnh sửa (Backend & Frontend):**
    -   Khi người dùng chỉnh sửa một đề xuất của AI (ví dụ: đổi danh mục từ "Ăn uống" sang "Cà phê" cho "Highlands Coffee"), hệ thống phải ghi nhận sự thay đổi này.
    -   **Backend:** Tạo một API mới (ví dụ: `POST /api/expenses/log-correction`) để ghi lại các chỉnh sửa của người dùng. Dữ liệu này sẽ được sử dụng để cải thiện các gợi ý trong tương lai (có thể tích hợp với logic của Ticket 2 hoặc Ticket 16).
    -   **Schema:** Có thể cần một bảng mới như `user_ai_corrections` (`user_id`, `input_text`, `original_suggestion`, `corrected_data`) để lưu trữ các phản hồi này.

**Ngữ cảnh Schema:**
-   Sẽ tương tác chính với `expense_transactions`, `expense_categories`, `income_categories`.
-   Có khả năng cần bảng mới `user_ai_corrections` để lưu lại các lựa chọn sửa lỗi của người dùng, nhằm mục đích cải thiện các gợi ý trong tương lai.

**Đầu ra mong đợi:**
-   Một luồng nhập liệu giao dịch chỉ bằng một bước, cực kỳ nhanh và trực quan.
-   Giảm thiểu tối đa các thao tác thủ công của người dùng.
-   Tạo ra một trải nghiệm người dùng độc đáo, thông minh và mang tính đột phá, giống như đang trò chuyện với một trợ lý tài chính.
-   Hệ thống có khả năng tự cải thiện dựa trên phản hồi của người dùng.

**Ưu tiên:** P0 - Tính năng chiến lược, thay đổi cuộc chơi, có tiềm năng định hình lại hoàn toàn sản phẩm.
