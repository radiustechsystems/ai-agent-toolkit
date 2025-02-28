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
  /** 
   * Optional gas limit for the transaction 
   * If not provided, it will be estimated
   */
  gasLimit?: bigint;
  /**
   * Optional gas price (for networks that don't use EIP-1559)
   */
  gasPrice?: bigint;
  /**
   * Optional max fee per gas (for EIP-1559 networks)
   */
  maxFeePerGas?: bigint;
  /**
   * Optional max priority fee per gas (for EIP-1559 networks)
   */
  maxPriorityFeePerGas?: bigint;
  /**
   * Optional nonce override
   * If not provided, it will be determined automatically
   */
  nonce?: number;
  /**
   * Optional flag to simulate the transaction without sending
   * @default false
   */
  simulate?: boolean;
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
  /** Success status of the read operation */
  success: boolean;
  /** Error message if the read operation failed */
  error?: string;
};

/**
 * Represents detailed information about a transaction
 */
export interface TransactionDetails {
  /** Transaction hash */
  hash: string;
  /** Block number where the transaction was included */
  blockNumber?: number;
  /** Transaction status (1 for success, 0 for failure) */
  status?: number;
  /** Gas used by the transaction */
  gasUsed?: bigint;
  /** Effective gas price paid */
  effectiveGasPrice?: bigint;
  /** Total transaction fee paid (gasUsed * effectiveGasPrice) */
  fee?: bigint;
  /** Transaction nonce */
  nonce?: number;
  /** Block timestamp when transaction was mined */
  timestamp?: number;
}

/**
 * Results of a transaction simulation
 */
export interface TransactionSimulationResult {
  /** Simulation success status */
  success: boolean;
  /** Gas used estimation */
  gasUsed: bigint;
  /** Return value (for contract calls) */
  returnValue?: string;
  /** Error message if simulation failed */
  error?: string;
  /** State changes if available */
  stateChanges?: {
    address: string;
    storageChanges: Array<{ key: string; value: string }>;
  }[];
}

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
  
  /**
   * Enable ENS resolution support
   * @default false
   */
  enableENS?: boolean;
  
  /**
   * Custom ENS registry address
   * Default is the mainnet ENS registry
   */
  ensRegistryAddress?: string;
  
  /**
   * Enable transaction status monitoring
   * @default false
   */
  enableTransactionMonitoring?: boolean;
  
  /**
   * Default timeout (ms) for transaction confirmation
   * @default 60000 (1 minute)
   */
  transactionTimeout?: number;
  
  /**
   * Default number of confirmations to wait for
   * @default 1
   */
  confirmations?: number;
  
  /**
   * Enable gas estimation before transactions
   * @default true
   */
  enableGasEstimation?: boolean;
  
  /**
   * Default gas multiplier for estimated gas
   * @default 1.2 (20% buffer)
   */
  gasMultiplier?: number;
  
  /**
   * Enable caching
   * @default true
   */
  enableCaching?: boolean;
  
  /**
   * Maximum cache age in milliseconds
   * @default 30000 (30 seconds)
   */
  maxCacheAge?: number;
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
