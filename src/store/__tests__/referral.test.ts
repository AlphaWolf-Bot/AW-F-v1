import { renderHook, act } from '@testing-library/react-hooks';
import { useReferralStore } from '../referral';
import api from '@/services/api';
import { performanceMonitor } from '@/services/performance';

// Mock dependencies
jest.mock('@/services/api');
jest.mock('@/services/performance');

describe('Referral Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    act(() => {
      useReferralStore.setState({
        referralCode: null,
        referralLink: null,
        referralCount: 0,
        referralRewards: 0,
        referralHistory: [],
        currentTier: {
          level: 1,
          name: 'Bronze',
          requiredReferrals: 0,
          bonusMultiplier: 1,
          rewards: {
            joinBonus: 100,
            withdrawalBonus: 0.1,
            specialRewards: {
              dailyBonus: 10,
              weeklyBonus: 50,
              monthlyBonus: 200,
            },
          },
          achievements: [],
        },
        nextTier: {
          level: 2,
          name: 'Silver',
          requiredReferrals: 5,
          bonusMultiplier: 1.2,
          rewards: {
            joinBonus: 150,
            withdrawalBonus: 0.15,
            specialRewards: {
              dailyBonus: 20,
              weeklyBonus: 100,
              monthlyBonus: 400,
            },
          },
          achievements: [],
        },
        achievements: [],
        specialRewards: {
          lastDailyClaim: null,
          lastWeeklyClaim: null,
          lastMonthlyClaim: null,
        },
        isLoading: false,
        error: null,
      });
    });
  });

  describe('generateReferralLink', () => {
    it('should generate a referral link successfully', async () => {
      const mockResponse = { data: { referralCode: 'TEST123' } };
      (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useReferralStore());

      await act(async () => {
        await result.current.generateReferralLink();
      });

      expect(result.current.referralCode).toBe('TEST123');
      expect(result.current.referralLink).toBe('https://t.me/your_bot_username?start=TEST123');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle errors when generating referral link', async () => {
      const error = new Error('Failed to generate');
      (api.post as jest.Mock).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useReferralStore());

      await act(async () => {
        await result.current.generateReferralLink();
      });

      expect(result.current.error).toBe('Failed to generate');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('getReferralStats', () => {
    it('should fetch referral stats successfully', async () => {
      const mockResponse = {
        data: {
          referralCount: 10,
          referralRewards: 1000,
          specialRewards: {
            lastDailyClaim: null,
            lastWeeklyClaim: null,
            lastMonthlyClaim: null,
          },
        },
      };
      (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useReferralStore());

      await act(async () => {
        await result.current.getReferralStats();
      });

      expect(result.current.referralCount).toBe(10);
      expect(result.current.referralRewards).toBe(1000);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should update tier based on referral count', async () => {
      const mockResponse = {
        data: {
          referralCount: 6,
          referralRewards: 1000,
          specialRewards: {
            lastDailyClaim: null,
            lastWeeklyClaim: null,
            lastMonthlyClaim: null,
          },
        },
      };
      (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useReferralStore());

      await act(async () => {
        await result.current.getReferralStats();
      });

      expect(result.current.currentTier.name).toBe('Silver');
      expect(result.current.nextTier?.name).toBe('Gold');
    });
  });

  describe('getReferralHistory', () => {
    it('should fetch referral history successfully', async () => {
      const mockHistory = [
        {
          id: '1',
          username: 'user1',
          joinedAt: '2024-01-01T00:00:00Z',
          reward: 100,
          status: 'pending',
        },
      ];
      (api.get as jest.Mock).mockResolvedValueOnce({ data: mockHistory });

      const { result } = renderHook(() => useReferralStore());

      await act(async () => {
        await result.current.getReferralHistory();
      });

      expect(result.current.referralHistory).toEqual(mockHistory);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('shareReferralLink', () => {
    it('should share referral link via Telegram WebApp', async () => {
      const mockWebApp = {
        shareUrl: jest.fn().mockResolvedValue(undefined),
      };
      window.Telegram = { WebApp: mockWebApp } as any;

      const { result } = renderHook(() => useReferralStore());

      act(() => {
        useReferralStore.setState({
          referralLink: 'https://t.me/your_bot_username?start=TEST123',
        });
      });

      await act(async () => {
        await result.current.shareReferralLink();
      });

      expect(mockWebApp.shareUrl).toHaveBeenCalledWith({
        url: 'https://t.me/your_bot_username?start=TEST123',
        text: expect.any(String),
      });
      expect(performanceMonitor.recordReferralShare).toHaveBeenCalled();
    });

    it('should fallback to clipboard if Telegram WebApp is not available', async () => {
      const mockClipboard = {
        writeText: jest.fn().mockResolvedValue(undefined),
      };
      Object.assign(navigator, { clipboard: mockClipboard });

      const { result } = renderHook(() => useReferralStore());

      act(() => {
        useReferralStore.setState({
          referralLink: 'https://t.me/your_bot_username?start=TEST123',
        });
      });

      await act(async () => {
        await result.current.shareReferralLink();
      });

      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        'https://t.me/your_bot_username?start=TEST123'
      );
      expect(result.current.error).toBe('Link copied to clipboard!');
    });
  });

  describe('claimReferralReward', () => {
    it('should claim reward successfully', async () => {
      const mockResponse = { data: { success: true } };
      (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useReferralStore());

      await act(async () => {
        await result.current.claimReferralReward('123');
      });

      expect(api.post).toHaveBeenCalledWith('/referrals/123/claim');
      expect(performanceMonitor.recordReferralRewardClaim).toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('claimSpecialReward', () => {
    it('should claim daily reward successfully', async () => {
      const mockResponse = {
        data: {
          reward: 10,
          timestamp: new Date().toISOString(),
        },
      };
      (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useReferralStore());

      await act(async () => {
        await result.current.claimSpecialReward('daily');
      });

      expect(result.current.specialRewards.lastDailyClaim).toBe(mockResponse.data.timestamp);
      expect(result.current.referralRewards).toBe(10);
      expect(performanceMonitor.recordMetric).toHaveBeenCalledWith(
        'special_reward_claim',
        10,
        { type: 'daily' }
      );
    });

    it('should handle errors when claiming special reward', async () => {
      const error = new Error('Failed to claim');
      (api.post as jest.Mock).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useReferralStore());

      await act(async () => {
        await result.current.claimSpecialReward('daily');
      });

      expect(result.current.error).toBe('Failed to claim');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('checkAchievements', () => {
    it('should unlock new achievements when requirements are met', async () => {
      const mockResponse = { data: { success: true } };
      (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useReferralStore());

      act(() => {
        useReferralStore.setState({
          referralCount: 5,
          referralRewards: 1000,
        });
      });

      await act(async () => {
        await result.current.checkAchievements();
      });

      expect(api.post).toHaveBeenCalledWith('/referrals/achievements', {
        achievements: expect.arrayContaining([
          expect.objectContaining({
            id: 'silver_5',
            type: 'referral_count',
          }),
          expect.objectContaining({
            id: 'silver_rewards',
            type: 'referral_rewards',
          }),
        ]),
      });
      expect(performanceMonitor.recordMetric).toHaveBeenCalledWith(
        'achievement_unlocked',
        expect.any(Number),
        expect.any(Object)
      );
    });
  });

  describe('getTierProgress', () => {
    it('should calculate progress correctly', () => {
      const { result } = renderHook(() => useReferralStore());

      act(() => {
        useReferralStore.setState({
          referralCount: 3,
          currentTier: {
            level: 1,
            name: 'Bronze',
            requiredReferrals: 0,
            bonusMultiplier: 1,
            rewards: {
              joinBonus: 100,
              withdrawalBonus: 0.1,
              specialRewards: {
                dailyBonus: 10,
                weeklyBonus: 50,
                monthlyBonus: 200,
              },
            },
            achievements: [],
          },
          nextTier: {
            level: 2,
            name: 'Silver',
            requiredReferrals: 5,
            bonusMultiplier: 1.2,
            rewards: {
              joinBonus: 150,
              withdrawalBonus: 0.15,
              specialRewards: {
                dailyBonus: 20,
                weeklyBonus: 100,
                monthlyBonus: 400,
              },
            },
            achievements: [],
          },
        });
      });

      const progress = result.current.getTierProgress();
      expect(progress).toEqual({
        current: 3,
        next: 5,
        percentage: 60,
      });
    });

    it('should handle max tier case', () => {
      const { result } = renderHook(() => useReferralStore());

      act(() => {
        useReferralStore.setState({
          referralCount: 30,
          currentTier: {
            level: 4,
            name: 'Platinum',
            requiredReferrals: 30,
            bonusMultiplier: 2,
            rewards: {
              joinBonus: 300,
              withdrawalBonus: 0.25,
              specialRewards: {
                dailyBonus: 50,
                weeklyBonus: 250,
                monthlyBonus: 1000,
              },
            },
            achievements: [],
          },
          nextTier: null,
        });
      });

      const progress = result.current.getTierProgress();
      expect(progress).toEqual({
        current: 30,
        next: 0,
        percentage: 100,
      });
    });
  });
}); 