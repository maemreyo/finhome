## Ticket 8: Nâng cao công cụ mục tiêu tiết kiệm & Gợi ý hành động (Enhanced Savings Goal Tool & Actionable Advice)

**Mục tiêu:** Biến công cụ mục tiêu tiết kiệm thành một người cố vấn tài chính cá nhân, không chỉ theo dõi tiến độ mà còn đưa ra các gợi ý cụ thể để đạt được mục tiêu.

**Mô tả:**
Hiện tại, `GoalManager.tsx` đã cho phép tạo và theo dõi mục tiêu. Ticket này sẽ mở rộng chức năng đó để tính toán số tiền cần tiết kiệm hàng tháng và, quan trọng hơn, gợi ý các điều chỉnh chi tiêu dựa trên dữ liệu hiện có của người dùng để giúp họ đạt được mục tiêu đó. Điều này đặc biệt quan trọng cho mục tiêu mua nhà.

**Các công việc cần thực hiện:**

1.  **Tính toán và hiển thị số tiền tiết kiệm hàng tháng cần thiết (Frontend & Backend):**
    -   Trong `GoalManager.tsx`, khi người dùng tạo hoặc xem mục tiêu, tính toán `required_monthly_savings` dựa trên `target_amount`, `current_amount`, và `target_date` (hoặc `deadline`).
    -   Hiển thị rõ ràng số tiền này cho người dùng.
    -   Backend API (`/api/expenses/goals`) cần hỗ trợ trả về hoặc tính toán trường này.

2.  **Phân tích và gợi ý điều chỉnh chi tiêu (Backend Logic):**
    -   Phát triển logic backend để phân tích chi tiêu hiện tại của người dùng (từ `expense_transactions`) và so sánh với các mục tiêu tiết kiệm.
    -   Xác định các danh mục chi tiêu có thể cắt giảm (ví dụ: giải trí, mua sắm không thiết yếu) để đạt được `required_monthly_savings`.
    -   Logic này có thể dựa trên các ngưỡng chi tiêu trung bình của người dùng hoặc các quy tắc tài chính (ví dụ: chi tiêu cho mong muốn không nên vượt quá 30%).
    -   Backend API cần có một endpoint mới hoặc mở rộng để cung cấp các gợi ý này.

3.  **Hiển thị gợi ý hành động trong `GoalManager.tsx` (Frontend):**
    -   Tạo một phần UI mới trong `GoalManager.tsx` để hiển thị các gợi ý điều chỉnh chi tiêu một cách thân thiện và dễ hiểu.
    -   Ví dụ: "Để đạt mục tiêu mua nhà, bạn có thể cân nhắc giảm chi tiêu cho 'Giải trí' thêm X VND mỗi tháng."
    -   Đảm bảo các gợi ý này được cá nhân hóa và có thể hành động được.

4.  **Tích hợp sâu hơn với "Hành trình An cư" (House Purchase Funnel):**
    -   Khi người dùng đạt các mốc tiến độ trong mục tiêu mua nhà (đã được trigger bởi `check_house_purchase_funnel` trigger), các gợi ý này có thể được làm nổi bật hơn hoặc liên kết trực tiếp với các bước tiếp theo trong hành trình mua nhà.

**Ngữ cảnh Schema (supabase/migrations/011_expense_tracking_system.sql):**

Các bảng sau đây là quan trọng cho Ticket này:

-   **`expense_goals`**: Bảng chính cho mục tiêu tiết kiệm.
    -   `target_amount`, `current_amount`, `target_date`, `deadline`: Các cột này sẽ được sử dụng để tính toán số tiền cần tiết kiệm hàng tháng.
    -   `monthly_target`: Có thể được sử dụng để so sánh với `required_monthly_savings` để xác định liệu người dùng có đang đi đúng hướng hay không.
    -   `house_purchase_data`, `funnel_stage`: Quan trọng cho việc tích hợp sâu hơn với hành trình mua nhà và đưa ra các gợi ý phù hợp với từng giai đoạn.

-   **`expense_transactions`**: Nguồn dữ liệu chính để phân tích thói quen chi tiêu và đưa ra gợi ý cắt giảm.
    -   `amount`, `transaction_date`, `expense_category_id`: Dữ liệu chi tiết về các giao dịch.

-   **`expense_categories`**: Cần thiết để hiển thị tên danh mục trong các gợi ý.

-   **`expense_analytics_monthly`**: Có thể được sử dụng để lấy dữ liệu tổng hợp về chi tiêu theo danh mục, giúp việc phân tích nhanh hơn.

**Đầu ra mong đợi:**
-   `GoalManager.tsx` hiển thị số tiền tiết kiệm hàng tháng cần thiết cho mỗi mục tiêu.
-   Hệ thống cung cấp các gợi ý cá nhân hóa về cách điều chỉnh chi tiêu để đạt được mục tiêu.
-   Tích hợp chặt chẽ hơn giữa mục tiêu tiết kiệm và hành trình mua nhà.

**Ưu tiên:** P1 - Nâng cao giá trị cốt lõi của ứng dụng trong việc giúp người dùng đạt được mục tiêu tài chính lớn.
