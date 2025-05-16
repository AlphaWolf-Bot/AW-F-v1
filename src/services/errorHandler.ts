import { AxiosError } from 'axios';

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