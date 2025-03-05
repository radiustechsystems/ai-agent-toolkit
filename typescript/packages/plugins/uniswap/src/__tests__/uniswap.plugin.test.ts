import { describe, expect, test, vi } from 'vitest';

// Mock dependencies before importing the modules being tested
vi.mock('@radiustechsystems/ai-agent-core', () => ({
  PluginBase: class {
    constructor(
      public name: string,
      public toolProviders: any[],
    ) {}
    getTools() {
      return [];
    }
    supportsChain() {
      return true;
    }
  },
}));

// Mock the wallet module
vi.mock('@radiustechsystems/ai-agent-wallet', () => ({
  radiusTestnetBase: { id: '1223953', type: 'evm' },
}));

// Mock the service
vi.mock('../uniswap.service', () => ({
  UniswapService: vi.fn().mockImplementation(() => ({})),
}));

// Now import the modules being tested
import { UniswapPlugin, uniswap } from '../uniswap.plugin';
import { UniswapService } from '../uniswap.service';

describe('UniswapPlugin', () => {
  const testConfig = {
    apiKey: 'test-api-key',
    baseUrl: 'https://api.uniswap.test',
  };

  test('should be properly instantiated', () => {
    const plugin = new UniswapPlugin(testConfig);
    expect(plugin).toBeInstanceOf(UniswapPlugin);
    expect(plugin.name).toBe('uniswap');
    expect(UniswapService).toHaveBeenCalledWith(testConfig);
  });

  test('should provide tools through getTools', () => {
    const plugin = new UniswapPlugin(testConfig);
    const mockWalletClient = { getChain: () => ({ id: '1223953', type: 'evm' }) };

    const tools = plugin.getTools(mockWalletClient as any);
    expect(tools).toBeDefined();
    expect(Array.isArray(tools)).toBe(true);
  });

  test('uniswap factory function should create a UniswapPlugin instance', () => {
    const plugin = uniswap(testConfig);
    expect(plugin).toBeInstanceOf(UniswapPlugin);
  });

  test('should support EVM chains on the supported list', () => {
    const plugin = new UniswapPlugin(testConfig);

    // Mock the internal implementation to test our logic directly
    const originalSupportsChain = plugin.supportsChain;

    plugin.supportsChain = originalSupportsChain as any;

    // Should support Radius testnet
    expect(plugin.supportsChain({ id: 1223953, type: 'evm' })).toBe(true);
    expect(plugin.supportsChain({ id: 1223953, type: 'evm' })).toBe(true);

    // Should not support unsupported chains
    expect(plugin.supportsChain({ id: 1, type: 'evm' })).toBe(false);
    expect(plugin.supportsChain({ id: 1, type: 'evm' })).toBe(false);

    // Should not support non-EVM chains
    // @ts-expect-error Testing with invalid chain type
    expect(plugin.supportsChain({ id: 1223953, type: 'solana' })).toBe(false);
  });
});
