import { Platform } from 'react-native';

// AdMob configuration
const ADMOB_CONFIG = {
  publisherId: process.env.VITE_ADMOB_PUBLISHER_ID,
  adUnitIds: {
    banner: process.env.VITE_ADMOB_BANNER_WEB,
    interstitial: process.env.VITE_ADMOB_INTERSTITIAL_WEB,
    rewarded: process.env.VITE_ADMOB_REWARDED_WEB,
  },
};

// Initialize AdMob
export const initializeAdMob = async () => {
  try {
    // Load AdMob SDK
    await loadAdMobScript();
    
    // Initialize AdMob
    window.adsbygoogle = window.adsbygoogle || [];
    
    console.log('AdMob initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize AdMob:', error);
    return false;
  }
};

// Load AdMob SDK script
const loadAdMobScript = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADMOB_CONFIG.publisherId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = resolve;
    script.onerror = reject;
    
    document.head.appendChild(script);
  });
};

// Load banner ad
export const loadBannerAd = async (containerId: string) => {
  try {
    const adContainer = document.getElementById(containerId);
    if (!adContainer) throw new Error('Ad container not found');

    const adElement = document.createElement('ins');
    adElement.className = 'adsbygoogle';
    adElement.style.display = 'block';
    adElement.setAttribute('data-ad-client', ADMOB_CONFIG.publisherId!);
    adElement.setAttribute('data-ad-slot', ADMOB_CONFIG.adUnitIds.banner!);
    adElement.setAttribute('data-ad-format', 'auto');
    adElement.setAttribute('data-full-width-responsive', 'true');

    adContainer.appendChild(adElement);
    (window.adsbygoogle = window.adsbygoogle || []).push({});

    return true;
  } catch (error) {
    console.error('Failed to load banner ad:', error);
    return false;
  }
};

// Load interstitial ad
export const loadInterstitialAd = async () => {
  try {
    const adRequest = {
      adUnitId: ADMOB_CONFIG.adUnitIds.interstitial!,
      publisherId: ADMOB_CONFIG.publisherId!,
    };

    // Create and show interstitial ad
    const interstitial = new window.google.ads.AdManager.InterstitialAd(adRequest);
    await interstitial.load();
    await interstitial.show();

    return true;
  } catch (error) {
    console.error('Failed to load interstitial ad:', error);
    return false;
  }
};

// Load rewarded ad
export const loadRewardedAd = async () => {
  try {
    const adRequest = {
      adUnitId: ADMOB_CONFIG.adUnitIds.rewarded!,
      publisherId: ADMOB_CONFIG.publisherId!,
    };

    // Create and show rewarded ad
    const rewarded = new window.google.ads.AdManager.RewardedAd(adRequest);
    
    return new Promise<{ type: string; amount: number }>((resolve, reject) => {
      rewarded.onRewarded = (reward: { type: string; amount: number }) => {
        resolve(reward);
      };
      
      rewarded.onError = (error: Error) => {
        reject(error);
      };
      
      rewarded.load();
      rewarded.show();
    });
  } catch (error) {
    console.error('Failed to load rewarded ad:', error);
    throw error;
  }
};

// Types for TypeScript
declare global {
  interface Window {
    adsbygoogle: any[];
    google: {
      ads: {
        AdManager: {
          InterstitialAd: new (config: any) => any;
          RewardedAd: new (config: any) => any;
        };
      };
    };
  }
} 