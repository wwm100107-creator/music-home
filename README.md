# MUSIC HOME • Isometric Lo-Fi Sound Station (2.5D Art)

Trình phát nhạc cục bộ theo phong cách **Isometric Art (2.5D)** mang hơi hướng Lofi/Chill Cozy Room, hoạt động **100% Offline** không cần mạng hay bất kỳ thư viện bên ngoài nào.

![Isometric Cozy Room](https://raw.githubusercontent.com/wwm100107-creator/music-home/main/preview.png) *(Lấy cảm hứng từ tranh màu nước căn phòng Lofi)*

## 🎨 Điểm nhấn thiết kế (Isometric Art 2.5D)
1. **Hình khối 3D đùn dày (Extruded Blocks)**: Tạo bằng kỹ thuật `transform: rotateX(46deg) rotateZ(-24deg)` kết hợp nhiều lớp `box-shadow` tạo độ dày thành khối nổi trên mặt phẳng 2D.
2. **Nút bấm cơ học (Mechanical Tactile Feedback)**: Áp dụng các quy tắc `/apple-design` & `/animate`. Khi hover, khối hộp nổi lên; khi nhấp (Active), nút lún sâu xuống mô phỏng phím bấm vật lý cơ học.
3. **Đĩa than & Cần gạt Tonearm**: Cần gạt hạ xuống đĩa khi phát nhạc và tự động nhấc lên khi tạm dừng. Đĩa than xoay theo góc phối cảnh 2.5D.
4. **Nút chuyển đổi góc nhìn**: Có thể chuyển đổi linh hoạt giữa góc nghiêng **2.5D Isometric** và **Góc nhìn phẳng 2D** trực tiếp trên thanh điều khiển.
5. **100% Offline**: Không dùng bất kỳ CDN, web fonts hay thư viện bên ngoài. Chạy trực tiếp từ giao thức `file://`.

## 🚀 Hướng dẫn mở và sử dụng
1. Nhấp đúp mở trực tiếp file `index.html` bằng trình duyệt (Chrome, Edge, Firefox, Brave, Safari).
2. Nhấp nút **"Mở Thư Mục"** để nạp toàn bộ thư mục bài hát (`.mp3`, `.wav`, `.flac`).
3. Hoặc kéo thả thư mục/file nhạc trực tiếp vào giao diện trang.

## ⌨ Phím tắt điều khiển (Keyboard Shortcuts)
- `Space`: Phát / Tạm dừng
- `N` / `P`: Bài tiếp theo / Bài trước đó
- `←` / `→`: Tua nhanh lùi 5s / tiến 5s
- `↑` / `↓`: Tăng / Giảm âm lượng 5%
- `M`: Bật / Tắt tiếng (Mute)
- `S`: Chế độ xáo bài (Shuffle)
- `L`: Chế độ lặp lại (Tắt -> Lặp danh sách -> Lặp 1 bài)
