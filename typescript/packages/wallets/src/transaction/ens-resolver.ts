import { Client, Contract, ABI, Address } from "@radiustechsystems/sdk";
import { keccak256 } from "@radiustechsystems/sdk/src/crypto";
import { eth } from "@radiustechsystems/sdk/src/providers/eth";
import { AddressResolutionError } from "../utils/errors";
import { WalletCache } from "../utils/cache";

// ENS Registry ABI (minimal for name resolution)
const ENS_REGISTRY_ABI = [
  {
    "constant": true,
    "inputs": [
      {
        "name": "node",
        "type": "bytes32"
      }
    ],
    "name": "resolver",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "type": "function"
  }
];

// ENS Resolver ABI (minimal for address resolution)
const ENS_RESOLVER_ABI = [
  {
    "constant": true,
    "inputs": [
      {
        "name": "node",
        "type": "bytes32"
      }
    ],
    "name": "addr",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "type": "function"
  }
];

// The official ENS Registry address on Ethereum mainnet
const DEFAULT_ENS_REGISTRY = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";

/**
 * Service for resolving ENS names to addresses
 */
export class EnsResolver {
  #client: Client;
  #registryAddress: string;
  #cache?: WalletCache;
  
  /**
   * Creates a new ENS resolver
   * @param client Radius SDK client
   * @param registryAddress Optional custom ENS registry address
   * @param cache Optional cache instance
   */
  constructor(
    client: Client,
    registryAddress: string = DEFAULT_ENS_REGISTRY,
    cache?: WalletCache
  ) {
    this.#client = client;
    this.#registryAddress = registryAddress;
    this.#cache = cache;
  }
  
  /**
   * Resolves an ENS name to an Ethereum address
   * @param name ENS name to resolve
   * @returns Ethereum address if resolved
   */
  async resolveAddress(name: string): Promise<`0x${string}`> {
    // If already a hex address, just return it
    if (/^0x[a-fA-F0-9]{40}$/.test(name)) {
      return name.toLowerCase() as `0x${string}`;
    }
    
    // Check if it looks like an ENS name
    if (!name.includes(".eth")) {
      throw new AddressResolutionError(`Not a valid ENS name: ${name}`, name);
    }
    
    // Check cache first
    if (this.#cache) {
      const cached = this.#cache.get<string>(WalletCache.createEnsKey(name));
      if (cached) {
        return cached as `0x${string}`;
      }
    }
    
    try {
      // Compute ENS namehash
      const nameHash = this.#namehash(name);
      
      // Create registry contract
      const registryAbi = new ABI(JSON.stringify(ENS_REGISTRY_ABI));
      const registryAddress = new Address(this.#registryAddress);
      const registry = new Contract(registryAddress, registryAbi);
      
      // Get resolver address
      const resolverAddress = await registry.call(this.#client, "resolver", nameHash);
      // eslint-disable-next-line max-len
      if (!resolverAddress || (typeof resolverAddress === "string" && resolverAddress === "0x0000000000000000000000000000000000000000")) {
        throw new AddressResolutionError(`No resolver found for ENS name: ${name}`, name);
      }
      
      // Create resolver contract
      const resolverAbi = new ABI(JSON.stringify(ENS_RESOLVER_ABI));
      const resolverAddressString = String(resolverAddress);
      const resolverAddressObj = new Address(resolverAddressString);
      const resolver = new Contract(resolverAddressObj, resolverAbi);
      
      // Resolve address
      const address = await resolver.call(this.#client, "addr", nameHash);
      if (!address || (typeof address === "string" && address === "0x0000000000000000000000000000000000000000")) {
        throw new AddressResolutionError(`No address found for ENS name: ${name}`, name);
      }
      
      const result = String(address).toLowerCase() as `0x${string}`;
      
      // Cache the result
      if (this.#cache) {
        this.#cache.set(WalletCache.createEnsKey(name), result);
      }
      
      return result;
    } catch (error) {
      if (error instanceof AddressResolutionError) {
        throw error;
      }
      throw new AddressResolutionError(
        `Failed to resolve ENS name ${name}: ${error instanceof Error ? error.message : String(error)}`,
        name
      );
    }
  }
  
  /**
   * Checks if an address can be resolved
   * @param nameOrAddress ENS name or address
   * @returns True if the address can be resolved
   */
  async canResolve(nameOrAddress: string): Promise<boolean> {
    try {
      await this.resolveAddress(nameOrAddress);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Computes the ENS namehash for a name using the Radius SDK
   * @param name ENS name
   * @returns Namehash as bytes32 hex string
   */
  #namehash(name: string): string {
    if (!name) {
      return "0x0000000000000000000000000000000000000000000000000000000000000000";
    }
    
    // Split into labels and reverse
    const labels = name.split(".");
    
    // Start with zero hash
    let node = eth.hexlify(new Uint8Array(32)); // 32 bytes of zeros
    
    // Process each label from right to left
    for (let i = labels.length - 1; i >= 0; i--) {
      const labelHashBytes = keccak256(eth.toUtf8Bytes(labels[i]));
      const nodeBytes = eth.getBytes(node);
      
      // Concatenate and hash
      const concatenated = eth.concat([nodeBytes, labelHashBytes]);
      const hashed = keccak256(concatenated);
      
      // Convert back to hex for the next iteration
      node = eth.hexlify(hashed);
    }
    
    return node;
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
  return new EnsResolver(client, registryAddress, cache);
}