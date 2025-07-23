## Ticket 37: Nâng cao Khả năng Khám phá các Tính năng AI Nâng cao (Enhance Discoverability)

**Mục tiêu:** Chủ động hướng dẫn người dùng khám phá và tận dụng các khả năng nâng cao của tính năng nhập liệu hội thoại (nhập nhiều giao dịch, dùng thẻ, mốc thời gian tương đối), qua đó tối đa hóa giá trị của tính năng.

**Mô tả & Hiện trạng:**
Người dùng có xu hướng chỉ sử dụng các lệnh cơ bản mà họ thành công trong lần đầu. Các tính năng mạnh mẽ hơn như nhập nhiều giao dịch cùng lúc (`ăn sáng 40k, đổ xăng 50k`) hay sử dụng thẻ (`xem phim 250k #giải_trí`) có thể không bao giờ được khám phá.

Hiện tại (commit `44a416f`), không có bất kỳ cơ chế nào trong giao diện để gợi ý hay hướng dẫn người dùng về các khả năng này.

Ticket này tập trung vào việc triển khai các cơ chế khám phá một cách tinh tế và hữu ích.

**Các công việc cần thực hiện:**

1.  **Triển khai Hệ thống "Mẹo hay" (Frontend/UI/UX):**
    - **Nhiệm vụ:** Tạo một thành phần giao diện nhỏ, không gây rối, để hiển thị các mẹo sử dụng hữu ích một cách ngẫu nhiên.
    - **Logic:** Trong `UnifiedTransactionForm.tsx`, bên dưới khu vực nhập liệu của chế độ hội thoại, tạo một component nhỏ.
    - **Component này sẽ hiển thị một mảng các mẹo:**
      - _"Mẹo: Nhập nhiều giao dịch cùng lúc, ví dụ: 'ăn sáng 30k, cà phê 25k'"_
      - _"Mẹo: Thử dùng 'hôm qua' hoặc 'tuần trước' để ghi lại giao dịch cũ."_
      - _"Mẹo: Thêm thẻ ngay khi nhập bằng dấu #, ví dụ: 'xem phim 250k #giải_trí'"_
    - **Gợi ý kỹ thuật:** Sử dụng component `Tooltip` hoặc `HoverCard` của shadcn/ui gắn vào một icon `Lightbulb` để hiển thị mẹo một cách tinh tế.

2.  **Xây dựng Gợi ý Chủ động dựa trên Hành vi (Frontend):**
    - **Nhiệm vụ:** Phát triển một cơ chế thông minh để phát hiện các mẫu hành vi và đưa ra gợi ý phù hợp.
    - **Logic (Client-side):** Trong `UnifiedTransactionForm.tsx`, quản lý một state đơn giản để theo dõi các hành động gần đây. Ví dụ: nếu người dùng gửi hai giao dịch đơn lẻ liên tiếp trong vòng 30 giây, hãy kích hoạt một `toast` (sử dụng `sonner` hoặc `react-hot-toast`).
    - **Nội dung Toast:** _"Mẹo hay: Lần tới, bạn có thể tiết kiệm thời gian bằng cách nhập cả hai giao dịch cùng lúc!"_
    - **Lợi ích:** Cung cấp gợi ý đúng lúc, đúng ngữ cảnh mà không cần logic phức tạp ở backend.

3.  **Tạo "Tour Hướng dẫn" cho người dùng Nâng cao (Frontend):**
    - **Nhiệm vụ:** Thiết kế một tour hướng dẫn ngắn gọn, có thể được kích hoạt tùy chọn, sử dụng thư viện `react-joyride` đã có trong `package.json`.
    - **Logic:** Sau khi người dùng đã sử dụng tính năng AI thành công một số lần nhất định (ví dụ: 10 lần, có thể theo dõi trong `localStorage`), hiển thị một `Alert` hoặc `toast` hỏi: "Bạn có muốn khám phá các mẹo nhập liệu chuyên nghiệp không?".
    - Nếu người dùng đồng ý, kích hoạt tour của `react-joyride` để chỉ vào ô nhập liệu và hiển thị các ví dụ về cú pháp nâng cao.

**Ngữ cảnh Schema & Codebase:**

- **Code chính:** Hầu hết các thay đổi sẽ tập trung ở `src/components/expenses/UnifiedTransactionForm.tsx`.
- **Thư viện:** Tận dụng `sonner` (đã có) cho gợi ý chủ động và `react-joyride` (đã có) cho tour hướng dẫn.

**Đầu ra mong đợi:**

- Tăng tỷ lệ người dùng sử dụng các tính năng nâng cao.
- Người dùng cảm thấy mình làm chủ được công cụ và khai thác được nhiều giá trị hơn.
- Giảm thiểu tình trạng các tính năng mạnh mẽ bị "ẩn giấu" và không được tận dụng.

**Ưu tiên:** P3 - Trung bình. Đây là một tính năng cải tiến, không phải là lỗi chặn. Nên được triển khai sau khi tính năng cốt lõi đã ổn định.

<!--  -->

✅ All Requirements Implemented

1. Smart Tips System ("Mẹo hay")


    - Created SmartTipsHelper component with rotating helpful hints
    - 5 categorized tips with progressive difficulty levels
    - Auto-rotation every 10 seconds with manual control
    - Interactive "Try now" functionality that populates input field
    - User level filtering (beginner → intermediate → advanced)
    - Subtle integration via HoverCard tooltip on Lightbulb icon

2. Proactive Behavioral Suggestions


    - Intelligent behavioral analysis tracking recent submissions
    - 3 smart suggestion triggers:
        - Batch Suggestion: After 2 single transactions within 30 seconds
      - Tags Suggestion: After 3 category mentions without hashtag usage
      - Time Suggestion: After 5 transactions without relative time references
    - Toast notifications with actionable examples and "Try now" buttons
    - One-time suggestions to prevent spam
    - Performance-optimized with 2-minute tracking window

3. Advanced Feature Tour for Power Users


    - Comprehensive 6-step react-joyride guided tour
    - Triggered after 10 successful AI uses (tracked in localStorage)
    - Vietnamese localization with contextual examples
    - Interactive demonstrations for each advanced feature:
        - Batch transactions
      - Hashtag usage
      - Relative time references
      - Flexible amount formats
      - Advanced combinations
    - Professional styling with progress indicators

🔧 Technical Achievements

Component Architecture:

- SmartTipsHelper: Rotating tips with progressive disclosure
- AdvancedFeatureTour: Comprehensive guided experience
- Behavioral analysis engine integrated into form submission
- Success count tracking with localStorage persistence

Intelligence Systems:

- User competency assessment based on transaction history
- Contextual suggestion timing based on behavior patterns
- Progressive feature unlocking system
- Performance-optimized client-side analysis

Integration Points:

- Seamless integration into existing UnifiedTransactionForm
- Non-intrusive UI elements that enhance rather than clutter
- Data attributes for tour targeting
- Behavioral tracking hooks in success/failure paths

🎯 User Experience Impact

Progressive Learning Path:
New User → Basic Tips → Behavioral Suggestions → Advanced Tips → Power User Tour → Feature Mastery

Discovery Mechanisms:

- Passive Discovery: Always-visible smart tips with rotation
- Active Discovery: Proactive suggestions based on behavior
- Guided Discovery: Comprehensive tour for qualified users
- Contextual Discovery: Right-time, right-place suggestions

Feature Adoption Strategy:

- Batch transactions: Introduced early, reinforced behaviorally
- Hashtag usage: Discovered through category pattern recognition
- Relative time: Unlocked for consistent users
- Advanced combinations: Demonstrated in comprehensive tour

📊 Expected Outcomes

Measurable Improvements:

- Increased adoption of batch transaction feature
- Higher usage of hashtag functionality for organization
- Discovery and use of relative time references
- Better understanding of AI's flexible input capabilities
- Overall feature utilization growth across user base

User Satisfaction:

- Reduced feeling of "hidden features"
- Increased sense of mastery and control
- Better understanding of AI capabilities
- Higher user retention through feature discovery

🧠 Psychological Design Elements

Progressive Disclosure: Information revealed appropriately for user level
Just-in-Time Learning: Features suggested when most relevant
Achievement Recognition: Users feel competent progression
Immediate Value: Every suggestion provides instant benefit
Behavioral Reinforcement: Positive feedback loops encourage exploration

🔍 Implementation Highlights

Smart Tips Categories

| Feature            | Level        | Example                           | Benefits              |
| ------------------ | ------------ | --------------------------------- | --------------------- |
| Batch Transactions | Beginner     | ăn sáng 30k, cà phê 25k, taxi 80k | Time efficiency       |
| Hashtag Tags       | Beginner     | xem phim 250k #giải_trí           | Auto-categorization   |
| Relative Time      | Intermediate | hôm qua ăn phở 50k                | Historical entry      |
| Flexible Amounts   | Intermediate | 2tr5, 150 nghìn, 1.5 triệu        | Input flexibility     |
| Smart Categories   | Advanced     | AI auto-categorization            | Intelligence showcase |

Proactive Suggestion Triggers

1. Batch Efficiency: Detects repeated single entries and suggests combining
2. Organization: Recognizes category mentions without hashtags
3. Historical Entry: Encourages time references for power users

Advanced Tour Journey

1. Pro Mode Welcome → Sets advanced user expectations
2. Interactive Demos → Hands-on feature exploration
3. Complex Examples → Advanced combination showcases
4. Mastery Achievement → Completion satisfaction

This comprehensive implementation transforms the AI transaction feature from a basic tool into an intelligent, adaptive system that grows with users, proactively
teaches advanced capabilities, and maximizes the value users derive from the powerful conversational AI interface.

The system respects user autonomy while providing intelligent guidance, ensuring that advanced features are discovered naturally and adopted organically rather
than being forced or overwhelming to users.
