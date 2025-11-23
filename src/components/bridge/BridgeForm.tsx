'use client'

import { QuoteDetails } from '@/lib/xy/useXYBridge'

interface BridgeFormProps {
  amount: string;
  setAmount: (amount: string) => void;
  sourceToken: {
    symbol: string;
    balance?: string;
    name?: string;
  } | null;
  quoteDetails: QuoteDetails | null;
  loading: boolean;
  error: string | null;
  slippage: number;
  handleMaxAmount?: () => void;
  amountInUsd: string;
  estimatedKrisAmount: string;
}

export function BridgeForm({
  amount,
  setAmount,
  sourceToken,
  quoteDetails,
  loading,
  error,
  slippage,
  handleMaxAmount,
  amountInUsd,
  estimatedKrisAmount
}: BridgeFormProps) {
  return (
    <div className="space-y-4">
      {/* Amount Input */}
      <div>
        <label className="text-sm text-gray-400 mb-1 block">Amount</label>
        <div className="relative">
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || (parseFloat(value) >= 0 && !isNaN(parseFloat(value)))) {
                setAmount(value);
              }
            }}
            placeholder="0.0"
            className="w-full bg-[#162234] border border-[#243b55] rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {sourceToken && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <div className="text-gray-400">
                {sourceToken.symbol}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-gray-400">≈ ${amountInUsd}</span>
          {sourceToken?.balance && handleMaxAmount && (
            <button
              className="text-blue-400 hover:text-blue-300"
              onClick={handleMaxAmount}
            >
              MAX
            </button>
          )}
        </div>
      </div>
      
      {/* Destination preset to Cronos + Kris */}
      <div className="bg-[#12192a] p-4 rounded-lg border border-[#243b55]">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-400">You will receive</span>
            <div className="text-xl font-semibold text-white">{estimatedKrisAmount} $Kris</div>
            {quoteDetails && quoteDetails.estimatedTime && (
              <div className="text-xs text-gray-400 mt-1">
                Estimated time: ~{quoteDetails.estimatedTime} seconds
              </div>
            )}
          </div>
          <div className="bg-[#162234] p-3 rounded-md text-center">
            <div className="w-8 h-8 rounded-full bg-blue-900/30 mx-auto flex items-center justify-center">
              <span className="text-blue-400 font-bold">K</span>
            </div>
            <div className="text-xs mt-1 text-gray-300">Cronos</div>
          </div>
        </div>
      </div>
      
      {/* Bridge details if available */}
      {quoteDetails && (
        <div className="bg-[#162234]/50 rounded-lg p-3 text-sm">
          {/* Quote details */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Min. received:</span>
              <span className="text-white">{quoteDetails.minReceiveAmount} KRIS</span>
            </div>
            {quoteDetails.estimatedGas && (
              <div className="flex justify-between">
                <span className="text-gray-400">Gas (estimated):</span>
                <span className="text-white">{quoteDetails.estimatedGas}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Loading State */}
      {loading && !error && (
        <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-3">
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-blue-400 text-sm">Calculating best route...</p>
          </div>
        </div>
      )}
    </div>
  );
}