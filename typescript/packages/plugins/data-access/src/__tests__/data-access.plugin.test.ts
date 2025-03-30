import { describe, expect, test, vi } from 'vitest';

// Mock dependencies before importing the modules being tested
vi.mock('@radiustechsystems/ai-agent-core', () => ({
  PluginBase: class {
    constructor(
      public name: string,
      // biome-ignore lint/suspicious/noExplicitAny: Mock class for testing
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
vi.mock('@radiustechsystems/ai-agent-wallet', () => ({}));

// Mock the service
vi.mock('../data-access.service', () => ({
  DataAccessService: vi.fn().mockImplementation(() => ({})),
}));

// Now import the modules being tested
import { DataAccessPlugin, dataAccess } from '../data-access.plugin';
import { DataAccessService } from '../data-access.service';

describe('DataAccessPlugin', () => {
  const testOptions = {
    contractAddress: '0x123456789abcdef',
    maxPrice: BigInt('50000000000000000'),
  };

  test('should be properly instantiated', () => {
    const plugin = new DataAccessPlugin(testOptions);
    expect(plugin).toBeInstanceOf(DataAccessPlugin);
    expect(plugin.name).toBe('dataAccess');
    expect(DataAccessService).toHaveBeenCalledWith(testOptions);
  });

  test('should provide tools through getTools', () => {
    const plugin = new DataAccessPlugin(testOptions);
    const mockWalletClient = { getChain: () => ({ id: 1, type: 'evm' }) };

    // biome-ignore lint/suspicious/noExplicitAny: Simplified mock wallet client for testing
    const tools = plugin.getTools(mockWalletClient as any);
    expect(tools).toBeDefined();
    expect(Array.isArray(tools)).toBe(true);
  });

  test('dataAccess factory function should create a DataAccessPlugin instance', () => {
    const plugin = dataAccess(testOptions);
    expect(plugin).toBeInstanceOf(DataAccessPlugin);
  });

  test('should have supportsChain method', () => {
    const plugin = new DataAccessPlugin(testOptions);
    expect(typeof plugin.supportsChain).toBe('function');
  });
});