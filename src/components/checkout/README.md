# Reown Checkout Integration

This module provides components and hooks for integrating direct wallet-to-wallet payments into your checkout process using Reown wallet connections.

## Overview

The Reown Checkout integration allows users to make payments directly from their wallet to a merchant wallet without requiring a smart contract. This implementation:

- Uses the Reown wallet connection for authentication
- Supports both native CRO and ERC20 token payments
- Provides a simple, customizable UI component
- Handles transaction status and errors

## Components

### CheckoutPayment

The main component for processing payments. It displays a payment form with the recipient address, amount input, and payment button.

```tsx
import { CheckoutPayment } from '@/components/checkout'

// In your component:
<CheckoutPayment
  recipientAddress="0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
  amount="10"
  tokenAddress="0x..." // Optional: If provided, will use ERC20 token instead of CRO
  onSuccess={(txHash) => console.log('Payment successful:', txHash)}
  onError={(error) => console.error('Payment failed:', error)}
/>
```

#### Props

- `recipientAddress` (required): The wallet address that will receive the payment
- `amount` (optional): The initial amount to display in the input field
- `tokenAddress` (optional): The ERC20 token contract address. If not provided, native CRO will be used
- `onSuccess` (optional): Callback function that receives the transaction hash when payment is successful
- `onError` (optional): Callback function that receives the error message when payment fails

## Hooks

### useWalletTransfer

A custom hook that provides functions for sending CRO and ERC20 tokens directly from the connected wallet.

```tsx
import { useWalletTransfer } from '@/components/checkout'

// In your component:
const { 
  sendCRO, 
  sendToken, 
  getTokenInfo, 
  isTransferring, 
  isWalletConnected 
} = useWalletTransfer()

// Send CRO
const handleSendCRO = async () => {
  const result = await sendCRO('0x71C7656EC7ab88b098defB751B7401B5f6d8976F', '10')
  if (result.success) {
    console.log('Transaction hash:', result.txHash)
  } else {
    console.error('Error:', result.error)
  }
}

// Send ERC20 token
const handleSendToken = async () => {
  const result = await sendToken(
    '0xTokenContractAddress', // Token contract address
    '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', // Recipient address
    '100' // Amount
  )
  if (result.success) {
    console.log('Transaction hash:', result.txHash)
  } else {
    console.error('Error:', result.error)
  }
}
```

#### Functions

- `sendCRO(recipientAddress, amount)`: Sends native CRO to the specified address
- `sendToken(tokenAddress, recipientAddress, amount)`: Sends ERC20 tokens to the specified address
- `getTokenInfo(tokenAddress)`: Gets token information (symbol, name, decimals)

#### States

- `isTransferring`: Boolean indicating if a transfer is in progress
- `isWalletConnected`: Boolean indicating if a wallet is connected

## Example Implementation

See the checkout example page at `/checkout-example` for a complete implementation example.

## Integration Steps

1. Import the necessary components:
   ```tsx
   import { CheckoutPayment, useWalletTransfer } from '@/components/checkout'
   ```

2. Add the CheckoutPayment component to your checkout page:
   ```tsx
   <CheckoutPayment
     recipientAddress={merchantWalletAddress}
     amount={totalAmount}
     onSuccess={handlePaymentSuccess}
     onError={handlePaymentError}
   />
   ```

3. Implement success and error handlers:
   ```tsx
   const handlePaymentSuccess = (txHash) => {
     // Update order status, show confirmation, etc.
     console.log('Payment successful with transaction hash:', txHash)
   }
   
   const handlePaymentError = (error) => {
     // Show error message, offer retry options, etc.
     console.error('Payment error:', error)
   }
   ```

4. For more advanced use cases, use the `useWalletTransfer` hook directly.

## Security Considerations

- Always validate the recipient address and amount on both client and server sides
- Implement proper order tracking to verify payments
- Consider implementing a webhook or listener to monitor transaction confirmations
- For high-value transactions, consider waiting for multiple block confirmations

## Limitations

- This implementation relies on the user having a wallet with sufficient funds
- Transaction confirmation times depend on network congestion
- No automatic refund mechanism is provided