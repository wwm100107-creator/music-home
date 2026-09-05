/**
 * ============================================================================
 * ANTIGRAVITY • COSMIC WEB MUSIC PLAYER
 * Fullstack Audio Engine & UI Controller
 * ============================================================================
 */

(() => {
  'use strict';

  // --- HẰNG SỐ & ĐỊNH DẠNG HỖ TRỢ ---
  const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac', '.opus', '.weba'];

  // --- TRẠNG THÁI ỨNG DỤNG (STATE) ---
  const state = {
    playlist: [],          // Danh sách toàn bộ bài hát [{ id, file, name, title, artist, format, size, url }]
    filteredIndices: [],   // Danh sách index của bài hát đang hiển thị theo tìm kiếm
    currentIndex: -1,      // Vị trí bài hát hiện tại trong playlist
    isPlaying: false,
    volume: 0.8,
    previousVolume: 0.8,
    isMuted: false,
    loopMode: 'all',       // 'off' | 'all' | 'one'
    isShuffle: false,
    shuffleOrder: [],      // Thứ tự ngẫu nhiên của các index bài hát
    shufflePosition: 0,    // Vị trí hiện tại trong mảng shuffleOrder
    visualizerMode: 'bars',// 'bars' | 'wave'
    audioContextInitialized: false,
    isScrubbing: false     // Cờ khi đang kéo tua thanh tiến trình
  };

  // --- DOM ELEMENTS CACHE ---
  const dom = {
    audio: document.getElementById('audioElement'),
    folderInput: document.getElementById('folderInput'),
    fileInput: document.getElementById('fileInput'),
    
    // Vinyl & Stage
    vinylDisc: document.getElementById('vinylDisc'),
    visualizerCanvas: document.getElementById('visualizerCanvas'),
    visualizerModeBtn: document.getElementById('visualizerModeBtn'),
    visualizerModeText: document.getElementById('visualizerModeText'),
    
    // Metadata
    trackTitle: document.getElementById('trackTitle'),
    trackArtist: document.getElementById('trackArtist'),
    trackFormat: document.getElementById('trackFormat'),
    
    // Progress
    progressContainer: document.getElementById('progressContainer'),
    progressBar: document.getElementById('progressBar'),
    progressThumb: document.getElementById('progressThumb'),
    progressHoverTime: document.getElementById('progressHoverTime'),
    currentTime: document.getElementById('currentTime'),
    totalDuration: document.getElementById('totalDuration'),
    
    // Controls
    playPauseBtn: document.getElementById('playPauseBtn'),
    playIcon: document.getElementById('playIcon'),
    pauseIcon: document.getElementById('pauseIcon'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    loopBtn: document.getElementById('loopBtn'),
    loopBadge: document.getElementById('loopBadge'),
    
    // Volume
    muteBtn: document.getElementById('muteBtn'),
    volumeHighIcon: document.getElementById('volumeHighIcon'),
    volumeMutedIcon: document.getElementById('volumeMutedIcon'),
    volumeSlider: document.getElementById('volumeSlider'),
    volumePercent: document.getElementById('volumePercent'),
    
    // Playlist & Search
    playlistCount: document.getElementById('playlistCount'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    playlistContainer: document.getElementById('playlistContainer'),
    emptyState: document.getElementById('emptyState'),
    songList: document.getElementById('songList'),
    folderNameBadge: document.getElementById('folderNameBadge'),
    
    // Toast
    toast: document.getElementById('toast')
  };

  // --- WEB AUDIO API CHO VISUALIZER ---
  let audioCtx = null;
  let analyser = null;
  let audioSource = null;
  let dataArray = null;
  let canvasCtx = null;
  let animationFrameId = null;

  /**
   * Khởi tạo Web Audio API
   * Lưu ý: Trình duyệt yêu cầu cử chỉ của người dùng (click) trước khi AudioContext chạy
   */
  function initAudioContext() {
    if (state.audioContextInitialized) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      audioCtx = new AudioContextClass();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128; // 64 bins tần số mượt mà
      analyser.smoothingTimeConstant = 0.8;

      // Nối MediaElementAudioSourceNode từ thẻ <audio>
      audioSource = audioCtx.createMediaElementSource(dom.audio);
      audioSource.connect(analyser);
      analyser.connect(audioCtx.destination);

      const bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);

      state.audioContextInitialized = true;
    } catch (err) {
      console.warn('Web Audio API kết nối bị giới hạn hoặc chạy trên môi trường file tĩnh, tự động kích hoạt Visualizer mô phỏng:', err);
    }
  }

  /**
   * Vẽ Canvas Audio Visualizer
   */
  function initVisualizerCanvas() {
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
    if (canvasCtx) {
      canvasCtx.scale(dpr, dpr);
    }
  }

  let idlePhase = 0;
  function renderVisualizer() {
    animationFrameId = requestAnimationFrame(renderVisualizer);
    if (!canvasCtx) return;

    const width = dom.visualizerCanvas.getBoundingClientRect().width;
    const height = dom.visualizerCanvas.getBoundingClientRect().height;

    canvasCtx.clearRect(0, 0, width, height);

    let hasRealData = false;
    if (state.audioContextInitialized && analyser && state.isPlaying) {
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      if (state.visualizerMode === 'bars') {
        analyser.getByteFrequencyData(dataArray);
      } else {
        analyser.getByteTimeDomainData(dataArray);
      }
      hasRealData = true;
    }

    if (state.visualizerMode === 'bars') {
      // --- CHẾ ĐỘ 1: CỘT TẦN SỐ NEON ĐỐI XỨNG ---
      const barCount = 36;
      const barWidth = (width / barCount) * 0.65;
      const barSpacing = (width / barCount);
      const gradient = canvasCtx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, 'rgba(121, 40, 202, 0.1)');
      gradient.addColorStop(0.5, 'rgba(0, 242, 254, 0.6)');
      gradient.addColorStop(1, 'rgba(255, 0, 128, 0.9)');

      canvasCtx.fillStyle = gradient;

      for (let i = 0; i < barCount; i++) {
        let barHeight = 0;
        if (hasRealData && dataArray) {
          const sampleIndex = Math.floor((i / barCount) * (dataArray.length * 0.75));
          const val = dataArray[sampleIndex] || 0;
          barHeight = (val / 255) * (height * 0.65);
        } else if (state.isPlaying) {
          // Mô phỏng sóng âm sinh động nếu analyser bị hạn chế
          const wave = Math.sin(idlePhase + i * 0.3) * 0.5 + 0.5;
          barHeight = (wave * 0.4 + 0.1) * height;
        } else {
          // Trạng thái nghỉ (Idle glow)
          const idleWave = Math.sin(idlePhase * 0.5 + i * 0.2) * 0.5 + 0.5;
          barHeight = 4 + idleWave * 8;
        }

        const x = i * barSpacing + (barSpacing - barWidth) / 2;
        const y = height - barHeight;

        // Vẽ cột bo góc nhẹ ở đỉnh
        canvasCtx.beginPath();
        canvasCtx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
        canvasCtx.fill();
      }
    } else {
      // --- CHẾ ĐỘ 2: SÓNG DAO ĐỘNG OSCILLOSCOPE CYBERPUNK ---
      canvasCtx.beginPath();
      canvasCtx.lineWidth = 2.5;
      canvasCtx.strokeStyle = 'rgba(0, 242, 254, 0.85)';
      canvasCtx.shadowColor = '#00f2fe';
      canvasCtx.shadowBlur = 12;

      const sliceWidth = width / 40;
      let x = 0;

      for (let i = 0; i <= 40; i++) {
        let v = 0.5;
        if (hasRealData && dataArray) {
          const sampleIndex = Math.floor((i / 40) * dataArray.length);
          v = (dataArray[sampleIndex] || 128) / 255.0;
        } else if (state.isPlaying) {
          v = 0.5 + Math.sin(idlePhase * 2 + i * 0.4) * 0.25;
        } else {
          v = 0.5 + Math.sin(idlePhase + i * 0.15) * 0.05;
        }

        const y = v * height;
        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      canvasCtx.stroke();
      canvasCtx.shadowBlur = 0; // reset shadow
    }

    idlePhase += state.isPlaying ? 0.08 : 0.02;
  }

  // --- QUẢN LÝ DANH SÁCH & TẬP TIN NHẠC ---

  /**
   * Xử lý nạp FileList từ thẻ input hoặc sự kiện Drag & Drop
   * @param {FileList|File[]} fileList
   */
  function handleFiles(fileList) {
    if (!fileList || fileList.length === 0) return;

    const newTracks = [];
    let detectedFolder = '';

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileName = file.name.toLowerCase();

      // Kiểm tra file có đúng định dạng audio hỗ trợ không
      const isAudio = file.type.startsWith('audio/') || 
                      SUPPORTED_EXTENSIONS.some(ext => fileName.endsWith(ext));

      if (isAudio) {
        // Tách đường dẫn để lấy tên thư mục mẹ
        if (!detectedFolder && file.webkitRelativePath) {
          const parts = file.webkitRelativePath.split('/');
          if (parts.length > 1) {
            detectedFolder = parts[0];
          }
        }

        // Tạo metadata hiển thị
        const cleanTitle = cleanFileName(file.name);
        const format = getFileExtension(file.name).toUpperCase();
        const sizeFormatted = formatFileSize(file.size);

        newTracks.push({
          id: 'track_' + Date.now() + '_' + i,
          file: file,
          name: file.name,
          title: cleanTitle,
          artist: detectedFolder || 'Tập tin cục bộ',
          format: format || 'AUDIO',
          size: sizeFormatted,
          url: null // Sẽ tạo qua URL.createObjectURL khi phát
        });
      }
    }

    if (newTracks.length === 0) {
      showToast('Không tìm thấy file âm thanh hợp lệ trong thư mục!');
      return;
    }

    // Sắp xếp bài hát theo thứ tự bảng chữ cái tự nhiên (01, 02, 10...)
    newTracks.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    // Thu hồi bộ nhớ các ObjectURL cũ để tránh rò rỉ RAM (Memory Leak)
    state.playlist.forEach(track => {
      if (track.url) URL.revokeObjectURL(track.url);
    });

    state.playlist = newTracks;
    state.filteredIndices = state.playlist.map((_, index) => index);
    
    // Cập nhật giao diện thư mục
    if (detectedFolder) {
      dom.folderNameBadge.textContent = `Thư mục: ${detectedFolder}`;
    } else {
      dom.folderNameBadge.textContent = `Nguồn: ${newTracks.length} files`;
    }

    // Khởi tạo thứ tự Shuffle
    if (state.isShuffle) {
      buildShuffleOrder(0);
    }

    renderPlaylist();
    updatePlaylistCount();

    // Tự động load và phát bài đầu tiên
    loadTrack(0, true);
    showToast(`Đã nạp ${newTracks.length} bài hát thành công!`);
  }

  /**
   * Làm sạch tên file để hiển thị làm tiêu đề bài hát mượt mà
   */
  function cleanFileName(fileName) {
    const lastDot = fileName.lastIndexOf('.');
    let base = lastDot !== -1 ? fileName.substring(0, lastDot) : fileName;
    // Bỏ số thứ tự đầu bài hát ví dụ: "01. Song", "01 - Song"
    base = base.replace(/^\d+[\s.-]+/, '');
    // Thay thế dấu gạch dưới thành khoảng trắng
    base = base.replace(/_/g, ' ');
    return base.trim() || fileName;
  }

  function getFileExtension(fileName) {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot !== -1 ? fileName.substring(lastDot + 1) : '';
  }

  function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // --- ĐIỀU KHIỂN PHÁT NHẠC (AUDIO CONTROLS) ---

  /**
   * Nạp bài hát theo chỉ mục (Index)
   * Quản lý tạo/thu hồi URL.createObjectURL tối ưu bộ nhớ
   */
  function loadTrack(index, autoPlay = false) {
    if (index < 0 || index >= state.playlist.length) return;

    const track = state.playlist[index];

    // Thu hồi ObjectURL bài hát trước đó nếu có
    if (state.currentIndex >= 0 && state.currentIndex !== index) {
      const prevTrack = state.playlist[state.currentIndex];
      if (prevTrack && prevTrack.url) {
        URL.revokeObjectURL(prevTrack.url);
        prevTrack.url = null;
      }
    }

    state.currentIndex = index;

    // Tạo blob URL trực tiếp từ File
    if (!track.url) {
      track.url = URL.createObjectURL(track.file);
    }

    dom.audio.src = track.url;
    dom.audio.load();

    // Cập nhật thông tin giao diện
    dom.trackTitle.textContent = track.title;
    dom.trackTitle.title = track.name;
    dom.trackArtist.textContent = track.artist;
    dom.trackFormat.textContent = track.format;

    // Reset thanh tiến trình
    updateProgressBar(0, 0);

    // Cập nhật vị trí active trong danh sách phát
    updateActivePlaylistItem();

    if (autoPlay) {
      playAudio();
    } else {
      pauseAudio();
    }
  }

  function playAudio() {
    initAudioContext();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    dom.audio.play().then(() => {
      state.isPlaying = true;
      updatePlayPauseUI();
    }).catch(err => {
      console.warn('Trình duyệt chặn autoplay tự động trước tương tác người dùng:', err);
      state.isPlaying = false;
      updatePlayPauseUI();
    });
  }

  function pauseAudio() {
    dom.audio.pause();
    state.isPlaying = false;
    updatePlayPauseUI();
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

  function updatePlayPauseUI() {
    if (state.isPlaying) {
      dom.playIcon.classList.add('hidden');
      dom.pauseIcon.classList.remove('hidden');
      dom.vinylDisc.classList.add('playing');
    } else {
      dom.playIcon.classList.remove('hidden');
      dom.pauseIcon.classList.add('hidden');
      dom.vinylDisc.classList.remove('playing');
    }
  }

  /**
   * Chuyển sang bài tiếp theo (Next Track)
   * Tương thích hoàn hảo với chế độ Shuffle và Loop
   */
  function nextTrack(isAutoEnded = false) {
    if (state.playlist.length === 0) return;

    // Nếu đang bật chế độ lặp lại 1 bài và bài hát tự kết thúc
    if (isAutoEnded && state.loopMode === 'one') {
      dom.audio.currentTime = 0;
      dom.audio.play();
      return;
    }

    if (state.isShuffle) {
      state.shufflePosition++;
      if (state.shufflePosition >= state.shuffleOrder.length) {
        if (state.loopMode === 'all') {
          // Tạo lại mảng Shuffle mới để không bị lặp lại thứ tự cũ
          buildShuffleOrder();
          state.shufflePosition = 0;
        } else {
          // Dừng khi hết danh sách ngẫu nhiên
          pauseAudio();
          showToast('Đã phát hết danh sách bài hát!');
          return;
        }
      }
      const nextIdx = state.shuffleOrder[state.shufflePosition];
      loadTrack(nextIdx, true);
    } else {
      let nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.playlist.length) {
        if (state.loopMode === 'all') {
          nextIndex = 0;
        } else {
          pauseAudio();
          showToast('Đã phát hết danh sách bài hát!');
          return;
        }
      }
      loadTrack(nextIndex, true);
    }
  }

  /**
   * Quay lại bài trước đó (Previous Track)
   * Nếu đã nghe hơn 3 giây: tua về đầu bài. Nếu dưới 3s: quay lại bài trước.
   */
  function prevTrack() {
    if (state.playlist.length === 0) return;

    if (dom.audio.currentTime > 3) {
      dom.audio.currentTime = 0;
      return;
    }

    if (state.isShuffle) {
      if (state.shufflePosition > 0) {
        state.shufflePosition--;
        const prevIdx = state.shuffleOrder[state.shufflePosition];
        loadTrack(prevIdx, true);
      } else {
        dom.audio.currentTime = 0;
      }
    } else {
      let prevIndex = state.currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = state.playlist.length - 1;
      }
      loadTrack(prevIndex, true);
    }
  }

  // --- THUẬT TOÁN SHUFFLE & LOOP MODES ---

  /**
   * Thuật toán tráo bài Fisher-Yates Shuffling
   * Đảm bảo mọi hoán vị đều có xác suất bằng nhau, đồng thời giữ nguyên bài đang nghe ở vị trí số 0
   */
  function buildShuffleOrder(anchorCurrentIndex = state.currentIndex) {
    const total = state.playlist.length;
    if (total === 0) {
      state.shuffleOrder = [];
      return;
    }

    const indices = [];
    for (let i = 0; i < total; i++) {
      if (i !== anchorCurrentIndex) indices.push(i);
    }

    // Fisher-Yates Shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // Đặt bài hiện tại lên đầu mảng shuffleOrder
    if (anchorCurrentIndex >= 0 && anchorCurrentIndex < total) {
      indices.unshift(anchorCurrentIndex);
    }

    state.shuffleOrder = indices;
    state.shufflePosition = 0;
  }

  function toggleShuffle() {
    state.isShuffle = !state.isShuffle;
    if (state.isShuffle) {
      buildShuffleOrder(state.currentIndex);
      dom.shuffleBtn.classList.add('active');
      showToast('Chế độ phát ngẫu nhiên: Bật');
    } else {
      dom.shuffleBtn.classList.remove('active');
      showToast('Chế độ phát ngẫu nhiên: Tắt');
    }
  }

  /**
   * Chuyển đổi 3 trạng thái Lặp lại:
   * 'off' (Tắt) -> 'all' (Lặp toàn bộ) -> 'one' (Lặp 1 bài) -> 'off'
   */
  function cycleLoopMode() {
    if (state.loopMode === 'all') {
      state.loopMode = 'one';
      dom.loopBtn.classList.add('active', 'loop-one');
      showToast('Lặp lại bài hát hiện tại');
    } else if (state.loopMode === 'one') {
      state.loopMode = 'off';
      dom.loopBtn.classList.remove('active', 'loop-one');
      showToast('Không lặp lại');
    } else {
      state.loopMode = 'all';
      dom.loopBtn.classList.add('active');
      dom.loopBtn.classList.remove('loop-one');
      showToast('Lặp lại toàn bộ danh sách');
    }
  }

  // --- THANH TIẾN TRÌNH & VOLUME ---

  function updateProgressBar(current, duration) {
    const percent = duration > 0 ? (current / duration) * 100 : 0;
    dom.progressBar.style.width = `${percent}%`;
    dom.progressThumb.style.left = `${percent}%`;
    dom.currentTime.textContent = formatTime(current);
    dom.totalDuration.textContent = formatTime(duration);
  }

  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function seekByMouseEvent(e) {
    const rect = dom.progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    if (dom.audio.duration) {
      dom.audio.currentTime = ratio * dom.audio.duration;
      updateProgressBar(dom.audio.currentTime, dom.audio.duration);
    }
  }

  function handleVolumeChange(val) {
    state.volume = Math.max(0, Math.min(1, parseFloat(val)));
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
      handleVolumeChange(state.previousVolume > 0 ? state.previousVolume : 0.5);
    } else {
      state.previousVolume = state.volume;
      handleVolumeChange(0);
    }
  }

  // --- DANH SÁCH PHÁT (PLAYLIST UI) ---

  function renderPlaylist() {
    if (state.playlist.length === 0) {
      dom.emptyState.classList.remove('hidden');
      dom.songList.innerHTML = '';
      return;
    }

    dom.emptyState.classList.add('hidden');
    const fragment = document.createDocumentFragment();

    state.filteredIndices.forEach((playlistIndex, displayIndex) => {
      const track = state.playlist[playlistIndex];
      const li = document.createElement('li');
      li.className = 'song-item' + (playlistIndex === state.currentIndex ? ' active' : '');
      li.dataset.index = playlistIndex;

      li.innerHTML = `
        <div class="song-main-info">
          <div class="song-index">
            <span class="song-index-text">${displayIndex + 1}</span>
            <div class="eq-bars">
              <span class="eq-bar"></span>
              <span class="eq-bar"></span>
              <span class="eq-bar"></span>
            </div>
          </div>
          <div class="song-text-meta">
            <span class="song-name" title="${track.name}">${track.title}</span>
            <div class="song-sub">${track.size} • ${track.format}</div>
          </div>
        </div>
        <span class="song-side-badge">${track.format}</span>
      `;

      li.addEventListener('click', () => {
        loadTrack(playlistIndex, true);
      });

      fragment.appendChild(li);
    });

    dom.songList.innerHTML = '';
    dom.songList.appendChild(fragment);
  }

  function updateActivePlaylistItem() {
    const items = dom.songList.querySelectorAll('.song-item');
    items.forEach(item => {
      const idx = parseInt(item.dataset.index, 10);
      if (idx === state.currentIndex) {
        item.classList.add('active');
        // Cuộn mượt mà đưa bài hát đang phát vào tầm nhìn
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        item.classList.remove('active');
      }
    });
  }

  function updatePlaylistCount() {
    const count = state.playlist.length;
    dom.playlistCount.textContent = `${count} bài hát`;
  }

  function filterPlaylist(keyword) {
    const query = keyword.trim().toLowerCase();
    if (!query) {
      state.filteredIndices = state.playlist.map((_, i) => i);
      dom.clearSearchBtn.classList.add('hidden');
    } else {
      dom.clearSearchBtn.classList.remove('hidden');
      state.filteredIndices = state.playlist
        .map((track, i) => ({ track, i }))
        .filter(({ track }) => track.name.toLowerCase().includes(query) || track.title.toLowerCase().includes(query))
        .map(({ i }) => i);
    }
    renderPlaylist();
  }

  // --- TOAST NOTIFICATIONS ---
  let toastTimeout = null;
  function showToast(message) {
    clearTimeout(toastTimeout);
    dom.toast.textContent = message;
    dom.toast.classList.remove('hidden');
    toastTimeout = setTimeout(() => {
      dom.toast.classList.add('hidden');
    }, 2400);
  }

  // --- SỰ KIỆN LẮNG NGHE (EVENT LISTENERS) ---

  function setupEventListeners() {
    // 1. File & Folder Import
    dom.folderInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
      e.target.value = ''; // Reset để có thể chọn lại cùng folder
    });

    dom.fileInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
      e.target.value = '';
    });

    // Drag and drop trên toàn trang & playlist container
    ['dragenter', 'dragover'].forEach(eventName => {
      window.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dom.emptyState.classList.add('drag-over');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      window.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dom.emptyState.classList.remove('drag-over');
      }, false);
    });

    window.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        handleFiles(dt.files);
      }
    });

    // 2. Audio Element Events
    dom.audio.addEventListener('timeupdate', () => {
      if (!state.isScrubbing && dom.audio.duration) {
        updateProgressBar(dom.audio.currentTime, dom.audio.duration);
      }
    });

    dom.audio.addEventListener('loadedmetadata', () => {
      updateProgressBar(dom.audio.currentTime, dom.audio.duration);
    });

    dom.audio.addEventListener('ended', () => {
      nextTrack(true);
    });

    dom.audio.addEventListener('error', (e) => {
      console.error('Lỗi khi phát tập tin âm thanh:', e);
      showToast('Không thể phát file này (định dạng không hỗ trợ hoặc file bị lỗi)!');
      pauseAudio();
    });

    // 3. Player Control Buttons
    dom.playPauseBtn.addEventListener('click', togglePlayPause);
    dom.nextBtn.addEventListener('click', () => nextTrack(false));
    dom.prevBtn.addEventListener('click', prevTrack);
    dom.shuffleBtn.addEventListener('click', toggleShuffle);
    dom.loopBtn.addEventListener('click', cycleLoopMode);

    // 4. Seeking & Progress Bar Interaction
    dom.progressContainer.addEventListener('mousedown', (e) => {
      state.isScrubbing = true;
      seekByMouseEvent(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (state.isScrubbing) {
        seekByMouseEvent(e);
      }
    });

    window.addEventListener('mouseup', () => {
      state.isScrubbing = false;
    });

    // Tooltip thời gian khi hover trên thanh tiến trình
    dom.progressContainer.addEventListener('mousemove', (e) => {
      const rect = dom.progressContainer.getBoundingClientRect();
      const hoverX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, hoverX / rect.width));
      if (dom.audio.duration) {
        const hoverSecs = ratio * dom.audio.duration;
        dom.progressHoverTime.textContent = formatTime(hoverSecs);
        dom.progressHoverTime.style.left = `${hoverX}px`;
        dom.progressHoverTime.style.opacity = '1';
      }
    });

    dom.progressContainer.addEventListener('mouseleave', () => {
      dom.progressHoverTime.style.opacity = '0';
    });

    // 5. Volume Slider & Mute
    dom.volumeSlider.addEventListener('input', (e) => {
      handleVolumeChange(e.target.value);
    });

    dom.muteBtn.addEventListener('click', toggleMute);

    // 6. Search Input
    dom.searchInput.addEventListener('input', (e) => {
      filterPlaylist(e.target.value);
    });

    dom.clearSearchBtn.addEventListener('click', () => {
      dom.searchInput.value = '';
      filterPlaylist('');
    });

    // 7. Visualizer Mode Switch
    dom.visualizerModeBtn.addEventListener('click', () => {
      if (state.visualizerMode === 'bars') {
        state.visualizerMode = 'wave';
        dom.visualizerModeText.textContent = 'Sóng Laser';
      } else {
        state.visualizerMode = 'bars';
        dom.visualizerModeText.textContent = 'Sóng Cột';
      }
    });

    // 8. Global Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Bỏ qua khi người dùng đang gõ trong ô tìm kiếm
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
          handleVolumeChange(Math.min(1, state.volume + 0.05));
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(Math.max(0, state.volume - 0.05));
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

  // --- KHỞI CHẠY ỨNG DỤNG ---
  function init() {
    handleVolumeChange(0.8);
    // Khởi tạo mặc định Loop All
    dom.loopBtn.classList.add('active');
    initVisualizerCanvas();
    setupEventListeners();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
