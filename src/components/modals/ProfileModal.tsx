import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';

interface ProfileModalProps {
  onClose: () => void;
}

const ProfileModal = ({ onClose }: ProfileModalProps) => {
  const { userLevel, coinBalance } = useStore();
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-[#1f1f1f] border-2 border-[#ffd700] rounded-lg w-[90%] max-w-[400px] p-5"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-[#ffd700]">Your Profile</h3>
            <button 
              className="text-gray-400 hover:text-white"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          <div className="text-center mb-4">
            <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center">
              <i className="fas fa-user text-3xl"></i>
            </div>
            <h4 className="text-lg font-bold">
              {user?.first_name} {user?.last_name}
            </h4>
            <p className="text-sm text-gray-400">
              Joined: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Level:</span>
              <span className="text-[#ffd700]">{userLevel.current}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Coins Earned:</span>
              <span className="text-[#ffd700]">{coinBalance}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Withdrawals:</span>
              <span className="text-[#ffd700]">0 INR</span>
            </div>
            <div className="flex justify-between">
              <span>Referrals:</span>
              <span className="text-[#ffd700]">3</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileModal; 