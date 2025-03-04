import { describe, expect, test } from "vitest";
import { createToolParameters } from "../createToolParameters";
import { z } from "zod";

describe("createToolParameters", () => {
  test("should create a class with schema as static property", () => {
    const schema = z.object({
      name: z.string(),
      value: z.number()
    });
    
    const ToolParams = createToolParameters(schema);
    
    expect(ToolParams.schema).toBe(schema);
    expect(typeof ToolParams).toBe("function");
  });
  
  test("should create a class that can be instantiated", () => {
    const schema = z.object({
      name: z.string(),
      value: z.number()
    });
    
    const ToolParams = createToolParameters(schema);
    const instance = new ToolParams();
    
    // Instance should exist but have no properties of its own
    expect(instance).toBeDefined();
    expect(Object.keys(instance)).toHaveLength(0);
  });
  
  test("should work with InstanceType", () => {
    const schema = z.object({
      name: z.string(),
      value: z.number()
    });
    
    const ToolParams = createToolParameters(schema);
    
    // This is a type test - if it compiles, it works
    function testFunction(params: InstanceType<typeof ToolParams>) {
      return params.name;
    }
    
    // Test that we can actually call the function with correct typing
    const result = testFunction({ name: "test", value: 1 });
    expect(result).toBe("test");
  });
  
  test("should handle complex schemas", () => {
    const schema = z.object({
      id: z.string(),
      data: z.object({
        title: z.string(),
        count: z.number()
      }),
      tags: z.array(z.string()),
      optional: z.boolean().optional()
    });
    
    const ToolParams = createToolParameters(schema);
    
    expect(ToolParams.schema).toBe(schema);
    
    // Type test with complex parameters
    const instance: InstanceType<typeof ToolParams> = {
      id: "123",
      data: {
        title: "Test",
        count: 5
      },
      tags: ["a", "b", "c"]
    };
    
    expect(instance.id).toBe("123");
    expect(instance.data.title).toBe("Test");
  });
  
  test("should work with primitive schemas", () => {
    // Not typical usage, but should still work
    const schema = z.string();
    
    const ToolParams = createToolParameters(schema);
    
    expect(ToolParams.schema).toBe(schema);
  });
});
