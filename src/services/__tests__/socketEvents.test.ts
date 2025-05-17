import { socketService } from '../socket';
import { setupSocketEvents, cleanupSocketEvents } from '../socketEvents';
import { useGameStore } from '../../store/game';
import { useAchievementStore } from '../../store/achievement';
import { useTransactionStore } from '../../store/transaction';

jest.mock('../../store/game', () => ({
  useGameStore: {
    getState: jest.fn(() => ({
      updateLevel: jest.fn(),
      updateExperience: jest.fn(),
      updateTapsRemaining: jest.fn(),
    })),
  },
}));

jest.mock('../../store/achievement', () => ({
  useAchievementStore: {
    getState: jest.fn(() => ({
      addAchievement: jest.fn(),
    })),
  },
}));

jest.mock('../../store/transaction', () => ({
  useTransactionStore: {
    getState: jest.fn(() => ({
      addTransaction: jest.fn(),
    })),
  },
}));

describe('Socket Events', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanupSocketEvents();
  });

  it('sets up event listeners correctly', () => {
    const mockOn = jest.spyOn(socketService, 'on');
    setupSocketEvents();

    expect(mockOn).toHaveBeenCalledWith('user:update', expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith('user:levelUp', expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith('user:achievement', expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith('coins:update', expect.any(Function));
  });

  it('handles user update event', () => {
    const mockUpdateLevel = jest.fn();
    const mockUpdateExperience = jest.fn();
    const mockUpdateTapsRemaining = jest.fn();

    (useGameStore.getState as jest.Mock).mockReturnValue({
      updateLevel: mockUpdateLevel,
      updateExperience: mockUpdateExperience,
      updateTapsRemaining: mockUpdateTapsRemaining,
    });

    setupSocketEvents();

    const updateData = {
      level: 2,
      experience: 100,
      tapsRemaining: 50,
    };

    socketService.emit('user:update', updateData);

    expect(mockUpdateLevel).toHaveBeenCalledWith(updateData.level);
    expect(mockUpdateExperience).toHaveBeenCalledWith(updateData.experience);
    expect(mockUpdateTapsRemaining).toHaveBeenCalledWith(updateData.tapsRemaining);
  });

  it('handles achievement event', () => {
    const mockAddAchievement = jest.fn();
    (useAchievementStore.getState as jest.Mock).mockReturnValue({
      addAchievement: mockAddAchievement,
    });

    setupSocketEvents();

    const achievementData = {
      id: 'achievement-1',
      name: 'First Win',
      description: 'Win your first game',
      icon: '🏆',
      unlockedAt: new Date().toISOString(),
    };

    socketService.emit('user:achievement', achievementData);

    expect(mockAddAchievement).toHaveBeenCalledWith(achievementData);
  });

  it('handles coins update event', () => {
    const mockAddTransaction = jest.fn();
    (useTransactionStore.getState as jest.Mock).mockReturnValue({
      addTransaction: mockAddTransaction,
    });

    setupSocketEvents();

    const transactionData = {
      balance: 1100,
      change: 100,
      reason: 'game_win',
      timestamp: new Date().toISOString(),
    };

    socketService.emit('coins:update', transactionData);

    expect(mockAddTransaction).toHaveBeenCalledWith(transactionData);
  });
}); 