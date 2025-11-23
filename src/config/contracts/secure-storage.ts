import { ContractConfig } from '@/types/contracts';

export const secureStorageConfig: ContractConfig = {
  id: 'secure-storage',
  name: 'Secure Storage',
  description: 'Deploy a secure storage contract for your digital assets with customizable access controls.',
  category: 'personal',
  icon: 'SecureStorageIcon',
  accentColor: '#3772FF',
  steps: [
    {
      title: 'Storage Information',
      description: 'Set the basic information for your secure storage contract.',
      fields: [
        {
          id: 'storageName',
          type: 'text',
          label: 'Storage Name',
          placeholder: 'My Secure Storage',
          required: true,
          helpText: 'A name for your secure storage contract'
        },
        {
          id: 'description',
          type: 'textarea',
          label: 'Description',
          placeholder: 'Describe the purpose of this storage...',
          required: false,
          helpText: 'A description of your secure storage contract'
        }
      ]
    },
    {
      title: 'Storage Configuration',
      description: 'Configure the storage parameters for your contract.',
      fields: [
        {
          id: 'storageType',
          type: 'select',
          label: 'Storage Type',
          required: true,
          options: [
            { value: 'basic', label: 'Basic Storage' },
            { value: 'encrypted', label: 'Encrypted Storage' },
            { value: 'timelocked', label: 'Time-locked Storage' }
          ],
          helpText: 'The type of storage to deploy'
        },
        {
          id: 'maxStorageSize',
          type: 'number',
          label: 'Maximum Storage Size (KB)',
          placeholder: '1024',
          min: '1',
          required: true,
          helpText: 'Maximum storage size in kilobytes'
        },
        {
          id: 'enableVersioning',
          type: 'checkbox',
          label: 'Enable Versioning',
          checkboxLabel: 'Keep history of changes',
          required: false,
          helpText: 'Store version history of changes to stored data'
        }
      ]
    },
    {
      title: 'Access Control',
      description: 'Configure access control for your secure storage.',
      fields: [
        {
          id: 'ownerAddress',
          type: 'text',
          label: 'Owner Address',
          placeholder: '0x...',
          required: true,
          helpText: 'The address that will own the storage contract'
        },
        {
          id: 'accessType',
          type: 'select',
          label: 'Access Type',
          required: true,
          options: [
            { value: 'private', label: 'Private (Owner Only)' },
            { value: 'shared', label: 'Shared (Whitelist)' },
            { value: 'public', label: 'Public (Read-only)' }
          ],
          helpText: 'Who can access the stored data'
        },
        {
          id: 'authorizedAddresses',
          type: 'textarea',
          label: 'Authorized Addresses',
          placeholder: '0x...\n0x...',
          required: false,
          helpText: 'Addresses authorized to access the storage (one per line)'
        }
      ]
    },
    {
      title: 'Advanced Settings',
      description: 'Configure advanced settings for your secure storage.',
      fields: [
        {
          id: 'timelock',
          type: 'number',
          label: 'Timelock Period (days)',
          placeholder: '0',
          min: '0',
          required: false,
          helpText: 'Period before changes take effect (0 for immediate)'
        },
        {
          id: 'recoveryAddress',
          type: 'text',
          label: 'Recovery Address',
          placeholder: '0x...',
          required: false,
          helpText: 'Address that can recover access if owner key is lost'
        },
        {
          id: 'upgradeable',
          type: 'checkbox',
          label: 'Upgradeable',
          checkboxLabel: 'Make contract upgradeable',
          required: false,
          helpText: 'Allow contract to be upgraded in the future'
        }
      ]
    },
    {
      title: 'Review & Deploy',
      description: 'Review your secure storage details and deploy to the blockchain.',
      fields: []
    }
  ],
  // ABI would be imported from a contract ABI file
  // abi: require('@/contracts/storage/SecureStorage.json'),
};
