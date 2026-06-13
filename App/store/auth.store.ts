import { create } from 'zustand';

import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import type { AuthPayload, AuthUser } from '@/types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
}

interface AuthActions {
  setAuth: (user: AuthUser, token: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isHydrating: false,

  setAuth: (user, token) =>
    set({ user, accessToken: token, isAuthenticated: true, isHydrating: false }),

  setToken: (token) => set({ accessToken: token }),

  logout: () =>
    set({ user: null, accessToken: null, isAuthenticated: false, isHydrating: false }),

  hydrate: async () => {
    if (get().isAuthenticated || get().isHydrating) return;
    set({ isHydrating: true });
    try {
      const data = await api.post<AuthPayload>(ENDPOINTS.auth.bypass, {});
      set({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
        isHydrating: false,
      });
    } catch {
      set({ isHydrating: false });
    }
  },
}));
