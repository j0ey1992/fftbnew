'use client'

import { ethers } from 'ethers'
import { getAppKit } from '@/lib/reown/init'
import { generateSmartContract } from '@/lib/ai/deepseek'

/**
 * Interface for contract deployment parameters
 */
export interface ContractDeploymentParams {
  contractType: string
  parameters: Record<string, any>
  externalProvider?: any // Optional external provider
}

/**
 * Interface for deployment result
 */
export interface DeploymentResult {
  success: boolean
  contractAddress?: string
  transactionHash?: string
  error?: string
}

/**
 * Deploy a smart contract to the blockchain
 * @param params Contract deployment parameters
 * @returns Deployment result
 */
export async function deployContract(params: ContractDeploymentParams): Promise<DeploymentResult> {
  console.log('Starting deployContract with params:', {
    contractType: params.contractType,
    hasParameters: !!params.parameters,
    hasExternalProvider: !!params.externalProvider
  });
  
  try {
    // Get the AppKit instance
    console.log('Getting AppKit instance...');
    const appKit = getAppKit()
    if (!appKit) {
      console.error('AppKit not initialized');
      throw new Error('AppKit not initialized')
    }

    // Get the account to check if wallet is connected
    console.log('Getting account from AppKit...');
    const account = await appKit.getAccount?.()
    if (!account || !account.address) {
      console.error('Wallet not connected, no account found');
      throw new Error('Wallet not connected')
    }
    console.log('Account found:', { address: account.address, chainId: account.chainId });

    // Use external provider if provided, otherwise get from AppKit
    let walletProvider = params.externalProvider
    
    // If no external provider, try to get from AppKit
    if (!walletProvider) {
      console.log('No external provider, getting provider from AppKit...');
      walletProvider = await appKit.getProvider?.()
      if (!walletProvider) {
        console.error('Provider not available from AppKit');
        throw new Error('Provider not available')
      }
    }
    console.log('Provider obtained successfully');
    
    // Create a new ethers provider and signer
    console.log('Creating ethers provider and signer...');
    // Create a new Web3Provider using the raw provider
    const provider = new ethers.providers.Web3Provider(walletProvider as any, Number(account.chainId))
    
    // Get the signer with the connected address
    const signer = provider.getSigner(account.address)
    
    // Verify the signer is valid by getting its address
    const signerAddress = await signer.getAddress()
    console.log('Signer address:', signerAddress);
    
    // Double-check that the signer address matches the connected account
    if (signerAddress.toLowerCase() !== account.address.toLowerCase()) {
      console.error('Signer address does not match connected account', {
        signerAddress,
        accountAddress: account.address
      });
      throw new Error('Signer address does not match connected account')
    }

    // Generate contract code using AI
    console.log('Generating contract code...');
    const contractCode = await generateSmartContract(params.contractType, params.parameters)
    console.log('Contract code generated successfully, length:', contractCode.length);
    
    // Compile the contract
    console.log('Compiling contract...');
    const compiledContract = await compileContract(contractCode)
    console.log('Contract compiled successfully');
    console.log('ABI length:', compiledContract.abi.length);
    console.log('Bytecode length:', compiledContract.bytecode.length);
    
    // Deploy the contract
    console.log('Deploying contract...');
    const deployedContract = await deployCompiledContract(
      compiledContract.abi,
      compiledContract.bytecode,
      signer,
      params.parameters
    )
    
    console.log('Contract deployed successfully!');
    console.log('Contract address:', deployedContract.address);
    console.log('Transaction hash:', deployedContract.deployTransaction.hash);
    
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
 * Compile a Solidity contract
 * @param sourceCode Solidity source code
 * @returns Compiled contract (ABI and bytecode)
 */
async function compileContract(sourceCode: string): Promise<{ abi: any; bytecode: string }> {
  try {
    // Extract the contract name from the source code
    const contractNameMatch = sourceCode.match(/contract\s+([a-zA-Z0-9_]+)/)
    const contractName = contractNameMatch ? contractNameMatch[1] : undefined
    
    // Use the Firebase function to compile the contract
    const response = await fetch('https://us-central1-trollslots.cloudfunctions.net/compileContract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sourceCode,
        contractName
      })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to compile contract: ${response.statusText}`)
    }
    
    const compilationResult = await response.json()
    
    if (!compilationResult.success || !compilationResult.abi || !compilationResult.bytecode) {
      throw new Error(`Compilation failed: ${compilationResult.error || 'Unknown error'}`)
    }
    
    return {
      abi: compilationResult.abi,
      bytecode: compilationResult.bytecode
    }
  } catch (error) {
    console.error('Error compiling contract:', error)
    throw error
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
    console.log('Creating contract factory...');
    // Create contract factory
    const factory = new ethers.ContractFactory(abi, bytecode, signer)
    
    // Extract constructor parameters from the parameters object
    console.log('Extracting constructor parameters...');
    const constructorParams = extractConstructorParams(abi, parameters)
    console.log('Constructor parameters:', constructorParams);
    
    // Deploy the contract
    console.log('Sending deployment transaction...');
    const contract = await factory.deploy(...constructorParams)
    console.log('Deployment transaction sent, hash:', contract.deployTransaction.hash);
    
    // Wait for deployment to complete
    console.log('Waiting for transaction to be mined...');
    await contract.deployed()
    console.log('Contract deployed and confirmed on the blockchain');
    
    return contract
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
    
    // If no constructor found, check for initialize method (for proxy contracts like Smartchef)
    if (!constructor) {
      const initializeMethod = abi.find((item: any) =>
        item.type === 'function' && item.name === 'initialize' && item.stateMutability === 'nonpayable'
      )
      
      if (initializeMethod) {
        console.log('Using initialize method instead of constructor')
        return initializeMethod.inputs.map(mapParameter(parameters))
      }
      
      return []
    }
    
    // Extract parameters based on constructor inputs
    return constructor.inputs.map(mapParameter(parameters))
  } catch (error) {
    console.error('Error extracting constructor parameters:', error)
    return []
  }
}

// Helper function to map parameters based on their type
function mapParameter(parameters: Record<string, any>) {
  return (input: any) => {
    const paramName = input.name.startsWith('_')
      ? input.name.substring(1)
      : input.name
    
    // Handle different parameter types
    if (input.type.includes('[]')) {
      // Array parameter
      if (input.type.includes('address[]')) {
        // Array of addresses
        const addresses = parameters[paramName] || []
        if (Array.isArray(addresses) && addresses.length > 0) {
          return addresses.map((addr: any) =>
            typeof addr === 'string' ? addr :
            addr && addr.address ? addr.address :
            ethers.constants.AddressZero
          )
        }
        return []
      } else if (input.type.includes('uint')) {
        // Array of numbers
        const values = parameters[paramName] || []
        if (Array.isArray(values)) {
          return values.map((val: any) =>
            typeof val === 'string' ? ethers.utils.parseUnits(val, 18) : val || 0
          )
        }
        return []
      }
      return parameters[paramName] || []
    } else if (input.type.includes('address')) {
      // Address parameter
      return parameters[paramName] || ethers.constants.AddressZero
    } else if (input.type.includes('uint')) {
      // Number parameter
      const value = parameters[paramName]
      
      // Handle timestamp parameters specially
      if (paramName.toLowerCase().includes('timestamp')) {
        // If it's a timestamp and not provided, use current time
        if (!value) {
          return Math.floor(Date.now() / 1000)
        }
        // If it's a Date object, convert to unix timestamp
        if (value instanceof Date) {
          return Math.floor(value.getTime() / 1000)
        }
      }
      
      return typeof value === 'string' ? ethers.utils.parseUnits(value, 18) : value || 0
    } else if (input.type.includes('string')) {
      // String parameter
      return parameters[paramName] || ''
    } else if (input.type.includes('bool')) {
      // Boolean parameter
      return parameters[paramName] || false
    } else {
      // Default
      return parameters[paramName] || null
    }
  }
}

/**
 * Save deployed contract to Firebase
 * @param contractType Contract type
 * @param contractAddress Deployed contract address
 * @param parameters Contract parameters
 * @param abi Contract ABI
 */
export async function saveDeployedContract(
  contractType: string,
  contractAddress: string,
  parameters: Record<string, any>,
  abi: any
): Promise<void> {
  try {
    // Get the current user
    const appKit = getAppKit()
    if (!appKit) {
      throw new Error('AppKit not initialized')
    }
    
    const account = await appKit.getAccount?.()
    if (!account) {
      throw new Error('No account found')
    }
    
    // Determine the collection based on contract type
    let collectionType = 'user-contracts'
    if (contractType.includes('erc20') || contractType.includes('token')) {
      collectionType = 'user-tokens'
    } else if (contractType.includes('staking')) {
      collectionType = 'user-staking-contracts'
    } else if (contractType.includes('nft')) {
      collectionType = 'user-nft-contracts'
    }
    
    // Prepare staking metadata if applicable
    let stakingMetadata = {}
    let enabledForStaking = false
    
    if (contractType.includes('token-staking')) {
      enabledForStaking = true
      stakingMetadata = {
        name: parameters.contractName || 'Token Staking Contract',
        description: parameters.description || 'Stake tokens and earn rewards',
        tokenAddress: parameters.tokenAddress || '',
        tokenSymbol: parameters.tokenSymbol || 'TOKEN',
        apr: parameters.apr || '10',
        minStake: parameters.minStake || '100',
        lockPeriods: [
          { period: `${parameters.lockupPeriod || 30} Days`, days: Number(parameters.lockupPeriod) || 30, apr: parameters.apr || '10' }
        ],
        logoUrl: parameters.logoUrl || '',
        socialLinks: parameters.socialLinks || {}
      }
    } else if (contractType.includes('nft-staking')) {
      enabledForStaking = true
      stakingMetadata = {
        name: parameters.contractName || 'NFT Staking Contract',
        description: parameters.description || 'Stake NFTs and earn rewards',
        contractAddress: contractAddress,
        tokenAddress: parameters.collections?.[0]?.address || '',
        rewardTokenAddress: parameters.rewardTokenAddress || '',
        rewardRate: parameters.rewardRate || '10',
        lockPeriods: [
          { period: '30 Days', days: 30, apr: '10' }
        ]
      }
    } else if (contractType.includes('lp-staking')) {
      enabledForStaking = true
      stakingMetadata = {
        name: parameters.contractName || 'LP Staking Contract',
        description: parameters.description || 'Stake LP tokens and earn rewards',
        contractAddress: contractAddress,
        tokenAddress: parameters.lpTokenAddress || '',
        tokenSymbol: parameters.lpTokenSymbol || 'LP',
        rewardTokenAddress: parameters.rewardTokenAddress || '',
        rewardRate: parameters.rewardPerBlock || '0.1',
        apr: '25', // Default APR
        minStake: '0.1',
        lockPeriods: [
          { period: '30 Days', days: 30, apr: '25' }
        ]
      }
    } else if (contractType.includes('TokenVault')) {
      enabledForStaking = true
      stakingMetadata = {
        name: parameters.contractName || 'Token Vault Staking',
        description: parameters.description || 'Stake tokens with multiple lock periods and multipliers',
        contractAddress: contractAddress,
        tokenAddress: parameters.stakeToken || '',
        tokenSymbol: parameters.tokenSymbol || 'TOKEN',
        rewardTokenAddress: parameters.rewardToken || '',
        rewardRate: parameters.rewardPerSecond || '0.1',
        minStake: '0',
        lockPeriods: parameters.lockPeriods || [
          { period: '30 Days', days: 30, apr: '10', multiplier: '100' }
        ],
        rewardStartTimestamp: parameters.rewardStartTimestamp || Math.floor(Date.now() / 1000),
        rewardEndTimestamp: parameters.rewardEndTimestamp || Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
        contractType: 'TokenVault'
      }
    } else if (contractType.includes('Smartchef')) {
      enabledForStaking = true
      stakingMetadata = {
        name: parameters.contractName || 'SmartChef Staking',
        description: parameters.description || 'Stake tokens with flexible parameters',
        contractAddress: contractAddress,
        tokenAddress: parameters.stakedToken || '',
        tokenSymbol: parameters.tokenSymbol || 'TOKEN',
        rewardTokenAddress: parameters.rewardToken || '',
        rewardRate: parameters.rewardPerBlock || '0.1',
        minStake: parameters.minStake || '0',
        lockPeriods: [
          { period: `${parameters.minStakingPeriod || 30} Days`, days: Number(parameters.minStakingPeriod) || 30, apr: '10' }
        ],
        startBlock: parameters.startBlock || 0,
        bonusEndBlock: parameters.bonusEndBlock || 0,
        poolLimitPerUser: parameters.poolLimitPerUser || '0',
        minStakingPeriod: parameters.minStakingPeriod || 30,
        useInitialLockPeriod: parameters.useInitialLockPeriod || false,
        contractType: 'Smartchef'
      }
    }
    
    // Prepare contract data
    const contractData = {
      contractType,
      contractAddress,
      parameters,
      abi,
      ownerAddress: account.address,
      chainId: account.chainId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      enabledForStaking,
      stakingMetadata
    }
    
    // Import Firebase functions at the top of the file if not already imported
    const { collection, addDoc } = await import('firebase/firestore')
    const { firestoreDB } = await import('@/lib/firebase/config')
    
    // Save directly to Firebase based on contract type
    let collectionName = 'user-deployed-contracts'
    
    if (enabledForStaking) {
      collectionName = `user-${contractType.toLowerCase()}-contracts`
    }
    
    // Save to Firebase
    const docRef = await addDoc(collection(firestoreDB, collectionName), contractData)
    
    if (!docRef.id) {
      throw new Error('Failed to save contract to Firebase')
    }
    
    console.log(`Contract saved to Firebase with ID: ${docRef.id}`)
  } catch (error) {
    console.error('Error saving deployed contract:', error)
    throw error
  }
}
