import { beforeEach, describe, expect, test, vi } from "vitest";

// Mock the wallet module instead of defining our own interface
vi.mock("@radiustechsystems/ai-agent-wallet", () => ({}));

// Use any for the wallet client to bypass type issues without affecting runtime behavior
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RadiusWalletInterface = any;
import { BalancerService } from "../balancer.service";
import { LiquidityParameters, RemoveLiquidityParameters, SwapParameters } from "../parameters";

// Mock the Balancer SDK
vi.mock("@balancer/sdk", () => {
  const mockQueryOutput = {
    bptOut: { amount: { toString: () => "100000000000000000" } },
    amountsOut: [
      { token: { address: "0xtoken1" }, amount: { toString: () => "200000000000000000" } },
      { token: { address: "0xtoken2" }, amount: { toString: () => "300000000000000000" } },
    ],
  };

  const mockCall = {
    to: "0xBalancerVault",
    value: BigInt(0),
    callData: "0xcalldata",
  };

  return {
    BalancerApi: vi.fn().mockImplementation(() => ({
      sorSwapPaths: {
        fetchSorSwapPaths: vi.fn().mockResolvedValue([]),
      },
      pools: {
        fetchPoolState: vi.fn().mockResolvedValue({
          address: "0xpooladdress",
        }),
      },
    })),
    Token: vi.fn().mockImplementation(() => ({
      address: "0xmockaddress",
    })),
    TokenAmount: {
      fromRawAmount: vi.fn().mockReturnValue({
        amount: BigInt(100),
      }),
    },
    Swap: vi.fn().mockImplementation(() => ({
      query: vi.fn().mockResolvedValue({}),
      buildCall: vi.fn().mockReturnValue({
        to: "0xBalancerVault",
        value: BigInt(0),
        callData: "0xcalldata",
        minAmountOut: { amount: { toString: () => "1000000000000000000" } },
      }),
    })),
    AddLiquidity: vi.fn().mockImplementation(() => ({
      query: vi.fn().mockResolvedValue(mockQueryOutput),
      buildCall: vi.fn().mockReturnValue(mockCall),
    })),
    RemoveLiquidity: vi.fn().mockImplementation(() => ({
      query: vi.fn().mockResolvedValue(mockQueryOutput),
      buildCall: vi.fn().mockReturnValue(mockCall),
    })),
    Slippage: {
      fromPercentage: vi.fn().mockReturnValue({}),
    },
    SwapKind: {
      GivenIn: 0,
    },
    AddLiquidityKind: {
      SingleToken: 0,
      Unbalanced: 1,
    },
    RemoveLiquidityKind: {
      SingleTokenExactIn: 0,
      Proportional: 1,
    },
  };
});

// Mock Tool decorator
vi.mock("@radiustechsystems/ai-agent-core", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Tool: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => descriptor,
  createToolParameters: (schema: never) => {
    return class {
      static schema = schema;
    };
  },
}));

describe("BalancerService", () => {
  let service: BalancerService;
  let mockWalletClient: RadiusWalletInterface;

  const testConfig = {
    rpcUrl: "https://testnet.radius.com/rpc",
    apiUrl: "https://api-test.balancer.fi/",
  };

  // Set up mock wallet client
  beforeEach(() => {
    mockWalletClient = {
      getChain: vi.fn().mockReturnValue({ id: 1, type: "evm" }),
      getAddress: vi.fn().mockReturnValue("0xmockaddress"),
      sendTransaction: vi.fn().mockResolvedValue({
        hash: "0xhash",
      }),
    };

    service = new BalancerService(testConfig);
    vi.clearAllMocks();
  });

  describe("swapOnBalancer", () => {
    test("should successfully swap tokens", async () => {
      // Create parameters for swap
      const swapParams = new SwapParameters();
      swapParams.tokenIn = "0xtoken1";
      swapParams.tokenOut = "0xtoken2";
      swapParams.tokenInDecimals = 18;
      swapParams.tokenOutDecimals = 18;
      swapParams.amountIn = "1000000000000000000";
      swapParams.slippage = "0.5";

      // Call the method
      const result = await service.swapOnBalancer(
        mockWalletClient as RadiusWalletInterface,
        swapParams
      );

      // Verify the result
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        amountOut: "1000000000000000000",
        txHash: "0xhash",
      });

      // Verify wallet client was called correctly
      expect(mockWalletClient.sendTransaction).toHaveBeenCalledWith({
        to: "0xBalancerVault",
        value: BigInt(0),
        data: "0xcalldata",
      });
    });

    test("should handle errors and return error response", async () => {
      // Setup wallet client to throw an error
      mockWalletClient.sendTransaction = vi.fn().mockRejectedValue(
        new Error("Transaction failed")
      );

      // Create parameters for swap
      const swapParams = new SwapParameters();
      swapParams.tokenIn = "0xtoken1";
      swapParams.tokenOut = "0xtoken2";
      swapParams.tokenInDecimals = 18;
      swapParams.tokenOutDecimals = 18;
      swapParams.amountIn = "1000000000000000000";
      swapParams.slippage = "0.5";

      // Call the method
      const result = await service.swapOnBalancer(
        mockWalletClient as RadiusWalletInterface,
        swapParams
      );

      // Verify the result contains error information
      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to swap on Balancer");
      expect(result.error).toContain("Transaction failed");
    });
  });

  describe("addLiquidity", () => {
    test("should successfully add liquidity with Unbalanced kind", async () => {
      // Create parameters for adding liquidity
      const params = new LiquidityParameters();
      params.pool = "0xpooladdress";
      params.amounts = [
        { token: "0xtoken1", amount: "1000000000000000000", decimals: 18 },
        { token: "0xtoken2", amount: "2000000000000000000", decimals: 18 },
      ];
      params.kind = "Unbalanced";
      params.slippage = "0.5";

      // Call the method
      const result = await service.addLiquidity(
        mockWalletClient as RadiusWalletInterface,
        params
      );

      // Verify the result
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        bptOut: "100000000000000000",
        txHash: "0xhash",
      });

      // Verify wallet client was called correctly
      expect(mockWalletClient.sendTransaction).toHaveBeenCalledWith({
        to: "0xBalancerVault",
        value: BigInt(0),
        data: "0xcalldata",
      });
    });

    test("should successfully add liquidity with Exact kind", async () => {
      // Create parameters for adding liquidity
      const params = new LiquidityParameters();
      params.pool = "0xpooladdress";
      params.amounts = [
        { token: "0xtoken1", amount: "1000000000000000000", decimals: 18 },
      ];
      params.kind = "Exact";
      params.slippage = "0.5";

      // Call the method
      const result = await service.addLiquidity(
        mockWalletClient as RadiusWalletInterface,
        params
      );

      // Verify the result
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        bptOut: "100000000000000000",
        txHash: "0xhash",
      });
    });

    test("should handle errors and return error response", async () => {
      // Setup wallet client to throw an error
      mockWalletClient.sendTransaction = vi.fn().mockRejectedValue(
        new Error("Transaction failed")
      );

      // Create parameters for adding liquidity
      const params = new LiquidityParameters();
      params.pool = "0xpooladdress";
      params.amounts = [
        { token: "0xtoken1", amount: "1000000000000000000", decimals: 18 },
      ];
      params.kind = "Unbalanced";
      params.slippage = "0.5";

      // Call the method
      const result = await service.addLiquidity(
        mockWalletClient as RadiusWalletInterface,
        params
      );

      // Verify the result contains error information
      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to add liquidity to Balancer");
      expect(result.error).toContain("Transaction failed");
    });
  });

  describe("removeLiquidity", () => {
    test("should successfully remove liquidity with Proportional kind", async () => {
      // Create parameters for removing liquidity
      const params = new RemoveLiquidityParameters();
      params.pool = "0xpooladdress";
      params.bptAmountIn = "1000000000000000000";
      params.kind = "Proportional";
      params.slippage = "0.5";

      // Call the method
      const result = await service.removeLiquidity(
        mockWalletClient as RadiusWalletInterface,
        params
      );

      // Verify the result
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        amountsOut: [
          { token: "0xtoken1", amount: "200000000000000000" },
          { token: "0xtoken2", amount: "300000000000000000" },
        ],
        txHash: "0xhash",
      });

      // Verify wallet client was called correctly
      expect(mockWalletClient.sendTransaction).toHaveBeenCalledWith({
        to: "0xBalancerVault",
        value: BigInt(0),
        data: "0xcalldata",
      });
    });

    test("should successfully remove liquidity with Single kind", async () => {
      // Create parameters for removing liquidity
      const params = new RemoveLiquidityParameters();
      params.pool = "0xpooladdress";
      params.bptAmountIn = "1000000000000000000";
      params.kind = "Single";
      params.slippage = "0.5";

      // Call the method
      const result = await service.removeLiquidity(
        mockWalletClient as RadiusWalletInterface,
        params
      );

      // Verify the result
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        amountsOut: [
          { token: "0xtoken1", amount: "200000000000000000" },
          { token: "0xtoken2", amount: "300000000000000000" },
        ],
        txHash: "0xhash",
      });
    });

    test("should handle errors and return error response", async () => {
      // Setup wallet client to throw an error
      mockWalletClient.sendTransaction = vi.fn().mockRejectedValue(
        new Error("Transaction failed")
      );

      // Create parameters for removing liquidity
      const params = new RemoveLiquidityParameters();
      params.pool = "0xpooladdress";
      params.bptAmountIn = "1000000000000000000";
      params.kind = "Proportional";
      params.slippage = "0.5";

      // Call the method
      const result = await service.removeLiquidity(
        mockWalletClient as RadiusWalletInterface,
        params
      );

      // Verify the result contains error information
      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to remove liquidity from Balancer");
      expect(result.error).toContain("Transaction failed");
    });
  });
});
