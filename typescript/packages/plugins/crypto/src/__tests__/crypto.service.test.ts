import { describe, test, expect, vi, beforeEach } from "vitest";
import { CryptoService } from "../crypto.service";
import { ValidateAddressParameters, HashDataParameters } from "../parameters";
import { RadiusWalletInterface } from "@radiustechsystems/ai-agent-wallet";
import { RadiusChain } from "@radiustechsystems/ai-agent-core";

// Mock the SDK - use async function
vi.mock("@radiustechsystems/sdk", async () => {
  const mockBytes = new Uint8Array([0x1, 0x2, 0x3, 0x4]);
  const mockAddress = {
    ethAddress: vi.fn().mockReturnValue("0x1234567890123456789012345678901234567890"),
    checksumAddress: vi.fn().mockReturnValue("0x1234567890123456789012345678901234567890"),
    bytes: vi.fn().mockReturnValue(mockBytes)
  };

  return {
    AddressFromHex: vi.fn().mockReturnValue(mockAddress)
  };
});

// We don't need to mock crypto utils anymore since we're not importing from this path

// Mock the required dependencies for the tool decorator - use async function
vi.mock("@radiustechsystems/ai-agent-core", async () => {
  // Import the actual module so we get the right types
  const actual = await vi.importActual("@radiustechsystems/ai-agent-core");
  return {
    ...actual,
    Tool: vi.fn().mockImplementation(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (target: any, propertyKey: string) => {
        // This mock implementation just marks the method as a tool
        target[propertyKey].isTool = true;
      };
    })
  };
});

// Create a more complete mock wallet client
const mockWalletClient: Partial<RadiusWalletInterface> = {
  getChain: vi.fn().mockReturnValue({ id: 1, type: "evm" } as RadiusChain),
  getAddress: vi.fn().mockReturnValue("0xmockaddress"),
  signMessage: vi.fn().mockResolvedValue({
    signature: "0xmocksignature",
    r: "0x1234",
    s: "0x5678",
    v: 27
  })
};

describe("CryptoService", () => {
  let service: CryptoService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CryptoService();
  });

  describe("validateAddress", () => {
    test("should validate a correct address", async () => {
      const parameters = new ValidateAddressParameters();
      parameters.address = "0xabcdef1234567890abcdef1234567890abcdef12";

      const result = await service.validateAddress(parameters);

      expect(result.isValid).toBe(true);
      expect(result.address).toBe("0x1234567890123456789012345678901234567890");
      expect(result.bytes).toEqual([1, 2, 3, 4]);
    });

    test("should handle invalid addresses", async () => {
      // Mock the AddressFromHex to throw an error for invalid address
      const { AddressFromHex } = vi.mocked(await import("@radiustechsystems/sdk"));
      AddressFromHex.mockImplementationOnce(() => {
        throw new Error("Invalid address");
      });

      const parameters = new ValidateAddressParameters();
      parameters.address = "not-an-address";

      const result = await service.validateAddress(parameters);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.address).toBe("not-an-address");
    });
  });

  describe("hashData", () => {
    test("should hash UTF-8 data", async () => {
      const parameters = new HashDataParameters();
      parameters.data = "test data";
      parameters.encoding = "utf8";

      // Mock TextEncoder
      global.TextEncoder = class {
        encode(input: string) {
          return new Uint8Array(input.split("").map(c => c.charCodeAt(0)));
        }
      } as unknown as typeof TextEncoder;

      const result = await service.hashData(
        mockWalletClient as RadiusWalletInterface,
        parameters
      );

      expect(result.success).toBe(true);
      expect(result.hash).toBe("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef");
      expect(result.bytes).toHaveLength(32); // Keccak-256 is 32 bytes
    });

    test("should hash hex data", async () => {
      const parameters = new HashDataParameters();
      parameters.data = "1234abcd";
      parameters.encoding = "hex";

      const result = await service.hashData(
        mockWalletClient as RadiusWalletInterface,
        parameters
      );

      expect(result.success).toBe(true);
      expect(result.hash).toBe("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef");
      expect(result.bytes).toHaveLength(32);
    });

    test("should handle errors gracefully", async () => {
      const parameters = new HashDataParameters();
      parameters.data = "test data";
      parameters.encoding = "utf8";

      // Mock the wallet to throw an error when signing messages
      const mockFailingWallet = {
        ...mockWalletClient,
        signMessage: vi.fn().mockRejectedValue(new Error("Signing error"))
      };

      const result = await service.hashData(
        mockFailingWallet as RadiusWalletInterface,
        parameters
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Error hashing data");
    });
  });
});
