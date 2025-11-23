import { ethers } from 'ethers';
import { getAppKit } from './init';

// Type for Address (replacing viem's Address type)
type Address = `0x${string}`;

// Contract ABI
const QUEST_REWARD_DISTRIBUTOR_ABI = [
  "function createCampaign(string memory questId, address rewardToken, uint256 totalRewards, bytes32 merkleRoot, uint256 deadline) external returns (uint256 campaignId)",
  "function claimReward(uint256 campaignId, uint256 amount, bytes32[] calldata proof) external",
  "function batchClaimRewards((address user, uint256 amount, bytes32[] proof)[] calldata claims) external",
  "function getCampaign(uint256 campaignId) external view returns (address rewardToken, uint256 totalRewards, uint256 claimedRewards, bytes32 merkleRoot, uint256 deadline, bool isActive, string memory questId)",
  "function hasClaimed(uint256 campaignId, address user) external view returns (bool)",
  "function addQuestManager(address manager) external",
  "function removeQuestManager(address manager) external",
  "function questManagers(address) external view returns (bool)",
  "function setPaused(bool _paused) external",
  "function paused() external view returns (bool)",
  "event CampaignCreated(uint256 indexed campaignId, string indexed questId, address indexed rewardToken, uint256 totalRewards, bytes32 merkleRoot, uint256 deadline)",
  "event RewardClaimed(uint256 indexed campaignId, address indexed user, uint256 amount, address indexed rewardToken)"
] as const;

// Contract addresses by chain ID
const CONTRACT_ADDRESSES: Record<number, Address> = {
  25: process.env.NEXT_PUBLIC_CRONOS_REWARD_DISTRIBUTOR as Address || '0x0000000000000000000000000000000000000000',
  1: process.env.NEXT_PUBLIC_ETHEREUM_REWARD_DISTRIBUTOR as Address || '0x0000000000000000000000000000000000000000',
  338: process.env.NEXT_PUBLIC_CRONOS_TESTNET_REWARD_DISTRIBUTOR as Address || '0x0000000000000000000000000000000000000000'
};

export interface CampaignInfo {
  rewardToken: string;
  totalRewards: bigint;
  claimedRewards: bigint;
  merkleRoot: string;
  deadline: bigint;
  isActive: boolean;
  questId: string;
}

export interface ClaimableReward {
  campaignId: number;
  amount: string;
  proof: string[];
  questId: string;
  deadline: Date;
  rewardToken: string;
}

export class RewardDistributorContract {
  private contractAddress: Address;
  private chainId: number;
  private isDeployed: boolean;

  constructor(chainId: number = 25) {
    this.chainId = chainId;
    this.contractAddress = CONTRACT_ADDRESSES[chainId] || '0x0000000000000000000000000000000000000000';
    this.isDeployed = this.contractAddress !== '0x0000000000000000000000000000000000000000' && !!this.contractAddress;
  }

  /**
   * Check if contract is deployed on the current chain
   */
  isContractDeployed(): boolean {
    return this.isDeployed;
  }

  /**
   * Validate contract is deployed before operations
   */
  private validateDeployed(): void {
    if (!this.isDeployed) {
      throw new Error(`Reward distributor contract not deployed on chain ${this.chainId}`);
    }
  }

  /**
   * Get campaign information
   */
  async getCampaign(campaignId: number): Promise<CampaignInfo> {
    this.validateDeployed();
    try {
      const appKit = getAppKit();
      const provider = new ethers.providers.Web3Provider(appKit.getWalletProvider());
      
      const contract = new ethers.Contract(
        this.contractAddress,
        QUEST_REWARD_DISTRIBUTOR_ABI,
        provider
      );

      const result = await contract.getCampaign(campaignId);

      return {
        rewardToken: result[0],
        totalRewards: result[1],
        claimedRewards: result[2],
        merkleRoot: result[3],
        deadline: result[4],
        isActive: result[5],
        questId: result[6]
      };
    } catch (error) {
      console.error('Error getting campaign:', error);
      throw error;
    }
  }

  /**
   * Check if user has claimed rewards
   */
  async hasClaimed(campaignId: number, userAddress: string): Promise<boolean> {
    this.validateDeployed();
    try {
      const appKit = getAppKit();
      const provider = new ethers.providers.Web3Provider(appKit.getWalletProvider());
      
      const contract = new ethers.Contract(
        this.contractAddress,
        QUEST_REWARD_DISTRIBUTOR_ABI,
        provider
      );

      return await contract.hasClaimed(campaignId, userAddress);
    } catch (error) {
      console.error('Error checking claim status:', error);
      throw error;
    }
  }

  /**
   * Claim reward from a campaign
   */
  async claimReward(campaignId: number, amount: string, proof: string[]): Promise<string> {
    this.validateDeployed();
    try {
      const appKit = getAppKit();
      const provider = new ethers.providers.Web3Provider(appKit.getWalletProvider());
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        this.contractAddress,
        QUEST_REWARD_DISTRIBUTOR_ABI,
        signer
      );

      const tx = await contract.claimReward(campaignId, amount, proof);
      return tx.hash;
    } catch (error) {
      console.error('Error claiming reward:', error);
      throw error;
    }
  }

  /**
   * Batch claim multiple rewards
   */
  async batchClaimRewards(claims: Array<{
    campaignId: number;
    amount: string;
    proof: string[];
  }>): Promise<string> {
    this.validateDeployed();
    try {
      const appKit = getAppKit();
      const provider = new ethers.providers.Web3Provider(appKit.getWalletProvider());
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();

      const contract = new ethers.Contract(
        this.contractAddress,
        QUEST_REWARD_DISTRIBUTOR_ABI,
        signer
      );

      // Format claims for contract
      const formattedClaims = claims.map(claim => ({
        user: userAddress,
        amount: claim.amount,
        proof: claim.proof
      }));

      const tx = await contract.batchClaimRewards(formattedClaims);
      return tx.hash;
    } catch (error) {
      console.error('Error batch claiming rewards:', error);
      throw error;
    }
  }

  /**
   * Check if address is a quest manager
   */
  async isQuestManager(address: string): Promise<boolean> {
    this.validateDeployed();
    try {
      const appKit = getAppKit();
      const provider = new ethers.providers.Web3Provider(appKit.getWalletProvider());
      
      const contract = new ethers.Contract(
        this.contractAddress,
        QUEST_REWARD_DISTRIBUTOR_ABI,
        provider
      );

      return await contract.questManagers(address);
    } catch (error) {
      console.error('Error checking quest manager status:', error);
      throw error;
    }
  }

  /**
   * Check if contract is paused
   */
  async isPaused(): Promise<boolean> {
    this.validateDeployed();
    try {
      const appKit = getAppKit();
      const provider = new ethers.providers.Web3Provider(appKit.getWalletProvider());
      
      const contract = new ethers.Contract(
        this.contractAddress,
        QUEST_REWARD_DISTRIBUTOR_ABI,
        provider
      );

      return await contract.paused();
    } catch (error) {
      console.error('Error checking pause status:', error);
      throw error;
    }
  }

  /**
   * Estimate gas for claiming rewards
   */
  async estimateClaimGas(campaignId: number, amount: string, proof: string[]): Promise<bigint> {
    this.validateDeployed();
    try {
      const appKit = getAppKit();
      const provider = new ethers.providers.Web3Provider(appKit.getWalletProvider());
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        this.contractAddress,
        QUEST_REWARD_DISTRIBUTOR_ABI,
        signer
      );

      const gasEstimate = await contract.estimateGas.claimReward(campaignId, amount, proof);
      return BigInt(gasEstimate.toString());
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw error;
    }
  }

  /**
   * Get contract address for current chain
   */
  getAddress(): Address {
    return this.contractAddress;
  }

  /**
   * Get current chain ID
   */
  getChainId(): number {
    return this.chainId;
  }
}

// Lazy singleton instances for common chains
let cronosRewardDistributorInstance: RewardDistributorContract | null = null;
let ethereumRewardDistributorInstance: RewardDistributorContract | null = null;

export const getCronosRewardDistributor = () => {
  if (!cronosRewardDistributorInstance) {
    cronosRewardDistributorInstance = new RewardDistributorContract(25);
  }
  return cronosRewardDistributorInstance;
};

export const getEthereumRewardDistributor = () => {
  if (!ethereumRewardDistributorInstance) {
    ethereumRewardDistributorInstance = new RewardDistributorContract(1);
  }
  return ethereumRewardDistributorInstance;
};

// Hook for using the reward distributor
export function useRewardDistributor(chainId: number = 25) {
  const contract = new RewardDistributorContract(chainId);
  
  return {
    contract,
    getCampaign: contract.getCampaign.bind(contract),
    hasClaimed: contract.hasClaimed.bind(contract),
    claimReward: contract.claimReward.bind(contract),
    batchClaimRewards: contract.batchClaimRewards.bind(contract),
    isQuestManager: contract.isQuestManager.bind(contract),
    isPaused: contract.isPaused.bind(contract),
    estimateClaimGas: contract.estimateClaimGas.bind(contract),
    getAddress: contract.getAddress.bind(contract),
    getChainId: contract.getChainId.bind(contract)
  };
}

export default RewardDistributorContract;