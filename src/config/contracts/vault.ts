import { ContractConfig } from '@/types/contracts';

export const vaultConfig: ContractConfig = {
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
  ],
  // ABI would be imported from a contract ABI file
  // abi: require('@/contracts/staking/Pushvaultcontract.json'),
};
