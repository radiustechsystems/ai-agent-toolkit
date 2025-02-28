import { describe, test, expect } from "vitest";
import { 
  radiusTestnetBase, 
  getRadiusChainConfig, 
  isRadiusChain, 
  getRadiusChainId
} from "../radius-chain";

describe("radius-chain", () => {
  describe("radiusTestnetBase", () => {
    test("should have correct chain configuration", () => {
      expect(radiusTestnetBase).toEqual({
        id: 1223953,
        name: "Radius Testnet",
        network: "radius-testnet",
        nativeCurrency: {
          decimals: 18,
          name: "ETH",
          symbol: "ETH",
        },
        testnet: true
      });
    });
  });
  
  describe("getRadiusChainConfig", () => {
    test("should return chain configuration with provided RPC URL", () => {
      const rpcUrl = "https://test-rpc.radius.dev";
      const config = getRadiusChainConfig({ rpcUrl });
      
      expect(config).toMatchObject({
        ...radiusTestnetBase,
        rpcUrls: {
          default: { http: [rpcUrl] },
          public: { http: [rpcUrl] }
        }
      });
    });
    
    test("should preserve all base chain properties", () => {
      const config = getRadiusChainConfig({ rpcUrl: "https://rpc.radius.dev" });
      
      // Ensure all base properties are preserved
      expect(config.id).toBe(radiusTestnetBase.id);
      expect(config.name).toBe(radiusTestnetBase.name);
      expect(config.network).toBe(radiusTestnetBase.network);
      expect(config.nativeCurrency).toEqual(radiusTestnetBase.nativeCurrency);
      expect(config.testnet).toBe(radiusTestnetBase.testnet);
    });
  });
  
  describe("isRadiusChain", () => {
    test("should return true for Radius testnet chain ID", () => {
      expect(isRadiusChain(radiusTestnetBase.id)).toBe(true);
    });
    
    test("should return false for other chain IDs", () => {
      expect(isRadiusChain(1)).toBe(false);
      expect(isRadiusChain(11155111)).toBe(false);
      expect(isRadiusChain(0)).toBe(false);
    });
  });
  
  describe("getRadiusChainId", () => {
    test("should return the correct chain ID", () => {
      expect(getRadiusChainId()).toBe(radiusTestnetBase.id);
    });
  });
});