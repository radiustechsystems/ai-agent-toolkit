import { describe, expect, test } from 'vitest';
import type { z } from 'zod';
import {
  CheckDataAccessParameters,
  CreateAccessTokenParameters,
  GenerateAuthSignatureParameters,
  GetBalanceBatchParameters,
  GetBalanceDetailsBatchParameters,
  GetBalanceDetailsParameters,
  GetBalanceParameters,
  HandleHttp402ResponseParameters,
  PurchaseDataAccessParameters,
  RecoverSignerParameters,
  VerifySignatureParameters,
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
    testParameterClass(CheckDataAccessParameters, ['resourceUrl'], ['tierId']);
  });

  describe('PurchaseDataAccessParameters', () => {
    testParameterClass(PurchaseDataAccessParameters, ['resourceUrl'], ['tierId', 'maxPrice']);
  });

  describe('GenerateAuthSignatureParameters', () => {
    testParameterClass(GenerateAuthSignatureParameters, ['resourceUrl'], ['challenge', 'tierId']);
  });

  describe('HandleHttp402ResponseParameters', () => {
    testParameterClass(
      HandleHttp402ResponseParameters,
      ['resourceUrl', 'paymentInfo'],
      ['tierId', 'maxPrice', 'amount'],
    );
  });

  describe('CreateAccessTokenParameters', () => {
    testParameterClass(CreateAccessTokenParameters, ['resourceUrl', 'tierId'], ['expiresIn']);
  });

  describe('VerifySignatureParameters', () => {
    testParameterClass(
      VerifySignatureParameters,
      ['resourceUrl', 'challenge', 'signature', 'tierId'],
      [],
    );
  });

  describe('GetBalanceParameters', () => {
    testParameterClass(GetBalanceParameters, ['tierId'], ['address']);
  });

  describe('GetBalanceDetailsParameters', () => {
    testParameterClass(GetBalanceDetailsParameters, ['tierId'], ['address']);
  });

  // Challenge creation parameter tests removed - should be handled by server

  describe('RecoverSignerParameters', () => {
    testParameterClass(RecoverSignerParameters, ['challenge', 'signature'], []);
  });

  describe('GetBalanceBatchParameters', () => {
    testParameterClass(GetBalanceBatchParameters, ['tierIds'], ['addresses']);
  });

  describe('GetBalanceDetailsBatchParameters', () => {
    testParameterClass(GetBalanceDetailsBatchParameters, ['tierIds'], ['addresses']);
  });
});
