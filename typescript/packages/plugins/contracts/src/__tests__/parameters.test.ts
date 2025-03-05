import { describe, expect, test, vi } from 'vitest';
import {
  CallContractParameters,
  ExecuteContractParameters,
  SimulateContractParameters,
} from '../parameters';

// Mock createToolParameters
vi.mock('@radiustechsystems/ai-agent-core', () => {
  return {
    createToolParameters: vi.fn((schema) => {
      // Return a class with the schema as a static property
      // biome-ignore lint/complexity/noStaticOnlyClass: Intentional for testing
      return class MockParameters {
        static schema = schema;
      };
    }),
  };
});

// Mock zod functions
vi.mock('zod', () => {
  // Mock functions for zod validators
  const objectMock = vi.fn(() => ({
    describe: vi.fn().mockReturnThis(),
  }));

  const stringMock = vi.fn(() => ({
    describe: vi.fn().mockReturnThis(),
    optional: vi.fn().mockReturnValue({
      describe: vi.fn().mockReturnThis(),
    }),
  }));

  const arrayMock = vi.fn(() => ({
    describe: vi.fn().mockReturnThis(),
    optional: vi.fn().mockReturnValue({
      describe: vi.fn().mockReturnThis(),
    }),
  }));

  const anyMock = vi.fn(() => ({}));

  return {
    z: {
      object: objectMock,
      string: stringMock,
      array: arrayMock,
      any: anyMock,
    },
    object: objectMock,
    string: stringMock,
    array: arrayMock,
    any: anyMock,
  };
});

describe('ContractsPlugin Parameters', () => {
  describe('CallContractParameters', () => {
    test('should be properly defined', () => {
      expect(CallContractParameters).toBeDefined();

      // Create an instance for testing
      const params = new CallContractParameters();
      expect(params).toBeInstanceOf(CallContractParameters);

      // Verify the schema was created (static property exists)
      expect(CallContractParameters.schema).toBeDefined();
    });
  });

  describe('ExecuteContractParameters', () => {
    test('should be properly defined', () => {
      expect(ExecuteContractParameters).toBeDefined();

      // Create an instance for testing
      const params = new ExecuteContractParameters();
      expect(params).toBeInstanceOf(ExecuteContractParameters);

      // Verify the schema was created (static property exists)
      expect(ExecuteContractParameters.schema).toBeDefined();
    });
  });

  describe('SimulateContractParameters', () => {
    test('should be properly defined', () => {
      expect(SimulateContractParameters).toBeDefined();

      // Create an instance for testing
      const params = new SimulateContractParameters();
      expect(params).toBeInstanceOf(SimulateContractParameters);

      // Verify the schema was created (static property exists)
      expect(SimulateContractParameters.schema).toBeDefined();
    });
  });
});
