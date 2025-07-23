## Ticket 13: Triển khai giao dịch định kỳ (Implement Recurring Transactions)

**Mục tiêu:** Tự động hóa việc ghi chép các khoản thu nhập và chi tiêu lặp lại, giúp người dùng tiết kiệm thời gian và đảm bảo tính chính xác của dữ liệu tài chính.

**Mô tả:**
Ticket này sẽ cho phép người dùng thiết lập các giao dịch (thu nhập, chi tiêu, chuyển khoản) xảy ra định kỳ (hàng ngày, hàng tuần, hàng tháng, hàng năm). Hệ thống sẽ tự động tạo các giao dịch này vào ngày đến hạn, giảm bớt gánh nặng nhập liệu thủ công cho người dùng.

**Các công việc cần thực hiện:**

1.  **Giao diện quản lý giao dịch định kỳ (Frontend)**:
    - Tạo một trang hoặc phần riêng biệt để người dùng có thể tạo, xem, chỉnh sửa và xóa các mẫu giao dịch định kỳ.
    - Form tạo giao dịch định kỳ sẽ bao gồm các trường: `name`, `transaction_type`, `amount`, `description`, `wallet_id`, `expense_category_id`/`income_category_id` (tùy loại), `transfer_to_wallet_id` (nếu là chuyển khoản), `frequency`, `frequency_interval`, `start_date`, `end_date` (tùy chọn), `max_occurrences` (tùy chọn).

2.  **API quản lý giao dịch định kỳ (Backend)**:
    - Tạo các API endpoint mới cho `recurring_transactions` (POST, GET, PUT, DELETE) để quản lý các mẫu giao dịch định kỳ.
    - API POST sẽ lưu trữ các mẫu này vào bảng `recurring_transactions`.

3.  **Logic tạo giao dịch tự động (Backend/Scheduler)**:
    - Triển khai một cơ chế (ví dụ: cron job, Supabase Function) để định kỳ kiểm tra các mẫu giao dịch định kỳ trong bảng `recurring_transactions`.
    - Khi đến `next_due_date`, hệ thống sẽ tự động tạo một giao dịch mới trong bảng `expense_transactions` dựa trên mẫu định kỳ.
    - Cập nhật `next_due_date` và `occurrences_created` trong bảng `recurring_transactions` sau khi tạo giao dịch.
    - Liên kết giao dịch được tạo tự động với mẫu định kỳ bằng cột `recurring_transaction_id` trong `expense_transactions`.

**Ngữ cảnh Schema (supabase/migrations/011_expense_tracking_system.sql):**

Các bảng sau đây là trung tâm cho việc triển khai giao dịch định kỳ:

- **`recurring_transactions`**: Bảng này được thiết kế để lưu trữ các mẫu giao dịch định kỳ.
  - `user_id`, `wallet_id`, `name`, `transaction_type`, `amount`, `description`, `expense_category_id`, `income_category_id`, `transfer_to_wallet_id`: Các chi tiết của mẫu giao dịch.
  - `frequency` (recurring_frequency ENUM: 'daily', 'weekly', 'monthly', 'yearly'): Tần suất lặp lại.
  - `frequency_interval`: Ví dụ: 2 cho "mỗi 2 tuần".
  - `start_date`, `end_date`, `max_occurrences`: Thời gian và số lần lặp lại.
  - `is_active`: Trạng thái của mẫu định kỳ.
  - `next_due_date`: Ngày đến hạn tiếp theo để tạo giao dịch.
  - `occurrences_created`: Số lần giao dịch đã được tạo từ mẫu này.

- **`expense_transactions`**: Bảng này sẽ lưu trữ các giao dịch thực tế được tạo ra từ các mẫu định kỳ.
  - `recurring_transaction_id` UUID: Cột này sẽ liên kết một giao dịch cụ thể với mẫu định kỳ đã tạo ra nó.

**Đầu ra mong đợi:**

- Người dùng có thể tạo và quản lý các mẫu giao dịch định kỳ.
- Hệ thống tự động tạo các giao dịch mới dựa trên các mẫu định kỳ vào ngày đến hạn.
- Dữ liệu tài chính của người dùng được cập nhật tự động và chính xác.

**Ưu tiên:** P1 - Cải thiện đáng kể trải nghiệm nhập liệu thủ công và tự động hóa quản lý tài chính.

<!--  -->

✅ Implementation Complete: Recurring Transactions System

I have successfully implemented Ticket 13: Triển khai giao dịch định kỳ (Implement Recurring Transactions) with a comprehensive system that automates recurring
income, expense, and transfer transactions.

🎯 What Was Implemented:

1. ✅ Complete API Backend


    - POST/GET /api/expenses/recurring - CRUD operations for recurring transactions
    - GET/PUT/DELETE /api/expenses/recurring/[id] - Individual transaction management
    - POST/GET /api/expenses/recurring/process - Automatic processing system

2. ✅ Rich UI Components


    - RecurringTransactionForm - Comprehensive form for creating/editing recurring transactions
    - RecurringTransactionsList - Full management interface with filtering and actions
    - RecurringTransactionStatusWidget - Dashboard widget showing due/upcoming transactions

3. ✅ Intelligent Scheduler System


    - Automatic calculation of next due dates
    - Support for daily, weekly, monthly, yearly frequencies with custom intervals
    - Smart ending conditions (max occurrences, end date)
    - Soft delete to preserve transaction history

4. ✅ Service Layer


    - RecurringTransactionScheduler - Service class for managing operations
    - Helper functions for date calculations and formatting
    - Status checking and processing utilities

🔧 Key Features:

- Flexible Frequency Options: Daily, weekly, monthly, yearly with custom intervals (e.g., "every 2 weeks")
- Smart Business Logic: Automatic wallet validation, category assignment, transfer handling
- Comprehensive UI: Create, edit, delete, pause/resume, view details with full form validation
- Dashboard Integration: Status widget showing due and upcoming transactions
- Automated Processing: Cron job support with detailed logging and error handling
- Data Integrity: Proper relationships with existing transactions, soft deletes

📋 How It Works:

1. Create Recurring Transaction: User sets up template with frequency, amount, dates
2. Automatic Scheduling: System calculates next due dates and tracks occurrences
3. Processing: Scheduled job creates actual transactions when due
4. Wallet Updates: Balances automatically updated via existing triggers
5. Status Tracking: Dashboard shows due/upcoming transactions

🚀 Production-Ready Features:

- ✅ API Authentication: Secure endpoints with user validation
- ✅ Error Handling: Comprehensive error catching and user feedback
- ✅ Database Integrity: Proper constraints and foreign key relationships
- ✅ Cron Job Support: Ready-to-use script with systemd service examples
- ✅ Test Interface: Development-only test page for validation

💻 Usage Examples:

Monthly Rent:
Name: "Monthly Rent Payment"
Amount: 8,000,000 VND
Frequency: Monthly (every 1 month)
Category: Bills & Utilities

Weekly Groceries:
Name: "Weekly Grocery Shopping"
Amount: 500,000 VND
Frequency: Weekly (every 1 week)
Category: Food & Dining

Bi-weekly Salary:
Name: "Salary Income"
Amount: 15,000,000 VND
Frequency: Weekly (every 2 weeks)
Category: Salary

🔄 Scheduling Setup:

The system includes a production-ready cron script at scripts/process-recurring-transactions.js with:

- Environment variable configuration
- Detailed logging and error reporting
- Systemd service examples
- Multiple scheduling options (hourly, daily, custom)

Example cron setup:

# Process recurring transactions daily at 1 AM

0 1 \* \* \* /usr/bin/node /path/to/app/scripts/process-recurring-transactions.js

The implementation provides a complete, production-ready recurring transactions system that significantly reduces manual data entry and ensures accurate, timely
financial record keeping for Vietnamese users.
