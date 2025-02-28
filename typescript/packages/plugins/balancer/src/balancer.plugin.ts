import { Chain, PluginBase } from "@radiustechsystems/ai-agent-core";
import { BalancerService } from "./balancer.service";
import { radiusTestnetBase } from "@radiustechsystems/ai-agent-wallet";

export type BalancerConfig = {
    rpcUrl: string;
    apiUrl?: string;
};

const SUPPORTED_CHAINS = [radiusTestnetBase];

export class BalancerPlugin extends PluginBase {
  constructor(config: BalancerConfig) {
    super("balancer", [new BalancerService(config)]);
  }

  supportsChain = (chain: Chain) => chain.type === "evm" && SUPPORTED_CHAINS.some((c) => c.id === chain.id);
}

export function balancer(config: BalancerConfig) {
  return new BalancerPlugin(config);
}
