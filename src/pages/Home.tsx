import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import LevelProgress from '../components/LevelProgress';
import DailyBonus from '../components/DailyBonus';

const Home = () => {
  const { 
    coinBalance, 
    tapsRemaining, 
    tapRefreshTime,
    updateCoinBalance,
    updateLevel,
    resetTaps
  } = useStore();

  const [floatingTexts, setFloatingTexts] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (tapRefreshTime > 0) {
        // Update timer logic here
      } else {
        resetTaps();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [tapRefreshTime, resetTaps]);

  const handleCoinTap = (e: React.MouseEvent) => {
    if (tapsRemaining <= 0) return;

    // Add floating text animation
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;
    
    setFloatingTexts(prev => [
      ...prev,
      { id: Date.now(), x, y }
    ]);

    // Update coins and level
    updateCoinBalance(5);
    updateLevel(5);

    // Remove floating text after animation
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(text => text.id !== Date.now()));
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <LevelProgress />
      
      <div className="text-center mb-6">
        <h2 className="text-xl mb-2">Tap the coin to earn</h2>
        <p className="text-sm text-gray-400">
          Taps remaining: {tapsRemaining}/100
        </p>
        <p className="text-sm text-gray-400">
          Refreshes in: {Math.floor(tapRefreshTime / 3600)}:
          {Math.floor((tapRefreshTime % 3600) / 60).toString().padStart(2, '0')}:
          {(tapRefreshTime % 60).toString().padStart(2, '0')}
        </p>
      </div>
      
      <motion.div
        className="coin w-[150px] h-[150px] bg-[#ffd700] rounded-full cursor-pointer shadow-[0_0_20px_#8b7500] flex items-center justify-center font-bold text-black select-none"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCoinTap}
        style={{
          backgroundImage: 'linear-gradient(145deg, #ffd700, #8b7500)'
        }}
      >
        <span>+5</span>
      </motion.div>
      
      <div className="text-center mt-4">
        <p className="text-lg">
          Your balance: <span className="text-[#ffd700] font-bold">{coinBalance}</span> coins
        </p>
      </div>

      <DailyBonus />

      <AnimatePresence>
        {floatingTexts.map(text => (
          <motion.div
            key={text.id}
            className="absolute text-[#ffd700] font-bold z-10"
            initial={{ y: text.y, x: text.x, opacity: 1 }}
            animate={{ y: text.y - 60, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            +5
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Home; 