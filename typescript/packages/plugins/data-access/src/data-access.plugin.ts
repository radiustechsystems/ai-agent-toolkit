import { type Chain, PluginBase } from '@radiustechsystems/ai-agent-core';
import type { RadiusWalletInterface } from '@radiustechsystems/ai-agent-wallet';
import { DataAccessService } from './data-access.service';
import type { DataAccessOptions } from './types';

/**
 * DataAccessPlugin for token-gated API access
 *
 * This plugin provides tools for interacting with token-gated APIs that implement
 * the HTTP 402 Payment Required flow using ERC-1155 tokens for access control.
 */
export class DataAccessPlugin extends PluginBase<RadiusWalletInterface> {
  constructor(options: DataAccessOptions) {
    // Ensure required options are provided
    if (!options.contractAddress) {
      throw new Error('DataAccessPlugin requires contractAddress option');
    }

    if (!options.projectId) {
      throw new Error('DataAccessPlugin requires projectId option');
    }

    super('dataAccess', [new DataAccessService(options)]);
  }

  // Support EVM chains
  supportsChain = (chain: Chain) => chain.type === 'evm';
}

/**
 * Factory function for creating the Data Access plugin
 *
 * Example usage:
 * ```ts
 * import { dataAccess } from '@radiustechsystems/ai-agent-plugin-data-access';
 *
 * const dataAccessPlugin = dataAccess({
 *   contractAddress: '0x1234...',
 *   projectId: '0xabcd...',
 *   maxPrice: BigInt('1000000000000000000'), // 1 ETH max
 *   tierSelectionStrategy: 'cheapest',
 *   domainName: 'My Data Service'
 * });
 *
 * const agent = createAgent({
 *   plugins: [dataAccessPlugin]
 * });
 * ```
 *
 * @param options Plugin configuration options
 * @returns A configured DataAccessPlugin instance
 */
export function dataAccess(options: DataAccessOptions) {
  return new DataAccessPlugin(options);
}
