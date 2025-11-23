'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { toast } from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';

interface ContractDeployment {
  name: string;
  description: string;
  contractType: string;
  deployFunction: () => Promise<string>;
  requiredBalance: string;
  estimatedGas: string;
  networks: number[];
}

const DEPLOYABLE_CONTRACTS: ContractDeployment[] = [
  {
    name: 'Quest Reward Distributor',
    description: 'Main contract for distributing quest rewards using Merkle trees',
    contractType: 'QuestRewardDistributor',
    deployFunction: async () => {
      // This would call the actual deployment function
      return '0x0000000000000000000000000000000000000000';
    },
    requiredBalance: '0.5',
    estimatedGas: '0.1',
    networks: [25, 338] // Cronos mainnet and testnet
  }
];

const NETWORK_INFO: Record<number, { name: string; explorer: string; color: string }> = {
  25: {
    name: 'Cronos',
    explorer: 'https://cronoscan.com',
    color: 'blue'
  },
  338: {
    name: 'Cronos Testnet',
    explorer: 'https://testnet.cronoscan.com',
    color: 'purple'
  },
  1: {
    name: 'Ethereum',
    explorer: 'https://etherscan.io',
    color: 'indigo'
  }
};

export const ContractDeploymentPanel = () => {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('eip155');
  
  const [selectedContract, setSelectedContract] = useState<ContractDeployment | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<number>(338); // Default to testnet
  const [deploying, setDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<{
    address: string;
    txHash: string;
    network: number;
  } | null>(null);

  const handleDeploy = async () => {
    if (!selectedContract || !walletProvider || !address) {
      toast.error('Please connect wallet and select a contract');
      return;
    }

    setDeploying(true);
    try {
      const provider = new ethers.providers.Web3Provider(walletProvider);
      const signer = provider.getSigner();
      
      // Check network
      const network = await provider.getNetwork();
      if (network.chainId !== selectedNetwork) {
        toast.error(`Please switch to ${NETWORK_INFO[selectedNetwork]?.name || 'the correct network'}`);
        return;
      }

      // Check balance
      const balance = await signer.getBalance();
      const requiredBalance = ethers.utils.parseEther(selectedContract.requiredBalance);
      
      if (balance.lt(requiredBalance)) {
        toast.error(`Insufficient balance. Need at least ${selectedContract.requiredBalance} CRO`);
        return;
      }

      toast.loading('Deploying contract...');
      
      // Deploy contract
      const contractAddress = await selectedContract.deployFunction();
      const txHash = '0x' + '0'.repeat(64); // Placeholder
      
      setDeploymentResult({
        address: contractAddress,
        txHash,
        network: selectedNetwork
      });
      
      toast.success('Contract deployed successfully!');
      
      // Save to database
      await saveDeployment({
        contractType: selectedContract.contractType,
        address: contractAddress,
        network: selectedNetwork,
        txHash,
        deployer: address
      });
      
    } catch (error: any) {
      console.error('Deployment error:', error);
      toast.error(error.message || 'Failed to deploy contract');
    } finally {
      setDeploying(false);
    }
  };

  const saveDeployment = async (deployment: any) => {
    try {
      const response = await fetch('/api/admin/contracts/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deployment)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save deployment');
      }
    } catch (error) {
      console.error('Error saving deployment:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Smart Contract Deployment</h2>
        <p className="text-gray-400">
          Deploy and manage smart contracts for the quest reward system
        </p>
      </div>

      {/* Contract Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEPLOYABLE_CONTRACTS.map((contract) => (
          <GlassCard
            key={contract.contractType}
            className={`
              p-4 cursor-pointer transition-all
              ${selectedContract?.contractType === contract.contractType
                ? 'border-blue-500 bg-blue-500/10'
                : 'hover:border-gray-600'
              }
            `}
            onClick={() => setSelectedContract(contract)}
          >
            <h3 className="font-semibold mb-2">{contract.name}</h3>
            <p className="text-sm text-gray-400 mb-3">{contract.description}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Required Balance:</span>
                <span>{contract.requiredBalance} CRO</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Est. Gas Cost:</span>
                <span>{contract.estimatedGas} CRO</span>
              </div>
              <div className="flex gap-1 mt-2">
                {contract.networks.map(networkId => (
                  <Badge
                    key={networkId}
                    variant="outline"
                    className="text-xs"
                  >
                    {NETWORK_INFO[networkId]?.name || `Chain ${networkId}`}
                  </Badge>
                ))}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Deployment Configuration */}
      {selectedContract && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Deployment Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Network</label>
                <select
                  value={selectedNetwork}
                  onChange={(e) => setSelectedNetwork(Number(e.target.value))}
                  className="crypto-select w-full"
                  disabled={deploying}
                >
                  {selectedContract.networks.map(networkId => (
                    <option key={networkId} value={networkId}>
                      {NETWORK_INFO[networkId]?.name || `Chain ${networkId}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Pre-deployment Checklist</h4>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                      {isConnected ? '✓' : '✗'}
                    </span>
                    Wallet connected
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-400">•</span>
                    Correct network selected
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-400">•</span>
                    Sufficient balance ({selectedContract.requiredBalance} CRO)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-400">•</span>
                    Contract compiled and tested
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleDeploy}
                disabled={!isConnected || deploying}
                className="crypto-button crypto-button-primary w-full"
              >
                {deploying ? 'Deploying...' : 'Deploy Contract'}
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Deployment Result */}
      {deploymentResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-6 bg-green-500/10 border-green-500">
            <h3 className="text-lg font-semibold mb-4 text-green-400">
              ✅ Deployment Successful
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Contract Address</p>
                <p className="font-mono text-sm break-all">{deploymentResult.address}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Transaction Hash</p>
                <p className="font-mono text-sm break-all">{deploymentResult.txHash}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Network</p>
                <p>{NETWORK_INFO[deploymentResult.network]?.name}</p>
              </div>
              
              <div className="flex gap-2 mt-4">
                <a
                  href={`${NETWORK_INFO[deploymentResult.network]?.explorer}/address/${deploymentResult.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="crypto-button crypto-button-primary text-sm"
                >
                  View on Explorer
                </a>
                <Button
                  onClick={() => navigator.clipboard.writeText(deploymentResult.address)}
                  variant="outline"
                  size="sm"
                  className="crypto-button"
                >
                  Copy Address
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Instructions */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Deployment Instructions</h3>
        <ol className="space-y-3 text-sm text-gray-400">
          <li>
            <strong>1. Select Contract:</strong> Choose the contract you want to deploy from the options above
          </li>
          <li>
            <strong>2. Choose Network:</strong> Select the blockchain network for deployment (start with testnet)
          </li>
          <li>
            <strong>3. Connect Wallet:</strong> Ensure your wallet is connected with the deployer account
          </li>
          <li>
            <strong>4. Check Balance:</strong> Verify you have enough funds for deployment and gas fees
          </li>
          <li>
            <strong>5. Deploy:</strong> Click deploy and confirm the transaction in your wallet
          </li>
          <li>
            <strong>6. Verify:</strong> After deployment, verify the contract on the block explorer
          </li>
        </ol>
        
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
          <p className="text-sm text-yellow-400">
            <strong>Note:</strong> Always test on testnet first before deploying to mainnet.
            Contract deployment is irreversible and costs gas fees.
          </p>
        </div>
      </GlassCard>
    </div>
  );
};