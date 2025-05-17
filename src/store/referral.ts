import { create } from 'zustand';
import { api } from '@/services/api';
import { performanceMonitor } from '@/services/performance';
import type { ReferralState, ReferralTier, ReferralAchievement, ReferralHistory } from '@/types/referral';

const TELEGRAM_BOT_USERNAME = 'AlphaWulfBot';

const REFERRAL_TIERS: ReferralTier[] = [
  {
    level: 1,
    name: 'Bronze',
    requiredReferrals: 0,
    bonusMultiplier: 1,
    rewards: {
      perReferral: 100,
      daily: 50,
      weekly: 200,
      monthly: 500
    },
    achievements: [
      {
        id: 'first_referral',
        name: 'First Referral',
        description: 'Get your first referral',
        reward: 100,
        requirement: 1,
        type: 'referral_count',
        icon: '🎯'
      }
    ]
  },
  {
    level: 2,
    name: 'Silver',
    requiredReferrals: 5,
    bonusMultiplier: 1.5,
    rewards: {
      perReferral: 150,
      daily: 75,
      weekly: 300,
      monthly: 750
    },
    achievements: [
      {
        id: 'silver_achiever',
        name: 'Silver Achiever',
        description: 'Reach Silver tier',
        reward: 500,
        requirement: 5,
        type: 'referral_count',
        icon: '🥈'
      }
    ]
  },
  {
    level: 3,
    name: 'Gold',
    requiredReferrals: 20,
    bonusMultiplier: 2,
    rewards: {
      perReferral: 200,
      daily: 100,
      weekly: 400,
      monthly: 1000
    },
    achievements: [
      {
        id: 'gold_master',
        name: 'Gold Master',
        description: 'Reach Gold tier',
        reward: 1000,
        requirement: 20,
        type: 'referral_count',
        icon: '🥇'
      }
    ]
  },
  {
    level: 4,
    name: 'Platinum',
    requiredReferrals: 50,
    bonusMultiplier: 3,
    rewards: {
      perReferral: 300,
      daily: 150,
      weekly: 600,
      monthly: 1500
    },
    achievements: [
      {
        id: 'platinum_elite',
        name: 'Platinum Elite',
        description: 'Reach Platinum tier',
        reward: 2000,
        requirement: 50,
        type: 'referral_count',
        icon: '💎'
      }
    ]
  }
];

export const useReferralStore = create<ReferralState>((set: (fn: (state: ReferralState) => Partial<ReferralState>) => void, get: () => ReferralState) => ({
  referralCode: '',
  referralLink: '',
  referralCount: 0,
  referralRewards: 0,
  referralHistory: [],
  currentTier: REFERRAL_TIERS[0],
  nextTier: REFERRAL_TIERS[1],
  achievements: [],
  specialRewards: {
    lastDailyClaim: null,
    lastWeeklyClaim: null,
    lastMonthlyClaim: null
  },
  isLoading: false,
  error: null,

  generateReferralLink: async () => {
    try {
      set(state => ({ ...state, isLoading: true, error: null }));
      const response = await api.get('/referrals/code');
      const code = response.data.code;
      const referralLink = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${code}`;
      set(state => ({ ...state, referralCode: code, referralLink }));
      return referralLink;
    } catch (error) {
      set(state => ({ ...state, error: 'Failed to generate referral link' }));
      throw error;
    } finally {
      set(state => ({ ...state, isLoading: false }));
    }
  },

  getReferralStats: async () => {
    try {
      set(state => ({ ...state, isLoading: true, error: null }));
      const response = await api.get('/referrals/stats');
      const { count, rewards, history } = response.data;
      
      // Update tier based on referral count
      const currentTier = REFERRAL_TIERS.find(tier => tier.requiredReferrals <= count) || REFERRAL_TIERS[0];
      const nextTier = REFERRAL_TIERS.find(tier => tier.requiredReferrals > count) || REFERRAL_TIERS[REFERRAL_TIERS.length - 1];
      
      set(state => ({
        ...state,
        referralCount: count,
        referralRewards: rewards,
        referralHistory: history,
        currentTier,
        nextTier
      }));

      // Check for achievements
      const newAchievements: ReferralAchievement[] = [];
      currentTier.achievements.forEach((achievement: ReferralAchievement) => {
        if (!get().achievements.find((a: ReferralAchievement) => a.id === achievement.id)) {
          newAchievements.push({
            ...achievement,
            unlockedAt: new Date().toISOString()
          });
        }
      });

      if (newAchievements.length > 0) {
        await api.post('/referrals/achievements', { achievements: newAchievements });
        set(state => ({
          ...state,
          achievements: [...state.achievements, ...newAchievements]
        }));
      }

      return { count, rewards, history };
    } catch (error) {
      set(state => ({ ...state, error: 'Failed to fetch referral stats' }));
      throw error;
    } finally {
      set(state => ({ ...state, isLoading: false }));
    }
  },

  shareReferralLink: async () => {
    try {
      const { referralLink } = get();
      if (!referralLink) {
        throw new Error('No referral link available');
      }

      if (window.Telegram?.WebApp) {
        await window.Telegram.WebApp.shareUrl(referralLink);
        performanceMonitor.recordReferralShare();
      } else {
        await navigator.clipboard.writeText(referralLink);
        performanceMonitor.recordReferralShare();
      }
    } catch (error) {
      set(state => ({ ...state, error: 'Failed to share referral link' }));
      throw error;
    }
  },

  claimReferralReward: async (referralId: string) => {
    try {
      set(state => ({ ...state, isLoading: true, error: null }));
      const response = await api.post(`/referrals/${referralId}/claim`);
      const { reward } = response.data;
      
      set(state => ({
        ...state,
        referralRewards: state.referralRewards + reward,
        referralHistory: state.referralHistory.map((referral: ReferralHistory) =>
          referral.id === referralId
            ? { ...referral, status: 'claimed' }
            : referral
        )
      }));

      performanceMonitor.recordReferralRewardClaim(reward);
      return reward;
    } catch (error) {
      set(state => ({ ...state, error: 'Failed to claim reward' }));
      throw error;
    } finally {
      set(state => ({ ...state, isLoading: false }));
    }
  },

  claimSpecialReward: async (type: 'daily' | 'weekly' | 'monthly') => {
    try {
      set(state => ({ ...state, isLoading: true, error: null }));
      const response = await api.post(`/referrals/special-rewards/${type}`);
      const { reward } = response.data;
      
      set(state => ({
        ...state,
        referralRewards: state.referralRewards + reward,
        specialRewards: {
          ...state.specialRewards,
          [`last${type.charAt(0).toUpperCase() + type.slice(1)}Claim`]: new Date().toISOString()
        }
      }));

      performanceMonitor.recordReferralRewardClaim(reward);
      return reward;
    } catch (error) {
      set(state => ({ ...state, error: 'Failed to claim special reward' }));
      throw error;
    } finally {
      set(state => ({ ...state, isLoading: false }));
    }
  },

  getTierProgress: () => {
    const { currentTier, nextTier, referralCount } = get();
    if (!nextTier) return 100;
    
    const progress = ((referralCount - currentTier.requiredReferrals) /
      (nextTier.requiredReferrals - currentTier.requiredReferrals)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }
})); 