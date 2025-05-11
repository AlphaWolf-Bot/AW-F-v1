import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileModal from '../modals/ProfileModal';
import SettingsModal from '../modals/SettingsModal';

const Header = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header className="py-4 flex justify-between items-center">
      <div className="flex items-center">
        <img 
          src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f43a.svg" 
          alt="Wolf" 
          className="w-10 h-10 mr-2"
        />
        <h1 className="text-2xl font-bold text-[#ffd700]">Alpha Wulf</h1>
      </div>
      
      <div className="flex space-x-3">
        <button 
          onClick={() => setShowProfile(true)}
          className="text-xl hover:text-[#ffd700] transition-colors"
        >
          <i className="fas fa-user-circle"></i>
        </button>
        <button 
          onClick={() => setShowSettings(true)}
          className="text-xl hover:text-[#ffd700] transition-colors"
        >
          <i className="fas fa-cog"></i>
        </button>
      </div>

      <AnimatePresence>
        {showProfile && (
          <ProfileModal onClose={() => setShowProfile(false)} />
        )}
        {showSettings && (
          <SettingsModal onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header; 