/**
 * Transaction data for ERC20 approval
 */
export interface ApprovalTransaction {
  /** Contract address to send the transaction to */
  to: string;
  /** Native token value to send with the transaction */
  value: string;
  /** Transaction calldata */
  data: string;
}

/**
 * Response from check_approval endpoint
 */
export interface CheckApprovalResponse {
  /** Transaction for approving a token, or null if already approved */
  approval: ApprovalTransaction | null;
}

/**
 * Response from quote endpoint
 */
export interface QuoteResponse {
  /** Quote data for the swap */
  quote: {
    /** Address of the input token */
    tokenIn: string;
    /** Address of the output token */
    tokenOut: string;
    /** Amount of tokens to swap */
    amount: string;
    /** Chain ID for the swap */
    chainId?: number;
    /** Expected output amount */
    expectedOutput?: string;
    /** Slippage tolerance */
    slippage?: string;
    /** Price impact percentage */
    priceImpact?: number;
    /** Gas fee estimates */
    gasFee?: string;
    /** Other quote properties returned by the API */
    [key: string]: unknown;
  };
}

/**
 * Transaction data for a swap
 */
export interface SwapTransaction {
  /** Contract address to send the transaction to */
  to: string;
  /** Native token value to send with the transaction */
  value: string;
  /** Transaction calldata */
  data: string;
}

/**
 * Response from swap endpoint
 */
export interface SwapResponse {
  /** Swap transaction data */
  swap: SwapTransaction;
}

/**
 * Result from Uniswap tools
 */
export interface UniswapToolResult {
  /** Status of the operation */
  status?: string;
  /** Transaction hash for on-chain operations */
  txHash?: string;
  /** Additional result properties */
  [key: string]: unknown;
}

/**
 * A generic type for the response from makeRequest
 */
export type ApiResponse<T> = Promise<T>;
