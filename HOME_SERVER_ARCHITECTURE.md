# 🌿 KIẾN TRÚC MÁY CHỦ GIA ĐÌNH & PHÁT NHẠC NỀN IOS (HOME MUSIC SERVER)

> **Cuộc hội thoại gốc:** [Xem chi tiết tại Antigravity Conversation bb377d62](conversation://bb377d62-939b-4b17-bb9e-85e7f217fd88)  
> **Dự án:** Web Home Music (`music-home`) • Studio Ghibli & Totoro Sound Station  
> **Kho GitHub:** `https://github.com/wwm100107-creator/music-home.git`  
> **Cập nhật lần cuối:** 25/09/2026  

---

## 1. Bối cảnh & Vấn đề giải quyết
1. **Vấn đề cốt lõi:**
   - Trình duyệt Safari và WebKit trên iOS chặn phát video nền khi khoá màn hình hoặc chuyển ứng dụng nếu sử dụng IFrame YouTube thông thường.
   - Khi thử nghiệm triển khai lên Vercel (`music-home-uypham.vercel.app`) hoặc Render (`music-home-uypham.onrender.com`), IP trung tâm dữ liệu đám mây (Cloud Datacenter AWS/GCP) bị tường lửa Google chặn hoàn toàn (HTTP 403 Forbidden / BotGuard Challenge).
2. **Ràng buộc của người dùng:**
   - **Hoàn toàn miễn phí (0 VNĐ)**: Không dùng proxy trả phí, không mua VPS, không mua chứng chỉ Apple Developer.
   - **Không bật máy tính 24/24**: Tốn điện và bất tiện.
3. **Giải pháp tối ưu đã triển khai thành công:**
   - Tận dụng **1 chiếc điện thoại Android cũ** cắm sạc ở góc nhà, kết nối Wi-Fi gia đình (tiêu thụ ~1-2W điện, chi phí tiền điện ~3.000đ/tháng).
   - Biến chiếc Android thành **Máy chủ gia đình (Home Server)** chạy **Termux**, **Node.js** (`server.js`), và **Cloudflare Tunnel** (`cloudflared`).
   - Tạo kịch bản tự động đồng bộ mã nguồn **`auto-sync.sh`** (hoạt động tự động 100% như Vercel).

---

## 2. Kiến trúc Kỹ thuật (Technical Architecture)

```
[iPhone Safari / PWA]
       │
       ▼ (HTTPS qua Quick Tunnel)
[Cloudflare Edge Network]
       │
       ▼ (Giao thức QUIC / HTTP/2)
[Android Termux Server (Home Wi-Fi)]
       │
       ├─► Node.js (server.js - Port 3000)
       │     └─► Innertube (ClientType.IOS / itag 140 AAC 128kbps)
       │           └─► Residential IP (Google không chặn)
       │
       └─► auto-sync.sh (Kiểm tra GitHub mỗi 2 phút -> Auto Git Pull & Restart)
```

### Tại sao kiến trúc này phát được nhạc nền trên iPhone?
* **HTML5 `<audio>` Native:** Server chuyển mã luồng trực tiếp thành định dạng **AAC Audio (audio/mp4, itag 140)**. Safari trên iOS tự động cấp quyền giải mã phần cứng `AVAudioSessionCategoryPlayback`.
* **Khóa màn hình không bị tắt:** iOS coi thẻ `<audio>` có âm thanh trực tiếp là một nguồn phát đa phương tiện chuẩn, cho phép phát liên tục khi tắt màn hình và hiển thị đầy đủ Artwork, Title, Artist, Play/Pause trên Lock Screen (thông qua W3C Media Session API).
* **Vượt qua 403 Forbidden của Google:** Yêu cầu lấy stream bắt nguồn từ IP mạng gia đình (Residential IP Viettel/VNPT/FPT) với User-Agent di động Apple Native, hoàn toàn không bị coi là Bot/Crawler.

---

## 3. Các Thành phần Mã nguồn Đã Cập nhật

### 3.1. `server.js` (Bản vá Stream Proxy)
* Ưu tiên máy khách:
  1. `ClientType.IOS` (`genLocally: true`, UA: `com.google.ios.youtube/19.45.4`)
  2. `ClientType.VISIONOS` (`genLocally: true`)
  3. `ClientType.ANDROID`
  4. `ClientType.TV_SIMPLY` / `ClientType.WEB`
* Bổ sung đầy đủ Header chuẩn YouTube khi lấy luồng âm thanh:
  ```javascript
  {
    'User-Agent': streamData.userAgent,
    'Origin': 'https://www.youtube.com',
    'Referer': 'https://www.youtube.com',
    'Range': rangeHeader
  }
  ```
* Cơ chế tự động luân chuyển máy khách (Fallback retry) nếu gặp sự cố mã phản hồi.
* Khóa ký phiên đăng nhập được tự tạo và lưu trong `.auth-secret` khi chạy trên máy chủ gia đình. Endpoint tài khoản cần máy chủ có ổ đĩa lưu trữ bền vững nên không bật trên Vercel.
* Hồ sơ tài khoản được lưu trong `.local-data/users.json` trên Android để tránh công khai hash mật khẩu qua API lưu trữ không xác thực. Dữ liệu từ kho tài khoản cũ được nhập một lần khi người dùng đăng nhập; các endpoint tài khoản yêu cầu máy chủ có ổ đĩa lưu trữ bền vững.

### 3.2. `auto-sync.sh` (Auto-Deploy Daemon)
* Tự động chạy ngầm:
  - Cứ mỗi 2 phút kiểm tra commit mới nhất trên nhánh `main` của GitHub.
  - Nếu có commit mới: tự động `git pull`, kiểm tra và cài đặt `npm install` nếu `package.json` thay đổi, sau đó tự khởi động lại `server.js` trong 1 giây.
  - Tích hợp Watchdog tự động phục hồi nếu `server.js` bị dừng ngầm.

---

## 4. Các Lệnh Vận hành trên Máy chủ Android (Termux Cheat Sheet)

| Mục đích | Lệnh thực thi trên Termux |
|---|---|
| **Giữ máy luôn thức (chống tắt ngầm)** | Bấm `Acquire Wakelock` trên thanh thông báo hoặc gõ `termux-wake-lock` |
| **Khởi động Server ngầm** | `cd ~/music-home && node server.js &` |
| **Bật Cloudflare Tunnel lấy link** | `cloudflared tunnel --url http://localhost:3000` |
| **Kích hoạt Auto-Sync tự động cập nhật** | `bash auto-sync.sh &` |
| **Tắt tiến trình server cũ** | `pkill -f node` |
| **Cập nhật thủ công tức thì** | `cd ~/music-home && git pull && pkill -f node && node server.js &` |

---

## 5. Trạng thái Hiện tại
* ✅ Máy chủ Android đang chạy ổn định.
* ✅ Cloudflare Tunnel kết nối tốc độ cao (location=hkg, giao thức QUIC).
* ✅ iPhone phát nhạc nền mượt mà khi khoá màn hình và chuyển ứng dụng.
* ✅ Auto-sync daemon đã kích hoạt để tự động kéo mọi bản cập nhật mới từ GitHub.
