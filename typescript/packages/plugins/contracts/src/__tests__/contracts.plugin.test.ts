import type { Chain } from '@radiustechsystems/ai-agent-core';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ContractsPlugin, contracts } from '../contracts.plugin';

// Don't mock the entire PluginBase, just override what we need from it
// This allows the actual ContractsPlugin to be instantiated correctly
vi.mock('@radiustechsystems/ai-agent-core', async () => {
  const actual = await vi.importActual('@radiustechsystems/ai-agent-core');
  return {
    ...actual,
    // We just need to mock the Tool decorator
    Tool: vi.fn().mockImplementation(() => {
      return () => {};
    }),
  };
});

describe('ContractsPlugin', () => {
  let plugin: ContractsPlugin;

  beforeEach(() => {
    plugin = contracts();
  });

  test('should create a plugin instance', () => {
    expect(plugin).toBeInstanceOf(ContractsPlugin);
  });

  test('should have the correct name and tool providers', () => {
    expect(plugin.name).toBe('contracts');
    expect(plugin.toolProviders).toBeDefined();
    expect(plugin.toolProviders.length).toBe(1); // Should have exactly 1 provider - ContractsService
  });

  test('should only support EVM chains with radius ID', () => {
    // Should support Radius EVM chain
    expect(plugin.supportsChain({ type: 'evm', id: 'radius' } as unknown as Chain)).toBe(true);

    // Should not support other EVM chains
    expect(plugin.supportsChain({ type: 'evm', id: 1 } as Chain)).toBe(false);
    expect(plugin.supportsChain({ type: 'evm', id: 234 } as Chain)).toBe(false);
    expect(plugin.supportsChain({ type: 'evm', id: 1223953 } as Chain)).toBe(false);

    // Should not support non-EVM chains

    // biome-ignore lint/suspicious/noExplicitAny: Testing with invalid chain type
    expect(plugin.supportsChain({ type: 'other', id: 'radius' } as any)).toBe(false);
  });
});
