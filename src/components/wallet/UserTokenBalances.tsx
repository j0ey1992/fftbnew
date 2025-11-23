'use client'

import React, { useState } from 'react';
import { useUserTokenBalances } from '@/hooks/useUserTokenBalances';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  RefreshCw, 
  Plus, 
  Search, 
  Eye, 
  EyeOff,
  Coins,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserTokenBalancesProps {
  showZeroBalances?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  watchRealTime?: boolean;
  discoverNewTokens?: boolean;
}

export function UserTokenBalances({
  showZeroBalances = false,
  autoRefresh = true,
  refreshInterval = 60,
  watchRealTime = true,
  discoverNewTokens = false
}: UserTokenBalancesProps) {
  const {
    tokens,
    loading,
    error,
    refetch,
    isRefreshing,
    lastUpdated,
    addCustomToken,
    removeToken,
    watchedTokens
  } = useUserTokenBalances({
    includeZeroBalances: showZeroBalances,
    autoRefresh,
    refreshInterval,
    watchRealTime,
    discoverNewTokens
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddToken, setShowAddToken] = useState(false);
  const [customTokenAddress, setCustomTokenAddress] = useState('');
  const [addingToken, setAddingToken] = useState(false);
  const [hideBalances, setHideBalances] = useState(false);
  
  // Filter tokens based on search
  const filteredTokens = tokens.filter(token => 
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.address.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddToken = async () => {
    if (!customTokenAddress) return;
    
    try {
      setAddingToken(true);
      await addCustomToken(customTokenAddress);
      setCustomTokenAddress('');
      setShowAddToken(false);
    } catch (err: any) {
      alert(err.message || 'Failed to add token');
    } finally {
      setAddingToken(false);
    }
  };
  
  if (loading && tokens.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Token Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="w-24 h-4 mb-1" />
                    <Skeleton className="w-16 h-3" />
                  </div>
                </div>
                <Skeleton className="w-32 h-6" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Token Balances
            {tokens.length > 0 && (
              <Badge variant="secondary">{tokens.length}</Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setHideBalances(!hideBalances)}
              title={hideBalances ? "Show balances" : "Hide balances"}
            >
              {hideBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isRefreshing}
              title="Refresh balances"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAddToken(!showAddToken)}
              title="Add custom token"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            {autoRefresh && (
              <span className="ml-1">• Auto-refresh enabled</span>
            )}
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 text-sm text-destructive bg-destructive/10 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {/* Add custom token form */}
        {showAddToken && (
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Token contract address (0x...)"
              value={customTokenAddress}
              onChange={(e) => setCustomTokenAddress(e.target.value)}
              disabled={addingToken}
            />
            <Button 
              onClick={handleAddToken}
              disabled={!customTokenAddress || addingToken}
            >
              {addingToken ? 'Adding...' : 'Add'}
            </Button>
          </div>
        )}
        
        {/* Token list */}
        <div className="space-y-3">
          {filteredTokens.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No tokens found matching your search' : 'No tokens found'}
            </div>
          ) : (
            filteredTokens.map(token => (
              <div 
                key={token.address} 
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {token.logo ? (
                    <img 
                      src={token.logo} 
                      alt={token.symbol}
                      className="w-10 h-10 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = `https://via.placeholder.com/40/000000/ffffff?text=${token.symbol.slice(0, 2)}`;
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                      {token.symbol.slice(0, 2)}
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{token.symbol}</span>
                      {watchedTokens.includes(token.address) && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Live
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{token.name}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-medium">
                    {hideBalances ? '••••••' : token.formattedBalance}
                  </div>
                  {token.balanceUSD && (
                    <div className="text-xs text-muted-foreground">
                      ${hideBalances ? '•••' : token.balanceUSD.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Real-time watching indicator */}
        {watchRealTime && watchedTokens.length > 0 && (
          <div className="mt-4 text-xs text-muted-foreground text-center">
            Watching {watchedTokens.length} token{watchedTokens.length > 1 ? 's' : ''} for real-time updates
          </div>
        )}
      </CardContent>
    </Card>
  );
}