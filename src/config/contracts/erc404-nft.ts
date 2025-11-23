import { ContractConfig } from '@/types/contracts';

export const erc404NftConfig: ContractConfig = {
  id: 'erc404-nft',
  name: 'ERC404 NFT',
  description: 'Deploy a hybrid ERC20/ERC721 token following the ERC404 standard.',
  category: 'nfts',
  icon: 'Erc404NftIcon',
  accentColor: '#7B61FF',
  steps: [
    {
      title: 'Token Information',
      description: 'Set the basic information for your ERC404 token.',
      fields: [
        {
          id: 'tokenName',
          type: 'text',
          label: 'Token Name',
          placeholder: 'My ERC404 Token',
          required: true,
          helpText: 'The name of your token'
        },
        {
          id: 'tokenSymbol',
          type: 'text',
          label: 'Token Symbol',
          placeholder: 'M404',
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
      title: 'Supply & NFT Configuration',
      description: 'Configure the supply and NFT parameters for your ERC404 token.',
      fields: [
        {
          id: 'initialSupply',
          type: 'number',
          label: 'Initial Supply',
          placeholder: '10000',
          min: '1',
          required: true,
          helpText: 'The initial amount of tokens to mint (each whole token = 1 NFT)'
        },
        {
          id: 'unitsPerNFT',
          type: 'number',
          label: 'Units Per NFT',
          placeholder: '1',
          min: '1',
          required: true,
          helpText: 'Number of whole tokens required to mint 1 NFT (usually 1)'
        },
        {
          id: 'baseURI',
          type: 'text',
          label: 'Base URI',
          placeholder: 'https://example.com/api/',
          required: true,
          helpText: 'The base URI for your NFT metadata'
        }
      ]
    },
    {
      title: 'Trading Configuration',
      description: 'Configure trading parameters for your ERC404 token.',
      fields: [
        {
          id: 'tradingEnabled',
          type: 'checkbox',
          label: 'Enable Trading',
          checkboxLabel: 'Enable trading immediately',
          required: false,
          helpText: 'Enable trading immediately upon deployment'
        },
        {
          id: 'transferFee',
          type: 'number',
          label: 'Transfer Fee (%)',
          placeholder: '0',
          step: '0.1',
          min: '0',
          max: '10',
          required: false,
          helpText: 'Fee percentage on transfers (0 for no fee)'
        },
        {
          id: 'feeReceiver',
          type: 'text',
          label: 'Fee Receiver',
          placeholder: '0x...',
          required: false,
          helpText: 'Address that will receive transfer fees'
        }
      ]
    },
    {
      title: 'Access Control',
      description: 'Configure access control for your ERC404 token.',
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
          id: 'whitelistExemptions',
          type: 'textarea',
          label: 'Whitelist Exemptions',
          placeholder: '0x...\n0x...',
          required: false,
          helpText: 'Addresses exempt from NFT minting requirements (one per line)'
        }
      ]
    },
    {
      title: 'Review & Deploy',
      description: 'Review your ERC404 token details and deploy to the blockchain.',
      fields: []
    }
  ],
  // ABI would be imported from a contract ABI file
  // abi: require('@/contracts/nfts/ERC404.json'),
};
