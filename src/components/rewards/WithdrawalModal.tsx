'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { toast } from 'react-hot-toast';
import { RewardDistributorContract } from '@/lib/reown/reward-distributor-contract';
import '@/styles/components/CryptoComInspired.css';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewards: {
    blockchain: any[];
    database: any[];
    total: number;
    claimableTotal?: number;
    pendingTotal?: number;
    escrowTotal?: number;
  };
  onWithdrawalComplete: () => void;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  rewards,
  onWithdrawalComplete
}) => {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('eip155');
  
  // Initialize reward distributor for Cronos (chainId: 25)
  const [rewardDistributor, setRewardDistributor] = useState<RewardDistributorContract | null>(null);
  const [isContractDeployed, setIsContractDeployed] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      try {
        const chainId = 25;
        const rd = new RewardDistributorContract(chainId);
        setRewardDistributor(rd);
        setIsContractDeployed(rd.isContractDeployed());
      } catch (error) {
        console.warn('Reward distributor not available:', error);
        setRewardDistributor(null);
        setIsContractDeployed(false);
      }
    }
  }, [isOpen]);
  
  const [withdrawalType, setWithdrawalType] = useState<'blockchain' | 'database'>('database');
  const [selectedRewards, setSelectedRewards] = useState<string[]>([]);
  const [estimatedGas, setEstimatedGas] = useState<string>('0');
  const [gasPrice, setGasPrice] = useState<string>('0');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (isOpen && withdrawalType === 'blockchain' && selectedRewards.length > 0) {
      estimateGasForWithdrawal();
    }
  }, [selectedRewards, withdrawalType, isOpen]);

  const estimateGasForWithdrawal = async () => {
    if (!walletProvider || !address || selectedRewards.length === 0 || !rewardDistributor) return;

    try {
      const provider = new ethers.providers.Web3Provider(walletProvider);
      const gasPrice = await provider.getGasPrice();
      setGasPrice(ethers.utils.formatUnits(gasPrice, 'gwei'));

      // Get first selected reward for estimation
      const selectedBlockchainRewards = rewards.blockchain.filter(
        r => selectedRewards.includes(r.questId)
      );

      if (selectedBlockchainRewards.length > 0) {
        const firstReward = selectedBlockchainRewards[0];
        const estimatedGas = await rewardDistributor.estimateClaimGas(
          parseInt(firstReward.campaignId),
          firstReward.amount,
          firstReward.proof
        );
        
        // Multiply by number of rewards for batch estimate
        const totalGasLimit = estimatedGas * BigInt(selectedRewards.length);
        const totalGasCost = gasPrice.mul(totalGasLimit);
        setEstimatedGas(ethers.utils.formatEther(totalGasCost));
      }
    } catch (error) {
      console.error('Error estimating gas:', error);
      // Fallback to approximate estimation
      const provider = new ethers.providers.Web3Provider(walletProvider);
      const gasPrice = await provider.getGasPrice();
      const estimatedGasLimit = ethers.BigNumber.from(100000).mul(selectedRewards.length);
      const totalGasCost = gasPrice.mul(estimatedGasLimit);
      setEstimatedGas(ethers.utils.formatEther(totalGasCost));
    }
  };

  const handleSelectReward = (rewardId: string) => {
    setSelectedRewards(prev => 
      prev.includes(rewardId) 
        ? prev.filter(id => id !== rewardId)
        : [...prev, rewardId]
    );
  };

  const handleSelectAll = () => {
    const allIds = withdrawalType === 'blockchain'
      ? rewards.blockchain.map(r => r.questId)
      : rewards.database.map(r => r.rewardId);
    
    setSelectedRewards(allIds);
  };

  const handleBlockchainWithdrawal = async () => {
    if (!walletProvider || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!isContractDeployed) {
      toast.error('Smart contract not available on this network');
      return;
    }

    setProcessing(true);
    try {
      // Prepare claim data
      const selectedBlockchainRewards = rewards.blockchain.filter(
        r => selectedRewards.includes(r.questId)
      );

      const claims = selectedBlockchainRewards.map(reward => ({
        campaignId: parseInt(reward.campaignId),
        amount: reward.amount,
        proof: reward.proof
      }));

      // Execute batch claim
      if (!rewardDistributor) {
        throw new Error('Reward distributor not initialized');
      }
      
      toast.loading('Submitting transaction...');
      const txHash = await rewardDistributor.batchClaimRewards(claims);
      
      toast.success('Transaction submitted! Waiting for confirmation...');
      
      // Wait for transaction confirmation
      const provider = new ethers.providers.Web3Provider(walletProvider);
      const receipt = await provider.waitForTransaction(txHash);
      
      if (receipt.status === 1) {
        toast.success('Rewards claimed successfully!');
        onWithdrawalComplete();
        onClose();
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Blockchain withdrawal error:', error);
      toast.error(error.message || 'Failed to claim rewards');
    } finally {
      setProcessing(false);
    }
  };

  const handleDatabaseWithdrawal = async () => {
    setProcessing(true);
    try {
      // Process each selected reward individually
      const selectedDatabaseRewards = rewards.database.filter(
        r => selectedRewards.includes(r.rewardId)
      );

      let successCount = 0;
      let failedCount = 0;

      for (const reward of selectedDatabaseRewards) {
        try {
          // Get auth token for backend API call
          const auth = await import('@/lib/api/auth');
          const token = await auth.getAuthToken();
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quests/rewards/claim/${reward.rewardId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              walletAddress: address
            })
          });

          if (!response.ok) {
            const error = await response.json();
            console.error(`Failed to claim reward ${reward.rewardId}:`, error);
            failedCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          console.error(`Error claiming reward ${reward.rewardId}:`, error);
          failedCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully claimed ${successCount} reward${successCount > 1 ? 's' : ''}!`);
        onWithdrawalComplete();
      }
      
      if (failedCount > 0) {
        toast.error(`Failed to claim ${failedCount} reward${failedCount > 1 ? 's' : ''}`);
      }

      if (successCount > 0) {
        onClose();
      }
    } catch (error: any) {
      console.error('Database withdrawal error:', error);
      toast.error(error.message || 'Failed to process withdrawal');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = () => {
    if (withdrawalType === 'blockchain') {
      handleBlockchainWithdrawal();
    } else {
      handleDatabaseWithdrawal();
    }
  };

  const getTotalSelected = () => {
    const rewardsList = withdrawalType === 'blockchain' 
      ? rewards.blockchain 
      : rewards.database;
    
    return rewardsList
      .filter(r => selectedRewards.includes(
        withdrawalType === 'blockchain' ? r.questId : r.rewardId
      ))
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-2xl"
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Withdraw Rewards</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Rewards Breakdown */}
              <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Rewards Breakdown</h3>
                <div className="space-y-2">
                  {rewards.pendingTotal !== undefined && rewards.pendingTotal > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Pending Approval</span>
                      <span className="text-sm font-medium text-yellow-400">{rewards.pendingTotal} tokens</span>
                    </div>
                  )}
                  {rewards.claimableTotal !== undefined && rewards.claimableTotal > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Ready to Claim</span>
                      <span className="text-sm font-medium text-green-400">{rewards.claimableTotal} tokens</span>
                    </div>
                  )}
                  {rewards.escrowTotal !== undefined && rewards.escrowTotal > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">In Escrow</span>
                      <span className="text-sm font-medium text-blue-400">{rewards.escrowTotal} tokens</span>
                    </div>
                  )}
                  <div className="border-t border-gray-700 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Total Rewards</span>
                      <span className="text-lg font-bold text-white">{rewards.total} tokens</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 1: Select Withdrawal Type */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        if (!isContractDeployed) {
                          toast.error('Blockchain rewards not available on this network');
                          return;
                        }
                        setWithdrawalType('blockchain');
                      }}
                      className={`
                        p-4 rounded-lg border-2 transition-all
                        ${withdrawalType === 'blockchain'
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                        }
                        ${!isContractDeployed ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      disabled={!isContractDeployed}
                    >
                      <div className="text-left">
                        <h3 className="font-semibold mb-1">Blockchain Rewards</h3>
                        {isContractDeployed ? (
                          <>
                            <p className="text-sm text-gray-400">
                              {rewards.blockchain.length} rewards available
                            </p>
                            <p className="text-lg font-bold text-blue-400 mt-2">
                              {rewards.blockchain.reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(2)} tokens
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-400">
                            Not available on this network
                          </p>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => setWithdrawalType('database')}
                      className={`
                        p-4 rounded-lg border-2 transition-all
                        ${withdrawalType === 'database'
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                        }
                      `}
                    >
                      <div className="text-left">
                        <h3 className="font-semibold mb-1">Platform Rewards</h3>
                        <p className="text-sm text-gray-400">
                          {rewards.database.length} rewards available
                        </p>
                        <p className="text-lg font-bold text-green-400 mt-2">
                          {rewards.database.reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(2)} tokens
                        </p>
                      </div>
                    </button>
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    className="crypto-button crypto-button-primary w-full"
                    disabled={
                      (withdrawalType === 'blockchain' && rewards.blockchain.length === 0) ||
                      (withdrawalType === 'database' && rewards.database.length === 0)
                    }
                  >
                    Continue
                  </Button>
                </div>
              )}

              {/* Step 2: Select Rewards */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Select Rewards to Withdraw</h3>
                    <button
                      onClick={handleSelectAll}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      Select All
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {(withdrawalType === 'blockchain' ? rewards.blockchain : rewards.database).map((reward) => {
                      const rewardId = withdrawalType === 'blockchain' ? reward.questId : reward.rewardId;
                      const isSelected = selectedRewards.includes(rewardId);

                      return (
                        <label
                          key={rewardId}
                          className={`
                            flex items-center p-3 rounded-lg cursor-pointer transition-all
                            ${isSelected
                              ? 'bg-blue-500/20 border border-blue-500'
                              : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800'
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectReward(rewardId)}
                            className="crypto-checkbox mr-3"
                          />
                          <div className="flex-1">
                            <p className="font-medium">
                              {reward.questTitle || `Quest #${rewardId.slice(0, 8)}`}
                            </p>
                            <p className="text-sm text-gray-400">
                              Expires: {new Date(reward.deadline).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{parseFloat(reward.amount).toFixed(2)}</p>
                            <p className="text-xs text-gray-400">tokens</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {withdrawalType === 'blockchain' && selectedRewards.length > 0 && (
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Gas Estimation</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Gas Price:</span>
                          <span>{gasPrice} Gwei</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Estimated Cost:</span>
                          <span>{estimatedGas} CRO</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div>
                      <p className="text-sm text-gray-400">Total Selected</p>
                      <p className="text-2xl font-bold">{getTotalSelected().toFixed(2)} tokens</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setStep(1)}
                        variant="outline"
                        className="crypto-button"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleWithdraw}
                        disabled={selectedRewards.length === 0 || processing}
                        className="crypto-button crypto-button-primary"
                      >
                        {processing ? 'Processing...' : 'Withdraw'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};