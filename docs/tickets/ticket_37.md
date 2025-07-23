## Ticket 37: Nâng cao Khả năng Khám phá các Tính năng AI Nâng cao (Enhance Discoverability of Advanced AI Capabilities)

**Mục tiêu:** Chủ động hướng dẫn và gợi ý cho người dùng để họ có thể khám phá và tận dụng toàn bộ các khả năng nâng cao của tính năng nhập liệu hội thoại, qua đó tối đa hóa giá trị và sự tiện ích mà tính năng này mang lại.

**Mô tả:**
Người dùng có xu hướng chỉ sử dụng các lệnh cơ bản nhất mà họ thành công trong lần đầu tiên (ví dụ: `cà phê 25k`). Họ có thể không bao giờ biết rằng hệ thống còn có khả năng xử lý các yêu cầu phức tạp hơn nhiều, như nhập nhiều giao dịch cùng lúc, sử dụng thẻ (tags), hoặc hiểu các mốc thời gian tự nhiên ("hôm qua", "tuần trước"). Nếu các tính năng "sát thủ" này không được khám phá, giá trị thực sự của công cụ sẽ bị giới hạn.

**Các công việc cần thực hiện:**

1.  **Triển khai Hệ thống "Mẹo hay Mỗi ngày" (Frontend/UI/UX):**
    -   **Nhiệm vụ:** Tạo một thành phần giao diện nhỏ, không gây rối, đặt gần ô nhập liệu AI.
    -   **Logic:** Thành phần này sẽ hiển thị ngẫu nhiên các mẹo sử dụng hữu ích. Ví dụ:
        -   *"Mẹo: Bạn có thể nhập nhiều giao dịch cùng lúc, ví dụ: 'ăn sáng 30k, cà phê 25k'"*
        -   *"Mẹo: Thử dùng 'hôm qua' hoặc 'hôm kia' để ghi lại giao dịch cũ."*
        -   *"Mẹo: Thêm thẻ ngay khi nhập bằng dấu #, ví dụ: 'xem phim 250k #giải_trí #bạn_bè'"*
    -   Các mẹo này nên được hiển thị một cách tinh tế và có thể tắt được.

2.  **Xây dựng Gợi ý Chủ động dựa trên Hành vi (Backend/Frontend):**
    -   **Nhiệmvụ:** Phát triển một cơ chế thông minh để phát hiện các mẫu hành vi và đưa ra gợi ý phù hợp.
    -   **Logic:** Nếu hệ thống phát hiện người dùng nhập hai giao dịch đơn giản liên tiếp nhau trong một khoảng thời gian ngắn (ví dụ: nhập "ăn sáng 50k", gửi, rồi ngay lập tức nhập "gửi xe 5k"), sau lần gửi thứ hai, một thông báo nhỏ có thể hiện ra: *"Lần tới, bạn có thể tiết kiệm thời gian bằng cách nhập cả hai: 'ăn sáng 50k và gửi xe 5k' nhé!"*
    -   **Yêu cầu:** Cần có logic ở backend để phân tích các mẫu nhập liệu gần đây của người dùng.

3.  **Tạo một "Tour Hướng dẫn" cho người dùng Nâng cao (Frontend):**
    -   **Nhiệm vụ:** Thiết kế một tour hướng dẫn ngắn gọn, có thể được kích hoạt tùy chọn, dành cho những người dùng muốn tìm hiểu sâu hơn.
    -   **Logic:** Sau khi người dùng đã sử dụng tính năng cơ bản một số lần nhất định (ví dụ: 20 lần), một thông báo có thể xuất hiện: "Bạn có muốn khám phá các mẹo nhập liệu chuyên nghiệp không?". Nếu người dùng đồng ý, một tour tương tác sẽ chỉ cho họ cách sử dụng các cú pháp phức tạp hơn.

**Ngữ cảnh Schema:**
-   Tính năng "Gợi ý Chủ động" có thể yêu cầu một cơ chế lưu trữ tạm thời (ví dụ: Redis) để theo dõi các hành vi nhập liệu gần đây của người dùng mà không cần truy vấn cơ sở dữ liệu chính.

**Đầu ra mong đợi:**
-   Tăng tỷ lệ người dùng sử dụng các tính năng nâng cao.
-   Người dùng cảm thấy mình làm chủ được công cụ và khai thác được nhiều giá trị hơn từ sản phẩm.
-   Giảm thiểu tình trạng các tính năng mạnh mẽ bị "ẩn giấu" và không được tận dụng.

**Ưu tiên:** P3 - Trung bình. Đây là một tính năng cải tiến, không phải là lỗi chặn. Tốt nhất nên được triển khai sau khi tính năng cốt lõi đã ổn định và chúng ta đã có dữ liệu về các hành vi sử dụng phổ biến.