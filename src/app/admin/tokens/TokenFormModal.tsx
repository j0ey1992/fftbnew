'use client'

import { useState, useEffect } from 'react';
import { VVSPair, addVVSPair, updateVVSPair, NewVVSPair } from '@/lib/firebase';
import { Button } from '@/components/ui/button';

interface TokenFormModalProps {
  token: VVSPair | null; // null for new token, VVSPair for editing
  onClose: (tokenUpdated: boolean) => void;
}

/**
 * Modal component for adding or editing VVS token pairs
 */
export default function TokenFormModal({ token, onClose }: TokenFormModalProps) {
  const [formData, setFormData] = useState<Partial<NewVVSPair>>({
    name: '',
    symbol: '',
    logo: '/Roo.png', // Default logo
    address: '',
    isNative: false,
    decimals: 18,
    enabled: true,
    chainId: 25 // Default to Cronos Mainnet
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Initialize form with token data if editing
  useEffect(() => {
    if (token) {
      setFormData({
        name: token.name,
        symbol: token.symbol,
        logo: token.logo,
        address: token.address,
        isNative: token.isNative || false,
        decimals: token.decimals,
        enabled: token.enabled,
        chainId: token.chainId
      });
    }
  }, [token]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      
      // If isNative is checked, set address to 'NATIVE'
      if (name === 'isNative' && checked) {
        setFormData(prev => ({ ...prev, address: 'NATIVE' }));
      } else if (name === 'isNative' && !checked && formData.address === 'NATIVE') {
        setFormData(prev => ({ ...prev, address: '' }));
      }
    } else if (name === 'decimals') {
      // Ensure decimals is a number
      const decimals = parseInt(value, 10);
      setFormData(prev => ({ ...prev, [name]: isNaN(decimals) ? 0 : decimals }));
    } else if (name === 'chainId') {
      // Ensure chainId is a number
      const chainId = parseInt(value, 10);
      setFormData(prev => ({ ...prev, [name]: isNaN(chainId) ? 25 : chainId }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear address error when address is changed
    if (name === 'address') {
      setAddressError(null);
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    // Required fields
    if (!formData.name || !formData.symbol) {
      setError('Name and symbol are required');
      return false;
    }
    
    // Address validation
    if (!formData.isNative && (!formData.address || formData.address === '')) {
      setAddressError('Address is required for non-native tokens');
      return false;
    }
    
    // Address format validation for non-native tokens
    if (!formData.isNative && formData.address !== 'NATIVE') {
      const addressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!addressRegex.test(formData.address || '')) {
        setAddressError('Invalid address format. Must be a valid Ethereum address (0x followed by 40 hex characters)');
        return false;
      }
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAddressError(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      if (token) {
        // Update existing token
        await updateVVSPair(token.id, formData);
      } else {
        // Add new token
        await addVVSPair(formData as NewVVSPair);
      }
      
      // Close modal and refresh token list
      onClose(true);
    } catch (err: any) {
      console.error('Error saving token:', err);
      setError(err.message || 'Failed to save token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0f1f] rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">
            {token ? 'Edit Token' : 'Add New Token'}
          </h3>
          <button 
            onClick={() => onClose(false)}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Cronos"
                  required
                />
              </div>
              
              {/* Symbol */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Symbol *
                </label>
                <input
                  type="text"
                  name="symbol"
                  value={formData.symbol || ''}
                  onChange={handleChange}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., CRO"
                  required
                />
              </div>
              
              {/* Is Native Token */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isNative"
                  id="isNative"
                  checked={formData.isNative || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-800/50"
                />
                <label htmlFor="isNative" className="ml-2 block text-gray-300 text-sm font-medium">
                  Native Token (e.g., CRO)
                </label>
              </div>
              
              {/* Address */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Address {!formData.isNative && '*'}
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  disabled={formData.isNative}
                  className={`w-full bg-gray-800/50 border ${
                    addressError ? 'border-red-700' : 'border-gray-700'
                  } rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formData.isNative ? 'opacity-50' : ''
                  }`}
                  placeholder="e.g., 0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23"
                />
                {addressError && (
                  <p className="mt-1 text-red-400 text-xs">{addressError}</p>
                )}
                {formData.isNative && (
                  <p className="mt-1 text-gray-400 text-xs">Address is set to 'NATIVE' for native tokens</p>
                )}
              </div>
              
              {/* Decimals */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Decimals *
                </label>
                <input
                  type="number"
                  name="decimals"
                  value={formData.decimals || 18}
                  onChange={handleChange}
                  min="0"
                  max="36"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="18"
                  required
                />
                <p className="mt-1 text-gray-400 text-xs">
                  Usually 18 for most tokens, 6 for USDC/USDT
                </p>
              </div>
              
              {/* Chain ID */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Chain ID *
                </label>
                <input
                  type="number"
                  name="chainId"
                  value={formData.chainId || 25}
                  onChange={handleChange}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="25"
                  required
                />
                <p className="mt-1 text-gray-400 text-xs">
                  25 for Cronos Mainnet
                </p>
              </div>
              
              {/* Enabled */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="enabled"
                  id="enabled"
                  checked={formData.enabled !== false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-800/50"
                />
                <label htmlFor="enabled" className="ml-2 block text-gray-300 text-sm font-medium">
                  Enabled (available for trading)
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="secondary"
                size="md"
                type="button"
                onClick={() => onClose(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={loading}
              >
                {loading ? 'Saving...' : token ? 'Update Token' : 'Add Token'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
