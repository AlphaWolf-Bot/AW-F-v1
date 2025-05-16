import React, { useState } from 'react';
import { adsAPI } from '../../services/api';
import { useUser } from '../../contexts/UserContext';

interface RewardedAdProps {
  onReward?: (reward: { type: string; amount: number }) => void;
  onError?: (error: string) => void;
}

export const RewardedAd: React.FC<RewardedAdProps> = ({ onReward, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshUser } = useUser();

  const showAd = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adsAPI.getAd('rewarded');
      const ad = response.data;

      if (!ad) {
        throw new Error('No ad available');
      }

      // Create and show rewarded ad
      const rewarded = new window.google.ads.AdManager.RewardedAd({
        adUnitId: ad.adUnitId,
        publisherId: ad.publisherId,
      });

      return new Promise<{ type: string; amount: number }>((resolve, reject) => {
        rewarded.onRewarded = async (reward: { type: string; amount: number }) => {
          try {
            // Process reward on server
            await adsAPI.processReward(ad.id);
            // Refresh user data
            await refreshUser();
            // Notify parent component
            onReward?.(reward);
            resolve(reward);
          } catch (err) {
            reject(err);
          }
        };

        rewarded.onError = (err: Error) => {
          const errorMessage = err.message || 'Failed to show rewarded ad';
          setError(errorMessage);
          onError?.(errorMessage);
          reject(err);
        };

        rewarded.load();
        rewarded.show();
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load ad';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('Error showing rewarded ad:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="ad-loading">Loading rewarded ad...</div>;
  }

  if (error) {
    return (
      <div className="ad-error">
        <p>{error}</p>
        <button 
          onClick={() => setError(null)}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={showAd}
      disabled={loading}
      className="rewarded-ad-button"
    >
      {loading ? 'Loading...' : 'Watch Ad for Reward'}
    </button>
  );
}; 