import { RadiusWalletConfig } from "../core/types";

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
