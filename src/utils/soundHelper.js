import { SOUND_KEY } from './storage.js';

let preloadedAudio = null;

export const preloadWinSound = () => {
  try {
    if (typeof window !== 'undefined' && !preloadedAudio) {
      preloadedAudio = new Audio('/win.mp3');
      preloadedAudio.preload = 'auto';
      preloadedAudio.load();
    }
  } catch (err) {
    console.warn('[Audio] Failed to preload sound:', err);
  }
};

export const playWin = (volume = 0.5) => {
  try {
    const isMuted = localStorage.getItem(SOUND_KEY) === 'true';
    if (isMuted) return;

    const audio = preloadedAudio || new Audio('/win.mp3');
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.currentTime = 0;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('[Audio] Playback prevented by browser policy:', err);
      });
    }
  } catch (error) {
    console.warn('[Audio] Error playing win sound:', error);
  }
};

// Also export playWinSound as alias for backward compatibility
export const playWinSound = playWin;
