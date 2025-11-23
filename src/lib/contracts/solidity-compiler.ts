'use client'

import * as solc from 'solc'

/**
 * Interface for compilation result
 */
export interface CompilationResult {
  success: boolean
  abi?: any
  bytecode?: string
  error?: string
}

/**
 * Compile Solidity source code
 * @param sourceCode Solidity source code
 * @param contractName Name of the contract to compile (defaults to the first contract found)
 * @returns Compilation result with ABI and bytecode
 */
export async function compileSolidity(sourceCode: string, contractName?: string): Promise<CompilationResult> {
  try {
    // Create input object for solc
    const input = {
      language: 'Solidity',
      sources: {
        'contract.sol': {
          content: sourceCode
        }
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['abi', 'evm.bytecode.object']
          }
        },
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: 'london',
        // Add remappings for OpenZeppelin contracts
        remappings: [
          '@openzeppelin/=node_modules/@openzeppelin/'
        ]
      }
    }

    // Load the solc compiler
    // Note: In a production environment, you might want to use a specific version
    // and implement a proper caching mechanism
    console.log('Compiling Solidity code...')
    
    // Compile the contract
    const output = JSON.parse(solc.compile(JSON.stringify(input)))
    
    // Check for compilation errors
    if (output.errors) {
      const errorMessages = output.errors
        .filter((error: any) => error.severity === 'error')
        .map((error: any) => error.formattedMessage)
        .join('\n')
      
      if (errorMessages) {
        console.error('Compilation errors:', errorMessages)
        return {
          success: false,
          error: errorMessages
        }
      }
    }
    
    // Get the contract output
    const contracts = output.contracts['contract.sol']
    
    // If contractName is provided, use it; otherwise, use the first contract
    const contractOutput = contractName && contracts[contractName] 
      ? contracts[contractName] 
      : contracts[Object.keys(contracts)[0]]
    
    if (!contractOutput) {
      return {
        success: false,
        error: 'No contract output found'
      }
    }
    
    // Extract ABI and bytecode
    const abi = contractOutput.abi
    const bytecode = contractOutput.evm.bytecode.object
    
    if (!abi || !bytecode) {
      return {
        success: false,
        error: 'Failed to extract ABI or bytecode'
      }
    }
    
    return {
      success: true,
      abi,
      bytecode: '0x' + bytecode // Add 0x prefix for ethers.js
    }
  } catch (error) {
    console.error('Error compiling Solidity code:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Extract contract name from Solidity source code
 * @param sourceCode Solidity source code
 * @returns Contract name or undefined if not found
 */
export function extractContractName(sourceCode: string): string | undefined {
  // Simple regex to extract contract name
  // This is a basic implementation and might not work for all cases
  const contractMatch = sourceCode.match(/contract\s+([a-zA-Z0-9_]+)/);
  return contractMatch ? contractMatch[1] : undefined;
}

/**
 * Check if Solidity code contains imports
 * @param sourceCode Solidity source code
 * @returns True if code contains imports
 */
export function hasImports(sourceCode: string): boolean {
  return sourceCode.includes('import ');
}

/**
 * Add OpenZeppelin imports to Solidity code
 * @param sourceCode Solidity source code
 * @returns Modified source code with imports
 */
export function addOpenZeppelinImports(sourceCode: string): string {
  // This is a simplified implementation
  // In a production environment, you would need to handle imports properly
  
  // Check if code already has imports
  if (hasImports(sourceCode)) {
    return sourceCode;
  }
  
  // Add common OpenZeppelin imports based on contract type
  let imports = '';
  
  if (sourceCode.includes('ERC20')) {
    imports += 'import "@openzeppelin/contracts/token/ERC20/ERC20.sol";\n';
    imports += 'import "@openzeppelin/contracts/access/Ownable.sol";\n';
    
    if (sourceCode.includes('tax') || sourceCode.includes('fee')) {
      imports += 'import "@openzeppelin/contracts/utils/math/SafeMath.sol";\n';
    }
  } else if (sourceCode.includes('ERC721')) {
    imports += 'import "@openzeppelin/contracts/token/ERC721/ERC721.sol";\n';
    imports += 'import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";\n';
    imports += 'import "@openzeppelin/contracts/access/Ownable.sol";\n';
  } else if (sourceCode.includes('staking') || sourceCode.includes('Staking')) {
    imports += 'import "@openzeppelin/contracts/token/ERC20/IERC20.sol";\n';
    imports += 'import "@openzeppelin/contracts/access/Ownable.sol";\n';
    imports += 'import "@openzeppelin/contracts/security/ReentrancyGuard.sol";\n';
  }
  
  // Add pragma statement if not present
  if (!sourceCode.includes('pragma solidity')) {
    imports = 'pragma solidity ^0.8.0;\n\n' + imports;
  }
  
  return imports + sourceCode;
}

/**
 * Create a standalone contract with inline OpenZeppelin dependencies
 * This is a fallback for when the import resolution doesn't work in the browser
 * @param sourceCode Original Solidity source code
 * @returns Standalone Solidity code with inline dependencies
 */
export function createStandaloneContract(sourceCode: string): string {
  // If the code already has imports, try to compile it as is first
  if (hasImports(sourceCode)) {
    return sourceCode;
  }
  
  // Add basic ERC20 implementation if needed
  if (sourceCode.includes('ERC20') && !sourceCode.includes('contract ERC20')) {
    const standaloneCode = `
pragma solidity ^0.8.0;

// Simplified ERC20 implementation
contract ERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;
    uint8 private _decimals;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
        _decimals = 18;
    }
    
    function name() public view virtual returns (string memory) {
        return _name;
    }
    
    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }
    
    function decimals() public view virtual returns (uint8) {
        return _decimals;
    }
    
    function totalSupply() public view virtual returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address account) public view virtual returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address to, uint256 amount) public virtual returns (bool) {
        address owner = msg.sender;
        _transfer(owner, to, amount);
        return true;
    }
    
    function allowance(address owner, address spender) public view virtual returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function approve(address spender, uint256 amount) public virtual returns (bool) {
        address owner = msg.sender;
        _approve(owner, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) public virtual returns (bool) {
        address spender = msg.sender;
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }
    
    function _transfer(address from, address to, uint256 amount) internal virtual {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        
        _beforeTokenTransfer(from, to, amount);
        
        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            _balances[from] = fromBalance - amount;
        }
        _balances[to] += amount;
        
        emit Transfer(from, to, amount);
        
        _afterTokenTransfer(from, to, amount);
    }
    
    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");
        
        _beforeTokenTransfer(address(0), account, amount);
        
        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
        
        _afterTokenTransfer(address(0), account, amount);
    }
    
    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");
        
        _beforeTokenTransfer(account, address(0), amount);
        
        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
        }
        _totalSupply -= amount;
        
        emit Transfer(account, address(0), amount);
        
        _afterTokenTransfer(account, address(0), amount);
    }
    
    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
    
    function _spendAllowance(address owner, address spender, uint256 amount) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual {}
    
    function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual {}
}

// Simplified Ownable implementation
abstract contract Ownable {
    address private _owner;
    
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    constructor() {
        _transferOwnership(msg.sender);
    }
    
    function owner() public view virtual returns (address) {
        return _owner;
    }
    
    modifier onlyOwner() {
        require(owner() == msg.sender, "Ownable: caller is not the owner");
        _;
    }
    
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }
    
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }
    
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

${sourceCode}
`;
    return standaloneCode;
  }
  
  return sourceCode;
}

/**
 * Prepare Solidity code for compilation
 * @param sourceCode Original Solidity source code
 * @returns Prepared Solidity code
 */
export function prepareSolidityCode(sourceCode: string): string {
  // Ensure code has pragma statement
  let preparedCode = sourceCode;
  if (!preparedCode.includes('pragma solidity')) {
    preparedCode = 'pragma solidity ^0.8.0;\n\n' + preparedCode;
  }
  
  // Add OpenZeppelin imports if needed and if the code doesn't already have imports
  if (!hasImports(preparedCode)) {
    preparedCode = addOpenZeppelinImports(preparedCode);
    
    // Also create a standalone version as a fallback
    try {
      const standaloneCode = createStandaloneContract(sourceCode);
      
      // Store the standalone code for fallback use
      if (typeof window !== 'undefined') {
        (window as any).__standaloneContractCode = standaloneCode;
      }
    } catch (error) {
      console.warn('Error creating standalone version:', error);
    }
  }
  
  return preparedCode;
}

/**
 * Try to compile with fallback if initial compilation fails
 * @param sourceCode Solidity source code
 * @param contractName Name of the contract to compile
 * @returns Compilation result
 */
export async function compileWithFallback(sourceCode: string, contractName?: string): Promise<CompilationResult> {
  // First try to compile with imports
  const result = await compileSolidity(sourceCode, contractName);
  
  // If compilation fails and we have a standalone version, try that
  if (!result.success && typeof window !== 'undefined' && (window as any).__standaloneContractCode) {
    console.log('Initial compilation failed, trying with standalone version...');
    return compileSolidity((window as any).__standaloneContractCode, contractName);
  }
  
  // If compilation still fails, try with a standalone version created on the fly
  if (!result.success) {
    console.log('Initial compilation failed, creating standalone version on the fly...');
    const standaloneCode = createStandaloneContract(sourceCode);
    return compileSolidity(standaloneCode, contractName);
  }
  
  return result;
}
