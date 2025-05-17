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
            first_name?: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          query_id?: string;
          auth_date?: number;
          hash?: string;
        };
      };
    };
  }
}

export {}; 