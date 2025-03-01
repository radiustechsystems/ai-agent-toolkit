import { beforeEach, describe, expect, test, vi } from "vitest";

// Mock the wallet module instead of defining our own interface
vi.mock("@radiustechsystems/ai-agent-wallet", () => ({
  formatUnits: vi.fn().mockImplementation((value, decimals) => `${value} / 10^${decimals}`),
  parseUnits: vi.fn().mockImplementation((value, decimals) => {
    // For testing purposes, just convert to a simple bigint
    if (typeof value === "string") {
      const [whole, fraction = ""] = value.split(".");
      return BigInt(whole + fraction.padEnd(decimals, "0"));
    }
    return BigInt(value.toString().replace(".", ""));
  }),
  TransactionError: class extends Error {
    constructor(message: string) { super(message); }
  },
  ContractError: class extends Error {
    constructor(message: string, address: string, functionName?: string) { 
      super(`${message} (${address}${functionName ? `:${functionName}` : ""})`); 
    }
  },
}));

// Use any for the wallet client to bypass type issues without affecting runtime behavior
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RadiusWalletInterface = any;

import { Erc20Service } from "../erc20.service";
// eslint-disable-next-line max-len
import { ConvertFromBaseUnitParameters, ConvertToBaseUnitParameters, GetTokenInfoBySymbolParameters } from "../parameters";
import { USDC, WETH } from "../token";

// Mock Tool decorator
vi.mock("@radiustechsystems/ai-agent-core", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Tool: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => descriptor,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createToolParameters: (schema: any) => {
    return class {
      static schema = schema;
    };
  },
}));

describe("Erc20Service", () => {
  let service: Erc20Service;
  let mockWalletClient: RadiusWalletInterface;
  
  const testTokens = [USDC, WETH];

  // Set up mock wallet client
  beforeEach(() => {
    mockWalletClient = {
      getChain: vi.fn().mockReturnValue({ id: 1223953, type: "evm" }),
      getAddress: vi.fn().mockReturnValue("0xmockaddress"),
      resolveAddress: vi.fn().mockImplementation(addr => `0x${addr.replace(/^0x/, "")}`),
      read: vi.fn().mockResolvedValue({ value: BigInt(1000000) }),
      sendTransaction: vi.fn().mockResolvedValue({
        hash: "0xhash",
      }),
    };

    service = new Erc20Service({ tokens: testTokens });
    vi.clearAllMocks();
  });

  describe("getTokenInfoBySymbol", () => {
    test("should return token info for a valid symbol", async () => {
      const params = new GetTokenInfoBySymbolParameters();
      params.symbol = "USDC";
      
      const result = await service.getTokenInfoBySymbol(mockWalletClient, params);
      
      expect(result).toEqual({
        symbol: "USDC",
        contractAddress: USDC.chains[1223953].contractAddress,
        decimals: USDC.decimals,
        name: USDC.name,
      });
      
      expect(mockWalletClient.getChain).toHaveBeenCalled();
    });
    
    test("should handle errors when token is not found", async () => {
      const params = new GetTokenInfoBySymbolParameters();
      params.symbol = "INVALID";
      
      await expect(service.getTokenInfoBySymbol(mockWalletClient, params))
        .rejects.toThrow("Token with symbol INVALID not found");
    });
  });
  
  describe("convertToBaseUnit", () => {
    test("should convert decimal amount to base units", async () => {
      const params = new ConvertToBaseUnitParameters();
      params.amount = "12.34";
      params.decimals = 6;
      
      const result = await service.convertToBaseUnit(params);
      
      expect(result).toHaveProperty("value");
      expect(result).toHaveProperty("decimals", 6);
    });
  });
  
  describe("convertFromBaseUnit", () => {
    test("should convert base units to decimal amount", async () => {
      const params = new ConvertFromBaseUnitParameters();
      params.amount = 12340000;
      params.decimals = 6;
      
      const result = await service.convertFromBaseUnit(params);
      
      expect(result).toHaveProperty("value");
      expect(result).toHaveProperty("decimals", 6);
    });
  });
});
