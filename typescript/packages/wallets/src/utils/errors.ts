/**
 * Base error class for all wallet errors
 */
export class WalletError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WalletError";
  }
}

/**
 * Error thrown when a transaction fails
 */
export class TransactionError extends WalletError {
  readonly transactionHash?: string;
  readonly code?: string;
  
  constructor(message: string, options?: { hash?: string; code?: string }) {
    super(message);
    this.name = "TransactionError";
    this.transactionHash = options?.hash;
    this.code = options?.code;
  }
}

/**
 * Error thrown when a contract interaction fails
 */
export class ContractError extends WalletError {
  readonly contractAddress: string;
  readonly functionName?: string;
  
  constructor(message: string, address: string, functionName?: string) {
    super(message);
    this.name = "ContractError";
    this.contractAddress = address;
    this.functionName = functionName;
  }
}

/**
 * Error thrown when address resolution fails
 */
export class AddressResolutionError extends WalletError {
  readonly address: string;
  
  constructor(message: string, address: string) {
    super(message);
    this.name = "AddressResolutionError";
    this.address = address;
  }
}

/**
 * Error thrown when signing fails
 */
export class SigningError extends WalletError {
  constructor(message: string) {
    super(message);
    this.name = "SigningError";
  }
}

/**
 * Error thrown when gas estimation fails
 */
export class GasEstimationError extends WalletError {
  constructor(message: string) {
    super(message);
    this.name = "GasEstimationError";
  }
}

/**
 * Error thrown when a batch transaction fails
 */
export class BatchTransactionError extends WalletError {
  readonly failedIndex: number;
  readonly previousTransactions: string[];
  
  constructor(message: string, failedIndex: number, previousTransactions: string[] = []) {
    super(message);
    this.name = "BatchTransactionError";
    this.failedIndex = failedIndex;
    this.previousTransactions = previousTransactions;
  }
}
