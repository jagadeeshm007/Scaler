import { create } from 'zustand';

import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import type { AuthPayload, AuthUser } from '@/types';

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
      const data = await api.post<AuthPayload>(ENDPOINTS.auth.bypass, {});
      set({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
        isHydrating: false,
        hasHydrated: true,
      });
    } catch {
      set({ isHydrating: false, hasHydrated: true });
    }
  },

  retryHydrate: async () => {
    set({ hasHydrated: false, isHydrating: false });
    await get().hydrate();
  },
}));
