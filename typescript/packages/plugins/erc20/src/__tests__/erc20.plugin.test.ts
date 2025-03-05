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
vi.mock('../erc20.service', () => ({
  Erc20Service: vi.fn().mockImplementation(() => ({})),
}));

// Now import the modules being tested
import { ERC20Plugin, erc20 } from '../erc20.plugin';
import { Erc20Service } from '../erc20.service';
import { USDC, WETH } from '../token';

describe('ERC20Plugin', () => {
  const testTokens = [USDC, WETH];

  test('should be properly instantiated', () => {
    const plugin = new ERC20Plugin({ tokens: testTokens });
    expect(plugin).toBeInstanceOf(ERC20Plugin);
    expect(plugin.name).toBe('erc20');
    expect(Erc20Service).toHaveBeenCalledWith({ tokens: testTokens });
  });

  test('should provide tools through getTools', () => {
    const plugin = new ERC20Plugin({ tokens: testTokens });
    const mockWalletClient = { getChain: () => ({ id: 1, type: 'evm' }) };

    // biome-ignore lint/suspicious/noExplicitAny: Simplified mock wallet client for testing
    const tools = plugin.getTools(mockWalletClient as any);
    expect(tools).toBeDefined();
    expect(Array.isArray(tools)).toBe(true);
  });

  test('erc20 factory function should create an ERC20Plugin instance', () => {
    const plugin = erc20({ tokens: testTokens });
    expect(plugin).toBeInstanceOf(ERC20Plugin);
  });

  test('should have supportsChain method', () => {
    const plugin = new ERC20Plugin({ tokens: testTokens });
    expect(typeof plugin.supportsChain).toBe('function');
  });
});
