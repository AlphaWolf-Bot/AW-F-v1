import { motion } from 'framer-motion';
import { useStore } from '../store';

const Games = () => {
  const { coinBalance } = useStore();

  const games = [
    {
      title: 'Lucky Spin',
      description: 'Spin the wheel to win coins',
      icon: 'dice',
      minBet: 100,
      maxReward: 1000
    },
    {
      title: 'Coin Flip',
      description: 'Double your coins or lose them all',
      icon: 'coins',
      minBet: 50,
      maxReward: 500
    },
    {
      title: 'Memory Match',
      description: 'Test your memory and win coins',
      icon: 'brain',
      minBet: 200,
      maxReward: 2000
    },
    {
      title: 'Coming Soon',
      description: 'More exciting games on the way',
      icon: 'gamepad',
      minBet: 0,
      maxReward: 0,
      disabled: true
    }
  ];

  return (
    <div className="py-4">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-[#ffd700] mb-2">Games</h2>
        <p className="text-3xl font-bold">{coinBalance} coins</p>
        <p className="text-sm text-gray-400 mt-1">Available to play</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {games.map((game, index) => (
          <motion.div
            key={game.title}
            className={`card p-4 text-center ${
              game.disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <i className={`fas fa-${game.icon} text-3xl text-[#ffd700] mb-2`}></i>
            <h3 className="font-bold mb-1">{game.title}</h3>
            <p className="text-sm text-gray-400 mb-2">{game.description}</p>
            {!game.disabled && (
              <>
                <p className="text-xs text-gray-400 mb-2">
                  Min Bet: {game.minBet} coins
                </p>
                <p className="text-xs text-[#ffd700]">
                  Max Reward: {game.maxReward} coins
                </p>
              </>
            )}
            <motion.button
              className={`game-btn w-full mt-3 ${
                game.disabled ? 'disabled' : ''
              }`}
              disabled={game.disabled}
              whileHover={!game.disabled ? { scale: 1.02 } : {}}
              whileTap={!game.disabled ? { scale: 0.98 } : {}}
            >
              {game.disabled ? 'Coming Soon' : 'Play Now'}
            </motion.button>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Play games to earn more coins. Higher bets mean higher rewards!
        </p>
      </div>
    </div>
  );
};

export default Games; 