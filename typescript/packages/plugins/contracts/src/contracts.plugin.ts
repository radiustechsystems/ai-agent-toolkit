import { type Chain, PluginBase } from "@radiustechsystems/ai-agent-core";
import type { RadiusWalletInterface } from "@radiustechsystems/ai-agent-wallet";
import { ContractsService } from "./contracts.service";

export class ContractsPlugin extends PluginBase<RadiusWalletInterface> {
  constructor() {
    super("contracts", [new ContractsService()]);
  }

  // Only support Radius chains
  supportsChain = (chain: Chain) => {
    // First check if it's an EVM chain
    if (chain.type !== "evm") return false;
    
    // Check if it's a Radius chain by id
    const chainId = typeof chain.id === "string" ? chain.id : String(chain.id);
    
    // We could try to check the chain name, but it may not be present on the Chain type
    // To be safe, just check the ID
    return chainId === "radius";
  };
}

export function contracts() {
  return new ContractsPlugin();
}
