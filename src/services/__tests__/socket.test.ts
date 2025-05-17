import { socketService } from '../socket';
import { io } from 'socket.io-client';

jest.mock('socket.io-client');

describe('SocketService', () => {
  const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    connected: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (io as jest.Mock).mockReturnValue(mockSocket);
  });

  describe('Connection Management', () => {
    it('should not connect without token', () => {
      socketService.connect();
      expect(io).not.toHaveBeenCalled();
    });

    it('should connect with token', () => {
      localStorage.setItem('token', 'test-token');
      socketService.connect();
      expect(io).toHaveBeenCalledWith(expect.any(String), {
        auth: { token: 'test-token' },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });
    });

    it('should not reconnect if already connected', () => {
      mockSocket.connected = true;
      socketService.connect();
      expect(mockSocket.connect).not.toHaveBeenCalled();
    });

    it('should handle disconnect', () => {
      socketService.disconnect();
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('Event Handling', () => {
    let callback: Function;

    beforeEach(() => {
      localStorage.setItem('token', 'test-token');
      socketService.connect();
      callback = mockSocket.on.mock.calls[0][1];
    });

    it('should handle user update events', () => {
      const mockCallback = jest.fn();
      socketService.on('user:update', mockCallback);

      const updateData = {
        id: '1',
        coinBalance: 1000,
      };
      callback(updateData);

      expect(mockCallback).toHaveBeenCalledWith(updateData);
    });

    it('should handle level up events', () => {
      const mockCallback = jest.fn();
      socketService.on('user:levelUp', mockCallback);

      const levelData = {
        level: 2,
        experience: 100,
        experienceToNext: 200,
      };
      callback(levelData);

      expect(mockCallback).toHaveBeenCalledWith(levelData);
    });

    it('should handle achievement events', () => {
      const mockCallback = jest.fn();
      socketService.on('user:achievement', mockCallback);

      const achievementData = {
        id: '1',
        name: 'First Win',
        description: 'Win your first game',
        icon: '🏆',
        unlockedAt: '2024-01-01T00:00:00Z',
      };
      callback(achievementData);

      expect(mockCallback).toHaveBeenCalledWith(achievementData);
    });

    it('should handle coin update events', () => {
      const mockCallback = jest.fn();
      socketService.on('coins:update', mockCallback);

      const coinData = {
        balance: 1000,
        change: 100,
        reason: 'game_win',
        timestamp: '2024-01-01T00:00:00Z',
      };
      callback(coinData);

      expect(mockCallback).toHaveBeenCalledWith(coinData);
    });

    it('should handle withdrawal events', () => {
      const mockCallback = jest.fn();
      socketService.on('withdrawal:status', mockCallback);

      const withdrawalData = {
        id: '1',
        status: 'completed',
        amount: 100,
        method: 'telegram',
        timestamp: '2024-01-01T00:00:00Z',
      };
      callback(withdrawalData);

      expect(mockCallback).toHaveBeenCalledWith(withdrawalData);
    });

    it('should handle ad events', () => {
      const mockCallback = jest.fn();
      socketService.on('ad:impression', mockCallback);

      const adData = {
        id: '1',
        type: 'impression',
        timestamp: '2024-01-01T00:00:00Z',
      };
      callback(adData);

      expect(mockCallback).toHaveBeenCalledWith(adData);
    });

    it('should handle system events', () => {
      const mockCallback = jest.fn();
      socketService.on('system:maintenance', mockCallback);

      const systemData = {
        startTime: '2024-01-01T00:00:00Z',
        duration: 3600,
      };
      callback(systemData);

      expect(mockCallback).toHaveBeenCalledWith(systemData);
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors', () => {
      const mockCallback = jest.fn();
      socketService.on('connection:failed', mockCallback);

      const errorCallback = mockSocket.on.mock.calls.find(
        call => call[0] === 'connect_error'
      )[1];
      errorCallback(new Error('Connection failed'));

      expect(mockCallback).toHaveBeenCalledWith({
        error: 'Failed to connect to server',
        attempts: 1,
      });
    });

    it('should handle socket errors', () => {
      const mockCallback = jest.fn();
      socketService.on('error', mockCallback);

      const errorCallback = mockSocket.on.mock.calls.find(
        call => call[0] === 'error'
      )[1];
      errorCallback(new Error('Socket error'));

      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe('Event Cleanup', () => {
    it('should remove event listeners', () => {
      const mockCallback = jest.fn();
      socketService.on('user:update', mockCallback);
      socketService.off('user:update', mockCallback);

      const updateData = { id: '1' };
      const callback = mockSocket.on.mock.calls[0][1];
      callback(updateData);

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });
}); 