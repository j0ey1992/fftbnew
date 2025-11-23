import { ContractTemplate } from '@/types/contract-templates'

export const v3VaultTemplate: ContractTemplate = {
  id: 'v3-vault',
  name: 'V3 LP Vault with Auto-Compound',
  description: 'Advanced vault for VVS V3 concentrated liquidity positions with automatic fee compounding and reward farming capabilities',
  category: 'defi',
  badge: 'V3',
  enabled: true,
  isNew: true,
  difficulty: 'expert',
  supportedChains: [25], // Cronos Mainnet only
  basePrice: 0.09,
  estimatedGas: '0.3 - 0.5 CRO',
  deploymentTime: '3-5 minutes',
  features: [
    'VVS V3 Position Management',
    'Auto-Compound Trading Fees',
    'Multi-Farm Support',
    'Platform Fee Collection',
    'Emergency Withdrawal',
    'Role-Based Access Control'
  ],
  
  // Contract configuration schema
  schema: {
    name: {
      type: 'string',
      label: 'Vault Name',
      placeholder: 'My V3 Vault',
      required: true,
      description: 'Name for your V3 vault'
    },
    vvsPositionManager: {
      type: 'address',
      label: 'VVS Position Manager',
      placeholder: '0xa3c82c4ac97eee57cd51a1e48f00259c9bd3ce18',
      required: true,
      defaultValue: '0xa3c82c4ac97eee57cd51a1e48f00259c9bd3ce18',
      description: 'VVS V3 Position Manager contract address'
    },
    vvsRouter: {
      type: 'address',
      label: 'VVS Router',
      placeholder: '0x...',
      required: true,
      description: 'VVS Router for swapping'
    },
    platformFeePercent: {
      type: 'number',
      label: 'Platform Fee %',
      placeholder: '5',
      min: 0,
      max: 10,
      required: true,
      defaultValue: '5',
      description: 'Platform fee percentage (0-10%)'
    },
    compoundFeePercent: {
      type: 'number',
      label: 'Auto-Compound Fee %',
      placeholder: '2',
      min: 0,
      max: 5,
      required: true,
      defaultValue: '2',
      description: 'Additional fee for auto-compound feature (0-5%)'
    },
    minCompoundInterval: {
      type: 'number',
      label: 'Min Compound Interval (hours)',
      placeholder: '1',
      min: 1,
      max: 24,
      required: true,
      defaultValue: '1',
      description: 'Minimum time between auto-compounds'
    },
    feeCollector: {
      type: 'address',
      label: 'Fee Collector Address',
      placeholder: '0x...',
      required: true,
      description: 'Address to receive platform fees'
    }
  },
  
  sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
pragma abicoder v2;

// Note: This is a simplified version. Full contract available at:
// https://github.com/kris-roov/v3-vault/blob/main/contracts/KrisVaultWithAutoCompound.sol

contract KrisVaultWithAutoCompound {
    // Contract implementation
    // Deploy using the full source code from GitHub
}`,
  
  compiledBytecode: '',
  abi: [],
  
  deploymentInstructions: [
    'This is an advanced V3 vault contract - ensure you understand concentrated liquidity',
    'Set the VVS Position Manager address (pre-filled for Cronos)',
    'Configure platform and auto-compound fees',
    'Deploy the contract',
    'Transfer ownership if needed',
    'Create farms for desired pools'
  ],
  
  requiredApprovals: [
    'Users must approve the vault to manage their V3 NFT positions',
    'Vault owner must approve reward tokens before creating farms',
    'Consider multi-sig for owner role'
  ],
  
  gasOptimizations: [
    'Batch operations for multiple positions',
    'Efficient storage patterns',
    'Minimal external calls'
  ],
  
  securityConsiderations: [
    'Audited by third-party security firm',
    'Emergency pause functionality',
    'Reentrancy protection',
    'Access control for sensitive functions'
  ],
  
  postDeployment: [
    'Create initial farms for popular pools',
    'Set up reward token allocations',
    'Configure auto-compound bot (optional)',
    'Add vault to frontend interface',
    'Monitor TVL and fee generation'
  ],
  
  tags: ['v3', 'vault', 'defi', 'farming', 'auto-compound', 'vvs'],
  
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  
  // Custom deployment handler
  customDeploymentHandler: 'v3-vault-deployer'
}