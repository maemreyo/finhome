## Ticket 35: Thiết kế Giao diện Chống "Ảo tưởng Tự động" và Khuyến khích Xác minh (Counteract Automation Bias)

**Mục tiêu:** Giảm thiểu rủi ro người dùng tin tưởng một cách mù quáng vào kết quả của AI, bằng cách thiết kế một giao diện xác nhận thông minh, khuyến khích sự rà soát và làm nổi bật các thông tin quan trọng hoặc bất thường.

**Mô tả & Hiện trạng:**
Người dùng có xu hướng tin tưởng vô điều kiện vào hệ thống tự động (Automation Bias), dẫn đến việc bỏ qua bước kiểm tra và xác nhận các giao dịch sai do AI phân tích. Điều này cực kỳ nguy hiểm cho tính toàn vẹn của dữ liệu tài chính.

Hiện tại (commit `44a416f`):

- **Dialog xác nhận (`ConversationalTransactionDialog.tsx`):** Đã được triển khai. Nó cho phép người dùng **chỉnh sửa dễ dàng** tất cả các trường và hiển thị **điểm tin cậy (confidence score)** của AI cho mỗi giao dịch, đây là một khởi đầu tốt.
- **Thiếu sót:** Giao diện hiện tại chưa có sự **phân cấp trực quan** rõ rệt (mọi trường trông quan trọng như nhau) và chưa có **cơ chế cảnh báo** cho các giao dịch có rủi ro cao.

Ticket này tập trung vào việc bổ sung các lớp bảo vệ thông minh vào giao diện xác nhận.

**Các công việc cần thực hiện:**

1.  **Cải thiện Phân cấp Trực quan (Visual Hierarchy) (Frontend):**
    - **Nhiệm vụ:** Trong `ConversationalTransactionDialog.tsx`, sử dụng các tiện ích của Tailwind CSS để làm nổi bật các trường quan trọng nhất.
    - **Logic:**
      - Áp dụng các lớp như `text-2xl`, `font-bold`, `text-primary` cho trường **Số tiền (`amount`)** để nó thu hút sự chú ý đầu tiên.
      - Hiển thị **Loại giao dịch (`transaction_type`)** một cách rõ ràng, có thể bằng màu sắc (đỏ cho chi, xanh cho thu).
      - Các thông tin phụ như ghi chú, ngày tháng có thể giữ kích thước và độ nhấn nhá thấp hơn.
    - **Mục đích:** Giúp người dùng có thể "liếc" qua và xác nhận thông tin quan trọng nhất chỉ trong một giây.

2.  **Triển khai "Hàng rào An toàn" cho Giao dịch Bất thường (Frontend/Backend):**
    - **Nhiệm vụ (Backend):** Nâng cấp API `/api/expenses/parse-from-text`. Ngoài việc phân tích giao dịch, nó cần thêm logic để xác định các giao dịch "bất thường" và trả về một cờ `is_unusual: true`.
    - **Logic xác định bất thường (Backend):**
      - **Theo giá trị tuyệt đối:** Giao dịch có giá trị lớn hơn một ngưỡng cố định (ví dụ: > 5,000,000 VNĐ).
      - **Theo độ lệch so với trung bình (Nâng cao):** Giao dịch có giá trị cao hơn đáng kể so với mức chi tiêu trung bình của người dùng trong cùng một danh mục.
      - **Theo độ tin cậy thấp:** Giao dịch có `confidence_score` từ AI thấp hơn một ngưỡng (ví dụ: < 0.5).
    - **Nhiệm vụ (Frontend):** Trong `ConversationalTransactionDialog.tsx`, khi nhận được cờ `is_unusual: true` cho một giao dịch, phải hiển thị một cảnh báo nổi bật.
    - **Logic hiển thị cảnh báo (Frontend):** Sử dụng component `Alert` của shadcn/ui với `variant="destructive"`. Ví dụ: "**Cảnh báo:** Giao dịch này có giá trị lớn bất thường. Vui lòng kiểm tra lại số tiền là **15.000.000đ**."

**Ngữ cảnh Schema & Codebase:**

- **Code chính:**
  - `src/components/expenses/ConversationalTransactionDialog.tsx`: Cần cập nhật UI.
  - `src/app/api/expenses/parse-from-text/route.ts`: Cần thêm logic phân tích và trả về cờ `is_unusual`.
- **Schema DB:** Logic xác định bất thường có thể cần truy vấn bảng `expense_transactions` để tính toán chi tiêu trung bình của người dùng.

**Đầu ra mong đợi:**

- Một giao diện người dùng thông minh, khéo léo hướng dẫn người dùng kiểm tra lại các thông tin quan trọng và có rủi ro cao.
- Giảm đáng kể tỷ lệ các giao dịch bị ghi nhận sai do người dùng bỏ qua bước xác minh.
- Tăng cường cảm giác kiểm soát và sự tin tưởng của người dùng vào hệ thống.

**Ưu tiên:** P2 - Cao. Tính năng này ảnh hưởng trực tiếp đến độ chính xác của dữ liệu, vốn là giá trị cốt lõi mà sản phẩm mang lại.

<!--  -->

✅ Completed Implementation:

1. Enhanced Visual Hierarchy

- Amount field: Largest emphasis with gradient backgrounds, 2xl font, and "Critical - Verify carefully" badges
- Transaction type: Strong color coding (red/green/blue) with emojis (💸💰🔄) for immediate recognition
- Description & Category: Medium emphasis with colored backgrounds and "Important" badges
- Secondary fields: Appropriate visual weight to avoid overwhelming users

2. Intelligent Unusual Transaction Detection

- Multi-criteria detection: Large amounts (>5M VND), low AI confidence (<50%), statistical anomalies, suspicious patterns
- User spending analysis: Compares against 3-month spending patterns using statistical thresholds
- Pattern recognition: Detects test data, dummy transactions, and suspicious text patterns
- Graceful degradation: System continues working even if pattern analysis fails

3. Prominent Warning System

- Destructive alert styling with red borders, backgrounds, and warning emojis
- Detailed explanations of why transactions are flagged as unusual
- Action-oriented messaging with clear verification instructions
- Visual card emphasis with red borders and shadows for unusual transactions

4. Psychological Design Features

- Confidence score visualization with color coding (green/yellow/red)
- Modification tracking showing original AI suggestions vs. user changes
- Progressive disclosure with advanced options toggle
- Clear contrast between AI suggestions and user modifications

5. Testing Infrastructure

- test-automation-bias.js - Comprehensive testing script for unusual detection
- Visual hierarchy validation checklist
- Performance impact measurement
- UX psychology principle verification

🧠 Key UX Psychology Principles Applied:

1. Visual Hierarchy for Attention Direction

- Critical fields use strong visual weight to guide user focus
- Amount field gets maximum emphasis as the most important verification point
- Color coding reduces cognitive load while maintaining clarity

2. Defensive Design Patterns

- Multiple verification checkpoints prevent blind acceptance
- Unusual transaction warnings catch potential errors early
- Clear undo paths allow easy correction of AI suggestions

3. Cognitive Load Reduction

- Consistent iconography (💸, 💰, 🔄) for quick recognition
- Smart defaults that are pre-filled but easily editable
- Contextual information shown at point of decision

4. Trust Calibration

- Confidence scores help users understand AI certainty levels
- Transparent communication about AI limitations
- Users maintain agency over final decisions

📊 Anti-Automation Bias Features:

Backend Detection Logic:

// 4 layers of unusual transaction detection:

1. Large amount threshold (>5M VND)
2. Low AI confidence (<50%)
3. Statistical anomaly (2.5+ std dev from user average)
4. Suspicious pattern recognition (test data, etc.)

Frontend Warning System:

⚠️ UNUSUAL TRANSACTION DETECTED
• Large amount: 8,500,000 VND exceeds 5,000,000 VND threshold
• Please double-check the amount: 8,500,000 VND

Visual Hierarchy Implementation:

- Amount: Large font, gradient background, critical verification badges
- Type: Color-coded indicators with emojis
- Description/Category: Important badges with colored backgrounds
- Warnings: Destructive styling with prominent placement

🎯 Expected Impact:

Reduced Over-Reliance:

- Visual hierarchy forces conscious review of critical fields
- Warning systems prompt deeper analysis of flagged transactions
- Confidence scores enable appropriate skepticism

Error Prevention:

- Early warning system catches suspicious patterns
- Multiple verification checkpoints prevent mistakes
- Clear feedback on user modifications

Maintained Usability:

- Anti-bias features don't impede normal workflow
- Progressive disclosure prevents cognitive overload
- Intuitive design patterns maintain user engagement

📝 Usage:

# Test the automation bias protection system

pnpm test:automation-bias

# Regular development

pnpm dev

The implementation successfully combines psychological principles with practical design patterns to create a system that guides attention to critical elements,
warns about problematic transactions, maintains transparency about AI limitations, and preserves human agency in financial decisions. This approach ensures AI
assistance enhances rather than replaces human judgment, creating a more reliable and trustworthy financial management experience.
