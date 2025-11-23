'use client'

import { ethers } from 'ethers'
import { getAppKit } from '@/lib/reown/init'
import { 
  getContractTemplate, 
  saveDeployedContract 
} from '@/lib/firebase/contract-templates'
import { 
  ContractDeploymentParams, 
  ContractDeploymentResult 
} from '@/types/contract-templates'
import { auth } from '@/lib/firebase/firebase-config'
import { authenticateWithWallet } from '@/lib/firebase/auth-utils'

/**
 * Deploy a contract from a template
 * @param params Contract deployment parameters
 * @param externalProvider Optional external provider from useAppKitProvider
 * @returns Deployment result
 */
export async function deployContractFromTemplate(
  params: ContractDeploymentParams,
  externalProvider?: any
): Promise<ContractDeploymentResult> {
  try {
    // Get the AppKit instance
    const appKit = getAppKit()
    if (!appKit) {
      throw new Error('AppKit not initialized')
    }

    // Get the account to check if wallet is connected
    const account = await appKit.getAccount?.()
    if (!account || !account.address) {
      throw new Error('Wallet not connected')
    }

    // Get the template from Firebase
    let template = await getContractTemplate(params.templateId)
    if (!template) {
      throw new Error(`Template with ID ${params.templateId} not found`)
    }
    
    // Check if template needs compilation
    if (template.bytecode === 'NEEDS_COMPILATION' || !template.bytecode || template.bytecode.length < 100) {
      console.log('Template needs compilation, compiling contract...')
      
      // Import compilation function dynamically to avoid server-side issues
      const { updateTemplateWithCompiledBytecode } = await import('./compile-templates')
      template = await updateTemplateWithCompiledBytecode(template)
      
      if (!template.bytecode || template.bytecode === 'NEEDS_COMPILATION') {
        throw new Error('Failed to compile contract. Please try again or contact support.')
      }
    }

    // Get the wallet provider
    let walletProvider = externalProvider
    
    // If no external provider was passed, try to get it from AppKit
    if (!walletProvider) {
      try {
        walletProvider = await appKit.getProvider?.()
      } catch (error) {
        console.error('Error getting provider from AppKit:', error)
      }
      
      // If still no provider, try to get it from window.ethereum
      if (!walletProvider && typeof window !== 'undefined' && (window as any).ethereum) {
        walletProvider = (window as any).ethereum
      }
      
      if (!walletProvider) {
        throw new Error('Provider not available. Please make sure your wallet is connected.')
      }
    }
    
    console.log('Creating provider with chain ID:', account.chainId);
    
    // Create a new ethers provider that respects the current network
    const provider = new ethers.providers.Web3Provider(walletProvider as any);
    
    // Get the current network
    const network = await provider.getNetwork();
    console.log('Current network:', network);
    
    // Validate that we're on a supported network
    const supportedChainIds = [25, 338]; // Cronos mainnet and testnet
    if (!supportedChainIds.includes(network.chainId)) {
      throw new Error(`Unsupported network. Please switch to Cronos mainnet (chain ID 25) or testnet (chain ID 338). Current chain ID: ${network.chainId}`);
    }
    
    // Get the signer
    const signer = provider.getSigner(account.address);
    
    // Verify the signer is valid by getting its address
    const signerAddress = await signer.getAddress();
    
    // Double-check that the signer address matches the connected account
    if (signerAddress.toLowerCase() !== account.address.toLowerCase()) {
      throw new Error('Signer address does not match connected account');
    }
    
    // Wait a moment to ensure network stability
    console.log('Waiting for network stability before deployment...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Deploy the contract
    console.log('Deploying contract...')
    const deployedContract = await deployCompiledContract(
      template.abi,
      template.bytecode,
      signer,
      params.parameters
    )
    
    // Save the deployed contract to Firebase without requiring authentication
    // since we've updated the Firestore rules to allow public write access
    try {
      await saveDeployedContract({
        templateId: params.templateId,
        contractAddress: deployedContract.address,
        chainId: Number(account.chainId),
        ownerAddress: account.address.toLowerCase(), // Ensure address is lowercase for consistency
        parameters: params.parameters,
        transactionHash: deployedContract.deployTransaction.hash,
        contractType: template.category,
        name: template.name
      });
      console.log('Successfully saved deployed contract to Firebase');
    } catch (saveError) {
      // Log the error but don't throw it, as the contract is already deployed
      console.error('Error saving deployed contract to Firebase:', saveError);
      // Continue with the success response since the contract deployment was successful
    }
    
    return {
      success: true,
      contractAddress: deployedContract.address,
      transactionHash: deployedContract.deployTransaction.hash
    }
  } catch (error) {
    console.error('Error deploying contract:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Deploy a compiled contract to the blockchain
 * @param abi Contract ABI
 * @param bytecode Contract bytecode
 * @param signer Ethers.js signer
 * @param parameters Contract constructor parameters
 * @returns Deployed contract instance
 */
async function deployCompiledContract(
  abi: any,
  bytecode: string,
  signer: ethers.Signer,
  parameters: Record<string, any>
): Promise<ethers.Contract> {
  try {
    // Create contract factory
    const factory = new ethers.ContractFactory(abi, bytecode, signer)
    
    // Extract constructor parameters from the parameters object
    const constructorParams = extractConstructorParams(abi, parameters)
    
    // Handle special case for TokenVault with staking pools
    const isTokenVault = abi.some((item: any) => 
      item.name === 'add' && 
      item.inputs && 
      item.inputs.length === 2 && 
      item.inputs[0].name === '_multiplier' && 
      item.inputs[1].name === '_lockPeriod'
    );
    
    try {
      // Estimate gas for deployment
      console.log('Estimating gas for deployment...');
      let estimatedGas;
      try {
        estimatedGas = await factory.estimateGas.deploy(...constructorParams);
        console.log('Estimated gas:', estimatedGas.toString());
        
        // Add 20% buffer to gas estimate
        const gasLimit = estimatedGas.mul(120).div(100);
        console.log('Gas limit with buffer:', gasLimit.toString());
        
        // Get current gas price
        const gasPrice = await signer.getGasPrice();
        console.log('Current gas price:', ethers.utils.formatUnits(gasPrice, 'gwei'), 'gwei');
        
        // Calculate estimated cost
        const estimatedCost = gasLimit.mul(gasPrice);
        console.log('Estimated deployment cost:', ethers.utils.formatEther(estimatedCost), 'CRO');
        
        // Check balance
        const balance = await signer.getBalance();
        if (balance.lt(estimatedCost)) {
          throw new Error(`Insufficient balance. Need at least ${ethers.utils.formatEther(estimatedCost)} CRO, but have ${ethers.utils.formatEther(balance)} CRO`);
        }
        
        // Deploy the contract with gas settings
        console.log('Deploying contract with parameters:', constructorParams);
        const contract = await factory.deploy(...constructorParams, {
          gasLimit: gasLimit,
          gasPrice: gasPrice
        });
        
        console.log('Contract deployment transaction sent, waiting for confirmation...');
        // Wait for deployment to complete with a longer timeout
        await contract.deployed();
        
        console.log('Contract deployed successfully at address:', contract.address);
        
        // If this is a TokenVault and we have staking pools, add them
        if (isTokenVault && parameters.stakingPools && Array.isArray(parameters.stakingPools)) {
          console.log('Adding staking pools to TokenVault...');
          
          // Add each staking pool
          for (const pool of parameters.stakingPools) {
            if (pool.multiplier && pool.lockPeriod) {
              console.log(`Adding pool with multiplier ${pool.multiplier} and lock period ${pool.lockPeriod}`);
              
              // Estimate gas for adding pool
              const addGasEstimate = await contract.estimateGas.add(pool.multiplier, pool.lockPeriod);
              const addGasLimit = addGasEstimate.mul(120).div(100);
              
              await contract.add(pool.multiplier, pool.lockPeriod, {
                gasLimit: addGasLimit,
                gasPrice: gasPrice
              });
            }
          }
          
          console.log('All staking pools added successfully');
        }
        
        return contract;
      } catch (gasError) {
        console.error('Error estimating gas, attempting deployment without gas limit:', gasError);
        
        // Fallback: deploy without explicit gas settings
        const contract = await factory.deploy(...constructorParams);
        await contract.deployed();
        
        // Handle TokenVault pools without gas estimation
        if (isTokenVault && parameters.stakingPools && Array.isArray(parameters.stakingPools)) {
          for (const pool of parameters.stakingPools) {
            if (pool.multiplier && pool.lockPeriod) {
              await contract.add(pool.multiplier, pool.lockPeriod);
            }
          }
        }
        
        return contract;
      }
    } catch (error) {
      console.error('Error in contract deployment:', error);
      
      // Check for network change error
      if (
        error && 
        typeof error === 'object' && 
        'code' in error && 
        error.code === 'NETWORK_ERROR'
      ) {
        throw new Error('Network changed during deployment. Please try again and ensure your wallet stays connected to Cronos network.');
      }
      
      // Rethrow the error
      throw error;
    }
  } catch (error) {
    console.error('Error deploying compiled contract:', error)
    throw error
  }
}

/**
 * Extract constructor parameters from the parameters object
 * @param abi Contract ABI
 * @param parameters Parameters object
 * @returns Array of constructor parameters
 */
function extractConstructorParams(abi: any, parameters: Record<string, any>): any[] {
  try {
    // Find the constructor in the ABI
    const constructor = abi.find((item: any) => item.type === 'constructor')
    
    if (!constructor) {
      return []
    }
    
    // Extract parameters based on constructor inputs
    return constructor.inputs.map((input: any) => {
      const paramName = input.name.startsWith('_') 
        ? input.name.substring(1) 
        : input.name
      
      // Special parameter mappings for specific contracts
      const parameterMappings: Record<string, string> = {
        // LP Staking mappings
        'link': 'rewardToken',
        'linkPerBlock': 'rewardPerBlock',
        // Vault mappings
        'stakeToken': 'depositToken'
      }
      
      // Try mapped name first, then original name
      const mappedName = parameterMappings[paramName] || paramName
      const value = parameters[mappedName] || parameters[paramName]
      
      // Handle different parameter types
      if (input.type.includes('[]')) {
        // Array parameter
        if (input.type.includes('uint') && Array.isArray(value)) {
          // For arrays of numbers like ratios, ensure they're properly formatted
          return value.map((v: any) => 
            typeof v === 'string' ? 
              ethers.BigNumber.from(v.includes('.') ? ethers.utils.parseUnits(v, 18) : v) : 
              ethers.BigNumber.from(v || 0)
          )
        }
        return value || []
      } else if (input.type.includes('address')) {
        // Address parameter - validate and provide fallback
        if (value && typeof value === 'string' && /^0x[a-fA-F0-9]{40}$/.test(value)) {
          return value
        }
        return ethers.constants.AddressZero
      } else if (input.type.includes('uint')) {
        // Number parameter - handle decimals appropriately
        if (value === undefined || value === null) return 0
        
        // Determine if this is a token amount that needs decimal conversion
        const isTokenAmount = paramName.toLowerCase().includes('amount') || 
                             paramName.toLowerCase().includes('supply') ||
                             paramName.toLowerCase().includes('balance')
        
        // Determine decimals based on parameter name
        const decimals = paramName.toLowerCase().includes('wei') ? 0 : 18
        
        if (typeof value === 'string' && value.includes('.') && isTokenAmount) {
          // Convert decimal string to wei
          return ethers.utils.parseUnits(value, decimals)
        } else if (typeof value === 'number' && isTokenAmount) {
          // Convert number to wei
          return ethers.utils.parseUnits(value.toString(), decimals)
        } else {
          // Use as is or convert to BigNumber
          return ethers.BigNumber.from(value.toString())
        }
      } else if (input.type.includes('string')) {
        // String parameter
        return value || ''
      } else if (input.type.includes('bool')) {
        // Boolean parameter
        return Boolean(value)
      } else {
        // Default
        return value || null
      }
    })
  } catch (error) {
    console.error('Error extracting constructor parameters:', error)
    return []
  }
}
