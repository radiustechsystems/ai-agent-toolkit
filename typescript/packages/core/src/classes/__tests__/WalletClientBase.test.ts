import { beforeEach, describe, expect, test } from 'vitest';
import type { Chain } from '../../types/Chain';
import { ToolBase } from '../ToolBase';
import { type Balance, type Signature, WalletClientBase } from '../WalletClientBase';

// Create a concrete implementation of WalletClientBase for testing
class TestWalletClient extends WalletClientBase {
  getAddress(): string {
    return '0xTestAddress';
  }

  getChain(): Chain {
    return {
      type: 'evm',
      id: 123,
    };
  }

  async signMessage(message: string): Promise<Signature> {
    return {
      signature: `sig:${message}`,
    };
  }

  async balanceOf(address: string): Promise<Balance> {
    return {
      decimals: 18,
      symbol: 'TEST',
      name: 'Test Token',
      value: '100',
      inBaseUnits: '100000000000000000000',
    };
  }
}

describe('WalletClientBase', () => {
  let walletClient: TestWalletClient;

  beforeEach(() => {
    walletClient = new TestWalletClient();
  });

  test('should implement abstract methods', () => {
    expect(walletClient.getAddress()).toBe('0xTestAddress');
    expect(walletClient.getChain()).toEqual({ type: 'evm', id: 123 });
  });

  test('should sign messages', async () => {
    const result = await walletClient.signMessage('hello');
    expect(result).toEqual({ signature: 'sig:hello' });
  });

  test('should get balance for address', async () => {
    const result = await walletClient.balanceOf('0xSomeAddress');
    expect(result).toEqual({
      decimals: 18,
      symbol: 'TEST',
      name: 'Test Token',
      value: '100',
      inBaseUnits: '100000000000000000000',
    });
  });

  describe('getCoreTools', () => {
    test('should return array of core tools', () => {
      const tools = walletClient.getCoreTools();

      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBe(4);
      tools.forEach((tool) => {
        expect(tool).toBeInstanceOf(ToolBase);
      });
    });

    test('should include get_address tool', () => {
      const tools = walletClient.getCoreTools();
      const getAddressTool = tools.find((tool) => tool.name === 'get_address');

      expect(getAddressTool).toBeDefined();
      expect(getAddressTool?.description).toContain('Get the address of the wallet');

      const result = getAddressTool?.execute({});
      expect(result).toBe('0xTestAddress');
    });

    test('should include get_chain tool', () => {
      const tools = walletClient.getCoreTools();
      const getChainTool = tools.find((tool) => tool.name === 'get_chain');

      expect(getChainTool).toBeDefined();
      expect(getChainTool?.description).toContain('Get the chain of the wallet');

      const result = getChainTool?.execute({});
      expect(result).toEqual({ type: 'evm', id: 123 });
    });

    test('should include get_balance tool', async () => {
      const tools = walletClient.getCoreTools();
      const getBalanceTool = tools.find((tool) => tool.name === 'get_balance');

      expect(getBalanceTool).toBeDefined();
      expect(getBalanceTool?.description).toContain('Get the balance of an address');

      const result = await getBalanceTool?.execute({ address: '0xSomeAddress' });
      expect(result).toEqual({
        decimals: 18,
        symbol: 'TEST',
        name: 'Test Token',
        value: '100',
        inBaseUnits: '100000000000000000000',
      });
    });

    test('should include sign_message tool', async () => {
      const tools = walletClient.getCoreTools();
      const signMessageTool = tools.find((tool) => tool.name === 'sign_message');

      expect(signMessageTool).toBeDefined();
      expect(signMessageTool?.description).toContain('Sign a message with the wallet');

      const result = await signMessageTool?.execute({ message: 'test message' });
      expect(result).toEqual({ signature: 'sig:test message' });
    });
  });
});
