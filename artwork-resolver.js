const MBID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DEFAULT_IMAGE = 'wood_2.jpg';
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MISS_TTL_MS = 6 * 60 * 60 * 1000;

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function isHttpImage(value) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function asBigPreview(value) {
  return String(value || '').replace('https://assets.fanart.tv/fanart/', 'https://assets.fanart.tv/bigpreview/');
}

function bestImage(entries = []) {
  return [...entries]
    .filter(entry => isHttpImage(entry?.url))
    .sort((a, b) => (Number.parseInt(b.likes, 10) || 0) - (Number.parseInt(a.likes, 10) || 0))[0]?.url || '';
}

function creditedArtists(group) {
  return (group?.['artist-credit'] || []).flatMap(entry => {
    if (typeof entry === 'string') return [entry];
    return [entry?.artist?.name || entry?.name].filter(Boolean);
  });
}

export default class ArtworkResolver {
  constructor({ getFanartApiKey, getFanartClientKey, fetchImpl = fetch } = {}) {
    this.getFanartApiKey = getFanartApiKey || (() => '');
    this.getFanartClientKey = getFanartClientKey || (() => '');
    this.fetchImpl = fetchImpl;
    this.artworkCache = new Map();
    this.musicBrainzCache = new Map();
    this.musicBrainzQueue = Promise.resolve();
    this.lastMusicBrainzRequestAt = 0;
  }

  async resolve(input = {}) {
    const kind = input.kind === 'artist' ? 'artist' : 'release';
    const title = String(input.title || '').trim().slice(0, 180);
    const artist = String(input.primaryArtist || input.artist || '').trim().slice(0, 120);
    const artistId = MBID_PATTERN.test(String(input.artistId || '')) ? String(input.artistId) : '';
    const releaseId = MBID_PATTERN.test(String(input.releaseId || '')) ? String(input.releaseId) : '';
    const stableKey = kind === 'artist'
      ? `artist:${artistId || normalizeText(artist)}`
      : `release:${releaseId || input.albumId || input.videoId || normalizeText(`${title}|${artist}`)}`;
    const cached = this.artworkCache.get(stableKey);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    const cachedPromise = this.inFlight?.get(stableKey);
    if (cachedPromise) return cachedPromise;
    this.inFlight ||= new Map();
    const pending = this.resolveUncached({ ...input, kind, title, artist, artistId, releaseId, stableKey })
      .then(value => {
        this.artworkCache.set(stableKey, {
          value,
          expiresAt: Date.now() + (value.artworkSource === 'neutral-fallback' ? MISS_TTL_MS : CACHE_TTL_MS)
        });
        return value;
      })
      .finally(() => this.inFlight.delete(stableKey));
    this.inFlight.set(stableKey, pending);
    return pending;
  }

  async resolveUncached(item) {
    const result = {
      kind: item.kind,
      title: item.title,
      artist: item.artist,
      artistId: item.artistId,
      releaseId: item.releaseId,
      albumId: String(item.albumId || ''),
      videoId: String(item.videoId || ''),
      thumbnail: '',
      artistThumbnail: '',
      artworkSource: 'neutral-fallback'
    };

    if (item.kind === 'artist' && isHttpImage(item.artistThumbnail)) {
      result.artistThumbnail = item.artistThumbnail;
      result.thumbnail = item.artistThumbnail;
      result.artworkSource = item.source === 'lastfm' ? 'lastfm' : 'youtube-music-artist';
      return result;
    }
    if (item.kind !== 'artist' && isHttpImage(item.thumbnail)) {
      result.thumbnail = item.thumbnail;
      result.artworkSource = item.source === 'youtube-music-album' || item.source === 'youtube-music'
        ? 'youtube-music'
        : 'source';
      return result;
    }

    if (item.kind === 'artist') {
      if (!result.artistId && item.artist) result.artistId = await this.findArtistId(item.artist);
      if (result.artistId) {
        const profileImage = await this.getFanartArtistThumbnail(result.artistId);
        if (profileImage) {
          result.artistThumbnail = profileImage;
          result.thumbnail = profileImage;
          result.artworkSource = 'fanart.tv';
          return result;
        }
      }
      if (isHttpImage(item.sourceThumbnail)) {
        result.artistThumbnail = item.sourceThumbnail;
        result.thumbnail = item.sourceThumbnail;
        result.artworkSource = String(item.source || 'source');
      }
      return result;
    }

    if (!result.releaseId && item.title && item.artist) {
      const match = await this.findReleaseGroup(item.title, item.artist);
      result.releaseId = match?.releaseId || '';
      if (!result.artistId) result.artistId = match?.artistId || '';
    }
    if (result.releaseId) {
      const coverArt = await this.getCoverArtArchiveImage(result.releaseId);
      if (coverArt) {
        result.thumbnail = coverArt;
        result.artworkSource = 'cover-art-archive';
        return result;
      }
      const fanartCover = await this.getFanartAlbumCover(result.releaseId);
      if (fanartCover) {
        result.thumbnail = fanartCover;
        result.artworkSource = 'fanart.tv';
        return result;
      }
    }
    if (isHttpImage(item.sourceThumbnail)) {
      result.thumbnail = item.sourceThumbnail;
      result.artworkSource = String(item.source || 'source');
    } else {
      result.thumbnail = DEFAULT_IMAGE;
    }
    return result;
  }

  async musicBrainzJson(url) {
    const task = this.musicBrainzQueue.then(async () => {
      const waitMs = Math.max(0, this.lastMusicBrainzRequestAt + 1100 - Date.now());
      if (waitMs) await new Promise(resolve => setTimeout(resolve, waitMs));
      this.lastMusicBrainzRequestAt = Date.now();
      const response = await this.fetchImpl(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'MusicHome/1.0 (https://github.com/wwm100107-creator/music-home)'
        },
        signal: AbortSignal.timeout(8000)
      });
      return response.ok ? response.json() : null;
    });
    this.musicBrainzQueue = task.then(() => undefined, () => undefined);
    try {
      return await task;
    } catch {
      return null;
    }
  }

  async findArtistId(name) {
    const key = `artist:${normalizeText(name)}`;
    const cached = this.musicBrainzCache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.value;
    const params = new URLSearchParams({ query: `artist:"${String(name).replace(/["\\]/g, ' ').trim()}"`, fmt: 'json', limit: '5' });
    const data = await this.musicBrainzJson(`https://musicbrainz.org/ws/2/artist/?${params}`);
    const wanted = normalizeText(name);
    const matches = (data?.artists || []).filter(item => normalizeText(item.name) === wanted);
    const match = matches.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))[0];
    const value = MBID_PATTERN.test(String(match?.id || '')) ? match.id : '';
    this.musicBrainzCache.set(key, { value, expiresAt: Date.now() + (value ? CACHE_TTL_MS : MISS_TTL_MS) });
    return value;
  }

  async findReleaseGroup(title, artist) {
    const key = `release:${normalizeText(`${title}|${artist}`)}`;
    const cached = this.musicBrainzCache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.value;
    const safeTitle = String(title).replace(/["\\]/g, ' ').trim();
    const safeArtist = String(artist).replace(/["\\]/g, ' ').trim();
    const params = new URLSearchParams({
      query: `releasegroup:"${safeTitle}" AND artist:"${safeArtist}"`,
      fmt: 'json',
      limit: '8'
    });
    const data = await this.musicBrainzJson(`https://musicbrainz.org/ws/2/release-group/?${params}`);
    const wantedTitle = normalizeText(title);
    const wantedArtist = normalizeText(artist);
    const matches = (data?.['release-groups'] || []).filter(group =>
      normalizeText(group.title) === wantedTitle && creditedArtists(group).some(name => normalizeText(name) === wantedArtist)
    );
    const match = matches.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))[0];
    const value = MBID_PATTERN.test(String(match?.id || ''))
      ? {
        releaseId: match.id,
        artistId: match['artist-credit']?.find(entry => entry?.artist?.id)?.artist.id || ''
      }
      : null;
    this.musicBrainzCache.set(key, { value, expiresAt: Date.now() + (value ? CACHE_TTL_MS : MISS_TTL_MS) });
    return value;
  }

  async getCoverArtArchiveImage(releaseGroupId) {
    try {
      const response = await this.fetchImpl(`https://coverartarchive.org/release-group/${encodeURIComponent(releaseGroupId)}`, {
        headers: { Accept: 'application/json', 'User-Agent': 'MusicHome/1.0 (https://github.com/wwm100107-creator/music-home)' },
        signal: AbortSignal.timeout(8000)
      });
      if (!response.ok) return '';
      const data = await response.json();
      const front = (data.images || []).find(image => image.front) || data.images?.[0];
      return front?.thumbnails?.large || front?.thumbnails?.small || front?.image || '';
    } catch {
      return '';
    }
  }

  async getFanartJson(pathname) {
    const apiKey = String(this.getFanartApiKey() || '').trim();
    if (!apiKey) return null;
    const url = new URL(`https://webservice.fanart.tv/v3.2${pathname}`);
    url.searchParams.set('api_key', apiKey);
    const clientKey = String(this.getFanartClientKey() || '').trim();
    if (clientKey) url.searchParams.set('client_key', clientKey);
    try {
      const response = await this.fetchImpl(url, {
        headers: { 'User-Agent': 'MusicHome/1.0 (https://github.com/wwm100107-creator/music-home)' },
        signal: AbortSignal.timeout(8000)
      });
      if (response.status === 429) return null;
      return response.ok ? response.json() : null;
    } catch {
      return null;
    }
  }

  async getFanartArtistThumbnail(artistId) {
    const data = await this.getFanartJson(`/music/${encodeURIComponent(artistId)}`);
    return asBigPreview(bestImage(data?.artistthumb || []));
  }

  async getFanartAlbumCover(releaseGroupId) {
    const releaseData = await this.getFanartJson(`/music/albums/${encodeURIComponent(releaseGroupId)}`);
    const releaseAlbums = Array.isArray(releaseData?.albums)
      ? releaseData.albums
      : (releaseData?.albums && typeof releaseData.albums === 'object' ? Object.values(releaseData.albums) : []);
    const exactAlbum = releaseAlbums.find(album =>
      !album?.release_group_id || String(album.release_group_id) === releaseGroupId
    );
    const covers = exactAlbum?.albumcover || releaseAlbums.flatMap(album => album?.albumcover || []);
    return asBigPreview(bestImage(covers));
  }
}
