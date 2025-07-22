## Ticket 6: Triển khai ví chung được tối ưu (Optimized Shared Wallets)

**Mục tiêu:** Triển khai một hệ thống ví chung mạnh mẽ và được tối ưu, cho phép nhiều người dùng cùng quản lý ngân sách chung và theo dõi chi tiêu chung.

**Mô tả:**
Ticket này sẽ tập trung vào việc nâng cao chức năng ví chung hiện có để cho phép các thành viên không chỉ theo dõi giao dịch mà còn cùng nhau thiết lập và giám sát một ngân sách chung. Đây là một tính năng quan trọng cho các cặp đôi và gia đình trẻ.

**Các công việc cần thực hiện:**

1.  **Nâng cao tính năng ngân sách ví chung (Backend & Frontend):**
    -   Cho phép chủ sở hữu/quản trị viên ví chung tạo ngân sách cho ví chung.
    -   Tích hợp ngân sách chung này với các giao dịch của ví chung.
    -   Hiển thị tiến độ ngân sách chung trong giao diện ví chung.
    -   **Quyết định Schema**: Để quản lý ngân sách chung, chúng ta sẽ tạo các bảng mới để tách biệt rõ ràng với ngân sách cá nhân. Điều này giúp tránh phức tạp hóa logic hiện có và cho phép các tính năng cụ thể của ngân sách chung trong tương lai.
        -   `shared_budgets`: Bảng mới để lưu trữ thông tin ngân sách chung (tương tự `expense_budgets` nhưng có thêm `shared_wallet_id`).
        -   `shared_budget_categories`: Bảng mới để lưu trữ phân bổ ngân sách theo danh mục cho ví chung (tương tự `budget_categories` nhưng liên kết với `shared_budgets`).

2.  **Tinh chỉnh quyền hạn ví chung:**
    -   Xem xét và đảm bảo các vai trò (`owner`, `admin`, `member`, `viewer`) và quyền hạn (`can_add_transactions`, `can_edit_transactions`, `can_delete_transactions`, `can_manage_budget`) trong bảng `shared_wallet_members` được sử dụng và thực thi đầy đủ.
    -   Triển khai các yếu tố UI để quản lý các quyền hạn này.

3.  **Cải thiện UI/UX ví chung:**
    -   Thiết kế và triển khai một giao diện riêng cho ví chung, khác biệt với ví cá nhân, hiển thị rõ ràng tiến độ ngân sách chung, các giao dịch chung gần đây và hoạt động của các thành viên.
    -   Đảm bảo trải nghiệm mượt mà khi thêm giao dịch vào ví chung.

**Ngữ cảnh Schema (supabase/migrations/011_expense_tracking_system.sql):**

Các bảng sau đây liên quan trực tiếp đến việc triển khai ví chung được tối ưu:

-   **`shared_expense_wallets`**: Bảng chính cho ví chung.
    -   `name`, `description`, `wallet_type`, `balance`, `currency`, `icon`, `color`: Chi tiết cơ bản của ví.
    -   `owner_id`: Xác định chủ sở hữu ví chung.
    -   `require_approval_for_expenses`, `expense_approval_threshold`: Các trường hiện có có thể được tận dụng cho việc kiểm soát chi tiêu/ngân sách chung nâng cao hơn.

-   **`shared_wallet_members`**: Quản lý các thành viên và vai trò/quyền hạn của họ trong ví chung.
    -   `shared_wallet_id`, `user_id`: Liên kết các thành viên với ví chung.
    -   `role`: Xác định vai trò của thành viên (`owner`, `admin`, `member`, `viewer`).
    -   `can_add_transactions`, `can_edit_transactions`, `can_delete_transactions`, `can_manage_budget`: Các cờ quyền hạn hiện có cần được sử dụng và thực thi đầy đủ trong logic ứng dụng.

-   **`shared_wallet_transactions`**: Lưu trữ các giao dịch được thực hiện trong ví chung.
    -   `shared_wallet_id`, `user_id`: Liên kết các giao dịch với ví chung và người dùng đã thực hiện giao dịch.
    -   `transaction_type`, `amount`, `description`, `notes`, `expense_category_id`, `income_category_id`, `transaction_date`, `receipt_images`: Chi tiết giao dịch.
    -   `requires_approval`, `is_approved`, `approved_by`, `approved_at`: Các trường hiện có cho hệ thống phê duyệt, rất phù hợp cho ngân sách chung.

-   **Bảng mới đề xuất cho ngân sách chung:**
    -   **`shared_budgets`**: (Tạo mới) Sẽ chứa các ngân sách được thiết lập cho ví chung. Cần có các cột như `id`, `shared_wallet_id` (REFERENCES `shared_expense_wallets`), `name`, `description`, `budget_period`, `start_date`, `end_date`, `total_budget`, `total_spent`, `alert_threshold_percentage`, `is_active`, `created_at`, `updated_at`.
    -   **`shared_budget_categories`**: (Tạo mới) Sẽ chứa phân bổ ngân sách theo danh mục cho các ngân sách chung. Cần có các cột như `id`, `shared_budget_id` (REFERENCES `shared_budgets`), `category_id` (REFERENCES `expense_categories`), `allocated_amount`, `spent_amount`, `created_at`, `updated_at`.

**Đầu ra mong đợi:**
-   Người dùng có thể tạo và quản lý ví chung với các vai trò và quyền hạn được xác định.
-   Các thành viên ví chung có thể cùng nhau thiết lập và theo dõi ngân sách cho ví chung.
-   Các giao dịch trong ví chung được liên kết rõ ràng và đóng góp vào ngân sách chung.
-   Giao diện người dùng cho ví chung trực quan và khác biệt.

**Ưu tiên:** P1 - Yếu tố thúc đẩy tăng trưởng chính, nâng cao khả năng quản lý tài chính hợp tác.


<!-- ============================= -->

⏺ ✅ Ticket 6 Implementation Complete!

  Your Optimized Shared Wallets feature has been successfully implemented with all requirements fulfilled:

  🎯 What's Been Delivered:

  Database Layer:
  - ✅ New migration 013_shared_budgets_system.sql with comprehensive shared budget tables
  - ✅ shared_budgets table with budget periods, alerts, and tracking
  - ✅ shared_budget_categories table for category-based budget allocation
  - ✅ shared_budget_activities table for audit trail
  - ✅ Advanced triggers for automatic spending calculation and budget updates
  - ✅ Row Level Security policies for secure multi-user access
  - ✅ Utility functions for budget summaries and spending tracking

  Backend APIs:
  - ✅ /api/shared-wallets - CRUD operations for shared wallets
  - ✅ /api/shared-wallets/[id] - Individual wallet management
  - ✅ /api/shared-wallets/[id]/members - Member invitation and management
  - ✅ /api/shared-wallets/[id]/budgets - Shared budget creation and tracking
  - ✅ Comprehensive permission system with role-based access control
  - ✅ Advanced validation with Zod schemas
  - ✅ Proper error handling and security checks

  Frontend Components:
  - ✅ SharedWalletManager - Main dashboard with wallet overview
  - ✅ CreateSharedWalletForm - Comprehensive wallet creation form
  - ✅ SharedWalletDetails - Detailed wallet view with tabs (overview, transactions, budgets, members)
  - ✅ InviteMemberForm - Advanced member invitation with role-based permissions
  - ✅ Rich UI with progress indicators, budget summaries, and member management
  - ✅ Responsive design with proper loading states and error handling

  Enhanced Permission System:
  - ✅ Four distinct roles: Owner, Admin, Member, Viewer
  - ✅ Granular permissions: can_add_transactions, can_edit_transactions, can_delete_transactions, can_manage_budget
  - ✅ Role-based UI with appropriate access controls
  - ✅ Visual role indicators with icons and badges
  - ✅ Approval workflow for expense transactions

  Key Features:
  - ✅ Shared Budget Management: Create budgets with category allocations, progress tracking, and alert thresholds
  - ✅ Member Management: Invite users with custom roles and permissions
  - ✅ Real-time Budget Updates: Automatic spending calculation from transactions
  - ✅ Visual Dashboard: Rich UI showing wallet balance, budget progress, member count, and recent activity
  - ✅ Audit Trail: Complete activity logging for budget changes and member actions
  - ✅ Responsive Design: Mobile-friendly interface with proper accessibility

  The implementation provides a robust foundation for collaborative financial management, enabling families and groups to
  effectively manage shared expenses and budgets together! 🚀

  Architecture Highlights:
  - Clean separation between individual and shared wallet systems
  - Sophisticated permission matrix with role hierarchies
  - Automatic budget recalculation via database triggers
  - Comprehensive error handling and validation
  - Scalable component architecture for future enhancements