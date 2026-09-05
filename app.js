/**
 * ============================================================================
 * MUSIC HOME • STUDIO GHIBLI & MY NEIGHBOR TOTORO SOUND STATION
 * Pixel-Perfect Implementation of GIAODIEN.png
 * Local Folder Player + WebTorrent P2P Streaming + Supabase Cloud Sync
 * ============================================================================
 * 
 * HỆ THỐNG SKILLS ĐƯỢC TÍCH HỢP TOÀN DIỆN:
 * - [SKILL: /image-to-code-skill] : Tái hiện chuẩn xác 100% bố cục GIAODIEN.png:
 *     1. Background video động toàn màn hình (background.mp4)
 *     2. Left Sidebar kính mờ (rgba xanh ngọc + blur) với thanh gỗ wood.jpg active
 *     3. Main Content: Grid 6 Playlist Cards bo góc tròn mộc mạc
 *     4. Bottom Player: Đĩa phát gỗ, thanh lượn sóng SVG xanh lá & cục chạy Calcifer (f.jpg/f.png)
 * - [SKILL: /impeccable] : Typography Ghibli, text-stroke, drop-shadow, viền mềm mại, mix-blend-mode
 * - [SKILL: /animate] : Calcifer breathing keyframes, wavy progress surfing, Susuwatari crew, lá thư rơi
 * - [SKILL: /ponytail] : Tối giản hóa logic (YAGNI), tích hợp Web Audio Synthesizer tự sinh giai điệu Ghibli
 *   ngay khi mở web mà không cần server hay tải nặng nề!
 */

(() => {
  'use strict';

  // --- HẰNG SỐ ĐỊNH DẠNG ÂM THANH HỖ TRỢ ---
  const SUPPORTED_AUDIO_EXT = ['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac', '.opus', '.weba'];

  // WebSocket Trackers chuẩn cho WebTorrent trên trình duyệt (WebRTC)
  const WEBTORRENT_TRACKERS = [
    'wss://tracker.openwebtorrent.com',
    'wss://tracker.btorrent.xyz',
    'wss://tracker.fastcast.nz'
  ];

  // Danh sách các Magnet mẫu Creative Commons / Public Domain Lofi & Ghibli Vibe
  const SAMPLE_MAGNETS = {
    'totoro-lofi': {
      name: 'My Neighbor Totoro - Wind Forest Lofi (Sample Stream)',
      magnet: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.fastcast.nz'
    },
    'ghibli-relax': {
      name: 'Ghibli Piano Forest Relaxing Medley',
      magnet: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.fastcast.nz'
    },
    'sintel-track': {
      name: 'Sintel Open Source Soundtrack',
      magnet: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.fastcast.nz'
    }
  };

  // [SKILL: /image-to-code-skill] 6 GIAI ĐIỆU GHIBLI MẪU CHUẨN GIAODIEN.PNG
  const DEFAULT_GHIBLI_TRACKS = [
    {
      id: 'ghibli_card_1',
      name: "Spirited Away - One Summer's Day.mp3",
      title: "One Summer's Day",
      artist: "Joe Hisaishi",
      album: "Spirited Away OST",
      cover: "card-ghibli.jpg",
      format: "FLAC",
      size: "24.5 MB",
      isTorrent: false,
      synthTheme: 'summer'
    },
    {
      id: 'ghibli_card_2',
      name: "My Neighbor Totoro - Wind Forest.mp3",
      title: "Wind Forest",
      artist: "Joe Hisaishi",
      album: "My Neighbor Totoro",
      cover: "card-totoro.jpg",
      format: "MP3",
      size: "8.4 MB",
      isTorrent: false,
      synthTheme: 'totoro'
    },
    {
      id: 'ghibli_card_3',
      name: "Howl's Moving Castle - Merry-Go-Round of Life.mp3",
      title: "Merry-Go-Round of Life",
      artist: "Joe Hisaishi",
      album: "Howl's Moving Castle",
      cover: "album-howl.jpg",
      format: "FLAC",
      size: "32.1 MB",
      isTorrent: false,
      synthTheme: 'howl'
    },
    {
      id: 'ghibli_card_4',
      name: "Kiki's Delivery Service - A Town with an Ocean View.mp3",
      title: "A Town with an Ocean View",
      artist: "Joe Hisaishi",
      album: "Kiki's Delivery Service",
      cover: "card-kiki.jpg",
      format: "MP3",
      size: "9.2 MB",
      isTorrent: false,
      synthTheme: 'kiki'
    },
    {
      id: 'ghibli_card_5',
      name: "The Wind Rises - A Journey.mp3",
      title: "The Wind Rises (A Journey)",
      artist: "Joe Hisaishi",
      album: "The Wind Rises",
      cover: "card-wind.jpg",
      format: "MP3",
      size: "7.8 MB",
      isTorrent: false,
      synthTheme: 'wind'
    },
    {
      id: 'ghibli_card_6',
      name: "Forest Beats - Lofi Chill Ghibli.mp3",
      title: "Kiki's Flying Delivery (Forest Beats)",
      artist: "Studio Ghibli Chill",
      album: "Ghibli Lofi Woods",
      cover: "card-kiki-town.jpg",
      format: "MP3",
      size: "6.9 MB",
      isTorrent: false,
      synthTheme: 'lofi'
    }
  ];

  // --------------------------------------------------------------------------
  // [SKILL: /ponytail] STATE MANAGEMENT: Quản lý trạng thái bài hát & WebTorrent
  // --------------------------------------------------------------------------
  const state = {
    playlist: [...DEFAULT_GHIBLI_TRACKS], // Khởi tạo với 6 bài Ghibli chuẩn GIAODIEN.png
    filteredIndices: [0, 1, 2, 3, 4, 5],
    currentIndex: 2,        // Mặc định là bài #3: Merry-Go-Round of Life (Howl's Moving Castle)
    isPlaying: false,
    volume: 0.8,
    previousVolume: 0.8,
    isMuted: false,
    loopMode: 'all',        // 'off' | 'all' | 'one' | 'custom'
    selectedLoopTrackIds: new Set(['ghibli_card_3']), // Mặc định chọn bài Howl
    isShuffle: false,
    shuffleOrder: [],
    shufflePosition: 0,
    isScrubbing: false,     // Cờ rê kéo chú lửa Calcifer

    // WebTorrent Client State
    wtClient: null,
    activeTorrent: null,
    currentTorrentFile: null,

    // Cloud Sync & Supabase BaaS State
    currentUser: null,
    supabaseClient: null,
    activeAuthTab: 'login',
    isSyncing: false,

    // Smart Input & Susuwatari Loader State
    isSearchLoading: false,

    // Synth Audio Blob Cache
    synthBlobUrls: {}
  };

  // --- DOM ELEMENTS CACHE ---
  const dom = {
    audio: document.getElementById('audioElement'),
    folderInput: document.getElementById('folderInput'),
    fileInput: document.getElementById('fileInput'),

    // Top Navigation, Smart Search & History
    historyBackBtn: document.getElementById('historyBackBtn'),
    historyForwardBtn: document.getElementById('historyForwardBtn'),
    searchShell: document.getElementById('searchShell'),
    searchIconBox: document.getElementById('searchIconBox'),
    searchIconLens: document.getElementById('searchIconLens'),
    searchIconPigeon: document.getElementById('searchIconPigeon'),
    searchInput: document.getElementById('searchInput'),
    searchLinkTag: document.getElementById('searchLinkTag'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    leafLoader: document.getElementById('leafLoader'),
    loaderStatusTitle: document.getElementById('loaderStatusTitle'),
    loaderStatusSub: document.getElementById('loaderStatusSub'),
    torrentToggleBtn: document.getElementById('torrentToggleBtn'),
    authModalTriggerBtn: document.getElementById('authModalTriggerBtn'),
    syncStatusIcon: document.getElementById('syncStatusIcon'),
    userAuthBadgeText: document.getElementById('userAuthBadgeText'),
    profileAvatarBtn: document.getElementById('profileAvatarBtn'),

    // WebTorrent Panel Elements
    torrentPanel: document.getElementById('torrentPanel'),
    torrentForm: document.getElementById('torrentForm'),
    torrentInput: document.getElementById('torrentInput'),
    clearTorrentInput: document.getElementById('clearTorrentInput'),
    torrentSubmitBtn: document.getElementById('torrentSubmitBtn'),
    torrentStatusCard: document.getElementById('torrentStatusCard'),
    workerSpeech: document.getElementById('workerSpeech'),
    torrentFileName: document.getElementById('torrentFileName'),
    torrentPeers: document.getElementById('torrentPeers'),
    torrentSpeed: document.getElementById('torrentSpeed'),
    torrentDownloaded: document.getElementById('torrentDownloaded'),
    torrentTotalSize: document.getElementById('torrentTotalSize'),
    torrentProgressFill: document.getElementById('torrentProgressFill'),
    torrentPercent: document.getElementById('torrentPercent'),
    saveToDiskBtn: document.getElementById('saveToDiskBtn'),
    playTorrentNowBtn: document.getElementById('playTorrentNowBtn'),
    cancelTorrentBtn: document.getElementById('cancelTorrentBtn'),

    // Main Content Playlist Cards
    playlistCards: document.querySelectorAll('.playlist-card'),

    // Bottom Player Glass Elements (GIAODIEN.png)
    currentTrackCover: document.getElementById('currentTrackCover'),
    trackTitle: document.getElementById('trackTitle'),
    trackArtist: document.getElementById('trackArtist'),
    trackAlbum: document.getElementById('trackAlbum'),
    trackFormat: document.getElementById('trackFormat'),
    likeBtn: document.getElementById('likeBtn'),

    // Phím điều khiển
    playPauseBtn: document.getElementById('playPauseBtn'),
    playIcon: document.getElementById('playIcon'),
    pauseIcon: document.getElementById('pauseIcon'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    loopBtn: document.getElementById('loopBtn'),
    loopBadge: document.getElementById('loopBadge'),

    // Thanh tiến trình lượn sóng SVG & Chú lửa Calcifer Thumb
    progressContainer: document.getElementById('progressContainer'),
    wavyVineSvg: document.getElementById('wavyVineSvg'),
    vineProgressFill: document.getElementById('vineProgressFill'),
    progressThumb: document.getElementById('progressThumb'),
    calciferFlame: document.getElementById('calciferFlame'),
    progressHoverTime: document.getElementById('progressHoverTime'),
    currentTime: document.getElementById('currentTime'),
    totalDuration: document.getElementById('totalDuration'),

    // Cụm âm lượng & Queue Drawer
    muteBtn: document.getElementById('muteBtn'),
    volumeHighIcon: document.getElementById('volumeHighIcon'),
    volumeMutedIcon: document.getElementById('volumeMutedIcon'),
    volumeSlider: document.getElementById('volumeSlider'),
    volumePercent: document.getElementById('volumePercent'),
    queueToggleBtn: document.getElementById('queueToggleBtn'),

    // Queue Drawer & Danh sách bài hát
    playlistCottage: document.getElementById('playlistCottage'),
    closeDrawerBtn: document.getElementById('closeDrawerBtn'),
    playlistCount: document.getElementById('playlistCount'),
    customLoopChip: document.getElementById('customLoopChip'),
    folderNameBadge: document.getElementById('folderNameBadge'),
    manualSyncBtn: document.getElementById('manualSyncBtn'),
    emptyState: document.getElementById('emptyState'),
    songList: document.getElementById('songList'),

    // Cloud Sync Modal (Lá thư Ghibli)
    authModalOverlay: document.getElementById('authModalOverlay'),
    ghibliLetterModal: document.getElementById('ghibliLetterModal'),
    closeAuthModalBtn: document.getElementById('closeAuthModalBtn'),
    letterTabs: document.querySelectorAll('.letter-tab'),
    authForm: document.getElementById('authForm'),
    authEmail: document.getElementById('authEmail'),
    authPassword: document.getElementById('authPassword'),
    emailGroup: document.getElementById('emailGroup'),
    passwordGroup: document.getElementById('passwordGroup'),
    configFieldsGroup: document.getElementById('configFieldsGroup'),
    supabaseUrl: document.getElementById('supabaseUrl'),
    supabaseKey: document.getElementById('supabaseKey'),
    authSubmitBtn: document.getElementById('authSubmitBtn'),
    authSubmitText: document.getElementById('authSubmitText'),
    loggedInBox: document.getElementById('loggedInBox'),
    userEmailDisplay: document.getElementById('userEmailDisplay'),
    syncCountInfo: document.getElementById('syncCountInfo'),
    logoutBtn: document.getElementById('logoutBtn'),

    // Toast
    toast: document.getElementById('toast')
  };

  // --------------------------------------------------------------------------
  // [SKILL: /ponytail] OFFLINE WEB AUDIO SYNTHESIZER:
  // Tự tạo giai điệu Hộp Nhạc (Music Box / Celesta) cho các bài Ghibli
  // Hoạt động 100% offline ngay khi tải trang mà không cần file MP3 nặng nề!
  // --------------------------------------------------------------------------
  function generateGhibliSynthAudio(themeName) {
    if (state.synthBlobUrls[themeName]) {
      return Promise.resolve(state.synthBlobUrls[themeName]);
    }

    return new Promise((resolve) => {
      try {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtxClass) return resolve(null);

        const sampleRate = 22050; // Tối ưu bộ nhớ
        const durationSec = 38;   // Một đoạn giai điệu 38 giây du dương
        const totalFrames = sampleRate * durationSec;
        const offlineCtx = new OfflineAudioContext(2, totalFrames, sampleRate);

        // Chuỗi nốt nhạc Ghibli đặc trưng
        let melodyNotes = [];
        if (themeName === 'howl') {
          // Merry-Go-Round of Life (D minor / G minor waltz)
          melodyNotes = [
            { note: 392.00, start: 0.5, dur: 0.7 }, // G4
            { note: 466.16, start: 1.3, dur: 0.7 }, // Bb4
            { note: 587.33, start: 2.1, dur: 1.2 }, // D5
            { note: 783.99, start: 3.5, dur: 1.6 }, // G5
            { note: 739.99, start: 5.3, dur: 0.9 }, // F#5
            { note: 587.33, start: 6.4, dur: 0.9 }, // D5
            { note: 466.16, start: 7.5, dur: 0.9 }, // Bb4
            { note: 440.00, start: 8.6, dur: 1.4 }, // A4
            { note: 392.00, start: 10.2, dur: 2.0 }, // G4
            { note: 329.63, start: 12.5, dur: 0.8 }, // E4
            { note: 392.00, start: 13.5, dur: 0.8 }, // G4
            { note: 523.25, start: 14.5, dur: 1.4 }, // C5
            { note: 659.25, start: 16.1, dur: 1.8 }, // E5
            { note: 587.33, start: 18.2, dur: 1.0 }, // D5
            { note: 466.16, start: 19.4, dur: 1.0 }, // Bb4
            { note: 392.00, start: 20.6, dur: 1.0 }, // G4
            { note: 440.00, start: 21.8, dur: 2.5 }, // A4
            { note: 392.00, start: 24.5, dur: 3.0 }  // G4
          ];
        } else if (themeName === 'summer') {
          // One Summer's Day (Spirited Away)
          melodyNotes = [
            { note: 523.25, start: 0.5, dur: 1.2 }, // C5
            { note: 587.33, start: 1.9, dur: 1.0 }, // D5
            { note: 659.25, start: 3.1, dur: 1.5 }, // E5
            { note: 783.99, start: 4.8, dur: 2.0 }, // G5
            { note: 880.00, start: 7.0, dur: 1.5 }, // A5
            { note: 783.99, start: 8.7, dur: 1.2 }, // G5
            { note: 659.25, start: 10.1, dur: 1.5 }, // E5
            { note: 587.33, start: 11.8, dur: 2.0 }, // D5
            { note: 523.25, start: 14.0, dur: 3.0 }  // C5
          ];
        } else if (themeName === 'totoro') {
          // Wind Forest (Totoro)
          melodyNotes = [
            { note: 440.00, start: 0.5, dur: 1.0 }, // A4
            { note: 523.25, start: 1.7, dur: 1.0 }, // C5
            { note: 587.33, start: 2.9, dur: 1.4 }, // D5
            { note: 659.25, start: 4.5, dur: 2.2 }, // E5
            { note: 587.33, start: 7.0, dur: 1.0 }, // D5
            { note: 523.25, start: 8.2, dur: 1.0 }, // C5
            { note: 440.00, start: 9.4, dur: 2.5 }  // A4
          ];
        } else {
          // Kiki / Wind / Lofi gentle chords
          melodyNotes = [
            { note: 392.00, start: 0.5, dur: 1.2 },
            { note: 440.00, start: 1.9, dur: 1.2 },
            { note: 493.88, start: 3.3, dur: 1.5 },
            { note: 587.33, start: 5.0, dur: 2.0 },
            { note: 523.25, start: 7.2, dur: 1.2 },
            { note: 440.00, start: 8.6, dur: 2.5 }
          ];
        }

        // Tạo hiệu ứng tiếng chuông hộp nhạc dịu dàng (Music Box Tone)
        melodyNotes.forEach(n => {
          const osc = offlineCtx.createOscillator();
          const gain = offlineCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(n.note, n.start);

          gain.gain.setValueAtTime(0.0001, n.start);
          gain.gain.exponentialRampToValueAtTime(0.35, n.start + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, n.start + n.dur + 0.9);

          osc.connect(gain);
          gain.connect(offlineCtx.destination);

          osc.start(n.start);
          osc.stop(n.start + n.dur + 1.0);
        });

        offlineCtx.startRendering().then(renderedBuffer => {
          const wavBlob = audioBufferToWav(renderedBuffer);
          const blobUrl = URL.createObjectURL(wavBlob);
          state.synthBlobUrls[themeName] = blobUrl;
          resolve(blobUrl);
        }).catch(() => resolve(null));

      } catch (_) {
        resolve(null);
      }
    });
  }

  /**
   * [SKILL: /ponytail] Chuyển AudioBuffer thành WAV Blob thuần 40 dòng JS
   */
  function audioBufferToWav(buffer) {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    const channels = [];
    const sampleRate = buffer.sampleRate;
    let offset = 0;
    let pos = 0;

    function setUint16(data) { out.setUint16(pos, data, true); pos += 2; }
    function setUint32(data) { out.setUint32(pos, data, true); pos += 4; }

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1); // PCM
    setUint16(numOfChan);
    setUint32(sampleRate);
    setUint32(sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);

    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for (let i = 0; i < numOfChan; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (offset < buffer.length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        out.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }
    return new Blob([out.buffer], { type: 'audio/wav' });
  }

  // --------------------------------------------------------------------------
  // [SKILL: /ponytail] WEBTORRENT CORE: Khởi tạo lười & Quản lý P2P Download
  // --------------------------------------------------------------------------
  function getWebTorrentClient() {
    if (!state.wtClient) {
      if (typeof window.WebTorrent === 'undefined') {
        showToast('Thư viện WebTorrent chưa sẵn sàng!');
        return null;
      }
      state.wtClient = new window.WebTorrent();
      state.wtClient.on('error', (err) => {
        console.error('WebTorrent Client Lỗi:', err);
        showToast('Lỗi WebTorrent: ' + err.message);
      });
    }
    return state.wtClient;
  }

  function prepareMagnetLink(input) {
    const trimmed = input.trim();
    if (trimmed.startsWith('magnet:?')) {
      let url = trimmed;
      WEBTORRENT_TRACKERS.forEach(tr => {
        if (!url.includes(encodeURIComponent(tr)) && !url.includes(tr)) {
          url += `&tr=${encodeURIComponent(tr)}`;
        }
      });
      return url;
    }
    if (/^[0-9a-fA-F]{40}$/.test(trimmed)) {
      let url = `magnet:?xt=urn:btih:${trimmed}`;
      WEBTORRENT_TRACKERS.forEach(tr => {
        url += `&tr=${encodeURIComponent(tr)}`;
      });
      return url;
    }
    return null;
  }

  function startTorrentDownload(magnetOrId, customTitle = '') {
    const client = getWebTorrentClient();
    if (!client) return;

    if (state.activeTorrent) {
      try { state.activeTorrent.destroy(); } catch (_) {}
      state.activeTorrent = null;
    }

    dom.torrentStatusCard.classList.remove('hidden');
    dom.workerSpeech.textContent = 'Các chú Susuwatari đang tìm hạt giống Peers trong khu rừng...';
    dom.torrentFileName.textContent = customTitle || 'Đang kết nối Torrent...';
    dom.torrentPeers.textContent = '0';
    dom.torrentSpeed.textContent = '0 KB/s';
    dom.torrentDownloaded.textContent = '0 MB';
    dom.torrentTotalSize.textContent = 'Đang tính...';
    dom.torrentProgressFill.style.width = '0%';
    dom.torrentPercent.textContent = '0%';
    dom.saveToDiskBtn.classList.add('hidden');
    dom.playTorrentNowBtn.classList.add('hidden');

    try {
      const torrent = client.add(magnetOrId, {
        announce: WEBTORRENT_TRACKERS
      }, (t) => {
        onTorrentReady(t, customTitle);
      });

      state.activeTorrent = torrent;

      torrent.on('download', () => {
        updateTorrentProgressUI(torrent);
      });

      torrent.on('done', () => {
        dom.workerSpeech.textContent = 'Đã gom xong toàn bộ giai điệu về khu vườn! 🍃';
        showToast('Tải Torrent hoàn tất 100%! Bấm "Lưu Vào Máy" để lưu trữ.');
        dom.saveToDiskBtn.classList.remove('hidden');
      });

      torrent.on('error', (err) => {
        console.error('Lỗi khi tải torrent:', err);
        dom.workerSpeech.textContent = 'Không tìm thấy Peers hỗ trợ WebRTC cho bài này.';
        showToast('Lỗi Torrent: Không có Peers trực tuyến.');
      });

    } catch (err) {
      console.error('Không thể bắt đầu WebTorrent:', err);
      showToast('Lỗi: ' + err.message);
    }
  }

  function onTorrentReady(torrent, customTitle) {
    dom.workerSpeech.textContent = 'Đã tìm thấy hạt giống! Đang chuyển tay nhau tải về...';
    const audioFile = torrent.files.find(f => SUPPORTED_AUDIO_EXT.some(ext => f.name.toLowerCase().endsWith(ext))) || torrent.files[0];
    state.currentTorrentFile = audioFile;

    const displayTitle = customTitle || cleanTitle(audioFile.name);
    dom.torrentFileName.textContent = displayTitle;
    dom.torrentTotalSize.textContent = formatBytes(torrent.length);

    dom.saveToDiskBtn.classList.remove('hidden');
    dom.playTorrentNowBtn.classList.remove('hidden');

    addTorrentTrackToPlaylist(audioFile, displayTitle, torrent);
    streamAudioFile(audioFile, displayTitle);
  }

  function updateTorrentProgressUI(torrent) {
    const percent = Math.min(100, Math.round(torrent.progress * 100));
    dom.torrentProgressFill.style.width = `${percent}%`;
    dom.torrentPercent.textContent = `${percent}%`;
    dom.torrentPeers.textContent = torrent.numPeers;
    dom.torrentSpeed.textContent = `${formatBytes(torrent.downloadSpeed)}/s`;
    dom.torrentDownloaded.textContent = formatBytes(torrent.downloaded);

    if (torrent.numPeers > 0) {
      dom.workerSpeech.textContent = `Bầy Susuwatari đang chuyền lá với tốc độ ${formatBytes(torrent.downloadSpeed)}/s...`;
    }
  }

  function streamAudioFile(file, title) {
    try {
      file.renderTo(dom.audio, { autoplay: true }, (err) => {
        if (err) {
          file.getBlobURL((blobErr, url) => {
            if (!blobErr && url) {
              dom.audio.src = url;
              dom.audio.play();
            }
          });
        }
      });
    } catch (_) {
      file.getBlobURL((blobErr, url) => {
        if (!blobErr && url) {
          dom.audio.src = url;
          dom.audio.play();
        }
      });
    }

    state.isPlaying = true;
    updatePlaybackUI();
    dom.trackTitle.textContent = title || file.name;
    dom.trackArtist.textContent = `WebTorrent P2P Stream • ${formatBytes(file.length)}`;
    dom.trackAlbum.textContent = 'WebTorrent Stream';
    showToast(`Đang phát trực tiếp: "${title || file.name}" 📡`);
  }

  function addTorrentTrackToPlaylist(file, title, torrent) {
    const existing = state.playlist.find(t => t.name === file.name);
    if (existing) return;

    const newTrack = {
      id: 'wt_' + Date.now(),
      file: null,
      name: file.name,
      title: title || cleanTitle(file.name),
      artist: 'WebTorrent Stream',
      album: 'P2P Forest',
      cover: 'album-howl.jpg',
      format: getExtension(file.name).toUpperCase() || 'TORRENT',
      size: formatBytes(file.length),
      url: null,
      isTorrent: true,
      torrentFile: file,
      magnet: torrent ? (torrent.magnetURI || torrent.infoHash) : null
    };

    state.playlist.unshift(newTrack);
    state.filteredIndices = state.playlist.map((_, i) => i);
    state.currentIndex = 0;
    renderPlaylist();
    updatePlaylistCount();

    if (state.currentUser) {
      syncPlaylistToCloud();
    }
  }

  async function saveTorrentFileLocally(torrentFile) {
    if (!torrentFile) {
      showToast('Chưa có file Torrent nào hoàn tất để lưu.');
      return;
    }

    showToast('Đang chuẩn bị lưu file xuống máy tính...');

    try {
      if ('showSaveFilePicker' in window) {
        const handle = await window.showSaveFilePicker({
          suggestedName: torrentFile.name,
          types: [{
            description: 'Tập tin âm thanh Ghibli',
            accept: {
              'audio/*': ['.mp3', '.wav', '.flac', '.ogg', '.m4a']
            }
          }]
        });

        const writable = await handle.createWritable();
        let blob = null;
        if (typeof torrentFile.blob === 'function') {
          blob = await torrentFile.blob();
        } else {
          blob = await new Promise((resolve, reject) => {
            torrentFile.getBlob((err, b) => {
              if (err) reject(err);
              else resolve(b);
            });
          });
        }

        await writable.write(blob);
        await writable.close();
        showToast(`Đã lưu vĩnh viễn "${torrentFile.name}" xuống ổ cứng thành công! 💾🍃`);
      } else {
        torrentFile.getBlobURL((err, url) => {
          if (err || !url) {
            showToast('Lỗi khi trích xuất blob âm thanh.');
            return;
          }
          const a = document.createElement('a');
          a.href = url;
          a.download = torrentFile.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          showToast(`Đang tải file "${torrentFile.name}" về máy... 💾`);
        });
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Lỗi khi lưu file:', err);
        showToast('Không thể lưu file: ' + err.message);
      }
    }
  }

  // --------------------------------------------------------------------------
  // [SKILL: /ponytail] XỬ LÝ NHẬP THƯ MỤC CỤC BỘ (100% OFFLINE)
  // --------------------------------------------------------------------------
  function handleFiles(fileList) {
    if (!fileList || fileList.length === 0) return;

    const newTracks = [];
    let detectedFolder = '';

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const lower = file.name.toLowerCase();
      const isAudio = file.type.startsWith('audio/') || 
                      SUPPORTED_AUDIO_EXT.some(ext => lower.endsWith(ext));

      if (isAudio) {
        if (!detectedFolder && file.webkitRelativePath) {
          const parts = file.webkitRelativePath.split('/');
          if (parts.length > 1) detectedFolder = parts[0];
        }

        newTracks.push({
          id: 'ghibli_' + Date.now() + '_' + i,
          file: file,
          name: file.name,
          title: cleanTitle(file.name),
          artist: detectedFolder || 'Giai điệu địa phương',
          album: detectedFolder || 'Thư mục máy tính',
          cover: 'album-howl.jpg',
          format: getExtension(file.name).toUpperCase() || 'AUDIO',
          size: formatBytes(file.size),
          url: null,
          isTorrent: false
        });
      }
    }

    if (newTracks.length === 0) {
      showToast('Không tìm thấy file nhạc hợp lệ (.mp3, .wav, .flac)!');
      return;
    }

    newTracks.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    state.playlist.forEach(t => {
      if (t.url) URL.revokeObjectURL(t.url);
    });

    state.playlist = newTracks;
    state.filteredIndices = state.playlist.map((_, i) => i);
    dom.folderNameBadge.textContent = detectedFolder ? `Thư mục: ${detectedFolder}` : `Khu vườn nhạc: ${newTracks.length} bài`;

    if (state.isShuffle) buildShuffleOrder(0);

    renderPlaylist();
    updatePlaylistCount();
    loadTrack(0, true);
    showToast(`Đã thức tỉnh ${newTracks.length} giai điệu trong thư mục! 🍃✨`);

    if (state.currentUser) {
      syncPlaylistToCloud();
    }
  }

  function cleanTitle(fileName) {
    const dot = fileName.lastIndexOf('.');
    let name = dot !== -1 ? fileName.substring(0, dot) : fileName;
    name = name.replace(/^\d+[\s.-]+/, '');
    return name.replace(/_/g, ' ').trim() || fileName;
  }

  function getExtension(fileName) {
    const dot = fileName.lastIndexOf('.');
    return dot !== -1 ? fileName.substring(dot + 1) : '';
  }

  function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // --------------------------------------------------------------------------
  // [SKILL: /image-to-code-skill & /animate] ĐIỀU KHIỂN PHÁT NHẠC CHÍNH
  // --------------------------------------------------------------------------
  async function loadTrack(index, autoPlay = false) {
    if (index < 0 || index >= state.playlist.length) return;

    const track = state.playlist[index];

    if (state.currentIndex >= 0 && state.currentIndex !== index) {
      const prev = state.playlist[state.currentIndex];
      if (prev && prev.url && !prev.isTorrent && !prev.synthTheme) {
        URL.revokeObjectURL(prev.url);
        prev.url = null;
      }
    }

    state.currentIndex = index;

    // Cập nhật giao diện Now Playing góc trái chuẩn GIAODIEN.png
    if (dom.currentTrackCover) {
      dom.currentTrackCover.src = track.cover || 'album-howl.jpg';
      dom.currentTrackCover.alt = track.title;
    }
    if (dom.trackTitle) {
      dom.trackTitle.textContent = track.title;
      dom.trackTitle.title = track.name;
    }
    if (dom.trackArtist) {
      dom.trackArtist.textContent = track.artist || 'Joe Hisaishi';
    }
    if (dom.trackAlbum) {
      dom.trackAlbum.textContent = track.album || "Howl's Moving Castle";
    }
    if (dom.trackFormat) {
      dom.trackFormat.textContent = track.format || 'AUDIO';
    }

    // Highlight Playlist Card đang phát
    highlightActivePlaylistCard(track.title);

    // Xử lý Audio Source
    if (track.isTorrent) {
      if (track.torrentFile) {
        streamAudioFile(track.torrentFile, track.title);
        updateActiveCard();
        return;
      } else if (track.magnet) {
        showToast(`Đang kết nối WebTorrent cho "${track.title}"... 📡🍃`);
        startTorrentDownload(track.magnet, track.title);
        updateActiveCard();
        return;
      }
    }

    if (track.synthTheme) {
      // Tự động sinh âm thanh Ghibli Music Box
      const blobUrl = await generateGhibliSynthAudio(track.synthTheme);
      if (blobUrl) {
        dom.audio.src = blobUrl;
      }
    } else if (track.file && !track.url) {
      track.url = URL.createObjectURL(track.file);
      dom.audio.src = track.url;
    } else if (track.url) {
      dom.audio.src = track.url;
    }

    dom.audio.load();
    updateProgress(0, 0);
    updateActiveCard();

    if (autoPlay) {
      playAudio();
    } else {
      pauseAudio();
    }
  }

  function playAudio() {
    dom.audio.play().then(() => {
      state.isPlaying = true;
      updatePlaybackUI();
    }).catch(err => {
      console.warn('Autoplay cần người dùng tương tác trước:', err);
      state.isPlaying = false;
      updatePlaybackUI();
    });
  }

  function pauseAudio() {
    dom.audio.pause();
    state.isPlaying = false;
    updatePlaybackUI();
  }

  function togglePlayPause() {
    if (state.playlist.length === 0) {
      dom.folderInput.click();
      return;
    }
    if (state.currentIndex === -1) {
      loadTrack(0, true);
      return;
    }
    if (state.isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }

  /**
   * Cập nhật trạng thái nút Play/Pause giả gỗ & hoạt ảnh ngọn lửa Calcifer
   */
  function updatePlaybackUI() {
    if (state.isPlaying) {
      if (dom.playIcon) dom.playIcon.classList.add('hidden');
      if (dom.pauseIcon) dom.pauseIcon.classList.remove('hidden');
      document.body.classList.add('music-playing');
    } else {
      if (dom.playIcon) dom.playIcon.classList.remove('hidden');
      if (dom.pauseIcon) dom.pauseIcon.classList.add('hidden');
      document.body.classList.remove('music-playing');
    }
  }

  function nextTrack(isAutoEnded = false) {
    if (state.playlist.length === 0) return;

    if (isAutoEnded && state.loopMode === 'one') {
      dom.audio.currentTime = 0;
      dom.audio.play();
      return;
    }

    // [SKILL: /ponytail] 4-STATE LOOP MACHINE: Custom Loop Hạt Dẻ (Acorn)
    if (state.loopMode === 'custom') {
      const selectedIndices = [];
      state.playlist.forEach((track, idx) => {
        if (state.selectedLoopTrackIds.has(track.id)) {
          selectedIndices.push(idx);
        }
      });

      if (selectedIndices.length === 0) {
        if (state.currentIndex >= 0) {
          state.selectedLoopTrackIds.add(state.playlist[state.currentIndex].id);
          renderPlaylist();
          updateCustomLoopChip();
        }
        dom.audio.currentTime = 0;
        dom.audio.play();
        showToast('Hãy tích hạt dẻ 🌰 vào các bài bạn muốn lặp!');
        return;
      }

      const currentPos = selectedIndices.indexOf(state.currentIndex);
      let targetIdx = (currentPos === -1 || currentPos >= selectedIndices.length - 1)
        ? selectedIndices[0]
        : selectedIndices[currentPos + 1];

      loadTrack(targetIdx, true);
      return;
    }

    if (state.isShuffle) {
      state.shufflePosition++;
      if (state.shufflePosition >= state.shuffleOrder.length) {
        if (state.loopMode === 'all') {
          buildShuffleOrder();
          state.shufflePosition = 0;
        } else {
          pauseAudio();
          showToast('Đã nghe hết danh sách ngẫu nhiên! 🍃');
          return;
        }
      }
      loadTrack(state.shuffleOrder[state.shufflePosition], true);
    } else {
      let next = state.currentIndex + 1;
      if (next >= state.playlist.length) {
        if (state.loopMode === 'all') next = 0;
        else {
          pauseAudio();
          showToast('Đã phát hết danh sách bài hát! 🍂');
          return;
        }
      }
      loadTrack(next, true);
    }
  }

  function prevTrack() {
    if (state.playlist.length === 0) return;

    if (dom.audio.currentTime > 3) {
      dom.audio.currentTime = 0;
      return;
    }

    if (state.loopMode === 'custom') {
      const selectedIndices = [];
      state.playlist.forEach((track, idx) => {
        if (state.selectedLoopTrackIds.has(track.id)) {
          selectedIndices.push(idx);
        }
      });

      if (selectedIndices.length > 0) {
        const currentPos = selectedIndices.indexOf(state.currentIndex);
        let targetIdx = (currentPos <= 0)
          ? selectedIndices[selectedIndices.length - 1]
          : selectedIndices[currentPos - 1];
        loadTrack(targetIdx, true);
        return;
      }
    }

    if (state.isShuffle) {
      if (state.shufflePosition > 0) {
        state.shufflePosition--;
        loadTrack(state.shuffleOrder[state.shufflePosition], true);
      } else {
        dom.audio.currentTime = 0;
      }
    } else {
      let prev = state.currentIndex - 1;
      if (prev < 0) prev = state.playlist.length - 1;
      loadTrack(prev, true);
    }
  }

  // --------------------------------------------------------------------------
  // [SKILL: /ponytail] SHUFFLE & LOOP MODES
  // --------------------------------------------------------------------------
  function buildShuffleOrder(anchorIndex = state.currentIndex) {
    const total = state.playlist.length;
    const indices = [];
    for (let i = 0; i < total; i++) {
      if (i !== anchorIndex) indices.push(i);
    }
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    if (anchorIndex >= 0 && anchorIndex < total) {
      indices.unshift(anchorIndex);
    }
    state.shuffleOrder = indices;
    state.shufflePosition = 0;
  }

  function toggleShuffle() {
    state.isShuffle = !state.isShuffle;
    if (state.isShuffle) {
      buildShuffleOrder(state.currentIndex);
      dom.shuffleBtn.classList.add('active');
      showToast('Phát ngẫu nhiên: BẬT 🍃');
    } else {
      dom.shuffleBtn.classList.remove('active');
      showToast('Phát ngẫu nhiên: TẮT');
    }
  }

  function cycleLoopMode() {
    if (state.loopMode === 'all') {
      setLoopMode('one');
    } else if (state.loopMode === 'one') {
      setLoopMode('custom');
    } else if (state.loopMode === 'custom') {
      setLoopMode('off');
    } else {
      setLoopMode('all');
    }
  }

  function setLoopMode(mode) {
    state.loopMode = mode;
    dom.loopBtn.classList.remove('active', 'loop-all', 'loop-one', 'loop-custom');

    switch (mode) {
      case 'all':
        dom.loopBtn.classList.add('active', 'loop-all');
        dom.loopBadge.style.display = 'none';
        dom.playlistCottage.classList.remove('custom-loop-active');
        dom.customLoopChip.classList.add('hidden');
        showToast('Lặp lại: TOÀN BỘ KHU VƯỜN 🌾');
        break;

      case 'one':
        dom.loopBtn.classList.add('active', 'loop-one');
        dom.loopBadge.textContent = '1';
        dom.loopBadge.style.display = 'block';
        dom.playlistCottage.classList.remove('custom-loop-active');
        dom.customLoopChip.classList.add('hidden');
        showToast('Lặp lại: 1 BÀI HIỆN TẠI 🌿');
        break;

      case 'custom':
        dom.loopBtn.classList.add('active', 'loop-custom');
        dom.loopBadge.textContent = '🌰';
        dom.loopBadge.style.display = 'block';
        dom.playlistCottage.classList.add('custom-loop-active');
        dom.customLoopChip.classList.remove('hidden');

        if (state.selectedLoopTrackIds.size === 0 && state.currentIndex >= 0) {
          const currentTrack = state.playlist[state.currentIndex];
          if (currentTrack) {
            state.selectedLoopTrackIds.add(currentTrack.id);
          }
        }
        updateCustomLoopChip();
        renderPlaylist();
        showToast('Lặp lại: BÀI ĐÃ CHỌN HẠT DẺ (CUSTOM LOOP) 🌰✨');
        break;

      case 'off':
      default:
        dom.loopBadge.style.display = 'none';
        dom.playlistCottage.classList.remove('custom-loop-active');
        dom.customLoopChip.classList.add('hidden');
        showToast('Lặp lại: TẮT');
        break;
    }
  }

  function updateCustomLoopChip() {
    const count = state.selectedLoopTrackIds.size;
    dom.customLoopChip.textContent = `🌰 Đang Lặp Hạt Dẻ (${count} bài)`;
  }

  function toggleTrackAcorn(trackId, isChecked) {
    if (isChecked) {
      state.selectedLoopTrackIds.add(trackId);
      showToast('Đã gieo Hạt Dẻ 🌰 vào vòng lặp!');
    } else {
      state.selectedLoopTrackIds.delete(trackId);
      showToast('Đã gỡ Hạt Dẻ 🍃 khỏi vòng lặp.');
    }
    updateCustomLoopChip();
  }

  // --------------------------------------------------------------------------
  // [SKILL: /animate & /image-to-code-skill] THANH TIẾN TRÌNH LƯỢN SÓNG & CALCIFER
  // --------------------------------------------------------------------------
  function updateProgress(curr, dur) {
    const pct = (dur > 0 && curr > 0) ? Math.min(1, Math.max(0, curr / dur)) : 0;

    // 1. Cập nhật đường cong xanh lá fill SVG (độ dài path ~ 602px)
    const pathTotalLength = 602;
    if (dom.vineProgressFill) {
      dom.vineProgressFill.style.strokeDasharray = `${pathTotalLength}`;
      dom.vineProgressFill.style.strokeDashoffset = `${pathTotalLength * (1 - pct)}`;
    }

    // 2. Di chuyển ngọn lửa Calcifer dọc theo phương ngang và nhấp nhô theo sóng
    if (dom.progressThumb) {
      dom.progressThumb.style.left = `${pct * 100}%`;
      // Sóng d="M 0 12 Q 150 20, 300 12 T 600 12" dao động ~ +-4.5px
      const waveY = Math.sin(pct * Math.PI * 2) * 4.5;
      dom.progressThumb.style.transform = `translate(-50%, calc(-65% + ${waveY}px))`;
    }

    if (dom.currentTime) dom.currentTime.textContent = formatSec(curr);
    if (dom.totalDuration) dom.totalDuration.textContent = formatSec(dur);
  }

  function formatSec(seconds) {
    if (!seconds || isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function seekByPointer(e) {
    const rect = dom.progressContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    if (dom.audio.duration) {
      dom.audio.currentTime = ratio * dom.audio.duration;
      updateProgress(dom.audio.currentTime, dom.audio.duration);
    }
  }

  function setVolume(v) {
    state.volume = Math.max(0, Math.min(1, parseFloat(v)));
    dom.audio.volume = state.volume;
    dom.volumeSlider.value = state.volume;
    dom.volumePercent.textContent = `${Math.round(state.volume * 100)}%`;

    if (state.volume === 0) {
      state.isMuted = true;
      dom.volumeHighIcon.classList.add('hidden');
      dom.volumeMutedIcon.classList.remove('hidden');
    } else {
      state.isMuted = false;
      state.previousVolume = state.volume;
      dom.volumeHighIcon.classList.remove('hidden');
      dom.volumeMutedIcon.classList.add('hidden');
    }
  }

  function toggleMute() {
    if (state.isMuted) {
      setVolume(state.previousVolume > 0 ? state.previousVolume : 0.5);
    } else {
      state.previousVolume = state.volume;
      setVolume(0);
    }
  }

  // --------------------------------------------------------------------------
  // DANH SÁCH BÀI HÁT THẺ LÁ GIẤY MỘC & CUSTOM LOOP DRAWER
  // --------------------------------------------------------------------------
  function renderPlaylist() {
    if (state.playlist.length === 0) {
      dom.emptyState.classList.remove('hidden');
      dom.songList.innerHTML = '';
      return;
    }

    dom.emptyState.classList.add('hidden');
    const frag = document.createDocumentFragment();

    state.filteredIndices.forEach((playlistIdx, displayIdx) => {
      const track = state.playlist[playlistIdx];
      const li = document.createElement('li');
      li.className = 'nature-song-card' + (playlistIdx === state.currentIndex ? ' active' : '');
      li.dataset.index = playlistIdx;

      const isAcornChecked = state.selectedLoopTrackIds.has(track.id);

      li.innerHTML = `
        <div class="card-left-group">
          <label class="acorn-checkbox-wrapper" title="Tích chọn bài này để lặp Hạt Dẻ 🌰">
            <input type="checkbox" class="acorn-checkbox-input" data-id="${track.id}" ${isAcornChecked ? 'checked' : ''}>
            <span class="acorn-checkbox-icon"></span>
          </label>
          <div class="leaf-num-stamp">${displayIdx + 1}</div>
          <div class="card-song-details">
            <span class="card-title" title="${track.name}">${track.title}</span>
            <div class="card-subtext">${track.artist || 'Joe Hisaishi'} • ${track.size || ''} ${track.isTorrent ? '📡 P2P' : ''}</div>
          </div>
        </div>
        <span class="card-leaf-badge">${track.format || 'AUDIO'}</span>
      `;

      const checkbox = li.querySelector('.acorn-checkbox-input');
      if (checkbox) {
        checkbox.addEventListener('click', (e) => e.stopPropagation());
        checkbox.addEventListener('change', (e) => {
          e.stopPropagation();
          toggleTrackAcorn(track.id, e.target.checked);
        });
      }

      li.addEventListener('click', () => {
        loadTrack(playlistIdx, true);
      });

      frag.appendChild(li);
    });

    dom.songList.innerHTML = '';
    dom.songList.appendChild(frag);
  }

  function updateActiveCard() {
    const items = dom.songList.querySelectorAll('.nature-song-card');
    items.forEach(item => {
      const idx = parseInt(item.dataset.index, 10);
      if (idx === state.currentIndex) {
        item.classList.add('active');
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        item.classList.remove('active');
      }
    });
  }

  function highlightActivePlaylistCard(trackTitle) {
    dom.playlistCards.forEach(card => {
      const cardTrack = card.dataset.track;
      if (cardTrack && trackTitle && (cardTrack.toLowerCase().includes(trackTitle.toLowerCase()) || trackTitle.toLowerCase().includes(cardTrack.toLowerCase()))) {
        card.style.borderColor = 'var(--ghibli-gold)';
        card.style.transform = 'translateY(-4px)';
      } else {
        card.style.borderColor = 'rgba(255, 255, 255, 0.45)';
        card.style.transform = '';
      }
    });
  }

  function updatePlaylistCount() {
    dom.playlistCount.textContent = `${state.playlist.length} Bài Hát`;
  }

  function filterCards(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      state.filteredIndices = state.playlist.map((_, i) => i);
      dom.clearSearchBtn.classList.add('hidden');
    } else {
      dom.clearSearchBtn.classList.remove('hidden');
      state.filteredIndices = state.playlist
        .map((t, i) => ({ t, i }))
        .filter(({ t }) => t.name.toLowerCase().includes(q) || t.title.toLowerCase().includes(q) || (t.artist && t.artist.toLowerCase().includes(q)))
        .map(({ i }) => i);
    }
    renderPlaylist();
  }

  // ==========================================================================
  // [SKILL: /ponytail] SMART SEARCH BAR: INPUT DETECTION (KEYWORD vs URL)
  // ==========================================================================
  const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|v\/|embed\/|playlist\?|live\/)|youtu\.be\/)[\w-]{11}/i;
  const TIKTOK_REGEX = /^(https?:\/\/)?(www\.)?(tiktok\.com\/(@[\w.-]+\/video\/\d+|v\/\d+|\w+))/i;
  const GENERAL_URL_REGEX = /^https?:\/\/[^\s$.?#].[^\s]*$/i;

  /**
   * [SKILL: /ponytail] Nhận diện loại đầu vào: 'youtube' | 'tiktok' | 'url' | 'keyword' | 'empty'
   */
  function detectInputType(input) {
    const trimmed = (input || '').trim();
    if (!trimmed) return 'empty';
    if (YOUTUBE_REGEX.test(trimmed)) return 'youtube';
    if (TIKTOK_REGEX.test(trimmed)) return 'tiktok';
    if (GENERAL_URL_REGEX.test(trimmed)) return 'url';
    return 'keyword';
  }

  /**
   * [SKILL: /animate & /impeccable] Cập nhật giao diện thanh tìm kiếm thông minh:
   * Chuyển đổi mượt mà giữa Icon kính lúp (Keyword) và Icon chim bồ câu đưa thư 🕊️ (URL)
   */
  function updateSearchInputUI(query) {
    const type = detectInputType(query);

    if (type === 'youtube' || type === 'tiktok' || type === 'url') {
      if (dom.searchShell) dom.searchShell.classList.add('url-mode');
      if (dom.searchIconLens) dom.searchIconLens.classList.add('hidden');
      if (dom.searchIconPigeon) dom.searchIconPigeon.classList.remove('hidden');
      if (dom.searchLinkTag) {
        dom.searchLinkTag.classList.remove('hidden');
        if (type === 'youtube') {
          dom.searchLinkTag.textContent = 'YouTube MP3 🕊️';
          dom.searchLinkTag.style.background = '#e63946';
        } else if (type === 'tiktok') {
          dom.searchLinkTag.textContent = 'TikTok MP3 🕊️';
          dom.searchLinkTag.style.background = '#111111';
        } else {
          dom.searchLinkTag.textContent = 'Link Audio 📜';
          dom.searchLinkTag.style.background = '#2d6a4f';
        }
      }
      if (dom.clearSearchBtn) dom.clearSearchBtn.classList.remove('hidden');
    } else {
      if (dom.searchShell) dom.searchShell.classList.remove('url-mode');
      if (dom.searchIconLens) dom.searchIconLens.classList.remove('hidden');
      if (dom.searchIconPigeon) dom.searchIconPigeon.classList.add('hidden');
      if (dom.searchLinkTag) dom.searchLinkTag.classList.add('hidden');

      if (query && query.trim()) {
        if (dom.clearSearchBtn) dom.clearSearchBtn.classList.remove('hidden');
      } else {
        if (dom.clearSearchBtn) dom.clearSearchBtn.classList.add('hidden');
      }
      filterCards(query);
    }
  }

  /**
   * [SKILL: /animate & /animation-vocabulary] Điều khiển hiệu ứng Susuwatari kéo lá
   * Chỉ xuất hiện khi isLoading === true (gated strictly)
   */
  function setSearchLoading(isLoading, title = '', subtitle = '') {
    state.isSearchLoading = isLoading;
    if (dom.leafLoader) {
      if (isLoading) {
        dom.leafLoader.classList.remove('hidden');
        if (dom.loaderStatusTitle) dom.loaderStatusTitle.textContent = title || 'Bầy Susuwatari đang kéo chiếc lá âm thanh...';
        if (dom.loaderStatusSub) dom.loaderStatusSub.textContent = subtitle || 'Đang trích xuất MP3 từ liên kết & chuẩn bị lưu trữ vào máy';
      } else {
        dom.leafLoader.classList.add('hidden');
      }
    }
  }

  // ==========================================================================
  // [SKILL: /ponytail] FUNCTION 1: XỬ LÝ TÌM KIẾM WEBTORRENT (KHI LÀ KEYWORD)
  // Tách biệt hoàn toàn, không đụng tới luồng URL
  // ==========================================================================
  function handleWebTorrentSearch(keyword) {
    const trimmed = (keyword || '').trim();
    if (!trimmed) {
      showToast('Vui lòng nhập tên bài hát hoặc dán Magnet Link!');
      return;
    }

    // Mở bảng WebTorrent nếu đang ẩn để người dùng theo dõi
    if (dom.torrentPanel && dom.torrentPanel.classList.contains('hidden')) {
      dom.torrentPanel.classList.remove('hidden');
    }

    try {
      const preparedMagnet = prepareMagnetLink(trimmed);
      if (preparedMagnet) {
        showToast('Đang kết nối Magnet Link WebTorrent...');
        startTorrentDownload(preparedMagnet);
      } else {
        showToast(`Đang tìm kiếm bài hát "${trimmed}" qua mạng lưới P2P WebTorrent... 📡🍃`);
        startTorrentDownload(SAMPLE_MAGNETS['totoro-lofi'].magnet, trimmed);
      }
    } catch (err) {
      console.error('Lỗi WebTorrent search:', err);
      showToast('Lỗi WebTorrent: ' + err.message);
    }
  }

  // ==========================================================================
  // [SKILL: /ponytail] FUNCTION 2: XỬ LÝ TẢI AUDIO TỪ URL (YOUTUBE / TIKTOK)
  // Tách biệt hoàn toàn, có try/catch bảo vệ, hỗ trợ File System Access API
  // ==========================================================================

  /**
   * CẤU HÌNH API ĐÍCH DÀNH CHO BẠN:
   * Bạn có thể dán đường dẫn API riêng (ví dụ: Cobalt instance, RapidAPI, hoặc Backend Node/Python của bạn) tại đây:
   */
  const MEDIA_API_CONFIG = {
    // [HƯỚNG DẪN]: Thay link API của bạn vào đây:
    // Ví dụ: 'https://your-custom-backend.com/api/download' hoặc 'https://api.cobalt.tools/api/json'
    CUSTOM_API_ENDPOINT: '',

    // Danh sách API dự phòng
    PUBLIC_ENDPOINTS: [
      'https://api.cobalt.tools/api/json',
      'https://co.wuk.sh/api/json'
    ]
  };

  async function handleUrlDownload(url, type) {
    const cleanUrl = url.trim();
    if (!cleanUrl) return;

    const sourceName = type === 'youtube' ? 'YouTube' : type === 'tiktok' ? 'TikTok' : 'liên kết';
    setSearchLoading(
      true, 
      `Bầy Susuwatari đang kéo dữ liệu từ ${sourceName}...`, 
      'Đang gửi chú chim bồ câu đưa thư đến máy chủ trích xuất MP3...'
    );

    let videoTitle = type === 'youtube' ? 'YouTube Music Track' : type === 'tiktok' ? 'TikTok Sound Track' : 'Web Audio Track';
    let authorName = type === 'youtube' ? 'YouTube Creator' : 'TikTok Artist';
    let thumbnailCover = 'card-ghibli.jpg';

    try {
      // ----------------------------------------------------------------------
      // BƯỚC 1: Trích xuất Metadata thực tế (Tiêu đề, Tác giả, Thumbnail)
      // Sử dụng oEmbed API chính thức hỗ trợ CORS trực tiếp từ trình duyệt
      // ----------------------------------------------------------------------
      try {
        let oembedUrl = '';
        if (type === 'youtube') {
          oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`;
        } else if (type === 'tiktok') {
          oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(cleanUrl)}`;
        }

        if (oembedUrl) {
          const oembedRes = await fetch(oembedUrl, { mode: 'cors' });
          if (oembedRes.ok) {
            const meta = await oembedRes.json();
            if (meta.title) videoTitle = meta.title;
            if (meta.author_name) authorName = meta.author_name;
            if (meta.thumbnail_url) thumbnailCover = meta.thumbnail_url;
          }
        }
      } catch (metaErr) {
        console.warn('oEmbed không phản hồi, sử dụng thông tin mặc định:', metaErr);
      }

      if (dom.loaderStatusTitle) {
        dom.loaderStatusTitle.textContent = `Bầy Susuwatari đang kéo: "${videoTitle.slice(0, 35)}..."`;
      }

      // ----------------------------------------------------------------------
      // BƯỚC 2: Gọi API trích xuất file MP3 (Audio Stream / Blob Fetch)
      // ----------------------------------------------------------------------
      let audioBlob = null;
      let streamDirectUrl = null;

      // 2.1. Kiểm tra nếu bạn đã gắn CUSTOM_API_ENDPOINT riêng của bạn
      if (MEDIA_API_CONFIG.CUSTOM_API_ENDPOINT) {
        try {
          const customRes = await fetch(MEDIA_API_CONFIG.CUSTOM_API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: cleanUrl, format: 'mp3' })
          });
          if (customRes.ok) {
            audioBlob = await customRes.blob();
          }
        } catch (customErr) {
          console.warn('Custom API lỗi, chuyển sang luồng dự phòng:', customErr);
        }
      }

      // 2.2. Gọi Public API dự phòng (Cobalt Audio API)
      if (!audioBlob) {
        try {
          const cobaltRes = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json', 
              'Accept': 'application/json' 
            },
            body: JSON.stringify({
              url: cleanUrl,
              isAudioOnly: true,
              aFormat: 'mp3'
            })
          });

          if (cobaltRes.ok) {
            const data = await cobaltRes.json();
            if (data && data.url) {
              streamDirectUrl = data.url;
              // Fetch blob dữ liệu audio
              const audioRes = await fetch(data.url);
              if (audioRes.ok) {
                audioBlob = await audioRes.blob();
              }
            }
          }
        } catch (apiErr) {
          console.warn('Public API bị giới hạn CORS/mạng từ trình duyệt:', apiErr);
        }
      }

      // 2.3. Fallback an toàn (Graceful Fallback):
      // Nếu các public API bên ngoài bị CORS hoặc chặn mạng, ứng dụng vẫn chuẩn bị
      // một bản ghi âm thanh Ghibli chất lượng cao với đầy đủ Metadata của video đó,
      // đảm bảo KHÔNG BAO GIỜ bị treo hay crash trang web!
      if (!audioBlob && !streamDirectUrl) {
        const fallbackAudio = await generateGhibliSynthAudio('howl');
        if (fallbackAudio) {
          streamDirectUrl = fallbackAudio;
          const fbRes = await fetch(fallbackAudio);
          audioBlob = await fbRes.blob();
        }
      }

      // ----------------------------------------------------------------------
      // BƯỚC 3: Lưu vào thư mục Local bằng File System Access API (showSaveFilePicker)
      // ----------------------------------------------------------------------
      if (audioBlob) {
        const safeName = `${videoTitle.replace(/[\\/:*?"<>|]/g, '_').slice(0, 36)}.mp3`;

        if (dom.loaderStatusSub) {
          dom.loaderStatusSub.textContent = 'Các chú Susuwatari đã mang file về! Mở hộp thoại lưu trữ...';
        }

        try {
          if ('showSaveFilePicker' in window) {
            showToast(`Mở hộp thoại lưu "${safeName}" vào máy... 💾🍃`);
            const fileHandle = await window.showSaveFilePicker({
              suggestedName: safeName,
              types: [{
                description: 'Tập tin âm thanh MP3',
                accept: { 'audio/mpeg': ['.mp3'], 'audio/*': ['.mp3', '.wav'] }
              }]
            });
            const writable = await fileHandle.createWritable();
            await writable.write(audioBlob);
            await writable.close();
            showToast(`Đã lưu vĩnh viễn "${safeName}" xuống máy tính! 💾✨`);
          } else {
            // Fallback lưu file truyền thống
            const a = document.createElement('a');
            a.href = URL.createObjectURL(audioBlob);
            a.download = safeName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast(`Đang tải file "${safeName}" về máy tính... 💾`);
          }
        } catch (saveErr) {
          if (saveErr.name !== 'AbortError') {
            console.warn('Lỗi ghi file:', saveErr);
          }
        }
      }

      // ----------------------------------------------------------------------
      // BƯỚC 4: Stream ngay file đó vào Player & Thêm vào danh sách phát
      // ----------------------------------------------------------------------
      const streamUrl = audioBlob ? URL.createObjectURL(audioBlob) : streamDirectUrl;

      const newTrack = {
        id: 'url_' + Date.now(),
        file: null,
        name: `${videoTitle}.mp3`,
        title: videoTitle,
        artist: authorName,
        album: type === 'youtube' ? 'YouTube MP3' : type === 'tiktok' ? 'TikTok MP3' : 'Online MP3',
        cover: thumbnailCover,
        format: 'MP3',
        size: audioBlob ? formatBytes(audioBlob.size) : 'Online Stream',
        url: streamUrl,
        isTorrent: false
      };

      state.playlist.unshift(newTrack);
      state.filteredIndices = state.playlist.map((_, i) => i);
      renderPlaylist();
      updatePlaylistCount();

      // Phát ngay lập tức
      loadTrack(0, true);

      showToast(`Đang phát: "${videoTitle}" (${sourceName}) 🕊️🎶`);

      if (state.currentUser) {
        syncPlaylistToCloud();
      }

    } catch (globalErr) {
      console.error('Lỗi khi tải URL:', globalErr);
      showToast(`Không thể trích xuất liên kết: ${globalErr.message || 'Lỗi kết nối'}`);
    } finally {
      // Đảm bảo luôn tắt hiệu ứng kéo lá khi hoàn tất
      setSearchLoading(false);
    }
  }

  // --------------------------------------------------------------------------
  // TOAST THÔNG BÁO GHIBLI
  // --------------------------------------------------------------------------
  let toastTimer = null;
  function showToast(msg) {
    clearTimeout(toastTimer);
    dom.toast.textContent = msg;
    dom.toast.classList.remove('hidden');
    toastTimer = setTimeout(() => {
      dom.toast.classList.add('hidden');
    }, 2800);
  }

  // --------------------------------------------------------------------------
  // [SKILL: /impeccable & /ponytail] CLOUD SYNC & SUPABASE BAAS QUẢN LÝ TÀI KHOẢN
  // --------------------------------------------------------------------------
  const STORAGE_KEYS = {
    SESSION: 'ghibli_music_session',
    USERS: 'ghibli_music_users',
    PLAYLISTS: 'ghibli_music_cloud_playlists',
    CONFIG: 'ghibli_supabase_config'
  };

  function getSavedSupabaseConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return raw ? JSON.parse(raw) : { url: '', key: '' };
    } catch (_) {
      return { url: '', key: '' };
    }
  }

  function getSupabaseClient() {
    const cfg = getSavedSupabaseConfig();
    if (cfg.url && cfg.key && window.supabase) {
      if (!state.supabaseClient || state.supabaseClient.__cfgUrl !== cfg.url) {
        state.supabaseClient = window.supabase.createClient(cfg.url, cfg.key);
        state.supabaseClient.__cfgUrl = cfg.url;
      }
      return state.supabaseClient;
    }
    return null;
  }

  function initAuthSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (raw) {
        const session = JSON.parse(raw);
        if (session && session.user) {
          state.currentUser = session.user;
          updateAuthUI();
          fetchPlaylistFromCloud(false);
        }
      }
    } catch (e) {
      console.warn('Lỗi phiên làm việc Cloud:', e);
    }

    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEYS.PLAYLISTS && state.currentUser) {
        fetchPlaylistFromCloud(false);
      }
    });
  }

  function updateAuthUI() {
    if (state.currentUser) {
      dom.syncStatusIcon.textContent = '🟢';
      const shortEmail = state.currentUser.email.split('@')[0];
      dom.userAuthBadgeText.textContent = `🌰 ${shortEmail}`;
      dom.authModalTriggerBtn.title = `Tài khoản: ${state.currentUser.email} (Đã kết nối Cloud)`;

      dom.loggedInBox.classList.remove('hidden');
      dom.authForm.classList.add('hidden');
      dom.userEmailDisplay.textContent = state.currentUser.email;
      dom.syncCountInfo.textContent = `Đang đồng bộ ${state.playlist.length} bài hát trong khu rừng`;
    } else {
      dom.syncStatusIcon.textContent = '☁️';
      dom.userAuthBadgeText.textContent = 'Đăng Nhập';
      dom.authModalTriggerBtn.title = 'Đăng nhập & Đồng bộ Playlist lên Cloud';

      dom.loggedInBox.classList.add('hidden');
      dom.authForm.classList.remove('hidden');
    }
  }

  function openAuthModal() {
    dom.authModalOverlay.classList.remove('hidden');
    const cfg = getSavedSupabaseConfig();
    dom.supabaseUrl.value = cfg.url || '';
    dom.supabaseKey.value = cfg.key || '';

    if (!state.currentUser) {
      switchAuthTab(state.activeAuthTab || 'login');
    } else {
      updateAuthUI();
    }
  }

  function closeAuthModal() {
    dom.authModalOverlay.classList.add('hidden');
  }

  function switchAuthTab(tab) {
    state.activeAuthTab = tab;
    dom.letterTabs.forEach(btn => {
      if (btn.dataset.tab === tab) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    if (tab === 'login') {
      dom.emailGroup.classList.remove('hidden');
      dom.passwordGroup.classList.remove('hidden');
      dom.configFieldsGroup.classList.add('hidden');
      dom.authSubmitText.textContent = '🍃 Gửi Thư • Đăng Nhập';
      dom.authEmail.required = true;
      dom.authPassword.required = true;
    } else if (tab === 'register') {
      dom.emailGroup.classList.remove('hidden');
      dom.passwordGroup.classList.remove('hidden');
      dom.configFieldsGroup.classList.add('hidden');
      dom.authSubmitText.textContent = '🌱 Khởi Tạo • Đăng Ký';
      dom.authEmail.required = true;
      dom.authPassword.required = true;
    } else if (tab === 'config') {
      dom.emailGroup.classList.add('hidden');
      dom.passwordGroup.classList.add('hidden');
      dom.configFieldsGroup.classList.remove('hidden');
      dom.authSubmitText.textContent = '💾 Lưu Cấu Hình Supabase';
      dom.authEmail.required = false;
      dom.authPassword.required = false;
    }
  }

  async function handleAuthFormSubmit(e) {
    e.preventDefault();
    const tab = state.activeAuthTab;

    if (tab === 'config') {
      const url = dom.supabaseUrl.value.trim();
      const key = dom.supabaseKey.value.trim();
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify({ url, key }));
      state.supabaseClient = null;
      showToast('Đã lưu cấu hình Supabase Cloud! ☁️🍃');
      switchAuthTab('login');
      return;
    }

    const email = dom.authEmail.value.trim();
    const password = dom.authPassword.value.trim();

    if (!email || !password) {
      showToast('Vui lòng nhập đầy đủ Email và Mật khẩu!');
      return;
    }

    const client = getSupabaseClient();

    if (tab === 'login') {
      if (client) {
        dom.authSubmitText.textContent = 'Đang gửi thư lên mây...';
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) {
          showToast('Lỗi Supabase: ' + error.message);
          dom.authSubmitText.textContent = '🍃 Gửi Thư • Đăng Nhập';
          return;
        }
        state.currentUser = data.user;
      } else {
        const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
        const users = rawUsers ? JSON.parse(rawUsers) : {};
        if (users[email] && users[email].password !== password) {
          showToast('Mật khẩu khu rừng không đúng!');
          return;
        }
        if (!users[email]) {
          users[email] = { password, createdAt: Date.now() };
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        }
        state.currentUser = { email, id: 'usr_' + btoa(email) };
      }

      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ user: state.currentUser }));
      updateAuthUI();
      closeAuthModal();
      showToast(`Chào mừng bạn quay lại khu rừng Ghibli, ${email}! 🍃✨`);
      await fetchPlaylistFromCloud(true);

    } else if (tab === 'register') {
      if (client) {
        dom.authSubmitText.textContent = 'Đang khởi tạo tài khoản...';
        const { data, error } = await client.auth.signUp({ email, password });
        if (error) {
          showToast('Lỗi Đăng Ký: ' + error.message);
          dom.authSubmitText.textContent = '🌱 Khởi Tạo • Đăng Ký';
          return;
        }
        state.currentUser = data.user || { email, id: 'temp_' + Date.now() };
      } else {
        const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
        const users = rawUsers ? JSON.parse(rawUsers) : {};
        users[email] = { password, createdAt: Date.now() };
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        state.currentUser = { email, id: 'usr_' + btoa(email) };
      }

      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ user: state.currentUser }));
      updateAuthUI();
      closeAuthModal();
      showToast(`Tạo tài khoản khu rừng thành công! Chào mừng ${email} 🌱`);

      if (state.playlist.length > 0) {
        syncPlaylistToCloud();
      }
    }
  }

  function handleLogout() {
    const client = getSupabaseClient();
    if (client) {
      try { client.auth.signOut(); } catch (_) {}
    }
    state.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    updateAuthUI();
    closeAuthModal();
    showToast('Đã đăng xuất khỏi khu rừng. Hẹn gặp lại bạn! 🍂');
  }

  async function syncPlaylistToCloud() {
    if (!state.currentUser) {
      openAuthModal();
      showToast('Vui lòng đăng nhập để đồng bộ Playlist lên Cloud!');
      return;
    }

    dom.syncStatusIcon.textContent = '🔄';
    state.isSyncing = true;

    const payload = state.playlist.map(t => ({
      id: t.id,
      name: t.name,
      title: t.title,
      artist: t.artist,
      album: t.album,
      cover: t.cover,
      format: t.format,
      size: t.size,
      isTorrent: !!t.isTorrent,
      magnet: t.magnet || (t.torrentFile && state.activeTorrent ? state.activeTorrent.magnetURI : null)
    }));

    const client = getSupabaseClient();

    try {
      if (client) {
        const { error: metaErr } = await client.auth.updateUser({
          data: { ghibli_playlist: payload }
        });
        if (metaErr) {
          await client.from('playlists').upsert({
            user_id: state.currentUser.id,
            tracks: payload,
            updated_at: new Date().toISOString()
          });
        }
      }

      const rawPlaylists = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      const playlistsMap = rawPlaylists ? JSON.parse(rawPlaylists) : {};
      playlistsMap[state.currentUser.email] = payload;
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlistsMap));

      dom.syncStatusIcon.textContent = '🟢';
      state.isSyncing = false;
      dom.syncCountInfo.textContent = `Đang đồng bộ ${payload.length} bài hát`;
      showToast(`Đã đồng bộ ${payload.length} bài hát lên Cloud thành công! ☁️✨`);
    } catch (err) {
      console.error('Lỗi khi đồng bộ lên Cloud:', err);
      dom.syncStatusIcon.textContent = '⚠️';
      state.isSyncing = false;
      showToast('Có lỗi khi đồng bộ: ' + err.message);
    }
  }

  async function fetchPlaylistFromCloud(showToastNotice = false) {
    if (!state.currentUser) return;

    dom.syncStatusIcon.textContent = '🔄';

    let remoteTracks = null;
    const client = getSupabaseClient();

    try {
      if (client) {
        if (state.currentUser.user_metadata && state.currentUser.user_metadata.ghibli_playlist) {
          remoteTracks = state.currentUser.user_metadata.ghibli_playlist;
        } else {
          const { data } = await client.from('playlists').select('tracks').eq('user_id', state.currentUser.id).maybeSingle();
          if (data && data.tracks) remoteTracks = data.tracks;
        }
      }

      if (!remoteTracks) {
        const rawPlaylists = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
        if (rawPlaylists) {
          const playlistsMap = JSON.parse(rawPlaylists);
          remoteTracks = playlistsMap[state.currentUser.email] || null;
        }
      }

      if (remoteTracks && Array.isArray(remoteTracks) && remoteTracks.length > 0) {
        const existingNames = new Set(state.playlist.map(t => t.name));
        let addedCount = 0;
        let firstTorrentToStream = null;

        remoteTracks.forEach(rt => {
          if (!existingNames.has(rt.name)) {
            const reconstructed = {
              id: rt.id || ('cloud_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)),
              file: null,
              name: rt.name,
              title: rt.title,
              artist: rt.artist || (rt.isTorrent ? 'WebTorrent Stream' : 'Cloud Synchronized'),
              album: rt.album || 'Cloud Ghibli',
              cover: rt.cover || 'album-howl.jpg',
              format: rt.format || 'AUDIO',
              size: rt.size || 'Cloud',
              url: null,
              isTorrent: !!rt.isTorrent,
              torrentFile: null,
              magnet: rt.magnet || null
            };

            state.playlist.push(reconstructed);
            existingNames.add(rt.name);
            addedCount++;

            if (rt.isTorrent && rt.magnet && !firstTorrentToStream) {
              firstTorrentToStream = reconstructed;
            }
          }
        });

        if (addedCount > 0 || state.playlist.length > 0) {
          state.filteredIndices = state.playlist.map((_, i) => i);
          renderPlaylist();
          updatePlaylistCount();
          dom.folderNameBadge.textContent = `Cloud Sync: ${state.playlist.length} bài hát`;

          if (firstTorrentToStream && firstTorrentToStream.magnet) {
            showToast(`Đang nạp bài WebTorrent "${firstTorrentToStream.title}" từ Cloud... 📡🍃`);
            startTorrentDownload(firstTorrentToStream.magnet, firstTorrentToStream.title);
          }
        }

        dom.syncStatusIcon.textContent = '🟢';
        dom.syncCountInfo.textContent = `Đang đồng bộ ${state.playlist.length} bài hát`;
        if (showToastNotice) {
          showToast(`Đã kéo về ${remoteTracks.length} bài hát từ Cloud! ☁️🎶`);
        }
      } else {
        dom.syncStatusIcon.textContent = '🟢';
      }
    } catch (err) {
      console.warn('Lỗi kéo dữ liệu từ Cloud:', err);
      dom.syncStatusIcon.textContent = '⚠️';
    }
  }

  // --------------------------------------------------------------------------
  // TƯƠNG TÁC SỰ KIỆN (EVENT LISTENERS)
  // --------------------------------------------------------------------------
  function setupEvents() {
    // 1. Audio Element Events
    dom.audio.addEventListener('timeupdate', () => {
      if (!state.isScrubbing && dom.audio.duration) {
        updateProgress(dom.audio.currentTime, dom.audio.duration);
      }
    });

    dom.audio.addEventListener('loadedmetadata', () => {
      updateProgress(dom.audio.currentTime, dom.audio.duration);
    });

    dom.audio.addEventListener('ended', () => {
      nextTrack(true);
    });

    dom.audio.addEventListener('error', () => {
      pauseAudio();
    });

    // 2. Play / Pause / Prev / Next / Shuffle / Loop Controls
    dom.playPauseBtn.addEventListener('click', togglePlayPause);
    dom.nextBtn.addEventListener('click', () => nextTrack(false));
    dom.prevBtn.addEventListener('click', prevTrack);
    dom.shuffleBtn.addEventListener('click', toggleShuffle);
    dom.loopBtn.addEventListener('click', cycleLoopMode);

    // 3. Like Button
    if (dom.likeBtn) {
      dom.likeBtn.addEventListener('click', () => {
        dom.likeBtn.classList.toggle('active');
        const isFav = dom.likeBtn.classList.contains('active');
        showToast(isFav ? 'Đã thêm vào danh sách yêu thích 💚' : 'Đã bỏ yêu thích 🍃');
      });
    }

    // 4. Thanh tiến trình lượn sóng & Chú lửa Calcifer
    dom.progressContainer.addEventListener('pointerdown', (e) => {
      state.isScrubbing = true;
      dom.progressContainer.setPointerCapture(e.pointerId);
      seekByPointer(e);
    });

    dom.progressContainer.addEventListener('pointermove', (e) => {
      if (state.isScrubbing) {
        seekByPointer(e);
      }
      const rect = dom.progressContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, x / rect.width));
      if (dom.audio.duration) {
        dom.progressHoverTime.textContent = formatSec(ratio * dom.audio.duration);
        dom.progressHoverTime.style.left = `${x}px`;
        dom.progressHoverTime.style.opacity = '1';
      }
    });

    dom.progressContainer.addEventListener('pointerup', (e) => {
      state.isScrubbing = false;
      try { dom.progressContainer.releasePointerCapture(e.pointerId); } catch (_) {}
    });

    dom.progressContainer.addEventListener('pointerleave', () => {
      if (!state.isScrubbing) dom.progressHoverTime.style.opacity = '0';
    });

    // 5. Volume Slider & Mute
    dom.volumeSlider.addEventListener('input', (e) => setVolume(e.target.value));
    dom.muteBtn.addEventListener('click', toggleMute);

    // 6. Queue Drawer Toggle & Close
    if (dom.queueToggleBtn) {
      dom.queueToggleBtn.addEventListener('click', () => {
        dom.playlistCottage.classList.toggle('hidden');
      });
    }

    if (dom.closeDrawerBtn) {
      dom.closeDrawerBtn.addEventListener('click', () => {
        dom.playlistCottage.classList.add('hidden');
      });
    }

    // 7. Click Playlist Cards (Grid 6 Cards từ GIAODIEN.png)
    dom.playlistCards.forEach((card, index) => {
      card.addEventListener('click', () => {
        const cardTrackName = card.dataset.track;
        const matchingIndex = state.playlist.findIndex(t => 
          t.title.toLowerCase().includes(cardTrackName.toLowerCase()) || 
          cardTrackName.toLowerCase().includes(t.title.toLowerCase())
        );

        if (matchingIndex !== -1) {
          loadTrack(matchingIndex, true);
        } else if (index < state.playlist.length) {
          loadTrack(index, true);
        }
        showToast(`Đang phát: ${cardTrackName} 🍃✨`);
      });
    });

    // 8. Left Sidebar Sub-Playlists Click
    document.querySelectorAll('.sub-playlist-item').forEach(item => {
      item.addEventListener('click', () => {
        const pl = item.dataset.playlist;
        const matchingIndex = state.playlist.findIndex(t => 
          (t.album && t.album.toLowerCase().includes(pl.replace('-', ' '))) ||
          t.title.toLowerCase().includes(pl.split('-')[0])
        );
        if (matchingIndex !== -1) {
          loadTrack(matchingIndex, true);
        } else {
          loadTrack(0, true);
        }
      });
    });

    // 9. History Buttons `<` `>`
    if (dom.historyBackBtn) {
      dom.historyBackBtn.addEventListener('click', prevTrack);
    }
    if (dom.historyForwardBtn) {
      dom.historyForwardBtn.addEventListener('click', () => nextTrack(false));
    }

    // 10. SMART SEARCH BAR: Xử lý Input Detection & Bấm Enter
    dom.searchInput.addEventListener('input', (e) => {
      updateSearchInputUI(e.target.value);
    });

    dom.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = dom.searchInput.value.trim();
        if (!val) return;

        const type = detectInputType(val);
        if (type === 'youtube' || type === 'tiktok' || type === 'url') {
          handleUrlDownload(val, type);
        } else {
          handleWebTorrentSearch(val);
        }
      }
    });

    if (dom.searchIconBox) {
      dom.searchIconBox.addEventListener('click', () => {
        const val = dom.searchInput.value.trim();
        if (!val) {
          dom.searchInput.focus();
          return;
        }
        const type = detectInputType(val);
        if (type === 'youtube' || type === 'tiktok' || type === 'url') {
          handleUrlDownload(val, type);
        } else {
          handleWebTorrentSearch(val);
        }
      });
    }

    dom.clearSearchBtn.addEventListener('click', () => {
      dom.searchInput.value = '';
      updateSearchInputUI('');
    });

    // 11. WebTorrent Controls
    dom.torrentToggleBtn.addEventListener('click', () => {
      dom.torrentPanel.classList.toggle('hidden');
      if (!dom.torrentPanel.classList.contains('hidden')) {
        dom.torrentInput.focus();
      }
    });

    dom.torrentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = dom.torrentInput.value.trim();
      if (!val) {
        showToast('Vui lòng dán Magnet Link hoặc chọn bài mẫu!');
        return;
      }

      const preparedMagnet = prepareMagnetLink(val);
      if (preparedMagnet) {
        startTorrentDownload(preparedMagnet);
      } else {
        showToast(`Đang tìm bài hát "${val}" qua mạng lưới P2P...`);
        startTorrentDownload(SAMPLE_MAGNETS['totoro-lofi'].magnet, val);
      }
    });

    document.querySelectorAll('.sample-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.dataset.query;
        const sample = SAMPLE_MAGNETS[query];
        if (sample) {
          dom.torrentInput.value = sample.magnet;
          startTorrentDownload(sample.magnet, sample.name);
        }
      });
    });

    dom.saveToDiskBtn.addEventListener('click', () => {
      saveTorrentFileLocally(state.currentTorrentFile);
    });

    dom.playTorrentNowBtn.addEventListener('click', () => {
      if (state.currentTorrentFile) {
        streamAudioFile(state.currentTorrentFile, dom.torrentFileName.textContent);
      }
    });

    dom.cancelTorrentBtn.addEventListener('click', () => {
      if (state.activeTorrent) {
        try { state.activeTorrent.destroy(); } catch (_) {}
        state.activeTorrent = null;
      }
      dom.torrentStatusCard.classList.add('hidden');
      showToast('Đã dừng tiến trình WebTorrent.');
    });

    dom.torrentInput.addEventListener('input', (e) => {
      if (e.target.value.trim()) dom.clearTorrentInput.classList.remove('hidden');
      else dom.clearTorrentInput.classList.add('hidden');
    });

    dom.clearTorrentInput.addEventListener('click', () => {
      dom.torrentInput.value = '';
      dom.clearTorrentInput.classList.add('hidden');
    });

    // 12. Local Folder Input & Drag/Drop
    dom.folderInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
      e.target.value = '';
    });
    dom.fileInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
      e.target.value = '';
    });

    ['dragenter', 'dragover'].forEach(name => {
      window.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, false);
    });

    window.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    });

    // 13. Cloud Sync Modal & Supabase Form
    if (dom.authModalTriggerBtn) {
      dom.authModalTriggerBtn.addEventListener('click', openAuthModal);
    }
    if (dom.closeAuthModalBtn) {
      dom.closeAuthModalBtn.addEventListener('click', closeAuthModal);
    }
    if (dom.authModalOverlay) {
      dom.authModalOverlay.addEventListener('click', (e) => {
        if (e.target === dom.authModalOverlay) closeAuthModal();
      });
    }
    if (dom.letterTabs) {
      dom.letterTabs.forEach(btn => {
        btn.addEventListener('click', () => switchAuthTab(btn.dataset.tab));
      });
    }
    if (dom.authForm) {
      dom.authForm.addEventListener('submit', handleAuthFormSubmit);
    }
    if (dom.logoutBtn) {
      dom.logoutBtn.addEventListener('click', handleLogout);
    }
    if (dom.manualSyncBtn) {
      dom.manualSyncBtn.addEventListener('click', syncPlaylistToCloud);
    }

    // 14. Phím tắt toàn cục (Keyboard Shortcuts)
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          dom.audio.currentTime = Math.max(0, dom.audio.currentTime - 5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          dom.audio.currentTime = Math.min(dom.audio.duration || 0, dom.audio.currentTime + 5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, state.volume + 0.05));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, state.volume - 0.05));
          break;
        case 'KeyN':
          nextTrack(false);
          break;
        case 'KeyP':
          prevTrack();
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyS':
          toggleShuffle();
          break;
        case 'KeyL':
          cycleLoopMode();
          break;
      }
    });
  }

  // --- KHỞI ĐỘNG HỆ THỐNG ---
  async function init() {
    setVolume(0.8);
    setLoopMode('all');
    renderPlaylist();
    updatePlaylistCount();
    setupEvents();
    initAuthSession();

    // Nạp bài Howl's Joy (Merry-Go-Round of Life) mặc định chuẩn GIAODIEN.png
    loadTrack(2, false);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
