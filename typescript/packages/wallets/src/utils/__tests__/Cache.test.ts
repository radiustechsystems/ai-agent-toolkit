import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { WalletCache, createCache } from '../Cache';

describe('WalletCache', () => {
  let cache: WalletCache;
  const testKey = 'test:key';
  const testValue = { data: 'test value' };

  beforeEach(() => {
    // Create a new cache instance before each test
    cache = new WalletCache(100); // 100ms cache expiry for fast testing

    // Mock Date.now for controlled testing of expiration
    vi.spyOn(Date, 'now').mockImplementation(() => 1000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should store and retrieve values', () => {
    cache.set(testKey, testValue);
    const retrieved = cache.get<typeof testValue>(testKey);
    expect(retrieved).toEqual(testValue);
  });

  test('should return undefined for non-existent keys', () => {
    const retrieved = cache.get('nonexistent-key');
    expect(retrieved).toBeUndefined();
  });

  test('should expire cached values after maxAge', () => {
    cache.set(testKey, testValue);

    // Advance time beyond maxAge
    vi.spyOn(Date, 'now').mockImplementation(() => 1101); // 1000 + 101 > 100(maxAge)

    const retrieved = cache.get<typeof testValue>(testKey);
    expect(retrieved).toBeUndefined();
  });

  test('should delete values from cache', () => {
    cache.set(testKey, testValue);
    cache.delete(testKey);

    const retrieved = cache.get<typeof testValue>(testKey);
    expect(retrieved).toBeUndefined();
  });

  test('should clear all values from cache', () => {
    cache.set(testKey, testValue);
    cache.set('another-key', 'another-value');

    cache.clear();

    expect(cache.get(testKey)).toBeUndefined();
    expect(cache.get('another-key')).toBeUndefined();
  });

  test('should fetch and cache values with getOrFetch', async () => {
    const mockProvider = vi.fn().mockResolvedValue(testValue);

    // First call should use the provider
    const result1 = await cache.getOrFetch(testKey, mockProvider);
    expect(result1).toEqual(testValue);
    expect(mockProvider).toHaveBeenCalledTimes(1);

    // Second call should use cached value
    const result2 = await cache.getOrFetch(testKey, mockProvider);
    expect(result2).toEqual(testValue);
    expect(mockProvider).toHaveBeenCalledTimes(1); // Still just one call

    // After expiry, should call provider again
    vi.spyOn(Date, 'now').mockImplementation(() => 1101);
    const result3 = await cache.getOrFetch(testKey, mockProvider);
    expect(result3).toEqual(testValue);
    expect(mockProvider).toHaveBeenCalledTimes(2); // Now two calls
  });

  test('should create correct contract read cache keys', () => {
    const address = '0xContract';
    const method = 'balanceOf';
    const args = ['0xUser', 123];

    const key = WalletCache.createContractReadKey(address, method, args);
    expect(key).toBe('read:0xcontract:balanceOf:["0xUser",123]');
  });

  test('should create correct balance cache keys', () => {
    const address = '0xUser';

    // Native token balance
    const key1 = WalletCache.createBalanceKey(address);
    expect(key1).toBe('balance:0xuser');

    // ERC20 token balance
    const tokenAddress = '0xToken';
    const key2 = WalletCache.createBalanceKey(address, tokenAddress);
    expect(key2).toBe('balance:0xuser:0xtoken');
  });

  test('should create correct ENS cache keys', () => {
    const name = 'user.eth';
    const key = WalletCache.createEnsKey(name);
    expect(key).toBe('ens:user.eth');
  });

  test('createCache should return a new WalletCache instance', () => {
    const customMaxAge = 5000;
    const cache = createCache(customMaxAge);
    expect(cache).toBeInstanceOf(WalletCache);

    // Test the maxAge is respected by attempting to retrieve an expired value
    cache.set(testKey, testValue);

    // Time is still at 1000 (from beforeEach), so value should exist
    expect(cache.get(testKey)).toEqual(testValue);

    // Advance time to 6001, which is > 5000ms from 1000
    vi.spyOn(Date, 'now').mockImplementation(() => 6001);

    // Value should now be expired
    expect(cache.get(testKey)).toBeUndefined();
  });
});
