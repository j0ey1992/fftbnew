import { ContractConfig } from '@/types/contracts';

export const erc20TaxTokenConfig: ContractConfig = {
  id: 'erc20-tax-token',
  name: 'ERC20 Tax Token',
  description: 'Deploy an ERC20 token with built-in transaction tax mechanisms for reflection, liquidity, or marketing.',
  category: 'tokens',
  icon: 'Erc20TaxTokenIcon',
  accentColor: '#FF9F1C',
  steps: [
    {
      title: 'Token Information',
      description: 'Set the basic information for your ERC20 tax token.',
      fields: [
        {
          id: 'tokenName',
          type: 'text',
          label: 'Token Name',
          placeholder: 'My Tax Token',
          required: true,
          helpText: 'The name of your token'
        },
        {
          id: 'tokenSymbol',
          type: 'text',
          label: 'Token Symbol',
          placeholder: 'MTX',
          required: true,
          helpText: 'The symbol of your token'
        },
        {
          id: 'decimals',
          type: 'number',
          label: 'Decimals',
          placeholder: '18',
          min: '0',
          max: '18',
          required: true,
          helpText: 'Number of decimal places (usually 18)'
        }
      ]
    },
    {
      title: 'Supply Configuration',
      description: 'Configure the supply parameters for your token.',
      fields: [
        {
          id: 'initialSupply',
          type: 'number',
          label: 'Initial Supply',
          placeholder: '1000000',
          min: '0',
          required: true,
          helpText: 'The initial amount of tokens to mint'
        },
        {
          id: 'maxSupply',
          type: 'number',
          label: 'Maximum Supply',
          placeholder: '1000000',
          min: '0',
          required: false,
          helpText: 'Maximum token supply (0 for unlimited)'
        }
      ]
    },
    {
      title: 'Tax Configuration',
      description: 'Configure the tax mechanisms for your token.',
      fields: [
        {
          id: 'buyTax',
          type: 'number',
          label: 'Buy Tax (%)',
          placeholder: '5',
          step: '0.1',
          min: '0',
          max: '25',
          required: true,
          helpText: 'Tax percentage applied to buy transactions'
        },
        {
          id: 'sellTax',
          type: 'number',
          label: 'Sell Tax (%)',
          placeholder: '5',
          step: '0.1',
          min: '0',
          max: '25',
          required: true,
          helpText: 'Tax percentage applied to sell transactions'
        },
        {
          id: 'transferTax',
          type: 'number',
          label: 'Transfer Tax (%)',
          placeholder: '0',
          step: '0.1',
          min: '0',
          max: '25',
          required: true,
          helpText: 'Tax percentage applied to transfer transactions'
        }
      ]
    },
    {
      title: 'Tax Distribution',
      description: 'Configure how the collected tax is distributed.',
      fields: [
        {
          id: 'reflectionPercentage',
          type: 'number',
          label: 'Reflection Percentage (%)',
          placeholder: '50',
          step: '1',
          min: '0',
          max: '100',
          required: true,
          helpText: 'Percentage of tax redistributed to holders'
        },
        {
          id: 'liquidityPercentage',
          type: 'number',
          label: 'Liquidity Percentage (%)',
          placeholder: '30',
          step: '1',
          min: '0',
          max: '100',
          required: true,
          helpText: 'Percentage of tax added to liquidity'
        },
        {
          id: 'marketingPercentage',
          type: 'number',
          label: 'Marketing Percentage (%)',
          placeholder: '20',
          step: '1',
          min: '0',
          max: '100',
          required: true,
          helpText: 'Percentage of tax sent to marketing wallet'
        },
        {
          id: 'marketingWallet',
          type: 'text',
          label: 'Marketing Wallet',
          placeholder: '0x...',
          required: true,
          helpText: 'Wallet address to receive marketing funds'
        }
      ]
    },
    {
      title: 'Advanced Settings',
      description: 'Configure advanced settings for your tax token.',
      fields: [
        {
          id: 'ownerAddress',
          type: 'text',
          label: 'Owner Address',
          placeholder: '0x...',
          required: true,
          helpText: 'The address that will own the token contract'
        },
        {
          id: 'autoLiquidity',
          type: 'checkbox',
          label: 'Auto Liquidity',
          checkboxLabel: 'Enable automatic liquidity generation',
          required: false,
          helpText: 'Automatically add to liquidity pool on each transaction'
        },
        {
          id: 'maxWalletPercentage',
          type: 'number',
          label: 'Max Wallet Size (%)',
          placeholder: '1',
          step: '0.1',
          min: '0',
          max: '100',
          required: false,
          helpText: 'Maximum percentage of total supply a wallet can hold (0 for no limit)'
        },
        {
          id: 'maxTxPercentage',
          type: 'number',
          label: 'Max Transaction Size (%)',
          placeholder: '1',
          step: '0.1',
          min: '0',
          max: '100',
          required: false,
          helpText: 'Maximum percentage of total supply per transaction (0 for no limit)'
        }
      ]
    },
    {
      title: 'Review & Deploy',
      description: 'Review your tax token details and deploy to the blockchain.',
      fields: []
    }
  ],
  // ABI would be imported from a contract ABI file
  // abi: require('@/contracts/tokens/ERC20Tax.json'),
};
