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
    currentTimeframe: 'daily',
    lyrics: [],
    activeLyricIndex: -1,
    isLyricsOpen: false,
    lyricsLoading: false,
    lyricsTrackId: null,
    currentUser: null,
    authToken: (() => { try { return localStorage.getItem('ghibli_auth_token') || null; } catch (_) { return null; } })(),
    isSyncing: false,
    isMobile: (() => {
      try {
        const ua = navigator.userAgent || '';
        const isTouch = typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1;
        const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && isTouch);
        const isAndroid = /Android/i.test(ua);
        const isSmallScreen = window.matchMedia && window.matchMedia('(max-width: 820px)').matches;
        const isStandalone = window.navigator.standalone === true || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
        return isIOS || isAndroid || isSmallScreen || isStandalone;
      } catch (_) {
        return false;
      }
    })(),
    isStandalone: (() => {
      try {
        return window.navigator.standalone === true || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
      } catch (_) {
        return false;
      }
    })(),
    backgroundPlayback: (() => {
      try {
        const saved = localStorage.getItem('ghibli_bg_playback');
        return saved !== null ? saved === 'true' : true;
      } catch (_) {
        return true;
      }
    })(),
    isBatterySaverActive: false,
    wakeLockSentinel: null,
    batteryClockInterval: null,
    lyricOffset: 0,
    lyricOffsetStore: (() => {
      try {
        const raw = localStorage.getItem('ghibli_lyric_offsets');
        return raw ? JSON.parse(raw) : {};
      } catch (_) {
        return {};
      }
    })()
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
    dropSongLyrics: document.getElementById('dropSongLyrics'),
    browseLyricsFileBtn: document.getElementById('browseLyricsFileBtn'),
    dropLyricsFileInput: document.getElementById('dropLyricsFileInput'),
    lyricsFileBadge: document.getElementById('lyricsFileBadge'),
    lyricsBadgeFilename: document.getElementById('lyricsBadgeFilename'),
    removeLyricsFileBtn: document.getElementById('removeLyricsFileBtn'),
    dropSubmitBtn: document.getElementById('dropSubmitBtn'),
    dropSubmitLoading: document.getElementById('dropSubmitLoading'),
    dropCommunityCounterPill: document.getElementById('dropCommunityCounterPill'),
    refreshCommunityTracksBtn: document.getElementById('refreshCommunityTracksBtn'),
    communityTracksGrid: document.getElementById('communityTracksGrid'),
    communityEmptyState: document.getElementById('communityEmptyState'),

    // World-Class Ghibli Spells & Visuals
    magicCursorCanvas: document.getElementById('magicCursorCanvas'),
    playerAmbientAura: document.getElementById('playerAmbientAura'),
    playerMiniVinyl: document.getElementById('playerMiniVinyl'),
    natureWaveformEq: document.getElementById('natureWaveformEq'),
    kodamaBeatBuddy: document.getElementById('kodamaBeatBuddy'),

    // Mobile Bottom Navigation Bar (< 768px)
    mobileBottomNav: document.getElementById('mobileBottomNav'),
    mobileNavItems: document.querySelectorAll('.mobile-nav-item'),

    // Mobile Fullscreen Now Playing Sheet
    mobileFullscreenSheet: document.getElementById('mobileFullscreenSheet'),
    sheetDragHandle: document.getElementById('sheetDragHandle'),
    sheetMinimizeBtn: document.getElementById('sheetMinimizeBtn'),
    sheetPlaylistName: document.getElementById('sheetPlaylistName'),
    sheetQueueBtn: document.getElementById('sheetQueueBtn'),
    sheetVinylRecord: document.getElementById('sheetVinylRecord'),
    sheetTrackCover: document.getElementById('sheetTrackCover'),
    sheetTitle: document.getElementById('sheetTitle'),
    sheetArtist: document.getElementById('sheetArtist'),
    sheetLikeBtn: document.getElementById('sheetLikeBtn'),
    sheetProgressWrap: document.getElementById('sheetProgressWrap'),
    sheetProgressFill: document.getElementById('sheetProgressFill'),
    sheetProgressThumb: document.getElementById('sheetProgressThumb'),
    sheetCurrentTime: document.getElementById('sheetCurrentTime'),
    sheetTotalTime: document.getElementById('sheetTotalTime'),
    sheetShuffleBtn: document.getElementById('sheetShuffleBtn'),
    sheetPrevBtn: document.getElementById('sheetPrevBtn'),
    sheetPlayPauseBtn: document.getElementById('sheetPlayPauseBtn'),
    sheetPlayIcon: document.getElementById('sheetPlayIcon'),
    sheetPauseIcon: document.getElementById('sheetPauseIcon'),
    sheetNextBtn: document.getElementById('sheetNextBtn'),
    sheetLoopBtn: document.getElementById('sheetLoopBtn'),
    sheetLoopBadge: document.getElementById('sheetLoopBadge'),
    sheetLoopStatusChip: document.getElementById('sheetLoopStatusChip'),
    sheetShuffleStatusChip: document.getElementById('sheetShuffleStatusChip'),
    sheetBgPlaybackChip: document.getElementById('sheetBgPlaybackChip'),
    sheetBgPlaybackText: document.getElementById('sheetBgPlaybackText'),

    // Battery Saver Mode Elements (OLED True Black)
    batterySaverBtn: document.getElementById('batterySaverBtn'),
    sheetBatterySaverBtn: document.getElementById('sheetBatterySaverBtn'),
    sheetBatterySaverText: document.getElementById('sheetBatterySaverText'),
    mobileBatterySaverQuickBtn: document.getElementById('mobileBatterySaverQuickBtn'),
    batterySaverOverlay: document.getElementById('batterySaverOverlay'),
    batterySaverClock: document.getElementById('batterySaverClock'),
    batterySaverLevel: document.getElementById('batterySaverLevel'),
    batterySaverTotoro: document.getElementById('batterySaverTotoro'),
    batterySaverTitle: document.getElementById('batterySaverTitle'),
    batterySaverArtist: document.getElementById('batterySaverArtist'),
    batterySaverPrevBtn: document.getElementById('batterySaverPrevBtn'),
    batterySaverPlayBtn: document.getElementById('batterySaverPlayBtn'),
    batterySaverPlayIcon: document.getElementById('batterySaverPlayIcon'),
    batterySaverPauseIcon: document.getElementById('batterySaverPauseIcon'),
    batterySaverNextBtn: document.getElementById('batterySaverNextBtn'),
    batterySaverExitBtn: document.getElementById('batterySaverExitBtn'),

    // Spotify-Style Real-Time Synced Lyrics Elements
    lyricsToggleBtn: document.getElementById('lyricsToggleBtn'),
    ghibliLyricsStage: document.getElementById('ghibliLyricsStage'),
    lyricsStageBackdrop: document.getElementById('lyricsStageBackdrop'),
    lyricsTrackCover: document.getElementById('lyricsTrackCover'),
    lyricsTrackTitle: document.getElementById('lyricsTrackTitle'),
    lyricsTrackArtist: document.getElementById('lyricsTrackArtist'),
    lyricsSyncBadge: document.getElementById('lyricsSyncBadge'),
    lyricsCloseBtn: document.getElementById('lyricsCloseBtn'),
    lyricsScrollBox: document.getElementById('lyricsScrollBox'),
    lyricsLinesContainer: document.getElementById('lyricsLinesContainer'),
    sheetLyricsCard: document.getElementById('sheetLyricsCard'),
    sheetLyricsExpandBtn: document.getElementById('sheetLyricsExpandBtn'),
    sheetLyricsActiveText: document.getElementById('sheetLyricsActiveText'),
    sheetLyricsNextText: document.getElementById('sheetLyricsNextText'),
    lyricsSyncBar: document.getElementById('lyricsSyncBar'),
    lyricsOffsetBadge: document.getElementById('lyricsOffsetBadge'),
    lyricsOffsetSavedChip: document.getElementById('lyricsOffsetSavedChip'),
    lyricOffsetMinusHalfBtn: document.getElementById('lyricOffsetMinusHalfBtn'),
    lyricOffsetMinusTenthBtn: document.getElementById('lyricOffsetMinusTenthBtn'),
    lyricOffsetResetBtn: document.getElementById('lyricOffsetResetBtn'),
    lyricOffsetPlusTenthBtn: document.getElementById('lyricOffsetPlusTenthBtn'),
    lyricOffsetPlusHalfBtn: document.getElementById('lyricOffsetPlusHalfBtn'),
    sheetSyncQuickBtn: document.getElementById('sheetSyncQuickBtn'),
    sheetLyricsOffsetLabel: document.getElementById('sheetLyricsOffsetLabel'),

    // Split-Screen Stage Left Panel (3D Vinyl, Tone Arm, Up Next)
    stageLeftPanel: document.getElementById('stageLeftPanel'),
    stageJacketCover: document.getElementById('stageJacketCover'),
    stageVinylDisc: document.getElementById('stageVinylDisc'),
    stageVinylLabel: document.getElementById('stageVinylLabel'),
    stageToneArm: document.getElementById('stageToneArm'),
    stageTrackTitle: document.getElementById('stageTrackTitle'),
    stageTrackArtist: document.getElementById('stageTrackArtist'),
    stageTrackAlbum: document.getElementById('stageTrackAlbum'),
    stageLikeBtn: document.getElementById('stageLikeBtn'),
    stageLikeIcon: document.getElementById('stageLikeIcon'),
    stageLikeText: document.getElementById('stageLikeText'),
    stageQueueAddBtn: document.getElementById('stageQueueAddBtn'),
    stageUpNextCard: document.getElementById('stageUpNextCard'),
    stageUpNextThumb: document.getElementById('stageUpNextThumb'),
    stageUpNextTitle: document.getElementById('stageUpNextTitle'),
    stageUpNextArtist: document.getElementById('stageUpNextArtist'),
    stageUpNextPlayBtn: document.getElementById('stageUpNextPlayBtn'),
    
    // User Accounts & Multi-Device Cloud Sync
    sidebarUserCard: document.getElementById('sidebarUserCard'),
    sidebarUserAvatar: document.getElementById('sidebarUserAvatar'),
    sidebarUserName: document.getElementById('sidebarUserName'),
    sidebarUserStatus: document.getElementById('sidebarUserStatus'),
    sidebarAccountBtn: document.getElementById('sidebarAccountBtn'),
    topBarAccountBtn: document.getElementById('topBarAccountBtn'),
    topBarUserAvatar: document.getElementById('topBarUserAvatar'),
    topBarUserName: document.getElementById('topBarUserName'),
    mobileAccountBtn: document.getElementById('mobileAccountBtn'),
    mobileAccountAvatar: document.getElementById('mobileAccountAvatar'),
    ghibliAccountModal: document.getElementById('ghibliAccountModal'),
    accountModalBackdrop: document.getElementById('accountModalBackdrop'),
    accountModalCloseBtn: document.getElementById('accountModalCloseBtn'),
    accountModalAlert: document.getElementById('accountModalAlert'),
    accountTabsBar: document.getElementById('accountTabsBar'),
    tabBtnLogin: document.getElementById('tabBtnLogin'),
    tabBtnRegister: document.getElementById('tabBtnRegister'),
    viewAccountLogin: document.getElementById('viewAccountLogin'),
    viewAccountRegister: document.getElementById('viewAccountRegister'),
    viewAccountProfile: document.getElementById('viewAccountProfile'),
    loginUsername: document.getElementById('loginUsername'),
    loginPassword: document.getElementById('loginPassword'),
    toggleLoginPasswordBtn: document.getElementById('toggleLoginPasswordBtn'),
    loginSubmitBtn: document.getElementById('loginSubmitBtn'),
    linkSwitchToRegister: document.getElementById('linkSwitchToRegister'),
    registerDisplayName: document.getElementById('registerDisplayName'),
    registerUsername: document.getElementById('registerUsername'),
    registerPassword: document.getElementById('registerPassword'),
    toggleRegisterPasswordBtn: document.getElementById('toggleRegisterPasswordBtn'),
    registerAvatarFileInput: document.getElementById('registerAvatarFileInput'),
    registerAvatarPreviewImg: document.getElementById('registerAvatarPreviewImg'),
    registerAvatarResetBtn: document.getElementById('registerAvatarResetBtn'),
    profileAvatarFileInput: document.getElementById('profileAvatarFileInput'),
    registerSubmitBtn: document.getElementById('registerSubmitBtn'),
    linkSwitchToLogin: document.getElementById('linkSwitchToLogin'),
    profileAvatar: document.getElementById('profileAvatar'),
    profileDisplayName: document.getElementById('profileDisplayName'),
    profileUsername: document.getElementById('profileUsername'),
    profileSyncStatusText: document.getElementById('profileSyncStatusText'),
    syncFavCount: document.getElementById('syncFavCount'),
    syncDropCount: document.getElementById('syncDropCount'),
    syncThemeLabel: document.getElementById('syncThemeLabel'),
    manualSyncBtn: document.getElementById('manualSyncBtn'),
    exportBackupBtn: document.getElementById('exportBackupBtn'),
    backupFileInput: document.getElementById('backupFileInput'),
    logoutBtn: document.getElementById('logoutBtn'),

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
  // [SKILLS: /design-spells & /apple-design]
  // WORLD-CLASS GHIBLI INTERACTION CONTROLLERS & HAPTIC ENGINE
  // ==========================================================================
  function triggerHaptic(duration = 8) {
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(duration);
      } catch (_) {}
    }
  }

  // 1.1. Magic Cursor Dust (PC Only)
  function initMagicCursorDust() {
    const canvas = dom.magicCursorCanvas || document.getElementById('magicCursorCanvas');
    if (!canvas) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.innerWidth < 768) {
      canvas.style.display = 'none';
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, { passive: true });

    const particles = [];
    const MAX_PARTICLES = 36;
    const colors = [
      'rgba(255, 209, 102, ', // ấm áp ghibli
      'rgba(167, 201, 87, ',  // xanh thảo mộc
      'rgba(242, 232, 207, ', // kem ấm
      'rgba(128, 237, 153, '  // đom đóm sáng
    ];

    let isRunning = false;
    let lastSpawn = 0;

    function spawnParticle(x, y) {
      if (particles.length >= MAX_PARTICLES) return;
      const baseColor = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 1.1,
        vy: -Math.random() * 1.4 - 0.4,
        size: Math.random() * 2.4 + 1.2,
        color: baseColor,
        alpha: 0.85,
        decay: Math.random() * 0.025 + 0.02
      });
    }

    function loop() {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha.toFixed(2) + ')';
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color + '0.6)';
        ctx.fill();
      }

      if (particles.length > 0) {
        requestAnimationFrame(loop);
      } else {
        isRunning = false;
        ctx.clearRect(0, 0, width, height);
      }
    }

    window.addEventListener('pointermove', (e) => {
      const now = performance.now();
      if (now - lastSpawn > 25) {
        lastSpawn = now;
        spawnParticle(e.clientX, e.clientY);
        if (Math.random() > 0.55) {
          spawnParticle(e.clientX + (Math.random() - 0.5) * 8, e.clientY + (Math.random() - 0.5) * 8);
        }
        if (!isRunning) {
          isRunning = true;
          requestAnimationFrame(loop);
        }
      }
    }, { passive: true });
  }

  // 1.2. 3D Kinetic Card Tilt & Specular Glare (PC Only)
  function attach3DTiltEffect(cardEl) {
    if (!cardEl) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.innerWidth < 768) {
      return;
    }

    const glareEl = cardEl.querySelector('.card-glare');
    let isHovered = false;
    let rafId = null;
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let glareX = 50;
    let glareY = 0;

    function updateTilt() {
      if (!isHovered && Math.abs(currentRotX) < 0.05 && Math.abs(currentRotY) < 0.05) {
        cardEl.style.transform = '';
        rafId = null;
        return;
      }

      currentRotX += (targetRotX - currentRotX) * 0.18;
      currentRotY += (targetRotY - currentRotY) * 0.18;

      cardEl.style.transform = `perspective(1000px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) translateY(-4px) scale3d(1.02, 1.02, 1.02)`;

      if (glareEl) {
        glareEl.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.45) 0%, transparent 60%)`;
      }

      rafId = requestAnimationFrame(updateTilt);
    }

    cardEl.addEventListener('pointerenter', () => {
      isHovered = true;
      if (!rafId) rafId = requestAnimationFrame(updateTilt);
    });

    cardEl.addEventListener('pointermove', (e) => {
      const rect = cardEl.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;

      targetRotX = -ny * 14;
      targetRotY = nx * 14;
      glareX = Math.round((nx + 0.5) * 100);
      glareY = Math.round((ny + 0.5) * 100);

      if (!rafId) rafId = requestAnimationFrame(updateTilt);
    });

    cardEl.addEventListener('pointerleave', () => {
      isHovered = false;
      targetRotX = 0;
      targetRotY = 0;
      glareX = 50;
      glareY = 0;
    });
  }

  // 1.3. Ambient Artwork Aura Glow
  function updatePlayerAmbientAura(track) {
    if (!dom.playerAmbientAura || !track) return;
    let hash = 0;
    const str = (track.title || '') + (track.artist || '');
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    const hue1 = (Math.abs(hash) % 120) + 70;
    const hue2 = (hue1 + 40) % 360;

    dom.playerAmbientAura.style.background = `
      radial-gradient(circle at 25% 60%, hsla(${hue1}, 58%, 52%, 0.35), transparent 60%),
      radial-gradient(circle at 75% 50%, hsla(${hue2}, 68%, 58%, 0.28), transparent 55%)
    `;
  }

  // 1.4. Mobile Background Playback UI
  function updateBgPlaybackUI() {
    if (!dom.sheetBgPlaybackChip) return;
    const isEnabled = state.backgroundPlayback;
    dom.sheetBgPlaybackChip.classList.toggle('active', isEnabled);
    dom.sheetBgPlaybackChip.classList.toggle('disabled', !isEnabled);
    if (dom.sheetBgPlaybackText) {
      dom.sheetBgPlaybackText.innerHTML = `🎧 Phát nền (Tắt màn hình): <strong>${isEnabled ? 'BẬT' : 'TẮT'}</strong>`;
    }
  }

  // ==========================================================================
  // CHẾ ĐỘ TIẾT KIỆM PIN OLED (TRUE BLACK BATTERY SAVER MODE)
  // ==========================================================================
  function updateBatterySaverUI() {
    const isActive = !!state.isBatterySaverActive;
    if (dom.batterySaverBtn) {
      dom.batterySaverBtn.classList.toggle('active', isActive);
      dom.batterySaverBtn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    }
    if (dom.mobileBatterySaverQuickBtn) {
      dom.mobileBatterySaverQuickBtn.classList.toggle('active', isActive);
    }
    if (dom.sheetBatterySaverBtn) {
      dom.sheetBatterySaverBtn.classList.toggle('active', isActive);
    }
    if (dom.sheetBatterySaverText) {
      dom.sheetBatterySaverText.innerHTML = `🔋 Tiết kiệm pin: <strong>${isActive ? 'BẬT' : 'TẮT'}</strong>`;
    }
  }

  function updateBatterySaverTrackInfo(track) {
    if (!dom.batterySaverTitle || !dom.batterySaverArtist) return;
    if (track) {
      dom.batterySaverTitle.textContent = track.title || 'Chưa có bài hát';
      dom.batterySaverArtist.textContent = track.artist || 'Studio Ghibli';
    } else {
      dom.batterySaverTitle.textContent = 'Chưa có bài hát';
      dom.batterySaverArtist.textContent = 'Studio Ghibli';
    }
    if (dom.batterySaverTotoro) {
      if (state.currentUser && state.currentUser.avatar) {
        if (state.currentUser.avatar.startsWith('data:') || state.currentUser.avatar.startsWith('http')) {
          dom.batterySaverTotoro.innerHTML = `<img src="${state.currentUser.avatar}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; opacity: 0.6;" alt="avatar">`;
        } else {
          dom.batterySaverTotoro.textContent = state.currentUser.avatar;
        }
      } else {
        dom.batterySaverTotoro.textContent = '🌰';
      }
    }
  }

  function updateBatterySaverPlayState(isPlaying) {
    if (dom.batterySaverPlayIcon) {
      dom.batterySaverPlayIcon.classList.toggle('hidden', isPlaying);
    }
    if (dom.batterySaverPauseIcon) {
      dom.batterySaverPauseIcon.classList.toggle('hidden', !isPlaying);
    }
  }

  function updateBatteryClock() {
    if (!dom.batterySaverClock) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    dom.batterySaverClock.textContent = `${hours}:${minutes}`;
  }

  function updateBatteryLevel() {
    if (!dom.batterySaverLevel) return;
    if (typeof navigator.getBattery === 'function') {
      navigator.getBattery().then(battery => {
        const level = Math.round(battery.level * 100);
        const isCharging = battery.charging;
        if (dom.batterySaverLevel) {
          dom.batterySaverLevel.textContent = `OLED Eco • ${level}%${isCharging ? ' ⚡' : ''}`;
        }
      }).catch(() => {
        if (dom.batterySaverLevel) dom.batterySaverLevel.textContent = 'OLED Eco Mode';
      });
    } else {
      dom.batterySaverLevel.textContent = 'OLED Eco Mode';
    }
  }

  async function requestWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        state.wakeLockSentinel = await navigator.wakeLock.request('screen');
        state.wakeLockSentinel.addEventListener('release', () => {
          state.wakeLockSentinel = null;
        });
      } catch (err) {
        console.log('WakeLock not granted or supported:', err);
      }
    }
  }

  function releaseWakeLock() {
    if (state.wakeLockSentinel) {
      try {
        state.wakeLockSentinel.release();
      } catch (_) {}
      state.wakeLockSentinel = null;
    }
  }

  async function activateBatterySaverMode() {
    if (state.isBatterySaverActive) return;
    state.isBatterySaverActive = true;
    document.body.classList.add('eco-mode-active');

    // Tạm dừng video nền để tiết kiệm năng lượng tối đa
    const bgVideo = document.querySelector('.bg-video');
    if (bgVideo && !bgVideo.paused) {
      try {
        bgVideo.pause();
      } catch (_) {}
    }

    // Hiển thị giao diện OLED đen tuyệt đối
    if (dom.batterySaverOverlay) {
      dom.batterySaverOverlay.classList.remove('hidden');
      dom.batterySaverOverlay.setAttribute('aria-hidden', 'false');
    }

    if (state.currentTrack) {
      updateBatterySaverTrackInfo(state.currentTrack);
    }
    updateBatterySaverPlayState(state.isPlaying);
    updateBatteryClock();
    updateBatteryLevel();

    if (state.batteryClockInterval) clearInterval(state.batteryClockInterval);
    state.batteryClockInterval = setInterval(updateBatteryClock, 10000);

    // Kích hoạt WakeLock giữ màn hình đen không bị hệ điều hành tắt ngắt luồng phát YouTube
    await requestWakeLock();

    updateBatterySaverUI();
    triggerHaptic(15);
    showToast('🔋 Đã BẬT Tiết kiệm pin OLED: Tắt 98% pixel đen, giữ nhạc chạy liên tục!');
  }

  function deactivateBatterySaverMode() {
    if (!state.isBatterySaverActive) return;
    state.isBatterySaverActive = false;
    document.body.classList.remove('eco-mode-active');

    // Tiếp tục phát video nền nếu không ở chế độ đêm
    const bgVideo = document.querySelector('.bg-video');
    if (bgVideo && state.ambientMode !== 'twilight') {
      try {
        bgVideo.play().catch(() => {});
      } catch (_) {}
    }

    // Ẩn lớp phủ OLED
    if (dom.batterySaverOverlay) {
      dom.batterySaverOverlay.classList.add('hidden');
      dom.batterySaverOverlay.setAttribute('aria-hidden', 'true');
    }

    if (state.batteryClockInterval) {
      clearInterval(state.batteryClockInterval);
      state.batteryClockInterval = null;
    }

    releaseWakeLock();
    updateBatterySaverUI();
    triggerHaptic(10);
    showToast('☀️ Đã thoát Chế độ Tiết kiệm pin.');
  }

  function toggleBatterySaverMode() {
    if (state.isBatterySaverActive) {
      deactivateBatterySaverMode();
    } else {
      activateBatterySaverMode();
    }
  }

  // 1.5. Mobile Fullscreen Sheet Management
  function openMobileFullscreenSheet() {
    if (!dom.mobileFullscreenSheet) return;
    dom.mobileFullscreenSheet.classList.remove('hidden');
    document.body.classList.add('sheet-open');
    triggerHaptic(12);
    updateBgPlaybackUI();
    updateBatterySaverUI();
    if (state.currentTrack) {
      updateNowPlayingUI(state.currentTrack);
    }
  }

  function closeMobileFullscreenSheet() {
    if (!dom.mobileFullscreenSheet) return;
    dom.mobileFullscreenSheet.classList.add('hidden');
    document.body.classList.remove('sheet-open');
    triggerHaptic(8);
  }

  function initMobileBottomNav() {
    if (!dom.mobileNavItems) return;
    dom.mobileNavItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = item.dataset.tab;
        triggerHaptic(8);
        switchTab(tab);
        closeMobileFullscreenSheet();
      });
    });
  }

  function initMobileFullscreenSheet() {
    // Open sheet when bottom player capsule is tapped on mobile
    if (dom.bottomPlayer) {
      dom.bottomPlayer.addEventListener('click', (e) => {
        if (window.innerWidth > 768) return;
        if (e.target.closest('button, input, a, .leaf-heart-btn, .wood-disc-play-btn, .nature-ctrl-btn')) return;
        openMobileFullscreenSheet();
      });
    }

    // Close button
    if (dom.sheetMinimizeBtn) {
      dom.sheetMinimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMobileFullscreenSheet();
      });
    }

    // Drag down to dismiss
    if (dom.sheetDragHandle) {
      let startY = 0;
      let currentY = 0;
      let isDragging = false;

      dom.sheetDragHandle.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        currentY = startY;
        isDragging = true;
      }, { passive: true });

      dom.sheetDragHandle.addEventListener('touchmove', (e) => {
        if (!isDragging || !dom.mobileFullscreenSheet) return;
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        if (diff > 0) {
          dom.mobileFullscreenSheet.style.transform = `translateY(${diff}px)`;
        }
      }, { passive: true });

      dom.sheetDragHandle.addEventListener('touchend', () => {
        if (!isDragging || !dom.mobileFullscreenSheet) return;
        isDragging = false;
        const diff = currentY - startY;
        dom.mobileFullscreenSheet.style.transform = '';
        if (diff > 80) {
          closeMobileFullscreenSheet();
        }
      });
    }

    // Sheet playback controls
    if (dom.sheetPlayPauseBtn) {
      dom.sheetPlayPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic(10);
        togglePlayPause();
      });
    }

    if (dom.sheetPrevBtn) {
      dom.sheetPrevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic(10);
        playPrevTrack();
      });
    }

    if (dom.sheetNextBtn) {
      dom.sheetNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic(10);
        playNextTrack();
      });
    }

    if (dom.sheetShuffleBtn) {
      dom.sheetShuffleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic(10);
        toggleShuffle();
      });
    }

    if (dom.sheetLoopBtn) {
      dom.sheetLoopBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic(10);
        cycleLoopMode();
      });
    }

    if (dom.sheetBgPlaybackChip) {
      updateBgPlaybackUI();
      dom.sheetBgPlaybackChip.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic(12);
        state.backgroundPlayback = !state.backgroundPlayback;
        try {
          localStorage.setItem('ghibli_bg_playback', state.backgroundPlayback ? 'true' : 'false');
        } catch (_) {}
        updateBgPlaybackUI();
        if (state.backgroundPlayback) {
          showToast('🎧 Đã BẬT Phát Nền! Khóa màn hình và bấm nút Play trên Màn hình khóa để tiếp tục nghe.');
        } else {
          showToast('⏸️ Đã TẮT tính năng phát nền khi tắt màn hình.');
        }
      });
    }

    if (dom.sheetBatterySaverBtn) {
      updateBatterySaverUI();
      dom.sheetBatterySaverBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic(12);
        toggleBatterySaverMode();
      });
    }

    if (dom.sheetLikeBtn) {
      dom.sheetLikeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic(15);
        if (state.currentTrack) toggleFavorite(state.currentTrack);
      });
    }

    if (dom.sheetQueueBtn) {
      dom.sheetQueueBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMobileFullscreenSheet();
        if (dom.playlistDrawer) {
          dom.playlistDrawer.classList.remove('hidden');
          renderQueueDrawer();
        }
      });
    }

    // Scrubber on sheet
    if (dom.sheetProgressWrap) {
      const handleSheetScrub = (e) => {
        if (!dom.sheetProgressWrap) return;
        const rect = dom.sheetProgressWrap.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clickX = clientX - rect.left;
        const percent = Math.max(0, Math.min(1, clickX / rect.width));

        updateProgressUI(percent * 100);

        if (state.activeEngine === 'audio' || state.currentTrack?.previewUrl) {
          if (dom.audio && dom.audio.duration) {
            dom.audio.currentTime = percent * dom.audio.duration;
            const t = formatTime(dom.audio.currentTime);
            if (dom.currentTime) dom.currentTime.textContent = t;
            if (dom.sheetCurrentTime) dom.sheetCurrentTime.textContent = t;
          }
        } else if (state.activeEngine === 'youtube' && ytPlayer && isYtReady && typeof ytPlayer.getDuration === 'function') {
          const dur = ytPlayer.getDuration();
          if (dur && dur > 0) {
            const targetTime = percent * dur;
            ytPlayer.seekTo(targetTime, true);
            const t = formatTime(targetTime);
            if (dom.currentTime) dom.currentTime.textContent = t;
            if (dom.sheetCurrentTime) dom.sheetCurrentTime.textContent = t;
          }
        }
      };

      dom.sheetProgressWrap.addEventListener('pointerdown', handleSheetScrub);
      dom.sheetProgressWrap.addEventListener('touchmove', handleSheetScrub, { passive: true });
    }

    // Kodama buddy greeting easter egg
    if (dom.kodamaBeatBuddy) {
      dom.kodamaBeatBuddy.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic(12);
        dom.kodamaBeatBuddy.style.transform = 'scale(1.35) rotate(18deg)';
        showToast('🌱 Chú Kodama khẽ lắc đầu lách cách chào bạn!');
        setTimeout(() => {
          dom.kodamaBeatBuddy.style.transform = '';
        }, 400);
      });
    }
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

    if (dom.mobileNavItems) {
      dom.mobileNavItems.forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tabKey);
      });
    }

    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // World-class ambient aura & mobile fullscreen sheet sync
    updatePlayerAmbientAura(track);
    if (dom.sheetTitle) dom.sheetTitle.textContent = track.title;
    if (dom.sheetArtist) dom.sheetArtist.textContent = track.artist || 'Studio Ghibli';
    if (dom.sheetTrackCover) dom.sheetTrackCover.src = upgradeThumbnailUrl(track.thumbnail);
    if (dom.sheetTotalTime) dom.sheetTotalTime.textContent = track.duration || '00:00';
    if (dom.sheetPlaylistName) {
      dom.sheetPlaylistName.textContent = track.album || (state.activeGenre !== 'all' ? state.activeGenre : 'Bảng Xếp Hạng Thịnh Hành');
    }

    // Cập nhật Sân khấu Toàn Cảnh Split-Screen Desktop (Cột Trái 3D Vinyl)
    if (dom.stageTrackTitle) dom.stageTrackTitle.textContent = track.title;
    if (dom.stageTrackArtist) dom.stageTrackArtist.textContent = track.artist || 'Studio Ghibli';
    if (dom.stageTrackAlbum) dom.stageTrackAlbum.textContent = track.album || 'Home Music Session';
    const upgradedThumb = upgradeThumbnailUrl(track.thumbnail);
    if (dom.stageJacketCover) dom.stageJacketCover.src = upgradedThumb;
    if (dom.stageVinylLabel) dom.stageVinylLabel.src = upgradedThumb;
    updateStageUpNext();

    updateLikeButtonUI(track.id);
    highlightActiveCard(track.id);
    updateMediaSession(track);
    updateBatterySaverTrackInfo(track);
  }

  function updateStageUpNext() {
    if (!dom.stageUpNextCard) return;
    let nextTrack = null;
    if (state.queue && state.queue.length > 0) {
      if (state.queueIndex >= 0 && state.queueIndex < state.queue.length - 1) {
        nextTrack = state.queue[state.queueIndex + 1];
      } else if (state.loopMode === 'all' && state.queue.length > 1) {
        nextTrack = state.queue[0];
      }
    }
    if (nextTrack) {
      if (dom.stageUpNextThumb) dom.stageUpNextThumb.src = upgradeThumbnailUrl(nextTrack.thumbnail);
      if (dom.stageUpNextTitle) dom.stageUpNextTitle.textContent = nextTrack.title;
      if (dom.stageUpNextArtist) dom.stageUpNextArtist.textContent = nextTrack.artist || 'Studio Ghibli';
    } else {
      if (dom.stageUpNextTitle) dom.stageUpNextTitle.textContent = 'Đang phát danh sách hiện tại';
      if (dom.stageUpNextArtist) dom.stageUpNextArtist.textContent = 'Studio Ghibli Radio';
    }
  }

  function setPlaybackVisualState(isPlaying) {
    state.isPlaying = !!isPlaying;
    updateMediaSessionPlaybackState(isPlaying);

    // Dynamic 33 RPM mini vinyl spin, ambient aura, botanical EQ, and Kodama wobble
    if (dom.bottomPlayer) {
      dom.bottomPlayer.classList.toggle('is-playing', isPlaying);
    }
    if (dom.sheetVinylRecord) {
      dom.sheetVinylRecord.classList.toggle('is-playing', isPlaying);
    }
    if (dom.stageVinylDisc) {
      dom.stageVinylDisc.classList.toggle('is-spinning', isPlaying);
    }
    if (dom.stageToneArm) {
      dom.stageToneArm.classList.toggle('is-playing', isPlaying);
    }
    if (dom.sheetPlayIcon) {
      dom.sheetPlayIcon.classList.toggle('hidden', isPlaying);
    }
    if (dom.sheetPauseIcon) {
      dom.sheetPauseIcon.classList.toggle('hidden', !isPlaying);
    }

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

    updateBatterySaverPlayState(isPlaying);
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

  // ==========================================================================
  // SPOTIFY-STYLE REAL-TIME SYNCED LYRICS ENGINE (LRCLIB & KARAOKE STAGE)
  // ==========================================================================
  let lyricsAbortController = null;

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function openLyricsStage() {
    if (!dom.ghibliLyricsStage) return;
    state.isLyricsOpen = true;
    dom.ghibliLyricsStage.classList.remove('hidden');
    if (dom.lyricsToggleBtn) dom.lyricsToggleBtn.classList.add('active');
    scrollActiveLyricIntoView();
  }

  function closeLyricsStage() {
    if (!dom.ghibliLyricsStage) return;
    state.isLyricsOpen = false;
    dom.ghibliLyricsStage.classList.add('hidden');
    if (dom.lyricsToggleBtn) dom.lyricsToggleBtn.classList.remove('active');
  }

  function toggleLyricsStage() {
    if (state.isLyricsOpen) {
      closeLyricsStage();
    } else {
      openLyricsStage();
    }
  }

  function seekToSeconds(targetSeconds) {
    if (state.activeEngine === 'audio') {
      if (dom.audio) {
        dom.audio.currentTime = targetSeconds;
        syncLyricsWithTime(targetSeconds);
      }
    } else if (state.activeEngine === 'youtube' && ytPlayer && typeof ytPlayer.seekTo === 'function') {
      ytPlayer.seekTo(targetSeconds, true);
      syncLyricsWithTime(targetSeconds);
    }
  }

  function scrollActiveLyricIntoView() {
    if (!dom.lyricsLinesContainer) return;
    const activeEl = dom.lyricsLinesContainer.querySelector('.lyric-line.active');
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }

  // ==========================================================================
  // BỘ QUẢN LÝ ĐỘ LỆCH & ĐỒNG BỘ LỜI BÀI HÁT (LYRIC SYNC CALIBRATION)
  // ==========================================================================
  function getStoredLyricOffset(trackId) {
    if (!trackId || !state.lyricOffsetStore) return 0;
    const val = state.lyricOffsetStore[trackId];
    return typeof val === 'number' ? val : 0;
  }

  function saveTrackLyricOffset(trackId, offset) {
    if (!trackId) return;
    if (!state.lyricOffsetStore) state.lyricOffsetStore = {};
    if (Math.abs(offset) < 0.05) {
      delete state.lyricOffsetStore[trackId];
    } else {
      state.lyricOffsetStore[trackId] = offset;
    }
    try {
      localStorage.setItem('ghibli_lyric_offsets', JSON.stringify(state.lyricOffsetStore));
    } catch (_) {}
    if (typeof debouncedCloudSync === 'function') {
      debouncedCloudSync();
    }
  }

  function updateLyricOffsetUI() {
    const offset = state.lyricOffset || 0;
    const sign = offset > 0 ? '+' : '';
    const formatted = `${sign}${offset.toFixed(1)}s`;

    if (dom.lyricsOffsetBadge) {
      dom.lyricsOffsetBadge.textContent = formatted;
      dom.lyricsOffsetBadge.classList.toggle('is-offset', Math.abs(offset) >= 0.05);
    }
    if (dom.sheetLyricsOffsetLabel) {
      dom.sheetLyricsOffsetLabel.textContent = formatted;
    }
    if (dom.lyricsOffsetSavedChip) {
      const isCustomized = state.currentTrack && Math.abs(getStoredLyricOffset(state.currentTrack.id)) >= 0.05;
      dom.lyricsOffsetSavedChip.classList.toggle('hidden', !isCustomized);
    }
  }

  function getCurrentAudioTime() {
    if (state.activeEngine === 'audio' && dom.audio) {
      return dom.audio.currentTime || 0;
    } else if (state.activeEngine === 'youtube' && ytPlayer && isYtReady && typeof ytPlayer.getCurrentTime === 'function') {
      return ytPlayer.getCurrentTime() || 0;
    }
    return 0;
  }

  function setLyricOffset(newOffset, showFeedback = true) {
    const rounded = parseFloat((Math.round(newOffset * 10) / 10).toFixed(1));
    state.lyricOffset = rounded;
    if (state.currentTrack) {
      saveTrackLyricOffset(state.currentTrack.id, rounded);
    }
    updateLyricOffsetUI();

    // Đồng bộ lại tức thì vị trí câu hát với độ lệch mới
    const curTime = getCurrentAudioTime();
    syncLyricsWithTime(curTime);

    if (showFeedback) {
      triggerHaptic(8);
      const sign = rounded > 0 ? '+' : '';
      if (rounded === 0) {
        showToast('↺ Đã đặt lại độ trễ lời bài hát về 0.0s (Mặc định).');
      } else {
        showToast(`⏱️ Đã lưu độ lệch lời: ${sign}${rounded.toFixed(1)}s cho bài hát này`);
      }
    }
  }

  function adjustLyricOffset(delta) {
    const current = state.lyricOffset || 0;
    setLyricOffset(current + delta, true);
  }

  function resetLyricOffset() {
    setLyricOffset(0, true);
  }

  function syncCurrentLineToNow(lineTime) {
    const curTime = getCurrentAudioTime();
    if (curTime <= 0) {
      showToast('⚠️ Hãy bấm phát nhạc trước khi căn chuẩn mốc câu hát!');
      return;
    }
    // effectiveTime = curTime + offset = lineTime => offset = lineTime - curTime
    const calculatedOffset = parseFloat((lineTime - curTime).toFixed(1));
    setLyricOffset(calculatedOffset, false);
    triggerHaptic(15);
    const sign = calculatedOffset > 0 ? '+' : '';
    showToast(`🎯 Đã căn chuẩn câu hát này khớp với thời điểm ${formatTime(curTime)} (Độ lệch: ${sign}${calculatedOffset.toFixed(1)}s)`);
  }

  function renderLyricsLines(lines) {
    if (!dom.lyricsLinesContainer) return;
    dom.lyricsLinesContainer.innerHTML = lines.map((item, idx) => {
      return `
        <div class="lyric-line" data-index="${idx}" data-time="${item.time}">
          <span class="lyric-text">${escapeHtml(item.text || '♪')}</span>
          <button type="button" class="line-sync-anchor-btn" data-time="${item.time}" title="🎯 Chạm để căn chuẩn bài hát theo câu này">🎯</button>
        </div>
      `;
    }).join('');

    // Bấm vào câu hát bất kỳ để tua nhạc đến đúng đoạn đó (Click-to-seek)
    const lineEls = dom.lyricsLinesContainer.querySelectorAll('.lyric-line');
    lineEls.forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.line-sync-anchor-btn')) return;
        const time = parseFloat(el.getAttribute('data-time'));
        if (!isNaN(time)) {
          seekToSeconds(time);
          showToast(`⏩ Tua đến: ${formatTime(time)}`);
        }
      });
    });

    // Bấm vào nút căn chuẩn 🎯 để đồng bộ toàn bài ngay lập tức theo câu đang nghe
    const anchorBtns = dom.lyricsLinesContainer.querySelectorAll('.line-sync-anchor-btn');
    anchorBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const time = parseFloat(btn.getAttribute('data-time'));
        if (!isNaN(time)) {
          syncCurrentLineToNow(time);
        }
      });
    });
  }

  function syncLyricsWithTime(currentTime) {
    if (!state.lyrics || state.lyrics.length === 0) return;

    // Áp dụng độ lệch cân chỉnh (lyricOffset)
    const effectiveTime = Math.max(0, currentTime + (state.lyricOffset || 0));

    let currentIdx = -1;
    for (let i = 0; i < state.lyrics.length; i++) {
      if (effectiveTime >= state.lyrics[i].time) {
        currentIdx = i;
      } else {
        break;
      }
    }

    if (currentIdx === state.activeLyricIndex) return;
    state.activeLyricIndex = currentIdx;

    // Cập nhật giao diện trên Sân Khấu Lời Nhạc
    if (dom.lyricsLinesContainer) {
      const lineEls = dom.lyricsLinesContainer.children;
      for (let i = 0; i < lineEls.length; i++) {
        const el = lineEls[i];
        if (i === currentIdx) {
          el.classList.add('active');
          el.classList.remove('past');
        } else if (i < currentIdx) {
          el.classList.remove('active');
          el.classList.add('past');
        } else {
          el.classList.remove('active', 'past');
        }
      }

      if (currentIdx >= 0 && lineEls[currentIdx]) {
        lineEls[currentIdx].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }

    // Cập nhật thẻ Lời bài hát trên Mobile Fullscreen Sheet
    if (currentIdx >= 0 && state.lyrics[currentIdx]) {
      if (dom.sheetLyricsActiveText) {
        dom.sheetLyricsActiveText.textContent = state.lyrics[currentIdx].text;
      }
      if (dom.sheetLyricsNextText) {
        dom.sheetLyricsNextText.textContent = state.lyrics[currentIdx + 1]?.text || '';
      }
    }
  }

  function parseLRC(lrcText) {
    if (!lrcText || typeof lrcText !== 'string') return [];
    const lines = lrcText.split(/\r?\n/);
    const parsed = [];
    let fileOffsetSec = 0;

    // Trích xuất thẻ [offset:+/-millisec] nếu có trong file LRC chuẩn
    for (const line of lines) {
      const offsetMatch = line.match(/^\[offset:\s*([+-]?\d+)\s*\]/i);
      if (offsetMatch) {
        const ms = parseInt(offsetMatch[1], 10);
        if (!isNaN(ms)) {
          fileOffsetSec = ms / 1000;
        }
      }
    }

    const timeTagRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;

    for (const line of lines) {
      if (/^\[[a-zA-Z]+:/.test(line)) continue;

      const matches = [...line.matchAll(timeTagRegex)];
      if (matches.length > 0) {
        const text = line.replace(timeTagRegex, '').trim();
        for (const m of matches) {
          const minutes = parseInt(m[1], 10);
          const seconds = parseInt(m[2], 10);
          const fraction = m[3] ? parseFloat('0.' + m[3]) : 0;
          let totalSeconds = minutes * 60 + seconds + fraction;
          if (fileOffsetSec) {
            totalSeconds = Math.max(0, totalSeconds + fileOffsetSec);
          }
          totalSeconds = parseFloat(totalSeconds.toFixed(2));
          parsed.push({ time: totalSeconds, text });
        }
      }
    }
    return parsed.sort((a, b) => a.time - b.time);
  }

  async function fetchAndRenderLyrics(track) {
    if (!track || !track.title) return;

    if (lyricsAbortController) {
      lyricsAbortController.abort();
    }
    lyricsAbortController = new AbortController();

    state.lyrics = [];
    state.activeLyricIndex = -1;
    state.lyricsTrackId = track.id;
    state.lyricsLoading = true;
    state.lyricOffset = getStoredLyricOffset(track.id);
    updateLyricOffsetUI();

    // Cập nhật thông tin bài hát trên Sân khấu Lời Nhạc
    if (dom.lyricsTrackTitle) dom.lyricsTrackTitle.textContent = track.title;
    if (dom.lyricsTrackArtist) dom.lyricsTrackArtist.textContent = track.artist || 'Studio Ghibli';
    if (dom.lyricsTrackCover) dom.lyricsTrackCover.src = upgradeThumbnailUrl(track.thumbnail);

    // Tự động mở mục Lyrics trên tất cả thiết bị theo đúng mong muốn của người dùng
    openLyricsStage();

    // ========================================================================
    // ƯU TIÊN 1: NẾU BÀI HÁT CÓ LỜI ĐƯỢC NGƯỜI DÙNG ĐÍNH KÈM (DROP YOUR MUSIC)
    // ========================================================================
    if (track.lyrics && typeof track.lyrics === 'string' && track.lyrics.trim().length > 0) {
      state.lyricsLoading = false;
      const isLrc = /\[\d{1,2}:\d{2}(?:\.\d{1,3})?\]/.test(track.lyrics);

      if (isLrc) {
        const parsedLines = parseLRC(track.lyrics);
        if (parsedLines.length > 0) {
          state.lyrics = parsedLines;
          if (dom.lyricsSyncBadge) dom.lyricsSyncBadge.textContent = '✨ Lời đồng bộ do tác giả đính kèm';
          renderLyricsLines(state.lyrics);

          if (dom.sheetLyricsActiveText) {
            dom.sheetLyricsActiveText.textContent = state.lyrics[0]?.text || 'Giai điệu bắt đầu...';
          }
          if (dom.sheetLyricsNextText) {
            dom.sheetLyricsNextText.textContent = state.lyrics[1]?.text || '';
          }

          // Đồng bộ với thời gian hiện tại
          let curTime = 0;
          if (state.activeEngine === 'audio' && dom.audio) {
            curTime = dom.audio.currentTime || 0;
          } else if (state.activeEngine === 'youtube' && ytPlayer && isYtReady && typeof ytPlayer.getCurrentTime === 'function') {
            curTime = ytPlayer.getCurrentTime() || 0;
          }
          if (curTime > 0) {
            syncLyricsWithTime(curTime);
          }
          return;
        }
      }

      // Ngược lại: Lời dạng văn bản thường (Plain Text)
      state.lyrics = [];
      if (dom.lyricsSyncBadge) dom.lyricsSyncBadge.textContent = '📜 Lời bài hát do tác giả đính kèm';
      const plainLines = track.lyrics.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (dom.lyricsLinesContainer) {
        dom.lyricsLinesContainer.innerHTML = plainLines.map(line => `
          <div class="lyric-line past" style="opacity: 0.88; font-size: 1.35rem; text-align: center; margin-bottom: 14px;">
            ${escapeHtml(line)}
          </div>
        `).join('');
      }
      if (dom.sheetLyricsActiveText) {
        dom.sheetLyricsActiveText.textContent = plainLines[0] || 'Lời bài hát có sẵn';
      }
      return;
    }

    // ========================================================================
    // ƯU TIÊN 2: TỰ ĐỘNG TÌM KIẾM TRÊN KHO DỮ LIỆU LRCLIB (NẾU KHÔNG ĐÍNH KÈM)
    // ========================================================================
    if (dom.lyricsSyncBadge) dom.lyricsSyncBadge.textContent = '⏳ Đang nạp lời bài hát...';

    // Cập nhật trên thẻ Mobile Sheet
    if (dom.sheetLyricsActiveText) dom.sheetLyricsActiveText.textContent = 'Đang lắng nghe giai điệu và tải lời...';
    if (dom.sheetLyricsNextText) dom.sheetLyricsNextText.textContent = '';

    // Render trạng thái loading trên sân khấu
    if (dom.lyricsLinesContainer) {
      dom.lyricsLinesContainer.innerHTML = `
        <div class="lyrics-loading-state">
          <div class="lyrics-sparkle-icon">🍃</div>
          <p>Đang tìm kiếm lời bài hát <strong>${escapeHtml(track.title)}</strong>...</p>
        </div>
      `;
    }

    try {
      const params = new URLSearchParams({
        title: track.title,
        artist: track.artist || '',
        duration: track.durationSec || track.duration || ''
      });

      const response = await fetch(`/api/lyrics?${params.toString()}`, {
        signal: lyricsAbortController.signal
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      state.lyricsLoading = false;

      // Đảm bảo vẫn đúng bài hát hiện tại
      if (state.currentTrack?.id !== track.id) return;

      if (data.instrumental) {
        state.lyrics = [];
        if (dom.lyricsSyncBadge) dom.lyricsSyncBadge.textContent = '🍃 Bản nhạc hòa tấu không lời';
        if (dom.lyricsLinesContainer) {
          dom.lyricsLinesContainer.innerHTML = `
            <div class="lyrics-instrumental-state">
              <div class="lyrics-sparkle-icon">🎹</div>
              <h4>Giai Điệu Hòa Tấu Không Lời</h4>
              <p>Bản nhạc không lời mộc mạc từ Khu Vườn Ghibli. Hãy nhắm mắt và hòa mình vào từng nốt nhạc êm dịu.</p>
            </div>
          `;
        }
        if (dom.sheetLyricsActiveText) {
          dom.sheetLyricsActiveText.textContent = '🍃 Giai điệu hòa tấu không lời của Khu Vườn Ghibli';
        }
        return;
      }

      if (data.synced && Array.isArray(data.lines) && data.lines.length > 0) {
        state.lyrics = data.lines;
        if (dom.lyricsSyncBadge) dom.lyricsSyncBadge.textContent = '✨ Đồng bộ thời gian thực (Karaoke)';

        renderLyricsLines(state.lyrics);

        if (dom.sheetLyricsActiveText) {
          dom.sheetLyricsActiveText.textContent = state.lyrics[0]?.text || 'Giai điệu bắt đầu...';
        }
        if (dom.sheetLyricsNextText) {
          dom.sheetLyricsNextText.textContent = state.lyrics[1]?.text || '';
        }

        // Đồng bộ ngay với thời điểm hiện tại của bài nếu đang phát
        let curTime = 0;
        if (state.activeEngine === 'audio' && dom.audio) {
          curTime = dom.audio.currentTime || 0;
        } else if (state.activeEngine === 'youtube' && ytPlayer && isYtReady && typeof ytPlayer.getCurrentTime === 'function') {
          curTime = ytPlayer.getCurrentTime() || 0;
        }
        if (curTime > 0) {
          syncLyricsWithTime(curTime);
        }
      } else if (data.plain) {
        state.lyrics = [];
        if (dom.lyricsSyncBadge) dom.lyricsSyncBadge.textContent = '📜 Lời bài hát (Chưa đồng bộ nhịp)';

        const plainLines = data.plain.split(/\r?\n/).filter(l => l.trim().length > 0);
        if (dom.lyricsLinesContainer) {
          dom.lyricsLinesContainer.innerHTML = plainLines.map(line => `
            <div class="lyric-line past" style="opacity: 0.85; font-size: 1.5rem; text-align: center;">
              ${escapeHtml(line)}
            </div>
          `).join('');
        }
        if (dom.sheetLyricsActiveText) {
          dom.sheetLyricsActiveText.textContent = plainLines[0] || 'Lời bài hát có sẵn';
        }
      } else {
        state.lyrics = [];
        if (dom.lyricsSyncBadge) dom.lyricsSyncBadge.textContent = '🌱 Chưa có lời';
        if (dom.lyricsLinesContainer) {
          dom.lyricsLinesContainer.innerHTML = `
            <div class="lyrics-empty-state">
              <div class="lyrics-sparkle-icon">🎵</div>
              <p>Chưa có lời đồng bộ cho bài hát này trong kho dữ liệu cộng đồng.<br>Hãy tận hưởng trọn vẹn giai điệu tuyệt vời này nhé!</p>
            </div>
          `;
        }
        if (dom.sheetLyricsActiveText) {
          dom.sheetLyricsActiveText.textContent = 'Chưa có lời đồng bộ cho bài hát này.';
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn('[Lyrics Fetch Error]:', err.message);
      state.lyricsLoading = false;
      if (dom.lyricsSyncBadge) dom.lyricsSyncBadge.textContent = '⚠️ Chưa thể nạp lời';
      if (dom.lyricsLinesContainer) {
        dom.lyricsLinesContainer.innerHTML = `
          <div class="lyrics-empty-state">
            <div class="lyrics-sparkle-icon">🍃</div>
            <p>Không thể kết nối máy chủ lời nhạc lúc này. Đang phát nhạc bình thường...</p>
          </div>
        `;
      }
      if (dom.sheetLyricsActiveText) {
        dom.sheetLyricsActiveText.textContent = 'Không thể nạp lời bài hát lúc này.';
      }
    }
  }

  // Đồng bộ ngọn lửa Calcifer và thanh tiến trình liên tục (250ms)
  setInterval(() => {
    if (state.isPlaying && !state.isScrubbing) {
      if (state.activeEngine === 'audio' || state.currentTrack?.previewUrl) {
        if (dom.audio && dom.audio.duration) {
          const percent = (dom.audio.currentTime / dom.audio.duration) * 100;
          updateProgressUI(percent);
          if (dom.currentTime) dom.currentTime.textContent = formatTime(dom.audio.currentTime);
          if (dom.totalDuration) dom.totalDuration.textContent = formatTime(dom.audio.duration);
          if (dom.sheetCurrentTime) dom.sheetCurrentTime.textContent = formatTime(dom.audio.currentTime);
          if (dom.sheetTotalTime) dom.sheetTotalTime.textContent = formatTime(dom.audio.duration);
          syncLyricsWithTime(dom.audio.currentTime);
        }
      } else if (state.activeEngine === 'youtube' && ytPlayer && isYtReady && typeof ytPlayer.getCurrentTime === 'function') {
        const cur = ytPlayer.getCurrentTime();
        const dur = ytPlayer.getDuration();
        if (dur && dur > 0) {
          const percent = (cur / dur) * 100;
          updateProgressUI(percent);
          if (dom.currentTime) dom.currentTime.textContent = formatTime(cur);
          if (dom.totalDuration) dom.totalDuration.textContent = formatTime(dur);
          if (dom.sheetCurrentTime) dom.sheetCurrentTime.textContent = formatTime(cur);
          if (dom.sheetTotalTime) dom.sheetTotalTime.textContent = formatTime(dur);
          syncLyricsWithTime(cur);

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
    fetchAndRenderLyrics(track);

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

    // Dọn dẹp / dừng âm thanh trước đó để tránh trùng lặp
    if (ytPlayer && isYtReady && typeof ytPlayer.stopVideo === 'function') {
      ytPlayer.stopVideo();
    }
    if (dom.audio) {
      dom.audio.pause();
    }

    // 1. Luồng âm thanh trực tiếp (Drop Your Music, file tải lên, iTunes preview)
    const directAudioSource = track.audioUrl || track.streamUrl || track.previewUrl;

    if (directAudioSource) {
      // Ưu tiên phát qua HTML5 Audio cho file âm thanh trực tiếp (chạy nền 100% trên iOS PWA & Safari)
      state.activeEngine = 'audio';
      dom.audio.src = directAudioSource;
      dom.audio.load();
      const playPromise = dom.audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setPlaybackVisualState(true);
          state.consecutiveErrors = 0;
          updateMediaSession(track);
        }).catch(audioErr => {
          if (audioErr.name === 'AbortError') return;
          console.warn('[Native Audio Engine Warning]:', audioErr.message);
          setPlaybackVisualState(false);
        });
      }
    } else {
      // 2. Nhạc YouTube: Phát tức thì qua YouTube Engine chính thức (Zero Delay, 100% mượt mà)
      if (ytPlayer && isYtReady && typeof ytPlayer.loadVideoById === 'function') {
        state.activeEngine = 'youtube';
        ytPlayer.loadVideoById(track.id);
        ytPlayer.playVideo();
        setPlaybackVisualState(true);
        state.consecutiveErrors = 0;
        updateMediaSession(track);
      } else {
        setPlaybackVisualState(false);
      }
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
    if (dom.sheetProgressFill) {
      dom.sheetProgressFill.style.width = `${clamped}%`;
    }
    if (dom.sheetProgressThumb) {
      dom.sheetProgressThumb.style.left = `${clamped}%`;
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
        const t = formatTime(dom.audio.currentTime);
        if (dom.currentTime) dom.currentTime.textContent = t;
        if (dom.sheetCurrentTime) dom.sheetCurrentTime.textContent = t;
      }
    } else if (state.activeEngine === 'youtube' && ytPlayer && isYtReady && typeof ytPlayer.getDuration === 'function') {
      const dur = ytPlayer.getDuration();
      if (dur && dur > 0) {
        const targetTime = percent * dur;
        ytPlayer.seekTo(targetTime, true);
        const t = formatTime(targetTime);
        if (dom.currentTime) dom.currentTime.textContent = t;
        if (dom.sheetCurrentTime) dom.sheetCurrentTime.textContent = t;
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
  // 5. PLAYBACK MODES: LOOP & SHUFFLE (ALL 🔁 / ONE 🔂 / ACORN 🌰 / OFF ➡ / SHUFFLE 🔀)
  // ==========================================================================
  function cycleLoopMode() {
    if (state.loopMode === 'all') {
      state.loopMode = 'one';
      showToast('🔂 Chế độ: Lặp lại 1 bài vĩnh viễn');
    } else if (state.loopMode === 'one') {
      state.loopMode = 'acorn';
      showToast('🌰 Chế độ: Lặp theo danh sách Hạt Dẻ đã tích');
    } else if (state.loopMode === 'acorn') {
      state.loopMode = 'off';
      showToast('➡ Chế độ: Tắt lặp lại');
    } else {
      state.loopMode = 'all';
      showToast('🔁 Chế độ: Lặp toàn bộ danh sách (Vĩnh viễn)');
    }
    updateLoopUI();
  }

  function updateLoopUI() {
    const isOff = state.loopMode === 'off';
    const mode = state.loopMode;

    // 1. Bottom Player Loop Button
    if (dom.loopBtn) {
      dom.loopBtn.classList.toggle('active', !isOff);
    }
    if (dom.loopBadge) {
      if (mode === 'all') {
        dom.loopBadge.textContent = '🔁';
        dom.loopBadge.classList.remove('hidden');
      } else if (mode === 'one') {
        dom.loopBadge.textContent = '1';
        dom.loopBadge.classList.remove('hidden');
      } else if (mode === 'acorn') {
        dom.loopBadge.textContent = '🌰';
        dom.loopBadge.classList.remove('hidden');
      } else {
        dom.loopBadge.classList.add('hidden');
      }
    }
    if (dom.acornLoopActiveBadge) {
      dom.acornLoopActiveBadge.classList.toggle('hidden', mode !== 'acorn');
    }

    // 2. Mobile Fullscreen Sheet Loop Button
    if (dom.sheetLoopBtn) {
      dom.sheetLoopBtn.classList.toggle('active', !isOff);
    }
    if (dom.sheetLoopBadge) {
      if (mode === 'all') {
        dom.sheetLoopBadge.textContent = '🔁';
        dom.sheetLoopBadge.classList.remove('hidden');
      } else if (mode === 'one') {
        dom.sheetLoopBadge.textContent = '1';
        dom.sheetLoopBadge.classList.remove('hidden');
      } else if (mode === 'acorn') {
        dom.sheetLoopBadge.textContent = '🌰';
        dom.sheetLoopBadge.classList.remove('hidden');
      } else {
        dom.sheetLoopBadge.classList.add('hidden');
      }
    }
    if (dom.sheetLoopStatusChip) {
      if (mode === 'all') {
        dom.sheetLoopStatusChip.textContent = '🔁 Lặp vĩnh viễn (Toàn bộ)';
        dom.sheetLoopStatusChip.classList.remove('hidden');
      } else if (mode === 'one') {
        dom.sheetLoopStatusChip.textContent = '🔂 Lặp 1 bài vĩnh viễn';
        dom.sheetLoopStatusChip.classList.remove('hidden');
      } else if (mode === 'acorn') {
        dom.sheetLoopStatusChip.textContent = '🌰 Lặp danh sách Hạt Dẻ';
        dom.sheetLoopStatusChip.classList.remove('hidden');
      } else {
        dom.sheetLoopStatusChip.textContent = '➡ Tắt lặp lại';
        dom.sheetLoopStatusChip.classList.remove('hidden');
      }
    }
  }

  function toggleShuffle(explicitVal = null) {
    state.isShuffle = explicitVal !== null ? !!explicitVal : !state.isShuffle;
    updateShuffleUI();
    showToast(state.isShuffle ? '🔀 Chế độ: Trộn nhạc ngẫu nhiên BẬT' : '➡ Chế độ: Trộn nhạc ngẫu nhiên TẮT');
  }

  function updateShuffleUI() {
    if (dom.shuffleBtn) {
      dom.shuffleBtn.classList.toggle('active', state.isShuffle);
    }
    if (dom.sheetShuffleBtn) {
      dom.sheetShuffleBtn.classList.toggle('active', state.isShuffle);
    }
    if (dom.sheetShuffleStatusChip) {
      dom.sheetShuffleStatusChip.classList.toggle('hidden', !state.isShuffle);
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
      <div class="card-glare" aria-hidden="true"></div>
      <div class="track-card-vinyl-disc" aria-hidden="true"></div>
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
    attach3DTiltEffect(card);
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
      attach3DTiltEffect(card);
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
    if (dom.dropSongLyrics) dom.dropSongLyrics.value = '';
    if (dom.dropLyricsFileInput) dom.dropLyricsFileInput.value = '';
    if (dom.lyricsFileBadge) dom.lyricsFileBadge.classList.add('hidden');
    if (dom.lyricsBadgeFilename) dom.lyricsBadgeFilename.textContent = '';

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
      dom.removeSelectedFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
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

    // 3. Đính Kèm File Lời Bài Hát (.lrc / .txt)
    if (dom.browseLyricsFileBtn && dom.dropLyricsFileInput) {
      dom.browseLyricsFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dom.dropLyricsFileInput.click();
      });

      dom.dropLyricsFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target.result;
          if (dom.dropSongLyrics) {
            dom.dropSongLyrics.value = content;
          }
          if (dom.lyricsBadgeFilename) {
            const lineCount = content.split(/\r?\n/).filter(l => l.trim().length > 0).length;
            dom.lyricsBadgeFilename.textContent = `${file.name} (${lineCount} dòng)`;
          }
          if (dom.lyricsFileBadge) {
            dom.lyricsFileBadge.classList.remove('hidden');
          }
          showToast(`📜 Đã đính kèm file lời: ${file.name}`);
        };
        reader.readAsText(file);
      });
    }

    if (dom.removeLyricsFileBtn) {
      dom.removeLyricsFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dom.dropSongLyrics) dom.dropSongLyrics.value = '';
        if (dom.dropLyricsFileInput) dom.dropLyricsFileInput.value = '';
        if (dom.lyricsFileBadge) dom.lyricsFileBadge.classList.add('hidden');
        if (dom.lyricsBadgeFilename) dom.lyricsBadgeFilename.textContent = '';
        showToast('Đã hủy đính kèm file lời bài hát');
      });
    }

    // 4. Nút Gửi Bài Hát
    if (dom.dropSubmitBtn) {
      dom.dropSubmitBtn.addEventListener('click', async () => {
        if (!selectedAudioFile) {
          showToast('⚠️ Vui lòng chọn hoặc kéo thả file nhạc MP3 trước nhé!');
          return;
        }

        const title = (dom.dropSongTitle?.value || '').trim() || selectedAudioFile.name.replace(/\.[^/.]+$/, '');
        const artist = (dom.dropSongArtist?.value || '').trim() || 'Cộng đồng Home Music';
        const lyrics = (dom.dropSongLyrics?.value || '').trim();

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
            lyrics: lyrics || null,
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
            debouncedCloudSync();

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
    debouncedCloudSync();
  }

  function updateLikeButtonUI(trackId) {
    const isFav = state.favorites.some(t => t.id === trackId);
    if (dom.likeBtn) dom.likeBtn.textContent = isFav ? '💚' : '🤍';
    if (dom.sheetLikeBtn) dom.sheetLikeBtn.textContent = isFav ? '💚' : '🤍';
    if (dom.stageLikeIcon) dom.stageLikeIcon.textContent = isFav ? '💚' : '🤍';
    if (dom.stageLikeText) dom.stageLikeText.textContent = isFav ? 'Đã thích' : 'Yêu thích';
    if (dom.stageLikeBtn) dom.stageLikeBtn.classList.toggle('active', isFav);
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
          syncLyricsWithTime(dom.audio.currentTime);
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
        triggerHaptic(10);
        toggleShuffle();
      });
    }

    if (dom.loopBtn) {
      dom.loopBtn.addEventListener('click', () => {
        triggerHaptic(10);
        cycleLoopMode();
      });
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

    // Spotify-Style Real-time Synced Lyrics Stage Events
    if (dom.lyricsToggleBtn) {
      dom.lyricsToggleBtn.addEventListener('click', toggleLyricsStage);
    }
    if (dom.lyricsCloseBtn) {
      dom.lyricsCloseBtn.addEventListener('click', closeLyricsStage);
    }
    if (dom.lyricsStageBackdrop) {
      dom.lyricsStageBackdrop.addEventListener('click', closeLyricsStage);
    }
    if (dom.sheetLyricsExpandBtn) {
      dom.sheetLyricsExpandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openLyricsStage();
      });
    }
    if (dom.sheetLyricsCard) {
      dom.sheetLyricsCard.addEventListener('click', openLyricsStage);
    }

    // Lyric Sync Calibration Bar Events
    if (dom.lyricOffsetMinusHalfBtn) {
      dom.lyricOffsetMinusHalfBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        adjustLyricOffset(-0.5);
      });
    }
    if (dom.lyricOffsetMinusTenthBtn) {
      dom.lyricOffsetMinusTenthBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        adjustLyricOffset(-0.1);
      });
    }
    if (dom.lyricOffsetResetBtn) {
      dom.lyricOffsetResetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetLyricOffset();
      });
    }
    if (dom.lyricOffsetPlusTenthBtn) {
      dom.lyricOffsetPlusTenthBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        adjustLyricOffset(+0.1);
      });
    }
    if (dom.lyricOffsetPlusHalfBtn) {
      dom.lyricOffsetPlusHalfBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        adjustLyricOffset(+0.5);
      });
    }
    if (dom.sheetSyncQuickBtn) {
      dom.sheetSyncQuickBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openLyricsStage();
        if (dom.lyricsSyncBar) {
          dom.lyricsSyncBar.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Split-Screen Stage Left Panel Actions
    if (dom.stageLikeBtn) {
      dom.stageLikeBtn.addEventListener('click', () => {
        if (state.currentTrack) {
          toggleFavorite(state.currentTrack);
        }
      });
    }
    if (dom.stageQueueAddBtn) {
      dom.stageQueueAddBtn.addEventListener('click', () => {
        if (state.currentTrack) {
          toggleCustomLoopAcorn(state.currentTrack.id);
        }
      });
    }
    if (dom.stageUpNextPlayBtn) {
      dom.stageUpNextPlayBtn.addEventListener('click', () => {
        playNextTrack();
      });
    }

    // OLED True Black Battery Saver Events
    if (dom.batterySaverBtn) {
      dom.batterySaverBtn.addEventListener('click', () => {
        triggerHaptic(12);
        toggleBatterySaverMode();
      });
    }
    if (dom.mobileBatterySaverQuickBtn) {
      dom.mobileBatterySaverQuickBtn.addEventListener('click', () => {
        triggerHaptic(12);
        toggleBatterySaverMode();
      });
    }
    if (dom.batterySaverExitBtn) {
      dom.batterySaverExitBtn.addEventListener('click', () => {
        triggerHaptic(10);
        deactivateBatterySaverMode();
      });
    }

    // Double tap anywhere on battery saver overlay to wake screen
    if (dom.batterySaverOverlay) {
      let lastTapTime = 0;
      dom.batterySaverOverlay.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        const now = Date.now();
        const tapGap = now - lastTapTime;
        if (tapGap < 350 && tapGap > 40) {
          triggerHaptic(12);
          deactivateBatterySaverMode();
          lastTapTime = 0;
        } else {
          lastTapTime = now;
        }
      });
    }

    // Eco controls inside OLED overlay
    if (dom.batterySaverPrevBtn) {
      dom.batterySaverPrevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic(10);
        playPrevTrack();
      });
    }
    if (dom.batterySaverPlayBtn) {
      dom.batterySaverPlayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic(12);
        togglePlayPause();
      });
    }
    if (dom.batterySaverNextBtn) {
      dom.batterySaverNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic(10);
        playNextTrack();
      });
    }

    // Visibility change wakeLock re-request
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible' && state.isBatterySaverActive) {
        await requestWakeLock();
      }
    });

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
        toggleShuffle();
      } else if (e.key === 'y' || e.key === 'Y') {
        toggleLyricsStage();
      } else if (e.key === 'b' || e.key === 'B') {
        toggleBatterySaverMode();
      } else if (e.key === '[') {
        adjustLyricOffset(-0.5);
      } else if (e.key === ']') {
        adjustLyricOffset(+0.5);
      } else if (e.key === 'Escape') {
        if (state.isBatterySaverActive) {
          deactivateBatterySaverMode();
        } else if (state.isLyricsOpen) {
          closeLyricsStage();
        }
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
        debouncedCloudSync();
      }
    }
    window.__applyAmbientMode = applyMode;

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
        if (!state.isPlaying) {
          if (state.activeEngine === 'audio' && dom.audio) {
            dom.audio.play().then(() => {
              setPlaybackVisualState(true);
            }).catch(() => {
              togglePlayPause();
            });
          } else if (state.isMobile && state.backgroundPlayback && state.currentTrack && state.activeEngine === 'youtube') {
            const curTime = (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') ? ytPlayer.getCurrentTime() : 0;
            state.activeEngine = 'audio';
            dom.audio.src = `/api/stream/${state.currentTrack.id}`;
            dom.audio.currentTime = curTime;
            dom.audio.play().then(() => {
              setPlaybackVisualState(true);
            }).catch(() => {
              togglePlayPause();
            });
          } else {
            togglePlayPause();
          }
        }
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

  // Lắng nghe sự kiện Tắt màn hình / Chuyển Tab / Chuyển ứng dụng (Mobile Background State Sync)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (state.isPlaying) {
        updateMediaSessionPlaybackState(true);
      }
    } else if (document.visibilityState === 'visible') {
      if (state.isPlaying) {
        setPlaybackVisualState(true);
      }
    }
  });

  // Mở khóa AudioSession ngay lần chạm đầu tiên trên thiết bị di động (iOS Safari & PWA Standalone Audio Unlock)
  function unlockMobileAudioSession() {
    if (dom.audio && !dom.audio.dataset.unlocked) {
      dom.audio.dataset.unlocked = 'true';
      // Mồi âm thanh im lặng (silent WAV buffer) để iOS cấp quyền AudioSession nền cho ứng dụng
      const silentDataUri = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
      if (!dom.audio.src || dom.audio.src.endsWith('/')) {
        dom.audio.src = silentDataUri;
        dom.audio.play().then(() => {
          dom.audio.pause();
        }).catch(() => {});
      }
    }
  }
  window.addEventListener('touchstart', unlockMobileAudioSession, { once: true, passive: true });
  window.addEventListener('click', unlockMobileAudioSession, { once: true, passive: true });

  // ==========================================================================
  // 14. USER ACCOUNTS & MULTI-DEVICE CLOUD SYNCHRONIZATION
  // ==========================================================================
  let syncDebounceTimer = null;
  let selectedRegisterAvatar = null;

  // Khung cảnh thiên nhiên Studio Ghibli dịu mát tự động gán khi người dùng không chọn ảnh
  const GHIBLI_SCENIC_AVATARS = [
    'bg.jpg',
    'icon-home-music.png',
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%232d6a4f"/><stop offset="100%" stop-color="%2352b788"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g1)"/><circle cx="50" cy="38" r="15" fill="%23d8f3dc"/><path d="M26 80c0-13 11-23 24-23s24 10 24 23" fill="%23b7e4c7"/><circle cx="45" cy="36" r="2.5" fill="%231b4332"/><circle cx="55" cy="36" r="2.5" fill="%231b4332"/><path d="M48 42q2 2 4 0" stroke="%231b4332" stroke-width="1.5" fill="none"/></svg>',
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23e76f51"/><stop offset="100%" stop-color="%23f4a261"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g2)"/><circle cx="50" cy="50" r="28" fill="%23fefae0" opacity="0.35"/><path d="M20 75 Q 50 30 80 75 Z" fill="%23264653"/><circle cx="70" cy="30" r="7" fill="%23fefae0"/></svg>',
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231d3557"/><stop offset="100%" stop-color="%23457b9d"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g3)"/><path d="M0 65 Q 25 55 50 65 T 100 65 L 100 100 L 0 100 Z" fill="%23a8dadc"/><circle cx="35" cy="32" r="9" fill="%23f1faee"/></svg>',
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%232b2d42"/><stop offset="100%" stop-color="%238d99ae"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g4)"/><circle cx="50" cy="50" r="24" fill="%23edf2f4" opacity="0.8"/><path d="M12 85 Q 50 50 88 85 Z" fill="%23d90429"/></svg>'
  ];

  function getRandomScenicAvatar() {
    const idx = Math.floor(Math.random() * GHIBLI_SCENIC_AVATARS.length);
    return GHIBLI_SCENIC_AVATARS[idx];
  }

  function renderAvatarToElement(el, avatarSrc) {
    if (!el) return;
    const src = avatarSrc || 'bg.jpg';
    if (typeof src === 'string' && (src.startsWith('data:image/') || src.startsWith('http') || src.includes('.jpg') || src.includes('.png') || src.includes('.webp') || src.includes('.svg'))) {
      el.innerHTML = `<img src="${src}" alt="Avatar" class="user-avatar-img">`;
    } else {
      el.innerHTML = `<img src="bg.jpg" alt="Avatar" class="user-avatar-img">`;
    }
  }

  function processImageFile(file, maxWidth = 180, maxHeight = 180) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type || !file.type.startsWith('image/')) {
        return reject(new Error('Vui lòng chọn tệp hình ảnh (JPG, PNG, WebP)'));
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Không thể đọc tệp tin'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Không thể đọc dữ liệu hình ảnh'));
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const size = Math.min(img.width, img.height);
            const startX = (img.width - size) / 2;
            const startY = (img.height - size) / 2;

            const targetSize = Math.min(size, maxWidth);
            canvas.width = targetSize;
            canvas.height = targetSize;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, startX, startY, size, size, 0, 0, targetSize, targetSize);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            resolve(dataUrl);
          } catch (err) {
            reject(err);
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function debouncedCloudSync() {
    if (!state.authToken) return;
    clearTimeout(syncDebounceTimer);
    syncDebounceTimer = setTimeout(() => {
      syncUserDataToCloud(true);
    }, 1500);
  }

  function setAccountModalAlert(message, type = 'error') {
    if (!dom.accountModalAlert) return;
    if (!message) {
      dom.accountModalAlert.className = 'account-modal-alert hidden';
      dom.accountModalAlert.textContent = '';
      return;
    }
    dom.accountModalAlert.className = `account-modal-alert ${type}`;
    dom.accountModalAlert.textContent = message;
  }

  function updateAccountUI() {
    const user = state.currentUser;
    const isLogged = !!user;
    const currentAvatar = isLogged ? user.avatar : 'bg.jpg';

    // 1. Sidebar Card
    if (dom.sidebarUserName) {
      dom.sidebarUserName.textContent = isLogged ? (user.displayName || user.username) : 'Khách (Guest)';
    }
    if (dom.sidebarUserStatus) {
      dom.sidebarUserStatus.textContent = isLogged ? '☁️ Đã kết nối Đám Mây' : 'Chạm để đăng nhập';
    }
    renderAvatarToElement(dom.sidebarUserAvatar, currentAvatar);

    // 2. PC Topbar Button
    if (dom.topBarUserName) {
      dom.topBarUserName.textContent = isLogged ? (user.displayName || user.username) : 'Đăng nhập';
    }
    renderAvatarToElement(dom.topBarUserAvatar, currentAvatar);

    // 3. Mobile Topbar Button
    renderAvatarToElement(dom.mobileAccountAvatar, currentAvatar);

    // 4. Modal Header Avatar
    renderAvatarToElement(document.getElementById('modalHeaderAvatar'), currentAvatar);

    // 5. Modal Views
    if (isLogged) {
      if (dom.accountTabsBar) dom.accountTabsBar.style.display = 'none';
      if (dom.viewAccountLogin) dom.viewAccountLogin.classList.add('hidden');
      if (dom.viewAccountRegister) dom.viewAccountRegister.classList.add('hidden');
      if (dom.viewAccountProfile) dom.viewAccountProfile.classList.remove('hidden');

      // Update Profile elements
      renderAvatarToElement(dom.profileAvatar, user.avatar || 'bg.jpg');
      if (dom.profileDisplayName) dom.profileDisplayName.textContent = user.displayName || user.username;
      if (dom.profileUsername) dom.profileUsername.textContent = `@${user.username}`;
      if (dom.syncFavCount) dom.syncFavCount.textContent = state.favorites.length;
      
      let dropCount = 0;
      try {
        dropCount = JSON.parse(localStorage.getItem('my_dropped_music') || '[]').filter(t => t.id !== 'drop_preset_1').length;
      } catch (_) {}
      if (dom.syncDropCount) dom.syncDropCount.textContent = dropCount;

      if (dom.syncThemeLabel) {
        const isTw = document.body.classList.contains('twilight-mode');
        dom.syncThemeLabel.textContent = isTw ? 'Đêm Rừng' : 'Ban Ngày';
      }
    } else {
      if (dom.accountTabsBar) dom.accountTabsBar.style.display = 'grid';
      if (dom.viewAccountProfile) dom.viewAccountProfile.classList.add('hidden');
      // Default to Login view
      switchAccountTab('login');
    }
  }

  function switchAccountTab(target) {
    setAccountModalAlert(null);
    if (target === 'register') {
      if (dom.tabBtnRegister) dom.tabBtnRegister.classList.add('active');
      if (dom.tabBtnLogin) dom.tabBtnLogin.classList.remove('active');
      if (dom.viewAccountRegister) dom.viewAccountRegister.classList.remove('hidden');
      if (dom.viewAccountLogin) dom.viewAccountLogin.classList.add('hidden');
      if (!selectedRegisterAvatar && dom.registerAvatarPreviewImg) {
        if (!dom.registerAvatarPreviewImg.dataset.initialScenic) {
          const scenic = getRandomScenicAvatar();
          dom.registerAvatarPreviewImg.src = scenic;
          dom.registerAvatarPreviewImg.dataset.initialScenic = 'true';
        }
      }
    } else {
      if (dom.tabBtnLogin) dom.tabBtnLogin.classList.add('active');
      if (dom.tabBtnRegister) dom.tabBtnRegister.classList.remove('active');
      if (dom.viewAccountLogin) dom.viewAccountLogin.classList.remove('hidden');
      if (dom.viewAccountRegister) dom.viewAccountRegister.classList.add('hidden');
    }
  }

  function openAccountModal(preferredTab = 'login') {
    setAccountModalAlert(null);
    updateAccountUI();
    if (!state.currentUser) {
      switchAccountTab(preferredTab);
    }
    if (dom.ghibliAccountModal) {
      dom.ghibliAccountModal.classList.remove('hidden');
    }
  }

  function closeAccountModal() {
    if (dom.ghibliAccountModal) {
      dom.ghibliAccountModal.classList.add('hidden');
    }
    setAccountModalAlert(null);
  }

  async function checkExistingSession() {
    const token = state.authToken;
    if (!token) {
      updateAccountUI();
      return;
    }

    try {
      if (dom.sidebarUserStatus) dom.sidebarUserStatus.textContent = '☁️ Đang kết nối...';
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        state.currentUser = data.user;

        // Tự động hợp nhất (Merge) bài hát yêu thích giữa Cloud và Local
        if (Array.isArray(data.user.favorites) && data.user.favorites.length > 0) {
          const favMap = new Map();
          state.favorites.forEach(t => { if (t && t.id) favMap.set(t.id, t); });
          data.user.favorites.forEach(t => { if (t && t.id) favMap.set(t.id, t); });
          state.favorites = Array.from(favMap.values());
          try {
            localStorage.setItem('ghibli_favorites', JSON.stringify(state.favorites));
          } catch (_) {}
          if (dom.favCounter) dom.favCounter.textContent = `${state.favorites.length} bài`;
          renderFavorites();
        }

        // Tự động hợp nhất nhạc đã tải lên (My Dropped Music)
        if (Array.isArray(data.user.myDroppedMusic) && data.user.myDroppedMusic.length > 0) {
          const dropMap = new Map();
          let localDrops = [];
          try {
            localDrops = JSON.parse(localStorage.getItem('my_dropped_music') || '[]').filter(t => t.id !== 'drop_preset_1');
          } catch (_) {}
          localDrops.forEach(t => { if (t && t.id) dropMap.set(t.id, t); });
          data.user.myDroppedMusic.forEach(t => { if (t && t.id) dropMap.set(t.id, t); });
          const mergedDrops = Array.from(dropMap.values());
          try {
            localStorage.setItem('my_dropped_music', JSON.stringify(mergedDrops));
          } catch (_) {}
        }

        // Khôi phục cài đặt Theme nếu có
        if (data.user.settings && data.user.settings.theme && window.__applyAmbientMode) {
          const shouldBeTwilight = data.user.settings.theme === 'twilight';
          window.__applyAmbientMode(shouldBeTwilight, false);
        }

        // Khôi phục cài đặt Background Playback
        if (data.user.settings && data.user.settings.backgroundPlayback !== undefined) {
          state.backgroundPlayback = !!data.user.settings.backgroundPlayback;
          try { localStorage.setItem('ghibli_bg_playback', state.backgroundPlayback ? 'true' : 'false'); } catch (_) {}
          updateBgPlaybackUI();
        }

        // Khôi phục cài đặt Lyric Offsets từ Cloud
        if (data.user.settings && data.user.settings.lyricOffsets && typeof data.user.settings.lyricOffsets === 'object') {
          state.lyricOffsetStore = { ...state.lyricOffsetStore, ...data.user.settings.lyricOffsets };
          try { localStorage.setItem('ghibli_lyric_offsets', JSON.stringify(state.lyricOffsetStore)); } catch (_) {}
          if (state.currentTrack) {
            state.lyricOffset = getStoredLyricOffset(state.currentTrack.id);
          }
          updateLyricOffsetUI();
        }

        updateAccountUI();
        // Tự động đồng bộ ngược lại các bài hát vừa hợp nhất lên cloud
        debouncedCloudSync();
      } else {
        // Token không hợp lệ hoặc đã hết hạn
        state.authToken = null;
        state.currentUser = null;
        try { localStorage.removeItem('ghibli_auth_token'); } catch (_) {}
        updateAccountUI();
      }
    } catch (err) {
      console.warn('⚠️ [Auth] Không thể kết nối phiên đăng nhập:', err);
      updateAccountUI();
    }
  }

  async function handleLoginSubmit(e) {
    if (e) e.preventDefault();
    const username = (dom.loginUsername ? dom.loginUsername.value : '').trim();
    const password = (dom.loginPassword ? dom.loginPassword.value : '').trim();

    if (!username || !password) {
      setAccountModalAlert('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
      return;
    }

    const btn = dom.loginSubmitBtn;
    const oldHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>Đang xác thực...</span> ⏳';
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        state.authToken = data.token;
        state.currentUser = data.user;
        try { localStorage.setItem('ghibli_auth_token', data.token); } catch (_) {}

        // Hợp nhất danh sách yêu thích
        if (Array.isArray(data.user.favorites)) {
          const favMap = new Map();
          state.favorites.forEach(t => { if (t && t.id) favMap.set(t.id, t); });
          data.user.favorites.forEach(t => { if (t && t.id) favMap.set(t.id, t); });
          state.favorites = Array.from(favMap.values());
          try { localStorage.setItem('ghibli_favorites', JSON.stringify(state.favorites)); } catch (_) {}
          if (dom.favCounter) dom.favCounter.textContent = `${state.favorites.length} bài`;
          renderFavorites();
        }

        // Hợp nhất nhạc Drop
        if (Array.isArray(data.user.myDroppedMusic)) {
          const dropMap = new Map();
          let localDrops = [];
          try { localDrops = JSON.parse(localStorage.getItem('my_dropped_music') || '[]').filter(t => t.id !== 'drop_preset_1'); } catch (_) {}
          localDrops.forEach(t => { if (t && t.id) dropMap.set(t.id, t); });
          data.user.myDroppedMusic.forEach(t => { if (t && t.id) dropMap.set(t.id, t); });
          try { localStorage.setItem('my_dropped_music', JSON.stringify(Array.from(dropMap.values()))); } catch (_) {}
        }

        // Cập nhật giao diện
        updateAccountUI();
        showToast(`🎉 ${data.message || 'Đăng nhập thành công!'}`);

        // Đồng bộ dữ liệu hiện có lên cloud
        syncUserDataToCloud(true);

        if (dom.loginPassword) dom.loginPassword.value = '';
      } else {
        setAccountModalAlert(data.error || 'Tên đăng nhập hoặc mật khẩu không đúng!');
      }
    } catch (err) {
      setAccountModalAlert('Lỗi kết nối máy chủ: ' + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = oldHtml;
      }
    }
  }

  async function handleRegisterSubmit(e) {
    if (e) e.preventDefault();
    const displayName = (dom.registerDisplayName ? dom.registerDisplayName.value : '').trim();
    const username = (dom.registerUsername ? dom.registerUsername.value : '').trim().toLowerCase();
    const password = (dom.registerPassword ? dom.registerPassword.value : '').trim();
    const avatar = selectedRegisterAvatar || (dom.registerAvatarPreviewImg && dom.registerAvatarPreviewImg.src ? dom.registerAvatarPreviewImg.src : getRandomScenicAvatar());

    if (!displayName || !username || !password) {
      setAccountModalAlert('Vui lòng điền đầy đủ tất cả các trường thông tin!');
      return;
    }
    if (username.length < 3) {
      setAccountModalAlert('Tên đăng nhập phải có ít nhất 3 ký tự!');
      return;
    }
    if (password.length < 6) {
      setAccountModalAlert('Mật khẩu phải có tối thiểu 6 ký tự để đảm bảo an toàn!');
      return;
    }

    const btn = dom.registerSubmitBtn;
    const oldHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>Đang tạo tài khoản...</span> ⏳';
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, username, password, avatar })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        state.authToken = data.token;
        state.currentUser = data.user;
        try { localStorage.setItem('ghibli_auth_token', data.token); } catch (_) {}

        updateAccountUI();
        showToast(`✨ ${data.message || 'Tài khoản đã được tạo thành công!'}`);

        // Đẩy toàn bộ dữ liệu máy hiện tại (Favorites, My Drops, Theme) lên tài khoản mới này
        syncUserDataToCloud(true);

        if (dom.registerPassword) dom.registerPassword.value = '';
      } else {
        setAccountModalAlert(data.error || 'Không thể đăng ký tài khoản!');
      }
    } catch (err) {
      setAccountModalAlert('Lỗi kết nối máy chủ: ' + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = oldHtml;
      }
    }
  }

  function handleLogout() {
    try {
      localStorage.removeItem('ghibli_auth_token');
    } catch (_) {}
    state.authToken = null;
    state.currentUser = null;
    updateAccountUI();
    closeAccountModal();
    showToast('🍃 Đã đăng xuất tài khoản an toàn.');
  }

  async function syncUserDataToCloud(silent = false) {
    if (!state.authToken || state.isSyncing) return;
    state.isSyncing = true;

    if (dom.profileSyncStatusText) {
      dom.profileSyncStatusText.textContent = 'Đang đồng bộ Đám Mây...';
    }

    let localDrops = [];
    try {
      localDrops = JSON.parse(localStorage.getItem('my_dropped_music') || '[]').filter(t => t.id !== 'drop_preset_1');
    } catch (_) {}

    const payload = {
      avatar: state.currentUser ? state.currentUser.avatar : undefined,
      displayName: state.currentUser ? state.currentUser.displayName : undefined,
      favorites: state.favorites || [],
      myDroppedMusic: localDrops,
      settings: {
        theme: document.body.classList.contains('twilight-mode') ? 'twilight' : 'day',
        loopMode: state.loopMode || 'all',
        volume: state.volume || 0.8,
        backgroundPlayback: state.backgroundPlayback !== false,
        lyricOffsets: state.lyricOffsetStore || {}
      },
      customPlaylists: []
    };

    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.authToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        if (dom.profileSyncStatusText) {
          dom.profileSyncStatusText.textContent = `Đã đồng bộ (${timeStr})`;
        }
        if (dom.sidebarUserStatus) {
          dom.sidebarUserStatus.textContent = '☁️ Đã đồng bộ';
        }
        if (dom.syncFavCount) dom.syncFavCount.textContent = state.favorites.length;
        if (dom.syncDropCount) dom.syncDropCount.textContent = localDrops.length;
        if (!silent) {
          showToast('☁️ Toàn bộ dữ liệu của bạn đã được đồng bộ lên Đám Mây!');
        }
      } else {
        if (dom.profileSyncStatusText) dom.profileSyncStatusText.textContent = 'Lỗi đồng bộ';
      }
    } catch (err) {
      console.warn('⚠️ [Sync Error]:', err);
      if (dom.profileSyncStatusText) dom.profileSyncStatusText.textContent = 'Mất kết nối đồng bộ';
    } finally {
      state.isSyncing = false;
    }
  }

  function exportBackup() {
    let localDrops = [];
    try {
      localDrops = JSON.parse(localStorage.getItem('my_dropped_music') || '[]').filter(t => t.id !== 'drop_preset_1');
    } catch (_) {}

    const backupPayload = {
      app: 'Home Music • Studio Ghibli',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: state.currentUser ? {
        username: state.currentUser.username,
        displayName: state.currentUser.displayName,
        avatar: state.currentUser.avatar
      } : { username: 'guest', displayName: 'Khách', avatar: '🌰' },
      favorites: state.favorites || [],
      myDroppedMusic: localDrops,
      lyricOffsets: state.lyricOffsetStore || {},
      settings: {
        theme: document.body.classList.contains('twilight-mode') ? 'twilight' : 'day',
        loopMode: state.loopMode || 'all',
        volume: state.volume || 0.8
      }
    };

    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const namePrefix = state.currentUser ? state.currentUser.username : 'khach';
    a.download = `music_home_backup_${namePrefix}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('💾 Đã xuất tệp sao lưu dữ liệu (.json) thành công!');
  }

  function importBackup(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (!json || typeof json !== 'object') {
          showToast('⚠️ Tệp sao lưu không đúng định dạng JSON!');
          return;
        }

        // Khôi phục Favorites
        if (Array.isArray(json.favorites)) {
          state.favorites = json.favorites;
          try {
            localStorage.setItem('ghibli_favorites', JSON.stringify(state.favorites));
          } catch (_) {}
          if (dom.favCounter) dom.favCounter.textContent = `${state.favorites.length} bài`;
          renderFavorites();
        }

        // Khôi phục Lyric Offsets (Độ lệch lời bài hát đã cân chỉnh)
        if (json.lyricOffsets && typeof json.lyricOffsets === 'object') {
          state.lyricOffsetStore = json.lyricOffsets;
          try {
            localStorage.setItem('ghibli_lyric_offsets', JSON.stringify(state.lyricOffsetStore));
          } catch (_) {}
          if (state.currentTrack) {
            state.lyricOffset = getStoredLyricOffset(state.currentTrack.id);
          }
          updateLyricOffsetUI();
        }

        // Khôi phục My Dropped Music
        if (Array.isArray(json.myDroppedMusic)) {
          try {
            localStorage.setItem('my_dropped_music', JSON.stringify(json.myDroppedMusic));
          } catch (_) {}
        }

        // Khôi phục Cài đặt
        if (json.settings && json.settings.theme && window.__applyAmbientMode) {
          window.__applyAmbientMode(json.settings.theme === 'twilight', true);
        }

        updateAccountUI();
        showToast('🎉 Đã khôi phục toàn bộ bài hát và cài đặt từ tệp sao lưu!');

        // Nếu đang đăng nhập, đồng bộ dữ liệu vừa nhập lên cloud
        if (state.authToken) {
          syncUserDataToCloud(true);
        }
      } catch (err) {
        showToast('❌ Không thể đọc tệp sao lưu: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  function initUserAccounts() {
    // Custom Avatar Upload for Registration
    if (dom.registerAvatarFileInput) {
      dom.registerAvatarFileInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
          const compressedDataUrl = await processImageFile(file, 180, 180);
          selectedRegisterAvatar = compressedDataUrl;
          if (dom.registerAvatarPreviewImg) {
            dom.registerAvatarPreviewImg.src = compressedDataUrl;
          }
          if (dom.registerAvatarResetBtn) {
            dom.registerAvatarResetBtn.classList.remove('hidden');
          }
        } catch (err) {
          showToast(`⚠️ ${err.message || 'Không thể tải ảnh đại diện'}`);
        }
      });
    }

    const avatarPreviewWrap = document.getElementById('registerAvatarPreviewWrap');
    if (avatarPreviewWrap && dom.registerAvatarFileInput) {
      avatarPreviewWrap.addEventListener('click', () => {
        dom.registerAvatarFileInput.click();
      });
    }

    if (dom.registerAvatarResetBtn) {
      dom.registerAvatarResetBtn.addEventListener('click', () => {
        selectedRegisterAvatar = null;
        if (dom.registerAvatarFileInput) dom.registerAvatarFileInput.value = '';
        const scenic = getRandomScenicAvatar();
        if (dom.registerAvatarPreviewImg) {
          dom.registerAvatarPreviewImg.src = scenic;
          dom.registerAvatarPreviewImg.dataset.initialScenic = 'true';
        }
        dom.registerAvatarResetBtn.classList.add('hidden');
      });
    }

    // Profile Avatar Change (when logged in)
    if (dom.profileAvatarFileInput) {
      dom.profileAvatarFileInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
          const compressedDataUrl = await processImageFile(file, 180, 180);
          if (state.currentUser) {
            state.currentUser.avatar = compressedDataUrl;
            updateAccountUI();
            showToast('📸 Đã cập nhật ảnh đại diện mới!');
            syncUserDataToCloud(true);
          }
        } catch (err) {
          showToast(`⚠️ ${err.message || 'Không thể cập nhật ảnh đại diện'}`);
        }
      });
    }

    // Password Visibility Toggles
    if (dom.toggleLoginPasswordBtn && dom.loginPassword) {
      dom.toggleLoginPasswordBtn.addEventListener('click', () => {
        const isPass = dom.loginPassword.type === 'password';
        dom.loginPassword.type = isPass ? 'text' : 'password';
        dom.toggleLoginPasswordBtn.textContent = isPass ? '🙈' : '👁️';
      });
    }

    if (dom.toggleRegisterPasswordBtn && dom.registerPassword) {
      dom.toggleRegisterPasswordBtn.addEventListener('click', () => {
        const isPass = dom.registerPassword.type === 'password';
        dom.registerPassword.type = isPass ? 'text' : 'password';
        dom.toggleRegisterPasswordBtn.textContent = isPass ? '🙈' : '👁️';
      });
    }

    // Tab buttons in modal
    if (dom.tabBtnLogin) {
      dom.tabBtnLogin.addEventListener('click', () => switchAccountTab('login'));
    }
    if (dom.tabBtnRegister) {
      dom.tabBtnRegister.addEventListener('click', () => switchAccountTab('register'));
    }
    if (dom.linkSwitchToRegister) {
      dom.linkSwitchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        switchAccountTab('register');
      });
    }
    if (dom.linkSwitchToLogin) {
      dom.linkSwitchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        switchAccountTab('login');
      });
    }

    // Trigger open buttons
    if (dom.sidebarUserCard) {
      dom.sidebarUserCard.addEventListener('click', () => openAccountModal());
    }
    if (dom.sidebarAccountBtn) {
      dom.sidebarAccountBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openAccountModal();
      });
    }
    if (dom.topBarAccountBtn) {
      dom.topBarAccountBtn.addEventListener('click', () => openAccountModal());
    }
    if (dom.mobileAccountBtn) {
      dom.mobileAccountBtn.addEventListener('click', () => openAccountModal());
    }

    // Modal Close
    if (dom.accountModalCloseBtn) {
      dom.accountModalCloseBtn.addEventListener('click', closeAccountModal);
    }
    if (dom.accountModalBackdrop) {
      dom.accountModalBackdrop.addEventListener('click', closeAccountModal);
    }

    // Form Submissions
    if (dom.viewAccountLogin) {
      dom.viewAccountLogin.addEventListener('submit', handleLoginSubmit);
    }
    if (dom.viewAccountRegister) {
      dom.viewAccountRegister.addEventListener('submit', handleRegisterSubmit);
    }

    // Profile Actions
    if (dom.manualSyncBtn) {
      dom.manualSyncBtn.addEventListener('click', () => syncUserDataToCloud(false));
    }
    if (dom.exportBackupBtn) {
      dom.exportBackupBtn.addEventListener('click', exportBackup);
    }
    if (dom.backupFileInput) {
      dom.backupFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          importBackup(e.target.files[0]);
          e.target.value = '';
        }
      });
    }
    if (dom.logoutBtn) {
      dom.logoutBtn.addEventListener('click', handleLogout);
    }

    // Keydown ESC to close Account modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dom.ghibliAccountModal && !dom.ghibliAccountModal.classList.contains('hidden')) {
        closeAccountModal();
      }
    });

    // Kiểm tra phiên đăng nhập đã lưu
    checkExistingSession();
  }

  // Khởi động
  function init() {
    setVolume(0.8);
    initAmbientMode();
    initMagicCursorDust();
    initMobileBottomNav();
    initMobileFullscreenSheet();
    updateLoopUI();
    updateShuffleUI();
    setupMediaSessionHandlers();
    setupEvents();
    initDropYourMusicEvents();
    loadFavorites();
    loadCommunityTracks();
    initUserAccounts();
    updateBatterySaverUI();

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
  window.openAccountModal = openAccountModal;
  window.syncUserDataToCloud = syncUserDataToCloud;
  window.toggleBatterySaverMode = toggleBatterySaverMode;
  window.activateBatterySaverMode = activateBatterySaverMode;
  window.deactivateBatterySaverMode = deactivateBatterySaverMode;
  window.adjustLyricOffset = adjustLyricOffset;
  window.resetLyricOffset = resetLyricOffset;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
