import { create } from 'zustand';

const STORAGE_KEY = 'biztrack-theme';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),

  init: () => {
    const theme = get().theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
  },

  toggle: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    set({ theme: next });
  },

  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({ theme });
  },
}));
