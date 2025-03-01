import { PluginBase } from "@radiustechsystems/ai-agent-core";
import type { RadiusWalletInterface } from "@radiustechsystems/ai-agent-wallet";
import { CryptoService } from "./crypto.service";

export class CryptoPlugin extends PluginBase<RadiusWalletInterface> {
  constructor() {
    super("crypto", [new CryptoService()]);
  }

  // Crypto operations are supported on any chain
  supportsChain = () => true;
}

export function crypto() {
  return new CryptoPlugin();
}