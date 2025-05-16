import React, { useState, useEffect } from 'react';
import { adsAPI } from '../../services/api';

interface InterstitialAdProps {
  onClose?: () => void;
  onAdClick?: () => void;
}

const InterstitialAd: React.FC<InterstitialAdProps> = ({ onClose, onAdClick }) => {
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    loadAd();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const loadAd = async () => {
    try {
      setLoading(true);
      const response = await adsAPI.getAd('interstitial');
      setAd(response.data);
    } catch (err) {
      setError('Failed to load ad');
      console.error('Error loading interstitial ad:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async () => {
    if (!ad) return;
    
    try {
      await adsAPI.recordClick(ad.adId);
      onAdClick?.();
    } catch (err) {
      console.error('Error recording ad click:', err);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-center">Loading ad...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <p className="text-red-500">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <p>No ad available</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{ad.title}</h2>
          {countdown > 0 ? (
            <span className="text-gray-500">Skip in {countdown}s</span>
          ) : (
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              Skip
            </button>
          )}
        </div>
        <div 
          className="mb-4 cursor-pointer"
          onClick={handleClick}
        >
          <img 
            src={ad.content} 
            alt={ad.title}
            className="w-full h-64 object-cover rounded"
          />
        </div>
        <p className="text-sm text-gray-500 text-center">
          Advertisement
        </p>
      </div>
    </div>
  );
};

export default InterstitialAd; 