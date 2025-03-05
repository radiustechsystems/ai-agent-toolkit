import { describe, expect, test } from 'vitest';
import {
  ApproveParameters,
  ConvertFromBaseUnitParameters,
  ConvertToBaseUnitParameters,
  GetTokenAllowanceParameters,
  GetTokenBalanceParameters,
  GetTokenInfoBySymbolParameters,
  GetTokenTotalSupplyParameters,
  RevokeApprovalParameters,
  TransferFromParameters,
  TransferParameters,
} from '../erc20.parameters';

describe('erc20.parameters', () => {
  test('GetTokenInfoBySymbolParameters schema validates correctly', () => {
    const input = { symbol: 'ETH' };
    const result = GetTokenInfoBySymbolParameters.schema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  test('GetTokenBalanceParameters schema validates correctly', () => {
    const input = {
      wallet: '0x123',
      tokenAddress: '0x456',
      decimals: 18,
    };
    const result = GetTokenBalanceParameters.schema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }

    // Test optional decimal
    const inputWithoutDecimal = {
      wallet: '0x123',
      tokenAddress: '0x456',
    };
    const resultWithoutDecimal = GetTokenBalanceParameters.schema.safeParse(inputWithoutDecimal);
    expect(resultWithoutDecimal.success).toBe(true);
  });

  test('TransferParameters schema validates correctly', () => {
    const input = {
      tokenAddress: '0x123',
      to: '0x456',
      amount: '100',
      formatAmount: true,
      decimals: 18,
    };
    const result = TransferParameters.schema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }

    // Test optional parameters
    const inputWithoutOptionals = {
      tokenAddress: '0x123',
      to: '0x456',
      amount: '100',
    };
    const resultWithoutOptionals = TransferParameters.schema.safeParse(inputWithoutOptionals);
    expect(resultWithoutOptionals.success).toBe(true);
    if (resultWithoutOptionals.success) {
      expect(resultWithoutOptionals.data.formatAmount).toBe(false); // Default value
    }
  });

  test('GetTokenTotalSupplyParameters schema validates correctly', () => {
    const input = {
      tokenAddress: '0x123',
      decimals: 18,
    };
    const result = GetTokenTotalSupplyParameters.schema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }

    // Test optional decimal
    const inputWithoutDecimal = {
      tokenAddress: '0x123',
    };
    const resultWithoutDecimal =
      GetTokenTotalSupplyParameters.schema.safeParse(inputWithoutDecimal);
    expect(resultWithoutDecimal.success).toBe(true);
  });

  test('GetTokenAllowanceParameters schema validates correctly', () => {
    const input = {
      tokenAddress: '0x123',
      owner: '0x456',
      spender: '0x789',
      decimals: 18,
    };
    const result = GetTokenAllowanceParameters.schema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }

    // Test optional decimal
    const inputWithoutDecimal = {
      tokenAddress: '0x123',
      owner: '0x456',
      spender: '0x789',
    };
    const resultWithoutDecimal = GetTokenAllowanceParameters.schema.safeParse(inputWithoutDecimal);
    expect(resultWithoutDecimal.success).toBe(true);
  });

  test('ApproveParameters schema validates correctly', () => {
    const input = {
      tokenAddress: '0x123',
      spender: '0x456',
      amount: '100',
      formatAmount: true,
      decimals: 18,
    };
    const result = ApproveParameters.schema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }

    // Test optional parameters
    const inputWithoutOptionals = {
      tokenAddress: '0x123',
      spender: '0x456',
      amount: '100',
    };
    const resultWithoutOptionals = ApproveParameters.schema.safeParse(inputWithoutOptionals);
    expect(resultWithoutOptionals.success).toBe(true);
    if (resultWithoutOptionals.success) {
      expect(resultWithoutOptionals.data.formatAmount).toBe(false); // Default value
    }
  });

  test('RevokeApprovalParameters schema validates correctly', () => {
    const input = {
      tokenAddress: '0x123',
      spender: '0x456',
    };
    const result = RevokeApprovalParameters.schema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  test('TransferFromParameters schema validates correctly', () => {
    const input = {
      tokenAddress: '0x123',
      from: '0x456',
      to: '0x789',
      amount: '100',
      formatAmount: true,
      decimals: 18,
    };
    const result = TransferFromParameters.schema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }

    // Test optional parameters
    const inputWithoutOptionals = {
      tokenAddress: '0x123',
      from: '0x456',
      to: '0x789',
      amount: '100',
    };
    const resultWithoutOptionals = TransferFromParameters.schema.safeParse(inputWithoutOptionals);
    expect(resultWithoutOptionals.success).toBe(true);
    if (resultWithoutOptionals.success) {
      expect(resultWithoutOptionals.data.formatAmount).toBe(false); // Default value
    }
  });

  test('ConvertToBaseUnitParameters schema validates correctly', () => {
    const input = {
      amount: '100',
      decimals: 18,
    };
    const result = ConvertToBaseUnitParameters.schema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }

    // Test with number amount
    const inputWithNumberAmount = {
      amount: 100,
      decimals: 18,
    };
    const resultWithNumberAmount =
      ConvertToBaseUnitParameters.schema.safeParse(inputWithNumberAmount);
    expect(resultWithNumberAmount.success).toBe(true);
  });

  test('ConvertFromBaseUnitParameters schema validates correctly', () => {
    const input = {
      amount: '100',
      decimals: 18,
    };
    const result = ConvertFromBaseUnitParameters.schema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }

    // Test with number amount
    const inputWithNumberAmount = {
      amount: 100,
      decimals: 18,
    };
    const resultWithNumberAmount =
      ConvertFromBaseUnitParameters.schema.safeParse(inputWithNumberAmount);
    expect(resultWithNumberAmount.success).toBe(true);

    // Test with bigint amount
    const inputWithBigintAmount = {
      amount: BigInt(100),
      decimals: 18,
    };
    const resultWithBigintAmount =
      ConvertFromBaseUnitParameters.schema.safeParse(inputWithBigintAmount);
    expect(resultWithBigintAmount.success).toBe(true);
  });
});
