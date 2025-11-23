// Contract configuration types

export interface FormField {
  id: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'textarea' | 'dynamic-array';
  label: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  min?: string;
  max?: string;
  step?: string;
  checkboxLabel?: string;
  options?: { value: string; label: string }[];
  itemFields?: FormField[]; // For dynamic-array type
}

export interface ContractStep {
  title: string;
  description: string;
  fields?: FormField[];
}

export interface ContractConfig {
  id: string;
  name: string;
  description: string;
  category: 'tokens' | 'nfts' | 'personal' | 'multi';
  icon: string;
  accentColor: string;
  steps: ContractStep[];
  abi?: any; // Contract ABI
  bytecode?: string; // Contract bytecode
  comingSoon?: boolean;
  contractAddress?: string; // Deployed contract address
}
