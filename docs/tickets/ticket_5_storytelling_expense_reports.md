## Ticket 5: Triển khai báo cáo chi tiêu "kể chuyện" (Storytelling Expense Reports)

**Mục tiêu:** Chuyển đổi dữ liệu chi tiêu thô thành những insight dễ hiểu và có ý nghĩa, giúp người dùng thực sự "hiểu" về dòng tiền của mình.

**Mô tả:**
Ticket này sẽ phát triển một phần báo cáo mới trong `ExpenseAnalytics.tsx` hoặc một trang báo cáo riêng, nơi dữ liệu chi tiêu không chỉ được hiển thị dưới dạng biểu đồ mà còn được phân tích và trình bày dưới dạng văn bản "kể chuyện". Các báo cáo này sẽ chỉ ra các xu hướng, điểm bất thường, và đưa ra nhận xét cá nhân hóa.

**Các công việc cần thực hiện:**

1.  **Phát triển logic phân tích dữ liệu (Backend/Service)**:
    -   Xây dựng một service hoặc API mới (ví dụ: `/api/expenses/reports/storytelling`) để tổng hợp và phân tích dữ liệu từ `expense_transactions`.
    -   Logic này sẽ xác định:
        -   **Xu hướng chi tiêu**: So sánh chi tiêu hiện tại với các giai đoạn trước (tháng trước, quý trước, trung bình).
        -   **Điểm bất thường**: Phát hiện các giao dịch lớn bất thường hoặc các danh mục có sự tăng/giảm đột biến.
        -   **Insight cá nhân hóa**: Ví dụ: "Tháng này, bạn đã chi cho việc đi lại nhiều hơn 15% so với trung bình 3 tháng trước. Có phải giá xăng đã tăng không?" hoặc "Chi tiêu cho ăn uống của bạn đã giảm 10% sau khi bạn bắt đầu nấu ăn tại nhà nhiều hơn."
    -   Có thể sử dụng các cột như `amount`, `transaction_date`, `expense_category_id`, `merchant_name`.

2.  **Hiển thị báo cáo "kể chuyện" (Frontend)**:
    -   Tạo một component mới hoặc mở rộng `ExpenseAnalytics.tsx` để hiển thị các insight này dưới dạng văn bản dễ đọc.
    -   Sử dụng các biểu tượng và màu sắc phù hợp để làm nổi bật các điểm quan trọng (ví dụ: màu đỏ cho chi tiêu tăng đột biến, màu xanh cho tiết kiệm).
    -   Đảm bảo báo cáo có thể được lọc theo thời gian (tương tự như `ExpenseAnalytics.tsx`).

**Ngữ cảnh Schema (supabase/migrations/011_expense_tracking_system.sql):**

Để triển khai tính năng này, bảng `expense_transactions` và các bảng liên quan là nguồn dữ liệu chính:

-   **`expense_transactions`**: Chứa tất cả dữ liệu giao dịch cần thiết cho việc phân tích.
    -   `amount`: Để tính toán tổng chi tiêu, mức tăng/giảm.
    -   `transaction_date`: Để phân tích theo thời gian và so sánh các giai đoạn.
    -   `expense_category_id`: Để phân tích chi tiêu theo danh mục.
    -   `merchant_name`: Có thể dùng để nhận diện các giao dịch lặp lại hoặc các điểm chi tiêu cụ thể.
    -   `user_id`: Để đảm bảo phân tích dữ liệu cá nhân hóa cho từng người dùng.

-   **`expense_categories`**: Cần thiết để hiển thị tên danh mục trong các báo cáo.

-   **`expense_analytics_monthly`**: Bảng này hiện đang lưu trữ các phân tích tổng hợp hàng tháng. Có thể xem xét việc sử dụng hoặc mở rộng bảng này để lưu trữ các insight đã được tính toán trước, hoặc chỉ đơn thuần là một nguồn dữ liệu tổng hợp để backend service truy vấn nhanh hơn.

**Đầu ra mong đợi:**
-   Một phần báo cáo mới hiển thị các insight chi tiêu dưới dạng văn bản "kể chuyện".
-   Các insight được tạo ra dựa trên phân tích dữ liệu giao dịch của người dùng.
-   Báo cáo có thể được lọc theo các khoảng thời gian khác nhau.

**Ưu tiên:** P2 - Cải thiện giá trị phân tích, xây dựng trên dữ liệu giao dịch hiện có.


<!-- =========================================== -->

⏺ ✅ Ticket 5 Implementation Complete!

  Your Storytelling Expense Reports feature has been successfully implemented with all requirements fulfilled:

  🎯 What's Been Delivered:

  Backend Services:
  - ✅ /api/expenses/reports/storytelling API with GET/POST endpoints
  - ✅ Smart analysis service generating 6 types of insights:
    - Spending trends - Compare current vs previous periods
    - Category comparisons - Detect significant category changes
    - Anomaly detection - Find unusual large transactions
    - Spending habits - Identify frequent merchants/patterns
    - Milestones - Celebrate savings achievements
    - Recommendations - Personalized suggestions (like cooking at home more)

  Frontend Experience:
  - ✅ New "Báo cáo thông minh" tab in ExpenseAnalytics component
  - ✅ Rich storytelling interface with icons, colors, and narrative text
  - ✅ Period filtering (7d, 30d, 3m, 6m, 1y)
  - ✅ Insight type filtering (trends, comparisons, anomalies, etc.)

  Key Features:
  - ✅ Personalized Vietnamese narratives like "Chi tiêu cho ăn uống của bạn đã giảm 10% sau khi bạn bắt đầu nấu ăn tại nhà 
  nhiều hơn"
  - ✅ Visual severity indicators (positive/green, warning/yellow, negative/red)
  - ✅ Smart category-specific insights and recommendations
  - ✅ Real-time data analysis with comparison logic

  The implementation transforms raw expense data into meaningful, contextual stories that help users truly understand their
  spending patterns and financial habits! 🚀