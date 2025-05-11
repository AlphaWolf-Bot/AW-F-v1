import { create } from 'zustand';
import { coinsAPI } from '../services/api';

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

interface CoinBalance {
  coinBalance: number;
  totalEarned: number;
  level: number;
  tapsRemaining: number;
  resetTime: string | null;
}

interface CoinsState {
  balance: CoinBalance | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  getBalance: () => Promise<void>;
  tap: () => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  getTransactions: (page?: number, limit?: number) => Promise<void>;
}

export const useCoinsStore = create<CoinsState>((set) => ({
  balance: null,
  transactions: [],
  isLoading: false,
  error: null,

  getBalance: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await coinsAPI.getBalance() as { data: CoinBalance };
      set({ balance: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to get balance', 
        isLoading: false 
      });
    }
  },

  tap: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await coinsAPI.tap() as { data: CoinBalance };
      set({ balance: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to tap', 
        isLoading: false 
      });
    }
  },

  completeTask: async (taskId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await coinsAPI.completeTask(taskId) as { data: CoinBalance };
      set({ balance: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to complete task', 
        isLoading: false 
      });
    }
  },

  getTransactions: async (page = 1, limit = 10) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await coinsAPI.getTransactions(page, limit) as { 
        data: { 
          transactions: Transaction[];
          pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
          };
        }
      };
      set({ transactions: data.transactions, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to get transactions', 
        isLoading: false 
      });
    }
  },
})); 