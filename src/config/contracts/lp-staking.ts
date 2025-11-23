import { ContractConfig } from '@/types/contracts';

export const lpStakingConfig: ContractConfig = {
  id: 'lp-staking',
  name: 'LP Staking',
  description: 'Create staking contracts for liquidity provider tokens with customizable rewards.',
  category: 'staking',
  icon: 'LpStakingIcon',
  accentColor: '#7B61FF',
  steps: [
    {
      title: 'LP Token Setup',
      description: 'Which LP tokens can people stake in your pool?',
      fields: [
        {
          id: 'lpTokenAddress',
          type: 'text',
          label: 'LP Token Address',
          placeholder: '0x... (paste the LP token address here)',
          required: true,
          helpText: 'This is the LP token people will deposit to earn rewards'
        },
        {
          id: 'lpPair',
          type: 'text',
          label: 'What pair is this?',
          placeholder: 'USDC-ETH (what tokens make up this LP)',
          required: true,
          helpText: 'Help people understand what LP token this is'
        }
      ]
    },
    {
      title: 'Reward Setup',
      description: 'What rewards will you give to stakers?',
      fields: [
        {
          id: 'rewardTokenAddress',
          type: 'text',
          label: 'Reward Token Address',
          placeholder: '0x... (paste your reward token address)',
          required: true,
          helpText: 'This is what stakers will earn (could be your project token!)'
        },
        {
          id: 'rewardPerBlock',
          type: 'number',
          label: 'Rewards Per Block',
          placeholder: '10 (how many tokens per block)',
          step: '0.01',
          min: '0',
          required: true,
          helpText: 'Higher numbers = more rewards for stakers!'
        }
      ]
    },
    {
      title: 'Pool Settings',
      description: 'How should your staking pool work?',
      fields: [
        {
          id: 'startBlock',
          type: 'number',
          label: 'When to start rewards?',
          placeholder: '0 (start immediately)',
          min: '0',
          required: true,
          helpText: 'Use 0 to start rewards right away'
        },
        {
          id: 'bonusEndBlock',
          type: 'number',
          label: 'When do rewards end?',
          placeholder: '1000000 (block number in the future)',
          min: '0',
          required: true,
          helpText: 'Pick a high number like 1000000 for long-term rewards'
        },
        {
          id: 'poolLimitPerUser',
          type: 'number',
          label: 'Max per person (optional)',
          placeholder: '0 (no limit)',
          min: '0',
          required: true,
          helpText: 'Use 0 for no limit, or set a max amount per user'
        },
        {
          id: 'withdrawalFee',
          type: 'number',
          label: 'Exit fee (%)',
          placeholder: '0 (no fee)',
          step: '0.1',
          min: '0',
          max: '100',
          required: true,
          helpText: 'Small fee when people withdraw (0-5% is common)'
        }
      ]
    },
    {
      title: 'Review & Deploy',
      description: 'Everything looks good? Let\'s deploy your staking contract!',
      fields: []
    }
  ],
  // ABI would be imported from a contract ABI file
  // abi: require('@/contracts/staking/lpstaking.json'),
};
