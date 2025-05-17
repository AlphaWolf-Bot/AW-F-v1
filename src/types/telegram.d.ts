declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        shareUrl: (url: string) => Promise<void>;
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
      };
    };
  }
}

export {}; 