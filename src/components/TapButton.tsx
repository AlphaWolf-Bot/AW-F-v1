import { useState } from 'react';
import { useCoinsStore } from '../store/coins';
import { motion } from 'framer-motion';

export const TapButton = () => {
  const { tap, balance, isLoading } = useCoinsStore();
  const [isTapping, setIsTapping] = useState(false);

  const handleTap = async () => {
    if (isLoading || isTapping || !balance || balance.tapsRemaining <= 0) {
      return;
    }

    setIsTapping(true);
    await tap();
    setIsTapping(false);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleTap}
      disabled={isLoading || isTapping || !balance || balance.tapsRemaining <= 0}
      className={`
        relative w-32 h-32 rounded-full
        ${isLoading || isTapping || !balance || balance.tapsRemaining <= 0
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
        }
        flex items-center justify-center
        shadow-lg transition-colors duration-200
      `}
    >
      <div className="text-white text-center">
        <p className="text-2xl font-bold">TAP</p>
        {balance && (
          <p className="text-sm">
            {balance.tapsRemaining} taps left
          </p>
        )}
      </div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
    </motion.button>
  );
}; 