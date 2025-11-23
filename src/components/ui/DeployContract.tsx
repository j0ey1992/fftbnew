'use client'

import { useState } from 'react'
import { Button } from './button'
import { GlassCard } from './GlassCard'
import { useRouter } from 'next/navigation'
import { deployContract, saveDeployedContract } from '@/lib/contracts/deploy-contract'

interface DeployContractProps {
  className?: string
  contractType?: string
}

export function DeployContract({ className = '', contractType = 'nft-staking' }: DeployContractProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [collectionAddress, setCollectionAddress] = useState('')
  const [rewardTokenAddress, setRewardTokenAddress] = useState('')
  const [rewardRate, setRewardRate] = useState('')
  const [lockupPeriod, setLockupPeriod] = useState('30')
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [rewardStartTimestamp, setRewardStartTimestamp] = useState('')
  const [rewardEndTimestamp, setRewardEndTimestamp] = useState('')
  const [minStakingPeriod, setMinStakingPeriod] = useState('30')
  const [poolLimitPerUser, setPoolLimitPerUser] = useState('0')
  const [useInitialLockPeriod, setUseInitialLockPeriod] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployProgress, setDeployProgress] = useState(0)
  const [deployedContractAddress, setDeployedContractAddress] = useState('')
  
  // Determine total steps based on contract type
  const totalSteps = contractType.includes('TokenVault') || contractType.includes('Smartchef') ? 5 : 4
  
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  const handleDeploy = async () => {
    setIsDeploying(true)
    
    try {
      // Prepare parameters based on contract type
      const parameters: Record<string, any> = {
        contractName: `${contractType.includes('nft') ? 'NFT' : 'Token'} Staking Contract`,
        description: `Stake ${contractType.includes('nft') ? 'NFTs' : 'tokens'} and earn rewards`,
      };
      
      if (contractType.includes('nft')) {
        parameters.collections = [{ address: collectionAddress, name: 'NFT Collection' }];
        parameters.rewardTokenAddress = rewardTokenAddress;
        parameters.rewardRate = rewardRate;
        parameters.lockupPeriod = lockupPeriod;
      } else if (contractType.includes('TokenVault')) {
        parameters.tokenName = tokenName;
        parameters.tokenSymbol = tokenSymbol;
        parameters.stakeToken = collectionAddress;
        parameters.rewardToken = rewardTokenAddress;
        parameters.rewardPerSecond = rewardRate;
        parameters.rewardStartTimestamp = rewardStartTimestamp || Math.floor(Date.now() / 1000).toString();
        parameters.rewardEndTimestamp = rewardEndTimestamp || Math.floor(Date.now() / 1000 + 30 * 24 * 60 * 60).toString();
        parameters.lockPeriods = [
          { period: `${lockupPeriod} Days`, days: Number(lockupPeriod), apr: rewardRate, multiplier: '100' }
        ];
      } else if (contractType.includes('Smartchef')) {
        parameters.stakedToken = collectionAddress;
        parameters.rewardToken = rewardTokenAddress;
        parameters.rewardPerBlock = rewardRate;
        parameters.startBlock = '0'; // Will be set to current block
        parameters.bonusEndBlock = '0'; // Will be calculated based on duration
        parameters.poolLimitPerUser = poolLimitPerUser;
        parameters.numberBlocksForUserLimit = '0';
        parameters.minStakingPeriod = minStakingPeriod;
        parameters.useInitialLockPeriod = useInitialLockPeriod;
        parameters.tokenSymbol = tokenSymbol;
      } else if (contractType.includes('lp')) {
        parameters.lpTokenAddress = collectionAddress;
        parameters.lpTokenSymbol = tokenSymbol || 'LP';
        parameters.rewardTokenAddress = rewardTokenAddress;
        parameters.rewardPerBlock = rewardRate;
        parameters.feeAddress = '0x0000000000000000000000000000000000000000'; // Default to zero address
      } else {
        // Default token staking
        parameters.tokenAddress = collectionAddress;
        parameters.tokenSymbol = tokenSymbol || 'TOKEN';
        parameters.rewardTokenAddress = rewardTokenAddress;
        parameters.apr = rewardRate;
        parameters.lockupPeriod = lockupPeriod;
        parameters.minStake = '100'; // Default minimum stake
      }
      
      // Start progress updates
      const progressInterval = setInterval(() => {
        setDeployProgress(prev => Math.min(prev + 5, 95)); // Cap at 95% until actual completion
      }, 200);
      
      // Actual deployment
      const result = await deployContract({
        contractType,
        parameters
      });
      
      clearInterval(progressInterval);
      
      if (result.success && result.contractAddress) {
        // Save the deployed contract with staking metadata
        await saveDeployedContract(
          contractType,
          result.contractAddress,
          parameters,
          [] // ABI will be fetched from the blockchain
        );
        
        setDeployedContractAddress(result.contractAddress);
        setDeployProgress(100);
        setIsDeploying(false);
        setCurrentStep(5); // Success step
      } else {
        console.error('Deployment failed:', result.error);
        setDeployProgress(0);
        setIsDeploying(false);
        // Handle error state
      }
    } catch (error) {
      console.error('Error in deployment:', error);
      setDeployProgress(0);
      setIsDeploying(false);
      // Handle error state
    }
  }
  
  const resetForm = () => {
    setCollectionAddress('')
    setRewardTokenAddress('')
    setRewardRate('')
    setLockupPeriod('30')
    setTokenName('')
    setTokenSymbol('')
    setRewardStartTimestamp('')
    setRewardEndTimestamp('')
    setMinStakingPeriod('30')
    setPoolLimitPerUser('0')
    setUseInitialLockPeriod(false)
    setCurrentStep(1)
    setDeployProgress(0)
  }
  
  return (
    <div className="ambient-gradient-container max-w-3xl mx-auto">
      {/* Ambient Gradients */}
      <div className="deploy-gradient-top"></div>
      <div className="deploy-gradient-bottom"></div>
      
      {/* Progress Indicator */}
      <div className="step-progress mb-8 px-4">
        <div
          className="step-progress-indicator"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
        
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`step-circle
                ${currentStep > index + 1 ? 'completed' :
                  currentStep === index + 1 ? 'active' : ''}`}
            >
              {currentStep > index + 1 ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <div className="step-title">Step {index + 1}</div>
          </div>
        ))}
      </div>
      
      <GlassCard className={`glass-panel-enhanced animate-fade-in ${className}`}>
        {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-white text-gradient-blue">Collection Setup</h2>
              <p className="text-gray-300 mb-6 text-sm">
                {contractType.includes('nft')
                  ? "First, let's set up the NFT collection that users will be able to stake."
                  : contractType.includes('lp')
                  ? "First, let's set up the LP token that users will be able to stake."
                  : "First, let's set up the token that users will be able to stake."}
              </p>
              
              {/* Template Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div
                  className={`crypto-card template-card premium-border animate-fade-in ${contractType === 'nft-staking' ? 'selected' : ''}`}
                  onClick={() => !isDeploying && setCurrentStep(1)}
                >
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-blue-500/5 to-transparent rounded-tl-full"></div>
                  <div className="p-5 relative z-10">
                    <div className="template-badge">Popular</div>
                    <div className="template-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">NFT Staking</h3>
                    <p className="text-sm text-gray-300 mb-4">Stake NFTs and earn token rewards over time.</p>
                    <div className="glass-panel-dark rounded-xl p-3 mb-3">
                      <div className="flex items-center text-xs text-gray-400">
                        <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span>No gas fees for deployment</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div
                  className={`crypto-card template-card premium-border animate-fade-in ${contractType === 'token-staking' ? 'selected' : ''}`}
                  onClick={() => !isDeploying && setCurrentStep(1)}
                >
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-purple-500/5 to-transparent rounded-tl-full"></div>
                  <div className="p-5 relative z-10">
                    <div className="template-badge">Basic</div>
                    <div className="template-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Token Staking</h3>
                    <p className="text-sm text-gray-300 mb-4">Standard token staking with flexible parameters.</p>
                    <div className="glass-panel-dark rounded-xl p-3 mb-3">
                      <div className="flex items-center text-xs text-gray-400">
                        <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <span>Secure and audited</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="form-group mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="collection-address">
                  {contractType.includes('nft')
                    ? "NFT Collection Address"
                    : contractType.includes('lp')
                    ? "LP Token Address"
                    : contractType.includes('TokenVault')
                    ? "Stake Token Address"
                    : contractType.includes('Smartchef')
                    ? "Staked Token Address"
                    : "Token Address"}
                </label>
                <div className="form-input-premium">
                  <input
                    id="collection-address"
                    type="text"
                    className="form-input-enhanced"
                    placeholder="0x..."
                    value={collectionAddress}
                    onChange={(e) => setCollectionAddress(e.target.value)}
                    required
                  />
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {contractType.includes('nft')
                    ? "The NFT collection that users will stake"
                    : contractType.includes('lp')
                    ? "The LP token that users will stake"
                    : "The token that users will stake"}
                </div>
              </div>
            
            {(contractType.includes('TokenVault') || contractType.includes('Smartchef') || contractType.includes('lp')) && (
              <div className="form-group mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="token-symbol">
                  Token Symbol
                </label>
                <input
                  id="token-symbol"
                  type="text"
                  className="form-input-enhanced"
                  placeholder="TOKEN"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value)}
                  required
                />
                <div className="mt-1 text-xs text-gray-400">The symbol of the token</div>
              </div>
            )}
            
            {contractType.includes('TokenVault') && (
              <div className="form-group mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="token-name">
                  Token Name
                </label>
                <input
                  id="token-name"
                  type="text"
                  className="form-input-enhanced"
                  placeholder="My Token"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  required
                />
                <div className="mt-1 text-xs text-gray-400">The name of the token</div>
              </div>
            )}
            
            <div className="flex justify-between mt-8">
              <div></div> {/* Empty div for spacing */}
              <button
                className="btn-gradient"
                onClick={nextStep}
                disabled={!collectionAddress}
              >
                Continue
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gradient-blue">Reward Setup</h2>
            <p className="text-gray-300 mb-6 text-sm">Now, configure the token that will be used to reward stakers.</p>
              
              <div className="glass-panel-enhanced p-5 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-md font-medium text-white">Reward Token Configuration</h3>
                </div>
              
                <div className="form-group mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="reward-token">
                    Reward Token Address
                  </label>
                  <div className="form-input-premium">
                    <input
                      id="reward-token"
                      type="text"
                      className="form-input-enhanced"
                      placeholder="0x..."
                      value={rewardTokenAddress}
                      onChange={(e) => setRewardTokenAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-400">The token used to reward stakers</div>
                </div>
              </div>
            <div className="flex justify-between mt-8">
              <button
                className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 text-white transition-all"
                onClick={prevStep}
              >
                Back
              </button>
              <button
                className="btn-gradient"
                onClick={nextStep}
                disabled={!rewardTokenAddress}
              >
                Continue
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gradient-blue">Staking Parameters</h2>
            <p className="text-gray-300 mb-6 text-sm">Set up the rewards rate and staking period for your contract.</p>
            
            <div className="glass-panel-enhanced p-5 mb-6">
              <div className="form-group mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="reward-rate">
                  {contractType.includes('TokenVault')
                    ? "Reward Per Second"
                    : contractType.includes('Smartchef') || contractType.includes('lp')
                    ? "Reward Per Block"
                    : "Reward Rate (per day)"}
                </label>
                <input
                  id="reward-rate"
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input-enhanced"
                  placeholder="0.1"
                  value={rewardRate}
                  onChange={(e) => setRewardRate(e.target.value)}
                  required
                />
                <div className="mt-1 text-xs text-gray-400">
                  {contractType.includes('TokenVault')
                    ? "Rewards distributed per second"
                    : contractType.includes('Smartchef') || contractType.includes('lp')
                    ? "Rewards distributed per block"
                    : contractType.includes('nft')
                    ? "Rewards distributed per NFT per day"
                    : "Rewards distributed per token per day"}
                </div>
              </div>
              <div className="form-group mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="lockup-period">
                  {contractType.includes('Smartchef')
                    ? "Minimum Staking Period (days)"
                    : "Lockup Period (days)"}
                </label>
                <input
                  id="lockup-period"
                  type="number"
                  min="0"
                  className="form-input-enhanced"
                  placeholder="30"
                  value={contractType.includes('Smartchef') ? minStakingPeriod : lockupPeriod}
                  onChange={(e) => contractType.includes('Smartchef')
                    ? setMinStakingPeriod(e.target.value)
                    : setLockupPeriod(e.target.value)}
                  required
                />
                <div className="mt-1 text-xs text-gray-400">
                  {contractType.includes('nft')
                    ? "How long NFTs must remain staked"
                    : "How long tokens must remain staked"}
                </div>
              </div>
            </div>
            {contractType.includes('TokenVault') && (
              <div className="glass-panel-enhanced p-5 mb-6">
                <div className="form-group mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="reward-start">
                    Reward Start Timestamp
                  </label>
                  <input
                    id="reward-start"
                    type="number"
                    className="form-input-enhanced"
                    placeholder={Math.floor(Date.now() / 1000).toString()}
                    value={rewardStartTimestamp}
                    onChange={(e) => setRewardStartTimestamp(e.target.value)}
                  />
                  <div className="mt-1 text-xs text-gray-400">Unix timestamp when rewards start (leave empty for current time)</div>
                </div>
                
                <div className="form-group mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="reward-end">
                    Reward End Timestamp
                  </label>
                  <input
                    id="reward-end"
                    type="number"
                    className="form-input-enhanced"
                    placeholder={Math.floor(Date.now() / 1000 + 30 * 24 * 60 * 60).toString()}
                    value={rewardEndTimestamp}
                    onChange={(e) => setRewardEndTimestamp(e.target.value)}
                  />
                  <div className="mt-1 text-xs text-gray-400">Unix timestamp when rewards end (leave empty for 30 days from now)</div>
                </div>
              </div>
            )}
            {contractType.includes('Smartchef') && (
              <div className="glass-panel-enhanced p-5 mb-6">
                <div className="form-group mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="pool-limit">
                    Pool Limit Per User
                  </label>
                  <input
                    id="pool-limit"
                    type="number"
                    min="0"
                    className="form-input-enhanced"
                    placeholder="0"
                    value={poolLimitPerUser}
                    onChange={(e) => setPoolLimitPerUser(e.target.value)}
                  />
                  <div className="mt-1 text-xs text-gray-400">Maximum amount a user can stake (0 for no limit)</div>
                </div>
                
                <div className="form-group mb-4">
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2" htmlFor="use-lock-period">
                    <input
                      id="use-lock-period"
                      type="checkbox"
                      className="mr-2 h-4 w-4"
                      checked={useInitialLockPeriod}
                      onChange={(e) => setUseInitialLockPeriod(e.target.checked)}
                    />
                    Use Initial Lock Period
                  </label>
                  <div className="mt-1 text-xs text-gray-400">If enabled, users must wait the minimum staking period before withdrawing</div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between mt-8">
              <button
                className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 text-white transition-all"
                onClick={prevStep}
              >
                Back
              </button>
              <button
                className="btn-gradient"
                onClick={nextStep}
                disabled={!rewardRate || !lockupPeriod}
              >
                Continue
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 4 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gradient-blue">Review & Deploy</h2>
            <p className="text-gray-300 mb-6 text-sm">Review your staking contract details and deploy to the blockchain.</p>
            
            <div className="glass-panel-enhanced p-5 mb-6 premium-border">
              <h3 className="text-md font-medium text-white mb-4">Contract Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-400">Collection Address</div>
                  <div className="text-sm text-white truncate">{collectionAddress}</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-400">Reward Token</div>
                  <div className="text-sm text-white truncate">{rewardTokenAddress}</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-400">Daily Reward Rate</div>
                  <div className="text-sm text-white">{rewardRate}</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-400">Lockup Period</div>
                  <div className="text-sm text-white">{lockupPeriod} days</div>
                </div>
              </div>
            </div>
            
            {isDeploying ? (
              <div className="mt-6">
                <div className="mb-2 text-center text-sm text-white">Deploying contract...</div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
                    style={{ width: `${deployProgress}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-center text-xs text-gray-400">{deployProgress}%</div>
              </div>
            ) : (
              <div className="flex justify-between mt-8">
                <button
                  className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 text-white transition-all"
                  onClick={prevStep}
                >
                  Back
                </button>
                <button
                  className="btn-gradient"
                  onClick={handleDeploy}
                >
                  Deploy Contract
                </button>
              </div>
            )}
          </div>
        )}
        {currentStep === 5 && (
          <div className="text-center animate-fade-in py-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-400 rounded-full flex items-center justify-center blue-glow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gradient-blue">Deployment Successful!</h3>
            <p className="text-gray-300 mb-6">
              Your staking contract has been successfully deployed to the blockchain and is ready for use.
            </p>
            <div className="glass-panel-enhanced p-3 mb-6 flex items-center premium-border">
              <code className="text-xs text-gray-300 flex-1 overflow-x-auto">{deployedContractAddress || '0x7c3429d5A2A54F06f6C98be4c6E864E649188304'}</code>
              <button
                className="ml-2 text-blue-400 hover:text-blue-300"
                onClick={() => {
                  navigator.clipboard.writeText(deployedContractAddress);
                  // Could add a toast notification here
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 text-white transition-all"
                onClick={resetForm}
              >
                Deploy Another
              </button>
              <button
                className="btn-gradient"
                onClick={() => {
                  // Navigate to the appropriate staking page based on contract type
                  if (contractType.includes('nft')) {
                    router.push('/nft-staking');
                  } else if (contractType.includes('token') || contractType.includes('TokenVault')) {
                    router.push('/stake');
                  } else if (contractType.includes('lp')) {
                    router.push('/lp-staking');
                  } else if (contractType.includes('Smartchef')) {
                    router.push('/stake');
                  } else {
                    router.push('/stake');
                  }
                }}
              >
                Go to Staking Page
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
