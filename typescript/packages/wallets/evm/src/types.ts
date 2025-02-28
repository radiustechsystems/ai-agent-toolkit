// Core types for EVM transactions and contracts

/**
 * Represents a single item in a contract's ABI (Application Binary Interface)
 * @interface AbiItem
 */
export type AbiItem = {
  /** Function or event name */
  name?: string;
  /** Type of the ABI item (function, event, etc.) */
  type: string;
  /** State mutability (view, pure, payable, nonpayable) */
  stateMutability?: string;
  /** Array of input parameters */
  inputs?: Array<{
    /** Parameter name */
    name: string;
    /** Parameter type */
    type: string;
    /** Nested components for complex types */
    components?: AbiItem[];
  }>;
  /** Array of output parameters */
  outputs?: Array<{
    /** Parameter name */
    name: string;
    /** Parameter type */
    type: string;
    /** Nested components for complex types */
    components?: AbiItem[];
  }>;
};

/**
 * Represents a complete contract ABI
 * @typedef {AbiItem[]} Abi
 */
export type Abi = AbiItem[];

/**
 * Represents a typed data domain according to EIP-712 standard
 * @interface TypedDataDomain
 */
export type TypedDataDomain = {
  /** Domain name */
  name?: string;
  /** Domain version */
  version?: string;
  /** Chain ID where the contract is deployed */
  chainId?: number | bigint;
  /** Address of the verifying contract */
  verifyingContract?: string;
  /** Optional salt for additional security */
  salt?: string;
};

/**
 * Represents an EVM transaction request
 * @interface EVMTransaction
 */
export type EVMTransaction = {
  /** Recipient address */
  to: string;
  /** Name of the function to call */
  functionName?: string;
  /** Function arguments */
  args?: unknown[];
  /** Transaction value in wei */
  value?: bigint;
  /** Contract ABI */
  abi?: Abi;
  /** Additional transaction options */
  options?: EVMTransactionOptions;
  /** Raw transaction data */
  data?: `0x${string}`;
};

/**
 * Represents additional options for EVM transactions
 * @interface EVMTransactionOptions
 */
export type EVMTransactionOptions = {
  /** Paymaster configuration for gasless transactions */
  paymaster?: {
    /** Paymaster contract address */
    address: `0x${string}`;
    /** Encoded paymaster data */
    input: `0x${string}`;
  };
};

/**
 * Represents typed data for EIP-712 signing
 * @interface EVMTypedData
 */
export type EVMTypedData = {
  /** Domain separator data */
  domain: TypedDataDomain;
  /** Type definitions */
  types: Record<string, unknown>;
  /** Primary type being signed */
  primaryType: string;
  /** Message to be signed */
  message: Record<string, unknown>;
};

/**
 * Represents a request to read from an EVM contract
 * @interface EVMReadRequest
 */
export type EVMReadRequest = {
  /** Contract address */
  address: string;
  /** Function name to call */
  functionName: string;
  /** Function arguments */
  args?: unknown[];
  /** Contract ABI */
  abi: Abi;
};

/**
 * Represents the result of reading from an EVM contract
 * @interface EVMReadResult
 */
export type EVMReadResult = {
  /** Returned value from the contract */
  value: unknown;
};

/**
 * Configuration options for the Radius wallet client
 */
export interface RadiusWalletOptions {
  /**
   * Enables batch transaction processing capabilities
   * @default false 
   */
  enableBatchTransactions?: boolean;
  
  /**
   * Logger function to capture wallet operations
   */
  logger?: (message: string, data?: Record<string, unknown>) => void;
}

/**
 * Represents detailed information about a token balance
 * @interface BalanceInfo
 */
export type BalanceInfo = {
  /** Token balance in decimal string format */
  value: string;
  /** Number of decimal places */
  decimals: number;
  /** Token symbol */
  symbol: string;
  /** Token name */
  name: string;
  /** Balance in base units (smallest denomination) */
  inBaseUnits: string;
};

/**
 * Configuration for creating a Radius wallet
 */
export type RadiusWalletConfig = {
  /** RPC URL for connecting to the blockchain */
  rpcUrl: string;
  /** Private key (hex string starting with 0x) */
  privateKey: string;
};
