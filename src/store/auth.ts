import { create } from 'zustand';
import { authAPI } from '../services/api';

interface User {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  coinBalance: number;
  totalEarned: number;
  level: number;
  tapsRemaining: number;
  referralCode: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

interface MeResponse {
  user: User;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (initData: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (initData: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await authAPI.login(initData) as { data: LoginResponse };
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isLoading: false });
    } catch (error) {
      localStorage.removeItem('token');
      set({ 
        user: null,
        token: null,
        error: error instanceof Error ? error.message : 'Login failed', 
        isLoading: false 
      });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  refreshUser: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await authAPI.me() as { data: MeResponse };
      set({ user: data.user, isLoading: false });
    } catch (error) {
      localStorage.removeItem('token');
      set({ 
        user: null,
        token: null,
        error: error instanceof Error ? error.message : 'Failed to refresh user data', 
        isLoading: false 
      });
    }
  },
})); 