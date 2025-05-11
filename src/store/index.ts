import { create } from 'zustand';

interface UserState {
  coinBalance: number;
  tapsRemaining: number;
  tapRefreshTime: number;
  userLevel: {
    current: string;
    points: number;
    maxPoints: number;
    levels: string[];
  };
  initTelegramWebApp: () => void;
  updateCoinBalance: (amount: number) => void;
  updateLevel: (points: number) => void;
  resetTaps: () => void;
}

export const useStore = create<UserState>((set) => ({
  coinBalance: 0,
  tapsRemaining: 100,
  tapRefreshTime: 14400, // 4 hours in seconds
  userLevel: {
    current: 'Alpha Pup',
    points: 0,
    maxPoints: 1000,
    levels: [
      'Alpha Pup',
      'Alpha Scout',
      'Alpha Hunter',
      'Alpha Warrior',
      'Alpha Leader'
    ]
  },

  initTelegramWebApp: () => {
    console.log('Initializing Telegram WebApp');
    // Add any initialization logic here
  },

  updateCoinBalance: (amount) => set((state) => ({
    coinBalance: state.coinBalance + amount
  })),

  updateLevel: (points) => set((state) => {
    const newPoints = state.userLevel.points + points;
    const currentLevelIndex = state.userLevel.levels.indexOf(state.userLevel.current);
    
    if (newPoints >= state.userLevel.maxPoints && currentLevelIndex < state.userLevel.levels.length - 1) {
      return {
        userLevel: {
          ...state.userLevel,
          current: state.userLevel.levels[currentLevelIndex + 1],
          points: newPoints - state.userLevel.maxPoints,
          maxPoints: state.userLevel.maxPoints * 1.5
        }
      };
    }

    return {
      userLevel: {
        ...state.userLevel,
        points: newPoints
      }
    };
  }),

  resetTaps: () => set({
    tapsRemaining: 100,
    tapRefreshTime: 14400
  })
})); 