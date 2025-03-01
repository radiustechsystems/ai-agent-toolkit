import { type Chain, PluginBase } from "@radiustechsystems/ai-agent-core";
import type { RadiusWalletInterface } from "@radiustechsystems/ai-agent-wallet";
import { ContractsService } from "./contracts.service";

export class ContractsPlugin extends PluginBase<RadiusWalletInterface> {
  constructor() {
    super("contracts", [new ContractsService()]);
  }

  // Only support Radius chains
  supportsChain = (chain: Chain) => 
    chain.type === "evm" && 
    (chain.id === "radius" || chain.name?.toLowerCase().includes("radius"));
}

export function contracts() {
  return new ContractsPlugin();
}