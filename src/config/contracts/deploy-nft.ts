import { ContractConfig } from '@/types/contracts';

export const deployNftConfig: ContractConfig = {
  id: 'deploy-nft',
  name: 'Deploy NFT',
  description: 'Create your own NFT collection with customizable minting options and royalties.',
  category: 'nfts',
  icon: 'DeployNftIcon',
  accentColor: '#01E5A9',
  steps: [
    {
      title: 'Collection Information',
      description: 'Set the basic information for your NFT collection.',
      fields: [
        {
          id: 'collectionName',
          type: 'text',
          label: 'Collection Name',
          placeholder: 'My NFT Collection',
          required: true,
          helpText: 'The name of your NFT collection'
        },
        {
          id: 'collectionSymbol',
          type: 'text',
          label: 'Collection Symbol',
          placeholder: 'MNFT',
          required: true,
          helpText: 'The symbol of your NFT collection'
        },
        {
          id: 'description',
          type: 'textarea',
          label: 'Description',
          placeholder: 'Describe your NFT collection...',
          required: true,
          helpText: 'A description of your NFT collection'
        }
      ]
    },
    {
      title: 'Metadata Configuration',
      description: 'Configure the metadata for your NFT collection.',
      fields: [
        {
          id: 'baseURI',
          type: 'text',
          label: 'Base URI',
          placeholder: 'https://example.com/api/',
          required: true,
          helpText: 'The base URI for your NFT metadata'
        },
        {
          id: 'revealable',
          type: 'checkbox',
          label: 'Revealable',
          checkboxLabel: 'Enable delayed reveal',
          required: false,
          helpText: 'Enable delayed reveal for your NFTs'
        },
        {
          id: 'placeholderURI',
          type: 'text',
          label: 'Placeholder URI',
          placeholder: 'https://example.com/placeholder.json',
          required: false,
          helpText: 'URI for placeholder metadata before reveal'
        }
      ]
    },
    {
      title: 'Minting Configuration',
      description: 'Configure the minting options for your NFT collection.',
      fields: [
        {
          id: 'maxSupply',
          type: 'number',
          label: 'Maximum Supply',
          placeholder: '10000',
          min: '1',
          required: true,
          helpText: 'The maximum number of NFTs that can be minted'
        },
        {
          id: 'mintPrice',
          type: 'number',
          label: 'Mint Price (ETH)',
          placeholder: '0.05',
          step: '0.001',
          min: '0',
          required: true,
          helpText: 'The price to mint each NFT'
        },
        {
          id: 'maxMintPerTx',
          type: 'number',
          label: 'Max Mint Per Transaction',
          placeholder: '10',
          min: '1',
          required: true,
          helpText: 'Maximum number of NFTs that can be minted in a single transaction'
        },
        {
          id: 'maxMintPerWallet',
          type: 'number',
          label: 'Max Mint Per Wallet',
          placeholder: '20',
          min: '0',
          required: false,
          helpText: 'Maximum number of NFTs that can be minted per wallet (0 for no limit)'
        }
      ]
    },
    {
      title: 'Royalties & Access',
      description: 'Configure royalties and access control for your NFT collection.',
      fields: [
        {
          id: 'royaltyPercentage',
          type: 'number',
          label: 'Royalty Percentage (%)',
          placeholder: '5',
          step: '0.1',
          min: '0',
          max: '15',
          required: true,
          helpText: 'Percentage of secondary sales that goes to the creator'
        },
        {
          id: 'royaltyAddress',
          type: 'text',
          label: 'Royalty Receiver Address',
          placeholder: '0x...',
          required: true,
          helpText: 'Address that will receive royalties'
        },
        {
          id: 'ownerAddress',
          type: 'text',
          label: 'Owner Address',
          placeholder: '0x...',
          required: true,
          helpText: 'The address that will own the NFT contract'
        },
        {
          id: 'presaleEnabled',
          type: 'checkbox',
          label: 'Presale',
          checkboxLabel: 'Enable presale/whitelist',
          required: false,
          helpText: 'Enable a presale period with whitelist'
        }
      ]
    },
    {
      title: 'Review & Deploy',
      description: 'Review your NFT collection details and deploy to the blockchain.',
      fields: []
    }
  ],
  // ABI would be imported from a contract ABI file
  // abi: require('@/contracts/nfts/ERC721.json'),
};
