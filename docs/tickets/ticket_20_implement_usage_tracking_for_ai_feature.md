## Ticket 20: Triển khai Hệ thống Theo dõi & Giới hạn Sử dụng cho Tính năng AI (Implement Usage Tracking & Gating for AI Feature)

**Mục tiêu:** Xây dựng cơ sở hạ tầng backend và frontend để quản lý quyền truy cập và theo dõi việc sử dụng tính năng phân tích giao dịch bằng AI (từ Ticket 19), đảm bảo tính năng này chỉ khả dụng cho các gói thuê bao phù hợp và có thể kiểm soát chi phí.

**Mô tả:**
Vì việc gọi API Gemini AI sẽ phát sinh chi phí, tính năng "bình luận meme" cần được kiểm soát chặt chẽ. Ticket này sẽ tập trung vào việc xây dựng các cơ chế cần thiết để:
1.  Cho phép người dùng bật/tắt tính năng.
2.  Giới hạn quyền truy cập dựa trên gói thuê bao của người dùng.
3.  Theo dõi số lần sử dụng để áp dụng giới hạn (ví dụ: 50 lần/tháng cho gói Premium).

**Các công việc cần thực hiện:**

1.  **Mở rộng Schema Cơ sở dữ liệu (Backend):**
    -   **Thêm vào bảng `user_profiles` (hoặc một bảng `user_settings` riêng):**
        -   `is_ai_analysis_enabled` BOOLEAN DEFAULT false: Cột để người dùng có thể tự bật/tắt tính năng.
    -   **Tạo bảng mới `ai_feature_usage`:**
        -   `id` UUID PRIMARY KEY
        -   `user_id` UUID REFERENCES user_profiles(id)
        -   `feature_name` TEXT (ví dụ: 'meme_comment')
        -   `timestamp` TIMESTAMPTZ DEFAULT NOW()
        -   Mục đích: Ghi lại mỗi lần người dùng sử dụng thành công tính năng AI.

2.  **Cập nhật Giao diện Cài đặt Người dùng (Frontend):**
    -   Trong trang cài đặt tài khoản/hồ sơ người dùng, thêm một mục "Tính năng AI".
    -   Thêm một công tắc (toggle switch) cho phép người dùng bật/tắt "Bình luận thông minh sau giao dịch".
    -   Hiển thị rõ ràng thông tin về giới hạn sử dụng dựa trên gói thuê bao của họ (ví dụ: "Bạn đã dùng 15/50 lần trong tháng này").

3.  **Cập nhật Logic API (Backend):**
    -   Trong API `POST /api/expenses/analyze-transaction` (từ Ticket 19), trước khi gọi đến Gemini AI, phải thực hiện các bước kiểm tra sau:
        1.  **Kiểm tra Cài đặt Người dùng:** Đọc `is_ai_analysis_enabled` từ `user_profiles`. Nếu `false`, không thực hiện.
        2.  **Kiểm tra Quyền truy cập (Gating):** Đọc `subscription_tier` của người dùng. Nếu gói thuê bao không hỗ trợ tính năng này, trả về lỗi.
        3.  **Kiểm tra Giới hạn Sử dụng (Rate Limiting):**
            -   Đếm số lượng bản ghi trong `ai_feature_usage` cho `user_id` trong tháng hiện tại.
            -   So sánh với giới hạn của gói thuê bao. Nếu vượt quá, trả về lỗi "Đã đạt giới hạn sử dụng".
        4.  **Ghi lại việc sử dụng:** Nếu tất cả các bước kiểm tra đều qua, sau khi gọi AI thành công, chèn một bản ghi mới vào `ai_feature_usage`.

**Ngữ cảnh Schema:**
-   **`user_profiles`**: Cần thêm cột `is_ai_analysis_enabled`.
-   **`ai_feature_usage`**: Bảng mới cần được tạo để theo dõi việc sử dụng.
-   **`subscriptions`**: Bảng hiện có sẽ được dùng để kiểm tra `subscription_tier`.

**Đầu ra mong đợi:**
-   Người dùng có toàn quyền kiểm soát việc bật/tắt tính năng AI.
-   Hệ thống backend có khả năng giới hạn quyền truy cập và số lần sử dụng một cách an toàn.
-   Cơ sở hạ tầng hoàn chỉnh để hỗ trợ một tính năng AI có thu phí, có thể mở rộng trong tương lai.
-   Chi phí API của bên thứ ba được kiểm soát hiệu quả.

**Ưu tiên:** P1 - Bắt buộc phải có để triển khai tính năng AI một cách bền vững và có kiểm soát.
