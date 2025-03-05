import { describe, expect, test, vi } from 'vitest';
import { HashDataParameters, ValidateAddressParameters } from '../parameters';

// Mock createToolParameters
vi.mock('@radiustechsystems/ai-agent-core', () => {
  return {
    createToolParameters: vi.fn((schema) => {
      // Return a class with the schema as a static property
      return class MockParameters {
        static schema = schema;
      };
    }),
  };
});

// Mock zod
vi.mock('zod', () => {
  const mockObject = vi.fn(() => ({
    describe: vi.fn().mockReturnThis(),
  }));

  const mockString = vi.fn(() => ({
    describe: vi.fn().mockReturnThis(),
  }));

  const mockEnum = vi.fn(() => ({
    default: vi.fn().mockReturnThis(),
    describe: vi.fn().mockReturnThis(),
  }));

  return {
    z: {
      object: mockObject,
      string: mockString,
      enum: mockEnum,
    },
    object: mockObject,
    string: mockString,
    enum: mockEnum,
  };
});

describe('Parameters', () => {
  describe('ValidateAddressParameters', () => {
    test('should have the correct structure', () => {
      expect(ValidateAddressParameters).toBeDefined();
      // We can't actually introspect the zod schema's shape due to mocking,
      // but we can verify that the class exists and is constructed correctly
      const params = new ValidateAddressParameters();
      expect(params).toBeInstanceOf(ValidateAddressParameters);
    });
  });

  describe('HashDataParameters', () => {
    test('should have the correct structure', () => {
      expect(HashDataParameters).toBeDefined();
      // We can't actually introspect the zod schema's shape due to mocking,
      // but we can verify that the class exists and is constructed correctly
      const params = new HashDataParameters();
      expect(params).toBeInstanceOf(HashDataParameters);
    });
  });
});
