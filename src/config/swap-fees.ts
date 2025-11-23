/**
 * Swap Fee Configuration
 *
 * This configuration defines the fee structure for swaps on the FFTB platform.
 * Fees are collected and sent to the team wallet to support platform development.
 */

export const SWAP_FEE_CONFIG = {
  /**
   * Team wallet address that receives swap fees
   */
  TEAM_WALLET: '0x3921168b3fe5167fa15312c8e4436bb974ce8d71',

  /**
   * Fee percentage (0.3% = 0.003)
   * This is deducted from the input amount before the swap
   */
  FEE_PERCENTAGE: 0.003, // 0.3%

  /**
   * Minimum fee in USD equivalent
   * If the calculated fee is below this amount, no fee is charged
   */
  MINIMUM_FEE_USD: 0.10,

  /**
   * Whether fee collection is enabled
   * Set to false to disable fee collection
   */
  ENABLED: true,
}

/**
 * Calculate the fee amount for a given input
 *
 * @param inputAmount The amount being swapped
 * @param tokenPriceUSD The price of the token in USD (optional)
 * @returns Object with fee amount and remaining amount for swap
 */
export function calculateSwapFee(
  inputAmount: string,
  tokenPriceUSD?: number
): {
  feeAmount: string
  swapAmount: string
  feePercentage: number
} {
  if (!SWAP_FEE_CONFIG.ENABLED) {
    return {
      feeAmount: '0',
      swapAmount: inputAmount,
      feePercentage: 0
    }
  }

  const amount = parseFloat(inputAmount)
  if (isNaN(amount) || amount <= 0) {
    return {
      feeAmount: '0',
      swapAmount: inputAmount,
      feePercentage: 0
    }
  }

  // Calculate fee
  const feeAmount = amount * SWAP_FEE_CONFIG.FEE_PERCENTAGE

  // Check minimum fee if token price is provided
  if (tokenPriceUSD && (feeAmount * tokenPriceUSD) < SWAP_FEE_CONFIG.MINIMUM_FEE_USD) {
    // Fee too small, don't charge
    return {
      feeAmount: '0',
      swapAmount: inputAmount,
      feePercentage: 0
    }
  }

  const swapAmount = amount - feeAmount

  return {
    feeAmount: feeAmount.toString(),
    swapAmount: swapAmount.toString(),
    feePercentage: SWAP_FEE_CONFIG.FEE_PERCENTAGE
  }
}

/**
 * Format fee information for display
 *
 * @param feeAmount The fee amount
 * @param tokenSymbol The token symbol
 * @returns Formatted fee string
 */
export function formatFeeDisplay(
  feeAmount: string,
  tokenSymbol: string
): string {
  const fee = parseFloat(feeAmount)
  if (isNaN(fee) || fee <= 0) {
    return 'No fee'
  }

  return `${fee.toFixed(6)} ${tokenSymbol} (${(SWAP_FEE_CONFIG.FEE_PERCENTAGE * 100).toFixed(2)}%)`
}
