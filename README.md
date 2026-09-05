# MUSIC HOME • Studio Ghibli & Totoro Vibe (Cobalt Audio & Cloud Sync Engine)

Trình phát nhạc mang âm hưởng thiên nhiên trong trẻo, hoài niệm của **Studio Ghibli** (lấy cảm hứng từ *My Neighbor Totoro*), hoạt động thuần túy trên nền tảng **Web Browser** (KHÔNG cần Electron hay app desktop), tích hợp **Cobalt API Ultra-fast Audio Streamer & Downloader**, Segmented Control Sidebar tấm gỗ và Cloud Sync đa thiết bị.

---

## 🍃 Các tính năng cốt lõi

### 1. 🕊️ Smart Search Bar & Cobalt API Ultra-fast Audio Streamer & Downloader
- **Smart Input Detection**: Tự động phân loại đầu vào:
  - Nếu nhập chữ thường (Keyword): Tự động tìm kiếm & lọc bài hát ngay trong danh sách phát hiện tại, bấm Enter để phát ngay.
  - Nếu dán đường dẫn URL (YouTube, TikTok, SoundCloud, Twitter/X...): Tự động chuyển icon sang bồ câu bưu chính 🕊️ và kích hoạt tải siêu tốc.
- **Cobalt API Integration**:
  - Gửi `POST` đến `https://api.cobalt.tools/api/json` với payload `{ url, isAudioOnly: true }`.
  - Nạp Direct Stream URL vào `<audio src="...">` để phát ngay tức thì mà không cần chờ tải xong toàn bộ.
- **Lưu File Cục Bộ (File System Access API)**:
  - Sử dụng `showSaveFilePicker` ngầm nhắc người dùng lưu tệp MP3 vĩnh viễn vào ổ cứng máy tính.
- **Loading Animation Ghibli**:
  - Trong lúc trích xuất dữ liệu, hiển thị CSS Animation độc đáo: **Bầy bồ hóng than Susuwatari gắng sức kéo một nốt nhạc vàng óng khổng lồ (🎵 Tug-of-war Note Drag)**.
  - Bắt lỗi `try/catch` an toàn, có âm thanh dự phòng giữ mạch cảm xúc không bị ngắt quãng.

### 2. 🪵 Segmented Control Sidebar (Tấm Gỗ Trượt Duy Nhất)
- Menu trái là danh sách các tab với một thanh trượt tấm gỗ duy nhất (`#woodSliderSwitch`) sử dụng ảnh `wood_2.png`.
- Chuyển động vật lý mượt mà: `transform: translateY()` với đường cong `transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)`.
- Ràng buộc Active State: Khi dừng ở mục nào, Icon và Chữ mục đó nổi lên và phóng to nhẹ (`scale(1.08)`), nằm lọt thỏm cân đối bên trong tấm gỗ và **tuyệt đối không bao giờ tràn ra ngoài ranh giới**.

### 3. 🔥 Thanh Phát Nhạc Dây Leo & Chú Lửa Calcifer (f.jpg)
- Thanh tiến trình lượn sóng SVG xanh ngọc dịu mát như nhánh dây leo trong rừng già.
- Cục chạy (Thumb) sử dụng ảnh `f.jpg` kết hợp `mix-blend-mode: multiply` để khử hoàn toàn nền trắng, kèm animation phập phồng ấm áp (`calciferBreathe`).

### 4. ☁️ Cloud Sync & Tài Khoản (Supabase BaaS / Local Storage Multi-Tab)
- **Ghibli Handwritten Letter Modal**: Modal đăng nhập / đăng ký thiết kế như một lá thư tay bằng giấy da rơi chao nghiêng.
- Lưu trữ và đồng bộ danh sách bài hát qua Supabase Cloud hoặc Local Storage.

### 5. 🌰 Chế độ Loop 4 trạng thái & Tích chọn Hạt Dẻ (Acorn Custom Loop)
- Loop All -> Loop One -> Custom Loop (Hạt Dẻ 🌰) -> Loop Off.

---

## 🚀 Cách mở và sử dụng
1. Mở file `index.html` trực tiếp trên trình duyệt (Chrome, Edge, Brave, Firefox).
2. **Dán link nhạc**: Dán liên kết YouTube, TikTok hoặc SoundCloud vào ô tìm kiếm trên đầu trang để thưởng thức ngay.
3. **Mở thư mục nhạc trên máy**: Bấm nút **"Your Library"** trên Sidebar để chọn thư mục nhạc MP3 offline.
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
