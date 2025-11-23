'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/GlassCard'
import { useOrderProcessing, OrderCreationData } from '@/hooks/useOrderProcessing'
import { useAppKitAccount } from '@reown/appkit/react'
import { CheckoutPayment } from '@/components/checkout'
import { useWalletTransfer } from '@/hooks/useWalletTransfer'
import { updateOrderStatus, OrderStatus } from '@/lib/firebase/order-service'
import { sendOrderConfirmationEmail, sendNewOrderAdminEmail, sendPaymentReceivedAdminEmail, DEFAULT_ADMIN_EMAIL } from '@/lib/email-service'
import { useRouter } from 'next/navigation'
import styles from '@/styles/components/Slider.module.css'

// Merchant wallet address
const MERCHANT_WALLET_ADDRESS = '0xD3eBF04f76B67e47093bDDd8B14f9090f1c80976'

// Define the form state interface
interface FormState {
  projectName: string
  projectDescription: string
  name: string
  email: string
  walletAddress: string
  investmentOption: 'cash-token' | 'cash-only' | null
  tokenAllocation: number
  agreeToTerms: boolean
  tokenName?: string
  tokenSymbol?: string
  tokenSupply?: string
}

export function InvestmentCheckoutForm() {
  const router = useRouter()
  const { isConnected, address } = useAppKitAccount()
  const {
    createNewOrder,
    loading: orderLoading,
    error: orderError,
    currentOrder,
    orderCreated,
    paymentComplete,
    resetOrderState
  } = useOrderProcessing()
  
  const { isTransferring } = useWalletTransfer()
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  // Initialize form state
  const [formState, setFormState] = useState<FormState>({
    projectName: '',
    projectDescription: '',
    name: '',
    email: '',
    walletAddress: '',
    investmentOption: null,
    tokenAllocation: 0,
    agreeToTerms: false,
    tokenName: '',
    tokenSymbol: '',
    tokenSupply: ''
  })
  
  // State for showing payment info
  const [showPaymentInfo, setShowPaymentInfo] = useState(false)
  
  // Combined loading state
  const loading = orderLoading || isTransferring
  
  // Update wallet address from connected wallet
  useEffect(() => {
    if (isConnected && address) {
      setFormState(prev => ({
        ...prev,
        walletAddress: address
      }))
    }
  }, [isConnected, address])
  
  // Update token allocation based on investment option
  useEffect(() => {
    if (formState.investmentOption === 'cash-token') {
      setFormState(prev => ({ ...prev, tokenAllocation: 3 })) // Fixed 3% for cash + token option
    } else if (formState.investmentOption === 'cash-only') {
      setFormState(prev => ({ ...prev, tokenAllocation: 0 })) // No tokens for flat fee option
    }
  }, [formState.investmentOption])
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormState(prev => ({
      ...prev,
      [name]: checked
    }))
  }
  
  // Handle investment option selection
  const handleInvestmentOption = (option: 'cash-token' | 'cash-only') => {
    setFormState(prev => ({
      ...prev,
      investmentOption: option
    }))
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formState.investmentOption) {
      alert('Please select an investment option')
      return
    }
    
    if (formState.investmentOption === 'cash-token' && !formState.agreeToTerms) {
      alert('Please agree to the token allocation terms')
      return
    }
    
    // Create order data
    const orderData: OrderCreationData = {
      projectName: formState.projectName,
      projectDescription: formState.projectDescription,
      customerName: formState.name,
      customerEmail: formState.email,
      walletAddress: formState.walletAddress,
      selectedFeatures: formState.investmentOption === 'cash-token' 
        ? [`Investment Option: ${formState.investmentOption}`, `Token Allocation: ${formState.tokenAllocation}%`]
        : [`Investment Option: ${formState.investmentOption}`],
      totalPrice: formState.investmentOption === 'cash-token' ? 1000 : 2500,
      customData: {
        investmentOption: formState.investmentOption,
        ...(formState.investmentOption === 'cash-token' && { tokenAllocation: formState.tokenAllocation }),
        tokenName: formState.tokenName,
        tokenSymbol: formState.tokenSymbol,
        tokenSupply: formState.tokenSupply
      }
    }
    
    // Create the order in Firebase
    const order = await createNewOrder(orderData)
    
    if (order) {
      if (formState.investmentOption === 'cash-token') {
        setShowPaymentInfo(true)
      } else {
        // For token-only option, mark as completed immediately
        await updateOrderStatus(order.id, OrderStatus.COMPLETED, 'Token-only investment selected')
        router.push(`/orders/confirmation/${order.id}`)
      }
    }
  }
  
  // Handle successful payment
  const handlePaymentSuccess = async (transactionHash: string) => {
    if (currentOrder && currentOrder.id) {
      try {
        // Update the order status to completed
        const updatedOrder = await updateOrderStatus(
          currentOrder.id,
          OrderStatus.COMPLETED,
          `Payment completed with transaction hash: ${transactionHash}`
        );
        
        setTxHash(transactionHash);
        setPaymentSuccess(true);
        setPaymentError(null);
        
        // Send confirmation emails
        await Promise.all([
          // Send confirmation email to customer
          sendOrderConfirmationEmail(updatedOrder),
          // Send notification emails to admin
          sendNewOrderAdminEmail(updatedOrder, DEFAULT_ADMIN_EMAIL),
          sendPaymentReceivedAdminEmail(updatedOrder, DEFAULT_ADMIN_EMAIL)
        ]);
        
        // After a short delay, redirect to the order confirmation page
        setTimeout(() => {
          router.push(`/orders/confirmation/${currentOrder.id}`);
        }, 3000);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update order status';
        setPaymentError(errorMessage);
      }
    }
  }
  
  // Handle payment error
  const handlePaymentError = (errorMessage: string) => {
    setPaymentError(errorMessage);
    setPaymentSuccess(false);
  }
  
  // Close modal and reset state
  const handleCloseModal = () => {
    setShowPaymentInfo(false)
    if (paymentSuccess) {
      resetOrderState()
      setPaymentSuccess(false)
      setTxHash(null)
      // Reset form if payment was completed
      setFormState({
        projectName: '',
        projectDescription: '',
        name: '',
        email: '',
        walletAddress: address || '',
        investmentOption: null,
        tokenAllocation: 0,
        agreeToTerms: false,
        tokenName: '',
        tokenSymbol: '',
        tokenSupply: ''
      })
    }
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Investment Options */}
        <GlassCard className="p-6 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
          <h3 className="text-xl font-bold text-white mb-6">Choose Your Investment Model</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cash + Token Option */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleInvestmentOption('cash-token')}
              className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${
                formState.investmentOption === 'cash-token' ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              <div className="glass-panel-dark p-6 h-full hover:border-purple-500/30">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
                
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full mb-3">
                    <span className="text-sm font-semibold text-purple-400">RECOMMENDED</span>
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">Cash + Tokens</h4>
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className="text-3xl font-bold text-gradient bg-gradient-to-r from-purple-400 to-blue-400">$1,000</span>
                    <span className="text-xl text-gray-400">+</span>
                    <span className="text-2xl font-bold text-gradient bg-gradient-to-r from-yellow-400 to-orange-400">3%</span>
                  </div>
                  <p className="text-gray-400 text-sm">Best value with aligned incentives</p>
                </div>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center text-gray-300">
                    <svg className="h-4 w-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Priority development
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="h-4 w-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    6 months support
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="h-4 w-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Marketing assistance
                  </li>
                </ul>
              </div>
            </motion.div>
            
            {/* Cash Only Option */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleInvestmentOption('cash-only')}
              className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${
                formState.investmentOption === 'cash-only' ? 'ring-2 ring-green-500' : ''
              }`}
            >
              <div className="glass-panel-dark p-6 h-full hover:border-green-500/30">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full mb-3">
                    <span className="text-sm font-semibold text-green-400">FLAT FEE</span>
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">Cash Only</h4>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-gradient bg-gradient-to-r from-green-400 to-emerald-400">$2,500</span>
                  </div>
                  <p className="text-gray-400 text-sm">One-time payment, no equity</p>
                </div>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center text-gray-300">
                    <svg className="h-4 w-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Full development
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="h-4 w-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    6 months support
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="h-4 w-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Full ownership
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
          
          {/* Token Allocation Slider */}
          {formState.investmentOption && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 p-4 glass-panel-dark rounded-lg"
            >
              <label className="block text-gray-300 mb-3">
                Token Allocation: <span className="text-xl font-bold text-gradient bg-gradient-to-r from-yellow-400 to-orange-400">{formState.tokenAllocation}%</span>
              </label>
              <input
                type="range"
                min={formState.investmentOption === 'cash-token' ? 5 : 15}
                max={formState.investmentOption === 'cash-token' ? 10 : 20}
                step="0.5"
                value={formState.tokenAllocation}
                onChange={(e) => setFormState(prev => ({ ...prev, tokenAllocation: parseFloat(e.target.value) }))}
                className={`w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer ${styles.slider}`}
              />
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>{formState.investmentOption === 'cash-token' ? '5%' : '15%'}</span>
                <span>{formState.investmentOption === 'cash-token' ? '10%' : '20%'}</span>
              </div>
            </motion.div>
          )}
        </GlassCard>
        
        {/* Project Information */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">Project Information</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="projectName" className="block text-gray-300 mb-2">
                Project Name *
              </label>
              <Input
                id="projectName"
                name="projectName"
                value={formState.projectName}
                onChange={handleInputChange}
                placeholder="Enter your project name"
                required
                className="w-full"
              />
            </div>
            
            <div>
              <label htmlFor="projectDescription" className="block text-gray-300 mb-2">
                Project Description *
              </label>
              <Textarea
                id="projectDescription"
                name="projectDescription"
                value={formState.projectDescription}
                onChange={handleInputChange}
                placeholder="Describe your project vision, goals, and what makes it unique"
                required
                rows={4}
                className="w-full"
              />
            </div>
            
            {/* Token Details (optional) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="tokenName" className="block text-gray-300 mb-2">
                  Token Name (optional)
                </label>
                <Input
                  id="tokenName"
                  name="tokenName"
                  value={formState.tokenName}
                  onChange={handleInputChange}
                  placeholder="e.g., MyToken"
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="tokenSymbol" className="block text-gray-300 mb-2">
                  Token Symbol (optional)
                </label>
                <Input
                  id="tokenSymbol"
                  name="tokenSymbol"
                  value={formState.tokenSymbol}
                  onChange={handleInputChange}
                  placeholder="e.g., MTK"
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="tokenSupply" className="block text-gray-300 mb-2">
                  Total Supply (optional)
                </label>
                <Input
                  id="tokenSupply"
                  name="tokenSupply"
                  value={formState.tokenSupply}
                  onChange={handleInputChange}
                  placeholder="e.g., 1000000"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </GlassCard>
        
        {/* Contact Information */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-gray-300 mb-2">
                Full Name *
              </label>
              <Input
                id="name"
                name="name"
                value={formState.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
                className="w-full"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-gray-300 mb-2">
                Email Address *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formState.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                required
                className="w-full"
              />
            </div>
            
            <div>
              <label htmlFor="walletAddress" className="block text-gray-300 mb-2">
                Wallet Address *
              </label>
              <Input
                id="walletAddress"
                name="walletAddress"
                value={formState.walletAddress}
                onChange={handleInputChange}
                placeholder="Enter your wallet address"
                required
                className="w-full"
              />
            </div>
          </div>
        </GlassCard>
        
        {/* Token Allocation Agreement - Only for cash+token option */}
        {formState.investmentOption === 'cash-token' && (
          <GlassCard className="p-6 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
            <h3 className="text-xl font-bold text-white mb-4">Token Allocation Agreement</h3>
            <div className="space-y-3 text-sm text-gray-300 mb-4">
              <p>By proceeding, you agree to the following terms:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Kris Development will receive 3% of your project's total token supply</li>
                <li>Tokens will be vested over 6-12 months with a cliff period</li>
                <li>We become partners in your project's success</li>
                <li>You maintain full control and ownership of your project</li>
                <li>We provide ongoing support and development assistance</li>
              </ul>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formState.agreeToTerms}
                onChange={handleCheckboxChange}
                className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700 mr-3"
              />
              <label htmlFor="agreeToTerms" className="text-gray-300">
                I agree to the token allocation terms and partnership agreement
              </label>
            </div>
          </GlassCard>
        )}
        
        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            glowEffect={true}
            className="w-full md:w-auto"
            disabled={loading || !formState.investmentOption || (formState.investmentOption === 'cash-token' && !formState.agreeToTerms)}
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              'Proceed to Payment'
            )}
          </Button>
        </div>
      </form>
      
      {/* Payment Information Modal */}
      {showPaymentInfo && formState.investmentOption === 'cash-token' && (
        <motion.div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-[#0a1e3d] border border-blue-500/30 rounded-xl p-6 max-w-md w-full"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h3 className="text-2xl font-bold text-white mb-4">
            {paymentSuccess ? 'Payment Complete' : 'Payment Information'}
          </h3>
          
          {(orderError || paymentError) && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{orderError || paymentError}</p>
            </div>
          )}
          
          {paymentSuccess ? (
            <div className="space-y-4">
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                <p className="text-green-400 font-medium">Your order has been successfully processed!</p>
                <p className="text-gray-300 mt-2">
                  Order ID: <span className="text-blue-400 font-mono">{currentOrder?.id}</span>
                </p>
                {txHash && (
                  <a
                    href={`https://cronoscan.com/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 text-sm hover:underline mt-2 inline-block"
                  >
                    View transaction on Cronoscan
                  </a>
                )}
              </div>
              
              <p className="text-gray-300">
                Thank you for your order! We'll contact you via email within 24 hours to discuss the next steps.
                You will be redirected to your order confirmation page shortly.
              </p>
              
              <Button
                variant="outline"
                size="md"
                fullWidth={true}
                onClick={handleCloseModal}
              >
                Close
              </Button>
            </div>
          ) : (
            <>
              <p className="text-gray-300 mb-6">
                Your order has been created. Please complete the payment to proceed:
              </p>
              
              <div className="bg-black/30 border border-white/10 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <p className="text-sm text-gray-400">Order ID:</p>
                  <p className="text-blue-400 font-mono">{currentOrder?.id?.substring(0, 8)}...</p>
                </div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm text-gray-400">Amount:</p>
                  <p className="text-white font-medium">${formState.investmentOption === 'cash-token' ? '1000' : '2500'} CRO</p>
                </div>
                {formState.investmentOption === 'cash-token' && (
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-400">Token Allocation:</p>
                    <p className="text-yellow-400 font-medium">{formState.tokenAllocation}%</p>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <CheckoutPayment
                  recipientAddress={MERCHANT_WALLET_ADDRESS}
                  amount={formState.investmentOption === 'cash-token' ? '1000' : '2500'}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </div>
              
              <Button
                variant="outline"
                size="md"
                fullWidth={true}
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
            </>
          )}
            </motion.div>
          </motion.div>
      )}
    </div>
  )
}

export default InvestmentCheckoutForm