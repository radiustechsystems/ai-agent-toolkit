import { EVMWalletClient } from "./EVMWalletClient";

export type RadiusWalletConfig = {
  rpcUrl: string;
  privateKey: string;
};

/**
 * Base interface for creating Radius wallets
 * Each implementation (viem, etc.) will implement this interface
 */
export interface RadiusWalletCreator {
  createWallet(config: RadiusWalletConfig): EVMWalletClient;
}

/**
 * Validates wallet configuration
 * @param config Configuration including RPC URL and private key
 */
export function validateWalletConfig(config: RadiusWalletConfig) {
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
