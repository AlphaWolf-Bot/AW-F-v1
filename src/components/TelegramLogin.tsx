import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

const TelegramLogin = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initTelegram = async () => {
      try {
        if (!window.Telegram?.WebApp) {
          throw new Error('Telegram Web App not available');
        }

        // Initialize Telegram Web App
        window.Telegram.WebApp.ready();
        
        // Get init data
        const initData = window.Telegram.WebApp.initData;
        if (!initData) {
          throw new Error('Telegram Web App not initialized properly');
        }

        // Attempt login
        await login(initData);
        navigate('/');
      } catch (error) {
        console.error('Login failed:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize Telegram Web App');
      } finally {
        setIsLoading(false);
      }
    };

    initTelegram();
  }, [login, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffd700] mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-[#ffd700] mb-4">Connecting to Telegram</h1>
          <p className="text-gray-400">Please wait while we authenticate your account</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#ffd700] text-gray-900 rounded-lg hover:bg-yellow-400 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default TelegramLogin; 