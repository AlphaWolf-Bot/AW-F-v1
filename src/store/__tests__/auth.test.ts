import { renderHook, act } from '@testing-library/react-hooks';
import { useAuthStore } from '../auth';
import { authAPI } from '../../services/api';
import { socketService } from '../../services/socket';

// Mock dependencies
jest.mock('../../services/api');
jest.mock('../../services/socket');
jest.mock('../../services/security');

describe('Auth Store', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
    // Reset store state
    act(() => {
      useAuthStore.getState().logout();
    });
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useAuthStore());
      
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isLoading).toBeFalsy();
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBeFalsy();
    });

    it('should load token from localStorage if available', () => {
      const mockToken = 'test-token';
      localStorage.setItem('token', mockToken);

      const { result } = renderHook(() => useAuthStore());
      expect(result.current.token).toBe(mockToken);
    });
  });

  describe('Login Flow', () => {
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

    beforeEach(() => {
      // Mock Telegram WebApp
      (window as any).Telegram = {
        WebApp: {
          ready: jest.fn(),
          initData: 'test-init-data',
        },
      };
    });

    it('should handle successful login', async () => {
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
      expect(result.current.isAuthenticated).toBeTruthy();
      expect(localStorage.getItem('token')).toBe(mockToken);
      expect(socketService.connect).toHaveBeenCalled();
    });

    it('should handle login error', async () => {
      const errorMessage = 'Login failed';
      (authAPI.login as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await expect(result.current.login('test-init-data')).rejects.toThrow(errorMessage);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isLoading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isAuthenticated).toBeFalsy();
      expect(localStorage.getItem('token')).toBeNull();
      expect(socketService.connect).not.toHaveBeenCalled();
    });

    it('should handle missing Telegram WebApp', async () => {
      (window as any).Telegram = undefined;

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await expect(result.current.login('test-init-data')).rejects.toThrow('Telegram Web App not initialized');
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isLoading).toBeFalsy();
      expect(result.current.isAuthenticated).toBeFalsy();
    });
  });

  describe('Logout Flow', () => {
    it('should handle logout correctly', () => {
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
      expect(result.current.isAuthenticated).toBeFalsy();
      expect(localStorage.getItem('token')).toBeNull();
      expect(socketService.disconnect).toHaveBeenCalled();
    });
  });

  describe('User Data Updates', () => {
    it('should update user data correctly', () => {
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
      });

      // Update user data
      act(() => {
        result.current.updateUserData({
          coinBalance: 2000,
          level: 2,
        });
      });

      expect(result.current.user).toEqual({
        id: '1',
        telegramId: '123456789',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        coinBalance: 2000,
        totalEarned: 1000,
        level: 2,
        tapsRemaining: 100,
        referralCode: 'ABC123',
      });
    });

    it('should handle null user state', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.updateUserData({
          coinBalance: 2000,
        });
      });

      expect(result.current.user).toBeNull();
    });
  });

  describe('Real-time Updates', () => {
    it('should handle socket events correctly', () => {
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
      });

      // Simulate socket events
      act(() => {
        const socketCallback = (socketService.on as jest.Mock).mock.calls[0][1];
        socketCallback({ coinBalance: 2000 });
      });

      expect(result.current.user?.coinBalance).toBe(2000);
    });
  });
}); 