import { ethers } from 'ethers';

// Contract addresses
export const KRIS_V3_VAULT_ADDRESS = '0x352e9f9E615970047047f1F5DD91a2860Bd8812e';

// The VVS V3 NFT Position Manager that holds the NFTs
export const VVS_POSITION_MANAGER_ADDRESS = '0xc2DDB059FEc2afa593dFF9c70Fda2cfABe9b4eC8';

// The VVS V3 Router/Periphery contract (used for creating positions, not holding NFTs)
export const VVS_V3_ROUTER_ADDRESS = '0xc2DDB059FEc2afa593dFF9c70Fda2cfABe9b4eC8';

// Token addresses
export const KRIS_TOKEN = '0x2829955d8Aac64f184E363516FDfbb0394042B90';
export const WCRO_TOKEN = '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23';

// ABIs - Updated to match the actual contract
const VAULT_ABI = [
  // Main functions
  "function stake(uint256 tokenId, bool enableAutoCompound)",
  "function unstake(uint256 tokenId)",
  "function claimRewards(address token0, address token1, uint24 fee)",
  "function toggleAutoCompound(uint256 tokenId)",
  "function compoundPosition(uint256 tokenId)",
  
  // View functions
  "function pendingRewards(address user, address token0, address token1, uint24 fee) view returns (uint256)",
  "function getUserTokenIds(address user) view returns (uint256[])",
  "function farms(bytes32 poolId) view returns (address rewardToken, uint256 rewardRate, uint256 periodFinish, uint256 lastUpdateTime, uint256 rewardPerTokenStored, uint256 totalStaked, bool isActive)",
  "function getPoolId(address token0, address token1, uint24 fee) pure returns (bytes32)",
  "function compoundInfo(uint256 tokenId) view returns (bool autoCompoundEnabled, uint256 lastCompoundTime)",
  "function stakedPositions(uint256 tokenId) view returns (address)",
  "function userInfo(bytes32 poolId, address user) view returns (uint256 rewardPerTokenPaid, uint256 rewards)",
  
  // Admin functions
  "function createFarm(address token0, address token1, uint24 fee, address rewardToken, uint256 reward, uint256 duration)",
  "function setPlatformFee(uint256 _fee)",
  "function setFeeCollector(address _feeCollector)",
  "function setCompounder(address _compounder)",
  "function setCompoundFee(uint256 _fee)",
  "function setMinCompoundInterval(uint256 _interval)",
  "function owner() view returns (address)",
  
  // State variables
  "function vvsPositionManager() view returns (address)",
  "function vvsRouter() view returns (address)",
  "function platformFeePercent() view returns (uint256)",
  "function compoundFeePercent() view returns (uint256)",
  "function minCompoundInterval() view returns (uint256)",
  "function feeCollector() view returns (address)",
  "function compounder() view returns (address)",
  
  // ERC721 receiver
  "function onERC721Received(address, address, uint256, bytes) pure returns (bytes4)"
];

const POSITION_MANAGER_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "uint256", "name": "index", "type": "uint256"}
    ],
    "name": "tokenOfOwnerByIndex",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "positions",
    "outputs": [
      {"internalType": "uint96", "name": "nonce", "type": "uint96"},
      {"internalType": "address", "name": "operator", "type": "address"},
      {"internalType": "address", "name": "token0", "type": "address"},
      {"internalType": "address", "name": "token1", "type": "address"},
      {"internalType": "uint24", "name": "fee", "type": "uint24"},
      {"internalType": "int24", "name": "tickLower", "type": "int24"},
      {"internalType": "int24", "name": "tickUpper", "type": "int24"},
      {"internalType": "uint128", "name": "liquidity", "type": "uint128"},
      {"internalType": "uint256", "name": "feeGrowthInside0LastX128", "type": "uint256"},
      {"internalType": "uint256", "name": "feeGrowthInside1LastX128", "type": "uint256"},
      {"internalType": "uint128", "name": "tokensOwed0", "type": "uint128"},
      {"internalType": "uint128", "name": "tokensOwed1", "type": "uint128"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "getApproved",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "from", "type": "address"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export interface FarmInfo {
  poolId: string;
  token0: string;
  token1: string;
  fee: number;
  isActive: boolean;
  rewardToken: string;
  rewardRate: string;
  totalStaked: string;
  endTime: number;
  rewardsPerDay: string;
}

export interface UserPosition {
  tokenId: string;
  token0: string;
  token1: string;
  fee: number;
  liquidity: string;
  autoCompoundEnabled: boolean;
  lastCompoundTime: number;
}

export interface StakedPosition extends UserPosition {
  pendingRewards: string;
  pendingFees: {
    token0: string;
    token1: string;
  };
}

export class KrisV3VaultService {
  private provider: ethers.providers.JsonRpcProvider;

  constructor() {
    // Use private RPC to avoid CORS issues
    this.provider = new ethers.providers.JsonRpcProvider('https://nd-200-297-889.p2pify.com/35f91dc125d54db6fd802c93ddadf167');
  }

  private getVaultContract(signerOrProvider?: ethers.Signer | ethers.providers.Provider): ethers.Contract {
    return new ethers.Contract(
      KRIS_V3_VAULT_ADDRESS,
      VAULT_ABI,
      signerOrProvider || this.provider
    );
  }

  private getPositionManagerContract(signerOrProvider?: ethers.Signer | ethers.providers.Provider): ethers.Contract {
    return new ethers.Contract(
      VVS_POSITION_MANAGER_ADDRESS,
      POSITION_MANAGER_ABI,
      signerOrProvider || this.provider
    );
  }

  async getFarmInfo(token0: string, token1: string, fee: number): Promise<FarmInfo | null> {
    try {
      const vault = this.getVaultContract();
      const poolId = await vault.getPoolId(token0, token1, fee);
      const farm = await vault.farms(poolId);

      if (!farm.isActive) {
        return null;
      }

      const rewardRateBN = ethers.BigNumber.from(farm.rewardRate);
      const rewardsPerDay = rewardRateBN.mul(86400);

      return {
        poolId: poolId,
        token0,
        token1,
        fee,
        isActive: farm.isActive,
        rewardToken: farm.rewardToken,
        rewardRate: farm.rewardRate.toString(),
        totalStaked: farm.totalStaked.toString(),
        endTime: farm.periodFinish.toNumber(),
        rewardsPerDay: ethers.utils.formatEther(rewardsPerDay)
      };
    } catch (error) {
      console.error('Error getting farm info:', error);
      return null;
    }
  }

  async getAllActiveFarms(): Promise<FarmInfo[]> {
    // For now, we'll check known pools
    // In production, you'd want to track this via events or a registry
    const knownPools = [
      { token0: KRIS_TOKEN, token1: WCRO_TOKEN, fee: 10000 }, // 1% fee
      { token0: KRIS_TOKEN, token1: WCRO_TOKEN, fee: 3000 },  // 0.3% fee
      { token0: KRIS_TOKEN, token1: WCRO_TOKEN, fee: 500 },   // 0.05% fee
    ];

    const farms: FarmInfo[] = [];
    for (const pool of knownPools) {
      const farm = await this.getFarmInfo(pool.token0, pool.token1, pool.fee);
      if (farm) {
        farms.push(farm);
      }
    }

    return farms;
  }

  async getUserPositions(userAddress: string): Promise<UserPosition[]> {
    try {
      // The vault expects a different position manager than the actual VVS V3 NFT Position Manager
      // We'll use the actual VVS position manager to get user positions
      console.log('Using actual VVS Position Manager:', VVS_POSITION_MANAGER_ADDRESS);
      
      // Check what the vault expects (for debugging)
      const vault = this.getVaultContract();
      const expectedPositionManager = await vault.vvsPositionManager();
      console.log('Vault expects Position Manager:', expectedPositionManager);
      
      if (expectedPositionManager.toLowerCase() !== VVS_POSITION_MANAGER_ADDRESS.toLowerCase()) {
        console.error('⚠️ Vault configuration mismatch detected!');
        console.error(`Vault expects: ${expectedPositionManager}`);
        console.error(`We are using: ${VVS_POSITION_MANAGER_ADDRESS}`);
        throw new Error('Vault configuration mismatch. Please check the vault deployment.');
      }
      
      // Use the actual VVS position manager
      const positionManager = new ethers.Contract(
        VVS_POSITION_MANAGER_ADDRESS,
        POSITION_MANAGER_ABI,
        this.provider
      );
      
      // Try to verify it's a valid ERC721 contract
      try {
        const name = await positionManager.name();
        console.log('Position Manager name:', name);
      } catch (e) {
        console.warn('Could not fetch name from Position Manager - this may be normal for some contracts');
      }
      
      const balance = await positionManager.balanceOf(userAddress);
      const positions: UserPosition[] = [];

      console.log(`Getting ${balance.toString()} positions for user ${userAddress} from Position Manager`);

      for (let i = 0; i < balance.toNumber(); i++) {
        const tokenId = await positionManager.tokenOfOwnerByIndex(userAddress, i);
        const position = await positionManager.positions(tokenId);

        positions.push({
          tokenId: tokenId.toString(),
          token0: position.token0,
          token1: position.token1,
          fee: position.fee,
          liquidity: position.liquidity.toString(),
          autoCompoundEnabled: false,
          lastCompoundTime: 0
        });
      }

      return positions;
    } catch (error: any) {
      console.error('Error getting user positions:', error);
      
      // If it's a CALL_EXCEPTION, the contract might not exist or have the right methods
      if (error.code === 'CALL_EXCEPTION') {
        console.error('Failed to interact with the Position Manager contract');
        console.error('Contract address:', VVS_POSITION_MANAGER_ADDRESS);
        console.error('This could mean:');
        console.error('1. The contract is not an ERC721 enumerable contract');
        console.error('2. The user has no positions');
        console.error('3. There is a network issue');
      }
      
      return [];
    }
  }

  async getUserStakedPositions(userAddress: string): Promise<StakedPosition[]> {
    try {
      const vault = this.getVaultContract();
      const positionManager = this.getPositionManagerContract();
      const stakedTokenIds = await vault.getUserTokenIds(userAddress);
      const stakedPositions: StakedPosition[] = [];

      for (const tokenId of stakedTokenIds) {
        const position = await positionManager.positions(tokenId);
        const compoundInfo = await vault.compoundInfo(tokenId);
        
        // Get pending rewards
        const pendingRewards = await vault.pendingRewards(
          userAddress,
          position.token0,
          position.token1,
          position.fee
        );

        stakedPositions.push({
          tokenId: tokenId.toString(),
          token0: position.token0,
          token1: position.token1,
          fee: position.fee,
          liquidity: position.liquidity.toString(),
          autoCompoundEnabled: compoundInfo.autoCompoundEnabled,
          lastCompoundTime: compoundInfo.lastCompoundTime.toNumber(),
          pendingRewards: ethers.utils.formatEther(pendingRewards),
          pendingFees: {
            token0: position.tokensOwed0.toString(),
            token1: position.tokensOwed1.toString()
          }
        });
      }

      return stakedPositions;
    } catch (error) {
      console.error('Error getting staked positions:', error);
      return [];
    }
  }

  async stakePosition(tokenId: string, enableAutoCompound: boolean, signer: ethers.Signer): Promise<string> {
    try {
      const vault = this.getVaultContract(signer);
      const positionManager = this.getPositionManagerContract(signer);
      
      // Check ownership first
      const owner = await positionManager.ownerOf(tokenId);
      const signerAddress = await signer.getAddress();
      
      if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error(`You don't own NFT #${tokenId}`);
      }
      
      // Verify the vault is using the correct position manager
      const expectedPositionManager = await vault.vvsPositionManager();
      console.log('Vault position manager:', expectedPositionManager);

      // Get position details to check if farm exists
      const position = await positionManager.positions(tokenId);
      const poolId = await vault.getPoolId(position.token0, position.token1, position.fee);
      const farm = await vault.farms(poolId);
      
      console.log('Farm check:', {
        token0: position.token0,
        token1: position.token1,
        fee: position.fee,
        poolId,
        farmIsActive: farm.isActive
      });
      
      if (!farm.isActive) {
        throw new Error(`No active farm for this pool. Please contact admin to create a farm for ${position.token0}/${position.token1} with ${position.fee/10000}% fee tier.`);
      }
      
      // Check if NFT is already staked
      const stakedOwner = await vault.stakedPositions(tokenId);
      console.log(`Staked positions check for NFT #${tokenId}:`, stakedOwner);
      
      if (stakedOwner !== ethers.constants.AddressZero && stakedOwner !== '0x0000000000000000000000000000000000000000') {
        throw new Error(`NFT #${tokenId} is already staked by ${stakedOwner}`);
      }
      
      // Double-check current ownership
      const currentOwner = await positionManager.ownerOf(tokenId);
      console.log(`Current NFT owner: ${currentOwner}, Signer: ${signerAddress}`);
      
      if (currentOwner.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error(`NFT ownership changed. Current owner: ${currentOwner}, Your address: ${signerAddress}`);
      }

      // Check if already approved
      const currentApproval = await positionManager.getApproved(tokenId);
      if (currentApproval.toLowerCase() !== KRIS_V3_VAULT_ADDRESS.toLowerCase()) {
        console.log(`Approving vault to transfer NFT #${tokenId}...`);
        const approveTx = await positionManager.approve(KRIS_V3_VAULT_ADDRESS, tokenId);
        await approveTx.wait();
        console.log('Approval successful');
      } else {
        console.log('NFT already approved for vault');
      }

      // First try a static call to get any revert reason
      console.log(`Testing stake call for NFT #${tokenId}...`);
      try {
        await vault.callStatic.stake(tokenId, enableAutoCompound);
        console.log('Static call succeeded, proceeding with actual transaction...');
      } catch (staticError: any) {
        console.error('Static call failed:', staticError);
        if (staticError.reason) {
          throw new Error(`Contract reverted: ${staticError.reason}`);
        }
        if (staticError.errorName) {
          throw new Error(`Contract error: ${staticError.errorName}`);
        }
        throw new Error('Contract would revert this transaction. Check that the NFT is not already staked and you own it.');
      }
      
      // Then stake the position with manual gas limit
      console.log(`Staking NFT #${tokenId} with autoCompound=${enableAutoCompound}...`);
      
      // Try with manual gas limit since estimation is failing
      const gasLimit = ethers.BigNumber.from("500000"); // 500k gas should be enough
      
      const stakeTx = await vault.stake(tokenId, enableAutoCompound, {
        gasLimit: gasLimit
      });
      
      console.log('Transaction sent, waiting for confirmation...');
      const receipt = await stakeTx.wait();
      
      if (receipt.status === 0) {
        throw new Error('Transaction failed - the contract reverted the stake operation');
      }
      
      console.log('Staking successful');

      return stakeTx.hash;
    } catch (error: any) {
      console.error('Error staking position:', error);
      
      // Provide more helpful error messages
      if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        throw new Error('Transaction would fail. The contract is rejecting the stake operation. Please ensure you own the NFT and it has not already been staked.');
      }
      
      if (error.reason) {
        throw new Error(`Transaction failed: ${error.reason}`);
      }
      
      if (error.data && error.data.message) {
        throw new Error(`Transaction failed: ${error.data.message}`);
      }
      
      throw error;
    }
  }

  async unstakePosition(tokenId: string, signer: ethers.Signer): Promise<string> {
    try {
      const vault = this.getVaultContract(signer);
      const tx = await vault.unstake(tokenId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error unstaking position:', error);
      throw error;
    }
  }

  async claimRewards(token0: string, token1: string, fee: number, signer: ethers.Signer): Promise<string> {
    try {
      const vault = this.getVaultContract(signer);
      const tx = await vault.claimRewards(token0, token1, fee);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error claiming rewards:', error);
      throw error;
    }
  }

  async collectFees(tokenId: string, signer: ethers.Signer): Promise<string> {
    try {
      const vault = this.getVaultContract(signer);
      // The contract uses compoundPosition to collect fees
      const tx = await vault.compoundPosition(tokenId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error collecting fees:', error);
      throw error;
    }
  }

  async toggleAutoCompound(tokenId: string, signer: ethers.Signer): Promise<string> {
    try {
      const vault = this.getVaultContract(signer);
      const tx = await vault.toggleAutoCompound(tokenId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error toggling auto-compound:', error);
      throw error;
    }
  }

  async getPendingRewards(userAddress: string, token0: string, token1: string, fee: number): Promise<string> {
    try {
      const vault = this.getVaultContract();
      const pendingRewards = await vault.pendingRewards(userAddress, token0, token1, fee);
      return ethers.utils.formatEther(pendingRewards);
    } catch (error) {
      console.error('Error getting pending rewards:', error);
      return '0';
    }
  }

  // Admin functions
  async createFarm(
    token0: string,
    token1: string,
    fee: number,
    rewardToken: string,
    reward: string,
    duration: number,
    signer: ethers.Signer
  ): Promise<string> {
    try {
      const vault = this.getVaultContract(signer);
      const rewardAmount = ethers.utils.parseEther(reward);
      
      const tx = await vault.createFarm(
        token0,
        token1,
        fee,
        rewardToken,
        rewardAmount,
        duration
      );
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error creating farm:', error);
      throw error;
    }
  }

  async isOwner(address: string): Promise<boolean> {
    try {
      const vault = this.getVaultContract();
      const owner = await vault.owner();
      console.log('Vault owner:', owner);
      console.log('Checking address:', address);
      return owner.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Error checking owner:', error);
      return false;
    }
  }

  async getOwner(): Promise<string | null> {
    try {
      const vault = this.getVaultContract();
      const owner = await vault.owner();
      return owner;
    } catch (error) {
      console.error('Error getting owner:', error);
      return null;
    }
  }
}

// Export singleton instance
export const krisV3VaultService = new KrisV3VaultService();