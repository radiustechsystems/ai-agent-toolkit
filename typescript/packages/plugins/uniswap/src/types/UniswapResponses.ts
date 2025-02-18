export interface ApprovalTransaction {
  to: string;
  value: string;
  data: string;
}

export interface CheckApprovalResponse {
  approval: ApprovalTransaction | null;
}

export interface QuoteResponse {
  quote: {
    // You might want to add more specific fields based on the actual API response
    tokenIn: string;
    tokenOut: string;
    amount: string;
    // Add other quote-specific fields
  };
}

export interface SwapTransaction {
  to: string;
  value: string;
  data: string;
}

export interface SwapResponse {
  swap: SwapTransaction;
}

// A type for the response from makeRequest
export type ApiResponse<T> = Promise<T>;
