## Ticket 7: Triển khai các thử thách gamification đa dạng (Implement Diverse Gamification Challenges)

**Mục tiêu:** Mở rộng hệ thống gamification bằng cách giới thiệu các loại thử thách phong phú hơn, khuyến khích người dùng tham gia và xây dựng thói quen tài chính tích cực.

**Mô tả:**
Ticket này sẽ tập trung vào việc phát triển các loại thử thách mới ngoài các thử thách cơ bản (daily/weekly) hiện có. Các thử thách này sẽ được thiết kế để thúc đẩy các hành vi tài chính cụ thể như "không chi tiêu", "tuân thủ ngân sách", hoặc "chuỗi ngày tiết kiệm".

**Các công việc cần thực hiện:**

1.  **Định nghĩa và mở rộng các loại thử thách (Backend/Data)**:
    -   Xác định các loại thử thách mới (ví dụ: "No-Spend Day", "Budget Adherence Challenge", "Saving Streak").
    -   Cập nhật dữ liệu trong bảng `expense_challenges` để bao gồm các định nghĩa cho các thử thách mới này, sử dụng cột `requirement_description` (JSONB) để mô tả chi tiết yêu cầu.

2.  **Phát triển logic theo dõi tiến độ thử thách (Backend)**:
    -   Xây dựng hoặc mở rộng các hàm/trigger backend để theo dõi tiến độ của người dùng đối với các thử thách mới.
    -   Logic này sẽ cần truy vấn dữ liệu từ `expense_transactions`, `expense_budgets`, hoặc `expense_goals` để cập nhật `current_progress` trong bảng `user_expense_challenges`.
    -   Đảm bảo việc cập nhật tiến độ diễn ra tự động và chính xác khi người dùng thực hiện các hành động liên quan.

3.  **Tích hợp và hiển thị thử thách trong `GamificationCenter.tsx` (Frontend)**:
    -   Cập nhật `GamificationCenter.tsx` để hiển thị các thử thách mới một cách rõ ràng.
    -   Cho phép người dùng bắt đầu các thử thách này.
    -   Hiển thị tiến độ của người dùng đối với từng thử thách đang hoạt động.
    -   Thiết kế các yếu tố UI/UX phù hợp để làm nổi bật các loại thử thách khác nhau và khuyến khích người dùng tham gia.

**Ngữ cảnh Schema (supabase/migrations/011_expense_tracking_system.sql):**

Các bảng sau đây là trung tâm cho việc triển khai các thử thách gamification đa dạng:

-   **`expense_challenges`**: Bảng định nghĩa các thử thách.
    -   `name_en`, `name_vi`, `description_en`, `description_vi`: Mô tả thử thách.
    -   `challenge_type`: Có thể mở rộng các giá trị `CHECK` nếu cần các loại thử thách mới hoàn toàn khác biệt (hiện tại: 'daily', 'weekly', 'monthly', 'special').
    -   `category`: Phân loại thử thách (hiện tại: 'budgeting', 'saving', 'tracking', 'house_goal').
    -   `requirement_description` (JSONB): **Cột quan trọng nhất** cho ticket này. Nó sẽ chứa các chi tiết cụ thể về yêu cầu của thử thách (ví dụ: `{"type": "no_expense_days", "value": 7}` cho thử thách 7 ngày không chi tiêu).
    -   `target_value`: Giá trị mục tiêu của thử thách.
    -   `experience_points`, `completion_badge`: Phần thưởng khi hoàn thành.

-   **`user_expense_challenges`**: Bảng theo dõi sự tham gia và tiến độ của người dùng.
    -   `user_id`, `challenge_id`: Liên kết người dùng với thử thách.
    -   `current_progress`: Tiến độ hiện tại của người dùng đối với thử thách.
    -   `target_progress`: Mục tiêu tiến độ cần đạt được.
    -   `progress_data` (JSONB): Có thể được sử dụng để lưu trữ dữ liệu tạm thời hoặc chi tiết hơn về tiến độ của thử thách (ví dụ: ngày bắt đầu chuỗi không chi tiêu).

-   **`expense_transactions`**: Nguồn dữ liệu chính để theo dõi tiến độ của hầu hết các thử thách liên quan đến chi tiêu/thu nhập.
-   **`expense_budgets`**: Nguồn dữ liệu cho các thử thách liên quan đến tuân thủ ngân sách.
-   **`expense_goals`**: Nguồn dữ liệu cho các thử thách liên quan đến mục tiêu tiết kiệm.

**Đầu ra mong đợi:**
-   Các loại thử thách gamification mới được định nghĩa và có thể được tạo.
-   Hệ thống backend tự động theo dõi và cập nhật tiến độ của người dùng đối với các thử thách này.
-   `GamificationCenter.tsx` hiển thị các thử thách mới và tiến độ của người dùng một cách trực quan.

**Ưu tiên:** P2 - Nâng cao tính tương tác và giữ chân người dùng thông qua gamification.
