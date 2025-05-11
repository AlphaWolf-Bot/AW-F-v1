import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../auth';
import { authAPI } from '../../services/api';

// Mock the API
jest.mock('../../services/api', () => ({
  authAPI: {
    login: jest.fn(),
    me: jest.fn(),
  },
}));

describe('Auth Store', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAuthStore());
    
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeNull();
  });

  it('should handle successful login', async () => {
    const mockUser = {
      id: '1',
      telegramId: '123456789',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      coinBalance: 1000,
      totalEarned: 1000,
      level: 1,
      tapsRemaining: 100,
      referralCode: 'ABC123',
    };

    const mockToken = 'test-token';

    (authAPI.login as jest.Mock).mockResolvedValueOnce({
      data: {
        user: mockUser,
        token: mockToken,
      },
    });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login('test-init-data');
    });

    expect(authAPI.login).toHaveBeenCalledWith('test-init-data');
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeNull();
    expect(localStorage.getItem('token')).toBe(mockToken);
  });

  it('should handle login error', async () => {
    const errorMessage = 'Login failed';
    (authAPI.login as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login('test-init-data');
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBe(errorMessage);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should handle logout', () => {
    const { result } = renderHook(() => useAuthStore());

    // Set initial state
    act(() => {
      result.current.user = {
        id: '1',
        telegramId: '123456789',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        coinBalance: 1000,
        totalEarned: 1000,
        level: 1,
        tapsRemaining: 100,
        referralCode: 'ABC123',
      };
      result.current.token = 'test-token';
      localStorage.setItem('token', 'test-token');
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should handle successful user refresh', async () => {
    const mockUser = {
      id: '1',
      telegramId: '123456789',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      coinBalance: 1000,
      totalEarned: 1000,
      level: 1,
      tapsRemaining: 100,
      referralCode: 'ABC123',
    };

    (authAPI.me as jest.Mock).mockResolvedValueOnce({
      data: {
        user: mockUser,
      },
    });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.refreshUser();
    });

    expect(authAPI.me).toHaveBeenCalled();
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeNull();
  });

  it('should handle user refresh error', async () => {
    const errorMessage = 'Failed to refresh user data';
    (authAPI.me as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.refreshUser();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBe(errorMessage);
  });
}); 