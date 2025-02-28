import { describe, test, expect, vi, beforeEach } from "vitest";
import { TypedDataSigner, createTypedDataSigner } from "../typed-data-signer";
import { SigningError } from "../../utils/errors";

// Mock SDK Account class
vi.mock("@radiustechsystems/sdk", () => ({
  Account: vi.fn().mockImplementation(() => ({
    // Return a Uint8Array that would convert to "0xmocksignature"
    signMessage: vi.fn().mockResolvedValue(new Uint8Array([0x6d, 0x6f, 0x63, 0x6b, 0x73, 0x69, 0x67, 0x6e, 0x61, 0x74, 0x75, 0x72, 0x65]))
  }))
}));

describe("TypedDataSigner", () => {
  let signer: TypedDataSigner;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockAccount: any;
  
  beforeEach(() => {
    signer = createTypedDataSigner();
    // Mock signMessage to return a Uint8Array as the real implementation would
    mockAccount = {
      signMessage: vi.fn().mockResolvedValue(new Uint8Array([0x6d, 0x6f, 0x63, 0x6b, 0x73, 0x69, 0x67, 0x6e, 0x61, 0x74, 0x75, 0x72, 0x65]))
    };
  });
  
  test("should sign EIP-712 typed data", async () => {
    const typedData = {
      domain: {
        name: "Test Domain",
        version: "1",
        chainId: 1,
        verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC"
      },
      types: {
        Person: [
          { name: "name", type: "string" },
          { name: "wallet", type: "address" }
        ]
      },
      primaryType: "Person",
      message: {
        name: "Bob",
        wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB"
      }
    };
    
    const signature = await signer.signTypedData(mockAccount, typedData);
    
    // The expected signature should now be a hex string with 0x prefix,
    // representing the bytes in mockAccount.signMessage's return value
    expect(signature).toBe("0x6d6f636b7369676e6174757265");
    expect(mockAccount.signMessage).toHaveBeenCalled();
  });
  
  test("should throw SigningError when signing fails", async () => {
    const mockFailingAccount = {
      // Mock the failing signMessage with same return type (Uint8Array)
      signMessage: vi.fn().mockRejectedValue(new Error("Signing failed"))
    };
    
    const typedData = {
      domain: { name: "Test" },
      types: { Test: [] },
      primaryType: "Test",
      message: {}
    };
    
    await expect(signer.signTypedData(mockFailingAccount, typedData))
      .rejects.toThrow(SigningError);
  });
  
  test("should encode domain fields correctly", async () => {
    // Instead of spying on the private method, we'll test its behavior indirectly
    // by checking what gets passed to signMessage
    
    const typedData = {
      domain: {
        name: "Test Domain",
        version: "1",
        chainId: 1,
        verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
        salt: "0x123456789abcdef"
      },
      types: { Test: [] },
      primaryType: "Test",
      message: {}
    };
    
    await signer.signTypedData(mockAccount, typedData);
    
    // Check that signMessage was called
    expect(mockAccount.signMessage).toHaveBeenCalled();
    
    // Get what was passed to signMessage
    const encodedData = mockAccount.signMessage.mock.calls[0][0];
    
    // Verify the encoded data contains the expected fields
    expect(encodedData).toContain("Test Domain");
    expect(encodedData).toContain("verifyingContract");
    expect(encodedData).toContain("salt");
  });
  
  test("createTypedDataSigner should return TypedDataSigner instance", () => {
    const signer = createTypedDataSigner();
    expect(signer).toBeInstanceOf(TypedDataSigner);
  });
});