import { ContractConfig } from '@/types/contracts';

export const tokenStakingConfig: ContractConfig = {
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
  ],
  // ABI would be imported from a contract ABI file
  // abi: require('@/contracts/staking/Smartchef.json'),
};
