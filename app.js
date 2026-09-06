/**
 * ============================================================================
 * MUSIC HOME • STUDIO GHIBLI & MY NEIGHBOR TOTORO SOUND STATION
 * Pixel-Perfect Implementation of GIAODIEN.png
 * Local Folder Player + Cobalt Audio API Downloader + Supabase Cloud Sync
 * ============================================================================
 * 
 * HỆ THỐNG SKILLS ĐƯỢC TÍCH HỢP TOÀN DIỆN:
 * - [SKILL: /image-to-code-skill] : Tái hiện chuẩn xác 100% bố cục GIAODIEN.png:
 *     1. Background video động toàn màn hình (background.mp4)
 *     2. Left Sidebar kính mờ (rgba xanh ngọc + blur) với thanh gỗ wood_2.png active
 *     3. Main Content: Grid 6 Playlist Cards bo góc tròn mộc mạc
 *     4. Bottom Player: Đĩa phát gỗ, thanh lượn sóng SVG xanh lá & cục chạy Calcifer (f.jpg)
 * - [SKILL: /impeccable] : Typography Ghibli, text-stroke, drop-shadow, viền mềm mại, mix-blend-mode: multiply
 * - [SKILL: /animate] : Calcifer breathing keyframes, wavy progress surfing, Susuwatari crew kéo nốt nhạc
 * - [SKILL: /ponytail & /ponytail-help] : Cobalt API Ultra-fast Audio Streamer & Downloader (YAGNI, minimal code)
 */

(() => {
  'use strict';

  // --- HẰNG SỐ ĐỊNH DẠNG ÂM THANH HỖ TRỢ ---
  const SUPPORTED_AUDIO_EXT = ['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac', '.opus', '.weba'];

  // [SKILL: /ponytail] BẢO MẬT DOM XSS: Chống tiêm mã độc qua tên bài hát / metadata
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
  }

  // --------------------------------------------------------------------------
  // [SKILL: /ponytail] STATE MANAGEMENT: Quản lý trạng thái bài hát
  // Bắt đầu với danh sách trống vì người dùng chưa thêm bài hát nào
  // --------------------------------------------------------------------------
  const state = {
    playlist: [],           // Danh sách bài hát (khởi tạo trống theo yêu cầu)
    filteredIndices: [],
    currentIndex: -1,       // Chưa phát bài nào khi mới vào
    isPlaying: false,
    volume: 0.8,
    previousVolume: 0.8,
    isMuted: false,
    loopMode: 'all',        // 'off' | 'all' | 'one' | 'custom'
    selectedLoopTrackIds: new Set(),
    isShuffle: false,
    shuffleOrder: [],
    shufflePosition: 0,
    isScrubbing: false,     // Cờ rê kéo chú lửa Calcifer

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
    authModalTriggerBtn: document.getElementById('authModalTriggerBtn'),
    syncStatusIcon: document.getElementById('syncStatusIcon'),
    userAuthBadgeText: document.getElementById('userAuthBadgeText'),
    profileAvatarBtn: document.getElementById('profileAvatarBtn'),

    // Left Sidebar Segmented Control & Sliding Toggle Switch
    woodSliderSwitch: document.getElementById('woodSliderSwitch'),
    sidebarNavList: document.getElementById('sidebarNavList'),
    sidebarNavItems: document.querySelectorAll('.sidebar-nav-item'),

    // Main Content Playlist Cards & Grid
    playlistsGrid: document.getElementById('playlistsGrid'),
    playlistsEmptyState: document.getElementById('playlistsEmptyState'),

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
          cover: '', // Thumbnail để trống theo yêu cầu của user (sẽ xử lý sau)
          format: getExtension(file.name).toUpperCase() || 'AUDIO',
          size: formatBytes(file.size),
          url: null
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
      // [SKILL: /ponytail] Chỉ revoke blob URL tạm thời từ File cục bộ, bảo tồn nguyên vẹn URL stream từ Cobalt / Cloud
      if (prev && prev.url && prev.file && typeof prev.url === 'string' && prev.url.startsWith('blob:')) {
        URL.revokeObjectURL(prev.url);
        prev.url = null;
      }
    }

    state.currentIndex = index;

    // Cập nhật giao diện Now Playing góc trái chuẩn GIAODIEN.png
    if (track.youtubeId) {
      applyYouTubeThumbnailCover(track.youtubeId);
    } else if (dom.currentTrackCover) {
      dom.currentTrackCover.onerror = null;
      dom.currentTrackCover.classList.remove('cover-fade-in');
      dom.currentTrackCover.src = track.cover || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><rect width='64' height='64' rx='12' fill='%232b3d2b'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-size='24' fill='%23fefae0'>🎵</text></svg>";
      dom.currentTrackCover.alt = track.title;
    }
    if (dom.trackTitle) {
      dom.trackTitle.textContent = track.title;
      dom.trackTitle.title = track.name;
    }
    if (dom.trackArtist) {
      dom.trackArtist.textContent = track.artist || 'Giai điệu Ghibli';
    }
    if (dom.trackAlbum) {
      dom.trackAlbum.textContent = track.album || '';
    }
    if (dom.trackFormat) {
      dom.trackFormat.textContent = track.format || 'AUDIO';
    }

    // Highlight Playlist Card đang phát
    highlightActivePlaylistCard();

    // Xử lý Audio Source

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
    if (dom.calciferFlame && dom.calciferFlame.paused && typeof dom.calciferFlame.play === 'function') {
      dom.calciferFlame.play().catch(() => {});
    }
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
  // --------------------------------------------------------------------------
  // DANH SÁCH BÀI HÁT THẺ LÁ GIẤY MỘC & CUSTOM LOOP DRAWER
  // --------------------------------------------------------------------------
  function renderDrawerList() {
    if (!dom.songList) return;
    if (state.playlist.length === 0) {
      if (dom.emptyState) dom.emptyState.classList.remove('hidden');
      dom.songList.innerHTML = '';
      return;
    }

    if (dom.emptyState) dom.emptyState.classList.add('hidden');
    const frag = document.createDocumentFragment();

    state.filteredIndices.forEach((playlistIdx, displayIdx) => {
      const track = state.playlist[playlistIdx];
      if (!track) return;
      const li = document.createElement('li');
      li.className = 'nature-song-card' + (playlistIdx === state.currentIndex ? ' active' : '');
      li.dataset.index = playlistIdx;

      const safeId = escapeHtml(track.id);
      const safeTitle = escapeHtml(track.title);
      const safeName = escapeHtml(track.name);
      const safeArtist = escapeHtml(track.artist || 'Giai điệu Ghibli');
      const safeSize = escapeHtml(track.size || '');
      const safeFormat = escapeHtml(track.format || 'AUDIO');

      li.innerHTML = `
        <div class="card-left-group">
          <label class="acorn-checkbox-wrapper" title="Tích chọn bài này để lặp Hạt Dẻ 🌰">
            <input type="checkbox" class="acorn-checkbox-input" data-id="${safeId}" ${isAcornChecked ? 'checked' : ''}>
            <span class="acorn-checkbox-icon"></span>
          </label>
          <div class="leaf-num-stamp">${displayIdx + 1}</div>
          <div class="card-song-details">
            <span class="card-title" title="${safeName}">${safeTitle}</span>
            <div class="card-subtext">${safeArtist} • ${safeSize} ${track.isCobalt ? '🕊️ Cobalt' : ''}</div>
          </div>
        </div>
        <span class="card-leaf-badge">${safeFormat}</span>
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

  // --------------------------------------------------------------------------
  // [SKILL: /image-to-code-skill & /impeccable & /ponytail]
  // RENDER DYNAMIC PLAYLISTS GRID TẠI MAIN CONTENT
  // Giữ nguyên cách trình bày thẻ vuông bo góc tròn mềm mại từ GIAODIEN.png,
  // Thumbnail để trống theo yêu cầu chờ người dùng đưa phương án xử lý sau.
  // --------------------------------------------------------------------------
  function renderPlaylistsGrid() {
    if (!dom.playlistsGrid) return;

    if (state.playlist.length === 0) {
      dom.playlistsGrid.innerHTML = '';
      if (dom.playlistsEmptyState) dom.playlistsEmptyState.classList.remove('hidden');
      return;
    }

    if (dom.playlistsEmptyState) dom.playlistsEmptyState.classList.add('hidden');
    const frag = document.createDocumentFragment();

    state.filteredIndices.forEach((playlistIdx) => {
      const track = state.playlist[playlistIdx];
      if (!track) return;

      const card = document.createElement('div');
      card.className = 'playlist-card' + (playlistIdx === state.currentIndex ? ' active' : '');
      card.dataset.index = playlistIdx;

      const safeDisplayTitle = escapeHtml(track.title || track.name);

      // Thumbnail để trống theo yêu cầu
      card.innerHTML = `
        <div class="card-art-box">
          <div class="card-cover-empty" title="Thumbnail để trống">
            <span class="empty-thumb-symbol">🎵</span>
          </div>
          <button class="card-hover-play" title="Phát bài này">
            <span class="play-arrow">▶</span>
          </button>
        </div>
        <h3 class="card-title-text" title="${safeDisplayTitle}">${safeDisplayTitle}</h3>
      `;

      card.addEventListener('click', () => {
        loadTrack(playlistIdx, true);
      });

      const playBtn = card.querySelector('.card-hover-play');
      if (playBtn) {
        playBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          loadTrack(playlistIdx, true);
        });
      }

      frag.appendChild(card);
    });

    dom.playlistsGrid.innerHTML = '';
    dom.playlistsGrid.appendChild(frag);
  }

  function renderPlaylist() {
    renderDrawerList();
    renderPlaylistsGrid();
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

  function highlightActivePlaylistCard() {
    if (!dom.playlistsGrid) return;
    const cards = dom.playlistsGrid.querySelectorAll('.playlist-card');
    cards.forEach(card => {
      const cardIdx = parseInt(card.dataset.index, 10);
      if (cardIdx === state.currentIndex) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
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
  // [SKILL: /animate & /improve-animations]
  // SEGMENTED CONTROL: HỆ THỐNG THANH TRƯỢT TẤM GỖ (WOODEN SLIDING SWITCH)
  // ==========================================================================

  /**
   * Tính toán vị trí offsetTop và clientHeight của thẻ <li> được click,
   * sau đó áp dụng vào CSS transform: translateY() và height của thanh gỗ duy nhất.
   * 
   * @param {HTMLElement} targetItem Thẻ <li> được người dùng chọn
   * @param {boolean} animate Có áp dụng hiệu ứng chuyển động trượt 0.4s hay không
   */
  function moveWoodSliderToItem(targetItem, animate = true) {
    if (!targetItem || !dom.woodSliderSwitch) return;

    // 1. Tính toán vị trí tương đối offsetTop
    const offsetTop = targetItem.offsetTop;

    // 2. Thiết lập đường cong chuyển động theo yêu cầu:
    // transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)
    if (!animate) {
      dom.woodSliderSwitch.style.transition = 'none';
    } else {
      dom.woodSliderSwitch.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s ease';
    }

    // 3. Apply giá trị vị trí translateY vào thanh gỗ trượt
    dom.woodSliderSwitch.style.transform = `translateY(${offsetTop}px)`;
    dom.woodSliderSwitch.style.opacity = '1';

    if (!animate) {
      // Force reflow để phục hồi lại transition mượt cho các lần click kế tiếp
      void dom.woodSliderSwitch.offsetHeight;
      dom.woodSliderSwitch.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s ease';
    }

    // 4. [SKILL: /impeccable & /animate] Cập nhật class 'active':
    // Kích hoạt scale(1.06) cho Icon và Text, đồng bộ thời gian với thanh trượt và nằm lọt thỏm cân đối
    const items = document.querySelectorAll('.sidebar-nav-item');
    items.forEach(item => {
      if (item === targetItem) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // ==========================================================================
  // [SKILL: /ponytail] SMART SEARCH BAR: INPUT DETECTION (KEYWORD vs URL)
  // ==========================================================================
  const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|v\/|embed\/|playlist\?|live\/)|youtu\.be\/)[\w-]{11}/i;
  const TIKTOK_REGEX = /^(https?:\/\/)?(www\.)?(tiktok\.com\/(@[\w.-]+\/video\/\d+|v\/\d+|\w+))/i;
  const GENERAL_URL_REGEX = /^https?:\/\/[^\s$.?#].[^\s]*$/i;

  /**
   * 1. [SKILL: /ponytail] Bóc tách YouTube Video ID từ mọi định dạng link YouTube
   * Hỗ trợ chuẩn: youtube.com/watch?v=, youtu.be/, youtube.com/shorts/, youtube.com/embed/, youtube.com/live/
   * 
   * @param {string} url Đường dẫn cần bóc tách
   * @returns {string|null} Video ID 11 ký tự hoặc null
   */
  function extractYouTubeID(url) {
    if (!url || typeof url !== 'string') return null;
    const match = url.trim().match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i);
    return match ? match[1] : null;
  }

  /**
   * 2, 3, 4, 5. [SKILL: /animate & /impeccable] TỰ ĐỘNG HIỂN THỊ THUMBNAIL (COVER ART)
   * - Tạo đường dẫn: https://img.youtube.com/vi/{VIDEO_ID}/maxresdefault.jpg (fallback hqdefault.jpg)
   * - Thay thế src của thẻ chứa Cover Art (#currentTrackCover)
   * - Thêm hiệu ứng fade-in mượt mà (khoảng 0.5s) bằng CSS animation
   * - Cập nhật Text: Điền chữ "YouTube Stream" vào vị trí tên Tác giả/Ca sĩ
   * 
   * @param {string} videoId ID 11 ký tự của video YouTube
   */
  function applyYouTubeThumbnailCover(videoId) {
    if (!videoId) return;
    const maxResUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const hqUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    // 5. Cập nhật Text: Điền chữ "YouTube Stream" vào vị trí Tác giả/Ca sĩ
    if (dom.trackArtist) {
      dom.trackArtist.textContent = 'YouTube Stream';
    }

    if (!dom.currentTrackCover) return;

    // Thiết lập fallback onerror nếu maxresdefault không tồn tại (lỗi 404)
    dom.currentTrackCover.onerror = function() {
      if (this.src !== hqUrl) {
        this.src = hqUrl;
      }
    };

    // 4. [SKILL: /animate] Kích hoạt fade-in 0.5s mượt mà (cubic-bezier(0.23, 1, 0.32, 1))
    const displayCoverWithFade = (finalUrl) => {
      dom.currentTrackCover.classList.remove('cover-fade-in');
      void dom.currentTrackCover.offsetWidth; // Force reflow để trigger animation
      dom.currentTrackCover.src = finalUrl;
      dom.currentTrackCover.alt = 'YouTube Cover Art';
      dom.currentTrackCover.classList.add('cover-fade-in');
    };

    // 2. Preload kiểm tra maxresdefault (YouTube thường trả placeholder 120x90 nếu thiếu maxres)
    const testImg = new Image();
    testImg.src = maxResUrl;
    testImg.onload = () => {
      if (testImg.naturalWidth > 120) {
        displayCoverWithFade(maxResUrl);
      } else {
        displayCoverWithFade(hqUrl);
      }
    };
    testImg.onerror = () => {
      displayCoverWithFade(hqUrl);
    };
  }

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
   * Chuyển đổi mượt mà giữa Icon kính lúp (Keyword) và Icon chim bồ câu đưa thư 🕊️ (URL).
   * Ngay khi nhận diện URL là YouTube, lập tức hiển thị Thumbnail lên Now Playing với hiệu ứng fade-in.
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

          // Ngay khi nhận diện được URL là của YouTube, lập tức áp dụng Thumbnail và Text
          const yId = extractYouTubeID(query);
          if (yId && yId !== state.currentYouTubeId) {
            state.currentYouTubeId = yId;
            applyYouTubeThumbnailCover(yId);
            if (dom.trackTitle && (dom.trackTitle.textContent === 'Chưa có bài hát nào' || dom.trackTitle.textContent === '')) {
              dom.trackTitle.textContent = 'YouTube Audio';
            }
          }
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
  // // TODO: [SKILL: /ponytail & /ponytail-help] COBALT API ULTRA-FAST AUDIO STREAMER & DOWNLOADER
  // Viết hàm fetch gọi đến Cobalt API (https://api.cobalt.tools/api/json)
  // Cấu hình request: 
  //   method: 'POST'
  //   headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
  //   body: JSON.stringify({ url: "link_cua_user", isAudioOnly: true })
  // Xử lý Response: Lấy Direct Stream URL nạp thẳng vào <audio src="..."> để phát ngay lập tức.
  // Đồng thời dùng File System Access API (showSaveFilePicker) ngầm lưu file audio vào thư mục Local.
  // Xử lý Loading: Cục than Susuwatari kéo nốt nhạc bằng CSS. Bắt lỗi try/catch cẩn thận nếu API sập.
  // ==========================================================================
  // ==========================================================================
  // [SKILL: /ponytail & /impeccable] COBALT API AUDIO STREAMER & DOWNLOADER
  // Tích hợp CORS Proxy, cấu hình Headers chuẩn, cập nhật Payload theo spec
  // Chi tiết console.log() để debug và cảnh báo alert() thân thiện kiểu Ghibli
  // ==========================================================================
  async function fetchCobaltAudio(userUrl) {
    const cleanUrl = (userUrl || '').trim();
    if (!cleanUrl) return;

    // [SKILL: /animate] Bật hiệu ứng Loading: Cục than Susuwatari kéo nốt nhạc
    setSearchLoading(
      true,
      'Bầy Susuwatari đang kéo nốt nhạc từ Cobalt... 🎵✨',
      'Đang gửi bồ câu bưu chính tới máy chủ Cobalt để trích xuất âm thanh MP3'
    );

    let trackTitle = 'Giai Điệu Ghibli Trực Tuyến';
    let trackArtist = 'YouTube Stream';
    const ytId = extractYouTubeID(cleanUrl);
    let trackCover = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '';

    // Bước 1 (Thumbnail): Tách Video ID từ YouTube link và áp dụng ngay Now Playing với fade-in
    if (ytId) {
      applyYouTubeThumbnailCover(ytId);
    }

    try {
      // 1. Thu thập metadata nhanh từ oEmbed để lấy tên bài hát & nghệ sĩ chính xác
      try {
        if (/youtube\.com|youtu\.be/i.test(cleanUrl)) {
          const oeRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`);
          if (oeRes.ok) {
            const meta = await oeRes.json();
            if (meta.title) trackTitle = meta.title;
            trackArtist = 'YouTube Stream';
          }
        } else if (/tiktok\.com/i.test(cleanUrl)) {
          const oeRes = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(cleanUrl)}`);
          if (oeRes.ok) {
            const meta = await oeRes.json();
            if (meta.title) trackTitle = meta.title;
            if (meta.author_name) trackArtist = meta.author_name;
          }
        }
      } catch (metaErr) {
        console.warn('Metadata oEmbed notice:', metaErr);
      }

      if (dom.loaderStatusTitle) {
        dom.loaderStatusTitle.textContent = `Bầy Susuwatari đang kéo: "${trackTitle.slice(0, 32)}..."`;
      }

      // 2. Chuẩn hóa Headers và Payload chuẩn Cobalt API (hỗ trợ cả spec v7 và v10)
      const requestHeaders = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      const cobaltPayload = {
        url: cleanUrl,
        aFormat: 'mp3',
        isAudioOnly: true,
        downloadMode: 'audio',
        audioFormat: 'mp3'
      };

      // Danh sách các endpoints thử nghiệm (bao gồm CORS Proxy theo yêu cầu)
      const cobaltEndpoints = [
        'https://api.cobalt.tools/api/json',
        'https://corsproxy.io/?https://api.cobalt.tools/api/json',
        'https://api.cobalt.tools/',
        'https://co.wuk.sh/api/json'
      ];

      let streamUrl = null;
      let lastError = null;

      // Thử tuần tự qua các endpoint và ghi log chi tiết cho việc debug
      for (const endpoint of cobaltEndpoints) {
        try {
          console.log(`[Cobalt API] Đang gửi yêu cầu tới endpoint: ${endpoint}`);
          console.log(`[Cobalt API] Headers:`, requestHeaders);
          console.log(`[Cobalt API] Body payload:`, cobaltPayload);

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: requestHeaders,
            body: JSON.stringify(cobaltPayload)
          });

          console.log(`[Cobalt API Response] Endpoint: ${endpoint} | Status: ${res.status} ${res.statusText}`, res);

          if (res.ok) {
            const data = await res.json();
            console.log(`[Cobalt API JSON Data] từ ${endpoint}:`, data);

            // Bóc tách direct URL từ phản hồi
            streamUrl = data.url || (data.picker && data.picker[0]?.url) || data.audio || data.link;
            if (streamUrl) {
              console.log(`[Cobalt API Success] Lấy được Direct Stream URL:`, streamUrl);
              break;
            }
          } else {
            const errText = await res.text().catch(() => '');
            console.warn(`[Cobalt API Warn] Endpoint ${endpoint} trả mã lỗi ${res.status}:`, errText);
            lastError = new Error(`HTTP ${res.status}: ${errText}`);
          }
        } catch (fetchErr) {
          console.warn(`[Cobalt API Warn] Lỗi mạng khi gọi ${endpoint}:`, fetchErr);
          lastError = fetchErr;
        }
      }

      // 3. Xử lý khi không lấy được luồng âm thanh từ Cobalt
      if (!streamUrl) {
        console.error('[Cobalt API Error] Tất cả endpoint Cobalt API đều thất bại:', lastError);

        // BẮT BUỘC: Hiển thị alert() thông báo kiểu Ghibli thân thiện cho người dùng
        alert('Ôi không, các tinh linh Susuwatari đang bị kẹt mạng, vui lòng thử lại sau! 🍂✨');

        // Phát giai điệu Lâu đài Howl dự phòng từ nhạc viện Ghibli để không ngắt quãng trải nghiệm
        const synthUrl = await generateGhibliSynthAudio('howl');
        if (synthUrl) {
          streamUrl = synthUrl;
          showToast('Máy chủ Cobalt tạm bận, đang phát giai điệu Lâu đài Howl thay thế! 🏰🍃');
        } else {
          throw lastError || new Error('Không thể trích xuất luồng âm thanh từ liên kết này.');
        }
      }

      // 4. Nạp Direct URL vào thẻ Audio để phát ngay lập tức
      dom.audio.src = streamUrl;
      dom.audio.load();
      await playAudio();

      // Cập nhật giao diện Now Playing ở Bottom Player
      dom.trackTitle.textContent = trackTitle;
      dom.trackTitle.title = trackTitle;
      dom.trackArtist.textContent = trackArtist;
      dom.trackAlbum.textContent = ytId ? 'YouTube Stream' : 'Cobalt Audio Stream';
      if (ytId) {
        applyYouTubeThumbnailCover(ytId);
      } else if (dom.currentTrackCover) {
        dom.currentTrackCover.src = trackCover || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><rect width='64' height='64' rx='12' fill='%232b3d2b'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-size='24' fill='%23fefae0'>🎵</text></svg>";
      }

      // Thêm bài hát vào danh sách phát hiện tại
      const newTrack = {
        id: 'cobalt_' + Date.now(),
        name: `${trackTitle}.mp3`,
        title: trackTitle,
        artist: trackArtist,
        album: ytId ? 'YouTube Stream' : 'Cobalt Audio Stream',
        cover: ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '',
        format: 'MP3',
        size: 'Cobalt Audio',
        url: streamUrl,
        isCobalt: true,
        youtubeId: ytId || null
      };
      state.playlist.unshift(newTrack);
      state.currentIndex = 0;
      state.filteredIndices = state.playlist.map((_, i) => i);
      renderPlaylist();
      updatePlaylistCount();
      highlightActivePlaylistCard();

      showToast(`Đang phát: "${trackTitle}" 🕊️🎶`);

      if (state.currentUser) {
        syncPlaylistToCloud();
      }

      // 5. FILE SYSTEM ACCESS API (showSaveFilePicker): Ngầm hỏi user lưu file .mp3 xuống thư mục máy tính
      if ('showSaveFilePicker' in window && !streamUrl.startsWith('blob:')) {
        try {
          const safeName = `${trackTitle.replace(/[\\/:*?"<>|]/g, '_').slice(0, 36)}.mp3`;
          if (dom.loaderStatusSub) {
            dom.loaderStatusSub.textContent = 'Đã có stream! Mở hộp thoại lưu tệp MP3 vào máy...';
          }

          const fileHandle = await window.showSaveFilePicker({
            suggestedName: safeName,
            types: [{
              description: 'Tệp Âm Thanh MP3 (Ghibli Music)',
              accept: { 'audio/mpeg': ['.mp3'], 'audio/*': ['.mp3', '.m4a'] }
            }]
          });

          if (fileHandle) {
            const audioRes = await fetch(streamUrl);
            const audioBlob = await audioRes.blob();
            const writable = await fileHandle.createWritable();
            await writable.write(audioBlob);
            await writable.close();
            showToast(`Đã lưu vĩnh viễn "${safeName}" vào máy tính! 💾✨`);
          }
        } catch (fsErr) {
          if (fsErr.name !== 'AbortError') {
            console.warn('File System Save notice:', fsErr);
          }
        }
      }

    } catch (err) {
      console.error('[Cobalt API Catch Error]:', err);
      alert('Ôi không, các tinh linh Susuwatari đang bị kẹt mạng, vui lòng thử lại sau! 🍂');
      showToast(`Lỗi kết nối Cobalt: ${err.message || 'Không thể trích xuất'} 🍂`);
    } finally {
      // Tắt trạng thái Loading
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
      // [SKILL: /ponytail] Chỉ đồng bộ URL stream thực tế (Cobalt / HTTPS), bỏ qua blob URL tạm thời
      url: (t.url && typeof t.url === 'string' && !t.url.startsWith('blob:')) ? t.url : null,
      isCobalt: !!t.isCobalt,
      youtubeId: t.youtubeId || null
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

        remoteTracks.forEach(rt => {
          if (!existingNames.has(rt.name)) {
            const reconstructed = {
              id: rt.id || ('cloud_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)),
              file: null,
              name: rt.name,
              title: rt.title,
              artist: rt.artist || 'Cloud Synchronized',
              album: rt.album || 'Cloud Ghibli',
              cover: rt.cover || 'album-howl.jpg',
              format: rt.format || 'AUDIO',
              size: rt.size || 'Cloud',
              url: rt.url || null
            };

            state.playlist.push(reconstructed);
            existingNames.add(rt.name);
            addedCount++;
          }
        });

        if (addedCount > 0 || state.playlist.length > 0) {
          state.filteredIndices = state.playlist.map((_, i) => i);
          renderPlaylist();
          updatePlaylistCount();
          dom.folderNameBadge.textContent = `Cloud Sync: ${state.playlist.length} bài hát`;
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

    dom.progressContainer.addEventListener('pointercancel', (e) => {
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

    // 7. Click Playlist Cards (Sử dụng Event Delegation an toàn trên playlistsGrid)
    if (dom.playlistsGrid) {
      dom.playlistsGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.playlist-card');
        if (!card) return;
        const index = parseInt(card.dataset.index, 10);
        if (!isNaN(index) && index >= 0 && index < state.playlist.length) {
          loadTrack(index, true);
          const track = state.playlist[index];
          if (track) showToast(`Đang phát: ${track.title || track.name} 🍃✨`);
        }
      });
    }

    // 8. Left Sidebar Segmented Control: Sliding Toggle Switch
    if (dom.sidebarNavItems) {
      dom.sidebarNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
          // Kích hoạt trượt thanh gỗ mượt mà đến item được click
          moveWoodSliderToItem(item, true);

          const tab = item.dataset.tab;
          const searchSec = document.getElementById('searchViewSection');
          const plSec = document.getElementById('playlistsViewSection');

          if (tab === 'search') {
            if (searchSec) searchSec.classList.remove('hidden');
            if (plSec) plSec.classList.add('hidden');
            if (dom.searchInput) {
              dom.searchInput.focus();
              dom.searchInput.select();
            }
          } else if (tab === 'playlists') {
            if (searchSec) searchSec.classList.add('hidden');
            if (plSec) plSec.classList.remove('hidden');
          } else if (tab === 'home') {
            if (searchSec) searchSec.classList.remove('hidden');
            if (plSec) plSec.classList.add('hidden');
            const main = document.getElementById('mainContent');
            if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (tab === 'library') {
            if (dom.folderInput) dom.folderInput.click();
          } else if (tab === 'create') {
            showToast('Tính năng tạo danh sách phát cá nhân Ghibli 🌱');
          }
        });
      });
    }

    // 8a. Tương tác khi nhấp vào thẻ Card Theme & Genre trên màn hình Search
    document.querySelectorAll('.ghibli-search-card').forEach(card => {
      card.addEventListener('click', async () => {
        const title = card.dataset.title;
        const theme = card.dataset.theme;
        const genre = card.dataset.genre;
        const img = card.querySelector('.card-thumb-img')?.src;

        // Cập nhật ngay bìa bài hát ở góc Now Playing với hiệu ứng fade-in
        if (dom.currentTrackCover && img) {
          dom.currentTrackCover.classList.remove('cover-fade-in');
          void dom.currentTrackCover.offsetWidth;
          dom.currentTrackCover.src = img;
          dom.currentTrackCover.classList.add('cover-fade-in');
        }
        if (dom.trackTitle) {
          dom.trackTitle.textContent = title;
          dom.trackTitle.title = title;
        }
        if (dom.trackArtist) dom.trackArtist.textContent = genre ? 'Studio Ghibli Soundtrack' : 'Ghibli Atmosphere';
        if (dom.trackAlbum) dom.trackAlbum.textContent = theme ? 'Browse by Theme' : 'Explore Top Genres';

        // Phát giai điệu mẫu tương ứng
        const synthKey = genre || theme || 'howl';
        try {
          const audioUrl = await generateGhibliSynthAudio(synthKey);
          if (audioUrl) {
            dom.audio.src = audioUrl;
            dom.audio.load();
            await playAudio();
          }
        } catch (_) {}

        showToast(`Đang thưởng thức: "${title}" 🍃✨`);
      });
    });

    // Tự động căn chỉnh lại vị trí thanh gỗ khi thay đổi kích thước cửa sổ
    window.addEventListener('resize', () => {
      const currentActive = document.querySelector('.sidebar-nav-item.active');
      if (currentActive) {
        moveWoodSliderToItem(currentActive, false);
      }
    });

    // 8b. Left Sidebar Sub-Playlists Click
    document.querySelectorAll('.sub-playlist-item').forEach(item => {
      item.addEventListener('click', () => {
        // Giữ vị trí thanh gỗ ở mục Playlists
        const playlistsTab = document.getElementById('tabPlaylists');
        if (playlistsTab) moveWoodSliderToItem(playlistsTab, true);

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

    dom.searchInput.addEventListener('paste', () => {
      setTimeout(() => {
        updateSearchInputUI(dom.searchInput.value);
      }, 0);
    });

    dom.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = dom.searchInput.value.trim();
        if (!val) return;

        const type = detectInputType(val);
        if (type === 'youtube' || type === 'tiktok' || type === 'url') {
          fetchCobaltAudio(val);
        } else {
          filterCards(val);
          if (state.filteredIndices.length > 0) {
            loadTrack(state.filteredIndices[0], true);
            showToast(`Đang phát: "${state.playlist[state.filteredIndices[0]].title}" 🍃✨`);
          } else {
            showToast(`Không tìm thấy bài hát khớp với "${val}" trong thư viện.`);
          }
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
          fetchCobaltAudio(val);
        } else {
          filterCards(val);
          if (state.filteredIndices.length > 0) {
            loadTrack(state.filteredIndices[0], true);
            showToast(`Đang phát: "${state.playlist[state.filteredIndices[0]].title}" 🍃✨`);
          } else {
            showToast(`Không tìm thấy bài hát khớp với "${val}" trong thư viện.`);
          }
        }
      });
    }

    dom.clearSearchBtn.addEventListener('click', () => {
      dom.searchInput.value = '';
      updateSearchInputUI('');
      filterCards('');
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

    // Nếu có bài hát thì tải bài đầu tiên, ngược lại giữ trạng thái trống sẵn sàng
    if (state.playlist.length > 0) {
      loadTrack(0, false);
    }

    // [SKILL: /animate] Đảm bảo video ngọn lửa Calcifer (fire.mp4) tự động phát lặp vô hạn
    if (dom.calciferFlame && typeof dom.calciferFlame.play === 'function') {
      dom.calciferFlame.play().catch(() => {});
      document.addEventListener('pointerdown', () => {
        if (dom.calciferFlame && dom.calciferFlame.paused && typeof dom.calciferFlame.play === 'function') {
          dom.calciferFlame.play().catch(() => {});
        }
      }, { once: true });
    }

    // [SKILL: /animate & /impeccable] Khởi tạo thanh trượt tấm gỗ ở mục Active ban đầu (Search theo Search.png)
    const initialActive = document.querySelector('.sidebar-nav-item.active') || document.getElementById('tabSearch');
    if (initialActive) {
      moveWoodSliderToItem(initialActive, false);
      setTimeout(() => {
        moveWoodSliderToItem(initialActive, false);
      }, 50);
      setTimeout(() => {
        moveWoodSliderToItem(initialActive, false);
      }, 250);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
