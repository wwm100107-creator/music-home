import express from 'express';
import cors from 'cors';
import path from 'path';
import crypto from 'crypto';
import fs from 'node:fs';
import { fileURLToPath } from 'url';
import { Innertube, ClientType, UniversalCache, Platform } from 'youtubei.js';
import { parse as parseYaml } from 'yaml';

// Setup high-performance JavaScript evaluator for Innertube deciphering
if (Platform && Platform.shim) {
  Platform.shim.eval = async (data, env) => {
    const fn = new Function('env', `${data.output}; return { ...env };`);
    return fn(env);
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_DATA_DIRECTORY = path.join(__dirname, '.local-data');
const IS_SERVERLESS = Boolean(
  process.env.VERCEL ||
  process.env.VERCEL_ENV ||
  process.env.NOW_REGION ||
  process.env.AWS_LAMBDA_FUNCTION_NAME
);

function readLocalJson(filename) {
  const paths = [
    path.join(LOCAL_DATA_DIRECTORY, filename),
    path.join(__dirname, 'data', filename)
  ];

  for (const filePath of paths) {
    try {
      if (!fs.existsSync(filePath)) continue;
      const contents = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
      return JSON.parse(contents);
    } catch {}
  }

  return null;
}

function writeLocalJson(filename, value) {
  fs.mkdirSync(LOCAL_DATA_DIRECTORY, { recursive: true, mode: 0o700 });
  const filePath = path.join(LOCAL_DATA_DIRECTORY, filename);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), { encoding: 'utf8', mode: 0o600 });
  try {
    fs.chmodSync(filePath, 0o600);
  } catch {}
}

const AUTH_SECRET_PATH = path.join(__dirname, '.auth-secret');

function loadAuthSecret() {
  const configuredSecret = process.env.AUTH_SECRET?.trim();
  if (configuredSecret) {
    return configuredSecret.length >= 32 ? configuredSecret : '';
  }

  if (IS_SERVERLESS) return '';

  try {
    const existingSecret = fs.readFileSync(AUTH_SECRET_PATH, 'utf8').trim();
    if (existingSecret.length >= 32) return existingSecret;
    return '';
  } catch {}

  const generatedSecret = crypto.randomBytes(32).toString('hex');
  try {
    fs.writeFileSync(AUTH_SECRET_PATH, generatedSecret, { flag: 'wx', mode: 0o600 });
    return generatedSecret;
  } catch {
    try {
      const existingSecret = fs.readFileSync(AUTH_SECRET_PATH, 'utf8').trim();
      return existingSecret.length >= 32 ? existingSecret : '';
    } catch {
      return '';
    }
  }
}

const AUTH_SECRET = loadAuthSecret();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// 1. DEFENSE-IN-DEPTH SECURITY HEADERS & CLOAKING
// ============================================================================
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Cho phép xử lý JSON payload lớn cho tính năng Drop Your Music (tải nhạc và ảnh bìa)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Chặn truy cập trực tiếp vào các file hệ thống / bảo mật
app.use((req, res, next) => {
  const reqPath = req.path.toLowerCase();
  if (
    reqPath.startsWith('/.git') ||
    reqPath.startsWith('/node_modules') ||
    reqPath.startsWith('/.vercel') ||
    reqPath === '/server.js' ||
    reqPath === '/package.json' ||
    reqPath === '/package-lock.json' ||
    reqPath === '/vercel.json'
  ) {
    return res.status(403).json({ error: 'Access forbidden' });
  }
  next();
});

// ============================================================================
// 2. ANTI-BOT / SCANNER FILTER
// ============================================================================
const MALICIOUS_UA_PATTERNS = [
  /sqlmap/i,
  /nikto/i,
  /masscan/i,
  /nmap/i,
  /zgrab/i,
  /semrushbot/i,
  /ahrefsbot/i,
  /bytespider/i,
  /petalbot/i,
  /mj12bot/i,
  /dotbot/i
];

app.use((req, res, next) => {
  const ua = req.headers['user-agent'] || '';
  for (const pattern of MALICIOUS_UA_PATTERNS) {
    if (pattern.test(ua)) {
      return res.status(403).json({ error: 'Automated crawler access prohibited' });
    }
  }
  next();
});

// ============================================================================
// 3. IN-MEMORY SLIDING-WINDOW RATE LIMITER
// ============================================================================
const ipRequestLogs = new Map();

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket.remoteAddress ||
    '127.0.0.1'
  );
}

function rateLimit({ maxRequests, windowMs, endpointName }) {
  return (req, res, next) => {
    const ip = getClientIp(req);
    const key = `${endpointName}:${ip}`;
    const now = Date.now();

    if (!ipRequestLogs.has(key)) {
      ipRequestLogs.set(key, []);
    }

    const timestamps = ipRequestLogs.get(key);
    const cutoff = now - windowMs;

    while (timestamps.length > 0 && timestamps[0] <= cutoff) {
      timestamps.shift();
    }

    if (timestamps.length >= maxRequests) {
      const oldestTs = timestamps[0];
      const retryAfterSec = Math.ceil((oldestTs + windowMs - now) / 1000);
      res.setHeader('Retry-After', Math.max(1, retryAfterSec));
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded for ${endpointName}. Vui lòng thử lại sau ${retryAfterSec}s.`
      });
    }

    timestamps.push(now);
    next();
  };
}

// Dọn dẹp IP rác mỗi 60 giây
setInterval(() => {
  const now = Date.now();
  const maxRetention = 120000;
  for (const [key, timestamps] of ipRequestLogs.entries()) {
    while (timestamps.length > 0 && timestamps[0] <= now - maxRetention) {
      timestamps.shift();
    }
    if (timestamps.length === 0) {
      ipRequestLogs.delete(key);
    }
  }
}, 60000).unref();

// ============================================================================
// 4. BOUNDED LRU CACHES
// ============================================================================
class BoundedCache {
  constructor(maxSize = 300, ttlMs = 1800000) {
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
    this.store = new Map();
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    this.store.delete(key);
    this.store.set(key, item);
    return item.value;
  }

  set(key, value, customTtl = null) {
    if (this.store.has(key)) {
      this.store.delete(key);
    } else if (this.store.size >= this.maxSize) {
      const oldestKey = this.store.keys().next().value;
      this.store.delete(oldestKey);
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + (customTtl || this.ttlMs)
    });
  }

  delete(key) {
    return this.store.delete(key);
  }
}

const searchCache = new BoundedCache(300, 30 * 60 * 1000);
const streamCache = new BoundedCache(300, 45 * 60 * 1000);
const trendingCache = new BoundedCache(50, 60 * 60 * 1000);
const artistArtworkCache = new BoundedCache(500, 24 * 60 * 60 * 1000);
const albumCache = new BoundedCache(80, 60 * 60 * 1000);
const artistReleaseCache = new BoundedCache(240, 24 * 60 * 60 * 1000);
const lyricsCache = new BoundedCache(300, 60 * 60 * 1000);
const LRCLIB_HEADERS = {
  'User-Agent': 'MusicHome/1.0 (https://github.com/wwm100107-creator/music-home)'
};
let lrclibLastRequestAt = 0;
let lrclibBlockedUntil = 0;
let lrclibRequestQueue = Promise.resolve();

function getLrclibRetryDelayMs(response) {
  const retryAfter = response.headers.get('retry-after');
  const seconds = retryAfter?.trim() ? Number(retryAfter) : NaN;
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;

  const retryAt = Date.parse(retryAfter || '');
  return Number.isFinite(retryAt) ? Math.max(0, retryAt - Date.now()) : 1000;
}

function fetchLrclib(url) {
  const request = lrclibRequestQueue.then(async () => {
    if (Date.now() < lrclibBlockedUntil) return null;

    const spacingMs = Math.max(0, lrclibLastRequestAt + 250 - Date.now());
    if (spacingMs) await new Promise(resolve => setTimeout(resolve, spacingMs));
    if (Date.now() < lrclibBlockedUntil) return null;

    const response = await fetch(url, { headers: LRCLIB_HEADERS });
    lrclibLastRequestAt = Date.now();
    if (response.status === 429) {
      lrclibBlockedUntil = Math.max(lrclibBlockedUntil, Date.now() + getLrclibRetryDelayMs(response));
    }
    return response;
  });

  // Keep the queue usable if an individual network request fails.
  lrclibRequestQueue = request.then(() => undefined, () => undefined);
  return request;
}
const youtubeCaptionCache = new BoundedCache(300, 6 * 60 * 60 * 1000);
const cleanTrackCache = new BoundedCache(500, 24 * 60 * 60 * 1000);

// ============================================================================
// 5. CIRCUIT BREAKER
// ============================================================================
class CircuitBreaker {
  constructor(threshold = 4, cooldownMs = 60000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.cooldownMs = cooldownMs;
    this.state = 'CLOSED';
    this.nextAttempt = 0;
  }

  recordFailure(status) {
    if (status === 429 || status === 503) {
      this.failureCount++;
      if (this.failureCount >= this.threshold) {
        this.state = 'OPEN';
        this.nextAttempt = Date.now() + this.cooldownMs;
        console.warn(`[CircuitBreaker] YouTube trả về ${status}. Kích hoạt chế độ nghỉ ${this.cooldownMs / 1000}s.`);
      }
    }
  }

  recordSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  canRequest() {
    if (this.state === 'CLOSED') return true;
    if (this.state === 'OPEN') {
      if (Date.now() > this.nextAttempt) {
        this.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }
    return true;
  }
}

const circuitBreaker = new CircuitBreaker(4, 60000);

// ============================================================================
// 6. DUAL-CLIENT INNERTUBE ENGINE (With YouTube Cookie & Deciphering Auth)
// ============================================================================
let ytSearchInstance = null;
let ytStreamInstance = null;

function getYouTubeCookie() {
  const raw = process.env.YOUTUBE_COOKIE || process.env.COOKIE || '';
  if (!raw) return '';
  let str = String(raw).trim();
  str = str.replace(/^cookie:\s*/i, '');
  str = str.replace(/^["']|["']$/g, '');
  str = str.replace(/[\r\n]+/g, ' ').trim();
  return str;
}

async function getSearchClient() {
  const cookie = getYouTubeCookie();
  if (!ytSearchInstance) {
    const config = {
      cache: new UniversalCache(false),
      generate_session_locally: false
    };
    if (cookie) {
      config.cookie = cookie;
    }
    ytSearchInstance = await Innertube.create(config);
    console.log('✅ YouTube Search client initialized' + (cookie ? ' [COOKIE AUTHENTICATED]' : ''));
  }
  return ytSearchInstance;
}

async function getStreamClient(forceNew = false) {
  if (!ytStreamInstance || forceNew) {
    const cookie = getYouTubeCookie();
    // ClientType.VISIONOS với generate_session_locally: true:
    // 1. VisionOS Apple Native Client cung cấp luồng trực tiếp không bị bot-guard chặn trên Vercel
    // 2. Trả về luồng AAC chất lượng cao (itag 140, audio/mp4) tương thích 100% phần cứng iPhone/iOS WebKit
    // 3. Không bao giờ bị dính lỗi LOGIN_REQUIRED trên các dải IP Vercel/Cloud Datacenter
    const config = {
      client_type: ClientType.VISIONOS,
      cache: new UniversalCache(false),
      generate_session_locally: true
    };
    if (cookie) config.cookie = cookie;

    try {
      ytStreamInstance = await Innertube.create(config);
      console.log('✅ YouTube Stream client initialized (VisionOS Native Client - Background Stream Ready)');
    } catch (err) {
      console.warn('⚠️ VisionOS Client init failed, fallback to IOS:', err.message);
      config.client_type = ClientType.IOS;
      ytStreamInstance = await Innertube.create(config);
    }
  }
  return ytStreamInstance;
}

async function getClients() {
  const ytSearch = await getSearchClient();
  const ytStream = await getStreamClient();
  return { ytSearch, ytStream };
}

// ============================================================================
// 6.1. CLEAN AUDIO RESOLVER (Chuẩn hóa bài hát về bản Studio Audio & Cắt bỏ MV dư thời lượng)
// ============================================================================
const KNOWN_CLEAN_TRACKS = {
  // Wren Evans - Call Me (Official Studio: 3:35 thay vì MV kịch bản 6:15)
  'wrcorytidddq': { id: '7pCmFA4y9Dk', duration: '3:35', durationSec: 215 },
  'wrcorytidddq_call me': { id: '7pCmFA4y9Dk', duration: '3:35', durationSec: 215 },
  'call me_wren evans': { id: '7pCmFA4y9Dk', duration: '3:35', durationSec: 215 },

  // Sơn Tùng M-TP - Chúng Ta Của Hiện Tại (Official Audio: 5:02 thay vì Phim ngắn MV 14:51)
  'psz1g9fmfeo': { id: 'bNp9pn0ni3I', duration: '5:02', durationSec: 302 },
  'chúng ta của hiện tại_sơn tùng m-tp': { id: 'bNp9pn0ni3I', duration: '5:02', durationSec: 302 },

  // Sơn Tùng M-TP - Đừng Làm Trái Tim Anh Đau (Official Audio: 4:42 thay vì MV 5:26)
  'abpmzczzrfa': { id: 'NItL-whRVFo', duration: '4:42', durationSec: 282 },
  'abpmzczzrfy': { id: 'NItL-whRVFo', duration: '4:42', durationSec: 282 },
  'đừng làm trái tim anh đau_sơn tùng m-tp': { id: 'NItL-whRVFo', duration: '4:42', durationSec: 282 },

  // Sơn Tùng M-TP - Em Của Ngày Hôm Qua (Official Audio: 4:24 thay vì MV 4:50)
  'c3xo9fkoudg': { id: 'I_U4mU7Dq_4', duration: '4:24', durationSec: 264 },
  'vt4kau-ziry': { id: 'I_U4mU7Dq_4', duration: '4:24', durationSec: 264 },
  'em của ngày hôm qua_sơn tùng m-tp': { id: 'I_U4mU7Dq_4', duration: '4:24', durationSec: 264 },

  // Sơn Tùng M-TP - Muộn Rồi Mà Sao Còn (Official Audio: 4:20 thay vì MV 5:02)
  'fn7alfpgxii': { id: 'qHpE45b4INk', duration: '4:20', durationSec: 260 },
  'muộn rồi mà sao còn_sơn tùng m-tp': { id: 'qHpE45b4INk', duration: '4:20', durationSec: 260 },

  // Sơn Tùng M-TP - Nơi Này Có Anh (Official Audio: 4:20 thay vì MV 4:39)
  'kn0id0pi3o0': { id: 'KN9_u-2v2fM', duration: '4:20', durationSec: 260 },
  'nơi này có anh_sơn tùng m-tp': { id: 'KN9_u-2v2fM', duration: '4:20', durationSec: 260 },

  // Kha - Kẻ Say Tình (Official Studio: 4:21 thay vì MV 6:18)
  '4m1v3y-x4p4': { id: '4m1v3Y-X4p4', duration: '4:21', durationSec: 261 }
};
const KNOWN_LYRIC_TRACKS = KNOWN_CLEAN_TRACKS;

function parseToDurationSec(val) {
  if (!val) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.round(val);
  if (typeof val === 'object') {
    if (val.seconds && !isNaN(val.seconds)) return Number(val.seconds);
    if (val.text) return parseToDurationSec(val.text);
  }
  const str = String(val).trim();
  const parts = str.split(':').map(p => parseInt(p, 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  const n = parseInt(str, 10);
  return isNaN(n) ? 0 : n;
}

function formatTimeSec(seconds) {
  if (!seconds || isNaN(seconds)) return '03:30';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function isLikelyBloatedMV(title, durationSec) {
  const t = (title || '').toLowerCase();
  const d = Number(durationSec) || 0;

  const hasDramaKeyword =
    t.includes('phim ngắn') ||
    t.includes('short film') ||
    t.includes('drama ver') ||
    t.includes('the movie') ||
    t.includes('cinematic') ||
    t.includes('full story');

  if (hasDramaKeyword && d > 360) return true;
  // Chỉ coi là MV dư thời lượng nếu có từ khóa MV và dài trên 6 phút (360s)
  if (d > 360 && (t.includes('official music video') || t.includes('official mv') || t.includes('music video'))) return true;
  // Bất kỳ video nào dài trên 8 phút (480s)
  if (d > 480) return true;

  return false;
}

async function getCleanAudioTrack(yt, videoId, basicOrItemInfo = null) {
  if (!videoId || typeof videoId !== 'string') return null;
  const key = videoId.toLowerCase().trim();

  // 1. Kiểm tra bảng tra nhanh các bản hit nổi tiếng (0ms)
  if (KNOWN_CLEAN_TRACKS[key]) {
    return { ...KNOWN_CLEAN_TRACKS[key], source: 'static_map' };
  }

  // 2. Kiểm tra bộ nhớ đệm LRU (0ms)
  const cached = cleanTrackCache.get(key);
  if (cached) return cached;

  // 3. Lấy thông tin cơ bản nếu chưa được truyền vào
  let rawTitle = basicOrItemInfo?.title?.text || basicOrItemInfo?.title?.toString() || '';
  let rawArtist =
    basicOrItemInfo?.authors?.[0]?.name ||
    basicOrItemInfo?.artists?.[0]?.name ||
    basicOrItemInfo?.author?.name ||
    basicOrItemInfo?.author?.toString() ||
    '';
  let durationSec = parseToDurationSec(basicOrItemInfo?.duration?.seconds || basicOrItemInfo?.durationSec || basicOrItemInfo?.duration || 0);

  const ytClient = yt || (await getSearchClient());

  if (!rawTitle || !durationSec) {
    try {
      const info = await ytClient.getBasicInfo(videoId);
      if (info && info.basic_info) {
        rawTitle = rawTitle || info.basic_info.title || '';
        rawArtist = rawArtist || info.basic_info.author || '';
        durationSec = durationSec || parseToDurationSec(info.basic_info.duration) || 0;
      }
    } catch (infoErr) {
      const fallbackObj = { id: videoId, durationSec: durationSec || 210, duration: formatTimeSec(durationSec || 210), source: 'fallback_error' };
      cleanTrackCache.set(key, fallbackObj);
      return fallbackObj;
    }
  }

  // Kiểm tra tên bài hát + nghệ sĩ trong static map
  const artistKey = `${rawTitle}_${rawArtist}`.toLowerCase();
  if (KNOWN_CLEAN_TRACKS[artistKey]) {
    cleanTrackCache.set(key, KNOWN_CLEAN_TRACKS[artistKey]);
    return { ...KNOWN_CLEAN_TRACKS[artistKey], source: 'static_map' };
  }

  // Nếu bài hát không phải MV bị kéo dài thời lượng và có thời lượng hợp lý (<= 5p30)
  if (!isLikelyBloatedMV(rawTitle, durationSec) && durationSec > 0 && durationSec <= 330) {
    const res = { id: videoId, title: rawTitle, artist: rawArtist, duration: formatTimeSec(durationSec), durationSec, source: 'original_clean' };
    cleanTrackCache.set(key, res);
    return res;
  }

  // 4. Tìm kiếm bản Official Audio / Song chuẩn trên YouTube Music
  const cleanTitle = rawTitle
    .replace(/\[.*?\]|\(.*?\)/g, '')
    .replace(/official\s*(music\s*video|mv|video|audio|lyric\s*video)/gi, '')
    .replace(/phim ngắn ca nhạc|phim ngắn|short film/gi, '')
    .replace(/ft\.?|feat\.?/gi, ' ')
    .replace(/[-|•]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const cleanAuthor = rawArtist
    .replace(/ - Topic|Official|Vevo|Channel/gi, '')
    .trim();

  const searchQuery = `${cleanTitle} ${cleanAuthor}`.trim();

  if (ytClient.music && typeof ytClient.music.search === 'function') {
    try {
      const songRes = await ytClient.music.search(searchQuery, { type: 'song' });
      const songs = songRes.songs?.contents || [];

      for (const s of songs) {
        const sDur = parseToDurationSec(s.duration?.seconds || s.duration?.text || s.duration);
        const sId = s.id;
        if (!sDur || !sId) continue;

        // Nếu bản song này có thời lượng ngắn hơn MV đáng kể (loại bỏ kịch bản/thoại mở đầu)
        // hoặc thời lượng chuẩn (2 - 6 phút) và là bản thu riêng biệt
        const isBetterDuration = durationSec > sDur + 15 || (durationSec > 240 && sDur >= 120 && sDur <= 360);
        if (isBetterDuration) {
          const res = {
            id: sId,
            title: s.title?.text || s.title?.toString() || cleanTitle,
            artist: s.artists?.[0]?.name || cleanAuthor,
            duration: s.duration?.text || formatTimeSec(sDur),
            durationSec: sDur,
            source: 'yt_music_song'
          };
          cleanTrackCache.set(key, res);
          return res;
        }
      }
    } catch (searchErr) {
      // Bỏ qua lỗi tìm kiếm và fallback
    }
  }

  const res = { id: videoId, title: rawTitle, artist: rawArtist, duration: formatTimeSec(durationSec), durationSec, source: 'original_unmatched' };
  cleanTrackCache.set(key, res);
  return res;
}

// Bộ nhớ đệm Client Pool để không phải tạo mới Innertube (tiết kiệm 3s CPU cho Termux)
const candidateClientPool = new Map();
async function getPooledCandidateClient(cand, cookie) {
  const poolKey = `${cand.name}:${Boolean(cand.useCookie && cookie)}`;
  if (candidateClientPool.has(poolKey)) {
    return candidateClientPool.get(poolKey);
  }
  const config = {
    client_type: cand.type,
    cache: new UniversalCache(false),
    generate_session_locally: cand.genLocally
  };
  if (cand.useCookie && cookie) config.cookie = cookie;
  const yt = await Innertube.create(config);
  candidateClientPool.set(poolKey, yt);
  return yt;
}

// Helper resolve audio stream URL với hỗ trợ giải mã chữ ký & đa máy khách fallback
async function resolveAudioStream(videoId, forceRefresh = false, excludeClients = []) {
  if (!videoId) throw new Error('Missing videoId');

  const key = videoId.toLowerCase().trim();

  // 1. Kiểm tra nhanh trong Static Map hoặc Cache (0ms)
  let targetVideoId = videoId;
  if (KNOWN_CLEAN_TRACKS[key]) {
    targetVideoId = KNOWN_CLEAN_TRACKS[key].id;
  } else {
    const cachedClean = cleanTrackCache.get(key);
    if (cachedClean && cachedClean.id) {
      targetVideoId = cachedClean.id;
    }
  }

  if (!forceRefresh && excludeClients.length === 0) {
    const cached = streamCache.get(targetVideoId) || streamCache.get(videoId);
    if (cached) return cached;
  }

  const cookie = getYouTubeCookie();
  // Ưu tiên IOS và VISIONOS (Native Client Apple có session tạo cục bộ):
  // 1. Trả về trực tiếp itag 140 (AAC 128kbps) tương thích 100% iOS WebKit & giải mã phần cứng Apple
  // 2. Không bị dính lỗi 403 Forbidden do YouTube CDN nhận diện đúng định dạng âm thanh di động
  const candidateClients = [
    { type: ClientType.VISIONOS, name: 'VISIONOS', genLocally: true, useCookie: false, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15' },
    { type: ClientType.IOS, name: 'IOS', genLocally: true, useCookie: false, userAgent: 'com.google.ios.youtube/19.45.4 (iPhone16,2; U; CPU iOS 18_1 like Mac OS X;)' },
    { type: ClientType.MWEB, name: 'MWEB', genLocally: false, useCookie: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1' }
  ];

  let chosenFormat = null;
  let streamUrl = null;
  let chosenClient = null;
  let lastError = null;

  for (const cand of candidateClients) {
    if (excludeClients.includes(cand.name)) continue;
    try {
      const yt = await getPooledCandidateClient(cand, cookie);
      const info = await yt.getBasicInfo(targetVideoId);

      if (info.playability_status?.status && info.playability_status.status !== 'OK') {
        console.warn(`[Stream ${targetVideoId}] Client ${cand.name} status:`, info.playability_status.status, info.playability_status.reason || '');
        continue;
      }

      const adaptive = info.streaming_data?.adaptive_formats || [];
      const combined = info.streaming_data?.formats || [];
      const allFormats = [...adaptive, ...combined];
      const audioFormats = allFormats.filter(f => (f.mime_type?.startsWith('audio/') || f.has_audio));

      if (audioFormats.length > 0) {
        // Ưu tiên itag 140 (AAC 128kbps, audio/mp4) chuẩn Apple iOS hardware decoding
        const potentialFormat =
          audioFormats.find(f => f.itag === 140) ||
          audioFormats.find(f => f.itag === 251) ||
          audioFormats.find(f => f.itag === 139) ||
          audioFormats.find(f => f.mime_type?.startsWith('audio/mp4')) ||
          audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];

        if (potentialFormat) {
          let resolvedUrl = potentialFormat.url;
          if (!resolvedUrl && typeof potentialFormat.decipher === 'function') {
            try {
              resolvedUrl = await potentialFormat.decipher(yt.session.player);
            } catch (decErr) {
              console.warn(`[Stream ${targetVideoId}] Client ${cand.name} decipher failed:`, decErr.message);
            }
          }

          if (resolvedUrl) {
            chosenFormat = potentialFormat;
            streamUrl = resolvedUrl;
            chosenClient = cand;
            break;
          }
        }
      }
    } catch (clientErr) {
      lastError = clientErr;
      console.warn(`[Stream ${targetVideoId}] Client ${cand.name} error:`, clientErr.message);
    }
  }

  if (!chosenFormat || !streamUrl || !chosenClient) {
    throw new Error(`Không tìm thấy luồng âm thanh (${lastError ? lastError.message : 'No audio streams available'})`);
  }

  try {
    const urlObj = new URL(streamUrl);
    if (!urlObj.hostname.endsWith('.googlevideo.com') && !urlObj.hostname.endsWith('.c.youtube.com')) {
      throw new Error(`Unauthorized upstream domain: ${urlObj.hostname}`);
    }
  } catch (e) {
    throw new Error(`Invalid upstream URL: ${e.message}`);
  }

  const streamData = {
    videoId,
    cleanVideoId: targetVideoId,
    url: streamUrl,
    itag: chosenFormat.itag,
    mimeType: chosenFormat.mime_type ? chosenFormat.mime_type.split(';')[0] : 'audio/mp4',
    contentLength: chosenFormat.content_length ? parseInt(chosenFormat.content_length, 10) : null,
    bitrate: chosenFormat.bitrate,
    clientName: chosenClient.name,
    userAgent: chosenClient.userAgent
  };

  if (excludeClients.length === 0) {
    streamCache.set(videoId, streamData);
    if (targetVideoId !== videoId) {
      streamCache.set(targetVideoId, streamData);
    }
  }
  return streamData;
}

// ============================================================================
// 7. REGIONAL GEO-IP & COUNTRY CONFIGURATIONS
// ============================================================================
const COUNTRY_HUBS = {
  VN: {
    code: 'VN',
    name: 'Vietnam',
    flag: '🇻🇳',
    greeting: 'Bảng Xếp Hạng & Xu Hướng Thịnh Hành',
    dailyPlaylistId: 'PL4fGSI1pDJn57DkisEwlIpcs9FAt5yudJ',
    weeklyPlaylistId: 'PL4fGSI1pDJn4FPCRZtojwqQro5GPY6cuV',
    queries: ['nhạc trẻ vpop thịnh hành', 'top bài hát việt nam', 'hit vpop hay nhất hiện nay'],
    genres: ['Tất cả', 'V-Pop', 'Nhạc Trẻ Thịnh Hành', 'Indie Việt', 'Vinahouse', 'Ballad Buồn']
  },
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    greeting: 'Trending & Billboard Charts Today',
    dailyPlaylistId: 'PL4fGSI1pDJn6t3TXLGiiJdD-sZbrG3tG0',
    weeklyPlaylistId: 'PL4fGSI1pDJn69On1f-8NAvX_CYlx7QyZc',
    queries: ['top 100 songs 2026', 'billboard hot 100 hits', 'us pop hits'],
    genres: ['All', 'Billboard Top 100', 'Pop Hits', 'Hip-Hop & Rap', 'R&B', 'Indie Rock']
  },
  KR: {
    code: 'KR',
    name: 'South Korea',
    flag: '🇰🇷',
    greeting: 'K-Pop Melon & Genie Charts',
    dailyPlaylistId: 'PL4fGSI1pDJn6Q7vxp4-2ETPMtSuAPuZ8Y',
    weeklyPlaylistId: 'PL4fGSI1pDJn5S09aId3dUGp40ygUqmPGc',
    queries: ['kpop top hits 2026', 'melon top 100', 'korean pop'],
    genres: ['전체', 'K-Pop Top 100', 'K-Drama OST', 'K-Indie', 'Korean Hip-Hop', 'Ballad']
  },
  JP: {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    greeting: 'J-Pop & Anime Oricon Charts',
    dailyPlaylistId: 'PL4fGSI1pDJn5cKcVCiye7vSc7fpUkPVEi',
    weeklyPlaylistId: 'PL4fGSI1pDJn5FhDrWnRp2NLzJCoPliNgT',
    queries: ['jpop top hits 2026', 'anime opening songs', 'japanese songs'],
    genres: ['すべて', 'J-Pop Oricon', 'Anime OST', 'City Pop', 'J-Rock', 'Vocaloid']
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    greeting: 'Official UK Top 40 & Trending',
    dailyPlaylistId: 'PL4fGSI1pDJn6vTu7hGDifnY39hfhuNTgt',
    weeklyPlaylistId: 'PLywWGW4ILrvpqqkgKRV8jpZMaUPohQipP',
    queries: ['uk top 40 2026', 'british pop hits', 'uk drill'],
    genres: ['All', 'UK Official Top 40', 'Britpop', 'Grime & Drill', 'Indie Alternative', 'EDM']
  },
  GLOBAL: {
    code: 'GLOBAL',
    name: 'Global',
    flag: '🌐',
    greeting: 'Global Hits & Viral 50',
    dailyPlaylistId: 'PL4fGSI1pDJn6t3TXLGiiJdD-sZbrG3tG0',
    weeklyPlaylistId: 'PL4fGSI1pDJn5kI81J1fYWK5eZRl1zJ5kM',
    queries: ['today top hits 2026', 'global viral songs', 'popular songs global'],
    genres: ['All', 'Global Viral 50', "Today's Top Hits", 'Dance & EDM', 'Acoustic Pop', 'Chill Hits']
  }
};

function isCountryCode(value) {
  const code = String(value || '').toUpperCase();
  return /^[A-Z]{2}$/.test(code) && code !== 'XX' && code !== 'T1';
}

function getCountryHub(countryCode) {
  const code = String(countryCode || '').toUpperCase();
  if (COUNTRY_HUBS[code]) return COUNTRY_HUBS[code];
  if (!isCountryCode(code)) return COUNTRY_HUBS.VN;

  let name = code;
  try {
    name = new Intl.DisplayNames(['vi'], { type: 'region' }).of(code) || code;
  } catch (_) {}
  const flag = String.fromCodePoint(...Array.from(code, character => 127397 + character.charCodeAt(0)));
  const currentYear = new Date().getFullYear();

  return {
    code,
    name,
    flag,
    greeting: `${flag} ${name} • Bảng Xếp Hạng & Xu Hướng Thịnh Hành Hôm Nay`,
    genres: ['Tất cả', 'Nhạc thịnh hành', 'Pop', 'Hip-Hop', 'Indie', 'Ballad'],
    queries: [`top songs ${name} ${currentYear}`, `${name} viral songs today`, 'global top hits']
  };
}

const TIMEZONE_TO_COUNTRY = {
  'Asia/Ho_Chi_Minh': 'VN',
  'Asia/Bangkok': 'VN',
  'Asia/Seoul': 'KR',
  'Asia/Tokyo': 'JP',
  'Europe/London': 'GB',
  'America/New_York': 'US',
  'America/Los_Angeles': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US'
};

function detectCountry(req) {
  const queryCountry = req.query.country?.toUpperCase();
  if (queryCountry === 'GLOBAL' || isCountryCode(queryCountry)) return queryCountry;

  const cfCountry = req.headers['cf-ipcountry']?.toUpperCase();
  if (isCountryCode(cfCountry)) return cfCountry;

  const clientTz = req.query.tz;
  if (clientTz && TIMEZONE_TO_COUNTRY[clientTz]) return TIMEZONE_TO_COUNTRY[clientTz];

  const acceptLang = req.headers['accept-language'] || '';
  const languageRegion = acceptLang.match(/(?:^|,)\s*[a-z]{2,3}[-_]([a-z]{2})(?=[;,]|$)/i)?.[1]?.toUpperCase();
  if (isCountryCode(languageRegion)) return languageRegion;

  return 'VN';
}

// Helper nâng cấp độ phân giải hình ảnh sắc nét cao (High-Res 800x800)
function upgradeThumbnailUrl(url) {
  if (!url || typeof url !== 'string') return 'wood_2.jpg';
  // Google User Content (YouTube Music, artists, albums, etc.)
  if (url.includes('googleusercontent.com')) {
    if (/=w\d+-h\d+[^"']*/.test(url)) {
      return url.replace(/=w\d+-h\d+[^"']*/, '=w800-h800-l90-rj');
    }
    if (/=s\d+[^"']*/.test(url)) {
      return url.replace(/=s\d+[^"']*/, '=s800-l90-rj');
    }
    return url + '=w800-h800-l90-rj';
  }
  // YouTube standard thumbnails
  if (url.includes('i.ytimg.com/vi/')) {
    return url.replace(/\/(default|mqdefault|sddefault)\.jpg/, '/hqdefault.jpg');
  }
  return url;
}

// Helper trích xuất thumbnail
function extractThumbnail(thumbnails) {
  if (!thumbnails) return 'wood_2.jpg';
  let rawUrl = 'wood_2.jpg';
  if (Array.isArray(thumbnails) && thumbnails.length > 0) {
    rawUrl = thumbnails[thumbnails.length - 1].url;
  } else if (thumbnails.contents && Array.isArray(thumbnails.contents) && thumbnails.contents.length > 0) {
    rawUrl = thumbnails.contents[thumbnails.contents.length - 1].url;
  } else if (typeof thumbnails === 'string') {
    rawUrl = thumbnails;
  }
  return upgradeThumbnailUrl(rawUrl);
}

function extractArtistThumbnail(item) {
  const artist = item?.artists?.[0] || item?.authors?.[0] || item?.author;
  return artist?.thumbnails ? extractThumbnail(artist.thumbnails) : '';
}

function isTrustedYouTubeArtworkUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    if (url.protocol !== 'https:') return false;
    const host = url.hostname.toLowerCase();
    return ['ytimg.com', 'ggpht.com', 'googleusercontent.com'].some(domain =>
      host === domain || host.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

function getYouTubeMusicArtistResultName(item) {
  const value = item?.name || item?.flex_columns?.[0]?.title?.toString?.() || item?.title?.toString?.();
  return typeof value === 'string' ? value.trim() : String(value || '').trim();
}

function getYouTubeChannelResultName(item) {
  const value = item?.author?.name || item?.name || item?.title?.toString?.();
  return typeof value === 'string' ? value.trim() : String(value || '').trim();
}

function getYouTubeMusicArtistResultThumbnail(item) {
  const thumbnails = item?.thumbnail?.contents || item?.thumbnails?.contents || item?.thumbnails;
  const bestThumbnail = Array.isArray(thumbnails)
    ? [...thumbnails].sort((left, right) =>
      (Number(right?.width) || 0) * (Number(right?.height) || 0) -
      (Number(left?.width) || 0) * (Number(left?.height) || 0)
    )[0]
    : null;
  const url = typeof bestThumbnail?.url === 'string'
    ? upgradeThumbnailUrl(bestThumbnail.url)
    : '';
  return isTrustedYouTubeArtworkUrl(url) ? url : '';
}

function isMatchingOfficialArtistChannel(item, artistKey) {
  const channelName = normalizeForComparison(getYouTubeChannelResultName(item));
  const author = item?.author;
  const isVerified = Boolean(author?.is_verified_artist || author?.is_verified);
  if (channelName === `${artistKey} topic`) return true;

  const officialNames = new Set([
    artistKey,
    `${artistKey} official`,
    `${artistKey} official channel`,
    `${artistKey} official artist channel`,
    `${artistKey} vevo`,
    `${artistKey}vevo`
  ]);
  return isVerified && officialNames.has(channelName);
}

function getYouTubeChannelArtistThumbnail(item) {
  const thumbnails = item?.author?.thumbnails || item?.thumbnails;
  return getYouTubeMusicArtistResultThumbnail({ thumbnails });
}

// ============================================================================
// 7.1. SPAM / AI CONTENT FARM / NONSTOP MIXTAPE FILTER
// ============================================================================
const BLOCKED_SPAM_PATTERNS = [
  /vpop\s*rising/i,
  /vpop\s*plus/i,
  /\bsuno\b/i,
  /\budio\b/i,
  /\bai\s*cover\b/i,
  /\bai\s*version\b/i,
  /\bai\s*music\b/i,
  /\bai\s*song\b/i,
  /\bkaraoke\b/i,
  /\bbeats?\s*chuẩn\b/i,
  /\bplay\s*along\b/i,
  /\btuyển\s*tập\b/i,
  /\bliên\s*khúc\b/i,
  /\bmixtape\b/i,
  /\bnonstop\b/i,
  /\bfull\s*album\b/i,
  /\b1\s*hour\b/i,
  /\b2\s*hour\b/i,
  /\b1\s*tiếng\b/i,
  /\b2\s*tiếng\b/i
];

function isSpamTrack(title, artist, durationSec) {
  const t = (title || '').toLowerCase();
  const a = (artist || '').toLowerCase();

  // Keep alternate performances out of music-source results and regional charts.
  // Check title only so an artist name containing one of these words stays valid.
  const normalizedTitle = normalizeForComparison(t);
  if (/(?:^|\s)(?:remix(?:ed|es)?|remake(?:s)?|covers?)(?=$|\s)/.test(normalizedTitle)) {
    return true;
  }

  // Lọc bài hát đơn lẻ chuẩn: loại bỏ các bản mix quá dài (> 9 phút) hoặc quá ngắn (< 75s)
  if (durationSec > 0 && (durationSec < 75 || durationSec > 540)) {
    return true;
  }

  // Lọc từ khóa spam / kênh bot nhạc AI / mixtape
  for (const regex of BLOCKED_SPAM_PATTERNS) {
    if (regex.test(t) || regex.test(a)) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// 7.2. ALBUM / EP SPAM FILTER
// ============================================================================
const BLOCKED_ALBUM_PATTERNS = [
  /vpop\s*rising/i,
  /vpop\s*plus/i,
  /\bsuno\b/i,
  /\budio\b/i,
  /\bai\s*music\b/i,
  /\bai\s*song\b/i,
  /\bai\s*cover\b/i,
  /\bkaraoke\b/i,
  /\bbeats?\s*chuẩn\b/i,
  /\bkhông\s*lời\b/i,
  /\binstrumental\b/i,
  /\b8d\s*audio\b/i,
  /\b8d\s*songs/i,
  /\bthư\s*giãn\b/i,
  /\bnhạc\s*chill\b/i,
  /\bnhạc\s*ngủ\b/i,
  /\bquán\s*cà\s*phê\b/i,
  /\bquán\s*cafe\b/i,
  /\bnhạc\s*thiền\b/i,
  /\bremix\b/i,
  /\bnonstop\b/i,
  /\btik\s*tok\b/i,
  /\btiktok\b/i,
  /\bchế\b/i
];

function isSpamAlbum(title, artist) {
  const t = (title || '').toLowerCase();
  const a = (artist || '').toLowerCase();
  for (const regex of BLOCKED_ALBUM_PATTERNS) {
    if (regex.test(t) || regex.test(a)) {
      return true;
    }
  }
  return false;
}

// ============================================================================
// 9. MIDDLEWARES & STATIC ASSETS
// ============================================================================
app.use(cors());
app.use(express.json());

// Chỉ phục vụ nội dung web từ public để tránh lộ mã nguồn và dữ liệu trong thư mục gốc.
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================================
// 10. DUAL-MOUNT API ROUTER (Mounts on both /api and / for maximum compatibility)
// ============================================================================
const apiRouter = express.Router();
apiRouter.use('/auth', (req, res, next) => {
  if (IS_SERVERLESS) {
    return res.status(503).json({
      success: false,
      error: 'Tính năng tài khoản cần máy chủ có ổ đĩa lưu trữ bền vững; hãy truy cập máy chủ Android gia đình.'
    });
  }
  if (AUTH_SECRET) return next();

  const configuredSecret = process.env.AUTH_SECRET?.trim();
  const error = configuredSecret
    ? 'AUTH_SECRET must contain at least 32 characters.'
    : 'Configure AUTH_SECRET with at least 32 characters before enabling account features.';
  return res.status(503).json({ success: false, error });
});

// 10.1. Health Check
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    circuitBreaker: circuitBreaker.state,
    caches: {
      search: searchCache.store.size,
      stream: streamCache.store.size,
      trending: trendingCache.store.size
    }
  });
});

// 10.1.1. YouTube Cookie Status Check
apiRouter.get('/cookie-status', (req, res) => {
  const cookie = process.env.YOUTUBE_COOKIE || process.env.COOKIE || '';
  const keys = ['SAPISID', '__Secure-1PSID', '__Secure-3PSID', 'SID', 'HSID', 'SSID', 'APISID', 'LOGIN_INFO', 'VISITOR_INFO1_LIVE', 'PREF', 'YSC'];
  const presentKeys = keys.filter(k => cookie.includes(k + '='));
  res.json({
    hasCookie: Boolean(cookie),
    cookieLength: cookie.length,
    authenticated: Boolean(cookie && (cookie.includes('SID=') || cookie.includes('VISITOR_INFO1_LIVE='))),
    presentKeys,
    instructions: Boolean(cookie)
      ? '✅ Biến môi trường YOUTUBE_COOKIE đã được nạp thành công!'
      : '⚠️ Chưa cấu hình biến môi trường YOUTUBE_COOKIE trên Vercel.'
  });
});

apiRouter.get('/debug-stream/:videoId', async (req, res) => {
  const { videoId } = req.params;
  const cookie = getYouTubeCookie();
  const testClients = [
    { type: ClientType.TV_SIMPLY, name: 'TV_SIMPLY', useCookie: false, genLocally: false },
    { type: ClientType.MUSIC, name: 'MUSIC', useCookie: true, genLocally: false },
    { type: ClientType.WEB, name: 'WEB', useCookie: true, genLocally: false },
    { type: ClientType.MWEB, name: 'MWEB', useCookie: true, genLocally: false },
    { type: ClientType.VISIONOS, name: 'VISIONOS', useCookie: false, genLocally: true },
    { type: ClientType.IOS, name: 'IOS', useCookie: false, genLocally: true }
  ];

  const results = [];
  for (const tc of testClients) {
    try {
      const config = {
        client_type: tc.type,
        cache: new UniversalCache(false),
        generate_session_locally: tc.genLocally
      };
      if (tc.useCookie && cookie) config.cookie = cookie;
      const yt = await Innertube.create(config);
      const info = await yt.getBasicInfo(videoId);
      const adaptive = info.streaming_data?.adaptive_formats || [];
      const combined = info.streaming_data?.formats || [];
      const audio = [...adaptive, ...combined].filter(f => f.mime_type?.startsWith('audio/') || f.has_audio);
      let chosen = null;
      let decipherError = null;
      let decipheredUrl = null;
      try {
        chosen = info.chooseFormat({ type: 'audio', quality: 'best' });
        if (chosen) {
          decipheredUrl = chosen.url;
          if (!decipheredUrl && typeof chosen.decipher === 'function') {
            decipheredUrl = await chosen.decipher(yt.session.player);
          }
        }
      } catch (e) {
        decipherError = e.message;
      }
      results.push({
        client: tc.name,
        playability: info.playability_status?.status,
        reason: info.playability_status?.reason,
        hasStreamingData: Boolean(info.streaming_data),
        audioCount: audio.length,
        chosenItag: chosen?.itag,
        hasUrl: Boolean(decipheredUrl),
        decipherError
      });
    } catch (err) {
      results.push({
        client: tc.name,
        error: err.message
      });
    }
  }
  res.json({ videoId, hasCookie: Boolean(cookie), results });
});

// 10.2. Location & Supported Countries
apiRouter.get('/location', (req, res) => {
  const detectedCode = detectCountry(req);
  const hub = getCountryHub(detectedCode);
  const supportedCountries = Object.values(COUNTRY_HUBS).map(c => ({
    code: c.code,
    name: c.name,
    flag: c.flag
  }));
  if (!supportedCountries.some(country => country.code === hub.code)) {
    supportedCountries.push({ code: hub.code, name: hub.name, flag: hub.flag });
  }

  res.json({
    success: true,
    countryCode: hub.code,
    countryName: hub.name,
    flag: hub.flag,
    greeting: hub.greeting,
    genres: hub.genres,
    supportedCountries
  });
});

// ============================================================================
// 10.3. OFFICIAL CHART METRICS HELPERS
// ============================================================================
function formatYouTubeVideoViews(count) {
  const n = Number(count);
  if (!n || isNaN(n)) return null;
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B lượt xem video';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M lượt xem video';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K lượt xem video';
  return n + ' lượt xem video';
}

const KWORB_SPOTIFY_REGION_SLUGS = {
  VN: 'vn',
  US: 'us',
  KR: 'kr',
  JP: 'jp',
  GB: 'uk',
  GLOBAL: 'global'
};
const SPOTIFY_DAILY_CHART_LIMIT = 100;

function decodeChartHtml(value) {
  return String(value || '')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}

function chartHtmlToText(value) {
  return decodeChartHtml(String(value || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function parseSpotifyDailyChartHtml(html, sourceUrl) {
  const headings = [...String(html || '').matchAll(/<(?:title|h1|h2)\b[^>]*>([\s\S]*?)<\/(?:title|h1|h2)>/gi)]
    .map(match => chartHtmlToText(match[1]));
  const heading = headings.find(text => /spotify daily chart/i.test(text)) || '';
  const dateMatch = heading.match(/\b(20\d{2})[/-](\d{2})[/-](\d{2})\b/) ||
    String(html || '').match(/\b(20\d{2})[/-](\d{2})[/-](\d{2})\b/);
  const chartDate = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : '';
  const tables = [...String(html || '').matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)].map(match => match[1]);

  for (const table of tables) {
    const rows = [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(match => match[1]);
    const parsedRows = rows.map(row => [...row.matchAll(/<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/gi)].map(match => match[1]));
    const headerIndex = parsedRows.findIndex(cells => {
      const names = cells.map(cell => chartHtmlToText(cell).toLowerCase());
      return names.some(name => /^(?:pos|position)$/.test(name)) && names.some(name => name === 'streams');
    });
    if (headerIndex < 0) continue;

    const headers = parsedRows[headerIndex].map(cell => chartHtmlToText(cell).toLowerCase());
    const rankIndex = headers.findIndex(name => /^(?:pos|position)$/.test(name));
    const songIndex = headers.findIndex(name => /artist\s+and\s+title|track/.test(name));
    const streamsIndex = headers.findIndex(name => name === 'streams');
    if (rankIndex < 0 || songIndex < 0 || streamsIndex < 0) continue;

    const entries = [];
    for (const cells of parsedRows.slice(headerIndex + 1)) {
      if (!cells[rankIndex] || !cells[songIndex] || !cells[streamsIndex]) continue;
      const rank = parseInt(chartHtmlToText(cells[rankIndex]).replace(/[^\d]/g, ''), 10);
      const streams = parseInt(chartHtmlToText(cells[streamsIndex]).replace(/[^\d]/g, ''), 10);
      if (!Number.isFinite(rank) || rank < 1 || !Number.isFinite(streams) || streams < 1) continue;

      const songCell = cells[songIndex];
      const links = [...songCell.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
        .map(match => ({ href: decodeChartHtml(match[1]), text: chartHtmlToText(match[2]) }));
      // Kworb uses ../track/... and ../artist/... links inside country pages.
      // Accept those relative paths as well as absolute /spotify/... paths.
      const trackLink = links.find(link => /(?:^|\/)(?:spotify\/)?track\//i.test(link.href));
      if (!trackLink?.text) continue;

      const artists = [...new Set(links
        .filter(link => /(?:^|\/)(?:spotify\/)?artist\//i.test(link.href) && link.text)
        .map(link => link.text))];
      const rowText = chartHtmlToText(songCell);
      const artist = artists.join(', ') || rowText.split(/\s+-\s+/)[0] || '';
      const cleaned = cleanChartSong(trackLink.text, artist);
      if (!cleaned.title || !cleaned.artist || isSpamTrack(cleaned.title, cleaned.artist, 0)) continue;

      entries.push({
        rank,
        title: cleaned.title,
        artist: cleaned.artist,
        artists: artists.length ? artists : [cleaned.artist],
        streams,
        chartTrackUrl: new URL(trackLink.href, sourceUrl).toString()
      });
    }

    if (entries.length >= 25) {
      return {
        chartDate,
        sourceUrl,
        entries: entries.sort((left, right) => left.rank - right.rank)
      };
    }
  }

  throw new Error('Spotify Daily chart table was not found or did not contain enough track rows.');
}

async function fetchSpotifyDailyChart(countryCode) {
  const regionSlug = KWORB_SPOTIFY_REGION_SLUGS[countryCode] ||
    (isCountryCode(countryCode) ? countryCode.toLowerCase() : '');
  if (!regionSlug) throw new Error(`No Spotify daily chart region is configured for ${countryCode}.`);

  // The www hostname currently presents a certificate whose SAN does not
  // match www.kworb.net on Node/Android. The apex hostname serves the same chart
  // with a valid certificate, so use it for the server-side fetch.
  const sourceUrl = `https://kworb.net/spotify/country/${regionSlug}_daily.html`;
  const response = await fetch(sourceUrl, {
    headers: {
      'Accept': 'text/html,application/xhtml+xml',
      'User-Agent': 'Mozilla/5.0 (compatible; MusicHome/1.0; +https://github.com/wwm100107-creator/music-home)'
    },
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error(`Spotify Daily chart source returned HTTP ${response.status}.`);
  return parseSpotifyDailyChartHtml(await response.text(), sourceUrl);
}

function normalizeChartTitle(value) {
  return normalizeForComparison(value).replace(/\b(?:feat|featuring|ft)\b/g, ' ').replace(/\s+/g, ' ').trim();
}

function chartArtistMatches(sourceArtists, candidateArtists) {
  if (!candidateArtists.length) return false;
  return sourceArtists.some(sourceArtist => {
    const sourceKey = normalizeForComparison(sourceArtist);
    if (sourceKey.length < 2) return false;
    return candidateArtists.some(candidateArtist => {
      const candidateKey = normalizeForComparison(candidateArtist);
      return candidateKey === sourceKey || candidateKey.includes(sourceKey) || sourceKey.includes(candidateKey);
    });
  });
}

async function resolveSpotifyChartTrack(ytSearch, chartTrack) {
  const query = `${chartTrack.title} ${chartTrack.artist}`.trim();
  const sourceTitleKey = normalizeChartTitle(chartTrack.title);
  const sourceArtists = chartTrack.artists?.length ? chartTrack.artists : [chartTrack.artist];
  const findMatch = (contents, requirePlayableVideoId = false) => {
    let bestMatch = null;
    let bestScore = -1;

    for (const item of contents) {
      const id = item.id || item.videoId || item.video_id;
      if (!id || (requirePlayableVideoId && !/^[\w-]{11}$/.test(String(id)))) continue;
      const rawTitle = item.title?.text || item.title || '';
      const rawArtists = item.artists?.map(artist => artist?.name || artist).filter(Boolean) || [];
      if (!rawArtists.length && item.author?.name) rawArtists.push(item.author.name);
      const durationSec = parseToDurationSec(item.duration?.seconds || item.duration?.text || item.duration) || 210;
      const cleaned = cleanChartSong(rawTitle, rawArtists.join(', '));
      if (isSpamTrack(cleaned.title, cleaned.artist, durationSec)) continue;

      const candidateTitleKey = normalizeChartTitle(cleaned.title);
      const titleMatches = candidateTitleKey === sourceTitleKey ||
        (sourceTitleKey.length >= 8 && (candidateTitleKey.startsWith(sourceTitleKey) || sourceTitleKey.startsWith(candidateTitleKey)));
      if (!titleMatches) continue;

      const artistMatch = chartArtistMatches(sourceArtists, rawArtists.length ? rawArtists : [cleaned.artist]);
      if (!artistMatch && rawArtists.length) continue;
      const score = (candidateTitleKey === sourceTitleKey ? 2 : 0) + (artistMatch ? 1 : 0);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { item, id, title: cleaned.title, artist: cleaned.artist, durationSec };
      }
    }

    return bestMatch;
  };

  let match = null;
  if (ytSearch.music && typeof ytSearch.music.search === 'function') {
    try {
      const musicResults = await ytSearch.music.search(query, { type: 'song' });
      const songContents = musicResults?.songs?.contents;
      match = findMatch(Array.isArray(songContents) && songContents.length ? songContents : musicResults?.results || []);
    } catch (_) {
      // Use regular YouTube video results below if Music search is unavailable.
    }
  }

  // Some Spotify Daily songs are indexed as YT Music videos rather than songs.
  if (!match && ytSearch.music && typeof ytSearch.music.search === 'function') {
    try {
      const musicVideoResults = await ytSearch.music.search(query, { type: 'video' });
      const videoContents = musicVideoResults?.videos?.contents;
      match = findMatch(Array.isArray(videoContents) && videoContents.length ? videoContents : musicVideoResults?.results || [], true);
    } catch (_) {}
  }

  // A few releases are present only as regular YouTube official videos. Match
  // exact title/artist results as a playable fallback for those chart rows.
  if (!match && typeof ytSearch.search === 'function') {
    try {
      const videoResults = await ytSearch.search(query, { type: 'video' });
      const videoContents = videoResults?.videos?.contents;
      match = findMatch(Array.isArray(videoContents) && videoContents.length ? videoContents : videoResults?.results || [], true);
    } catch (_) {
      // A missing YouTube result must not abort resolution of the rest of the chart.
    }
  }

  if (!match) return null;
  let id = match.id;
  let durationSec = match.durationSec;
  let duration = match.item.duration?.text || formatTimeSec(durationSec);
  const idKey = id.toLowerCase().trim();
  if (KNOWN_CLEAN_TRACKS[idKey]) {
    id = KNOWN_CLEAN_TRACKS[idKey].id;
    duration = KNOWN_CLEAN_TRACKS[idKey].duration || duration;
    durationSec = parseToDurationSec(duration) || durationSec;
  } else if (isLikelyBloatedMV(match.title, durationSec)) {
    try {
      const clean = await getCleanAudioTrack(ytSearch, match.id, match.item);
      if (clean?.id) {
        id = clean.id;
        if (clean.duration) duration = clean.duration;
        if (clean.durationSec) durationSec = clean.durationSec;
      }
    } catch (_) {}
  }

  return {
    id,
    originalVideoId: match.id,
    title: chartTrack.title,
    artist: chartTrack.artist,
    artists: chartTrack.artists,
    album: match.item.album?.name || match.item.album?.title || '',
    albumId: match.item.album?.id || match.item.album?.browseId || '',
    duration,
    durationSec,
    thumbnail: extractThumbnail(match.item.thumbnails || match.item.thumbnail),
    artistThumbnail: extractArtistThumbnail(match.item),
    rank: chartTrack.rank,
    spotifyStreams: chartTrack.streams,
    spotifyStreamsText: `${new Intl.NumberFormat('vi-VN').format(chartTrack.streams)} lượt nghe`,
    chartTrackUrl: chartTrack.chartTrackUrl,
    source: 'spotify-daily-chart'
  };
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(Math.max(1, concurrency), items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      try {
        results[index] = await mapper(items[index], index);
      } catch (_) {
        results[index] = null;
      }
    }
  });
  await Promise.all(workers);
  return results;
}

function cleanChartSong(rawTitle, rawArtist) {
  let title = (rawTitle || '').trim();
  let artist = (rawArtist || '').trim();

  // Bỏ các từ khóa rác YouTube MV
  title = title
    .replace(/\|\s*(OFFICIAL\s*MUSIC\s*VIDEO|OFFICIAL\s*MV|OFFICIAL\s*VIDEO|OFFICIAL|MV|AUDIO|LYRIC\s*VIDEO|PERFORMANCE|Vie\s*Channel[^|]*)/gi, '')
    .replace(/\[(OFFICIAL\s*MUSIC\s*VIDEO|OFFICIAL\s*MV|OFFICIAL\s*VIDEO|OFFICIAL|MV|AUDIO|LYRIC\s*VIDEO|PERFORMANCE)[^\]]*\]/gi, '')
    .replace(/\((OFFICIAL\s*MUSIC\s*VIDEO|OFFICIAL\s*MV|OFFICIAL\s*VIDEO|OFFICIAL|MV|AUDIO|LYRIC\s*VIDEO|PERFORMANCE|Official\s*Video)[^\)]*\)/gi, '')
    .replace(/\|\s*Album[^\-||\n]*/gi, '')
    .replace(/-\s*Track\s*No\.\d+/gi, '')
    .replace(/Official\s*MV/gi, '')
    .replace(/Official\s*Video/gi, '')
    .replace(/['"]+/g, '')
    .trim();

  // Tách theo '|' nếu có
  if (title.includes('|')) {
    const pipeParts = title.split('|').map(s => s.trim()).filter(Boolean);
    if (pipeParts.length >= 2) {
      artist = pipeParts[0];
      title = pipeParts.slice(1).join(' - ');
    } else if (pipeParts.length === 1) {
      title = pipeParts[0];
    }
  }

  // Tách theo ' - '
  if (title.includes(' - ')) {
    const dashParts = title.split(/\s+-\s+/);
    if (dashParts.length >= 2) {
      if (!artist || artist.toLowerCase().includes('topic') || artist.toLowerCase().includes('vevo') || artist.toLowerCase().includes('channel')) {
        artist = dashParts[0].trim();
        title = dashParts.slice(1).join(' - ').trim();
      } else if (dashParts[0].toLowerCase().includes(artist.toLowerCase()) || artist.toLowerCase().includes(dashParts[0].toLowerCase())) {
        artist = dashParts[0].trim();
        title = dashParts.slice(1).join(' - ').trim();
      }
    }
  }

  title = title.replace(/^[\-\—\|\s]+|[\-\—\|\s]+$/g, '').trim();
  artist = artist.replace(/^[\-\—\|\s]+|[\-\—\|\s]+$/g, '').trim();

  return { title: title || rawTitle, artist: artist || rawArtist };
}

function extractTrackGenre(item) {
  const candidates = [
    item?.primaryGenreName,
    item?.genre?.name,
    item?.genre?.text,
    item?.genre,
    item?.category?.name,
    item?.category?.text
  ];
  const genre = candidates.find(value => typeof value === 'string' && value.trim());
  return genre ? genre.trim() : '';
}

function normalizeMusicMetadata(item = {}, source = 'unknown') {
  const artists = Array.isArray(item.artists) && item.artists.length
    ? item.artists.map(artist => String(artist?.name || artist || '').trim()).filter(Boolean)
    : [String(item.primaryArtist || item.artist || '').trim()].filter(Boolean);
  const id = String(item.id || item.videoId || item.releaseId || item.albumId || '');
  const isYouTubeSource = String(source).startsWith('youtube');
  const videoId = String(item.videoId || item.originalVideoId || (isYouTubeSource && /^[\w-]{11}$/.test(id) ? id : ''));
  return {
    ...item,
    id,
    source: String(item.source || source),
    videoId,
    title: String(item.title || item.trackName || 'Bài hát'),
    artists,
    primaryArtist: String(item.primaryArtist || artists[0] || item.artist || ''),
    artist: String(item.artist || item.primaryArtist || artists[0] || ''),
    artistId: String(item.artistId || item.artistMbid || item.artists?.[0]?.id || ''),
    album: String(item.album || item.collectionName || ''),
    albumId: String(item.albumId || item.youtubeAlbumId || (source === 'youtube-music-album' ? item.id : '')),
    releaseId: String(item.releaseId || item.releaseGroupId || ''),
    duration: String(item.duration || ''),
    thumbnail: String(item.thumbnail || ''),
    albumThumbnail: String(item.albumThumbnail || ''),
    sourceThumbnail: String(item.sourceThumbnail || ''),
    artistThumbnail: String(item.artistThumbnail || ''),
    popularity: Number(item.popularity ?? item.rank ?? item.views) || 0,
    publishedAt: String(item.publishedAt || item.releaseDate || '')
  };
}

function getRegionalReleaseArtistNames(track) {
  const title = String(track?.title || '').trim();
  const rawCredits = Array.isArray(track?.artists) && track.artists.length
    ? track.artists.map(artist => String(artist?.name || artist || '').trim()).filter(Boolean)
    : [String(track?.primaryArtist || track?.artist || track?.authors?.[0]?.name || track?.author?.name || '').trim()].filter(Boolean);

  return [...new Set(rawCredits.flatMap(rawCredit => {
    let credit = rawCredit;
    if (title) {
      const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const titlePrefix = credit.match(new RegExp(`^${escapedTitle}\\s*[-–—|:]\\s*(.+)$`, 'i'));
      if (titlePrefix) credit = titlePrefix[1].trim();
    }

    const hasFeaturingCredit = /\b(?:feat\.?|ft\.?)\b|\bwith\b/i.test(credit);
    const names = credit
      .split(/\s*(?:,|&|\+|\bx\b|\bfeat\.?\b|\bft\.?\b|\bwith\b)\s*/i)
      .map(name => name.trim().replace(/^[\s\d.,:;|()[\]{}]+|[\s.,:;|()[\]{}]+$/g, ''))
      .filter(Boolean)
      .map((name, index) => hasFeaturingCredit && index > 0
        ? name.split(/\s+[-–—]\s+/)[0].trim()
        : name)
      .filter(name => {
        const key = normalizeForComparison(name);
        return key.length >= 2 && key.length <= 64 && key !== normalizeForComparison(title) &&
          !/\b(?:official|vevo|topic|channel|visualizer|performance|lyrics|karaoke)\b/.test(key) &&
          !['unknown artist', 'various artists', 'artist'].includes(key);
      });
    return names;
  }))];
}

function getRegionalReleaseArtistCandidates(tracks) {
  const artists = new Map();
  (tracks || []).forEach((track, index) => {
    const rank = Math.max(1, Number(track?.rank) || index + 1);
    getRegionalReleaseArtistNames(track).forEach((name, artistIndex) => {
      const key = normalizeForComparison(name);
      if (!key) return;
      const candidate = artists.get(key) || { key, name, score: 0, firstRank: rank };
      candidate.score += 1 / Math.sqrt(rank) / (artistIndex + 1);
      candidate.firstRank = Math.min(candidate.firstRank, rank);
      artists.set(key, candidate);
    });
  });
  return [...artists.values()].sort((left, right) =>
    right.score - left.score || left.firstRank - right.firstRank || left.name.localeCompare(right.name)
  );
}

function getMusicArtistBrowseId(item) {
  const payload = item?.endpoint?.payload || item?.navigation_endpoint?.payload || {};
  return String(item?.id || payload.browseId || payload.browseEndpoint?.browseId || '').trim();
}

function getMusicNodeText(value) {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value.toString !== 'function') return '';
  const text = value.toString().trim();
  return text === '[object Object]' ? '' : text;
}

async function getOfficialArtistReleases(ytSearch, artist) {
  const cacheKey = `artist-releases:${artist.key}`;
  const cached = artistReleaseCache.get(cacheKey);
  if (cached !== null) return cached;

  try {
    const searchResult = await ytSearch.music.search(artist.name, { type: 'artist' });
    const artistResult = (searchResult?.artists?.contents || []).find(item =>
      normalizeForComparison(getYouTubeMusicArtistResultName(item)) === artist.key
    );
    const artistBrowseId = getMusicArtistBrowseId(artistResult);
    if (!artistResult || (!artistBrowseId.startsWith('UC') && !artistBrowseId.startsWith('FEmusic_library_privately_owned_artist'))) {
      artistReleaseCache.set(cacheKey, [], 30 * 60 * 1000);
      return [];
    }

    const artistPage = await ytSearch.music.getArtist(artistBrowseId);
    const releases = [];
    const seenIds = new Set();
    for (const shelf of artistPage?.sections || []) {
      const shelfTitle = getMusicNodeText(shelf?.header?.title || shelf?.title);
      const shelfKey = normalizeForComparison(shelfTitle);
      const isSinglesShelf = /\bsingles?\b|\beps?\b/.test(shelfKey);
      const isAlbumsShelf = /\balbums?\b/.test(shelfKey);
      if (!isSinglesShelf && !isAlbumsShelf) continue;

      for (const item of shelf?.contents || []) {
        if (item?.item_type && item.item_type !== 'album') continue;
        const albumId = getMusicArtistBrowseId(item);
        if ((!albumId.startsWith('MPR') && !albumId.startsWith('FEmusic_library_privately_owned_release')) || seenIds.has(albumId)) continue;

        const title = getMusicNodeText(item?.title || item?.name);
        const itemArtists = Array.isArray(item?.artists)
          ? item.artists.map(value => String(value?.name || value || '').trim()).filter(Boolean)
          : [];
        const artistNames = itemArtists.length ? [...new Set(itemArtists)] : [artist.name];
        const displayArtist = artistNames.join(', ');
        if (!title || isSpamAlbum(title, displayArtist) || /\b(?:remix(?:ed|es)?|remake|covers?)\b/i.test(title)) continue;

        const thumbnail = extractThumbnail(item?.thumbnail || item?.thumbnails);
        const normalizedTitle = normalizeForComparison(title);
        const type = /\b(?:ep|mini album)\b/.test(normalizedTitle)
          ? 'EP'
          : (isSinglesShelf ? 'Đĩa đơn / EP' : 'Album');
        seenIds.add(albumId);
        releases.push(normalizeMusicMetadata({
          id: albumId,
          albumId,
          releaseId: String(item?.releaseId || item?.releaseGroupId || ''),
          title,
          artist: displayArtist,
          artists: artistNames,
          artistId: String(item?.artists?.[0]?.channel_id || artistBrowseId),
          year: String(item?.year || ''),
          thumbnail,
          albumThumbnail: thumbnail,
          sourceThumbnail: thumbnail,
          type,
          popularity: 0,
          source: 'youtube-music-artist-release'
        }, 'youtube-music-artist-release'));
      }
    }

    artistReleaseCache.set(cacheKey, releases, releases.length ? 24 * 60 * 60 * 1000 : 30 * 60 * 1000);
    return releases;
  } catch (error) {
    console.warn(`[Artist releases unavailable for ${artist.name}]:`, error.message);
    artistReleaseCache.set(cacheKey, [], 10 * 60 * 1000);
    return [];
  }
}

// 10.3. YouTube Music chart playlists by region. These playlist positions are
// not Music Home stream counts and must not be presented as Top/Viral scores.
apiRouter.get('/trending', rateLimit({ maxRequests: 60, windowMs: 60000, endpointName: 'trending' }), async (req, res) => {
  const countryCode = detectCountry(req);
  const hub = getCountryHub(countryCode);
  const timeframe = (req.query.timeframe || 'daily').toLowerCase() === 'weekly' ? 'weekly' : 'daily';
  const cacheKey = `trending:${hub.code}:${timeframe}`;
  const cachedData = trendingCache.get(cacheKey);

  if (cachedData) {
    return res.json({
      ...cachedData,
      cached: true
    });
  }

  try {
    if (!circuitBreaker.canRequest()) {
      throw new Error('Circuit Breaker Active');
    }

    const ytSearch = await getSearchClient();
    let tracks = [];
    let rankingBasis = timeframe === 'daily' ? 'spotify-daily-streams' : 'youtube-music-playlist-order';
    let chartDate = '';
    let chartSourceUrl = '';
    let rankingFallbackReason = '';
    let chartCandidateCount = 0;
    const targetPlaylistId = timeframe === 'weekly' ? hub.weeklyPlaylistId : hub.dailyPlaylistId;

    // Daily charts use Spotify's eligible stream counts from the latest published chart day.
    // Kworb mirrors Spotify's public chart rows; YouTube Music is used only to resolve playable IDs.
    if (timeframe === 'daily') {
      try {
        const dailyChart = await fetchSpotifyDailyChart(hub.code);
        const chartCandidates = dailyChart.entries.slice(0, SPOTIFY_DAILY_CHART_LIMIT);
        chartCandidateCount = chartCandidates.length;
        const resolvedTracks = (await mapWithConcurrency(chartCandidates, 6, chartTrack =>
          resolveSpotifyChartTrack(ytSearch, chartTrack)
        )).filter(Boolean)
          .sort((left, right) => left.rank - right.rank)
          .map(track => ({ ...track, chartDate: dailyChart.chartDate }));

        if (resolvedTracks.length < chartCandidates.length) {
          console.warn(`[Spotify Daily chart] ${resolvedTracks.length}/${chartCandidates.length} songs matched playable YouTube Music results for ${hub.code}.`);
        }

        if (resolvedTracks.length >= 10) {
          tracks = resolvedTracks;
          chartDate = dailyChart.chartDate;
          chartSourceUrl = dailyChart.sourceUrl;
          rankingBasis = 'spotify-daily-streams';
        } else {
          rankingBasis = 'youtube-music-playlist-order';
          rankingFallbackReason = `Only ${resolvedTracks.length} of ${chartCandidates.length} Spotify chart tracks could be resolved to playable YouTube Music tracks.`;
          console.warn(`[Spotify Daily chart] Only ${resolvedTracks.length} playable rows resolved for ${hub.code}; using YouTube Music fallback.`);
        }
      } catch (chartErr) {
        rankingBasis = 'youtube-music-playlist-order';
        rankingFallbackReason = chartErr.message;
        console.warn(`[Spotify Daily chart unavailable for ${hub.code}]:`, chartErr.message);
      }
    }

    // 1. Tải bảng xếp hạng chính thức từ YouTube Music Chart Playlist
    if (tracks.length === 0 && targetPlaylistId && ytSearch.music && typeof ytSearch.music.getPlaylist === 'function') {
      try {
        const pl = await ytSearch.music.getPlaylist(targetPlaylistId);
        const rawItems = pl.items || [];
        const validCandidates = [];

        for (let i = 0; i < rawItems.length; i++) {
          const item = rawItems[i];
          const id = item.id || item.videoId || item.video_id;
          if (!id || validCandidates.some(t => t.id === id)) continue;

          const rawTitle = item.title?.text || item.title || 'Unknown Title';
          const rawArtist = item.authors?.[0]?.name || item.artists?.[0]?.name || item.author?.name || '';
          const cleaned = cleanChartSong(rawTitle, rawArtist);

          const durationSec = parseToDurationSec(item.duration?.seconds || item.duration?.text || item.duration) || 210;
          const duration = item.duration?.text || formatTimeSec(durationSec);

          if (isSpamTrack(cleaned.title, cleaned.artist, durationSec)) continue;

          validCandidates.push({ item, id, cleaned, duration, durationSec });
          if (validCandidates.length >= 50) break;
        }

        const resolvedTracks = await Promise.all(
          validCandidates.map(async (cand, idx) => {
            const candKey = cand.id.toLowerCase().trim();
            let finalId = cand.id;
            let finalDuration = cand.duration;
            let finalDurationSec = cand.durationSec;

            if (KNOWN_CLEAN_TRACKS[candKey]) {
              finalId = KNOWN_CLEAN_TRACKS[candKey].id;
              finalDuration = KNOWN_CLEAN_TRACKS[candKey].duration || cand.duration;
              finalDurationSec = parseToDurationSec(finalDuration) || cand.durationSec;
            } else if (isLikelyBloatedMV(cand.cleaned.title, cand.durationSec)) {
              try {
                const clean = await getCleanAudioTrack(ytSearch, cand.id, cand.item);
                if (clean && clean.id) {
                  finalId = clean.id;
                  if (clean.duration) finalDuration = clean.duration;
                  if (clean.durationSec) finalDurationSec = clean.durationSec;
                }
              } catch (_) {}
            }

            const thumbnail = extractThumbnail(cand.item.thumbnail || cand.item.thumbnails);
            const rank = idx + 1;

            return {
              id: finalId,
              originalVideoId: cand.id,
              title: cand.cleaned.title,
              artist: cand.cleaned.artist,
              artists: cand.cleaned.artist ? [cand.cleaned.artist] : [],
              album: cand.item.album?.name || cand.item.album?.title || '',
              albumId: cand.item.album?.id || cand.item.album?.browseId || '',
              albumThumbnail: cand.item.album?.thumbnails || cand.item.album?.thumbnail
                ? extractThumbnail(cand.item.album.thumbnails || cand.item.album.thumbnail)
                : '',
              genre: extractTrackGenre(cand.item),
              duration: finalDuration,
              durationSec: finalDurationSec,
              thumbnail,
              artistThumbnail: extractArtistThumbnail(cand.item),
              rank,
              views: null,
              youtubeViewsText: null
            };
          })
        );
        tracks = resolvedTracks;
      } catch (chartErr) {
        console.warn(`[Charts Error] Không thể nạp playlist ${targetPlaylistId}:`, chartErr.message);
      }
    }

    // 2. Nếu playlist chart không có kết quả, fallback sang tìm kiếm từ khóa
    if (tracks.length === 0) {
      rankingBasis = 'youtube-music-search-order';
      for (const configuredQuery of hub.queries) {
        const query = configuredQuery.replace(/\b20\d{2}\b/g, String(new Date().getFullYear()));
        try {
          let searchResult = null;
          if (ytSearch.music && typeof ytSearch.music.search === 'function') {
            searchResult = await ytSearch.music.search(query, { type: 'song' });
          } else {
            searchResult = await ytSearch.search(query);
          }

          if (searchResult) {
            const contents = searchResult.songs?.contents || searchResult.results || [];
            const fallbackCandidates = [];
            for (const item of contents) {
              const id = item.id || item.videoId || item.video_id;
              if (!id || tracks.some(t => t.id === id) || fallbackCandidates.some(t => t.id === id)) continue;

              const rawTitle = item.title?.text || item.title || 'Unknown Title';
              const rawArtist = item.artists?.[0]?.name || item.author?.name || '';
              const cleaned = cleanChartSong(rawTitle, rawArtist);

              const durationSec = parseToDurationSec(item.duration?.seconds || item.duration?.text || item.duration) || 210;
              const duration = item.duration?.text || formatTimeSec(durationSec);

              if (isSpamTrack(cleaned.title, cleaned.artist, durationSec)) continue;

              fallbackCandidates.push({ item, id, cleaned, duration, durationSec });
              if (tracks.length + fallbackCandidates.length >= 50) break;
            }

            const resolvedCandidates = await Promise.all(
              fallbackCandidates.map(async (cand) => {
                const candKey = cand.id.toLowerCase().trim();
                let finalId = cand.id;
                let finalDuration = cand.duration;
                let finalDurationSec = cand.durationSec;

                if (KNOWN_CLEAN_TRACKS[candKey]) {
                  finalId = KNOWN_CLEAN_TRACKS[candKey].id;
                  finalDuration = KNOWN_CLEAN_TRACKS[candKey].duration || cand.duration;
                  finalDurationSec = parseToDurationSec(finalDuration) || cand.durationSec;
                } else if (isLikelyBloatedMV(cand.cleaned.title, cand.durationSec)) {
                  try {
                    const clean = await getCleanAudioTrack(ytSearch, cand.id, cand.item);
                    if (clean && clean.id) {
                      finalId = clean.id;
                      if (clean.duration) finalDuration = clean.duration;
                      if (clean.durationSec) finalDurationSec = clean.durationSec;
                    }
                  } catch (_) {}
                }

                const rank = tracks.length + 1;
                const thumbnail = extractThumbnail(cand.item.thumbnails || cand.item.thumbnail);

                return {
                  id: finalId,
                  originalVideoId: cand.id,
                  title: cand.cleaned.title,
                  artist: cand.cleaned.artist,
                  artists: cand.cleaned.artist ? [cand.cleaned.artist] : [],
                  album: cand.item.album?.name || cand.item.album?.title || '',
                  albumId: cand.item.album?.id || cand.item.album?.browseId || '',
                  albumThumbnail: cand.item.album?.thumbnails || cand.item.album?.thumbnail
                    ? extractThumbnail(cand.item.album.thumbnails || cand.item.album.thumbnail)
                    : '',
                  genre: extractTrackGenre(cand.item),
                  duration: finalDuration,
                  durationSec: finalDurationSec,
                  thumbnail,
                  artistThumbnail: extractArtistThumbnail(cand.item),
                  rank,
                  views: null,
                  youtubeViewsText: null
                };
              })
            );
            tracks.push(...resolvedCandidates);
          }
        } catch (err) {
          console.warn(`[Trending] Query "${query}" gặp lỗi:`, err.message);
        }

        if (tracks.length >= 50) break;
      }
    }

    if (tracks.length === 0) rankingBasis = 'no-live-results';

    // YouTube exposes lifetime video views here, not Music Home or daily streams.
    try {
      const topTracks = tracks.slice(0, 3);
      const results = rankingBasis === 'spotify-daily-streams'
        ? null
        : await Promise.race([
          Promise.allSettled(topTracks.map(t => ytSearch.getBasicInfo ? ytSearch.getBasicInfo(t.id) : Promise.resolve(null))),
          new Promise(resolve => setTimeout(() => resolve(null), 800))
        ]);

      if (results && Array.isArray(results)) {
        results.forEach((resItem, idx) => {
          if (resItem && resItem.status === 'fulfilled' && resItem.value?.basic_info?.view_count) {
            const rawViewCount = resItem.value.basic_info.view_count;
            topTracks[idx].views = rawViewCount;
            topTracks[idx].youtubeViewsText = formatYouTubeVideoViews(rawViewCount);
          }
        });
      }
    } catch (viewsErr) {
      console.warn('[Live Views Sync Warning]:', viewsErr.message);
    }

    tracks = tracks.map(track => normalizeMusicMetadata({
      ...track,
      popularity: track.spotifyStreams || track.views || track.rank || 0
    }, track.previewUrl ? 'itunes-preview' : 'youtube-music'));

    const responsePayload = {
      success: true,
      timeframe,
      countryCode: hub.code,
      countryName: hub.name,
      flag: hub.flag,
      greeting: hub.greeting,
      genres: hub.genres,
      rankingBasis,
      rankingFallbackReason,
      chartLimit: rankingBasis === 'spotify-daily-streams' ? SPOTIFY_DAILY_CHART_LIMIT : 0,
      chartCandidateCount: rankingBasis === 'spotify-daily-streams' ? chartCandidateCount : 0,
      chartDate,
      sourceUrl: chartSourceUrl,
      results: tracks,
      tracks: tracks
    };

    trendingCache.set(
      cacheKey,
      responsePayload,
      rankingBasis === 'spotify-daily-streams'
        ? 12 * 60 * 60 * 1000
        : timeframe === 'daily'
          ? 5 * 60 * 1000
          : null
    );
    circuitBreaker.recordSuccess();

    res.json({
      ...responsePayload,
      cached: false
    });
  } catch (error) {
    console.warn('[Trending Source Unavailable]:', error.message);
    const unavailablePayload = {
      success: false,
      timeframe,
      countryCode: hub.code,
      countryName: hub.name,
      flag: hub.flag,
      greeting: hub.greeting,
      genres: hub.genres,
      rankingBasis: 'temporarily-unavailable',
      chartDate: '',
      sourceUrl: '',
      results: [],
      tracks: [],
      cached: false
    };
    res.status(503).json(unavailablePayload);
  }
});

// 10.4.1. YouTube Music and verified YouTube artist-channel portraits for Radio cards
apiRouter.post('/artist-artwork/resolve', rateLimit({ maxRequests: 12, windowMs: 60000, endpointName: 'artist-artwork' }), async (req, res) => {
  const incomingArtists = req.body?.artists;
  if (!Array.isArray(incomingArtists) || incomingArtists.length === 0) {
    return res.status(400).json({ success: false, error: 'artists must be a non-empty array.' });
  }
  if (incomingArtists.length > 48) {
    return res.status(400).json({ success: false, error: 'At most 48 artists can be resolved per request.' });
  }

  const requestedArtists = new Map();
  incomingArtists.forEach(value => {
    if (typeof value !== 'string') return;
    const name = value.replace(/\s+/g, ' ').trim().slice(0, 80);
    const key = normalizeForComparison(name);
    if (key.length >= 2 && !requestedArtists.has(key)) requestedArtists.set(key, name);
  });

  if (!requestedArtists.size) {
    return res.status(400).json({ success: false, error: 'No valid artist names were provided.' });
  }

  try {
    const resolved = new Map();
    const pending = [];
    for (const [key, name] of requestedArtists) {
      const cached = artistArtworkCache.get(key);
      if (cached !== null) {
        resolved.set(key, typeof cached === 'string'
          ? { artistThumbnail: cached, verifiedArtist: Boolean(cached) }
          : cached);
      }
      else pending.push({ key, name });
    }

    if (pending.length) {
      const ytSearch = await getSearchClient();
      let cursor = 0;
      const workerCount = Math.min(4, pending.length);
      await Promise.all(Array.from({ length: workerCount }, async () => {
        while (cursor < pending.length) {
          const current = pending[cursor++];
          let thumbnail = '';
          let verifiedArtist = false;
          try {
            const searchResult = await ytSearch.music.search(current.name, { type: 'artist' });
            const rows = searchResult?.artists?.contents || [];
            const exactArtist = rows.find(row =>
              normalizeForComparison(getYouTubeMusicArtistResultName(row)) === current.key
            );
            verifiedArtist = Boolean(exactArtist);
            thumbnail = exactArtist ? getYouTubeMusicArtistResultThumbnail(exactArtist) : '';
          } catch (error) {
            console.warn(`[Radio Artist Artwork YouTube Music Warning] ${current.name}:`, error.message);
          }

          if (!verifiedArtist) {
            for (const query of [current.name, `${current.name} Official`, `${current.name} Topic`]) {
              try {
                const channelSearch = await ytSearch.search(query, { type: 'channel' });
                const channels = channelSearch?.channels?.contents || channelSearch?.results || [];
                const matchingChannel = channels.find(channel => isMatchingOfficialArtistChannel(channel, current.key));
                if (matchingChannel) {
                  verifiedArtist = true;
                  thumbnail = getYouTubeChannelArtistThumbnail(matchingChannel);
                  break;
                }
              } catch (error) {
                console.warn(`[Radio Artist Artwork YouTube Channel Warning] ${current.name}:`, error.message);
              }
            }
          }

          const artistResult = { artistThumbnail: thumbnail, verifiedArtist };
          resolved.set(current.key, artistResult);
          artistArtworkCache.set(current.key, artistResult, verifiedArtist ? undefined : 10 * 60 * 1000);
        }
      }));
    }

    res.json({
      success: true,
      artists: [...requestedArtists].map(([key, name]) => ({
        name,
        artistThumbnail: resolved.get(key)?.artistThumbnail || '',
        verifiedArtist: Boolean(resolved.get(key)?.verifiedArtist)
      }))
    });
  } catch (error) {
    console.warn('[Radio Artist Artwork Source Unavailable]:', error.message);
    res.status(503).json({ success: false, error: 'YouTube Music artist images are temporarily unavailable.' });
  }
});

// 10.5. Search Tracks (With YouTube live search and iTunes fallback)
apiRouter.get('/search', rateLimit({ maxRequests: 50, windowMs: 60000, endpointName: 'search' }), async (req, res) => {
  const query = req.query.q?.trim();
  if (!query) {
    return res.status(400).json({ error: 'Missing search query (q)' });
  }

  const cacheKey = `search:${query.toLowerCase()}`;
  const cached = searchCache.get(cacheKey);
  if (cached) {
    return res.json({ ...cached, cached: true });
  }

  let tracks = [];

  // Try YouTube Innertube
  try {
    if (circuitBreaker.canRequest()) {
      const ytSearch = await getSearchClient();
      let searchResult;
      try {
        searchResult = await ytSearch.music.search(query, { type: 'song' });
      } catch {
        searchResult = await ytSearch.search(query);
      }

      const contents = searchResult.songs?.contents || searchResult.results || [];
      for (const item of contents) {
        const id = item.id || item.videoId || item.video_id;
        if (!id) continue;

        let title = item.title?.text || item.title || 'Unknown Title';
        let artist = item.artists?.[0]?.name || item.author?.name || '';
        const album = item.album?.name || '';
        let durationSec = parseToDurationSec(item.duration?.seconds || item.duration?.text || item.duration) || 210;
        let duration = item.duration?.text || formatTimeSec(durationSec);

        // Bỏ qua nhạc spam bot AI, tuyển tập, mixtape
        if (isSpamTrack(title, artist, durationSec)) continue;

        let finalId = id;
        const idKey = id.toLowerCase().trim();
        if (KNOWN_CLEAN_TRACKS[idKey]) {
          finalId = KNOWN_CLEAN_TRACKS[idKey].id;
          duration = KNOWN_CLEAN_TRACKS[idKey].duration || duration;
          durationSec = parseToDurationSec(duration) || durationSec;
        } else if (isLikelyBloatedMV(title, durationSec)) {
          try {
            const clean = await getCleanAudioTrack(ytSearch, id, item);
            if (clean && clean.id) {
              finalId = clean.id;
              if (clean.duration) duration = clean.duration;
              if (clean.durationSec) durationSec = clean.durationSec;
            }
          } catch (_) {}
        }

        const thumbnail = extractThumbnail(item.thumbnails || item.thumbnail);

        tracks.push(normalizeMusicMetadata({
          id: finalId,
          originalVideoId: id,
          title,
          artist,
          artists: artist ? [artist] : [],
          album,
          genre: extractTrackGenre(item),
          duration,
          durationSec,
          thumbnail,
          artistThumbnail: extractArtistThumbnail(item)
        }, 'youtube-music'));

        if (tracks.length >= 25) break;
      }
    }
  } catch (err) {
    console.warn('[YouTube Search Warning]:', err.message);
  }

  // Fallback: Nếu YouTube không có kết quả hoặc gặp lỗi, tìm kiếm qua iTunes Search API (100% resilient)
  if (tracks.length === 0) {
    try {
      const itunesRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=25`);
      if (itunesRes.ok) {
        const itunesData = await itunesRes.json();
        for (const item of (itunesData.results || [])) {
          const durationSec = Math.floor((item.trackTimeMillis || 0) / 1000);
          const m = Math.floor(durationSec / 60);
          const s = durationSec % 60;
          tracks.push(normalizeMusicMetadata({
            id: `itunes_${item.trackId}`,
            title: item.trackName || 'Unknown Title',
            artist: item.artistName || '',
            artists: item.artistName ? [item.artistName] : [],
            album: item.collectionName || '',
            genre: item.primaryGenreName || '',
            duration: `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
            durationSec,
            thumbnail: item.artworkUrl100?.replace('100x100bb', '300x300bb') || 'wood_2.jpg',
            previewUrl: item.previewUrl
          }, 'itunes-preview'));
        }
      }
    } catch (itunesErr) {
      console.warn('[iTunes Fallback Search Warning]:', itunesErr.message);
    }
  }

  const payload = {
    success: true,
    query,
    results: tracks,
    tracks
  };

  searchCache.set(cacheKey, payload);
  circuitBreaker.recordSuccess();

  res.json({ ...payload, cached: false });
});

// 10.4.1. Regional EP / Album Scanner & Album Search
apiRouter.get('/albums', rateLimit({ maxRequests: 60, windowMs: 60000, endpointName: 'albums' }), async (req, res) => {
  const searchQuery = req.query.q?.trim();
  const countryCode = detectCountry(req);
  const hub = getCountryHub(countryCode);

  const cacheKey = searchQuery
    ? `albums:search:${searchQuery.toLowerCase()}`
    : `albums:artist-releases:${hub.code}`;

  const cachedData = albumCache.get(cacheKey);
  if (cachedData) {
    return res.json({ ...cachedData, cached: true });
  }

  let albums = [];

  try {
    if (!circuitBreaker.canRequest()) {
      throw new Error('Circuit Breaker Active');
    }

    const ytSearch = await getSearchClient();

    if (searchQuery) {
      // 1. Tìm kiếm Album theo truy vấn
      const searchRes = await ytSearch.music.search(searchQuery, { type: 'album' });
      const contents = searchRes.albums?.contents || searchRes.results || [];
      for (const item of contents) {
        const id = item.id;
        if (!id || albums.some(a => a.id === id)) continue;
        const title = item.title?.text || item.title?.toString() || 'Album';
        const artist = item.author?.name || item.artists?.[0]?.name || '';
        if (!artist || isSpamAlbum(title, artist)) continue;

        const thumbnail = extractThumbnail(item.thumbnails || item.thumbnail);
        const year = item.year ? String(item.year) : '';
        const lowerTitle = title.toLowerCase();
        const isEP = lowerTitle.includes('ep') || lowerTitle.includes('single') || lowerTitle.includes('mini');
        const albumType = isEP ? 'EP' : 'Album';

        albums.push(normalizeMusicMetadata({
          id,
          albumId: id,
          releaseId: item.releaseId || item.releaseGroupId || '',
          source: 'youtube-music-album',
          title,
          artist,
          year,
          thumbnail,
          type: albumType,
          artists: artist ? [artist] : []
        }, 'youtube-music-album'));

        if (albums.length >= 10) break;
      }
    } else {
      // Resolve official artist pages from this region's chart, then read their
      // Albums and Singles & EPs shelves. Track album metadata often points to
      // compilations or TV-show playlists, so it is not reliable release data.
      let trendTracks = trendingCache.get(`trending:${hub.code}:daily`)?.tracks || [];
      if (!trendTracks.length && hub.dailyPlaylistId && ytSearch.music?.getPlaylist) {
        const playlist = await ytSearch.music.getPlaylist(hub.dailyPlaylistId);
        trendTracks = playlist.items || [];
      }

      const artistCandidates = getRegionalReleaseArtistCandidates(trendTracks).slice(0, 14);
      const releasesByArtist = new Array(artistCandidates.length);
      let cursor = 0;
      const workerCount = Math.min(4, artistCandidates.length);
      await Promise.all(Array.from({ length: workerCount }, async () => {
        while (cursor < artistCandidates.length) {
          const index = cursor++;
          releasesByArtist[index] = await getOfficialArtistReleases(ytSearch, artistCandidates[index]);
        }
      }));

      const seenReleaseIds = new Set();
      albums = releasesByArtist
        .filter(Array.isArray)
        .map(releases => releases.find(release => {
          const releaseId = String(release.albumId || release.id || '');
          if (!releaseId || seenReleaseIds.has(releaseId)) return false;
          seenReleaseIds.add(releaseId);
          return true;
        }))
        .filter(Boolean)
        .slice(0, 10);
    }

    const payload = {
      success: true,
      countryCode: hub.code,
      countryName: hub.name,
      flag: hub.flag,
      query: searchQuery || '',
      rankingBasis: searchQuery ? 'youtube-music-album-search' : 'trending-artists-official-releases',
      results: albums,
      albums
    };

    albumCache.set(cacheKey, payload);
    circuitBreaker.recordSuccess();
    res.json({ ...payload, cached: false });
  } catch (error) {
    console.warn('[Albums Source Unavailable]:', error.message);
    res.status(503).json({
      success: false,
      countryCode: hub.code,
      countryName: hub.name,
      flag: hub.flag,
      query: searchQuery || '',
      results: [],
      albums: [],
      error: 'Album source is temporarily unavailable.'
    });
  }
});

// 10.4.2. Album Detail & Tracklist (Ưu tiên Official Lyrics Video & Chuẩn hóa thời lượng)
apiRouter.get('/album/:albumId', rateLimit({ maxRequests: 80, windowMs: 60000, endpointName: 'album-details' }), async (req, res) => {
  const { albumId } = req.params;
  if (!albumId) {
    return res.status(400).json({ error: 'Missing albumId' });
  }

  const cacheKey = `album_detail_v3_lyric:${albumId}`;
  const cached = albumCache.get(cacheKey);
  if (cached) {
    return res.json({ ...cached, cached: true });
  }

  try {
    const ytSearch = await getSearchClient();
    const albumData = await ytSearch.music.getAlbum(albumId);

    const title = albumData.header?.title?.toString() || albumData.title?.toString() || 'Album';
    const subtitle = albumData.header?.subtitle?.toString() || '';
    const thumbnail = extractThumbnail(albumData.header?.thumbnail?.contents || albumData.header?.thumbnails || albumData.thumbnails);

    let artist = albumData.header?.strapline_text_one?.toString() || '';
    if (!artist && subtitle) {
      const parts = subtitle.split('•').map(s => s.trim());
      if (parts.length > 1) artist = parts[0];
    }
    if (!artist) {
      artist = albumData.author?.name || albumData.artists?.[0]?.name || '';
    }

    const rawContents = albumData.contents || [];

    // Tối ưu và chuẩn hóa: Lấy đúng bản Studio Audio / Official Lyrics Video & thời lượng thực tế
    const resolvedTracks = await Promise.all(
      rawContents.map(async (item) => {
        const id = item.id || item.videoId;
        if (!id) return null;

        const trackTitle = item.title?.text || item.title?.toString() || 'Unknown Track';
        const trackArtist = item.author?.name || item.artists?.[0]?.name || artist;
        let duration = item.duration?.text || (item.duration ? String(item.duration) : '3:30');
        let durationSec = item.duration?.seconds || 210;
        let finalId = id;

        try {
          const clean = await getCleanAudioTrack(ytSearch, id, item);
          if (clean && clean.id) {
            finalId = clean.id;
            if (clean.duration) duration = clean.duration;
            if (clean.durationSec) durationSec = clean.durationSec;
          }
        } catch (_) {}

        return normalizeMusicMetadata({
          id: finalId,
          originalVideoId: id,
          title: trackTitle,
          artist: trackArtist,
          artists: trackArtist ? [trackArtist] : [],
          album: title,
          albumId,
          source: 'youtube-music',
          duration,
          durationSec,
          thumbnail,
          artistThumbnail: extractArtistThumbnail(item)
        }, 'youtube-music');
      })
    );

    const tracks = resolvedTracks.filter(Boolean);

    const lowerTitle = title.toLowerCase();
    const isEP = lowerTitle.includes('ep') || lowerTitle.includes('single') || (subtitle || '').toLowerCase().includes('ep');
    const albumType = isEP ? 'EP' : 'Album';

    const payload = {
      success: true,
      album: {
        id: albumId,
        albumId,
        releaseId: albumData.releaseId || albumData.releaseGroupId || '',
        title,
        artist,
        subtitle,
        thumbnail,
        type: albumType,
        trackCount: tracks.length,
        tracks
      }
    };

    albumCache.set(cacheKey, payload);
    res.json({ ...payload, cached: false });
  } catch (err) {
    console.warn(`[Album Detail Source Unavailable for ${albumId}]:`, err.message);
    res.status(503).json({ success: false, error: 'Album source is temporarily unavailable.' });
  }
});

// 10.5. Audio Stream Proxy (VisionOS Unthrottled Audio Stream)
const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{10,12}$/;


apiRouter.get('/stream/:videoId', rateLimit({ maxRequests: 150, windowMs: 60000, endpointName: 'stream' }), async (req, res) => {
  const { videoId } = req.params;

  if (videoId.startsWith('itunes_')) {
    return res.status(400).json({ error: 'iTunes track previews are played directly' });
  }

  if (!VIDEO_ID_REGEX.test(videoId)) {
    return res.status(400).json({ error: 'Invalid YouTube Video ID format' });
  }

  try {
    let streamData;
    try {
      streamData = await resolveAudioStream(videoId);
    } catch (resolveErr) {
      console.warn(`[Stream] Cache refresh for ${videoId}:`, resolveErr.message);
      streamData = await resolveAudioStream(videoId, true);
    }

    // Chỉ chuyển hướng 302 nếu client yêu cầu rõ ràng qua query parameter ?redirect=1
    // MẶC ĐỊNH BẮT BUỘC PROXY STREAM để không bị lỗi 403 Forbidden do Google Video CDN khóa IP client!
    if (req.query.redirect === '1') {
      return res.redirect(302, streamData.url);
    }

    const rangeHeader = req.headers.range || 'bytes=0-';
    const upstreamHeaders = {
      'User-Agent':
        streamData.userAgent || 'com.google.ios.youtube/19.45.4 (iPhone16,2; U; CPU iOS 18_1 like Mac OS X;)',
      'Range': rangeHeader,
      'Accept': '*/*',
      'Origin': 'https://www.youtube.com',
      'Referer': 'https://www.youtube.com'
    };

    const abortController = new AbortController();
    req.on('close', () => abortController.abort());

    let upstreamResponse = await fetch(streamData.url, {
      headers: upstreamHeaders,
      signal: abortController.signal
    });

    if (upstreamResponse.status === 403) {
      console.warn(`[Stream] Upstream 403 for ${videoId} with ${streamData.clientName || 'current client'}. Attempting fallback client...`);
      streamCache.delete(videoId);
      try {
        streamData = await resolveAudioStream(videoId, true, streamData.clientName ? [streamData.clientName] : []);
        const retryHeaders = {
          ...upstreamHeaders,
          'User-Agent': streamData.userAgent || upstreamHeaders['User-Agent']
        };
        upstreamResponse = await fetch(streamData.url, {
          headers: retryHeaders,
          signal: abortController.signal
        });
      } catch (retryErr) {
        console.warn(`[Stream Retry Fail for ${videoId}]:`, retryErr.message);
      }
    }

    if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
      console.warn(`[Stream Proxy Fail] Status ${upstreamResponse.status}. Video stream unavailable.`);
      return res.status(upstreamResponse.status || 502).json({
        error: 'Stream upstream failed',
        status: upstreamResponse.status,
        videoId
      });
    }

    circuitBreaker.recordSuccess();

    res.status(upstreamResponse.status);

    const headersToProxy = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'last-modified',
      'etag'
    ];

    for (const h of headersToProxy) {
      const val = upstreamResponse.headers.get(h);
      if (val) res.setHeader(h, val);
    }

    if (!res.getHeader('content-type')) {
      res.setHeader('content-type', streamData.mimeType || 'audio/mp4');
    }
    if (!res.getHeader('accept-ranges')) {
      res.setHeader('accept-ranges', 'bytes');
    }
    res.setHeader('cache-control', 'public, max-age=3600, s-maxage=3600');

    if (upstreamResponse.body) {
      const { Readable } = await import('stream');
      const nodeStream = Readable.fromWeb(upstreamResponse.body);
      nodeStream.on('error', (err) => {
        if (err.name === 'AbortError' || err.code === 'ERR_STREAM_PREMATURE_CLOSE') return;
        console.warn(`[Stream readable error ${videoId}]:`, err.message);
      });
      res.on('error', (err) => {
        if (err.code === 'ERR_STREAM_PREMATURE_CLOSE' || err.code === 'ECONNRESET') return;
        console.warn(`[Stream res error ${videoId}]:`, err.message);
      });
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    if (error.name === 'AbortError') return;
    circuitBreaker.recordFailure(error.status || 500);
    console.error(`[Stream Error ${videoId}]:`, error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Stream failed', message: error.message });
    }
  }
});

// 10.6. Video Info
apiRouter.get('/info/:videoId', async (req, res) => {
  const { videoId } = req.params;
  if (!VIDEO_ID_REGEX.test(videoId)) {
    return res.status(400).json({ error: 'Invalid YouTube Video ID format' });
  }

  try {
    const ytSearch = await getSearchClient();
    const cleanTrack = await getCleanAudioTrack(ytSearch, videoId);
    const targetId = (cleanTrack && cleanTrack.id) ? cleanTrack.id : videoId;
    const info = await ytSearch.getBasicInfo(targetId);
    const sec = cleanTrack?.durationSec || info.basic_info?.duration || 210;
    const m = Math.floor(sec / 60);
    const s = sec % 60;

    res.json({
      id: targetId,
      originalId: videoId,
      title: cleanTrack?.title || info.basic_info?.title,
      artist: cleanTrack?.artist || info.basic_info?.author,
      duration: cleanTrack?.duration || `${m}:${String(s).padStart(2, '0')}`,
      durationSec: sec,
      thumbnail: extractThumbnail(info.basic_info?.thumbnail)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch video info', message: err.message });
  }
});

// ============================================================================
// 10.6. SPOTIFY-STYLE REAL-TIME SYNCED LYRICS (LRCLIB & GENIUS VERIFIED ENGINE)
// ============================================================================

/**
 * Chuẩn hoá chuỗi để so sánh tên bài hát và nghệ sĩ.
 * Loại bỏ dấu tiếng Việt, chữ thường hoá, bỏ ký tự đặc biệt, chuẩn hoá khoảng trắng.
 */
function normalizeForComparison(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Trích xuất tên bài hát và ca sĩ thực sự từ tiêu đề video YouTube.
 * Loại bỏ toàn bộ các tiền tố, hậu tố, metadata rác (MV, Official, Album, Track No...).
 */
function extractSongAndArtist(rawTitle, rawArtist) {
  if (!rawTitle) return { title: '', artist: '' };

  let title = rawTitle;

  // 1. Loại bỏ các thẻ metadata trong ngoặc vuông / tròn
  title = title.replace(/\s*[\(\[](official\s*(music\s*)?(video|audio|mv|lyric|lyrics|visualizer)?|mv|video\s*lyric|audio|hd|4k|remix|cover|live|vietsub|karaoke|beat|instrumental|special\s*stage)[\)\]]/gi, '');
  title = title.replace(/\s*-\s*(official\s*(mv|music\s*video|audio|video)?|mv|audio|remix|cover|lyric\s*video|lyrics).*/gi, '');
  
  // 2. Loại bỏ các đoạn sau dấu gạch ngang hoặc pipe chỉ album/track/nhà đài
  title = title.replace(/\|\s*(album\b|track\s*no\b|tập\b|phim\s*ngắn\b|short\s*film\b|vie\s*channel|yeah1|metub|pops).*/gi, '');
  title = title.replace(/-\s*(album\b|track\s*no\b).*/gi, '');

  let detectedArtist = (rawArtist || '').replace(/ - Topic|Official|Vevo|Channel/gi, '').trim();
  let detectedTitle = title;

  // 3. Tách theo dấu sổ dọc '|' nếu có
  if (title.includes('|')) {
    const parts = title.split('|').map(p => p.trim()).filter(Boolean);
    const nonMeta = parts.filter(p => !/^(official|mv|audio|video|album|track\s*no|vie\s*channel|yeah1|metub|pops)/i.test(p));
    if (nonMeta.length >= 2) {
      detectedArtist = nonMeta[0];
      detectedTitle = nonMeta[1];
    } else if (nonMeta.length === 1) {
      detectedTitle = nonMeta[0];
    }
  } 
  // 4. Tách theo ' - ' nếu có
  else if (detectedTitle.includes(' - ')) {
    const parts = detectedTitle.split(' - ').map(p => p.trim()).filter(Boolean);
    if (parts.length === 2) {
      if (detectedArtist && normalizeForComparison(parts[1]).includes(normalizeForComparison(detectedArtist))) {
        detectedArtist = parts[1];
        detectedTitle = parts[0];
      } else {
        detectedArtist = parts[0];
        detectedTitle = parts[1];
      }
    } else if (parts.length > 2) {
      // Trường hợp như: JACK - J97 - NGƯỜI DƯNG
      detectedArtist = parts.slice(0, parts.length - 1).join(' - ');
      detectedTitle = parts[parts.length - 1];
    }
  }

  // 5. Làm sạch lần cuối
  detectedTitle = detectedTitle
    .replace(/[\(\[].*?[\)\]]/g, '')
    .replace(/\s+(ft\.?|feat\.?)\s+.*/gi, '')
    .trim();

  detectedArtist = detectedArtist
    .replace(/ - Topic|Official|Vevo|Channel/gi, '')
    .trim();

  return {
    title: detectedTitle || rawTitle.trim(),
    artist: detectedArtist || (rawArtist || '').trim()
  };
}

function parseDurationToSeconds(duration) {
  if (!duration) return null;
  if (typeof duration === 'number') return Math.round(duration);
  const parts = String(duration).split(':').map(p => parseInt(p, 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  const num = parseInt(duration, 10);
  return isNaN(num) ? null : num;
}

function parseLRC(lrcText) {
  if (!lrcText || typeof lrcText !== 'string') return [];
  const lines = lrcText.split(/\r?\n/);
  const parsed = [];
  let fileOffsetSec = 0;

  for (const line of lines) {
    const offsetMatch = line.match(/^\[offset:\s*([+-]?\d+)\s*\]/i);
    if (offsetMatch) {
      const ms = parseInt(offsetMatch[1], 10);
      if (!isNaN(ms)) {
        fileOffsetSec = ms / 1000;
      }
    }
  }

  const lineTimeTagRegex = /\[(\d{1,3}):(\d{2})(?:[.,](\d{1,3}))?\]/g;
  const wordTimeTagRegex = /<(\d{1,3}):(\d{2})(?:[.,](\d{1,3}))?>/g;
  const toSeconds = match => {
    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);
    const fraction = match[3] ? parseFloat(`0.${match[3]}`) : 0;
    return minutes * 60 + seconds + fraction;
  };
  const withOffset = time => parseFloat(Math.max(0, time + fileOffsetSec).toFixed(2));

  for (const line of lines) {
    if (/^\[[a-zA-Z]+:/.test(line)) continue;

    const lineMatches = [...line.matchAll(lineTimeTagRegex)];
    const content = line.replace(lineTimeTagRegex, '').trim();
    const wordMatches = [...content.matchAll(wordTimeTagRegex)];
    if (!lineMatches.length && !wordMatches.length) continue;

    const wordTimes = [];
    const appendWord = (time, segment) => {
      if (!segment) return;
      let wordText = segment;
      const previousText = wordTimes[wordTimes.length - 1]?.text || '';
      if (previousText && !/\s$/u.test(previousText) && !/^\s/u.test(wordText) &&
          /[\p{Script=Latin}\p{N}]$/u.test(previousText) && /^[\p{Script=Latin}\p{N}]/u.test(wordText)) {
        wordText = ` ${wordText}`;
      }
      wordTimes.push({ time: withOffset(time), text: wordText });
    };
    let text = content;
    if (wordMatches.length) {
      let cursor = 0;
      let segmentTime = lineMatches.length ? toSeconds(lineMatches[0]) : toSeconds(wordMatches[0]);
      for (const wordMatch of wordMatches) {
        const segment = content.slice(cursor, wordMatch.index);
        appendWord(segmentTime, segment);
        segmentTime = toSeconds(wordMatch);
        cursor = wordMatch.index + wordMatch[0].length;
      }
      const lastSegment = content.slice(cursor);
      appendWord(segmentTime, lastSegment);
      text = wordTimes.map(word => word.text).join('').trim();
    }

    const times = lineMatches.length ? lineMatches.map(toSeconds) : [toSeconds(wordMatches[0])];
    for (const time of times) {
      parsed.push({
        time: withOffset(time),
        text,
        ...(wordTimes.length ? { words: wordTimes } : {})
      });
    }
  }
  return parsed.sort((a, b) => a.time - b.time);
}

function normalizeLyricsAlignmentToken(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^\p{L}\p{N}]/gu, '');
}

async function fetchYouTubeCaptionWords(videoId) {
  if (!/^[\w-]{11}$/.test(String(videoId || ''))) return [];
  const cacheKey = `yt-captions:${videoId}`;
  const cachedCaptions = youtubeCaptionCache.get(cacheKey);
  if (cachedCaptions) return cachedCaptions;

  const loadCaptions = (async () => {
    try {
      const youtube = await getSearchClient();
      const videoInfo = await youtube.getInfo(videoId);
      const transcriptInfo = await videoInfo.getTranscript();
      const segments = transcriptInfo.transcript?.content?.body?.initial_segments || [];
      const captionWords = [];

      for (const segment of segments) {
        const snippet = segment.snippet?.toString?.().trim() || '';
        if (!snippet || /^\[.*\]$/u.test(snippet)) continue;

        const tokens = snippet.match(/\S+/gu) || [];
        const normalizedTokens = tokens.map(text => ({ text, normalized: normalizeLyricsAlignmentToken(text) }))
          .filter(token => token.normalized);
        if (!normalizedTokens.length) continue;

        const startMs = Number(segment.start_ms);
        const endMs = Number(segment.end_ms);
        if (!Number.isFinite(startMs) || startMs < 0) continue;

        const startTime = startMs / 1000;
        const endTime = Number.isFinite(endMs) && endMs > startMs
          ? endMs / 1000
          : startTime + Math.max(0.35, normalizedTokens.length * 0.28);
        const totalWeight = normalizedTokens.reduce((sum, token) => sum + Math.max(1, Math.sqrt(Array.from(token.text).length)), 0);
        let elapsedWeight = 0;

        for (const token of normalizedTokens) {
          captionWords.push({
            ...token,
            time: startTime + ((endTime - startTime) * elapsedWeight / totalWeight)
          });
          elapsedWeight += Math.max(1, Math.sqrt(Array.from(token.text).length));
        }

        if (captionWords.length > 1800) return [];
      }

      return captionWords;
    } catch {
      return [];
    }
  })();

  let timeoutId;
  try {
    const captionWords = await Promise.race([
      loadCaptions,
      new Promise(resolve => {
        timeoutId = setTimeout(() => resolve([]), 4500);
      })
    ]);
    youtubeCaptionCache.set(cacheKey, captionWords, captionWords.length ? 6 * 60 * 60 * 1000 : 5 * 60 * 1000);
    return captionWords;
  } finally {
    clearTimeout(timeoutId);
  }
}

function alignLyricsLinesToYouTubeCaptions(lines, captionWords) {
  if (!Array.isArray(lines) || !Array.isArray(captionWords) || captionWords.length < 8) return null;

  const lyricWordChunks = lines.map(line => {
    const text = String(line?.text || '').trim();
    if (/^\[.*\]$/u.test(text)) return [];
    return (text.match(/\S+\s*/gu) || []).map(word => ({ text: word, tokenIndex: -1 }));
  });
  const lyricTokens = [];

  lyricWordChunks.forEach((words, lineIndex) => {
    words.forEach((word, wordIndex) => {
      const normalized = normalizeLyricsAlignmentToken(word.text);
      if (!normalized) return;
      word.tokenIndex = lyricTokens.length;
      lyricTokens.push({ normalized, lineIndex, wordIndex, time: null });
    });
  });

  const lyricCount = lyricTokens.length;
  const captionCount = captionWords.length;
  if (lyricCount < 8 || (lyricCount + 1) * (captionCount + 1) > 1500000) return null;

  // Sequence alignment tolerates small caption omissions/recognition errors while preserving order.
  const columns = captionCount + 1;
  const cellCount = (lyricCount + 1) * columns;
  const distance = new Uint32Array(cellCount);
  const trace = new Uint8Array(cellCount);

  for (let i = 1; i <= lyricCount; i++) {
    distance[i * columns] = i;
    trace[i * columns] = 2; // lyric word omitted from captions
  }
  for (let j = 1; j <= captionCount; j++) {
    distance[j] = j;
    trace[j] = 3; // extra caption word
  }

  for (let i = 1; i <= lyricCount; i++) {
    const lyricToken = lyricTokens[i - 1].normalized;
    for (let j = 1; j <= captionCount; j++) {
      const cell = i * columns + j;
      const diagonal = distance[(i - 1) * columns + j - 1] + (lyricToken === captionWords[j - 1].normalized ? 0 : 1);
      const omitLyric = distance[(i - 1) * columns + j] + 1;
      const extraCaption = distance[i * columns + j - 1] + 1;

      let best = diagonal;
      let direction = 1;
      if (omitLyric < best) {
        best = omitLyric;
        direction = 2;
      }
      if (extraCaption < best) {
        best = extraCaption;
        direction = 3;
      }
      distance[cell] = best;
      trace[cell] = direction;
    }
  }

  let i = lyricCount;
  let j = captionCount;
  let matchedCount = 0;
  while (i > 0 || j > 0) {
    const direction = trace[i * columns + j];
    if (i > 0 && j > 0 && direction === 1) {
      if (lyricTokens[i - 1].normalized === captionWords[j - 1].normalized) {
        lyricTokens[i - 1].time = captionWords[j - 1].time;
        matchedCount++;
      }
      i--;
      j--;
    } else if (i > 0 && (direction === 2 || j === 0)) {
      i--;
    } else if (j > 0) {
      j--;
    } else {
      break;
    }
  }

  const lyricCoverage = matchedCount / lyricCount;
  const overallCoverage = matchedCount / Math.max(lyricCount, captionCount);
  if (matchedCount < Math.min(10, lyricCount) || lyricCoverage < 0.72 || overallCoverage < 0.58) return null;

  // Nội suy các từ bị phụ đề bỏ sót giữa các từ đã khớp.
  const previousAnchor = new Int32Array(lyricCount);
  const nextAnchor = new Int32Array(lyricCount);
  let anchor = -1;
  for (let tokenIndex = 0; tokenIndex < lyricCount; tokenIndex++) {
    if (lyricTokens[tokenIndex].time !== null) anchor = tokenIndex;
    previousAnchor[tokenIndex] = anchor;
  }
  anchor = -1;
  for (let tokenIndex = lyricCount - 1; tokenIndex >= 0; tokenIndex--) {
    if (lyricTokens[tokenIndex].time !== null) anchor = tokenIndex;
    nextAnchor[tokenIndex] = anchor;
  }

  for (let tokenIndex = 0; tokenIndex < lyricCount; tokenIndex++) {
    if (lyricTokens[tokenIndex].time !== null) continue;
    const previous = previousAnchor[tokenIndex];
    const next = nextAnchor[tokenIndex];
    if (previous >= 0 && next >= 0) {
      const progress = (tokenIndex - previous) / (next - previous);
      lyricTokens[tokenIndex].time = lyricTokens[previous].time +
        ((lyricTokens[next].time - lyricTokens[previous].time) * progress);
    } else if (next >= 0) {
      lyricTokens[tokenIndex].time = Math.max(0, lyricTokens[next].time - ((next - tokenIndex) * 0.32));
    } else if (previous >= 0) {
      lyricTokens[tokenIndex].time = lyricTokens[previous].time + ((tokenIndex - previous) * 0.32);
    }
  }

  const alignedLines = lines.map((line, lineIndex) => {
    const words = lyricWordChunks[lineIndex].map((word, wordIndex) => {
      if (word.tokenIndex >= 0) {
        return { text: word.text, time: parseFloat(lyricTokens[word.tokenIndex].time.toFixed(3)) };
      }

      const previousWord = lyricWordChunks[lineIndex].slice(0, wordIndex).reverse().find(item => item.tokenIndex >= 0);
      const nextWord = lyricWordChunks[lineIndex].slice(wordIndex + 1).find(item => item.tokenIndex >= 0);
      const time = previousWord
        ? lyricTokens[previousWord.tokenIndex].time
        : nextWord
          ? lyricTokens[nextWord.tokenIndex].time
          : Number(line?.time) || 0;
      return { text: word.text, time: parseFloat(time.toFixed(3)) };
    });

    const firstWordTime = words.find(word => normalizeLyricsAlignmentToken(word.text))?.time;
    return {
      ...line,
      time: firstWordTime ?? (Number.isFinite(Number(line?.time)) ? Number(line.time) : 0),
      words,
      wordsEstimated: false
    };
  });

  for (let lineIndex = 0; lineIndex < alignedLines.length; lineIndex++) {
    if (lyricWordChunks[lineIndex].length > 0) continue;
    const nextLine = alignedLines.slice(lineIndex + 1).find((line, index) => lyricWordChunks[lineIndex + 1 + index]?.length > 0);
    const previousLine = alignedLines.slice(0, lineIndex).reverse().find((line, index) => lyricWordChunks[lineIndex - 1 - index]?.length > 0);
    alignedLines[lineIndex].time = nextLine?.time ?? previousLine?.time ?? 0;
  }

  return { lines: alignedLines, matchedCount, confidence: lyricCoverage };
}

/**
 * Lựa chọn ứng viên lời bài hát tốt nhất từ LRCLIB search.
 * BẢO VỆ NGHIÊM NGẶT TUYỆT ĐỐI KHÔNG BỊ "RÂU ÔNG NÀY CẮM CẰM BÀ KIA":
 * - Tên bài hát PHẢI khớp chính xác (hoặc bắt đầu bằng cùng cụm từ).
 * - Loại bỏ hoàn toàn các bài khác tên (ví dụ tìm 'Người Dưng' thì loại bỏ 'Thiệp Hồng Người Dưng', 'Người Lạ Ơi').
 * - Ưu tiên bản ghi khớp nghệ sĩ, có lời đồng bộ (synced) và có thời lượng sát bài đang phát.
 */
function parseLyricsfile(lyricsfile) {
  if (typeof lyricsfile !== 'string' || !lyricsfile.trim() || Buffer.byteLength(lyricsfile, 'utf8') > 1024 * 1024) {
    return null;
  }

  let document;
  try {
    document = parseYaml(lyricsfile);
  } catch {
    return null;
  }

  if (!document || typeof document !== 'object' || Array.isArray(document)) return null;

  const offsetMs = Number.isFinite(document.metadata?.offset_ms) ? document.metadata.offset_ms : 0;
  const toSeconds = milliseconds => {
    if (!Number.isFinite(milliseconds)) return null;
    return Math.max(0, (milliseconds + offsetMs) / 1000);
  };

  const lines = (Array.isArray(document.lines) ? document.lines : [])
    .slice(0, 2000)
    .map(line => {
      if (!line || typeof line !== 'object' || Array.isArray(line)) return null;

      const sourceWords = Array.isArray(line.words)
        ? line.words.filter(word => word && typeof word.text === 'string' && word.text.length > 0)
        : [];
      const timedWords = sourceWords.map(word => {
        const time = toSeconds(word.start_ms);
        return time === null ? null : { time, text: word.text };
      });
      const wordTimesOrdered = timedWords.every((word, index) => Boolean(word) && (
        index === 0 || (Boolean(timedWords[index - 1]) && word.time >= timedWords[index - 1].time)
      ));
      // Chỉ dùng timestamp từng từ khi file căn đủ mọi phân đoạn, tránh trộn dữ liệu thiếu.
      const words = sourceWords.length > 0 && wordTimesOrdered ? timedWords : [];
      const time = toSeconds(line.start_ms) ?? words[0]?.time;
      const text = typeof line.text === 'string'
        ? line.text.trim()
        : words.map(word => word.text).join('').trim();

      if (time === null || time === undefined || !text) return null;
      return { time, text, ...(words.length ? { words } : {}) };
    })
    .filter(Boolean)
    .sort((a, b) => a.time - b.time);

  const plain = typeof document.plain === 'string' && document.plain.trim()
    ? document.plain
    : lines.map(line => line.text).join('\n');

  return {
    lines,
    plain,
    instrumental: Boolean(document.metadata?.instrumental)
  };
}

function getLyricsfile(record) {
  return parseLyricsfile(record?.lyricsfile);
}

function hasRecordTimedLyrics(record) {
  return Boolean(record?.syncedLyrics || getLyricsfile(record)?.lines.length);
}

function hasRecordWordSync(record) {
  if (!record) return false;
  const lyricsfile = getLyricsfile(record);
  const lrcLines = typeof record.syncedLyrics === 'string' ? parseLRC(record.syncedLyrics) : [];
  return lyricsfile?.lines.some(line => line.words?.length > 1) ||
    lrcLines.some(line => line.words?.length > 1);
}

function getRecordDurationDifference(record, targetDuration) {
  const recordDuration = Number(record?.duration);
  if (!(targetDuration > 0) || !(recordDuration > 0)) return null;
  return Math.abs(recordDuration - targetDuration);
}

function hasUsableWordSync(record, targetDuration) {
  if (!hasRecordWordSync(record)) return false;
  const durationDifference = getRecordDurationDifference(record, targetDuration);
  return durationDifference === null || durationDifference <= 15;
}

function hasUsableTimedLyrics(record, targetDuration) {
  if (!hasRecordTimedLyrics(record)) return false;
  const durationDifference = getRecordDurationDifference(record, targetDuration);
  return durationDifference === null || durationDifference <= 15;
}

function hasRecordLyrics(record) {
  if (!record) return false;
  const lyricsfile = getLyricsfile(record);
  return Boolean(
    record.syncedLyrics || record.plainLyrics || record.instrumental ||
    lyricsfile?.lines.length || lyricsfile?.plain || lyricsfile?.instrumental
  );
}

function selectBestLyricCandidateStrict(results, targetDur, cleanTitle, cleanArtist, syncedOnly = false, wordSyncedOnly = false) {
  if (!Array.isArray(results) || results.length === 0) return null;

  const normExpectedTitle = normalizeForComparison(cleanTitle);
  const normExpectedArtist = normalizeForComparison(cleanArtist);

  if (!normExpectedTitle) return null;

  const candidates = [];

  for (const r of results) {
    const lyricfile = getLyricsfile(r);
    const hasTimedLyrics = Boolean(r?.syncedLyrics || lyricfile?.lines.length);
    const lrcLines = typeof r?.syncedLyrics === 'string' ? parseLRC(r.syncedLyrics) : [];
    const hasWordSync = Boolean(
      lyricfile?.lines.some(line => line.words?.length > 1) ||
      lrcLines.some(line => line.words?.length > 1)
    );
    const hasLyrics = Boolean(
      r?.syncedLyrics || r?.plainLyrics || r?.instrumental ||
      lyricfile?.lines.length || lyricfile?.plain || lyricfile?.instrumental
    );
    if (!r || (syncedOnly && !hasTimedLyrics) || (wordSyncedOnly && !hasWordSync) || !hasLyrics) continue;

    const normTrack = normalizeForComparison(r.trackName || r.name);
    const normArtist = normalizeForComparison(r.artistName);

    // 1. ĐIỀU KIỆN TIÊN QUYẾT BẮT BUỘC: TÊN BÀI HÁT PHẢI KHỚP!
    const isExactTitle = normTrack === normExpectedTitle;
    const isPrefixTitle = normTrack.length >= 4 && normExpectedTitle.length >= 4 &&
      (normTrack.startsWith(normExpectedTitle + ' ') || normExpectedTitle.startsWith(normTrack + ' '));

    if (!isExactTitle && !isPrefixTitle) {
      // Khác tên bài -> LOẠI BỎ NGAY LẬP TỨC
      continue;
    }

    let score = 0;

    // Điểm thưởng cho exact match tên bài
    if (isExactTitle) score += 60;
    else score += 35;

    // Điểm thưởng cho khớp nghệ sĩ
    if (normExpectedArtist && normArtist) {
      const artistWords = normExpectedArtist.split(/\s+/).filter(w => w.length > 1);
      const matchedWords = artistWords.filter(w => normArtist.includes(w));
      if (matchedWords.length > 0) {
        score += (matchedWords.length / artistWords.length) * 40;
      }
    }

    // Lyricsfile word-sync là timestamp gốc tới từng từ, ưu tiên trên LRC chỉ có timestamp dòng.
    if (hasWordSync) score += 45;
    else if (hasTimedLyrics) score += 25;

    // Ưu tiên bản ghi đúng phiên bản; LRCLIB yêu cầu duration vì cùng tên có thể có nhiều bản thu.
    const durationDifference = getRecordDurationDifference(r, targetDur);
    if (durationDifference !== null) {
      if (durationDifference <= 2) score += 30;
      else if (durationDifference <= 5) score += 20;
      else if (durationDifference <= 15) score += Math.max(0, 15 - durationDifference);
      else if (durationDifference <= 30) score -= 15;
      else if (durationDifference <= 60) score -= 30;
      else score -= 45;
    }

    candidates.push({ r, score });
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].r;
}

function isAiGeneratedTrack(title, artist) {
  const combined = `${title || ''} ${artist || ''}`.toLowerCase();
  return /\b(suno|suno\.ai|udio|udio\.ai|ai cover|ai song|ai generated|tạo bởi ai|ai tạo|vocaloid|ai singer|ai music|text to song|diff-svc|so-vits)\b/i.test(combined);
}

/**
 * GENIUS.COM INTEGRATION VỚI BỘ LỌC XÁC THỰC NGHIÊM NGẶT (GROUND TRUTH)
 * Tuyệt đối không nhận bất kỳ bài hát nào có URL slug không chứa tên bài hát đang tìm.
 */
async function fetchGeniusLyrics(cleanTitle, cleanArtist) {
  if (!cleanTitle) return null;
  const normTitle = normalizeForComparison(cleanTitle);
  if (!normTitle || normTitle.length < 2) return null;

  const titleSlug = normTitle.replace(/\s+/g, '-');
  const query = cleanArtist ? `${cleanTitle} ${cleanArtist}` : cleanTitle;
  const token = process.env.GENIUS_ACCESS_TOKEN || process.env.GENIUS_API_KEY || '';

  try {
    let songUrl = null;
    let songTitle = cleanTitle;
    let artistName = cleanArtist;

    // 1. Thử dùng Genius API nếu có token cấu hình
    if (token) {
      try {
        const apiRes = await fetch(`https://api.genius.com/search?q=${encodeURIComponent(query)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'MusicHome/1.0 (https://github.com/wwm100107-creator/music-home)'
          }
        });
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          const hits = apiData.response?.hits || [];
          const matchedHit = hits.find(h => {
            if (h.type !== 'song' || !h.result) return false;
            const hitNorm = normalizeForComparison(h.result.title);
            return hitNorm === normTitle || hitNorm.includes(normTitle) || normTitle.includes(hitNorm);
          });
          if (matchedHit) {
            songUrl = matchedHit.result.url;
            songTitle = matchedHit.result.title || cleanTitle;
            artistName = matchedHit.result.primary_artist?.name || cleanArtist;
          }
        }
      } catch (err) {
        console.warn('[Genius API Search Warning]:', err.message);
      }
    }

    // 2. Fallback tìm link trang lời Genius qua DuckDuckGo HTML (CÓ KIỂM TRA SLUG CHẶT CHẼ)
    if (!songUrl) {
      try {
        const ddgRes = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent('site:genius.com ' + query + ' lyrics')}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
          }
        });
        if (ddgRes.ok) {
          const html = await ddgRes.text();
          const regex = /uddg=([^&]+)/g;
          let m;
          while ((m = regex.exec(html)) !== null) {
            const decoded = decodeURIComponent(m[1]);
            if (decoded.includes('genius.com') && decoded.includes('-lyrics')) {
              // BẮT BUỘC: Slug của URL phải chứa tên bài hát đang tìm!
              const slugMatch = decoded.toLowerCase();
              if (slugMatch.includes(titleSlug) || normalizeForComparison(decoded).includes(normTitle)) {
                songUrl = decoded;
                break;
              }
            }
          }
        }
      } catch (err) {
        console.warn('[Genius DDG Lookup Warning]:', err.message);
      }
    }

    // Nếu không tìm được link chính xác đúng bài: BỎ QUA NGAY (tránh râu ông này cắm cằm bà kia)
    if (!songUrl) return null;

    // 3. Tải nội dung trang web Genius
    let pageHtml = '';
    try {
      const pageRes = await fetch(songUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'vi,en;q=0.9'
        }
      });
      if (pageRes.ok) {
        pageHtml = await pageRes.text();
      }
    } catch {
      // Bỏ qua lỗi mạng
    }

    if (!pageHtml || pageHtml.length < 500) return null;

    // 4. Bóc tách thẻ chứa lời bài hát từ Genius HTML
    const containerMatches = [...pageHtml.matchAll(/<div[^>]*data-lyrics-container="true"[^>]*>([\s\S]*?)<\/div>/gi)];
    let rawLyrics = '';
    if (containerMatches.length > 0) {
      rawLyrics = containerMatches.map(m => m[1]).join('\n');
    } else {
      const fallbackMatches = [...pageHtml.matchAll(/<div[^>]*class="[^"]*Lyrics__Container[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)];
      if (fallbackMatches.length > 0) {
        rawLyrics = fallbackMatches.map(m => m[1]).join('\n');
      }
    }

    if (!rawLyrics) return null;

    // 5. Làm sạch HTML, giữ nguyên ca từ gốc
    const cleanedText = rawLyrics
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!cleanedText || cleanedText.length < 20) return null;

    return {
      source: 'genius',
      plainLyrics: cleanedText,
      trackName: songTitle,
      artistName: artistName,
      url: songUrl
    };
  } catch (err) {
    console.warn('[Genius Processing Warning]:', err.message);
    return null;
  }
}

const AUDIO_TRIMS_FILENAME = 'audio-trims.json';
let audioTrimsStore = null;

function loadAudioTrimsStore() {
  if (IS_SERVERLESS) return { version: 1, trims: {} };
  if (audioTrimsStore) return audioTrimsStore;

  const saved = readLocalJson(AUDIO_TRIMS_FILENAME);
  audioTrimsStore = saved && saved.version === 1 && saved.trims && typeof saved.trims === 'object'
    ? saved
    : { version: 1, trims: {} };
  return audioTrimsStore;
}

function isValidAudioTrimTrackId(trackId) {
  return typeof trackId === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(trackId) &&
    !['__proto__', 'prototype', 'constructor'].includes(trackId);
}

apiRouter.get('/audio-trims', rateLimit({ maxRequests: 30, windowMs: 60000, endpointName: 'audio-trims-list' }), (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  return res.json({ success: true, trims: loadAudioTrimsStore().trims });
});

apiRouter.get('/audio-trims/:trackId', rateLimit({ maxRequests: 120, windowMs: 60000, endpointName: 'audio-trim' }), (req, res) => {
  if (!isValidAudioTrimTrackId(req.params.trackId)) {
    return res.status(400).json({ success: false, error: 'Mã bài hát không hợp lệ.' });
  }
  return res.json({ success: true, trim: loadAudioTrimsStore().trims[req.params.trackId] || null });
});

apiRouter.post('/audio-trims/:trackId', rateLimit({ maxRequests: 5, windowMs: 60000, endpointName: 'audio-trim-save' }), (req, res) => {
  if (IS_SERVERLESS) {
    return res.status(503).json({
      success: false,
      error: 'Kho chỉnh audio cần máy chủ có ổ đĩa lưu trữ bền vững; hãy lưu trên máy chủ Android gia đình.'
    });
  }

  const trackId = req.params.trackId;
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  const artist = typeof req.body?.artist === 'string' ? req.body.artist.trim() : '';
  const durationSec = Number(req.body?.durationSec);
  const startSec = Number(req.body?.startSec);
  const endSec = Number(req.body?.endSec);
  if (!isValidAudioTrimTrackId(trackId) || !title || title.length > 200 || artist.length > 200 ||
      !Number.isFinite(durationSec) || durationSec < 1 || durationSec > 7200 ||
      !Number.isFinite(startSec) || !Number.isFinite(endSec) || startSec < 0 ||
      endSec - startSec < 1 || endSec > durationSec + 0.25) {
    return res.status(400).json({ success: false, error: 'Điểm cắt không hợp lệ; đoạn phát phải dài ít nhất 1 giây và nằm trong thời lượng bài.' });
  }

  const store = loadAudioTrimsStore();
  if (!store.trims[trackId] && Object.keys(store.trims).length >= 20000) {
    return res.status(507).json({ success: false, error: 'Kho chỉnh audio đã đạt giới hạn lưu trữ.' });
  }

  const previous = store.trims[trackId];
  const trim = {
    trackId,
    title,
    artist: artist || 'Nghệ sĩ không tên',
    durationSec: Number(durationSec.toFixed(3)),
    startSec: Number(startSec.toFixed(3)),
    endSec: Number(Math.min(endSec, durationSec).toFixed(3)),
    revision: (Number(previous?.revision) || 0) + 1,
    updatedAt: new Date().toISOString()
  };
  const nextStore = { ...store, trims: { ...store.trims, [trackId]: trim } };

  try {
    writeLocalJson(AUDIO_TRIMS_FILENAME, nextStore);
    audioTrimsStore = nextStore;
  } catch (err) {
    console.error('[Audio Trim Save Error]:', err.message);
    return res.status(500).json({ success: false, error: 'Chưa lưu được điểm cắt vào kho chung. Vui lòng thử lại.' });
  }

  return res.json({ success: true, trim });
});

apiRouter.delete('/audio-trims/:trackId', rateLimit({ maxRequests: 5, windowMs: 60000, endpointName: 'audio-trim-delete' }), (req, res) => {
  if (IS_SERVERLESS) {
    return res.status(503).json({
      success: false,
      error: 'Kho chỉnh audio cần máy chủ có ổ đĩa lưu trữ bền vững; hãy cập nhật trên máy chủ Android gia đình.'
    });
  }
  if (!isValidAudioTrimTrackId(req.params.trackId)) {
    return res.status(400).json({ success: false, error: 'Mã bài hát không hợp lệ.' });
  }

  const store = loadAudioTrimsStore();
  if (!store.trims[req.params.trackId]) return res.json({ success: true, deleted: false });
  const nextTrims = { ...store.trims };
  delete nextTrims[req.params.trackId];
  const nextStore = { ...store, trims: nextTrims };
  try {
    writeLocalJson(AUDIO_TRIMS_FILENAME, nextStore);
    audioTrimsStore = nextStore;
  } catch (err) {
    console.error('[Audio Trim Delete Error]:', err.message);
    return res.status(500).json({ success: false, error: 'Chưa xóa được điểm cắt khỏi kho chung. Vui lòng thử lại.' });
  }

  return res.json({ success: true, deleted: true });
});

const COMMUNITY_LYRICS_FILENAME = 'community-lyrics.json';
let communityLyricsStore = null;

function loadCommunityLyricsStore() {
  if (IS_SERVERLESS) return { version: 1, songs: {} };
  if (communityLyricsStore) return communityLyricsStore;

  const saved = readLocalJson(COMMUNITY_LYRICS_FILENAME);
  communityLyricsStore = saved && saved.version === 1 && saved.songs && typeof saved.songs === 'object'
    ? saved
    : { version: 1, songs: {} };
  return communityLyricsStore;
}

function normalizeCommunityLyricsIdentity(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function getCommunityLyricsKey(title, artist) {
  const identity = `${normalizeCommunityLyricsIdentity(title)}\n${normalizeCommunityLyricsIdentity(artist)}`;
  return crypto.createHash('sha256').update(identity).digest('hex');
}

function findCommunityLyrics(title, artist, durationSec) {
  const key = getCommunityLyricsKey(title, artist);
  const variants = loadCommunityLyricsStore().songs[key];
  if (!Array.isArray(variants) || variants.length === 0) return null;

  const duration = Number(durationSec) || 0;
  const matches = variants
    .filter(record => record && Array.isArray(record.lines) &&
      normalizeCommunityLyricsIdentity(record.title) === normalizeCommunityLyricsIdentity(title) &&
      normalizeCommunityLyricsIdentity(record.artist) === normalizeCommunityLyricsIdentity(artist) &&
      (!duration || Math.abs(Number(record.durationSec) - duration) <= 15))
    .sort((a, b) => Math.abs((Number(a.durationSec) || 0) - duration) - Math.abs((Number(b.durationSec) || 0) - duration));

  return matches[0] || null;
}

apiRouter.post('/lyrics/contribute', rateLimit({ maxRequests: 5, windowMs: 60000, endpointName: 'lyrics-contribute' }), (req, res) => {
  if (IS_SERVERLESS) {
    return res.status(503).json({
      success: false,
      error: 'Kho lời cộng đồng cần ổ đĩa lưu trữ bền vững; hãy đóng góp trên máy chủ Android gia đình.'
    });
  }

  const rawTitle = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  const rawArtist = typeof req.body?.artist === 'string' ? req.body.artist.trim() : '';
  const durationSec = Number(req.body?.durationSec);
  if (!rawTitle || rawTitle.length > 200 || !rawArtist || rawArtist.length > 200 ||
      !Number.isFinite(durationSec) || durationSec < 30 || durationSec > 7200) {
    return res.status(400).json({ success: false, error: 'Tên bài, nghệ sĩ hoặc thời lượng không hợp lệ.' });
  }

  const { title, artist } = extractSongAndArtist(rawTitle, rawArtist);
  if (!title || !artist || !normalizeCommunityLyricsIdentity(title) || !normalizeCommunityLyricsIdentity(artist)) {
    return res.status(400).json({ success: false, error: 'Không thể xác định tên bài hát và nghệ sĩ.' });
  }

  const inputLines = req.body?.lines;
  if (!Array.isArray(inputLines) || inputLines.length < 2 || inputLines.length > 1200) {
    return res.status(400).json({ success: false, error: 'Lời bài hát cần có từ 2 đến 1.200 dòng.' });
  }

  const lines = [];
  let previousTime = -1;
  let totalCharacters = 0;
  let totalWords = 0;
  for (const sourceLine of inputLines) {
    const text = typeof sourceLine?.text === 'string' ? sourceLine.text.trim() : '';
    const sourceWords = sourceLine?.words;
    let words = [];
    if (sourceWords !== undefined) {
      if (!Array.isArray(sourceWords) || sourceWords.length === 0 || sourceWords.length > 500) {
        return res.status(400).json({ success: false, error: 'Danh sách từ đồng bộ trong một dòng không hợp lệ.' });
      }

      let previousWordTime = -1;
      for (const sourceWord of sourceWords) {
        const wordText = typeof sourceWord?.text === 'string' ? sourceWord.text : '';
        const hasTime = sourceWord?.time !== null && sourceWord?.time !== undefined && sourceWord?.time !== '';
        const wordTime = hasTime ? Number(sourceWord.time) : NaN;
        if (!wordText.trim() || wordText.length > 200 || !Number.isFinite(wordTime) ||
            wordTime < 0 || wordTime > durationSec || wordTime < previousWordTime) {
          return res.status(400).json({ success: false, error: 'Mỗi từ cần có lời và mốc thời gian tăng dần trong bài hát.' });
        }
        words.push({ time: Number(wordTime.toFixed(3)), text: wordText });
        previousWordTime = wordTime;
      }

      if (words.map(word => word.text).join('').trim() !== text) {
        return res.status(400).json({ success: false, error: 'Các từ đồng bộ phải khớp chính xác với lời của dòng.' });
      }
      totalWords += words.length;
      if (totalWords > 20000) {
        return res.status(400).json({ success: false, error: 'Bài hát có quá nhiều mốc từ đồng bộ.' });
      }
    }

    const time = words.length ? words[0].time : Number(sourceLine?.time);
    if (!text || text.length > 700 || !Number.isFinite(time) || time < 0 || time > durationSec || time < previousTime) {
      return res.status(400).json({ success: false, error: 'Mỗi dòng cần có lời và mốc thời gian tăng dần trong thời lượng bài hát.' });
    }
    totalCharacters += text.length;
    if (totalCharacters > 75000) {
      return res.status(400).json({ success: false, error: 'Tổng lời bài hát vượt giới hạn cho phép.' });
    }
    const roundedTime = Number(time.toFixed(3));
    lines.push({ time: roundedTime, text, ...(words.length ? { words } : {}) });
    previousTime = roundedTime;
  }

  const store = loadCommunityLyricsStore();
  const nextStore = { ...store, songs: { ...store.songs } };
  const songKey = getCommunityLyricsKey(title, artist);
  const variants = Array.isArray(store.songs[songKey]) ? [...store.songs[songKey]] : [];
  const matchingIndex = variants.findIndex(record => Math.abs((Number(record.durationSec) || 0) - durationSec) <= 15);
  if (matchingIndex < 0 && !store.songs[songKey] && Object.keys(store.songs).length >= 20000) {
    return res.status(507).json({ success: false, error: 'Kho lời cộng đồng đã đạt giới hạn lưu trữ.' });
  }
  if (matchingIndex < 0 && variants.length >= 8) {
    return res.status(409).json({ success: false, error: 'Bài hát đã có quá nhiều phiên bản theo thời lượng.' });
  }

  const previousRecord = matchingIndex >= 0 ? variants[matchingIndex] : null;
  const record = {
    title,
    artist,
    durationSec: Number(durationSec.toFixed(3)),
    lines,
    revision: (Number(previousRecord?.revision) || 0) + 1,
    updatedAt: new Date().toISOString()
  };
  if (matchingIndex >= 0) variants[matchingIndex] = record;
  else variants.push(record);
  nextStore.songs[songKey] = variants;

  try {
    writeLocalJson(COMMUNITY_LYRICS_FILENAME, nextStore);
    communityLyricsStore = nextStore;
  } catch (err) {
    console.error('[Community Lyrics Save Error]:', err.message);
    return res.status(500).json({ success: false, error: 'Chưa lưu được lời vào kho chung. Vui lòng thử lại.' });
  }

  return res.json({
    success: true,
    source: 'community',
    synced: true,
    syncMethod: lines.some(line => line.words?.length > 0) ? 'community-word-sync' : 'community-line-sync',
    trackName: record.title,
    artistName: record.artist,
    duration: record.durationSec,
    lines: record.lines,
    plain: record.lines.map(line => line.text).join('\n'),
    revision: record.revision
  });
});

apiRouter.get('/lyrics', rateLimit({ maxRequests: 120, windowMs: 60000, endpointName: 'lyrics' }), async (req, res) => {
  const rawTitle = req.query.title || req.query.track || '';
  const rawArtist = req.query.artist || '';
  const durationRaw = req.query.duration;
  // videoId được gửi kèm từ client để làm khoá cache duy nhất, tránh nhầm lẫn giữa các bài hát
  const videoId = req.query.videoId || req.query.id || '';

  if (!rawTitle) {
    return res.status(400).json({ success: false, error: 'Thiếu tham số title' });
  }

  // Bóc tách tên bài hát và nghệ sĩ chuẩn xác từ tiêu đề YouTube
  const { title: cleanTitle, artist: cleanArtist } = extractSongAndArtist(rawTitle, rawArtist);
  const durSec = parseDurationToSeconds(durationRaw);

  if (!cleanTitle) {
    return res.status(400).json({ success: false, error: 'Tiêu đề bài hát không hợp lệ sau khi làm sạch' });
  }

  // Khoá cache ưu tiên videoId nếu có (luôn duy nhất); fallback về title+artist+duration
  const cacheKey = videoId
    ? `lyrics:vid:${videoId}`
    : `lyrics:${normalizeForComparison(cleanTitle)}:${normalizeForComparison(cleanArtist)}:${durSec || 0}`;

  const communityLyrics = findCommunityLyrics(cleanTitle, cleanArtist, durSec);
  if (communityLyrics) {
    const hasWordTimings = communityLyrics.lines.some(line => Array.isArray(line.words) && line.words.length > 0);
    return res.json({
      success: true,
      synced: true,
      instrumental: false,
      source: 'community',
      trackName: communityLyrics.title,
      artistName: communityLyrics.artist,
      duration: communityLyrics.durationSec,
      lines: communityLyrics.lines,
      plain: communityLyrics.lines.map(line => line.text).join('\n'),
      syncMethod: hasWordTimings ? 'community-word-sync' : 'community-line-sync',
      revision: communityLyrics.revision
    });
  }

  const cached = lyricsCache.get(cacheKey);
  if (cached) {
    return res.json({ ...cached, cached: true });
  }

  // 0. Nhận diện tác phẩm do AI tạo: Minh bạch trung thực, không tự bịa lời
  if (isAiGeneratedTrack(rawTitle, rawArtist) || isAiGeneratedTrack(cleanTitle, cleanArtist)) {
    const aiPayload = {
      success: false,
      reason: 'ai_generated',
      synced: false,
      instrumental: false,
      lines: [],
      plain: '',
      message: 'Chưa có dữ liệu cho phần lời bài hát này',
      detail: 'Bài hát được xác định do AI tạo (Suno, Udio, AI Cover) hoặc biểu diễn bởi giọng ca ảo nên hiện chưa có dữ liệu lời bài hát chính thức.'
    };
    lyricsCache.set(cacheKey, aiPayload, 24 * 60 * 60 * 1000);
    return res.json(aiPayload);
  }

  try {
    let lyricData = null;

    // 1. Thử lấy chính xác bằng LRCLIB /api/get (exact match theo title + artist)
    if (cleanTitle && cleanArtist) {
      try {
        let getUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`;
        if (durSec) getUrl += `&duration=${durSec}`;
        let resp = await fetchLrclib(getUrl);
        if (resp?.status === 404 && durSec) {
          // Thử lại không kèm duration vì thời lượng MV YouTube có thể lệch với audio track
          getUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`;
          resp = await fetchLrclib(getUrl);
        }
        if (resp?.ok) {
          const candidate = await resp.json();
          if (hasRecordLyrics(candidate)) {
            const normCandidateTitle = normalizeForComparison(candidate.trackName || candidate.name);
            const normTargetTitle = normalizeForComparison(cleanTitle);
            if (normCandidateTitle === normTargetTitle || normCandidateTitle.includes(normTargetTitle) || normTargetTitle.includes(normCandidateTitle)) {
              lyricData = candidate;
              lyricData.source = 'lrclib';
            }
          }
        }
      } catch {
        // Bỏ qua để thử search
      }
    }

    // 2. Tìm trước Lyricsfile có timestamp từng từ, kể cả khi /api/get đã trả LRC đồng bộ theo dòng.
    // Nếu thư viện chỉ có LRC dòng, giữ nó làm dự phòng; giao diện có thể ước lượng timestamp từ.
    if (!hasUsableWordSync(lyricData, durSec) && !lyricData?.instrumental) {
      const searchQueries = [
        cleanArtist ? `${cleanTitle} ${cleanArtist}` : cleanTitle,
        cleanTitle
      ].filter((query, index, allQueries) => query && allQueries.indexOf(query) === index);

      for (const searchQuery of searchQueries) {
        try {
          const searchResp = await fetchLrclib(`https://lrclib.net/api/search?q=${encodeURIComponent(searchQuery)}`);
          if (!searchResp?.ok) continue;

          const results = await searchResp.json();
          const bestWordSynced = selectBestLyricCandidateStrict(results, durSec, cleanTitle, cleanArtist, true, true);
          if (bestWordSynced) {
            const currentDurationDifference = getRecordDurationDifference(lyricData, durSec);
            const candidateDurationDifference = getRecordDurationDifference(bestWordSynced, durSec);
            if (!lyricData || candidateDurationDifference === null || currentDurationDifference === null ||
                candidateDurationDifference <= currentDurationDifference + 2) {
              lyricData = bestWordSynced;
              lyricData.source = 'lrclib';
            }
            if (hasUsableWordSync(lyricData, durSec)) break;
          }

          // Nếu /api/get chỉ có plain hoặc lệch phiên bản theo thời lượng, tìm bản line-synced sát hơn.
          if (!hasUsableTimedLyrics(lyricData, durSec)) {
            const bestSynced = selectBestLyricCandidateStrict(results, durSec, cleanTitle, cleanArtist, true);
            if (bestSynced) {
              lyricData = bestSynced;
              lyricData.source = 'lrclib';
            }
          }

          if (!lyricData) {
            const best = selectBestLyricCandidateStrict(results, durSec, cleanTitle, cleanArtist);
            if (best) {
              lyricData = best;
              lyricData.source = 'lrclib';
            }
          }
        } catch {
          // Thử truy vấn kế tiếp; nếu đều lỗi, dùng dữ liệu tốt nhất đã tìm được.
        }
      }
    }

    // 4. Fallback sang GENIUS.COM nếu chưa có lời từ LRCLIB (với slug verification)
    if (!hasRecordLyrics(lyricData)) {
      try {
        const geniusResult = await fetchGeniusLyrics(cleanTitle, cleanArtist);
        if (geniusResult) {
          lyricData = {
            trackName: geniusResult.trackName,
            artistName: geniusResult.artistName,
            plainLyrics: geniusResult.plainLyrics,
            source: 'genius',
            duration: durSec
          };
        }
      } catch (err) {
        console.warn('[Genius Fallback Error]:', err.message);
      }
    }

    // 5. Nếu không tìm thấy ở bất kỳ nguồn nào: Tuyệt đối không tự bịa đặt lời
    if (!hasRecordLyrics(lyricData)) {
      const notFoundPayload = {
        success: false,
        reason: 'no_data',
        synced: false,
        instrumental: false,
        lines: [],
        plain: '',
        message: 'Chưa có dữ liệu cho phần lời bài hát này',
        detail: 'Tác phẩm có thể quá mới chưa cập nhật lời, hoặc bản ghi âm đặc biệt chưa có dữ liệu ca từ chính thức.'
      };
      lyricsCache.set(cacheKey, notFoundPayload, 15 * 60 * 1000);
      return res.json(notFoundPayload);
    }

    const lyricsfile = getLyricsfile(lyricData);
    const isInstrumental = Boolean(lyricData.instrumental || lyricsfile?.instrumental);
    const lrcLines = parseLRC(lyricData.syncedLyrics || '');
    // Lyricsfile là biểu diễn đầy đủ hơn, có thể chứa cả timestamp cho từng từ.
    const parsedLines = lyricsfile?.lines.length ? lyricsfile.lines : lrcLines;
    const plainLyrics = lyricData.plainLyrics || lyricsfile?.plain || parsedLines.map(line => line.text).join('\n');
    const hasUsableDatabaseTiming = hasUsableTimedLyrics(lyricData, durSec);
    const databaseLines = hasUsableDatabaseTiming ? parsedLines : [];
    const hasNativeWordTimings = hasUsableDatabaseTiming &&
      parsedLines.some(line => Array.isArray(line.words) && line.words.length > 1);
    let captionAlignment = null;

    // Nếu chưa có timestamp từng từ, thử đồng bộ ca từ với phụ đề của đúng video đang phát.
    // Chỉ nhận kết quả khi nội dung caption khớp phần lớn lời gốc để không lấy nhầm video.
    if (!isInstrumental && !hasNativeWordTimings && videoId) {
      const sourceLines = parsedLines.length
        ? parsedLines.map(line => ({
          text: line.text,
          ...(hasUsableDatabaseTiming ? { time: line.time } : {})
        }))
        : String(plainLyrics || lyricData.syncedLyrics || '')
          .split(/\r?\n/)
          .map(text => text.trim())
          .filter(Boolean)
          .map(text => ({ text }));

      if (sourceLines.length) {
        const captionWords = await fetchYouTubeCaptionWords(videoId);
        captionAlignment = alignLyricsLinesToYouTubeCaptions(sourceLines, captionWords);
      }
    }

    const resultLines = captionAlignment?.lines || databaseLines;
    const hasSynced = databaseLines.length > 0 || Boolean(captionAlignment);
    const syncMethod = hasNativeWordTimings
      ? (lyricsfile?.lines.some(line => line.words?.length > 1) ? 'lyricsfile-word-sync' : 'lrc-word-sync')
      : captionAlignment ? 'youtube-captions' : databaseLines.length ? 'lrclib-line-sync' : undefined;

    const payload = {
      success: true,
      synced: hasSynced,
      instrumental: isInstrumental,
      source: lyricData.source || 'lrclib',
      trackName: lyricData.trackName || cleanTitle,
      artistName: lyricData.artistName || cleanArtist,
      duration: lyricData.duration || null,
      lines: resultLines,
      plain: plainLyrics,
      ...(syncMethod ? { syncMethod } : {}),
      ...(captionAlignment ? {
        synced: true,
        syncMethod: 'youtube-captions',
        syncConfidence: parseFloat(captionAlignment.confidence.toFixed(3))
      } : {})
    };

    lyricsCache.set(cacheKey, payload);
    return res.json(payload);
  } catch (err) {
    console.error('[Lyrics Fetch Error]:', err.message);
    res.status(500).json({ success: false, error: 'Không thể tải lời bài hát: ' + err.message });
  }
});

apiRouter.post('/lyrics/align', rateLimit({ maxRequests: 30, windowMs: 60000, endpointName: 'lyrics-align' }), async (req, res) => {
  const videoId = String(req.body?.videoId || '').trim();
  const inputLines = req.body?.lines;
  if (!/^[\w-]{11}$/.test(videoId) || !Array.isArray(inputLines) || inputLines.length === 0 || inputLines.length > 1200) {
    return res.status(400).json({ success: false, aligned: false, error: 'Dữ liệu căn lời không hợp lệ.' });
  }

  const lines = inputLines
    .filter(line => line && typeof line.text === 'string' && line.text.trim())
    .map(line => ({
      text: line.text.trim(),
      ...(Number.isFinite(Number(line.time)) ? { time: Number(line.time) } : {})
    }));
  if (!lines.length || lines.reduce((sum, line) => sum + line.text.length, 0) > 75000) {
    return res.status(400).json({ success: false, aligned: false, error: 'Lời bài hát vượt giới hạn căn chỉnh.' });
  }

  try {
    const captionWords = await fetchYouTubeCaptionWords(videoId);
    const alignment = alignLyricsLinesToYouTubeCaptions(lines, captionWords);
    if (!alignment) return res.json({ success: true, aligned: false });

    return res.json({
      success: true,
      aligned: true,
      lines: alignment.lines,
      confidence: parseFloat(alignment.confidence.toFixed(3))
    });
  } catch (err) {
    console.warn('[Lyrics Caption Alignment]:', err.message);
    return res.json({ success: true, aligned: false });
  }
});

// ============================================================================
// 10. DROP YOUR MUSIC: MULTI-DEVICE COMMUNITY AUDIO STORAGE & SHARING
// ============================================================================
const COMMUNITY_CONTAINER_ID = 'ff808181a067127101a08f3e7e897286';
let inMemoryCommunityTracks = null;
let lastCommunityFetch = 0;

async function uploadToCatbox(buffer, filename, mimeType = 'application/octet-stream') {
  try {
    const blob = new Blob([buffer], { type: mimeType });
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', blob, filename || 'file');

    const res = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: form
    });
    const resultUrl = (await res.text()).trim();
    if (resultUrl && resultUrl.startsWith('http')) {
      return resultUrl;
    }
    throw new Error('Catbox returned invalid response: ' + resultUrl);
  } catch (err) {
    console.error('[Catbox Upload Error]:', err.message);
    throw err;
  }
}

async function fetchCommunityTracks() {
  const now = Date.now();
  if (inMemoryCommunityTracks && (now - lastCommunityFetch < 10000)) {
    return inMemoryCommunityTracks;
  }

  try {
    const res = await fetch(`https://api.restful-api.dev/objects/${COMMUNITY_CONTAINER_ID}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && Array.isArray(json.data.tracks)) {
        inMemoryCommunityTracks = json.data.tracks;
        lastCommunityFetch = now;
        return inMemoryCommunityTracks;
      }
    }
  } catch (err) {
    console.warn('[Fetch Remote Community Tracks]:', err.message);
  }

  if (!inMemoryCommunityTracks) {
    const localTracks = readLocalJson('community_tracks.json');
    inMemoryCommunityTracks = Array.isArray(localTracks) ? localTracks : [];
    lastCommunityFetch = now;
  }

  return inMemoryCommunityTracks || [];
}

async function saveCommunityTracks(tracks) {
  inMemoryCommunityTracks = tracks;
  lastCommunityFetch = Date.now();

  try {
    await fetch(`https://api.restful-api.dev/objects/${COMMUNITY_CONTAINER_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'musichome_shared_community_tracks_v1',
        data: {
          tracks,
          lastUpdated: new Date().toISOString()
        }
      }),
      signal: AbortSignal.timeout(6000)
    });
  } catch (err) {
    console.warn('[Save Remote Community Tracks Failed]:', err.message);
  }

  try {
    writeLocalJson('community_tracks.json', tracks);
  } catch {
    // Read-only serverless environment ignore
  }
}

// Lấy danh sách bài hát cộng đồng cho mọi thiết bị
apiRouter.get('/drop/tracks', async (req, res) => {
  try {
    const tracks = await fetchCommunityTracks();
    res.json({ success: true, count: tracks.length, tracks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, tracks: [] });
  }
});

// Người dùng tải file MP3 & ảnh bìa lên và chia sẻ tức thì
apiRouter.post('/drop/upload', async (req, res) => {
  try {
    const {
      title,
      artist,
      duration,
      themePreset,
      audioBase64,
      audioName,
      audioMime,
      imageBase64,
      imageName,
      imageMime,
      directAudioUrl,
      lyrics
    } = req.body || {};

    if (!directAudioUrl && !audioBase64) {
      return res.status(400).json({ success: false, error: 'Vui lòng chọn file nhạc MP3 hoặc cung cấp link audio' });
    }

    const cleanTitle = (title || audioName || 'Khúc Ca Mộc Mạc').replace(/\.[^/.]+$/, '').trim();
    const cleanArtist = (artist || 'Cộng đồng Home Music').trim();
    const cleanLyrics = (typeof lyrics === 'string' && lyrics.trim().length > 0) ? lyrics.trim() : null;

    let finalAudioUrl = directAudioUrl || '';
    if (!finalAudioUrl && audioBase64) {
      const audioBuffer = Buffer.from(audioBase64, 'base64');
      const safeAudioName = (audioName || 'track.mp3').replace(/[^a-zA-Z0-9._-]/g, '_');
      finalAudioUrl = await uploadToCatbox(audioBuffer, safeAudioName, audioMime || 'audio/mpeg');
    }

    let finalThumbnail = 'bg.jpg';
    if (imageBase64) {
      try {
        const imageBuffer = Buffer.from(imageBase64, 'base64');
        const safeImageName = (imageName || 'cover.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
        finalThumbnail = await uploadToCatbox(imageBuffer, safeImageName, imageMime || 'image/jpeg');
      } catch (e) {
        console.warn('Image upload failed, fallback to default:', e.message);
        finalThumbnail = 'bg.jpg';
      }
    }

    const newTrack = {
      id: 'drop_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: cleanTitle,
      artist: cleanArtist,
      album: 'Drop Your Music',
      duration: duration || '03:30',
      thumbnail: finalThumbnail,
      audioUrl: finalAudioUrl,
      streamUrl: finalAudioUrl,
      source: 'drop',
      themePreset: themePreset || 'custom',
      lyrics: cleanLyrics,
      createdAt: new Date().toISOString()
    };

    const currentTracks = await fetchCommunityTracks();
    const updatedTracks = [newTrack, ...currentTracks.filter(t => t.id !== newTrack.id)];

    await saveCommunityTracks(updatedTracks);

    res.json({
      success: true,
      message: 'Bài hát đã được tải lên và chia sẻ thành công!',
      track: newTrack,
      totalTracks: updatedTracks.length
    });
  } catch (err) {
    console.error('[Drop Upload Error]:', err);
    res.status(500).json({ success: false, error: 'Không thể tải lên lúc này: ' + err.message });
  }
});

// ============================================================================
// 10.5. USER AUTHENTICATION & MULTI-DEVICE CLOUD SYNC (PBKDF2 & HMAC TOKEN)
// ============================================================================
const LEGACY_USER_ACCOUNTS_CONTAINER_ID = 'ff808181a09d98f701a0bda7546a4e23';
let inMemoryUsers = null;
let lastUsersFetch = 0;

function hashPassword(password, salt) {
  if (!salt) salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password, hash, salt) {
  const check = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return check === hash;
}

function generateToken(userId, username) {
  const payload = Buffer.from(JSON.stringify({ userId, username, issuedAt: Date.now() })).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data;
  } catch {
    return null;
  }
}

async function importLegacyUsersFromCloud() {
  try {
    const res = await fetch(`https://api.restful-api.dev/objects/${LEGACY_USER_ACCOUNTS_CONTAINER_ID}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) return null;

    const json = await res.json();
    const users = json?.data?.users;
    return users && typeof users === 'object' && !Array.isArray(users) ? users : null;
  } catch (err) {
    console.warn('[Legacy Account Import Error]:', err.message);
    return null;
  }
}

async function loadUsers() {
  const now = Date.now();
  if (inMemoryUsers && (now - lastUsersFetch < 5000)) {
    return inMemoryUsers;
  }

  const localUsersPath = path.join(LOCAL_DATA_DIRECTORY, 'users.json');
  if (fs.existsSync(localUsersPath)) {
    const localUsers = readLocalJson('users.json');
    inMemoryUsers = localUsers && typeof localUsers === 'object' && !Array.isArray(localUsers)
      ? localUsers
      : {};
    lastUsersFetch = now;
    return inMemoryUsers;
  }

  // One-time import of existing accounts. New writes stay on the persistent home server.
  const importedUsers = await importLegacyUsersFromCloud();
  if (importedUsers) {
    inMemoryUsers = importedUsers;
    try {
      writeLocalJson('users.json', importedUsers);
    } catch (err) {
      console.warn('[Legacy Account Import Save Error]:', err.message);
    }
    lastUsersFetch = now;
    return inMemoryUsers;
  }

  const localUsers = readLocalJson('users.json');
  inMemoryUsers = localUsers && typeof localUsers === 'object' && !Array.isArray(localUsers)
    ? localUsers
    : {};
  try {
    writeLocalJson('users.json', inMemoryUsers);
  } catch (err) {
    console.warn('[Local Account Save Error]:', err.message);
  }
  lastUsersFetch = now;

  return inMemoryUsers || {};
}

async function saveUsers(usersMap) {
  inMemoryUsers = usersMap;
  lastUsersFetch = Date.now();
  writeLocalJson('users.json', usersMap);
}

function getAuthUserFromReq(req) {
  const authHeader = req.headers['authorization'] || '';
  let token = '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }
  if (!token) return null;
  return verifyToken(token);
}

// 1. ĐĂNG KÝ TÀI KHOẢN (REGISTER)
apiRouter.post('/auth/register', async (req, res) => {
  try {
    const { username, password, displayName } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    if (!/^[a-zA-Z0-9_.]{3,24}$/.test(cleanUsername)) {
      return res.status(400).json({ success: false, error: 'Tên đăng nhập từ 3-24 ký tự, chỉ gồm chữ cái, số, dấu gạch dưới hoặc chấm' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ success: false, error: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự' });
    }

    const users = await loadUsers();
    if (users[cleanUsername]) {
      return res.status(409).json({ success: false, error: 'Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác nhé!' });
    }

    const { hash, salt } = hashPassword(String(password));
    const userId = 'usr_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
    const { avatar } = req.body || {};
    const cleanDisplayName = (displayName && String(displayName).trim()) || cleanUsername;
    const newUser = {
      id: userId,
      username: cleanUsername,
      displayName: cleanDisplayName,
      avatar: (avatar && String(avatar).trim()) || 'bg.jpg',
      passwordHash: hash,
      passwordSalt: salt,
      favorites: [],
      settings: { theme: 'day', loopMode: 'all', volume: 0.8 },
      myDroppedMusic: [],
      customPlaylists: [],
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    users[cleanUsername] = newUser;
    await saveUsers(users);

    const token = generateToken(userId, cleanUsername);
    const safeProfile = {
      id: newUser.id,
      username: newUser.username,
      displayName: newUser.displayName,
      avatar: newUser.avatar || '🌰',
      favorites: newUser.favorites,
      settings: newUser.settings,
      myDroppedMusic: newUser.myDroppedMusic,
      customPlaylists: newUser.customPlaylists,
      createdAt: newUser.createdAt
    };

    res.json({
      success: true,
      message: `Chào mừng bạn đến với Ngôi Nhà Âm Nhạc, ${cleanDisplayName}! ✨`,
      token,
      user: safeProfile
    });
  } catch (err) {
    console.error('[Register Error]:', err);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ khi đăng ký: ' + err.message });
  }
});

// 2. ĐĂNG NHẬP (LOGIN)
apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const users = await loadUsers();
    const user = users[cleanUsername];

    if (!user || !verifyPassword(String(password), user.passwordHash, user.passwordSalt)) {
      return res.status(401).json({ success: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
    }

    user.lastActive = new Date().toISOString();
    await saveUsers(users);

    const token = generateToken(user.id, user.username);
    const safeProfile = {
      id: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      avatar: user.avatar || '🌰',
      favorites: user.favorites || [],
      settings: user.settings || { theme: 'day', loopMode: 'all' },
      myDroppedMusic: user.myDroppedMusic || [],
      customPlaylists: user.customPlaylists || [],
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      message: `Đăng nhập thành công! Chào mừng trở lại, ${safeProfile.displayName} 🍃`,
      token,
      user: safeProfile
    });
  } catch (err) {
    console.error('[Login Error]:', err);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ khi đăng nhập: ' + err.message });
  }
});

// 3. LẤY THÔNG TIN TÀI KHOẢN (GET /auth/me)
apiRouter.get('/auth/me', async (req, res) => {
  try {
    const authData = getAuthUserFromReq(req);
    if (!authData) {
      return res.status(401).json({ success: false, error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' });
    }

    const users = await loadUsers();
    const user = users[authData.username];
    if (!user || user.id !== authData.userId) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy thông tin tài khoản' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        avatar: user.avatar || '🌰',
        favorites: user.favorites || [],
        settings: user.settings || { theme: 'day', loopMode: 'all' },
        myDroppedMusic: user.myDroppedMusic || [],
        customPlaylists: user.customPlaylists || [],
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. ĐỒNG BỘ DỮ LIỆU ĐÁM MÂY (POST /auth/sync)
apiRouter.post('/auth/sync', async (req, res) => {
  try {
    const authData = getAuthUserFromReq(req);
    if (!authData) {
      return res.status(401).json({ success: false, error: 'Vui lòng đăng nhập để đồng bộ dữ liệu' });
    }

    const { favorites, settings, myDroppedMusic, customPlaylists, avatar, displayName } = req.body || {};
    const users = await loadUsers();
    const user = users[authData.username];

    if (!user || user.id !== authData.userId) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
    }

    if (avatar && typeof avatar === 'string') {
      user.avatar = avatar;
    }

    if (displayName && typeof displayName === 'string') {
      user.displayName = displayName.trim();
    }

    // Hợp nhất dữ liệu thông minh theo ID
    if (Array.isArray(favorites)) {
      const existingFavs = Array.isArray(user.favorites) ? user.favorites : [];
      const favMap = new Map();
      existingFavs.forEach(f => { if (f && f.id) favMap.set(f.id, f); });
      favorites.forEach(f => { if (f && f.id) favMap.set(f.id, f); });
      user.favorites = Array.from(favMap.values());
    }

    if (settings && typeof settings === 'object') {
      user.settings = { ...(user.settings || {}), ...settings };
    }

    if (Array.isArray(myDroppedMusic)) {
      const existingDrops = Array.isArray(user.myDroppedMusic) ? user.myDroppedMusic : [];
      const dropMap = new Map();
      existingDrops.forEach(d => { if (d && d.id) dropMap.set(d.id, d); });
      myDroppedMusic.forEach(d => { if (d && d.id) dropMap.set(d.id, d); });
      user.myDroppedMusic = Array.from(dropMap.values());
    }

    if (Array.isArray(customPlaylists)) {
      user.customPlaylists = customPlaylists;
    }

    user.lastActive = new Date().toISOString();
    await saveUsers(users);

    res.json({
      success: true,
      message: 'Đồng bộ đám mây thành công! ☁️',
      syncedData: {
        avatar: user.avatar,
        displayName: user.displayName,
        favorites: user.favorites,
        settings: user.settings,
        myDroppedMusic: user.myDroppedMusic,
        customPlaylists: user.customPlaylists,
        lastSynced: user.lastActive
      }
    });
  } catch (err) {
    console.error('[Sync Error]:', err);
    res.status(500).json({ success: false, error: 'Đồng bộ thất bại: ' + err.message });
  }
});

// 5. XUẤT FILE SAO LƯU DỰ PHÒNG (GET /auth/backup/export)
apiRouter.get('/auth/backup/export', async (req, res) => {
  try {
    const authData = getAuthUserFromReq(req);
    if (!authData) {
      return res.status(401).json({ success: false, error: 'Vui lòng đăng nhập để xuất dữ liệu sao lưu' });
    }

    const users = await loadUsers();
    const user = users[authData.username];
    if (!user || user.id !== authData.userId) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
    }

    const backupPayload = {
      app: 'Home Music',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: {
        username: user.username,
        displayName: user.displayName,
        createdAt: user.createdAt
      },
      favorites: user.favorites || [],
      settings: user.settings || {},
      myDroppedMusic: user.myDroppedMusic || [],
      customPlaylists: user.customPlaylists || []
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="music_home_backup_${user.username}_${Date.now()}.json"`);
    res.send(JSON.stringify(backupPayload, null, 2));
  } catch (err) {
    res.status(500).json({ success: false, error: 'Không thể xuất dữ liệu: ' + err.message });
  }
});

// 6. KHÔI PHỤC TỪ FILE SAO LƯU (POST /auth/backup/import)
apiRouter.post('/auth/backup/import', async (req, res) => {
  try {
    const authData = getAuthUserFromReq(req);
    if (!authData) {
      return res.status(401).json({ success: false, error: 'Vui lòng đăng nhập để khôi phục dữ liệu' });
    }

    const { favorites, settings, myDroppedMusic, customPlaylists } = req.body || {};
    const users = await loadUsers();
    const user = users[authData.username];

    if (!user || user.id !== authData.userId) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
    }

    if (Array.isArray(favorites)) {
      user.favorites = favorites;
    }
    if (settings && typeof settings === 'object') {
      user.settings = { ...(user.settings || {}), ...settings };
    }
    if (Array.isArray(myDroppedMusic)) {
      user.myDroppedMusic = myDroppedMusic;
    }
    if (Array.isArray(customPlaylists)) {
      user.customPlaylists = customPlaylists;
    }

    user.lastActive = new Date().toISOString();
    await saveUsers(users);

    res.json({
      success: true,
      message: 'Khôi phục dữ liệu sao lưu thành công! 🎉',
      syncedData: {
        favorites: user.favorites,
        settings: user.settings,
        myDroppedMusic: user.myDroppedMusic,
        customPlaylists: user.customPlaylists,
        lastSynced: user.lastActive
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Khôi phục dữ liệu thất bại: ' + err.message });
  }
});

// Gắn router vào cả 2 đường dẫn /api và / để tương thích tuyệt đối mọi môi trường
app.use('/api', apiRouter);
app.use('/', apiRouter);

// ============================================================================
// 11. GLOBAL UNHANDLED ERROR HANDLERS
// ============================================================================
process.on('uncaughtException', err => {
  if (err && (err.name === 'AbortError' || err.code === 'ERR_STREAM_PREMATURE_CLOSE' || String(err).includes('aborted'))) {
    return;
  }
  console.error('[UNCAUGHT EXCEPTION]:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]:', reason);
});

// Khởi chạy server nếu chạy cục bộ trực tiếp (node server.js)
const isDirectExecution = Boolean(
  process.argv[1] && (
    process.argv[1].endsWith('server.js') || 
    process.argv[1].endsWith('server')
  )
);
const isVercel = Boolean(
  process.env.VERCEL || 
  process.env.VERCEL_ENV || 
  process.env.NOW_REGION || 
  process.env.AWS_LAMBDA_FUNCTION_NAME
);

if (isDirectExecution && !isVercel) {
  app.listen(PORT, () => {
    console.log(`
      🌿 ===================================================
      🍃  MUSIC HOME • STUDIO GHIBLI & TOTORO SOUND STATION
      🎵  Local URL: http://localhost:${PORT}
      🛡️  Bảo vệ VisionOS Stream, Anti-Bot & Geo-IP Active!
      🌿 ===================================================
    `);
  });
}

export default app;
