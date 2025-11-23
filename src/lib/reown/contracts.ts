'use client'

import { ethers } from 'ethers'
import { getAppKit } from './init'
import { addVaultContract } from '@/lib/firebase/vault-contracts'
import { VaultContract } from '@/lib/firebase/vault-contracts'
import { NewNftStakingContract } from '@/lib/nft-staking-contracts'

/**
 * Deploy a contract using Reown
 * @param bytecode The contract bytecode
 * @param abi The contract ABI
 * @param constructorArgs The constructor arguments
 * @returns The deployed contract address
 */
export async function deployContract(
  bytecode: string,
  abi: any[],
  constructorArgs: any[]
): Promise<string> {
  try {
    const appKit = getAppKit()
    if (!appKit) {
      throw new Error('AppKit not initialized')
    }

    // Get the provider from AppKit
    const provider = await appKit.getProvider?.()
    if (!provider) {
      throw new Error('Provider not available')
    }

    // Get the signer from the provider
    const signer = provider.getSigner()
    if (!signer) {
      throw new Error('Signer not available')
    }

    // Create a contract factory
    const factory = new ethers.ContractFactory(abi, bytecode, signer)

    // Deploy the contract with constructor arguments
    console.log('Deploying contract with args:', constructorArgs)
    const contract = await factory.deploy(...constructorArgs)

    // Wait for the contract to be deployed
    await contract.deployed()

    console.log('Contract deployed at:', contract.address)
    return contract.address
  } catch (error) {
    console.error('Error deploying contract:', error)
    throw error
  }
}

/**
 * Deploy a TokenVault contract
 * @param formData The form data from the deployment form
 * @param walletProvider The wallet provider from useAppKitProvider
 * @returns The deployed contract address
 */
export async function deployLpStakingContract(formData: Record<string, any>, walletProvider: any): Promise<string> {
  try {
    // Get the bytecode from the public directory
    const bytecodeResponse = await fetch('/contracts/staking/lpbytecode.txt');
    const bytecode = await bytecodeResponse.text();

    // Get the ABI from the public directory
    const abiResponse = await fetch('/contracts/staking/lpstaking.json');
    const abi = await abiResponse.json();

    // Prepare constructor arguments
    const rewardPerBlock = ethers.utils.parseEther(formData.rewardPerBlock.toString());
    const constructorArgs = [
      formData.rewardTokenAddress,  // _link
      formData.feeAddress,          // _feeAddress
      rewardPerBlock                // _linkPerBlock
    ];

    // Create a provider from the walletProvider
    if (!walletProvider) {
      throw new Error('Wallet provider not available');
    }
    
    const provider = new ethers.providers.Web3Provider(walletProvider as any);
    const signer = provider.getSigner();
    
    // Create a contract factory
    const factory = new ethers.ContractFactory(abi, bytecode, signer);
    
    // Deploy the contract with constructor arguments
    console.log('Deploying LP staking contract with args:', constructorArgs);
    const contract = await factory.deploy(...constructorArgs);
    
    // Wait for the contract to be deployed
    await contract.deployed();
    
    const contractAddress = contract.address;
    console.log('LP staking contract deployed at:', contractAddress);

    // Add the LP token to the contract
    const lpStakingContract = new ethers.Contract(contractAddress, abi, signer);
    await lpStakingContract.add(
      1000,                         // _allocPoint (1000 = 100% if only one pool)
      formData.lpTokenAddress,      // _lpToken
      formData.depositFeeBP,        // _depositFeeBP
      true                          // _withUpdate
    );

    // Store the contract in Firebase
    const lockPeriods = [
      {
        period: '30 days',
        days: 30,
        apr: '10%'  // Example APR
      }
    ];

    const lpStakingContractData = {
      name: `${formData.lpTokenSymbol || 'LP'} Staking`,
      description: `Stake ${formData.lpTokenSymbol || 'LP'} tokens and earn rewards`,
      contractAddress,
      lpTokenAddress: formData.lpTokenAddress,
      rewardTokenAddress: formData.rewardTokenAddress,
      apr: '10%',  // Example APR
      minStake: '0',  // No minimum stake
      enabled: true,
      chainId: 25,  // Cronos chain ID
      lockPeriods,
      abi
    };

    // Add the contract to Firebase using the client-side function
    const { addLpStakingContract } = await import('@/lib/firebase/lp-staking-contracts');
    const result = await addLpStakingContract(lpStakingContractData);
    console.log('LP staking contract added to Firebase with ID:', result.id);

    return contractAddress;
  } catch (error) {
    console.error('Error deploying LP staking contract:', error);
    throw error;
  }
}

/**
 * Deploy an NFT Staking contract
 * @param formData The form data from the deployment form
 * @param walletProvider The wallet provider from useAppKitProvider
 * @returns The deployed contract address
 */
export async function deployNftStakingContract(formData: Record<string, any>, walletProvider: any): Promise<string> {
  try {
    // Get the bytecode from the public directory
    const bytecodeResponse = await fetch('/contracts/staking/bytecode_localhost_2025-04-14T09-59-36-703Z.bin');
    const bytecode = await bytecodeResponse.text();

    // Get the ABI from the public directory
    const abiResponse = await fetch('/contracts/staking/Nftstakingv1.json');
    const abi = await abiResponse.json();

    // Process collections data
    const collectionAddresses = formData.collections.map((collection: any) => collection.address);
    const collectionRatios = formData.collections.map((collection: any) => parseInt(collection.ratio));

    // Prepare constructor arguments
    const constructorArgs = [
      formData.rewardTokenAddress,  // _rewardsToken
      collectionAddresses,          // _collections
      collectionRatios              // _ratios
    ];

    // Create a provider from the walletProvider
    if (!walletProvider) {
      throw new Error('Wallet provider not available');
    }
    
    const provider = new ethers.providers.Web3Provider(walletProvider as any);
    const signer = provider.getSigner();
    
    // Create a contract factory
    const factory = new ethers.ContractFactory(abi, bytecode, signer);
    
    // Deploy the contract with constructor arguments
    console.log('Deploying NFT staking contract with args:', constructorArgs);
    const contract = await factory.deploy(...constructorArgs);
    
    // Wait for the contract to be deployed
    await contract.deployed();
    
    const contractAddress = contract.address;
    console.log('NFT staking contract deployed at:', contractAddress);

    // Format collections for Firebase
    const formattedCollections = formData.collections.map((collection: any, index: number) => ({
      id: `collection-${index}`,
      name: collection.name,
      address: collection.address,
      ratio: parseInt(collection.ratio),
      description: collection.description || `${collection.name} Collection`,
      image: collection.image || '/kris-logo.svg',
      totalStaked: 0
    }));

    // Prepare NFT staking contract data for Firebase
    const nftStakingContractData: NewNftStakingContract = {
      name: formData.contractName || 'NFT Staking Contract',
      description: formData.description || 'Stake NFTs and earn rewards',
      contractAddress,
      rewardTokenAddress: formData.rewardTokenAddress,
      rewardTokenSymbol: formData.rewardTokenSymbol || 'TOKEN',
      apr: formData.rewardRate || '10',
      minStake: '1',  // Minimum 1 NFT
      enabled: true,
      chainId: 25,  // Cronos chain ID
      collections: formattedCollections,
      abi
    };

    // Add the contract to Firebase
    const { addNftStakingContract } = await import('@/lib/nft-staking-contracts');
    const contractId = await addNftStakingContract(nftStakingContractData);
    console.log('NFT staking contract added to Firebase with ID:', contractId);

    return contractAddress;
  } catch (error) {
    console.error('Error deploying NFT staking contract:', error);
    throw error;
  }
}

export async function deployTokenVault(formData: Record<string, any>, walletProvider: any): Promise<string> {
  try {
    // Get the bytecode from the public directory
    const bytecodeResponse = await fetch('/contracts/staking/TokenVault_creation_bytecode.txt')
    const bytecode = await bytecodeResponse.text()

    // Get the ABI from the public directory
    const abiResponse = await fetch('/contracts/staking/TokenVault.json')
    const { abi } = await abiResponse.json()

    // Extract pool data from form fields
    const pools: { multiplier: number; lockPeriod: number }[] = []
    
    // Add Pool 1 (required)
    pools.push({
      multiplier: parseFloat(formData.pool1Multiplier),
      lockPeriod: parseInt(formData.pool1LockPeriod)
    })
    
    // Add Pool 2 (optional)
    if (formData.pool2Multiplier && formData.pool2LockPeriod) {
      pools.push({
        multiplier: parseFloat(formData.pool2Multiplier),
        lockPeriod: parseInt(formData.pool2LockPeriod)
      })
    }
    
    // Add Pool 3 (optional)
    if (formData.pool3Multiplier && formData.pool3LockPeriod) {
      pools.push({
        multiplier: parseFloat(formData.pool3Multiplier),
        lockPeriod: parseInt(formData.pool3LockPeriod)
      })
    }

    // Convert dates to timestamps
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    const startTimestamp = Math.floor(startDate.getTime() / 1000)
    const endTimestamp = Math.floor(endDate.getTime() / 1000)

    // Prepare constructor arguments
    const constructorArgs = [
      formData.tokenName,
      formData.tokenSymbol,
      formData.stakeToken,
      formData.rewardToken,
      ethers.utils.parseEther(formData.rewardPerSecond.toString()),
      startTimestamp,
      endTimestamp
    ]

    // Create a provider from the walletProvider
    if (!walletProvider) {
      throw new Error('Wallet provider not available')
    }
    
    const provider = new ethers.providers.Web3Provider(walletProvider)
    const signer = provider.getSigner()
    
    // Create a contract factory
    const factory = new ethers.ContractFactory(abi, bytecode, signer)
    
    // Deploy the contract with constructor arguments
    console.log('Deploying contract with args:', constructorArgs)
    const contract = await factory.deploy(...constructorArgs)
    
    // Wait for the contract to be deployed
    await contract.deployed()
    
    const contractAddress = contract.address
    console.log('Contract deployed at:', contractAddress)

    // Add pools to the contract
    for (const pool of pools) {
      // Convert lock period from days to seconds
      const lockPeriodSeconds = pool.lockPeriod * 24 * 60 * 60
      await contract.add(pool.multiplier, lockPeriodSeconds)
    }

    // Store the contract in Firebase
    const depositPeriods = pools.map(pool => ({
      period: `${pool.lockPeriod} days`,
      days: pool.lockPeriod,
      apr: `${pool.multiplier * 10}%` // Example APR calculation
    }))

    const vaultContract: Omit<VaultContract, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.tokenName,
      description: `${formData.tokenName} Staking Vault`,
      contractAddress,
      tokenAddress: formData.stakeToken,
      rewardTokenAddress: formData.rewardToken,
      apr: `${Math.max(...pools.map(p => p.multiplier)) * 10}%`, // Example APR calculation
      minDeposit: '0', // No minimum deposit
      enabled: true,
      chainId: 25, // Cronos chain ID
      contractType: 'standard',
      depositPeriods,
      abi
    }

    // Add the contract to Firebase
    const contractId = await addVaultContract(vaultContract)
    console.log('Contract added to Firebase with ID:', contractId)

    return contractAddress
  } catch (error) {
    console.error('Error deploying TokenVault contract:', error)
    throw error
  }
}
