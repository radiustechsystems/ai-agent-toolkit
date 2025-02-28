import { Account } from "@radiustechsystems/sdk";
import { EVMTypedData } from "./types";
import { SigningError } from "./errors";

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
    data: EVMTypedData
  ): Promise<string> {
    try {
      // Encode typed data to a string message
      // For now, this is a simplified approach
      const encodedData = this.#encodeTypedData(data);
      
      // Sign the encoded message
      const signature = await account.signMessage(encodedData);
      
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
  #encodeTypedData(data: EVMTypedData): string {
    // This is a simplified implementation
    // A full implementation should follow the EIP-712 encoding rules
    
    // Function to stringify domain
    const stringifyDomain = (domain: typeof data.domain): string => {
      let result = "EIP712Domain(";
      const fields: string[] = [];
      
      if (domain.name) fields.push("string name");
      if (domain.version) fields.push("string version");
      if (domain.chainId) fields.push("uint256 chainId");
      if (domain.verifyingContract) fields.push("address verifyingContract");
      if (domain.salt) fields.push("bytes32 salt");
      
      result += fields.join(",") + ")";
      return result;
    };
    
    // Function to stringify the primary type
    const stringifyType = (typeName: string, types: Record<string, unknown>): string => {
      const type = types[typeName] as Array<{ name: string; type: string }>;
      if (!type || !Array.isArray(type)) {
        throw new SigningError(`Type ${typeName} not found in types definition`);
      }
      
      return `${typeName}(${type.map(f => `${f.type} ${f.name}`).join(",")})`;
    };
    
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
  #getDomainFields(domain: EVMTypedData["domain"]): Array<{ name: string; type: string }> {
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