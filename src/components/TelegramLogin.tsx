import { useEffect } from 'react';
import { useAuthStore } from '../store/auth';

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        ready: () => void;
        expand: () => void;
        close: () => void;
      };
    };
  }
}

export const TelegramLogin = () => {
  const { login, isLoading, error } = useAuthStore();

  useEffect(() => {
    // Initialize Telegram WebApp
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();

    // Handle login if initData is available
    if (window.Telegram.WebApp.initData) {
      login(window.Telegram.WebApp.initData);
    }
  }, [login]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return null;
}; 