import { describe, test, expect, vi, beforeEach } from "vitest";
import { crypto, CryptoPlugin } from "../crypto.plugin";

// Don't mock the entire PluginBase, just override what we need from it
// This allows the actual CryptoPlugin to be instantiated correctly
vi.mock("@radiustechsystems/ai-agent-core", async () => {
  const actual = await vi.importActual("@radiustechsystems/ai-agent-core");
  return {
    ...actual,
    // We just need to mock the Tool decorator
    Tool: vi.fn().mockImplementation(() => {
      return () => {};
    })
  };
});

describe("CryptoPlugin", () => {
  let plugin: CryptoPlugin;
  
  beforeEach(() => {
    plugin = crypto();
  });

  test("should create a plugin instance", () => {
    expect(plugin).toBeInstanceOf(CryptoPlugin);
  });

  test("should support all chains", () => {
    // The supportsChain method doesn't actually use the parameter
    // It always returns true for any chain
    expect(plugin.supportsChain()).toBe(true);
  });

  test("should have the correct name and tool providers", () => {
    expect(plugin.name).toBe("crypto");
    expect(plugin.toolProviders).toBeDefined();
    expect(plugin.toolProviders.length).toBe(1); // Should have exactly 1 provider - CryptoService
  });
});
