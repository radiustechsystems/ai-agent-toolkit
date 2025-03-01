import { describe, expect, test, vi } from "vitest";

// Mock dependencies before importing the modules being tested
vi.mock("@radiustechsystems/ai-agent-core", () => ({
  PluginBase: class {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(public name: string, public toolProviders: any[]) {}
    getTools() { return []; }
    // The actual implementation will be provided by the subclass
    supportsChain() { return true; }
  }
}));

// Mock the wallet module with a test chain
vi.mock("@radiustechsystems/ai-agent-wallet", () => ({
  radiusTestnetBase: { id: 42161, type: "evm" }
}));

// Now import the modules being tested
import { BalancerPlugin, balancer } from "../balancer.plugin";
import { BalancerService } from "../balancer.service";
// Define our own type for testing
type EvmChain = { id: number; type: "evm" };

// Mock the BalancerService
vi.mock("../balancer.service", () => ({
  BalancerService: vi.fn().mockImplementation(() => ({
    // Empty mock implementation
  })),
}));

describe("BalancerPlugin", () => {
  const testConfig = {
    rpcUrl: "https://testnet.radius.com/rpc",
    apiUrl: "https://api-test.balancer.fi/",
  };

  test("should be properly instantiated", () => {
    const plugin = new BalancerPlugin(testConfig);
    expect(plugin).toBeInstanceOf(BalancerPlugin);
    expect(plugin.name).toBe("balancer");
    expect(BalancerService).toHaveBeenCalledWith(testConfig);
  });

  test("should provide tools through getTools", () => {
    const plugin = new BalancerPlugin(testConfig);
    const mockWalletClient = { getChain: () => ({ id: 1, type: "evm" }) };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tools = plugin.getTools(mockWalletClient as any);
    expect(tools).toBeDefined();
    expect(Array.isArray(tools)).toBe(true);
  });

  test("balancer factory function should create a BalancerPlugin instance", () => {
    const plugin = balancer(testConfig);
    expect(plugin).toBeInstanceOf(BalancerPlugin);
  });

  test("should have supportsChain method", () => {
    const plugin = new BalancerPlugin(testConfig);
    expect(typeof plugin.supportsChain).toBe("function");
  });
});
