import { Tool } from "@radiustechsystems/ai-agent-core";
import { RadiusWalletInterface } from "@radiustechsystems/ai-agent-wallet";
import { 
  Hash, 
  Address
} from "@radiustechsystems/sdk";
import {
  GenerateHashParameters,
  VerifySignatureParameters,
  RecoverAddressParameters,
  ValidateAddressParameters,
  FormatAddressParameters,
  HashMessageParameters
} from "./parameters";

export class CryptoService {
  constructor() {}

  @Tool({
    description: "Generate a Keccak-256 hash of input data",
  })
  async generateHash(parameters: GenerateHashParameters) {
    try {
      const encoding = parameters.encoding || "utf8";
      const data = parameters.data;
      
      // Use the SDK's Hash utility
      const hash = encoding === "hex" 
        ? Hash.keccak256(data) 
        : Hash.keccak256(Buffer.from(data, "utf8").toString("hex"));
        
      return {
        hash,
        input: data,
        encoding
      };
    } catch (error) {
      throw Error(`Failed to generate hash: ${error}`);
    }
  }

  @Tool({
    description: "Verify that a signature was created by a specific address",
  })
  async verifySignature(walletClient: RadiusWalletInterface, parameters: VerifySignatureParameters) {
    try {
      const { message, signature, address, isHashed } = parameters;
      
      // Use wallet client to verify signature
      const isValid = await walletClient.verifySignature({
        message,
        signature,
        address,
        isHashed: isHashed || false
      });
      
      return {
        isValid,
        message,
        signature,
        address
      };
    } catch (error) {
      throw Error(`Failed to verify signature: ${error}`);
    }
  }

  @Tool({
    description: "Recover the address that created a signature",
  })
  async recoverAddress(walletClient: RadiusWalletInterface, parameters: RecoverAddressParameters) {
    try {
      const { message, signature, isHashed } = parameters;
      
      // Use wallet client to recover address from signature
      const recoveredAddress = await walletClient.recoverAddress({
        message,
        signature,
        isHashed: isHashed || false
      });
      
      return {
        recoveredAddress,
        message,
        signature
      };
    } catch (error) {
      throw Error(`Failed to recover address: ${error}`);
    }
  }

  @Tool({
    description: "Validate if an address is properly formatted for Radius",
  })
  async validateAddress(parameters: ValidateAddressParameters) {
    try {
      const { address } = parameters;
      
      // Use SDK's Address utility to validate
      const isValid = Address.isValid(address);
      
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

  @Tool({
    description: "Format an address in either checksum or lowercase format",
  })
  async formatAddress(parameters: FormatAddressParameters) {
    try {
      const { address, format } = parameters;
      
      // Validate address first
      if (!Address.isValid(address)) {
        throw new Error("Invalid address format");
      }
      
      // Format address according to desired format
      const formattedAddress = format === "checksum" 
        ? Address.toChecksumAddress(address)
        : address.toLowerCase();
      
      return {
        original: address,
        formatted: formattedAddress,
        format
      };
    } catch (error) {
      throw Error(`Failed to format address: ${error}`);
    }
  }

  @Tool({
    description: "Hash a message according to EIP-191 standard for signing",
  })
  async hashMessage(parameters: HashMessageParameters) {
    try {
      const { message, encoding } = parameters;
      const inputEncoding = encoding || "utf8";
      
      // Convert message to right format based on encoding
      const messageToHash = inputEncoding === "hex" 
        ? message 
        : Buffer.from(message, "utf8").toString("hex");
      
      // Create EIP-191 prefixed hash
      const eip191Prefix = "\\x19Ethereum Signed Message:\\n";
      const messageLength = Buffer.from(messageToHash, "hex").length.toString();
      const prefixedMessage = `${eip191Prefix}${messageLength}${messageToHash}`;
      
      // Hash the prefixed message
      const hash = Hash.keccak256(prefixedMessage);
      
      return {
        hash,
        originalMessage: message,
        encoding: inputEncoding
      };
    } catch (error) {
      throw Error(`Failed to hash message: ${error}`);
    }
  }
}