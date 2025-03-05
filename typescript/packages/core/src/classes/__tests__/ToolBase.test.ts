import { describe, expect, test, vi } from 'vitest';
import { z } from 'zod';
import { ToolBase, type ToolConfig, createTool } from '../ToolBase';

// Create a concrete implementation of ToolBase for testing
class TestTool extends ToolBase<z.ZodObject<{ test: z.ZodString }>, string> {
  execute(parameters: { test: string }): string {
    return `Executed with: ${parameters.test}`;
  }
}

describe('ToolBase', () => {
  describe('ToolBase Abstract Class', () => {
    test('should be properly instantiated', () => {
      const schema = z.object({ test: z.string() });
      const config: ToolConfig<typeof schema> = {
        name: 'test_tool',
        description: 'A test tool',
        parameters: schema,
      };

      const tool = new TestTool(config);

      expect(tool).toBeInstanceOf(ToolBase);
      expect(tool.name).toBe('test_tool');
      expect(tool.description).toBe('A test tool');
      expect(tool.parameters).toBe(schema);
    });

    test('should execute with parameters', () => {
      const schema = z.object({ test: z.string() });
      const config: ToolConfig<typeof schema> = {
        name: 'test_tool',
        description: 'A test tool',
        parameters: schema,
      };

      const tool = new TestTool(config);
      const result = tool.execute({ test: 'value' });

      expect(result).toBe('Executed with: value');
    });
  });

  describe('createTool function', () => {
    test('should create a tool instance', () => {
      const schema = z.object({ key: z.string() });
      const config: ToolConfig<typeof schema> = {
        name: 'dynamic_tool',
        description: 'A dynamically created tool',
        parameters: schema,
      };

      const executeFn = vi.fn().mockReturnValue('executed');
      const tool = createTool(config, executeFn);

      expect(tool).toBeInstanceOf(ToolBase);
      expect(tool.name).toBe('dynamic_tool');
      expect(tool.description).toBe('A dynamically created tool');
      expect(tool.parameters).toBe(schema);
    });

    test('should call execute function with parameters', () => {
      const schema = z.object({ key: z.string() });
      const config: ToolConfig<typeof schema> = {
        name: 'dynamic_tool',
        description: 'A dynamically created tool',
        parameters: schema,
      };

      const executeFn = vi.fn().mockReturnValue('executed');
      const tool = createTool(config, executeFn);

      const params = { key: 'value' };
      const result = tool.execute(params);

      expect(executeFn).toHaveBeenCalledWith(params);
      expect(result).toBe('executed');
    });

    test('should support async execution', async () => {
      const schema = z.object({ key: z.string() });
      const config: ToolConfig<typeof schema> = {
        name: 'async_tool',
        description: 'An async tool',
        parameters: schema,
      };

      const executeFn = vi.fn().mockResolvedValue('async result');
      const tool = createTool(config, executeFn);

      const params = { key: 'async' };
      const result = await tool.execute(params);

      expect(executeFn).toHaveBeenCalledWith(params);
      expect(result).toBe('async result');
    });

    test('should handle complex parameter schemas', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().optional(),
        tags: z.array(z.string()),
      });

      const config: ToolConfig<typeof schema> = {
        name: 'complex_tool',
        description: 'Tool with complex schema',
        parameters: schema,
      };

      const executeFn = vi.fn();
      const tool = createTool(config, executeFn);

      const params = {
        name: 'test',
        tags: ['a', 'b'],
      };

      tool.execute(params);
      expect(executeFn).toHaveBeenCalledWith(params);
    });
  });
});
