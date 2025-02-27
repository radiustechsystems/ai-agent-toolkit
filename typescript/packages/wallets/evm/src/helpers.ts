import { EVMWalletClient } from "./evm-wallet-client";
import { Account, Client, withPrivateKey, withLogger } from "@radiustechsystems/sdk";
import { radiusSdk, RadiusSDKWalletClient } from "./radius-sdk-wallet-client";
import { radiusSmartWallet, RadiusSmartWalletClient } from "./radius-smart-wallet-client";

/**
 * Configuration for creating a Radius wallet
 */
export type RadiusWalletConfig = {
  rpcUrl: string;
  privateKey: string;
};

/**
 * Base interface for creating Radius wallets
 * Each implementation will implement this interface
 */
export interface RadiusWalletCreator {
  createWallet(config: RadiusWalletConfig): Promise<EVMWalletClient>;
}

/**
 * Validates wallet configuration
 * @param config Configuration including RPC URL and private key
 */
export function validateWalletConfig(config: RadiusWalletConfig): void {
  if (!config.rpcUrl) {
    throw new Error("RPC URL is required");
  }
  if (!config.privateKey) {
    throw new Error("Private key is required");
  }
  if (!config.privateKey.startsWith("0x")) {
    throw new Error("Private key must be a hex string starting with 0x");
  }
}

/**
 * Creates a Radius wallet client using the native Radius SDK
 * @param config Configuration including RPC URL and private key
 * @returns A configured RadiusSDKWalletClient ready for use
 */
export async function createRadiusSDKWallet(config: RadiusWalletConfig): Promise<RadiusSDKWalletClient> {
  // Validate configuration
  validateWalletConfig(config);

  try {
    // Create SDK client
    const client = await Client.New(
      config.rpcUrl,
      withLogger((message, data) => {
        // Optional console logging for debugging
        if (process.env.DEBUG === "true") {
          console.log(`[Radius] ${message}`, data);
        }
      })
    );
    
    // Create account with private key
    const account = await Account.New(
      withPrivateKey(config.privateKey, client)
    );
    
    // Return the RadiusSDKWalletClient
    return radiusSdk(account, client);
  } catch (error) {
    throw new Error(`Failed to create Radius SDK wallet: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Implementation of the RadiusWalletCreator interface for SDK-based wallets
 */
export const radiusSdkWalletCreator: RadiusWalletCreator = {
  createWallet: async (config: RadiusWalletConfig): Promise<RadiusSDKWalletClient> => {
    return await createRadiusSDKWallet(config);
  }
};

/**
 * Creates a Radius smart wallet client using the SDK
 * @param config Configuration with RPC URL and private key
 * @returns Smart wallet client
 */
export async function createRadiusSmartWallet(config: RadiusWalletConfig): Promise<RadiusSmartWalletClient> {
  // Validate configuration
  validateWalletConfig(config);

  try {
    // Create SDK client
    const client = await Client.New(
      config.rpcUrl,
      withLogger((message, data) => {
        // Optional console logging for debugging
        if (process.env.DEBUG === "true") {
          console.log(`[Radius] ${message}`, data);
        }
      })
    );
    
    // Create account with private key
    const account = await Account.New(
      withPrivateKey(config.privateKey, client)
    );
    
    // Return the smart wallet client
    return radiusSmartWallet(account, client);
  } catch (error) {
    throw new Error(`Failed to create Radius smart wallet: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Implementation of the RadiusWalletCreator interface for smart wallets
 */
export const radiusSmartWalletCreator: RadiusWalletCreator = {
  createWallet: async (config: RadiusWalletConfig): Promise<RadiusSmartWalletClient> => {
    return await createRadiusSmartWallet(config);
  }
};

/**
 * Parse a string amount to wei (BigInt)
 * @param value Amount as string (e.g. "1.0")
 * @returns Amount in wei as BigInt
 */
export function parseEther(value: string): bigint {
  // Convert a decimal string like "1.0" to wei (1 ETH = 10^18 wei)
  const [whole, fraction] = value.split(".");

  let wei = BigInt(whole || "0") * BigInt(10**18);
  
  if (fraction) {
    // Handle decimal portion
    const padding = 18 - fraction.length;
    if (padding >= 0) {
      wei += BigInt(fraction) * BigInt(10**padding);
    } else {
      // Truncate if too many decimal places
      wei += BigInt(fraction.slice(0, 18)) * BigInt(10**(18 - fraction.length));
    }
  }
  
  return wei;
}

/**
 * Format a numeric string from base units to decimal representation
 * @param value Value in base units
 * @param decimals Number of decimals
 * @returns Formatted decimal string
 */
export function formatUnits(value: string | bigint, decimals: number): string {
  const valueBI = typeof value === "string" ? BigInt(value) : value;
  const divisor = BigInt(10) ** BigInt(decimals);
  const wholePart = valueBI / divisor;
  const fractionalPart = valueBI % divisor;
  
  if (fractionalPart === BigInt(0)) {
    return wholePart.toString();
  }
  
  // Convert to string and pad with leading zeros
  let fractionalStr = fractionalPart.toString();
  fractionalStr = fractionalStr.padStart(decimals, "0");
  
  // Remove trailing zeros
  fractionalStr = fractionalStr.replace(/0+$/, "");
  
  if (fractionalStr === "") {
    return wholePart.toString();
  }
  
  return `${wholePart}.${fractionalStr}`;
}

/**
 * Parse a decimal string to the equivalent in base units
 * @param value Decimal string
 * @param decimals Number of decimals
 * @returns Base units as BigInt
 */
export function parseUnits(value: string, decimals: number): bigint {
  // Handle empty or invalid input
  if (!value || value === ".") return BigInt(0);
  
  const [wholePart, fractionalPart = ""] = value.split(".");
  
  const wholeBI = BigInt(wholePart || "0") * BigInt(10) ** BigInt(decimals);
  
  // If fractional part is too long, truncate it
  const truncatedFractional = fractionalPart.padEnd(decimals, "0").slice(0, decimals);
  const fractionalBI = BigInt(truncatedFractional.padEnd(decimals, "0"));
  
  return wholeBI + fractionalBI;
}
