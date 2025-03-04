import { describe, test, expect, vi, beforeEach, type Mock } from "vitest";
import { TypedDataSigner, createTypedDataSigner } from "../TypedDataSigner";
import { SigningError } from "../../utils/errors";

import { Account } from "@radiustechsystems/sdk";

// Mock SDK dependencies
vi.mock("@radiustechsystems/sdk", () => {
  // Mock the Address class and zeroAddress function
  const mockAddress = {
    equals: vi.fn().mockReturnValue(false),
    ethAddress: vi.fn().mockReturnValue("0xmockaddress")
  };
  
  return {
    Account: vi.fn().mockImplementation(() => ({
      // Required Account methods and properties
      signer: { address: vi.fn() },
      address: vi.fn().mockReturnValue(mockAddress),
      balance: vi.fn().mockResolvedValue(BigInt(0)),
      nonce: vi.fn().mockResolvedValue(0),
      send: vi.fn().mockResolvedValue({}),
      signTransaction: vi.fn().mockResolvedValue({}),
      // Return a Uint8Array that would convert to "0xmocksignature"
      // eslint-disable-next-line max-len
      signMessage: vi.fn().mockResolvedValue(new Uint8Array([0x6d, 0x6f, 0x63, 0x6b, 0x73, 0x69, 0x67, 0x6e, 0x61, 0x74, 0x75, 0x72, 0x65]))
    })),
    Address: vi.fn(),
    zeroAddress: vi.fn().mockReturnValue(mockAddress)
  };
});

describe("TypedDataSigner", () => {
  let signer: TypedDataSigner;
  let mockAccount: Account;
  
  beforeEach(() => {
    signer = createTypedDataSigner();
    
    // Create a complete mock Account with properly typed mock functions
    const mockSignMessage = vi.fn().mockResolvedValue(
      new Uint8Array([0x6d, 0x6f, 0x63, 0x6b, 0x73, 0x69, 0x67, 0x6e, 0x61, 0x74, 0x75, 0x72, 0x65])
    );
    
    mockAccount = {
      signer: { address: vi.fn() },
      address: vi.fn(),
      balance: vi.fn().mockResolvedValue(BigInt(0)),
      nonce: vi.fn().mockResolvedValue(0),
      send: vi.fn().mockResolvedValue({}),
      signTransaction: vi.fn().mockResolvedValue({}),
      signMessage: mockSignMessage
    } as unknown as Account;
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
    // Create a mock function that rejects with an error
    const mockFailSignMessage = vi.fn().mockRejectedValue(new Error("Signing failed"));
    
    const mockFailingAccount = {
      signer: { address: vi.fn() },
      address: vi.fn(),
      balance: vi.fn().mockResolvedValue(BigInt(0)),
      nonce: vi.fn().mockResolvedValue(0),
      send: vi.fn().mockResolvedValue({}),
      signTransaction: vi.fn().mockResolvedValue({}),
      signMessage: mockFailSignMessage
    } as unknown as Account;
    
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
    
    // Access the mock property correctly with proper type assertion
    const signMessageMock = mockAccount.signMessage as unknown as Mock;
    
    // Check that signMessage was called
    expect(signMessageMock).toHaveBeenCalled();
    
    // Get what was passed to signMessage
    const encodedData = signMessageMock.mock.calls[0][0];
    
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
