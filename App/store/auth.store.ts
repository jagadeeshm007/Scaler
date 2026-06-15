import { create } from 'zustand';

import { localApi } from '@/lib/api';
import { INTERNAL_API } from '@/lib/constants/internal-api';
import { clearSessionHint } from '@/lib/session-hint';

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => set({ accessToken }),
  logout: async () => {
    set({ accessToken: null });
    clearSessionHint();
    try {
      await localApi.post(INTERNAL_API.auth.logout);
    } catch {
      // Local state is already cleared; redirect handles the rest.
    }
  },
}));
