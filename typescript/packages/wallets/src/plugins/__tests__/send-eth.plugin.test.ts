import { describe, test, expect, vi } from "vitest";
import { sendETH, SendETHPlugin } from "../send-eth.plugin";
// Mock zod
vi.mock("zod", () => ({
  object: vi.fn(() => ({
    describe: vi.fn().mockReturnThis(),
  })),
  string: vi.fn(() => ({
    describe: vi.fn().mockReturnThis(),
  }))
}));

// Mock the required dependencies
vi.mock("@radiustechsystems/ai-agent-core", () => {
  return {
    PluginBase: class MockPluginBase {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor() {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      supportsChain: any;
    },
    createTool: vi.fn((config, handler) => {
      return {
        config,
        handler
      };
    })
  };
});

vi.mock("../../utils/utilities", () => ({
  getChainToken: vi.fn(() => ({
    symbol: "RAD",
    name: "Radius Token",
    decimals: 18
  }))
}));

vi.mock("../../utils/helpers", () => ({
  parseEther: vi.fn((value) => BigInt(value === "1.5" ? "1500000000000000000" : "1000000000000000000"))
}));

describe("SendETHPlugin", () => {
  const mockWalletClient = {
    getChain: vi.fn(() => ({ id: 1223953, type: "evm" })),
    sendTransaction: vi.fn().mockResolvedValue({ hash: "0xmocktxhash" })
  };
  
  test("should create a plugin instance", () => {
    const plugin = sendETH();
    expect(plugin).toBeInstanceOf(SendETHPlugin);
  });
  
  test("should support EVM chains", () => {
    const plugin = sendETH();
    expect(plugin.supportsChain({ type: "evm", id: 1 })).toBe(true);
    expect(plugin.supportsChain({ type: "other", id: 1 })).toBe(false);
  });
  
  test("should provide tools with correct configurations", () => {
    const plugin = sendETH();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tools = plugin.getTools(mockWalletClient as any);
    
    expect(tools).toHaveLength(1);
    expect(tools[0].config.name).toBe("send_RAD");
    expect(tools[0].config.parameters).toBeDefined();
  });
  
  test("sendETHMethod should convert amount and call sendTransaction", async () => {
    const plugin = sendETH();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tools = plugin.getTools(mockWalletClient as any);
    const sendTool = tools[0];
    
    const result = await sendTool.handler({
      to: "0xrecipient",
      amount: "1.5"
    });
    
    expect(mockWalletClient.sendTransaction).toHaveBeenCalledWith({
      to: "0xrecipient",
      value: BigInt("1500000000000000000") // 1.5 ETH
    });
    
    expect(result).toBe("0xmocktxhash");
  });
  
  test("sendETHMethod should throw error when transaction fails", async () => {
    const mockFailingWalletClient = {
      getChain: vi.fn(() => ({ id: 1223953, type: "evm" })),
      sendTransaction: vi.fn().mockRejectedValue(new Error("Transaction failed"))
    };
    
    const plugin = sendETH();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tools = plugin.getTools(mockFailingWalletClient as any);
    const sendTool = tools[0];
    
    await expect(sendTool.handler({
      to: "0xrecipient",
      amount: "1.0"
    })).rejects.toThrow("Failed to send RAD: Error: Transaction failed");
  });
});