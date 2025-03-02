import { type Chain, PluginBase } from "@radiustechsystems/ai-agent-core";
import { type RadiusWalletInterface, radiusTestnetBase } from "@radiustechsystems/ai-agent-wallet";
import { BalancerService } from "./balancer.service";

export type BalancerConfig = {
    rpcUrl: string;
    apiUrl?: string;
};

// Define supported chains where Balancer is available
// Currently only Radius testnet is supported
const SUPPORTED_CHAINS = [radiusTestnetBase];

export class BalancerPlugin extends PluginBase<RadiusWalletInterface> {
  constructor(config: BalancerConfig) {
    super("balancer", [new BalancerService(config)]);
  }

  /**
   * Determines if the plugin supports a specific blockchain
   * @param chain Chain to check
   * @returns True if the chain is supported, false otherwise
   */
  supportsChain = (chain: Chain) => {
    // First check if it's an EVM chain
    if (chain.type !== "evm") return false;
    
    // Check if it's in our list of supported chains
    return SUPPORTED_CHAINS.some((supportedChain) => {
      const chainId = typeof chain.id === "string" ? chain.id : String(chain.id);
      const supportedId = typeof supportedChain.id === "string" ? supportedChain.id : String(supportedChain.id);
      return chainId === supportedId;
    });
  };
}

/**
 * Creates a Balancer plugin with the specified configuration
 * @param config Configuration for the Balancer plugin
 * @returns A new BalancerPlugin instance
 */
export function balancer(config: BalancerConfig) {
  return new BalancerPlugin(config);
}
