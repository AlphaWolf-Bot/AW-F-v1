import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal = ({ onClose }: SettingsModalProps) => {
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

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
            <h3 className="text-xl font-bold text-[#ffd700]">Settings</h3>
            <button 
              className="text-gray-400 hover:text-white"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-2">Notifications</label>
              <div className="flex items-center justify-between">
                <span>Push Notifications</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={notifications}
                    onChange={() => setNotifications(!notifications)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>

            <div>
              <label className="block mb-2">Sound Effects</label>
              <div className="flex items-center justify-between">
                <span>Game Sounds</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={soundEffects}
                    onChange={() => setSoundEffects(!soundEffects)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>

            <div>
              <label className="block mb-2">Contact Support</label>
              <button className="task-btn w-full">
                Contact Support
              </button>
            </div>

            <div>
              <label className="block mb-2">About</label>
              <div className="text-sm text-gray-400">
                <p>Alpha Wulf v1.0.0</p>
                <p className="mt-1">© 2025 Alpha Wulf</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsModal; 