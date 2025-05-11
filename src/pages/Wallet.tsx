import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';

const Wallet = () => {
  const { coinBalance } = useStore();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const withdrawalOptions = [
    { amount: 1000, coins: 1000 },
    { amount: 2000, coins: 2000 },
    { amount: 5000, coins: 5000 },
    { amount: 10000, coins: 10000 }
  ];

  const handleWithdraw = () => {
    if (selectedAmount && coinBalance >= selectedAmount) {
      // Implement withdrawal logic here
      console.log(`Withdrawing ${selectedAmount} coins`);
    }
  };

  return (
    <div className="py-4">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-[#ffd700] mb-2">Your Wallet</h2>
        <p className="text-3xl font-bold">{coinBalance} coins</p>
        <p className="text-sm text-gray-400 mt-1">Available for withdrawal</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-center">Withdraw Coins</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {withdrawalOptions.map((option) => (
            <motion.button
              key={option.amount}
              className={`card p-4 text-center ${
                selectedAmount === option.coins ? 'border-2 border-[#ffd700]' : ''
              }`}
              onClick={() => setSelectedAmount(option.coins)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <p className="text-lg font-bold">{option.amount} INR</p>
              <p className="text-sm text-gray-400">{option.coins} coins</p>
            </motion.button>
          ))}
        </div>

        <motion.button
          className={`withdraw-btn w-full ${
            !selectedAmount || coinBalance < selectedAmount ? 'disabled' : ''
          }`}
          onClick={handleWithdraw}
          disabled={!selectedAmount || coinBalance < selectedAmount}
          whileHover={selectedAmount && coinBalance >= selectedAmount ? { scale: 1.02 } : {}}
          whileTap={selectedAmount && coinBalance >= selectedAmount ? { scale: 0.98 } : {}}
        >
          {!selectedAmount
            ? 'Select an amount'
            : coinBalance < selectedAmount
            ? 'Insufficient balance'
            : 'Withdraw Now'}
        </motion.button>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold text-center mb-4">Transaction History</h3>
        <div className="space-y-2">
          <div className="card p-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">Withdrawal</p>
                <p className="text-sm text-gray-400">2024-02-20</p>
              </div>
              <p className="text-[#ffd700]">-1000 coins</p>
            </div>
          </div>
          <div className="card p-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">Task Reward</p>
                <p className="text-sm text-gray-400">2024-02-19</p>
              </div>
              <p className="text-[#ffd700]">+50 coins</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet; 