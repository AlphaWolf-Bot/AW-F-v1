import { create } from 'zustand';
import { withdrawalsAPI } from '../services/api';

interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  amountInr: number;
  upiId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface WithdrawalsState {
  withdrawals: Withdrawal[];
  isLoading: boolean;
  error: string | null;
  getHistory: (page?: number, limit?: number) => Promise<void>;
  create: (amount: number, upiId: string) => Promise<boolean>;
}

export const useWithdrawalsStore = create<WithdrawalsState>((set, get) => ({
  withdrawals: [],
  isLoading: false,
  error: null,

  getHistory: async (page = 1, limit = 10) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await withdrawalsAPI.getHistory(page, limit) as {
        data: {
          withdrawals: Withdrawal[];
          pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
          };
        }
      };
      set({ withdrawals: data.withdrawals, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to get withdrawal history', 
        isLoading: false 
      });
    }
  },

  create: async (amount: number, upiId: string) => {
    try {
      await withdrawalsAPI.create(amount, upiId);
      await get().getHistory();
      return true;
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      return false;
    }
  },
})); 