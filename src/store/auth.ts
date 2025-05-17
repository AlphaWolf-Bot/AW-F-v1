import { create } from 'zustand';
import { authAPI } from '../services/api';
import { socketService } from '../services/socket';

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
  isAuthenticated: boolean;
  login: (initData: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserData: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
  isAuthenticated: false,

  login: async (initData: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Verify Telegram Web App data
      if (!window.Telegram?.WebApp?.initData) {
        throw new Error('Telegram Web App not initialized');
      }

      const { data } = await authAPI.login(initData) as { data: LoginResponse };
      
      // Store token and user data
      localStorage.setItem('token', data.token);
      
      // Initialize socket connection
      socketService.connect();
      
      // Set up socket listeners for real-time updates
      socketService.on('user:update', (userData) => {
        get().updateUserData(userData);
      });

      socketService.on('coins:update', (data) => {
        get().updateUserData({ coinBalance: data.balance });
      });

      socketService.on('level:update', (data) => {
        get().updateUserData({ level: data.level });
      });

      set({ 
        user: data.user, 
        token: data.token, 
        isLoading: false,
        isAuthenticated: true 
      });
    } catch (error) {
      localStorage.removeItem('token');
      set({ 
        user: null,
        token: null,
        error: error instanceof Error ? error.message : 'Login failed', 
        isLoading: false,
        isAuthenticated: false
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    socketService.disconnect();
    set({ 
      user: null, 
      token: null,
      isAuthenticated: false 
    });
  },

  refreshUser: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await authAPI.me() as { data: MeResponse };
      set({ 
        user: data.user, 
        isLoading: false,
        isAuthenticated: true 
      });
    } catch (error) {
      localStorage.removeItem('token');
      set({ 
        user: null,
        token: null,
        error: error instanceof Error ? error.message : 'Failed to refresh user data', 
        isLoading: false,
        isAuthenticated: false
      });
      throw error;
    }
  },

  updateUserData: (data: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null
    }));
  }
})); 