import { describe, test, expect, vi } from "vitest";
import { checkChain, getChainToken } from "../utilities";

// Mock the chain imports
vi.mock("../../chain/RadiusChain", () => {
  return {
    isRadiusChain: vi.fn((chainId: number) => chainId === 1223953),
    radiusTestnetBase: {
      id: 1223953,
      name: "Radius Testnet",
      nativeCurrency: {
        name: "ETH",
        symbol: "ETH",
        decimals: 18
      }
    }
  };
});

describe("utilities", () => {
  describe("checkChain", () => {
    test("should return true for Radius chain", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      expect(checkChain(1223953)).toBe(true);
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
    
    test("should return false and log warning for non-Radius chain", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      expect(checkChain(1)).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Chain 1 is not for Radius")
      );
      consoleSpy.mockRestore();
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
