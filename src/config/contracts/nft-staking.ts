import { ContractConfig } from '@/types/contracts';

export const nftStakingConfig: ContractConfig = {
  id: 'nft-staking',
  name: 'NFT Staking',
  description: 'Create staking pools for NFT collections with customizable rewards and lock periods.',
  category: 'nfts',
  icon: 'NftStakingIcon',
  accentColor: '#3772FF',
  steps: [
    {
      title: 'Collection Setup',
      description: 'First, let\'s set up the NFT collection that users will be able to stake.',
      fields: [
        {
          id: 'collectionAddress',
          type: 'text',
          label: 'NFT Collection Address',
          placeholder: '0x...',
          required: true,
          helpText: 'The NFT collection that users will stake'
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
        }
      ]
    },
    {
      title: 'Staking Parameters',
      description: 'Set up the rewards rate and staking period for your contract.',
      fields: [
        {
          id: 'rewardRate',
          type: 'number',
          label: 'Reward Rate (per day)',
          placeholder: '0.1',
          step: '0.01',
          min: '0',
          required: true,
          helpText: 'Rewards distributed per NFT per day'
        },
        {
          id: 'lockupPeriod',
          type: 'number',
          label: 'Lockup Period (days)',
          placeholder: '30',
          min: '0',
          required: true,
          helpText: 'How long NFTs must remain staked'
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
  // abi: require('@/contracts/staking/Nftstakingv1.json'),
};
