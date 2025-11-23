'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/Textarea'
import { getAllOrders, updateOrderStatus, getOrder, OrderStatus, Order } from '@/lib/firebase/order-service'
import { useAdmin } from '@/hooks/useAdmin'
import { sendOrderStatusUpdateEmail, DEFAULT_ADMIN_EMAIL } from '@/lib/email-service'
import OrderNavigation from '@/components/orders/OrderNavigation'

export default function AdminOrdersPage() {
  const router = useRouter()
  const { isAdmin, isLoading: adminLoading } = useAdmin()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Selected order for details/editing
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updateNote, setUpdateNote] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Fetch all orders
  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true)
        const allOrders = await getAllOrders()
        setOrders(allOrders)
        setFilteredOrders(allOrders)
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError('Failed to load orders. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    if (isAdmin) {
      fetchOrders()
    }
  }, [isAdmin])

  // Apply filters when status filter or search query changes
  useEffect(() => {
    if (!orders.length) return
    
    let filtered = [...orders]
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(order => 
        order.id?.toLowerCase().includes(query) ||
        order.projectName.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerEmail.toLowerCase().includes(query) ||
        order.walletAddress.toLowerCase().includes(query)
      )
    }
    
    setFilteredOrders(filtered)
  }, [orders, statusFilter, searchQuery])

  // Handle status update
  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!selectedOrder || !selectedOrder.id) return
    
    try {
      setUpdatingStatus(true)
      
      // Update the order status
      await updateOrderStatus(
        selectedOrder.id,
        newStatus,
        updateNote || `Status updated to ${newStatus} by admin`
      )
      
      // Get the updated order
      const updatedOrder = await getOrder(selectedOrder.id)
      
      if (updatedOrder) {
        // Send email notification to customer about status update
        await sendOrderStatusUpdateEmail(updatedOrder)
        
        // Update local state
        const updatedOrders = orders.map(order =>
          order.id === selectedOrder.id
            ? updatedOrder
            : order
        )
        
        setOrders(updatedOrders)
      }
      
      // Close the detail view
      setSelectedOrder(null)
      setUpdateNote('')
    } catch (err) {
      console.error('Error updating order status:', err)
      setError('Failed to update order status. Please try again.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Format date for display
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'processing':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  // If not admin, show access denied
  if (!adminLoading && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="p-6 max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-red-400 mb-6">You do not have permission to access this page.</p>
          <Button onClick={() => router.push('/')} variant="gradient">
            Return to Home
          </Button>
        </GlassCard>
      </div>
    )
  }

  // If loading admin status, show loading
  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <OrderNavigation />
      <div className="py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Order Management</h1>
              <p className="text-gray-400">View and manage customer orders</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button onClick={() => router.push('/')} variant="outline" size="sm">
                Return to Home
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === 'all' ? 'gradient' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={statusFilter === OrderStatus.PENDING ? 'gradient' : 'outline'}
                onClick={() => setStatusFilter(OrderStatus.PENDING)}
                size="sm"
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === OrderStatus.PROCESSING ? 'gradient' : 'outline'}
                onClick={() => setStatusFilter(OrderStatus.PROCESSING)}
                size="sm"
              >
                Processing
              </Button>
              <Button
                variant={statusFilter === OrderStatus.COMPLETED ? 'gradient' : 'outline'}
                onClick={() => setStatusFilter(OrderStatus.COMPLETED)}
                size="sm"
              >
                Completed
              </Button>
              <Button
                variant={statusFilter === OrderStatus.CANCELLED ? 'gradient' : 'outline'}
                onClick={() => setStatusFilter(OrderStatus.CANCELLED)}
                size="sm"
              >
                Cancelled
              </Button>
            </div>
            <div className="md:ml-auto">
              <Input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64"
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Orders table */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-black/20 rounded-lg border border-white/10">
              <p className="text-gray-400">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3 text-left text-gray-400 font-medium">Order ID</th>
                    <th className="px-4 py-3 text-left text-gray-400 font-medium">Project</th>
                    <th className="px-4 py-3 text-left text-gray-400 font-medium">Customer</th>
                    <th className="px-4 py-3 text-left text-gray-400 font-medium">Date</th>
                    <th className="px-4 py-3 text-left text-gray-400 font-medium">Price</th>
                    <th className="px-4 py-3 text-left text-gray-400 font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="px-4 py-3 text-white font-mono">{order.id?.substring(0, 8)}...</td>
                      <td className="px-4 py-3 text-white">{order.projectName}</td>
                      <td className="px-4 py-3 text-white">{order.customerName}</td>
                      <td className="px-4 py-3 text-gray-300">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3 text-white">${order.totalPrice}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#0a1e3d] border border-blue-500/30 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-white">Order Details</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedOrder(null)
                  setUpdateNote('')
                }}
              >
                Close
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Order Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order ID:</span>
                    <span className="text-white font-mono">{selectedOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created:</span>
                    <span className="text-white">{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Updated:</span>
                    <span className="text-white">{formatDate(selectedOrder.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Price:</span>
                    <span className="text-white font-bold">${selectedOrder.totalPrice} CRO</span>
                  </div>
                  {selectedOrder.txHash && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Transaction:</span>
                      <a
                        href={`https://cronoscan.com/tx/${selectedOrder.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline truncate max-w-[200px]"
                      >
                        {selectedOrder.txHash.substring(0, 10)}...
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Customer Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <a
                      href={`mailto:${selectedOrder.customerEmail}`}
                      className="text-blue-400 hover:underline"
                    >
                      {selectedOrder.customerEmail}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Wallet:</span>
                    <span className="text-white font-mono truncate max-w-[200px]">
                      {selectedOrder.walletAddress}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Project Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 block mb-1">Project Name:</span>
                  <span className="text-white">{selectedOrder.projectName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Project Description:</span>
                  <p className="text-white bg-black/20 p-3 rounded-lg border border-white/10">
                    {selectedOrder.projectDescription}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Selected Features</h3>
              <div className="flex flex-wrap gap-2">
                {selectedOrder.selectedFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2 text-blue-300"
                  >
                    {feature.charAt(0).toUpperCase() + feature.slice(1).replace(/([A-Z])/g, ' $1')}
                  </div>
                ))}
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Notes</h3>
                <p className="text-white bg-black/20 p-3 rounded-lg border border-white/10">
                  {selectedOrder.notes}
                </p>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Update Status</h3>
              <div className="space-y-4">
                <Textarea
                  placeholder="Add notes about this status update..."
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  rows={3}
                />
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate(OrderStatus.PENDING)}
                    disabled={updatingStatus || selectedOrder.status === OrderStatus.PENDING}
                    className={selectedOrder.status === OrderStatus.PENDING ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    Mark as Pending
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate(OrderStatus.PROCESSING)}
                    disabled={updatingStatus || selectedOrder.status === OrderStatus.PROCESSING}
                    className={selectedOrder.status === OrderStatus.PROCESSING ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    Mark as Processing
                  </Button>
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => handleStatusUpdate(OrderStatus.COMPLETED)}
                    disabled={updatingStatus || selectedOrder.status === OrderStatus.COMPLETED}
                    className={selectedOrder.status === OrderStatus.COMPLETED ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    Mark as Completed
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleStatusUpdate(OrderStatus.CANCELLED)}
                    disabled={updatingStatus || selectedOrder.status === OrderStatus.CANCELLED}
                    className={selectedOrder.status === OrderStatus.CANCELLED ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    Mark as Cancelled
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}