import { create } from 'zustand';

import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
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
  logout: () => void;
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

  logout: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isHydrating: false,
      hasHydrated: true,
    }),

  hydrate: async () => {
    if (get().hasHydrated || get().isHydrating) return;
    set({ isHydrating: true });
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
      const refreshRes = await fetch(`${API_BASE}${ENDPOINTS.auth.refresh}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!refreshRes.ok) throw new Error('Refresh failed');

      const refreshData = await refreshRes.json();
      const accessToken = refreshData.data.accessToken;

      set({ accessToken });

      const user = await api.get<AuthUser>(ENDPOINTS.users.me);

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
