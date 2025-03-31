import { describe, expect, test } from 'vitest';
import type { z } from 'zod';
import {
  CheckDataAccessParameters,
  GenerateAccessSignatureParameters,
  HandleHttp402ResponseParameters,
  PurchaseDataAccessParameters,
} from '../parameters';

// Helper function to test parameter classes
function testParameterClass(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  ParameterClass: any,
  requiredFields: string[],
  optionalFields: string[] = [],
) {
  // biome-ignore lint/suspicious/noExplicitAny: Needed for test fixture
  const schema = (ParameterClass as any).schema as z.ZodObject<any>;

  test(`should have the correct required fields: ${requiredFields.join(', ')}`, () => {
    for (const field of requiredFields) {
      expect(schema.shape[field]).toBeDefined();
      // Test if the field is required by checking if it's not optional
      const fieldSchema = schema.shape[field] as z.ZodType;
      const isOptional = fieldSchema.isOptional();
      expect(isOptional).toBe(false);
    }
  });

  test(`should have the correct optional fields: ${optionalFields.join(', ')}`, () => {
    for (const field of optionalFields) {
      expect(schema.shape[field]).toBeDefined();
      // Test if the field is optional
      const fieldSchema = schema.shape[field] as z.ZodType;
      const isOptional = fieldSchema.isOptional();
      expect(isOptional).toBe(true);
    }
  });
}

describe('Parameter Classes', () => {
  describe('CheckDataAccessParameters', () => {
    testParameterClass(CheckDataAccessParameters, ['datasetId']);
  });

  describe('PurchaseDataAccessParameters', () => {
    testParameterClass(PurchaseDataAccessParameters, ['datasetId'], ['tierId', 'maxPrice']);
  });

  describe('GenerateAccessSignatureParameters', () => {
    testParameterClass(GenerateAccessSignatureParameters, ['datasetId']);
  });

  describe('HandleHttp402ResponseParameters', () => {
    testParameterClass(
      HandleHttp402ResponseParameters,
      ['datasetId', 'price'],
      ['metadataURI', 'url'],
    );
  });
});
