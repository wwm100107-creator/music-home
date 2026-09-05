# MUSIC HOME • Studio Ghibli & Totoro Vibe (WebTorrent Engine)

Trình phát nhạc cục bộ & Web-based Torrent Streaming mang âm hưởng thiên nhiên trong trẻo, hoài niệm của **Studio Ghibli** (lấy cảm hứng từ *My Neighbor Totoro*), hoạt động thuần túy trên nền tảng **Web Browser** (KHÔNG cần Electron hay app desktop).

## 🍃 Các tính năng mới: WebTorrent P2P & File System Access API
1. **WebTorrent Browser Core**: Nhúng thư viện `webtorrent.min.js` qua CDN để tải và stream âm thanh P2P trực tiếp trong trình duyệt bằng giao thức WebRTC & WebSocket Trackers.
2. **Tìm kiếm & Tải Magnet**:
   - Dán bất kỳ link `magnet:?xt=...` hoặc mã InfoHash.
   - Các bài mẫu Ghibli / Lofi / CC Audio có sẵn để trải nghiệm stream tức thì với 1 cú nhấp.
3. **Stream trực tiếp vào Player**: Tự động stream dữ liệu đang tải vào thẻ HTML5 Audio và đưa bài hát vào danh sách phát (Playlist) chung.
4. **Lưu vĩnh viễn xuống ổ cứng (File System Access API)**: Sử dụng hàm `window.showSaveFilePicker()` để người dùng có thể lưu file `.mp3`, `.wav`, `.flac` vừa tải xuống thư mục trên máy tính với độ an toàn cao.
5. **Ghibli Susuwatari Loading Animation**: Bầy bụi bồ hóng nhí (Susuwatari) nhảy nhót chuyền tay nhau những chiếc lá và đám mây trôi trên thanh tiến trình trong lúc tải torrent.

## 🚀 Cách mở và sử dụng
1. Mở file `index.html` trực tiếp trên trình duyệt (Chrome, Edge, Brave, Firefox).
2. **Nghe nhạc cục bộ (Offline)**: Bấm **"Mở Thư Mục"** để chọn nhạc có sẵn trên máy tính.
3. **Tải & Stream Torrent (Online)**:
   - Bấm nút xanh **"WebTorrent"** trên thanh tiêu đề.
   - Dán link Magnet hoặc bấm một trong các nút bài mẫu (ví dụ: *Totoro Lofi Theme*).
   - Nhấn **"🍃 Tải & Stream"**.
   - Khi hoàn tất hoặc muốn lưu lại, bấm nút **"💾 Lưu Vào Máy"** để lưu vĩnh viễn xuống ổ cứng.

## ⌨ Phím tắt điều khiển
- `Space`: Phát / Tạm dừng
- `N` / `P`: Bài tiếp theo / Bài trước đó
- `←` / `→`: Tua lùi 5s / Tua tới 5s
- `↑` / `↓`: Tăng / Giảm âm lượng 5%
- `M`: Bật / Tắt tiếng (Mute)
- `S`: Chế độ ngẫu nhiên (Shuffle)
- `L`: Chế độ lặp lại (Tắt -> Lặp danh sách -> Lặp 1 bài)
