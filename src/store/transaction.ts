import { create } from 'zustand';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  reason: string;
  timestamp: string;
}

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [...state.transactions, transaction],
    })),
})); 