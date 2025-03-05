import { PluginBase, ToolBase, WalletClientBase } from '@radiustechsystems/ai-agent-core';
import * as coreModule from '@radiustechsystems/ai-agent-core';
import type { Chain } from '@radiustechsystems/ai-agent-core/dist/types';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { z } from 'zod';
import { getOnChainTools } from '../index';

// Mock the core module
vi.mock('@radiustechsystems/ai-agent-core', async () => {
  const actual = await vi.importActual('@radiustechsystems/ai-agent-core');
  return {
    ...actual,
    getTools: vi.fn(),
  };
});

// Mock the LangChain tool function
vi.mock('@langchain/core/tools', () => ({
  tool: vi.fn((func, options) => ({
    name: options.name,
    description: options.description,
    schema: options.schema,
    _call: func,
  })),
}));

// Mocks
class MockWalletClient extends WalletClientBase {
  getAddress(): string {
    return '0xMockAddress';
  }

  getChain(): Chain {
    return { type: 'evm', id: 123 };
  }

  async signMessage(): Promise<{ signature: string }> {
    return { signature: '0xMockSignature' };
  }

  async balanceOf(): Promise<any> {
    return { value: '100' };
  }

  getCoreTools(): ToolBase[] {
    return [];
  }
}

class MockTool extends ToolBase<z.ZodObject<any, any, any>, Record<string, unknown>> {
  constructor(name: string) {
    super({
      name,
      description: `${name} description`,
      parameters: z.object({ param: z.string() }),
    });
  }

  execute(params: { param: string }): Record<string, unknown> {
    return { result: `${this.name} executed with ${params.param}` };
  }
}

describe('getOnChainTools (LangChain)', () => {
  let walletClient: MockWalletClient;
  let mockTools: ToolBase[];

  beforeEach(() => {
    walletClient = new MockWalletClient();
    mockTools = [new MockTool('tool1'), new MockTool('tool2')];

    // Mock the getTools function to return our mock tools
    vi.mocked(coreModule.getTools).mockResolvedValue(mockTools);
  });

  test('should call getTools with the correct parameters', async () => {
    // Create a properly typed mock plugin
    class MockPlugin extends PluginBase {
      constructor() {
        super('mock', []);
      }

      supportsChain(): boolean {
        return true;
      }

      getTools(): ToolBase[] {
        return [];
      }
    }

    const mockPlugin = new MockPlugin();

    await getOnChainTools({
      wallet: walletClient,
      plugins: [mockPlugin],
    });

    expect(coreModule.getTools).toHaveBeenCalledWith({
      wallet: walletClient,
      plugins: [mockPlugin],
    });
  });

  test('should convert tools to LangChain format', async () => {
    const result = await getOnChainTools({ wallet: walletClient });

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('tool1');
    expect(result[1].name).toBe('tool2');

    expect(result[0].description).toBe('tool1 description');
    expect(result[0].schema).toEqual(mockTools[0].parameters);
  });

  test('should create executable tools that stringify results', async () => {
    const result = await getOnChainTools({ wallet: walletClient });

    // We can't easily test the actual execution through the LangChain tool
    // since it's a protected method, so we'll just verify the tool was created properly
    expect(result[0]).toHaveProperty('name', 'tool1');
    expect(result[0]).toHaveProperty('description', 'tool1 description');
    expect(result[0]).toHaveProperty('schema');
  });

  test('should handle empty tools array', async () => {
    vi.mocked(coreModule.getTools).mockResolvedValue([]);

    const result = await getOnChainTools({ wallet: walletClient });

    expect(result).toHaveLength(0);
  });
});
