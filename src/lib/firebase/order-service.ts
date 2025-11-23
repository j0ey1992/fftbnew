'use client'

import {
  collection,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  doc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore'
import { firestoreDB } from './config'

// Order status enum
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Order interface
export interface Order {
  id?: string
  projectName: string
  projectDescription: string
  customerName: string
  customerEmail: string
  walletAddress: string
  selectedFeatures: string[]
  totalPrice: number
  status: OrderStatus
  txHash?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  notes?: string
}

// Collection name
const ORDERS_COLLECTION = 'orders'

/**
 * Create a new order in Firestore
 * @param orderData Order data without id, createdAt, and updatedAt
 * @returns The created order with id
 */
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
  try {
    const timestamp = Timestamp.now()
    
    const orderWithTimestamps = {
      ...orderData,
      createdAt: timestamp,
      updatedAt: timestamp
    }
    
    const docRef = await addDoc(collection(firestoreDB, ORDERS_COLLECTION), orderWithTimestamps)
    
    return {
      id: docRef.id,
      ...orderWithTimestamps
    }
  } catch (error) {
    console.error('Error creating order:', error)
    throw new Error('Failed to create order')
  }
}

/**
 * Update an existing order
 * @param orderId Order ID
 * @param updateData Partial order data to update
 * @returns The updated order
 */
export async function updateOrder(
  orderId: string, 
  updateData: Partial<Omit<Order, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Order> {
  try {
    const orderRef = doc(firestoreDB, ORDERS_COLLECTION, orderId)
    const orderDoc = await getDoc(orderRef)
    
    if (!orderDoc.exists()) {
      throw new Error(`Order with ID ${orderId} not found`)
    }
    
    const updatedData = {
      ...updateData,
      updatedAt: Timestamp.now()
    }
    
    await updateDoc(orderRef, updatedData)
    
    // Get the updated document
    const updatedOrderDoc = await getDoc(orderRef)
    
    return {
      id: updatedOrderDoc.id,
      ...updatedOrderDoc.data()
    } as Order
  } catch (error) {
    console.error(`Error updating order ${orderId}:`, error)
    throw new Error('Failed to update order')
  }
}

/**
 * Update order status
 * @param orderId Order ID
 * @param status New status
 * @param notes Optional notes about the status change
 * @returns The updated order
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  notes?: string
): Promise<Order> {
  const updateData: Partial<Order> = { status }
  if (notes) {
    updateData.notes = notes
  }
  
  return updateOrder(orderId, updateData)
}

/**
 * Update order transaction hash
 * @param orderId Order ID
 * @param txHash Transaction hash
 * @returns The updated order
 */
export async function updateOrderTransaction(
  orderId: string,
  txHash: string
): Promise<Order> {
  return updateOrder(orderId, { 
    txHash,
    status: OrderStatus.PROCESSING
  })
}

/**
 * Get an order by ID
 * @param orderId Order ID
 * @returns The order or null if not found
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const orderRef = doc(firestoreDB, ORDERS_COLLECTION, orderId)
    const orderDoc = await getDoc(orderRef)
    
    if (!orderDoc.exists()) {
      return null
    }
    
    return {
      id: orderDoc.id,
      ...orderDoc.data()
    } as Order
  } catch (error) {
    console.error(`Error getting order ${orderId}:`, error)
    throw new Error('Failed to get order')
  }
}

/**
 * Get orders by wallet address
 * @param walletAddress Wallet address
 * @returns Array of orders
 */
export async function getOrdersByWallet(walletAddress: string): Promise<Order[]> {
  try {
    const ordersQuery = query(
      collection(firestoreDB, ORDERS_COLLECTION),
      where('walletAddress', '==', walletAddress),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(ordersQuery)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[]
  } catch (error) {
    console.error(`Error getting orders for wallet ${walletAddress}:`, error)
    throw new Error('Failed to get orders by wallet')
  }
}

/**
 * Get orders by customer email
 * @param email Customer email
 * @returns Array of orders
 */
export async function getOrdersByEmail(email: string): Promise<Order[]> {
  try {
    const ordersQuery = query(
      collection(firestoreDB, ORDERS_COLLECTION),
      where('customerEmail', '==', email),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(ordersQuery)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[]
  } catch (error) {
    console.error(`Error getting orders for email ${email}:`, error)
    throw new Error('Failed to get orders by email')
  }
}

/**
 * Get all orders with optional status filter
 * @param status Optional status filter
 * @returns Array of orders
 */
export async function getAllOrders(status?: OrderStatus): Promise<Order[]> {
  try {
    let ordersQuery;
    
    if (status) {
      ordersQuery = query(
        collection(firestoreDB, ORDERS_COLLECTION),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      )
    } else {
      ordersQuery = query(
        collection(firestoreDB, ORDERS_COLLECTION),
        orderBy('createdAt', 'desc')
      )
    }
    
    const querySnapshot = await getDocs(ordersQuery)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[]
  } catch (error) {
    console.error('Error getting all orders:', error)
    throw new Error('Failed to get all orders')
  }
}

export default {
  createOrder,
  updateOrder,
  updateOrderStatus,
  updateOrderTransaction,
  getOrder,
  getOrdersByWallet,
  getOrdersByEmail,
  getAllOrders,
  OrderStatus
}