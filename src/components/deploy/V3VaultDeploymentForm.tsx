'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { KRIS_V3_VAULT_ADDRESS } from '@/lib/contracts/kris-v3-vault';
import { Copy, ExternalLink } from 'lucide-react';

interface V3VaultDeploymentFormProps {
  contractAddress: string;
  chainId: number;
  onClose: () => void;
}

export default function V3VaultDeploymentForm({ contractAddress, chainId, onClose }: V3VaultDeploymentFormProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(KRIS_V3_VAULT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getExplorerUrl = () => {
    return `https://cronoscan.com/address/${KRIS_V3_VAULT_ADDRESS}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-[#0a1e3d] rounded-xl p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-white mb-6">V3 Vault Information</h2>
        
        <div className="bg-blue-500/10 rounded-lg p-6 mb-6">
          <p className="text-blue-400 mb-4">
            The Kris V3 Vault is already deployed and ready to use!
          </p>
          
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm mb-1">Vault Address:</p>
              <div className="flex items-center space-x-2">
                <code className="bg-black/30 px-3 py-2 rounded text-white text-sm flex-1">
                  {KRIS_V3_VAULT_ADDRESS}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="flex items-center space-x-1"
                >
                  <Copy size={16} />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </Button>
              </div>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm mb-1">Network:</p>
              <p className="text-white">Cronos Mainnet</p>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm mb-1">Current Features:</p>
              <ul className="text-white text-sm space-y-1 ml-4">
                <li>• VVS V3 Position Staking</li>
                <li>• Auto-Compound Trading Fees</li>
                <li>• Create farms for your desired pools</li>
                <li>• 5% Platform Fee (7% with auto-compound)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-yellow-500/10 rounded-lg p-4 mb-6">
          <h3 className="text-yellow-400 font-medium mb-2">How to Use the V3 Vault</h3>
          <ol className="text-sm text-gray-300 space-y-2">
            <li>1. Add liquidity to VVS V3 pools to receive NFT positions</li>
            <li>2. Go to the LP Staking page and select "V3 Farms" tab</li>
            <li>3. Stake your V3 positions in active farms</li>
            <li>4. Enable auto-compound for maximum yields (optional)</li>
            <li>5. Claim rewards and collect fees anytime</li>
          </ol>
        </div>

        <div className="space-y-3 mb-6">
          <h3 className="text-white font-medium">Useful Links</h3>
          <div className="space-y-2">
            <a
              href={getExplorerUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300"
            >
              <ExternalLink size={16} />
              <span>View on Cronoscan</span>
            </a>
            <a
              href="/lp-staking"
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300"
            >
              <ExternalLink size={16} />
              <span>Go to LP Staking</span>
            </a>
            <a
              href="https://vvs.finance/add/0x2829955d8Aac64f184E363516FDfbb0394042B90/0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23/10000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300"
            >
              <ExternalLink size={16} />
              <span>Add KRIS/WCRO Liquidity on VVS</span>
            </a>
          </div>
        </div>

        <div className="bg-green-500/10 rounded-lg p-4 mb-6">
          <p className="text-green-400 text-sm">
            💡 Tip: If you want to create new farms or manage existing ones, contact the vault owner or use the admin panel if you have access.
          </p>
        </div>

        <div className="flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </motion.div>
  );
}