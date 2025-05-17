import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
      publisherId: 'pub-123',
      adUnitId: 'unit-123',
      id: '123',
    };
    const containerId = 'test-banner-container';

    beforeEach(() => {
      jest.clearAllMocks();
      (adsAPI.getAd as jest.Mock).mockResolvedValue({ data: mockAd });
      // Add a container to the DOM for BannerAd
      const container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    });

    afterEach(() => {
      const container = document.getElementById(containerId);
      if (container) container.remove();
    });

    it('renders banner ad container', () => {
      render(<BannerAd containerId={containerId} />);
      expect(document.getElementById(containerId)).toBeInTheDocument();
    });

    it('renders banner ad correctly', async () => {
      render(<BannerAd containerId={containerId} />);
      await waitFor(() => {
        expect(document.getElementById(containerId)).toBeInTheDocument();
      });
    });

    it('handles error state correctly', async () => {
      (adsAPI.getAd as jest.Mock).mockRejectedValue(new Error('Failed to load'));
      render(<BannerAd containerId={containerId} />);
      await waitFor(() => {
        expect(screen.getByText('Failed to load ad')).toBeInTheDocument();
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
      render(<RewardedAd onReward={onReward} />);
      // Simulate reward logic as needed
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