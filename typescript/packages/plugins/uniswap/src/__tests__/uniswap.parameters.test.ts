import { describe, test, expect } from "vitest";
import { 
  CheckApprovalBodySchema,
  GetQuoteParameters,
  Protocol,
  Routing,
  SwapType
} from "../uniswap.parameters";

describe("uniswap.parameters", () => {
  test("CheckApprovalBodySchema validates correctly", () => {
    const input = {
      token: "0x1234567890123456789012345678901234567890",
      amount: "1000000000000000000",
      walletAddress: "0x1234567890123456789012345678901234567890",
    };

    const result = CheckApprovalBodySchema.schema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  test("GetQuoteParameters validates with minimal parameters", () => {
    const input = {
      tokenIn: "0x1234567890123456789012345678901234567890",
      tokenOut: "0x0987654321098765432109876543210987654321",
      amount: "1000000000000000000",
      protocols: [Protocol.V3],
    };

    const result = GetQuoteParameters.schema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        ...input,
        type: SwapType.EXACT_INPUT,
        routingPreference: Routing.CLASSIC,
      });
    }
  });

  test("GetQuoteParameters validates with all parameters", () => {
    const input = {
      tokenIn: "0x1234567890123456789012345678901234567890",
      tokenOut: "0x0987654321098765432109876543210987654321",
      tokenOutChainId: 1,
      amount: "1000000000000000000",
      type: SwapType.EXACT_OUTPUT,
      protocols: [Protocol.V2, Protocol.V3],
      routingPreference: Routing.BEST_PRICE,
    };

    const result = GetQuoteParameters.schema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  test("GetQuoteParameters validates with alternative routing preferences", () => {
    const routingOptions = [
      Routing.UNISWAPX,
      Routing.UNISWAPX_V2,
      Routing.V3_ONLY,
      Routing.V2_ONLY,
      Routing.BEST_PRICE_V2,
      Routing.FASTEST,
    ];

    routingOptions.forEach(routingPreference => {
      const input = {
        tokenIn: "0x1234567890123456789012345678901234567890",
        tokenOut: "0x0987654321098765432109876543210987654321",
        amount: "1000000000000000000",
        protocols: [Protocol.V3],
        routingPreference,
      };

      const result = GetQuoteParameters.schema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.routingPreference).toEqual(routingPreference);
      }
    });
  });

  test("GetQuoteParameters rejects invalid protocol values", () => {
    const input = {
      tokenIn: "0x1234567890123456789012345678901234567890",
      tokenOut: "0x0987654321098765432109876543210987654321",
      amount: "1000000000000000000",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      protocols: ["V4" as any], // invalid protocol
    };

    const result = GetQuoteParameters.schema.safeParse(input);
    expect(result.success).toBe(false);
  });

  test("GetQuoteParameters rejects invalid routing preference", () => {
    const input = {
      tokenIn: "0x1234567890123456789012345678901234567890",
      tokenOut: "0x0987654321098765432109876543210987654321",
      amount: "1000000000000000000",
      protocols: [Protocol.V3],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      routingPreference: "INVALID_ROUTING" as any,
    };

    const result = GetQuoteParameters.schema.safeParse(input);
    expect(result.success).toBe(false);
  });
});
