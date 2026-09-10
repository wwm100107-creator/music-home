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

async function getClients() {
  if (!ytSearchInstance) {
    ytSearchInstance = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true
    });
    console.log('✅ YouTube Search client initialized (WEB/MUSIC)');
  }

  if (!ytStreamInstance) {
    ytStreamInstance = await Innertube.create({
      client_type: ClientType.VISIONOS,
      cache: new UniversalCache(false),
      generate_session_locally: true
    });
    console.log('✅ YouTube Stream client initialized (VISIONOS Unthrottled Engine)');
  }

  return { ytSearch: ytSearchInstance, ytStream: ytStreamInstance };
}

// Khởi tạo ngầm
getClients().catch(e => console.warn('[Innertube] Đang khởi động nền:', e.message));

// Helper resolve audio stream URL qua VisionOS
async function resolveAudioStream(videoId, forceRefresh = false) {
  if (!forceRefresh) {
    const cached = streamCache.get(videoId);
    if (cached) return cached;
  }

  const { ytStream } = await getClients();
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
    queries: ['vpop hot 2026', 'nhạc trẻ thịnh hành', 'nhạc việt hay nhất'],
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
// 8. MIDDLEWARES & STATIC ASSETS
// ============================================================================
app.use(cors());
app.use(express.json());

// Phục vụ file tĩnh trực tiếp từ thư mục gốc
app.use(express.static(__dirname));

// ============================================================================
// 9. API ROUTES
// ============================================================================

// 9.1. Health Check
app.get('/api/health', (req, res) => {
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

// 9.2. Location & Supported Countries
app.get('/api/location', (req, res) => {
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

// 9.3. Trending Tracks by Region
app.get('/api/trending', rateLimit({ maxRequests: 40, windowMs: 60000, endpointName: 'trending' }), async (req, res) => {
  try {
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

    if (!circuitBreaker.canRequest()) {
      return res.status(503).json({
        error: 'Circuit Breaker Active',
        message: 'Hệ thống đang tạm nghỉ bảo vệ IP khỏi YouTube. Vui lòng thử lại sau 30s.'
      });
    }

    const { ytSearch } = await getClients();
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
    circuitBreaker.recordFailure(error.status || 500);
    console.error('[Trending Error]:', error);
    res.status(500).json({
      error: 'Failed to fetch trending songs',
      message: error.message
    });
  }
});

// 9.4. Search Tracks
app.get('/api/search', rateLimit({ maxRequests: 30, windowMs: 60000, endpointName: 'search' }), async (req, res) => {
  const query = req.query.q?.trim();
  if (!query) {
    return res.status(400).json({ error: 'Missing search query (q)' });
  }

  const cacheKey = `search:${query.toLowerCase()}`;
  const cached = searchCache.get(cacheKey);
  if (cached) {
    return res.json({ ...cached, cached: true });
  }

  if (!circuitBreaker.canRequest()) {
    return res.status(503).json({
      error: 'Circuit Breaker Active',
      message: 'Hệ thống đang tạm nghỉ bảo vệ IP khỏi YouTube. Vui lòng thử lại sau 30s.'
    });
  }

  try {
    const { ytSearch } = await getClients();
    let searchResult;
    try {
      searchResult = await ytSearch.music.search(query, { type: 'song' });
    } catch {
      searchResult = await ytSearch.search(query);
    }

    let tracks = [];
    const contents = searchResult.songs?.contents || searchResult.results || [];

    for (const item of contents) {
      const id = item.id || item.videoId || item.video_id;
      if (!id) continue;

      const title = item.title?.text || item.title || 'Unknown Title';
      const artist = item.artists?.[0]?.name || item.author?.name || '';
      const album = item.album?.name || '';
      const duration = item.duration?.text || (item.duration ? String(item.duration) : '3:30');
      const durationSec = item.duration?.seconds || 210;
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

    const payload = {
      success: true,
      query,
      results: tracks,
      tracks
    };

    searchCache.set(cacheKey, payload);
    circuitBreaker.recordSuccess();

    res.json({ ...payload, cached: false });
  } catch (err) {
    circuitBreaker.recordFailure(err.status || 500);
    console.error('[Search Error]:', err);
    res.status(500).json({ error: 'Search failed', message: err.message });
  }
});

// 9.5. Audio Stream Proxy (VisionOS Unthrottled Audio Stream)
const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{10,12}$/;

app.get('/api/stream/:videoId', rateLimit({ maxRequests: 150, windowMs: 60000, endpointName: 'stream' }), async (req, res) => {
  const { videoId } = req.params;

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
      console.error(`[Stream Error] Upstream returned status ${upstreamResponse.status}`);
      if (upstreamResponse.status === 429) circuitBreaker.recordFailure(429);
      return res.status(upstreamResponse.status).send('Upstream stream error');
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

// 9.6. Video Info
app.get('/api/info/:videoId', async (req, res) => {
  const { videoId } = req.params;
  if (!VIDEO_ID_REGEX.test(videoId)) {
    return res.status(400).json({ error: 'Invalid YouTube Video ID format' });
  }

  try {
    const { ytSearch } = await getClients();
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
// 10. GLOBAL UNHANDLED ERROR HANDLERS
// ============================================================================
process.on('uncaughtException', err => {
  console.error('[UNCAUGHT EXCEPTION]:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]:', reason);
});

// Khởi chạy server nếu chạy cục bộ
if (process.env.VERCEL !== '1') {
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
