import { ContractConfig } from '@/types/contracts';

export const tokenLockerConfig: ContractConfig = {
  id: 'token-locker',
  name: 'Token Locker',
  description: 'Create a token locker contract to lock tokens for a specified period of time.',
  category: 'tokens',
  icon: 'TokenLockerIcon',
  accentColor: '#F7931A',
  steps: [
    {
      title: 'Token Setup',
      description: 'Select the token you want to lock.',
      fields: [
        {
          id: 'tokenAddress',
          type: 'text',
          label: 'Token Address',
          placeholder: '0x...',
          required: true,
          helpText: 'The ERC20 token you want to lock'
        }
      ]
    },
    {
      title: 'Lock Parameters',
      description: 'Configure the lock parameters for your tokens.',
      fields: [
        {
          id: 'lockAmount',
          type: 'number',
          label: 'Lock Amount',
          placeholder: '1000',
          min: '0',
          required: true,
          helpText: 'The amount of tokens to lock'
        },
        {
          id: 'lockDuration',
          type: 'number',
          label: 'Lock Duration (days)',
          placeholder: '365',
          min: '1',
          required: true,
          helpText: 'How long the tokens will be locked'
        },
        {
          id: 'unlockDate',
          type: 'text',
          label: 'Unlock Date',
          placeholder: 'YYYY-MM-DD',
          required: false,
          helpText: 'Specific date when tokens will unlock (optional, overrides duration)'
        }
      ]
    },
    {
      title: 'Beneficiary Setup',
      description: 'Configure who can withdraw the tokens after the lock period.',
      fields: [
        {
          id: 'beneficiaryAddress',
          type: 'text',
          label: 'Beneficiary Address',
          placeholder: '0x...',
          required: true,
          helpText: 'The address that can withdraw tokens after the lock period'
        },
        {
          id: 'transferable',
          type: 'checkbox',
          label: 'Transferable',
          checkboxLabel: 'Allow transfer of lock ownership',
          required: false,
          helpText: 'Enable the ability to transfer lock ownership to another address'
        }
      ]
    },
    {
      title: 'Vesting Schedule',
      description: 'Configure optional vesting schedule for gradual unlocking.',
      fields: [
        {
          id: 'enableVesting',
          type: 'checkbox',
          label: 'Enable Vesting',
          checkboxLabel: 'Enable gradual vesting of tokens',
          required: false,
          helpText: 'Enable gradual release of tokens over time'
        },
        {
          id: 'vestingPeriods',
          type: 'number',
          label: 'Vesting Periods',
          placeholder: '12',
          min: '1',
          required: false,
          helpText: 'Number of vesting periods (e.g., 12 for monthly over a year)'
        },
        {
          id: 'cliffPeriod',
          type: 'number',
          label: 'Cliff Period (days)',
          placeholder: '90',
          min: '0',
          required: false,
          helpText: 'Initial period before vesting begins'
        }
      ]
    },
    {
      title: 'Review & Deploy',
      description: 'Review your token locker details and deploy to the blockchain.',
      fields: []
    }
  ],
  // ABI would be imported from a contract ABI file
  // abi: require('@/contracts/tokens/TokenLocker.json'),
};
