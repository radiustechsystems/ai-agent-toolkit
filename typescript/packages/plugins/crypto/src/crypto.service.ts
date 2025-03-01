import { Tool } from "@radiustechsystems/ai-agent-core";
import { AddressFromHex } from "@radiustechsystems/sdk";
import { keccak256 } from "@radiustechsystems/sdk/src/crypto/utils";
import type { RadiusWalletInterface } from "@radiustechsystems/ai-agent-wallet";
import {
  ValidateAddressParameters,
  HashDataParameters
} from "./parameters";

/**
 * Service class for cryptographic operations
 * Leverages Radius SDK for crypto operations
 */
export class CryptoService {
  constructor() {}

  @Tool({
    description: "Validate if an address is properly formatted and checksummed for Radius",
  })
  async validateAddress(parameters: ValidateAddressParameters) {
    try {
      const { address } = parameters;
      
      // Use SDK's Address class for proper validation
      const validAddress = AddressFromHex(address);
      
      return {
        isValid: true,
        address: validAddress.ethAddress(),
        bytes: Array.from(validAddress.bytes())
      };
    } catch (error) {
      return {
        isValid: false,
        address: parameters.address,
        error: `${error}`
      };
    }
  }

  @Tool({
    description: "Generate a Keccak-256 hash of input data",
  })
  async hashData(
    wallet: RadiusWalletInterface,
    parameters: HashDataParameters
  ) {
    try {
      const { data, encoding } = parameters;
      
      // Convert input to bytes based on encoding
      let bytes: Uint8Array;
      if (encoding === "hex") {
        // Handle hex input - standard TextEncoder won't work for hex
        const cleanHex = data.startsWith("0x") ? data.slice(2) : data;
        bytes = new Uint8Array(cleanHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
      } else {
        // Handle UTF-8 input using standard TextEncoder
        bytes = new TextEncoder().encode(data);
      }
      
      // Use SDK's keccak256 function from crypto/utils
      const hashBytes = keccak256(bytes);
      
      // Convert to hex string for display
      const hashHex = Array.from(hashBytes)
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
      
      return {
        hash: `0x${hashHex}`,
        bytes: Array.from(hashBytes),
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: `Error hashing data: ${error}`
      };
    }
  }
}
