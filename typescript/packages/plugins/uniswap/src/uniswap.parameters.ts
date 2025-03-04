import { createToolParameters } from "@radiustechsystems/ai-agent-core";
import { z } from "zod";

/**
 * Types of swaps supported by Uniswap
 */
export enum SwapType {
    /** Exact amount of input token to swap */
    EXACT_INPUT = "EXACT_INPUT",
    /** Exact amount of output token to receive */
    EXACT_OUTPUT = "EXACT_OUTPUT",
}

/**
 * Uniswap protocol versions
 */
export enum Protocol {
    /** Uniswap V2 */
    V2 = "V2",
    /** Uniswap V3 */
    V3 = "V3",
}

/**
 * Routing methods for Uniswap swaps
 */
export enum Routing {
    /** Classic Uniswap routing */
    CLASSIC = "CLASSIC",
    /** UniswapX Dutch Auction Protocol */
    UNISWAPX = "UNISWAPX",
    /** UniswapX V2 Dutch Auction Protocol */
    UNISWAPX_V2 = "UNISWAPX_V2",
    /** Only use Uniswap V3 */
    V3_ONLY = "V3_ONLY",
    /** Only use Uniswap V2 */
    V2_ONLY = "V2_ONLY",
    /** Route for best price */
    BEST_PRICE = "BEST_PRICE",
    /** Route for best price using V2 */
    BEST_PRICE_V2 = "BEST_PRICE_V2",
    /** Route for fastest execution */
    FASTEST = "FASTEST",
}

/**
 * Schema for quote data returned by Uniswap API
 */
export const QuoteSchema = z.object({
  chainId: z.number().describe("Chain ID for the swap"),
  swapper: z.string().describe("Address performing the swap"),
  input: z.any().describe("Input token information"),
  output: z.any().describe("Output token information"),
  slippage: z.any().describe("Slippage tolerance"),
  tradeType: z.nativeEnum(SwapType).describe("Type of swap"),
  route: z.any().describe("Route information"),
  gasFee: z.string().describe("Estimated gas fee"),
  gasFeeUSD: z.string().describe("Estimated gas fee in USD"),
  gasFeeQuote: z.string().describe("Gas fee quote"),
  gasUseEstimate: z.string().describe("Estimated gas usage"),
  routeString: z.string().describe("String representation of the route"),
  blockNumber: z.string().describe("Block number used for the quote"),
  quoteId: z.string().describe("Unique quote ID"),
  gasPrice: z.string().describe("Gas price"),
  maxFeePerGas: z.string().describe("Maximum fee per gas"),
  maxPriorityFeePerGas: z.string().describe("Maximum priority fee per gas"),
  txFailureReasons: z.array(z.string()).describe("Potential transaction failure reasons"),
  priceImpact: z.number().describe("Price impact percentage"),
});

/**
 * Schema for permit data used in gasless approvals
 */
export const PermitDataSchema = z.object({
  domain: z.string().describe("EIP-712 domain"),
  types: z.record(z.string(), z.any()).describe("EIP-712 types"),
  primaryType: z.string().describe("EIP-712 primary type"),
  message: z.record(z.string(), z.any()).describe("EIP-712 message"),
});

/**
 * Schema for quote response from Uniswap API
 */
export const QuoteResponseSchema = z.object({
  routing: z.nativeEnum(Routing).describe("Routing method used"),
  permitData: PermitDataSchema.optional().describe("Permit data for gasless approvals"),
  quote: QuoteSchema.describe("Quote information"),
});

/**
 * Schema for transaction data
 */
export const TransactionSchema = z.object({
  from: z.string().describe("From address"),
  to: z.string().describe("To address"),
  amount: z.string().describe("Amount to transfer"),
  token: z.string().describe("Token address"),
});

/**
 * Schema for swap response from Uniswap API
 */
export const SwapResponseSchema = z.object({
  transaction: TransactionSchema.describe("Transaction data"),
  gasFee: z.string().describe("Estimated gas fee"),
});

/**
 * Parameters for checking token approval status
 */
export class CheckApprovalBodySchema extends createToolParameters(
  z.object({
    token: z.string().describe("Token address to check approval for"),
    amount: z.string().describe("Amount of tokens to approve"),
    walletAddress: z.string().describe("Wallet address to check approval for"),
  }),
) {}

/**
 * Parameters for getting a swap quote
 */
export class GetQuoteParameters extends createToolParameters(
  z.object({
    tokenIn: z.string().describe("Address of the token to swap from"),
    tokenOut: z.string().describe("Address of the token to swap to"),
    tokenOutChainId: z.number().optional().describe("Chain ID of the output token (for cross-chain swaps)"),
    amount: z.string().describe("The amount of tokens to swap in base units"),
    type: z.nativeEnum(SwapType)
      .default(SwapType.EXACT_INPUT)
      .describe("Type of swap (EXACT_INPUT or EXACT_OUTPUT)"),
    protocols: z.array(z.nativeEnum(Protocol))
      .describe("Protocols to use for the swap (V2, V3)"),
    routingPreference: z
      .nativeEnum(Routing)
      .default(Routing.CLASSIC)
      .describe(
        `The routing preference determines which protocol to use for the swap.
        CLASSIC: Standard routing through Uniswap
        UNISWAPX: Route through the UniswapX Dutch Auction Protocol
        BEST_PRICE: Route through protocol that provides the best price
        UNISWAPX_V2: Route through the UniswapX V2 Dutch Auction Protocol
        V3_ONLY: Route ONLY through the Uniswap V3 Protocol
        V2_ONLY: Route ONLY through the Uniswap V2 Protocol
        FASTEST: Route for fastest execution time`,
      ),
  }),
) {}