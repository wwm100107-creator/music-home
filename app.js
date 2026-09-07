/**
 * ============================================================================
 * MUSIC HOME • STUDIO GHIBLI & MY NEIGHBOR TOTORO SOUND STATION
 * Clean & Minimal Architecture (Ponytail Senior Dev Pattern)
 * ============================================================================
 * Các mục: Home, Your Library, Search, Playlists, Create Playlist được để trống giao diện.
 * Bố cục giữ lại:
 * 1. Sidebar Kính Mờ + Segmented Control Thanh Trượt Tấm Gỗ (wood_2.jpg)
 * 2. Bottom Player + Wavy Vine Progress Bar + Cục chạy Ngọn lửa Calcifer (fire.mp4)
 */

(() => {
  'use strict';

  // State tối giản
  const state = {
    isPlaying: false,
    volume: 0.8,
    previousVolume: 0.8,
    isMuted: false,
    loopMode: 'all',
    isShuffle: false,
    isScrubbing: false
  };

  // Cache DOM Elements
  const dom = {
    audio: document.getElementById('audioElement'),

    // Sidebar & Wood Slider
    woodSliderSwitch: document.getElementById('woodSliderSwitch'),
    sidebarNavItems: document.querySelectorAll('.sidebar-nav-item'),
    tabViews: document.querySelectorAll('.tab-view-section'),

    // Bottom Player
    bottomPlayer: document.getElementById('bottomPlayer'),
    demoPlayTriggerBtn: document.getElementById('demoPlayTriggerBtn'),
    currentTrackCover: document.getElementById('currentTrackCover'),
    trackTitle: document.getElementById('trackTitle'),
    trackArtist: document.getElementById('trackArtist'),
    trackAlbum: document.getElementById('trackAlbum'),
    playPauseBtn: document.getElementById('playPauseBtn'),
    playIcon: document.getElementById('playIcon'),
    pauseIcon: document.getElementById('pauseIcon'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    loopBtn: document.getElementById('loopBtn'),
    loopBadge: document.getElementById('loopBadge'),

    // Progress Vine & Calcifer
    progressContainer: document.getElementById('progressContainer'),
    wavyVineSvg: document.getElementById('wavyVineSvg'),
    vineProgressFill: document.getElementById('vineProgressFill'),
    progressThumb: document.getElementById('progressThumb'),
    calciferFlame: document.getElementById('calciferFlame'),
    progressHoverTime: document.getElementById('progressHoverTime'),
    currentTime: document.getElementById('currentTime'),
    totalDuration: document.getElementById('totalDuration'),

    // Volume
    volumeSlider: document.getElementById('volumeSlider'),
    volumePercent: document.getElementById('volumePercent'),
    muteBtn: document.getElementById('muteBtn'),
    volumeHighIcon: document.getElementById('volumeHighIcon'),
    volumeMutedIcon: document.getElementById('volumeMutedIcon'),

    toast: document.getElementById('toast')
  };

  // Toast thông báo nhỏ
  let toastTimer = null;
  function showToast(msg) {
    if (!dom.toast) return;
    clearTimeout(toastTimer);
    dom.toast.textContent = msg;
    dom.toast.classList.remove('hidden');
    toastTimer = setTimeout(() => {
      dom.toast.classList.add('hidden');
    }, 2400);
  }

  // Chuyển đổi định dạng giây sang MM:SS
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
  }

  // ==========================================================================
  // 1. SEGMENTED CONTROL: THANH TRƯỢT TẤM GỖ (WOODEN SLIDING SWITCH)
  // ==========================================================================
  function moveWoodSliderToItem(targetItem, animate = true) {
    if (!targetItem || !dom.woodSliderSwitch) return;

    const offsetTop = targetItem.offsetTop;

    if (!animate) {
      dom.woodSliderSwitch.style.transition = 'none';
    } else {
      dom.woodSliderSwitch.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s ease';
    }

    dom.woodSliderSwitch.style.transform = 'translateY(' + offsetTop + 'px)';
    dom.woodSliderSwitch.style.opacity = '1';

    if (!animate) {
      void dom.woodSliderSwitch.offsetHeight;
      dom.woodSliderSwitch.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s ease';
    }

    // Cập nhật trạng thái Active
    dom.sidebarNavItems.forEach(item => {
      item.classList.toggle('active', item === targetItem);
    });
  }

  // ==========================================================================
  // 2. CHUYỂN TAB GIAO DIỆN (TẤT CẢ CÁC MỤC ĐỀU ĐỂ TRỐNG THEO YÊU CẦU)
  // ==========================================================================
  function switchTab(tabKey) {
    dom.tabViews.forEach(view => {
      if (view.dataset.tab === tabKey) {
        view.classList.remove('hidden');
        view.classList.add('active');
      } else {
        view.classList.add('hidden');
        view.classList.remove('active');
      }
    });
  }

  // ==========================================================================
  // 3. TIẾN TRÌNH DÂY LEO VÀ CỤC CHẠY CALCIFER (FIRE.MP4)
  // ==========================================================================
  function updateProgressUI(percent) {
    const clamped = Math.max(0, Math.min(100, percent));
    if (dom.progressThumb) {
      dom.progressThumb.style.left = clamped + '%';
    }
    if (dom.vineProgressFill) {
      const length = 600;
      const offset = length - (clamped / 100) * length;
      dom.vineProgressFill.style.strokeDasharray = length;
      dom.vineProgressFill.style.strokeDashoffset = offset;
    }
  }

  function handleScrub(e) {
    if (!dom.progressContainer) return;
    const rect = dom.progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));

    updateProgressUI(percent * 100);

    if (dom.audio && dom.audio.duration) {
      dom.audio.currentTime = percent * dom.audio.duration;
    }
  }

  // ==========================================================================
  // 4. ĐIỀU KHIỂN ÂM LƯỢNG
  // ==========================================================================
  function setVolume(val) {
    const num = Math.max(0, Math.min(1, parseFloat(val) || 0));
    state.volume = num;
    if (dom.audio) dom.audio.volume = num;

    if (dom.volumeSlider) dom.volumeSlider.value = num;
    if (dom.volumePercent) dom.volumePercent.textContent = Math.round(num * 100) + '%';

    if (num === 0) {
      state.isMuted = true;
      if (dom.volumeHighIcon) dom.volumeHighIcon.classList.add('hidden');
      if (dom.volumeMutedIcon) dom.volumeMutedIcon.classList.remove('hidden');
    } else {
      state.isMuted = false;
      if (dom.volumeHighIcon) dom.volumeHighIcon.classList.remove('hidden');
      if (dom.volumeMutedIcon) dom.volumeMutedIcon.classList.add('hidden');
    }
  }

  function toggleMute() {
    if (state.isMuted) {
      setVolume(state.previousVolume || 0.8);
    } else {
      state.previousVolume = state.volume;
      setVolume(0);
    }
  }

  // ==========================================================================
  // 4. ANIMATION: ẨN / HIỆN THANH PHÁT NHẠC (BOTTOM PLAYER BAR)
  // [SKILL: /animate & /improve-animations]
  // - Khởi tạo mặc định: ẨN khi web mới load (chưa chọn bài hát nào)
  // - Khi người dùng click vào bất kỳ bài nhạc/nút Play nào: Thêm class .active
  // - Hiệu ứng xuất hiện: Trượt mượt mà từ dưới lên và rõ dần
  // ==========================================================================
  function activatePlayerBar() {
    if (!dom.bottomPlayer) return;
    if (!dom.bottomPlayer.classList.contains('active')) {
      dom.bottomPlayer.classList.add('active');
      showToast('🍃 Đã khởi động thanh phát nhạc!');
    }
  }

  function hidePlayerBar() {
    if (dom.bottomPlayer) {
      dom.bottomPlayer.classList.remove('active');
    }
  }

  // ==========================================================================
  // 5. PHÁT / TẠM DỪNG
  // ==========================================================================
  function togglePlayPause() {
    // Luôn kích hoạt thanh Player trượt lên khi nhấn Play
    activatePlayerBar();

    if (!dom.audio || !dom.audio.src) {
      // Giả lập trạng thái phát nhạc demo khi chưa nạp file âm thanh
      state.isPlaying = !state.isPlaying;
      document.body.classList.toggle('music-playing', state.isPlaying);
      if (dom.playIcon) dom.playIcon.classList.toggle('hidden', state.isPlaying);
      if (dom.pauseIcon) dom.pauseIcon.classList.toggle('hidden', !state.isPlaying);
      showToast(state.isPlaying ? '▶ Đang phát bản nhạc mẫu (Demo)' : '⏸ Đã tạm dừng');
      return;
    }

    if (dom.audio.paused) {
      dom.audio.play().catch(() => {});
      state.isPlaying = true;
      document.body.classList.add('music-playing');
      if (dom.playIcon) dom.playIcon.classList.add('hidden');
      if (dom.pauseIcon) dom.pauseIcon.classList.remove('hidden');
    } else {
      dom.audio.pause();
      state.isPlaying = false;
      document.body.classList.remove('music-playing');
      if (dom.playIcon) dom.playIcon.classList.remove('hidden');
      if (dom.pauseIcon) dom.pauseIcon.classList.add('hidden');
    }
  }

  // ==========================================================================
  // 6. THIẾT LẬP SỰ KIỆN
  // ==========================================================================
  function setupEvents() {
    // Click Sidebar Tabs
    dom.sidebarNavItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        moveWoodSliderToItem(item, true);
        const tab = item.dataset.tab;
        switchTab(tab);
      });
    });

    // Resize window căn chỉnh lại thanh trượt gỗ
    window.addEventListener('resize', () => {
      const activeItem = document.querySelector('.sidebar-nav-item.active');
      if (activeItem) moveWoodSliderToItem(activeItem, false);
    });

    // Audio Playback Events
    if (dom.audio) {
      dom.audio.addEventListener('timeupdate', () => {
        if (!state.isScrubbing && dom.audio.duration) {
          const percent = (dom.audio.currentTime / dom.audio.duration) * 100;
          updateProgressUI(percent);
          if (dom.currentTime) dom.currentTime.textContent = formatTime(dom.audio.currentTime);
        }
      });

      dom.audio.addEventListener('loadedmetadata', () => {
        if (dom.totalDuration) dom.totalDuration.textContent = formatTime(dom.audio.duration);
      });

      dom.audio.addEventListener('ended', () => {
        if (state.loopMode === 'one') {
          dom.audio.currentTime = 0;
          dom.audio.play().catch(() => {});
        } else {
          togglePlayPause();
        }
      });
    }

    // Play/Pause button
    if (dom.playPauseBtn) {
      dom.playPauseBtn.addEventListener('click', togglePlayPause);
    }

    // Volume Slider & Mute
    if (dom.volumeSlider) {
      dom.volumeSlider.addEventListener('input', (e) => setVolume(e.target.value));
    }
    if (dom.muteBtn) {
      dom.muteBtn.addEventListener('click', toggleMute);
    }

    // Scrubber (Calcifer Thumb)
    if (dom.progressContainer) {
      dom.progressContainer.addEventListener('pointerdown', (e) => {
        state.isScrubbing = true;
        handleScrub(e);
        try { dom.progressContainer.setPointerCapture(e.pointerId); } catch (_) {}
      });

      dom.progressContainer.addEventListener('pointermove', (e) => {
        if (state.isScrubbing) {
          handleScrub(e);
        }
      });

      const endScrub = (e) => {
        if (state.isScrubbing) {
          state.isScrubbing = false;
          handleScrub(e);
          try { dom.progressContainer.releasePointerCapture(e.pointerId); } catch (_) {}
        }
      };

      dom.progressContainer.addEventListener('pointerup', endScrub);
      dom.progressContainer.addEventListener('pointercancel', endScrub);
    }

    // Demo play button trigger (Giả lập kích hoạt thanh phát nhạc trượt lên)
    if (dom.demoPlayTriggerBtn) {
      dom.demoPlayTriggerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        activatePlayerBar();
        if (dom.trackTitle) {
          dom.trackTitle.textContent = 'Merry-Go-Round of Life';
          if (dom.trackArtist) dom.trackArtist.textContent = 'Joe Hisaishi';
          if (dom.trackAlbum) dom.trackAlbum.textContent = "Howl's Moving Castle";
          if (dom.playIcon) dom.playIcon.classList.add('hidden');
          if (dom.pauseIcon) dom.pauseIcon.classList.remove('hidden');
          state.isPlaying = true;
          document.body.classList.add('music-playing');
        }
      });
    }

    // Global listener: Khi người dùng click vào bất kỳ bài nhạc/nút Play nào trên màn hình
    document.addEventListener('click', (e) => {
      const playTrigger = e.target.closest('[data-play], .play-trigger, .track-card, .track-item, .btn-play, #playPauseBtn');
      if (playTrigger) {
        activatePlayerBar();
      }
    });

    // Phím Space để phát / tạm dừng và kích hoạt thanh Player Bar
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        activatePlayerBar();
        togglePlayPause();
      }
    });
  }

  // Khởi động
  function init() {
    setVolume(0.8);
    setupEvents();

    // Active Home mặc định
    const defaultTab = document.getElementById('tabHome') || dom.sidebarNavItems[0];
    if (defaultTab) {
      moveWoodSliderToItem(defaultTab, false);
      switchTab('home');
      setTimeout(() => moveWoodSliderToItem(defaultTab, false), 50);
      setTimeout(() => moveWoodSliderToItem(defaultTab, false), 250);
    }

    // Autoplay Calcifer flame video (fire.mp4)
    if (dom.calciferFlame && typeof dom.calciferFlame.play === 'function') {
      dom.calciferFlame.play().catch(() => {});
      document.addEventListener('pointerdown', () => {
        if (dom.calciferFlame && dom.calciferFlame.paused && typeof dom.calciferFlame.play === 'function') {
          dom.calciferFlame.play().catch(() => {});
        }
      }, { once: true });
    }
  }

  // Expose hàm điều khiển ra window để tiện kiểm tra / gọi từ bên ngoài
  window.activatePlayerBar = activatePlayerBar;
  window.hidePlayerBar = hidePlayerBar;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
