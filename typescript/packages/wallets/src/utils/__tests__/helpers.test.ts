import { describe, test, expect } from "vitest";
import { validateWalletConfig, parseEther, formatUnits, parseUnits } from "../helpers";

describe("helpers", () => {
  describe("validateWalletConfig", () => {
    test("should validate valid configuration", () => {
      const config = {
        rpcUrl: "https://rpc.radius.dev",
        privateKey: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      };
      
      expect(() => validateWalletConfig(config)).not.toThrow();
    });
    
    test("should throw for missing RPC URL", () => {
      const config = {
        rpcUrl: "",
        privateKey: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      };
      
      expect(() => validateWalletConfig(config)).toThrowError("RPC URL is required");
    });
    
    test("should throw for missing private key", () => {
      const config = {
        rpcUrl: "https://rpc.radius.dev",
        privateKey: ""
      };
      
      expect(() => validateWalletConfig(config)).toThrowError("Private key is required");
    });
    
    test("should throw for private key without 0x prefix", () => {
      const config = {
        rpcUrl: "https://rpc.radius.dev",
        privateKey: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      };
      
      expect(() => validateWalletConfig(config)).toThrowError("Private key must be a hex string starting with 0x");
    });
  });
  
  describe("parseEther", () => {
    test("should parse whole numbers", () => {
      expect(parseEther("1")).toBe(BigInt("1000000000000000000"));
      expect(parseEther("100")).toBe(BigInt("100000000000000000000"));
      expect(parseEther("0")).toBe(BigInt(0));
    });
    
    test("should parse decimal values", () => {
      expect(parseEther("1.5")).toBe(BigInt("1500000000000000000"));
      expect(parseEther("0.1")).toBe(BigInt("100000000000000000"));
      expect(parseEther("0.001")).toBe(BigInt("1000000000000000"));
    });
    
    test("should handle string without whole part", () => {
      expect(parseEther(".5")).toBe(BigInt("500000000000000000"));
    });
    
    test("should truncate values with too many decimal places", () => {
      // More than 18 decimal places should be truncated
      expect(parseEther("1.1234567890123456789")).toBe(BigInt("1123456789012345678"));
    });
  });
  
  describe("formatUnits", () => {
    test("should format whole numbers", () => {
      expect(formatUnits(BigInt("1000000000000000000"), 18)).toBe("1");
      expect(formatUnits("1000000000000000000", 18)).toBe("1");
      expect(formatUnits(BigInt(0), 18)).toBe("0");
    });
    
    test("should format decimal values", () => {
      expect(formatUnits(BigInt("1500000000000000000"), 18)).toBe("1.5");
      expect(formatUnits(BigInt("123456789012345678"), 18)).toBe("0.123456789012345678");
    });
    
    test("should handle different decimal places", () => {
      expect(formatUnits(BigInt(1500), 3)).toBe("1.5");
      expect(formatUnits(BigInt(15), 1)).toBe("1.5");
    });
    
    test("should remove trailing zeros", () => {
      expect(formatUnits(BigInt("1500000000000000000"), 18)).toBe("1.5");
      expect(formatUnits(BigInt("1000000000000000000"), 18)).toBe("1");
    });
  });
  
  describe("parseUnits", () => {
    test("should parse whole numbers", () => {
      expect(parseUnits("1", 18)).toBe(BigInt("1000000000000000000"));
      expect(parseUnits("100", 18)).toBe(BigInt("100000000000000000000"));
      expect(parseUnits("0", 18)).toBe(BigInt(0));
    });
    
    test("should parse decimal values", () => {
      expect(parseUnits("1.5", 18)).toBe(BigInt("1500000000000000000"));
      expect(parseUnits("0.1", 18)).toBe(BigInt("100000000000000000"));
    });
    
    test("should handle empty strings and invalid inputs", () => {
      expect(parseUnits("", 18)).toBe(BigInt(0));
      expect(parseUnits(".", 18)).toBe(BigInt(0));
    });
    
    test("should pad or truncate decimals appropriately", () => {
      // Fewer than specified decimals, should pad with zeros
      expect(parseUnits("0.5", 18)).toBe(BigInt("500000000000000000"));
      
      // More than specified decimals, should truncate
      expect(parseUnits("0.123", 2)).toBe(BigInt(12));
    });
    
    test("should handle different decimal places", () => {
      expect(parseUnits("1.5", 3)).toBe(BigInt(1500));
      expect(parseUnits("1.5", 1)).toBe(BigInt(15));
    });
  });
});
