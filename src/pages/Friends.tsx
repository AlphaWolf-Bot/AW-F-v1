import { motion } from 'framer-motion';
import { useStore } from '../store';

const Friends = () => {
  const { coinBalance } = useStore();

  const friends = [
    {
      name: 'John Doe',
      level: 'Alpha Scout',
      joinedDate: '2024-02-15',
      coins: 2500
    },
    {
      name: 'Jane Smith',
      level: 'Alpha Pup',
      joinedDate: '2024-02-18',
      coins: 1200
    },
    {
      name: 'Mike Johnson',
      level: 'Alpha Hunter',
      joinedDate: '2024-02-10',
      coins: 5000
    }
  ];

  const referralCode = 'ALPHA123';

  return (
    <div className="py-4">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-[#ffd700] mb-2">Friends & Referrals</h2>
        <p className="text-3xl font-bold">{friends.length} Friends</p>
        <p className="text-sm text-gray-400 mt-1">Earn rewards for each friend who joins</p>
      </div>

      <div className="card p-4 mb-6">
        <h3 className="text-lg font-bold mb-3">Your Referral Code</h3>
        <div className="flex items-center justify-between bg-gray-800 p-3 rounded">
          <span className="text-xl font-mono">{referralCode}</span>
          <motion.button
            className="text-[#ffd700] hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigator.clipboard.writeText(referralCode)}
          >
            <i className="fas fa-copy"></i>
          </motion.button>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Share this code with friends to earn 100 coins for each referral
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">Your Friends</h3>
        {friends.map((friend, index) => (
          <motion.div
            key={friend.name}
            className="card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold">{friend.name}</h4>
                <p className="text-sm text-gray-400">
                  Level: {friend.level} • Joined: {friend.joinedDate}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[#ffd700] font-bold">{friend.coins} coins</p>
                <p className="text-xs text-gray-400">Earned</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <motion.button
          className="task-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Invite More Friends
        </motion.button>
      </div>
    </div>
  );
};

export default Friends; 