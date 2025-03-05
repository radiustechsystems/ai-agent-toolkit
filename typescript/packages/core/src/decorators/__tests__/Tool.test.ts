import { beforeEach, describe, expect, test, vi } from 'vitest';
import { z } from 'zod';
import { WalletClientBase } from '../../classes/WalletClientBase';
import { createToolParameters } from '../../utils/createToolParameters';
import { Tool, toolMetadataKey } from '../Tool';
import 'reflect-metadata';

// Create parameter types using createToolParameters
const TestParams = createToolParameters(z.object({ param1: z.string() }));
const CustomParams = createToolParameters(z.object({ param1: z.string() }));
const WalletParams = createToolParameters(z.object({ test: z.string() }));
const EmptyParams = createToolParameters(z.object({}));

// Mock Reflect.getMetadata and Reflect.defineMetadata
beforeEach(() => {
  vi.resetAllMocks();

  // Create a mock metadata storage
  const metadataStorage = new Map();

  // Mock getMetadata to return our test params and our mockMetadataMap
  vi.spyOn(Reflect, 'getMetadata').mockImplementation((key, target, propertyKey) => {
    if (key === 'design:paramtypes' && propertyKey) {
      if (propertyKey.toString() === 'testWithWallet') {
        return [WalletClientBase, WalletParams];
      }
      if (propertyKey.toString() === 'testTool') {
        return [TestParams];
      }
      if (propertyKey.toString() === 'testMethod') {
        return [EmptyParams];
      }
      return [CustomParams];
    }
    // This is for retrieving the stored metadata map
    return metadataStorage.get(target);
  });

  // Mock defineMetadata to store in our map
  vi.spyOn(Reflect, 'defineMetadata').mockImplementation((_key, value, target) => {
    metadataStorage.set(target, value);
  });
});

describe('Tool Decorator', () => {
  test('should register tool metadata', () => {
    class TestService {
      @Tool({
        description: 'Test tool description',
      })
      testTool(params: InstanceType<typeof TestParams>) {
        return `Test ${params.param1}`;
      }
    }

    // Get the metadata from the class
    const metadata = Reflect.getMetadata(toolMetadataKey, TestService);

    expect(metadata).toBeDefined();
    expect(metadata instanceof Map).toBe(true);

    // Check if the decorator function worked
    expect(metadata.has('testTool')).toBe(true);
  });

  test('should use provided name if specified', () => {
    // Setup a custom mock to verify the name is being set
    vi.spyOn(Reflect, 'defineMetadata').mockImplementation((_key, value) => {
      expect(value.get('testTool').name).toBe('custom_name');
    });

    class TestService {
      @Tool({
        name: 'custom_name',
        description: 'Test tool description',
      })
      testTool(params: InstanceType<typeof CustomParams>) {
        return `Test ${params.param1}`;
      }
    }

    // Just ensuring the class is used
    expect(TestService).toBeDefined();

    // Just verifying our spy was called
    expect(Reflect.defineMetadata).toHaveBeenCalled();
  });

  test('should detect wallet client parameter position', () => {
    let walletClientIndex: number | undefined;

    // Capture the metadata being defined
    vi.spyOn(Reflect, 'defineMetadata').mockImplementation((_key, value) => {
      const toolMetadata = value.get('testWithWallet');
      expect(toolMetadata.walletClient).toBeDefined();
      walletClientIndex = toolMetadata.walletClient?.index;
    });

    class TestService {
      @Tool({
        description: 'Test with wallet',
      })
      testWithWallet(_walletClient: WalletClientBase, _params: InstanceType<typeof WalletParams>) {
        return 'test';
      }
    }

    // Ensure class is used
    expect(TestService).toBeDefined();

    // Verify wallet client was detected at the correct position
    expect(walletClientIndex).toBe(0);
  });

  test('should throw if no parameters argument', () => {
    // Simulate a method with no parameters argument by making isParametersParameter return false
    vi.spyOn(Reflect, 'getMetadata').mockReturnValueOnce([
      {
        prototype: {}, // Missing constructor.schema
      },
    ]);

    // Prepare the method descriptor
    const descriptor = {
      value: () => 'no params',
    };

    expect(() => {
      Tool({
        description: 'Invalid tool',
      })({}, 'someMethod', descriptor);
    }).toThrow('must have a parameters argument');
  });

  test('should keep original method functionality', () => {
    // Create a simple test method
    const testMethod = vi
      .fn()
      .mockImplementation((params: z.infer<(typeof EmptyParams)['schema']> & { value: string }) => {
        return `Result: ${params.value}`;
      });

    // Apply the decorator manually
    const descriptor = {
      value: testMethod,
    };

    const updatedDescriptor = Tool({
      description: 'Test description',
    })({}, 'testMethod', descriptor);

    // Check that the original method still works
    const result = updatedDescriptor.value({ value: 'test' });
    expect(result).toBe('Result: test');
    expect(testMethod).toHaveBeenCalledWith({ value: 'test' });
  });
});
