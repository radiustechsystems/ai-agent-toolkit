import { type Chain, PluginBase } from '@radiustechsystems/ai-agent-core';
import type { RadiusWalletInterface } from '@radiustechsystems/ai-agent-wallet';
import { DataAccessService } from './data-access.service';
import type { DataAccessOptions } from './types';

/**
 * DataAccessPlugin for token-gated API access
 *
 * This plugin provides tools for interacting with token-gated APIs that implement
 * the HTTP 402 Payment Required flow using the Radius ERC-1155 contract for access control.
 * Updated to work with the latest contract implementation.
 */
export class DataAccessPlugin extends PluginBase<RadiusWalletInterface> {
  constructor(options: DataAccessOptions) {
    // Validate required options
    if (!options.contractAddress) {
      throw new Error('DataAccessPlugin requires contractAddress option');
    }

    // Validate EIP-712 signature requirements
    if (!options.domainName) {
      throw new Error('DataAccessPlugin requires domainName option for EIP-712 signing');
    }

    if (!options.chainId) {
      throw new Error('DataAccessPlugin requires chainId option for EIP-712 signing');
    }

    // projectId is now optional since it can be retrieved from the contract
    
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
 *   domainName: 'Radius Data Access',
 *   chainId: '0x12ad11', // Radius chain ID
 *   projectId: '0xabcd...', // Optional, can be auto-detected from contract
 *   maxPrice: BigInt('1000000000000000000'), // 1 ETH max
 *   tierSelectionStrategy: 'cheapest'
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
