## Ticket 18: Tái cấu trúc và Hợp nhất Form Nhập liệu Giao dịch (Refactor & Unify Transaction Entry Form)

**Mục tiêu:** Loại bỏ sự phức tạp của việc duy trì ba form nhập liệu riêng biệt (`QuickTransactionForm`, `EnhancedQuickTransactionForm`, `IntelligentTransactionForm`) bằng cách hợp nhất chúng thành một component duy nhất, mạnh mẽ và thông minh có tên `UnifiedTransactionForm.tsx`.

**Mô tả:**
Hiện tại, `ExpenseTrackingDashboard.tsx` cho phép người dùng chuyển đổi giữa ba chế độ form, gây ra sự trùng lặp code và làm tăng độ phức tạp khi bảo trì. Ticket này sẽ tập trung vào việc tái cấu trúc lớn, hợp nhất những ưu điểm tốt nhất của cả ba form vào một component duy nhất. Form mới sẽ cung cấp một luồng nhập liệu nhanh chóng làm mặc định, đồng thời tích hợp liền mạch các tính năng thông minh như gợi ý và OCR khi cần thiết.

**Các công việc cần thực hiện:**

1.  **Tạo Component `UnifiedTransactionForm.tsx` (Frontend):**
    -   Xây dựng một component mới `UnifiedTransactionForm.tsx` sẽ thay thế hoàn toàn ba form cũ.
    -   **Hợp nhất các tính năng cốt lõi:**
        -   **Luồng nhập liệu nhanh (Quick Entry Flow):** Kế thừa từ `QuickTransactionForm`, đảm bảo giao diện gọn gàng, tối ưu cho việc nhập liệu nhanh với các phím tắt.
        -   **Gắn thẻ linh hoạt (Flexible Tagging):** Tích hợp hệ thống thêm/tạo/quản lý nhiều thẻ (tags) từ Ticket 1.
        -   **Đính kèm hóa đơn & OCR:** Tích hợp component tải ảnh và tự động gọi API OCR (`/api/expenses/receipt-ocr`) để điền dữ liệu tự động khi có ảnh được tải lên (từ Ticket 3 & 12).
        -   **Gợi ý thông minh (Intelligent Suggestions):** Tích hợp hook `useIntelligentSuggestions` để cung cấp gợi ý tự động cho danh mục, mô tả, và số tiền dựa trên lịch sử người dùng khi họ bắt đầu nhập liệu (từ Ticket 2).

2.  **Cập nhật `ExpenseTrackingDashboard.tsx` (Frontend):**
    -   Gỡ bỏ hoàn toàn logic chuyển đổi form (`formMode`, `setShowFormSelector`).
    -   Thay thế khu vực form bằng cách render duy nhất component `UnifiedTransactionForm.tsx`.

3.  **Dọn dẹp Code (Deprecation):**
    -   Xóa các file component không còn được sử dụng:
        -   `src/components/expenses/QuickTransactionForm.tsx`
        -   `src/components/expenses/EnhancedQuickTransactionForm.tsx`
        -   `src/components/expenses/IntelligentTransactionForm.tsx`
    -   Kiểm tra và gỡ bỏ các import hoặc tham chiếu còn sót lại đến các component này trong toàn bộ dự án.

**Ngữ cảnh Schema:**
-   Không yêu cầu thay đổi schema. Ticket này chủ yếu là một cuộc tái cấu trúc lớn ở tầng frontend. Nó sẽ tiếp tục sử dụng các schema hiện có cho `expense_transactions`, `expense_categories`, v.v.

**Đầu ra mong đợi:**
-   Một component `UnifiedTransactionForm.tsx` duy nhất, kết hợp các tính năng tốt nhất của các form cũ.
-   Trải nghiệm người dùng liền mạch hơn, không cần phải chuyển đổi giữa các chế độ.
-   Codebase được đơn giản hóa, dễ bảo trì và mở rộng hơn.
-   Loại bỏ hoàn toàn các component form đã lỗi thời.

**Ưu tiên:** P0 - Tái cấu trúc cốt lõi, cải thiện chất lượng code và đơn giản hóa trải nghiệm người dùng.
