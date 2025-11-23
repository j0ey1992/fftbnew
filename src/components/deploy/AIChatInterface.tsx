'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/GlassCard'
import { MessageBubble } from '@/components/deploy/chat/MessageBubble'
import { SuggestionChips } from '@/components/deploy/chat/SuggestionChips'
import { InputArea } from '@/components/deploy/chat/InputArea'
import { TokenBuilder } from './TokenBuilder'
import { useAppKitAccount } from '@reown/appkit/react'
import { getAppKit } from '@/lib/reown/init'
import { ContractConfig } from '@/types/contracts'
import { contractConfigs } from '@/config/contracts'
import { 
  generateAIResponse, 
  streamAIResponse, 
  generateSmartContract,
  generateDeploymentParameters 
} from '@/lib/ai/deepseek'

export type MessageType = 'ai' | 'user' | 'system'

export interface Message {
  id: string
  type: MessageType
  content: string
  timestamp: Date
  options?: string[]
  isLoading?: boolean
  isError?: boolean
}

export interface AIChatInterfaceProps {
  onSelectContractType: (contractType: string) => void
  onDeployContract: (contractType: string, parameters: Record<string, any>) => Promise<string>
  className?: string
}

export function AIChatInterface({ 
  onSelectContractType, 
  onDeployContract,
  className = '' 
}: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState<'welcome' | 'select-contract' | 'configure' | 'deploy' | 'complete'>('welcome')
  const [selectedContract, setSelectedContract] = useState<ContractConfig | null>(null)
  const [contractParameters, setContractParameters] = useState<Record<string, any>>({})
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null)
  const [showTokenBuilder, setShowTokenBuilder] = useState(false)
  const [tokenBuilderType, setTokenBuilderType] = useState<string>('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { address, isConnected } = useAppKitAccount()
  
  // Function to connect wallet
  const connect = async () => {
    const appKit = getAppKit()
    if (appKit && appKit.connect) {
      try {
        await appKit.connect()
      } catch (error) {
        console.error('Failed to connect wallet:', error)
        addMessage({
          type: 'system',
          content: 'Failed to connect wallet. Please try again.',
          isError: true
        })
      }
    }
  }
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])
  
  // Track initialization to prevent duplicate welcome messages
  const initializedRef = useRef(false);
  
  // Initial welcome message - only add once
  useEffect(() => {
    if (messages.length === 0 && !initializedRef.current) {
      initializedRef.current = true;
      addMessage({
        type: 'ai',
        content: 'Welcome to the AI-powered Contract Deployment Assistant! I can help you deploy various types of contracts to the blockchain. What would you like to deploy today?',
        options: ['ERC20 Token', 'Tax Token', 'LP Staking', 'Token Vault', 'NFT Collection', 'Show All Options']
      })
    }
  }, [messages.length])
  
  // Add a new message
  const addMessage = ({ type, content, options, isLoading = false, isError = false }: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      timestamp: new Date(),
      options,
      isLoading,
      isError
    }
    
    setMessages(prev => [...prev, newMessage])
  }
  
  // Update the last AI message (for loading states)
  const updateLastAiMessage = (content: string, options?: string[], isLoading = false) => {
    setMessages(prev => {
      const lastAiMessageIndex = [...prev].reverse().findIndex(m => m.type === 'ai')
      if (lastAiMessageIndex === -1) return prev
      
      const actualIndex = prev.length - 1 - lastAiMessageIndex
      const updatedMessages = [...prev]
      updatedMessages[actualIndex] = {
        ...updatedMessages[actualIndex],
        content,
        options,
        isLoading
      }
      
      return updatedMessages
    })
  }
  
  // Handle user input submission
  const handleSubmit = async (text: string = inputValue) => {
    if (!text.trim() && !inputValue.trim()) return
    
    const userInput = text || inputValue
    setInputValue('')
    
    // Add user message
    addMessage({
      type: 'user',
      content: userInput
    })
    
    setIsProcessing(true)
    
    // Add AI thinking message
    addMessage({
      type: 'ai',
      content: 'Thinking...',
      isLoading: true
    })
    
    // Process the user input based on current step
    await processUserInput(userInput)
    
    setIsProcessing(false)
  }
  
  // Process user input based on current step
  const processUserInput = async (input: string) => {
    const normalizedInput = input.toLowerCase().trim()
    
    try {
      // Use AI to process the input based on the current step
      const lastMessages = messages.slice(-5) // Get the last 5 messages for context
      const messageHistory = lastMessages.map(m => ({
        role: m.type === 'user' ? 'user' : m.type === 'ai' ? 'assistant' : 'system',
        content: m.content
      }))
      
      // Create a context-aware prompt based on the current step
      let systemPrompt = `You are an AI assistant specialized in blockchain and smart contract development. 
      You are helping the user deploy a smart contract. The current step is: ${currentStep}.`
      
      if (selectedContract) {
        systemPrompt += ` The user has selected a ${selectedContract.name} contract.`
      }
      
      // For simple responses, use the existing handlers
      switch (currentStep) {
        case 'welcome':
          handleWelcomeStep(normalizedInput)
          break
          
        case 'select-contract':
          // Try to use AI to determine the contract type
          try {
            const aiPrompt = `Based on the user's input: "${input}", determine which contract type they want to deploy. 
            Options are: ERC20 Token, Tax Token, LP Staking, Token Vault, NFT Collection. 
            Respond with just the contract type name, nothing else.`
            
            const aiResponse = await generateAIResponse(aiPrompt, systemPrompt, { temperature: 0.3 })
            const detectedType = aiResponse.trim().toLowerCase()
            
            // If AI detected a valid contract type, use it
            if (detectedType.includes('erc20') || detectedType.includes('tax') || 
                detectedType.includes('staking') || detectedType.includes('vault') || 
                detectedType.includes('nft')) {
              handleContractSelection(detectedType)
            } else {
              // Fall back to the regular handler
              handleContractSelection(normalizedInput)
            }
          } catch (error) {
            console.error('Error using AI for contract selection:', error)
            handleContractSelection(normalizedInput)
          }
          break
          
        case 'configure':
          // Use AI to extract parameters from user input
          if (selectedContract) {
            try {
              // Check if the input contains multiple parameters (line breaks or commas)
              const containsMultipleParams = input.includes('\n') || 
                                            (input.split(',').length > 1) ||
                                            (input.split(/\s+/).length >= 3 && /\d/.test(input));
              
              if (containsMultipleParams) {
                // Use AI to extract all parameters at once
                const aiPrompt = `Extract contract parameters from this user input: "${input}"
                For a ${selectedContract.name}, I need to extract:
                1. name (string)
                2. symbol (string, 2-5 characters)
                3. totalSupply (number or string with number)
                ${selectedContract.id.includes('tax') ? 
                  '4. buyTax (percentage)\n5. sellTax (percentage)' : ''}
                
                Return a valid JSON object with these parameters.`;
                
                const aiResponse = await generateAIResponse(aiPrompt, systemPrompt, { temperature: 0.3 })
                
                // Extract JSON from the response
                const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                                aiResponse.match(/\{[\s\S]*\}/)
                
                if (jsonMatch) {
                  const jsonStr = jsonMatch[1] || jsonMatch[0]
                  const extractedParams = JSON.parse(jsonStr)
                  
                  // Set all parameters at once
                  setContractParameters(extractedParams)
                  
                  // Move to deploy step
                  setCurrentStep('deploy')
                  
                  // Generate a summary of the parameters
                  const paramSummary = Object.entries(extractedParams)
                    .map(([key, value]) => `- ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
                    .join('\n')
                  
                  updateLastAiMessage(
                    `Great! I've collected the following parameters for your ${selectedContract.name}:\n\n${paramSummary}\n\n` +
                    `Would you like to deploy this contract now?`,
                    ['Deploy Now', 'Edit Parameters', 'Start Over']
                  )
                } else {
                  // Fall back to sequential parameter collection
                  handleSequentialParameterCollection(input)
                }
              } else {
                // Handle sequential parameter collection
                handleSequentialParameterCollection(input)
              }
            } catch (error) {
              console.error('Error using AI for parameter extraction:', error)
              handleContractConfiguration(normalizedInput)
            }
          } else {
            handleContractConfiguration(normalizedInput)
          }
          break
          
        case 'deploy':
          handleDeployment(normalizedInput)
          break
          
        case 'complete':
          handlePostDeployment(normalizedInput)
          break
      }
    } catch (error) {
      console.error('Error processing user input:', error)
      updateLastAiMessage(
        'I apologize, but I encountered an error while processing your request. Please try again.',
        ['Start Over', 'Try Again']
      )
    }
  }
  
  // Handle welcome step
  const handleWelcomeStep = (input: string) => {
    setCurrentStep('select-contract')
    
    // Check if the input directly matches a contract type
    if (input.includes('erc20') || input.includes('token')) {
      updateLastAiMessage(
        'Great! Let\'s deploy an ERC20 token. I\'ll help you configure all the parameters. What kind of token would you like to create?',
        ['Standard ERC20', 'Tax Token', 'Reflective Token', 'Custom Token']
      )
    } else if (input.includes('staking') || input.includes('lp')) {
      updateLastAiMessage(
        'Staking contracts are a great way to reward your token holders. What type of staking contract are you interested in?',
        ['LP Staking', 'Token Staking', 'NFT Staking']
      )
    } else if (input.includes('nft')) {
      updateLastAiMessage(
        'NFTs are a powerful way to represent unique digital assets. What type of NFT contract would you like to deploy?',
        ['Standard NFT (ERC721)', 'ERC1155 Multi-Token', 'ERC404 Hybrid']
      )
    } else if (input.includes('all') || input.includes('options') || input.includes('show')) {
      // Show all contract categories
      updateLastAiMessage(
        'Here are all the contract types I can help you deploy. Which category interests you?',
        ['Tokens', 'NFTs', 'Staking', 'Vaults', 'Other']
      )
    } else {
      // Generic response if we can't determine the intent
      updateLastAiMessage(
        'I can help you deploy various types of contracts. What category are you interested in?',
        ['Tokens', 'NFTs', 'Staking', 'Vaults', 'Other']
      )
    }
  }
  
  // Handle contract selection step
  const handleContractSelection = (input: string) => {
    let selectedContractType: string | null = null
    
    // Map user input to contract types
    if (input.includes('standard erc20') || input.includes('erc20 token')) {
      selectedContractType = 'erc20-token'
    } else if (input.includes('tax') || input.includes('fee')) {
      selectedContractType = 'erc20-tax-token'
    } else if (input.includes('lp staking') || input.includes('liquidity')) {
      selectedContractType = 'lp-staking'
    } else if (input.includes('token staking')) {
      selectedContractType = 'token-staking'
    } else if (input.includes('nft staking')) {
      selectedContractType = 'nft-staking'
    } else if (input.includes('vault') || input.includes('token vault')) {
      selectedContractType = 'token-vault'
    } else if (input.includes('standard nft') || input.includes('erc721')) {
      selectedContractType = 'deploy-nft'
    } else if (input.includes('erc404') || input.includes('hybrid')) {
      selectedContractType = 'erc404-nft'
    } else if (input.includes('tokens')) {
      // Show token options
      updateLastAiMessage(
        'Here are the token contracts I can help you deploy:',
        ['Standard ERC20', 'Tax Token', 'Reflective Token', 'Token Vault']
      )
      return
    } else if (input.includes('nfts')) {
      // Show NFT options
      updateLastAiMessage(
        'Here are the NFT contracts I can help you deploy:',
        ['Standard NFT (ERC721)', 'ERC1155 Multi-Token', 'ERC404 Hybrid']
      )
      return
    } else if (input.includes('staking')) {
      // Show staking options
      updateLastAiMessage(
        'Here are the staking contracts I can help you deploy:',
        ['LP Staking', 'Token Staking', 'NFT Staking']
      )
      return
    } else {
      // If we can't determine the contract type, ask for clarification
      updateLastAiMessage(
        'I\'m not sure which contract type you\'re interested in. Could you please select one of these options?',
        ['Standard ERC20', 'Tax Token', 'LP Staking', 'Token Vault', 'NFT Collection']
      )
      return
    }
    
    if (selectedContractType) {
      const contract = contractConfigs.find(c => c.id === selectedContractType)
      if (contract) {
        setSelectedContract(contract)
        setCurrentStep('configure')
        
        // Notify parent component
        onSelectContractType(selectedContractType)
        
        // Generate configuration message based on contract type
        const configMessage = generateConfigurationMessage(contract)
        updateLastAiMessage(configMessage.content, configMessage.options)
      } else {
        updateLastAiMessage(
          'I couldn\'t find that contract type in our system. Please select one of these options:',
          ['Standard ERC20', 'Tax Token', 'LP Staking', 'Token Vault', 'NFT Collection']
        )
      }
    }
  }
  
  // Generate configuration message based on contract type
  const generateConfigurationMessage = (contract: ContractConfig): { content: string, options?: string[] } => {
    switch (contract.id) {
      case 'erc20-token':
        return {
          content: 'Let\'s configure your ERC20 token. I\'ll need some basic information:\n\n1. Token Name\n2. Token Symbol\n3. Total Supply\n\nWhat would you like to name your token?',
        }
      case 'erc20-tax-token':
        return {
          content: 'Let\'s configure your Tax Token. This token type allows you to set buy and sell taxes that can be used for liquidity, marketing, or development.\n\n1. Token Name\n2. Token Symbol\n3. Total Supply\n4. Buy Tax Percentage\n5. Sell Tax Percentage\n\nWhat would you like to name your token?',
        }
      case 'lp-staking':
        return {
          content: 'Let\'s configure your LP Staking contract. This will allow users to stake their LP tokens and earn rewards.\n\n1. LP Token Address\n2. Reward Token Address\n3. Reward Rate\n\nPlease provide the LP Token Address:',
        }
      case 'token-vault':
        return {
          content: 'Let\'s configure your Token Vault. This will allow users to stake tokens and earn rewards with different lock periods.\n\n1. Vault Name\n2. Stake Token Address\n3. Reward Token Address\n\nWhat would you like to name your vault?',
        }
      case 'deploy-nft':
        return {
          content: 'Let\'s configure your NFT Collection. I\'ll need some basic information:\n\n1. Collection Name\n2. Collection Symbol\n3. Base URI\n4. Max Supply\n\nWhat would you like to name your NFT collection?',
        }
      default:
        return {
          content: `Let's configure your ${contract.name}. What parameters would you like to set?`,
          options: ['Start with Defaults', 'Custom Configuration', 'Show Example']
        }
    }
  }
  
  // Handle sequential parameter collection
  const handleSequentialParameterCollection = (input: string) => {
    // Determine which parameter we're collecting based on how many we already have
    const paramCount = Object.keys(contractParameters).length
    
    if (paramCount === 0) {
      // First parameter (name)
      setContractParameters({ name: input })
      updateLastAiMessage(
        `Great! Your token will be named "${input}". Now, what symbol would you like to use? This is typically 3-4 characters (like BTC or ETH).`
      )
    } else if (paramCount === 1) {
      // Second parameter (symbol)
      setContractParameters(prev => ({ ...prev, symbol: input }))
      updateLastAiMessage(
        `Perfect! Your token will use the symbol "${input}". Finally, what should the total supply be? (e.g., 1000000)`
      )
    } else {
      // Third parameter (supply) or beyond
      setContractParameters(prev => ({ 
        ...prev, 
        [paramCount === 2 ? 'totalSupply' : `param${paramCount}`]: input 
      }))
      
      // If we have enough parameters, move to deploy step
      if (paramCount >= 2) {
        setCurrentStep('deploy')
        
        // Generate a summary of the parameters
        const paramSummary = Object.entries(contractParameters)
          .map(([key, value]) => `- ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
          .join('\n')
        
        updateLastAiMessage(
          `Great! I've collected the following parameters for your ${selectedContract?.name}:\n\n` +
          `${paramSummary}\n- ${paramCount === 2 ? 'Total Supply' : `Parameter ${paramCount}`}: ${input}\n\n` +
          `Would you like to deploy this contract now?`,
          ['Deploy Now', 'Edit Parameters', 'Start Over']
        )
      }
    }
  }
  
  // Handle contract configuration step
  const handleContractConfiguration = (input: string) => {
    // This would be a more complex function that builds up the contract parameters
    // based on user input and the selected contract type
    
    // For now, we'll just simulate collecting parameters
    setContractParameters(prev => ({
      ...prev,
      [Object.keys(prev).length === 0 ? 'name' : Object.keys(prev).length === 1 ? 'symbol' : 'supply']: input
    }))
    
    // If we've collected enough parameters, move to deploy step
    if (Object.keys(contractParameters).length >= 2) {
      setCurrentStep('deploy')
      updateLastAiMessage(
        `Great! I've collected the following parameters for your ${selectedContract?.name}:\n\n` +
        `${Object.entries(contractParameters).map(([key, value]) => `- ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`).join('\n')}\n\n` +
        `Would you like to deploy this contract now?`,
        ['Deploy Now', 'Edit Parameters', 'Start Over']
      )
    } else if (Object.keys(contractParameters).length === 0) {
      // First parameter (name)
      updateLastAiMessage(
        `Great! Your token will be named "${input}". Now, what symbol would you like to use? This is typically 3-4 characters (like BTC or ETH).`
      )
    } else if (Object.keys(contractParameters).length === 1) {
      // Second parameter (symbol)
      updateLastAiMessage(
        `Perfect! Your token will use the symbol "${input}". Finally, what should the total supply be? (e.g., 1000000)`
      )
    }
  }
  
  // Handle deployment step
  const handleDeployment = async (input: string) => {
    if (input.includes('deploy') || input.includes('yes') || input.includes('now')) {
      // Check if wallet is connected
      if (!isConnected) {
        updateLastAiMessage(
          'You need to connect your wallet before deploying a contract. Would you like to connect now?',
          ['Connect Wallet', 'Cancel']
        )
        return
      }
      
      // Ensure wallet is fully connected before proceeding
      const appKit = getAppKit()
      if (!appKit) {
        updateLastAiMessage(
          'There was an error with the wallet connection. Please try refreshing the page and connecting again.',
          ['Try Again', 'Cancel']
        )
        return
      }
      
      // Double-check account is available
      try {
        const account = await appKit.getAccount?.()
        if (!account || !account.address) {
          // Try to reconnect
          await connect()
          
          // Check again after reconnection attempt
          const reconnectedAccount = await appKit.getAccount?.()
          if (!reconnectedAccount || !reconnectedAccount.address) {
            updateLastAiMessage(
              'Unable to detect your connected wallet. Please try connecting again or refresh the page.',
              ['Connect Wallet', 'Cancel']
            )
            return
          }
        }
      } catch (error) {
        console.error('Error checking account:', error)
        updateLastAiMessage(
          'There was an error verifying your wallet connection. Please try connecting again.',
          ['Connect Wallet', 'Cancel']
        )
        return
      }
      
      // Start deployment
      updateLastAiMessage(
        'Starting deployment process... This may take a minute or two. Please keep this page open.',
        undefined,
        true
      )
      
      try {
        // Call the parent's deploy function
        const deployedAddress = await onDeployContract(
          selectedContract?.id || '',
          contractParameters
        )
        
        setDeployedAddress(deployedAddress)
        setCurrentStep('complete')
        
        updateLastAiMessage(
          `🎉 Deployment successful! Your ${selectedContract?.name} has been deployed to the blockchain.\n\n` +
          `Contract Address: ${deployedAddress}\n\n` +
          `What would you like to do next?`,
          ['Copy Address', 'View on Explorer', 'Deploy Another Contract']
        )
      } catch (error) {
        console.error('Deployment error:', error)
        
        // Check if it's a wallet connection error
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        if (errorMessage.includes('wallet') || errorMessage.includes('connect') || errorMessage.includes('signer')) {
          updateLastAiMessage(
            `There was an error with your wallet connection: ${errorMessage}\n\n` +
            `Would you like to try reconnecting your wallet?`,
            ['Reconnect Wallet', 'Try Again Later']
          )
        } else {
          updateLastAiMessage(
            `There was an error deploying your contract: ${errorMessage}\n\n` +
            `Would you like to try again?`,
            ['Try Again', 'Edit Parameters', 'Start Over']
          )
        }
      }
    } else if (input.includes('edit') || input.includes('change')) {
      // Go back to configuration step
      setCurrentStep('configure')
      setContractParameters({})
      updateLastAiMessage(
        `Let's reconfigure your ${selectedContract?.name}. What would you like to name it?`
      )
    } else if (input.includes('start') || input.includes('over')) {
      // Start over
      setCurrentStep('welcome')
      setSelectedContract(null)
      setContractParameters({})
      updateLastAiMessage(
        'Let\'s start over. What type of contract would you like to deploy?',
        ['ERC20 Token', 'Tax Token', 'LP Staking', 'Token Vault', 'NFT Collection', 'Show All Options']
      )
    } else if (input.includes('connect')) {
      // Connect wallet
      connect()
      updateLastAiMessage(
        'Connecting your wallet... Please approve the connection request in your wallet.',
        undefined,
        true
      )
    } else {
      updateLastAiMessage(
        'Would you like to proceed with deployment?',
        ['Deploy Now', 'Edit Parameters', 'Start Over']
      )
    }
  }
  
  // Handle post-deployment step
  const handlePostDeployment = (input: string) => {
    if (input.includes('copy') || input.includes('address')) {
      // Copy address to clipboard
      if (deployedAddress) {
        navigator.clipboard.writeText(deployedAddress)
        updateLastAiMessage(
          'Contract address copied to clipboard! What would you like to do next?',
          ['View on Explorer', 'Deploy Another Contract', 'Exit']
        )
      }
    } else if (input.includes('view') || input.includes('explorer')) {
      // Open block explorer
      if (deployedAddress) {
        window.open(`https://cronoscan.com/address/${deployedAddress}`, '_blank')
        updateLastAiMessage(
          'Opening block explorer in a new tab. What would you like to do next?',
          ['Deploy Another Contract', 'Exit']
        )
      }
    } else if (input.includes('deploy') || input.includes('another')) {
      // Start over
      setCurrentStep('welcome')
      setSelectedContract(null)
      setContractParameters({})
      setDeployedAddress(null)
      updateLastAiMessage(
        'Let\'s deploy another contract. What type of contract would you like to deploy?',
        ['ERC20 Token', 'Tax Token', 'LP Staking', 'Token Vault', 'NFT Collection', 'Show All Options']
      )
    } else {
      updateLastAiMessage(
        'What would you like to do next?',
        ['Copy Address', 'View on Explorer', 'Deploy Another Contract', 'Exit']
      )
    }
  }
  
  // Handle suggestion chip click
  const handleSuggestionClick = (suggestion: string) => {
    handleSubmit(suggestion)
  }
  
  // Handle token builder completion
  const handleTokenBuilderComplete = (tokenConfig: any) => {
    setShowTokenBuilder(false)
    
    // Add the token configuration to the contract parameters
    setContractParameters(tokenConfig)
    
    // Update the AI message to show the token configuration
    updateLastAiMessage(
      `Great! I've created your token with the following configuration:\n\n` +
      `- Name: ${tokenConfig.name}\n` +
      `- Symbol: ${tokenConfig.symbol}\n` +
      `- Total Supply: ${tokenConfig.totalSupply}\n` +
      `- Features: ${tokenConfig.features.map((f: any) => f.id).join(', ') || 'Standard ERC20'}\n\n` +
      `Would you like to deploy this token now?`,
      ['Deploy Now', 'Edit Parameters', 'Start Over']
    )
    
    setCurrentStep('deploy')
  }
  
  // Handle token builder cancellation
  const handleTokenBuilderCancel = () => {
    setShowTokenBuilder(false)
    
    // Update the AI message to ask what the user wants to do
    updateLastAiMessage(
      'No problem. What would you like to do instead?',
      ['Try a Different Token', 'Start Over', 'Show All Options']
    )
  }
  
  // Show token builder when user selects "Custom Token" or similar options
  const showTokenBuilderForCustomToken = (input: string) => {
    if (selectedContract && (selectedContract.id === 'erc20-token' || selectedContract.id === 'erc20-tax-token')) {
      if (input.toLowerCase().includes('custom') || input.toLowerCase().includes('advanced')) {
        setShowTokenBuilder(true)
        setTokenBuilderType(selectedContract.id)
      }
    }
  }
  
  // Process messages for custom token requests
  useEffect(() => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(m => m.type === 'user')
      if (lastUserMessage && selectedContract) {
        showTokenBuilderForCustomToken(lastUserMessage.content)
      }
    }
  }, [messages, selectedContract])
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`flex h-full w-full chat-transition ${isFullscreen ? 'fullscreen-chat' : ''} ${className}`}>
      {/* Sidebar - ChatGPT style */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            className="fixed inset-y-0 left-0 z-50 w-64 bg-[rgba(10,15,31,0.95)] backdrop-blur-xl border-r border-white/5 shadow-2xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex flex-col h-full">
              {/* Sidebar header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Contract Assistant</h2>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={toggleSidebar}
                  className="rounded-full w-8 h-8 p-0 flex items-center justify-center"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  }
                >
                  <span className="sr-only">Close sidebar</span>
                </Button>
              </div>
              
              {/* Sidebar content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Contract Types</h3>
                  {contractConfigs.map((contract) => (
                    <button
                      key={contract.id}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-white/80 hover:text-white transition-colors"
                      onClick={() => {
                        onSelectContractType(contract.id);
                        setSelectedContract(contract);
                        setCurrentStep('configure');
                        toggleSidebar();
                        
                        // Add a message about the selected contract
                        addMessage({
                          type: 'user',
                          content: `I want to deploy a ${contract.name}`
                        });
                        
                        // Generate configuration message
                        const configMessage = generateConfigurationMessage(contract);
                        addMessage({
                          type: 'ai',
                          content: configMessage.content,
                          options: configMessage.options
                        });
                      }}
                    >
                      {contract.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Sidebar footer */}
              <div className="p-4 border-t border-white/5">
                {!isConnected ? (
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={connect}
                    className="w-full"
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    }
                  >
                    Connect Wallet
                  </Button>
                ) : (
                  <div className="text-sm text-white/70 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main chat container */}
      <div className="flex flex-col w-full h-full">
        {showTokenBuilder ? (
          <TokenBuilder 
            onComplete={handleTokenBuilderComplete}
            onCancel={handleTokenBuilderCancel}
          />
        ) : (
          <>
            {/* Chat header */}
            <div className="h-14 border-b border-gray-800 flex items-center px-4 bg-[rgba(10,15,31,0.85)] backdrop-blur-xl z-10">
              <Button
                variant="glass"
                size="sm"
                onClick={toggleSidebar}
                className="rounded-full w-8 h-8 p-0 flex items-center justify-center mr-3"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                }
              >
                <span className="sr-only">Menu</span>
              </Button>
              
              <h1 className="text-lg font-medium text-white">AI Contract Assistant</h1>
              
              <div className="ml-auto flex items-center">
                <Button
                  variant="glass"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="rounded-full w-8 h-8 p-0 flex items-center justify-center"
                  icon={
                    isFullscreen ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                      </svg>
                    )
                  }
                >
                  <span className="sr-only">{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</span>
                </Button>
              </div>
            </div>
            
            {/* Messages container */}
            <div className="flex-1 overflow-y-auto py-4 px-4 space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MessageBubble
                      message={message}
                      onOptionClick={handleSuggestionClick}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input area - fixed at bottom */}
            <div className="border-t border-gray-800 bg-[rgba(10,15,31,0.85)] backdrop-blur-xl p-3">
              {/* Suggestion chips */}
              {messages.length > 0 && messages[messages.length - 1].options && (
                <div className="mb-3">
                  <SuggestionChips
                    suggestions={messages[messages.length - 1].options || []}
                    onSuggestionClick={handleSuggestionClick}
                  />
                </div>
              )}
              
              <InputArea
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleSubmit}
                isProcessing={isProcessing}
                disabled={isProcessing || currentStep === 'complete'}
                placeholder="Type your message..."
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
