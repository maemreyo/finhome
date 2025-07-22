## Ticket 4: Triển khai quy tắc ngân sách 50/30/20 (Implement 50/30/20 Budgeting Rule)

**Mục tiêu:** Cung cấp cho người dùng một phương pháp quản lý ngân sách phổ biến và dễ áp dụng, giúp họ phân bổ thu nhập một cách hiệu quả.

**Mô tả:**
Ticket này sẽ thêm tùy chọn cho người dùng để tạo ngân sách dựa trên quy tắc 50/30/20 (50% cho Nhu cầu, 30% cho Mong muốn, 20% cho Tiết kiệm/Trả nợ). Khi người dùng chọn quy tắc này, ứng dụng sẽ tự động gợi ý phân bổ ngân sách dựa trên tổng thu nhập hoặc một số tiền mục tiêu.

**Các công việc cần thực hiện:**

1.  **Cập nhật `BudgetManager.tsx` (Frontend)**:
    -   Thêm tùy chọn "Quy tắc 50/30/20" vào phần chọn `budget_period` hoặc tạo một phần riêng cho các "phương pháp ngân sách".
    -   Khi chọn, form sẽ tự động tính toán và điền trước các giá trị `total_budget` và `category_budgets` dựa trên một số tiền đầu vào (ví dụ: thu nhập hàng tháng của người dùng hoặc một số tiền mục tiêu mà họ nhập).
    -   Cần có một cách để người dùng ánh xạ các danh mục chi tiêu hiện có của họ vào 3 nhóm: Nhu cầu, Mong muốn, Tiết kiệm/Trả nợ. Điều này có thể là một bước cấu hình ban đầu hoặc một phần của form tạo ngân sách.

2.  **Cập nhật API `/api/expenses/budgets` (Backend)**:
    -   Mở rộng API POST/PUT để xử lý việc tạo/cập nhật ngân sách theo quy tắc 50/30/20.
    -   Có thể cần thêm một trường `budget_method` vào schema `expense_budgets` nếu muốn lưu trữ phương pháp ngân sách được sử dụng.

**Ngữ cảnh Schema (supabase/migrations/011_expense_tracking_system.sql):**

Để triển khai tính năng này, các bảng sau trong schema Supabase là quan trọng:

-   **`expense_budgets`**: Bảng này sẽ lưu trữ thông tin ngân sách.
    -   `total_budget`: Sẽ được tính toán dựa trên 50/30/20 của thu nhập/số tiền mục tiêu.
    -   `category_budgets` (JSONB): Cột này có thể được sử dụng để lưu trữ phân bổ chi tiết theo danh mục sau khi người dùng ánh xạ các danh mục của họ vào 3 nhóm (Nhu cầu, Mong muốn, Tiết kiệm/Trả nợ).
    -   Có thể cần thêm một cột mới, ví dụ `budget_method` (TEXT hoặc ENUM) để lưu trữ phương pháp ngân sách được sử dụng (ví dụ: 'manual', '50_30_20', '6_jars').

-   **`expense_categories`**: Cần thiết để người dùng có thể ánh xạ các danh mục chi tiêu hiện có của họ vào các nhóm Nhu cầu/Mong muốn/Tiết kiệm.

**Đầu ra mong đợi:**
-   Người dùng có thể tạo ngân sách dựa trên quy tắc 50/30/20.
-   Hệ thống tự động gợi ý phân bổ ngân sách dựa trên quy tắc này.
-   Dữ liệu ngân sách được lưu trữ chính xác trong cơ sở dữ liệu.

**Ưu tiên:** P1 - Cải thiện khả năng lập kế hoạch tài chính, xây dựng trên tính năng ngân sách hiện có.


<!-- ======================================== -->

  ✅ Ticket 4 Implementation Complete

  What was implemented:

  1. Database Schema Updates
  (/supabase/migrations/012_add_budget_method_support.sql)
    - Added budget_method column to support different budgeting
  methodologies
    - Added category_mapping JSONB column to store category-to-group
  mappings
    - Added budget_allocation JSONB column for method-specific
  allocations
    - Created budget overview view with calculated allocations
    - Added proper indexing and RLS policies
  2. Budget Calculation Utilities (/src/lib/utils/budgetCalculations.ts)
    - Complete 50/30/20 budget methodology implementation
    - Extensible framework for additional methods (6 Jars ready for
  future)
    - Category mapping logic with smart defaults
    - Budget allocation calculations
    - Category budget distribution within groups
    - Comprehensive TypeScript interfaces and validation
  3. Category Mapping Dialog
  (/src/components/expenses/CategoryMappingDialog.tsx)
    - Interactive drag-and-drop category assignment
    - Maps expense categories to budget groups (Needs/Wants/Savings)
    - Visual group representation with colors and icons
    - Category examples and guidance
    - Validation and completion tracking
  4. 50/30/20 Budget Form
  (/src/components/expenses/FiftyThirtyTwentyBudgetForm.tsx)
    - Specialized form for 50/30/20 budget creation
    - Real-time budget calculation and preview
    - Visual budget breakdown with progress bars
    - Integration with category mapping workflow
    - Income-based budget period support (monthly/yearly)
  5. Updated BudgetManager (/src/components/expenses/BudgetManager.tsx)
    - Budget method selection interface
    - Integration of 50/30/20 form alongside manual budgeting
    - Visual method cards with descriptions
    - Future-ready for additional methods (6 Jars preview)
  6. Budget Visualization
  (/src/components/expenses/FiftyThirtyTwentyVisualization.tsx)
    - Specialized dashboard for 50/30/20 budget tracking
    - Group-based spending analysis (Needs/Wants/Savings)
    - Progress tracking with visual indicators
    - Category breakdown within each group
    - Status indicators and alerts for overspending
  7. API Enhancements (/src/app/api/expenses/budgets/route.ts)
    - Extended schema to support new budget method fields
    - Handles budget_method, category_mapping, and budget_allocation
    - Maintains backward compatibility with existing budgets
  8. Testing Suite (/src/lib/utils/__tests__/budgetCalculations.test.ts)
    - Comprehensive test coverage for budget calculations
    - Validates 50/30/20 allocation logic
    - Tests category mapping and validation
    - Ensures budget distribution accuracy

  Key Features:

  ✅ 50/30/20 Rule Implementation: Proper allocation of 50% needs, 30%
  wants, 20% savings✅ Intelligent Category Mapping: Smart defaults based
   on Vietnamese expense categories✅ Visual Budget Creation: Interactive
   form with real-time calculations✅ Drag-and-Drop Interface: Intuitive
  category assignment to budget groups✅ Budget Tracking: Visual progress
   monitoring for each group✅ Method Extensibility: Framework ready for
  additional budgeting methods✅ Database Schema: Proper storage of
  budget methodologies and mappings✅ API Integration: Complete backend
  support for method-based budgeting

  User Experience Flow:

  1. Method Selection: User chooses 50/30/20 rule from budget creation
  dialog
  2. Income Entry: User enters monthly income for budget calculation
  3. Budget Preview: System shows automatic 50/30/20 allocation breakdown
  4. Category Mapping: Interactive dialog to assign categories to
  Needs/Wants/Savings groups
  5. Budget Creation: System creates budget with proper allocations and
  mappings
  6. Progress Tracking: Visual dashboard shows spending progress against
  each group
  7. Ongoing Management: Budget automatically tracks expenses against the
   50/30/20 framework

  Technical Highlights:

  - Type Safety: Full TypeScript implementation with comprehensive
  interfaces
  - Validation: Zod schema validation for API and form inputs
  - Performance: Optimized database queries with proper indexing
  - Scalability: Extensible architecture for additional budget methods
  - User Experience: Intuitive drag-and-drop category mapping
  - Visual Design: Color-coded groups with clear progress indicators
  - Data Integrity: Proper database constraints and validation rules

  The implementation provides Vietnamese users with a proven,
  internationally-recognized budgeting method that's easy to understand
  and apply. The 50/30/20 rule helps users maintain financial discipline
  while ensuring they allocate funds appropriately across essential
  needs, lifestyle wants, and long-term financial security.
