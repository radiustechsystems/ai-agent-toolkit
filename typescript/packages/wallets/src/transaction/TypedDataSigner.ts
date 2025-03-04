import { Account } from "@radiustechsystems/sdk";
import { RadiusTypedData } from "../core/WalletTypes";
import { SigningError } from "../utils/errors";

// Simple implementation of a structured data encoder/signer
// Note: A production implementation would use a specialized library for this

/**
 * Service for signing structured data according to EIP-712 standard
 */
export class TypedDataSigner {
  /**
   * Signs a typed data structure according to EIP-712
   * @param account The account to sign with
   * @param data The typed data to sign
   * @returns The signature
   */
  async signTypedData(
    account: Account,
    data: RadiusTypedData
  ): Promise<string> {
    try {
      // Encode typed data to a string message
      // For now, this is a simplified approach
      const encodedData = this.#encodeTypedData(data);
      
      // Sign the encoded message - this returns a Uint8Array
      const signatureBytes = await account.signMessage(encodedData);
      
      // Convert the Uint8Array to a hex string with 0x prefix
      const signature = "0x" + Array.from(signatureBytes)
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
      
      return signature;
    } catch (error) {
      throw new SigningError(
        `Failed to sign typed data: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
  
  /**
   * Encodes typed data into a string for signing
   * @param data The typed data to encode
   * @returns Encoded string representation
   */
  #encodeTypedData(data: RadiusTypedData): string {
    // This is a simplified implementation
    // A full implementation should follow the EIP-712 encoding rules
    
    // Create a simple string representation
    const encoded = JSON.stringify({
      types: {
        EIP712Domain: this.#getDomainFields(data.domain),
        ...data.types,
      },
      domain: data.domain,
      primaryType: data.primaryType,
      message: data.message,
    }, null, 2);
    
    return `EIP-712 Signed Message:\n${encoded}`;
  }
  
  /**
   * Gets domain fields based on which properties are present
   * @param domain The domain object
   * @returns Array of domain fields
   */
  #getDomainFields(domain: RadiusTypedData["domain"]): Array<{ name: string; type: string }> {
    const fields: Array<{ name: string; type: string }> = [];
    
    if (domain.name !== undefined) fields.push({ name: "name", type: "string" });
    if (domain.version !== undefined) fields.push({ name: "version", type: "string" });
    if (domain.chainId !== undefined) fields.push({ name: "chainId", type: "uint256" });
    if (domain.verifyingContract !== undefined) fields.push({ name: "verifyingContract", type: "address" });
    if (domain.salt !== undefined) fields.push({ name: "salt", type: "bytes32" });
    
    return fields;
  }
}

/**
 * Creates a typed data signer
 * @returns TypedDataSigner instance
 */
export function createTypedDataSigner(): TypedDataSigner {
  return new TypedDataSigner();
}
