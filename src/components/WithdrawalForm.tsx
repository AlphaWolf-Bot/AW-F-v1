import { useState } from 'react';
import { useWithdrawalsStore } from '../store/withdrawals';
import { useCoinsStore } from '../store/coins';

export const WithdrawalForm = () => {
  const { create, isLoading, error } = useWithdrawalsStore();
  const { balance } = useCoinsStore();
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !upiId || !balance) return;

    const amountNum = parseInt(amount);
    if (amountNum < 1000 || amountNum > balance.coinBalance) {
      return;
    }

    await create(amountNum, upiId);
    setAmount('');
    setUpiId('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Amount (min: 1000 coins)
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="1000"
          max={balance?.coinBalance || 0}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="upiId" className="block text-sm font-medium text-gray-700">
          UPI ID
        </label>
        <input
          type="text"
          id="upiId"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          pattern="^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !amount || !upiId}
        className={`
          w-full py-2 px-4 rounded-md text-white font-medium
          ${isLoading || !amount || !upiId
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
          }
        `}
      >
        {isLoading ? 'Processing...' : 'Withdraw'}
      </button>

      {balance && (
        <p className="text-sm text-gray-500">
          Available balance: {balance.coinBalance} coins
        </p>
      )}
    </form>
  );
}; 