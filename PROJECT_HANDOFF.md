# 🌿 MUSIC HOME - PROJECT CONTEXT & HANDOFF SPECIFICATION

> **Dự án:** Web Home Music (`music-home`) • Studio Ghibli & Totoro Sound Station  
> **Kho GitHub:** `https://github.com/wwm100107-creator/music-home.git`  
> **Phiên bản hiện tại:** `v4.5-strict-lyrics-matching` (Commit: `8bd78d1`)  
> **Cuộc hội thoại trước:** Conversation ID `70332b32-d7f5-4337-92ca-248376c055f9`  
> **Cập nhật lần cuối:** 25/09/2026  

---

## 1. TỔNG QUAN KIẾN TRÚC & HẠ TẦNG

1. **Máy chủ Gia đình (Home Server - 0 VNĐ):**
   * Chạy trên **1 điện thoại Android cũ** dùng **Termux** cắm sạc Wi-Fi gia đình (tiêu thụ ~1-2W).
   * Node.js (`server.js` - Port 3000) phục vụ API và phát trực tiếp luồng AAC (itag 140).
   * **Cloudflare Tunnel (`cloudflared`)** tạo kết nối HTTPS an toàn ra Internet, không cần mở port mạng gia đình (NAT/CGNAT).
   * **`auto-sync.sh` (DevOps tự động):** Cứ 2 phút tự động kiểm tra commit mới trên nhánh `main` của GitHub, tự động `git pull` và restart dịch vụ qua PM2.

2. **Khả năng phát nhạc nền trên iOS Safari:**
   * Dùng HTML5 `<audio>` native với định dạng **AAC itag 140 (audio/mp4)**.
   * Client ưu tiên: `ClientType.VISIONOS` và `ClientType.IOS` (tạo session cục bộ, vượt qua 403 Forbidden của Google).
   * Phát nhạc ngầm 100% khi tắt màn hình hoặc chuyển tab, hiển thị Media Session trên Lock Screen iOS.

---

## 2. QUY TẮC CỐT LÕI BẤT BIẾN (STRICT RULES)

1. **Quy tắc Double Mirroring:**
   * `app.js` ↔ `public/app.js` (Phải luôn đồng bộ giống nhau 100%).
   * `sw.js` ↔ `public/sw.js` (Phải luôn đồng bộ giống nhau 100%).
   * `index.html` ↔ `public/index.html` (Phải luôn đồng bộ giống nhau 100%).
2. **Quy tắc Lời bài hát (Zero-Hallucination Lyrics Policy):**
   * **Tuyệt đối không được tự bịa lyrics bài hát.**
   * **Lyrics bài nào phải đúng 100% của bài đó** (Chống triệt để lỗi "râu ông này cắm cằm bà kia").
   * Nếu bài hát do AI tạo (Suno, Udio, AI Cover...) hoặc quá mới/quá cũ chưa có dữ liệu: hiển thị thông báo trung thực *"Chưa có dữ liệu cho phần lời bài hát này"*. Thà báo chưa có còn hơn lấy sai bài!

---

## 3. CƠ CHẾ XỬ LÝ LỜI BÀI HÁT (LYRICS ENGINE v4.5)

Toàn bộ logic lời bài hát nằm ở `server.js` (dòng 2120-2575):

1. **`extractSongAndArtist(rawTitle, rawArtist)`**:
   * Tự động bóc tách chuẩn xác tên bài hát và ca sĩ từ tiêu đề YouTube phức tạp:
     * `JACK - J97 | NGƯỜI DƯNG | Album TAM THÁI TỬ - Track No.2` ➔ Title: `NGƯỜI DƯNG`, Artist: `JACK - J97`
     * `Sơn Tùng M-TP | CHÚNG TA CỦA TƯƠNG LAI | OFFICIAL MV` ➔ Title: `CHÚNG TA CỦA TƯƠNG LAI`, Artist: `Sơn Tùng M-TP`
2. **`selectBestLyricCandidateStrict(results, targetDur, cleanTitle, cleanArtist)`**:
   * **Bắt buộc:** Tên bài hát của ứng viên LRCLIB sau khi chuẩn hoá (bỏ dấu tiếng Việt, chữ thường) **phải trùng khớp hoàn toàn** với tên bài đang tìm.
   * Ngăn chặn tuyệt đối việc bốc nhầm bài khác có chữ "Người Dưng" (ví dụ: `Thiệp Hồng Người Dưng` của X2X hay `Người Lạ Ơi`).
   * Ưu tiên: Khớp tên bài ➔ Khớp nghệ sĩ ➔ Có lời đồng bộ Karaoke ➔ Thời lượng gần nhất.
3. **`fetchGeniusLyrics(cleanTitle, cleanArtist)`**:
   * Kiểm tra URL slug nghiêm ngặt: Slug bắt buộc phải chứa tên bài hát đang tìm (ví dụ `nguoi-dung`).
   * Nếu DuckDuckGo trả về link bài khác của cùng ca sĩ: **Từ chối ngay lập tức**, không cào bừa.
4. **Cache Key duy nhất theo `videoId`**:
   * Ưu tiên `lyrics:vid:${videoId}` để mỗi video YouTube luôn có một bản ghi riêng biệt, không bao giờ bị đè hoặc chia sẻ cache nhầm.

---

## 4. DANH MỤC CÁC FILE QUAN TRỌNG

* `server.js`: Máy chủ Express, xử lý stream proxy YouTube, LRCLIB / Genius lyrics engine, auth sync.
* `app.js` & `public/app.js`: Client UI, audio player engine, Spotify-style real-time synced lyrics renderer.
* `sw.js` & `public/sw.js`: Service Worker v4.5, Network-First policy, cache busting.
* `HOME_SERVER_ARCHITECTURE.md`: Tài liệu hướng dẫn thiết lập Termux Android & Cloudflare Tunnel.
* `auto-sync.sh`: Script shell chạy trên Termux tự kéo code từ GitHub main mỗi 2 phút.
