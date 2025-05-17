import { socketService } from './socket';
import { useAuthStore } from '../store/auth';
import { useGameStore } from '../store/game';
import { useAchievementStore } from '../store/achievement';
import { useTransactionStore } from '../store/transaction';

// Event types
interface UserUpdate {
  id: string;
  username?: string;
  level?: number;
  coinBalance?: number;
  tapsRemaining?: number;
}

interface CoinsUpdate {
  balance: number;
  change: number;
  reason: string;
  timestamp: string;
}

interface LevelUpdate {
  level: number;
  experience: number;
  experienceToNext: number;
  rewards?: {
    coins: number;
    items?: string[];
  };
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

interface WithdrawalUpdate {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  method: string;
  timestamp: string;
}

interface AdEvent {
  id: string;
  type: 'impression' | 'click' | 'reward';
  amount?: number;
  timestamp: string;
}

export const setupSocketEvents = () => {
  const authStore = useAuthStore.getState();
  const gameStore = useGameStore.getState();
  const achievementStore = useAchievementStore.getState();
  const transactionStore = useTransactionStore.getState();

  // User events
  socketService.on('user:update', (data: UserUpdate) => {
    authStore.updateUser(data);
  });

  socketService.on('user:levelUp', (data: LevelUpdate) => {
    gameStore.setLevel(data.level);
    gameStore.setExperience(data.experience);
    gameStore.setExperienceToNext(data.experienceToNext);
    
    if (data.rewards) {
      gameStore.addCoins(data.rewards.coins);
      if (data.rewards.items) {
        gameStore.addItems(data.rewards.items);
      }
    }
  });

  // Achievement events
  socketService.on('user:achievement', (data: Achievement) => {
    achievementStore.addAchievement(data);
  });

  // Coin events
  socketService.on('coins:update', (data: CoinsUpdate) => {
    gameStore.setCoins(data.balance);
    transactionStore.addTransaction({
      id: Date.now().toString(),
      type: data.change > 0 ? 'credit' : 'debit',
      amount: Math.abs(data.change),
      reason: data.reason,
      timestamp: data.timestamp,
    });
  });

  // Withdrawal events
  socketService.on('withdrawal:status', (data: WithdrawalUpdate) => {
    transactionStore.updateWithdrawal(data);
  });

  // Ad events
  socketService.on('ad:impression', (data: AdEvent) => {
    gameStore.recordAdImpression(data.id);
  });

  socketService.on('ad:click', (data: AdEvent) => {
    gameStore.recordAdClick(data.id);
  });

  socketService.on('ad:reward', (data: AdEvent) => {
    if (data.amount) {
      gameStore.addCoins(data.amount);
      transactionStore.addTransaction({
        id: data.id,
        type: 'credit',
        amount: data.amount,
        reason: 'ad_reward',
        timestamp: data.timestamp,
      });
    }
  });

  // Error handling
  socketService.on('error', (error: Error) => {
    console.error('Socket error:', error);
    // You might want to show a notification to the user here
  });

  socketService.on('connection:failed', (data: { error: string; attempts: number }) => {
    console.error('Connection failed:', data);
    // You might want to show a reconnection dialog to the user here
  });
};

export const cleanupSocketEvents = () => {
  // Remove all event listeners
  socketService.off('user:update', () => {});
  socketService.off('user:levelUp', () => {});
  socketService.off('user:achievement', () => {});
  socketService.off('coins:update', () => {});
  socketService.off('withdrawal:status', () => {});
  socketService.off('ad:impression', () => {});
  socketService.off('ad:click', () => {});
  socketService.off('ad:reward', () => {});
  socketService.off('error', () => {});
  socketService.off('connection:failed', () => {});
}; 