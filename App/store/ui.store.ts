import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'system' | 'light' | 'dark';
type TimeFormat = '12h' | '24h';

interface UIState {
  sidebarOpen: boolean;
  theme: Theme;
  timeFormat: TimeFormat;
}

interface UIActions {
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
  setTimeFormat: (format: TimeFormat) => void;
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set, get) => ({
      sidebarOpen: false,
      theme: 'system',
      timeFormat: '12h',

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      setTheme: (theme) => set({ theme }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
    }),
    {
      name: 'scaler-theme',
      partialize: (state) => ({ theme: state.theme, timeFormat: state.timeFormat }),
    },
  ),
);
