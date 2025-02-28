import { describe, test, expect, vi, beforeEach } from "vitest";
import { TypedDataSigner, createTypedDataSigner } from "../typed-data-signer";
import { SigningError } from "../../utils/errors";

// Mock SDK Account class
vi.mock("@radiustechsystems/sdk", () => ({
  Account: vi.fn().mockImplementation(() => ({
    signMessage: vi.fn().mockResolvedValue("0xmocksignature")
  }))
}));

describe("TypedDataSigner", () => {
  let signer: TypedDataSigner;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockAccount: any;
  
  beforeEach(() => {
    signer = createTypedDataSigner();
    mockAccount = {
      signMessage: vi.fn().mockResolvedValue("0xmocksignature")
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
    
    expect(signature).toBe("0xmocksignature");
    expect(mockAccount.signMessage).toHaveBeenCalled();
  });
  
  test("should throw SigningError when signing fails", async () => {
    const mockFailingAccount = {
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
    // Test the private method indirectly through the sign method
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const encodeDataSpy = vi.spyOn(signer as any, "#encodeTypedData");
    
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
    
    expect(encodeDataSpy).toHaveBeenCalled();
    // The encoded string should contain the domain fields
    const encodedData = encodeDataSpy.mock.results[0].value;
    expect(encodedData).toContain("Test Domain");
    expect(encodedData).toContain("verifyingContract");
    expect(encodedData).toContain("salt");
  });
  
  test("createTypedDataSigner should return TypedDataSigner instance", () => {
    const signer = createTypedDataSigner();
    expect(signer).toBeInstanceOf(TypedDataSigner);
  });
});