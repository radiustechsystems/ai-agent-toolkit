import { type Chain, PluginBase } from "@radiustechsystems/ai-agent-core";
import { radiusTestnetBase } from "@radiustechsystems/ai-agent-wallet";
import type { UniswapCtorParams } from "./types/UniswapCtorParams";
import { UniswapService } from "./uniswap.service";

const SUPPORTED_CHAINS = [radiusTestnetBase];

export class UniswapPlugin extends PluginBase {
  constructor(params: UniswapCtorParams) {
    super("uniswap", [new UniswapService(params)]);
  }

  supportsChain = (chain: Chain) => chain.type === "evm" && SUPPORTED_CHAINS.some((c) => c.id === chain.id);
}

export const uniswap = (params: UniswapCtorParams) => new UniswapPlugin(params);
