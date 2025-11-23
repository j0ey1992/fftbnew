// SmartChef Factory Contract Interface
export const SMARTCHEF_FACTORY_ADDRESS = '0x8b82daca3bded4fcd6c916a8c3f1618ba896e06b'

// SmartChef Factory ABI - extracted from the bytecode
export const SMARTCHEF_FACTORY_ABI = [
  {
    "inputs": [
      {"internalType": "contract IERC20Metadata", "name": "_stakedToken", "type": "address"},
      {"internalType": "contract IERC20Metadata", "name": "_rewardToken", "type": "address"},
      {"internalType": "uint256", "name": "_rewardPerBlock", "type": "uint256"},
      {"internalType": "uint256", "name": "_startBlock", "type": "uint256"},
      {"internalType": "uint256", "name": "_bonusEndBlock", "type": "uint256"},
      {"internalType": "uint256", "name": "_poolLimitPerUser", "type": "uint256"},
      {"internalType": "uint256", "name": "_numberBlocksForUserLimit", "type": "uint256"},
      {"internalType": "uint256", "name": "_minStakingPeriod", "type": "uint256"},
      {"internalType": "bool", "name": "_useInitialLockPeriod", "type": "bool"},
      {"internalType": "address", "name": "_admin", "type": "address"},
      {"internalType": "address", "name": "_manager", "type": "address"}
    ],
    "name": "deployPool",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_fee", "type": "uint256"}],
    "name": "setDeploymentFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "deploymentFee",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "collector",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_collector", "type": "address"}],
    "name": "setCollector",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "poolAddress", "type": "address"}
    ],
    "name": "NewSmartChefContract",
    "type": "event"
  }
]

/**
 * Deploys a new SmartChef staking pool using the factory contract
 * @param provider Ethers provider
 * @param params Deployment parameters
 * @returns The deployed pool address
 */
export async function deploySmartChefPool(
  provider: any,
  params: {
    stakedToken: string
    rewardToken: string
    rewardPerBlock: string
    startBlock: number
    bonusEndBlock: number
    poolLimitPerUser: string
    numberBlocksForUserLimit: number
    minStakingPeriod: number
    useInitialLockPeriod: boolean
    admin: string
    manager: string
  }
): Promise<string> {
  const { ethers } = await import('ethers')
  const signer = provider.getSigner()
  
  // Create factory contract instance
  const factory = new ethers.Contract(
    SMARTCHEF_FACTORY_ADDRESS,
    SMARTCHEF_FACTORY_ABI,
    signer
  )
  
  // Get deployment fee
  const deploymentFee = await factory.deploymentFee()
  
  // Deploy the pool
  const tx = await factory.deployPool(
    params.stakedToken,
    params.rewardToken,
    params.rewardPerBlock,
    params.startBlock,
    params.bonusEndBlock,
    params.poolLimitPerUser,
    params.numberBlocksForUserLimit,
    params.minStakingPeriod,
    params.useInitialLockPeriod,
    params.admin,
    params.manager,
    { value: deploymentFee }
  )
  
  // Wait for transaction and get the event
  const receipt = await tx.wait()
  
  // Find the NewSmartChefContract event
  const event = receipt.events?.find(
    (e: any) => e.event === 'NewSmartChefContract'
  )
  
  if (!event || !event.args) {
    throw new Error('Failed to get deployed pool address from event')
  }
  
  return event.args.poolAddress
}