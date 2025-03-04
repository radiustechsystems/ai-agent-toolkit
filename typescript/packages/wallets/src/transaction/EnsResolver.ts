import { Client } from "@radiustechsystems/sdk";
import { AddressResolutionError } from "../utils/errors";
import { WalletCache } from "../utils/Cache";

/**
 * Simplified service for working with ENS addresses
 */
export class EnsResolver {
  #client: Client;
  #cache?: WalletCache;
  
  /**
   * Creates a new ENS resolver
   * @param client Radius SDK client
   * @param cache Optional cache instance
   */
  constructor(
    client: Client,
    cache?: WalletCache
  ) {
    this.#client = client;
    this.#cache = cache;
  }
  
  /**
   * Resolves an address or ENS name
   * Only supports address format validation, not actual ENS resolution
   * @param name ENS name or address to handle
   * @returns Ethereum address if valid
   */
  async resolveAddress(name: string): Promise<`0x${string}`> {
    // If already a hex address, just return it
    if (/^0x[a-fA-F0-9]{40}$/.test(name)) {
      return name.toLowerCase() as `0x${string}`;
    }
    
    // Check cache first
    if (this.#cache) {
      const cached = this.#cache.get<string>(WalletCache.createEnsKey(name));
      if (cached) {
        return cached as `0x${string}`;
      }
    }
    
    // We no longer support actual ENS resolution to avoid blockchain dependencies
    throw new AddressResolutionError(
      "Cannot resolve ENS name. Direct ENS resolution requires blockchain dependencies.",
      name
    );
  }
  
  /**
   * Checks if an address can be resolved
   * @param nameOrAddress ENS name or address
   * @returns True if the address can be resolved (only validates address format)
   */
  async canResolve(nameOrAddress: string): Promise<boolean> {
    try {
      // Currently only validates address format
      return /^0x[a-fA-F0-9]{40}$/.test(nameOrAddress);
    } catch {
      return false;
    }
  }
}

/**
 * Creates an ENS resolver
 * @param client Radius SDK client
 * @param registryAddress Optional custom ENS registry address
 * @param cache Optional cache instance
 * @returns ENS resolver instance
 */
export function createEnsResolver(
  client: Client,
  registryAddress?: string,
  cache?: WalletCache
): EnsResolver {
  return new EnsResolver(client, cache);
}
