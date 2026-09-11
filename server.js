import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Innertube, ClientType, UniversalCache } from 'youtubei.js';

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
// 6. DUAL-CLIENT INNERTUBE ENGINE (Search Client & VisionOS Stream Client)
// ============================================================================
let ytSearchInstance = null;
let ytStreamInstance = null;

async function getSearchClient() {
  if (!ytSearchInstance) {
    ytSearchInstance = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true
    });
    console.log('✅ YouTube Search client initialized (WEB/MUSIC)');
  }
  return ytSearchInstance;
}

async function getStreamClient() {
  if (!ytStreamInstance) {
    ytStreamInstance = await Innertube.create({
      client_type: ClientType.VISIONOS,
      cache: new UniversalCache(false),
      generate_session_locally: true
    });
    console.log('✅ YouTube Stream client initialized (VISIONOS Unthrottled Engine)');
  }
  return ytStreamInstance;
}

async function getClients() {
  const ytSearch = await getSearchClient();
  const ytStream = await getStreamClient();
  return { ytSearch, ytStream };
}

// Helper resolve audio stream URL qua VisionOS
async function resolveAudioStream(videoId, forceRefresh = false) {
  if (!forceRefresh) {
    const cached = streamCache.get(videoId);
    if (cached) return cached;
  }

  const ytStream = await getStreamClient();
  const info = await ytStream.getBasicInfo(videoId);
  const formats = info.streaming_data?.adaptive_formats || [];

  const audioFormats = formats.filter(f => f.mime_type?.startsWith('audio/') && f.url);

  if (audioFormats.length === 0) {
    throw new Error('Không tìm thấy luồng âm thanh trực tiếp cho bài hát này.');
  }

  let chosenFormat =
    audioFormats.find(f => f.itag === 140) ||
    audioFormats.find(f => f.itag === 251) ||
    audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];

  try {
    const urlObj = new URL(chosenFormat.url);
    if (!urlObj.hostname.endsWith('.googlevideo.com') && !urlObj.hostname.endsWith('.c.youtube.com')) {
      throw new Error(`Unauthorized upstream domain: ${urlObj.hostname}`);
    }
  } catch (e) {
    throw new Error(`Invalid upstream URL: ${e.message}`);
  }

  const streamData = {
    videoId,
    url: chosenFormat.url,
    itag: chosenFormat.itag,
    mimeType: chosenFormat.mime_type.split(';')[0],
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
    greeting: 'Bảng Xếp Hạng & Xu Hướng Thịnh Hành Hôm Nay',
    queries: ['nhạc trẻ vpop thịnh hành', 'top bài hát việt nam', 'hit vpop hay nhất hiện nay'],
    genres: ['Tất cả', 'V-Pop', 'Nhạc Trẻ Thịnh Hành', 'Indie Việt', 'Vinahouse', 'Ballad Buồn']
  },
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    greeting: 'Trending & Billboard Charts Today',
    queries: ['top 100 songs 2026', 'billboard hot 100 hits', 'us pop hits'],
    genres: ['All', 'Billboard Top 100', 'Pop Hits', 'Hip-Hop & Rap', 'R&B', 'Indie Rock']
  },
  KR: {
    code: 'KR',
    name: 'South Korea',
    flag: '🇰🇷',
    greeting: 'K-Pop Melon & Genie Charts',
    queries: ['kpop top hits 2026', 'melon top 100', 'korean pop'],
    genres: ['전체', 'K-Pop Top 100', 'K-Drama OST', 'K-Indie', 'Korean Hip-Hop', 'Ballad']
  },
  JP: {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    greeting: 'J-Pop & Anime Oricon Charts',
    queries: ['jpop top hits 2026', 'anime opening songs', 'japanese songs'],
    genres: ['すべて', 'J-Pop Oricon', 'Anime OST', 'City Pop', 'J-Rock', 'Vocaloid']
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    greeting: 'Official UK Top 40 & Trending',
    queries: ['uk top 40 2026', 'british pop hits', 'uk drill'],
    genres: ['All', 'UK Official Top 40', 'Britpop', 'Grime & Drill', 'Indie Alternative', 'EDM']
  },
  GLOBAL: {
    code: 'GLOBAL',
    name: 'Global',
    flag: '🌐',
    greeting: 'Global Hits & Viral 50',
    queries: ['today top hits 2026', 'global viral songs', 'popular songs global'],
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

// Helper trích xuất thumbnail
function extractThumbnail(thumbnails) {
  if (!thumbnails) return 'wood_2.jpg';
  if (Array.isArray(thumbnails) && thumbnails.length > 0) {
    return thumbnails[thumbnails.length - 1].url;
  }
  if (thumbnails.contents && Array.isArray(thumbnails.contents) && thumbnails.contents.length > 0) {
    return thumbnails.contents[thumbnails.contents.length - 1].url;
  }
  if (typeof thumbnails === 'string') return thumbnails;
  return 'wood_2.jpg';
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
// 8. CURATED HIGH-QUALITY FALLBACK TRACKS (Always available & resilient)
// ============================================================================
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

// 10.3. Trending Tracks by Region
apiRouter.get('/trending', rateLimit({ maxRequests: 60, windowMs: 60000, endpointName: 'trending' }), async (req, res) => {
  const countryCode = detectCountry(req);
  const hub = COUNTRY_HUBS[countryCode] || COUNTRY_HUBS.VN;
  const cacheKey = `trending:${hub.code}`;
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

            const title = item.title?.text || item.title || 'Unknown Title';
            const artist = item.artists?.[0]?.name || item.author?.name || '';
            const album = item.album?.name || '';
            const duration = item.duration?.text || (item.duration ? String(item.duration) : '3:30');
            const durationSec = item.duration?.seconds || 210;

            // Bỏ qua nhạc spam bot AI, tuyển tập, mixtape
            if (isSpamTrack(title, artist, durationSec)) continue;

            // Chống một kênh/nghệ sĩ spam tràn màn hình (tối đa 2 bài/nghệ sĩ)
            const artistKey = (artist || 'unknown').toLowerCase().trim();
            if (artistKey && artistKey !== 'unknown') {
              const currentCount = tracks.filter(t => (t.artist || '').toLowerCase().trim() === artistKey).length;
              if (currentCount >= 2) continue;
            }

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

            if (tracks.length >= 20) break;
          }
        }
      } catch (err) {
        console.warn(`[Trending] Query "${query}" gặp lỗi:`, err.message);
      }

      if (tracks.length >= 20) break;
    }

    if (tracks.length === 0) {
      tracks = FALLBACK_TRENDING_TRACKS;
    }

    const responsePayload = {
      success: true,
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
    const fallbackPayload = {
      success: true,
      countryCode: hub.code,
      countryName: hub.name,
      flag: hub.flag,
      greeting: hub.greeting,
      genres: hub.genres,
      results: FALLBACK_TRENDING_TRACKS,
      tracks: FALLBACK_TRENDING_TRACKS,
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
      // @ts-ignore
      Readable.fromWeb(upstreamResponse.body).pipe(res);
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

// Gắn router vào cả 2 đường dẫn /api và / để tương thích tuyệt đối mọi môi trường
app.use('/api', apiRouter);
app.use('/', apiRouter);

// ============================================================================
// 11. GLOBAL UNHANDLED ERROR HANDLERS
// ============================================================================
process.on('uncaughtException', err => {
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
