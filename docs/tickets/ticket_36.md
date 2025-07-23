## Ticket 36: Tối ưu hóa Trải nghiệm Lần đầu Sử dụng (FTUE) cho Tính năng Nhập liệu AI

**Mục tiêu:** Đảm bảo người dùng có một trải nghiệm thành công, dễ dàng và tích cực ngay trong những lần đầu tiên tương tác với tính năng nhập liệu hội thoại, nhằm xây dựng lòng tin, thể hiện rõ giá trị và khuyến khích họ tiếp tục sử dụng tính năng này.

**Mô tả:**
Ấn tượng ban đầu có sức mạnh định hình quan điểm lâu dài của người dùng. Nếu AI thất bại trong việc xử lý một câu lệnh đơn giản hoặc nếu người dùng không hiểu cách tương tác, họ có thể nhanh chóng kết luận rằng tính năng này "khó dùng" hoặc "không thông minh" và sẽ không bao giờ thử lại. Ticket này tập trung vào việc tạo ra một "con đường thành công" (happy path) được thiết kế cẩn thận để dẫn dắt người dùng mới.

**Các công việc cần thực hiện:**

1.  **Xây dựng Hệ thống Gợi ý Prompt Thông minh (Frontend):**
    -   **Nhiệm vụ:** Thay vì hiển thị một ô nhập liệu trống trơn gây bối rối, hệ thống sẽ chủ động hiển thị các ví dụ mẫu (prompt suggestions) rõ ràng và hữu ích.
    -   **Logic:** Các gợi ý này không nên tĩnh. Chúng có thể thay đổi dựa trên thời gian trong ngày (ví dụ: buổi sáng gợi ý `cà phê 25k`, buổi tối gợi ý `ăn tối 150k`) hoặc dựa trên các giao dịch gần đây của người dùng.
    -   **Mục đích:** Hướng dẫn người dùng cách "nói chuyện" với AI và cho họ thấy ngay lập tức các khả năng của tính năng mà không cần phải suy nghĩ.

2.  **Tập trung Huấn luyện cho các Trường hợp Phổ biến (Backend/Prompt Engineering):**
    -   **Nhiệm vụ:** Trong quá trình Prompt Engineering (Ticket 31), ưu tiên tuyệt đối cho việc tối ưu hóa độ chính xác đối với các trường hợp sử dụng phổ biến nhất (ví dụ: ăn uống, đi lại, mua sắm, nhận lương).
    -   **Logic:** Phân tích dữ liệu (ẩn danh) để xác định 20% các loại giao dịch chiếm 80% tổng số giao dịch của người dùng và đảm bảo AI xử lý chúng gần như hoàn hảo.

3.  **Thiết kế Cơ chế Phản hồi khi Thất bại một cách Thân thiện (Frontend/UI/UX):**
    -   **Nhiệm vụ:** Khi AI không thể hiểu hoặc xử lý yêu cầu của người dùng, hệ thống không chỉ báo lỗi chung chung mà phải đưa ra phản hồi mang tính xây dựng và hướng dẫn.
    -   **Logic:** Thay vì hiển thị "Lỗi: Không thể phân tích", hệ thống nên phản hồi: "Tôi chưa hiểu rõ lắm. Bạn có thể thử diễn đạt theo cách khác không? Ví dụ: 'Ăn phở 50k' hoặc 'Mua sách 150k'".
    -   **Nâng cao:** Có thể đề xuất một nút "Nhập thủ công" để mở form nhập liệu truyền thống như một giải pháp thay thế ngay trong thông báo lỗi.

**Ngữ cảnh Schema:**
-   Không ảnh hưởng trực tiếp đến schema chính.
-   Tuy nhiên, logic để tạo gợi ý prompt động có thể cần truy cập (chỉ đọc) vào dữ liệu giao dịch gần đây của người dùng.

**Đầu ra mong đợi:**
-   Một luồng giới thiệu (onboarding) mượt mà và trực quan cho người dùng mới của tính năng AI.
-   Tăng đáng kể tỷ lệ người dùng có được kết quả thành công ngay trong lần thử đầu tiên.
-   Giảm thiểu cảm giác thất vọng và sự từ bỏ tính năng do không hiểu cách sử dụng hoặc do gặp lỗi ngay từ đầu.

**Ưu tiên:** P1 - Quan trọng. Việc này quyết định tỷ lệ chấp nhận và sử dụng (adoption rate) của một trong những tính năng quan trọng nhất sản phẩm. Phải được hoàn thành trước khi ra mắt.