import { Tool } from "@radiustechsystems/ai-agent-core";
import { EVMWalletClient } from "@radiustechsystems/ai-agent-wallet-evm";
import { CheckApprovalBodySchema, GetQuoteParameters } from "./parameters";
import type { UniswapCtorParams } from "./types/UniswapCtorParams";
import {
  ApiResponse,
  CheckApprovalResponse,
  QuoteResponse,
  SwapResponse,
} from "./types/UniswapResponses";

export class UniswapService {
  constructor(private readonly params: UniswapCtorParams) {}

  private async makeRequest<T>(endpoint: string, parameters: unknown): ApiResponse<T> {
    const url = new URL(`${this.params.baseUrl}/${endpoint}`);

    const response = await fetch(url.toString(), {
      method: "POST",
      body: JSON.stringify(parameters),
      headers: {
        "x-api-key": this.params.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${JSON.stringify(await response.json(), null, 2)}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Ensures a hex string starts with '0x'
   * @param hex - The hex string to normalize
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
   * Handles conversion of string values to bigint and ensures proper hex formatting
   */
  private convertToEVMTransaction(tx: { to: string; value: string; data: string }) {
    return {
      to: tx.to,
      value: tx.value ? BigInt(tx.value) : 0n,
      data: this.normalizeHexString(tx.data)
    };
  }

  @Tool({
    name: "uniswap_check_approval",
    description:
      `Check if the wallet has enough approval for a token and return the transaction to approve the token.
      The approval must takes place before the swap transaction`,
  })
  async checkApproval(walletClient: EVMWalletClient, parameters: CheckApprovalBodySchema) {
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
      };
    }

    const transaction = await walletClient.sendTransaction(
      this.convertToEVMTransaction(approval)
    );

    return {
      status: "approved",
      txHash: transaction.hash,
    };
  }

  @Tool({
    name: "uniswap_get_quote",
    description: "Get the quote for a swap",
  })
  async getQuote(walletClient: EVMWalletClient, parameters: GetQuoteParameters) {
    return this.makeRequest<QuoteResponse>("quote", {
      ...parameters,
      tokenInChainId: walletClient.getChain().id,
      tokenOutChainId: parameters.tokenOutChainId ?? walletClient.getChain().id,
      swapper: walletClient.getAddress(),
    });
  }

  @Tool({
    name: "uniswap_swap_tokens",
    description: "Swap tokens on Uniswap",
  })
  async getSwapTransaction(walletClient: EVMWalletClient, parameters: GetQuoteParameters) {
    const quote = await this.getQuote(walletClient, parameters);

    const response = await this.makeRequest<SwapResponse>("swap", {
      quote: quote.quote,
    });

    const transaction = await walletClient.sendTransaction(
      this.convertToEVMTransaction(response.swap)
    );

    return {
      txHash: transaction.hash,
    };
  }
}
