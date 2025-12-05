/**
 * Contract template model for storing contract templates
 */
export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: 'staking' | 'token' | 'nft' | 'vault' | 'lp-staking';
  version: string;
  sourceCode: string;
  bytecode: string;
  abi: any[];
  parameters: ParameterDefinition[];
  createdAt: Date | string;
  updatedAt: Date | string;
  enabled: boolean;
}

/**
 * Parameter definition for contract template parameters
 */
export interface ParameterDefinition {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'address' | 'array';
  description: string;
  required: boolean;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

/**
 * Deployed contract model for storing user-deployed contracts
 */
export interface DeployedContract {
  id: string;
  templateId: string;
  contractAddress: string;
  chainId: number;
  ownerAddress: string;
  parameters: Record<string, any>;
  transactionHash: string;
  createdAt: Date | string;
  contractType: string;
  name: string;
}

/**
 * Contract deployment parameters
 */
export interface ContractDeploymentParams {
  templateId: string;
  parameters: Record<string, any>;
}

/**
 * Contract deployment result
 */
export interface ContractDeploymentResult {
  success: boolean;
  contractAddress?: string;
  transactionHash?: string;
  error?: string;
}
