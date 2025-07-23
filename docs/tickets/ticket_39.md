## Ticket 39: Đảm bảo Toàn vẹn Dữ liệu cho Giao dịch Đa bước (Ensure Data Integrity for Multi-Step Transactions)

**Mục tiêu:** Đảm bảo các giao dịch phức tạp được AI phân tích (đặc biệt là các lệnh chuyển tiền giữa các ví) được thực thi một cách nguyên tử (atomic). Điều này có nghĩa là tất cả các bước của giao dịch phải cùng thành công, hoặc cùng thất bại, ngăn chặn tuyệt đối mọi khả năng gây ra xung đột hay sai lệch dữ liệu.

**Mô tả:**
AI có khả năng diễn giải các lệnh phức tạp như `"rút 1 triệu từ Techcombank chuyển vào ví Momo"`. Lệnh này tương ứng với hai hoạt động cơ sở dữ liệu riêng biệt: một giao dịch "chi" từ ví "Techcombank" và một giao dịch "thu" vào "Ví Momo". Nếu giao dịch chi thành công nhưng giao dịch thu thất bại (do lỗi mạng, bug, hoặc bất kỳ lý do nào khác), 1 triệu của người dùng sẽ "bốc hơi" khỏi sổ sách, dẫn đến mất mát toàn vẹn dữ liệu và phá hủy hoàn toàn lòng tin của người dùng.

**Các công việc cần thực hiện:**

1.  **Sử dụng Giao dịch Cơ sở dữ liệu (Database Transactions) (Backend):**
    -   **Nhiệm vụ:** Đây là giải pháp cốt lõi. Tất cả các hoạt động ghi vào cơ sở dữ liệu phát sinh từ một yêu cầu duy nhất của người dùng phải được gói trong một "giao dịch cơ sở dữ liệu" (database transaction).
    -   **Logic:** Backend sẽ phân tích kết quả từ AI, xác định các giao dịch đa bước, và thực thi các lệnh `INSERT`/`UPDATE` tương ứng bên trong một khối lệnh `BEGIN TRANSACTION`...`COMMIT`. Nếu bất kỳ một lệnh nào trong khối này thất bại, toàn bộ giao dịch sẽ được `ROLLBACK` (quay lui), đưa cơ sở dữ liệu trở về trạng thái nguyên vẹn như trước khi thực hiện.

2.  **Xây dựng API Xử lý Giao dịch theo Lô (Batch Processing) (Backend):**
    -   **Nhiệm vụ:** Nâng cấp hoặc tạo một API endpoint mới (ví dụ: `POST /api/transactions/batch`) có khả năng nhận một mảng các giao dịch đã được phân tích.
    -   **Logic:** Endpoint này sẽ chịu trách nhiệm gói toàn bộ các hoạt động cho lô giao dịch đó vào trong một database transaction duy nhất.

3.  **Thiết kế Phản hồi API Rõ ràng (Backend):**
    -   **Nhiệm vụ:** API xử lý theo lô phải trả về một trạng thái thành công hoặc thất bại rõ ràng cho toàn bộ lô.
    -   **Logic:** Nếu thất bại, API phải cung cấp một thông báo lỗi cụ thể và hữu ích, ví dụ: "Không đủ số dư trong ví Techcombank để thực hiện giao dịch."

4.  **Xử lý Phản hồi Chính xác ở Giao diện (Frontend):**
    -   **Nhiệm vụ:** Giao diện phải xử lý được phản hồi từ API theo lô.
    -   **Logic:** Nếu toàn bộ lô thành công, hiển thị thông báo thành công. Nếu thất bại, phải hiển thị chính xác thông báo lỗi từ API và **không** được cập nhật giao diện như thể giao dịch đã thành công. Dữ liệu người dùng đã nhập phải được giữ lại để họ có thể sửa lỗi và thử lại.

**Ngữ cảnh Schema:**
-   Tác động trực tiếp đến logic nghiệp vụ khi tương tác với các bảng `expense_transactions`, `wallets`, `income_transactions`.
-   Không thay đổi cấu trúc của các bảng, nhưng định hình cách thức tạo và cập nhật các bản ghi một cách an toàn.

**Đầu ra mong đợi:**
-   Toàn vẹn dữ liệu tuyệt đối cho tất cả các loại giao dịch.
-   Loại bỏ hoàn toàn rủi ro phát sinh từ việc giao dịch chỉ thành công một phần.
-   Một backend vững chắc, có khả năng xử lý các hoạt động nguyên tử.
-   Giao diện người dùng cung cấp phản hồi chính xác và đáng tin cậy về trạng thái của giao dịch.

**Ưu tiên:** P0 - Cực kỳ quan trọng. Toàn vẹn dữ liệu là điều không thể thỏa hiệp đối với một ứng dụng tài chính. Phải được triển khai và kiểm thử kỹ lưỡng trước khi bất kỳ tính năng nào liên quan đến giao dịch đa bước được phát hành.