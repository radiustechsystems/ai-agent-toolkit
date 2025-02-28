import { describe, test, expect, vi, beforeEach } from "vitest";
import { createGasEstimator } from "../gas-estimator";
import { Account, Client } from "@radiustechsystems/sdk";

// Mock the SDK components
vi.mock("@radiustechsystems/sdk", () => {
  return {
    Client: {
      estimateGas: vi.fn().mockResolvedValue(BigInt(21000)),
      estimateGasRaw: vi.fn().mockResolvedValue(BigInt(50000)),
      getGasPrice: vi.fn().mockResolvedValue(BigInt(20000000000)),
    },
    Account: {},
    Address: vi.fn().mockImplementation((address) => {
      return { address };
    }),
    Contract: {
      NewDeployed: vi.fn().mockImplementation(() => {
        return {
          estimateGas: vi.fn().mockResolvedValue(BigInt(50000)),
        };
      })
    },
    ABI: vi.fn().mockImplementation(() => {})
  };
});

describe("GasEstimator", () => {
  const mockClient = {
    estimateGas: vi.fn().mockResolvedValue(BigInt(21000)),
    estimateGasRaw: vi.fn().mockResolvedValue(BigInt(50000)),
    getGasPrice: vi.fn().mockResolvedValue(BigInt(20000000000)),
  } as unknown as Client;
  
  const mockAccount = {} as unknown as Account;
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test("estimates gas correctly for ETH transfer", async () => {
    const estimator = createGasEstimator(mockClient, 1.2);
    
    const transaction = {
      to: "0xrecipient",
      value: BigInt(100000000000000000) // 0.1 ETH
    };
    
    const result = await estimator.estimateGas(transaction, mockAccount);
    
    // Should apply 1.2x multiplier to the 21000 gas limit
    expect(result).toBe(BigInt(25200)); // 21000 * 1.2 = 25200
    expect(mockClient.estimateGas).toHaveBeenCalled();
  });
  
  test("estimates gas correctly for contract call", async () => {
    const estimator = createGasEstimator(mockClient, 1.5);
    
    const transaction = {
      to: "0xcontract",
      functionName: "transfer",
      args: ["0xrecipient", BigInt(1000000)],
      abi: [{
        name: "transfer",
        type: "function",
        inputs: [
          { name: "to", type: "address" },
          { name: "amount", type: "uint256" }
        ],
        outputs: [{ name: "", type: "bool" }]
      }]
    };
    
    const result = await estimator.estimateGas(transaction, mockAccount);
    
    // Should apply 1.5x multiplier to the 50000 gas limit
    expect(result).toBe(BigInt(75000)); // 50000 * 1.5 = 75000
  });
  
  test("simulates transaction successfully", async () => {
    const estimator = createGasEstimator(mockClient);
    
    const transaction = {
      to: "0xrecipient",
      value: BigInt(100000000000000000) // 0.1 ETH
    };
    
    const result = await estimator.simulateTransaction(transaction, mockAccount);
    
    expect(result.success).toBe(true);
    expect(result.gasUsed).toBe(BigInt(25200)); // 21000 * 1.2 = 25200
  });
  
  test("caches gas price", async () => {
    const mockCache = {
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn(),
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const estimator = createGasEstimator(mockClient, 1.2, mockCache as any);
    
    // First call should check cache and set it
    const price1 = await estimator.getGasPrice();
    expect(mockCache.get).toHaveBeenCalledWith("gas_price");
    expect(mockCache.set).toHaveBeenCalledWith("gas_price", BigInt(20000000000));
    expect(price1).toBe(BigInt(20000000000));
    
    // Reset mocks
    mockCache.get.mockReset();
    mockCache.set.mockReset();
    
    // Setup cache hit
    mockCache.get.mockReturnValue(BigInt(25000000000));
    
    // Second call should use cached value
    const price2 = await estimator.getGasPrice();
    expect(mockCache.get).toHaveBeenCalledWith("gas_price");
    expect(mockCache.set).not.toHaveBeenCalled();
    expect(price2).toBe(BigInt(25000000000));
  });
});