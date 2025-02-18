import { type Chain, PluginBase } from "@radiustechsystems/ai-agent-core";
import type { EVMWalletClient } from "@radiustechsystems/ai-agent-wallet-evm";
import { Erc20Service } from "./erc20.service";
import { type Token } from "./token";

export type ERC20PluginCtorParams = {
    tokens: Token[];
};

export class ERC20Plugin extends PluginBase<EVMWalletClient> {
  constructor({ tokens }: ERC20PluginCtorParams) {
    super("erc20", [new Erc20Service({ tokens })]);
  }

  supportsChain = (chain: Chain) => chain.type === "evm";
}

export function erc20({ tokens }: ERC20PluginCtorParams) {
  return new ERC20Plugin({ tokens });
}
