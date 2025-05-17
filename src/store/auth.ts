import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/services/api';
import { socketService } from '@/services/socket';
import { supabase, subscribeToUserUpdates, subscribeToCoinsUpdates, subscribeToAchievements } from '@/services/supabase';

interface User {
  id: string;
  telegramId: string;
  username: string;
  firstName: string;
  lastName: string;
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
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async () => {
        try {
          set({ isLoading: true, error: null });

          // Get Telegram WebApp data
          const webApp = window.Telegram?.WebApp;
          if (!webApp) {
            throw new Error('Telegram Web App not initialized');
          }

          // Login with backend
          const response = await api.post('/auth/login', {
            initData: webApp.initData,
          });

          const { user, token, refreshToken } = response.data;

          // Store tokens
          localStorage.setItem('token', token);
          localStorage.setItem('refresh_token', refreshToken);

          // Connect socket
          socketService.connect();

          // Set up Supabase subscriptions
          const userChannel = subscribeToUserUpdates(user.id, (payload) => {
            set((state) => ({
              user: { ...state.user!, ...payload.new },
            }));
          });

          const coinsChannel = subscribeToCoinsUpdates(user.id, (payload) => {
            set((state) => ({
              user: {
                ...state.user!,
                coinBalance: payload.new.balance,
              },
            }));
          });

          const achievementsChannel = subscribeToAchievements(user.id, (payload) => {
            // Handle new achievements
            console.log('New achievement:', payload);
          });

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        // Disconnect socket
        socketService.disconnect();

        // Clear tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');

        // Reset state
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      refreshUser: async () => {
        try {
          const { user } = get();
          if (!user) return;

          const response = await api.get(`/users/${user.id}`);
          set({ user: response.data });
        } catch (error: any) {
          set({ error: error.message || 'Failed to refresh user data' });
        }
      },
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