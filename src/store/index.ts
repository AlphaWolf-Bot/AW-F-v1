import { create } from 'zustand';

interface UserState {
  id: string;
  username: string;
  coinBalance: number;
  level: number;
  userLevel: number;
  tapsRemaining: number;
  tapRefreshTime: string | null;
  friends: Array<{
    id: string;
    username: string;
    level: number;
    joinedDate: string;
    coins: number;
  }>;
  setUser: (user: Partial<UserState>) => void;
  updateCoinBalance: (amount: number) => void;
  updateLevel: (level: number) => void;
  resetTaps: () => void;
  initTelegramWebApp: () => void;
}

export const useStore = create<UserState>((set) => ({
  id: '',
  username: '',
  coinBalance: 0,
  level: 1,
  userLevel: 1,
  tapsRemaining: 0,
  tapRefreshTime: null,
  friends: [],
  setUser: (user) => set((state) => ({ ...state, ...user })),
  updateCoinBalance: (amount) => set((state) => ({ coinBalance: state.coinBalance + amount })),
  updateLevel: (level) => set(() => ({ level, userLevel: level })),
  resetTaps: () => set({ tapsRemaining: 100, tapRefreshTime: new Date().toISOString() }),
  initTelegramWebApp: () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
    }
  },
})); 