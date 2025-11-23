'use client'

import { useState, useCallback } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { 
  createOrder, 
  updateOrderTransaction, 
  getOrder, 
  getOrdersByWallet, 
  OrderStatus, 
  Order 
} from '@/lib/firebase/order-service'
import { useWalletTransfer } from './useWalletTransfer'

// Merchant wallet address from environment variable
const MERCHANT_WALLET_ADDRESS = process.env.NEXT_PUBLIC_MERCHANT_WALLET_ADDRESS || ''

// Interface for the order creation data
export interface OrderCreationData {
  projectName: string
  projectDescription: string
  customerName: string
  customerEmail: string
  walletAddress: string
  selectedFeatures: string[]
  totalPrice: number
}

/**
 * Hook for handling order processing with Firebase and crypto payments
 */
export function useOrderProcessing() {
  const { address, isConnected } = useAppKitAccount()
  const { sendCRO, isTransferring } = useWalletTransfer()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [orderCreated, setOrderCreated] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)
  
  /**
   * Create a new order in Firebase
   */
  const createNewOrder = useCallback(async (orderData: OrderCreationData): Promise<Order | null> => {
    setLoading(true)
    setError(null)
    setOrderCreated(false)
    
    try {
      // Create the order with pending status
      const newOrder = await createOrder({
        ...orderData,
        status: OrderStatus.PENDING
      })
      
      setCurrentOrder(newOrder)
      setOrderCreated(true)
      return newOrder
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])
  
  /**
   * Process payment for an order
   */
  const processPayment = useCallback(async (orderId: string, amount: number): Promise<boolean> => {
    if (!isConnected || !address) {
      setError('Wallet not connected')
      return false
    }
    
    setLoading(true)
    setError(null)
    setPaymentComplete(false)
    
    try {
      // Get the order to verify it exists
      const order = await getOrder(orderId)
      if (!order) {
        throw new Error(`Order with ID ${orderId} not found`)
      }
      
      // Send payment
      const result = await sendCRO(MERCHANT_WALLET_ADDRESS, amount.toString())
      
      if (result.success && result.txHash) {
        // Update order with transaction hash and change status to processing
        await updateOrderTransaction(orderId, result.txHash)
        
        // Get the updated order
        const updatedOrder = await getOrder(orderId)
        setCurrentOrder(updatedOrder)
        setPaymentComplete(true)
        return true
      } else {
        throw new Error(result.error || 'Payment failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process payment'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [isConnected, address, sendCRO])
  
  /**
   * Get an order by ID
   */
  const fetchOrder = useCallback(async (orderId: string): Promise<Order | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const order = await getOrder(orderId)
      setCurrentOrder(order)
      return order
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])
  
  /**
   * Get orders for the current wallet
   */
  const fetchUserOrders = useCallback(async (): Promise<Order[]> => {
    if (!isConnected || !address) {
      setError('Wallet not connected')
      return []
    }
    
    setLoading(true)
    setError(null)
    
    try {
      return await getOrdersByWallet(address)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user orders'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [isConnected, address])
  
  /**
   * Complete order flow: create order and process payment
   */
  const completeOrderFlow = useCallback(async (orderData: OrderCreationData): Promise<boolean> => {
    try {
      // Step 1: Create the order
      const newOrder = await createNewOrder(orderData)
      if (!newOrder) {
        return false
      }
      
      // Step 2: Process the payment
      return await processPayment(newOrder.id!, orderData.totalPrice)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Order flow failed'
      setError(errorMessage)
      return false
    }
  }, [createNewOrder, processPayment])
  
  /**
   * Reset the order state
   */
  const resetOrderState = useCallback(() => {
    setCurrentOrder(null)
    setOrderCreated(false)
    setPaymentComplete(false)
    setError(null)
  }, [])
  
  return {
    // State
    loading: loading || isTransferring,
    error,
    currentOrder,
    orderCreated,
    paymentComplete,
    isWalletConnected: isConnected && !!address,
    
    // Functions
    createNewOrder,
    processPayment,
    fetchOrder,
    fetchUserOrders,
    completeOrderFlow,
    resetOrderState
  }
}

export default useOrderProcessing