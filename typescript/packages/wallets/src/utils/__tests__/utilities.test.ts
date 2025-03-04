import { describe, test, expect, vi } from "vitest";
import { validateChain, getChainToken } from "../utilities";

// Mock the chain imports
vi.mock("../../chain/radius-chain", () => {
  return {
    isRadiusChain: vi.fn((chainId: number) => chainId === 234),
    radiusTestnetBase: {
      id: 234,
      name: "Radius Testnet",
      nativeCurrency: {
        name: "Radius Token",
        symbol: "RAD",
        decimals: 18
      }
    }
  };
});

describe("utilities", () => {
  describe("validateChain", () => {
    test("should not throw for supported chain", () => {
      expect(() => validateChain(1223953)).not.toThrow();
    });
    
    test("should throw for unsupported chain", () => {
      expect(() => validateChain(1)).toThrow(
        "Chain 1 is not supported. This toolkit only supports the Radius testnet."
      );
    });
  });
  
  describe("getChainToken", () => {
    test("should return correct token info for Radius testnet", () => {
      const token = getChainToken(1223953);
      expect(token).toEqual({
        symbol: "ETH",
        name: "ETH",
        decimals: 18
      });
    });
    
    test("should return default ETH for unknown chains", () => {
      const token = getChainToken(1);
      expect(token).toEqual({
        symbol: "ETH",
        name: "ETH",
        decimals: 18
      });
    });
  });
});
