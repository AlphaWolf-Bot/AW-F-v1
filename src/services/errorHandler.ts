import { AxiosError } from 'axios';
import { api } from './api';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleApiError = (error: unknown): AppError => {
  if (error instanceof AxiosError) {
    const { response, code } = error;
    const message = response?.data?.message || error.message;
    const status = response?.status;
    const data = response?.data;

    // Handle specific error cases
    if (status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      return new AppError('Session expired. Please login again.', 'AUTH_EXPIRED', status, data);
    }

    if (status === 403) {
      return new AppError('You do not have permission to perform this action.', 'FORBIDDEN', status, data);
    }

    if (status === 404) {
      return new AppError('The requested resource was not found.', 'NOT_FOUND', status, data);
    }

    if (status === 429) {
      return new AppError('Too many requests. Please try again later.', 'RATE_LIMIT', status, data);
    }

    if (code === 'ECONNABORTED') {
      return new AppError('Request timed out. Please check your connection.', 'TIMEOUT', 408);
    }

    if (!navigator.onLine) {
      return new AppError('No internet connection. Please check your network.', 'OFFLINE', 0);
    }

    return new AppError(message, 'API_ERROR', status, data);
  }

  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR');
  }

  return new AppError('An unexpected error occurred.', 'UNKNOWN_ERROR');
};

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

export const getErrorMessage = (error: unknown): string => {
  if (isAppError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

interface ErrorLog {
  timestamp: string;
  error: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: ErrorLog[] = [];
  private isProcessing = false;
  private readonly maxQueueSize = 100;
  private readonly flushInterval = 5000; // 5 seconds

  private constructor() {
    this.setupErrorListeners();
    this.startPeriodicFlush();
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private setupErrorListeners(): void {
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message));
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason);
    });
  }

  private startPeriodicFlush(): void {
    setInterval(() => {
      this.flushErrors();
    }, this.flushInterval);
  }

  handleError(error: Error, context?: Record<string, any>): void {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      context,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
    };

    this.errorQueue.push(errorLog);

    if (this.errorQueue.length >= this.maxQueueSize) {
      this.flushErrors();
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error:', error);
      if (context) {
        console.error('Context:', context);
      }
    }
  }

  private async flushErrors(): Promise<void> {
    if (this.isProcessing || this.errorQueue.length === 0) return;

    this.isProcessing = true;
    const errorsToSend = [...this.errorQueue];
    this.errorQueue = [];

    try {
      await api.post('/logs/errors', { errors: errorsToSend });
    } catch (error) {
      // If sending fails, put errors back in queue
      this.errorQueue = [...errorsToSend, ...this.errorQueue];
      console.error('Failed to send error logs:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private getUserId(): string | undefined {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id;
    } catch {
      return undefined;
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2);
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }
}

export const errorHandler = ErrorHandler.getInstance(); 