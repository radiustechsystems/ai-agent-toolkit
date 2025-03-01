import { Tool } from "@radiustechsystems/ai-agent-core";
import {
  ValidateAddressParameters
} from "./parameters";

/**
 * Service class for cryptographic operations
 * Note: Only includes methods that can be reliably implemented without SDK-specific features
 */
export class CryptoService {
  constructor() {}

  @Tool({
    description: "Validate if an address is properly formatted for Radius",
  })
  async validateAddress(parameters: ValidateAddressParameters) {
    try {
      const { address } = parameters;
      
      // Simple validation: Radius addresses are hex strings that start with 0x and are 42 chars long
      const addressRegex = /^0x[0-9a-fA-F]{40}$/;
      const isValid = addressRegex.test(address);
      
      return {
        isValid,
        address
      };
    } catch (error) {
      return {
        isValid: false,
        address: parameters.address,
        error: `${error}`
      };
    }
  }
}
