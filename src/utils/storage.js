export const TOKEN_KEY = 'token';
export const THEME_KEY = 'theme';
export const SOUND_KEY = 'soundMuted';

export const DEFAULT_HABITS = [
  { id: 'h-1', name: 'Wake up 4' },
  { id: 'h-2', name: 'Read 4min 8am' },
  { id: 'h-3', name: 'Minimum 10k steps' },
  { id: 'h-4', name: 'No Junk Food' },
  { id: 'h-5', name: 'Go to bed 10pm' },
];

// Token Helpers
export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const setStoredToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeStoredToken = () => localStorage.removeItem(TOKEN_KEY);

// Theme Helpers (default system)
export const getStoredTheme = () => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};
export const setStoredTheme = (theme) => localStorage.setItem(THEME_KEY, theme);

// Sound Mute Helpers (default false)
export const getStoredMute = () => localStorage.getItem(SOUND_KEY) === 'true';
export const setStoredMute = (isMuted) => localStorage.setItem(SOUND_KEY, String(isMuted));
