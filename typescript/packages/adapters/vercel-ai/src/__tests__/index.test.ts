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

// Mock the Vercel AI tool function
vi.mock("ai", () => {
  const toolMocks = new Map();
  
  return {
    tool: vi.fn((config) => {
      // Create a valid tool object (type-compatible with CoreTool)
      const tool = {
        type: "function" as const,
        parameters: config.parameters,
        execute: config.execute,
      };
      
      // Store the tool with its description in our map for testing
      // This is a workaround to avoid TypeScript errors with non-existent properties
      toolMocks.set(tool, config.description);
      
      return tool;
    }),
    // Expose the mock map so our tests can access the stored descriptions
    __toolMocks: toolMocks
  };
});

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
class MockTool extends ToolBase<z.ZodObject<any, any, any>, string> {
  constructor(name: string) {
    super({
      name,
      description: `${name} description`,
      parameters: z.object({ param: z.string() })
    });
  }
  
  execute(params: { param: string }): string {
    return `${this.name} executed with ${params.param}`;
  }
}

describe("getOnChainTools (Vercel AI)", () => {
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
  
  test("should convert tools to Vercel AI format", async () => {
    const result = await getOnChainTools({ wallet: walletClient });
    
    expect(Object.keys(result)).toHaveLength(2);
    expect(result.tool1).toBeDefined();
    expect(result.tool2).toBeDefined();
    
    // Access mocks from imported module to check descriptions
    const ai = await import("ai");
    // @ts-expect-error - Access our private mock storage
    const toolDescriptionMap = ai.__toolMocks;
    expect(toolDescriptionMap.get(result.tool1)).toBe("tool1 description");
    expect(result.tool1.parameters).toEqual(mockTools[0].parameters);
  });
  
  test("should create executable tools", async () => {
    const result = await getOnChainTools({ wallet: walletClient });
    
    // Simulate execution of the tool
    const tool1 = result.tool1;
    if (tool1.execute) {
      const executeResult = await tool1.execute({ param: "test" }, { messages: [], toolCallId: "test-call-id" });
      
      expect(executeResult).toBe("tool1 executed with test");
    } else {
      expect(tool1.execute).not.toBeUndefined();
    }
  });
  
  test("should handle empty tools array", async () => {
    vi.mocked(coreModule.getTools).mockResolvedValue([]);
    
    const result = await getOnChainTools({ wallet: walletClient });
    
    expect(Object.keys(result)).toHaveLength(0);
  });
});
