# MUSIC HOME • Studio Ghibli & Totoro Vibe (WebTorrent & Cloud Sync Engine)

Trình phát nhạc mang âm hưởng thiên nhiên trong trẻo, hoài niệm của **Studio Ghibli** (lấy cảm hứng từ *My Neighbor Totoro*), hoạt động thuần túy trên nền tảng **Web Browser** (KHÔNG cần Electron hay app desktop), hỗ trợ WebTorrent P2P Streaming và Cloud Sync đa thiết bị.

---

## 🍃 Các tính năng mới nhất

### 1. ☁️ Cloud Sync & Tài Khoản (Supabase BaaS / Instant Local Simulator)
- **Ghibli Handwritten Letter Modal**: Modal đăng nhập / đăng ký thiết kế như một lá thư tay bằng giấy da cổ phong rơi từ trên trời xuống nhẹ nhàng chao nghiêng (`leafModalDrop`).
- **Đồng bộ Playlist & WebTorrent**:
  - Lưu trữ và đồng bộ toàn bộ Metadata danh sách bài hát (Tiêu đề, Nghệ sĩ, Định dạng, Dung lượng, Magnet Link).
  - Khi đăng nhập trên thiết bị mới, ứng dụng tự động kéo danh sách về và **tự động kết nối WebTorrent stream/tải lại ngầm** các bài hát có Magnet Link để phát được ngay.
  - Biểu tượng trạng thái kết nối Cloud (`🟢` Đã đồng bộ, `🔄` Đang đồng bộ, `☁️` Sẵn sàng).
- **Hỗ trợ 2 chế độ Backend**:
  - **Supabase Real Cloud**: Nhập Supabase Project URL & Anon Key (thông qua CDN `@supabase/supabase-js@2`, không cần backend Node.js) để lưu trữ trên Cloud thật.
  - **Instant Local Simulator**: Tự động hoạt động ngay tức thì (Zero-config) trên trình duyệt bằng LocalStorage multi-tab broadcast.

### 2. 🌰 Chế độ Loop 4 trạng thái & Tích chọn Hạt Dẻ (Acorn Custom Loop)
State Machine nâng cấp với 4 chế độ lặp luân phiên:
1. **Lặp toàn bộ khu vườn (Loop All)**: Hết danh sách sẽ tự động quay lại bài đầu tiên.
2. **Lặp 1 bài hiện tại (Loop One - `1`)**: Phát đi phát lại duy nhất 1 bài hát.
3. **Lặp các bài đã chọn (Custom Loop - `🌰`)**:
   - Tự động xuất hiện ô checkbox chiếc lá (`🍃`) trên từng thẻ bài hát.
   - Khi tích chọn: Chiếc lá hóa thành Hạt Dẻ (`🌰`) với hiệu ứng nảy nhẹ vui mắt (`acornPop`) và viền gỗ phát sáng ấm áp.
   - Trình phát nhạc **chỉ lặp qua lại giữa các bài hát đã tích hạt dẻ** này.
4. **Tắt lặp (Loop Off)**: Phát đến cuối danh sách rồi dừng lại.

### 3. 📡 WebTorrent P2P Browser Streaming & File System Access API
- Nhúng thư viện `webtorrent.min.js` thuần WebRTC trên trình duyệt.
- Dán link `magnet:?xt=...` hoặc chọn các bản nhạc mẫu Ghibli / Lofi để nghe trực tuyến P2P.
- Hoạt ảnh bầy Susuwatari chuyền lá và mây trôi sinh động theo tốc độ tải.
- Hỗ trợ lưu file vĩnh viễn xuống ổ cứng bằng `File System Access API` (`showSaveFilePicker`).

---

## 🚀 Cách mở và sử dụng
1. Mở file `index.html` trực tiếp trên trình duyệt (Chrome, Edge, Brave, Firefox).
2. **Đăng nhập / Đồng bộ Cloud**:
   - Nhấp vào nút **"☁️ Đăng Nhập"** trên thanh tiêu đề để mở lá thư tay Ghibli.
   - Đăng ký tài khoản hoặc cấu hình Supabase riêng trong tab **"Cấu Hình Cloud"**.
   - Bấm **"🔄 Đồng bộ Cloud"** bất kỳ lúc nào để sao lưu danh sách bài hát lên mây.
3. **Nghe nhạc cục bộ**: Bấm **"Mở Thư Mục"** để chọn thư mục nhạc trên máy tính.
4. **Tải & Stream WebTorrent**: Bấm nút **"WebTorrent"**, dán Magnet URL hoặc chọn mẫu có sẵn.
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
