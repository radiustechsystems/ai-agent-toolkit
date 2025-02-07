import { http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { 
  getRadiusChainConfig, 
  type RadiusWalletConfig,
  type RadiusWalletCreator,
  validateWalletConfig 
} from "@radiustechsystems/ai-agent-wallet-evm";
import { viem } from "./index";

/**
 * Creates a Radius wallet client using viem
 * @param config Configuration including RPC URL and private key
 * @returns A configured ViemEVMWalletClient ready for use with Radius
 */
export function createRadiusViemWallet(config: RadiusWalletConfig) {
  validateWalletConfig(config);

  const chainConfig = getRadiusChainConfig({
    rpcUrl: config.rpcUrl
  });

  const account = privateKeyToAccount(config.privateKey as `0x${string}`);
  
  const walletClient = createWalletClient({
    account,
    transport: http(config.rpcUrl),
    chain: chainConfig
  });

  return viem(walletClient);
}

// Implementation of the RadiusWalletCreator interface
export const viemWalletCreator: RadiusWalletCreator = {
  createWallet: createRadiusViemWallet
};
