## Ticket 10: Triển khai phương pháp ngân sách "6 chiếc lọ" (Implement "6 Jars" Budgeting Method)

**Mục tiêu:** Cung cấp thêm một phương pháp quản lý ngân sách phổ biến và trực quan, giúp người dùng phân chia thu nhập và quản lý chi tiêu theo các mục đích cụ thể.

**Mô tả:**
Ticket này sẽ bổ sung tùy chọn cho người dùng để tạo ngân sách dựa trên phương pháp "6 chiếc lọ" (còn gọi là "6 hũ chi tiêu"). Theo phương pháp này, thu nhập sẽ được chia thành 6 phần với tỷ lệ cố định cho các mục đích khác nhau: Nhu cầu thiết yếu (55%), Tự do tài chính (10%), Giáo dục (10%), Tiết kiệm dài hạn (10%), Hưởng thụ (10%), và Cho đi (5%).

**Các công việc cần thực hiện:**

1.  **Cập nhật `BudgetManager.tsx` (Frontend)**:
    - Thêm tùy chọn "Phương pháp 6 chiếc lọ" vào phần tạo ngân sách.
    - Khi người dùng chọn phương pháp này và nhập tổng thu nhập (hoặc một số tiền mục tiêu), ứng dụng sẽ tự động tính toán và hiển thị số tiền phân bổ cho mỗi "lọ" dựa trên tỷ lệ đã định.
    - Cần có một giao diện để người dùng ánh xạ các danh mục chi tiêu/thu nhập hiện có của họ vào 6 chiếc lọ này. Điều này có thể là một bước cấu hình trong quá trình tạo ngân sách.

2.  **Cập nhật API `/api/expenses/budgets` (Backend)**:
    - Mở rộng API POST/PUT để hỗ trợ lưu trữ thông tin ngân sách theo phương pháp "6 chiếc lọ".
    - Có thể cần lưu trữ thêm chi tiết về việc ánh xạ danh mục vào các lọ nếu logic này phức tạp.
    - Nếu đã thêm cột `budget_method` trong Ticket 4, hãy sử dụng nó để đánh dấu ngân sách này là "6_jars".

3.  **Thiết kế UI/UX cho "6 chiếc lọ" (Frontend)**:
    - Tạo một giao diện trực quan trong `BudgetManager.tsx` để người dùng có thể dễ dàng hình dung và theo dõi số tiền trong mỗi "lọ" của họ.
    - Hiển thị tiến độ chi tiêu cho từng lọ.

**Ngữ cảnh Schema (supabase/migrations/011_expense_tracking_system.sql):**

Để triển khai tính năng này, các bảng sau trong schema Supabase là quan trọng:

- **`expense_budgets`**: Bảng này sẽ lưu trữ thông tin ngân sách.
  - `total_budget`: Sẽ là tổng thu nhập hoặc số tiền mục tiêu mà người dùng muốn phân chia.
  - `category_budgets` (JSONB): Cột này có thể được sử dụng để lưu trữ phân bổ chi tiết cho từng "lọ" (ví dụ: `{"necessities": 5500000, "financial_freedom": 1000000, ...}`) và cách các danh mục chi tiêu của người dùng được ánh xạ vào các lọ này.
  - Nếu đã thêm cột `budget_method` (TEXT hoặc ENUM) trong Ticket 4, giá trị sẽ là '6_jars'.

- **`expense_categories`**: Cần thiết để người dùng có thể ánh xạ các danh mục chi tiêu hiện có của họ vào các "lọ" khác nhau.

**Đầu ra mong đợi:**

- Người dùng có thể tạo ngân sách dựa trên phương pháp "6 chiếc lọ".
- Hệ thống tự động tính toán và hiển thị phân bổ cho mỗi lọ.
- Người dùng có thể ánh xạ các danh mục chi tiêu của họ vào các lọ.
- Dữ liệu ngân sách "6 chiếc lọ" được lưu trữ và hiển thị chính xác.

**Ưu tiên:** P2 - Cung cấp thêm công cụ lập ngân sách linh hoạt, nâng cao khả năng lập kế hoạch tài chính.

<!-- ================================== -->

✅ Components Created:

1. SixJarsBudgetForm (src/components/expenses/SixJarsBudgetForm.tsx)
   - Specialized form for creating 6 Jars budgets
   - Visual jar breakdown with percentages and examples
   - Category mapping integration
   - Income-based automatic calculations

2. SixJarsVisualization (src/components/expenses/SixJarsVisualization.tsx)
   - Visual progress tracking for all 6 jars
   - Individual jar status indicators
   - Spending vs budget comparison
   - Detailed jar explanations with examples

✅ Integration Updates:

1. BudgetManager Component - Enhanced to:
   - Include 6 Jars as a selectable budget method
   - Show method badges on budget cards
   - Add "View Details" button for 6 Jars budgets
   - Open detailed visualization dialog

2. Budget Calculations Utility - Extended with:
   - Complete 6 Jars configuration (55% Necessities, 10% Education, 10% Long-term Savings, 10% Play, 10% Financial Freedom, 5% Give)
   - Automatic category mapping for Vietnamese categories
   - Calculation functions for jar allocations

✅ API Support:

- Budget API already supported the budget_method field and custom allocations
- Category Mapping utilizes existing JSONB fields for storing jar assignments
- Budget Allocation uses existing budget_allocation field for storing jar amounts

✅ Features Implemented:

- ✅ Complete 6 Jars budget creation with income-based calculations
- ✅ Visual jar breakdown with icons, colors, and progress tracking
- ✅ Automatic category mapping to appropriate jars
- ✅ Real-time budget vs spending visualization
- ✅ Detailed jar explanations and examples
- ✅ Integration with existing budget management system
- ✅ Status indicators (on track, warning, over budget)

How the 6 Jars Method Works:

1. Necessities (55%) - Essential living expenses (housing, food, transportation, utilities)
2. Education (10%) - Learning and skill development (books, courses, seminars, training)
3. Long-term Savings (10%) - Long-term wealth building (retirement, investments, property)
4. Play (10%) - Fun and entertainment (entertainment, hobbies, dining out)
5. Financial Freedom (10%) - Passive income investments (stocks, real estate, business investments)
6. Give (5%) - Charitable giving and helping others (charity, donations, helping family/friends)

What Users Can Now Do:

1. Create 6 Jars Budgets:
   - Select 6 Jars method during budget creation
   - Enter monthly income for automatic jar calculations
   - Map their expense categories to appropriate jars
   - Set budget period (monthly/yearly)

2. Track Jar Performance:
   - View individual jar progress and spending
   - See visual indicators for budget status
   - Monitor overall budget health
   - Access detailed jar breakdown via visualization dialog

3. Learn the Method:
   - Read jar descriptions and examples
   - Understand the wealth-building philosophy
   - Apply T. Harv Eker's proven financial system

The implementation fully addresses Ticket 10 requirements, providing users with a complete 6 Jars budgeting system that integrates seamlessly with the existing
expense tracking infrastructure while maintaining the visual appeal and user experience standards of the application.
