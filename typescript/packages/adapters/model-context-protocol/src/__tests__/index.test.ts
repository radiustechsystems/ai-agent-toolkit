import { describe, expect, test, vi, beforeEach } from "vitest";
import { getOnChainTools } from "../index";
import { PluginBase, ToolBase, WalletClientBase, type Chain } from "@radiustechsystems/ai-agent-core";
import { z } from "zod";
import * as coreModule from "@radiustechsystems/ai-agent-core";

// Mock the core module
vi.mock("@radiustechsystems/ai-agent-core", async () => {
  const actual = await vi.importActual("@radiustechsystems/ai-agent-core");
  return {
    ...actual,
    getTools: vi.fn(),
  };
});

// Mock the zod-to-json-schema module
vi.mock("zod-to-json-schema", () => ({
  zodToJsonSchema: vi.fn(() => ({ type: "object", properties: { param: { type: "string" } } })),
}));

// Mocks
class MockWalletClient extends WalletClientBase {
  getAddress(): string {
    return "0xMockAddress";
  }
  
  getChain(): Chain {
    return { type: "evm", id: 123 };
  }
  
  async signMessage(): Promise<{ signature: string }> {
    return { signature: "0xMockSignature" };
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async balanceOf(): Promise<any> {
    return { value: "100" };
  }
  
  getCoreTools(): ToolBase[] {
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class MockTool extends ToolBase<z.ZodObject<any, any, any>, Record<string, unknown>> {
  constructor(name: string) {
    super({
      name,
      description: `${name} description`,
      parameters: z.object({ param: z.string() })
    });
  }
  
  execute(params: { param: string }): Record<string, unknown> {
    return { result: `${this.name} executed with ${params.param}` };
  }
}

describe("getOnChainTools (Model Context Protocol)", () => {
  let walletClient: MockWalletClient;
  let mockTools: ToolBase[];
  
  beforeEach(() => {
    walletClient = new MockWalletClient();
    mockTools = [
      new MockTool("tool1"),
      new MockTool("tool2")
    ];
    
    // Mock the getTools function to return our mock tools
    vi.mocked(coreModule.getTools).mockResolvedValue(mockTools);
  });
  
  test("should call getTools with the correct parameters", async () => {
    // Create a properly typed mock plugin
    class MockPlugin extends PluginBase {
      constructor() {
        super("mock", []);
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
      plugins: [mockPlugin]
    });
    
    expect(coreModule.getTools).toHaveBeenCalledWith({
      wallet: walletClient,
      plugins: [mockPlugin]
    });
  });
  
  test("should return an object with listOfTools and toolHandler", async () => {
    const result = await getOnChainTools({ wallet: walletClient });
    
    expect(result).toHaveProperty("listOfTools");
    expect(result).toHaveProperty("toolHandler");
    expect(typeof result.listOfTools).toBe("function");
    expect(typeof result.toolHandler).toBe("function");
  });
  
  test("listOfTools should return the list of tools with metadata", async () => {
    const result = await getOnChainTools({ wallet: walletClient });
    const tools = result.listOfTools();
    
    expect(Array.isArray(tools)).toBe(true);
    expect(tools).toHaveLength(2);
    expect(tools[0]).toHaveProperty("name", "tool1");
    expect(tools[0]).toHaveProperty("description", "tool1 description");
    expect(tools[0]).toHaveProperty("inputSchema");
    expect(tools[1]).toHaveProperty("name", "tool2");
  });
  
  test("toolHandler should execute the correct tool", async () => {
    const result = await getOnChainTools({ wallet: walletClient });
    
    // Check for correct tool execution
    const response = await result.toolHandler("tool1", { param: "test" });
    
    expect(response).toEqual({
      content: [
        {
          type: "text",
          text: JSON.stringify({ result: "tool1 executed with test" }),
        },
      ],
    });
  });
  
  test("toolHandler should throw error for non-existent tool", async () => {
    const result = await getOnChainTools({ wallet: walletClient });
    
    await expect(result.toolHandler("non_existent_tool", {})).rejects.toThrow(
      "Tool non_existent_tool not found"
    );
  });
  
  test("toolHandler should validate parameters", async () => {
    const result = await getOnChainTools({ wallet: walletClient });
    
    // Mock the parse method to throw an error
    const originalParse = mockTools[0].parameters.parse;
    mockTools[0].parameters.parse = vi.fn().mockImplementation(() => {
      throw new Error("Invalid parameters");
    });
    
    await expect(result.toolHandler("tool1", { invalid: "params" })).rejects.toThrow();
    
    // Restore the original parse method
    mockTools[0].parameters.parse = originalParse;
  });
  
  test("should handle empty tools array", async () => {
    vi.mocked(coreModule.getTools).mockResolvedValue([]);
    
    const result = await getOnChainTools({ wallet: walletClient });
    const tools = result.listOfTools();
    
    expect(tools).toHaveLength(0);
  });
});
