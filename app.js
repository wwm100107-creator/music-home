/**
 * ============================================================================
 * MUSIC HOME • STUDIO GHIBLI & MY NEIGHBOR TOTORO SOUND STATION
 * 100% Offline Engine • Pure Vanilla ES6 • Zero External Dependencies
 * ============================================================================
 * 
 * HỆ THỐNG SKILLS ĐƯỢC TÍCH HỢP TRONG MODULE NÀY:
 * - [SKILL: /animate] : Kích hoạt hiệu ứng đom đóm phát sáng bay lên khi phát nhạc, đĩa thân cây quay.
 * - [SKILL: /improve-animations] : Điều khiển chuyển động cần gạt nhánh cây (Twig Tonearm), búp mầm đung đưa.
 * - [SKILL: /animation-vocabulary] : Cơ chế nảy nhún (Susuwatari Bounce) và Direct Manipulation cho chú Bọ Rùa (Ladybug Thumb).
 * - [SKILL: /impeccable & /redesign-existing-projects] : Xử lý dữ liệu mộc mạc, bố cục tự nhiên, dọn dẹp RAM triệt để.
 * - [SKILL: /ponytail & /ponytail-help] : Logic lõi gọn gàng, tối giản (YAGNI), bảo đảm hoạt động 100% không bug trên file://.
 */

(() => {
  'use strict';

  // --- HẰNG SỐ ĐỊNH DẠNG ÂM THANH HỖ TRỢ (100% OFFLINE) ---
  const SUPPORTED_AUDIO_EXT = ['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac', '.opus', '.weba'];

  // --------------------------------------------------------------------------
  // [SKILL: /ponytail] STATE MANAGEMENT: Quản lý trạng thái bài hát gọn gàng
  // --------------------------------------------------------------------------
  const state = {
    playlist: [],           // Danh sách bài hát [{ id, file, name, title, artist, format, size, url }]
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
    isScrubbing: false      // Cờ rê kéo chú bọ rùa
  };

  // --- DOM ELEMENTS CACHE ---
  const dom = {
    audio: document.getElementById('audioElement'),
    folderInput: document.getElementById('folderInput'),
    fileInput: document.getElementById('fileInput'),
    
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
      // --- Chế độ 1: Búp mầm cây mọc vươn lên (Nature Sprout Bars) ---
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

        // Gradient màu mầm lá xanh Totoro
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
      // --- Chế độ 2: Làn sóng gió đồng cỏ (Meadow Breeze Wave) ---
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
          url: null // Tạo URL khi phát
        });
      }
    }

    if (newTracks.length === 0) {
      showToast('Không tìm thấy file nhạc hợp lệ (.mp3, .wav, .flac)!');
      return;
    }

    // Sắp xếp tự nhiên theo tên bài
    newTracks.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    // [SKILL: /impeccable] Dọn dẹp URL cũ tránh rò rỉ RAM
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

    // Giải phóng bộ nhớ bài trước
    if (state.currentIndex >= 0 && state.currentIndex !== index) {
      const prev = state.playlist[state.currentIndex];
      if (prev && prev.url) {
        URL.revokeObjectURL(prev.url);
        prev.url = null;
      }
    }

    state.currentIndex = index;

    if (!track.url) {
      track.url = URL.createObjectURL(track.file);
    }

    dom.audio.src = track.url;
    dom.audio.load();

    // Cập nhật cuộn giấy da
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
      dom.twigTonearm.classList.add('active'); // Cần gạt nhánh cây hạ xuống
      document.body.classList.add('music-playing'); // [SKILL: /animate] Bật đom đóm bay lên
      dom.playStatusText.textContent = 'ĐANG PHÁT';
      dom.playStatusText.style.color = 'var(--leaf-bright)';
      dom.leafIndicator.textContent = '🍃';
    } else {
      dom.playIcon.classList.remove('hidden');
      dom.pauseIcon.classList.add('hidden');
      dom.trunkRecord.classList.remove('playing');
      dom.twigTonearm.classList.remove('active'); // Cần gạt nhánh cây nhấc lên
      document.body.classList.remove('music-playing'); // Tắt đom đóm
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
    // Thuật toán Fisher-Yates chuẩn
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
  // [SKILL: /animation-vocabulary] THANH DÂY LEO & CHÚ BỌ RÙA (DIRECT MANIPULATION)
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
            <div class="card-subtext">${track.size} • ${track.format}</div>
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
    }, 2400);
  }

  // --------------------------------------------------------------------------
  // TƯƠNG TÁC SỰ KIỆN (EVENT LISTENERS)
  // --------------------------------------------------------------------------
  function setupEvents() {
    // 1. Nhập thư mục và file nhạc
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

    // 2. Sự kiện thẻ Audio
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

    // 3. Phím điều khiển phát nhạc
    dom.playPauseBtn.addEventListener('click', togglePlayPause);
    dom.nextBtn.addEventListener('click', () => nextTrack(false));
    dom.prevBtn.addEventListener('click', prevTrack);
    dom.shuffleBtn.addEventListener('click', toggleShuffle);
    dom.loopBtn.addEventListener('click', cycleLoopMode);

    // 4. Thanh tiến trình dây leo (Pointer Events)
    dom.progressContainer.addEventListener('pointerdown', (e) => {
      state.isScrubbing = true;
      dom.progressContainer.setPointerCapture(e.pointerId);
      seekByPointer(e);
    });

    dom.progressContainer.addEventListener('pointermove', (e) => {
      if (state.isScrubbing) {
        seekByPointer(e);
      }
      // Bong bóng xem trước thời gian
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

    // 5. Thanh âm lượng & Mute
    dom.volumeSlider.addEventListener('input', (e) => setVolume(e.target.value));
    dom.muteBtn.addEventListener('click', toggleMute);

    // 6. Tìm kiếm bài hát
    dom.searchInput.addEventListener('input', (e) => filterCards(e.target.value));
    dom.clearSearchBtn.addEventListener('click', () => {
      dom.searchInput.value = '';
      filterCards('');
    });

    // 7. Chuyển chế độ Visualizer mầm cây / sóng gió
    dom.visualizerModeBtn.addEventListener('click', () => {
      if (state.visualizerMode === 'bars') {
        state.visualizerMode = 'wave';
        dom.visModeLabel.textContent = '〰️ Sóng Gió';
      } else {
        state.visualizerMode = 'bars';
        dom.visModeLabel.textContent = '🌱 Mầm Cây';
      }
    });

    // 8. Phím tắt toàn cục
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
    dom.loopBtn.classList.add('active'); // Mặc định lặp toàn bộ
    initCanvas();
    setupEvents();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
