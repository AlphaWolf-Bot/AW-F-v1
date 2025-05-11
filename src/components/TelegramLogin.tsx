import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

const TelegramLogin = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const initTelegram = async () => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        
        try {
          await login(window.Telegram.WebApp.initData);
          navigate('/');
        } catch (error) {
          console.error('Login failed:', error);
        }
      }
    };

    initTelegram();
  }, [login, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#ffd700] mb-4">Loading...</h1>
        <p className="text-gray-400">Please wait while we connect to Telegram</p>
      </div>
    </div>
  );
};

export default TelegramLogin; 