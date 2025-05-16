import React, { useEffect, useState } from 'react';
import { adsAPI } from '../../services/api';
import { useUser } from '../../contexts/UserContext';

interface BannerAdProps {
  containerId: string;
  onError?: (error: string) => void;
}

export const BannerAd: React.FC<BannerAdProps> = ({ containerId, onError }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshUser } = useUser();

  useEffect(() => {
    loadAd();
  }, []);

  const loadAd = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adsAPI.getAd('banner');
      const ad = response.data;

      if (!ad) {
        setError('No ad available');
        onError?.('No ad available');
        return;
      }

      const adContainer = document.getElementById(containerId);
      if (!adContainer) {
        throw new Error('Ad container not found');
      }

      const adElement = document.createElement('ins');
      adElement.className = 'adsbygoogle';
      adElement.style.display = 'block';
      adElement.setAttribute('data-ad-client', ad.publisherId);
      adElement.setAttribute('data-ad-slot', ad.adUnitId);
      adElement.setAttribute('data-ad-format', 'auto');
      adElement.setAttribute('data-full-width-responsive', 'true');

      adContainer.appendChild(adElement);
      (window.adsbygoogle = window.adsbygoogle || []).push({});

      // Record ad impression
      await adsAPI.recordClick(ad.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load ad';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('Error loading banner ad:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async () => {
    try {
      const response = await adsAPI.getAd('banner');
      const ad = response.data;
      if (ad) {
        await adsAPI.recordClick(ad.id);
        await refreshUser(); // Refresh user data after ad interaction
      }
    } catch (err) {
      console.error('Error recording ad click:', err);
    }
  };

  if (loading) {
    return <div className="ad-loading">Loading ad...</div>;
  }

  if (error) {
    return <div className="ad-error">{error}</div>;
  }

  return (
    <div 
      id={containerId} 
      className="banner-ad-container"
      onClick={handleClick}
    />
  );
}; 