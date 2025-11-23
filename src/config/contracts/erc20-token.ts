import { ContractConfig } from '@/types/contracts';

export const erc20TokenConfig: ContractConfig = {
  id: 'erc20-token',
  name: 'ERC20 Token',
  description: 'Deploy a standard ERC20 token with customizable supply, name, and symbol.',
  category: 'tokens',
  icon: 'Erc20TokenIcon',
  accentColor: '#FF6B6B',
  steps: [
    {
      title: 'Token Information',
      description: 'Set the basic information for your ERC20 token.',
      fields: [
        {
          id: 'tokenName',
          type: 'text',
          label: 'Token Name',
          placeholder: 'My Token',
          required: true,
          helpText: 'The name of your token (e.g., Bitcoin)'
        },
        {
          id: 'tokenSymbol',
          type: 'text',
          label: 'Token Symbol',
          placeholder: 'MTK',
          required: true,
          helpText: 'The symbol of your token (e.g., BTC)'
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
        },
        {
          id: 'mintable',
          type: 'checkbox',
          label: 'Mintable',
          checkboxLabel: 'Allow minting of new tokens',
          required: false,
          helpText: 'Enable the ability to mint additional tokens after deployment'
        },
        {
          id: 'burnable',
          type: 'checkbox',
          label: 'Burnable',
          checkboxLabel: 'Allow burning of tokens',
          required: false,
          helpText: 'Enable the ability to burn tokens'
        }
      ]
    },
    {
      title: 'Access Control',
      description: 'Configure access control for your token.',
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
          id: 'pausable',
          type: 'checkbox',
          label: 'Pausable',
          checkboxLabel: 'Allow pausing of token transfers',
          required: false,
          helpText: 'Enable the ability to pause token transfers in case of emergency'
        },
        {
          id: 'permit',
          type: 'checkbox',
          label: 'EIP-2612 Permit',
          checkboxLabel: 'Enable gasless approvals',
          required: false,
          helpText: 'Implement EIP-2612 permit function for gasless approvals'
        }
      ]
    },
    {
      title: 'Review & Deploy',
      description: 'Review your token details and deploy to the blockchain.',
      fields: []
    }
  ],
  // ABI would be imported from a contract ABI file
  // abi: require('@/contracts/tokens/ERC20.json'),
};
