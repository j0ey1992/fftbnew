'use client';

import { User } from '@/types/user';
import { formatTokenBalance, getUserTokenBalance } from '@/lib/profileUtils';
import { useState, useEffect } from 'react';

interface TokenBalanceProps {
  user?: User | null;
  tokenAddress?: string;
  balance?: number | string;
  decimals?: number;
  symbol?: string;
  maxDecimals?: number;
  includeSymbol?: boolean;
  className?: string;
  showZeroDecimals?: boolean;
  loading?: boolean;
}

/**
 * Component to display token balances with proper decimal handling
 */
export default function TokenBalance({
  user,
  tokenAddress,
  balance,
  decimals = 18,
  symbol,
  maxDecimals = 4,
  includeSymbol = true,
  className = '',
  showZeroDecimals = false,
  loading = false
}: TokenBalanceProps) {
  const [formattedBalance, setFormattedBalance] = useState<string>('0');
  
  useEffect(() => {
    if (loading) {
      setFormattedBalance('...');
      return;
    }
    
    // If tokenAddress is provided, get balance from user profile
    if (tokenAddress && user) {
      const formatted = getUserTokenBalance(
        user, 
        tokenAddress, 
        maxDecimals, 
        includeSymbol
      );
      setFormattedBalance(formatted);
      return;
    }
    
    // If balance is directly provided, format it
    if (balance !== undefined) {
      const formatted = formatTokenBalance(
        balance,
        decimals,
        maxDecimals,
        includeSymbol,
        symbol
      );
      setFormattedBalance(formatted);
      return;
    }
    
    // Default fallback
    setFormattedBalance(includeSymbol && symbol ? `0 ${symbol}` : '0');
  }, [
    user, 
    tokenAddress, 
    balance, 
    decimals, 
    symbol, 
    maxDecimals, 
    includeSymbol, 
    loading,
    showZeroDecimals
  ]);
  
  return (
    <span className={`font-mono ${className}`}>
      {formattedBalance}
    </span>
  );
}

/**
 * Component to display token balances with animation when value changes
 */
export function AnimatedTokenBalance(props: TokenBalanceProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevBalance, setPrevBalance] = useState<string | number | undefined>(props.balance);
  
  useEffect(() => {
    // If balance has changed, trigger animation
    if (props.balance !== prevBalance && props.balance !== undefined) {
      setIsAnimating(true);
      
      // Store new balance
      setPrevBalance(props.balance);
      
      // Reset animation after it completes
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [props.balance, prevBalance]);
  
  return (
    <span className="relative inline-block">
      <TokenBalance {...props} className={`${props.className} ${isAnimating ? 'text-green-400' : ''}`} />
      {isAnimating && (
        <span className="absolute inset-0 bg-green-400/20 rounded-md animate-pulse" />
      )}
    </span>
  );
}