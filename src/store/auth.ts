import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/services/api';
import { socketService } from '@/services/socket';
import { supabase, subscribeToUserUpdates, subscribeToCoinsUpdates, subscribeToAchievements } from '@/services/supabase';

interface User {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  coinBalance: number;
  totalEarned: number;
  level: number;
  experience: number;
  experienceToNext: number;
  tapsRemaining: number;
  referralCode: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  login: (initData: string) => Promise<void>;
  logout: () => Promise<void>;
  me: () => Promise<void>;
  refreshToken: (refreshToken: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem('token'),
      isLoading: false,
      error: null,
      isAuthenticated: !!localStorage.getItem('token'),

      login: async (initData: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await api.post('/auth/login', { initData });
          const { user, token } = response.data;
          
          localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true });
          
          // Initialize socket connection
          socketService.connect(token);
        } catch (error) {
          set({ error: 'Failed to login' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          await api.post('/auth/logout');
          
          localStorage.removeItem('token');
          socketService.disconnect();
          set({ user: null, token: null, isAuthenticated: false });
        } catch (error) {
          set({ error: 'Failed to logout' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      me: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await api.get('/auth/me');
          set({ user: response.data.user });
        } catch (error) {
          set({ error: 'Failed to fetch user data' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      refreshToken: async (refreshToken: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await api.post('/auth/refresh', { refreshToken });
          const { token } = response.data;
          
          localStorage.setItem('token', token);
          set({ token });
          
          // Reconnect socket with new token
          socketService.connect(token);
        } catch (error) {
          set({ error: 'Failed to refresh token' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 