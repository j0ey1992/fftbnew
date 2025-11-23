import { ContractConfig } from '@/types/contracts';

export const miniCryptoBasketConfig: ContractConfig = {
  id: 'mini-crypto-basket',
  name: 'Mini Crypto Basket',
  description: 'Create diversified token baskets that automatically rebalance based on predefined rules.',
  category: 'multi',
  icon: 'MiniCryptoBasketIcon',
  accentColor: '#3772FF',
  steps: [
    {
      title: 'Basket Information',
      description: 'Set the basic information for your crypto basket.',
      fields: [
        {
          id: 'basketName',
          type: 'text',
          label: 'Basket Name',
          placeholder: 'My Crypto Basket',
          required: true,
          helpText: 'The name of your crypto basket'
        },
        {
          id: 'basketSymbol',
          type: 'text',
          label: 'Basket Symbol',
          placeholder: 'MCB',
          required: true,
          helpText: 'The symbol of your crypto basket token'
        },
        {
          id: 'description',
          type: 'textarea',
          label: 'Description',
          placeholder: 'Describe your crypto basket...',
          required: false,
          helpText: 'A description of your crypto basket'
        }
      ]
    },
    {
      title: 'Token Selection',
      description: 'Select the tokens to include in your basket.',
      fields: [
        {
          id: 'token1Address',
          type: 'text',
          label: 'Token 1 Address',
          placeholder: '0x...',
          required: true,
          helpText: 'Address of the first token in your basket'
        },
        {
          id: 'token1Weight',
          type: 'number',
          label: 'Token 1 Weight (%)',
          placeholder: '25',
          min: '1',
          max: '100',
          required: true,
          helpText: 'Percentage weight of the first token'
        },
        {
          id: 'token2Address',
          type: 'text',
          label: 'Token 2 Address',
          placeholder: '0x...',
          required: true,
          helpText: 'Address of the second token in your basket'
        },
        {
          id: 'token2Weight',
          type: 'number',
          label: 'Token 2 Weight (%)',
          placeholder: '25',
          min: '1',
          max: '100',
          required: true,
          helpText: 'Percentage weight of the second token'
        },
        {
          id: 'token3Address',
          type: 'text',
          label: 'Token 3 Address',
          placeholder: '0x...',
          required: false,
          helpText: 'Address of the third token in your basket'
        },
        {
          id: 'token3Weight',
          type: 'number',
          label: 'Token 3 Weight (%)',
          placeholder: '25',
          min: '1',
          max: '100',
          required: false,
          helpText: 'Percentage weight of the third token'
        },
        {
          id: 'token4Address',
          type: 'text',
          label: 'Token 4 Address',
          placeholder: '0x...',
          required: false,
          helpText: 'Address of the fourth token in your basket'
        },
        {
          id: 'token4Weight',
          type: 'number',
          label: 'Token 4 Weight (%)',
          placeholder: '25',
          min: '1',
          max: '100',
          required: false,
          helpText: 'Percentage weight of the fourth token'
        }
      ]
    },
    {
      title: 'Rebalancing Strategy',
      description: 'Configure the rebalancing strategy for your basket.',
      fields: [
        {
          id: 'rebalancingFrequency',
          type: 'select',
          label: 'Rebalancing Frequency',
          required: true,
          options: [
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'quarterly', label: 'Quarterly' },
            { value: 'manual', label: 'Manual Only' }
          ],
          helpText: 'How often the basket should rebalance'
        },
        {
          id: 'deviationThreshold',
          type: 'number',
          label: 'Deviation Threshold (%)',
          placeholder: '5',
          min: '1',
          max: '50',
          required: true,
          helpText: 'Percentage deviation that triggers rebalancing'
        },
        {
          id: 'rebalancingFee',
          type: 'number',
          label: 'Rebalancing Fee (%)',
          placeholder: '0.1',
          step: '0.01',
          min: '0',
          max: '5',
          required: true,
          helpText: 'Fee charged during rebalancing'
        }
      ]
    },
    {
      title: 'Access Control',
      description: 'Configure access control for your crypto basket.',
      fields: [
        {
          id: 'ownerAddress',
          type: 'text',
          label: 'Owner Address',
          placeholder: '0x...',
          required: true,
          helpText: 'The address that will own the basket contract'
        },
        {
          id: 'managerAddress',
          type: 'text',
          label: 'Manager Address',
          placeholder: '0x...',
          required: false,
          helpText: 'Address that can manage the basket (if different from owner)'
        },
        {
          id: 'managementFee',
          type: 'number',
          label: 'Management Fee (%)',
          placeholder: '1',
          step: '0.1',
          min: '0',
          max: '10',
          required: true,
          helpText: 'Annual management fee percentage'
        }
      ]
    },
    {
      title: 'Review & Deploy',
      description: 'Review your crypto basket details and deploy to the blockchain.',
      fields: []
    }
  ],
  // ABI would be imported from a contract ABI file
  // abi: require('@/contracts/baskets/MiniCryptoBasket.json'),
};
