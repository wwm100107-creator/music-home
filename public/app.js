/**
 * ============================================================================
 * MUSIC HOME • STUDIO GHIBLI & MY NEIGHBOR TOTORO SOUND STATION
 * Production Audio Streaming Engine & VisionOS Proxy Client
 * ============================================================================
 */

(() => {
  'use strict';
    // ==========================================================================
  // GHIBLI HAND-DRAWN BESPOKE VECTOR ICON LIBRARY (TWO-TONE ICONSAX STANDARD)
  // High-craft vector SVG icons tailored for Studio Ghibli woodland theme
  // ==========================================================================
  const GhibliIcons = {
    trimScissors: `<svg class="ghibli-svg-icon ghibli-icon-trim-scissors" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="6" r="3" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity=".18"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity=".18"/><path d="m8.2 8.2 12.3 12.3M8.2 15.8 20.5 3.5M12 12l4.5-4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M17.2 3.5c1.5-1 3-.5 3.3.7-.4 1-1.5 1.2-3.3-.7z" fill="#a9c982"/></svg>`,
    errorMark: `<svg class="ghibli-svg-icon ghibli-icon-error-mark" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity=".12"/><path d="m8.5 8.5 7 7m0-7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    totoroAcorn: `<svg class="ghibli-svg-icon ghibli-icon-totoro-acorn" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 8.5C5 5.5 8 4 12 4s7 1.5 7 4.5c0 1-.8 1.8-2 2H7c-1.2-.2-2-1-2-2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="currentColor" fill-opacity="0.25"/><path d="M8 6.5l2 3M11 5.5l2 4M14 6.5l2 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/><path d="M12 4V2c-.6-.6-1.5-.5-1.8.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M12 2.5c1.2-.8 2.8-.5 3 .8-.2.8-1.5 1.2-3-.8z" fill="var(--ghibli-leaf-green, #52b788)" opacity="0.9"/><path d="M6.5 10.5C6.5 16 9.5 21.5 12 22c2.5-.5 5.5-6 5.5-11.5H6.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="currentColor" fill-opacity="0.12"/><path d="M8.5 13.5c.4 2.5 1.5 4.5 2.5 5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/></svg>`,

    leafBattery: `<svg class="ghibli-svg-icon ghibli-icon-leaf-battery" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="16" height="12" rx="3.5" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity="0.08"/><path d="M20.5 10v4c1-.5 1-3.5 0-4z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M6.5 14c0-2.2 1-3.2 2.5-3.2.5 1.5 0 3.2-2.5 3.2z" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/><path d="M10.5 14c0-3.2 1.2-4.5 3-4.5.5 2 0 4.5-3 4.5z" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/><path d="M14.5 14c0-4.2 1.5-6 3.5-6 .5 2.5 0 6-3.5 6z" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/><path d="M8 6c0-1.8 1.5-2.8 3-2.8.3 1.2-.5 2.5-2 2.8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" fill="var(--ghibli-leaf-green, #52b788)" opacity="0.8"/></svg>`,

    vintageMic: `<svg class="ghibli-svg-icon ghibli-icon-vintage-mic" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="2.5" width="8" height="11" rx="4" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity="0.14"/><path d="M8.5 6.5h7M8.5 9.5h7M12 2.5v11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/><path d="M5 10c0 4 3.2 7 7 7s7-3 7-7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M12 17v4.5M8 21.5h8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M12 18.5c1.5-1 2.8-.5 2.5.8-.4 1-1.6.8-2.5-.8z" fill="var(--ghibli-leaf-green, #52b788)" stroke="currentColor" stroke-width="0.8" opacity="0.9"/></svg>`,

    brassLens: `<svg class="ghibli-svg-icon ghibli-icon-brass-lens" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10.5" cy="10.5" r="7" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity="0.08"/><path d="M7.5 7.5a4.2 4.2 0 0 1 5-.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/><path d="M15.5 15.5L21 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="15.5" cy="15.5" r="1.3" fill="currentColor"/><path d="M16 13.5c1.2-1.2 2.5-.6 2.2.8-.4 1-1.5.8-2.2-.8z" fill="var(--ghibli-leaf-green, #52b788)" opacity="0.85"/></svg>`,

    pocketWatch: `<svg class="ghibli-svg-icon ghibli-icon-pocket-watch" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2.5h4M12 2.5v2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="2" r="1.5" stroke="currentColor" stroke-width="1.2"/><circle cx="12" cy="13.5" r="8" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity="0.1"/><path d="M12 7.5v1M17.5 13.5h-1M12 19.5v-1M6.5 13.5h1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/><path d="M12 13.5l-2.5-3M12 13.5l3.5 1.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="13.5" r="1" fill="currentColor"/></svg>`,

    compassAnchor: `<svg class="ghibli-svg-icon ghibli-icon-compass-anchor" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity="0.08"/><circle cx="12" cy="12" r="6.2" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2.5" opacity="0.5"/><path d="M12 3.8L14 11h-4L12 3.8z" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/><path d="M12 20.2L10 13h4L12 20.2z" fill="currentColor" fill-opacity="0.3" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/><path d="M4 12l4-1.5v3L4 12zM20 12l-4 1.5v-3L20 12z" fill="currentColor" fill-opacity="0.25"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/></svg>`,

    fireflyLantern: `<svg class="ghibli-svg-icon ghibli-icon-firefly-lantern" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 6C8.5 4.2 10.2 3.5 12 3.5s3.5.7 5 2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="2.2" r="1.2" stroke="currentColor" stroke-width="1.2"/><rect x="7" y="5.5" width="10" height="2" rx="1" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.2"/><path d="M7.5 7.5L6.5 16c-.3 2.5 1.5 4.5 4 4.5h3c2.5 0 4.3-2 4-4.5l-1-8.5H7.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="currentColor" fill-opacity="0.1"/><path d="M10 7.5v12.5M14 7.5v12.5" stroke="currentColor" stroke-width="1" opacity="0.4"/><circle cx="12" cy="13.5" r="2.2" fill="#ffd166" opacity="0.95"/><path d="M12 10v-1M12 17v-1M8.5 13.5h-1M15.5 13.5h-1" stroke="#ffd166" stroke-width="1.2" stroke-linecap="round"/></svg>`,

    woodenHeadphone: `<svg class="ghibli-svg-icon ghibli-icon-wooden-headphone" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 14v-2.5C4 7.4 7.6 3.5 12 3.5s8 3.9 8 8V14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="2.5" y="13" width="4.5" height="7" rx="2.2" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity="0.2"/><rect x="17" y="13" width="4.5" height="7" rx="2.2" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity="0.2"/><path d="M12 3.5c-1-1.5-2.5-1.5-3-.8.2 1.2 1.2 1.6 2.5 1.4M12 3.5c1-1.5 2.5-1.5 3-.8-.2 1.2-1.2 1.6-2.5 1.4" stroke="currentColor" stroke-width="1" fill="currentColor" fill-opacity="0.3"/></svg>`,

    loopTwigs: `<svg class="ghibli-svg-icon ghibli-icon-loop-twigs" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12A7 7 0 0 1 18 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M14.5 6.5H18V3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 4.5c.6-1.5 2.2-2 3.2-.5s0 2.2-1.5 2" fill="var(--ghibli-leaf-green, #52b788)" stroke="currentColor" stroke-width="0.8" opacity="0.9"/><path d="M19 12A7 7 0 0 1 6 17.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M9.5 17.5H6V21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 19.5c-.6 1.5-2.2 2-3.2.5s0-2.2 1.5-2" fill="var(--ghibli-leaf-green, #52b788)" stroke="currentColor" stroke-width="0.8" opacity="0.9"/></svg>`,

    loopSingle: `<svg class="ghibli-svg-icon ghibli-icon-loop-single" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12A7 7 0 0 1 18 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M14.5 6.5H18V3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 12A7 7 0 0 1 6 17.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M9.5 17.5H6V21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3.6" fill="currentColor" fill-opacity="0.18"/><path d="M11 10.6l1.2-.8v4.2M10.5 14h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

    shuffleWind: `<svg class="ghibli-svg-icon ghibli-icon-shuffle-wind" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6.5h3.5c2 0 4 4.5 6.5 7.5H19" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M16 11l3.5 3-3.5 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 17.5h3.5c1.2 0 2.4-1.5 3.5-3M14 9.5c.8-.7 1.8-1 2.8-1H19" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M16 5.5l3.5 3-3.5 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.5 4.5c1.2 0 2 1 1.8 2s-1.8 1.4-2.2.6.2-2 .4-2.6z" fill="var(--ghibli-leaf-green, #52b788)" opacity="0.85"/></svg>`,

    kodamaUser: `<svg class="ghibli-svg-icon ghibli-icon-kodama-user" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 10.5C7 5.5 9.5 3.5 12 3.5s5 2 5 7c0 4-2 6-5 6s-5-2-5-6z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="currentColor" fill-opacity="0.15"/><circle cx="9.8" cy="9.5" r="1.3" fill="currentColor"/><circle cx="14.2" cy="9.5" r="1.3" fill="currentColor"/><circle cx="12" cy="13" r="1" fill="currentColor"/><path d="M5.5 20.5c.5-3.2 3.2-4.5 6.5-4.5s6 1.3 6.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,

    brassPadlock: `<svg class="ghibli-svg-icon ghibli-icon-brass-padlock" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><rect x="5" y="10.5" width="14" height="10.5" rx="3.5" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity="0.15"/><circle cx="12" cy="15" r="1.5" fill="currentColor"/><path d="M12 16.5v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,

    sketchedEye: `<svg class="ghibli-svg-icon ghibli-icon-sketched-eye" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 12c2.5-5 5.5-7 9.5-7s7 2 9.5 7c-2.5 5-5.5 7-9.5 7s-7-2-9.5-7z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="currentColor" fill-opacity="0.08"/><circle cx="12" cy="12" r="3.5" stroke="currentColor" stroke-width="1.4" fill="currentColor" fill-opacity="0.2"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="13.2" cy="11" r="0.8" fill="#ffffff"/></svg>`,

    eyeClosed: `<svg class="ghibli-svg-icon ghibli-icon-eye-closed" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 11c3 4.5 5.5 6 9 6s6-1.5 9-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M5.5 13.5l-1.5 2.5M9 16l-1 2.8M12 17v3M15 16l1 2.8M18.5 13.5l1.5 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,

    leafHeartFilled: `<svg class="ghibli-svg-icon ghibli-icon-leaf-heart liked" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="currentColor"/><path d="M12 8c0 4.2-2 7.5-5 9M12 11.5c1.5 2 3.2 3.8 5 5" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" opacity="0.8"/></svg>`,

    leafHeartOutline: `<svg class="ghibli-svg-icon ghibli-icon-leaf-heart unliked" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="currentColor" fill-opacity="0.1"/><path d="M12 8.5c0 3.5-1.5 6-3.8 7.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.4"/></svg>`,

    skyCloud: `<svg class="ghibli-svg-icon ghibli-icon-sky-cloud" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.5 18.5h11a4.5 4.5 0 0 0 1.2-8.8A6.5 6.5 0 0 0 7 7.5a5 5 0 0 0-5 5 4.5 4.5 0 0 0 4.5 6z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="currentColor" fill-opacity="0.14"/><path d="M8 15c2-1 4.5-1 6.5.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/></svg>`,

    treasureScroll: `<svg class="ghibli-svg-icon ghibli-icon-treasure-scroll" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 19c0 1.7-1.3 3-3 3H6c-1.7 0-3-1.3-3-3s1.3-3 3-3h9c1.7 0 3 1.3 3 3z" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity="0.2"/><path d="M6 16V4.5C6 3.4 6.9 2.5 8 2.5h10c1.1 0 2 .9 2 2V16" stroke="currentColor" stroke-width="1.6"/><path d="M9 7h6M9 10.5h8M9 14h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/><circle cx="15.5" cy="16.5" r="2" fill="var(--theme-accent, currentColor)" opacity="0.75"/></svg>`,

    explorerFolder: `<svg class="ghibli-svg-icon ghibli-icon-explorer-folder" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.8c.8 0 1.5.4 1.9 1l1.4 1.8c.4.4.9.7 1.4.7H19A2.5 2.5 0 0 1 21.5 11v7.5a2.5 2.5 0 0 1-2.5 2.5H5.5A2.5 2.5 0 0 1 3 18.5V7.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="currentColor" fill-opacity="0.14"/><path d="M3 11h18.5" stroke="currentColor" stroke-width="1.2" opacity="0.5"/></svg>`,

    cottageDoor: `<svg class="ghibli-svg-icon ghibli-icon-cottage-door" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 21V9a7 7 0 0 1 14 0v12" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity="0.12"/><path d="M3 21h18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M12 4v17" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><circle cx="15.5" cy="13.5" r="1.3" fill="currentColor"/></svg>`,

    vintageCamera: `<svg class="ghibli-svg-icon ghibli-icon-vintage-camera" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="7" width="18" height="13" rx="3.5" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity="0.12"/><path d="M8 7V5.5C8 4.7 8.7 4 9.5 4h5c.8 0 1.5.7 1.5 1.5V7" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="13.5" r="4" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity="0.2"/><circle cx="12" cy="13.5" r="1.8" fill="currentColor"/><circle cx="17.5" cy="10" r="1" fill="currentColor"/></svg>`,

    calciferFlame: `<svg class="ghibli-svg-icon ghibli-icon-calcifer-flame" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.5c1.8 2.8 4.5 5.5 4.5 9 0 4.5-3.5 8.5-8.5 8.5S3 16 3 12c0-3.5 2.5-6 4.5-8.5 0 2.5 1.5 3.5 3 3.5 1 0 1.8-.8 2.2-2.2-.3-.8-.5-1.5-.7-2.3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="currentColor" fill-opacity="0.2"/><path d="M11 9.5c1 1.2 2 2 2 3.8 0 2-1.5 3.7-3.7 3.7S6 15.3 6 13.5c0-1.2 1-2 1.8-3 .5 1.2 1.5 1.5 2.2 1.5.8 0 1.5-.8 1-2.5z" fill="currentColor" fill-opacity="0.4"/><circle cx="8.5" cy="13.5" r="0.9" fill="currentColor"/><circle cx="12" cy="13.5" r="0.9" fill="currentColor"/></svg>`,

    bambooChart: `<svg class="ghibli-svg-icon ghibli-icon-bamboo-chart" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="14" width="3.5" height="7" rx="1" stroke="currentColor" stroke-width="1.4" fill="currentColor" fill-opacity="0.2"/><line x1="4" y1="17.5" x2="7.5" y2="17.5" stroke="currentColor" stroke-width="1"/><rect x="10" y="9" width="3.5" height="12" rx="1" stroke="currentColor" stroke-width="1.4" fill="currentColor" fill-opacity="0.2"/><line x1="10" y1="13" x2="13.5" y2="13" stroke="currentColor" stroke-width="1"/><line x1="10" y1="17" x2="13.5" y2="17" stroke="currentColor" stroke-width="1"/><rect x="16" y="4" width="3.5" height="17" rx="1" stroke="currentColor" stroke-width="1.4" fill="currentColor" fill-opacity="0.2"/><line x1="16" y1="9.5" x2="19.5" y2="9.5" stroke="currentColor" stroke-width="1"/><line x1="16" y1="15" x2="19.5" y2="15" stroke="currentColor" stroke-width="1"/><path d="M4 12c3-2 6-5 15-7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M16 4.5l3.5.5-.5 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

    vinylGroove: `<svg class="ghibli-svg-icon ghibli-icon-vinyl-groove" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity="0.1"/><circle cx="12" cy="12" r="7.2" stroke="currentColor" stroke-width="0.9" stroke-dasharray="8 4" opacity="0.45"/><circle cx="12" cy="12" r="5.2" stroke="currentColor" stroke-width="0.9" stroke-dasharray="6 3" opacity="0.45"/><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.2" fill="currentColor" fill-opacity="0.25"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>`,

    musicSprout: `<svg class="ghibli-svg-icon ghibli-icon-music-sprout" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.5 17V6.5l9-2.5V14.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M8.5 6.5l9-2.5M8.5 9.5l9-2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M8.5 17c0 1.8-1.6 3-3.5 3s-3-1.2-3-3 1.4-3 3.5-3c1.2 0 2.2.4 3 1.2" stroke="currentColor" stroke-width="1.4" fill="currentColor" fill-opacity="0.3"/><path d="M17.5 14.5c0 1.8-1.6 3-3.5 3s-3-1.2-3-3 1.4-3 3.5-3c1.2 0 2.2.4 3 1.2" stroke="currentColor" stroke-width="1.4" fill="currentColor" fill-opacity="0.3"/></svg>`,

    leafSprout: `<svg class="ghibli-svg-icon ghibli-icon-leaf-sprout" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21c0-6 2.5-11 8.5-13-1 6-4 10-8.5 13z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="currentColor" fill-opacity="0.25"/><path d="M12 21c-2-5-6-8-9-8 1-4 5-6 9-4" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="currentColor" fill-opacity="0.15"/><path d="M12 21V9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,

    globeVintage: `<svg class="ghibli-svg-icon ghibli-icon-globe-vintage" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity="0.1"/><ellipse cx="12" cy="12" rx="4.5" ry="9" stroke="currentColor" stroke-width="1.2" opacity="0.6"/><line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M5.5 7.5h13M5.5 16.5h13" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.5"/></svg>`,

    whiteDove: `<svg class="ghibli-svg-icon ghibli-icon-white-dove" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.5 7c-2 0-4 1-5 2.5-2.5-2-6-2.5-9-1.5 2 2 3.5 4.5 4 7-2-.5-4 0-5.5 1.5 3 2.5 6.5 2.5 10 1 1.5-.5 3-1.5 4-3 1-.3 2-1 2.5-2.5-.5-.2-1.5-.5-2-.5 1-1 1.5-2.5 1-4.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="currentColor" fill-opacity="0.15"/><path d="M19.5 8l2.5-2M20.5 7l1.5 1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,

    refreshWater: `<svg class="ghibli-svg-icon ghibli-icon-refresh-water" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 12A8 8 0 0 1 6.5 17.7L4 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M20 9V4h-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 12A8 8 0 0 1 17.5 6.3L20 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 15v5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

    autumnLeaf: `<svg class="ghibli-svg-icon ghibli-icon-autumn-leaf" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.5 4.5c-4 1-8 4-11 8-2.5 3.5-3 8-3 8s4.5-.5 8-3c4-3 7-7 8-11-1-.5-1.5-.5-2-2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="currentColor" fill-opacity="0.2"/><path d="M5.5 20.5l9-9M10 16l3 1.5M13 13l2 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,

    paintPalette: `<svg class="ghibli-svg-icon ghibli-icon-paint-palette" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.5 2 2 6.5 2 12c0 3 1.5 5 4 5 1.2 0 2-.8 2-2 0-.8.5-1.5 1.5-1.5h1.5c4.5 0 8-3.5 8-8 0-4.5-4-5.5-7-5.5z" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity="0.12"/><circle cx="7" cy="8" r="1.5" fill="currentColor" opacity="0.8"/><circle cx="11.5" cy="6" r="1.5" fill="currentColor" opacity="0.6"/><circle cx="16" cy="8" r="1.5" fill="currentColor" opacity="0.5"/><circle cx="17.5" cy="12.5" r="1.5" fill="currentColor" opacity="0.7"/><circle cx="13" cy="15" r="1.6" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>`,

    sparkleStar: `<svg class="ghibli-svg-icon ghibli-icon-sparkle-star" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="currentColor" fill-opacity="0.25"/><circle cx="18" cy="5" r="1" fill="currentColor" opacity="0.7"/><circle cx="6" cy="19" r="1" fill="currentColor" opacity="0.7"/></svg>`,

    sunWarm: `<svg class="ghibli-svg-icon ghibli-icon-sun-warm" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity="0.25"/><path d="M12 2.5v2.5M12 19V21.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,

    moonCrescent: `<svg class="ghibli-svg-icon ghibli-icon-moon-crescent" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="currentColor" fill-opacity="0.2"/><circle cx="17.5" cy="6" r="1" fill="currentColor" opacity="0.8"/><circle cx="19" cy="9.5" r="0.7" fill="currentColor" opacity="0.8"/></svg>`,

    gearBrass: `<svg class="ghibli-svg-icon ghibli-icon-brass-gear" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2" fill="currentColor" fill-opacity="0.15"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" fill="currentColor" fill-opacity="0.1"/></svg>`,

    rankLeafGold: `<svg class="ghibli-svg-icon ghibli-icon-rank-leaf gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5" fill="#ffe170" fill-opacity="0.25"/><path d="M12 7v10M8.5 9.5C10 11 12 11 12 11s2 0 3.5-1.5M8.5 14.5C10 16 12 16 12 16s2 0 3.5-1.5" stroke="currentColor" stroke-width="1.4"/></svg>`,

    rankLeafSilver: `<svg class="ghibli-svg-icon ghibli-icon-rank-leaf silver" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5" fill="#e9ecef" fill-opacity="0.25"/><path d="M12 7v10M8.5 9.5C10 11 12 11 12 11s2 0 3.5-1.5M8.5 14.5C10 16 12 16 12 16s2 0 3.5-1.5" stroke="currentColor" stroke-width="1.4"/></svg>`,

    rankLeafBronze: `<svg class="ghibli-svg-icon ghibli-icon-rank-leaf bronze" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5" fill="#e0a96d" fill-opacity="0.25"/><path d="M12 7v10M8.5 9.5C10 11 12 11 12 11s2 0 3.5-1.5M8.5 14.5C10 16 12 16 12 16s2 0 3.5-1.5" stroke="currentColor" stroke-width="1.4"/></svg>`,

    vintagePiano: `<svg class="ghibli-svg-icon ghibli-icon-vintage-piano" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity="0.12"/><rect x="5.5" y="10" width="13" height="7" rx="1" stroke="currentColor" stroke-width="1.2" fill="#fff" fill-opacity="0.85"/><line x1="8" y1="10" x2="8" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="10.5" y1="10" x2="10.5" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="13.5" y1="10" x2="13.5" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="16" y1="10" x2="16" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,

    sproutSoar: `<svg class="ghibli-svg-icon ghibli-icon-sprout-soar" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.5C14 6 18 8 18 13c0 3.5-2.5 6-6 6s-6-2.5-6-6c0-5 4-7 6-10.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="currentColor" fill-opacity="0.25"/><path d="M12 6v13M8 12c2 1 4 1 8 0" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><circle cx="12" cy="10" r="1.5" fill="currentColor"/></svg>`,

    arrowRight: `<svg class="ghibli-svg-icon ghibli-icon-arrow-right" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

    checkDone: `<svg class="ghibli-svg-icon ghibli-icon-check-done" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity="0.14"/><path d="M8 12l2.8 2.8L16 8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

    quillScroll: `<svg class="ghibli-svg-icon ghibli-icon-quill-scroll" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 4.5c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v13c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V4.5z" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity="0.1"/><path d="M4 19.5c0 1.4 1.1 2.5 2.5 2.5h11c1.4 0 2.5-1.1 2.5-2.5s-1.1-2.5-2.5-2.5H6.5C5.1 17 4 18.1 4 19.5z" stroke="currentColor" stroke-width="1.4" fill="currentColor" fill-opacity="0.2"/><path d="M19 4c1-2 3-2 3-2s-.5 2.5-1.5 4.5l-2.5-1z" stroke="currentColor" stroke-width="1.2" fill="currentColor" fill-opacity="0.3"/><path d="M8 8h6M8 11.5h7M8 15h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/></svg>`
  };
  window.GhibliIcons = GhibliIcons;

  function replaceEmojisWithGhibliIcons(text) {
    if (!text || typeof text !== 'string') return text;
    return escapeHtml(text)
      .replace(/🔋/g, GhibliIcons.leafBattery)
      .replace(/🎤/g, GhibliIcons.vintageMic)
      .replace(/🌰/g, GhibliIcons.totoroAcorn)
      .replace(/🔍/g, GhibliIcons.brassLens)
      .replace(/⏱️/g, GhibliIcons.pocketWatch)
      .replace(/🎯/g, GhibliIcons.compassAnchor)
      .replace(/💡/g, GhibliIcons.fireflyLantern)
      .replace(/🎧/g, GhibliIcons.woodenHeadphone)
      .replace(/🔁/g, GhibliIcons.loopTwigs)
      .replace(/🔂/g, GhibliIcons.loopSingle)
      .replace(/🔀/g, GhibliIcons.shuffleWind)
      .replace(/☁️/g, GhibliIcons.skyCloud)
      .replace(/💾/g, GhibliIcons.treasureScroll)
      .replace(/📂/g, GhibliIcons.explorerFolder)
      .replace(/👤/g, GhibliIcons.kodamaUser)
      .replace(/🔒/g, GhibliIcons.brassPadlock)
      .replace(/👁️|👁/g, GhibliIcons.sketchedEye)
      .replace(/🙈/g, GhibliIcons.eyeClosed)
      .replace(/💚/g, GhibliIcons.leafHeartFilled)
      .replace(/🤍/g, GhibliIcons.leafHeartOutline)
      .replace(/🌿|🌱|🍃/g, GhibliIcons.leafSprout)
      .replace(/🍂/g, GhibliIcons.autumnLeaf)
      .replace(/💿/g, GhibliIcons.vinylGroove)
      .replace(/🔥/g, GhibliIcons.calciferFlame)
      .replace(/📈/g, GhibliIcons.bambooChart)
      .replace(/📜|📄/g, GhibliIcons.quillScroll)
      .replace(/🌐/g, GhibliIcons.globeVintage)
      .replace(/🕊️|🕊/g, GhibliIcons.whiteDove)
      .replace(/🔄/g, GhibliIcons.refreshWater)
      .replace(/🎨/g, GhibliIcons.paintPalette)
      .replace(/🎹/g, GhibliIcons.vintagePiano)
      .replace(/🎵/g, GhibliIcons.musicSprout)
      .replace(/📷|📸/g, GhibliIcons.vintageCamera)
      .replace(/🚪/g, GhibliIcons.cottageDoor)
      .replace(/🎉/g, GhibliIcons.sparkleStar)
      .replace(/🚀/g, GhibliIcons.sproutSoar)
      .replace(/➡/g, GhibliIcons.arrowRight)
      .replace(/⚡/g, GhibliIcons.leafBattery)
      .replace(/✅/g, GhibliIcons.checkDone)
      .replace(/✨/g, GhibliIcons.sparkleStar)
      .replace(/☀️|☀/g, GhibliIcons.sunWarm)
      .replace(/🌙/g, GhibliIcons.moonCrescent)
      .replace(/⚠️|⚠/g, GhibliIcons.fireflyLantern)
      .replace(/✂️|✂/g, GhibliIcons.trimScissors)
      .replace(/❌/g, GhibliIcons.errorMark)
      .replace(/♪/g, GhibliIcons.musicSprout);
  }


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
    selectedCountryName: 'Vietnam',
    recentTracks: (() => {
      try {
        const saved = JSON.parse(localStorage.getItem('ghibli_recent_tracks') || '[]');
        return Array.isArray(saved) ? saved.filter(track => track && track.id && track.title).slice(0, 12) : [];
      } catch (_) {
        return [];
      }
    })(),
    recommendationHistory: (() => {
      try {
        const saved = JSON.parse(localStorage.getItem('ghibli_recommendation_history') || '{}');
        return {
          listens: Array.isArray(saved.listens) ? saved.listens.filter(event => event?.track?.id && Number(event.listenedSeconds) > 0).slice(-200) : [],
          skips: Array.isArray(saved.skips) ? saved.skips.filter(event => event?.track?.id).slice(-100) : [],
          discovery: Array.isArray(saved.discovery) ? saved.discovery.filter(event => event?.artist).slice(-80) : []
        };
      } catch (_) {
        return { listens: [], skips: [], discovery: [] };
      }
    })(),
    recentListeningRelatedTracks: [],
    searchResults: [],
    favorites: [],
    regionalAlbums: [],
    homeAlbums: [],
    albumsLoadedCountry: null,
    communityTracks: [],
    communityLoaded: false,
    currentTimeframe: 'daily',
    lyrics: [],
    lyricsSource: null,
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
    isIOS: (() => {
      try {
        const ua = navigator.userAgent || '';
        const isTouch = typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1;
        return /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && isTouch);
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
    trendingTracksDetails: document.getElementById('trendingTracksDetails'),
    trendingTracksGrid: document.getElementById('trendingTracksGrid'),
    discoverRadioRow: document.getElementById('discoverRadioRow'),
    discoverRadioCaption: document.getElementById('discoverRadioCaption'),
    discoverRecentCaption: document.getElementById('discoverRecentCaption'),
    discoverRecentList: document.getElementById('discoverRecentList'),
    discoverChartRow: document.getElementById('discoverChartRow'),
    discoverAlbumRow: document.getElementById('discoverAlbumRow'),
    discoverArtistsTitle: document.getElementById('discoverArtistsTitle'),
    discoverArtistsCaption: document.getElementById('discoverArtistsCaption'),
    discoverArtistRow: document.getElementById('discoverArtistRow'),
    discoverForYouCaption: document.getElementById('discoverForYouCaption'),
    discoverForYouRow: document.getElementById('discoverForYouRow'),
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
    lyricsContributeBtn: document.getElementById('lyricsContributeBtn'),
    sheetLyricsContributeBtn: document.getElementById('sheetLyricsContributeBtn'),
    audioTrimBtn: document.getElementById('audioTrimBtn'),
    sheetAudioTrimBtn: document.getElementById('sheetAudioTrimBtn'),
    audioTrimModal: document.getElementById('audioTrimModal'),
    audioTrimBackdrop: document.getElementById('audioTrimBackdrop'),
    audioTrimTrackLabel: document.getElementById('audioTrimTrackLabel'),
    audioTrimStartRange: document.getElementById('audioTrimStartRange'),
    audioTrimStartSeconds: document.getElementById('audioTrimStartSeconds'),
    audioTrimStartMarkBtn: document.getElementById('audioTrimStartMarkBtn'),
    audioTrimEndRange: document.getElementById('audioTrimEndRange'),
    audioTrimEndSeconds: document.getElementById('audioTrimEndSeconds'),
    audioTrimEndMarkBtn: document.getElementById('audioTrimEndMarkBtn'),
    audioTrimPreviewTimeline: document.getElementById('audioTrimPreviewTimeline'),
    audioTrimCurrentTime: document.getElementById('audioTrimCurrentTime'),
    audioTrimDuration: document.getElementById('audioTrimDuration'),
    audioTrimPlayPauseBtn: document.getElementById('audioTrimPlayPauseBtn'),
    audioTrimSeekBackBtn: document.getElementById('audioTrimSeekBackBtn'),
    audioTrimSeekForwardBtn: document.getElementById('audioTrimSeekForwardBtn'),
    audioTrimSummary: document.getElementById('audioTrimSummary'),
    audioTrimStatus: document.getElementById('audioTrimStatus'),
    audioTrimSaveBtn: document.getElementById('audioTrimSaveBtn'),
    audioTrimResetBtn: document.getElementById('audioTrimResetBtn'),
    audioTrimCloseBtn: document.getElementById('audioTrimCloseBtn'),
    audioTrimCancelBtn: document.getElementById('audioTrimCancelBtn'),
    lyricsContributionModal: document.getElementById('lyricsContributionModal'),
    lyricsContributionBackdrop: document.getElementById('lyricsContributionBackdrop'),
    lyricsContributionTrackLabel: document.getElementById('lyricsContributionTrackLabel'),
    lyricsContributionPlain: document.getElementById('lyricsContributionPlain'),
    lyricsContributionBuildBtn: document.getElementById('lyricsContributionBuildBtn'),
    lyricsContributionWordModeBtn: document.getElementById('lyricsContributionWordModeBtn'),
    lyricsContributionPlayPauseBtn: document.getElementById('lyricsContributionPlayPauseBtn'),
    lyricsContributionSeekBackBtn: document.getElementById('lyricsContributionSeekBackBtn'),
    lyricsContributionSeekForwardBtn: document.getElementById('lyricsContributionSeekForwardBtn'),
    lyricsContributionTimeline: document.getElementById('lyricsContributionTimeline'),
    lyricsContributionCurrentTime: document.getElementById('lyricsContributionCurrentTime'),
    lyricsContributionDuration: document.getElementById('lyricsContributionDuration'),
    lyricsContributionPlaybackRate: document.getElementById('lyricsContributionPlaybackRate'),
    lyricsContributionPlaybackRateHint: document.getElementById('lyricsContributionPlaybackRateHint'),
    lyricsContributionLineCount: document.getElementById('lyricsContributionLineCount'),
    lyricsContributionList: document.getElementById('lyricsContributionList'),
    lyricsContributionPlayhead: document.getElementById('lyricsContributionPlayhead'),
    lyricsContributionAddLineBtn: document.getElementById('lyricsContributionAddLineBtn'),
    lyricsContributionSaveBtn: document.getElementById('lyricsContributionSaveBtn'),
    lyricsContributionCloseBtn: document.getElementById('lyricsContributionCloseBtn'),
    lyricsContributionCancelBtn: document.getElementById('lyricsContributionCancelBtn'),

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
    dom.toast.innerHTML = replaceEmojisWithGhibliIcons(msg);
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

  // Chuyển đổi duration chuỗi/số sang số nguyên giây (hỗ trợ "mm:ss", "hh:mm:ss", { text, seconds })
  function parseDurationToSec(val) {
    if (!val) return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : Math.round(val);
    if (typeof val === 'object') {
      if (val.seconds && !isNaN(val.seconds)) return Number(val.seconds);
      if (val.text) return parseDurationToSec(val.text);
    }
    const str = String(val).trim();
    const parts = str.split(':').map(p => parseInt(p, 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] * 60 + parts[1];
    }
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    const n = parseInt(str, 10);
    return isNaN(n) ? 0 : n;
  }

  // Lấy thời lượng âm thanh chuẩn xác, khắc phục triệt để lỗi Safari iOS CoreAudio nhân đôi (2x) thời lượng AAC/fMP4
  function getEffectiveAudioDuration() {
    // 1. Luôn ưu tiên parse trực tiếp từ chuỗi duration hiển thị trên thẻ card (VD: "4:50" -> 290s)
    const cardTextSec = parseDurationToSec(state.currentTrack?.duration);
    const metaNumSec = Number(state.currentTrack?.durationSec) || 0;

    // expectedSec: chuỗi thời lượng người dùng thấy bên ngoài thẻ là chân lý cao nhất
    const expectedSec = cardTextSec > 0 ? cardTextSec : (metaNumSec > 0 ? metaNumSec : 0);
    const audioDur = dom.audio?.duration;

    // Nếu không có audio duration hoặc audio duration không hợp lệ
    if (!audioDur || isNaN(audioDur) || !isFinite(audioDur)) {
      return expectedSec || 210;
    }

    // Nếu có expectedSec từ thông tin bài hát (ví dụ bài "4:50" -> expectedSec = 290s):
    if (expectedSec > 0) {
      // 1. Bug Safari iOS WebKit CoreAudio: Khi phát AAC-LC itag 140 trong fMP4,
      // Safari ngộ nhận sample rate 44.1kHz thành 22.05kHz, sinh ra duration >= 1.35x expectedSec.
      // Bất kỳ khi nào audioDur lớn hơn 1.35x expectedSec -> LẬP TỨC TRẢ VỀ expectedSec!
      if (audioDur >= expectedSec * 1.35) {
        return expectedSec;
      }

      // 2. Nếu audioDur chênh lệch quá 8 giây so với expectedSec (đối với bài > 30s)
      if (Math.abs(audioDur - expectedSec) > 8 && expectedSec > 30) {
        return expectedSec;
      }
    }

    return audioDur;
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
      dom.sheetBgPlaybackText.innerHTML = `${GhibliIcons.woodenHeadphone} Phát nền (Tắt màn hình): <strong>${isEnabled ? 'BẬT' : 'TẮT'}</strong>`;
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
      dom.sheetBatterySaverText.innerHTML = `${GhibliIcons.leafBattery} Tiết kiệm pin: <strong>${isActive ? 'BẬT' : 'TẮT'}</strong>`;
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
          dom.batterySaverTotoro.innerHTML = `<img src="${escapeHtml(state.currentUser.avatar)}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; opacity: 0.6;" alt="avatar">`;
        } else {
          dom.batterySaverTotoro.textContent = state.currentUser.avatar;
        }
      } else {
        dom.batterySaverTotoro.innerHTML = GhibliIcons.totoroAcorn;
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
          dom.batterySaverLevel.textContent = `OLED Eco • ${level}%${isCharging ? ' • Đang sạc' : ''}`;
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
    // Reopen the same lyrics stage shown after selecting a track, rather than a second player UI.
    if (dom.bottomPlayer) {
      dom.bottomPlayer.addEventListener('click', (e) => {
        if (window.innerWidth > 768) return;
        if (e.target.closest('button, input, a, .leaf-heart-btn, .wood-disc-play-btn, .nature-ctrl-btn')) return;
        if (!state.currentTrack) return;
        openLyricsStage();
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
          if (state.isPlaying && state.activeEngine === 'youtube' && state.currentTrack) {
            const curTime = (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') ? ytPlayer.getCurrentTime() : 0;
            try { ytPlayer.pauseVideo(); } catch (_) {}
            state.activeEngine = 'audio';
            dom.audio.src = `/api/stream/${state.currentTrack.id}`;
            dom.audio.currentTime = curTime;
            dom.audio.play().catch(() => {});
          }
          showToast('🎧 Đã BẬT Phát Nền! Giờ đây bạn có thể thoải mái tắt màn hình mà nhạc vẫn phát liên tục.');
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
        let sourceDuration = 0;
        if ((state.activeEngine === 'audio' || state.currentTrack?.previewUrl) && dom.audio) {
          sourceDuration = getEffectiveAudioDuration();
        } else if (state.activeEngine === 'youtube' && ytPlayer && isYtReady && typeof ytPlayer.getDuration === 'function') {
          sourceDuration = Number(ytPlayer.getDuration()) || 0;
        }
        if (sourceDuration <= 0) return;
        const window = getTrackAudioTrimWindow(state.currentTrack, sourceDuration);
        const targetTime = window.start + percent * window.duration;
        seekToSeconds(targetTime);
        updatePlaybackTimeline(targetTime, sourceDuration);
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
    refreshAudioTrimTriggerButtons(track);
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
              if (dur) updatePlaybackTimeline(ytPlayer.getCurrentTime(), dur);
              enforceCurrentTrackAudioTrim();
              if (isLyricsContributionEditorOpen()) {
                applyLyricsContributionPlaybackRate(lyricsContributionPlaybackRate, { silent: true });
              }
            } else if (event.data === 2) {
              if (state.activeEngine === 'youtube') {
                setPlaybackVisualState(false);
              }
            } else if (event.data === 0) {
              if (state.activeEngine === 'youtube') {
                finishRecommendationPlayback(true);
                if (state.loopMode === 'one') {
                  const window = getTrackAudioTrimWindow(state.currentTrack, ytPlayer.getDuration());
                  ytPlayer.seekTo(window.isTrimmed ? window.start : 0, true);
                  beginRecommendationPlaybackSession(state.currentTrack);
                  ytPlayer.playVideo();
                } else {
                  playNextTrack();
                }
              }
            }
          },
          onPlaybackRateChange: (event) => {
            const actualRate = Number(event.data);
            if (isLyricsContributionEditorOpen() && Number.isFinite(actualRate) && actualRate > 0) {
              renderLyricsContributionPlaybackRate(actualRate, { remember: false });
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
  let lyricsContributionTrackId = null;
  let lyricsContributionWordMode = false;
  let lyricsContributionIsScrubbing = false;
  let lyricsContributionPlaybackRate = 1;
  const lyricsContributionPlaybackRates = [0.5, 0.75, 1, 1.25, 1.5];
  let audioTrimStore = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ghibli_shared_audio_trims') || '{}');
      return saved && saved.version === 1 && saved.trims && typeof saved.trims === 'object' ? saved.trims : {};
    } catch (_) {
      return {};
    }
  })();
  let audioTrimStoreLoaded = false;
  const audioTrimLoadedTrackIds = new Set(Object.keys(audioTrimStore));
  const audioTrimLoadRequests = new Map();
  let audioTrimEditorTrackId = null;
  let audioTrimEditorDurationSec = 0;
  let audioTrimPreviewIsScrubbing = false;
  let audioTrimLastSeekAt = 0;
  let audioTrimLastSeekTrackId = null;
  let audioTrimHandledEndTrackId = null;

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
    if (dom.mobileFullscreenSheet && !dom.mobileFullscreenSheet.classList.contains('hidden')) {
      closeMobileFullscreenSheet();
    }
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
    let boundedTarget = Math.max(0, Number(targetSeconds) || 0);
    if (!dom.audioTrimModal || dom.audioTrimModal.classList.contains('hidden')) {
      boundedTarget = clampPlaybackSeekTime(boundedTarget);
    }
    if (state.activeEngine === 'audio') {
      if (dom.audio) {
        dom.audio.currentTime = boundedTarget;
        syncLyricsWithTime(boundedTarget);
      }
    } else if (state.activeEngine === 'youtube' && ytPlayer && typeof ytPlayer.seekTo === 'function') {
      ytPlayer.seekTo(boundedTarget, true);
      syncLyricsWithTime(boundedTarget);
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

  function getLyricDurationSeconds() {
    if (state.activeEngine === 'youtube' && ytPlayer && isYtReady && typeof ytPlayer.getDuration === 'function') {
      const youtubeDuration = Number(ytPlayer.getDuration());
      if (Number.isFinite(youtubeDuration) && youtubeDuration > 0) return youtubeDuration;
    }

    if (state.activeEngine === 'audio' && dom.audio) {
      const audioDuration = Number(dom.audio.duration);
      if (Number.isFinite(audioDuration) && audioDuration > 0) {
        return getEffectiveAudioDuration() || audioDuration;
      }
    }

    return Number(state.currentTrack?.durationSec) || parseDurationToSec(state.currentTrack?.duration) || 210;
  }

  function updateLyricsContributionTimeline() {
    if (!dom.lyricsContributionModal || dom.lyricsContributionModal.classList.contains('hidden')) return;

    const duration = Math.max(0, Number(getLyricDurationSeconds()) || 0);
    const currentTime = Math.max(0, Math.min(getCurrentAudioTime(), duration || Infinity));
    const shownTime = lyricsContributionIsScrubbing
      ? Number(dom.lyricsContributionTimeline?.value) || 0
      : currentTime;
    const isPlaying = Boolean(state.isPlaying);

    if (dom.lyricsContributionTimeline) {
      dom.lyricsContributionTimeline.max = String(duration);
      if (!lyricsContributionIsScrubbing) {
        dom.lyricsContributionTimeline.value = String(currentTime);
      }
      dom.lyricsContributionTimeline.setAttribute(
        'aria-valuetext',
        `${formatLyricsContributionTime(shownTime)} / ${formatLyricsContributionTime(duration)}`
      );
    }
    if (dom.lyricsContributionCurrentTime) {
      dom.lyricsContributionCurrentTime.textContent = formatLyricsContributionTime(shownTime);
    }
    if (dom.lyricsContributionDuration) {
      dom.lyricsContributionDuration.textContent = formatLyricsContributionTime(duration);
    }
    if (dom.lyricsContributionPlayPauseBtn) {
      dom.lyricsContributionPlayPauseBtn.textContent = isPlaying ? 'Ⅱ Tạm dừng' : '▶ Phát';
      dom.lyricsContributionPlayPauseBtn.setAttribute('aria-label', isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc');
      dom.lyricsContributionPlayPauseBtn.setAttribute('aria-pressed', String(isPlaying));
      dom.lyricsContributionPlayPauseBtn.classList.toggle('is-playing', isPlaying);
    }
  }

  function isLyricsContributionEditorOpen() {
    return Boolean(dom.lyricsContributionModal && !dom.lyricsContributionModal.classList.contains('hidden'));
  }

  function getLyricsContributionAvailablePlaybackRates() {
    if (state.activeEngine === 'youtube' && ytPlayer && isYtReady && typeof ytPlayer.getAvailablePlaybackRates === 'function') {
      try {
        const availableRates = ytPlayer.getAvailablePlaybackRates()
        if (!Array.isArray(availableRates)) return lyricsContributionPlaybackRates;
        const normalizedRates = availableRates
          .map(Number)
          .filter(rate => Number.isFinite(rate) && rate > 0);
        if (normalizedRates.length) return normalizedRates;
      } catch (_) {}
    }
    return lyricsContributionPlaybackRates;
  }

  function renderLyricsContributionPlaybackRate(rate = lyricsContributionPlaybackRate, { remember = true } = {}) {
    const select = dom.lyricsContributionPlaybackRate;
    if (!select) return;

    const availableRates = getLyricsContributionAvailablePlaybackRates();
    const normalizedRate = availableRates.includes(rate)
      ? rate
      : (availableRates.includes(1) ? 1 : (availableRates[0] || 1));
    if (remember) lyricsContributionPlaybackRate = normalizedRate;
    Array.from(select.options).forEach(option => {
      option.disabled = !availableRates.includes(Number(option.value));
    });
    select.value = String(normalizedRate);

    if (dom.lyricsContributionPlaybackRateHint) {
      const onlyNormalSpeed = state.activeEngine === 'youtube'
        && availableRates.filter(availableRate => lyricsContributionPlaybackRates.includes(availableRate)).length <= 1;
      dom.lyricsContributionPlaybackRateHint.textContent = onlyNormalSpeed
        ? 'Trong các mức chỉnh lời, video chỉ hỗ trợ 1×.'
        : '';
    }
  }

  function syncLyricsContributionPlaybackRateFromEngine() {
    let currentRate = lyricsContributionPlaybackRate;
    if (state.activeEngine === 'audio' && dom.audio) {
      currentRate = Number(dom.audio.playbackRate) || 1;
    } else if (state.activeEngine === 'youtube' && ytPlayer && isYtReady && typeof ytPlayer.getPlaybackRate === 'function') {
      try {
        currentRate = Number(ytPlayer.getPlaybackRate()) || 1;
      } catch (_) {}
    }
    renderLyricsContributionPlaybackRate(currentRate);
  }

  function applyLyricsContributionPlaybackRate(rate, { silent = false } = {}) {
    const requestedRate = Number(rate);
    if (!Number.isFinite(requestedRate) || requestedRate <= 0) return;

    if (state.activeEngine === 'audio' && dom.audio) {
      try {
        dom.audio.playbackRate = requestedRate;
        lyricsContributionPlaybackRate = Number(dom.audio.playbackRate) || 1;
        renderLyricsContributionPlaybackRate(lyricsContributionPlaybackRate);
      } catch (_) {
        renderLyricsContributionPlaybackRate(Number(dom.audio.playbackRate) || 1);
        if (!silent) showToast('Trình duyệt này không hỗ trợ tốc độ phát đã chọn.');
      }
      return;
    }

    if (state.activeEngine === 'youtube' && ytPlayer && isYtReady && typeof ytPlayer.setPlaybackRate === 'function') {
      const availableRates = getLyricsContributionAvailablePlaybackRates();
      if (!availableRates.includes(requestedRate)) {
        syncLyricsContributionPlaybackRateFromEngine();
        if (!silent) showToast('Video này không hỗ trợ tốc độ đã chọn.');
        return;
      }
      try {
        ytPlayer.setPlaybackRate(requestedRate);
        lyricsContributionPlaybackRate = requestedRate;
        renderLyricsContributionPlaybackRate(requestedRate);
      } catch (_) {
        syncLyricsContributionPlaybackRateFromEngine();
        if (!silent) showToast('Chưa thể thay đổi tốc độ phát của video này.');
      }
      return;
    }

    lyricsContributionPlaybackRate = requestedRate;
    renderLyricsContributionPlaybackRate(requestedRate);
  }

  function resetLyricsContributionPlaybackRate() {
    lyricsContributionPlaybackRate = 1;
    if (state.activeEngine === 'audio' && dom.audio) {
      try { dom.audio.playbackRate = 1; } catch (_) {}
    } else if (state.activeEngine === 'youtube' && ytPlayer && isYtReady && typeof ytPlayer.setPlaybackRate === 'function') {
      try { ytPlayer.setPlaybackRate(1); } catch (_) {}
    }
    renderLyricsContributionPlaybackRate(1);
  }

  function seekLyricsContributionBy(deltaSeconds) {
    const duration = Math.max(0, Number(getLyricDurationSeconds()) || 0);
    const target = Math.max(0, Math.min(getCurrentAudioTime() + deltaSeconds, duration || Infinity));
    seekToSeconds(target);
    updateLyricsContributionTimeline();
  }

  function persistAudioTrimCache() {
    try {
      const recent = Object.values(audioTrimStore)
        .filter(trim => trim && typeof trim.trackId === 'string')
        .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
        .slice(0, 300);
      const trims = Object.fromEntries(recent.map(trim => [trim.trackId, trim]));
      localStorage.setItem('ghibli_shared_audio_trims', JSON.stringify({ version: 1, trims }));
    } catch (_) {}
  }

  function getTrackAudioTrimWindow(track, sourceDuration = getLyricDurationSeconds()) {
    const duration = Math.max(0, Number(sourceDuration) || 0);
    const modalIsOpen = dom.audioTrimModal && !dom.audioTrimModal.classList.contains('hidden');
    const trim = track?.id ? audioTrimStore[String(track.id)] : null;
    if (modalIsOpen || !trim || !duration) {
      return { start: 0, end: duration, duration, isTrimmed: false };
    }

    const start = Math.max(0, Math.min(Number(trim.startSec) || 0, duration));
    const end = Math.max(0, Math.min(Number(trim.endSec) || duration, duration));
    if (end - start < 1) return { start: 0, end: duration, duration, isTrimmed: false };
    return { start, end, duration: end - start, isTrimmed: true };
  }

  function updatePlaybackTimeline(currentTime, sourceDuration) {
    const window = getTrackAudioTrimWindow(state.currentTrack, sourceDuration);
    const absoluteTime = Math.max(0, Math.min(Number(currentTime) || 0, window.end || window.duration));
    const elapsed = Math.max(0, Math.min(absoluteTime - window.start, window.duration));
    const percent = window.duration > 0 ? (elapsed / window.duration) * 100 : 0;
    updateProgressUI(percent);
    if (dom.currentTime) dom.currentTime.textContent = formatTime(elapsed);
    if (dom.totalDuration) dom.totalDuration.textContent = formatTime(window.duration);
    if (dom.sheetCurrentTime) dom.sheetCurrentTime.textContent = formatTime(elapsed);
    if (dom.sheetTotalTime) dom.sheetTotalTime.textContent = formatTime(window.duration);
    return window;
  }

  function clampPlaybackSeekTime(targetTime, sourceDuration = getLyricDurationSeconds()) {
    const window = getTrackAudioTrimWindow(state.currentTrack, sourceDuration);
    return Math.max(window.start, Math.min(Number(targetTime) || 0, window.end));
  }

  function setSharedAudioTrimStore(trims) {
    audioTrimStore = trims && typeof trims === 'object' && !Array.isArray(trims) ? trims : {};
    for (const trackId of Object.keys(audioTrimStore)) audioTrimLoadedTrackIds.add(trackId);
    persistAudioTrimCache();
  }

  async function loadSharedAudioTrims() {
    try {
      const response = await fetch('/api/audio-trims', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Không nạp được điểm chỉnh audio.');
      setSharedAudioTrimStore(data.trims);
      audioTrimStoreLoaded = true;
      refreshAudioTrimTriggerButtons(state.currentTrack);
      if (state.currentTrack) enforceCurrentTrackAudioTrim(true);
      return true;
    } catch (error) {
      console.warn('[Shared Audio Trim Load Warning]:', error.message);
      return false;
    }
  }

  function ensureSharedAudioTrimLoaded(track) {
    const trackId = String(track?.id || '');
    if (!trackId || audioTrimStoreLoaded || audioTrimLoadedTrackIds.has(trackId)) return Promise.resolve();
    if (audioTrimLoadRequests.has(trackId)) return audioTrimLoadRequests.get(trackId);

    const request = fetch(`/api/audio-trims/${encodeURIComponent(trackId)}`, { cache: 'no-store' })
      .then(response => response.json().then(data => ({ response, data })))
      .then(({ response, data }) => {
        if (!response.ok || !data.success) throw new Error(data.error || 'Không nạp được điểm chỉnh audio.');
        if (data.trim) audioTrimStore[trackId] = data.trim;
        else delete audioTrimStore[trackId];
        audioTrimLoadedTrackIds.add(trackId);
        persistAudioTrimCache();
        if (state.currentTrack?.id === trackId) {
          refreshAudioTrimTriggerButtons(state.currentTrack);
          enforceCurrentTrackAudioTrim(true);
        }
      })
      .catch(error => console.warn('[Shared Audio Trim Load Warning]:', error.message))
      .finally(() => audioTrimLoadRequests.delete(trackId));
    audioTrimLoadRequests.set(trackId, request);
    return request;
  }

  function enforceCurrentTrackAudioTrim(forceStartSeek = false) {
    if (!state.currentTrack || (!state.isPlaying && !forceStartSeek) || !audioTrimStore[state.currentTrack.id] ||
        (dom.audioTrimModal && !dom.audioTrimModal.classList.contains('hidden'))) return;

    const trackId = String(state.currentTrack.id);
    const sourceDuration = getLyricDurationSeconds();
    const window = getTrackAudioTrimWindow(state.currentTrack, sourceDuration);
    if (!window.isTrimmed) return;

    const currentTime = getCurrentAudioTime();
    const now = Date.now();
    if (audioTrimHandledEndTrackId === trackId && currentTime < window.end - 0.5) {
      audioTrimHandledEndTrackId = null;
    }
    if (currentTime < window.start - 0.35) {
      if (audioTrimLastSeekTrackId !== trackId || now - audioTrimLastSeekAt > 1200) {
        audioTrimLastSeekTrackId = trackId;
        audioTrimLastSeekAt = now;
        seekToSeconds(window.start);
      }
      return;
    }

    if (state.isPlaying && currentTime >= window.end - 0.08 && audioTrimHandledEndTrackId !== trackId) {
      audioTrimHandledEndTrackId = trackId;
      if (state.loopMode === 'one') {
        audioTrimLastSeekTrackId = trackId;
        audioTrimLastSeekAt = now;
        seekToSeconds(window.start);
        if (state.activeEngine === 'audio' && dom.audio) dom.audio.play().catch(() => {});
        else if (state.activeEngine === 'youtube' && ytPlayer && typeof ytPlayer.playVideo === 'function') ytPlayer.playVideo();
      } else {
        playNextTrack();
        // Nếu hàng đợi đã hết, playNextTrack không đổi bài; dừng tại điểm cắt
        // để phần outro của nguồn không tiếp tục phát.
        if (state.currentTrack?.id === trackId && audioTrimHandledEndTrackId === trackId) {
          if (state.activeEngine === 'audio' && dom.audio) dom.audio.pause();
          else if (state.activeEngine === 'youtube' && ytPlayer && typeof ytPlayer.pauseVideo === 'function') ytPlayer.pauseVideo();
          setPlaybackVisualState(false);
        }
      }
    }
  }

  // Lời tiếng Việt thường được ghi theo âm tiết cách nhau bởi dấu cách. Mỗi âm tiết
  // là một nhịp highlight karaoke nhỏ. Ngôn ngữ không tách từ bằng dấu cách dùng Segmenter.
  function splitLyricIntoWords(text) {
    const trimmed = String(text || '').trim();
    if (!trimmed) return [];

    const spaceDelimitedWords = trimmed.match(/\S+\s*/gu) || [];
    const needsLanguageSegmentation = !/\s/u.test(trimmed) &&
      /[\u0E00-\u0E7F\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/u.test(trimmed);
    if (!needsLanguageSegmentation) return spaceDelimitedWords;

    if (typeof Intl.Segmenter === 'function') {
      const wordSegments = [...new Intl.Segmenter(undefined, { granularity: 'word' }).segment(trimmed)]
        .map(segment => segment.segment)
        .filter(segment => /\S/u.test(segment));
      if (wordSegments.length > 1) return wordSegments;

      const graphemes = [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(trimmed)]
        .map(segment => segment.segment);
      if (graphemes.length > 1) return graphemes;
    }

    return Array.from(trimmed);
  }

  function getLyricWordWeight(word) {
    return Math.max(1, Math.sqrt(Array.from(String(word || '').trim()).length));
  }

  function createEstimatedWordTimings(text, startTime, duration) {
    const words = splitLyricIntoWords(text);
    if (!words.length) return [];

    const totalWeight = words.reduce((sum, word) => sum + getLyricWordWeight(word), 0);
    let elapsedWeight = 0;
    return words.map(word => {
      const time = startTime + (Math.max(0, duration) * elapsedWeight / totalWeight);
      elapsedWeight += getLyricWordWeight(word);
      return { time: parseFloat(time.toFixed(3)), text: word };
    });
  }

  function estimateTimedLyricsWords(lines) {
    if (!Array.isArray(lines)) return [];
    return lines.map((line, index) => {
      const text = String(line?.text || '').trim();
      const existingWords = Array.isArray(line?.words)
        ? line.words.filter(word => word && typeof word.text === 'string' && word.text.length > 0)
        : [];
      if (existingWords.length || /^\[.*\]$/u.test(text)) return line;

      const startTime = Number.isFinite(Number(line?.time)) ? Number(line.time) : 0;
      const nextLine = lines.slice(index + 1).find(next => Number(next?.time) > startTime + 0.05);
      const nextTime = Number(nextLine?.time);
      const words = splitLyricIntoWords(text);
      if (!words.length) return { ...line, words: [], wordsEstimated: true };

      const wordWeight = words.reduce((sum, word) => sum + getLyricWordWeight(word), 0);
      const nominalDuration = Math.min(5, Math.max(0.7, wordWeight * 0.36));
      const gap = nextTime - startTime;
      const estimatedDuration = gap > 0.05 ? Math.min(gap, nominalDuration) : nominalDuration;
      return {
        ...line,
        words: createEstimatedWordTimings(text, startTime, estimatedDuration),
        wordsEstimated: true
      };
    });
  }

  function estimatePlainLyricsTimings(plainText) {
    const sourceLines = String(plainText || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (!sourceLines.length) return [];

    const entries = sourceLines.map(text => ({
      text,
      isSectionHeader: /^\[.*\]$/u.test(text)
    }));
    const lyricEntries = entries.filter(entry => !entry.isSectionHeader);
    const entryWeights = new Map(lyricEntries.map(entry => {
      const words = splitLyricIntoWords(entry.text);
      return [entry, words.reduce((sum, word) => sum + getLyricWordWeight(word), 0) || 1];
    }));
    const totalWeight = [...entryWeights.values()].reduce((sum, weight) => sum + weight, 0) || 1;
    const duration = getLyricDurationSeconds();
    const introTime = Math.min(5, duration * 0.035);
    const lyricsDuration = Math.max(1, duration * 0.88);
    let elapsedWeight = 0;

    for (const entry of entries) {
      if (entry.isSectionHeader) continue;
      const weight = entryWeights.get(entry) || 1;
      const lineDuration = lyricsDuration * weight / totalWeight;
      entry.time = introTime + (lyricsDuration * elapsedWeight / totalWeight);
      entry.words = createEstimatedWordTimings(entry.text, entry.time, lineDuration);
      entry.wordsEstimated = true;
      elapsedWeight += weight;
    }

    // Giữ tiêu đề đoạn [Verse]/[Chorus] trong lời hiển thị nhưng không highlight như ca từ.
    for (let index = 0; index < entries.length; index++) {
      const entry = entries[index];
      if (!entry.isSectionHeader) continue;
      const nextLyric = entries.slice(index + 1).find(item => !item.isSectionHeader);
      const previousLyric = entries.slice(0, index).reverse().find(item => !item.isSectionHeader);
      entry.time = nextLyric?.time ?? previousLyric?.time ?? introTime;
      entry.words = [];
    }

    return entries;
  }

  async function autoAlignLyricsWithVideoCaptions(track) {
    const videoId = String(track?.id || '');
    if (!/^[\w-]{11}$/.test(videoId) || !Array.isArray(state.lyrics) || !state.lyrics.length) return;

    const requestedTrackId = track.id;
    const controller = lyricsAbortController;
    try {
      const response = await fetch('/api/lyrics/align', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          lines: state.lyrics.map(line => ({ text: line.text, time: line.time }))
        }),
        signal: controller?.signal
      });
      if (!response.ok) return;

      const result = await response.json();
      if (!result.aligned || !Array.isArray(result.lines) ||
          state.currentTrack?.id !== requestedTrackId || state.lyricsTrackId !== requestedTrackId) return;

      state.lyrics = result.lines;
      state.activeLyricIndex = -1;
      const confidence = Math.round((Number(result.confidence) || 0) * 100);
      if (dom.lyricsSyncBadge) {
        dom.lyricsSyncBadge.innerHTML = `${GhibliIcons.sparkleStar} Tự căn theo phụ đề video${confidence ? ` • Khớp ${confidence}%` : ''}`;
      }
      renderLyricsLines(state.lyrics);
      syncLyricsWithTime(getCurrentAudioTime());
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.debug('[Lyrics Caption Alignment]:', err.message);
      }
    }
  }

  function renderLyricsLines(lines) {
    if (!dom.lyricsLinesContainer) return;
    dom.lyricsLinesContainer.innerHTML = lines.map((item, idx) => {
      const time = Number.isFinite(Number(item.time)) ? Number(item.time) : 0;
      const words = Array.isArray(item.words)
        ? item.words.filter(word => word && typeof word.text === 'string' && word.text.length > 0)
        : [];
      const lyricText = words.length
        ? words.map((word, wordIdx) => {
          const wordTime = Number.isFinite(Number(word.time)) ? Number(word.time) : time;
          return `<span class="lyric-word" data-word-index="${wordIdx}" data-time="${wordTime}">${escapeHtml(word.text)}</span>`;
        }).join('')
        : (item.text ? escapeHtml(item.text) : GhibliIcons.musicSprout);
      return `
        <div class="lyric-line" data-index="${idx}" data-time="${time}">
          <span class="lyric-text">${lyricText}</span>
          <button type="button" class="line-sync-anchor-btn" data-time="${time}" title="Căn chuẩn bài hát theo câu này">${GhibliIcons.compassAnchor}</button>
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

  function formatLyricsContributionTime(seconds) {
    const safeSeconds = Math.max(0, Number(seconds) || 0);
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = (safeSeconds % 60).toFixed(2).padStart(5, '0');
    return `${String(minutes).padStart(2, '0')}:${remainingSeconds}`;
  }

  function readLyricsContributionTime(value) {
    if (value === null || value === undefined || String(value).trim() === '') return null;
    const time = Number(value);
    return Number.isFinite(time) ? time : null;
  }

  function getLyricsContributionDraft() {
    return [...(dom.lyricsContributionList?.querySelectorAll('.lyrics-contribution-row') || [])]
      .map(row => {
        const wordsChanged = row.dataset.wordsChanged === 'true';
        const wordCells = [...row.querySelectorAll('.lyrics-contribution-word-cell')];
        const storedWords = Array.isArray(row._storedWords) ? row._storedWords.filter(word => word && typeof word.text === 'string') : [];
        const words = wordsChanged && wordCells.length
          ? wordCells.map(cell => ({
            text: cell.dataset.wordText || '',
            time: readLyricsContributionTime(cell.querySelector('.lyrics-contribution-word-time')?.value)
          }))
          : storedWords.map(word => ({
            text: String(word.text || ''),
            time: readLyricsContributionTime(word.time)
          }));
        const hasInvalidWordTime = row.dataset.wordTimeInvalid === 'true' ||
          wordCells.some(cell => {
            const input = cell.querySelector('.lyrics-contribution-word-time');
            return input?.value.trim() !== '' && readLyricsContributionTime(input?.value) === null;
          });
        const wordStart = words.length && words.every(word => Number.isFinite(word.time))
          ? words[0].time
          : null;
        return {
          text: row.querySelector('.lyrics-contribution-line-text')?.value || '',
          time: wordStart ?? readLyricsContributionTime(row.querySelector('.lyrics-contribution-line-time')?.value),
          words,
          wordsChanged,
          hasInvalidWordTime
        };
      });
  }

  function renderLyricsContributionWordFields(row, lineIndex, words) {
    const wordEditor = row.querySelector('.lyrics-contribution-word-editor');
    if (!wordEditor) return;
    wordEditor.replaceChildren();

    const note = document.createElement('p');
    note.className = 'lyrics-contribution-word-note';
    note.textContent = 'Bấm ⏱ đúng lúc từng từ bắt đầu, hoặc nhập mốc giây bên dưới.';
    wordEditor.appendChild(note);

    const wordList = document.createElement('div');
    wordList.className = 'lyrics-contribution-word-list';
    if (!words.length) {
      const empty = document.createElement('span');
      empty.className = 'lyrics-contribution-word-empty';
      empty.textContent = 'Nhập lời câu này để tạo các từ cần căn.';
      wordList.appendChild(empty);
    }

    words.forEach((word, wordIndex) => {
      const cell = document.createElement('div');
      cell.className = 'lyrics-contribution-word-cell';
      cell.dataset.wordText = String(word.text || '');

      const label = document.createElement('span');
      label.className = 'lyrics-contribution-word-label';
      label.textContent = String(word.text || '').trim() || String(word.text || '');

      const controls = document.createElement('div');
      controls.className = 'lyrics-contribution-word-controls';

      const timeInput = document.createElement('input');
      timeInput.className = 'lyrics-contribution-word-time';
      timeInput.type = 'number';
      timeInput.min = '0';
      timeInput.step = '0.01';
      timeInput.inputMode = 'decimal';
      timeInput.placeholder = 'giây';
      timeInput.setAttribute('aria-label', `Câu ${lineIndex + 1}, từ ${wordIndex + 1}: thời điểm bắt đầu bằng giây`);
      const time = readLyricsContributionTime(word.time);
      if (time !== null) timeInput.value = time.toFixed(2);
      timeInput.addEventListener('input', () => {
        row.dataset.wordsChanged = 'true';
        row.dataset.wordTimeInvalid = [...wordEditor.querySelectorAll('.lyrics-contribution-word-time')]
          .some(input => input.value.trim() !== '' && readLyricsContributionTime(input.value) === null)
          ? 'true'
          : 'false';
        if (wordIndex === 0 && timeInput.value !== '') {
          const lineTimeInput = row.querySelector('.lyrics-contribution-line-time');
          if (lineTimeInput) lineTimeInput.value = Number(timeInput.value).toFixed(2);
        }
      });

      const markButton = document.createElement('button');
      markButton.type = 'button';
      markButton.className = 'lyrics-contribution-word-mark';
      markButton.textContent = '⏱';
      markButton.title = `Lấy mốc cho từ “${String(word.text || '').trim()}”`;
      markButton.setAttribute('aria-label', `Lấy mốc câu ${lineIndex + 1}, từ ${wordIndex + 1}`);
      markButton.addEventListener('click', () => {
        timeInput.value = getCurrentAudioTime().toFixed(2);
        timeInput.dispatchEvent(new Event('input', { bubbles: true }));
      });

      controls.append(timeInput, markButton);
      cell.append(label, controls);
      wordList.appendChild(cell);
    });
    wordEditor.appendChild(wordList);
  }

  function setLyricsContributionWordMode(enabled) {
    lyricsContributionWordMode = Boolean(enabled);
    const button = dom.lyricsContributionWordModeBtn;
    if (button) {
      button.setAttribute('aria-pressed', String(lyricsContributionWordMode));
      button.classList.toggle('is-active', lyricsContributionWordMode);
      button.innerHTML = lyricsContributionWordMode ? '✓ Đang chỉnh từng từ' : `${GhibliIcons.vintageMic} Chỉnh từng từ`;
    }
  }

  function renderLyricsContributionRows(lines = []) {
    if (!dom.lyricsContributionList) return;
    dom.lyricsContributionList.replaceChildren();
    const draft = Array.isArray(lines) ? lines : [];

    if (!draft.length) {
      const empty = document.createElement('div');
      empty.className = 'lyrics-contribution-empty';
      empty.textContent = 'Dán lời ở phía trên rồi chọn “Tách lời thành dòng”.';
      dom.lyricsContributionList.appendChild(empty);
    }

    const fragment = document.createDocumentFragment();
    draft.forEach((line, index) => {
      const row = document.createElement('div');
      row.className = 'lyrics-contribution-row';
      row.dataset.wordsChanged = line?.wordsChanged ? 'true' : 'false';
      row.dataset.wordTimeInvalid = line?.hasInvalidWordTime ? 'true' : 'false';
      row._storedWords = Array.isArray(line?.words)
        ? line.words.filter(word => word && typeof word.text === 'string').map(word => ({ ...word }))
        : [];

      const rowIndex = document.createElement('span');
      rowIndex.className = 'lyrics-contribution-row-index';
      rowIndex.textContent = String(index + 1);

      const textInput = document.createElement('textarea');
      textInput.className = 'lyrics-contribution-line-text';
      textInput.rows = 2;
      textInput.maxLength = 700;
      textInput.value = String(line?.text || '');
      textInput.setAttribute('aria-label', `Lời câu ${index + 1}`);
      textInput.placeholder = `Câu hát ${index + 1}`;

      const timeInput = document.createElement('input');
      timeInput.className = 'lyrics-contribution-line-time';
      timeInput.type = 'number';
      timeInput.min = '0';
      timeInput.step = '0.01';
      timeInput.placeholder = 'Giây';
      timeInput.setAttribute('aria-label', `Thời điểm câu ${index + 1} bắt đầu, tính bằng giây`);
      if (line?.time !== null && line?.time !== undefined && line?.time !== '' && Number.isFinite(Number(line.time))) {
        timeInput.value = Number(line.time).toFixed(2);
      }

      const markButton = document.createElement('button');
      markButton.type = 'button';
      markButton.className = 'lyrics-contribution-mark';
      markButton.textContent = '⏱ Lấy mốc';
      markButton.title = 'Lấy thời điểm hiện tại của bài hát';
      markButton.addEventListener('click', () => {
        timeInput.value = getCurrentAudioTime().toFixed(2);
        timeInput.dispatchEvent(new Event('input', { bubbles: true }));
      });

      const wordEditor = document.createElement('div');
      wordEditor.className = 'lyrics-contribution-word-editor';
      wordEditor.hidden = !lyricsContributionWordMode;
      row.appendChild(wordEditor);
      const lyricWords = splitLyricIntoWords(textInput.value);
      const storedWords = row._storedWords;
      const hasMatchingWordTimes = storedWords.length === lyricWords.length &&
        storedWords.every((word, wordIndex) => String(word.text || '') === lyricWords[wordIndex]);
      const wordDraft = lyricWords.map((word, wordIndex) => ({
        text: word,
        time: hasMatchingWordTimes ? readLyricsContributionTime(storedWords[wordIndex]?.time) : null
      }));
      if (lyricsContributionWordMode) renderLyricsContributionWordFields(row, index, wordDraft);

      textInput.addEventListener('input', () => {
        row._storedWords = splitLyricIntoWords(textInput.value).map(word => ({ text: word, time: null }));
        row.dataset.wordsChanged = 'true';
        row.dataset.wordTimeInvalid = 'false';
        if (lyricsContributionWordMode) renderLyricsContributionWordFields(row, index, row._storedWords);
      });

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'lyrics-contribution-remove';
      removeButton.textContent = '✕';
      removeButton.title = `Xóa câu ${index + 1}`;
      removeButton.setAttribute('aria-label', `Xóa câu ${index + 1}`);
      removeButton.addEventListener('click', () => {
        const nextDraft = getLyricsContributionDraft().filter((_, rowIndex) => rowIndex !== index);
        renderLyricsContributionRows(nextDraft);
      });

      row.append(rowIndex, textInput, timeInput, markButton, removeButton, wordEditor);
      fragment.appendChild(row);
    });
    dom.lyricsContributionList.appendChild(fragment);
    if (dom.lyricsContributionLineCount) {
      dom.lyricsContributionLineCount.textContent = `${draft.length} dòng`;
    }
  }

  function refreshAudioTrimTriggerButtons(track = state.currentTrack) {
    const isTrimmed = Boolean(track?.id && audioTrimStore[String(track.id)]);
    [dom.audioTrimBtn, dom.sheetAudioTrimBtn].forEach(button => {
      if (button) button.classList.toggle('has-audio-trim', isTrimmed);
    });
  }

  function syncAudioTrimEditorBounds(changedControl = '') {
    if (!dom.audioTrimStartSeconds || !dom.audioTrimEndSeconds) return;
    const duration = Math.max(1, Number(audioTrimEditorDurationSec) || 1);
    let start = Number(dom.audioTrimStartSeconds.value);
    let end = Number(dom.audioTrimEndSeconds.value);
    if (!Number.isFinite(start)) start = 0;
    if (!Number.isFinite(end)) end = duration;

    start = Math.max(0, Math.min(start, duration - 1));
    end = Math.max(1, Math.min(end, duration));
    if (end - start < 1) {
      if (changedControl === 'end') start = Math.max(0, end - 1);
      else end = Math.min(duration, start + 1);
    }

    dom.audioTrimStartSeconds.value = start.toFixed(1);
    dom.audioTrimEndSeconds.value = end.toFixed(1);
    dom.audioTrimStartSeconds.max = String(Math.max(0, duration - 1));
    dom.audioTrimEndSeconds.min = String(Math.min(duration, start + 1));
    dom.audioTrimEndSeconds.max = String(duration);
    if (dom.audioTrimStartRange) {
      dom.audioTrimStartRange.max = String(Math.max(0, duration - 1));
      dom.audioTrimStartRange.value = String(start);
    }
    if (dom.audioTrimEndRange) {
      dom.audioTrimEndRange.min = String(Math.min(duration, start + 1));
      dom.audioTrimEndRange.max = String(duration);
      dom.audioTrimEndRange.value = String(end);
    }
    if (dom.audioTrimSummary) {
      dom.audioTrimSummary.textContent = `Đoạn sẽ phát: ${formatLyricsContributionTime(start)} → ${formatLyricsContributionTime(end)} (${formatLyricsContributionTime(end - start)})`;
    }
  }

  function updateAudioTrimEditorPlayback() {
    if (!dom.audioTrimModal || dom.audioTrimModal.classList.contains('hidden')) return;
    const duration = Math.max(1, Number(audioTrimEditorDurationSec) || Number(getLyricDurationSeconds()) || 1);
    const currentTime = Math.max(0, Math.min(getCurrentAudioTime(), duration));
    if (dom.audioTrimPreviewTimeline) {
      dom.audioTrimPreviewTimeline.max = String(duration);
      if (!audioTrimPreviewIsScrubbing) dom.audioTrimPreviewTimeline.value = String(currentTime);
    }
    if (dom.audioTrimCurrentTime) {
      const shownTime = audioTrimPreviewIsScrubbing
        ? Number(dom.audioTrimPreviewTimeline?.value) || 0
        : currentTime;
      dom.audioTrimCurrentTime.textContent = formatLyricsContributionTime(shownTime);
    }
    if (dom.audioTrimDuration) dom.audioTrimDuration.textContent = formatLyricsContributionTime(duration);
    if (dom.audioTrimPlayPauseBtn) {
      dom.audioTrimPlayPauseBtn.textContent = state.isPlaying ? 'Ⅱ Tạm dừng' : '▶ Phát';
      dom.audioTrimPlayPauseBtn.setAttribute('aria-label', state.isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc');
      dom.audioTrimPlayPauseBtn.setAttribute('aria-pressed', String(Boolean(state.isPlaying)));
    }
  }

  async function openAudioTrimEditor() {
    const track = state.currentTrack;
    if (!track?.id) {
      showToast('Hãy phát một bài hát trước khi tinh chỉnh audio.');
      return;
    }

    const trackId = String(track.id);
    await ensureSharedAudioTrimLoaded(track);
    if (state.currentTrack?.id !== trackId) return;
    audioTrimEditorTrackId = trackId;
    audioTrimEditorDurationSec = Math.max(1, Number(getLyricDurationSeconds()) || Number(track.durationSec) || parseDurationToSec(track.duration) || 210);
    const savedTrim = audioTrimStore[trackId];
    const start = savedTrim ? Number(savedTrim.startSec) || 0 : 0;
    const end = savedTrim ? Number(savedTrim.endSec) || audioTrimEditorDurationSec : audioTrimEditorDurationSec;

    if (dom.audioTrimTrackLabel) {
      dom.audioTrimTrackLabel.textContent = `${track.title || 'Bài hát'}${track.artist ? ` • ${track.artist}` : ''}`;
    }
    if (dom.audioTrimStartSeconds) dom.audioTrimStartSeconds.value = start.toFixed(1);
    if (dom.audioTrimEndSeconds) dom.audioTrimEndSeconds.value = end.toFixed(1);
    if (dom.audioTrimStatus) {
      dom.audioTrimStatus.textContent = savedTrim
        ? `Đang dùng mốc đã chia sẻ • cập nhật ${new Date(savedTrim.updatedAt).toLocaleDateString()}`
        : 'Chưa có điểm cắt dùng chung cho bài này.';
    }
    if (dom.audioTrimResetBtn) dom.audioTrimResetBtn.disabled = !savedTrim;
    if (dom.audioTrimModal) dom.audioTrimModal.classList.remove('hidden');
    document.body.classList.add('audio-trim-open');
    refreshAudioTrimTriggerButtons(track);
    syncAudioTrimEditorBounds();
    updateAudioTrimEditorPlayback();
  }

  function closeAudioTrimEditor() {
    if (!dom.audioTrimModal) return;
    dom.audioTrimModal.classList.add('hidden');
    document.body.classList.remove('audio-trim-open');
    audioTrimEditorTrackId = null;
    audioTrimPreviewIsScrubbing = false;
    enforceCurrentTrackAudioTrim();
  }

  async function saveAudioTrim() {
    const track = state.currentTrack;
    const trackId = audioTrimEditorTrackId;
    if (!track || !trackId || String(track.id) !== trackId) {
      showToast('Bài hát đã thay đổi. Hãy mở lại phần tinh chỉnh audio.');
      closeAudioTrimEditor();
      return;
    }

    syncAudioTrimEditorBounds();
    const startSec = Number(dom.audioTrimStartSeconds?.value);
    const endSec = Number(dom.audioTrimEndSeconds?.value);
    const durationSec = Math.max(1, Number(audioTrimEditorDurationSec) || 0);
    if (!Number.isFinite(startSec) || !Number.isFinite(endSec) || startSec < 0 ||
        endSec - startSec < 1 || endSec > durationSec + 0.1) {
      showToast('Điểm kết thúc phải sau điểm bắt đầu ít nhất 1 giây.');
      return;
    }

    if (dom.audioTrimSaveBtn) dom.audioTrimSaveBtn.disabled = true;
    if (dom.audioTrimStatus) dom.audioTrimStatus.textContent = 'Đang lưu điểm cắt lên máy chủ dùng chung…';
    try {
      const response = await fetch(`/api/audio-trims/${encodeURIComponent(trackId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: String(track.title || ''),
          artist: String(track.artist || ''),
          durationSec,
          startSec,
          endSec
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success || !data.trim) throw new Error(data.error || 'Không lưu được điểm cắt.');
      audioTrimStore[trackId] = data.trim;
      audioTrimLoadedTrackIds.add(trackId);
      persistAudioTrimCache();
      audioTrimLastSeekAt = 0;
      audioTrimLastSeekTrackId = null;
      audioTrimHandledEndTrackId = null;
      if (dom.audioTrimStatus) dom.audioTrimStatus.textContent = 'Đã lưu và chia sẻ mốc cắt cho mọi người.';
      if (dom.audioTrimResetBtn) dom.audioTrimResetBtn.disabled = false;
      refreshAudioTrimTriggerButtons(track);
      showToast('✂️ Đã lưu điểm cắt audio và chia sẻ cho mọi người.');
    } catch (error) {
      if (dom.audioTrimStatus) dom.audioTrimStatus.textContent = error.message || 'Chưa lưu được điểm cắt.';
      showToast(`⚠️ ${error.message || 'Không lưu được điểm cắt audio.'}`);
    } finally {
      if (dom.audioTrimSaveBtn) dom.audioTrimSaveBtn.disabled = false;
    }
  }

  async function resetAudioTrim() {
    const trackId = audioTrimEditorTrackId;
    if (!trackId || !audioTrimStore[trackId]) return;
    if (dom.audioTrimResetBtn) dom.audioTrimResetBtn.disabled = true;
    if (dom.audioTrimStatus) dom.audioTrimStatus.textContent = 'Đang xóa điểm cắt dùng chung…';
    try {
      const response = await fetch(`/api/audio-trims/${encodeURIComponent(trackId)}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Không xóa được điểm cắt.');
      delete audioTrimStore[trackId];
      audioTrimLoadedTrackIds.add(trackId);
      persistAudioTrimCache();
      audioTrimHandledEndTrackId = null;
      if (dom.audioTrimStartSeconds) dom.audioTrimStartSeconds.value = '0.0';
      if (dom.audioTrimEndSeconds) dom.audioTrimEndSeconds.value = String(audioTrimEditorDurationSec.toFixed(1));
      if (dom.audioTrimStatus) dom.audioTrimStatus.textContent = 'Đã xóa điểm cắt chung; bài hát sẽ phát nguyên bản.';
      refreshAudioTrimTriggerButtons(state.currentTrack);
      syncAudioTrimEditorBounds();
      showToast('Đã xóa điểm cắt chung của bài hát.');
    } catch (error) {
      if (dom.audioTrimStatus) dom.audioTrimStatus.textContent = error.message || 'Chưa xóa được điểm cắt.';
      showToast(`⚠️ ${error.message || 'Không xóa được điểm cắt audio.'}`);
    } finally {
      if (dom.audioTrimResetBtn) dom.audioTrimResetBtn.disabled = !audioTrimStore[trackId];
    }
  }

  function openLyricsContributionEditor() {
    const track = state.currentTrack;
    if (!track || !track.title || !dom.lyricsContributionModal) {
      showToast('Hãy phát một bài hát trước khi đóng góp lời nhé.');
      return;
    }

    lyricsContributionTrackId = track.id;
    const artist = track.artist || '';
    if (dom.lyricsContributionTrackLabel) {
      dom.lyricsContributionTrackLabel.textContent = `${track.title}${artist ? ` • ${artist}` : ''}`;
    }

    let initialLines = state.lyricsTrackId === track.id
      ? state.lyrics.map(line => ({
        text: line.text,
        time: readLyricsContributionTime(line.time),
        words: !line.wordsEstimated && Array.isArray(line.words)
          ? line.words.filter(word => word && typeof word.text === 'string').map(word => ({ ...word }))
          : []
      }))
      : [];
    if (!initialLines.length && typeof track.lyrics === 'string' && track.lyrics.trim()) {
      const parsed = parseLRC(track.lyrics);
      initialLines = parsed.length
        ? parsed.map(line => ({ text: line.text, time: Number(line.time), words: line.words || [] }))
        : track.lyrics.split(/\r?\n/).map(text => ({ text: text.trim(), time: null, words: [] })).filter(line => line.text);
    }

    setLyricsContributionWordMode(false);
    if (dom.lyricsContributionPlain) {
      dom.lyricsContributionPlain.value = initialLines.map(line => line.text).join('\n');
    }
    renderLyricsContributionRows(initialLines);
    dom.lyricsContributionModal.classList.remove('hidden');
    document.body.classList.add('lyrics-contribution-open');
    syncLyricsContributionPlaybackRateFromEngine();
    if (dom.lyricsContributionPlayhead) {
      dom.lyricsContributionPlayhead.textContent = `Vị trí phát: ${formatLyricsContributionTime(getCurrentAudioTime())}`;
    }
    updateLyricsContributionTimeline();
    setTimeout(() => dom.lyricsContributionPlain?.focus(), 0);
  }

  function closeLyricsContributionEditor() {
    if (!dom.lyricsContributionModal) return;
    dom.lyricsContributionModal.classList.add('hidden');
    document.body.classList.remove('lyrics-contribution-open');
    lyricsContributionTrackId = null;
    resetLyricsContributionPlaybackRate();
  }

  function buildLyricsContributionRows() {
    const lines = String(dom.lyricsContributionPlain?.value || '')
      .split(/\r?\n/)
      .map(text => text.trim())
      .filter(Boolean);
    if (lines.length > 1200) {
      showToast('Lời bài hát có quá nhiều dòng (tối đa 1.200).');
      return;
    }
    renderLyricsContributionRows(lines.map(text => ({ text, time: null, words: [] })));
  }

  async function saveLyricsContribution() {
    const track = state.currentTrack;
    if (!track || track.id !== lyricsContributionTrackId) {
      showToast('Bài hát đã thay đổi. Hãy mở lại trình đóng góp lời.');
      closeLyricsContributionEditor();
      return;
    }
    const submittedTrackId = track.id;

    const durationSec = Number(getLyricDurationSeconds()) || Number(track.durationSec) || parseDurationToSec(track.duration) || 0;
    const rows = [...(dom.lyricsContributionList?.querySelectorAll('.lyrics-contribution-row') || [])];
    const draft = getLyricsContributionDraft();
    const lines = draft.map((line, index) => {
      const rowWordInputs = [...(rows[index]?.querySelectorAll('.lyrics-contribution-word-time') || [])];
      const hasInvalidWordTime = line.hasInvalidWordTime || rowWordInputs.some(input => input.value.trim() !== '' &&
        readLyricsContributionTime(input.value) === null);
      if (hasInvalidWordTime) {
        showToast(`Mốc thời gian ở một từ của câu ${index + 1} không hợp lệ.`);
        return null;
      }

      const hasAnyWordTime = line.words.some(word => word.time !== null && word.time !== undefined);
      const hasCompleteWordTimes = line.words.length > 0 && line.words.every(word => Number.isFinite(word.time));
      if (hasAnyWordTime && !hasCompleteWordTimes) {
        showToast(`Câu ${index + 1}: hãy lấy mốc cho tất cả từ, hoặc xóa các mốc từ để chỉ căn theo dòng.`);
        return null;
      }

      const timedWords = hasCompleteWordTimes
        ? line.words.map(word => ({ text: String(word.text || ''), time: Number(word.time) }))
        : [];
      return {
        text: String(line.text || '').trim(),
        time: timedWords.length ? timedWords[0].time : line.time,
        ...(timedWords.length ? { words: timedWords } : {})
      };
    });
    if (lines.some(line => !line)) return;

    if (lines.length < 2) {
      showToast('Hãy thêm ít nhất hai câu lời bài hát.');
      return;
    }
    let previousTime = -1;
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      if (!line.text || line.text.length > 700 || !Number.isFinite(line.time)) {
        showToast(`Câu ${index + 1} cần có nội dung và mốc thời gian.`);
        return;
      }
      if (line.time < 0 || line.time > durationSec || line.time < previousTime) {
        showToast(`Kiểm tra timeline ở câu ${index + 1}; thời điểm phải tăng dần trong bài hát.`);
        return;
      }
      if (line.words) {
        let previousWordTime = -1;
        for (let wordIndex = 0; wordIndex < line.words.length; wordIndex++) {
          const word = line.words[wordIndex];
          if (!word.text.trim() || !Number.isFinite(word.time) || word.time < previousWordTime ||
              word.time < 0 || word.time > durationSec) {
            showToast(`Kiểm tra mốc của từ ${wordIndex + 1}, câu ${index + 1}; các mốc phải tăng dần trong bài.`);
            return;
          }
          previousWordTime = word.time;
        }
        if (line.words.map(word => word.text).join('').trim() !== line.text) {
          showToast(`Nội dung từ trong câu ${index + 1} đã thay đổi; hãy căn lại các từ của câu này.`);
          return;
        }
      }
      previousTime = line.time;
    }

    if (!durationSec || !track.artist) {
      showToast('Thiếu nghệ sĩ hoặc thời lượng bài hát nên chưa thể lưu lời chung.');
      return;
    }

    const saveButton = dom.lyricsContributionSaveBtn;
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = 'Đang lưu…';
    }
    try {
      const response = await fetch('/api/lyrics/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: track.title,
          artist: track.artist,
          durationSec,
          lines
        })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Chưa lưu được lời bài hát.');
      }
      if (state.currentTrack?.id !== submittedTrackId) {
        if (lyricsContributionTrackId === submittedTrackId) closeLyricsContributionEditor();
        showToast('Đã lưu lời bài hát vào kho chung cho mọi người.');
        return;
      }

      state.lyrics = estimateTimedLyricsWords(result.lines);
      state.lyricsSource = 'community';
      state.lyricsTrackId = track.id;
      state.lyricsLoading = false;
      state.activeLyricIndex = -1;
      const hasCommunityWordTimings = result.lines.some(line => Array.isArray(line.words) && line.words.length > 0);
      if (dom.lyricsSyncBadge) {
        dom.lyricsSyncBadge.innerHTML = hasCommunityWordTimings
          ? `${GhibliIcons.quillScroll} Lời cộng đồng • Đồng bộ từng từ`
          : `${GhibliIcons.quillScroll} Lời cộng đồng • Đồng bộ theo câu`;
      }
      renderLyricsLines(state.lyrics);
      if (dom.sheetLyricsActiveText) dom.sheetLyricsActiveText.textContent = state.lyrics[0]?.text || '';
      if (dom.sheetLyricsNextText) dom.sheetLyricsNextText.textContent = state.lyrics[1]?.text || '';
      syncLyricsWithTime(getCurrentAudioTime());
      closeLyricsContributionEditor();
      showToast('Đã lưu lời và timeline vào kho chung cho mọi người!');
    } catch (err) {
      showToast(err.message || 'Chưa lưu được lời bài hát. Vui lòng thử lại.');
    } finally {
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = 'Lưu cho mọi người';
      }
    }
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

    const previousIdx = state.activeLyricIndex;
    const lineChanged = currentIdx !== previousIdx;
    state.activeLyricIndex = currentIdx;

    // Cập nhật giao diện trên Sân Khấu Lời Nhạc
    if (lineChanged && dom.lyricsLinesContainer) {
      const lineEls = dom.lyricsLinesContainer.children;
      for (let i = 0; i < lineEls.length; i++) {
        const el = lineEls[i];
        const wordEls = el.querySelectorAll('.lyric-word');
        if (i === currentIdx) {
          el.classList.add('active');
          el.classList.remove('past');
        } else if (i < currentIdx) {
          el.classList.remove('active');
          el.classList.add('past');
          wordEls.forEach(wordEl => {
            wordEl.classList.remove('active');
            wordEl.classList.add('past');
          });
        } else {
          el.classList.remove('active', 'past');
          wordEls.forEach(wordEl => wordEl.classList.remove('active', 'past'));
        }
      }

      if (currentIdx >= 0 && lineEls[currentIdx]) {
        lineEls[currentIdx].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }

    // Đồng bộ từng từ khi nguồn lời cung cấp timestamp karaoke nâng cao.
    if (dom.lyricsLinesContainer && currentIdx >= 0) {
      const activeLine = dom.lyricsLinesContainer.children[currentIdx];
      const wordEls = activeLine?.querySelectorAll('.lyric-word') || [];
      let activeWordIdx = -1;
      wordEls.forEach((wordEl, idx) => {
        const wordTime = Number(wordEl.dataset.time);
        if (Number.isFinite(wordTime) && effectiveTime >= wordTime) activeWordIdx = idx;
      });
      wordEls.forEach((wordEl, idx) => {
        wordEl.classList.toggle('active', idx === activeWordIdx);
        wordEl.classList.toggle('past', idx < activeWordIdx);
      });
    }

    // Cập nhật thẻ Lời bài hát trên Mobile Fullscreen Sheet khi chuyển dòng.
    if (lineChanged && currentIdx >= 0 && state.lyrics[currentIdx]) {
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

    const lineTimeTagRegex = /\[(\d{1,3}):(\d{2})(?:[.,](\d{1,3}))?\]/g;
    const wordTimeTagRegex = /<(\d{1,3}):(\d{2})(?:[.,](\d{1,3}))?>/g;
    const toSeconds = match => {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const fraction = match[3] ? parseFloat(`0.${match[3]}`) : 0;
      return minutes * 60 + seconds + fraction;
    };
    const withOffset = time => parseFloat(Math.max(0, time + fileOffsetSec).toFixed(2));

    for (const line of lines) {
      if (/^\[[a-zA-Z]+:/.test(line)) continue;

      const lineMatches = [...line.matchAll(lineTimeTagRegex)];
      const content = line.replace(lineTimeTagRegex, '').trim();
      const wordMatches = [...content.matchAll(wordTimeTagRegex)];
      if (!lineMatches.length && !wordMatches.length) continue;

      const words = [];
      const appendWord = (time, segment) => {
        if (!segment) return;
        let wordText = segment;
        const previousText = words[words.length - 1]?.text || '';
        if (previousText && !/\s$/u.test(previousText) && !/^\s/u.test(wordText) &&
            /[\p{Script=Latin}\p{N}]$/u.test(previousText) && /^[\p{Script=Latin}\p{N}]/u.test(wordText)) {
          wordText = ` ${wordText}`;
        }
        words.push({ time: withOffset(time), text: wordText });
      };
      let text = content;
      if (wordMatches.length) {
        let cursor = 0;
        let segmentTime = lineMatches.length ? toSeconds(lineMatches[0]) : toSeconds(wordMatches[0]);
        for (const wordMatch of wordMatches) {
          const segment = content.slice(cursor, wordMatch.index);
          appendWord(segmentTime, segment);
          segmentTime = toSeconds(wordMatch);
          cursor = wordMatch.index + wordMatch[0].length;
        }
        const lastSegment = content.slice(cursor);
        appendWord(segmentTime, lastSegment);
        text = words.map(word => word.text).join('').trim();
      }

      const times = lineMatches.length ? lineMatches.map(toSeconds) : [toSeconds(wordMatches[0])];
      for (const time of times) {
        parsed.push({
          time: withOffset(time),
          text,
          ...(words.length ? { words } : {})
        });
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
    state.lyricsSource = null;
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
      state.lyricsSource = 'track-attachment';
      const isLrc = /(?:\[|<)\d{1,3}:\d{2}(?:[.,]\d{1,3})?(?:\]|>)/.test(track.lyrics);

      if (isLrc) {
        const parsedLines = parseLRC(track.lyrics);
        if (parsedLines.length > 0) {
          state.lyrics = estimateTimedLyricsWords(parsedLines);
          const hasEstimatedWords = state.lyrics.some(line => line.wordsEstimated);
          if (dom.lyricsSyncBadge) {
            dom.lyricsSyncBadge.innerHTML = hasEstimatedWords
              ? `${GhibliIcons.sparkleStar} Đồng bộ theo dòng • Karaoke ước lượng từng từ`
              : `${GhibliIcons.sparkleStar} Lời đồng bộ do tác giả đính kèm`;
          }
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
          if (hasEstimatedWords) autoAlignLyricsWithVideoCaptions(track);
          return;
        }
      }

      // Lời văn bản thường không có mốc thời gian: ước lượng nhịp theo thời lượng bài.
      state.lyrics = estimatePlainLyricsTimings(track.lyrics);
      if (dom.lyricsSyncBadge) {
        dom.lyricsSyncBadge.innerHTML = `${GhibliIcons.quillScroll} Karaoke ước lượng từ lời tác giả đính kèm`;
      }
      renderLyricsLines(state.lyrics);
      if (dom.sheetLyricsActiveText) {
        dom.sheetLyricsActiveText.textContent = state.lyrics[0]?.text || 'Lời bài hát có sẵn';
      }
      if (dom.sheetLyricsNextText) dom.sheetLyricsNextText.textContent = state.lyrics[1]?.text || '';
      syncLyricsWithTime(getCurrentAudioTime());
      autoAlignLyricsWithVideoCaptions(track);
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
          <div class="lyrics-sparkle-icon">${GhibliIcons.leafSprout}</div>
          <p>Đang tìm kiếm lời bài hát <strong>${escapeHtml(track.title)}</strong>...</p>
        </div>
      `;
    }

    try {
      const params = new URLSearchParams({
        title: track.title,
        artist: track.artist || '',
        duration: track.durationSec || track.duration || '',
        // Gửi kèm videoId để server dùng làm khoá cache duy nhất – ngăn lyrics bài này lọt sang bài khác
        videoId: track.id || ''
      });

      const response = await fetch(`/api/lyrics?${params.toString()}`, {
        signal: lyricsAbortController.signal
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      state.lyricsLoading = false;
      state.lyricsSource = data.source || null;

      // Đảm bảo vẫn đúng bài hát hiện tại
      if (state.currentTrack?.id !== track.id) return;

      if (data.instrumental) {
        state.lyrics = [];
        state.lyricsSource = null;
        if (dom.lyricsSyncBadge) dom.lyricsSyncBadge.innerHTML = `${GhibliIcons.leafSprout} Bản nhạc hòa tấu không lời`;
        if (dom.lyricsLinesContainer) {
          dom.lyricsLinesContainer.innerHTML = `
            <div class="lyrics-instrumental-state">
              <div class="lyrics-sparkle-icon">${GhibliIcons.vintagePiano}</div>
              <h4>Giai Điệu Hòa Tấu Không Lời</h4>
              <p>Bản nhạc không lời mộc mạc từ Khu Vườn Ghibli. Hãy nhắm mắt và hòa mình vào từng nốt nhạc êm dịu.</p>
            </div>
          `;
        }
        if (dom.sheetLyricsActiveText) {
          dom.sheetLyricsActiveText.innerHTML = `${GhibliIcons.leafSprout} Giai điệu hòa tấu không lời của Khu Vườn Ghibli`;
        }
        return;
      }

      if (data.synced && Array.isArray(data.lines) && data.lines.length > 0) {
        state.lyrics = estimateTimedLyricsWords(data.lines);
        const hasEstimatedWords = state.lyrics.some(line => line.wordsEstimated);
        if (dom.lyricsSyncBadge) {
          if (data.source === 'community') {
            const hasWordTimings = data.syncMethod === 'community-word-sync' ||
              state.lyrics.some(line => Array.isArray(line.words) && line.words.length > 0);
            dom.lyricsSyncBadge.innerHTML = hasWordTimings
              ? `${GhibliIcons.quillScroll} Lời cộng đồng • Đồng bộ từng từ`
              : `${GhibliIcons.quillScroll} Lời cộng đồng • Đồng bộ theo câu`;
          } else if (data.syncMethod === 'youtube-captions') {
            const confidence = Math.round((Number(data.syncConfidence) || 0) * 100);
            dom.lyricsSyncBadge.innerHTML = `${GhibliIcons.sparkleStar} Tự căn theo phụ đề video${confidence ? ` • Khớp ${confidence}%` : ''}`;
          } else if (data.syncMethod === 'lyricsfile-word-sync') {
            dom.lyricsSyncBadge.innerHTML = `${GhibliIcons.sparkleStar} LRCLIB • Đồng bộ karaoke từng từ`;
          } else if (data.syncMethod === 'lrc-word-sync') {
            dom.lyricsSyncBadge.innerHTML = `${GhibliIcons.sparkleStar} LRC • Đồng bộ karaoke từng từ`;
          } else {
            dom.lyricsSyncBadge.innerHTML = hasEstimatedWords
              ? `${GhibliIcons.sparkleStar} Đồng bộ theo dòng • Karaoke ước lượng từng từ`
              : `${GhibliIcons.sparkleStar} Đồng bộ thời gian thực (Karaoke)`;
          }
        }

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
        const sourceLabel = data.source === 'genius' ? 'Genius.com' : 'Cơ sở dữ liệu gốc';
        state.lyrics = estimatePlainLyricsTimings(data.plain);
        if (dom.lyricsSyncBadge) dom.lyricsSyncBadge.innerHTML = `${GhibliIcons.quillScroll} Karaoke ước lượng • Lời từ ${sourceLabel}`;
        renderLyricsLines(state.lyrics);
        if (dom.sheetLyricsActiveText) {
          dom.sheetLyricsActiveText.textContent = state.lyrics[0]?.text || 'Lời bài hát chính thức';
        }
        if (dom.sheetLyricsNextText) dom.sheetLyricsNextText.textContent = state.lyrics[1]?.text || '';
        syncLyricsWithTime(getCurrentAudioTime());
      } else {
        state.lyrics = [];
        state.lyricsSource = null;
        const isAi = data.reason === 'ai_generated';
        const badgeText = isAi
          ? `${GhibliIcons.musicSprout} Nhạc do AI tạo (Chưa có dữ liệu lời)`
          : `${GhibliIcons.leafSprout} Chưa có dữ liệu lời bài hát`;
        if (dom.lyricsSyncBadge) dom.lyricsSyncBadge.innerHTML = badgeText;

        const mainTitle = data.message || 'Chưa có dữ liệu cho phần lời bài hát này';
        const subDetail = isAi
          ? 'Bài hát được xác định do AI tạo (Suno, Udio, AI Cover) hoặc biểu diễn bởi giọng ca ảo nên hiện chưa có dữ liệu lời chính thức.'
          : (data.detail || 'Tác phẩm có thể quá mới chưa cập nhật lời, hoặc bản ghi âm đặc biệt chưa có dữ liệu ca từ chính thức.');

        if (dom.lyricsLinesContainer) {
          dom.lyricsLinesContainer.innerHTML = `
            <div class="lyrics-empty-state">
              <div class="lyrics-sparkle-icon">${isAi ? GhibliIcons.musicSprout : GhibliIcons.leafSprout}</div>
              <h4 style="font-size: 1.3rem; margin: 12px 0 8px; color: var(--text-primary); font-weight: 600;">${escapeHtml(mainTitle)}</h4>
              <p style="max-width: 480px; margin: 0 auto 16px; line-height: 1.6; opacity: 0.85; font-size: 0.98rem;">${escapeHtml(subDetail)}</p>
              <div style="font-size: 0.85rem; opacity: 0.65; font-style: italic;">
                ${GhibliIcons.sparkleStar} Hệ thống hiển thị dữ liệu ca từ xác thực 100%, tuyệt đối không tự bịa đặt lời bài hát.
              </div>
            </div>
          `;
        }
        if (dom.sheetLyricsActiveText) {
          dom.sheetLyricsActiveText.textContent = mainTitle;
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn('[Lyrics Fetch Error]:', err.message);
      state.lyricsLoading = false;
      state.lyricsSource = null;
      if (dom.lyricsSyncBadge) dom.lyricsSyncBadge.innerHTML = `${GhibliIcons.fireflyLantern} Chưa thể nạp lời`;
      if (dom.lyricsLinesContainer) {
        dom.lyricsLinesContainer.innerHTML = `
          <div class="lyrics-empty-state">
            <div class="lyrics-sparkle-icon">${GhibliIcons.leafSprout}</div>
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
    updateRecommendationListeningProgress();
    if (dom.lyricsContributionPlayhead && dom.lyricsContributionModal && !dom.lyricsContributionModal.classList.contains('hidden')) {
      dom.lyricsContributionPlayhead.textContent = `Vị trí phát: ${formatLyricsContributionTime(getCurrentAudioTime())}`;
      updateLyricsContributionTimeline();
    }
    updateAudioTrimEditorPlayback();
    if (state.isPlaying) enforceCurrentTrackAudioTrim();
    if (state.isPlaying && !state.isScrubbing) {
      if (state.activeEngine === 'audio' || state.currentTrack?.previewUrl) {
        if (dom.audio) {
          const effectiveDur = getEffectiveAudioDuration();
          if (effectiveDur > 0) {
            updatePlaybackTimeline(dom.audio.currentTime, effectiveDur);
            syncLyricsWithTime(dom.audio.currentTime);

            // Tự động đồng bộ thời lượng thực tế chuẩn vào thông tin bài hát
            if (state.currentTrack && state.currentTrack.durationSec !== Math.round(effectiveDur)) {
              state.currentTrack.durationSec = Math.round(effectiveDur);
              state.currentTrack.duration = formatTime(effectiveDur);
              if (dom.albumDetailTracksList) {
                const matchedRow = dom.albumDetailTracksList.querySelector(`.album-detail-track-row[data-track-id="${state.currentTrack.id}"]`);
                if (matchedRow) {
                  const durCol = matchedRow.querySelector('.col-duration');
                  if (durCol) durCol.textContent = formatTime(effectiveDur);
                }
              }
            }
          }
        }
      } else if (state.activeEngine === 'youtube' && ytPlayer && isYtReady && typeof ytPlayer.getCurrentTime === 'function') {
        const cur = ytPlayer.getCurrentTime();
        const dur = ytPlayer.getDuration();
        if (dur && dur > 0) {
          updatePlaybackTimeline(cur, dur);
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

    beginRecommendationPlaybackSession(track);
    state.currentTrack = track;
    audioTrimLastSeekAt = 0;
    audioTrimLastSeekTrackId = null;
    audioTrimHandledEndTrackId = null;
    ensureSharedAudioTrimLoaded(track);
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

    // 1. Luồng âm thanh trực tiếp hoặc luồng phát nền trên iOS / Mobile
    const directAudioSource = track.audioUrl || track.streamUrl || track.previewUrl;
    const shouldUseNativeAudio = directAudioSource || state.isIOS || state.isMobile || state.isStandalone || state.backgroundPlayback;

    if (shouldUseNativeAudio) {
      // Ưu tiên phát qua HTML5 Audio cho file âm thanh trực tiếp hoặc trên di động/iOS (chạy nền 100% trên iOS PWA & Safari khi khóa màn hình)
      state.activeEngine = 'audio';
      dom.audio.src = directAudioSource || `/api/stream/${track.id}`;
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
          // Fallback sang YouTube iframe nếu không phải thiết bị iOS và audio gặp sự cố
          if (!state.isIOS && ytPlayer && isYtReady && typeof ytPlayer.loadVideoById === 'function') {
            state.activeEngine = 'youtube';
            ytPlayer.loadVideoById(track.id);
            ytPlayer.playVideo();
            return;
          }
          setPlaybackVisualState(false);
        });
      }
    } else {
      // 2. Nhạc YouTube trên Desktop: Phát tức thì qua YouTube Engine chính thức
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
      const window = getTrackAudioTrimWindow(state.currentTrack, getEffectiveAudioDuration());
      seekToSeconds(window.start);
      return;
    }

    if (state.activeEngine === 'youtube' && ytPlayer && isYtReady && typeof ytPlayer.getCurrentTime === 'function' && ytPlayer.getCurrentTime() > 3) {
      const window = getTrackAudioTrimWindow(state.currentTrack, ytPlayer.getDuration());
      seekToSeconds(window.start);
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
  // 3. WAVY VINE PROGRESS BAR & ANIMATED fire.gif PROGRESS MASCOT
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
    let sourceDuration = 0;
    if ((state.activeEngine === 'audio' || state.currentTrack?.previewUrl) && dom.audio) {
      sourceDuration = getEffectiveAudioDuration();
    } else if (state.activeEngine === 'youtube' && ytPlayer && isYtReady && typeof ytPlayer.getDuration === 'function') {
      sourceDuration = Number(ytPlayer.getDuration()) || 0;
    }
    if (sourceDuration <= 0) return;

    const window = getTrackAudioTrimWindow(state.currentTrack, sourceDuration);
    const targetTime = window.start + percent * window.duration;
    seekToSeconds(targetTime);
    updatePlaybackTimeline(targetTime, sourceDuration);
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
        dom.loopBadge.innerHTML = GhibliIcons.loopTwigs;
        dom.loopBadge.classList.remove('hidden');
      } else if (mode === 'one') {
        dom.loopBadge.textContent = '1';
        dom.loopBadge.classList.remove('hidden');
      } else if (mode === 'acorn') {
        dom.loopBadge.innerHTML = GhibliIcons.totoroAcorn;
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
        dom.sheetLoopBadge.innerHTML = GhibliIcons.loopTwigs;
        dom.sheetLoopBadge.classList.remove('hidden');
      } else if (mode === 'one') {
        dom.sheetLoopBadge.textContent = '1';
        dom.sheetLoopBadge.classList.remove('hidden');
      } else if (mode === 'acorn') {
        dom.sheetLoopBadge.innerHTML = GhibliIcons.totoroAcorn;
        dom.sheetLoopBadge.classList.remove('hidden');
      } else {
        dom.sheetLoopBadge.classList.add('hidden');
      }
    }
    if (dom.sheetLoopStatusChip) {
      if (mode === 'all') {
        dom.sheetLoopStatusChip.innerHTML = `${GhibliIcons.loopTwigs} Lặp vĩnh viễn (Toàn bộ)`;
        dom.sheetLoopStatusChip.classList.remove('hidden');
      } else if (mode === 'one') {
        dom.sheetLoopStatusChip.innerHTML = `${GhibliIcons.loopSingle} Lặp 1 bài vĩnh viễn`;
        dom.sheetLoopStatusChip.classList.remove('hidden');
      } else if (mode === 'acorn') {
        dom.sheetLoopStatusChip.innerHTML = `${GhibliIcons.totoroAcorn} Lặp danh sách Hạt Dẻ`;
        dom.sheetLoopStatusChip.classList.remove('hidden');
      } else {
        dom.sheetLoopStatusChip.innerHTML = `${GhibliIcons.arrowRight} Tắt lặp lại`;
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
      dom.sheetShuffleStatusChip.innerHTML = `${GhibliIcons.shuffleWind} Trộn nhạc: ${state.isShuffle ? 'BẬT' : 'TẮT'}`;
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

    const title = escapeHtml(track.title || 'Bài hát chưa có tên');
    const artist = escapeHtml(track.artist || 'Nghệ sĩ');
    const thumbnail = escapeHtml(track.thumbnail || 'wood_2.jpg');
    const duration = escapeHtml(track.duration || '3:30');

    if (state.currentTrack?.id === track.id) {
      card.classList.add('active-playing');
    }

    let rankHtml = '';
    if (track.rank) {
      let rankClass = 'rank-other';
      let rankLabel = `#${escapeHtml(track.rank)}`;
      if (track.rank === 1) {
        rankClass = 'rank-gold';
        rankLabel = `${GhibliIcons.rankLeafGold} 1`;
      } else if (track.rank === 2) {
        rankClass = 'rank-silver';
        rankLabel = `${GhibliIcons.rankLeafSilver} 2`;
      } else if (track.rank === 3) {
        rankClass = 'rank-bronze';
        rankLabel = `${GhibliIcons.rankLeafBronze} 3`;
      }
      rankHtml = `<span class="chart-rank-badge ${rankClass}" title="Hạng #${escapeHtml(track.rank)}">${rankLabel}</span>`;
    }

    const youtubeViewsText = track.youtubeViewsText || null;
    const youtubeViewsHtml = youtubeViewsText
      ? `<span class="track-card-views" title="Tổng lượt xem video trên YouTube; không phải lượt nghe trong ứng dụng">${GhibliIcons.calciferFlame} ${escapeHtml(String(youtubeViewsText).replace(/^[🔥📈]\s*/, ''))}</span>`
      : '';

    card.innerHTML = `
      <div class="card-glare" aria-hidden="true"></div>
      <div class="track-card-vinyl-disc" aria-hidden="true"></div>
      <div class="track-card-thumb-shell">
        <img src="${thumbnail}" alt="${title}" class="track-card-img" loading="lazy">
        ${rankHtml}
        <div class="track-card-play-overlay">
          <span class="play-icon-triangle">▶</span>
        </div>
      </div>
      <div class="track-card-info">
        <span class="track-card-title" title="${title}">${title}</span>
        <span class="track-card-artist" title="${artist}">${artist}</span>
        <div class="track-card-meta-row">
          <span class="track-card-duration">${duration}</span>
          ${youtubeViewsHtml}
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
  // 7. GEO-IP & YOUTUBE MUSIC TRENDING PLAYLISTS
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
            <div class="loading-leaf-spinner">${GhibliIcons.leafSprout}</div>
            <p class="loading-text">Đang cập nhật bảng xếp hạng YouTube Music ${curTimeframe === 'weekly' ? 'tuần này' : 'hôm nay'}...</p>
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
        state.selectedCountryName = data.countryName || state.selectedCountry;
        state.trendingTracks = data.results || data.tracks || [];
        // Đồng bộ Dropdown quốc gia
        if (dom.countrySelectDropdown) {
          dom.countrySelectDropdown.value = state.selectedCountry;
        }

        // Cập nhật Banner
        if (dom.heroFlag) dom.heroFlag.textContent = data.flag || '🇻🇳';
        if (dom.heroGreetingText) {
          const tfLabel = curTimeframe === 'weekly' ? 'YouTube Music • tuần này' : 'YouTube Music • hôm nay';
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
        refreshDiscoverSections();
      }
    } catch (err) {
      console.error('[Load Trending Error]:', err);
      if (dom.trendingTracksGrid) {
        dom.trendingTracksGrid.innerHTML = `
          <div class="ghibli-loading-placeholder">
            <p class="loading-text">${GhibliIcons.autumnLeaf} Không thể tải danh sách bài hát lúc này. Hãy thử lại sau nhé!</p>
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
        if (dom.trendingTracksDetails) dom.trendingTracksDetails.open = true;

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

  function normalizeDiscoverArtist(name) {
    return String(name || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function getDiscoverArtistNames(track) {
    const names = Array.isArray(track?.artists) && track.artists.length
      ? track.artists
      : [track?.artist];
    return [...new Set(names.map(name => String(name || '').trim()).filter(Boolean))];
  }

  function getRecommendationTrackGenres(track) {
    const rawGenres = [track?.genre, ...(Array.isArray(track?.genres) ? track.genres : [])];
    return [...new Set(rawGenres.map(genre => normalizeDiscoverArtist(typeof genre === 'string' ? genre : genre?.name || genre?.label))
      .filter(Boolean))];
  }

  function getRecommendationArtistKeys(track) {
    const keys = getDiscoverArtistNames(track).map(normalizeDiscoverArtist).filter(Boolean);
    return keys.length ? [...new Set(keys)] : [`track:${String(track?.id || '')}`];
  }

  function uniqueTracksById(tracks) {
    const seen = new Set();
    return (tracks || []).filter(track => {
      const id = String(track?.id || '');
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }

  function getDiscoverRegionalArtistRankings() {
    const artists = new Map();
    const chartTracks = state.trendingTracks || [];
    const genreMomentum = new Map();
    chartTracks.forEach((track, index) => {
      const rank = Math.max(1, Number(track.rank) || index + 1);
      const momentum = 50 / Math.pow(rank, 0.72);
      getRecommendationTrackGenres(track).forEach(genre => genreMomentum.set(genre, (genreMomentum.get(genre) || 0) + momentum));
    });
    const add = (name, track, score) => {
      const key = normalizeDiscoverArtist(name);
      if (!key) return;
      const entry = artists.get(key) || { name: String(name).trim(), score: 0, tracks: [], chartCount: 0 };
      const alreadyHasTrack = track && entry.tracks.some(item => String(item.id) === String(track.id));
      if (!alreadyHasTrack) {
        entry.score += score / (1 + entry.chartCount * 0.58);
        entry.chartCount += track ? 1 : 0;
        if (track) entry.tracks.push(track);
      }
      artists.set(key, entry);
    };

    chartTracks.forEach((track, index) => {
      const rank = Math.max(1, Number(track.rank) || index + 1);
      const regionalWeight = 50 / Math.pow(rank, 0.72);
      const genreLift = Math.max(0, ...getRecommendationTrackGenres(track)
        .map(genre => Math.min(8, Math.sqrt(genreMomentum.get(genre) || 0) * 0.22)));
      getDiscoverArtistNames(track).forEach((name, artistIndex) => add(name, track, (regionalWeight + genreLift) / (artistIndex + 1)));
    });

    return [...artists.values()].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  }

  function getDiscoverArtistRankings() {
    const artists = new Map();
    const profile = getRecommendationTasteProfile();
    const ensureArtist = name => {
      const key = normalizeDiscoverArtist(name);
      if (!key) return null;
      if (!artists.has(key)) artists.set(key, { name: String(name).trim(), score: 0, tracks: [], chartTracks: 0, recentAlbumYear: 0, artistId: '', artistThumbnail: '' });
      return artists.get(key);
    };

    (state.trendingTracks || []).forEach((track, index) => {
      const rank = Math.max(1, Number(track.rank) || index + 1);
      const momentum = 38 / Math.pow(rank, 0.76);
      getDiscoverArtistNames(track).forEach((name, artistIndex) => {
        const entry = ensureArtist(name);
        if (!entry) return;
        const primaryArtistKey = normalizeDiscoverArtist(track.primaryArtist || track.artist || track.artists?.[0]);
        if (primaryArtistKey === normalizeDiscoverArtist(name)) {
          if (!entry.artistId && track.artistId) entry.artistId = String(track.artistId);
          if (!entry.artistThumbnail && track.artistThumbnail) entry.artistThumbnail = String(track.artistThumbnail);
        }
        if (!entry.tracks.some(item => String(item.id) === String(track.id))) {
          entry.score += momentum / ((artistIndex + 1) * (1 + entry.chartTracks * 0.7));
          entry.chartTracks += 1;
          entry.tracks.push(track);
        }
      });
    });

    (state.homeAlbums || []).forEach((album, index) => {
      const entry = ensureArtist(album.artist);
      if (!entry) return;
      const year = Number.parseInt(album.year, 10) || 0;
      const freshness = year ? Math.max(0, Math.min(18, (year - 2018) * 1.35 + 4)) : 0;
      entry.score += (12 - index * 0.45) + freshness;
      entry.recentAlbumYear = Math.max(entry.recentAlbumYear, year);
      if (album.id && !entry.tracks.some(track => String(track.id) === String(album.id))) {
        entry.tracks.push({
          id: album.id,
          title: album.title,
          artist: album.artist,
          thumbnail: album.thumbnail,
          year: album.year,
          source: album.source || 'youtube-music-album',
          albumId: album.albumId || album.id,
          releaseId: album.releaseId || ''
        });
      }
    });

    return [...artists.values()]
      .filter(artist => artist.name && artist.score > 0)
      .map(artist => {
        const key = normalizeDiscoverArtist(artist.name);
        const listenerEngagement = Math.min(6,
          (profile.recentArtistScores.get(key) || 0) * 1.2 +
          (profile.longTermArtistScores.get(key) || 0) * 0.3 +
          (profile.favoriteArtists.has(key) ? 1.2 : 0));
        return { ...artist, score: artist.score + listenerEngagement, isNewWave: state.selectedCountry === 'VN' };
      })
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .slice(0, 40);
  }

  function getHomeArtistExposure(includeArtistDiscovery = false) {
    const exposure = new Map();
    const add = (trackOrName, amount = 1) => {
      const names = typeof trackOrName === 'string'
        ? [trackOrName]
        : getDiscoverArtistNames(trackOrName);
      names.map(normalizeDiscoverArtist).filter(Boolean).forEach(name => {
        exposure.set(name, (exposure.get(name) || 0) + amount);
      });
    };

    getDiscoverRegionalArtistRankings().slice(0, 7).forEach(artist => add(artist.name));
    getStartListeningCandidates().slice(0, 5).forEach(track => add(track));
    (state.homeAlbums || []).slice(0, 8).forEach(album => add(album.artist));
    if (includeArtistDiscovery) getDiscoverArtistRankings().slice(0, 8).forEach(artist => add(artist.name));
    return exposure;
  }

  function diversifyRankedCandidates(candidates, limit, maxPerArtist = (limit <= 10 ? 2 : 3)) {
    const pool = [...(candidates || [])];
    const selected = [];
    const counts = new Map();

    while (pool.length && selected.length < limit) {
      const previousKeys = selected.length ? new Set(getRecommendationArtistKeys(selected[selected.length - 1].track)) : new Set();
      const eligible = pool.filter(candidate => {
        const keys = getRecommendationArtistKeys(candidate.track);
        return keys.every(key => (counts.get(key) || 0) < maxPerArtist) && !keys.some(key => previousKeys.has(key));
      });
      const underCap = pool.filter(candidate => getRecommendationArtistKeys(candidate.track)
        .every(key => (counts.get(key) || 0) < maxPerArtist));
      const choices = eligible.length ? eligible : (underCap.length ? underCap : pool);
      choices.sort((a, b) => {
        const countA = Math.max(...getRecommendationArtistKeys(a.track).map(key => counts.get(key) || 0));
        const countB = Math.max(...getRecommendationArtistKeys(b.track).map(key => counts.get(key) || 0));
        const previousA = getRecommendationArtistKeys(a.track).some(key => previousKeys.has(key)) ? 1 : 0;
        const previousB = getRecommendationArtistKeys(b.track).some(key => previousKeys.has(key)) ? 1 : 0;
        return (b.score - countB * 24 - previousB * 1000) - (a.score - countA * 24 - previousA * 1000);
      });
      const next = choices[0];
      selected.push(next);
      getRecommendationArtistKeys(next.track).forEach(key => counts.set(key, (counts.get(key) || 0) + 1));
      pool.splice(pool.indexOf(next), 1);
    }

    return selected.map(candidate => candidate.track);
  }

  function getRecommendationTasteProfile() {
    const history = state.recommendationHistory || { listens: [], skips: [], discovery: [] };
    const recentArtistScores = new Map();
    const longTermArtistScores = new Map();
    const artistPlayCounts = new Map();
    const recentGenreScores = new Map();
    const longTermGenreScores = new Map();
    const trackPlayCounts = new Map();
    const lastPlayedAt = new Map();
    const listenedTracks = [];

    (history.listens || []).forEach(event => {
      const track = event.track;
      const playedAt = Number(event.playedAt) || 0;
      const ageDays = playedAt ? Math.max(0, (Date.now() - playedAt) / 86400000) : 365;
      const replayWeight = 1 + Math.min(0.75, Math.max(0, Number(event.completed) ? 0.35 : 0) + Math.max(0, Number(event.listenedSeconds) / Math.max(30, Number(event.durationSec) || 180) - 0.5));
      const recentWeight = Math.exp(-ageDays / 21) * replayWeight;
      const longTermWeight = Math.exp(-ageDays / 180) * replayWeight;
      getDiscoverArtistNames(track).forEach(name => {
        const key = normalizeDiscoverArtist(name);
        if (!key) return;
        recentArtistScores.set(key, (recentArtistScores.get(key) || 0) + recentWeight);
        longTermArtistScores.set(key, (longTermArtistScores.get(key) || 0) + longTermWeight);
        artistPlayCounts.set(key, (artistPlayCounts.get(key) || 0) + 1);
      });
      getRecommendationTrackGenres(track).forEach(genre => {
        recentGenreScores.set(genre, (recentGenreScores.get(genre) || 0) + recentWeight);
        longTermGenreScores.set(genre, (longTermGenreScores.get(genre) || 0) + longTermWeight);
      });
      const trackId = String(track?.id || '');
      if (trackId) {
        trackPlayCounts.set(trackId, (trackPlayCounts.get(trackId) || 0) + 1);
        lastPlayedAt.set(trackId, Math.max(lastPlayedAt.get(trackId) || 0, playedAt));
        listenedTracks.push({ ...track, _lastListenedAt: playedAt, _listenedSeconds: Number(event.listenedSeconds) || 0 });
      }
    });

    const favoriteArtists = new Set();
    const likedSongIds = new Set();
    const favoriteGenreScores = new Map();
    (state.favorites || []).forEach(track => {
      if (track?.id) likedSongIds.add(String(track.id));
      getDiscoverArtistNames(track).forEach(name => favoriteArtists.add(normalizeDiscoverArtist(name)));
      getRecommendationTrackGenres(track).forEach(genre => favoriteGenreScores.set(genre, (favoriteGenreScores.get(genre) || 0) + 1));
    });

    const recentSkippedIds = new Map();
    (history.skips || []).forEach(event => {
      const id = String(event.track?.id || '');
      const ageDays = Math.max(0, (Date.now() - (Number(event.skippedAt) || 0)) / 86400000);
      if (id && ageDays <= 30) recentSkippedIds.set(id, Math.min(1.5, (recentSkippedIds.get(id) || 0) + Math.exp(-ageDays / 18)));
    });

    const discoveryArtistScores = new Map();
    (history.discovery || []).forEach(event => {
      const key = normalizeDiscoverArtist(event.artist);
      const ageDays = Math.max(0, (Date.now() - (Number(event.at) || 0)) / 86400000);
      if (key && ageDays <= 60) discoveryArtistScores.set(key, (discoveryArtistScores.get(key) || 0) + Math.exp(-ageDays / 24));
    });

    const sortScores = map => [...map.entries()].sort((a, b) => b[1] - a[1]);
    return {
      recentArtistScores,
      longTermArtistScores,
      artistPlayCounts,
      recentGenreScores,
      longTermGenreScores,
      favoriteGenreScores,
      favoriteArtists,
      likedSongIds,
      recentSkippedIds,
      trackPlayCounts,
      lastPlayedAt,
      listenedTracks,
      recentArtists: sortScores(recentArtistScores),
      frequentArtists: sortScores(artistPlayCounts).filter(([, count]) => count > 1),
      favoriteArtistNames: [...new Map((state.favorites || []).flatMap(getDiscoverArtistNames)
        .map(name => [normalizeDiscoverArtist(name), name])).values()],
      frequentGenres: sortScores(longTermGenreScores),
      recentGenres: sortScores(recentGenreScores),
      discoveryArtistScores
    };
  }

  function getStartListeningCandidates() {
    const profile = getRecommendationTasteProfile();
    const candidateScores = new Map();
    const add = (track, score, source) => {
      if (!track?.id) return;
      const id = String(track.id);
      const existing = candidateScores.get(id);
      if (!existing || score > existing.score) candidateScores.set(id, { track, score, source });
    };

    const now = Date.now();
    const recentListens = profile.listenedTracks
      .filter(track => !track._lastListenedAt || (now - track._lastListenedAt) / 86400000 <= 30)
      .sort((a, b) => b._lastListenedAt - a._lastListenedAt);
    recentListens.forEach((track, index) => {
      const ageDays = track._lastListenedAt ? Math.max(0, (now - track._lastListenedAt) / 86400000) : 30;
      add(track, 100 - Math.min(35, ageDays * 1.5) - index * 2, 'recent-listen');
    });
    const regionalTrackIds = new Set((state.trendingTracks || []).map(track => String(track.id || '')).filter(Boolean));
    (state.recentListeningRelatedTracks || []).filter(track => regionalTrackIds.has(String(track.id || ''))).forEach((track, index) => {
      const artistAffinity = Math.max(0, ...getRecommendationArtistKeys(track).map(key => profile.recentArtistScores.get(key) || 0));
      add(track, 77 + Math.min(18, artistAffinity * 4) - index * 0.08, 'recently-related');
    });

    // Favorites are a start source only for listeners without qualified play history.
    if (!profile.listenedTracks.length) {
      (state.favorites || []).forEach((track, index) => add(track, 70 - index * 0.4, 'favorite-start'));
    }

    // The selected region's chart is the only chart source for this section.
    const hasTasteSignals = profile.listenedTracks.length > 0 || profile.favoriteArtists.size > 0;
    if (!hasTasteSignals) {
      (state.trendingTracks || []).forEach((track, index) => {
        const rank = Math.max(1, Number(track.rank) || index + 1);
        add(track, 52 / Math.sqrt(rank), 'cold-start-chart');
      });
    }

    const ranked = [...candidateScores.values()].map(candidate => ({
      ...candidate,
      score: candidate.score - (profile.recentSkippedIds.get(String(candidate.track.id)) || 0) * 18
    })).sort((a, b) => b.score - a.score);
    return diversifyRankedCandidates(ranked, 5, 2);
  }

  function scorePersonalRecommendation(track, source, profile, exposure) {
    const id = String(track.id);
    const artists = getRecommendationArtistKeys(track);
    const genres = getRecommendationTrackGenres(track);
    const recentTaste = Math.max(0, ...artists.map(key => profile.recentArtistScores.get(key) || 0));
    const longTermTaste = Math.max(0, ...artists.map(key => profile.longTermArtistScores.get(key) || 0));
    const discoveryIntent = Math.max(0, ...artists.map(key => profile.discoveryArtistScores.get(key) || 0));
    const recentGenreAffinity = Math.max(0, ...genres.map(genre => profile.recentGenreScores.get(genre) || 0));
    const longTermGenreAffinity = Math.max(0, ...genres.map(genre => profile.longTermGenreScores.get(genre) || 0));
    const favoriteGenreAffinity = Math.max(0, ...genres.map(genre => profile.favoriteGenreScores.get(genre) || 0));
    const playedAt = profile.lastPlayedAt.get(id) || 0;
    const ageDays = playedAt ? Math.max(0, (Date.now() - playedAt) / 86400000) : 365;
    const chartTrack = source === 'regional-chart' && (state.trendingTracks || [])
      .find(item => String(item.id) === id);
    const chartRank = Math.max(1, Number(chartTrack?.rank) || 50);
    const repeatedPlays = profile.trackPlayCounts.get(id) || 0;
    const exposureCount = Math.max(0, ...artists.map(key => exposure.get(key) || 0));
    const skipRisk = profile.recentSkippedIds.get(id) || 0;

    let score = 0;
    score += Math.min(56, recentTaste * 28);                 // Current taste
    score += Math.min(20, longTermTaste * 3.2);              // Long-term taste
    score += Math.min(14, Math.max(0, repeatedPlays - 1) * 5); // Replays
    if (artists.some(key => profile.favoriteArtists.has(key))) score += 34;
    score += Math.min(22, recentGenreAffinity * 8);
    score += Math.min(12, longTermGenreAffinity * 3.5);
    score += Math.min(8, favoriteGenreAffinity * 2.5);
    if (source === 'regional-chart') score += Math.min(8, 8 / Math.sqrt(chartRank));
    score += Math.min(7, discoveryIntent * 4);               // Explicit radio exploration, weak intent
    if (playedAt && ageDays <= 10) score -= 28 * (1 - ageDays / 14); // Avoid immediate repetition
    else if (repeatedPlays >= 3) score += 7;
    score -= skipRisk * 42;
    score -= exposureCount * 4.5;
    if (state.currentTrack?.id && String(state.currentTrack.id) === id) score -= 40;
    return score;
  }

  const recommendationSearchCache = {
    recent: { key: '', at: 0, promise: null }
  };

  function getRecentArtistSearchSeeds(profile, limit = 1) {
    const seeds = [];
    const seen = new Set();
    const recentTracks = profile.listenedTracks.filter(track => {
      return !track._lastListenedAt || (Date.now() - track._lastListenedAt) / 86400000 <= 30;
    });
    recentTracks.slice().sort((a, b) => b._lastListenedAt - a._lastListenedAt).forEach(track => {
      getDiscoverArtistNames(track).forEach(name => {
        const key = normalizeDiscoverArtist(name);
        if (key && !seen.has(key) && seeds.length < limit) {
          seen.add(key);
          seeds.push(name);
        }
      });
    });
    return seeds;
  }

  async function fetchRecommendationSource(seeds, source, cache, setTracks, rerender) {
    if (!seeds.length) {
      cache.key = '';
      cache.at = 0;
      setTracks([]);
      rerender();
      return;
    }

    const requestKey = `${state.selectedCountry}|${seeds.map(normalizeDiscoverArtist).join('|')}`;
    if (cache.key === requestKey && Date.now() - cache.at < 20 * 60 * 1000) return;
    if (cache.promise) return cache.promise.then(() => fetchRecommendationSource(seeds, source, cache, setTracks, rerender));

    cache.key = requestKey;
    cache.at = Date.now();
    cache.promise = Promise.all(seeds.map(async seed => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(`${seed} similar songs`)}`);
        if (!response.ok) return [];
        const data = await response.json();
        return (Array.isArray(data.results) ? data.results : []).map(track => ({
          ...track,
          _recommendationSource: source,
          _recommendationSeed: seed
        }));
      } catch (_) {
        return [];
      }
    })).then(groups => {
      if (cache.key !== requestKey) return;
      setTracks(uniqueTracksById(groups.flat()).slice(0, 75));
      rerender();
    }).finally(() => {
      cache.promise = null;
    });
    return cache.promise;
  }

  async function refreshPersonalizedCandidates() {
    const profile = getRecommendationTasteProfile();
    const recentSeeds = getRecentArtistSearchSeeds(profile);
    await fetchRecommendationSource(recentSeeds, 'recently-related', recommendationSearchCache.recent,
      tracks => { state.recentListeningRelatedTracks = tracks; }, renderDiscoverRecentList);
  }

  const RADIO_RECOMMENDATION_WEIGHTS = Object.freeze({
    trendScore: 0.30,
    recentPopularity: 0.20,
    listenerAffinity: 0.15,
    artistSimilarity: 0.10,
    genreRelevance: 0.08,
    freshness: 0.07,
    regionalRelevance: 0.05,
    discoveryValue: 0.05
  });
  let lastRadioDiagnosticsSnapshot = '';

  function isYoutubeArtworkUrl(value) {
    try {
      const url = new URL(String(value || '').trim());
      if (url.protocol !== 'https:') return false;
      const host = url.hostname.toLocaleLowerCase();
      return ['ytimg.com', 'ggpht.com', 'googleusercontent.com'].some(domain =>
        host === domain || host.endsWith('.' + domain)
      );
    } catch {
      return false;
    }
  }

  function getResolvedDiscoverArtwork(kind, item = {}) {
    const candidates = kind === 'artist'
      ? [item.artistThumbnail, item.sourceThumbnail]
      : [item.albumThumbnail, item.thumbnail, item.sourceThumbnail];
    const thumbnail = candidates.map(value => String(value || '').trim()).find(isYoutubeArtworkUrl) || '';
    const source = String(item.source || '').toLocaleLowerCase();
    return {
      kind,
      title: String(item.title || ''),
      artistId: String(item.artistId || ''),
      releaseId: String(item.releaseId || ''),
      albumId: String(item.albumId || item.id || ''),
      thumbnail: kind === 'artist' ? '' : thumbnail,
      artistThumbnail: kind === 'artist' ? thumbnail : '',
      artworkSource: thumbnail ? (source.includes('youtube-music') ? 'youtube-music' : 'youtube') : 'neutral-fallback'
    };
  }

  function splitRadioArtistCredits(value) {
    return String(value?.name || value?.text || value || '')
      .split(/\s*(?:,|&|\+|\bx\b|\bfeat\.?\b|\bft\.?\b|\bwith\b)\s*/i)
      .map(name => name.trim().replace(/^[\s\d.,:;|()[\]{}]+|[\s.,:;|()[\]{}]+$/g, ''))
      .filter(name => name && !/^(feat\.?|ft\.?)$/i.test(name));
  }

  function isUsableRadioArtist(name, track) {
    const key = normalizeDiscoverArtist(name);
    const words = key.split(/\s+/).filter(Boolean);
    if (!key || key.length < 2 || key.length > 52 || words.length > 7) return false;
    if (/\b(?:official|vevo|topic|channel|visualizer|performance|lyrics|karaoke|music video)\b/.test(key)) return false;
    const titleKey = normalizeDiscoverArtist(track?.title);
    return key !== titleKey && !['unknown artist', 'various artists', 'artist'].includes(key);
  }

  function getRadioArtistNames(track) {
    const credits = Array.isArray(track?.artists) && track.artists.length ? track.artists : [track?.artist];
    const seen = new Set();
    return credits.flatMap(splitRadioArtistCredits).filter(name => {
      const key = normalizeDiscoverArtist(name);
      if (!isUsableRadioArtist(name, track) || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function getRadioTrackGenres(track) {
    return getRecommendationTrackGenres(track);
  }

  function radioGenreSimilarity(left, right) {
    const leftGenres = new Set(left.genres || []);
    const rightGenres = new Set(right.genres || []);
    if (!leftGenres.size || !rightGenres.size) return 0;
    const intersection = [...leftGenres].filter(genre => rightGenres.has(genre)).length;
    return intersection / new Set([...leftGenres, ...rightGenres]).size;
  }

  function hashRadioTieBreak(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index++) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function buildRadioRecommendationCandidates() {
    const profile = getRecommendationTasteProfile();
    const exposure = getHomeArtistExposure(false);
    const candidates = new Map();
    const relationships = new Map();
    const sourceCounts = {};
    const currentYear = new Date().getFullYear();
    const rawTrackIdsBySource = new Map();

    const addRelationship = (leftName, rightName, score) => {
      const left = normalizeDiscoverArtist(leftName);
      const right = normalizeDiscoverArtist(rightName);
      if (!left || !right || left === right) return;
      const leftMap = relationships.get(left) || new Map();
      const rightMap = relationships.get(right) || new Map();
      leftMap.set(right, Math.max(leftMap.get(right) || 0, score));
      rightMap.set(left, Math.max(rightMap.get(left) || 0, score));
      relationships.set(left, leftMap);
      relationships.set(right, rightMap);
    };

    const addTrack = (track, source, index, sourceMeta = {}) => {
      if (!track) return;
      const names = getRadioArtistNames(track);
      if (!names.length) return;
      const rank = Math.max(1, Number(track.rank) || index + 1);
      const rankSignal = 1 / Math.pow(rank, 0.58);
      const genres = getRadioTrackGenres(track);
      const year = Number.parseInt(track.year || track.releaseYear || track.album?.year, 10) || 0;
      const releaseFreshness = year ? Math.exp(-Math.max(0, currentYear - year) / 5) : 0;
      const trackId = String(track.id || `${source}:${track.title || names[0]}`);
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      const sourceIds = rawTrackIdsBySource.get(source) || new Set();
      sourceIds.add(trackId);
      rawTrackIdsBySource.set(source, sourceIds);

      names.forEach((name, artistIndex) => {
        const key = normalizeDiscoverArtist(name);
        if (!key || key.length < 2 || ['unknown artist', 'various artists', 'artist'].includes(key)) return;
        const artistId = String(track.artistId || '').trim().toLocaleLowerCase();
        const identityKey = artistId || key;
        const candidate = candidates.get(identityKey) || candidates.get(key) || {
          key,
          name: String(name).trim(),
          artistId: artistId || '',
          tracks: [],
          trackIds: new Set(),
          sourceScores: {},
          genreScores: new Map(),
          regionalRanks: [],
          globalRanks: [],
          albumYears: [],
          relationshipMap: null,
          genres: [],
          scoreParts: null,
          relevanceScore: 0,
          chartTrackCount: 0
        };
        if (!candidate.artistId && track.artistId) {
          candidate.artistId = String(track.artistId);
        }
        const artistCreditPenalty = 1 / (artistIndex + 1);
        candidate.sourceScores[source] = Math.max(candidate.sourceScores[source] || 0, rankSignal * artistCreditPenalty);
        if (source === 'regional') candidate.regionalRanks.push(rank);
        if (source === 'global') candidate.globalRanks.push(rank);
        if (source === 'album' && year) candidate.albumYears.push(year);
        if (source === 'regional' || source === 'global') candidate.chartTrackCount += 1;
        if (year) candidate.albumYears.push(year);
        genres.forEach(genre => candidate.genreScores.set(genre, (candidate.genreScores.get(genre) || 0) + rankSignal));
        if (!candidate.trackIds.has(trackId)) {
          candidate.trackIds.add(trackId);
          candidate.tracks.push({ track, source, rank, rankSignal, sourceMeta });
        }
        candidates.set(key, candidate);
        candidates.set(identityKey, candidate);
      });

      if (names.length > 1) {
        names.forEach((name, nameIndex) => names.slice(nameIndex + 1).forEach(otherName => addRelationship(name, otherName, 0.9)));
      }
    };

    const regionalTracks = state.trendingTracks || [];
    const recentListenTracks = profile.listenedTracks.filter(track => {
      const ageDays = track._lastListenedAt ? Math.max(0, (Date.now() - track._lastListenedAt) / 86400000) : 365;
      return ageDays <= 90;
    }).sort((a, b) => b._lastListenedAt - a._lastListenedAt);
    // Recommendation candidates must come from the selected region's chart.
    // Listening history still affects ranking, but never adds out-of-region artists.
    const sourceGroups = [{ name: 'regional', tracks: regionalTracks }];

    sourceGroups.forEach(({ name, tracks }) => tracks.forEach((track, index) => addTrack(track, name, index)));

    // Co-artist credits and close chart placements form relationship edges; sequential listens add an opt-in, local co-listening signal.
    [
      { tracks: regionalTracks, strength: 0.24 }
    ].forEach(({ tracks, strength }) => {
      for (let index = 0; index < tracks.length; index++) {
        const current = tracks[index];
        const currentArtists = getRadioArtistNames(current);
        const currentGenres = getRadioTrackGenres(current);
        for (let nextIndex = index + 1; nextIndex < Math.min(tracks.length, index + 4); nextIndex++) {
          const next = tracks[nextIndex];
          const nextArtists = getRadioArtistNames(next);
          const genreOverlap = getRadioTrackGenres(next).some(genre => currentGenres.includes(genre));
          const rankDistance = nextIndex - index;
          // Chart adjacency alone is not a reliable artist relationship.
          // Use it only when both tracks share an identified genre.
          if (!genreOverlap) continue;
          const edgeScore = strength * (genreOverlap ? 1 : 0.55) / rankDistance;
          currentArtists.forEach(name => nextArtists.forEach(otherName => addRelationship(name, otherName, edgeScore)));
        }
      }
    });

    const listeningSequence = recentListenTracks.slice().sort((a, b) => a._lastListenedAt - b._lastListenedAt);
    for (let index = 1; index < listeningSequence.length; index++) {
      const previous = listeningSequence[index - 1];
      const current = listeningSequence[index];
      const gapHours = Math.max(0, (current._lastListenedAt - previous._lastListenedAt) / 3600000);
      if (gapHours > 2) continue;
      const coListenWeight = 0.55 * Math.exp(-gapHours / 0.65);
      getRadioArtistNames(previous).forEach(name => getRadioArtistNames(current).forEach(otherName => addRelationship(name, otherName, coListenWeight)));
    }

    const maximumRecentArtistScore = Math.max(0, ...profile.recentArtistScores.values());
    const maximumLongTermArtistScore = Math.max(0, ...profile.longTermArtistScores.values());
    const maximumGenreScore = Math.max(0, ...profile.recentGenreScores.values(), ...profile.favoriteGenreScores.values());
    const favoriteGenreKeys = new Set(profile.favoriteGenreScores.keys());
    const userAnchorKeys = new Set([
      ...profile.favoriteArtists,
      ...profile.recentArtistScores.keys(),
      ...profile.longTermArtistScores.keys()
    ]);
    const trendingAnchorKeys = new Set(regionalTracks.slice(0, 12).flatMap(getRadioArtistNames).map(normalizeDiscoverArtist));
    const similarityAnchors = userAnchorKeys.size ? userAnchorKeys : trendingAnchorKeys;

    const ranked = [...new Set(candidates.values())].map(candidate => {
      candidate.relationshipMap = relationships.get(candidate.key) || new Map();
      candidate.genres = [...candidate.genreScores.entries()].sort((a, b) => b[1] - a[1]).map(([genre]) => genre);
      const regionalRank = Math.min(...candidate.regionalRanks, Infinity);
      const globalRank = Math.min(...candidate.globalRanks, Infinity);
      const regionalSignal = Number.isFinite(regionalRank) ? 1 / Math.pow(regionalRank, 0.58) : 0;
      const globalSignal = Number.isFinite(globalRank) ? 1 / Math.pow(globalRank, 0.58) : 0;
      const latestAlbumYear = Math.max(0, ...candidate.albumYears);
      const freshness = latestAlbumYear
        ? Math.exp(-Math.max(0, currentYear - latestAlbumYear) / 5)
        : (regionalSignal || globalSignal ? 0.72 : 0.42);
      const recentPopularity = Math.min(1, Math.max(
        regionalSignal * 0.58 + globalSignal * 0.18,
        candidate.sourceScores.listener ? Math.exp(-Math.max(0, (Date.now() - (candidate.tracks.find(item => item.source === 'listener')?.track._lastListenedAt || 0)) / 86400000) / 30) * 0.45 : 0
      ));
      const recentArtist = profile.recentArtistScores.get(candidate.key) || 0;
      const longTermArtist = profile.longTermArtistScores.get(candidate.key) || 0;
      const artistSkipRisk = Math.max(0, ...candidate.tracks.map(item => profile.recentSkippedIds.get(String(item.track?.id || '')) || 0));
      const listenerAffinity = Math.max(0, Math.min(1,
        (maximumRecentArtistScore ? recentArtist / maximumRecentArtistScore * 0.65 : 0) +
        (maximumLongTermArtistScore ? longTermArtist / maximumLongTermArtistScore * 0.2 : 0) +
        (profile.favoriteArtists.has(candidate.key) ? 0.3 : 0)
      ) - artistSkipRisk * 0.12);
      const artistSimilarity = Math.max(0, ...[...similarityAnchors].map(anchor => {
        if (anchor === candidate.key) return 0;
        return candidate.relationshipMap.get(anchor) || 0;
      }));
      const genreRelevance = candidate.genres.length
        ? Math.max(0.35, ...candidate.genres.map(genre => maximumGenreScore
          ? Math.min(1, ((profile.recentGenreScores.get(genre) || 0) + (profile.favoriteGenreScores.get(genre) || 0) * 1.4) / maximumGenreScore)
          : (favoriteGenreKeys.has(genre) ? 1 : 0.35)))
        : 0.35;
      const regionalRelevance = regionalSignal ? 1 : (globalSignal ? 0.32 : 0.28);
      const exposureCount = exposure.get(candidate.key) || 0;
      const discoveryValue = Math.max(0, Math.min(1,
        0.45 * (1 - Math.min(1, exposureCount / 4)) +
        0.35 * freshness +
        0.2 * (candidate.chartTrackCount <= 1 ? 1 : 1 / Math.sqrt(candidate.chartTrackCount))
      ));
      const trendScore = Math.min(1, Math.max(regionalSignal, globalSignal * 0.82));
      const scoreParts = {
        trendScore,
        recentPopularity,
        listenerAffinity,
        artistSimilarity: Math.min(1, artistSimilarity),
        genreRelevance,
        freshness,
        regionalRelevance,
        discoveryValue
      };
      candidate.scoreParts = scoreParts;
      candidate.relevanceScore = Object.entries(RADIO_RECOMMENDATION_WEIGHTS)
        .reduce((score, [key, weight]) => score + scoreParts[key] * weight, 0);
      candidate.isExploration = !regionalSignal && globalSignal > 0;
      return candidate;
    }).filter(candidate => candidate.name && candidate.relevanceScore > 0);

    // Keep a stable order within each six-hour snapshot, then let the shelf
    // explore a new deterministic tie-break when it is refreshed later.
    const refreshWindow = Math.floor(Date.now() / (6 * 60 * 60 * 1000));
    const snapshot = [
      state.selectedCountry,
      state.currentTimeframe,
      new Date().toISOString().slice(0, 10),
      refreshWindow,
      ...sourceGroups.flatMap(({ name, tracks }) => tracks.map(track => `${name}:${track.id || track.title || ''}`)),
      ...state.recommendationHistory.listens.slice(-24).map(event => `${event.track?.id || ''}:${event.playedAt || ''}`),
      ...state.favorites.map(track => track.id || track.title || '')
    ].join('|');
    const tieSeed = hashRadioTieBreak(snapshot);
    ranked.sort((a, b) => b.relevanceScore - a.relevanceScore ||
      hashRadioTieBreak(`${tieSeed}:${a.key}`) - hashRadioTieBreak(`${tieSeed}:${b.key}`));

    return {
      ranked,
      relationships,
      profile,
      sourceCounts: Object.fromEntries(sourceGroups.map(({ name, tracks }) => [name, rawTrackIdsBySource.get(name)?.size || 0])),
      rawCandidateTracks: Object.values(sourceCounts).reduce((sum, count) => sum + count, 0),
      snapshot: `${snapshot}|${ranked.map(item => item.key).join(',')}`
    };
  }

  function radioArtistSimilarity(left, right, relationships) {
    const explicitRelationship = relationships.get(left.key)?.get(right.key) || 0;
    return Math.max(explicitRelationship, radioGenreSimilarity(left, right) * 0.72);
  }

  function selectDiverseRadioArtists(ranked, relationships, snapshot) {
    const limit = Math.min(12, ranked.length);
    if (!ranked.length) return [];
    const selected = [];
    const selectedKeys = new Set();
    const genreCounts = new Map();
    const pushBest = (pool, explore = false) => {
      const choices = pool.filter(candidate => !selectedKeys.has(candidate.key));
      if (!choices.length) return false;
      const scored = choices.map(candidate => {
        const similarityScore = Math.max(0, ...selected.map(item => radioArtistSimilarity(candidate, item.candidate, relationships)));
        const dominantGenreCount = candidate.genres.length ? Math.max(0, ...candidate.genres.map(genre => genreCounts.get(genre) || 0)) : 0;
        const genrePenalty = Math.min(0.12, dominantGenreCount * 0.025);
        const explorationLift = explore ? candidate.scoreParts.discoveryValue * 0.06 : 0;
        const finalScore = candidate.relevanceScore * 0.72 + (1 - similarityScore) * 0.28 - genrePenalty + explorationLift;
        return { candidate, similarityScore, finalScore };
      }).sort((a, b) => b.finalScore - a.finalScore ||
        hashRadioTieBreak(`${snapshot}:${a.candidate.key}`) - hashRadioTieBreak(`${snapshot}:${b.candidate.key}`));
      const choice = scored[0];
      selected.push(choice);
      selectedKeys.add(choice.candidate.key);
      choice.candidate.genres.forEach(genre => genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1));
      return true;
    };

    const cardCount = Math.min(limit, ranked.length);
    const coreCount = cardCount >= 8 ? Math.ceil(cardCount * 0.85) : cardCount;
    const corePool = ranked.filter(candidate => !candidate.isExploration &&
      (candidate.scoreParts.trendScore > 0 || candidate.scoreParts.recentPopularity > 0.48));
    while (selected.length < coreCount && pushBest(corePool.length ? corePool : ranked)) {}

    const explorationPool = ranked.filter(candidate => candidate.isExploration || candidate.scoreParts.discoveryValue >= 0.62);
    while (selected.length < cardCount && pushBest(explorationPool.length ? explorationPool : ranked, true)) {}
    while (selected.length < cardCount && pushBest(ranked)) {}
    return selected;
  }

  function getRadioSupportingArtists(primary, ranked, relationships, supportUseCounts, recentSupportKeys) {
    const candidates = ranked.filter(candidate => candidate.key !== primary.key)
      .map(candidate => ({
        candidate,
        similarity: radioArtistSimilarity(primary, candidate, relationships)
      }));
    const companions = [];
    const companionKeys = new Set();
    const scoreCandidate = item => {
      const uses = supportUseCounts.get(item.candidate.key) || 0;
      const recentPenalty = recentSupportKeys.includes(item.candidate.key) ? 0.24 : 0;
      return item.similarity * 0.78 + item.candidate.relevanceScore * 0.22 - Math.min(0.36, uses * 0.12) - recentPenalty;
    };
    const selectFrom = (pool, { maxUses = Infinity, avoidRecent = false } = {}) => {
      const choices = pool
        .filter(item => !companionKeys.has(item.candidate.key))
        .filter(item => (supportUseCounts.get(item.candidate.key) || 0) < maxUses)
        .filter(item => !avoidRecent || !recentSupportKeys.includes(item.candidate.key))
        .sort((a, b) => scoreCandidate(b) - scoreCandidate(a) || a.candidate.name.localeCompare(b.candidate.name));
      for (const item of choices) {
        if (companions.length >= 2) break;
        companions.push(item);
        companionKeys.add(item.candidate.key);
      }
    };

    const related = candidates.filter(item => item.similarity >= 0.035);
    // Prefer strong, not recently repeated links, then refill from current chart artists
    // so every radio card can show a full three-artist collage.
    selectFrom(related, { maxUses: 1, avoidRecent: true });
    selectFrom(related, { maxUses: 2, avoidRecent: true });
    selectFrom(candidates.filter(item => item.candidate.chartTrackCount > 0), { maxUses: 2, avoidRecent: true });
    selectFrom(candidates, { maxUses: 3, avoidRecent: true });
    selectFrom(candidates, { maxUses: Infinity });
    companions.forEach(item => supportUseCounts.set(item.candidate.key, (supportUseCounts.get(item.candidate.key) || 0) + 1));
    return companions;
  }

  const radioArtistArtworkCache = new Map();
  const radioArtistArtworkPending = new Set();
  const radioArtistArtworkAttemptAt = new Map();
  const radioArtistArtworkFailed = new Set();
  const radioArtistArtworkRequests = new Set();
  let radioArtworkRenderGeneration = 0;

  async function requestRadioArtistArtwork(candidates) {
    const now = Date.now();
    const requested = new Map();
    (candidates || []).forEach(candidate => {
      const key = candidate?.key || normalizeDiscoverArtist(candidate?.name);
      if (!key || radioArtistArtworkFailed.has(key) || getRadioCandidateThumbnail(candidate) || radioArtistArtworkPending.has(key)) return;
      if (radioArtistArtworkCache.has(key) && now - (radioArtistArtworkAttemptAt.get(key) || 0) < 10 * 60 * 1000) return;
      if (now - (radioArtistArtworkAttemptAt.get(key) || 0) < 5 * 60 * 1000) return;
      radioArtistArtworkCache.delete(key);
      requested.set(key, String(candidate?.name || '').trim());
    });

    const batch = [...requested].filter(([, name]) => name).slice(0, 48);
    if (!batch.length) {
      await Promise.all([...radioArtistArtworkRequests]);
      return;
    }
    batch.forEach(([key]) => {
      radioArtistArtworkPending.add(key);
      radioArtistArtworkAttemptAt.set(key, now);
    });

    const request = (async () => {
      try {
        const response = await fetch('/api/artist-artwork/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ artists: batch.map(([, name]) => name) })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = await response.json();
        if (!payload?.success || !Array.isArray(payload.artists)) return;
        const results = new Map(payload.artists.map(item => [
          normalizeDiscoverArtist(item?.name),
          isYoutubeArtworkUrl(item?.artistThumbnail) ? String(item.artistThumbnail) : ''
        ]));
        batch.forEach(([key]) => {
          if (results.has(key)) radioArtistArtworkCache.set(key, results.get(key));
        });
      } catch (_) {
        // Keep the existing image-backed candidates visible when lookup is unavailable.
      } finally {
        batch.forEach(([key]) => radioArtistArtworkPending.delete(key));
      }
    })();
    radioArtistArtworkRequests.add(request);
    try {
      await request;
    } finally {
      radioArtistArtworkRequests.delete(request);
    }
  }

  function getRadioCandidateArtworkData(candidate) {
    const artistKey = candidate?.key || normalizeDiscoverArtist(candidate?.name);
    const metadataTrack = (candidate?.tracks || []).find(item => {
      if (!item.track?.artistThumbnail) return false;
      const primaryArtist = normalizeDiscoverArtist(item.track.primaryArtist || item.track.artist || item.track.artists?.[0]);
      return primaryArtist === artistKey;
    });
    return {
      kind: 'artist',
      artist: candidate?.name || '',
      primaryArtist: candidate?.name || '',
      artistId: candidate?.artistId || '',
      artistThumbnail: metadataTrack?.track?.artistThumbnail || '',
      source: metadataTrack?.track?.source || 'youtube-music',
      sourceThumbnail: ''
    };
  }

  function getRadioCandidateThumbnail(candidate) {
    const artworkData = getRadioCandidateArtworkData(candidate);
    const resolved = getResolvedDiscoverArtwork('artist', artworkData);
    const artistKey = candidate?.key || normalizeDiscoverArtist(candidate?.name);
    if (radioArtistArtworkFailed.has(artistKey)) return '';
    const thumbnail = resolved?.artistThumbnail || resolved?.thumbnail || radioArtistArtworkCache.get(artistKey) || '';
    return thumbnail ? upgradeThumbnailUrl(thumbnail) : '';
  }

  function logRadioRecommendationDiagnostics(pipeline, selected, cardData) {
    const artworkSnapshot = cardData.map(card => {
      const faces = [card.supports[0]?.candidate, card.primary, card.supports[1]?.candidate].filter(Boolean);
      return faces.map(candidate => getResolvedDiscoverArtwork('artist', getRadioCandidateArtworkData(candidate)).artworkSource).join(',');
    }).join('|');
    const diagnosticSnapshot = `${pipeline.snapshot}|${artworkSnapshot}`;
    if (diagnosticSnapshot === lastRadioDiagnosticsSnapshot) return;
    lastRadioDiagnosticsSnapshot = diagnosticSnapshot;
    const uniquePrimaryArtists = new Set(cardData.map(card => card.primary.key)).size;
    const duplicateCards = new Set();
    let duplicateCardCount = 0;
    const genreDistribution = {};
    cardData.forEach(card => {
      const clusterKey = `${card.primary.key}|${card.supports.map(item => item.candidate.key).sort().join(',')}`;
      if (duplicateCards.has(clusterKey)) duplicateCardCount++;
      duplicateCards.add(clusterKey);
      const genre = card.primary.genres[0] || 'chưa phân loại';
      genreDistribution[genre] = (genreDistribution[genre] || 0) + 1;
    });
    const finalCards = selected.map((selection, index) => {
      const card = cardData.find(entry => entry.primary.key === selection.candidate.key) || { supports: [] };
      return {
        section: 'Radio phổ biến',
        title: selection.candidate.name,
        artist: selection.candidate.name,
        album: '',
        source: [...new Set(selection.candidate.tracks.map(item => item.track?.source || item.source || 'unknown'))].join('+'),
        rankingScore: Number(selection.finalScore.toFixed(3)),
        artistId: selection.candidate.artistId || '',
        albumId: '',
        artworkSource: getResolvedDiscoverArtwork('artist', getRadioCandidateArtworkData(selection.candidate)).artworkSource,
        supportingArtworkSources: card.supports.map(item =>
          getResolvedDiscoverArtwork('artist', getRadioCandidateArtworkData(item.candidate)).artworkSource
        ),
        primaryArtist: selection.candidate.name,
        genre: selection.candidate.genres[0] || 'chưa phân loại',
        trendScore: Number(selection.candidate.scoreParts.trendScore.toFixed(3)),
        similarityScore: Number(selection.similarityScore.toFixed(3)),
        finalScore: Number(selection.finalScore.toFixed(3)),
        supportingArtists: card.supports.map(item => item.candidate.name)
      };
    });
    console.info('[Radio Phổ Biến] CANDIDATES → RANKED → DIVERSITY → FINAL', JSON.stringify({
      sources: pipeline.sourceCounts,
      rawCandidateTracks: pipeline.rawCandidateTracks,
      uniqueArtistCandidates: pipeline.ranked.length,
      rankedCandidates: pipeline.ranked.slice(0, 15).map(candidate => ({
        artist: candidate.name,
        score: Number(candidate.relevanceScore.toFixed(3)),
        ...Object.fromEntries(Object.entries(candidate.scoreParts).map(([key, value]) => [key, Number(value.toFixed(3))]))
      })),
      finalCards,
      metrics: {
        uniquePrimaryArtists,
        artistRepeatRate: cardData.length ? Number((1 - uniquePrimaryArtists / cardData.length).toFixed(3)) : 0,
        genreDistribution,
        duplicateCardRate: cardData.length ? Number((duplicateCardCount / cardData.length).toFixed(3)) : 0
      }
    }));
  }

  function renderDiscoverRadioCards(pipeline) {
    const selected = selectDiverseRadioArtists(pipeline.ranked, pipeline.relationships, pipeline.snapshot);
    const supportUseCounts = new Map();
    const recentSupportKeys = [];
    const cardData = selected.map(selection => {
      const primary = selection.candidate;
      const supports = getRadioSupportingArtists(primary, pipeline.ranked, pipeline.relationships,
        supportUseCounts, recentSupportKeys);
      supports.forEach(item => {
        recentSupportKeys.push(item.candidate.key);
        if (recentSupportKeys.length > 4) recentSupportKeys.shift();
      });
      return { primary, supports };
    });
    const clusteredCardData = cardData.filter(card => card.supports.length > 0);
    const finalCardData = clusteredCardData.length >= 8 ? clusteredCardData : cardData;
    const finalSelected = selected.filter((_, index) => finalCardData.includes(cardData[index]));
    logRadioRecommendationDiagnostics(pipeline, finalSelected, finalCardData);
    if (dom.discoverRadioCaption) {
      dom.discoverRadioCaption.textContent = 'Chỉ nghệ sĩ trong bảng xếp hạng khu vực đã chọn, sắp xếp theo gu nghe của bạn.';
    }
    dom.discoverRadioRow.removeAttribute('aria-busy');
    dom.discoverRadioRow.innerHTML = '';
    finalCardData.forEach(({ primary, supports }, index) => {
      const faces = [supports[0]?.candidate, primary, supports[1]?.candidate]
        .filter(Boolean);
      const companions = supports.map(item => item.candidate.name);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `discover-radio-card discover-radio-tone-${index % 5}`;
      card.setAttribute('aria-label', `Phát radio phổ biến của ${primary.name}`);
      card.innerHTML = `
        <span class="discover-radio-art" aria-hidden="true">
          <span class="discover-radio-mark">RADIO</span>
          <span class="discover-radio-collage">
            ${faces.map((artist, imageIndex) => {
              const imageUrl = getRadioCandidateThumbnail(artist);
              const faceClass = `discover-radio-face discover-radio-face-${imageIndex + 1}`;
              return imageUrl
                ? `<img class="${faceClass}" data-radio-artist-key="${escapeHtml(artist.key || normalizeDiscoverArtist(artist.name))}" src="${escapeHtml(imageUrl)}" alt="" loading="lazy">`
                : `<span class="${faceClass} discover-radio-monogram">${escapeHtml(getRadioArtistInitials(artist))}</span>`;
            }).join('')}
          </span>
          <strong>${escapeHtml(primary.name)}</strong>
        </span>
        <span class="discover-card-copy">Cùng xu hướng: ${escapeHtml(companions.join(', ') || primary.genres.slice(0, 2).join(', ') || 'nhạc mới trong khu vực')}</span>
      `;
      card.querySelectorAll('img.discover-radio-face').forEach(image => {
        image.addEventListener('error', () => {
          const key = image.dataset.radioArtistKey;
          if (!key) return;
          radioArtistArtworkFailed.add(key);
          radioArtistArtworkCache.set(key, '');
          const monogram = document.createElement('span');
          monogram.className = `${image.className} discover-radio-monogram`;
          monogram.textContent = getRadioArtistInitials(faces[imageIndex]);
          image.replaceWith(monogram);
        }, { once: true });
      });
      card.addEventListener('click', () => startDiscoverRadio(
        primary,
        supports.map(item => item.candidate)
      ));
      const cardShell = document.createElement('div');
      cardShell.className = 'discover-radio-card-shell';
      cardShell.appendChild(card);
      dom.discoverRadioRow.appendChild(cardShell);
    });
  }

  async function renderDiscoverRadioRow() {
    if (!dom.discoverRadioRow) return;
    const generation = ++radioArtworkRenderGeneration;
    const pipeline = buildRadioRecommendationCandidates();
    if (!pipeline.ranked.length) {
      dom.discoverRadioRow.removeAttribute('aria-busy');
      dom.discoverRadioRow.innerHTML = `<span class="discover-radio-status" role="status">${state.trendingTracks?.length
        ? 'Chưa có tên nghệ sĩ phù hợp trong bảng xếp hạng khu vực.'
        : 'Đang tải nghệ sĩ trong bảng xếp hạng khu vực…'}</span>`;
      return;
    }

    const targetArtworkCount = Math.min(36, pipeline.ranked.length);
    const scanLimit = Math.min(192, pipeline.ranked.length);
    let artistsWithArtwork = pipeline.ranked.filter(candidate => getRadioCandidateThumbnail(candidate));

    // Show the chart artists immediately. Portrait lookup must never hide the radios.
    renderDiscoverRadioCards(pipeline);

    for (let offset = 0; offset < scanLimit && artistsWithArtwork.length < targetArtworkCount; offset += 48) {
      if (generation !== radioArtworkRenderGeneration) return;
      await requestRadioArtistArtwork(pipeline.ranked.slice(offset, offset + 48));
      if (generation !== radioArtworkRenderGeneration) return;
      artistsWithArtwork = pipeline.ranked.filter(candidate => getRadioCandidateThumbnail(candidate));
      renderDiscoverRadioCards(pipeline);
    }

    if (generation !== radioArtworkRenderGeneration) return;
    renderDiscoverRadioCards(pipeline);
  }

  function renderDiscoverRecentList() {
    if (!dom.discoverRecentList) return;
    const tracks = getStartListeningCandidates();
    dom.discoverRecentList.innerHTML = '';
    if (dom.discoverRecentCaption) {
      const hasQualifiedListening = (state.recommendationHistory?.listens || []).length > 0;
      dom.discoverRecentCaption.textContent = hasQualifiedListening
        ? 'Tiếp tục từ những bài bạn vừa nghe trên thiết bị này'
        : (state.favorites.length ? 'Bắt đầu từ các bài bạn đã lưu yêu thích' : 'Bắt đầu với những bài đang đứng đầu bảng khu vực');
    }

    tracks.forEach(track => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'discover-recent-track';
      item.setAttribute('aria-label', `Phát ${track.title} của ${track.artist || 'nghệ sĩ chưa rõ'}`);
      item.innerHTML = `
        <img src="${escapeHtml(upgradeThumbnailUrl(track.thumbnail) || 'wood_2.jpg')}" alt="" loading="lazy">
        <span class="discover-recent-copy"><strong>${escapeHtml(track.title || 'Bài hát')}</strong><span>${escapeHtml(track.artist || 'Nghệ sĩ')}</span></span>
        <span class="discover-recent-play" aria-hidden="true">▶</span>
      `;
      item.addEventListener('click', () => playTrack(track, true));
      dom.discoverRecentList.appendChild(item);
    });
  }

  function renderDiscoverChartCards() {
    if (!dom.discoverChartRow) return;
    const currentRegionTracks = state.trendingTracks || [];
    const regionLabel = state.selectedCountryName || state.selectedCountry || 'Khu vực';
    const timeframeLabel = state.currentTimeframe === 'weekly' ? 'tuần này' : 'hôm nay';
    const charts = [];
    if (currentRegionTracks.length) {
      charts.push({
        title: `Top ${Math.min(50, currentRegionTracks.length)} • ${regionLabel}`,
        detail: `Thứ hạng YouTube Music ${timeframeLabel}`,
        tracks: currentRegionTracks,
        tone: 'local'
      });
    }
    dom.discoverChartRow.innerHTML = '';
    charts.forEach(chart => {
      const topTrack = chart.tracks[0];
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `discover-chart-card discover-chart-${chart.tone}`;
      card.setAttribute('aria-label', `Phát bảng xếp hạng ${chart.title}`);
      card.innerHTML = `
        <span class="discover-chart-art" style="--chart-cover:url('${escapeHtml(upgradeThumbnailUrl(topTrack?.thumbnail) || 'wood_2.jpg')}')">
          <span class="discover-chart-brand">HOME MUSIC CHARTS</span>
          <strong>TOP ${Math.min(50, chart.tracks.length)}</strong>
          <span class="discover-chart-region">${escapeHtml(chart.tone === 'global' ? 'GLOBAL' : regionLabel.toLocaleUpperCase())}</span>
          <span class="discover-chart-play" aria-hidden="true">▶</span>
        </span>
        <span class="discover-card-copy"><strong>${escapeHtml(chart.title)}</strong><span>${escapeHtml(chart.detail)} · ${chart.tracks.length} bài</span></span>
      `;
      card.addEventListener('click', () => playDiscoverChart(chart.tracks, chart.title));
      dom.discoverChartRow.appendChild(card);
    });
  }

  function renderDiscoverAlbumRow() {
    if (!dom.discoverAlbumRow) return;
    const exposure = getHomeArtistExposure(false);
    const rankedAlbums = (state.homeAlbums || []).map((album, index) => {
      const artistKey = normalizeDiscoverArtist(album.artist);
      const year = Number.parseInt(album.year, 10) || 0;
      const freshness = year ? Math.max(0, Math.min(12, (year - 2020) * 1.5 + 2)) : 0;
      return { album, score: (20 - index) + freshness - (exposure.get(artistKey) || 0) * 7 };
    }).sort((a, b) => b.score - a.score || (Number.parseInt(b.album.year, 10) || 0) - (Number.parseInt(a.album.year, 10) || 0));
    const seenAlbumArtists = new Set();
    const seenReleases = new Set();
    const albums = rankedAlbums.filter(({ album }) => {
      const releaseKey = String(album.releaseId || album.albumId || album.id || `${album.title}|${album.artist}`);
      if (seenReleases.has(releaseKey)) return false;
      seenReleases.add(releaseKey);
      const artistKey = normalizeDiscoverArtist(album.artist) || `album:${releaseKey}`;
      if (seenAlbumArtists.has(artistKey)) return false;
      seenAlbumArtists.add(artistKey);
      return true;
    }).slice(0, 10).map(entry => entry.album);
    const artworkRequests = albums.map(album => ({
      kind: 'release',
      id: album.id,
      title: album.title,
      artist: album.artist,
      primaryArtist: album.artist,
      source: album.source || 'youtube-music',
      albumId: album.albumId || album.id,
      releaseId: album.releaseId || '',
      thumbnail: album.albumThumbnail || album.thumbnail || '',
      sourceThumbnail: album.sourceThumbnail || album.thumbnail || ''
    }));
    console.info('[Discovery items]', JSON.stringify(albums.map(album => {
      const artworkData = artworkRequests.find(item => String(item.albumId || item.id) === String(album.albumId || album.id));
      const artwork = getResolvedDiscoverArtwork('release', artworkData || album);
      return {
        section: 'Album và đĩa đơn phổ biến',
        title: album.title || '',
        artist: album.artist || '',
        album: album.title || '',
        source: album.source || 'youtube-music',
        rankingScore: Number(rankedAlbums.find(entry => entry.album === album)?.score || 0),
        artistId: album.artistId || '',
        albumId: album.albumId || album.id || '',
        artworkSource: artwork?.artworkSource || (album.thumbnail && !String(album.thumbnail).endsWith('wood_2.jpg') ? 'youtube-music' : 'pending')
      };
    })));
    dom.discoverAlbumRow.innerHTML = '';
    albums.forEach(album => {
      const artworkData = artworkRequests.find(item => String(item.albumId || item.id) === String(album.albumId || album.id));
      const artwork = getResolvedDiscoverArtwork('release', artworkData || album);
      const imageUrl = artwork?.thumbnail || 'wood_2.jpg';
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'discover-album-card';
      card.setAttribute('aria-label', `Mở ${album.type || 'album'} ${album.title} của ${album.artist || 'nghệ sĩ'}`);
      card.innerHTML = `
        <img class="discover-square-art" src="${escapeHtml(upgradeThumbnailUrl(imageUrl) || 'wood_2.jpg')}" alt="" loading="lazy">
        <strong>${escapeHtml(album.title || 'Album')}</strong>
        <span>${escapeHtml(album.artist || 'Nghệ sĩ')}</span>
      `;
      card.querySelector('.discover-square-art')?.addEventListener('error', event => {
        event.currentTarget.src = 'wood_2.jpg';
      }, { once: true });
      card.addEventListener('click', () => {
        switchTab('playlists');
        dom.albumDetailView?.classList.add('hidden');
        dom.albumsMainView?.classList.remove('hidden');
        openAlbumDetailView(album.id, album);
      });
      dom.discoverAlbumRow.appendChild(card);
    });
  }

  function renderDiscoverArtistRow() {
    if (!dom.discoverArtistRow) return;
    const isVietnamWave = state.selectedCountry === 'VN';
    const exposure = getHomeArtistExposure(false);
    const artists = getDiscoverArtistRankings().map(artist => ({
      ...artist,
      adjustedScore: artist.score - (exposure.get(normalizeDiscoverArtist(artist.name)) || 0) * 9
    })).sort((a, b) => b.adjustedScore - a.adjustedScore || a.name.localeCompare(b.name)).slice(0, 24);
    const artworkRequests = artists.map(artist => {
      return {
        kind: 'artist',
        artist: artist.name,
        primaryArtist: artist.name,
        artistId: artist.artistId || '',
        artistThumbnail: artist.artistThumbnail || '',
        source: 'youtube-music',
        sourceThumbnail: ''
      };
    });
    console.info('[Discovery items]', JSON.stringify(artists.map((artist, index) => {
      const artworkData = artworkRequests[index];
      const artwork = getResolvedDiscoverArtwork('artist', artworkData);
      return {
        section: 'Nghệ sĩ phổ biến',
        title: artist.name,
        artist: artist.name,
        album: '',
        source: [...new Set(artist.tracks.map(track => track.source || 'youtube-music'))].join('+'),
        rankingScore: Number(artist.adjustedScore.toFixed(3)),
        artistId: artwork?.artistId || artworkData.artistId || '',
        albumId: '',
        artworkSource: artwork.artworkSource
      };
    })));
    if (dom.discoverArtistsTitle) {
      dom.discoverArtistsTitle.textContent = isVietnamWave ? 'Gương mặt V-Pop thế hệ mới' : 'Nghệ sĩ phổ biến';
    }
    if (dom.discoverArtistsCaption) {
      dom.discoverArtistsCaption.textContent = isVietnamWave
        ? 'Gương mặt nổi bật qua bảng khu vực, đĩa gần đây và lượt nghe thực tế'
        : 'Nghệ sĩ nổi bật theo bảng khu vực, đĩa gần đây và lượt nghe thực tế';
    }
    dom.discoverArtistRow.innerHTML = '';
    artists.forEach((artist, index) => {
      const artworkData = artworkRequests[index];
      const artwork = getResolvedDiscoverArtwork('artist', artworkData);
      const portrait = artwork?.artistThumbnail || artwork?.thumbnail || '';
      const initials = artist.name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toLocaleUpperCase();
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `discover-artist-card discover-artist-tone-${index % 6}`;
      card.setAttribute('aria-label', `Mở radio của ${artist.name}`);
      card.innerHTML = `
        <span class="discover-artist-avatar" aria-hidden="true">
          ${portrait ? `<img src="${escapeHtml(upgradeThumbnailUrl(portrait))}" alt="" loading="lazy">` : `<span class="discover-artist-monogram">${escapeHtml(initials || '♪')}</span>`}
          <span class="discover-artist-rank">${String(index + 1).padStart(2, '0')}</span>
          <svg class="discover-artist-sprout" viewBox="0 0 32 32" focusable="false"><path d="M15.8 25.8c.2-6.1 2.8-11.4 8.7-15.2-.4 6.5-3.7 11.6-8.7 15.2Z"/><path d="M15.8 25.8C14 20 10.5 16.7 5 15.3c.4 5.4 4.4 9.4 10.8 10.5ZM15.8 26V9.5"/></svg>
        </span>
        <span class="discover-artist-copy"><strong>${escapeHtml(artist.name)}</strong><span>${escapeHtml(artist.recentAlbumYear ? `Đĩa phát hành ${artist.recentAlbumYear}` : 'Đang thịnh hành')}</span></span>
      `;
      if (portrait) {
        const portraitImage = card.querySelector('.discover-artist-avatar > img');
        portraitImage?.addEventListener('error', () => {
          const monogram = document.createElement('span');
          monogram.className = 'discover-artist-monogram';
          monogram.textContent = initials || '♪';
          portraitImage.replaceWith(monogram);
        }, { once: true });
      }
      card.addEventListener('click', () => startDiscoverRadio(artist));
      dom.discoverArtistRow.appendChild(card);
    });
  }

  function renderDiscoverForYouRow() {
    if (!dom.discoverForYouRow) return;
    const profile = getRecommendationTasteProfile();
    const exposure = getHomeArtistExposure(true);
    const candidateMap = new Map();
    const startListeningIds = new Set(getStartListeningCandidates().slice(0, 5).map(track => String(track.id)));
    const addCandidate = (track, source) => {
      if (!track?.id) return;
      const id = String(track.id);
      if (profile.likedSongIds.has(id) || startListeningIds.has(id)) return;
      const existing = candidateMap.get(id);
      if (!existing) candidateMap.set(id, { track, source });
    };

    // Personal taste ranks tracks from the selected country's chart only.
    (state.trendingTracks || []).forEach(track => addCandidate(track, 'regional-chart'));
    const candidates = [...candidateMap.values()].map(({ track, source }) => ({
      track,
      score: scorePersonalRecommendation(track, source, profile, exposure),
      source
    })).sort((a, b) => b.score - a.score);
    const recommendations = diversifyRankedCandidates(candidates, 8, 2);

    console.info('[Discovery items]', JSON.stringify(recommendations.map(track => ({
      section: 'Dành riêng cho bạn',
      title: track.title || '',
      artist: track.primaryArtist || track.artist || '',
      album: track.album || '',
      source: track.source || 'youtube-music',
      recommendationSource: 'regional-chart',
      rankingScore: Number(scorePersonalRecommendation(track, 'regional-chart', profile, exposure).toFixed(3)),
      artistId: track.artistId || '',
      albumId: track.albumId || track.releaseId || '',
      artworkSource: track.thumbnail && !String(track.thumbnail).endsWith('wood_2.jpg')
        ? (track.source || 'music-source-thumbnail')
        : 'neutral-fallback'
    }))));

    dom.discoverForYouRow.innerHTML = '';
    recommendations.forEach(track => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'discover-track-card';
      card.setAttribute('aria-label', `Phát gợi ý ${track.title} của ${track.artist || 'nghệ sĩ'}`);
      card.innerHTML = `
        <span class="discover-track-art-wrap"><img class="discover-square-art" src="${escapeHtml(upgradeThumbnailUrl(track.thumbnail) || 'wood_2.jpg')}" alt="" loading="lazy"><span class="discover-track-play" aria-hidden="true">▶</span></span>
        <strong>${escapeHtml(track.title || 'Bài hát')}</strong>
        <span>${escapeHtml(track.artist || 'Nghệ sĩ')}</span>
      `;
      card.addEventListener('click', () => playTrack(track, true));
      dom.discoverForYouRow.appendChild(card);
    });
    if (dom.discoverForYouCaption) {
      const hasTasteSignals = profile.favoriteArtists.size || profile.listenedTracks.length || profile.discoveryArtistScores.size;
      const region = state.selectedCountryName || 'khu vực của bạn';
      dom.discoverForYouCaption.textContent = hasTasteSignals
        ? `Bài trong bảng xếp hạng ${region}, sắp xếp theo gu nghe của bạn.`
        : `Đang khám phá nhạc trong bảng xếp hạng ${region}.`;
    }
  }

  function refreshDiscoverSections() {
    renderDiscoverRadioRow();
    renderDiscoverRecentList();
    renderDiscoverChartCards();
    renderDiscoverAlbumRow();
    renderDiscoverArtistRow();
    renderDiscoverForYouRow();
    refreshPersonalizedCandidates();
  }

  function serializeRecommendationTrack(track) {
    return {
      id: String(track?.id || ''),
      source: String(track?.source || 'unknown'),
      videoId: String(track?.videoId || track?.originalVideoId || ''),
      title: String(track?.title || 'Bài hát'),
      artist: String(track?.artist || ''),
      artists: Array.isArray(track?.artists) ? track.artists.slice(0, 8) : [],
      primaryArtist: String(track?.primaryArtist || track?.artist || ''),
      artistId: String(track?.artistId || ''),
      album: String(track?.album || ''),
      albumId: String(track?.albumId || ''),
      releaseId: String(track?.releaseId || ''),
      duration: String(track?.duration || ''),
      durationSec: Number(track?.durationSec) || 0,
      genre: String(track?.genre || ''),
      genres: Array.isArray(track?.genres) ? track.genres.slice(0, 8) : [],
      thumbnail: String(track?.thumbnail || ''),
      artistThumbnail: String(track?.artistThumbnail || ''),
      popularity: Number(track?.popularity || 0),
      publishedAt: String(track?.publishedAt || '')
    };
  }

  function saveRecommendationHistory() {
    state.recommendationHistory.listens = (state.recommendationHistory.listens || []).slice(-200);
    state.recommendationHistory.skips = (state.recommendationHistory.skips || []).slice(-100);
    state.recommendationHistory.discovery = (state.recommendationHistory.discovery || []).slice(-80);
    try { localStorage.setItem('ghibli_recommendation_history', JSON.stringify(state.recommendationHistory)); } catch (_) {}
  }

  function rememberRecentlyPlayed(track) {
    const recentTrack = serializeRecommendationTrack(track);
    const qualifiedTrackIds = new Set(state.recommendationHistory.listens.map(event => String(event.track?.id || '')));
    state.recentTracks = [recentTrack, ...state.recentTracks.filter(item =>
      String(item.id) !== recentTrack.id && qualifiedTrackIds.has(String(item.id)))].slice(0, 12);
    try { localStorage.setItem('ghibli_recent_tracks', JSON.stringify(state.recentTracks)); } catch (_) {}
    renderDiscoverRecentList();
    renderDiscoverForYouRow();
  }

  let recommendationPlaybackSession = null;

  function persistQualifiedListen(session, completed = false) {
    if (!session?.track?.id) return;
    const eventId = session.eventId;
    const existingIndex = state.recommendationHistory.listens.findIndex(event => event.eventId === eventId);
    const event = {
      eventId,
      track: serializeRecommendationTrack(session.track),
      listenedSeconds: Math.round(session.listenedSeconds * 10) / 10,
      durationSec: Number(session.track.durationSec) || 0,
      playedAt: session.qualifiedAt || Date.now(),
      completed: !!completed
    };
    if (existingIndex >= 0) state.recommendationHistory.listens[existingIndex] = event;
    else state.recommendationHistory.listens.push(event);
    state.recommendationHistory.skips = state.recommendationHistory.skips.filter(skip => String(skip.track?.id) !== String(session.track.id));
    saveRecommendationHistory();
    if (!session.qualified) {
      session.qualified = true;
      rememberRecentlyPlayed(session.track);
      refreshPersonalizedCandidates();
    }
    renderDiscoverForYouRow();
  }

  function finishRecommendationPlayback(completed = false) {
    const session = recommendationPlaybackSession;
    if (!session || session.finalized) return;
    session.finalized = true;
    if (completed && !session.qualified) session.qualifiedAt = Date.now();
    const duration = Number(session.track.durationSec) || 0;
    const qualificationThreshold = duration > 0 ? Math.max(5, Math.min(30, duration * 0.5)) : 30;
    if (session.listenedSeconds >= qualificationThreshold) {
      persistQualifiedListen(session, completed);
    }
    if (!completed && session.listenedSeconds >= 5) {
      state.recommendationHistory.skips.push({
        track: serializeRecommendationTrack(session.track),
        skippedAt: Date.now(),
        listenedSeconds: Math.round(session.listenedSeconds * 10) / 10
      });
      saveRecommendationHistory();
      renderDiscoverForYouRow();
    }
    recommendationPlaybackSession = null;
  }

  function beginRecommendationPlaybackSession(track) {
    finishRecommendationPlayback(false);
    recommendationPlaybackSession = {
      eventId: `listen-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      track: serializeRecommendationTrack(track),
      listenedSeconds: 0,
      lastPosition: null,
      lastSampleAt: 0,
      qualified: false,
      qualifiedAt: 0,
      finalized: false
    };
  }

  function updateRecommendationListeningProgress() {
    const session = recommendationPlaybackSession;
    if (!session || session.finalized || !state.isPlaying || !state.currentTrack || String(state.currentTrack.id) !== session.track.id) {
      if (session) {
        session.lastPosition = null;
        session.lastSampleAt = 0;
      }
      return;
    }

    const position = Number(getCurrentAudioTime());
    if (!Number.isFinite(position) || position < 0) return;
    const now = Date.now();
    if (session.lastPosition !== null && session.lastSampleAt) {
      const delta = position - session.lastPosition;
      const wallSeconds = Math.max(0, Math.min(4, (now - session.lastSampleAt) / 1000));
      if (delta > 0 && delta <= Math.max(1.5, wallSeconds * 2.75) && delta <= 4) {
        session.listenedSeconds += Math.min(delta, Math.max(0.5, wallSeconds * 1.7));
      }
    }
    session.lastPosition = position;
    session.lastSampleAt = now;

    const duration = Number(session.track.durationSec) || 0;
    const threshold = duration > 0 ? Math.max(5, Math.min(30, duration * 0.5)) : 30;
    if (!session.qualified && session.listenedSeconds >= threshold) {
      session.qualifiedAt = now;
      persistQualifiedListen(session, false);
    } else if (session.qualified && session.listenedSeconds - (session.lastPersistedSeconds || 0) >= 25) {
      session.lastPersistedSeconds = session.listenedSeconds;
      persistQualifiedListen(session, false);
    }
  }

  function recordDiscoverArtistIntent(artistName) {
    if (!artistName) return;
    state.recommendationHistory.discovery.push({ artist: String(artistName), at: Date.now() });
    saveRecommendationHistory();
    refreshPersonalizedCandidates();
    renderDiscoverForYouRow();
  }

  function startDiscoverRadio(primaryCandidate, relatedCandidates = []) {
    const candidates = [primaryCandidate, ...relatedCandidates].filter(Boolean);
    const artistName = typeof primaryCandidate === 'string'
      ? primaryCandidate
      : String(primaryCandidate?.name || 'nghệ sĩ');
    const candidateTrackIds = new Set(candidates.flatMap(candidate =>
      (candidate.tracks || []).map(entry => String(entry?.track?.id || entry?.id || '')).filter(Boolean)
    ));
    const artistKeys = new Set(candidates.map(candidate => normalizeDiscoverArtist(
      typeof candidate === 'string' ? candidate : candidate.name
    )).filter(Boolean));
    const seenTrackIds = new Set();
    const regionalTracks = state.trendingTracks || [];
    const matchingTracks = regionalTracks.filter(track => {
      const id = String(track?.id || '');
      if (!id || seenTrackIds.has(id)) return false;
      const selectedOnCard = candidateTrackIds.has(id);
      const matchesArtist = artistKeys.size && getRadioArtistNames(track)
        .some(name => artistKeys.has(normalizeDiscoverArtist(name)));
      if (!selectedOnCard && !matchesArtist) return false;
      seenTrackIds.add(id);
      return true;
    });
    const radioTracks = matchingTracks.slice(0, 25);

    if (!radioTracks.length) {
      showToast(`Tab ${state.selectedCountryName || 'khu vực này'} hiện chưa có bài phù hợp để tạo danh sách.`);
      return;
    }

    state.queue = radioTracks;
    state.queueIndex = 0;

    let playbackError = null;
    try {
      playTrack(radioTracks[0], false);
    } catch (error) {
      playbackError = error;
      console.warn('[Discover radio playback error]:', error);
    }

    renderQueueDrawer();
    if (dom.playlistDrawer) dom.playlistDrawer.classList.remove('hidden');

    try {
      recordDiscoverArtistIntent(artistName);
    } catch (historyError) {
      console.warn('[Discover radio history warning]:', historyError);
    }

    showToast(playbackError
      ? `Đã tạo danh sách ${radioTracks.length} bài; chưa phát được bài đầu tiên.`
      : `Đã tạo danh sách ${radioTracks.length} bài cho ${artistName}.`);
  }

  function playDiscoverChart(tracks, chartTitle) {
    if (!tracks?.length) return;
    state.queue = [...tracks];
    state.queueIndex = 0;
    renderQueueDrawer();
    playTrack(state.queue[0], false);
    showToast(`Đang phát ${chartTitle} theo thứ hạng bảng nhạc.`);
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
          duration: trackInfo.duration ? (typeof trackInfo.duration === 'string' && trackInfo.duration.includes(':') ? trackInfo.duration : formatTime(trackInfo.duration)) : '3:30',
          durationSec: trackInfo.durationSec || parseDurationToSec(trackInfo.duration) || 210,
          thumbnail: trackInfo.thumbnail || 'wood_2.jpg'
        });
      } catch {
        playTrack({
          id: videoId,
          title: 'YouTube Audio Track',
          artist: 'YouTube Stream',
          duration: '3:30',
          durationSec: 210,
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
            <span class="empty-icon">${GhibliIcons.autumnLeaf}</span>
            <h3>Không tìm thấy bài hát nào cho "${escapeHtml(q)}"</h3>
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
        if (!q) {
          state.homeAlbums = data.albums;
          renderDiscoverAlbumRow();
          renderDiscoverRadioRow();
          renderDiscoverArtistRow();
        }

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
        if (!q) {
          state.homeAlbums = [];
          renderDiscoverAlbumRow();
          renderDiscoverRadioRow();
          renderDiscoverArtistRow();
        }
        dom.albumsGrid.innerHTML = '';
        if (dom.albumsEmptyState) {
          dom.albumsEmptyState.classList.remove('hidden');
          dom.albumsEmptyState.innerHTML = `
            <span class="empty-icon">${GhibliIcons.vinylGroove}</span>
            <h3>Không tìm thấy EP hay Album nào cho "${escapeHtml(q || country)}"</h3>
            <p>Hãy thử tìm bằng tên nghệ sĩ khác xem sao nhé!</p>
          `;
        }
      }
    } catch (err) {
      console.error('[Load Albums Error]:', err);
      if (!query.trim()) renderDiscoverAlbumRow();
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

      const title = escapeHtml(album.title || 'Album chưa có tên');
      const artist = escapeHtml(album.artist || 'Nghệ sĩ');
      const thumbnail = escapeHtml(upgradeThumbnailUrl(album.thumbnail) || 'wood_2.jpg');
      const type = escapeHtml(album.type || 'Album');
      const year = escapeHtml(album.year || '');

      card.innerHTML = `
        <div class="album-sleeve-wrap">
          <div class="album-vinyl-disc"></div>
          <img src="${thumbnail}" alt="${title}" class="album-cover-img" loading="lazy" onerror="this.src='wood_2.jpg'">
          <button class="album-play-overlay-btn" title="Phát toàn bộ album">▶</button>
        </div>
        <h3 class="album-card-title" title="${title}">${title}</h3>
        <p class="album-card-artist" title="${artist}">${artist}</p>
        <div class="album-card-footer">
          <span class="album-card-badge">${type}</span>
          <span class="album-card-year">${year}</span>
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
      const title = escapeHtml(track.title || 'Bài hát chưa có tên');
      const artist = escapeHtml(track.artist || '');
      const duration = escapeHtml(track.duration || '3:30');
      if (state.currentTrack && state.currentTrack.id === track.id) {
        row.classList.add('is-active');
      }

      row.innerHTML = `
        <span class="col-num">${idx + 1}</span>
        <div class="col-main">
          <div class="col-title" title="${title}">${title}</div>
          <div class="col-artist" title="${artist}">${artist}</div>
        </div>
        <span class="col-duration">${duration}</span>
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
      const title = escapeHtml(track.title || 'Bài hát chưa có tên');
      const artist = escapeHtml(track.artist || 'Nghệ sĩ');
      const thumbnail = escapeHtml(upgradeThumbnailUrl(track.thumbnail || 'bg.jpg'));
      const duration = escapeHtml(track.duration || '03:30');

      card.innerHTML = `
        <div class="community-card-sleeve">
          <div class="community-card-vinyl"></div>
          <img src="${thumbnail}" alt="${title}" class="community-card-img" loading="lazy" onerror="this.src='bg.jpg'">
          <button class="community-card-play-btn" title="Phát bài này">▶</button>
        </div>
        <h3 class="community-card-title" title="${title}">${title}</h3>
        <p class="community-card-artist" title="${artist}">${artist}</p>
        <div class="community-card-footer">
          <span class="community-card-badge">Community Drop</span>
          <span class="community-card-dur">${duration}</span>
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
          Hàng đợi đang trống ${GhibliIcons.leafSprout}
        </li>
      `;
      return;
    }

    state.queue.forEach((track, idx) => {
      const li = document.createElement('li');
      li.className = `nature-song-card ${track.id === state.currentTrack?.id ? 'active' : ''}`;

      const isAcornChecked = state.customLoopIds.has(track.id);
      const title = escapeHtml(track.title || 'Bài hát chưa có tên');
      const artist = escapeHtml(track.artist || '');
      const duration = escapeHtml(track.duration || '');

      li.innerHTML = `
        <div class="card-left-group">
          <!-- Checkbox Hạt Dẻ -->
          <label class="acorn-checkbox-wrapper" title="Tích để lặp bài này trong chế độ Hạt Dẻ">
            <input type="checkbox" class="acorn-checkbox-input" ${isAcornChecked ? 'checked' : ''}>
            <span class="acorn-checkbox-icon"></span>
          </label>
          <span class="leaf-num-stamp">${idx + 1}</span>
          <div class="card-song-details" title="${title}">
            <span class="card-title">${title}</span>
            <span class="card-subtext">${artist} • ${duration}</span>
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
    if (dom.likeBtn) dom.likeBtn.innerHTML = isFav ? GhibliIcons.leafHeartFilled : GhibliIcons.leafHeartOutline;
    if (dom.sheetLikeBtn) dom.sheetLikeBtn.innerHTML = isFav ? GhibliIcons.leafHeartFilled : GhibliIcons.leafHeartOutline;
    if (dom.stageLikeIcon) dom.stageLikeIcon.innerHTML = isFav ? GhibliIcons.leafHeartFilled : GhibliIcons.leafHeartOutline;
    if (dom.stageLikeText) dom.stageLikeText.textContent = isFav ? 'Đã thích' : 'Yêu thích';
    if (dom.stageLikeBtn) dom.stageLikeBtn.classList.toggle('active', isFav);
  }

  function renderFavorites() {
    if (!dom.favoriteTracksGrid) return;
    refreshPersonalizedCandidates();
    dom.favoriteTracksGrid.innerHTML = '';

    if (state.favorites.length === 0) {
      dom.favoriteTracksGrid.innerHTML = `
        <div class="search-empty-prompt">
          <span class="empty-icon">${GhibliIcons.leafSprout}</span>
          <h3>Chưa có bài hát yêu thích nào</h3>
          <p>Bấm biểu tượng trái tim ${GhibliIcons.leafHeartFilled} ở thanh phát nhạc để lưu vào đây nhé!</p>
        </div>
      `;
      renderDiscoverRadioRow();
      renderDiscoverRecentList();
      renderDiscoverArtistRow();
      renderDiscoverForYouRow();
      return;
    }

    state.favorites.forEach(track => {
      const card = createSongCardElement(track, (t) => {
        playTrack(t, true);
      });
      dom.favoriteTracksGrid.appendChild(card);
    });
    renderDiscoverRadioRow();
    renderDiscoverRecentList();
    renderDiscoverArtistRow();
    renderDiscoverForYouRow();
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

    // YouTube Music chart playlist timeframe switch
    if (dom.timeframeDailyBtn) {
      dom.timeframeDailyBtn.addEventListener('click', () => {
        if (state.currentTimeframe === 'daily') return;
        state.currentTimeframe = 'daily';
        showToast('🔥 Bảng xếp hạng YouTube Music: Hôm Nay');
        loadTrendingMusic(state.selectedCountry, 'daily');
      });
    }

    if (dom.timeframeWeeklyBtn) {
      dom.timeframeWeeklyBtn.addEventListener('click', () => {
        if (state.currentTimeframe === 'weekly') return;
        state.currentTimeframe = 'weekly';
        showToast('📈 Bảng xếp hạng YouTube Music: Tuần Này');
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
          if (dom.searchTypeIcon) dom.searchTypeIcon.innerHTML = GhibliIcons.whiteDove;
        } else {
          if (dom.searchTypeIcon) dom.searchTypeIcon.innerHTML = GhibliIcons.brassLens;
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
        if (state.activeEngine === 'audio' && !state.isScrubbing) {
          const effectiveDuration = getEffectiveAudioDuration();
          if (effectiveDuration > 0) {
            updatePlaybackTimeline(dom.audio.currentTime, effectiveDuration);
            updateMediaSessionPosition(dom.audio.currentTime, effectiveDuration);
            syncLyricsWithTime(dom.audio.currentTime);
          }
        }
      });

      dom.audio.addEventListener('loadedmetadata', () => {
        if (state.activeEngine === 'audio') {
          if (isLyricsContributionEditorOpen()) {
            applyLyricsContributionPlaybackRate(lyricsContributionPlaybackRate, { silent: true });
          }
          const effectiveSec = getEffectiveAudioDuration();
          const formatted = formatTime(effectiveSec);
          updatePlaybackTimeline(dom.audio.currentTime, effectiveSec);
          if (state.currentTrack) {
            state.currentTrack.durationSec = Math.round(effectiveSec);
            state.currentTrack.duration = formatted;
            if (dom.albumDetailTracksList) {
              const matchedRow = dom.albumDetailTracksList.querySelector(`.album-detail-track-row[data-track-id="${state.currentTrack.id}"]`);
              if (matchedRow) {
                const durCol = matchedRow.querySelector('.col-duration');
                if (durCol) durCol.textContent = formatted;
              }
            }
          }
          updateMediaSessionPosition(dom.audio.currentTime, effectiveSec);
          enforceCurrentTrackAudioTrim(true);
        }
      });

      dom.audio.addEventListener('playing', () => {
        setPlaybackVisualState(true);
        state.consecutiveErrors = 0;
        if (isLyricsContributionEditorOpen()) {
          applyLyricsContributionPlaybackRate(lyricsContributionPlaybackRate, { silent: true });
        }
        enforceCurrentTrackAudioTrim();
      });

      dom.audio.addEventListener('pause', () => {
        if (state.activeEngine === 'audio') {
          setPlaybackVisualState(false);
        }
      });

      dom.audio.addEventListener('ended', () => {
        if (state.activeEngine !== 'audio') return;
        finishRecommendationPlayback(true);
        if (state.loopMode === 'one') {
          const window = getTrackAudioTrimWindow(state.currentTrack, getEffectiveAudioDuration());
          dom.audio.currentTime = window.isTrimmed ? window.start : 0;
          beginRecommendationPlaybackSession(state.currentTrack);
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

        // Fallback: Thử chuyển sang YouTube Engine nếu có sẵn và không phải thiết bị iOS
        if (!state.isIOS && state.currentTrack?.id && !state.currentTrack.id.startsWith('itunes_') && ytPlayer && isYtReady && typeof ytPlayer.loadVideoById === 'function') {
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
    const openContributionFromButton = (e) => {
      e.stopPropagation();
      openLyricsContributionEditor();
    };
    const openAudioTrimFromButton = (e) => {
      e.stopPropagation();
      openAudioTrimEditor();
    };
    dom.lyricsContributeBtn?.addEventListener('click', openContributionFromButton);
    dom.sheetLyricsContributeBtn?.addEventListener('click', openContributionFromButton);
    dom.audioTrimBtn?.addEventListener('click', openAudioTrimFromButton);
    dom.sheetAudioTrimBtn?.addEventListener('click', openAudioTrimFromButton);
    dom.audioTrimCloseBtn?.addEventListener('click', closeAudioTrimEditor);
    dom.audioTrimCancelBtn?.addEventListener('click', closeAudioTrimEditor);
    dom.audioTrimBackdrop?.addEventListener('click', closeAudioTrimEditor);
    dom.audioTrimSaveBtn?.addEventListener('click', saveAudioTrim);
    dom.audioTrimResetBtn?.addEventListener('click', resetAudioTrim);
    dom.audioTrimPlayPauseBtn?.addEventListener('click', togglePlayPause);
    dom.audioTrimSeekBackBtn?.addEventListener('click', () => {
      seekToSeconds(Math.max(0, getCurrentAudioTime() - 5));
      updateAudioTrimEditorPlayback();
    });
    dom.audioTrimSeekForwardBtn?.addEventListener('click', () => {
      seekToSeconds(Math.min(audioTrimEditorDurationSec, getCurrentAudioTime() + 5));
      updateAudioTrimEditorPlayback();
    });
    dom.audioTrimStartMarkBtn?.addEventListener('click', () => {
      if (!dom.audioTrimStartSeconds || !dom.audioTrimEndSeconds) return;
      const current = Math.max(0, Math.min(getCurrentAudioTime(), audioTrimEditorDurationSec));
      dom.audioTrimStartSeconds.value = Math.min(current, Number(dom.audioTrimEndSeconds.value) - 1).toFixed(1);
      syncAudioTrimEditorBounds('start');
    });
    dom.audioTrimEndMarkBtn?.addEventListener('click', () => {
      if (!dom.audioTrimStartSeconds || !dom.audioTrimEndSeconds) return;
      const current = Math.max(0, Math.min(getCurrentAudioTime(), audioTrimEditorDurationSec));
      dom.audioTrimEndSeconds.value = Math.max(current, Number(dom.audioTrimStartSeconds.value) + 1).toFixed(1);
      syncAudioTrimEditorBounds('end');
    });
    dom.audioTrimStartRange?.addEventListener('input', (event) => {
      if (dom.audioTrimStartSeconds) dom.audioTrimStartSeconds.value = Number(event.target.value).toFixed(1);
      syncAudioTrimEditorBounds('start');
    });
    dom.audioTrimEndRange?.addEventListener('input', (event) => {
      if (dom.audioTrimEndSeconds) dom.audioTrimEndSeconds.value = Number(event.target.value).toFixed(1);
      syncAudioTrimEditorBounds('end');
    });
    dom.audioTrimStartSeconds?.addEventListener('change', () => syncAudioTrimEditorBounds('start'));
    dom.audioTrimEndSeconds?.addEventListener('change', () => syncAudioTrimEditorBounds('end'));
    dom.audioTrimPreviewTimeline?.addEventListener('pointerdown', () => {
      audioTrimPreviewIsScrubbing = true;
    });
    dom.audioTrimPreviewTimeline?.addEventListener('pointerup', () => {
      audioTrimPreviewIsScrubbing = false;
    });
    dom.audioTrimPreviewTimeline?.addEventListener('pointercancel', () => {
      audioTrimPreviewIsScrubbing = false;
    });
    dom.audioTrimPreviewTimeline?.addEventListener('input', (event) => {
      audioTrimPreviewIsScrubbing = true;
      if (dom.audioTrimCurrentTime) {
        dom.audioTrimCurrentTime.textContent = formatLyricsContributionTime(event.target.value);
      }
    });
    dom.audioTrimPreviewTimeline?.addEventListener('change', (event) => {
      const target = Number(event.target.value);
      if (Number.isFinite(target)) seekToSeconds(target);
      audioTrimPreviewIsScrubbing = false;
      updateAudioTrimEditorPlayback();
    });
    dom.lyricsContributionCloseBtn?.addEventListener('click', closeLyricsContributionEditor);
    dom.lyricsContributionCancelBtn?.addEventListener('click', closeLyricsContributionEditor);
    dom.lyricsContributionBackdrop?.addEventListener('click', closeLyricsContributionEditor);
    dom.lyricsContributionPlaybackRate?.addEventListener('change', (event) => {
      applyLyricsContributionPlaybackRate(Number(event.target.value));
    });
    dom.lyricsContributionPlayPauseBtn?.addEventListener('click', () => {
      togglePlayPause();
      updateLyricsContributionTimeline();
    });
    dom.lyricsContributionSeekBackBtn?.addEventListener('click', () => seekLyricsContributionBy(-5));
    dom.lyricsContributionSeekForwardBtn?.addEventListener('click', () => seekLyricsContributionBy(5));
    dom.lyricsContributionTimeline?.addEventListener('pointerdown', () => {
      lyricsContributionIsScrubbing = true;
    });
    dom.lyricsContributionTimeline?.addEventListener('pointerup', () => {
      lyricsContributionIsScrubbing = false;
    });
    dom.lyricsContributionTimeline?.addEventListener('pointercancel', () => {
      lyricsContributionIsScrubbing = false;
    });
    dom.lyricsContributionTimeline?.addEventListener('input', (event) => {
      lyricsContributionIsScrubbing = true;
      const duration = Math.max(0, Number(getLyricDurationSeconds()) || 0);
      event.target.setAttribute(
        'aria-valuetext',
        `${formatLyricsContributionTime(event.target.value)} / ${formatLyricsContributionTime(duration)}`
      );
      if (dom.lyricsContributionCurrentTime) {
        dom.lyricsContributionCurrentTime.textContent = formatLyricsContributionTime(event.target.value);
      }
    });
    dom.lyricsContributionTimeline?.addEventListener('change', (event) => {
      const target = Number(event.target.value);
      if (Number.isFinite(target)) seekToSeconds(target);
      lyricsContributionIsScrubbing = false;
      updateLyricsContributionTimeline();
    });
    dom.lyricsContributionBuildBtn?.addEventListener('click', buildLyricsContributionRows);
    dom.lyricsContributionWordModeBtn?.addEventListener('click', () => {
      const draft = getLyricsContributionDraft();
      setLyricsContributionWordMode(!lyricsContributionWordMode);
      renderLyricsContributionRows(draft);
    });
    dom.lyricsContributionSaveBtn?.addEventListener('click', saveLyricsContribution);
    dom.lyricsContributionAddLineBtn?.addEventListener('click', () => {
      const existingLines = getLyricsContributionDraft();
      existingLines.push({ text: '', time: null, words: [], wordsChanged: false });
      renderLyricsContributionRows(existingLines);
      dom.lyricsContributionList?.lastElementChild?.querySelector('.lyrics-contribution-line-text')?.focus();
    });
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
      if (dom.audioTrimModal && !dom.audioTrimModal.classList.contains('hidden')) {
        if (e.key === 'Escape') closeAudioTrimEditor();
        return;
      }
      if (dom.lyricsContributionModal && !dom.lyricsContributionModal.classList.contains('hidden')) {
        if (e.key === 'Escape') closeLyricsContributionEditor();
        return;
      }
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
        if (ambientBtn) ambientBtn.title = 'Chuyển sang chế độ Ban Ngày';
      } else {
        document.body.classList.remove('twilight-mode');
        if (ambientText) ambientText.textContent = 'Ban Ngày';
        if (sunIcon) sunIcon.classList.remove('hidden');
        if (moonIcon) moonIcon.classList.add('hidden');
        if (ambientBtn) ambientBtn.title = 'Chuyển sang chế độ Đêm Rừng Đom Đóm';
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
          { src: new URL('icon-192.png?v=5.3', window.location.origin).href, sizes: '192x192', type: 'image/png' },
          { src: new URL('icon-512.png?v=5.3', window.location.origin).href, sizes: '512x512', type: 'image/png' }
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
      const window = getTrackAudioTrimWindow(state.currentTrack, duration);
      const displayPosition = Math.max(0, Math.min((currentTime || 0) - window.start, window.duration));
      navigator.mediaSession.setPositionState({
        duration: Math.max(window.duration, 0),
        playbackRate: 1.0,
        position: displayPosition
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
        if (state.activeEngine === 'audio' && dom.audio) {
          const effDur = getEffectiveAudioDuration();
          const target = clampPlaybackSeekTime(getTrackAudioTrimWindow(state.currentTrack, effDur).start + details.seekTime, effDur);
          seekToSeconds(target);
          updateMediaSessionPosition(target, effDur);
        } else if (state.activeEngine === 'youtube' && ytPlayer && typeof ytPlayer.seekTo === 'function') {
          const duration = Number(ytPlayer.getDuration()) || getLyricDurationSeconds();
          const target = clampPlaybackSeekTime(getTrackAudioTrimWindow(state.currentTrack, duration).start + details.seekTime, duration);
          seekToSeconds(target);
        }
      }],
      ['seekbackward', (details) => {
        const skip = details.seekOffset || 10;
        if (state.activeEngine === 'audio' && dom.audio) {
          const effDur = getEffectiveAudioDuration();
          const target = clampPlaybackSeekTime(dom.audio.currentTime - skip, effDur);
          seekToSeconds(target);
          updateMediaSessionPosition(target, effDur);
        } else if (state.activeEngine === 'youtube' && ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
          const duration = Number(ytPlayer.getDuration()) || getLyricDurationSeconds();
          seekToSeconds(clampPlaybackSeekTime(ytPlayer.getCurrentTime() - skip, duration));
        }
      }],
      ['seekforward', (details) => {
        const skip = details.seekOffset || 10;
        if (state.activeEngine === 'audio' && dom.audio) {
          const effDur = getEffectiveAudioDuration();
          const target = clampPlaybackSeekTime(dom.audio.currentTime + skip, effDur);
          seekToSeconds(target);
          updateMediaSessionPosition(target, effDur);
        } else if (state.activeEngine === 'youtube' && ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
          const duration = Number(ytPlayer.getDuration()) || getLyricDurationSeconds();
          seekToSeconds(clampPlaybackSeekTime(ytPlayer.getCurrentTime() + skip, duration));
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
      // Nếu màn hình vừa tắt hoặc chuyển app mà đang phát bằng YouTube Iframe, lập tức chuyển ngay sang thẻ <audio> trước khi iOS đóng băng tiến trình
      if (state.isPlaying && state.activeEngine === 'youtube' && state.currentTrack) {
        const curTime = (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') ? ytPlayer.getCurrentTime() : 0;
        try { ytPlayer.pauseVideo(); } catch (_) {}
        state.activeEngine = 'audio';
        dom.audio.src = `/api/stream/${state.currentTrack.id}`;
        dom.audio.currentTime = curTime;
        dom.audio.play().catch(() => {});
      }
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
    const src = typeof avatarSrc === 'string' ? avatarSrc.trim() : '';
    const isAllowedImageData = /^data:image\/(?:png|jpe?g|gif|webp|svg\+xml);/i.test(src);
    let safeSrc = isAllowedImageData ? src : 'bg.jpg';
    if (!isAllowedImageData && src) {
      try {
        const parsedUrl = new URL(src, window.location.href);
        if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
          safeSrc = src;
        }
      } catch {}
    }
    const image = document.createElement('img');
    image.className = 'user-avatar-img';
    image.alt = 'Avatar';
    image.src = safeSrc;
    el.replaceChildren(image);
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
      dom.sidebarUserStatus.innerHTML = isLogged ? `${GhibliIcons.skyCloud} Đã kết nối Đám Mây` : 'Chạm để đăng nhập';
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
      if (dom.sidebarUserStatus) dom.sidebarUserStatus.innerHTML = `${GhibliIcons.skyCloud} Đang kết nối...`;
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
          dom.sidebarUserStatus.innerHTML = `${GhibliIcons.skyCloud} Đã đồng bộ`;
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
      } : { username: 'guest', displayName: 'Khách', avatar: 'icon-home.png' },
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
        dom.toggleLoginPasswordBtn.innerHTML = isPass ? GhibliIcons.eyeClosed : GhibliIcons.sketchedEye;
      });
    }

    if (dom.toggleRegisterPasswordBtn && dom.registerPassword) {
      dom.toggleRegisterPasswordBtn.addEventListener('click', () => {
        const isPass = dom.registerPassword.type === 'password';
        dom.registerPassword.type = isPass ? 'text' : 'password';
        dom.toggleRegisterPasswordBtn.innerHTML = isPass ? GhibliIcons.eyeClosed : GhibliIcons.sketchedEye;
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
    loadSharedAudioTrims();
    setInterval(loadSharedAudioTrims, 120000);
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
    loadAlbumsByRegion(state.selectedCountry);
    refreshDiscoverSections();
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
