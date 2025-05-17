export interface ReferralRewards {
  perReferral: number;
  daily: number;
  weekly: number;
  monthly: number;
}

export interface ReferralAchievement {
  id: string;
  name: string;
  description: string;
  reward: number;
  requirement: number;
  type: 'referral_count' | 'special';
  icon: string;
  unlockedAt?: string;
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
  nextTier: ReferralTier | undefined;
  achievements: ReferralAchievement[];
  specialRewards: SpecialRewards;
  isLoading: boolean;
  error: string | null;

  generateReferralLink: () => Promise<string>;
  fetchReferralStats: () => Promise<void>;
  shareReferralLink: () => Promise<void>;
  claimSpecialReward: (type: 'daily' | 'weekly' | 'monthly') => Promise<number>;
  checkAchievements: () => Promise<void>;
} 