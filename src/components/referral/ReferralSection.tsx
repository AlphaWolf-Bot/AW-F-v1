import { useEffect } from 'react';
import { useReferralStore } from '@/store/referral';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export const ReferralSection = () => {
  const {
    referralLink,
    referralCount,
    referralRewards,
    referralHistory,
    currentTier,
    nextTier,
    isLoading,
    error,
    generateReferralLink,
    getReferralStats,
    getReferralHistory,
    shareReferralLink,
    claimReferralReward,
    getTierProgress,
  } = useReferralStore();

  useEffect(() => {
    generateReferralLink();
    getReferralStats();
    getReferralHistory();
  }, [generateReferralLink, getReferralStats, getReferralHistory]);

  const { current, next, percentage } = getTierProgress();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-white p-6 shadow-lg"
    >
      <h2 className="mb-4 text-2xl font-bold text-gray-900">Referral Program</h2>
      
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-gray-600">Total Referrals</p>
          <p className="text-2xl font-bold text-blue-600">{referralCount}</p>
        </div>
        <div className="rounded-lg bg-green-50 p-4">
          <p className="text-sm text-gray-600">Total Rewards</p>
          <p className="text-2xl font-bold text-green-600">{referralRewards} coins</p>
        </div>
      </div>

      {/* Tier Information */}
      <div className="mb-6 rounded-lg border border-gray-200 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {currentTier.name} Tier
            </h3>
            <p className="text-sm text-gray-600">
              {currentTier.rewards.joinBonus} coins per referral
              {currentTier.rewards.withdrawalBonus > 0 && (
                <span> • {currentTier.rewards.withdrawalBonus * 100}% withdrawal bonus</span>
              )}
            </p>
          </div>
          <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
            {currentTier.bonusMultiplier}x multiplier
          </div>
        </div>

        {nextTier && (
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress to {nextTier.name}</span>
              <span className="font-medium text-gray-900">
                {current}/{next} referrals
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                className="h-full bg-blue-600"
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Next tier: {nextTier.rewards.joinBonus} coins per referral
              {nextTier.rewards.withdrawalBonus > 0 && (
                <span> • {nextTier.rewards.withdrawalBonus * 100}% withdrawal bonus</span>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Your Referral Link
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={referralLink || ''}
            readOnly
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={shareReferralLink}
            disabled={isLoading || !referralLink}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Share
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Referral History</h3>
        <div className="space-y-4">
          {referralHistory.map((referral) => (
            <div
              key={referral.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
            >
              <div>
                <p className="font-medium text-gray-900">@{referral.username}</p>
                <p className="text-sm text-gray-500">
                  Joined {formatDistanceToNow(new Date(referral.joinedAt), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-green-600">
                  {referral.reward} coins
                </span>
                {referral.status === 'pending' && (
                  <button
                    onClick={() => claimReferralReward(referral.id)}
                    disabled={isLoading}
                    className="rounded-md bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    Claim
                  </button>
                )}
                {referral.status === 'claimed' && (
                  <span className="text-sm text-gray-500">Claimed</span>
                )}
              </div>
            </div>
          ))}
          {referralHistory.length === 0 && (
            <p className="text-center text-gray-500">No referrals yet</p>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">How it works</h3>
        <ul className="list-inside list-disc space-y-2 text-sm text-gray-600">
          <li>Share your referral link with friends</li>
          <li>Get {currentTier.rewards.joinBonus} coins when they join using your link</li>
          <li>Earn {currentTier.rewards.withdrawalBonus * 100}% of their first withdrawal</li>
          <li>No limit on number of referrals</li>
          <li>Rewards are automatically added to your balance</li>
          <li>Higher tiers give more rewards and bonuses</li>
        </ul>
      </div>
    </motion.div>
  );
}; 