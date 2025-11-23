'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { GlassCard } from '../ui/GlassCard'
import { getContractConfig } from '@/config/contracts'
import { ContractConfig, FormField } from '@/types/contracts'
import { deployTokenVault } from '@/lib/reown/contracts'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { getAppKit } from '@/lib/reown/init'

interface DeployContractProps {
  contractType: string
  onBack: () => void
  className?: string
}

export function DeployContract({ contractType, onBack, className = '' }: DeployContractProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployProgress, setDeployProgress] = useState(0)
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null)
  const [deployError, setDeployError] = useState<string | null>(null)
  
  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('eip155')
  
  // Function to connect wallet
  const connect = async () => {
    const appKit = getAppKit()
    if (appKit && appKit.connect) {
      try {
        await appKit.connect()
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
    }
  }
  
  // Function to disconnect wallet
  const disconnect = async () => {
    const appKit = getAppKit()
    if (appKit && appKit.disconnect) {
      try {
        await appKit.disconnect()
      } catch (error) {
        console.error('Failed to disconnect wallet:', error)
      }
    }
  }
  
  // Reset form when contract type changes
  useEffect(() => {
    setCurrentStep(1)
    setFormData({})
    setIsDeploying(false)
    setDeployProgress(0)
    setDeployedAddress(null)
    setDeployError(null)
  }, [contractType])
  
  // Get contract-specific configuration
  const contractConfig = getContractConfig(contractType) || {
    id: 'default',
    name: 'Contract',
    description: 'Default contract configuration',
    category: 'tokens',
    icon: '',
    accentColor: '#3772FF',
    steps: [
      {
        title: 'Basic Setup',
        description: 'Configure the basic parameters for your contract.',
        fields: [
          {
            id: 'contractName',
            type: 'text',
            label: 'Contract Name',
            placeholder: 'My Contract',
            required: true,
            helpText: 'A name for your contract'
          }
        ]
      },
      {
        title: 'Review & Deploy',
        description: 'Review your contract details and deploy to the blockchain.',
        fields: []
      }
    ]
  } as ContractConfig
  
  const totalSteps = contractConfig.steps.length
  
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      onBack()
    }
  }
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const handleDeploy = async () => {
    // No need to check for connection or try to connect here
    // The button will be disabled if not connected, and the user can connect via the button text
    
    setIsDeploying(true);
    setDeployProgress(10);
    setDeployError(null);
    
    try {
      let contractAddress: string;
      
      // Deploy the contract based on the contract type
      if (contractType === 'token-vault') {
        setDeployProgress(20);
        contractAddress = await deployTokenVault(formData, walletProvider);
      } else if (contractType === 'lp-staking') {
        setDeployProgress(20);
        const { deployLpStakingContract } = await import('@/lib/reown/contracts');
        contractAddress = await deployLpStakingContract(formData, walletProvider);
      } else if (contractType === 'nft-staking') {
        setDeployProgress(20);
        const { deployNftStakingContract } = await import('@/lib/reown/contracts');
        contractAddress = await deployNftStakingContract(formData, walletProvider);
      } else {
        // Simulate deployment for other contract types
        await new Promise(resolve => setTimeout(resolve, 2000));
        contractAddress = '0x7c3429d5A2A54F06f6C98be4c6E864E649188304';
      }
      
      setDeployProgress(100)
      setDeployedAddress(contractAddress)
      setCurrentStep(totalSteps + 1) // Success step
    } catch (error) {
      console.error('Deployment error:', error)
      setDeployError(error instanceof Error ? error.message : 'Failed to deploy contract')
      setDeployProgress(0)
      setIsDeploying(false)
    }
  }
  
  const resetForm = () => {
    setFormData({})
    setCurrentStep(1)
    setDeployProgress(0)
    setDeployedAddress(null)
    setDeployError(null)
  }
  
  const isStepValid = () => {
    const currentStepConfig = contractConfig.steps[currentStep - 1]
    if (!currentStepConfig.fields) return true
    
    return currentStepConfig.fields.every((field: FormField) => {
      if (field.required) {
        return formData[field.id] && formData[field.id].toString().trim() !== ''
      }
      return true
    })
  }
  
  // Convert hex color to rgba for gradient
  const getColorWithOpacity = (hex: string, opacity: number) => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Return rgba
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  
  const accentColor = contractConfig.accentColor || '#3772FF';
  const accentRgba10 = getColorWithOpacity(accentColor, 0.1);
  const accentRgba20 = getColorWithOpacity(accentColor, 0.2);
  const accentRgba30 = getColorWithOpacity(accentColor, 0.3);
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 }
    }
  };
  
  return (
    <div className="max-w-lg mx-auto relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 transform translate-x-1/3 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10 transform -translate-x-1/3"></div>
      
      {/* Wallet Connection Status */}
      {!isConnected && (
        <div className="mb-6 bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-blue-300">Connect your wallet to deploy contracts</span>
          </div>
              <Button
                variant="primary"
                size="sm"
                onClick={connect}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                }
              >
                Connect Wallet
              </Button>
        </div>
      )}
      
      {/* Progress Indicator */}
      <div className="relative mb-8">
        <div className="absolute h-1 bg-gray-700 top-4 left-0 right-0 z-0 rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between relative z-10">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              <motion.div 
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1
                  ${currentStep > index + 1 ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-500/30' : 
                    currentStep === index + 1 ? 'bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-lg shadow-blue-500/30' : 
                    'bg-gray-800 text-gray-400 border border-gray-700'}`}
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ 
                  scale: currentStep === index + 1 ? 1.1 : 1,
                  opacity: currentStep >= index + 1 ? 1 : 0.7
                }}
                transition={{ duration: 0.3 }}
              >
                {currentStep > index + 1 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="font-semibold">{index + 1}</span>
                )}
              </motion.div>
              <div className={`text-xs font-medium ${currentStep >= index + 1 ? 'text-white' : 'text-gray-500'}`}>
                {contractConfig.steps[index].title}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <GlassCard 
        className={`${className}`}
        variant="dark"
        borderGlow={currentStep === totalSteps}
        animate="fade"
      >
        <motion.div
          key={currentStep}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={fadeIn}
        >
          {currentStep <= totalSteps ? (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="p-2 rounded-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${accentRgba20}, ${accentRgba10})`,
                    boxShadow: `0 2px 10px ${accentRgba10}`
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={accentColor}>
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {contractConfig.steps[currentStep - 1].title}
                </h2>
              </div>
              
              <p className="text-gray-300 mb-8 text-sm leading-relaxed">
                {contractConfig.steps[currentStep - 1].description}
              </p>
              
              {/* Dynamic form fields */}
              <div className="space-y-6">
                {contractConfig.steps[currentStep - 1].fields?.map((field: FormField) => (
                  <div className="form-group" key={field.id}>
                    <label className="block text-sm font-medium text-white mb-2" htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {field.type === 'text' && (
                      <input
                        id={field.id}
                        type="text"
                        className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                        placeholder={field.placeholder}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        required={field.required}
                      />
                    )}
                    {field.type === 'number' && (
                      <input
                        id={field.id}
                        type="number"
                        step={field.step}
                        min={field.min}
                        max={field.max}
                        className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                        placeholder={field.placeholder}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        required={field.required}
                      />
                    )}
                    {field.type === 'textarea' && (
                      <textarea
                        id={field.id}
                        className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                        placeholder={field.placeholder}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        required={field.required}
                        rows={4}
                      />
                    )}
                    {field.type === 'select' && (
                      <div className="relative">
                        <select
                          id={field.id}
                          className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 appearance-none"
                          value={formData[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          required={field.required}
                        >
                          <option value="">Select an option</option>
                          {field.options?.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                      </div>
                    )}
                    {field.type === 'checkbox' && (
                      <div className="flex items-center">
                        <input
                          id={field.id}
                          type="checkbox"
                          className="w-5 h-5 text-blue-600 bg-gray-800/80 border-gray-700 rounded focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                          checked={formData[field.id] || false}
                          onChange={(e) => handleInputChange(field.id, e.target.checked)}
                        />
                        <label htmlFor={field.id} className="ml-2 text-sm text-gray-300">
                          {field.checkboxLabel}
                        </label>
                      </div>
                    )}
                    {field.type === 'dynamic-array' && (
                      <div className="space-y-4">
                        {/* Display existing items */}
                        {(formData[field.id] || []).map((item: any, index: number) => (
                          <div key={index} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 relative">
                            <button
                              type="button"
                              className="absolute top-2 right-2 text-gray-400 hover:text-red-400"
                              onClick={() => {
                                const newItems = [...(formData[field.id] || [])];
                                newItems.splice(index, 1);
                                handleInputChange(field.id, newItems);
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <div className="grid grid-cols-1 gap-3">
                              {field.itemFields?.map((itemField) => (
                                <div key={itemField.id} className="form-group">
                                  <label className="block text-xs font-medium text-white mb-1">
                                    {itemField.label}
                                    {itemField.required && <span className="text-red-400 ml-1">*</span>}
                                  </label>
                                  {itemField.type === 'text' && (
                                    <input
                                      type="text"
                                      className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-2 text-white text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                                      placeholder={itemField.placeholder}
                                      value={(item as Record<string, any>)[itemField.id] || ''}
                                      onChange={(e) => {
                                        const newItems = [...(formData[field.id] || [])] as Record<string, any>[];
                                        newItems[index] = {
                                          ...newItems[index],
                                          [itemField.id]: e.target.value
                                        };
                                        handleInputChange(field.id, newItems);
                                      }}
                                    />
                                  )}
                                  {itemField.type === 'number' && (
                                    <input
                                      type="number"
                                      className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-2 text-white text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                                      placeholder={itemField.placeholder}
                                      min={itemField.min}
                                      max={itemField.max}
                                      step={itemField.step}
                                      value={(item as Record<string, any>)[itemField.id] || ''}
                                      onChange={(e) => {
                                        const newItems = [...(formData[field.id] || [])] as Record<string, any>[];
                                        newItems[index] = {
                                          ...newItems[index],
                                          [itemField.id]: e.target.value
                                        };
                                        handleInputChange(field.id, newItems);
                                      }}
                                    />
                                  )}
                                  {itemField.helpText && (
                                    <div className="mt-1 text-xs text-gray-400">{itemField.helpText}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        
                        {/* Add new item button */}
                        <button
                          type="button"
                          className="w-full py-2 px-4 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-blue-400 hover:border-blue-500 transition-colors"
                          onClick={() => {
                            const newItem: Record<string, any> = {};
                            field.itemFields?.forEach((itemField) => {
                              newItem[itemField.id] = '';
                            });
                            handleInputChange(field.id, [...(formData[field.id] || []), newItem]);
                          }}
                        >
                          <div className="flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            <span>Add {field.label.replace(/s$/, '')}</span>
                          </div>
                        </button>
                      </div>
                    )}
                    
                    {field.helpText && field.type !== 'dynamic-array' && (
                      <div className="mt-1.5 text-xs text-gray-400">{field.helpText}</div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Review step */}
              {currentStep === totalSteps && (
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-5 mb-6 mt-6 border border-gray-700/50">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    Contract Details
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(formData).map(([key, value]) => {
                      // Find the field definition to get the label
                      let fieldLabel = key
                      for (const step of contractConfig.steps) {
                        const field = step.fields?.find((f: FormField) => f.id === key)
                        if (field) {
                          fieldLabel = field.label
                          break
                        }
                      }
                      
                      return (
                        <div key={key} className="bg-gray-800/30 p-3 rounded-lg">
                          <div className="text-xs font-medium text-blue-400 mb-1">{fieldLabel}</div>
                          <div className="text-sm text-white truncate">{value?.toString()}</div>
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                    <div className="flex items-center text-sm text-blue-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Deploying this contract will require a network transaction fee
                    </div>
                  </div>
                </div>
              )}
              
              {deployError && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
                  <div className="flex items-center text-sm text-red-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {deployError}
                  </div>
                </div>
              )}
              
              {isDeploying ? (
                <div className="mt-8">
                  <div className="mb-3 text-center text-lg font-medium text-white">Deploying contract...</div>
                  <div className="w-full h-3 bg-gray-700/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 rounded-full"
                      style={{ width: `${deployProgress}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-center text-sm text-gray-400">{deployProgress}%</div>
                </div>
              ) : (
                <div className="flex justify-between mt-8">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={prevStep}
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    }
                  >
                    Back
                  </Button>
                  {currentStep === totalSteps ? (
                    <Button
                      variant="gradient"
                      size="md"
                      onClick={handleDeploy}
                      disabled={!isStepValid() || !isConnected}
                      glowEffect={true}
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                        </svg>
                      }
                    >
                      {!isConnected ? 'Connect Wallet to Deploy' : 'Deploy Contract'}
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={nextStep}
                      disabled={!isStepValid()}
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      }
                      iconPosition="right"
                    >
                      Continue
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">Deployment Successful!</h3>
              <p className="text-gray-300 mb-6 max-w-sm mx-auto">
                Your {contractConfig.name} contract has been successfully deployed to the blockchain.
              </p>
              
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 mb-8 border border-gray-700/50">
                <div className="text-xs font-medium text-gray-400 mb-2">Contract Address</div>
                <div className="flex items-center bg-gray-900/50 rounded-lg p-3">
                  <code className="text-sm text-blue-300 flex-1 overflow-x-auto font-mono">{deployedAddress}</code>
                  <button 
                    className="ml-2 p-1.5 bg-gray-800 rounded-md text-blue-400 hover:text-blue-300 hover:bg-gray-700 transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText(deployedAddress || '')
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button 
                  variant="glass" 
                  size="md" 
                  onClick={() => {
                    resetForm()
                    onBack()
                  }}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                  }
                >
                  Deploy Another
                </Button>
                <Button 
                  variant="primary" 
                  size="md"
                  onClick={() => {
                    window.location.href = '/vaults'
                  }}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                    </svg>
                  }
                >
                  View Vaults
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </GlassCard>
    </div>
  )
}
