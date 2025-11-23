import { ContractConfig } from '@/types/contracts';

// Define contract configurations
const nftStakingConfig: ContractConfig = {
  id: 'nft-staking',
  name: 'NFT Staking',
  description: 'Create staking pools for NFT collections with customizable rewards and lock periods.',
  category: 'nfts',
  icon: 'NftStakingIcon',
  accentColor: '#3772FF',
  steps: [
    {
      title: 'Basic Setup',
      description: 'Configure the basic parameters for your NFT staking contract.',
      fields: [
        {
          id: 'contractName',
          type: 'text',
          label: 'Contract Name',
          placeholder: 'My NFT Staking Contract',
          required: true,
          helpText: 'A name for your NFT staking contract'
        },
        {
          id: 'description',
          type: 'textarea',
          label: 'Description',
          placeholder: 'Stake NFTs and earn rewards',
          required: true,
          helpText: 'A description of your NFT staking contract'
        }
      ]
    },
    {
      title: 'Reward Setup',
      description: 'Configure the token that will be used to reward stakers.',
      fields: [
        {
          id: 'rewardTokenAddress',
          type: 'text',
          label: 'Reward Token Address',
          placeholder: '0x...',
          required: true,
          helpText: 'The token used to reward stakers'
        },
        {
          id: 'rewardTokenSymbol',
          type: 'text',
          label: 'Reward Token Symbol',
          placeholder: 'TOKEN',
          required: true,
          helpText: 'Symbol of the reward token'
        },
        {
          id: 'rewardRate',
          type: 'number',
          label: 'Reward Rate (per week)',
          placeholder: '10',
          step: '0.1',
          min: '0',
          required: true,
          helpText: 'Rewards distributed per NFT per week'
        }
      ]
    },
    {
      title: 'Collections Setup',
      description: 'Add NFT collections that can be staked in this contract.',
      fields: [
        {
          id: 'collections',
          type: 'dynamic-array',
          label: 'NFT Collections',
          required: true,
          helpText: 'Add one or more NFT collections',
          itemFields: [
            {
              id: 'name',
              type: 'text',
              label: 'Collection Name',
              placeholder: 'My NFT Collection',
              required: true
            },
            {
              id: 'address',
              type: 'text',
              label: 'Collection Address',
              placeholder: '0x...',
              required: true
            },
            {
              id: 'ratio',
              type: 'number',
              label: 'Reward Ratio',
              placeholder: '1',
              min: '1',
              required: true,
              helpText: 'Relative reward weight for this collection'
            }
          ]
        }
      ]
    },
    {
      title: 'Review & Deploy',
      description: 'Review your NFT staking contract details and deploy to the blockchain.',
      fields: []
    }
  ]
};

const tokenStakingConfig: ContractConfig = {
  id: 'token-staking',
  name: 'Token Staking',
  description: 'Create a staking contract for your ERC20 token with customizable rewards and lock periods.',
  category: 'tokens',
  icon: 'TokenStakingIcon',
  accentColor: '#3772FF',
  steps: [
    {
      title: 'Token Setup',
      description: 'First, let\'s set up the token that users will be able to stake.',
      fields: [
        {
          id: 'tokenAddress',
          type: 'text',
          label: 'Token Address',
          placeholder: '0x...',
          required: true,
          helpText: 'The ERC20 token that users will stake'
        }
      ]
    },
    {
      title: 'Reward Setup',
      description: 'Now, configure the token that will be used to reward stakers.',
      fields: [
        {
          id: 'rewardTokenAddress',
          type: 'text',
          label: 'Reward Token Address',
          placeholder: '0x...',
          required: true,
          helpText: 'The token used to reward stakers'
        },
        {
          id: 'sameToken',
          type: 'checkbox',
          label: 'Same Token',
          checkboxLabel: 'Reward with the same token',
          required: false,
          helpText: 'Use the same token for staking and rewards'
        }
      ]
    },
    {
      title: 'Staking Parameters',
      description: 'Set up the rewards rate and staking period for your contract.',
      fields: [
        {
          id: 'apr',
          type: 'number',
          label: 'Annual Percentage Rate (APR)',
          placeholder: '10',
          step: '0.1',
          min: '0',
          required: true,
          helpText: 'Annual percentage rate for staking rewards'
        },
        {
          id: 'lockupPeriod',
          type: 'number',
          label: 'Lockup Period (days)',
          placeholder: '30',
          min: '0',
          required: true,
          helpText: 'How long tokens must remain staked'
        },
        {
          id: 'minStake',
          type: 'number',
          label: 'Minimum Stake Amount',
          placeholder: '100',
          min: '0',
          required: true,
          helpText: 'Minimum amount of tokens that can be staked'
        }
      ]
    },
    {
      title: 'Review & Deploy',
      description: 'Review your staking contract details and deploy to the blockchain.',
      fields: []
    }
  ]
};

const vaultConfig: ContractConfig = {
  id: 'vaults',
  name: 'Vault',
  description: 'Deploy yield-generating vaults with auto-compounding strategies for your tokens.',
  category: 'tokens',
  icon: 'VaultIcon',
  accentColor: '#01E5A9',
  steps: [
    {
      title: 'Vault Setup',
      description: 'Configure the basic parameters for your yield-generating vault.',
      fields: [
        {
          id: 'vaultName',
          type: 'text',
          label: 'Vault Name',
          placeholder: 'My Yield Vault',
          required: true,
          helpText: 'A name for your vault'
        },
        {
          id: 'depositToken',
          type: 'text',
          label: 'Deposit Token Address',
          placeholder: '0x...',
          required: true,
          helpText: 'The token users will deposit into the vault'
        }
      ]
    },
    {
      title: 'Yield Strategy',
      description: 'Configure the yield generation strategy for your vault.',
      fields: [
        {
          id: 'strategyType',
          type: 'select',
          label: 'Strategy Type',
          required: true,
          options: [
            { value: 'lending', label: 'Lending Platform' },
            { value: 'liquidity', label: 'Liquidity Provision' },
            { value: 'farming', label: 'Yield Farming' }
          ],
          helpText: 'The strategy used to generate yield'
        },
        {
          id: 'harvestFrequency',
          type: 'number',
          label: 'Harvest Frequency (hours)',
          placeholder: '24',
          min: '1',
          required: true,
          helpText: 'How often to harvest and compound rewards'
        }
      ]
    },
    {
      title: 'Fee Configuration',
      description: 'Set up the fee structure for your vault.',
      fields: [
        {
          id: 'managementFee',
          type: 'number',
          label: 'Management Fee (%)',
          placeholder: '2',
          step: '0.1',
          min: '0',
          max: '100',
          required: true,
          helpText: 'Annual management fee percentage'
        },
        {
          id: 'performanceFee',
          type: 'number',
          label: 'Performance Fee (%)',
          placeholder: '20',
          step: '0.1',
          min: '0',
          max: '100',
          required: true,
          helpText: 'Fee taken from profits'
        }
      ]
    },
    {
      title: 'Review & Deploy',
      description: 'Review your vault contract details and deploy to the blockchain.',
      fields: []
    }
  ]
};

// New TokenVault configuration
const tokenVaultConfig: ContractConfig = {
  id: 'token-vault',
  name: 'Token Vault',
  description: 'Deploy a staking vault contract with customizable rewards, lock periods, and multiple staking pools.',
  category: 'tokens',
  icon: 'VaultIcon',
  accentColor: '#01E5A9',
  steps: [
    {
      title: 'Basic Setup',
      description: 'Configure the basic parameters for your token vault.',
      fields: [
        {
          id: 'tokenName',
          type: 'text',
          label: 'Vault Token Name',
          placeholder: 'My Vault Token',
          required: true,
          helpText: 'Name for the ERC20 token representing staked tokens'
        },
        {
          id: 'tokenSymbol',
          type: 'text',
          label: 'Vault Token Symbol',
          placeholder: 'MVT',
          required: true,
          helpText: 'Symbol for the ERC20 token'
        }
      ]
    },
    {
      title: 'Token Setup',
      description: 'Configure the tokens used for staking and rewards.',
      fields: [
        {
          id: 'stakeToken',
          type: 'text',
          label: 'Stake Token Address',
          placeholder: '0x...',
          required: true,
          helpText: 'The ERC20 token that users will stake'
        },
        {
          id: 'rewardToken',
          type: 'text',
          label: 'Reward Token Address',
          placeholder: '0x...',
          required: true,
          helpText: 'The token used to reward stakers'
        }
      ]
    },
    {
      title: 'Reward Parameters',
      description: 'Configure the reward distribution parameters.',
      fields: [
        {
          id: 'rewardPerSecond',
          type: 'number',
          label: 'Reward Per Second',
          placeholder: '0.1',
          step: '0.000001',
          min: '0',
          required: true,
          helpText: 'Rate of reward distribution per second'
        },
        {
          id: 'startDate',
          type: 'text',
          label: 'Reward Start Date',
          placeholder: 'YYYY-MM-DD',
          required: true,
          helpText: 'When rewards start (will be converted to timestamp)'
        },
        {
          id: 'endDate',
          type: 'text',
          label: 'Reward End Date',
          placeholder: 'YYYY-MM-DD',
          required: true,
          helpText: 'When rewards end (will be converted to timestamp)'
        }
      ]
    },
    {
      title: 'Pool Configuration',
      description: 'Configure the staking pools with different multipliers and lock periods.',
      fields: [
        {
          id: 'pool1Multiplier',
          type: 'number',
          label: 'Pool 1 Multiplier',
          placeholder: '1',
          step: '0.1',
          min: '0.1',
          required: true,
          helpText: 'Reward multiplier for Pool 1 (e.g., 1 = base rate, 2 = double rewards)'
        },
        {
          id: 'pool1LockPeriod',
          type: 'number',
          label: 'Pool 1 Lock Period (days)',
          placeholder: '30',
          min: '1',
          required: true,
          helpText: 'How long tokens must remain staked in Pool 1 (in days)'
        },
        {
          id: 'pool2Multiplier',
          type: 'number',
          label: 'Pool 2 Multiplier',
          placeholder: '2',
          step: '0.1',
          min: '0.1',
          required: false,
          helpText: 'Reward multiplier for Pool 2 (optional)'
        },
        {
          id: 'pool2LockPeriod',
          type: 'number',
          label: 'Pool 2 Lock Period (days)',
          placeholder: '90',
          min: '1',
          required: false,
          helpText: 'How long tokens must remain staked in Pool 2 (in days, optional)'
        },
        {
          id: 'pool3Multiplier',
          type: 'number',
          label: 'Pool 3 Multiplier',
          placeholder: '3',
          step: '0.1',
          min: '0.1',
          required: false,
          helpText: 'Reward multiplier for Pool 3 (optional)'
        },
        {
          id: 'pool3LockPeriod',
          type: 'number',
          label: 'Pool 3 Lock Period (days)',
          placeholder: '180',
          min: '1',
          required: false,
          helpText: 'How long tokens must remain staked in Pool 3 (in days, optional)'
        }
      ]
    },
    {
      title: 'Review & Deploy',
      description: 'Review your vault contract details and deploy to the blockchain.',
      fields: []
    }
  ]
};

// Add more contract configurations
const lpStakingConfig: ContractConfig = {
  id: 'lp-staking',
  name: 'LP Staking',
  description: 'Create staking contracts for liquidity provider tokens with customizable rewards.',
  category: 'staking',
  icon: 'LpStakingIcon',
  accentColor: '#7B61FF',
  steps: [
    {
      title: 'LP Token Setup',
      description: 'Configure the LP token that users will be able to stake.',
      fields: [
        {
          id: 'lpTokenAddress',
          type: 'text',
          label: 'LP Token Address',
          placeholder: '0x...',
          required: true,
          helpText: 'The LP token that users will stake'
        },
        {
          id: 'lpTokenSymbol',
          type: 'text',
          label: 'LP Token Symbol',
          placeholder: 'CAKE-LP',
          required: true,
          helpText: 'Symbol of the LP token (e.g., CAKE-LP, VVS-LP)'
        }
      ]
    },
    {
      title: 'Reward Setup',
      description: 'Configure the token that will be used to reward stakers.',
      fields: [
        {
          id: 'rewardTokenAddress',
          type: 'text',
          label: 'Reward Token Address',
          placeholder: '0x...',
          required: true,
          helpText: 'The token used to reward stakers'
        },
        {
          id: 'rewardPerBlock',
          type: 'number',
          label: 'Reward Per Block',
          placeholder: '0.1',
          step: '0.000001',
          min: '0',
          required: true,
          helpText: 'Amount of reward tokens distributed per block'
        }
      ]
    },
    {
      title: 'Fee Configuration',
      description: 'Configure the fee structure for your LP staking contract.',
      fields: [
        {
          id: 'feeAddress',
          type: 'text',
          label: 'Fee Address',
          placeholder: '0x...',
          required: true,
          helpText: 'Address that will receive deposit fees'
        },
        {
          id: 'depositFeeBP',
          type: 'number',
          label: 'Deposit Fee (basis points)',
          placeholder: '100',
          min: '0',
          max: '10000',
          required: true,
          helpText: '100 basis points = 1%. Maximum 10000 (100%)'
        }
      ]
    },
    {
      title: 'Review & Deploy',
      description: 'Review your LP staking contract details and deploy to the blockchain.',
      fields: []
    }
  ]
};

const tokenLockerConfig: ContractConfig = {
  id: 'token-locker',
  name: 'Token Locker',
  description: 'Create a token locker contract to lock tokens for a specified period of time with customizable unlock intervals.',
  category: 'tokens',
  icon: 'TokenLockerIcon',
  accentColor: '#F7931A',
  contractAddress: '0x5d636048699469bcf1881b4a186d670951f6bac6',
  steps: [
    {
      title: 'Contract Setup',
      description: 'Configure the basic parameters for your token locker contract.',
      fields: [
        {
          id: 'ownerAddress',
          type: 'text',
          label: 'Contract Owner Address',
          placeholder: '0x...',
          required: true,
          helpText: 'The address that will have admin privileges for the contract'
        }
      ]
    },
    {
      title: 'Token Setup',
      description: 'Select the token you want to lock and configure locking parameters.',
      fields: [
        {
          id: 'tokenAddress',
          type: 'text',
          label: 'Token Address',
          placeholder: '0x...',
          required: true,
          helpText: 'The ERC20 token that will be locked'
        },
        {
          id: 'unlockerAddress',
          type: 'text',
          label: 'Unlocker Address',
          placeholder: '0x...',
          required: true,
          helpText: 'The address that will be able to unlock the tokens'
        }
      ]
    },
    {
      title: 'Lock Parameters',
      description: 'Configure the locking period and unlock intervals.',
      fields: [
        {
          id: 'totalAmount',
          type: 'number',
          label: 'Total Amount to Lock',
          placeholder: '1000',
          min: '0',
          required: true,
          helpText: 'The total amount of tokens to lock'
        },
        {
          id: 'unlockIntervals',
          type: 'number',
          label: 'Unlock Intervals',
          placeholder: '4',
          min: '1',
          required: true,
          helpText: 'Number of intervals for unlocking (1 for all at once)'
        },
        {
          id: 'unlockIntervalDuration',
          type: 'number',
          label: 'Interval Duration (days)',
          placeholder: '30',
          min: '1',
          required: true,
          helpText: 'Duration in days for each unlock interval'
        }
      ]
    },
    {
      title: 'Review & Deploy',
      description: 'Review your token locker details and deploy to the blockchain.',
      fields: []
    }
  ],
  abi: [{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"target","type":"address"}],"name":"AddressEmptyCode","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"AddressInsufficientBalance","type":"error"},{"inputs":[],"name":"AlreadyFullyUnlocked","type":"error"},{"inputs":[],"name":"FailedInnerCall","type":"error"},{"inputs":[],"name":"InvalidParameters","type":"error"},{"inputs":[],"name":"LockPeriodOngoing","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"inputs":[],"name":"ReentrancyGuardReentrantCall","type":"error"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"SafeERC20FailedOperation","type":"error"},{"inputs":[],"name":"TransferFailed","type":"error"},{"inputs":[],"name":"Unauthorized","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"lockId","type":"uint256"},{"indexed":true,"internalType":"address","name":"tokenAddress","type":"address"},{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"address","name":"unlocker","type":"address"},{"indexed":false,"internalType":"uint256","name":"totalAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"unlockIntervals","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"unlockIntervalDuration","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"LockCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"lockId","type":"uint256"},{"indexed":true,"internalType":"address","name":"tokenAddress","type":"address"},{"indexed":true,"internalType":"address","name":"unlocker","type":"address"},{"indexed":false,"internalType":"uint256","name":"amountUnlocked","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalUnlockedSoFar","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"Unlocked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"lockId","type":"uint256"},{"indexed":true,"internalType":"address","name":"oldUnlocker","type":"address"},{"indexed":true,"internalType":"address","name":"newUnlocker","type":"address"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"UnlockerUpdated","type":"event"},{"inputs":[{"internalType":"uint256","name":"_lockId","type":"uint256"}],"name":"availableToUnlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_tokenAddress","type":"address"},{"internalType":"address","name":"_unlocker","type":"address"},{"internalType":"uint256","name":"_totalAmount","type":"uint256"},{"internalType":"uint256","name":"_unlockIntervals","type":"uint256"},{"internalType":"uint256","name":"_unlockIntervalDuration","type":"uint256"}],"name":"createLock","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_tokenAddress","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"emergencyWithdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"lockIdCounter","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"lockers","outputs":[{"internalType":"address","name":"creator","type":"address"},{"internalType":"address","name":"unlocker","type":"address"},{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"uint256","name":"totalAmount","type":"uint256"},{"internalType":"uint256","name":"unlockedAmount","type":"uint256"},{"internalType":"uint256","name":"unlockIntervals","type":"uint256"},{"internalType":"uint256","name":"unlockIntervalDuration","type":"uint256"},{"internalType":"uint256","name":"lockDate","type":"uint256"},{"internalType":"uint256","name":"lockId","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_lockId","type":"uint256"}],"name":"unlockAvailable","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_lockId","type":"uint256"},{"internalType":"address","name":"_newUnlocker","type":"address"}],"name":"updateUnlocker","outputs":[],"stateMutability":"nonpayable","type":"function"}]
};

const erc20TokenConfig: ContractConfig = {
  id: 'erc20-token',
  name: 'ERC20 Token',
  description: 'Deploy a standard ERC20 token with customizable supply, name, and symbol.',
  category: 'tokens',
  icon: 'Erc20TokenIcon',
  accentColor: '#FF6B6B',
  steps: [
    // Steps would be defined here
    {
      title: 'Token Information',
      description: 'Set the basic information for your ERC20 token.',
      fields: []
    },
    {
      title: 'Review & Deploy',
      description: 'Review your token details and deploy to the blockchain.',
      fields: []
    }
  ]
};

const erc20TaxTokenConfig: ContractConfig = {
  id: 'erc20-tax-token',
  name: 'ERC20 Tax Token',
  description: 'Deploy an ERC20 token with built-in transaction tax mechanisms for reflection, liquidity, or marketing.',
  category: 'tokens',
  icon: 'Erc20TaxTokenIcon',
  accentColor: '#FF9F1C',
  steps: [
    // Steps would be defined here
    {
      title: 'Token Information',
      description: 'Set the basic information for your ERC20 tax token.',
      fields: []
    },
    {
      title: 'Review & Deploy',
      description: 'Review your tax token details and deploy to the blockchain.',
      fields: []
    }
  ]
};

const deployNftConfig: ContractConfig = {
  id: 'deploy-nft',
  name: 'Deploy NFT',
  description: 'Create your own NFT collection with customizable minting options and royalties.',
  category: 'nfts',
  icon: 'DeployNftIcon',
  accentColor: '#01E5A9',
  steps: [
    // Steps would be defined here
    {
      title: 'Collection Information',
      description: 'Set the basic information for your NFT collection.',
      fields: []
    },
    {
      title: 'Review & Deploy',
      description: 'Review your NFT collection details and deploy to the blockchain.',
      fields: []
    }
  ]
};

const erc404NftConfig: ContractConfig = {
  id: 'erc404-nft',
  name: 'ERC404 NFT',
  description: 'Deploy a hybrid ERC20/ERC721 token following the ERC404 standard.',
  category: 'nfts',
  icon: 'Erc404NftIcon',
  accentColor: '#7B61FF',
  steps: [
    // Steps would be defined here
    {
      title: 'Token Information',
      description: 'Set the basic information for your ERC404 token.',
      fields: []
    },
    {
      title: 'Review & Deploy',
      description: 'Review your ERC404 token details and deploy to the blockchain.',
      fields: []
    }
  ]
};

const secureStorageConfig: ContractConfig = {
  id: 'secure-storage',
  name: 'Secure Storage',
  description: 'Deploy a secure storage contract for your digital assets with customizable access controls.',
  category: 'personal',
  icon: 'SecureStorageIcon',
  accentColor: '#3772FF',
  steps: [
    // Steps would be defined here
    {
      title: 'Storage Information',
      description: 'Set the basic information for your secure storage contract.',
      fields: []
    },
    {
      title: 'Review & Deploy',
      description: 'Review your secure storage details and deploy to the blockchain.',
      fields: []
    }
  ]
};

const miniCryptoBasketConfig: ContractConfig = {
  id: 'mini-crypto-baskets',
  name: 'Mini Crypto Basket',
  description: 'Create diversified token baskets that automatically rebalance based on predefined rules.',
  category: 'multi',
  icon: 'MiniCryptoBasketIcon',
  accentColor: '#3772FF',
  steps: [
    // Steps would be defined here
    {
      title: 'Basket Information',
      description: 'Set the basic information for your crypto basket.',
      fields: []
    },
    {
      title: 'Review & Deploy',
      description: 'Review your crypto basket details and deploy to the blockchain.',
      fields: []
    }
  ]
};

// Export all contract configurations
export const contractConfigs: ContractConfig[] = [
  nftStakingConfig,
  tokenStakingConfig,
  vaultConfig,
  tokenVaultConfig,
  lpStakingConfig,
  erc20TokenConfig,
  erc20TaxTokenConfig,
  deployNftConfig,
  erc404NftConfig,
  secureStorageConfig,
  miniCryptoBasketConfig
];

// Export token locker config separately since it's already deployed and not part of the deployer
export { tokenLockerConfig };

// Helper function to get a contract configuration by ID
export function getContractConfig(id: string): ContractConfig | undefined {
  // Check if the requested ID is for the token locker
  if (id === 'token-locker') {
    return tokenLockerConfig;
  }
  
  // Otherwise, look in the regular contract configs
  return contractConfigs.find(config => config.id === id);
}

// Helper function to get contract configurations by category
export function getContractConfigsByCategory(category: string): ContractConfig[] {
  return contractConfigs.filter(config => config.category === category);
}
