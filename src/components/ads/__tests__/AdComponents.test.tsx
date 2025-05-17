import { render, screen } from '@testing-library/react';
import { BannerAd } from '../BannerAd';
import { RewardedAd } from '../RewardedAd';
import { adsAPI } from '../../../services/api';

// Mock the API calls
jest.mock('../../../services/api', () => ({
  adsAPI: {
    getAd: jest.fn(),
    recordClick: jest.fn(),
    processReward: jest.fn(),
  },
}));

describe('Ad Components', () => {
  describe('BannerAd', () => {
    const mockAd = {
      adId: '123',
      title: 'Test Banner',
      content: 'test-image.jpg',
    };

    beforeEach(() => {
      jest.clearAllMocks();
      (adsAPI.getAd as jest.Mock).mockResolvedValue({ data: mockAd });
    });

    it('renders banner ad container', () => {
      render(<BannerAd />);
      expect(screen.getByTestId('banner-ad-container')).toBeInTheDocument();
    });

    it('renders banner ad correctly', async () => {
      render(<BannerAd />);
      
      await waitFor(() => {
        expect(screen.getByAltText('Test Banner')).toBeInTheDocument();
      });
    });

    it('handles ad click correctly', async () => {
      const onAdClick = jest.fn();
      render(<BannerAd onAdClick={onAdClick} />);
      
      await waitFor(() => {
        expect(screen.getByAltText('Test Banner')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByAltText('Test Banner'));
      
      expect(adsAPI.recordClick).toHaveBeenCalledWith('123');
      expect(onAdClick).toHaveBeenCalled();
    });

    it('handles error state correctly', async () => {
      (adsAPI.getAd as jest.Mock).mockRejectedValue(new Error('Failed to load'));
      render(<BannerAd />);
      
      await waitFor(() => {
        expect(screen.queryByAltText('Test Banner')).not.toBeInTheDocument();
      });
    });
  });

  describe('RewardedAd', () => {
    const mockAd = {
      adId: '123',
      title: 'Test Rewarded Ad',
      description: 'Watch this ad for rewards',
      content: 'test-image.jpg',
      rewardType: 'points',
      rewardAmount: 100,
    };

    beforeEach(() => {
      jest.clearAllMocks();
      (adsAPI.getAd as jest.Mock).mockResolvedValue({ data: mockAd });
    });

    it('renders rewarded ad container', () => {
      render(<RewardedAd />);
      expect(screen.getByTestId('rewarded-ad-container')).toBeInTheDocument();
    });

    it('renders rewarded ad correctly', async () => {
      render(<RewardedAd />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Rewarded Ad')).toBeInTheDocument();
        expect(screen.getByText('Watch this ad for rewards')).toBeInTheDocument();
        expect(screen.getByText('Watch for 100 points')).toBeInTheDocument();
      });
    });

    it('handles reward correctly', async () => {
      const onReward = jest.fn();
      const onClose = jest.fn();
      render(<RewardedAd onReward={onReward} onClose={onClose} />);
      
      await waitFor(() => {
        expect(screen.getByText('Watch for 100 points')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Watch for 100 points'));
      
      expect(adsAPI.processReward).toHaveBeenCalledWith('123');
      expect(onReward).toHaveBeenCalledWith({
        type: 'points',
        amount: 100,
      });
      expect(onClose).toHaveBeenCalled();
    });

    it('handles close correctly', async () => {
      const onClose = jest.fn();
      render(<RewardedAd onClose={onClose} />);
      
      await waitFor(() => {
        expect(screen.getByText('Skip')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Skip'));
      expect(onClose).toHaveBeenCalled();
    });

    it('handles error state correctly', async () => {
      (adsAPI.getAd as jest.Mock).mockRejectedValue(new Error('Failed to load'));
      render(<RewardedAd />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load ad')).toBeInTheDocument();
      });
    });
  });
}); 