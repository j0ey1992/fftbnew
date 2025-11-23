# Smart Contract Deployment System

This directory contains the implementation of the smart contract deployment system for the Roo Finance platform. The system allows users to deploy various types of smart contracts to the blockchain using AI-generated code.

## Overview

The contract deployment system consists of the following components:

1. **Contract Deployment Service** (`deploy-contract.ts`):
   - Generates smart contract code using the DeepSeek AI API
   - Deploys the generated contract to the blockchain using ethers.js and Reown
   - Saves the deployed contract information to Firebase

2. **API Endpoints**:
   - `/api/contracts/save`: Saves deployed contracts to Firebase
   - `/api/contracts/user`: Fetches user's deployed contracts from Firebase

3. **UI Components**:
   - `UserDeployedContracts`: Displays user's deployed contracts
   - `DeploymentTester`: Testing component for contract deployment
   - `AIChatInterface`: Chat interface for interacting with the AI assistant

## Supported Contract Types

The system supports deploying the following types of contracts:

- ERC20 Token
- Tax Token
- LP Staking
- Token Staking
- NFT Staking
- Token Vault
- NFT Collection (ERC721)

## How It Works

1. The user interacts with the AI assistant through the chat interface
2. The AI assistant extracts deployment parameters from the user's input
3. The system generates smart contract code based on the parameters
4. The contract is deployed to the blockchain using the user's wallet
5. The deployed contract information is saved to Firebase
6. The user can view their deployed contracts in the UI

## Testing

To test the contract deployment functionality, visit the `/deploy/test` page. This page provides a simple interface for testing the contract deployment process.

### Prerequisites

- Metamask or another Web3 wallet installed
- CRO tokens for gas fees (on Cronos network)

### Test Steps

1. Connect your wallet
2. Select a contract type
3. Click "Test Deployment"
4. Approve the transaction in your wallet
5. View the deployed contract address

## Implementation Details

### Contract Generation

Smart contract code is generated using the DeepSeek AI API. The system provides a prompt with the contract type and parameters, and the API returns the generated code.

```typescript
export async function generateSmartContract(
  contractType: string,
  parameters: Record<string, any>
): Promise<string> {
  const systemPrompt = `You are an expert Solidity developer...`;
  let prompt = `Generate a complete Solidity smart contract for a ${contractType}...`;
  
  // Add parameters to the prompt
  Object.entries(parameters).forEach(([key, value]) => {
    prompt += `- ${key}: ${value}\n`;
  });
  
  return generateAIResponse(prompt, systemPrompt, { temperature: 0.2 });
}
```

### Contract Deployment

Contracts are deployed using ethers.js and the Reown wallet connection. The system compiles the generated code and deploys it to the blockchain.

```typescript
async function deployCompiledContract(
  abi: any,
  bytecode: string,
  signer: ethers.Signer,
  parameters: Record<string, any>
): Promise<ethers.Contract> {
  // Create contract factory
  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  
  // Extract constructor parameters
  const constructorParams = extractConstructorParams(abi, parameters);
  
  // Deploy the contract
  const contract = await factory.deploy(...constructorParams);
  
  // Wait for deployment to complete
  await contract.deployed();
  
  return contract;
}
```

### Firebase Integration

Deployed contracts are saved to Firebase for future reference. The system stores the contract type, address, parameters, and other metadata.

```typescript
export async function saveDeployedContract(
  contractType: string,
  contractAddress: string,
  parameters: Record<string, any>,
  abi: any
): Promise<void> {
  // Prepare contract data
  const contractData = {
    contractType,
    contractAddress,
    parameters,
    abi,
    ownerAddress: account.address,
    chainId: account.chainId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Save to Firebase
  const response = await fetch('/api/contracts/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(contractData)
  });
}
```

## Future Improvements

- Add support for more contract types
- Implement contract verification on block explorers
- Add contract interaction functionality
- Improve parameter extraction from user input
- Add contract templates for common use cases
