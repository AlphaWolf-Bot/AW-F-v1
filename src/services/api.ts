import axios, { AxiosError, AxiosResponse } from 'axios';
import { handleApiError, AppError } from './errorHandler';
import { securityService } from './security';
import { socketService } from './socket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface LoginResponse {
  user: {
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
  };
  token: string;
}

interface MeResponse {
  user: LoginResponse['user'];
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = securityService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add CSRF token
  const csrfToken = securityService.getCSRFToken();
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }

  // Add Telegram Web App data if available
  if (window.Telegram?.WebApp?.initData) {
    config.headers['X-Telegram-Init-Data'] = window.Telegram.WebApp.initData;
  }

  // Check rate limiting
  if (securityService.isRateLimited(config.url || '')) {
    throw new AppError('Rate limit exceeded. Please try again later.', 'RATE_LIMIT', 429);
  }

  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const appError = handleApiError(error);

    // Handle token expiration
    if (appError.code === 'AUTH_EXPIRED') {
      const refreshed = await securityService.refreshToken();
      if (refreshed) {
        // Retry the original request
        const config = error.config;
        if (config) {
          return api(config);
        }
      }
    }

    return Promise.reject(appError);
  }
);

// Auth API
export const authAPI = {
  login: async (initData: string): Promise<AxiosResponse<LoginResponse>> => {
    return api.post('/auth/login', { initData });
  },

  me: async (): Promise<AxiosResponse<MeResponse>> => {
    return api.get('/auth/me');
  },

  logout: async (): Promise<AxiosResponse<void>> => {
    return api.post('/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<AxiosResponse<{ token: string }>> => {
    return api.post('/auth/refresh', { refreshToken });
  }
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: async (data: Partial<LoginResponse['user']>): Promise<AxiosResponse<LoginResponse>> => {
    return api.put('/users/profile', data);
  },
  getProgress: () => api.get('/users/progress'),
  getAchievements: () => api.get('/users/achievements'),
  getLevel: () => api.get('/users/level'),
  getStats: async (): Promise<AxiosResponse<any>> => {
    return api.get('/users/stats');
  },
  updateSettings: (settings: any) => api.put('/users/settings', settings),
  getNotifications: () => api.get('/users/notifications'),
  markNotificationRead: (id: string) => api.put(`/users/notifications/${id}/read`),
};

// Coins API
export const coinsAPI = {
  getBalance: async (): Promise<AxiosResponse<{ balance: number }>> => {
    return api.get('/coins/balance');
  },
  getHistory: () => api.get('/coins/history'),
  addCoins: (amount: number) => api.post('/coins/add', { amount }),
  withdraw: (data: { amount: number; method: string }) => 
    api.post('/coins/withdraw', data),
  getExchangeRate: () => api.get('/coins/exchange-rate'),
  convertCoins: (amount: number, currency: string) => 
    api.post('/coins/convert', { amount, currency }),
  getTransactions: async (): Promise<AxiosResponse<any[]>> => {
    return api.get('/coins/transactions');
  }
};

// Withdrawals API
export const withdrawalsAPI = {
  getHistory: () => api.get('/withdrawals/history'),
  getPending: () => api.get('/withdrawals/pending'),
  create: (data: { amount: number; method: string }) => 
    api.post('/withdrawals', data),
  cancel: (id: string) => api.post(`/withdrawals/${id}/cancel`),
  getMethods: () => api.get('/withdrawals/methods'),
  verifyMethod: (method: string, data: any) => 
    api.post(`/withdrawals/verify/${method}`, data),
};

// Ads API
export const adsAPI = {
  getAd: (type: string) => api.get(`/ads/get?type=${type}`),
  recordClick: (adId: string) => api.post(`/ads/click/${adId}`),
  processReward: (adId: string) => api.post(`/ads/reward/${adId}`),
  getMetrics: (adId: string) => api.get(`/ads/metrics/${adId}`),
  createAd: (data: any) => api.post('/ads/create', data),
  updateStatus: (adId: string, status: string) => 
    api.put(`/ads/status/${adId}`, { status }),
  getAdHistory: () => api.get('/ads/history'),
  getAdStats: () => api.get('/ads/stats'),
};

// Telegram API
export const telegramAPI = {
  connect: (data: { telegramId: string }): Promise<AxiosResponse<void>> => 
    api.post('/telegram/connect', data),
  disconnect: (): Promise<AxiosResponse<void>> => 
    api.post('/telegram/disconnect'),
  getStatus: (): Promise<AxiosResponse<{ connected: boolean }>> => 
    api.get('/telegram/status'),
  sendMessage: (data: { message: string }): Promise<AxiosResponse<void>> => 
    api.post('/telegram/send', data),
  getChats: () => api.get('/telegram/chats'),
  getMessages: (chatId: string) => api.get(`/telegram/messages/${chatId}`),
  sendMedia: (data: { chatId: string; media: File }) => {
    const formData = new FormData();
    formData.append('media', data.media);
    formData.append('chatId', data.chatId);
    return api.post('/telegram/send-media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api; 