## Tổng quan Hệ thống Subscription và Phân quyền

Tài liệu này cung cấp một cái nhìn tổng quan về cách hệ thống subscription, phân quyền, và giới hạn tính năng được triển khai trong cơ sở dữ liệu của FinHome. Việc hiểu rõ các cơ chế này là rất quan trọng khi phát triển các tính năng có thu phí.

### 1. Các Khái niệm Cốt lõi

Hệ thống được xây dựng xung quanh ba khái niệm chính:

-   **Gói Thuê bao (`user_subscription_tier`):** Đây là một kiểu dữ liệu ENUM xác định các cấp độ thuê bao mà người dùng có thể có. Các cấp độ hiện tại là:
    -   `free` (Mặc định)
    -   `premium`
    -   `professional`

-   **Trạng thái Thuê bao (`subscription_status`):** Một ENUM khác để theo dõi trạng thái của một thuê bao đang hoạt động, ví dụ: `active`, `inactive`, `trialing`, `past_due`.

-   **Tích hợp Stripe:** Schema được thiết kế để tích hợp với Stripe, với các cột như `stripe_customer_id` và `stripe_subscription_id` trong bảng `subscriptions`, cho thấy rằng việc quản lý thanh toán và vòng đời thuê bao được xử lý bởi một dịch vụ bên ngoài.

### 2. Các Bảng và Cột Quan trọng (Touchpoints)

Đây là những điểm chạm chính trong CSDL mà bạn cần tương tác khi làm việc với các tính năng liên quan đến subscription.

| Bảng | Cột Quan trọng | Mục đích | Ghi chú |
| :--- | :--- | :--- | :--- |
| **`user_profiles`** | `subscription_tier` | **Điểm kiểm tra chính.** Đây là cột đầu tiên cần kiểm tra để xác định cấp độ truy cập của người dùng. | Được cập nhật (có thể thông qua webhook từ Stripe) khi trạng thái thuê bao thay đổi. |
| | `subscription_expires_at` | Theo dõi ngày hết hạn của gói thuê bao hiện tại. | |
| **`subscriptions`** | Toàn bộ bảng | Lưu trữ chi tiết thông tin thuê bao từ Stripe. | Đây là "nguồn sự thật" cho trạng thái thuê bao của người dùng. |
| **`feature_usage`** | Toàn bộ bảng | **Bảng theo dõi sử dụng.** Ghi lại số lần một người dùng đã sử dụng một tính năng có giới hạn. | Được thiết kế để theo dõi theo chu kỳ (hàng ngày, hàng tháng). |
| | `feature_key` | Một định danh duy nhất cho mỗi tính năng được theo dõi (ví dụ: `'ai_meme_comment'`). | |
| | `usage_count` | Số lần người dùng đã sử dụng tính năng trong chu kỳ hiện tại. | |
| | `period_start`, `period_end` | Xác định chu kỳ theo dõi (ví dụ: từ đầu tháng đến cuối tháng). | |
| **`ai_feature_usage`** | Toàn bộ bảng | Một bảng theo dõi chuyên dụng cho các tính năng AI, tương tự như `feature_usage`. | Việc có một bảng riêng cho thấy một sự tách biệt có chủ đích cho các tính năng AI. |

### 3. Logic và Cơ chế Thực thi

Hệ thống thực thi việc giới hạn tính năng thông qua sự kết hợp của các hàm trong CSDL (RPC) và các chính sách bảo mật ở cấp độ hàng (RLS).

#### a. Hàm RPC (Remote Procedure Call)

Đây là các hàm mà ứng dụng của bạn sẽ gọi để tương tác với hệ thống theo dõi sử dụng:

-   `get_feature_usage(user_id, feature_key)`: **Kiểm tra quyền sử dụng.** Trước khi cho phép người dùng thực hiện một hành động, hãy gọi hàm này để lấy số lần sử dụng hiện tại của họ cho `feature_key` đó.
-   `increment_feature_usage(user_id, feature_key)`: **Ghi lại việc sử dụng.** Sau khi người dùng sử dụng thành công tính năng, hãy gọi hàm này để tăng `usage_count` lên 1.

#### b. Logic Phía Ứng dụng (Application Layer)

Luồng xử lý điển hình cho một tính năng bị giới hạn trong API của bạn sẽ như sau:

1.  **Kiểm tra Gói thuê bao:** Lấy thông tin `subscription_tier` từ bảng `user_profiles` cho người dùng hiện tại.
2.  **Xác định Giới hạn:** Dựa trên `subscription_tier`, xác định giới hạn cho phép (ví dụ: gói `premium` được 50 lần/tháng).
3.  **Kiểm tra Lượt sử dụng:** Gọi hàm `get_feature_usage()` để lấy `usage_count` hiện tại.
4.  **So sánh và Quyết định:** Nếu `usage_count` < giới hạn, cho phép thực hiện hành động. Nếu không, trả về lỗi (ví dụ: `429 Too Many Requests` hoặc một mã lỗi tùy chỉnh).
5.  **Ghi nhận:** Nếu hành động thành công, gọi `increment_feature_usage()` để ghi lại lần sử dụng này.

#### c. Row-Level Security (RLS)

RLS được sử dụng rộng rãi để bảo vệ dữ liệu và thực thi các quyền ở cấp độ CSDL.

-   **Chính sách dựa trên `subscription_tier`:** Nhiều chính sách RLS sử dụng trực tiếp cột `subscription_tier` để cấp quyền. Ví dụ, hàm `is_admin()` trả về `true` nếu người dùng có gói `professional`, và hàm này được dùng trong nhiều chính sách để cấp quyền quản trị.
-   **Bảo vệ dữ liệu:** Các chính sách trên các bảng như `subscriptions`, `billing_history`, và `feature_usage` đảm bảo rằng người dùng chỉ có thể xem và sửa đổi dữ liệu của chính họ.

### 4. Áp dụng cho Tính năng "Bình luận Meme"

Để triển khai tính năng mới này, bạn cần tuân theo các mẫu đã có:

1.  **Xác định `feature_key`:** Chọn một khóa duy nhất, ví dụ: `ai_transaction_comment`.
2.  **Cập nhật Logic API:** Trong API `POST /api/expenses/analyze-transaction`:
    -   Thực hiện đầy đủ các bước kiểm tra trong mục **Logic Phía Ứng dụng** ở trên.
    -   Xác định giới hạn cho từng `subscription_tier` (ví dụ: `free`: 0, `premium`: 50, `professional`: 200).
3.  **Gọi Hàm RPC:**
    -   Sử dụng `get_feature_usage(user_id, 'ai_transaction_comment')` để kiểm tra.
    -   Sử dụng `increment_feature_usage(user_id, 'ai_transaction_comment')` để ghi nhận.
4.  **Xử lý Phản hồi trên Frontend:** Giao diện người dùng cần có khả năng xử lý các lỗi như "đã hết lượt sử dụng" và hiển thị thông báo mời nâng cấp gói.