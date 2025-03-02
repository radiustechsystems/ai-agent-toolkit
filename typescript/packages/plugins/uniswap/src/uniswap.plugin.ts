import { type Chain, PluginBase } from "@radiustechsystems/ai-agent-core";
import { type RadiusWalletInterface, radiusTestnetBase } from "@radiustechsystems/ai-agent-wallet";
import { type UniswapConfig } from "./types/UniswapCtorParams";
import { UniswapService } from "./uniswap.service";

// Define supported chains where Uniswap is available
// Currently only Radius testnet is supported
const SUPPORTED_CHAINS = [radiusTestnetBase];

/**
 * Uniswap plugin provides tools to interact with Uniswap protocol
 */
export class UniswapPlugin extends PluginBase<RadiusWalletInterface> {
  /**
   * Creates a new Uniswap plugin
   * @param config Configuration for the Uniswap plugin
   */
  constructor(config: UniswapConfig) {
    super("uniswap", [new UniswapService(config)]);
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
 * Creates a Uniswap plugin with the specified configuration
 * @param config Configuration for the Uniswap plugin
 * @returns A new UniswapPlugin instance
 */
export function uniswap(config: UniswapConfig) {
  return new UniswapPlugin(config);
}
