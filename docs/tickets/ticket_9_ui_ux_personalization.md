## Ticket 9: Cá nhân hóa UI/UX: Biểu tượng & Màu sắc danh mục/ví (UI/UX Personalization: Custom Category/Wallet Icons & Colors)

**Mục tiêu:** Nâng cao trải nghiệm người dùng bằng cách cho phép họ cá nhân hóa giao diện thông qua việc tùy chỉnh biểu tượng và màu sắc cho các danh mục chi tiêu/thu nhập và ví.

**Mô tả:**
Ticket này sẽ triển khai các tính năng cho phép người dùng chọn hoặc tải lên các biểu tượng tùy chỉnh và chọn màu sắc yêu thích cho các danh mục chi tiêu/thu nhập và ví của họ. Điều này sẽ giúp người dùng tạo ra một không gian tài chính phản ánh phong cách và sở thích cá nhân của họ.

**Các công việc cần thực hiện:**

1.  **Cập nhật form quản lý ví (Frontend - `WalletManager.tsx` hoặc form tạo/sửa ví):**
    -   Thêm bộ chọn màu (color picker) để người dùng có thể chọn màu cho ví.
    -   Thêm tùy chọn chọn biểu tượng (icon picker) từ một thư viện biểu tượng có sẵn hoặc cho phép tải lên biểu tượng tùy chỉnh (nếu có thể).

2.  **Cập nhật form quản lý danh mục (Frontend - nếu có form riêng hoặc trong `BudgetManager.tsx`):**
    -   Tương tự như ví, thêm bộ chọn màu và tùy chọn chọn biểu tượng cho các danh mục chi tiêu và thu nhập.

3.  **Cập nhật API `/api/expenses/wallets` (Backend):**
    -   Đảm bảo API PUT/POST có thể nhận và lưu trữ các giá trị `icon` và `color` mới cho ví.

4.  **Cập nhật API cho danh mục (Backend - nếu có hoặc cần tạo):**
    -   Nếu chưa có API để quản lý danh mục (`expense_categories`, `income_categories`), cần tạo các API PUT/POST tương ứng để cho phép cập nhật các trường `icon` và `color`.

5.  **Hiển thị các tùy chỉnh (Frontend - `TransactionsList.tsx`, `ExpenseAnalytics.tsx`, v.v.):**
    -   Đảm bảo rằng các biểu tượng và màu sắc đã tùy chỉnh được hiển thị chính xác và nhất quán trên toàn bộ ứng dụng (ví dụ: trong danh sách giao dịch, biểu đồ phân tích, quản lý ngân sách).

**Ngữ cảnh Schema (supabase/migrations/011_expense_tracking_system.sql):**

Các bảng sau đây đã có sẵn các cột cần thiết để lưu trữ thông tin cá nhân hóa:

-   **`expense_wallets`**:
    -   `icon` TEXT DEFAULT 'wallet': Cột này sẽ lưu trữ tên biểu tượng hoặc URL của biểu tượng tùy chỉnh.
    -   `color` TEXT DEFAULT '#3B82F6': Cột này sẽ lưu trữ mã màu (ví dụ: hex code).

-   **`expense_categories`**:
    -   `icon` TEXT NOT NULL DEFAULT 'circle': Tương tự như ví, lưu trữ tên biểu tượng hoặc URL.
    -   `color` TEXT NOT NULL DEFAULT '#3B82F6': Lưu trữ mã màu.

-   **`income_categories`**:
    -   `icon` TEXT NOT NULL DEFAULT 'circle': Tương tự.
    -   `color` TEXT NOT NULL DEFAULT '#10B981': Tương tự.

Việc triển khai sẽ tập trung vào việc phát triển giao diện người dùng để người dùng có thể tương tác với các cột `icon` và `color` này, cũng như đảm bảo các API backend xử lý việc cập nhật dữ liệu một cách chính xác.

**Đầu ra mong đợi:**
-   Người dùng có thể dễ dàng thay đổi biểu tượng và màu sắc cho ví và các danh mục của họ.
-   Các tùy chỉnh này được lưu trữ và hiển thị nhất quán trên toàn bộ ứng dụng.
-   Giao diện người dùng trở nên cá nhân hóa và trực quan hơn.

**Ưu tiên:** P2 - Nâng cao trải nghiệm người dùng và sự gắn kết thông qua cá nhân hóa.


<!-- ================================= -->
  ✅ Components Created:

  1. IconPicker Component (src/components/ui/icon-picker.tsx)
    - Dropdown picker with 30+ icons organized by categories (Financial, Categories, General)
    - Search functionality
    - Live preview with color integration
    - Support for custom icons
  2. ColorPicker Component (src/components/ui/color-picker.tsx)
    - Color wheel picker and hex input
    - 50+ preset colors in organized palette
    - Live preview functionality
  3. WalletForm Component (src/components/expenses/WalletForm.tsx)
    - Complete wallet creation/editing form
    - Integrates IconPicker and ColorPicker
    - Real-time preview of customizations
    - Form validation with Zod schema
  4. CategoryForm Component (src/components/expenses/CategoryForm.tsx)
    - Category customization interface
    - Icon and color picker integration
    - Management dialog for bulk category updates
  5. DynamicIcon Utility (src/lib/utils/icon-utils.tsx)
    - Renders icons dynamically from string names
    - Type-safe icon mapping system

  ✅ API Updates:

  1. Wallet API (/api/expenses/wallets/[id]/route.ts)
    - PUT/DELETE endpoints for individual wallet management
    - Icon and color field support (already existed in base API)
    - Proper error handling and validation
  2. Category API (/api/expenses/categories/[categoryId]/route.ts)
    - NEW: PUT endpoint for updating category icons and colors
    - Support for both expense and income categories
    - Validation and error handling

  ✅ Integration Updates:

  1. WalletManager Component - Updated to:
    - Show wallet creation/edit dialog with customization options
    - Display custom icons and colors in wallet cards
    - Handle wallet CRUD operations
  2. BudgetManager Component - Updated to:
    - Include category management functionality
    - Show custom icons/colors in category lists and budget breakdowns
    - Category customization dialog integration

  ✅ Features Implemented:

  - ✅ Custom wallet icons (30+ options) and colors (50+ presets + custom)
  - ✅ Custom category icons and colors for both expense and income categories
  - ✅ Real-time preview of customizations
  - ✅ Consistent display of custom icons/colors across all components
  - ✅ API support for persisting icon and color choices
  - ✅ Form validation and error handling
  - ✅ Responsive design and accessibility

  What Users Can Now Do:

  1. For Wallets:
    - Create/edit wallets with custom icons and colors
    - Choose from 30+ financial, category, and general icons
    - Select from 50+ preset colors or use custom hex colors
    - See real-time preview before saving
    - Delete or deactivate wallets
  2. For Categories:
    - Customize existing expense and income category icons and colors
    - Access category management through budget interface
    - View updated icons/colors throughout the application
    - Maintain category data while updating visual appearance
  3. Visual Experience:
    - Personalized financial interface with custom colors and icons
    - Consistent icon/color display across wallet cards, budget breakdowns, and category lists
    - Enhanced visual hierarchy and user engagement

  The implementation fully addresses the requirements in Ticket 9, providing a comprehensive personalization system that enhances user experience through
  visual customization while maintaining data integrity and system performance.
