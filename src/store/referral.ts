import { create } from 'zustand';
import { api } from '@/services/api';
import { performanceMonitor } from '@/services/performance';
import type { ReferralState, ReferralTier, ReferralAchievement, ReferralRewards } from '@/types/referral';
import '@/types/telegram';

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
    achievements: []
  },
  {
    level: 2,
    name: 'Silver',
    requiredReferrals: 5,
    bonusMultiplier: 1.2,
    rewards: {
      perReferral: 150,
      daily: 75,
      weekly: 300,
      monthly: 750
    },
    achievements: []
  },
  {
    level: 3,
    name: 'Gold',
    requiredReferrals: 20,
    bonusMultiplier: 1.5,
    rewards: {
      perReferral: 200,
      daily: 100,
      weekly: 400,
      monthly: 1000
    },
    achievements: []
  }
];

export const useReferralStore = create<ReferralState>((set, get) => ({
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
      set({ isLoading: true, error: null });
      const response = await api.get('/referral/generate');
      const { code } = response.data;
      const referralLink = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${code}`;
      set({ referralCode: code, referralLink });
      return referralLink;
    } catch (error) {
      set({ error: 'Failed to generate referral link' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchReferralStats: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/referral/stats');
      const { count, rewards, history } = response.data;
      
      // Update tier based on referral count
      const currentTier = REFERRAL_TIERS.find(tier => tier.requiredReferrals <= count) || REFERRAL_TIERS[0];
      const nextTier = REFERRAL_TIERS.find(tier => tier.requiredReferrals > count);

      set({
        referralCount: count,
        referralRewards: rewards,
        referralHistory: history,
        currentTier,
        nextTier
      });
    } catch (error) {
      set({ error: 'Failed to fetch referral stats' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  shareReferralLink: async () => {
    const { referralLink } = get();
    if (!referralLink) {
      throw new Error('No referral link available');
    }

    try {
      if (window.Telegram?.WebApp?.shareUrl) {
        await window.Telegram.WebApp.shareUrl(referralLink);
        performanceMonitor.recordReferralShare();
      } else {
        await navigator.clipboard.writeText(referralLink);
        // Show success message
      }
    } catch (error) {
      set({ error: 'Failed to share referral link' });
      throw error;
    }
  },

  claimSpecialReward: async (type: 'daily' | 'weekly' | 'monthly') => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post(`/referral/claim/${type}`);
      const { reward } = response.data;
      
      set(state => ({
        referralRewards: state.referralRewards + reward,
        specialRewards: {
          ...state.specialRewards,
          [`last${type.charAt(0).toUpperCase() + type.slice(1)}Claim`]: new Date().toISOString()
        }
      }));

      performanceMonitor.recordReferralRewardClaim(reward);
      return reward;
    } catch (error) {
      set({ error: `Failed to claim ${type} reward` });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  checkAchievements: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/referral/achievements');
      const { achievements } = response.data;
      
      set({ achievements });
      
      // Check for new achievements
      achievements.forEach((achievement: ReferralAchievement) => {
        if (!achievement.unlockedAt) {
          performanceMonitor.recordReferralConversion();
        }
      });
    } catch (error) {
      set({ error: 'Failed to check achievements' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
})); 