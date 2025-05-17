declare module '@/services/api' {
  export const api: {
    get: (url: string) => Promise<any>;
    post: (url: string, data?: any) => Promise<any>;
    put: (url: string, data?: any) => Promise<any>;
    delete: (url: string) => Promise<any>;
  };
}

declare module '@/services/performance' {
  export const performanceMonitor: {
    recordReferralShare: () => void;
    recordReferralClick: () => void;
    recordReferralConversion: () => void;
    recordReferralRewardClaim: (amount: number) => void;
  };
}

declare module '@/types/referral' {
  export interface ReferralAchievement {
    id: string;
    name: string;
    description: string;
    reward: number;
    requirement: number;
    type: 'referral_count' | 'referral_rewards';
    icon: string;
    unlockedAt?: string;
  }

  export interface ReferralRewards {
    perReferral: number;
    daily: number;
    weekly: number;
    monthly: number;
  }

  export interface ReferralTier {
    level: number;
    name: string;
    requiredReferrals: number;
    bonusMultiplier: number;
    rewards: ReferralRewards;
    achievements: ReferralAchievement[];
  }

  export interface ReferralHistory {
    id: string;
    username: string;
    joinedAt: string;
    reward: number;
    status: 'pending' | 'claimed';
  }

  export interface SpecialRewards {
    lastDailyClaim: string | null;
    lastWeeklyClaim: string | null;
    lastMonthlyClaim: string | null;
  }

  export interface ReferralState {
    referralCode: string;
    referralLink: string;
    referralCount: number;
    referralRewards: number;
    referralHistory: ReferralHistory[];
    currentTier: ReferralTier;
    nextTier: ReferralTier;
    achievements: ReferralAchievement[];
    specialRewards: SpecialRewards;
    isLoading: boolean;
    error: string | null;

    generateReferralLink: () => Promise<string>;
    getReferralStats: () => Promise<{ count: number; rewards: number; history: ReferralHistory[] }>;
    shareReferralLink: () => Promise<void>;
    claimReferralReward: (referralId: string) => Promise<number>;
    claimSpecialReward: (type: 'daily' | 'weekly' | 'monthly') => Promise<number>;
    getTierProgress: () => number;
  }
} 