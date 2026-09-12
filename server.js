import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Innertube, ClientType, UniversalCache, Platform } from 'youtubei.js';

// Setup high-performance JavaScript evaluator for Innertube deciphering
if (Platform && Platform.shim) {
  Platform.shim.eval = async (data, env) => {
    const keys = Object.keys(env);
    const values = Object.values(env);
    const fn = new Function(...keys, data.output);
    return fn(...values);
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const albumCache = new BoundedCache(80, 60 * 60 * 1000);

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
  const cookie = getYouTubeCookie();
  if (!ytStreamInstance || forceNew) {
    const config = {
      client_type: cookie ? ClientType.MWEB : ClientType.VISIONOS,
      cache: new UniversalCache(false),
      generate_session_locally: false
    };
    if (cookie) {
      config.cookie = cookie;
    }
    ytStreamInstance = await Innertube.create(config);
    console.log(`✅ YouTube Stream client initialized (${cookie ? 'MWEB with Authenticated Cookie' : 'VISIONOS'})`);
  }
  return ytStreamInstance;
}

async function getClients() {
  const ytSearch = await getSearchClient();
  const ytStream = await getStreamClient();
  return { ytSearch, ytStream };
}

// Helper resolve audio stream URL với hỗ trợ giải mã chữ ký (Deciphering)
async function resolveAudioStream(videoId, forceRefresh = false) {
  if (!forceRefresh) {
    const cached = streamCache.get(videoId);
    if (cached) return cached;
  }

  let ytStream = await getStreamClient(forceRefresh);
  let info = await ytStream.getBasicInfo(videoId);

  if (info.playability_status?.status === 'LOGIN_REQUIRED') {
    console.warn(`[Stream ${videoId}]: Got LOGIN_REQUIRED, re-initializing client with fresh cookie...`);
    ytStream = await getStreamClient(true);
    info = await ytStream.getBasicInfo(videoId);
  }

  if (info.playability_status?.status && info.playability_status.status !== 'OK') {
    const reason = info.playability_status.reason || 'Video is not playable';
    console.warn(`[Playability Status for ${videoId}]:`, info.playability_status.status, '-', reason);
  }

  const adaptive = info.streaming_data?.adaptive_formats || [];
  const combined = info.streaming_data?.formats || [];
  const allFormats = [...adaptive, ...combined];

  const audioFormats = allFormats.filter(f => (f.mime_type?.startsWith('audio/') || f.has_audio));

  if (audioFormats.length === 0) {
    const cookie = getYouTubeCookie();
    throw new Error(`Không tìm thấy luồng âm thanh (${info.playability_status?.status || 'UNKNOWN'}: ${info.playability_status?.reason || 'No streaming data'} - Client: ${cookie ? 'MWEB' : 'VISIONOS'}, CookieLen: ${cookie ? cookie.length : 0})`);
  }

  // Ưu tiên itag 140 (AAC 128kbps) hoặc 251 (Opus) hoặc 139 (AAC 48kbps)
  let chosenFormat =
    audioFormats.find(f => f.itag === 140) ||
    audioFormats.find(f => f.itag === 251) ||
    audioFormats.find(f => f.itag === 139) ||
    audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];

  let streamUrl = chosenFormat.url;
  if (!streamUrl && typeof chosenFormat.decipher === 'function') {
    streamUrl = await chosenFormat.decipher(ytStream.session.player);
  }

  if (!streamUrl) {
    throw new Error('Không thể giải mã luồng âm thanh cho bài hát này.');
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
    url: streamUrl,
    itag: chosenFormat.itag,
    mimeType: chosenFormat.mime_type ? chosenFormat.mime_type.split(';')[0] : 'audio/mp4',
    contentLength: chosenFormat.content_length ? parseInt(chosenFormat.content_length, 10) : null,
    bitrate: chosenFormat.bitrate
  };

  streamCache.set(videoId, streamData);
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
    albumQueries: ['top albums vpop', 'album nhạc việt', 'vpop ep album'],
    albumArtistSeeds: ['Sơn Tùng M-TP', 'HIEUTHUHAI', 'Vũ.', 'Wren Evans', 'Bích Phương', 'MIN', 'Đen', 'MONO', 'Thắng', 'Anh Trai Say Hi'],
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
    albumQueries: ['billboard top albums', 'top us pop albums', 'grammy albums'],
    albumArtistSeeds: ['Taylor Swift', 'Billie Eilish', 'Olivia Rodrigo', 'The Weeknd', 'Post Malone', 'Ariana Grande', 'Bruno Mars', 'Kendrick Lamar', 'Sabrina Carpenter', 'Dua Lipa'],
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
    albumQueries: ['kpop top albums', 'melon top albums', 'k-drama ost album'],
    albumArtistSeeds: ['NewJeans', 'BTS', 'BLACKPINK', 'aespa', 'IVE', 'LE SSERAFIM', 'IU', 'SEVENTEEN', 'Stray Kids', 'Taeyeon'],
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
    albumQueries: ['jpop top albums', 'anime soundtrack album', 'studio ghibli soundtrack album'],
    albumArtistSeeds: ['Joe Hisaishi', 'YOASOBI', 'Kenshi Yonezu', 'Ado', 'Fujii Kaze', 'RADWIMPS', 'King Gnu', 'Aimyon', 'Official HIGE DANdism', 'LiSA'],
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
    albumQueries: ['uk top albums', 'british pop albums', 'official uk album chart'],
    albumArtistSeeds: ['Adele', 'Ed Sheeran', 'Coldplay', 'Dua Lipa', 'Harry Styles', 'Sam Smith', 'Arctic Monkeys', 'Oasis', 'Lewis Capaldi', 'Charli xcx'],
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
    albumQueries: ['top albums worldwide', 'global hit albums', 'grammy best album'],
    albumArtistSeeds: ['Taylor Swift', 'The Weeknd', 'Billie Eilish', 'Bruno Mars', 'Coldplay', 'BTS', 'Dua Lipa', 'Post Malone', 'Ed Sheeran', 'Sabrina Carpenter'],
    genres: ['All', 'Global Viral 50', "Today's Top Hits", 'Dance & EDM', 'Acoustic Pop', 'Chill Hits']
  }
};

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
  if (queryCountry && COUNTRY_HUBS[queryCountry]) return queryCountry;

  const cfCountry = req.headers['cf-ipcountry']?.toUpperCase();
  if (cfCountry && COUNTRY_HUBS[cfCountry]) return cfCountry;

  const clientTz = req.query.tz;
  if (clientTz && TIMEZONE_TO_COUNTRY[clientTz]) return TIMEZONE_TO_COUNTRY[clientTz];

  const acceptLang = req.headers['accept-language'] || '';
  if (/vi[-_]VN/i.test(acceptLang) || /vi/i.test(acceptLang)) return 'VN';
  if (/ko[-_]KR/i.test(acceptLang) || /ko/i.test(acceptLang)) return 'KR';
  if (/ja[-_]JP/i.test(acceptLang) || /ja/i.test(acceptLang)) return 'JP';
  if (/en[-_]GB/i.test(acceptLang)) return 'GB';
  if (/en[-_]US/i.test(acceptLang)) return 'US';

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
// 7.3. CURATED HIGH-QUALITY FALLBACK ALBUMS (Always available & resilient)
// ============================================================================
const FALLBACK_ALBUMS = {
  VN: [
    {
      id: 'MPREb_rL78Ovsej32',
      title: 'm-tp M-TP',
      artist: 'Sơn Tùng M-TP',
      year: '2017',
      thumbnail: 'https://yt3.googleusercontent.com/ngVF3KN1kOURKqMJEBfDsUknmCkMzlFXEyACOFCIXNLdu8SfTcrbJR1Zgk2PxT6DiYlP2lBlIjxHxI4A=w544-h544-l90-rj',
      type: 'Album'
    },
    {
      id: 'MPREb_9pY0H77v7p2',
      title: 'Ai Cũng Phải Bắt Đầu Từ Đâu Đó',
      artist: 'HIEUTHUHAI',
      year: '2023',
      thumbnail: 'https://yt3.googleusercontent.com/C4JZMM3eX4wGoEl3HeyYuhwJnQDoxkkSzpZGdC5ouXug5wK28x02-rcgw9JUic5dD-EbwCS5VOVnhnKL=w544-h544-l90-rj',
      type: 'Album'
    },
    {
      id: 'MPREb_9Y6pP2l0g1H',
      title: 'Một Vạn Năm',
      artist: 'Vũ.',
      year: '2022',
      thumbnail: 'https://yt3.googleusercontent.com/gFTAr9PoP3GLk0c4D9g0Pe_Ra8zpcqH4T3Pi6ezyMjxbwGJmrKH2GlTsVpUnw4RuR0D6373dkl0Trbg8=w544-h544-l90-rj',
      type: 'Album'
    },
    {
      id: 'MPREb_8wY0L3hK1m2',
      title: 'LoiChoi: The Lion King',
      artist: 'Wren Evans',
      year: '2023',
      thumbnail: 'https://yt3.googleusercontent.com/IF6xrt6-1gtyN9mugQylNTAePWYdQmwsNEtFQqfswgpsKXvDGaQCRVR2vrLGgY6rv2_NWdIiHiElKJ2y=w544-h544-l90-rj',
      type: 'Album'
    },
    {
      id: 'MPREb_L9k1H8w7p4Y',
      title: 'LINK',
      artist: 'Hoàng Thùy Linh',
      year: '2022',
      thumbnail: 'https://yt3.googleusercontent.com/XYvvkDk8QH7On9v6f-BvbVYm_gWPkB91_BCqnlS2kXbVQY_8tw_Gz3NcltF8CfFMoyDLuaj_QXGvMUqs=w544-h544-l90-rj',
      type: 'Album'
    },
    {
      id: 'MPREb_1J7p2H8w9K0',
      title: 'Tháng Tư Là Lời Nói Dối Của Em',
      artist: 'Hà Anh Tuấn',
      year: '2017',
      thumbnail: 'https://yt3.googleusercontent.com/guPkUMfq6XoStEBVJwwWMD5dttVFgi0OXpzHZ0hvPD0kWxdVkrMbMCBNRDZlUy_N953vMI_r-6x1X_IEWQ=w544-h544-l90-rj',
      type: 'EP'
    },
    {
      id: 'MPREb_0P8w7k1L9H2',
      title: 'Cho Bảo',
      artist: 'B Ray',
      year: '2025',
      thumbnail: 'https://yt3.googleusercontent.com/yvAlf00RoCCR-z9kzE173fBrZhKgLwL29ZXfuIv5hHlkGiAjYK8hAxS9PFARQBom9MrTOtYe3Mt7D5Kp=w544-h544-l90-rj',
      type: 'Album'
    },
    {
      id: 'MPREb_8w9K0P1L2H3',
      title: '22',
      artist: 'MONO',
      year: '2022',
      thumbnail: 'https://yt3.googleusercontent.com/XUL3o2EPMtfAppLw5fDHBPqB8CmWLfsWQTalYQmhQAkAdlsWsVIdUgnT6lYfpYE_dBFdOYiWLlo70tgR=w544-h544-l90-rj',
      type: 'Album'
    },
    {
      id: 'MPREb_3H4k1L8w9P0',
      title: 'Cái Đầu Tiên',
      artist: 'Thắng',
      year: '2023',
      thumbnail: 'https://yt3.googleusercontent.com/guPkUMfq6XoStEBVJwwWMD5dttVFgi0OXpzHZ0hvPD0kWxdVkrMbMCBNRDZlUy_N953vMI_r-6x1X_IEWQ=w544-h544-l90-rj',
      type: 'Album'
    },
    {
      id: 'MPREb_7L9w8k1P0H2',
      title: 'Sky Tour (Original Soundtrack)',
      artist: 'Sơn Tùng M-TP',
      year: '2020',
      thumbnail: 'https://yt3.googleusercontent.com/yvAlf00RoCCR-z9kzE173fBrZhKgLwL29ZXfuIv5hHlkGiAjYK8hAxS9PFARQBom9MrTOtYe3Mt7D5Kp=w544-h544-l90-rj',
      type: 'Album'
    }
  ],
  US: [
    { id: 'MPREb_TS_Midnights', title: 'Midnights', artist: 'Taylor Swift', year: '2022', thumbnail: 'https://yt3.googleusercontent.com/yvAlf00RoCCR-z9kzE173fBrZhKgLwL29ZXfuIv5hHlkGiAjYK8hAxS9PFARQBom9MrTOtYe3Mt7D5Kp=w544-h544-l90-rj', type: 'Album' },
    { id: 'MPREb_BE_HitMeHard', title: 'HIT ME HARD AND SOFT', artist: 'Billie Eilish', year: '2024', thumbnail: 'https://yt3.googleusercontent.com/IF6xrt6-1gtyN9mugQylNTAePWYdQmwsNEtFQqfswgpsKXvDGaQCRVR2vrLGgY6rv2_NWdIiHiElKJ2y=w544-h544-l90-rj', type: 'Album' },
    { id: 'MPREb_OR_GUTS', title: 'GUTS', artist: 'Olivia Rodrigo', year: '2023', thumbnail: 'https://yt3.googleusercontent.com/XYvvkDk8QH7On9v6f-BvbVYm_gWPkB91_BCqnlS2kXbVQY_8tw_Gz3NcltF8CfFMoyDLuaj_QXGvMUqs=w544-h544-l90-rj', type: 'Album' },
    { id: 'MPREb_TW_AfterHours', title: 'After Hours', artist: 'The Weeknd', year: '2020', thumbnail: 'https://yt3.googleusercontent.com/C4JZMM3eX4wGoEl3HeyYuhwJnQDoxkkSzpZGdC5ouXug5wK28x02-rcgw9JUic5dD-EbwCS5VOVnhnKL=w544-h544-l90-rj', type: 'Album' },
    { id: 'MPREb_SC_ShortSweet', title: 'Short n\' Sweet', artist: 'Sabrina Carpenter', year: '2024', thumbnail: 'https://yt3.googleusercontent.com/gFTAr9PoP3GLk0c4D9g0Pe_Ra8zpcqH4T3Pi6ezyMjxbwGJmrKH2GlTsVpUnw4RuR0D6373dkl0Trbg8=w544-h544-l90-rj', type: 'Album' },
    { id: 'MPREb_AG_EternalSun', title: 'eternal sunshine', artist: 'Ariana Grande', year: '2024', thumbnail: 'https://yt3.googleusercontent.com/XUL3o2EPMtfAppLw5fDHBPqB8CmWLfsWQTalYQmhQAkAdlsWsVIdUgnT6lYfpYE_dBFdOYiWLlo70tgR=w544-h544-l90-rj', type: 'Album' },
    { id: 'MPREb_PM_Austin', title: 'AUSTIN', artist: 'Post Malone', year: '2023', thumbnail: 'https://yt3.googleusercontent.com/guPkUMfq6XoStEBVJwwWMD5dttVFgi0OXpzHZ0hvPD0kWxdVkrMbMCBNRDZlUy_N953vMI_r-6x1X_IEWQ=w544-h544-l90-rj', type: 'Album' },
    { id: 'MPREb_BM_SilkSonic', title: 'An Evening with Silk Sonic', artist: 'Bruno Mars', year: '2021', thumbnail: 'https://yt3.googleusercontent.com/ngVF3KN1kOURKqMJEBfDsUknmCkMzlFXEyACOFCIXNLdu8SfTcrbJR1Zgk2PxT6DiYlP2lBlIjxHxI4A=w544-h544-l90-rj', type: 'Album' },
    { id: 'MPREb_KL_GNX', title: 'GNX', artist: 'Kendrick Lamar', year: '2024', thumbnail: 'https://yt3.googleusercontent.com/C4JZMM3eX4wGoEl3HeyYuhwJnQDoxkkSzpZGdC5ouXug5wK28x02-rcgw9JUic5dD-EbwCS5VOVnhnKL=w544-h544-l90-rj', type: 'Album' },
    { id: 'MPREb_DL_RadicalOpt', title: 'Radical Optimism', artist: 'Dua Lipa', year: '2024', thumbnail: 'https://yt3.googleusercontent.com/XYvvkDk8QH7On9v6f-BvbVYm_gWPkB91_BCqnlS2kXbVQY_8tw_Gz3NcltF8CfFMoyDLuaj_QXGvMUqs=w544-h544-l90-rj', type: 'Album' }
  ],
  KR: [
    { id: 'MPREb_NJ_GetUp', title: 'Get Up', artist: 'NewJeans', year: '2023', thumbnail: 'https://yt3.googleusercontent.com/IF6xrt6-1gtyN9mugQylNTAePWYdQmwsNEtFQqfswgpsKXvDGaQCRVR2vrLGgY6rv2_NWdIiHiElKJ2y=w544-h544-l90-rj', type: 'EP' },
    { id: 'MPREb_Aes_Armageddon', title: 'Armageddon', artist: 'aespa', year: '2024', thumbnail: 'https://yt3.googleusercontent.com/XYvvkDk8QH7On9v6f-BvbVYm_gWPkB91_BCqnlS2kXbVQY_8tw_Gz3NcltF8CfFMoyDLuaj_QXGvMUqs=w544-h544-l90-rj', type: 'Album' },
    { id: 'MPREb_IVE_Switch', title: 'IVE SWITCH', artist: 'IVE', year: '2024', thumbnail: 'https://yt3.googleusercontent.com/C4JZMM3eX4wGoEl3HeyYuhwJnQDoxkkSzpZGdC5ouXug5wK28x02-rcgw9JUic5dD-EbwCS5VOVnhnKL=w544-h544-l90-rj', type: 'EP' },
    { id: 'MPREb_LS_Easy', title: 'EASY', artist: 'LE SSERAFIM', year: '2024', thumbnail: 'https://yt3.googleusercontent.com/gFTAr9PoP3GLk0c4D9g0Pe_Ra8zpcqH4T3Pi6ezyMjxbwGJmrKH2GlTsVpUnw4RuR0D6373dkl0Trbg8=w544-h544-l90-rj', type: 'EP' },
    { id: 'MPREb_BTS_Proof', title: 'Proof', artist: 'BTS', year: '2022', thumbnail: 'https://yt3.googleusercontent.com/yvAlf00RoCCR-z9kzE173fBrZhKgLwL29ZXfuIv5hHlkGiAjYK8hAxS9PFARQBom9MrTOtYe3Mt7D5Kp=w544-h544-l90-rj', type: 'Album' },
    { id: 'MPREb_BP_BornPink', title: 'BORN PINK', artist: 'BLACKPINK', year: '2022', thumbnail: 'https://yt3.googleusercontent.com/guPkUMfq6XoStEBVJwwWMD5dttVFgi0OXpzHZ0hvPD0kWxdVkrMbMCBNRDZlUy_N953vMI_r-6x1X_IEWQ=w544-h544-l90-rj', type: 'Album' },
    { id: 'MPREb_IU_TheWinning', title: 'The Winning', artist: 'IU', year: '2024', thumbnail: 'https://yt3.googleusercontent.com/XUL3o2EPMtfAppLw5fDHBPqB8CmWLfsWQTalYQmhQAkAdlsWsVIdUgnT6lYfpYE_dBFdOYiWLlo70tgR=w544-h544-l90-rj', type: 'EP' },
    { id: 'MPREb_SVT_17IsRight', title: '17 IS RIGHT HERE', artist: 'SEVENTEEN', year: '2024', thumbnail: 'https://yt3.googleusercontent.com/ngVF3KN1kOURKqMJEBfDsUknmCkMzlFXEyACOFCIXNLdu8SfTcrbJR1Zgk2PxT6DiYlP2lBlIjxHxI4A=w544-h544-l90-rj', type: 'Album' },
    { id: 'MPREb_SKZ_Ate', title: 'ATE', artist: 'Stray Kids', year: '2024', thumbnail: 'https://yt3.googleusercontent.com/C4JZMM3eX4wGoEl3HeyYuhwJnQDoxkkSzpZGdC5ouXug5wK28x02-rcgw9JUic5dD-EbwCS5VOVnhnKL=w544-h544-l90-rj', type: 'EP' },
    { id: 'MPREb_TY_ToX', title: 'To. X', artist: 'TAEYEON', year: '2023', thumbnail: 'https://yt3.googleusercontent.com/IF6xrt6-1gtyN9mugQylNTAePWYdQmwsNEtFQqfswgpsKXvDGaQCRVR2vrLGgY6rv2_NWdIiHiElKJ2y=w544-h544-l90-rj', type: 'EP' }
  ],
  JP: [
    { id: 'MPREb_JH_SpiritedAway', title: 'Spirited Away (Soundtrack)', artist: 'Joe Hisaishi', year: '2001', thumbnail: 'wood_2.png', type: 'Album' },
    { id: 'MPREb_JH_HowlsCastle', title: 'Howl\'s Moving Castle (Soundtrack)', artist: 'Joe Hisaishi', year: '2004', thumbnail: 'bg.jpg', type: 'Album' },
    { id: 'MPREb_JH_Totoro', title: 'My Neighbor Totoro (Soundtrack)', artist: 'Joe Hisaishi', year: '1988', thumbnail: 'icon-home-music.png', type: 'Album' },
    { id: 'MPREb_YOA_TheBook3', title: 'THE BOOK 3', artist: 'YOASOBI', year: '2023', thumbnail: 'https://yt3.googleusercontent.com/IF6xrt6-1gtyN9mugQylNTAePWYdQmwsNEtFQqfswgpsKXvDGaQCRVR2vrLGgY6rv2_NWdIiHiElKJ2y=w544-h544-l90-rj', type: 'EP' },
    { id: 'MPREb_KY_LostCorner', title: 'LOST CORNER', artist: 'Kenshi Yonezu', year: '2024', thumbnail: 'https://yt3.googleusercontent.com/XYvvkDk8QH7On9v6f-BvbVYm_gWPkB91_BCqnlS2kXbVQY_8tw_Gz3NcltF8CfFMoyDLuaj_QXGvMUqs=w544-h544-l90-rj', type: 'Album' },
    { id: 'MPREb_Ado_Zanmu', title: 'Zanmu', artist: 'Ado', year: '2024', thumbnail: 'https://yt3.googleusercontent.com/C4JZMM3eX4wGoEl3HeyYuhwJnQDoxkkSzpZGdC5ouXug5wK28x02-rcgw9JUic5dD-EbwCS5VOVnhnKL=w544-h544-l90-rj', type: 'Album' },
    { id: 'MPREb_FK_BestOf', title: 'Best of Fujii Kaze 2020-2024', artist: 'Fujii Kaze', year: '2024', thumbnail: 'https://yt3.googleusercontent.com/gFTAr9PoP3GLk0c4D9g0Pe_Ra8zpcqH4T3Pi6ezyMjxbwGJmrKH2GlTsVpUnw4RuR0D6373dkl0Trbg8=w544-h544-l90-rj', type: 'Album' },
    { id: 'MPREb_RAD_YourName', title: 'Your Name.', artist: 'RADWIMPS', year: '2016', thumbnail: 'https://yt3.googleusercontent.com/XUL3o2EPMtfAppLw5fDHBPqB8CmWLfsWQTalYQmhQAkAdlsWsVIdUgnT6lYfpYE_dBFdOYiWLlo70tgR=w544-h544-l90-rj', type: 'Album' },
    { id: 'MPREb_KG_Greatest', title: 'THE GREATEST UNKNOWN', artist: 'King Gnu', year: '2023', thumbnail: 'https://yt3.googleusercontent.com/yvAlf00RoCCR-z9kzE173fBrZhKgLwL29ZXfuIv5hHlkGiAjYK8hAxS9PFARQBom9MrTOtYe3Mt7D5Kp=w544-h544-l90-rj', type: 'Album' },
    { id: 'MPREb_LiSA_Lander', title: 'LANDER', artist: 'LiSA', year: '2022', thumbnail: 'https://yt3.googleusercontent.com/guPkUMfq6XoStEBVJwwWMD5dttVFgi0OXpzHZ0hvPD0kWxdVkrMbMCBNRDZlUy_N953vMI_r-6x1X_IEWQ=w544-h544-l90-rj', type: 'Album' }
  ]
};
FALLBACK_ALBUMS.GB = FALLBACK_ALBUMS.US;
FALLBACK_ALBUMS.GLOBAL = FALLBACK_ALBUMS.US;

// Fallback tracks map for offline/fallback albums
const FALLBACK_ALBUM_TRACKS = {
  default: [
    { id: 'hO4X_mJSqPI', title: 'Cơn Mưa Ngang Qua', artist: 'Sơn Tùng M-TP', duration: '3:51', durationSec: 231, thumbnail: 'bg.jpg' },
    { id: '9PUfFR1PDG0', title: 'Anh Sai Rồi', artist: 'Sơn Tùng M-TP', duration: '4:13', durationSec: 253, thumbnail: 'bg.jpg' },
    { id: '488ceQWoGGw', title: 'Nắng Ấm Xa Dần', artist: 'Sơn Tùng M-TP', duration: '3:12', durationSec: 192, thumbnail: 'bg.jpg' },
    { id: 'knW7-x7Y7Rg', title: 'Hãy Trao Cho Anh', artist: 'Sơn Tùng M-TP', duration: '4:06', durationSec: 246, thumbnail: 'bg.jpg' },
    { id: 'FN7ALfpGxiI', title: 'Nơi Này Có Anh', artist: 'Sơn Tùng M-TP', duration: '4:39', durationSec: 279, thumbnail: 'bg.jpg' }
  ],
  MPREb_JH_SpiritedAway: [
    { id: 'GZ3zL7De6ug', title: 'One Summer\'s Day', artist: 'Joe Hisaishi', duration: '3:09', durationSec: 189, thumbnail: 'wood_2.png' },
    { id: 'yY8pIe0a8Zk', title: 'Reprise', artist: 'Joe Hisaishi', duration: '4:52', durationSec: 292, thumbnail: 'wood_2.png' }
  ],
  MPREb_JH_HowlsCastle: [
    { id: 'yY8pIe0a8Zk', title: 'Merry-Go-Round of Life', artist: 'Joe Hisaishi', duration: '5:10', durationSec: 310, thumbnail: 'bg.jpg' }
  ],
  MPREb_JH_Totoro: [
    { id: '1-S4pC1b1lM', title: 'The Path of the Wind', artist: 'Joe Hisaishi', duration: '3:16', durationSec: 196, thumbnail: 'icon-home-music.png' }
  ]
};
const FALLBACK_TRENDING_TRACKS = [
  {
    id: 'CLSUxac0F9Q',
    title: 'MVP (MƯA VỘI PHÓNG) (feat. Wren Evans, Ali Hoàng Dương, CODY NAM VÕ & HYO)',
    artist: 'Anh Trai Say Hi',
    artists: ['Anh Trai Say Hi', 'Wren Evans'],
    album: 'TẬP 4 ANH TRAI SAY HI',
    duration: '3:42',
    durationSec: 222,
    thumbnail: 'https://yt3.googleusercontent.com/IF6xrt6-1gtyN9mugQylNTAePWYdQmwsNEtFQqfswgpsKXvDGaQCRVR2vrLGgY6rv2_NWdIiHiElKJ2y=w120-h120-l90-rj'
  },
  {
    id: '6Hv80f1-9UQ',
    title: 'Cảm Ơn Người Đã Thức Cùng Tôi',
    artist: 'Phùng Khánh Linh',
    artists: ['Phùng Khánh Linh'],
    album: 'Cảm Ơn Người Đã Thức Cùng Tôi',
    duration: '4:54',
    durationSec: 294,
    thumbnail: 'https://yt3.googleusercontent.com/XYvvkDk8QH7On9v6f-BvbVYm_gWPkB91_BCqnlS2kXbVQY_8tw_Gz3NcltF8CfFMoyDLuaj_QXGvMUqs=w120-h120-l90-rj'
  },
  {
    id: 'HK2eoCbiBPg',
    title: 'Vạn Sự Như Ý',
    artist: 'Trúc Nhân',
    artists: ['Trúc Nhân'],
    album: 'Vạn Sự Như Ý',
    duration: '4:06',
    durationSec: 246,
    thumbnail: 'https://yt3.googleusercontent.com/C4JZMM3eX4wGoEl3HeyYuhwJnQDoxkkSzpZGdC5ouXug5wK28x02-rcgw9JUic5dD-EbwCS5VOVnhnKL=w120-h120-l90-rj'
  },
  {
    id: 'FZZBvg_D-Z0',
    title: 'Dạo Bước HongKong 1999',
    artist: 'NHONHO',
    artists: ['NHONHO'],
    album: 'Dạo Bước HongKong 1999',
    duration: '3:30',
    durationSec: 210,
    thumbnail: 'https://yt3.googleusercontent.com/gFTAr9PoP3GLk0c4D9g0Pe_Ra8zpcqH4T3Pi6ezyMjxbwGJmrKH2GlTsVpUnw4RuR0D6373dkl0Trbg8=w120-h120-l90-rj'
  },
  {
    id: 'Pv8urr9RH6Y',
    title: 'Come My Way',
    artist: 'Sơn Tùng M-TP',
    artists: ['Sơn Tùng M-TP'],
    album: 'Come My Way',
    duration: '3:13',
    durationSec: 193,
    thumbnail: 'https://yt3.googleusercontent.com/yvAlf00RoCCR-z9kzE173fBrZhKgLwL29ZXfuIv5hHlkGiAjYK8hAxS9PFARQBom9MrTOtYe3Mt7D5Kp=w120-h120-l90-rj'
  },
  {
    id: 'qHpE45b4INk',
    title: 'Nơi Này Có Anh',
    artist: 'Sơn Tùng M-TP',
    artists: ['Sơn Tùng M-TP'],
    album: 'Nơi Này Có Anh',
    duration: '4:21',
    durationSec: 261,
    thumbnail: 'https://yt3.googleusercontent.com/guPkUMfq6XoStEBVJwwWMD5dttVFgi0OXpzHZ0hvPD0kWxdVkrMbMCBNRDZlUy_N953vMI_r-6x1X_IEWQ=w120-h120-l90-rj'
  },
  {
    id: 'emMR03tG2CE',
    title: 'Hãy Trao Cho Anh (feat. Snoop Dogg)',
    artist: 'Sơn Tùng M-TP',
    artists: ['Sơn Tùng M-TP', 'Snoop Dogg'],
    album: 'Hãy Trao Cho Anh',
    duration: '4:06',
    durationSec: 246,
    thumbnail: 'https://yt3.googleusercontent.com/XUL3o2EPMtfAppLw5fDHBPqB8CmWLfsWQTalYQmhQAkAdlsWsVIdUgnT6lYfpYE_dBFdOYiWLlo70tgR=w120-h120-l90-rj'
  },
  {
    id: 'GZ3zL7De6ug',
    title: "One Summer's Day (Spirited Away)",
    artist: 'Joe Hisaishi',
    artists: ['Joe Hisaishi', 'Studio Ghibli'],
    album: 'Spirited Away Soundtrack',
    duration: '3:09',
    durationSec: 189,
    thumbnail: 'wood_2.jpg'
  },
  {
    id: '1-S4pC1b1lM',
    title: 'The Path of the Wind (My Neighbor Totoro)',
    artist: 'Joe Hisaishi',
    artists: ['Joe Hisaishi', 'Studio Ghibli'],
    album: 'My Neighbor Totoro Soundtrack',
    duration: '3:16',
    durationSec: 196,
    thumbnail: 'wood_2.jpg'
  },
  {
    id: 'yY8pIe0a8Zk',
    title: 'Merry-Go-Round of Life (Howl\'s Moving Castle)',
    artist: 'Joe Hisaishi',
    artists: ['Joe Hisaishi', 'Studio Ghibli'],
    album: 'Howl\'s Moving Castle Soundtrack',
    duration: '5:10',
    durationSec: 310,
    thumbnail: 'wood_2.jpg'
  }
];

// ============================================================================
// 9. MIDDLEWARES & STATIC ASSETS
// ============================================================================
app.use(cors());
app.use(express.json());

// Phục vụ file tĩnh trực tiếp từ thư mục gốc và thư mục public
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================================
// 10. DUAL-MOUNT API ROUTER (Mounts on both /api and / for maximum compatibility)
// ============================================================================
const apiRouter = express.Router();

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

apiRouter.get('/test-clients/:videoId', async (req, res) => {
  const { videoId } = req.params;
  const cookie = getYouTubeCookie();

  try {
    const yt = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: false
    });
    const track = await yt.music.getInfo(videoId);
    const formats = track.streaming_data?.adaptive_formats || [];
    const audio = formats.filter(f => f.mime_type?.startsWith('audio/'));
    const target = audio.find(f => f.itag === 140) || audio[0];

    let streamUrl = target?.url;
    if (!streamUrl && target && typeof target.decipher === 'function') {
      try {
        streamUrl = await target.decipher(yt.session.player);
      } catch (e) {
        streamUrl = 'decipher_err: ' + e.message;
      }
    }

    return res.json({
      success: true,
      musicStatus: track.playability_status?.status,
      reason: track.playability_status?.reason,
      audioCount: audio.length,
      targetItag: target?.itag,
      streamUrl: streamUrl ? streamUrl.substring(0, 70) + '...' : null
    });
  } catch (err) {
    return res.json({ success: false, error: err.message, stack: err.stack?.substring(0, 300) });
  }
});

// 10.2. Location & Supported Countries
apiRouter.get('/location', (req, res) => {
  const detectedCode = detectCountry(req);
  const hub = COUNTRY_HUBS[detectedCode] || COUNTRY_HUBS.VN;

  res.json({
    success: true,
    countryCode: hub.code,
    countryName: hub.name,
    flag: hub.flag,
    greeting: hub.greeting,
    genres: hub.genres,
    supportedCountries: Object.values(COUNTRY_HUBS).map(c => ({
      code: c.code,
      name: c.name,
      flag: c.flag
    }))
  });
});

// ============================================================================
// 10.3. OFFICIAL CHART METRICS HELPERS
// ============================================================================
function formatViews(count) {
  const n = Number(count);
  if (!n || isNaN(n)) return null;
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B lượt nghe';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M lượt nghe';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K lượt nghe';
  return n + ' lượt nghe';
}

function getRealisticStreams(rank, timeframe = 'daily') {
  const isDaily = timeframe === 'daily';
  const baseRank1 = isDaily ? 8_700_000 : 32_500_000;
  const decay = Math.pow(0.91, Math.max(0, rank - 1));
  const streams = Math.round(baseRank1 * decay);
  return formatViews(streams);
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

// 10.3. Official Trending & Top 100 Charts by Region (Daily 24h & Weekly)
apiRouter.get('/trending', rateLimit({ maxRequests: 60, windowMs: 60000, endpointName: 'trending' }), async (req, res) => {
  const countryCode = detectCountry(req);
  const hub = COUNTRY_HUBS[countryCode] || COUNTRY_HUBS.VN;
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
    const targetPlaylistId = timeframe === 'weekly' ? hub.weeklyPlaylistId : hub.dailyPlaylistId;

    // 1. Tải bảng xếp hạng chính thức từ YouTube Music Chart Playlist
    if (targetPlaylistId && ytSearch.music && typeof ytSearch.music.getPlaylist === 'function') {
      try {
        const pl = await ytSearch.music.getPlaylist(targetPlaylistId);
        const rawItems = pl.items || [];

        for (let i = 0; i < rawItems.length; i++) {
          const item = rawItems[i];
          const id = item.id || item.videoId || item.video_id;
          if (!id || tracks.some(t => t.id === id)) continue;

          const rawTitle = item.title?.text || item.title || 'Unknown Title';
          const rawArtist = item.authors?.[0]?.name || item.artists?.[0]?.name || item.author?.name || '';
          const cleaned = cleanChartSong(rawTitle, rawArtist);

          const duration = item.duration?.text || (item.duration ? String(item.duration) : '3:30');
          const durationSec = item.duration?.seconds || 210;

          if (isSpamTrack(cleaned.title, cleaned.artist, durationSec)) continue;

          const thumbnail = extractThumbnail(item.thumbnail || item.thumbnails);
          const rank = tracks.length + 1;

          tracks.push({
            id,
            title: cleaned.title,
            artist: cleaned.artist,
            artists: cleaned.artist ? [cleaned.artist] : [],
            album: '',
            duration,
            durationSec,
            thumbnail,
            rank,
            views: null,
            playCount: getRealisticStreams(rank, timeframe)
          });

          if (tracks.length >= 20) break;
        }
      } catch (chartErr) {
        console.warn(`[Charts Error] Không thể nạp playlist ${targetPlaylistId}:`, chartErr.message);
      }
    }

    // 2. Nếu playlist chart không có kết quả, fallback sang tìm kiếm từ khóa
    if (tracks.length === 0) {
      for (const query of hub.queries) {
        try {
          let searchResult = null;
          if (ytSearch.music && typeof ytSearch.music.search === 'function') {
            searchResult = await ytSearch.music.search(query, { type: 'song' });
          } else {
            searchResult = await ytSearch.search(query);
          }

          if (searchResult) {
            const contents = searchResult.songs?.contents || searchResult.results || [];
            for (const item of contents) {
              const id = item.id || item.videoId || item.video_id;
              if (!id || tracks.some(t => t.id === id)) continue;

              const rawTitle = item.title?.text || item.title || 'Unknown Title';
              const rawArtist = item.artists?.[0]?.name || item.author?.name || '';
              const cleaned = cleanChartSong(rawTitle, rawArtist);

              const duration = item.duration?.text || (item.duration ? String(item.duration) : '3:30');
              const durationSec = item.duration?.seconds || 210;

              if (isSpamTrack(cleaned.title, cleaned.artist, durationSec)) continue;

              const rank = tracks.length + 1;
              const thumbnail = extractThumbnail(item.thumbnails || item.thumbnail);

              tracks.push({
                id,
                title: cleaned.title,
                artist: cleaned.artist,
                artists: cleaned.artist ? [cleaned.artist] : [],
                album: item.album?.name || '',
                duration,
                durationSec,
                thumbnail,
                rank,
                views: null,
                playCount: getRealisticStreams(rank, timeframe)
              });

              if (tracks.length >= 20) break;
            }
          }
        } catch (err) {
          console.warn(`[Trending] Query "${query}" gặp lỗi:`, err.message);
        }

        if (tracks.length >= 20) break;
      }
    }

    // 3. Fallback sang danh sách mẫu có sẵn nếu không kết nối được
    if (tracks.length === 0) {
      tracks = FALLBACK_TRENDING_TRACKS.map((t, idx) => ({
        ...t,
        rank: idx + 1,
        playCount: getRealisticStreams(idx + 1, timeframe)
      }));
    }

    // 4. Lấy lượt nghe thực tế (Live Views) trực tiếp từ YouTube cho các bài hát
    try {
      const topTracks = tracks.slice(0, 20);
      const viewsPromise = Promise.allSettled(
        topTracks.map(t => ytSearch.getBasicInfo ? ytSearch.getBasicInfo(t.id) : Promise.resolve(null))
      );
      const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 2500));
      const results = await Promise.race([viewsPromise, timeoutPromise]);

      if (results && Array.isArray(results)) {
        results.forEach((resItem, idx) => {
          if (resItem && resItem.status === 'fulfilled' && resItem.value?.basic_info?.view_count) {
            const rawViewCount = resItem.value.basic_info.view_count;
            topTracks[idx].views = rawViewCount;
            topTracks[idx].playCount = formatViews(rawViewCount);
          }
        });
      }
    } catch (viewsErr) {
      console.warn('[Live Views Sync Warning]:', viewsErr.message);
    }

    const responsePayload = {
      success: true,
      timeframe,
      countryCode: hub.code,
      countryName: hub.name,
      flag: hub.flag,
      greeting: hub.greeting,
      genres: hub.genres,
      results: tracks,
      tracks: tracks
    };

    trendingCache.set(cacheKey, responsePayload);
    circuitBreaker.recordSuccess();

    res.json({
      ...responsePayload,
      cached: false
    });
  } catch (error) {
    console.warn('[Trending Fallback Activated]:', error.message);
    const fallbackTracks = FALLBACK_TRENDING_TRACKS.map((t, idx) => ({
      ...t,
      rank: idx + 1,
      playCount: getRealisticStreams(idx + 1, timeframe)
    }));

    const fallbackPayload = {
      success: true,
      timeframe,
      countryCode: hub.code,
      countryName: hub.name,
      flag: hub.flag,
      greeting: hub.greeting,
      genres: hub.genres,
      results: fallbackTracks,
      tracks: fallbackTracks,
      cached: false,
      fallback: true
    };
    trendingCache.set(cacheKey, fallbackPayload);
    res.json(fallbackPayload);
  }
});

// 10.4. Search Tracks (With YouTube live search and iTunes fallback)
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

        const title = item.title?.text || item.title || 'Unknown Title';
        const artist = item.artists?.[0]?.name || item.author?.name || '';
        const album = item.album?.name || '';
        const duration = item.duration?.text || (item.duration ? String(item.duration) : '3:30');
        const durationSec = item.duration?.seconds || 210;

        // Bỏ qua nhạc spam bot AI, tuyển tập, mixtape
        if (isSpamTrack(title, artist, durationSec)) continue;

        const thumbnail = extractThumbnail(item.thumbnails || item.thumbnail);

        tracks.push({
          id,
          title,
          artist,
          artists: artist ? [artist] : [],
          album,
          duration,
          durationSec,
          thumbnail
        });

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
          tracks.push({
            id: `itunes_${item.trackId}`,
            title: item.trackName || 'Unknown Title',
            artist: item.artistName || '',
            artists: item.artistName ? [item.artistName] : [],
            album: item.collectionName || '',
            duration: `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
            durationSec,
            thumbnail: item.artworkUrl100?.replace('100x100bb', '300x300bb') || 'wood_2.jpg',
            previewUrl: item.previewUrl
          });
        }
      }
    } catch (itunesErr) {
      console.warn('[iTunes Fallback Search Warning]:', itunesErr.message);
    }
  }

  // Fallback 2: Lọc từ danh sách bài hát có sẵn
  if (tracks.length === 0) {
    const qLower = query.toLowerCase();
    tracks = FALLBACK_TRENDING_TRACKS.filter(t =>
      t.title.toLowerCase().includes(qLower) ||
      t.artist.toLowerCase().includes(qLower)
    );
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
  const hub = COUNTRY_HUBS[countryCode] || COUNTRY_HUBS.VN;

  const cacheKey = searchQuery
    ? `albums:search:${searchQuery.toLowerCase()}`
    : `albums:region:${hub.code}`;

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
        if (isSpamAlbum(title, artist)) continue;

        const thumbnail = extractThumbnail(item.thumbnails || item.thumbnail);
        const year = item.year ? String(item.year) : '';
        const lowerTitle = title.toLowerCase();
        const isEP = lowerTitle.includes('ep') || lowerTitle.includes('single') || lowerTitle.includes('mini');
        const albumType = isEP ? 'EP' : 'Album';

        albums.push({
          id,
          title,
          artist: artist || 'Nghệ sĩ',
          year,
          thumbnail,
          type: albumType
        });

        if (albums.length >= 10) break;
      }
    } else {
      // 2. Liệt kê 10 EP / Album nghệ sĩ theo vùng quốc gia đã chọn
      const queries = hub.albumQueries || [`${hub.name} top albums`];
      const seenArtists = new Set();

      for (const query of queries) {
        try {
          const searchRes = await ytSearch.music.search(query, { type: 'album' });
          const contents = searchRes.albums?.contents || searchRes.results || [];

          for (const item of contents) {
            const id = item.id;
            if (!id || albums.some(a => a.id === id)) continue;

            const title = item.title?.text || item.title?.toString() || 'Album';
            const artist = item.author?.name || item.artists?.[0]?.name || '';

            if (isSpamAlbum(title, artist)) continue;

            // Đảm bảo đa dạng nghệ sĩ (mỗi nghệ sĩ tối đa 1 album trong top 10)
            const normArtist = artist.toLowerCase().trim();
            if (normArtist && seenArtists.has(normArtist)) continue;

            const thumbnail = extractThumbnail(item.thumbnails || item.thumbnail);
            const year = item.year ? String(item.year) : '';
            const lowerTitle = title.toLowerCase();
            const isEP = lowerTitle.includes('ep') || lowerTitle.includes('single') || lowerTitle.includes('mini');
            const albumType = isEP ? 'EP' : 'Album';

            if (normArtist) seenArtists.add(normArtist);

            albums.push({
              id,
              title,
              artist: artist || 'Nghệ sĩ',
              year,
              thumbnail,
              type: albumType
            });

            if (albums.length >= 10) break;
          }
        } catch (err) {
          console.warn(`[Albums] Query "${query}" warning:`, err.message);
        }

        if (albums.length >= 10) break;
      }

      // Quét thêm qua hạt giống nghệ sĩ nếu chưa đủ 10 album
      if (albums.length < 10 && hub.albumArtistSeeds) {
        for (const artistName of hub.albumArtistSeeds) {
          const normArtist = artistName.toLowerCase().trim();
          if (seenArtists.has(normArtist)) continue;

          try {
            const artistRes = await ytSearch.music.search(`${artistName} album`, { type: 'album' });
            const contents = artistRes.albums?.contents || [];
            for (const item of contents) {
              const id = item.id;
              if (!id || albums.some(a => a.id === id)) continue;
              const title = item.title?.text || item.title?.toString() || 'Album';
              const artist = item.author?.name || item.artists?.[0]?.name || artistName;
              if (isSpamAlbum(title, artist)) continue;

              const thumbnail = extractThumbnail(item.thumbnails || item.thumbnail);
              const year = item.year ? String(item.year) : '';
              const lowerTitle = title.toLowerCase();
              const isEP = lowerTitle.includes('ep') || lowerTitle.includes('single') || lowerTitle.includes('mini');
              const albumType = isEP ? 'EP' : 'Album';

              seenArtists.add(normArtist);
              albums.push({
                id,
                title,
                artist,
                year,
                thumbnail,
                type: albumType
              });
              break;
            }
          } catch (e) {
            // ignore
          }

          if (albums.length >= 10) break;
        }
      }
    }

    if (albums.length === 0) {
      albums = FALLBACK_ALBUMS[hub.code] || FALLBACK_ALBUMS.VN;
    }

    const payload = {
      success: true,
      countryCode: hub.code,
      countryName: hub.name,
      flag: hub.flag,
      query: searchQuery || '',
      results: albums,
      albums
    };

    albumCache.set(cacheKey, payload);
    circuitBreaker.recordSuccess();
    res.json({ ...payload, cached: false });
  } catch (error) {
    console.warn('[Albums Fallback]:', error.message);
    const fallbackList = FALLBACK_ALBUMS[hub.code] || FALLBACK_ALBUMS.VN;
    const fallbackPayload = {
      success: true,
      countryCode: hub.code,
      countryName: hub.name,
      flag: hub.flag,
      query: searchQuery || '',
      results: fallbackList,
      albums: fallbackList,
      fallback: true
    };
    albumCache.set(cacheKey, fallbackPayload);
    res.json(fallbackPayload);
  }
});

// Map chuẩn hóa các bài hát có MV bị dài lê thê về đúng bản Official Lyric Video & thời lượng thực tế
const KNOWN_LYRIC_TRACKS = {
  // Call Me - Wren Evans (Bản Official Lyric Video LOI CHOI chuẩn 3:35 thay vì MV 6:15)
  'wrcorytidddq': { id: 'DlION6FK-Yc', duration: '3:35', durationSec: 215 },
  'wrcorytidddq_call me': { id: 'DlION6FK-Yc', duration: '3:35', durationSec: 215 },
  'call me_wren evans': { id: 'DlION6FK-Yc', duration: '3:35', durationSec: 215 },
  // Đừng Làm Trái Tim Anh Đau - Sơn Tùng M-TP (Bản Lyric Video chuẩn 4:42 thay vì MV 5:26)
  'abpmzczzrfa': { id: 'NItL-whRVFo', duration: '4:42', durationSec: 282 },
  'đừng làm trái tim anh đau_sơn tùng m-tp': { id: 'NItL-whRVFo', duration: '4:42', durationSec: 282 },
  // Em Của Ngày Hôm Qua - Sơn Tùng M-TP (Bản audio chuẩn 4:24)
  'c3xo9fkoudg': { id: 'I_U4mU7Dq_4', duration: '4:24', durationSec: 264 },
  'vt4kau-ziry': { id: 'I_U4mU7Dq_4', duration: '4:24', durationSec: 264 }
};

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
      artist = albumData.author?.name || albumData.artists?.[0]?.name || 'Nghệ sĩ';
    }

    const rawContents = albumData.contents || [];

    // Tối ưu và chuẩn hóa: Lấy đúng bản Official Lyrics Video & thời lượng thực tế
    const resolvedTracks = await Promise.all(
      rawContents.map(async (item) => {
        let id = item.id || item.videoId;
        if (!id) return null;

        const trackTitle = item.title?.text || item.title?.toString() || 'Unknown Track';
        const trackArtist = item.author?.name || item.artists?.[0]?.name || artist;
        let duration = item.duration?.text || (item.duration ? String(item.duration) : '3:30');
        let durationSec = item.duration?.seconds || 210;

        // 1. Kiểm tra bảng map các bài hát có Official Lyric Video chuẩn
        const mapKey = (id || '').toLowerCase();
        const artistKey = `${trackTitle}_${trackArtist}`.toLowerCase();
        if (KNOWN_LYRIC_TRACKS[mapKey]) {
          id = KNOWN_LYRIC_TRACKS[mapKey].id;
          duration = KNOWN_LYRIC_TRACKS[mapKey].duration;
          durationSec = KNOWN_LYRIC_TRACKS[mapKey].durationSec;
          return { id, title: trackTitle, artist: trackArtist, album: title, duration, durationSec, thumbnail };
        }
        if (KNOWN_LYRIC_TRACKS[artistKey]) {
          id = KNOWN_LYRIC_TRACKS[artistKey].id;
          duration = KNOWN_LYRIC_TRACKS[artistKey].duration;
          durationSec = KNOWN_LYRIC_TRACKS[artistKey].durationSec;
          return { id, title: trackTitle, artist: trackArtist, album: title, duration, durationSec, thumbnail };
        }

        // 2. Kiểm tra nếu video bị gắn nhầm sang Official Music Video bị phình thời lượng (> 20s so với bản thu chuẩn)
        try {
          const basicInfo = await ytSearch.getBasicInfo(id);
          if (basicInfo && basicInfo.basic_info) {
            const sec = basicInfo.basic_info.duration;
            const rawTitle = (basicInfo.basic_info.title || '').toLowerCase();
            const isBloatedMV = (sec && durationSec && sec > durationSec + 25) || 
              ((rawTitle.includes('official music video') || rawTitle.includes('official mv')) && (sec > durationSec + 15));

            if (isBloatedMV) {
              // Tìm kiếm nhanh bản Official Lyric Video hoặc Song Audio chuẩn của YouTube Music
              try {
                const songRes = await ytSearch.music.search(`${trackArtist} ${trackTitle}`, { type: 'song' });
                const cleanSong = songRes.songs?.contents?.[0];
                if (cleanSong && cleanSong.id && cleanSong.id !== id) {
                  id = cleanSong.id;
                  duration = cleanSong.duration?.text || duration;
                  durationSec = cleanSong.duration?.seconds || durationSec;
                }
              } catch (_) {}
            } else if (sec && sec > 0) {
              durationSec = sec;
              const m = Math.floor(sec / 60);
              const s = sec % 60;
              duration = `${m}:${String(s).padStart(2, '0')}`;
            }
          }
        } catch {
          // Fallback giữ nguyên thời lượng ban đầu
        }

        return {
          id,
          title: trackTitle,
          artist: trackArtist,
          album: title,
          duration,
          durationSec,
          thumbnail
        };
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
    console.warn(`[Album Detail Fallback for ${albumId}]:`, err.message);
    const fallbackTracks = FALLBACK_ALBUM_TRACKS[albumId] || FALLBACK_ALBUM_TRACKS.default;
    res.json({
      success: true,
      album: {
        id: albumId,
        title: 'Album Tuyển Chọn',
        artist: 'Nghệ sĩ',
        subtitle: 'Album',
        type: 'Album',
        thumbnail: 'wood_2.jpg',
        trackCount: fallbackTracks.length,
        tracks: fallbackTracks
      },
      fallback: true
    });
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
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15',
      'Range': rangeHeader,
      'Accept': '*/*'
    };

    const abortController = new AbortController();
    req.on('close', () => abortController.abort());

    let upstreamResponse = await fetch(streamData.url, {
      headers: upstreamHeaders,
      signal: abortController.signal
    });

    if (upstreamResponse.status === 403) {
      console.warn(`[Stream] Upstream 403 for ${videoId}. Refreshing stream cache...`);
      streamCache.delete(videoId);
      streamData = await resolveAudioStream(videoId, true);
      upstreamResponse = await fetch(streamData.url, {
        headers: upstreamHeaders,
        signal: abortController.signal
      });
    }

    if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
      console.warn(`[Stream Proxy Fail] Status ${upstreamResponse.status}. Attempting 302 redirect fallback...`);
      return res.redirect(302, streamData.url);
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
    const info = await ytSearch.getBasicInfo(videoId);
    res.json({
      id: videoId,
      title: info.basic_info.title,
      artist: info.basic_info.author,
      duration: info.basic_info.duration,
      thumbnail: extractThumbnail(info.basic_info.thumbnail)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch video info', message: err.message });
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
    try {
      const fs = await import('fs');
      const localFilePath = path.join(__dirname, 'data', 'community_tracks.json');
      if (fs.existsSync(localFilePath)) {
        const raw = fs.readFileSync(localFilePath, 'utf8');
        inMemoryCommunityTracks = JSON.parse(raw);
        lastCommunityFetch = now;
      }
    } catch {
      inMemoryCommunityTracks = [];
    }
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
    const fs = await import('fs');
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(path.join(dataDir, 'community_tracks.json'), JSON.stringify(tracks, null, 2), 'utf8');
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
      directAudioUrl
    } = req.body || {};

    if (!directAudioUrl && !audioBase64) {
      return res.status(400).json({ success: false, error: 'Vui lòng chọn file nhạc MP3 hoặc cung cấp link audio' });
    }

    const cleanTitle = (title || audioName || 'Khúc Ca Mộc Mạc').replace(/\.[^/.]+$/, '').trim();
    const cleanArtist = (artist || 'Cộng đồng Home Music').trim();

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
