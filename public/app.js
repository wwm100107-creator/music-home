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
    albumsLoadedCountry: null,
    communityTracks: [],
    communityLoaded: false,
    currentTimeframe: 'daily'
  };

  // Cache DOM
  const dom = {
    audio: document.getElementById('audioElement'),

    // Navigation & Tabs
    sidebar: document.getElementById('sidebar'),
    sidebarBackdrop: document.getElementById('sidebarBackdrop'),
    sidebarCloseBtn: document.getElementById('sidebarCloseBtn'),
    mobileTopBar: document.getElementById('mobileTopBar'),
    mobileMenuToggleBtn: document.getElementById('mobileMenuToggleBtn'),
    mobileSearchQuickBtn: document.getElementById('mobileSearchQuickBtn'),
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
    chartTimeframeSwitch: document.getElementById('chartTimeframeSwitch'),
    timeframeDailyBtn: document.getElementById('timeframeDailyBtn'),
    timeframeWeeklyBtn: document.getElementById('timeframeWeeklyBtn'),
    trendingSectionTitle: document.getElementById('trendingSectionTitle'),
    trendingCounter: document.getElementById('trendingCounter'),
    trendingTracksGrid: document.getElementById('trendingTracksGrid'),
    ambientModeBtn: document.getElementById('ambientModeBtn'),
    ambientModeText: document.getElementById('ambientModeText'),

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

    // Album In-Page Detail View & Controls
    albumsMainView: document.getElementById('albumsMainView'),
    albumDetailView: document.getElementById('albumDetailView'),
    albumBackToGridBtn: document.getElementById('albumBackToGridBtn'),
    albumDetailCover: document.getElementById('albumDetailCover'),
    albumDetailBadge: document.getElementById('albumDetailBadge'),
    albumDetailYear: document.getElementById('albumDetailYear'),
    albumDetailTitle: document.getElementById('albumDetailTitle'),
    albumDetailArtist: document.getElementById('albumDetailArtist'),
    albumDetailDesc: document.getElementById('albumDetailDesc'),
    albumDetailPlayAllBtn: document.getElementById('albumDetailPlayAllBtn'),
    albumDetailQueueAllBtn: document.getElementById('albumDetailQueueAllBtn'),
    albumDetailLoading: document.getElementById('albumDetailLoading'),
    albumDetailTracksList: document.getElementById('albumDetailTracksList'),
    albumHeroVinylDisc: document.getElementById('albumHeroVinylDisc'),

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
    // Drop Your Music View & Controls
    audioDropZone: document.getElementById('audioDropZone'),
    dropAudioFileInput: document.getElementById('dropAudioFileInput'),
    browseAudioFileBtn: document.getElementById('browseAudioFileBtn'),
    dropSelectedBanner: document.getElementById('dropSelectedBanner'),
    selectedFileName: document.getElementById('selectedFileName'),
    selectedFileDetails: document.getElementById('selectedFileDetails'),
    dropAudioPreviewElement: document.getElementById('dropAudioPreviewElement'),
    removeSelectedFileBtn: document.getElementById('removeSelectedFileBtn'),
    dropSongTitle: document.getElementById('dropSongTitle'),
    dropSongArtist: document.getElementById('dropSongArtist'),
    dropThemeFileInput: document.getElementById('dropThemeFileInput'),
    customThemeDropZone: document.getElementById('customThemeDropZone'),
    themePreviewWrap: document.getElementById('themePreviewWrap'),
    customCoverPreviewImg: document.getElementById('customCoverPreviewImg'),
    customThemeFileName: document.getElementById('customThemeFileName'),
    customThemeEmpty: document.getElementById('customThemeEmpty'),
    removeCustomThemeBtn: document.getElementById('removeCustomThemeBtn'),
    dropSubmitBtn: document.getElementById('dropSubmitBtn'),
    dropSubmitLoading: document.getElementById('dropSubmitLoading'),
    dropCommunityCounterPill: document.getElementById('dropCommunityCounterPill'),
    refreshCommunityTracksBtn: document.getElementById('refreshCommunityTracksBtn'),
    communityTracksGrid: document.getElementById('communityTracksGrid'),
    communityEmptyState: document.getElementById('communityEmptyState'),

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

  // Nâng cấp độ phân giải hình ảnh sắc nét cao (High-Res 800x800)
  function upgradeThumbnailUrl(url) {
    if (!url || typeof url !== 'string') return 'wood_2.jpg';
    if (url.includes('googleusercontent.com')) {
      if (/=w\d+-h\d+[^"']*/.test(url)) {
        return url.replace(/=w\d+-h\d+[^"']*/, '=w800-h800-l90-rj');
      }
      if (/=s\d+[^"']*/.test(url)) {
        return url.replace(/=s\d+[^"']*/, '=s800-l90-rj');
      }
      return url + '=w800-h800-l90-rj';
    }
    if (url.includes('i.ytimg.com/vi/')) {
      return url.replace(/\/(default|mqdefault|sddefault)\.jpg/, '/hqdefault.jpg');
    }
    return url;
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

    if (tabKey === 'create') {
      if (!state.communityLoaded || !state.communityTracks || state.communityTracks.length === 0) {
        loadCommunityTracks();
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
      dom.currentTrackCover.src = upgradeThumbnailUrl(track.thumbnail);
      dom.currentTrackCover.classList.remove('cover-fade-in');
      void dom.currentTrackCover.offsetWidth;
      dom.currentTrackCover.classList.add('cover-fade-in');
    }

    if (dom.totalDuration) {
      dom.totalDuration.textContent = track.duration || '00:00';
    }

    updateLikeButtonUI(track.id);
    highlightActiveCard(track.id);
    updateMediaSession(track);
  }

  function setPlaybackVisualState(isPlaying) {
    state.isPlaying = !!isPlaying;
    updateMediaSessionPlaybackState(isPlaying);
    if (isPlaying) {
      document.body.classList.add('music-playing');
      if (dom.playIcon) dom.playIcon.classList.add('hidden');
      if (dom.pauseIcon) dom.pauseIcon.classList.remove('hidden');
      if (dom.calciferFlame) {
        dom.calciferFlame.classList.add('calcifer-dancing');
        dom.calciferFlame.classList.remove('calcifer-sleeping');
      }
    } else {
      document.body.classList.remove('music-playing');
      if (dom.playIcon) dom.playIcon.classList.remove('hidden');
      if (dom.pauseIcon) dom.pauseIcon.classList.add('hidden');
      if (dom.calciferFlame) {
        dom.calciferFlame.classList.remove('calcifer-dancing');
        dom.calciferFlame.classList.add('calcifer-sleeping');
      }
    }
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
              setPlaybackVisualState(true);
              state.consecutiveErrors = 0;
              const dur = ytPlayer.getDuration();
              if (dur && dom.totalDuration) dom.totalDuration.textContent = formatTime(dur);
            } else if (event.data === 2) {
              if (state.activeEngine === 'youtube') {
                setPlaybackVisualState(false);
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
                setPlaybackVisualState(true);
                state.consecutiveErrors = 0;
              }).catch(() => {
                setPlaybackVisualState(false);
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

          // Tự động đồng bộ thời lượng thực tế của Official Music Video với danh sách bài hát
          if (state.currentTrack && state.currentTrack.durationSec !== Math.round(dur)) {
            state.currentTrack.durationSec = Math.round(dur);
            state.currentTrack.duration = formatTime(dur);
            if (dom.albumDetailTracksList) {
              const matchedRow = dom.albumDetailTracksList.querySelector(`.album-detail-track-row[data-track-id="${state.currentTrack.id}"]`);
              if (matchedRow) {
                const durCol = matchedRow.querySelector('.col-duration');
                if (durCol) durCol.textContent = formatTime(dur);
              }
            }
          }
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

    // Dọn dẹp / dừng YouTube video nếu đang phát để tránh trùng lặp âm thanh
    if (ytPlayer && isYtReady && typeof ytPlayer.stopVideo === 'function') {
      ytPlayer.stopVideo();
    }

    // 1. Luồng âm thanh trực tiếp (Direct Audio từ Drop Your Music, Catbox, iTunes preview)
    const directAudioSource = track.audioUrl || track.streamUrl || track.previewUrl;
    const finalAudioSrc = directAudioSource || `/api/stream/${track.id}`;

    // 2. ƯU TIÊN HÀNG ĐẦU: NATIVE HTML5 AUDIO ENGINE
    // Đây là chìa khóa then chốt để phát nhạc chạy ngầm (Background Playback)
    // khi tắt màn hình, khóa máy hoặc chuyển ứng dụng trên iOS (iPhone/iPad) & Android
    // giống hệt Spotify / Apple Music / NhacCuaTui.
    state.activeEngine = 'audio';
    dom.audio.src = finalAudioSrc;
    dom.audio.load();

    const playPromise = dom.audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        setPlaybackVisualState(true);
        state.consecutiveErrors = 0;
        updateMediaSession(track);
      }).catch(audioErr => {
        console.warn('[Native Audio Engine Warning]:', audioErr.message);

        // Fallback dự phòng sang YouTube Iframe Engine nếu stream trực tiếp bị lỗi hoặc từ chối
        if (ytPlayer && isYtReady && typeof ytPlayer.loadVideoById === 'function' && !directAudioSource) {
          console.log('🔄 Đang chuyển sang YouTube Engine dự phòng...');
          state.activeEngine = 'youtube';
          ytPlayer.loadVideoById(track.id);
          ytPlayer.playVideo();
          setPlaybackVisualState(true);
          state.consecutiveErrors = 0;
          updateMediaSession(track);
        } else {
          setPlaybackVisualState(false);
        }
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

    if (state.activeEngine === 'audio') {
      if (dom.audio.paused) {
        dom.audio.play().then(() => {
          setPlaybackVisualState(true);
        }).catch(() => {});
      } else {
        dom.audio.pause();
        setPlaybackVisualState(false);
      }
      return;
    }

    if (state.activeEngine === 'youtube' && ytPlayer && isYtReady && typeof ytPlayer.getPlayerState === 'function') {
      const pState = ytPlayer.getPlayerState();
      if (pState === 1) { // Đang phát -> Tạm dừng
        ytPlayer.pauseVideo();
        setPlaybackVisualState(false);
      } else { // Đang dừng -> Phát
        ytPlayer.playVideo();
        setPlaybackVisualState(true);
      }
      return;
    }

    if (dom.audio.src) {
      if (dom.audio.paused) {
        dom.audio.play().then(() => {
          setPlaybackVisualState(true);
        }).catch(() => {});
      } else {
        dom.audio.pause();
        setPlaybackVisualState(false);
      }
    }
  }

  function playNextTrack() {
    if (state.queue.length === 0 && state.trendingTracks.length === 0) return;

    // Chế độ phát hạt dẻ (Acorn Custom Loop)
    if (state.loopMode === 'acorn') {
      const acornIds = getAcornSelectedIds();
      if (acornIds.length > 0) {
        const acornTracks = state.queue.filter(t => acornIds.includes(t.id));
        if (acornTracks.length > 0) {
          const currentAcornIdx = acornTracks.findIndex(t => t.id === state.currentTrack?.id);
          const nextAcornIdx = (currentAcornIdx + 1) % acornTracks.length;
          playTrack(acornTracks[nextAcornIdx], false);
          return;
        }
      }
    }

    if (state.isShuffle && state.queue.length > 0) {
      let randIdx = Math.floor(Math.random() * state.queue.length);
      state.queueIndex = randIdx;
      playTrack(state.queue[randIdx], false);
      return;
    }

    if (state.queueIndex < state.queue.length - 1) {
      state.queueIndex++;
      playTrack(state.queue[state.queueIndex], false);
    } else if (state.queue.length <= 1 && state.trendingTracks.length > 1) {
      // Tự động chuyển bài tiếp theo trong bảng xếp hạng khi khóa màn hình
      const currIdx = state.trendingTracks.findIndex(t => t.id === state.currentTrack?.id);
      if (currIdx !== -1 && currIdx < state.trendingTracks.length - 1) {
        playTrack(state.trendingTracks[currIdx + 1], true);
      } else if (state.loopMode === 'all') {
        playTrack(state.trendingTracks[0], true);
      } else {
        showToast('🍃 Đã hết danh sách bài hát.');
      }
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

    let rankHtml = '';
    if (track.rank) {
      let rankClass = 'rank-other';
      let rankLabel = `#${track.rank}`;
      if (track.rank === 1) {
        rankClass = 'rank-gold';
        rankLabel = '🥇 1';
      } else if (track.rank === 2) {
        rankClass = 'rank-silver';
        rankLabel = '🥈 2';
      } else if (track.rank === 3) {
        rankClass = 'rank-bronze';
        rankLabel = '🥉 3';
      }
      rankHtml = `<span class="chart-rank-badge ${rankClass}" title="Hạng #${track.rank}">${rankLabel}</span>`;
    }

    const playCountText = track.playCount || (track.views ? `${(track.views / 1e6).toFixed(1)}M lượt nghe` : null);
    const playCountHtml = playCountText
      ? `<span class="track-card-views" title="Lượt nghe thực tế">${playCountText.startsWith('🔥') || playCountText.startsWith('📈') ? playCountText : `🔥 ${playCountText}`}</span>`
      : '';

    card.innerHTML = `
      <div class="track-card-thumb-shell">
        <img src="${track.thumbnail || 'wood_2.jpg'}" alt="${track.title}" class="track-card-img" loading="lazy">
        ${rankHtml}
        <div class="track-card-play-overlay">
          <span class="play-icon-triangle">▶</span>
        </div>
      </div>
      <div class="track-card-info">
        <span class="track-card-title" title="${track.title}">${track.title}</span>
        <span class="track-card-artist" title="${track.artist}">${track.artist || 'Nghệ sĩ'}</span>
        <div class="track-card-meta-row">
          <span class="track-card-duration">${track.duration || '3:30'}</span>
          ${playCountHtml}
        </div>
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
  // 7. GEO-IP & TRENDING ENGINE (DAILY 24H & WEEKLY CHARTS)
  // ==========================================================================
  async function loadTrendingMusic(countryCode = null, timeframe = null) {
    try {
      if (timeframe) {
        state.currentTimeframe = timeframe;
      }
      const curTimeframe = state.currentTimeframe || 'daily';

      // Cập nhật trạng thái active của timeframe switch buttons
      if (dom.timeframeDailyBtn && dom.timeframeWeeklyBtn) {
        dom.timeframeDailyBtn.classList.toggle('active', curTimeframe === 'daily');
        dom.timeframeWeeklyBtn.classList.toggle('active', curTimeframe === 'weekly');
      }

      if (dom.trendingTracksGrid) {
        dom.trendingTracksGrid.innerHTML = `
          <div class="ghibli-loading-placeholder">
            <div class="loading-leaf-spinner">🌿</div>
            <p class="loading-text">Đang cập nhật bảng xếp hạng ${curTimeframe === 'weekly' ? 'tuần này (7 ngày)' : 'hôm nay (24h)'}...</p>
          </div>
        `;
      }

      const clientTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh';
      const targetCountry = countryCode || state.selectedCountry || '';
      const url = targetCountry
        ? `/api/trending?country=${targetCountry}&timeframe=${curTimeframe}`
        : `/api/trending?tz=${encodeURIComponent(clientTz)}&timeframe=${curTimeframe}`;

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
          const tfLabel = curTimeframe === 'weekly' ? 'Bảng Xếp Hạng Tuần Này (7 Ngày)' : 'Bảng Xếp Hạng Hôm Nay (24h)';
          dom.heroGreetingText.textContent = `${data.countryName} • ${tfLabel}`;
        }
        if (dom.trendingCounter) {
          dom.trendingCounter.textContent = `Top ${state.trendingTracks.length} bài (${curTimeframe === 'weekly' ? 'Tuần' : 'Ngày'})`;
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
          <img src="${upgradeThumbnailUrl(album.thumbnail)}" alt="${album.title}" class="album-cover-img" loading="lazy" onerror="this.src='wood_2.jpg'">
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

      // Bấm vào thân thẻ để chuyển sang chế độ Xem Chi Tiết EP / Album (in-page view)
      card.addEventListener('click', () => {
        openAlbumDetailView(album.id, album);
      });

      dom.albumsGrid.appendChild(card);
    });
  }

  let currentAlbumDetail = null;

  async function openAlbumDetailView(albumId, initialData = null) {
    if (!dom.albumDetailView || !dom.albumsMainView) return;

    // Chuyển mượt mà giữa Grid và Detail View
    dom.albumsMainView.classList.add('hidden');
    dom.albumDetailView.classList.remove('hidden');

    // Cuộn lên đầu trang
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Hiển thị trước metadata đã có từ card để giao diện phản hồi tức thì
    if (initialData) {
      if (dom.albumDetailCover) dom.albumDetailCover.src = upgradeThumbnailUrl(initialData.thumbnail);
      if (dom.albumDetailTitle) dom.albumDetailTitle.textContent = initialData.title || 'Đang tải...';
      if (dom.albumDetailArtist) dom.albumDetailArtist.textContent = initialData.artist || 'Nghệ sĩ';
      if (dom.albumDetailBadge) dom.albumDetailBadge.textContent = initialData.type || 'Album';
      if (dom.albumDetailYear) dom.albumDetailYear.textContent = initialData.year || '';
      if (dom.albumDetailDesc) dom.albumDetailDesc.textContent = 'Toàn bộ danh sách bài hát chính thức theo thứ tự đĩa phát hành';
    } else {
      if (dom.albumDetailTitle) dom.albumDetailTitle.textContent = 'Đang đọc đĩa than...';
      if (dom.albumDetailArtist) dom.albumDetailArtist.textContent = 'Xin chờ một chút...';
    }

    if (dom.albumDetailLoading) dom.albumDetailLoading.classList.remove('hidden');
    if (dom.albumDetailTracksList) dom.albumDetailTracksList.innerHTML = '';

    try {
      const res = await fetch(`/api/album/${encodeURIComponent(albumId)}`);
      const data = await res.json();

      if (dom.albumDetailLoading) dom.albumDetailLoading.classList.add('hidden');

      if (data && data.album) {
        const album = data.album;
        currentAlbumDetail = album;

        if (dom.albumDetailCover) dom.albumDetailCover.src = upgradeThumbnailUrl(album.thumbnail);
        if (dom.albumDetailTitle) dom.albumDetailTitle.textContent = album.title || 'Tên Album';
        if (dom.albumDetailArtist) dom.albumDetailArtist.textContent = album.artist || 'Nghệ sĩ';
        if (dom.albumDetailBadge) dom.albumDetailBadge.textContent = album.type || (album.subtitle?.includes('EP') ? 'EP' : 'Album');
        if (dom.albumDetailYear) dom.albumDetailYear.textContent = album.year || '';
        if (dom.albumDetailDesc) {
          dom.albumDetailDesc.textContent = `${album.tracks?.length || 0} bài hát theo thứ tự chuẩn • ${album.subtitle || 'Chính thức'}`;
        }

        renderAlbumDetailTracks(album.tracks || []);
      } else {
        if (dom.albumDetailTracksList) {
          dom.albumDetailTracksList.innerHTML = '<div style="text-align:center; padding: 30px; color: #b7094c;">Không tìm thấy thông tin bài hát trong album này.</div>';
        }
      }
    } catch (err) {
      console.error('[Open Album Detail Error]:', err);
      if (dom.albumDetailLoading) dom.albumDetailLoading.classList.add('hidden');
      if (dom.albumDetailTracksList) {
        dom.albumDetailTracksList.innerHTML = '<div style="text-align:center; padding: 30px; color: #b7094c;">Gặp lỗi khi lấy danh sách bài hát. Vui lòng thử lại!</div>';
      }
    }
  }

  function closeAlbumDetailView() {
    if (dom.albumDetailView && dom.albumsMainView) {
      dom.albumDetailView.classList.add('hidden');
      dom.albumsMainView.classList.remove('hidden');
    }
  }

  function renderAlbumDetailTracks(tracks) {
    if (!dom.albumDetailTracksList) return;
    dom.albumDetailTracksList.innerHTML = '';

    if (!tracks || tracks.length === 0) {
      dom.albumDetailTracksList.innerHTML = '<div style="text-align:center; padding: 30px; color: #7f5539;">Đĩa này chưa có bài hát nào được liệt kê</div>';
      return;
    }

    tracks.forEach((track, idx) => {
      const row = document.createElement('div');
      row.className = 'album-detail-track-row';
      row.dataset.trackId = track.id;
      if (state.currentTrack && state.currentTrack.id === track.id) {
        row.classList.add('is-active');
      }

      row.innerHTML = `
        <span class="col-num">${idx + 1}</span>
        <div class="col-main">
          <div class="col-title" title="${track.title}">${track.title}</div>
          <div class="col-artist" title="${track.artist || ''}">${track.artist || ''}</div>
        </div>
        <span class="col-duration">${track.duration || '3:30'}</span>
        <div class="col-action">
          <button class="album-detail-track-play-btn" title="Phát bài này">▶</button>
        </div>
      `;

      row.addEventListener('click', () => {
        state.queue = [...tracks];
        state.queueIndex = idx;
        renderQueueDrawer();
        playTrack(track, false);

        document.querySelectorAll('.album-detail-track-row').forEach(r => r.classList.remove('is-active'));
        row.classList.add('is-active');
      });

      dom.albumDetailTracksList.appendChild(row);
    });
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
  // 8.2. DROP YOUR MUSIC: MULTI-DEVICE COMMUNITY AUDIO & THEME STUDIO
  // ==========================================================================
  let selectedAudioFile = null;
  let selectedThemeFile = null;
  let selectedAudioDuration = '03:30';

  // Chuyển đổi File sang Base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  // Tải danh sách bài hát cộng đồng
  async function loadCommunityTracks(forceToast = false) {
    if (!dom.communityTracksGrid) return;

    if (forceToast) {
      showToast('🍃 Đang cập nhật đĩa nhạc cộng đồng...');
    }

    try {
      const res = await fetch('/api/drop/tracks');
      const data = await res.json();

      if (data && data.tracks) {
        state.communityTracks = (data.tracks || []).filter(t => t.id !== 'drop_preset_1');
        state.communityLoaded = true;

        if (dom.dropCommunityCounterPill) {
          dom.dropCommunityCounterPill.textContent = `${state.communityTracks.length} Giai Điệu Cộng Đồng`;
        }

        renderCommunityTracksGrid(state.communityTracks);
        if (forceToast) {
          showToast(`✨ Đã nạp ${state.communityTracks.length} bài hát cộng đồng!`);
        }
      }
    } catch (err) {
      console.error('[Load Community Tracks Error]:', err);
      try {
        const localSaved = JSON.parse(localStorage.getItem('my_dropped_music') || '[]').filter(t => t.id !== 'drop_preset_1');
        localStorage.setItem('my_dropped_music', JSON.stringify(localSaved));
        if (localSaved.length > 0) {
          renderCommunityTracksGrid(localSaved);
        }
      } catch (e) {
        // ignore
      }
    }
  }

  // Hiển thị lưới bài hát cộng đồng
  function renderCommunityTracksGrid(tracks) {
    if (!dom.communityTracksGrid) return;
    dom.communityTracksGrid.innerHTML = '';

    const validTracks = (tracks || []).filter(t => t && t.id !== 'drop_preset_1');

    if (!validTracks || validTracks.length === 0) {
      if (dom.communityEmptyState) dom.communityEmptyState.classList.remove('hidden');
      return;
    }

    if (dom.communityEmptyState) dom.communityEmptyState.classList.add('hidden');

    validTracks.forEach((track) => {
      const card = document.createElement('div');
      card.className = 'community-track-card';
      card.dataset.trackId = track.id;

      card.innerHTML = `
        <div class="community-card-sleeve">
          <div class="community-card-vinyl"></div>
          <img src="${upgradeThumbnailUrl(track.thumbnail)}" alt="${track.title}" class="community-card-img" loading="lazy" onerror="this.src='bg.jpg'">
          <button class="community-card-play-btn" title="Phát bài này">▶</button>
        </div>
        <h3 class="community-card-title" title="${track.title}">${track.title}</h3>
        <p class="community-card-artist" title="${track.artist}">${track.artist}</p>
        <div class="community-card-footer">
          <span class="community-card-badge">Community Drop</span>
          <span class="community-card-dur">${track.duration || '03:30'}</span>
        </div>
      `;

      // Nút play tròn
      const playBtn = card.querySelector('.community-card-play-btn');
      if (playBtn) {
        playBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          playTrack(track);
        });
      }

      // Bấm vào thân card
      card.addEventListener('click', () => {
        playTrack(track);
      });

      dom.communityTracksGrid.appendChild(card);
    });
  }

  // Xử lý khi chọn file audio
  function handleSelectedAudioFile(file) {
    if (!file) return;

    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/ogg', 'audio/flac', 'audio/x-m4a', 'audio/m4a'];
    const isAudio = validTypes.some(t => file.type.includes(t)) || /\.(mp3|wav|ogg|flac|m4a)$/i.test(file.name);
    
    if (!isAudio) {
      showToast('⚠️ Vui lòng chọn file âm thanh chuẩn (.mp3, .wav, .m4a, .ogg, .flac)!');
      return;
    }

    selectedAudioFile = file;

    // Tự động điền tên bài hát nếu người dùng chưa nhập
    if (dom.dropSongTitle && !dom.dropSongTitle.value.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      dom.dropSongTitle.value = cleanName;
    }

    // Hiển thị Banner đã chọn
    if (dom.dropSelectedBanner) {
      dom.dropSelectedBanner.classList.remove('hidden');
    }
    if (dom.selectedFileName) {
      dom.selectedFileName.textContent = file.name;
    }

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    if (dom.selectedFileDetails) {
      dom.selectedFileDetails.textContent = `${sizeMb} MB • Đang tính thời lượng...`;
    }

    // Gán vào trình nghe thử audio preview
    const objectUrl = URL.createObjectURL(file);
    if (dom.dropAudioPreviewElement) {
      dom.dropAudioPreviewElement.src = objectUrl;
      dom.dropAudioPreviewElement.onloadedmetadata = () => {
        const dur = dom.dropAudioPreviewElement.duration;
        if (dur && !isNaN(dur)) {
          selectedAudioDuration = formatTime(dur);
          if (dom.selectedFileDetails) {
            dom.selectedFileDetails.textContent = `${sizeMb} MB • ${selectedAudioDuration}`;
          }
        }
      };
    }
  }

  // Xử lý khi chọn file ảnh bìa (Custom Theme)
  function handleSelectedThemeFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('⚠️ Vui lòng chọn file hình ảnh (.jpg, .png, .webp)!');
      return;
    }
    selectedThemeFile = file;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (dom.customCoverPreviewImg) {
        dom.customCoverPreviewImg.src = event.target.result;
      }
      if (dom.customThemeFileName) {
        dom.customThemeFileName.textContent = file.name;
      }
      if (dom.themePreviewWrap) {
        dom.themePreviewWrap.classList.remove('hidden');
      }
      if (dom.customThemeEmpty) {
        dom.customThemeEmpty.classList.add('hidden');
      }
    };
    reader.readAsDataURL(file);
  }

  function resetDropStudioForm() {
    selectedAudioFile = null;
    selectedThemeFile = null;
    selectedAudioDuration = '03:30';

    if (dom.dropAudioFileInput) dom.dropAudioFileInput.value = '';
    if (dom.dropThemeFileInput) dom.dropThemeFileInput.value = '';
    if (dom.dropSongTitle) dom.dropSongTitle.value = '';
    if (dom.dropSongArtist) dom.dropSongArtist.value = '';

    if (dom.dropSelectedBanner) dom.dropSelectedBanner.classList.add('hidden');
    if (dom.dropAudioPreviewElement) {
      dom.dropAudioPreviewElement.pause();
      dom.dropAudioPreviewElement.removeAttribute('src');
      dom.dropAudioPreviewElement.load();
    }

    // Reset theme preview
    if (dom.themePreviewWrap) dom.themePreviewWrap.classList.add('hidden');
    if (dom.customThemeEmpty) dom.customThemeEmpty.classList.remove('hidden');
    if (dom.customCoverPreviewImg) dom.customCoverPreviewImg.removeAttribute('src');
    if (dom.customThemeFileName) dom.customThemeFileName.textContent = '';
  }

  // Khởi tạo các sự kiện cho Drop Your Music Studio
  function initDropYourMusicEvents() {
    // 1. Kéo thả file audio
    if (dom.audioDropZone) {
      dom.audioDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dom.audioDropZone.classList.add('dragover');
      });

      dom.audioDropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dom.audioDropZone.classList.remove('dragover');
      });

      dom.audioDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dom.audioDropZone.classList.remove('dragover');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleSelectedAudioFile(e.dataTransfer.files[0]);
        }
      });

      dom.audioDropZone.addEventListener('click', (e) => {
        if (e.target.id !== 'browseAudioFileBtn') {
          if (dom.dropAudioFileInput) dom.dropAudioFileInput.click();
        }
      });
    }

    if (dom.browseAudioFileBtn && dom.dropAudioFileInput) {
      dom.browseAudioFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dom.dropAudioFileInput.click();
      });
    }

    if (dom.dropAudioFileInput) {
      dom.dropAudioFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          handleSelectedAudioFile(e.target.files[0]);
        }
      });
    }

    if (dom.removeSelectedFileBtn) {
      dom.removeSelectedFileBtn.addEventListener('click', () => {
        selectedAudioFile = null;
        if (dom.dropAudioFileInput) dom.dropAudioFileInput.value = '';
        if (dom.dropSelectedBanner) dom.dropSelectedBanner.classList.add('hidden');
        if (dom.dropAudioPreviewElement) {
          dom.dropAudioPreviewElement.pause();
          dom.dropAudioPreviewElement.removeAttribute('src');
          dom.dropAudioPreviewElement.load();
        }
      });
    }

    // 2. Kéo thả & Tải ảnh bìa tùy chỉnh (Custom Theme)
    if (dom.customThemeDropZone) {
      dom.customThemeDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dom.customThemeDropZone.classList.add('dragover');
      });

      dom.customThemeDropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dom.customThemeDropZone.classList.remove('dragover');
      });

      dom.customThemeDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dom.customThemeDropZone.classList.remove('dragover');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleSelectedThemeFile(e.dataTransfer.files[0]);
        }
      });

      dom.customThemeDropZone.addEventListener('click', (e) => {
        if (e.target.closest('#removeCustomThemeBtn')) return;
        if (dom.dropThemeFileInput) dom.dropThemeFileInput.click();
      });
    }

    if (dom.dropThemeFileInput) {
      dom.dropThemeFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          handleSelectedThemeFile(e.target.files[0]);
        }
      });
    }

    if (dom.removeCustomThemeBtn) {
      dom.removeCustomThemeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedThemeFile = null;
        if (dom.dropThemeFileInput) dom.dropThemeFileInput.value = '';
        if (dom.themePreviewWrap) dom.themePreviewWrap.classList.add('hidden');
        if (dom.customThemeEmpty) dom.customThemeEmpty.classList.remove('hidden');
        if (dom.customCoverPreviewImg) dom.customCoverPreviewImg.removeAttribute('src');
        if (dom.customThemeFileName) dom.customThemeFileName.textContent = '';
      });
    }

    // 3. Nút Gửi Bài Hát
    if (dom.dropSubmitBtn) {
      dom.dropSubmitBtn.addEventListener('click', async () => {
        if (!selectedAudioFile) {
          showToast('⚠️ Vui lòng chọn hoặc kéo thả file nhạc MP3 trước nhé!');
          return;
        }

        const title = (dom.dropSongTitle?.value || '').trim() || selectedAudioFile.name.replace(/\.[^/.]+$/, '');
        const artist = (dom.dropSongArtist?.value || '').trim() || 'Cộng đồng Home Music';

        // Khóa nút & bật loading
        dom.dropSubmitBtn.disabled = true;
        if (dom.dropSubmitLoading) dom.dropSubmitLoading.classList.remove('hidden');

        try {
          showToast('🍃 Đang chuẩn bị và tải bài hát lên...');

          // Chuyển audio sang Base64
          const audioBase64 = await fileToBase64(selectedAudioFile);
          let imageBase64 = null;
          let imageName = null;
          let imageMime = null;

          if (selectedThemeFile) {
            imageBase64 = await fileToBase64(selectedThemeFile);
            imageName = selectedThemeFile.name;
            imageMime = selectedThemeFile.type;
          }

          const payload = {
            title,
            artist,
            duration: selectedAudioDuration,
            audioBase64,
            audioName: selectedAudioFile.name,
            audioMime: selectedAudioFile.type,
            imageBase64,
            imageName,
            imageMime
          };

          const res = await fetch('/api/drop/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const data = await res.json();

          if (data && data.success && data.track) {
            showToast(`🎉 Giai điệu "${data.track.title}" đã được chia sẻ với mọi người!`);

            // Thêm vào danh sách hiện tại
            state.communityTracks = [data.track, ...(state.communityTracks || []).filter(t => t.id !== data.track.id && t.id !== 'drop_preset_1')];
            renderCommunityTracksGrid(state.communityTracks);

            if (dom.dropCommunityCounterPill) {
              dom.dropCommunityCounterPill.textContent = `${state.communityTracks.length} Giai Điệu Cộng Đồng`;
            }

            // Lưu vào localStorage dự phòng
            try {
              const mySaved = JSON.parse(localStorage.getItem('my_dropped_music') || '[]').filter(t => t.id !== 'drop_preset_1');
              mySaved.unshift(data.track);
              localStorage.setItem('my_dropped_music', JSON.stringify(mySaved));
            } catch (e) {
              // ignore
            }

            // Tự động phát ngay bài vừa đăng
            playTrack(data.track);

            // Reset form
            resetDropStudioForm();

            // Cuộn xuống khu vực cộng đồng
            const showcaseEl = document.querySelector('.drop-community-section');
            if (showcaseEl) {
              showcaseEl.scrollIntoView({ behavior: 'smooth' });
            }
          } else {
            showToast('⚠️ ' + (data?.error || 'Không thể tải lên bài hát lúc này.'));
          }
        } catch (err) {
          console.error('[Upload error]:', err);
          showToast('⚠️ Quá trình tải lên gặp sự cố. Vui lòng kiểm tra dung lượng file.');
        } finally {
          dom.dropSubmitBtn.disabled = false;
          if (dom.dropSubmitLoading) dom.dropSubmitLoading.classList.add('hidden');
        }
      });
    }

    // 4. Nút Làm Mới Bài Hát Cộng Đồng
    if (dom.refreshCommunityTracksBtn) {
      dom.refreshCommunityTracksBtn.addEventListener('click', () => {
        loadCommunityTracks(true);
      });
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
  // [SKILL: /apple-design & /animate]
  // MOBILE HAMBURGER DRAWER CONTROLLER
  // ==========================================================================
  function openMobileSidebar() {
    if (dom.sidebar) {
      dom.sidebar.classList.add('mobile-open');
    }
    if (dom.sidebarBackdrop) {
      dom.sidebarBackdrop.classList.add('active');
    }
    document.body.classList.add('mobile-drawer-open');
    // Căn lại thanh trượt gỗ khi mở drawer
    setTimeout(() => {
      const activeItem = document.querySelector('.sidebar-nav-item.active');
      if (activeItem) moveWoodSliderToItem(activeItem, false);
    }, 50);
  }

  function closeMobileSidebar() {
    if (dom.sidebar) {
      dom.sidebar.classList.remove('mobile-open');
    }
    if (dom.sidebarBackdrop) {
      dom.sidebarBackdrop.classList.remove('active');
    }
    document.body.classList.remove('mobile-drawer-open');
  }

  // ==========================================================================
  // 11. SỰ KIỆN TOÀN CỤC & SETUP
  // ==========================================================================
  function setupEvents() {
    // 1. Click Sidebar Tabs
    dom.sidebarNavItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        moveWoodSliderToItem(item, true);
        const tab = item.dataset.tab;
        switchTab(tab);
        // Tự động đóng drawer trên Mobile để người dùng xem nội dung
        if (window.innerWidth <= 768) {
          closeMobileSidebar();
        }
      });
    });

    // 2. Mobile Drawer Controls
    if (dom.mobileMenuToggleBtn) {
      dom.mobileMenuToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openMobileSidebar();
      });
    }

    if (dom.sidebarCloseBtn) {
      dom.sidebarCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMobileSidebar();
      });
    }

    if (dom.sidebarBackdrop) {
      dom.sidebarBackdrop.addEventListener('click', () => {
        closeMobileSidebar();
      });
    }

    // 3. Mobile Quick Search button
    if (dom.mobileSearchQuickBtn) {
      dom.mobileSearchQuickBtn.addEventListener('click', () => {
        switchTab('search');
        if (dom.mainSearchInput) {
          dom.mainSearchInput.focus();
        }
      });
    }

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
        loadTrendingMusic(country, state.currentTimeframe);
        loadAlbumsByRegion(country);
      });
    }

    // Chart Timeframe Switch (Daily 24h vs Weekly)
    if (dom.timeframeDailyBtn) {
      dom.timeframeDailyBtn.addEventListener('click', () => {
        if (state.currentTimeframe === 'daily') return;
        state.currentTimeframe = 'daily';
        showToast('🔥 Bảng xếp hạng: Hôm Nay (24h)');
        loadTrendingMusic(state.selectedCountry, 'daily');
      });
    }

    if (dom.timeframeWeeklyBtn) {
      dom.timeframeWeeklyBtn.addEventListener('click', () => {
        if (state.currentTimeframe === 'weekly') return;
        state.currentTimeframe = 'weekly';
        showToast('📈 Bảng xếp hạng: Tuần Này (7 Ngày)');
        loadTrendingMusic(state.selectedCountry, 'weekly');
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

    // Album In-Page Detail View Events
    if (dom.albumBackToGridBtn) {
      dom.albumBackToGridBtn.addEventListener('click', closeAlbumDetailView);
    }

    if (dom.albumDetailPlayAllBtn) {
      dom.albumDetailPlayAllBtn.addEventListener('click', () => {
        if (currentAlbumDetail && currentAlbumDetail.tracks && currentAlbumDetail.tracks.length > 0) {
          playEntireAlbum(currentAlbumDetail.tracks);
        } else {
          showToast('🍃 Không có bài hát để phát.');
        }
      });
    }

    if (dom.albumDetailQueueAllBtn) {
      dom.albumDetailQueueAllBtn.addEventListener('click', () => {
        if (currentAlbumDetail && currentAlbumDetail.tracks && currentAlbumDetail.tracks.length > 0) {
          let count = 0;
          currentAlbumDetail.tracks.forEach(t => {
            if (!state.queue.some(q => q.id === t.id)) {
              state.queue.push(t);
              count++;
            }
          });
          renderQueueDrawer();
          showToast(`🌰 Đã thêm ${currentAlbumDetail.tracks.length} bài hát của album vào danh sách chờ!`);
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
          updateMediaSessionPosition(dom.audio.currentTime, dom.audio.duration);
        }
      });

      dom.audio.addEventListener('loadedmetadata', () => {
        if (state.activeEngine === 'audio' && dom.audio.duration) {
          if (dom.totalDuration) dom.totalDuration.textContent = formatTime(dom.audio.duration);
          updateMediaSessionPosition(dom.audio.currentTime, dom.audio.duration);
        }
      });

      dom.audio.addEventListener('playing', () => {
        setPlaybackVisualState(true);
        state.consecutiveErrors = 0;
      });

      dom.audio.addEventListener('pause', () => {
        if (state.activeEngine === 'audio') {
          setPlaybackVisualState(false);
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

        setPlaybackVisualState(false);

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

  // ==========================================================================
  // 12. AMBIENT MODE: BAN NGÀY (DAY) / ĐÊM RỪNG ĐOM ĐÓM (TWILIGHT)
  // ==========================================================================
  function initAmbientMode() {
    const ambientBtn = dom.ambientModeBtn || document.getElementById('ambientModeBtn');
    const ambientText = dom.ambientModeText || document.getElementById('ambientModeText');
    const sunIcon = ambientBtn ? ambientBtn.querySelector('.sun-icon') : null;
    const moonIcon = ambientBtn ? ambientBtn.querySelector('.moon-icon') : null;

    function applyMode(isTwilight, save = true) {
      if (isTwilight) {
        document.body.classList.add('twilight-mode');
        if (ambientText) ambientText.textContent = 'Đêm Rừng';
        if (sunIcon) sunIcon.classList.add('hidden');
        if (moonIcon) moonIcon.classList.remove('hidden');
        if (ambientBtn) ambientBtn.title = 'Chuyển sang chế độ Ban Ngày ☀️';
      } else {
        document.body.classList.remove('twilight-mode');
        if (ambientText) ambientText.textContent = 'Ban Ngày';
        if (sunIcon) sunIcon.classList.remove('hidden');
        if (moonIcon) moonIcon.classList.add('hidden');
        if (ambientBtn) ambientBtn.title = 'Chuyển sang chế độ Đêm Rừng Đom Đóm 🌙';
      }
      if (save) {
        try {
          localStorage.setItem('ghibli_ambient_mode', isTwilight ? 'twilight' : 'day');
        } catch (_) {}
      }
    }

    let savedMode = null;
    try {
      savedMode = localStorage.getItem('ghibli_ambient_mode');
    } catch (_) {}

    if (savedMode === 'twilight') {
      applyMode(true, false);
    } else if (savedMode === 'day') {
      applyMode(false, false);
    } else {
      const currentHour = new Date().getHours();
      const isNight = currentHour >= 18 || currentHour < 6;
      applyMode(isNight, false);
    }

    if (ambientBtn) {
      ambientBtn.addEventListener('click', () => {
        const isTwilight = document.body.classList.contains('twilight-mode');
        applyMode(!isTwilight, true);
      });
    }
  }

  // ==========================================================================
  // 13. W3C MEDIA SESSION API (Phát trong nền khi khóa màn hình, Lock Screen Widget, AirPods)
  // ==========================================================================
  function updateMediaSession(track) {
    if (!('mediaSession' in navigator) || !track) return;

    try {
      const rawArt = upgradeThumbnailUrl(track.thumbnail || '');
      let safeArtUrl = rawArt;
      if (rawArt && !rawArt.startsWith('http')) {
        try {
          safeArtUrl = new URL(rawArt, window.location.origin).href;
        } catch (_) {}
      }

      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title || 'Home Music',
        artist: track.artist || 'Studio Ghibli',
        album: track.album || 'Khu Vườn Âm Nhạc Home Music',
        artwork: safeArtUrl ? [
          { src: safeArtUrl, sizes: '96x96', type: 'image/jpeg' },
          { src: safeArtUrl, sizes: '128x128', type: 'image/jpeg' },
          { src: safeArtUrl, sizes: '192x192', type: 'image/jpeg' },
          { src: safeArtUrl, sizes: '256x256', type: 'image/jpeg' },
          { src: safeArtUrl, sizes: '384x384', type: 'image/jpeg' },
          { src: safeArtUrl, sizes: '512x512', type: 'image/jpeg' }
        ] : [
          { src: new URL('icon-192.png', window.location.origin).href, sizes: '192x192', type: 'image/png' },
          { src: new URL('icon-512.png', window.location.origin).href, sizes: '512x512', type: 'image/png' }
        ]
      });

      updateMediaSessionPlaybackState(state.isPlaying);
    } catch (err) {
      console.warn('[MediaSession Metadata Warning]:', err.message);
    }
  }

  function updateMediaSessionPlaybackState(isPlaying) {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch (_) {}
  }

  function updateMediaSessionPosition(currentTime, duration) {
    if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
    if (!duration || isNaN(duration) || duration <= 0) return;
    try {
      navigator.mediaSession.setPositionState({
        duration: Math.max(duration, 0),
        playbackRate: 1.0,
        position: Math.min(Math.max(currentTime || 0, 0), duration)
      });
    } catch (_) {}
  }

  function setupMediaSessionHandlers() {
    if (!('mediaSession' in navigator)) return;

    const actionHandlers = [
      ['play', () => {
        if (!state.isPlaying) togglePlayPause();
      }],
      ['pause', () => {
        if (state.isPlaying) togglePlayPause();
      }],
      ['previoustrack', () => {
        playPrevTrack();
      }],
      ['nexttrack', () => {
        playNextTrack();
      }],
      ['seekto', (details) => {
        if (details.seekTime === undefined || isNaN(details.seekTime)) return;
        if (state.activeEngine === 'audio' && dom.audio && dom.audio.duration) {
          dom.audio.currentTime = details.seekTime;
          updateMediaSessionPosition(details.seekTime, dom.audio.duration);
        } else if (state.activeEngine === 'youtube' && ytPlayer && typeof ytPlayer.seekTo === 'function') {
          ytPlayer.seekTo(details.seekTime, true);
        }
      }],
      ['seekbackward', (details) => {
        const skip = details.seekOffset || 10;
        if (state.activeEngine === 'audio' && dom.audio) {
          dom.audio.currentTime = Math.max(dom.audio.currentTime - skip, 0);
          updateMediaSessionPosition(dom.audio.currentTime, dom.audio.duration);
        } else if (state.activeEngine === 'youtube' && ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
          ytPlayer.seekTo(Math.max(ytPlayer.getCurrentTime() - skip, 0), true);
        }
      }],
      ['seekforward', (details) => {
        const skip = details.seekOffset || 10;
        if (state.activeEngine === 'audio' && dom.audio) {
          dom.audio.currentTime = Math.min(dom.audio.currentTime + skip, dom.audio.duration || 9999);
          updateMediaSessionPosition(dom.audio.currentTime, dom.audio.duration);
        } else if (state.activeEngine === 'youtube' && ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
          ytPlayer.seekTo(ytPlayer.getCurrentTime() + skip, true);
        }
      }],
      ['stop', () => {
        if (state.isPlaying) togglePlayPause();
      }]
    ];

    for (const [action, handler] of actionHandlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (err) {
        // Một số action có thể không được hỗ trợ trên trình duyệt cũ
      }
    }
  }

  // Khởi động
  function init() {
    setVolume(0.8);
    initAmbientMode();
    setupMediaSessionHandlers();
    setupEvents();
    initDropYourMusicEvents();
    loadFavorites();
    loadCommunityTracks();

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
