/**
 * ============================================================================
 * ANTIGRAVITY • STUDIO GHIBLI WEB MUSIC PLAYER
 * Service Worker: Offline Caching & PWA Support
 * ============================================================================
 */

const CACHE_NAME = 'antigravity-ghibli-v1';

// Danh sách các tài nguyên tĩnh cốt lõi cần lưu trữ offline
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './favicon.png',
  './favicon-32x32.png',
  './apple-touch-icon.png',
  './icon.png',
  './icon-192.png',
  './icon-512.png',
  './icon-home-music.png',
  './icon-home.png',
  './icon-search.png',
  './icon-library.png',
  './icon-playlists.png',
  './icon-create.png',
  './wood_2.jpg',
  './wood_2.png',
  './bg.jpg',
  './fire.gif',
  './1FTV-Austie-Bost-Happy-Holly.otf'
];

// 1. INSTALL: Lưu trữ toàn bộ shell ứng dụng vào cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('🍃 [Service Worker] Pre-caching Ghibli UI Shell...');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE: Dọn dẹp các cache phiên bản cũ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('🧹 [Service Worker] Xóa cache cũ:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH: Chiến lược Stale-While-Revalidate cho tài nguyên tĩnh, bỏ qua streaming audio động
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Không can thiệp vào các luồng âm thanh YouTube, Catbox, Cobalt hoặc API backend POST/PUT
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('youtube.com') ||
    url.hostname.includes('googlevideo.com') ||
    url.hostname.includes('catbox.moe') ||
    request.destination === 'video' ||
    request.destination === 'audio'
  ) {
    return;
  }

  // Đối với file tĩnh (HTML, CSS, JS, Font, Image): Ưu tiên Cache để mở tức thì ngay cả khi Airplane Mode
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Cập nhật ngầm (Stale-while-revalidate) khi có mạng
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {
            // Mất mạng / Chế độ máy bay -> an tâm dùng bản cache
          });
        return cachedResponse;
      }

      // Chưa có trong cache -> lấy từ mạng và lưu vào cache nếu thành công
      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Khi mất mạng và đang load trang HTML, trả về index.html từ cache
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
