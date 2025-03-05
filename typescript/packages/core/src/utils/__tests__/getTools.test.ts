import { beforeEach, describe, expect, test, vi } from 'vitest';
import { z } from 'zod';
import { type Balance, PluginBase, ToolBase, WalletClientBase } from '../../classes';
import type { Chain } from '../../types/Chain';
import { getTools } from '../getTools';

// Mocks
class MockWalletClient extends WalletClientBase {
  getAddress(): string {
    return '0xMockAddress';
  }

  getChain(): Chain {
    return { type: 'evm', id: 123 };
  }

  async signMessage(_message: string): Promise<{ signature: string }> {
    return { signature: '0xMockSignature' };
  }

  async balanceOf(_address: string): Promise<Balance> {
    return {
      decimals: 18,
      symbol: 'ETH',
      name: 'Ethereum',
      value: '100',
      inBaseUnits: '100000000000000000000',
    };
  }

  getCoreTools(): ToolBase[] {
    return [
      new (class extends ToolBase<
        z.ZodObject<{ [key: string]: z.ZodTypeAny }, 'strip', z.ZodTypeAny>,
        string
      > {
        constructor() {
          super({
            name: 'core_tool',
            description: 'Core wallet tool',
            parameters: z.object({}),
          });
        }

        execute(): string {
          return 'core tool result';
        }
      })(),
    ];
  }
}

class SupportedPlugin extends PluginBase {
  constructor() {
    super('supported', []);
  }

  supportsChain(chain: Chain): boolean {
    return chain.type === 'evm';
  }

  getTools(): ToolBase[] {
    return [
      new (class extends ToolBase<
        z.ZodObject<{ [key: string]: z.ZodTypeAny }, 'strip', z.ZodTypeAny>,
        string
      > {
        constructor() {
          super({
            name: 'supported_tool',
            description: 'Supported tool',
            parameters: z.object({}),
          });
        }

        execute(): string {
          return 'supported tool result';
        }
      })(),
    ];
  }
}

class UnsupportedPlugin extends PluginBase {
  constructor() {
    super('unsupported', []);
  }

  supportsChain(chain: Chain): boolean {
    // We intentionally use a type comparison that will always be false
    // to test the "unsupported chain" scenario
    return (chain.type as string) === 'other';
  }

  getTools(): ToolBase[] {
    return [
      new (class extends ToolBase<
        z.ZodObject<{ [key: string]: z.ZodTypeAny }, 'strip', z.ZodTypeAny>,
        string
      > {
        constructor() {
          super({
            name: 'unsupported_tool',
            description: 'Unsupported tool',
            parameters: z.object({}),
          });
        }

        execute(): string {
          return 'unsupported tool result';
        }
      })(),
    ];
  }
}

class AsyncPlugin extends PluginBase {
  constructor() {
    super('async', []);
  }

  supportsChain(): boolean {
    return true;
  }

  async getTools(): Promise<ToolBase[]> {
    return [
      new (class extends ToolBase<
        z.ZodObject<{ [key: string]: z.ZodTypeAny }, 'strip', z.ZodTypeAny>,
        string
      > {
        constructor() {
          super({
            name: 'async_tool',
            description: 'Async tool',
            parameters: z.object({}),
          });
        }

        execute(): string {
          return 'async tool result';
        }
      })(),
    ];
  }
}

describe('getTools', () => {
  let walletClient: MockWalletClient;
  let supportedPlugin: SupportedPlugin;
  let unsupportedPlugin: UnsupportedPlugin;
  let asyncPlugin: AsyncPlugin;

  beforeEach(() => {
    walletClient = new MockWalletClient();
    supportedPlugin = new SupportedPlugin();
    unsupportedPlugin = new UnsupportedPlugin();
    asyncPlugin = new AsyncPlugin();

    vi.spyOn(console, 'warn').mockImplementation(() => {
      /* Empty implementation */
    });
  });

  test('should get core tools when no plugins provided', async () => {
    const tools = await getTools({ wallet: walletClient });

    expect(Array.isArray(tools)).toBe(true);
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe('core_tool');
  });

  test('should get tools from supported plugins', async () => {
    const tools = await getTools({
      wallet: walletClient,
      plugins: [supportedPlugin],
    });

    expect(tools).toHaveLength(2);
    expect(tools[0].name).toBe('core_tool');
    expect(tools[1].name).toBe('supported_tool');
  });

  test('should warn and include tools from unsupported plugins', async () => {
    // Based on the implementation, unsupported plugins still have their tools included
    const tools = await getTools({
      wallet: walletClient,
      plugins: [unsupportedPlugin],
    });

    expect(console.warn).toHaveBeenCalled();
    // The test expects core_tool + unsupported_tool
    expect(tools).toHaveLength(2);
    expect(tools[0].name).toBe('core_tool');
    expect(tools[1].name).toBe('unsupported_tool');
  });

  test('should combine tools from multiple plugins', async () => {
    const tools = await getTools({
      wallet: walletClient,
      plugins: [supportedPlugin, asyncPlugin],
    });

    expect(tools).toHaveLength(3);
    expect(tools[0].name).toBe('core_tool');
    expect(tools[1].name).toBe('supported_tool');
    expect(tools[2].name).toBe('async_tool');
  });

  test('should handle async plugin tools', async () => {
    const tools = await getTools({
      wallet: walletClient,
      plugins: [asyncPlugin],
    });

    expect(tools).toHaveLength(2);
    expect(tools[1].name).toBe('async_tool');
  });

  test('should warn about multiple unsupported plugins', async () => {
    await getTools({
      wallet: walletClient,
      plugins: [unsupportedPlugin, unsupportedPlugin],
    });

    expect(console.warn).toHaveBeenCalledTimes(2);
  });
});
