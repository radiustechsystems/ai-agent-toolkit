/**
 * Simple caching system for blockchain data
 */
export class WalletCache {
  private cache: Map<string, { value: unknown; timestamp: number }> = new Map();
  private readonly maxAge: number;

  /**
   * Creates a new cache instance
   * @param maxAge Maximum age of cache entries in milliseconds (default: 30 seconds)
   */
  constructor(maxAge = 30000) {
    this.maxAge = maxAge;
  }

  /**
   * Gets a value from the cache
   * @param key Cache key
   * @returns Cached value or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check if the entry has expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  /**
   * Sets a value in the cache
   * @param key Cache key
   * @param value Value to cache
   */
  set(key: string, value: unknown): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Deletes a value from the cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clears all entries from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Gets a value from the cache or calls the provider function
   * @param key Cache key
   * @param provider Function to call if cache miss
   * @returns Cached or newly fetched value
   */
  async getOrFetch<T>(key: string, provider: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) return cached;

    const value = await provider();
    this.set(key, value);
    return value;
  }

  /**
   * Generates a cache key for contract reads
   * @param address Contract address
   * @param method Contract method
   * @param args Method arguments
   * @returns Cache key
   */
  static createContractReadKey(address: string, method: string, args: unknown[] = []): string {
    return `read:${address.toLowerCase()}:${method}:${JSON.stringify(args)}`;
  }

  /**
   * Generates a cache key for balances
   * @param address Address to check balance
   * @param tokenAddress Optional token address (for ERC20)
   * @returns Cache key
   */
  static createBalanceKey(address: string, tokenAddress?: string): string {
    return tokenAddress
      ? `balance:${address.toLowerCase()}:${tokenAddress.toLowerCase()}`
      : `balance:${address.toLowerCase()}`;
  }

  /**
   * Generates a cache key for ENS resolution
   * @param name ENS name or address
   * @returns Cache key
   */
  static createEnsKey(name: string): string {
    return `ens:${name.toLowerCase()}`;
  }
}

/**
 * Creates a singleton cache instance with the given configuration
 * @param maxAge Maximum age of cache entries
 * @returns Cache instance
 */
export function createCache(maxAge?: number): WalletCache {
  return new WalletCache(maxAge);
}
