/**
 * ============================================================================
 * MUSIC HOME • STUDIO GHIBLI & MY NEIGHBOR TOTORO SOUND STATION
 * Production Audio Streaming Engine & VisionOS Proxy Client
 * ============================================================================
 */

(() => {
  'use strict';

  // State
  const state = {
    isPlaying: false,
    activeEngine: 'none', // 'audio' | 'youtube' | 'none'
    consecutiveErrors: 0,
    currentTrack: null,
    queue: [],
    queueIndex: -1,
    customLoopIds: new Set(),
    loopMode: 'all', // 'all' | 'one' | 'acorn' | 'off'
    isShuffle: false,
    volume: 0.8,
    previousVolume: 0.8,
    isMuted: false,
    isScrubbing: false,
    selectedCountry: 'VN',
    activeGenre: 'all',
    trendingTracks: [],
    searchResults: [],
    favorites: [],
    regionalAlbums: [],
    albumsLoadedCountry: null
  };

  // Cache DOM
  const dom = {
    audio: document.getElementById('audioElement'),

    // Navigation & Tabs
    woodSliderSwitch: document.getElementById('woodSliderSwitch'),
    sidebarNavItems: document.querySelectorAll('.sidebar-nav-item'),
    tabViews: document.querySelectorAll('.tab-view-section'),

    // Home view
    homeQuickSearchInput: document.getElementById('homeQuickSearchInput'),
    countrySelectDropdown: document.getElementById('countrySelectDropdown'),
    heroBanner: document.getElementById('heroBanner'),
    heroFlag: document.getElementById('heroFlag'),
    heroGreetingText: document.getElementById('heroGreetingText'),
    genrePillContainer: document.getElementById('genrePillContainer'),
    trendingSectionTitle: document.getElementById('trendingSectionTitle'),
    trendingCounter: document.getElementById('trendingCounter'),
    trendingTracksGrid: document.getElementById('trendingTracksGrid'),

    // Search view
    mainSearchInput: document.getElementById('mainSearchInput'),
    searchTypeIcon: document.getElementById('searchTypeIcon'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    searchLoadingState: document.getElementById('searchLoadingState'),
    searchEmptyState: document.getElementById('searchEmptyState'),
    searchResultsGrid: document.getElementById('searchResultsGrid'),

    // Library view
    favCounter: document.getElementById('favCounter'),
    favoriteTracksGrid: document.getElementById('favoriteTracksGrid'),

    // Playlists / Albums view
    albumSectionTitle: document.getElementById('albumSectionTitle'),
    albumRegionSubtitle: document.getElementById('albumRegionSubtitle'),
    albumCounterPill: document.getElementById('albumCounterPill'),
    albumSearchInput: document.getElementById('albumSearchInput'),
    clearAlbumSearchBtn: document.getElementById('clearAlbumSearchBtn'),
    albumsLoadingState: document.getElementById('albumsLoadingState'),
    albumsEmptyState: document.getElementById('albumsEmptyState'),
    albumsGrid: document.getElementById('albumsGrid'),

    // Album Tracklist Modal
    albumModal: document.getElementById('albumModal'),
    closeAlbumModalBtn: document.getElementById('closeAlbumModalBtn'),
    albumModalCover: document.getElementById('albumModalCover'),
    albumModalBadge: document.getElementById('albumModalBadge'),
    albumModalTitle: document.getElementById('albumModalTitle'),
    albumModalArtist: document.getElementById('albumModalArtist'),
    albumModalInfo: document.getElementById('albumModalInfo'),
    playAlbumAllBtn: document.getElementById('playAlbumAllBtn'),
    queueAlbumAllBtn: document.getElementById('queueAlbumAllBtn'),
    albumTrackList: document.getElementById('albumTrackList'),

    // Bottom Player
    bottomPlayer: document.getElementById('bottomPlayer'),
    currentTrackCover: document.getElementById('currentTrackCover'),
    trackTitle: document.getElementById('trackTitle'),
    trackArtist: document.getElementById('trackArtist'),
    trackAlbum: document.getElementById('trackAlbum'),
    likeBtn: document.getElementById('likeBtn'),
    playPauseBtn: document.getElementById('playPauseBtn'),
    playIcon: document.getElementById('playIcon'),
    pauseIcon: document.getElementById('pauseIcon'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    loopBtn: document.getElementById('loopBtn'),
    loopBadge: document.getElementById('loopBadge'),

    // Wavy Vine Progress & Calcifer
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

    // Queue Drawer
    queueToggleBtn: document.getElementById('queueToggleBtn'),
    playlistDrawer: document.getElementById('playlistDrawer'),
    closeDrawerBtn: document.getElementById('closeDrawerBtn'),
    clearQueueBtn: document.getElementById('clearQueueBtn'),
    queueListContainer: document.getElementById('queueListContainer'),
    queueCounterBadge: document.getElementById('queueCounterBadge'),
    acornLoopActiveBadge: document.getElementById('acornLoopActiveBadge'),

    toast: document.getElementById('toast')
  };

  // Toast
  let toastTimer = null;
  function showToast(msg) {
    if (!dom.toast) return;
    clearTimeout(toastTimer);
    dom.toast.textContent = msg;
    dom.toast.classList.remove('hidden');
    toastTimer = setTimeout(() => {
      dom.toast.classList.add('hidden');
    }, 2500);
  }

  // Format Time (MM:SS)
  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // ==========================================================================
  // 1. SEGMENTED CONTROL: THANH TRƯỢT GỖ & CHUYỂN TAB
  // ==========================================================================
  function moveWoodSliderToItem(targetItem, animate = true) {
    if (!targetItem || !dom.woodSliderSwitch) return;
    const offsetTop = targetItem.offsetTop;

    if (!animate) {
      dom.woodSliderSwitch.style.transition = 'none';
    } else {
      dom.woodSliderSwitch.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s ease';
    }

    dom.woodSliderSwitch.style.transform = `translateY(${offsetTop}px)`;
    dom.woodSliderSwitch.style.opacity = '1';

    if (!animate) {
      void dom.woodSliderSwitch.offsetHeight;
      dom.woodSliderSwitch.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s ease';
    }

    dom.sidebarNavItems.forEach(item => {
      item.classList.toggle('active', item === targetItem);
    });
  }

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

    const targetNavItem = document.querySelector(`.sidebar-nav-item[data-tab="${tabKey}"]`);
    if (targetNavItem) {
      moveWoodSliderToItem(targetNavItem, true);
    }

    if (tabKey === 'playlists') {
      if (state.albumsLoadedCountry !== state.selectedCountry || !state.regionalAlbums || state.regionalAlbums.length === 0) {
        loadAlbumsByRegion(state.selectedCountry);
      }
    }
  }

  // ==========================================================================
  // 2. AUDIO PLAYBACK & BOTTOM PLAYER
  // ==========================================================================
  function activatePlayerBar() {
    if (!dom.bottomPlayer) return;
    if (!dom.bottomPlayer.classList.contains('active')) {
      dom.bottomPlayer.classList.add('active');
    }
  }

  function updateNowPlayingUI(track) {
    if (!track) return;
    if (dom.trackTitle) {
      dom.trackTitle.textContent = track.title;
      dom.trackTitle.title = track.title;
    }
    if (dom.trackArtist) dom.trackArtist.textContent = track.artist || 'Nghệ sĩ không tên';
    if (dom.trackAlbum) dom.trackAlbum.textContent = track.album || 'Home Music Session';

    if (dom.currentTrackCover) {
      dom.currentTrackCover.src = track.thumbnail || 'wood_2.jpg';
      dom.currentTrackCover.classList.remove('cover-fade-in');
      void dom.currentTrackCover.offsetWidth;
      dom.currentTrackCover.classList.add('cover-fade-in');
    }

    if (dom.totalDuration) {
      dom.totalDuration.textContent = track.duration || '00:00';
    }

    updateLikeButtonUI(track.id);
    highlightActiveCard(track.id);
  }

  // ==========================================================================
  // YOUTUBE AUDIO ENGINE (Official High-Speed, Zero-Timeout Google Audio Stream)
  // ==========================================================================
  let ytPlayer = null;
  let isYtReady = false;

  window.onYouTubeIframeAPIReady = function() {
    try {
      ytPlayer = new YT.Player('ytPlayerContainer', {
        height: '200',
        width: '200',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: window.location.origin
        },
        events: {
          onReady: () => {
            isYtReady = true;
            console.log('✅ YouTube Audio Engine Connected!');
            if (state.volume !== undefined && ytPlayer && ytPlayer.setVolume) {
              ytPlayer.setVolume(Math.round(state.volume * 100));
            }
          },
          onStateChange: (event) => {
            // YT.PlayerState: 1 = PLAYING, 2 = PAUSED, 0 = ENDED, 3 = BUFFERING
            if (event.data === 1) {
              state.isPlaying = true;
              state.consecutiveErrors = 0;
              document.body.classList.add('music-playing');
              if (dom.playIcon) dom.playIcon.classList.add('hidden');
              if (dom.pauseIcon) dom.pauseIcon.classList.remove('hidden');
              const dur = ytPlayer.getDuration();
              if (dur && dom.totalDuration) dom.totalDuration.textContent = formatTime(dur);
            } else if (event.data === 2) {
              if (state.activeEngine === 'youtube') {
                state.isPlaying = false;
                document.body.classList.remove('music-playing');
                if (dom.playIcon) dom.playIcon.classList.remove('hidden');
                if (dom.pauseIcon) dom.pauseIcon.classList.add('hidden');
              }
            } else if (event.data === 0) {
              if (state.activeEngine === 'youtube') {
                if (state.loopMode === 'one') {
                  ytPlayer.seekTo(0);
                  ytPlayer.playVideo();
                } else {
                  playNextTrack();
                }
              }
            }
          },
          onError: (err) => {
            console.warn('[YT Engine Error]:', err.data);
            // Phương án dự phòng: Nạp thử qua luồng stream proxy của backend
            if (state.currentTrack?.id && !state.currentTrack.id.startsWith('itunes_')) {
              console.log('🔄 Đang thử luồng dự phòng proxy backend...');
              state.activeEngine = 'audio';
              dom.audio.src = `/api/stream/${state.currentTrack.id}`;
              dom.audio.load();
              dom.audio.play().then(() => {
                state.isPlaying = true;
                state.consecutiveErrors = 0;
                document.body.classList.add('music-playing');
                if (dom.playIcon) dom.playIcon.classList.add('hidden');
                if (dom.pauseIcon) dom.pauseIcon.classList.remove('hidden');
              }).catch(() => {
                state.isPlaying = false;
                state.consecutiveErrors = (state.consecutiveErrors || 0) + 1;
                if (state.consecutiveErrors >= 3) {
                  showToast('🍂 Bài hát này tạm thời gặp sự cố bản quyền. Vui lòng chọn bài khác.');
                  state.consecutiveErrors = 0;
                  return;
                }
                showToast('🍂 Bài hát này tạm thời gặp sự cố bản quyền. Đang chuyển tiếp...');
                setTimeout(() => playNextTrack(), 1500);
              });
            }
          }
        }
      });
    } catch (e) {
      console.warn('Khởi tạo YouTube Player:', e.message);
    }
  };

  // Đồng bộ ngọn lửa Calcifer và thanh tiến trình liên tục (250ms)
  setInterval(() => {
    if (state.isPlaying && !state.isScrubbing) {
      if (state.activeEngine === 'audio' || state.currentTrack?.previewUrl) {
        if (dom.audio && dom.audio.duration) {
          const percent = (dom.audio.currentTime / dom.audio.duration) * 100;
          updateProgressUI(percent);
          if (dom.currentTime) dom.currentTime.textContent = formatTime(dom.audio.currentTime);
          if (dom.totalDuration) dom.totalDuration.textContent = formatTime(dom.audio.duration);
        }
      } else if (state.activeEngine === 'youtube' && ytPlayer && isYtReady && typeof ytPlayer.getCurrentTime === 'function') {
        const cur = ytPlayer.getCurrentTime();
        const dur = ytPlayer.getDuration();
        if (dur && dur > 0) {
          const percent = (cur / dur) * 100;
          updateProgressUI(percent);
          if (dom.currentTime) dom.currentTime.textContent = formatTime(cur);
          if (dom.totalDuration) dom.totalDuration.textContent = formatTime(dur);
        }
      }
    }
  }, 250);

  function playTrack(track, addOrFindInQueue = true) {
    if (!track || !track.id) return;

    state.currentTrack = track;
    activatePlayerBar();
    updateNowPlayingUI(track);

    if (addOrFindInQueue) {
      const existingIdx = state.queue.findIndex(t => t.id === track.id);
      if (existingIdx !== -1) {
        state.queueIndex = existingIdx;
      } else {
        state.queue.push(track);
        state.queueIndex = state.queue.length - 1;
      }
      renderQueueDrawer();
    }

    showToast(`🎵 Đang phát: ${track.title}`);

    // Track có direct audio preview (ví dụ từ iTunes API)
    if (track.previewUrl) {
      state.activeEngine = 'audio';
      if (ytPlayer && isYtReady && typeof ytPlayer.stopVideo === 'function') {
        ytPlayer.stopVideo();
      }
      dom.audio.src = track.previewUrl;
      dom.audio.load();
      dom.audio.play().then(() => {
        state.isPlaying = true;
        state.consecutiveErrors = 0;
        document.body.classList.add('music-playing');
        if (dom.playIcon) dom.playIcon.classList.add('hidden');
        if (dom.pauseIcon) dom.pauseIcon.classList.remove('hidden');
      }).catch(err => {
        console.warn('[Audio Playback error]:', err.message);
      });
      return;
    }

    // Track YouTube:
    // Dọn dẹp dom.audio an toàn (KHÔNG gán src = '' để tránh kích hoạt sự kiện onerror của trình duyệt)
    if (dom.audio) {
      dom.audio.pause();
      dom.audio.removeAttribute('src');
      dom.audio.load();
    }

    // Ưu tiên 1: YouTube Iframe Engine nếu đã sẵn sàng
    if (ytPlayer && isYtReady && typeof ytPlayer.loadVideoById === 'function') {
      state.activeEngine = 'youtube';
      ytPlayer.loadVideoById(track.id);
      ytPlayer.playVideo();
      state.isPlaying = true;
      state.consecutiveErrors = 0;
      document.body.classList.add('music-playing');
      if (dom.playIcon) dom.playIcon.classList.add('hidden');
      if (dom.pauseIcon) dom.pauseIcon.classList.remove('hidden');
    } else {
      // Ưu tiên 2: Phát ngay lập tức qua luồng Audio Proxy /api/stream/:id
      console.log('⚡ YouTube Engine chưa sẵn sàng, phát qua Audio Proxy...');
      state.activeEngine = 'audio';
      dom.audio.src = `/api/stream/${track.id}`;
      dom.audio.load();
      dom.audio.play().then(() => {
        state.isPlaying = true;
        state.consecutiveErrors = 0;
        document.body.classList.add('music-playing');
        if (dom.playIcon) dom.playIcon.classList.add('hidden');
        if (dom.pauseIcon) dom.pauseIcon.classList.remove('hidden');
      }).catch(err => {
        console.warn('[Audio Proxy Play Error]:', err.message);
      });
    }
  }

  function togglePlayPause() {
    activatePlayerBar();

    if (!state.currentTrack) {
      if (state.queue.length > 0) {
        playTrack(state.queue[0]);
      } else if (state.trendingTracks.length > 0) {
        playTrack(state.trendingTracks[0]);
      }
      return;
    }

    if (state.activeEngine === 'audio' || state.currentTrack.previewUrl) {
      if (dom.audio.paused) {
        dom.audio.play().then(() => {
          state.isPlaying = true;
          document.body.classList.add('music-playing');
          if (dom.playIcon) dom.playIcon.classList.add('hidden');
          if (dom.pauseIcon) dom.pauseIcon.classList.remove('hidden');
        }).catch(() => {});
      } else {
        dom.audio.pause();
        state.isPlaying = false;
        document.body.classList.remove('music-playing');
        if (dom.playIcon) dom.playIcon.classList.remove('hidden');
        if (dom.pauseIcon) dom.pauseIcon.classList.add('hidden');
      }
      return;
    }

    if (state.activeEngine === 'youtube' && ytPlayer && isYtReady && typeof ytPlayer.getPlayerState === 'function') {
      const pState = ytPlayer.getPlayerState();
      if (pState === 1) { // Đang phát -> Tạm dừng
        ytPlayer.pauseVideo();
        state.isPlaying = false;
        document.body.classList.remove('music-playing');
        if (dom.playIcon) dom.playIcon.classList.remove('hidden');
        if (dom.pauseIcon) dom.pauseIcon.classList.add('hidden');
      } else { // Đang dừng -> Phát
        ytPlayer.playVideo();
        state.isPlaying = true;
        document.body.classList.add('music-playing');
        if (dom.playIcon) dom.playIcon.classList.add('hidden');
        if (dom.pauseIcon) dom.pauseIcon.classList.remove('hidden');
      }
      return;
    }

    if (dom.audio.src) {
      if (dom.audio.paused) {
        dom.audio.play().catch(() => {});
      } else {
        dom.audio.pause();
      }
    }
  }

  function playNextTrack() {
    if (state.queue.length === 0) return;

    if (state.loopMode === 'acorn' && state.customLoopIds.size > 0) {
      const acornTracks = state.queue.filter(t => state.customLoopIds.has(t.id));
      if (acornTracks.length > 0) {
        let curAcornIdx = acornTracks.findIndex(t => t.id === state.currentTrack?.id);
        let nextAcornIdx = (curAcornIdx + 1) % acornTracks.length;
        playTrack(acornTracks[nextAcornIdx], false);
        return;
      }
    }

    if (state.isShuffle) {
      let randIdx = Math.floor(Math.random() * state.queue.length);
      state.queueIndex = randIdx;
      playTrack(state.queue[randIdx], false);
      return;
    }

    if (state.queueIndex < state.queue.length - 1) {
      state.queueIndex++;
      playTrack(state.queue[state.queueIndex], false);
    } else if (state.loopMode === 'all') {
      state.queueIndex = 0;
      playTrack(state.queue[0], false);
    } else {
      showToast('🍃 Đã hết danh sách bài hát.');
    }
  }

  function playPrevTrack() {
    if (state.queue.length === 0) return;

    if (state.activeEngine === 'audio' && dom.audio && dom.audio.currentTime > 3) {
      dom.audio.currentTime = 0;
      return;
    }

    if (state.activeEngine === 'youtube' && ytPlayer && isYtReady && typeof ytPlayer.getCurrentTime === 'function' && ytPlayer.getCurrentTime() > 3) {
      ytPlayer.seekTo(0, true);
      return;
    }

    if (state.queueIndex > 0) {
      state.queueIndex--;
      playTrack(state.queue[state.queueIndex], false);
    } else {
      state.queueIndex = state.queue.length - 1;
      playTrack(state.queue[state.queueIndex], false);
    }
  }

  // ==========================================================================
  // 3. WAVY VINE PROGRESS BAR & CHÚ LỬA CALCIFER (FIRE.GIF)
  // ==========================================================================
  function updateProgressUI(percent) {
    const clamped = Math.max(0, Math.min(100, percent));
    if (dom.progressThumb) {
      dom.progressThumb.style.left = `${clamped}%`;
    }
    if (dom.vineProgressFill) {
      const totalLen = 600;
      const offset = totalLen - (clamped / 100) * totalLen;
      dom.vineProgressFill.style.strokeDasharray = totalLen;
      dom.vineProgressFill.style.strokeDashoffset = offset;
    }
  }

  function handleScrub(e) {
    if (!dom.progressContainer) return;
    const rect = dom.progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));

    updateProgressUI(percent * 100);

    if (state.activeEngine === 'audio' || state.currentTrack?.previewUrl) {
      if (dom.audio && dom.audio.duration) {
        dom.audio.currentTime = percent * dom.audio.duration;
        if (dom.currentTime) dom.currentTime.textContent = formatTime(dom.audio.currentTime);
      }
    } else if (state.activeEngine === 'youtube' && ytPlayer && isYtReady && typeof ytPlayer.getDuration === 'function') {
      const dur = ytPlayer.getDuration();
      if (dur && dur > 0) {
        const targetTime = percent * dur;
        ytPlayer.seekTo(targetTime, true);
        if (dom.currentTime) dom.currentTime.textContent = formatTime(targetTime);
      }
    }
  }

  // ==========================================================================
  // 4. VOLUME & MUTE
  // ==========================================================================
  function setVolume(val) {
    const num = Math.max(0, Math.min(1, parseFloat(val) || 0));
    state.volume = num;
    if (dom.audio) dom.audio.volume = num;
    if (ytPlayer && isYtReady && typeof ytPlayer.setVolume === 'function') {
      ytPlayer.setVolume(Math.round(num * 100));
    }

    if (dom.volumeSlider) dom.volumeSlider.value = num;
    if (dom.volumePercent) dom.volumePercent.textContent = `${Math.round(num * 100)}%`;

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
      if (ytPlayer && isYtReady && typeof ytPlayer.unMute === 'function') ytPlayer.unMute();
    } else {
      state.previousVolume = state.volume;
      setVolume(0);
      if (ytPlayer && isYtReady && typeof ytPlayer.mute === 'function') ytPlayer.mute();
    }
  }

  // ==========================================================================
  // 5. LOOP MODES (All -> One -> Acorn 🌰 -> Off)
  // ==========================================================================
  function cycleLoopMode() {
    if (state.loopMode === 'all') {
      state.loopMode = 'one';
      if (dom.loopBadge) {
        dom.loopBadge.textContent = '1';
        dom.loopBadge.classList.remove('hidden');
      }
      showToast('🔂 Chế độ: Lặp lại 1 bài');
    } else if (state.loopMode === 'one') {
      state.loopMode = 'acorn';
      if (dom.loopBadge) {
        dom.loopBadge.textContent = '🌰';
        dom.loopBadge.classList.remove('hidden');
      }
      if (dom.acornLoopActiveBadge) dom.acornLoopActiveBadge.classList.remove('hidden');
      showToast('🌰 Chế độ: Lặp theo danh sách Hạt Dẻ đã tích');
    } else if (state.loopMode === 'acorn') {
      state.loopMode = 'off';
      if (dom.loopBadge) dom.loopBadge.classList.add('hidden');
      if (dom.acornLoopActiveBadge) dom.acornLoopActiveBadge.classList.add('hidden');
      showToast('➡ Chế độ: Tắt lặp lại');
    } else {
      state.loopMode = 'all';
      if (dom.loopBadge) {
        dom.loopBadge.textContent = '🔁';
        dom.loopBadge.classList.remove('hidden');
      }
      showToast('🔁 Chế độ: Lặp toàn bộ danh sách');
    }
  }

  // ==========================================================================
  // 6. CARD RENDERING (GHIBLI STYLE)
  // ==========================================================================
  function createSongCardElement(track, clickHandler) {
    const card = document.createElement('div');
    card.className = 'nature-track-card';
    card.dataset.id = track.id;

    if (state.currentTrack?.id === track.id) {
      card.classList.add('active-playing');
    }

    card.innerHTML = `
      <div class="track-card-thumb-shell">
        <img src="${track.thumbnail || 'wood_2.jpg'}" alt="${track.title}" class="track-card-img" loading="lazy">
        <div class="track-card-play-overlay">
          <span class="play-icon-triangle">▶</span>
        </div>
      </div>
      <div class="track-card-info">
        <span class="track-card-title" title="${track.title}">${track.title}</span>
        <span class="track-card-artist" title="${track.artist}">${track.artist || 'Nghệ sĩ'}</span>
        <span class="track-card-duration">${track.duration || '3:30'}</span>
      </div>
    `;

    card.addEventListener('click', () => clickHandler(track));
    return card;
  }

  function highlightActiveCard(trackId) {
    document.querySelectorAll('.nature-track-card').forEach(card => {
      card.classList.toggle('active-playing', card.dataset.id === trackId);
    });
  }

  // ==========================================================================
  // 7. GEO-IP & TRENDING ENGINE
  // ==========================================================================
  async function loadTrendingMusic(countryCode = null) {
    try {
      if (dom.trendingTracksGrid) {
        dom.trendingTracksGrid.innerHTML = `
          <div class="ghibli-loading-placeholder">
            <div class="loading-leaf-spinner">🌿</div>
            <p class="loading-text">Đang lắng nghe giai điệu từ thiên nhiên...</p>
          </div>
        `;
      }

      const clientTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh';
      const url = countryCode
        ? `/api/trending?country=${countryCode}`
        : `/api/trending?tz=${encodeURIComponent(clientTz)}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data && data.success) {
        state.selectedCountry = data.countryCode || 'VN';
        state.trendingTracks = data.results || data.tracks || [];

        // Đồng bộ Dropdown quốc gia
        if (dom.countrySelectDropdown) {
          dom.countrySelectDropdown.value = state.selectedCountry;
        }

        // Cập nhật Banner
        if (dom.heroFlag) dom.heroFlag.textContent = data.flag || '🇻🇳';
        if (dom.heroGreetingText) {
          dom.heroGreetingText.textContent = `${data.countryName} • ${data.greeting || 'Bảng Xếp Hạng & Xu Hướng Thịnh Hành'}`;
        }
        if (dom.trendingCounter) {
          dom.trendingCounter.textContent = `${state.trendingTracks.length} bài hát`;
        }

        // Cập nhật Genre Pills
        renderGenrePills(data.genres || ['Tất cả']);

        // Hiển thị danh sách bài hát
        renderTrendingGrid(state.trendingTracks);

        // Nạp vào Queue nếu Queue đang trống
        if (state.queue.length === 0 && state.trendingTracks.length > 0) {
          state.queue = [...state.trendingTracks];
          state.queueIndex = 0;
          renderQueueDrawer();
        }
      }
    } catch (err) {
      console.error('[Load Trending Error]:', err);
      if (dom.trendingTracksGrid) {
        dom.trendingTracksGrid.innerHTML = `
          <div class="ghibli-loading-placeholder">
            <p class="loading-text">🍂 Không thể tải danh sách bài hát lúc này. Hãy thử lại sau nhé!</p>
          </div>
        `;
      }
    }
  }

  function renderGenrePills(genres) {
    if (!dom.genrePillContainer) return;
    dom.genrePillContainer.innerHTML = '';

    genres.forEach((genre, index) => {
      const btn = document.createElement('button');
      btn.className = `genre-pill-btn ${index === 0 ? 'active' : ''}`;
      btn.textContent = genre;
      btn.dataset.genre = genre;

      btn.addEventListener('click', () => {
        document.querySelectorAll('.genre-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeGenre = genre;

        if (genre === 'Tất cả' || genre === 'All' || genre === '전체' || genre === 'すべて') {
          renderTrendingGrid(state.trendingTracks);
        } else {
          // Lọc hoặc tìm kiếm theo thể loại
          filterOrSearchGenre(genre);
        }
      });

      dom.genrePillContainer.appendChild(btn);
    });
  }

  async function filterOrSearchGenre(genreName) {
    if (!genreName || genreName === 'Tất cả' || genreName === 'All' || genreName === '전체' || genreName === 'すべて') {
      renderTrendingGrid(state.trendingTracks);
      return;
    }

    try {
      showToast(`🍃 Đang khám phá: ${genreName}...`);
      const genreQueries = {
        'V-Pop': 'nhạc trẻ vpop hay nhất',
        'Nhạc Trẻ Thịnh Hành': 'nhạc trẻ thịnh hành official',
        'Indie Việt': 'indie việt chill hay nhất',
        'Vinahouse': 'vinahouse remix hot tik tok',
        'Ballad Buồn': 'nhạc ballad việt buồn tâm trạng'
      };
      const query = genreQueries[genreName] || `${genreName} hits`;
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data && data.results) {
        renderTrendingGrid(data.results);
      }
    } catch (err) {
      console.warn('[Genre search error]:', err);
    }
  }

  function renderTrendingGrid(tracks) {
    if (!dom.trendingTracksGrid) return;
    dom.trendingTracksGrid.innerHTML = '';

    if (!tracks || tracks.length === 0) {
      dom.trendingTracksGrid.innerHTML = `
        <div class="ghibli-loading-placeholder">
          <p class="loading-text">Chưa có bài hát nào phù hợp.</p>
        </div>
      `;
      return;
    }

    tracks.forEach(track => {
      const card = createSongCardElement(track, (t) => {
        playTrack(t, true);
      });
      dom.trendingTracksGrid.appendChild(card);
    });
  }

  // ==========================================================================
  // 8. SEARCH ENGINE
  // ==========================================================================
  let searchDebounceTimer = null;

  async function executeSearch(query) {
    const q = query.trim();
    if (!q) {
      if (dom.searchEmptyState) dom.searchEmptyState.classList.remove('hidden');
      if (dom.searchResultsGrid) dom.searchResultsGrid.classList.add('hidden');
      return;
    }

    // Kiểm tra nếu người dùng dán đường dẫn YouTube
    const ytMatch = q.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      const videoId = ytMatch[1];
      showToast('🕊️ Đã phát hiện liên kết YouTube! Đang nạp...');
      try {
        const infoRes = await fetch(`/api/info/${videoId}`);
        const trackInfo = await infoRes.json();
        playTrack({
          id: videoId,
          title: trackInfo.title || 'YouTube Track',
          artist: trackInfo.artist || 'YouTube',
          duration: trackInfo.duration ? formatTime(trackInfo.duration) : '3:30',
          thumbnail: trackInfo.thumbnail || 'wood_2.jpg'
        });
      } catch {
        playTrack({
          id: videoId,
          title: 'YouTube Audio Track',
          artist: 'YouTube Stream',
          duration: '3:30',
          thumbnail: 'wood_2.jpg'
        });
      }
      return;
    }

    // Tìm kiếm thông thường qua API
    if (dom.searchLoadingState) dom.searchLoadingState.classList.remove('hidden');
    if (dom.searchEmptyState) dom.searchEmptyState.classList.add('hidden');
    if (dom.searchResultsGrid) dom.searchResultsGrid.classList.add('hidden');

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (dom.searchLoadingState) dom.searchLoadingState.classList.add('hidden');

      if (data && data.results && data.results.length > 0) {
        state.searchResults = data.results;
        dom.searchResultsGrid.innerHTML = '';
        dom.searchResultsGrid.classList.remove('hidden');

        data.results.forEach(track => {
          const card = createSongCardElement(track, (t) => {
            playTrack(t, true);
          });
          dom.searchResultsGrid.appendChild(card);
        });
      } else {
        if (dom.searchEmptyState) {
          dom.searchEmptyState.innerHTML = `
            <span class="empty-icon">🍂</span>
            <h3>Không tìm thấy bài hát nào cho "${q}"</h3>
            <p>Hãy thử tìm bằng từ khóa khác xem sao nhé!</p>
          `;
          dom.searchEmptyState.classList.remove('hidden');
        }
      }
    } catch (err) {
      console.error('[Search Error]:', err);
      if (dom.searchLoadingState) dom.searchLoadingState.classList.add('hidden');
      if (dom.searchEmptyState) dom.searchEmptyState.classList.remove('hidden');
    }
  }

  // ==========================================================================
  // 8.1. REGIONAL EP / ALBUM SCANNER & ALBUM TRACKLIST MODAL (TAB PLAYLISTS)
  // ==========================================================================
  let albumSearchDebounceTimer = null;
  let currentModalAlbum = null;

  async function loadAlbumsByRegion(country = state.selectedCountry, query = '') {
    if (!dom.albumsGrid) return;

    if (dom.albumsLoadingState) dom.albumsLoadingState.classList.remove('hidden');
    if (dom.albumsEmptyState) dom.albumsEmptyState.classList.add('hidden');
    dom.albumsGrid.classList.add('hidden');

    try {
      const q = query.trim();
      const url = q
        ? `/api/albums?country=${encodeURIComponent(country)}&q=${encodeURIComponent(q)}`
        : `/api/albums?country=${encodeURIComponent(country)}`;

      const res = await fetch(url);
      const data = await res.json();

      if (dom.albumsLoadingState) dom.albumsLoadingState.classList.add('hidden');

      if (data && data.albums && data.albums.length > 0) {
        state.regionalAlbums = data.albums;
        state.albumsLoadedCountry = country;

        if (dom.albumCounterPill) {
          dom.albumCounterPill.textContent = `${data.albums.length} Đĩa Tuyển Chọn`;
        }

        if (dom.albumRegionSubtitle) {
          if (q) {
            dom.albumRegionSubtitle.textContent = `Kết quả tìm kiếm cho "${q}"`;
          } else {
            dom.albumRegionSubtitle.textContent = `Quét 10 đĩa EP & Album chính thức phát hành tại ${data.countryName || country}`;
          }
        }

        renderAlbumsGrid(data.albums);
      } else {
        state.regionalAlbums = [];
        dom.albumsGrid.innerHTML = '';
        if (dom.albumsEmptyState) {
          dom.albumsEmptyState.classList.remove('hidden');
          dom.albumsEmptyState.innerHTML = `
            <span class="empty-icon">💿</span>
            <h3>Không tìm thấy EP hay Album nào cho "${q || country}"</h3>
            <p>Hãy thử tìm bằng tên nghệ sĩ khác xem sao nhé!</p>
          `;
        }
      }
    } catch (err) {
      console.error('[Load Albums Error]:', err);
      if (dom.albumsLoadingState) dom.albumsLoadingState.classList.add('hidden');
      if (dom.albumsEmptyState) dom.albumsEmptyState.classList.remove('hidden');
    }
  }

  function renderAlbumsGrid(albums) {
    if (!dom.albumsGrid) return;
    dom.albumsGrid.innerHTML = '';
    dom.albumsGrid.classList.remove('hidden');

    albums.forEach(album => {
      const card = document.createElement('div');
      card.className = 'album-card';
      card.dataset.albumId = album.id;

      card.innerHTML = `
        <div class="album-sleeve-wrap">
          <div class="album-vinyl-disc"></div>
          <img src="${album.thumbnail || 'wood_2.jpg'}" alt="${album.title}" class="album-cover-img" loading="lazy" onerror="this.src='wood_2.jpg'">
          <button class="album-play-overlay-btn" title="Phát toàn bộ album">▶</button>
        </div>
        <h3 class="album-card-title" title="${album.title}">${album.title}</h3>
        <p class="album-card-artist" title="${album.artist}">${album.artist}</p>
        <div class="album-card-footer">
          <span class="album-card-badge">${album.type || 'Album'}</span>
          <span class="album-card-year">${album.year || ''}</span>
        </div>
      `;

      // Bấm vào nút play tròn để phát ngay toàn bộ album
      const playBtn = card.querySelector('.album-play-overlay-btn');
      if (playBtn) {
        playBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          showToast(`💿 Đang tải album: ${album.title}...`);
          await playAlbumDirectly(album.id);
        });
      }

      // Bấm vào thân thẻ để mở Modal xem chi tiết tracklist
      card.addEventListener('click', () => {
        openAlbumModal(album.id);
      });

      dom.albumsGrid.appendChild(card);
    });
  }

  async function openAlbumModal(albumId) {
    if (!dom.albumModal) return;
    dom.albumModal.classList.remove('hidden');

    if (dom.albumModalTitle) dom.albumModalTitle.textContent = 'Đang đọc đĩa than...';
    if (dom.albumModalArtist) dom.albumModalArtist.textContent = 'Xin chờ một chút...';
    if (dom.albumModalInfo) dom.albumModalInfo.textContent = '🍃 Đang kết nối thư viện...';
    if (dom.albumTrackList) {
      dom.albumTrackList.innerHTML = '<div style="text-align:center; padding: 30px; color: #7f5539; font-family: var(--font-ghibli-brand);">🍃 Đang nạp danh sách bài hát...</div>';
    }

    try {
      const res = await fetch(`/api/album/${encodeURIComponent(albumId)}`);
      const data = await res.json();

      if (data && data.album) {
        const album = data.album;
        currentModalAlbum = album;

        if (dom.albumModalCover) dom.albumModalCover.src = album.thumbnail || 'wood_2.jpg';
        if (dom.albumModalTitle) dom.albumModalTitle.textContent = album.title || 'Tên Album';
        if (dom.albumModalArtist) dom.albumModalArtist.textContent = album.artist || 'Nghệ sĩ';
        if (dom.albumModalBadge) dom.albumModalBadge.textContent = album.subtitle?.includes('EP') ? 'EP' : 'Album';
        if (dom.albumModalInfo) {
          dom.albumModalInfo.textContent = `${album.tracks?.length || 0} bài hát • ${album.subtitle || ''}`;
        }

        renderAlbumTracklist(album.tracks || []);
      }
    } catch (err) {
      console.error('[Open Album Error]:', err);
      if (dom.albumModalTitle) dom.albumModalTitle.textContent = 'Không thể nạp Album';
      if (dom.albumTrackList) {
        dom.albumTrackList.innerHTML = '<div style="text-align:center; padding: 20px; color: #b7094c;">Gặp lỗi khi lấy danh sách bài hát.</div>';
      }
    }
  }

  function renderAlbumTracklist(tracks) {
    if (!dom.albumTrackList) return;
    dom.albumTrackList.innerHTML = '';

    if (tracks.length === 0) {
      dom.albumTrackList.innerHTML = '<div style="text-align:center; padding: 20px; color: #7f5539;">Chưa có danh sách bài hát</div>';
      return;
    }

    tracks.forEach((track, idx) => {
      const row = document.createElement('div');
      row.className = 'album-track-item';

      row.innerHTML = `
        <span class="album-track-num">${idx + 1}</span>
        <div class="album-track-main">
          <div class="album-track-title">${track.title}</div>
          <div class="album-track-artist">${track.artist || ''}</div>
        </div>
        <span class="album-track-dur">${track.duration || '3:30'}</span>
        <button class="album-track-play-btn" title="Phát bài này">▶</button>
      `;

      row.addEventListener('click', () => {
        state.queue = [...tracks];
        state.queueIndex = idx;
        renderQueueDrawer();
        playTrack(track, false);
      });

      dom.albumTrackList.appendChild(row);
    });
  }

  function closeAlbumModal() {
    if (dom.albumModal) {
      dom.albumModal.classList.add('hidden');
    }
  }

  function playEntireAlbum(tracks) {
    if (!tracks || tracks.length === 0) return;
    state.queue = [...tracks];
    state.queueIndex = 0;
    renderQueueDrawer();
    playTrack(tracks[0], false);
    showToast(`💿 Đang phát toàn bộ album (${tracks.length} bài hát)!`);
  }

  async function playAlbumDirectly(albumId) {
    try {
      const res = await fetch(`/api/album/${encodeURIComponent(albumId)}`);
      const data = await res.json();
      if (data && data.album && data.album.tracks?.length > 0) {
        playEntireAlbum(data.album.tracks);
      } else {
        showToast('🍃 Không tìm thấy bài hát trong album này.');
      }
    } catch {
      showToast('⚠️ Không thể phát album lúc này.');
    }
  }

  // ==========================================================================
  // 9. QUEUE DRAWER & ACORN CUSTOM LOOP
  // ==========================================================================
  function renderQueueDrawer() {
    if (!dom.queueListContainer) return;
    dom.queueListContainer.innerHTML = '';

    if (dom.queueCounterBadge) {
      dom.queueCounterBadge.textContent = `${state.queue.length} bài`;
    }

    if (state.queue.length === 0) {
      dom.queueListContainer.innerHTML = `
        <li style="padding: 20px; text-align: center; color: #7f5539; font-size: 0.9rem;">
          Hàng đợi đang trống 🍃
        </li>
      `;
      return;
    }

    state.queue.forEach((track, idx) => {
      const li = document.createElement('li');
      li.className = `nature-song-card ${track.id === state.currentTrack?.id ? 'active' : ''}`;

      const isAcornChecked = state.customLoopIds.has(track.id);

      li.innerHTML = `
        <div class="card-left-group">
          <!-- Checkbox Hạt Dẻ -->
          <label class="acorn-checkbox-wrapper" title="Tích để lặp bài này trong chế độ Hạt Dẻ 🌰">
            <input type="checkbox" class="acorn-checkbox-input" ${isAcornChecked ? 'checked' : ''}>
            <span class="acorn-checkbox-icon"></span>
          </label>
          <span class="leaf-num-stamp">${idx + 1}</span>
          <div class="card-song-details" title="${track.title}">
            <span class="card-title">${track.title}</span>
            <span class="card-subtext">${track.artist || ''} • ${track.duration || ''}</span>
          </div>
        </div>
      `;

      // Checkbox event
      const chk = li.querySelector('.acorn-checkbox-input');
      chk.addEventListener('change', (e) => {
        e.stopPropagation();
        if (chk.checked) {
          state.customLoopIds.add(track.id);
          showToast(`🌰 Đã thêm vào vòng lặp Hạt Dẻ: ${track.title}`);
        } else {
          state.customLoopIds.delete(track.id);
        }
      });

      // Click card to play
      li.addEventListener('click', (e) => {
        if (e.target.closest('.acorn-checkbox-wrapper')) return;
        state.queueIndex = idx;
        playTrack(track, false);
      });

      dom.queueListContainer.appendChild(li);
    });
  }

  // ==========================================================================
  // 10. FAVORITES (YOUR LIBRARY)
  // ==========================================================================
  function loadFavorites() {
    try {
      const stored = localStorage.getItem('ghibli_favorites');
      state.favorites = stored ? JSON.parse(stored) : [];
      if (dom.favCounter) dom.favCounter.textContent = `${state.favorites.length} bài`;
      renderFavorites();
    } catch {
      state.favorites = [];
    }
  }

  function toggleFavorite(track) {
    if (!track || !track.id) return;
    const idx = state.favorites.findIndex(t => t.id === track.id);
    if (idx !== -1) {
      state.favorites.splice(idx, 1);
      showToast('🌱 Đã bỏ thích bài hát.');
    } else {
      state.favorites.push(track);
      showToast('💚 Đã lưu vào Khu Vườn Yêu Thích!');
    }

    try {
      localStorage.setItem('ghibli_favorites', JSON.stringify(state.favorites));
    } catch (_) {}

    if (dom.favCounter) dom.favCounter.textContent = `${state.favorites.length} bài`;
    updateLikeButtonUI(track.id);
    renderFavorites();
  }

  function updateLikeButtonUI(trackId) {
    if (!dom.likeBtn) return;
    const isFav = state.favorites.some(t => t.id === trackId);
    dom.likeBtn.textContent = isFav ? '💚' : '🤍';
  }

  function renderFavorites() {
    if (!dom.favoriteTracksGrid) return;
    dom.favoriteTracksGrid.innerHTML = '';

    if (state.favorites.length === 0) {
      dom.favoriteTracksGrid.innerHTML = `
        <div class="search-empty-prompt">
          <span class="empty-icon">🌱</span>
          <h3>Chưa có bài hát yêu thích nào</h3>
          <p>Bấm biểu tượng trái tim 💚 ở thanh phát nhạc để lưu vào đây nhé!</p>
        </div>
      `;
      return;
    }

    state.favorites.forEach(track => {
      const card = createSongCardElement(track, (t) => {
        playTrack(t, true);
      });
      dom.favoriteTracksGrid.appendChild(card);
    });
  }

  // ==========================================================================
  // 11. SỰ KIỆN TOÀN CỤC & SETUP
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

    // Resize window
    window.addEventListener('resize', () => {
      const activeItem = document.querySelector('.sidebar-nav-item.active');
      if (activeItem) moveWoodSliderToItem(activeItem, false);
    });

    // Country Dropdown
    if (dom.countrySelectDropdown) {
      dom.countrySelectDropdown.addEventListener('change', (e) => {
        const country = e.target.value;
        showToast(`🌐 Đang chuyển sang bảng xếp hạng ${country}...`);
        loadTrendingMusic(country);
        loadAlbumsByRegion(country);
      });
    }

    // Quick search from Home top bar
    if (dom.homeQuickSearchInput) {
      dom.homeQuickSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = dom.homeQuickSearchInput.value;
          if (val.trim()) {
            switchTab('search');
            if (dom.mainSearchInput) dom.mainSearchInput.value = val;
            executeSearch(val);
          }
        }
      });
    }

    // Main search input in Search View
    if (dom.mainSearchInput) {
      dom.mainSearchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (dom.clearSearchBtn) {
          dom.clearSearchBtn.classList.toggle('hidden', !val);
        }

        // Icon bưu chính 🕊️ khi dán link YouTube
        if (/youtube\.com|youtu\.be/i.test(val)) {
          if (dom.searchTypeIcon) dom.searchTypeIcon.textContent = '🕊️';
        } else {
          if (dom.searchTypeIcon) dom.searchTypeIcon.textContent = '🔍';
        }

        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
          executeSearch(val);
        }, 400);
      });
    }

    if (dom.clearSearchBtn) {
      dom.clearSearchBtn.addEventListener('click', () => {
        if (dom.mainSearchInput) {
          dom.mainSearchInput.value = '';
          dom.clearSearchBtn.classList.add('hidden');
          executeSearch('');
        }
      });
    }

    // Album Search Input in Playlists / Albums View
    if (dom.albumSearchInput) {
      dom.albumSearchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (dom.clearAlbumSearchBtn) {
          dom.clearAlbumSearchBtn.classList.toggle('hidden', !val);
        }
        clearTimeout(albumSearchDebounceTimer);
        albumSearchDebounceTimer = setTimeout(() => {
          loadAlbumsByRegion(state.selectedCountry, val);
        }, 400);
      });
    }

    if (dom.clearAlbumSearchBtn) {
      dom.clearAlbumSearchBtn.addEventListener('click', () => {
        if (dom.albumSearchInput) {
          dom.albumSearchInput.value = '';
          dom.clearAlbumSearchBtn.classList.add('hidden');
          loadAlbumsByRegion(state.selectedCountry, '');
        }
      });
    }

    // Album Tracklist Modal Events
    if (dom.closeAlbumModalBtn) {
      dom.closeAlbumModalBtn.addEventListener('click', closeAlbumModal);
    }

    if (dom.albumModal) {
      dom.albumModal.addEventListener('click', (e) => {
        if (e.target === dom.albumModal) {
          closeAlbumModal();
        }
      });
    }

    if (dom.playAlbumAllBtn) {
      dom.playAlbumAllBtn.addEventListener('click', () => {
        if (currentModalAlbum && currentModalAlbum.tracks && currentModalAlbum.tracks.length > 0) {
          playEntireAlbum(currentModalAlbum.tracks);
          closeAlbumModal();
        } else {
          showToast('🍃 Không có bài hát để phát.');
        }
      });
    }

    if (dom.queueAlbumAllBtn) {
      dom.queueAlbumAllBtn.addEventListener('click', () => {
        if (currentModalAlbum && currentModalAlbum.tracks && currentModalAlbum.tracks.length > 0) {
          currentModalAlbum.tracks.forEach(t => {
            if (!state.queue.some(q => q.id === t.id)) {
              state.queue.push(t);
            }
          });
          renderQueueDrawer();
          showToast(`🌰 Đã thêm ${currentModalAlbum.tracks.length} bài hát vào danh sách chờ!`);
          closeAlbumModal();
        } else {
          showToast('🍃 Không có bài hát để thêm vào danh sách chờ.');
        }
      });
    }

    // Audio Element Events
    if (dom.audio) {
      dom.audio.addEventListener('timeupdate', () => {
        if (state.activeEngine === 'audio' && !state.isScrubbing && dom.audio.duration) {
          const percent = (dom.audio.currentTime / dom.audio.duration) * 100;
          updateProgressUI(percent);
          if (dom.currentTime) dom.currentTime.textContent = formatTime(dom.audio.currentTime);
        }
      });

      dom.audio.addEventListener('loadedmetadata', () => {
        if (state.activeEngine === 'audio' && dom.totalDuration && dom.audio.duration) {
          dom.totalDuration.textContent = formatTime(dom.audio.duration);
        }
      });

      dom.audio.addEventListener('playing', () => {
        state.isPlaying = true;
        state.consecutiveErrors = 0;
        document.body.classList.add('music-playing');
        if (dom.playIcon) dom.playIcon.classList.add('hidden');
        if (dom.pauseIcon) dom.pauseIcon.classList.remove('hidden');
      });

      dom.audio.addEventListener('pause', () => {
        if (state.activeEngine === 'audio') {
          state.isPlaying = false;
          document.body.classList.remove('music-playing');
          if (dom.playIcon) dom.playIcon.classList.remove('hidden');
          if (dom.pauseIcon) dom.pauseIcon.classList.add('hidden');
        }
      });

      dom.audio.addEventListener('ended', () => {
        if (state.activeEngine !== 'audio') return;
        if (state.loopMode === 'one') {
          dom.audio.currentTime = 0;
          dom.audio.play().catch(() => {});
        } else {
          playNextTrack();
        }
      });

      dom.audio.addEventListener('error', () => {
        // Bỏ qua nếu audio element đã bị gỡ src hoặc engine hiện tại không dùng audio
        if (state.activeEngine !== 'audio') return;
        if (!dom.audio.currentSrc && !dom.audio.src) return;
        if (dom.audio.src === window.location.href || dom.audio.src.endsWith('/')) return;

        console.warn('[Audio Playback Error]:', dom.audio.error);

        // Fallback: Thử chuyển sang YouTube Engine nếu có sẵn
        if (state.currentTrack?.id && !state.currentTrack.id.startsWith('itunes_') && ytPlayer && isYtReady && typeof ytPlayer.loadVideoById === 'function') {
          console.log('🔄 Đang chuyển sang YouTube Engine dự phòng...');
          state.activeEngine = 'youtube';
          ytPlayer.loadVideoById(state.currentTrack.id);
          ytPlayer.playVideo();
          return;
        }

        state.isPlaying = false;
        document.body.classList.remove('music-playing');
        if (dom.playIcon) dom.playIcon.classList.remove('hidden');
        if (dom.pauseIcon) dom.pauseIcon.classList.add('hidden');

        state.consecutiveErrors = (state.consecutiveErrors || 0) + 1;
        if (state.consecutiveErrors >= 3) {
          showToast('🍂 Không thể phát các bài hát này. Vui lòng thử lại sau.');
          state.consecutiveErrors = 0;
          return;
        }

        showToast('🍂 Bài hát này tạm thời gặp sự cố luồng. Đang tự động chuyển bài tiếp theo...');
        setTimeout(() => {
          playNextTrack();
        }, 1500);
      });
    }

    // Play/Pause button
    if (dom.playPauseBtn) {
      dom.playPauseBtn.addEventListener('click', togglePlayPause);
    }

    // Next / Prev buttons
    if (dom.nextBtn) dom.nextBtn.addEventListener('click', playNextTrack);
    if (dom.prevBtn) dom.prevBtn.addEventListener('click', playPrevTrack);

    // Shuffle & Loop
    if (dom.shuffleBtn) {
      dom.shuffleBtn.addEventListener('click', () => {
        state.isShuffle = !state.isShuffle;
        dom.shuffleBtn.classList.toggle('active', state.isShuffle);
        showToast(state.isShuffle ? '🔀 Chế độ: Phát ngẫu nhiên BẬT' : '➡ Chế độ: Phát ngẫu nhiên TẮT');
      });
    }

    if (dom.loopBtn) {
      dom.loopBtn.addEventListener('click', cycleLoopMode);
    }

    // Like button
    if (dom.likeBtn) {
      dom.likeBtn.addEventListener('click', () => {
        if (state.currentTrack) toggleFavorite(state.currentTrack);
      });
    }

    // Volume & Mute
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
        if (state.isScrubbing) handleScrub(e);
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

    // Queue Drawer Toggle
    if (dom.queueToggleBtn) {
      dom.queueToggleBtn.addEventListener('click', () => {
        if (dom.playlistDrawer) {
          dom.playlistDrawer.classList.toggle('hidden');
          renderQueueDrawer();
        }
      });
    }

    if (dom.closeDrawerBtn) {
      dom.closeDrawerBtn.addEventListener('click', () => {
        if (dom.playlistDrawer) dom.playlistDrawer.classList.add('hidden');
      });
    }

    if (dom.clearQueueBtn) {
      dom.clearQueueBtn.addEventListener('click', () => {
        state.queue = state.currentTrack ? [state.currentTrack] : [];
        state.queueIndex = 0;
        state.customLoopIds.clear();
        renderQueueDrawer();
        showToast('🍃 Đã dọn dẹp hàng đợi.');
      });
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'n' || e.key === 'N') {
        playNextTrack();
      } else if (e.key === 'p' || e.key === 'P') {
        playPrevTrack();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 'l' || e.key === 'L') {
        cycleLoopMode();
      } else if (e.key === 's' || e.key === 'S') {
        if (dom.shuffleBtn) dom.shuffleBtn.click();
      }
    });
  }

  // Khởi động
  function init() {
    setVolume(0.8);
    setupEvents();
    loadFavorites();

    // Khởi tạo tab Home
    const defaultTab = document.getElementById('tabHome') || dom.sidebarNavItems[0];
    if (defaultTab) {
      moveWoodSliderToItem(defaultTab, false);
      switchTab('home');
      setTimeout(() => moveWoodSliderToItem(defaultTab, false), 80);
      setTimeout(() => moveWoodSliderToItem(defaultTab, false), 300);
    }

    // Tự động tải danh sách thịnh hành theo Geo-IP (Việt Nam 🇻🇳)
    loadTrendingMusic();
  }

  // Expose
  window.activatePlayerBar = activatePlayerBar;
  window.playTrack = playTrack;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
