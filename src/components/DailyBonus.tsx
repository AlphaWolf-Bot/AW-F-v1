import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';

const DailyBonus = () => {
  const { updateCoinBalance } = useStore();
  const [isClaimed, setIsClaimed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          setIsClaimed(false);
          return 24 * 60 * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClaim = () => {
    if (!isClaimed) {
      updateCoinBalance(50);
      setIsClaimed(true);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      className="card p-4 mt-6 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="text-lg text-[#ffd700] mb-3">Daily Bonus</h3>
      <p className="text-sm mb-3">Come back tomorrow for an extra bonus!</p>
      <motion.button
        className={`task-btn w-full ${isClaimed ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleClaim}
        disabled={isClaimed}
        whileHover={!isClaimed ? { scale: 1.02 } : {}}
        whileTap={!isClaimed ? { scale: 0.98 } : {}}
      >
        {isClaimed ? 'Claimed' : 'Claim 50 Coins'}
      </motion.button>
      <p className="text-xs mt-2 text-center">
        {isClaimed ? 'Available tomorrow' : `Available in: ${formatTime(timeLeft)}`}
      </p>
    </motion.div>
  );
};

export default DailyBonus; 