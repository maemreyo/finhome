## Ticket 15: Nâng cao "Hành trình An cư" & Tích hợp sâu với Gamification (Enhanced "Home Ownership Journey" & Deep Gamification Integration)

**Mục tiêu:** Phát triển đầy đủ tính năng "Hành trình An cư", tích hợp sâu với các cột mốc gamification và cung cấp hướng dẫn cá nhân hóa ở mỗi giai đoạn, củng cố kênh chuyển đổi chiến lược sang hoạch định bất động sản.

**Mô tả:**
Ticket này sẽ xây dựng dựa trên chức năng mục tiêu mua nhà hiện có và hệ thống gamification để tạo ra một "Hành trình An cư" có cấu trúc và hấp dẫn hơn cho người dùng. Nó sẽ bao gồm việc xác định các giai đoạn rõ ràng, liên kết tiến độ với các thành tích cụ thể và cung cấp lời khuyên hoặc lời kêu gọi hành động được cá nhân hóa khi người dùng tiến bộ trong hành trình tiết kiệm để mua nhà.

**Các công việc cần thực hiện:**

1.  **Xác định và tinh chỉnh các giai đoạn hành trình (Backend/Data):**
    -   Xem xét và chính thức hóa các giá trị `funnel_stage` trong `expense_goals` (ví dụ: 'initial', 'researching', 'ready_to_view', 'qualified_lead').
    -   Đảm bảo trigger `check_house_purchase_funnel` cập nhật chính xác các giai đoạn này dựa trên `progress_percentage` và các tiêu chí liên quan khác.
    -   Xác định các tiêu chí cụ thể để chuyển đổi giữa các giai đoạn (ví dụ: tiết kiệm được X% tiền đặt cọc, hoàn thành Y nhiệm vụ nghiên cứu).

2.  **Tích hợp với Gamification (Backend & Frontend):**
    -   Liên kết các giai đoạn cụ thể của "Hành trình An cư" với các `expense_achievements` hiện có hoặc mới (ví dụ: "Foundation Builder", "Dream Home Saver").
    -   Đảm bảo việc mở khóa các thành tích này kích hoạt các thông báo và điểm kinh nghiệm phù hợp.
    -   Cân nhắc tạo các `expense_challenges` cụ thể liên quan đến mục tiêu mua nhà (ví dụ: "Tiết kiệm X VND cho tiền đặt cọc trong tháng này").

3.  **Phát triển hướng dẫn và lời kêu gọi hành động được cá nhân hóa (Frontend & Backend):**
    -   Đối với mỗi giai đoạn của "Hành trình An cư", xác định và cung cấp các lời khuyên, mẹo hoặc các bước tiếp theo cụ thể cho người dùng.
    -   Lời khuyên này có thể được hiển thị trong `GoalManager.tsx` (đối với mục tiêu mua nhà) hoặc `GamificationCenter.tsx`.
    -   Triển khai các lời kêu gọi hành động hướng người dùng đến ứng dụng hoạch định bất động sản (ví dụ: "Khám phá các bất động sản phù hợp với ngân sách của bạn", "Kết nối với chuyên gia tư vấn bất động sản"). Điều này sẽ tận dụng các trường `triggers_funnel_action` và `funnel_action_data` trong `expense_achievements`.

4.  **Trực quan hóa hành trình (Frontend):**
    -   Tạo một biểu diễn trực quan của "Hành trình An cư" trong `GoalManager.tsx` hoặc một phần dành riêng, hiển thị giai đoạn hiện tại của người dùng và các cột mốc sắp tới.
    -   Sử dụng thanh tiến độ, biểu tượng và nhãn rõ ràng để làm cho hành trình trở nên hấp dẫn.

**Ngữ cảnh Schema (supabase/migrations/011_expense_tracking_system.sql):**

Một số bảng rất quan trọng để triển khai tính năng này:

-   **`expense_goals`**: Bảng cốt lõi cho các mục tiêu tiết kiệm, đặc biệt là mục tiêu mua nhà.
    -   `goal_type`: Sẽ là 'buy_house'.
    -   `target_amount`, `current_amount`, `progress_percentage`: Cần thiết để theo dõi tiến độ và kích hoạt thay đổi giai đoạn.
    -   `house_purchase_data` (JSONB): Có thể lưu trữ các chi tiết bổ sung liên quan đến hành trình (ví dụ: sở thích của người dùng về bất động sản, tiến độ nghiên cứu).
    -   `funnel_stage` TEXT: Cột chính để theo dõi giai đoạn hiện tại của người dùng trong hành trình.
    -   `last_funnel_interaction` TIMESTAMPTZ: Hữu ích để theo dõi mức độ tương tác với kênh.

-   **`expense_achievements`**: Định nghĩa các thành tích được liên kết với các cột mốc của hành trình.
    -   `category`: 'house_purchase' đã được định nghĩa.
    -   `requirement_type`, `requirement_value`: Xác định những gì cần đạt được để mở khóa thành tích.
    -   `triggers_funnel_action` BOOLEAN: Cờ để chỉ ra liệu việc mở khóa thành tích này có nên kích hoạt một hành động kênh hay không.
    -   `funnel_action_data` JSONB: Lưu trữ dữ liệu cho hành động được kích hoạt (ví dụ: tin nhắn, URL hành động đến ứng dụng bất động sản).

-   **`user_expense_achievements`**: Theo dõi tiến độ và các thành tích đã mở khóa của người dùng.

-   **`expense_challenges`**: Có thể được sử dụng để tạo các thử thách cụ thể liên quan đến hành trình mua nhà (ví dụ: tiết kiệm một số tiền nhất định cho tiền đặt cọc trong một tháng).

-   **`notifications`**: Được sử dụng bởi trigger `check_house_purchase_funnel` để thông báo cho người dùng về các thành tích cột mốc và hướng dẫn họ đến các bước tiếp theo.

**Đầu ra mong đợi:**
-   Một "Hành trình An cư" được xác định rõ ràng và trực quan trong ứng dụng.
-   Tiến trình tự động qua các giai đoạn hành trình dựa trên khoản tiết kiệm và hành động của người dùng.
-   Lời khuyên, mẹo và lời kêu gọi hành động được cá nhân hóa được gửi đến người dùng ở mỗi giai đoạn.
-   Tích hợp liền mạch với hệ thống gamification hiện có (thành tích, thử thách).

**Ưu tiên:** P1 - Tính năng chiến lược để chuyển đổi người dùng sang hoạch định bất động sản, nâng cao giá trị cốt lõi.
