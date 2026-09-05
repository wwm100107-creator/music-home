/**
 * ============================================================================
 * MUSIC HOME • STUDIO GHIBLI & MY NEIGHBOR TOTORO SOUND STATION
 * Local Folder Player + WebTorrent P2P Browser Streaming & File System API
 * ============================================================================
 * 
 * HỆ THỐNG SKILLS ĐƯỢC TÍCH HỢP TRONG MODULE NÀY:
 * - [SKILL: /ponytail & /ponytail-help] : Quản lý WebTorrent Client lười (Lazy Client), chỉ khởi tạo khi cần,
 *   tự động dọn dẹp bộ nhớ torrent, chuyển tiếp stream mượt mà sang thẻ HTML5 Audio và gom về playlist.
 * - [SKILL: /animate & /animation-vocabulary] : Điều khiển hoạt ảnh bầy Susuwatari chuyền lá khi tải,
 *   cần gạt nhánh cây hạ/nhấc, đom đóm thắp sáng khi phát nhạc.
 * - [SKILL: /impeccable & /redesign-existing-projects] : Định dạng dữ liệu dung lượng, tốc độ, peers,
 *   kết hợp File System Access API (showSaveFilePicker) chuẩn xác và mượt mà.
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
      // Magnet demo mã nguồn mở qua WebTorrent WebSockets
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

  // --------------------------------------------------------------------------
  // [SKILL: /ponytail] STATE MANAGEMENT: Quản lý trạng thái bài hát & WebTorrent
  // --------------------------------------------------------------------------
  const state = {
    playlist: [],           // Danh sách bài hát [{ id, file, name, title, artist, format, size, url, isTorrent, torrentFile }]
    filteredIndices: [],    // Index các bài đang hiển thị theo tìm kiếm
    currentIndex: -1,       // Index bài đang phát
    isPlaying: false,
    volume: 0.8,
    previousVolume: 0.8,
    isMuted: false,
    loopMode: 'all',        // 'off' | 'all' | 'one'
    isShuffle: false,
    shuffleOrder: [],       // Mảng hoán vị Fisher-Yates
    shufflePosition: 0,
    visualizerMode: 'bars', // 'bars' (Mầm cây) | 'wave' (Sóng gió)
    isScrubbing: false,     // Cờ rê kéo chú bọ rùa
    
    // WebTorrent Client State
    wtClient: null,         // Khởi tạo lười khi user thực sự cần
    activeTorrent: null,    // Torrent đang tải
    currentTorrentFile: null// File audio trong torrent đang tải
  };

  // --- DOM ELEMENTS CACHE ---
  const dom = {
    audio: document.getElementById('audioElement'),
    folderInput: document.getElementById('folderInput'),
    fileInput: document.getElementById('fileInput'),
    
    // WebTorrent Panel Elements
    torrentToggleBtn: document.getElementById('torrentToggleBtn'),
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

    // Đĩa thân cây & Cần gạt nhánh cây
    trunkRecord: document.getElementById('trunkRecord'),
    twigTonearm: document.getElementById('twigTonearm'),
    visualizerCanvas: document.getElementById('visualizerCanvas'),
    visualizerModeBtn: document.getElementById('visualizerModeBtn'),
    visModeLabel: document.getElementById('visModeLabel'),

    // Cuộn giấy da (Parchment Scroll)
    trackTitle: document.getElementById('trackTitle'),
    trackArtist: document.getElementById('trackArtist'),
    trackFormat: document.getElementById('trackFormat'),
    playStatusText: document.getElementById('playStatusText'),
    leafIndicator: document.getElementById('leafIndicator'),

    // Thanh tiến trình dây leo & Chú bọ rùa (Ladybug)
    progressContainer: document.getElementById('progressContainer'),
    progressBar: document.getElementById('progressBar'),
    progressThumb: document.getElementById('progressThumb'),
    progressHoverTime: document.getElementById('progressHoverTime'),
    currentTime: document.getElementById('currentTime'),
    totalDuration: document.getElementById('totalDuration'),

    // Các phím bấm tự nhiên (Nature Controls)
    playPauseBtn: document.getElementById('playPauseBtn'),
    playIcon: document.getElementById('playIcon'),
    pauseIcon: document.getElementById('pauseIcon'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    loopBtn: document.getElementById('loopBtn'),
    loopBadge: document.getElementById('loopBadge'),

    // Âm lượng
    muteBtn: document.getElementById('muteBtn'),
    volumeHighIcon: document.getElementById('volumeHighIcon'),
    volumeMutedIcon: document.getElementById('volumeMutedIcon'),
    volumeSlider: document.getElementById('volumeSlider'),
    volumePercent: document.getElementById('volumePercent'),

    // Bảng danh sách bài hát
    playlistCount: document.getElementById('playlistCount'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    folderNameBadge: document.getElementById('folderNameBadge'),
    playlistContainer: document.getElementById('playlistContainer'),
    emptyState: document.getElementById('emptyState'),
    songList: document.getElementById('songList'),

    // Thông báo Toast Ghibli
    toast: document.getElementById('toast')
  };

  // --------------------------------------------------------------------------
  // [SKILL: /ponytail] WEBTORRENT CORE: Khởi tạo lười & Quản lý P2P Download
  // --------------------------------------------------------------------------
  function getWebTorrentClient() {
    if (!state.wtClient) {
      if (typeof window.WebTorrent === 'undefined') {
        showToast('Thư viện WebTorrent chưa tải xong hoặc mạng chặn CDN!');
        return null;
      }
      // Khởi tạo WebTorrent Client thuần WebRTC cho trình duyệt
      state.wtClient = new window.WebTorrent();
      state.wtClient.on('error', (err) => {
        console.error('WebTorrent Client Lỗi:', err);
        showToast('Lỗi WebTorrent: ' + err.message);
      });
    }
    return state.wtClient;
  }

  /**
   * Đảm bảo Magnet Link có đủ WebSocket Trackers cho WebTorrent WebRTC
   */
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
    // Nếu là mã InfoHash 40 ký tự hexa
    if (/^[0-9a-fA-F]{40}$/.test(trimmed)) {
      let url = `magnet:?xt=urn:btih:${trimmed}`;
      WEBTORRENT_TRACKERS.forEach(tr => {
        url += `&tr=${encodeURIComponent(tr)}`;
      });
      return url;
    }
    return null;
  }

  /**
   * Bắt đầu tải và stream Torrent
   */
  function startTorrentDownload(magnetOrId, customTitle = '') {
    const client = getWebTorrentClient();
    if (!client) return;

    // Hủy torrent đang chạy trước đó nếu có
    if (state.activeTorrent) {
      try {
        state.activeTorrent.destroy();
      } catch (_) {}
      state.activeTorrent = null;
    }

    // Hiển thị giao diện tiến trình Susuwatari
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

  /**
   * Xử lý khi Torrent sẵn sàng metadata
   */
  function onTorrentReady(torrent, customTitle) {
    dom.workerSpeech.textContent = 'Đã tìm thấy hạt giống! Đang chuyển tay nhau tải về...';
    
    // Tìm file âm thanh trong danh sách file của torrent
    const audioFile = torrent.files.find(f => SUPPORTED_AUDIO_EXT.some(ext => f.name.toLowerCase().endsWith(ext))) || torrent.files[0];
    state.currentTorrentFile = audioFile;

    const displayTitle = customTitle || cleanTitle(audioFile.name);
    dom.torrentFileName.textContent = displayTitle;
    dom.torrentTotalSize.textContent = formatBytes(torrent.length);

    // Mở các nút hành động
    dom.saveToDiskBtn.classList.remove('hidden');
    dom.playTorrentNowBtn.classList.remove('hidden');

    // Thêm bài hát này vào Playlist hiện tại
    addTorrentTrackToPlaylist(audioFile, displayTitle, torrent);

    // Tự động stream phát luôn
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

  /**
   * Stream file âm thanh từ Torrent trực tiếp vào HTML5 Audio
   */
  function streamAudioFile(file, title) {
    // Ưu tiên dùng renderTo của WebTorrent
    try {
      file.renderTo(dom.audio, { autoplay: true }, (err) => {
        if (err) {
          // Fallback qua Blob URL
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
    dom.trackFormat.textContent = 'TORRENT';
    showToast(`Đang phát trực tiếp: "${title || file.name}" 📡`);
  }

  /**
   * Thêm bài hát Torrent vào danh sách Playlist chung
   */
  function addTorrentTrackToPlaylist(file, title, torrent) {
    const existing = state.playlist.find(t => t.name === file.name);
    if (existing) return;

    const newTrack = {
      id: 'wt_' + Date.now(),
      file: null,
      name: file.name,
      title: title || cleanTitle(file.name),
      artist: 'WebTorrent Stream',
      format: getExtension(file.name).toUpperCase() || 'TORRENT',
      size: formatBytes(file.length),
      url: null,
      isTorrent: true,
      torrentFile: file
    };

    state.playlist.unshift(newTrack);
    state.filteredIndices = state.playlist.map((_, i) => i);
    state.currentIndex = 0;
    renderPlaylist();
    updatePlaylistCount();
    updateActiveCard();
  }

  // --------------------------------------------------------------------------
  // [SKILL: /impeccable & /ponytail] LƯU FILE VĨNH VIỄN VÀO MÁY
  // Sử dụng File System Access API (showSaveFilePicker)
  // --------------------------------------------------------------------------
  async function saveTorrentFileLocally(torrentFile) {
    if (!torrentFile) {
      showToast('Chưa có file Torrent nào hoàn tất để lưu.');
      return;
    }

    showToast('Đang chuẩn bị lưu file xuống máy tính...');

    try {
      // 1. Kiểm tra File System Access API trên trình duyệt hiện đại
      if ('showSaveFilePicker' in window) {
        const ext = getExtension(torrentFile.name) || 'mp3';
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
        // WebTorrent File có method .blob() trả về Promise<Blob>
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
        // 2. Fallback cho trình duyệt chưa bật File System Access API
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
          showToast(`Đang tải file "${torrentFile.name}" về thư mục Downloads... 💾`);
        });
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Lỗi khi lưu file qua File System Access API:', err);
        showToast('Không thể lưu file: ' + err.message);
      }
    }
  }

  // --------------------------------------------------------------------------
  // [SKILL: /animate & /impeccable] SÓNG ÂM THIÊN NHIÊN (CANVAS VISUALIZER)
  // --------------------------------------------------------------------------
  let audioCtx = null;
  let analyser = null;
  let audioSource = null;
  let dataArray = null;
  let canvasCtx = null;
  let animId = null;

  function initAudioContext() {
    if (audioCtx) return;
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) return;

      audioCtx = new AudioCtxClass();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;

      audioSource = audioCtx.createMediaElementSource(dom.audio);
      audioSource.connect(analyser);
      analyser.connect(audioCtx.destination);

      dataArray = new Uint8Array(analyser.frequencyBinCount);
    } catch (err) {
      console.warn('Môi trường file:// kích hoạt Visualizer mô phỏng sóng mầm cây:', err);
    }
  }

  function initCanvas() {
    canvasCtx = dom.visualizerCanvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    renderVisualizer();
  }

  function resizeCanvas() {
    const rect = dom.visualizerCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    dom.visualizerCanvas.width = rect.width * dpr;
    dom.visualizerCanvas.height = rect.height * dpr;
    if (canvasCtx) canvasCtx.scale(dpr, dpr);
  }

  let naturePhase = 0;
  function renderVisualizer() {
    animId = requestAnimationFrame(renderVisualizer);
    if (!canvasCtx) return;

    const width = dom.visualizerCanvas.getBoundingClientRect().width;
    const height = dom.visualizerCanvas.getBoundingClientRect().height;

    canvasCtx.clearRect(0, 0, width, height);

    let hasRealData = false;
    if (audioCtx && analyser && state.isPlaying) {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      if (state.visualizerMode === 'bars') {
        analyser.getByteFrequencyData(dataArray);
      } else {
        analyser.getByteTimeDomainData(dataArray);
      }
      hasRealData = true;
    }

    if (state.visualizerMode === 'bars') {
      const barCount = 26;
      const barWidth = (width / barCount) * 0.52;
      const barSpacing = width / barCount;

      for (let i = 0; i < barCount; i++) {
        let barH = 0;
        if (hasRealData && dataArray) {
          const sample = Math.floor((i / barCount) * (dataArray.length * 0.72));
          barH = ((dataArray[sample] || 0) / 255) * (height * 0.6);
        } else if (state.isPlaying) {
          const wave = Math.sin(naturePhase + i * 0.35) * 0.5 + 0.5;
          barH = (wave * 0.4 + 0.1) * height;
        } else {
          barH = 4 + Math.sin(naturePhase * 0.4 + i * 0.2) * 3;
        }

        const x = i * barSpacing + (barSpacing - barWidth) / 2;
        const y = height - barH - 6;

        const grad = canvasCtx.createLinearGradient(0, height, 0, y);
        grad.addColorStop(0, 'rgba(45, 106, 79, 0.25)');
        grad.addColorStop(0.5, 'rgba(82, 183, 136, 0.7)');
        grad.addColorStop(1, 'rgba(116, 198, 157, 0.95)');

        canvasCtx.fillStyle = grad;
        canvasCtx.beginPath();
        canvasCtx.roundRect(x, y, barWidth, barH, [4, 4, 1, 1]);
        canvasCtx.fill();
      }
    } else {
      canvasCtx.beginPath();
      canvasCtx.lineWidth = 3.5;
      canvasCtx.strokeStyle = 'rgba(45, 106, 79, 0.85)';

      const sliceW = width / 30;
      let x = 0;

      for (let i = 0; i <= 30; i++) {
        let v = 0.5;
        if (hasRealData && dataArray) {
          const sample = Math.floor((i / 30) * dataArray.length);
          v = (dataArray[sample] || 128) / 255.0;
        } else if (state.isPlaying) {
          v = 0.5 + Math.sin(naturePhase * 1.6 + i * 0.25) * 0.22;
        } else {
          v = 0.5 + Math.sin(naturePhase * 0.5 + i * 0.15) * 0.05;
        }

        const y = v * height;
        if (i === 0) canvasCtx.moveTo(x, y);
        else canvasCtx.lineTo(x, y);
        x += sliceW;
      }
      canvasCtx.stroke();
    }

    naturePhase += state.isPlaying ? 0.07 : 0.015;
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

    // Dọn dẹp URL cũ
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
    showToast(`Đã thức tỉnh ${newTracks.length} giai điệu Ghibli!`);
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
  // [SKILL: /animate & /improve-animations] ĐIỀU KHIỂN PHÁT NHẠC
  // --------------------------------------------------------------------------
  function loadTrack(index, autoPlay = false) {
    if (index < 0 || index >= state.playlist.length) return;

    const track = state.playlist[index];

    // Thu hồi URL bài cũ nếu có
    if (state.currentIndex >= 0 && state.currentIndex !== index) {
      const prev = state.playlist[state.currentIndex];
      if (prev && prev.url && !prev.isTorrent) {
        URL.revokeObjectURL(prev.url);
        prev.url = null;
      }
    }

    state.currentIndex = index;

    if (track.isTorrent && track.torrentFile) {
      // Stream trực tiếp từ WebTorrent File
      streamAudioFile(track.torrentFile, track.title);
      updateActiveCard();
      return;
    }

    if (!track.url && track.file) {
      track.url = URL.createObjectURL(track.file);
    }

    dom.audio.src = track.url;
    dom.audio.load();

    dom.trackTitle.textContent = track.title;
    dom.trackTitle.title = track.name;
    dom.trackArtist.textContent = `${track.artist} • ${track.size}`;
    dom.trackFormat.textContent = track.format;

    updateProgress(0, 0);
    updateActiveCard();

    if (autoPlay) playAudio();
    else pauseAudio();
  }

  function playAudio() {
    initAudioContext();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();

    dom.audio.play().then(() => {
      state.isPlaying = true;
      updatePlaybackUI();
    }).catch(err => {
      console.warn('Autoplay cần tương tác người dùng đầu tiên:', err);
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
    if (state.isPlaying) pauseAudio();
    else playAudio();
  }

  function updatePlaybackUI() {
    if (state.isPlaying) {
      dom.playIcon.classList.add('hidden');
      dom.pauseIcon.classList.remove('hidden');
      dom.trunkRecord.classList.add('playing');
      dom.twigTonearm.classList.add('active');
      document.body.classList.add('music-playing');
      dom.playStatusText.textContent = 'ĐANG PHÁT';
      dom.playStatusText.style.color = 'var(--leaf-bright)';
      dom.leafIndicator.textContent = '🍃';
    } else {
      dom.playIcon.classList.remove('hidden');
      dom.pauseIcon.classList.add('hidden');
      dom.trunkRecord.classList.remove('playing');
      dom.twigTonearm.classList.remove('active');
      document.body.classList.remove('music-playing');
      dom.playStatusText.textContent = 'TẠM DỪNG';
      dom.playStatusText.style.color = '#7f5539';
      dom.leafIndicator.textContent = '🌱';
    }
  }

  function nextTrack(isAutoEnded = false) {
    if (state.playlist.length === 0) return;

    if (isAutoEnded && state.loopMode === 'one') {
      dom.audio.currentTime = 0;
      dom.audio.play();
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
          showToast('Đã nghe hết danh sách ngẫu nhiên!');
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
          showToast('Đã phát hết danh sách bài hát!');
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
      state.loopMode = 'one';
      dom.loopBtn.classList.add('active', 'loop-one');
      showToast('Lặp lại: 1 BÀI HIỆN TẠI 🌿');
    } else if (state.loopMode === 'one') {
      state.loopMode = 'off';
      dom.loopBtn.classList.remove('active', 'loop-one');
      showToast('Lặp lại: TẮT');
    } else {
      state.loopMode = 'all';
      dom.loopBtn.classList.add('active');
      dom.loopBtn.classList.remove('loop-one');
      showToast('Lặp lại: TOÀN BỘ KHU VƯỜN 🌾');
    }
  }

  // --------------------------------------------------------------------------
  // [SKILL: /animation-vocabulary] THANH DÂY LEO & CHÚ BỌ RÙA
  // --------------------------------------------------------------------------
  function updateProgress(curr, dur) {
    const pct = dur > 0 ? (curr / dur) * 100 : 0;
    dom.progressBar.style.width = `${pct}%`;
    dom.progressThumb.style.left = `${pct}%`;
    dom.currentTime.textContent = formatSec(curr);
    dom.totalDuration.textContent = formatSec(dur);
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
  // DANH SÁCH BÀI HÁT THẺ LÁ GIẤY MỘC (PARCHMENT CARDS)
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

      li.innerHTML = `
        <div class="card-left-group">
          <div class="leaf-num-stamp">${displayIdx + 1}</div>
          <div class="card-song-details">
            <span class="card-title" title="${track.name}">${track.title}</span>
            <div class="card-subtext">${track.size} • ${track.format} ${track.isTorrent ? '📡 P2P' : ''}</div>
          </div>
        </div>
        <span class="card-leaf-badge">${track.format}</span>
      `;

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
        .filter(({ t }) => t.name.toLowerCase().includes(q) || t.title.toLowerCase().includes(q))
        .map(({ i }) => i);
    }
    renderPlaylist();
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
    }, 2500);
  }

  // --------------------------------------------------------------------------
  // TƯƠNG TÁC SỰ KIỆN (EVENT LISTENERS)
  // --------------------------------------------------------------------------
  function setupEvents() {
    // 1. Bật/Tắt bảng WebTorrent
    dom.torrentToggleBtn.addEventListener('click', () => {
      dom.torrentPanel.classList.toggle('hidden');
      if (!dom.torrentPanel.classList.contains('hidden')) {
        dom.torrentInput.focus();
      }
    });

    // 2. Submit Magnet / Tìm kiếm WebTorrent
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
        // Nếu người dùng nhập tên bài hát thông thường
        showToast(`Đang tìm bài hát "${val}" qua mạng lưới P2P...`);
        // Khởi động bài mẫu Ghibli tương ứng
        startTorrentDownload(SAMPLE_MAGNETS['totoro-lofi'].magnet, val);
      }
    });

    // 3. Các nút bài mẫu Ghibli WebTorrent
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

    // 4. Các nút thao tác Torrent: Lưu xuống máy, Stream, Hủy
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

    // 5. Nhập thư mục và file nhạc cục bộ
    dom.folderInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
      e.target.value = '';
    });
    dom.fileInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
      e.target.value = '';
    });

    // Kéo thả thư mục (Drag & Drop)
    ['dragenter', 'dragover'].forEach(name => {
      window.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dom.emptyState.classList.add('drag-over');
      }, false);
    });

    ['dragleave', 'drop'].forEach(name => {
      window.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dom.emptyState.classList.remove('drag-over');
      }, false);
    });

    window.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    });

    // 6. Sự kiện thẻ Audio
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
      showToast('Lỗi: Định dạng file không thể phát trực tiếp!');
      pauseAudio();
    });

    // 7. Phím điều khiển phát nhạc
    dom.playPauseBtn.addEventListener('click', togglePlayPause);
    dom.nextBtn.addEventListener('click', () => nextTrack(false));
    dom.prevBtn.addEventListener('click', prevTrack);
    dom.shuffleBtn.addEventListener('click', toggleShuffle);
    dom.loopBtn.addEventListener('click', cycleLoopMode);

    // 8. Thanh tiến trình dây leo (Pointer Events)
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

    // 9. Thanh âm lượng & Mute
    dom.volumeSlider.addEventListener('input', (e) => setVolume(e.target.value));
    dom.muteBtn.addEventListener('click', toggleMute);

    // 10. Tìm kiếm bài hát trong playlist
    dom.searchInput.addEventListener('input', (e) => filterCards(e.target.value));
    dom.clearSearchBtn.addEventListener('click', () => {
      dom.searchInput.value = '';
      filterCards('');
    });

    // 11. Chuyển chế độ Visualizer mầm cây / sóng gió
    dom.visualizerModeBtn.addEventListener('click', () => {
      if (state.visualizerMode === 'bars') {
        state.visualizerMode = 'wave';
        dom.visModeLabel.textContent = '〰️ Sóng Gió';
      } else {
        state.visualizerMode === 'bars';
        dom.visModeLabel.textContent = '🌱 Mầm Cây';
      }
    });

    // 12. Phím tắt toàn cục
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

  // --- KHỞI ĐỘNG ---
  function init() {
    setVolume(0.8);
    dom.loopBtn.classList.add('active');
    initCanvas();
    setupEvents();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
