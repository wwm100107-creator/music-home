# MUSIC HOME • Studio Ghibli & Totoro Vibe (YouTube Audio Stream & Cloud Sync)

Trình phát nhạc trên trình duyệt lấy cảm hứng từ khung cảnh thiên nhiên trong *My Neighbor Totoro*. Giao diện dùng HTML/CSS/JavaScript thuần; backend Node.js/Express tìm nhạc và proxy luồng âm thanh YouTube. Ứng dụng cũng có lời bài hát, đồng bộ tài khoản, chia sẻ nhạc cộng đồng và giao diện PWA cho điện thoại.

> 📱 **Máy chủ Gia đình & Phát nhạc nền iOS:** Xem chi tiết kiến trúc máy chủ Android Termux & Cloudflare Tunnel tại [HOME_SERVER_ARCHITECTURE.md](./HOME_SERVER_ARCHITECTURE.md).

---

## 🍃 Các tính năng cốt lõi

### 1. 🕊️ Tìm kiếm và phát nhạc
- **Smart Input Detection**: Tự động phân loại đầu vào:
  - Nếu nhập từ khóa: Gửi yêu cầu tìm kiếm đến backend và hiển thị danh sách kết quả để chọn phát.
  - Nếu dán URL YouTube, ứng dụng lấy thông tin video qua backend rồi phát bằng luồng `/api/stream/:videoId`.
- Backend dùng `youtubei.js` để tìm video và lấy luồng YouTube; luồng được proxy qua server để hỗ trợ phát bằng trình duyệt.
- Khi tìm kiếm YouTube không có kết quả, server có thể dùng iTunes làm nguồn dự phòng cho các bản preview.
- **Loading Animation Ghibli**:
  - Trong lúc trích xuất dữ liệu, hiển thị CSS Animation độc đáo: **Bầy bồ hóng than Susuwatari gắng sức kéo một nốt nhạc vàng óng khổng lồ (🎵 Tug-of-war Note Drag)**.
  - Bắt lỗi `try/catch` an toàn, có âm thanh dự phòng giữ mạch cảm xúc không bị ngắt quãng.

### 2. 🪵 Segmented Control Sidebar (Tấm Gỗ Trượt Duy Nhất)
- Menu trái là danh sách các tab với một thanh trượt tấm gỗ duy nhất (`#woodSliderSwitch`) sử dụng ảnh `wood_2.png`.
- Chuyển động vật lý mượt mà: `transform: translateY()` với đường cong `transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)`.
- Ràng buộc Active State: Khi dừng ở mục nào, Icon và Chữ mục đó nổi lên và phóng to nhẹ (`scale(1.08)`), nằm lọt thỏm cân đối bên trong tấm gỗ và **tuyệt đối không bao giờ tràn ra ngoài ranh giới**.

### 3. 🔥 Thanh Phát Nhạc Dây Leo & Chú Lửa Calcifer
- Thanh tiến trình lượn sóng SVG xanh ngọc dịu mát như nhánh dây leo trong rừng già.
- Cục chạy dùng ảnh `fire.gif` kèm animation phập phồng ấm áp.

### 4. ☁️ Tài khoản và đồng bộ
- **Ghibli Handwritten Letter Modal**: Modal đăng nhập / đăng ký thiết kế như một lá thư tay bằng giấy da rơi chao nghiêng.
- Hồ sơ tài khoản được lưu riêng trên máy chủ Android tại `.local-data/users.json`; dữ liệu từ kho cũ được nhập một lần khi người dùng đăng nhập hoặc đăng ký.
- Máy chủ gia đình tự tạo khóa ký phiên đăng nhập và lưu trong `.auth-secret`. Tài khoản cần máy chủ có ổ đĩa lưu trữ bền vững; các endpoint tài khoản sẽ không bật trên Vercel.
- Danh sách nhạc cộng đồng vẫn dùng `restful-api.dev` để chia sẻ giữa các người dùng.

### 5. 🌰 Chế độ Loop 4 trạng thái & Tích chọn Hạt Dẻ (Acorn Custom Loop)
- Loop All -> Loop One -> Custom Loop (Hạt Dẻ 🌰) -> Loop Off.

---

## 🚀 Cách mở và sử dụng
1. Cài dependencies bằng `npm install`, sau đó chạy `npm start`.
2. Mở `http://localhost:3000` trên trình duyệt. Các tính năng tìm kiếm và phát nhạc cần backend Node.js hoạt động.
3. **Tìm nhạc**: Nhập tên bài hát hoặc dán liên kết YouTube vào ô tìm kiếm.
4. **Chia sẻ nhạc**: Mở mục **"Drop Your Music"** để tải bài hát và ảnh bìa lên danh sách cộng đồng.
5. **Chọn bài lặp Hạt Dẻ**: Bấm phím `L` hoặc nút Loop cho đến khi hiện biểu tượng hạt dẻ `🌰`, sau đó tích vào các bài hát bạn muốn lặp.

---

## ⌨ Phím tắt điều khiển
- `Space`: Phát / Tạm dừng
- `N` / `P`: Bài tiếp theo / Bài trước đó (tự động theo chế độ Loop Hạt Dẻ nếu đang bật)
- `←` / `→`: Tua lùi 5s / Tua tới 5s
- `↑` / `↓`: Tăng / Giảm âm lượng 5%
- `M`: Bật / Tắt tiếng (Mute)
- `S`: Chế độ ngẫu nhiên (Shuffle)
- `L`: Chuyển 4 chế độ lặp (Tất cả -> 1 Bài -> Hạt Dẻ Custom -> Tắt)
