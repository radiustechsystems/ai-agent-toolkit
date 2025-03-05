import { beforeEach, describe, expect, test, vi } from 'vitest';
import { z } from 'zod';
import { type StoredToolMetadataMap, toolMetadataKey } from '../../decorators/Tool';
import type { Chain } from '../../types/Chain';
import { PluginBase } from '../PluginBase';
import { ToolBase } from '../ToolBase';
import { type Balance, WalletClientBase } from '../WalletClientBase';

// Mock WalletClientBase
class MockWalletClient extends WalletClientBase {
  getAddress(): string {
    return '0x123';
  }
  getChain(): Chain {
    return { type: 'evm', id: 1 };
  }
  signMessage(_message: string): Promise<{ signature: string }> {
    return Promise.resolve({ signature: '0xsig' });
  }

  balanceOf(_address: string): Promise<Balance> {
    return Promise.resolve({
      decimals: 18,
      symbol: 'ETH',
      name: 'Ethereum',
      value: '1.0',
      inBaseUnits: '1000000000000000000',
    });
  }
}

// Create concrete implementation of PluginBase for testing
class TestPlugin extends PluginBase {
  supportsChain(chain: Chain): boolean {
    return chain.type === 'evm';
  }
}

// Mock tool provider class with decorated methods
class MockToolProvider {
  mockMethod() {
    return 'mock result';
  }
}

describe('PluginBase', () => {
  let plugin: TestPlugin;
  let mockWalletClient: MockWalletClient;
  let mockToolProvider: MockToolProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    mockToolProvider = new MockToolProvider();
    mockWalletClient = new MockWalletClient();

    // Reset console.warn mock
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  test('should be properly instantiated', () => {
    plugin = new TestPlugin('test-plugin', []);

    expect(plugin).toBeInstanceOf(PluginBase);
    expect(plugin.name).toBe('test-plugin');
    expect(plugin.toolProviders).toEqual([]);
  });

  test('should check chain support with supportsChain', () => {
    plugin = new TestPlugin('test-plugin', []);

    expect(plugin.supportsChain({ type: 'evm', id: 1 })).toBe(true);
    expect(plugin.supportsChain({ type: 'evm', id: 100 })).toBe(true);

    // @ts-expect-error - Testing with invalid chain type
    expect(plugin.supportsChain({ type: 'other', id: 1 })).toBe(false);
  });

  test('should return empty array when no tool providers', async () => {
    plugin = new TestPlugin('test-plugin', []);

    const tools = await Promise.resolve(plugin.getTools(mockWalletClient));
    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBe(0);
  });

  test('should warn when tool provider has no tools', async () => {
    plugin = new TestPlugin('test-plugin', [mockToolProvider]);

    const tools = await Promise.resolve(plugin.getTools(mockWalletClient));

    expect(console.warn).toHaveBeenCalled();
    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBe(0);
  });

  test('should warn when tool provider is not an instance', async () => {
    plugin = new TestPlugin('test-plugin', [MockToolProvider]);

    const tools = await Promise.resolve(plugin.getTools(mockWalletClient));

    expect(console.warn).toHaveBeenCalled();
    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBe(0);
  });

  test('should create tools from decorated methods', async () => {
    // Create mock tool metadata
    const mockToolMetadata: StoredToolMetadataMap = new Map();
    mockToolMetadata.set('mockMethod', {
      name: 'mock_tool',
      description: 'Test tool',
      parameters: {
        index: 0,

        schema: z.object({}) as z.ZodObject<{ [key: string]: z.ZodTypeAny }, 'strip', z.ZodTypeAny>,
      },
      target: MockToolProvider.prototype.mockMethod,
    });

    // Apply metadata to the provider's constructor
    Reflect.defineMetadata(toolMetadataKey, mockToolMetadata, MockToolProvider);

    plugin = new TestPlugin('test-plugin', [mockToolProvider]);

    const tools = await Promise.resolve(plugin.getTools(mockWalletClient));

    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBe(1);
    expect(tools[0]).toBeInstanceOf(ToolBase);
    expect(tools[0].name).toBe('mock_tool');
  });

  test('should pass wallet client to tool with walletClient metadata', async () => {
    // Create mock tool metadata with walletClient
    const mockToolMetadata: StoredToolMetadataMap = new Map();
    const mockMethod = vi.fn();

    mockToolMetadata.set('mockMethod', {
      name: 'mock_tool',
      description: 'Test tool',
      parameters: {
        index: 1,
        schema: z.object({}) as z.ZodSchema,
      },
      walletClient: {
        index: 0,
      },
      target: mockMethod,
    });

    // Apply metadata to the provider's constructor
    Reflect.defineMetadata(toolMetadataKey, mockToolMetadata, MockToolProvider);

    plugin = new TestPlugin('test-plugin', [mockToolProvider]);

    const tools = await Promise.resolve(plugin.getTools(mockWalletClient));
    expect(tools.length).toBe(1);

    // Execute the tool to verify wallet client is passed
    const tool = tools[0];
    tool.execute({});

    expect(mockMethod).toHaveBeenCalled();
    // The first argument should be the wallet client
    expect(mockMethod.mock.calls[0][0]).toBe(mockWalletClient);
  });

  test('should support async getTools implementations', async () => {
    class AsyncPlugin extends PluginBase {
      supportsChain(chain: Chain): boolean {
        return chain.type === 'evm';
      }

      async getTools(walletClient: WalletClientBase): Promise<ToolBase[]> {
        const tools = await super.getTools(walletClient);
        return tools;
      }
    }

    // Create mock tool metadata
    const mockToolMetadata: StoredToolMetadataMap = new Map();
    mockToolMetadata.set('mockMethod', {
      name: 'mock_tool',
      description: 'Test tool',
      parameters: {
        index: 0,
        schema: z.object({}) as z.ZodSchema,
      },
      target: MockToolProvider.prototype.mockMethod,
    });

    // Apply metadata to the provider's constructor
    Reflect.defineMetadata(toolMetadataKey, mockToolMetadata, MockToolProvider);

    const asyncPlugin = new AsyncPlugin('async-plugin', [mockToolProvider]);

    const tools = await asyncPlugin.getTools(mockWalletClient);

    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBe(1);
  });
});
