'use client'

interface TransactionStatusProps {
  txHash: string | null;
  status: string | null;
  sourceChainId: number;
  destinationChainId: number;
}

export function TransactionStatus({ txHash, status, sourceChainId, destinationChainId }: TransactionStatusProps) {
  // Get explorer URLs based on chain IDs
  const getExplorerUrl = (chainId: number, hash: string) => {
    switch (chainId) {
      case 1: return `https://etherscan.io/tx/${hash}` // Ethereum
      case 56: return `https://bscscan.com/tx/${hash}` // BSC
      case 137: return `https://polygonscan.com/tx/${hash}` // Polygon
      case 10: return `https://optimistic.etherscan.io/tx/${hash}` // Optimism
      case 42161: return `https://arbiscan.io/tx/${hash}` // Arbitrum
      case 43114: return `https://snowtrace.io/tx/${hash}` // Avalanche
      case 25: return `https://cronoscan.com/tx/${hash}` // Cronos
      default: return `https://etherscan.io/tx/${hash}` // Default to Etherscan
    }
  };
  
  // Get chain name based on chain ID
  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum'
      case 56: return 'BSC'
      case 137: return 'Polygon'
      case 10: return 'Optimism'
      case 42161: return 'Arbitrum'
      case 43114: return 'Avalanche'
      case 25: return 'Cronos'
      default: return 'Unknown Chain'
    }
  };
  
  // Get status color, icon, and text based on status
  const getStatusInfo = (status: string | null) => {
    if (!status) return { color: 'gray', icon: 'clock', text: 'Unknown' };
    
    switch (status) {
      case 'Processing':
        return { color: 'yellow', icon: 'clock', text: 'Processing', description: 'Your transaction is being processed' };
      case 'Done':
        return { color: 'green', icon: 'check', text: 'Complete', description: 'Your transaction completed successfully' };
      case 'Receive bridge token':
        return { color: 'blue', icon: 'info', text: 'Bridge Token Received', description: 'Tokens received on the bridge' };
      case 'Refunded':
        return { color: 'blue', icon: 'arrow-left', text: 'Refunded', description: 'Your transaction was refunded' };
      case 'Pending refund':
        return { color: 'yellow', icon: 'clock', text: 'Pending Refund', description: 'Waiting for refund process to complete' };
      case 'Failed':
        return { color: 'red', icon: 'x', text: 'Failed', description: 'Transaction failed, please try again' };
      default:
        return { color: 'yellow', icon: 'clock', text: status, description: 'Transaction in progress' };
    }
  };
  
  if (!txHash) return null;
  
  const statusInfo = getStatusInfo(status);
  const sourceExplorerUrl = getExplorerUrl(sourceChainId, txHash);
  const destinationExplorerUrl = getExplorerUrl(destinationChainId, txHash);
  
  const getStatusBgColor = () => {
    switch (statusInfo.color) {
      case 'green': return 'bg-green-900/40 border-green-700/60';
      case 'yellow': return 'bg-yellow-900/40 border-yellow-700/60';
      case 'red': return 'bg-red-900/40 border-red-700/60';
      case 'blue': return 'bg-blue-900/40 border-blue-700/60';
      default: return 'bg-gray-900/40 border-gray-700/60';
    }
  };
  
  const getStatusTextColor = () => {
    switch (statusInfo.color) {
      case 'green': return 'text-green-400';
      case 'yellow': return 'text-yellow-400';
      case 'red': return 'text-red-400';
      case 'blue': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };
  
  // Short hash display
  const shortHash = `${txHash.substring(0, 6)}...${txHash.substring(txHash.length - 4)}`;
  
  return (
    <div className={`p-4 ${getStatusBgColor()} rounded-lg border shadow-lg`}>
      <div className="flex items-center mb-3">
        <div className="mr-3 flex-shrink-0">
          {statusInfo.icon === 'check' && (
            <div className="w-10 h-10 rounded-full bg-green-900/60 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {statusInfo.icon === 'clock' && (
            <div className="w-10 h-10 rounded-full bg-yellow-900/60 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {statusInfo.icon === 'x' && (
            <div className="w-10 h-10 rounded-full bg-red-900/60 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {statusInfo.icon === 'arrow-left' && (
            <div className="w-10 h-10 rounded-full bg-blue-900/60 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {statusInfo.icon === 'info' && (
            <div className="w-10 h-10 rounded-full bg-blue-900/60 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className={`${getStatusTextColor()} text-lg font-medium`}>
            Transaction {statusInfo.text}
          </h3>
          <p className="text-gray-300 text-sm">
            {statusInfo.description}
          </p>
        </div>
      </div>
      
      {/* Transaction details */}
      <div className="mb-3 space-y-2">
        <div className="bg-[#162234]/70 p-3 rounded-md flex items-center justify-between">
          <div className="text-gray-400 text-sm">Transaction Hash:</div>
          <div className="flex items-center">
            <span className="text-white mr-2">{shortHash}</span>
            <a
              href={sourceExplorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
        
        <div className="bg-[#162234]/70 p-3 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400 text-sm">Bridging from:</div>
            <div className="text-white">{getChainName(sourceChainId)}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-gray-400 text-sm">Bridging to:</div>
            <div className="text-white">Cronos (KRIS)</div>
          </div>
        </div>
      </div>
      
      {/* Progress Steps */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#1a2c4c] z-0"></div>
        <div className="relative z-10">
          <div className="flex mb-3">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="text-white font-medium">Transaction Initiated</div>
              <div className="text-gray-400 text-xs">Your bridge transaction has been sent</div>
            </div>
          </div>
          
          <div className="flex mb-3">
            <div className={`w-8 h-8 rounded-full ${status === 'Processing' || status === 'Done' || status === 'Receive bridge token' ? 'bg-green-600' : 'bg-[#162234]'} flex items-center justify-center mr-3`}>
              {(status === 'Processing' || status === 'Done' || status === 'Receive bridge token') ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              )}
            </div>
            <div>
              <div className={status === 'Processing' || status === 'Done' || status === 'Receive bridge token' ? "text-white font-medium" : "text-gray-400 font-medium"}>Transaction Processing</div>
              <div className="text-gray-400 text-xs">Source chain confirmation</div>
            </div>
          </div>
          
          <div className="flex">
            <div className={`w-8 h-8 rounded-full ${status === 'Done' ? 'bg-green-600' : 'bg-[#162234]'} flex items-center justify-center mr-3`}>
              {status === 'Done' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              )}
            </div>
            <div>
              <div className={status === 'Done' ? "text-white font-medium" : "text-gray-400 font-medium"}>Transaction Complete</div>
              <div className="text-gray-400 text-xs">KRIS tokens received on Cronos</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* View on explorer links */}
      <div className="mt-4 flex justify-end space-x-3">
        <a
          href={sourceExplorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View on {getChainName(sourceChainId)} Explorer
        </a>
        {status === 'Done' && (
          <a
            href={destinationExplorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View on Cronos Explorer
          </a>
        )}
      </div>
    </div>
  );
}