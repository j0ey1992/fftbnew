import { ContractTemplate } from '@/types/contract-templates'
import { NFT_STAKING_COMPILED } from './nft-staking-noncustodial-compiled'

// Use the ABI from the compiled secure contract
const NFT_STAKING_ABI = NFT_STAKING_COMPILED.abi

// Original ABI definition (kept for reference but not used)
const ORIGINAL_NFT_STAKING_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_rewardsToken",
        "type": "address"
      },
      {
        "internalType": "address[]",
        "name": "_collections",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "_ratios",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "collection",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "ratio",
        "type": "uint256"
      }
    ],
    "name": "CollectionAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "collection",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newRatio",
        "type": "uint256"
      }
    ],
    "name": "CollectionRatioUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "collection",
        "type": "address"
      }
    ],
    "name": "CollectionRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "collection",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "EmergencyWithdraw",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "collection",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "EmergencyWithdrawFailed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Recovered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "reward",
        "type": "uint256"
      }
    ],
    "name": "RewardAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "reward",
        "type": "uint256"
      }
    ],
    "name": "RewardPaid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newDuration",
        "type": "uint256"
      }
    ],
    "name": "RewardsDurationUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "collection",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Staked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "collection",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Unstaked",
    "type": "event"
  }
]

// Use the compiled bytecode from the secure contract
const NFT_STAKING_BYTECODE = NFT_STAKING_COMPILED.bytecode

export const nftStakingTemplate: ContractTemplate = {
  id: 'nft-staking-v1',
  name: 'NFT Staking Contract',
  description: 'Stake NFTs from multiple collections and earn token rewards with configurable ratios',
  category: 'staking',
  version: '1.0.0',
  enabled: true,
  sourceCode: '', // Will be populated when needed
  abi: NFT_STAKING_ABI,
  bytecode: NFT_STAKING_BYTECODE,
  parameters: [
    {
      id: 'rewardsToken',
      name: '_rewardsToken',
      type: 'address',
      description: 'Address of the ERC20 token used for rewards',
      required: true,
      validation: {
        pattern: '^0x[a-fA-F0-9]{40}$'
      }
    },
    {
      id: 'collections',
      name: '_collections',
      type: 'array',
      description: 'Array of NFT collection addresses that can be staked',
      required: true
    },
    {
      id: 'ratios',
      name: '_ratios',
      type: 'array',
      description: 'Reward ratios for each collection (must match collections array length)',
      required: true,
      validation: {
        min: 1
      }
    }
  ],
  createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
  updatedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any
}
