import { create } from 'zustand';

import { logoutUser, refreshSession } from '@/lib/api/auth';
import { fetchUserProfile } from '@/lib/api/users';
import type { AuthUser } from '@/types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  hasHydrated: boolean;
}

interface AuthActions {
  setAuth: (user: AuthUser, token: string) => void;
  setToken: (token: string) => void;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  retryHydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isHydrating: false,
  hasHydrated: false,

  setAuth: (user, token) =>
    set({
      user,
      accessToken: token,
      isAuthenticated: true,
      isHydrating: false,
      hasHydrated: true,
    }),

  setToken: (token) => set({ accessToken: token }),

  logout: async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore errors on logout
    } finally {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isHydrating: false,
        hasHydrated: true,
      });
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
      }
    }
  },

  hydrate: async () => {
    if (get().hasHydrated || get().isHydrating) return;
    set({ isHydrating: true });
    try {
      const refreshData = await refreshSession();
      const accessToken = refreshData.accessToken;

      set({ accessToken });

      const user = await fetchUserProfile();

      set({
        user,
        accessToken,
        isAuthenticated: true,
        isHydrating: false,
        hasHydrated: true,
      });
    } catch {
      set({
        isHydrating: false,
        hasHydrated: true,
        isAuthenticated: false,
        accessToken: null,
        user: null,
      });
    }
  },

  retryHydrate: async () => {
    set({ hasHydrated: false, isHydrating: false });
    await get().hydrate();
  },
}));
