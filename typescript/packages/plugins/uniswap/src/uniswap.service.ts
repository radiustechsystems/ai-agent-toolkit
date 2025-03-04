import { Tool } from "@radiustechsystems/ai-agent-core";
import { 
  RadiusWalletInterface, 
  TransactionError 
} from "@radiustechsystems/ai-agent-wallet";
import { CheckApprovalBodySchema, GetQuoteParameters } from "./uniswap.parameters";
import { type UniswapConfig } from "./types/UniswapCtorParams";
import {
  ApiResponse,
  CheckApprovalResponse,
  QuoteResponse,
  SwapResponse,
  UniswapToolResult
} from "./types/UniswapResponses";

/**
 * Service for interacting with Uniswap protocol
 */
export class UniswapService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  /**
   * Creates a new Uniswap service
   * @param config Configuration for the Uniswap service
   */
  constructor(private readonly config: UniswapConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
  }

  /**
   * Makes a request to the Uniswap API
   * @param endpoint API endpoint to call
   * @param parameters Request parameters
   * @returns API response
   */
  private async makeRequest<T>(endpoint: string, parameters: unknown): ApiResponse<T> {
    try {
      const url = new URL(`${this.baseUrl}/${endpoint}`);

      const response = await fetch(url.toString(), {
        method: "POST",
        body: JSON.stringify(parameters),
        headers: {
          "x-api-key": this.apiKey,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch ${endpoint}: ${JSON.stringify(errorData, null, 2)}`);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      throw new Error(`Uniswap API request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Ensures a hex string starts with '0x'
   * @param hex The hex string to normalize
   * @returns A hex string guaranteed to start with '0x'
   */
  private normalizeHexString(hex: string): `0x${string}` {
    // Remove '0x' prefix if it exists, then add it back
    // This ensures we have exactly one '0x' prefix
    const cleanHex = hex.replace(/^0x/, "");
    return `0x${cleanHex}` as `0x${string}`;
  }

  /**
   * Converts transaction data from API format to EVM format
   * @param tx Transaction data from API
   * @returns Transaction data in format expected by Radius wallet
   */
  private convertToRadiusTransaction(tx: { to: string; value: string; data: string }) {
    return {
      to: tx.to,
      value: tx.value ? BigInt(tx.value) : 0n,
      data: this.normalizeHexString(tx.data)
    };
  }

  /**
   * Checks if a wallet has enough token approval for a swap
   * @param walletClient Wallet client to check approval for
   * @param parameters Token approval parameters
   * @returns Approval status and transaction hash if approval was needed
   */
  @Tool({
    name: "uniswap_check_approval",
    description:
      `Check if the wallet has enough approval for a token and return the transaction to approve the token.
      Token approval is required before swapping tokens on Uniswap.`,
  })
  async checkApproval(
    walletClient: RadiusWalletInterface, 
    parameters: CheckApprovalBodySchema
  ): Promise<UniswapToolResult> {
    try {
      const data = await this.makeRequest<CheckApprovalResponse>("check_approval", {
        token: parameters.token,
        amount: parameters.amount,
        walletAddress: parameters.walletAddress,
        chainId: walletClient.getChain().id,
      });

      const approval = data.approval;

      if (!approval) {
        return {
          status: "approved",
          message: "Token already has sufficient approval"
        };
      }

      const transaction = await walletClient.sendTransaction(
        this.convertToRadiusTransaction(approval)
      );

      return {
        status: "approved",
        txHash: transaction.hash,
        message: "Token approval transaction successful"
      };
    } catch (error) {
      throw new TransactionError(
        `Token approval failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Gets a quote for swapping tokens on Uniswap
   * @param walletClient Wallet client to get quote for
   * @param parameters Quote parameters
   * @returns Swap quote data
   */
  @Tool({
    name: "uniswap_get_quote",
    description: "Get a quote for swapping tokens on Uniswap",
  })
  async getQuote(
    walletClient: RadiusWalletInterface, 
    parameters: GetQuoteParameters
  ): Promise<QuoteResponse> {
    try {
      return this.makeRequest<QuoteResponse>("quote", {
        ...parameters,
        tokenInChainId: walletClient.getChain().id,
        tokenOutChainId: parameters.tokenOutChainId ?? walletClient.getChain().id,
        swapper: await walletClient.getAddress(),
      });
    } catch (error) {
      throw new Error(`Failed to get quote: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Swaps tokens on Uniswap
   * @param walletClient Wallet client to perform the swap
   * @param parameters Swap parameters
   * @returns Swap transaction result
   */
  @Tool({
    name: "uniswap_swap_tokens",
    description: "Swap tokens on Uniswap",
  })
  async swapTokens(
    walletClient: RadiusWalletInterface, 
    parameters: GetQuoteParameters
  ): Promise<UniswapToolResult> {
    try {
      // First get a quote for the swap
      const quote = await this.getQuote(walletClient, parameters);

      // Then get the swap transaction data
      const response = await this.makeRequest<SwapResponse>("swap", {
        quote: quote.quote,
      });

      // Execute the transaction
      const transaction = await walletClient.sendTransaction(
        this.convertToRadiusTransaction(response.swap)
      );

      return {
        status: "success",
        txHash: transaction.hash,
        message: "Token swap transaction successful",
        tokenIn: parameters.tokenIn,
        tokenOut: parameters.tokenOut,
        amount: parameters.amount
      };
    } catch (error) {
      throw new TransactionError(
        `Token swap failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
