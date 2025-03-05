import type { RadiusChain } from '@radiustechsystems/ai-agent-core';
import { describe, expect, test, vi } from 'vitest';
import type { RadiusWalletInterface } from '../../core/RadiusWalletInterface';
import { SendETHPlugin, sendETH } from '../send-eth.plugin';

// Mock zod
vi.mock('zod', () => {
  return {
    z: {
      object: vi.fn(() => ({
        describe: vi.fn().mockReturnThis(),
      })),
      string: vi.fn(() => ({
        describe: vi.fn().mockReturnThis(),
      })),
    },
    // Also return these at the top level for imports without z namespace
    object: vi.fn(() => ({
      describe: vi.fn().mockReturnThis(),
    })),
    string: vi.fn(() => ({
      describe: vi.fn().mockReturnThis(),
    })),
  };
});

// Mock the required dependencies
vi.mock('@radiustechsystems/ai-agent-core', () => {
  return {
    PluginBase: class MockPluginBase {
      constructor() {}

      supportsChain: any;
    },
    // Mock the createTool function to return an object matching the ToolBase interface
    createTool: vi.fn((config, handler) => {
      return {
        name: config.name,
        description: config.description,
        parameters: config.parameters,
        execute: handler,
      };
    }),
  };
});

vi.mock('../../utils/utilities', () => ({
  getChainToken: vi.fn(() => ({
    symbol: 'RAD',
    name: 'Radius Token',
    decimals: 18,
  })),
}));

vi.mock('../../utils/helpers', () => ({
  parseEther: vi.fn((value) =>
    BigInt(value === '1.5' ? '1500000000000000000' : '1000000000000000000'),
  ),
}));

describe('SendETHPlugin', () => {
  // Create a more complete mock that matches the RadiusWalletInterface
  const mockWalletClient: Partial<RadiusWalletInterface> = {
    getChain: vi.fn(() => ({ id: 1223953, type: 'evm' }) as RadiusChain),
    sendTransaction: vi.fn().mockResolvedValue({ hash: '0xmocktxhash' }),
    getAddress: vi.fn(() => '0xmockaddress'),
    signMessage: vi.fn().mockResolvedValue({ signature: '0xmocksignature' }),
    sendBatchOfTransactions: vi.fn().mockResolvedValue({ hash: '0xmockbatchhash' }),
    read: vi.fn().mockResolvedValue({ value: 'mockValue', success: true }),
    resolveAddress: vi.fn().mockResolvedValue('0xresolvedaddress'),
    signTypedData: vi.fn().mockResolvedValue({ signature: '0xmocktypedsignature' }),
    balanceOf: vi.fn().mockResolvedValue({
      value: '1.0',
      decimals: 18,
      symbol: 'RAD',
      name: 'Radius Token',
      inBaseUnits: '1000000000000000000',
    }),
    simulateTransaction: vi.fn().mockResolvedValue({ success: true, gasUsed: BigInt(21000) }),
    getTransactionDetails: vi.fn().mockResolvedValue({
      hash: '0xmocktxhash',
      status: 'confirmed',
      confirmations: 1,
    }),
    waitForTransaction: vi.fn().mockResolvedValue({
      hash: '0xmocktxhash',
      status: 'confirmed',
      confirmations: 1,
    }),
    dispose: vi.fn(),
  };

  test('should create a plugin instance', () => {
    const plugin = sendETH();
    expect(plugin).toBeInstanceOf(SendETHPlugin);
  });

  test('should support EVM chains', () => {
    const plugin = sendETH();
    expect(plugin.supportsChain({ type: 'evm', id: 1 })).toBe(true);
    // Need to cast as any to test non-EVM chains since the interface expects "evm" only

    expect(plugin.supportsChain({ type: 'other', id: 1 } as any)).toBe(false);
  });

  test('should provide tools with correct configurations', () => {
    const plugin = sendETH();
    const tools = plugin.getTools(mockWalletClient as RadiusWalletInterface);

    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe('send_RAD');
    expect(tools[0].parameters).toBeDefined();
  });

  test('sendETHMethod should convert amount and call sendTransaction', async () => {
    const plugin = sendETH();
    const tools = plugin.getTools(mockWalletClient as RadiusWalletInterface);
    const sendTool = tools[0];

    const result = await sendTool.execute({
      to: '0xrecipient',
      amount: '1.5',
    });

    expect(mockWalletClient.sendTransaction).toHaveBeenCalledWith({
      to: '0xrecipient',
      value: BigInt('1500000000000000000'), // 1.5 ETH
    });

    // Make sure we're properly extracting the hash property from the returned object
    expect(result).toBe('0xmocktxhash');
  });

  test('sendETHMethod should throw error when transaction fails', async () => {
    const mockFailingWalletClient: Partial<RadiusWalletInterface> = {
      ...mockWalletClient,
      getChain: vi.fn(() => ({ id: 1223953, type: 'evm' }) as RadiusChain),
      sendTransaction: vi.fn().mockRejectedValue(new Error('Transaction failed')),
    };

    const plugin = sendETH();
    const tools = plugin.getTools(mockFailingWalletClient as RadiusWalletInterface);
    const sendTool = tools[0];

    await expect(
      sendTool.execute({
        to: '0xrecipient',
        amount: '1.0',
      }),
    ).rejects.toThrow('Failed to send RAD: Error: Transaction failed');
  });
});
