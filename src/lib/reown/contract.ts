'use client'

import { ethers } from 'ethers'
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'

// Example ABI for ERC20 token
const ERC20_ABI = [
  // Read-only functions
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function allowance(address owner, address spender) view returns (uint256)",
  // Authenticated functions
  "function transfer(address to, uint amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
]

/**
 * Hook for interacting with ERC20 tokens on Cronos
 */
export function useERC20Contract(tokenAddress: string) {
  const { address } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  const { walletProvider } = useAppKitProvider('eip155')
  
  const getTokenContract = () => {
    if (!walletProvider || !address) return null
    
    const provider = new ethers.providers.Web3Provider(walletProvider, Number(chainId))
    const signer = provider.getSigner(address)
    return new ethers.Contract(tokenAddress, ERC20_ABI, signer)
  }
  
  const getTokenBalance = async () => {
    try {
      const contract = getTokenContract()
      if (!contract || !address) return '0'
      
      const balance = await contract.balanceOf(address)
      const decimals = await contract.decimals()
      
      // Format the balance to a readable format
      return ethers.utils.formatUnits(balance, decimals)
    } catch (error) {
      console.error('Error getting token balance:', error)
      return '0'
    }
  }
  
  const getTokenInfo = async () => {
    try {
      const contract = getTokenContract()
      if (!contract) return { symbol: '', name: '', decimals: 18 }
      
      const [symbol, name, decimals] = await Promise.all([
        contract.symbol(),
        contract.name(),
        contract.decimals()
      ])
      
      return { symbol, name, decimals }
    } catch (error) {
      console.error('Error getting token info:', error)
      return { symbol: '', name: '', decimals: 18 }
    }
  }
  
  const transferTokens = async (to: string, amount: string) => {
    try {
      const contract = getTokenContract()
      if (!contract) throw new Error('Contract not initialized')
      
      const tokenInfo = await getTokenInfo()
      const amountInWei = ethers.utils.parseUnits(amount, tokenInfo.decimals)
      
      const tx = await contract.transfer(to, amountInWei)
      return await tx.wait()
    } catch (error) {
      console.error('Error transferring tokens:', error)
      throw error
    }
  }
  
  const approve = async (spender: string, amount: string) => {
    try {
      const contract = getTokenContract()
      if (!contract) throw new Error('Contract not initialized')
      
      const tokenInfo = await getTokenInfo()
      const amountInWei = ethers.utils.parseUnits(amount, tokenInfo.decimals)
      
      const tx = await contract.approve(spender, amountInWei)
      return await tx.wait()
    } catch (error) {
      console.error('Error approving tokens:', error)
      throw error
    }
  }
  
  /**
   * Get the allowance for a spender
   * @param spender The address that is allowed to spend the tokens
   * @returns The allowance as a string
   */
  const getAllowance = async (spender: string) => {
    try {
      const contract = getTokenContract();
      if (!contract || !address) return '0';
      
      // Get token decimals once and reuse
      const tokenInfo = await getTokenInfo();
      
      // Get current allowance
      const allowance = await contract.allowance(address, spender);
      
      return ethers.utils.formatUnits(allowance, tokenInfo.decimals);
    } catch (error) {
      console.error('Error getting allowance:', error);
      return '0';
    }
  };
  
  return {
    getTokenBalance,
    getTokenInfo,
    transferTokens,
    approve,
    getAllowance
  }
}

/**
 * Hook for interacting with NFT staking contracts on Cronos
 * This is a simplified example - your actual contract ABI would be different
 */
export function useNFTStakingContract(contractAddress: string) {
  const { address } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  const { walletProvider } = useAppKitProvider('eip155')
  
  // Your NFT staking contract ABI would go here
  const NFT_STAKING_ABI = [
    // Example functions - replace with your actual contract ABI
    "function stakeNFT(uint256 tokenId) returns (bool)",
    "function unstakeNFT(uint256 tokenId) returns (bool)",
    "function getStakedNFTs(address owner) view returns (uint256[])",
    "function getRewards(address owner) view returns (uint256)"
  ]
  
  const getStakingContract = () => {
    if (!walletProvider || !address) return null
    
    const provider = new ethers.providers.Web3Provider(walletProvider, Number(chainId))
    const signer = provider.getSigner(address)
    return new ethers.Contract(contractAddress, NFT_STAKING_ABI, signer)
  }
  
  // Add your contract interaction functions here
  
  return {
    // Return your contract interaction functions
  }
}
