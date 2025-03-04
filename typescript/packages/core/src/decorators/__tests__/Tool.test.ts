import { describe, expect, test, vi, beforeEach } from "vitest";
import { Tool, toolMetadataKey } from "../Tool";
import { WalletClientBase } from "../../classes/WalletClientBase";
import { z } from "zod";
import "reflect-metadata";

// Mock Reflect.getMetadata and Reflect.defineMetadata
beforeEach(() => {
  vi.resetAllMocks();
  
  // Create a mock metadata storage
  const metadataStorage = new Map();
  
  // Mock getMetadata to return our test params and our mockMetadataMap
  vi.spyOn(Reflect, "getMetadata").mockImplementation((key, target, propertyKey) => {
    if (propertyKey) {
      // This is for the design:paramtypes key in the Tool decorator
      return [
        propertyKey.toString().includes("Wallet") ? 
          WalletClientBase : 
          {
            prototype: {
              constructor: {
                schema: z.object({})
              }
            }
          }
      ];
    } else {
      // This is for retrieving the stored metadata map
      return metadataStorage.get(target);
    }
  });
  
  // Mock defineMetadata to store in our map
  vi.spyOn(Reflect, "defineMetadata").mockImplementation((key, value, target) => {
    metadataStorage.set(target, value);
  });
});

describe("Tool Decorator", () => {
  test("should register tool metadata", () => {
    class TestService {
      @Tool({
        description: "Test tool description"
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      testTool(params: { param1: string }) {
        return `Test ${params.param1}`;
      }
    }

    // Get the metadata from the class
    const metadata = Reflect.getMetadata(toolMetadataKey, TestService);
    
    expect(metadata).toBeDefined();
    expect(metadata instanceof Map).toBe(true);
    
    // Check if the decorator function worked
    expect(metadata.has("testTool")).toBe(true);
  });

  test("should use provided name if specified", () => {
    // Setup the mock to return our prepared Map
    vi.spyOn(Reflect, "getMetadata").mockReturnValueOnce([{
      prototype: {
        constructor: {
          schema: z.object({})
        }
      }
    }]);
    
    // Setup a custom mock to verify the name is being set
    vi.spyOn(Reflect, "defineMetadata").mockImplementation((key, value) => {
      expect(value.get("testTool").name).toBe("custom_name");
    });
    
    class TestService {
      @Tool({
        name: "custom_name",
        description: "Test tool description"
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      testTool(params: { param1: string }) {
        return `Test ${params.param1}`;
      }
    }
    
    // Just ensuring the class is used
    expect(TestService).toBeDefined();
    
    // Just verifying our spy was called
    expect(Reflect.defineMetadata).toHaveBeenCalled();
  });

  test("should detect wallet client parameter position", () => {
    let walletClientIndex;
    
    // Mock getMetadata to return appropriate parameter types
    vi.spyOn(Reflect, "getMetadata").mockReturnValueOnce([
      WalletClientBase,
      {
        prototype: {
          constructor: {
            schema: z.object({})
          }
        }
      }
    ]);
    
    // Capture the metadata being defined
    vi.spyOn(Reflect, "defineMetadata").mockImplementation((key, value) => {
      const toolMetadata = value.get("testWithWallet");
      expect(toolMetadata.walletClient).toBeDefined();
      walletClientIndex = toolMetadata.walletClient?.index;
    });
    
    class TestService {
      @Tool({
        description: "Test with wallet"
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      testWithWallet(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        walletClient: WalletClientBase,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
        params: { test: string }
      ) {
        return "test";
      }
    }
    
    // Ensure class is used
    expect(TestService).toBeDefined();
    
    // Verify wallet client was detected at the correct position
    expect(walletClientIndex).toBe(0);
  });

  test("should throw if no parameters argument", () => {
    // Simulate a method with no parameters argument by making isParametersParameter return false
    vi.spyOn(Reflect, "getMetadata").mockReturnValueOnce([{
      prototype: {}  // Missing constructor.schema
    }]);
    
    // Prepare the method descriptor
    const descriptor = {
      value: function() { return "no params"; }
    };
    
    expect(() => {
      Tool({
        description: "Invalid tool"
      })(
        {},
        "someMethod",
        descriptor
      );
    }).toThrow("must have a parameters argument");
  });

  test("should keep original method functionality", () => {
    // Mock the decorator behavior
    vi.spyOn(Reflect, "getMetadata").mockReturnValueOnce([{
      prototype: {
        constructor: {
          schema: z.object({})
        }
      }
    }]);
    
    vi.spyOn(Reflect, "defineMetadata").mockImplementation(() => {/* Empty implementation */});
    
    // Create a simple test method
    const testMethod = vi.fn().mockImplementation((params: { value: string }) => {
      return `Result: ${params.value}`;
    });
    
    // Apply the decorator manually
    const descriptor = {
      value: testMethod
    };
    
    const updatedDescriptor = Tool({
      description: "Test description"
    })({}, "testMethod", descriptor);
    
    // Check that the original method still works
    const result = updatedDescriptor.value({ value: "test" });
    expect(result).toBe("Result: test");
    expect(testMethod).toHaveBeenCalledWith({ value: "test" });
  });
});
