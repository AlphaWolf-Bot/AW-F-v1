import { socketService } from '../socket';
import { setupSocketEvents, cleanupSocketEvents } from '../socketEvents';
import { useAuthStore } from '../../store/auth';
import { useGameStore } from '../../store/game';
import { useAchievementStore } from '../../store/achievement';
import { useTransactionStore } from '../../store/transaction';

// Mock the stores
jest.mock('../../store/auth', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      updateUser: jest.fn(),
    })),
  },
}));

jest.mock('../../store/game', () => ({
  useGameStore: {
    getState: jest.fn(() => ({
      setLevel: jest.fn(),
      setExperience: jest.fn(),
      setExperienceToNext: jest.fn(),
      addCoins: jest.fn(),
      addItems: jest.fn(),
      setCoins: jest.fn(),
      recordAdImpression: jest.fn(),
      recordAdClick: jest.fn(),
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
      updateWithdrawal: jest.fn(),
    })),
  },
}));

// Mock socket service
jest.mock('../socket', () => ({
  socketService: {
    on: jest.fn(),
    off: jest.fn(),
  },
}));

describe('Socket Events', () => {
  let authStore: any;
  let gameStore: any;
  let achievementStore: any;
  let transactionStore: any;

  beforeEach(() => {
    jest.clearAllMocks();
    authStore = useAuthStore.getState();
    gameStore = useGameStore.getState();
    achievementStore = useAchievementStore.getState();
    transactionStore = useTransactionStore.getState();
  });

  describe('setupSocketEvents', () => {
    it('should set up all event listeners', () => {
      setupSocketEvents();
      expect(socketService.on).toHaveBeenCalledTimes(11); // Total number of events
    });

    it('should handle user update events', () => {
      setupSocketEvents();
      const userUpdateCallback = (socketService.on as jest.Mock).mock.calls.find(
        call => call[0] === 'user:update'
      )[1];

      const userData = {
        id: '1',
        username: 'test',
        level: 2,
        coinBalance: 1000,
      };
      userUpdateCallback(userData);
      expect(authStore.updateUser).toHaveBeenCalledWith(userData);
    });

    it('should handle level up events', () => {
      setupSocketEvents();
      const levelUpCallback = (socketService.on as jest.Mock).mock.calls.find(
        call => call[0] === 'user:levelUp'
      )[1];

      const levelData = {
        level: 2,
        experience: 100,
        experienceToNext: 200,
        rewards: {
          coins: 100,
          items: ['item1', 'item2'],
        },
      };
      levelUpCallback(levelData);

      expect(gameStore.setLevel).toHaveBeenCalledWith(levelData.level);
      expect(gameStore.setExperience).toHaveBeenCalledWith(levelData.experience);
      expect(gameStore.setExperienceToNext).toHaveBeenCalledWith(levelData.experienceToNext);
      expect(gameStore.addCoins).toHaveBeenCalledWith(levelData.rewards.coins);
      expect(gameStore.addItems).toHaveBeenCalledWith(levelData.rewards.items);
    });

    it('should handle achievement events', () => {
      setupSocketEvents();
      const achievementCallback = (socketService.on as jest.Mock).mock.calls.find(
        call => call[0] === 'user:achievement'
      )[1];

      const achievementData = {
        id: '1',
        name: 'First Win',
        description: 'Win your first game',
        icon: '🏆',
        unlockedAt: '2024-01-01T00:00:00Z',
      };
      achievementCallback(achievementData);
      expect(achievementStore.addAchievement).toHaveBeenCalledWith(achievementData);
    });

    it('should handle coin update events', () => {
      setupSocketEvents();
      const coinUpdateCallback = (socketService.on as jest.Mock).mock.calls.find(
        call => call[0] === 'coins:update'
      )[1];

      const coinData = {
        balance: 1000,
        change: 100,
        reason: 'game_win',
        timestamp: '2024-01-01T00:00:00Z',
      };
      coinUpdateCallback(coinData);

      expect(gameStore.setCoins).toHaveBeenCalledWith(coinData.balance);
      expect(transactionStore.addTransaction).toHaveBeenCalledWith({
        id: expect.any(String),
        type: 'credit',
        amount: coinData.change,
        reason: coinData.reason,
        timestamp: coinData.timestamp,
      });
    });

    it('should handle withdrawal events', () => {
      setupSocketEvents();
      const withdrawalCallback = (socketService.on as jest.Mock).mock.calls.find(
        call => call[0] === 'withdrawal:status'
      )[1];

      const withdrawalData = {
        id: '1',
        status: 'completed',
        amount: 100,
        method: 'telegram',
        timestamp: '2024-01-01T00:00:00Z',
      };
      withdrawalCallback(withdrawalData);
      expect(transactionStore.updateWithdrawal).toHaveBeenCalledWith(withdrawalData);
    });

    it('should handle ad events', () => {
      setupSocketEvents();
      const adRewardCallback = (socketService.on as jest.Mock).mock.calls.find(
        call => call[0] === 'ad:reward'
      )[1];

      const adData = {
        id: '1',
        type: 'reward',
        amount: 50,
        timestamp: '2024-01-01T00:00:00Z',
      };
      adRewardCallback(adData);

      expect(gameStore.addCoins).toHaveBeenCalledWith(adData.amount);
      expect(transactionStore.addTransaction).toHaveBeenCalledWith({
        id: adData.id,
        type: 'credit',
        amount: adData.amount,
        reason: 'ad_reward',
        timestamp: adData.timestamp,
      });
    });
  });

  describe('cleanupSocketEvents', () => {
    it('should remove all event listeners', () => {
      cleanupSocketEvents();
      expect(socketService.off).toHaveBeenCalledTimes(11); // Total number of events
    });
  });
}); 