import { type Chain, PluginBase } from '@radiustechsystems/ai-agent-core';
import type { RadiusWalletInterface } from '@radiustechsystems/ai-agent-wallet';
import { DataAccessService } from './data-access.service';
import type { DataAccessOptions } from './types';

export class DataAccessPlugin extends PluginBase<RadiusWalletInterface> {
  constructor(options: DataAccessOptions) {
    super('dataAccess', [new DataAccessService(options)]);
  }

  // Support EVM chains
  supportsChain = (chain: Chain) => chain.type === 'evm';
}

/**
 * Factory function for creating the Data Access plugin
 * @param options Plugin configuration options
 * @returns A configured DataAccessPlugin instance
 */
export function dataAccess(options: DataAccessOptions) {
  return new DataAccessPlugin(options);
}
