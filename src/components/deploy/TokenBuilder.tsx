'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/button'

interface TokenParameter {
  id: string
  name: string
  type: 'text' | 'number' | 'boolean' | 'select'
  value: string | number | boolean
  options?: { value: string; label: string }[]
  description: string
  required: boolean
  min?: number
  max?: number
  step?: number
}

interface TokenFeature {
  id: string
  name: string
  description: string
  enabled: boolean
  parameters: TokenParameter[]
}

interface TokenBuilderProps {
  onComplete: (tokenConfig: any) => void
  onCancel: () => void
}

export function TokenBuilder({ onComplete, onCancel }: TokenBuilderProps) {
  // Basic token parameters
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [totalSupply, setTotalSupply] = useState('1000000')
  const [decimals, setDecimals] = useState(18)
  
  // Available token features
  const [features, setFeatures] = useState<TokenFeature[]>([
    {
      id: 'tax',
      name: 'Transaction Tax',
      description: 'Apply a tax on buy/sell transactions that can be used for liquidity, marketing, or development',
      enabled: false,
      parameters: [
        {
          id: 'buyTax',
          name: 'Buy Tax (%)',
          type: 'number',
          value: 5,
          description: 'Percentage tax applied to buy transactions',
          required: true,
          min: 0,
          max: 25,
          step: 0.1
        },
        {
          id: 'sellTax',
          name: 'Sell Tax (%)',
          type: 'number',
          value: 5,
          description: 'Percentage tax applied to sell transactions',
          required: true,
          min: 0,
          max: 25,
          step: 0.1
        },
        {
          id: 'liquidityShare',
          name: 'Liquidity Share (%)',
          type: 'number',
          value: 50,
          description: 'Percentage of tax allocated to liquidity',
          required: true,
          min: 0,
          max: 100,
          step: 1
        },
        {
          id: 'marketingShare',
          name: 'Marketing Share (%)',
          type: 'number',
          value: 50,
          description: 'Percentage of tax allocated to marketing',
          required: true,
          min: 0,
          max: 100,
          step: 1
        }
      ]
    },
    {
      id: 'antibot',
      name: 'Anti-Bot Protection',
      description: 'Prevent bots from sniping tokens at launch with transaction limits and blacklisting',
      enabled: false,
      parameters: [
        {
          id: 'maxTxAmount',
          name: 'Max Transaction Amount (%)',
          type: 'number',
          value: 1,
          description: 'Maximum transaction amount as percentage of total supply',
          required: true,
          min: 0.1,
          max: 100,
          step: 0.1
        },
        {
          id: 'maxWalletAmount',
          name: 'Max Wallet Amount (%)',
          type: 'number',
          value: 2,
          description: 'Maximum wallet amount as percentage of total supply',
          required: true,
          min: 0.1,
          max: 100,
          step: 0.1
        },
        {
          id: 'enableBlacklist',
          name: 'Enable Blacklist',
          type: 'boolean',
          value: true,
          description: 'Allow blacklisting of bot addresses',
          required: true
        }
      ]
    },
    {
      id: 'reflection',
      name: 'Reflection Rewards',
      description: 'Automatically redistribute a portion of each transaction to all token holders',
      enabled: false,
      parameters: [
        {
          id: 'reflectionPercentage',
          name: 'Reflection Percentage (%)',
          type: 'number',
          value: 2,
          description: 'Percentage of each transaction redistributed to holders',
          required: true,
          min: 1,
          max: 10,
          step: 0.1
        },
        {
          id: 'minHoldingForReflection',
          name: 'Minimum Holding for Reflection (%)',
          type: 'number',
          value: 0.01,
          description: 'Minimum percentage of total supply required to receive reflections',
          required: true,
          min: 0,
          max: 1,
          step: 0.001
        }
      ]
    },
    {
      id: 'liquidity',
      name: 'Auto-Liquidity',
      description: 'Automatically add to liquidity pool on each transaction to increase price stability',
      enabled: false,
      parameters: [
        {
          id: 'autoLiquidityPercentage',
          name: 'Auto-Liquidity Percentage (%)',
          type: 'number',
          value: 3,
          description: 'Percentage of each transaction added to liquidity',
          required: true,
          min: 1,
          max: 10,
          step: 0.1
        },
        {
          id: 'liquidityThreshold',
          name: 'Liquidity Threshold',
          type: 'number',
          value: 0.1,
          description: 'Percentage of total supply to accumulate before adding to liquidity',
          required: true,
          min: 0.01,
          max: 1,
          step: 0.01
        }
      ]
    },
    {
      id: 'timelock',
      name: 'Timelock',
      description: 'Lock contract functions behind a timelock for enhanced security and trust',
      enabled: false,
      parameters: [
        {
          id: 'timelockDelay',
          name: 'Timelock Delay (hours)',
          type: 'number',
          value: 24,
          description: 'Hours to wait before executing timelocked functions',
          required: true,
          min: 1,
          max: 72,
          step: 1
        },
        {
          id: 'timelockFunctions',
          name: 'Functions to Timelock',
          type: 'select',
          value: 'all',
          options: [
            { value: 'all', label: 'All Admin Functions' },
            { value: 'tax', label: 'Tax Changes Only' },
            { value: 'ownership', label: 'Ownership Transfer Only' }
          ],
          description: 'Which functions should be behind the timelock',
          required: true
        }
      ]
    }
  ])
  
  // Current step in the token builder
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
  
  // Generated Solidity code
  const [generatedCode, setGeneratedCode] = useState('')
  
  // Toggle a feature on/off
  const toggleFeature = (featureId: string) => {
    setFeatures(prev => prev.map(feature => 
      feature.id === featureId 
        ? { ...feature, enabled: !feature.enabled } 
        : feature
    ))
  }
  
  // Update a parameter value
  const updateParameterValue = (featureId: string, parameterId: string, value: string | number | boolean) => {
    setFeatures(prev => prev.map(feature => 
      feature.id === featureId 
        ? {
            ...feature,
            parameters: feature.parameters.map(param => 
              param.id === parameterId 
                ? { ...param, value } 
                : param
            )
          } 
        : feature
    ))
  }
  
  // Generate Solidity code based on selected features and parameters
  useEffect(() => {
    if (currentStep === 3) {
      generateSolidityCode()
    }
  }, [currentStep, features])
  
  const generateSolidityCode = () => {
    // Start with the basic token contract
    let code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
${features.find(f => f.id === 'tax' && f.enabled) ? 'import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";\nimport "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";\n' : ''}

contract ${tokenName.replace(/\s+/g, '')} is ERC20, Ownable {
    ${generateTokenVariables()}
    
    constructor() ERC20("${tokenName}", "${tokenSymbol}") {
        _mint(msg.sender, ${totalSupply} * 10**${decimals});
        ${features.find(f => f.id === 'tax' && f.enabled) ? '_initializeUniswapRouter();' : ''}
    }
    
    ${generateTokenFunctions()}
}`;
    
    setGeneratedCode(code)
  }
  
  // Generate token variables based on selected features
  const generateTokenVariables = () => {
    let variables = []
    
    // Tax feature variables
    if (features.find(f => f.id === 'tax' && f.enabled)) {
      const taxFeature = features.find(f => f.id === 'tax')!
      const buyTax = taxFeature.parameters.find(p => p.id === 'buyTax')!.value
      const sellTax = taxFeature.parameters.find(p => p.id === 'sellTax')!.value
      
      variables.push(`uint256 public buyTax = ${buyTax};`)
      variables.push(`uint256 public sellTax = ${sellTax};`)
      variables.push(`address public marketingWallet;`)
      variables.push(`IUniswapV2Router02 public uniswapV2Router;`)
      variables.push(`address public uniswapV2Pair;`)
      variables.push(`bool private swapping;`)
      variables.push(`uint256 public swapTokensAtAmount = totalSupply() * 5 / 10000; // 0.05%`)
    }
    
    // Anti-bot feature variables
    if (features.find(f => f.id === 'antibot' && f.enabled)) {
      const antibotFeature = features.find(f => f.id === 'antibot')!
      const maxTxAmount = antibotFeature.parameters.find(p => p.id === 'maxTxAmount')!.value
      const maxWalletAmount = antibotFeature.parameters.find(p => p.id === 'maxWalletAmount')!.value
      
      variables.push(`uint256 public maxTxAmount = totalSupply() * ${maxTxAmount} / 100;`)
      variables.push(`uint256 public maxWalletAmount = totalSupply() * ${maxWalletAmount} / 100;`)
      
      if (antibotFeature.parameters.find(p => p.id === 'enableBlacklist')!.value) {
        variables.push(`mapping(address => bool) public isBlacklisted;`)
      }
    }
    
    // Reflection feature variables
    if (features.find(f => f.id === 'reflection' && f.enabled)) {
      const reflectionFeature = features.find(f => f.id === 'reflection')!
      const reflectionPercentage = reflectionFeature.parameters.find(p => p.id === 'reflectionPercentage')!.value
      
      variables.push(`uint256 public reflectionFee = ${reflectionPercentage};`)
      variables.push(`uint256 private _totalReflections;`)
      variables.push(`mapping(address => uint256) private _reflectionBalance;`)
    }
    
    // Timelock feature variables
    if (features.find(f => f.id === 'timelock' && f.enabled)) {
      const timelockFeature = features.find(f => f.id === 'timelock')!
      const timelockDelay = timelockFeature.parameters.find(p => p.id === 'timelockDelay')!.value
      
      variables.push(`uint256 public constant TIMELOCK_DELAY = ${timelockDelay} hours;`)
      variables.push(`mapping(bytes32 => uint256) public timelockExpiry;`)
    }
    
    return variables.join('\n    ')
  }
  
  // Generate token functions based on selected features
  const generateTokenFunctions = () => {
    let functions = []
    
    // Override transfer function if needed
    if (features.some(f => (f.id === 'tax' || f.id === 'antibot' || f.id === 'reflection') && f.enabled)) {
      functions.push(`
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        ${features.find(f => f.id === 'antibot' && f.enabled && f.parameters.find(p => p.id === 'enableBlacklist')!.value) ? 
        'require(!isBlacklisted[from] && !isBlacklisted[to], "Address is blacklisted");' : ''}
        
        ${features.find(f => f.id === 'antibot' && f.enabled) ? `
        if (from != owner() && to != owner()) {
            require(amount <= maxTxAmount, "Transfer amount exceeds the maxTxAmount.");
            
            if (to != address(uniswapV2Router) && to != uniswapV2Pair) {
                require(balanceOf(to) + amount <= maxWalletAmount, "Transfer amount exceeds the maxWalletAmount.");
            }
        }` : ''}
        
        // Handle tax and liquidity logic
        ${features.find(f => f.id === 'tax' && f.enabled) ? generateTaxLogic() : 'super._transfer(from, to, amount);'}
    }`);
    }
    
    // Tax and liquidity functions
    if (features.find(f => f.id === 'tax' && f.enabled)) {
      functions.push(`
    function _initializeUniswapRouter() private {
        // Initialize with Uniswap V2 Router
        IUniswapV2Router02 _uniswapV2Router = IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D); // Ethereum Mainnet
        uniswapV2Pair = IUniswapV2Factory(_uniswapV2Router.factory())
            .createPair(address(this), _uniswapV2Router.WETH());
        uniswapV2Router = _uniswapV2Router;
    }
    
    function setMarketingWallet(address _marketingWallet) external onlyOwner {
        ${features.find(f => f.id === 'timelock' && f.enabled) ? generateTimelockCheck('setMarketingWallet') : ''}
        marketingWallet = _marketingWallet;
    }
    
    function setBuyTax(uint256 _buyTax) external onlyOwner {
        ${features.find(f => f.id === 'timelock' && f.enabled) ? generateTimelockCheck('setBuyTax') : ''}
        require(_buyTax <= 25, "Buy tax cannot exceed 25%");
        buyTax = _buyTax;
    }
    
    function setSellTax(uint256 _sellTax) external onlyOwner {
        ${features.find(f => f.id === 'timelock' && f.enabled) ? generateTimelockCheck('setSellTax') : ''}
        require(_sellTax <= 25, "Sell tax cannot exceed 25%");
        sellTax = _sellTax;
    }`);
    }
    
    // Anti-bot functions
    if (features.find(f => f.id === 'antibot' && f.enabled)) {
      functions.push(`
    function setMaxTxAmount(uint256 _maxTxAmount) external onlyOwner {
        ${features.find(f => f.id === 'timelock' && f.enabled) ? generateTimelockCheck('setMaxTxAmount') : ''}
        maxTxAmount = _maxTxAmount;
    }
    
    function setMaxWalletAmount(uint256 _maxWalletAmount) external onlyOwner {
        ${features.find(f => f.id === 'timelock' && f.enabled) ? generateTimelockCheck('setMaxWalletAmount') : ''}
        maxWalletAmount = _maxWalletAmount;
    }`);
      
      if (features.find(f => f.id === 'antibot')!.parameters.find(p => p.id === 'enableBlacklist')!.value) {
        functions.push(`
    function blacklistAddress(address account, bool value) external onlyOwner {
        ${features.find(f => f.id === 'timelock' && f.enabled) ? generateTimelockCheck('blacklistAddress') : ''}
        isBlacklisted[account] = value;
    }`);
      }
    }
    
    // Timelock functions
    if (features.find(f => f.id === 'timelock' && f.enabled)) {
      functions.push(`
    function createTimelock(string memory functionName) internal returns (bytes32) {
        bytes32 functionHash = keccak256(abi.encodePacked(functionName));
        timelockExpiry[functionHash] = block.timestamp + TIMELOCK_DELAY;
        return functionHash;
    }
    
    function checkTimelock(string memory functionName) internal view returns (bool) {
        bytes32 functionHash = keccak256(abi.encodePacked(functionName));
        return timelockExpiry[functionHash] != 0 && timelockExpiry[functionHash] <= block.timestamp;
    }`);
    }
    
    return functions.join('\n    ')
  }
  
  // Generate tax logic for the _transfer function
  const generateTaxLogic = () => {
    const taxFeature = features.find(f => f.id === 'tax' && f.enabled)!
    const liquidityShare = taxFeature.parameters.find(p => p.id === 'liquidityShare')!.value
    const marketingShare = taxFeature.parameters.find(p => p.id === 'marketingShare')!.value
    
    return `
        // Check if we're in a swap already to prevent reentrance
        if (swapping) {
            super._transfer(from, to, amount);
            return;
        }
        
        uint256 contractTokenBalance = balanceOf(address(this));
        bool canSwap = contractTokenBalance >= swapTokensAtAmount;
        
        // Swap tokens for ETH if we have enough tokens and we're not in a swap
        if (canSwap && 
            !swapping && 
            from != uniswapV2Pair && 
            from != owner() && 
            to != owner()
        ) {
            swapping = true;
            
            // Split the contract balance according to shares
            uint256 liquidityTokens = contractTokenBalance * ${liquidityShare} / 100;
            uint256 marketingTokens = contractTokenBalance * ${marketingShare} / 100;
            
            // Swap and add liquidity
            swapAndLiquify(liquidityTokens);
            
            // Swap and send to marketing wallet
            swapAndSendToMarketing(marketingTokens);
            
            swapping = false;
        }
        
        bool takeFee = !swapping;
        
        // If any account belongs to owner or contract, remove the fee
        if (from == owner() || to == owner() || from == address(this)) {
            takeFee = false;
        }
        
        if (takeFee) {
            uint256 fees;
            
            // Buy transaction
            if (from == uniswapV2Pair) {
                fees = amount * buyTax / 100;
            }
            // Sell transaction
            else if (to == uniswapV2Pair) {
                fees = amount * sellTax / 100;
            }
            
            if (fees > 0) {
                super._transfer(from, address(this), fees);
                amount = amount - fees;
            }
        }
        
        super._transfer(from, to, amount);
        ${features.find(f => f.id === 'reflection' && f.enabled) ? generateReflectionLogic() : ''}`;
  }
  
  // Generate reflection logic
  const generateReflectionLogic = () => {
    return `
        // Handle reflections
        if (!swapping && takeFee) {
            uint256 reflectionAmount = fees * reflectionFee / 100;
            _totalReflections += reflectionAmount;
            
            // Update reflection balances for sender and receiver
            _reflectionBalance[from] = _reflectionBalance[from] * balanceOf(from) / (balanceOf(from) + reflectionAmount);
            _reflectionBalance[to] = _reflectionBalance[to] * balanceOf(to) / (balanceOf(to) + reflectionAmount);
        }`;
  }
  
  // Generate timelock check for a function
  const generateTimelockCheck = (functionName: string) => {
    const timelockFeature = features.find(f => f.id === 'timelock' && f.enabled)!
    const timelockFunctions = timelockFeature.parameters.find(p => p.id === 'timelockFunctions')!.value
    
    // Check if this function should be timelocked
    if (timelockFunctions === 'all' || 
        (timelockFunctions === 'tax' && (functionName.includes('Tax') || functionName.includes('Fee'))) ||
        (timelockFunctions === 'ownership' && functionName.includes('Owner'))) {
      return `
        if (!checkTimelock("${functionName}")) {
            createTimelock("${functionName}");
            return;
        }`;
    }
    
    return '';
  }
  
  // Handle form submission
  const handleSubmit = () => {
    // Collect all token configuration
    const tokenConfig = {
      name: tokenName,
      symbol: tokenSymbol,
      totalSupply: totalSupply,
      decimals: decimals,
      features: features.filter(f => f.enabled).map(f => ({
        id: f.id,
        parameters: f.parameters.reduce((acc, param) => {
          acc[param.id] = param.value
          return acc
        }, {} as Record<string, any>)
      })),
      solidityCode: generatedCode
    }
    
    onComplete(tokenConfig)
  }
  
  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfoStep()
      case 2:
        return renderFeaturesStep()
      case 3:
        return renderPreviewStep()
      default:
        return null
    }
  }
  
  // Step 1: Basic token information
  const renderBasicInfoStep = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold mb-4">Basic Token Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">Token Name</label>
            <input
              type="text"
              className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              placeholder="My Token"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              required
            />
            <p className="mt-1 text-xs text-gray-400">The full name of your token (e.g., "Ethereum")</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-1">Token Symbol</label>
            <input
              type="text"
              className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              placeholder="MTK"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              required
            />
            <p className="mt-1 text-xs text-gray-400">The ticker symbol for your token (e.g., "ETH")</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-1">Total Supply</label>
            <input
              type="text"
              className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              placeholder="1000000"
              value={totalSupply}
              onChange={(e) => setTotalSupply(e.target.value)}
              required
            />
            <p className="mt-1 text-xs text-gray-400">The total number of tokens to create</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-1">Decimals</label>
            <input
              type="number"
              className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              placeholder="18"
              value={decimals}
              onChange={(e) => setDecimals(parseInt(e.target.value))}
              min={0}
              max={18}
              required
            />
            <p className="mt-1 text-xs text-gray-400">Number of decimal places (usually 18 for ERC20 tokens)</p>
          </div>
        </div>
      </div>
    )
  }
  
  // Step 2: Token features
  const renderFeaturesStep = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold mb-4">Token Features</h2>
        <p className="text-gray-300 text-sm mb-6">Select the features you want to include in your token:</p>
        
        <div className="space-y-6">
          {features.map((feature) => (
            <GlassCard key={feature.id} className="p-4" variant="dark">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold">{feature.name}</h3>
                    <div className="ml-2 px-2 py-0.5 bg-blue-500/20 rounded-full text-xs text-blue-300">
                      {feature.id === 'tax' ? 'Popular' : feature.id === 'antibot' ? 'Security' : 'Advanced'}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{feature.description}</p>
                </div>
                
                <div className="ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={feature.enabled}
                      onChange={() => toggleFeature(feature.id)}
                    />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              
              {/* Feature parameters */}
              {feature.enabled && (
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Configure Parameters:</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {feature.parameters.map((param) => (
                      <div key={param.id}>
                        <label className="block text-sm font-medium text-white mb-1">{param.name}</label>
                        
                        {param.type === 'text' && (
                          <input
                            type="text"
                            className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-2 text-white text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                            value={param.value as string}
                            onChange={(e) => updateParameterValue(feature.id, param.id, e.target.value)}
                            required={param.required}
                          />
                        )}
                        
                        {param.type === 'number' && (
                          <input
                            type="number"
                            className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-2 text-white text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                            value={param.value as number}
                            onChange={(e) => updateParameterValue(feature.id, param.id, parseFloat(e.target.value))}
                            min={param.min}
                            max={param.max}
                            step={param.step}
                            required={param.required}
                          />
                        )}
                        
                        {param.type === 'boolean' && (
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={param.value as boolean}
                              onChange={(e) => updateParameterValue(feature.id, param.id, e.target.checked)}
                            />
                            <div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm text-gray-300">{param.value ? 'Enabled' : 'Disabled'}</span>
                          </label>
                        )}
                        
                        {param.type === 'select' && param.options && (
                          <select
                            className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-2 text-white text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                            value={param.value as string}
                            onChange={(e) => updateParameterValue(feature.id, param.id, e.target.value)}
                            required={param.required}
                          >
                            {param.options.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}
                        
                        <p className="mt-1 text-xs text-gray-400">{param.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      </div>
    )
  }
  
  // Step 3: Preview and code generation
  const renderPreviewStep = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold mb-4">Token Preview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <GlassCard className="p-4" variant="dark">
            <h3 className="text-lg font-semibold mb-3">Token Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Name:</span>
                <span className="text-white font-medium">{tokenName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Symbol:</span>
                <span className="text-white font-medium">{tokenSymbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Supply:</span>
                <span className="text-white font-medium">{totalSupply}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Decimals:</span>
                <span className="text-white font-medium">{decimals}</span>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-4" variant="dark">
            <h3 className="text-lg font-semibold mb-3">Enabled Features</h3>
            {features.filter(f => f.enabled).length > 0 ? (
              <ul className="space-y-2">
                {features.filter(f => f.enabled).map(feature => (
                  <li key={feature.id} className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="text-white font-medium">{feature.name}</span>
                      <div className="text-xs text-gray-400 mt-1">
                        {feature.parameters.map(param => (
                          <div key={param.id}>
                            {param.name}: <span className="text-blue-300">{param.value.toString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm">No features enabled. This will be a standard ERC20 token.</p>
            )}
          </GlassCard>
        </div>
        
        <GlassCard className="p-4" variant="dark">
          <h3 className="text-lg font-semibold mb-3">Generated Solidity Code</h3>
          <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-80">
            <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
              {generatedCode}
            </pre>
          </div>
        </GlassCard>
      </div>
    )
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  currentStep > index + 1 
                    ? 'bg-green-500 text-white' 
                    : currentStep === index + 1 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {currentStep > index + 1 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className={`text-sm ${currentStep >= index + 1 ? 'text-white' : 'text-gray-500'}`}>
                {index === 0 ? 'Basic Info' : index === 1 ? 'Features' : 'Preview'}
              </span>
            </div>
          ))}
        </div>
        <div className="relative mt-2">
          <div className="absolute h-1 bg-gray-700 top-0 left-5 right-5"></div>
          <div 
            className="absolute h-1 bg-blue-500 top-0 left-5 transition-all duration-300 ease-in-out"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Current step content */}
      <GlassCard className="p-6" variant="dark">
        {renderStep()}
        
        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="glass"
            onClick={() => {
              if (currentStep === 1) {
                onCancel()
              } else {
                setCurrentStep(currentStep - 1)
              }
            }}
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>
          
          <Button
            variant="primary"
            onClick={() => {
              if (currentStep < totalSteps) {
                setCurrentStep(currentStep + 1)
              } else {
                handleSubmit()
              }
            }}
            disabled={
              (currentStep === 1 && (!tokenName || !tokenSymbol || !totalSupply))
            }
          >
            {currentStep < totalSteps ? 'Continue' : 'Create Token'}
          </Button>
        </div>
      </GlassCard>
    </div>
  )
}
