import { describe, expect, test, vi } from "vitest";
import { z } from "zod";
import {
  CheckApprovalBodySchema,
  GetQuoteParameters,
  Protocol,
  QuoteResponseSchema,
  QuoteSchema,
  Routing,
  SwapResponseSchema,
  SwapType,
  TransactionSchema
} from "../parameters";

// Mock createToolParameters
vi.mock("@radiustechsystems/ai-agent-core", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createToolParameters: (schema: z.ZodObject<any>) => {
    return class {
      static schema = schema;
    };
  },
}));

describe("Uniswap Parameters", () => {
  describe("CheckApprovalBodySchema", () => {
    test("should be properly defined", () => {
      expect(CheckApprovalBodySchema).toBeDefined();
      const params = new CheckApprovalBodySchema();
      expect(params).toBeInstanceOf(CheckApprovalBodySchema);
      expect(CheckApprovalBodySchema.schema).toBeDefined();
    });

    test("should have the correct shape", () => {
      const schema = CheckApprovalBodySchema.schema;
      expect(schema.shape.token).toBeDefined();
      expect(schema.shape.amount).toBeDefined();
      expect(schema.shape.walletAddress).toBeDefined();
    });
  });

  describe("GetQuoteParameters", () => {
    test("should be properly defined", () => {
      expect(GetQuoteParameters).toBeDefined();
      const params = new GetQuoteParameters();
      expect(params).toBeInstanceOf(GetQuoteParameters);
      expect(GetQuoteParameters.schema).toBeDefined();
    });

    test("should have the correct shape", () => {
      const schema = GetQuoteParameters.schema;
      expect(schema.shape.tokenIn).toBeDefined();
      expect(schema.shape.tokenOut).toBeDefined();
      expect(schema.shape.amount).toBeDefined();
      expect(schema.shape.tokenOutChainId).toBeDefined();
      expect(schema.shape.type).toBeDefined();
      expect(schema.shape.protocols).toBeDefined();
      expect(schema.shape.routingPreference).toBeDefined();
    });
    
    test("should have default values", () => {
      const defaultParams = GetQuoteParameters.schema.parse({
        tokenIn: "0xTokenIn",
        tokenOut: "0xTokenOut",
        amount: "1000000000000000000",
        protocols: [Protocol.V3]
      });
      
      expect(defaultParams.type).toBe(SwapType.EXACT_INPUT);
      expect(defaultParams.routingPreference).toBe(Routing.CLASSIC);
    });
  });

  describe("Enums", () => {
    test("SwapType should have correct values", () => {
      expect(SwapType.EXACT_INPUT).toBe("EXACT_INPUT");
      expect(SwapType.EXACT_OUTPUT).toBe("EXACT_OUTPUT");
    });
    
    test("Protocol should have correct values", () => {
      expect(Protocol.V2).toBe("V2");
      expect(Protocol.V3).toBe("V3");
    });
    
    test("Routing should have correct values", () => {
      expect(Routing.CLASSIC).toBe("CLASSIC");
      expect(Routing.UNISWAPX).toBe("UNISWAPX");
      expect(Routing.BEST_PRICE).toBe("BEST_PRICE");
      expect(Routing.V3_ONLY).toBe("V3_ONLY");
      expect(Routing.V2_ONLY).toBe("V2_ONLY");
    });
  });

  describe("Response Schemas", () => {
    test("QuoteSchema should be properly defined", () => {
      expect(QuoteSchema).toBeDefined();
      
      // Test valid quote data parsing
      const validQuoteData = {
        chainId: 1,
        swapper: "0xAddress",
        input: { token: "0xToken" },
        output: { token: "0xToken" },
        slippage: "0.5",
        tradeType: "EXACT_INPUT",
        route: [],
        gasFee: "1000",
        gasFeeUSD: "1.50",
        gasFeeQuote: "quote",
        gasUseEstimate: "21000",
        routeString: "token0 -> token1",
        blockNumber: "123456",
        quoteId: "abc123",
        gasPrice: "10000000000",
        maxFeePerGas: "20000000000",
        maxPriorityFeePerGas: "1000000000",
        txFailureReasons: [],
        priceImpact: 0.1
      };
      
      const parsed = QuoteSchema.parse(validQuoteData);
      expect(parsed).toEqual(validQuoteData);
    });
    
    test("QuoteResponseSchema should be properly defined", () => {
      expect(QuoteResponseSchema).toBeDefined();
      
      // Test valid quote response parsing
      const validQuoteResponse = {
        routing: "CLASSIC",
        quote: {
          chainId: 1,
          swapper: "0xAddress",
          input: { token: "0xToken" },
          output: { token: "0xToken" },
          slippage: "0.5",
          tradeType: "EXACT_INPUT",
          route: [],
          gasFee: "1000",
          gasFeeUSD: "1.50",
          gasFeeQuote: "quote",
          gasUseEstimate: "21000",
          routeString: "token0 -> token1",
          blockNumber: "123456",
          quoteId: "abc123",
          gasPrice: "10000000000",
          maxFeePerGas: "20000000000",
          maxPriorityFeePerGas: "1000000000",
          txFailureReasons: [],
          priceImpact: 0.1
        }
      };
      
      const parsed = QuoteResponseSchema.parse(validQuoteResponse);
      expect(parsed.routing).toBe("CLASSIC");
      expect(parsed.quote).toBeDefined();
    });
    
    test("TransactionSchema should be properly defined", () => {
      expect(TransactionSchema).toBeDefined();
      
      const validTransaction = {
        from: "0xSender",
        to: "0xReceiver",
        amount: "1000000000000000000",
        token: "0xToken"
      };
      
      const parsed = TransactionSchema.parse(validTransaction);
      expect(parsed).toEqual(validTransaction);
    });
    
    test("SwapResponseSchema should be properly defined", () => {
      expect(SwapResponseSchema).toBeDefined();
      
      const validSwapResponse = {
        transaction: {
          from: "0xSender",
          to: "0xReceiver",
          amount: "1000000000000000000",
          token: "0xToken"
        },
        gasFee: "21000"
      };
      
      const parsed = SwapResponseSchema.parse(validSwapResponse);
      expect(parsed.transaction).toBeDefined();
      expect(parsed.gasFee).toBe("21000");
    });
  });
});
