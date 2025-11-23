'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';
import { WithdrawalModal } from './WithdrawalModal';
import '@/styles/components/CryptoComInspired.css';

interface BlockchainReward {
  questId: string;
  amount: string;
  proof: string[];
  campaignId: string;
  chainId: number;
  rewardToken: string;
  deadline: string;
  type: 'blockchain';
}

interface DatabaseReward {
  questId: string;
  amount: string;
  rewardId: string;
  deadline: string;
  type: 'database';
}

interface ClaimableRewards {
  blockchain: BlockchainReward[];
  database: DatabaseReward[];
  total: number;
}

interface RewardClaimingInterfaceProps {
  userAddress?: string;
  className?: string;
}

export const RewardClaimingInterface: React.FC<RewardClaimingInterfaceProps> = ({
  userAddress,
  className = ''
}) => {
  const { user, isAuthenticated } = useAuth();
  const [rewards, setRewards] = useState<ClaimableRewards | null>(null);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState<{ [key: string]: boolean }>({});
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

  const targetAddress = userAddress || user?.walletAddress;

  useEffect(() => {
    if (isAuthenticated && targetAddress) {
      fetchClaimableRewards();
    }
  }, [isAuthenticated, targetAddress]);

  const fetchClaimableRewards = async () => {
    if (!targetAddress) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/rewards/claimable/${targetAddress}`, {
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch claimable rewards');
      }

      const data = await response.json();
      setRewards(data.rewards);
    } catch (error) {
      console.error('Error fetching claimable rewards:', error);
      toast.error('Failed to fetch claimable rewards');
    } finally {
      setLoading(false);
    }
  };

  const claimDatabaseReward = async (rewardId: string) => {
    setClaiming(prev => ({ ...prev, [rewardId]: true }));
    
    try {
      const response = await fetch('/api/rewards/claim/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.accessToken}`,
        },
        body: JSON.stringify({ rewardId }),
      });

      if (!response.ok) {
        throw new Error('Failed to claim reward');
      }

      const data = await response.json();
      toast.success(`Successfully claimed ${ethers.utils.formatEther(data.amount)} tokens!`);
      
      // Refresh rewards list
      await fetchClaimableRewards();
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error('Failed to claim reward');
    } finally {
      setClaiming(prev => ({ ...prev, [rewardId]: false }));
    }
  };

  const formatTokenAmount = (amount: string) => {
    try {
      return parseFloat(ethers.utils.formatEther(amount)).toFixed(4);
    } catch {
      return amount;
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const timeLeft = date.getTime() - now.getTime();
    
    if (timeLeft <= 0) {
      return 'Expired';
    }
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} left`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} left`;
    } else {
      return 'Expires soon';
    }
  };

  const getChainName = (chainId: number) => {
    const chains: { [key: number]: string } = {
      1: 'Ethereum',
      25: 'Cronos',
      56: 'BSC',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism'
    };
    return chains[chainId] || `Chain ${chainId}`;
  };

  if (!isAuthenticated) {
    return (
      <GlassCard className={`p-6 ${className}`}>
        <div className="text-center">
          <p className="text-gray-600 mb-4">Connect your wallet to view claimable rewards</p>
          <Button variant="primary">Connect Wallet</Button>
        </div>
      </GlassCard>
    );
  }

  if (loading) {
    return (
      <GlassCard className={`p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading claimable rewards...</p>
        </div>
      </GlassCard>
    );
  }

  if (!rewards || rewards.total === 0) {
    return (
      <GlassCard className={`p-6 ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="text-lg font-semibold mb-2">No Rewards to Claim</h3>
          <p className="text-gray-600">Complete quests to earn rewards!</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary */}
      <GlassCard className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Claimable Rewards
            </h2>
            <p className="text-gray-600">
              You have {rewards.total} reward{rewards.total !== 1 ? 's' : ''} ready to claim
            </p>
          </div>
          <div className="text-3xl">💰</div>
        </div>
      </GlassCard>

      {/* Database Rewards */}
      {rewards.database.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Platform Rewards ({rewards.database.length})
          </h3>
          <div className="space-y-3">
            {rewards.database.map((reward) => (
              <GlassCard key={reward.rewardId} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-blue-600">
                        Quest #{reward.questId.slice(0, 8)}...
                      </span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Platform Reward
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-medium text-lg text-gray-900">
                        {formatTokenAmount(reward.amount)} Tokens
                      </span>
                      <span>{formatDeadline(reward.deadline)}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => claimDatabaseReward(reward.rewardId)}
                    disabled={claiming[reward.rewardId]}
                    variant="primary"
                    size="sm"
                  >
                    {claiming[reward.rewardId] ? 'Claiming...' : 'Claim'}
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Blockchain Rewards */}
      {rewards.blockchain.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Blockchain Rewards ({rewards.blockchain.length})
          </h3>
          <div className="space-y-3">
            {rewards.blockchain.map((reward, index) => (
              <GlassCard key={`${reward.campaignId}-${index}`} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-purple-600">
                        Quest #{reward.questId.slice(0, 8)}...
                      </span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {getChainName(reward.chainId)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-medium text-lg text-gray-900">
                        {formatTokenAmount(reward.amount)} Tokens
                      </span>
                      <span>{formatDeadline(reward.deadline)}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Campaign: {reward.campaignId}
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowWithdrawalModal(true)}
                    className="crypto-button crypto-button-primary"
                  >
                    Withdraw
                  </Button>
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded text-xs">
                  <p className="text-gray-600 mb-2">
                    <strong>Note:</strong> This reward requires claiming through your connected wallet. 
                    Use the smart contract interface or dApp to claim blockchain rewards.
                  </p>
                  <div className="space-y-1 text-gray-500">
                    <div>Token: {reward.rewardToken}</div>
                    <div>Chain: {getChainName(reward.chainId)}</div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <Button
          onClick={fetchClaimableRewards}
          variant="outline"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Rewards'}
        </Button>
      </div>

      {/* Withdrawal Modal */}
      {rewards && (
        <WithdrawalModal
          isOpen={showWithdrawalModal}
          onClose={() => setShowWithdrawalModal(false)}
          rewards={rewards}
          onWithdrawalComplete={() => {
            fetchClaimableRewards();
            setShowWithdrawalModal(false);
          }}
        />
      )}
    </div>
  );
};

export default RewardClaimingInterface;