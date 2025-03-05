import { createToolParameters } from '@radiustechsystems/ai-agent-core';
import { z } from 'zod';

export class GetTokenInfoBySymbolParameters extends createToolParameters(
  z.object({
    symbol: z.string().describe('The symbol of the token to get the info of'),
  }),
) {}

export class GetTokenBalanceParameters extends createToolParameters(
  z.object({
    wallet: z.string().describe('The address to get the balance of'),
    tokenAddress: z.string().describe('The address of the token to get the balance of'),

    decimals: z
      .number()
      .optional()
      .describe('The number of decimals of the token (optional, will attempt to auto-detect)'),
  }),
) {}

export class TransferParameters extends createToolParameters(
  z.object({
    tokenAddress: z.string().describe('The address of the token to transfer'),
    to: z.string().describe('The address to transfer the token to'),

    amount: z
      .string()
      .describe(
        'The amount of tokens to transfer (in base units by default, or decimal units if formatAmount=true)',
      ),

    formatAmount: z
      .boolean()
      .optional()
      .default(false)
      .describe('If true, amount is in decimal units and will be converted to base units'),

    decimals: z
      .number()
      .optional()
      .describe(
        'The number of decimals to use when parsing amount (optional, will attempt to auto-detect)',
      ),
  }),
) {}

export class GetTokenTotalSupplyParameters extends createToolParameters(
  z.object({
    tokenAddress: z.string().describe('The address of the token to get the total supply of'),

    decimals: z
      .number()
      .optional()
      .describe('The number of decimals of the token (optional, will attempt to auto-detect)'),
  }),
) {}

export class GetTokenAllowanceParameters extends createToolParameters(
  z.object({
    tokenAddress: z.string().describe('The address of the token to check the allowance of'),
    owner: z.string().describe('The address of the token owner'),
    spender: z.string().describe('The address of the spender to check allowance for'),

    decimals: z
      .number()
      .optional()
      .describe('The number of decimals of the token (optional, will attempt to auto-detect)'),
  }),
) {}

export class ApproveParameters extends createToolParameters(
  z.object({
    tokenAddress: z.string().describe('The address of the token to approve'),
    spender: z.string().describe('The address to approve the allowance to'),

    amount: z
      .string()
      .describe(
        'The amount of tokens to approve (in base units by default, or decimal units if formatAmount=true)',
      ),

    formatAmount: z
      .boolean()
      .optional()
      .default(false)
      .describe('If true, amount is in decimal units and will be converted to base units'),

    decimals: z
      .number()
      .optional()
      .describe(
        'The number of decimals to use when parsing amount (optional, will attempt to auto-detect)',
      ),
  }),
) {}

export class RevokeApprovalParameters extends createToolParameters(
  z.object({
    tokenAddress: z.string().describe('The address of the token to revoke'),
    spender: z.string().describe('The address to revoke the allowance to'),
  }),
) {}

export class TransferFromParameters extends createToolParameters(
  z.object({
    tokenAddress: z.string().describe('The address of the token to transfer'),
    from: z.string().describe('The address to transfer the token from'),
    to: z.string().describe('The address to transfer the token to'),

    amount: z
      .string()
      .describe(
        'The amount of tokens to transfer (in base units by default, or decimal units if formatAmount=true)',
      ),

    formatAmount: z
      .boolean()
      .optional()
      .default(false)
      .describe('If true, amount is in decimal units and will be converted to base units'),

    decimals: z
      .number()
      .optional()
      .describe(
        'The number of decimals to use when parsing amount (optional, will attempt to auto-detect)',
      ),
  }),
) {}

export class ConvertToBaseUnitParameters extends createToolParameters(
  z.object({
    amount: z
      .union([z.number(), z.string()])
      .describe('The amount of tokens to convert from decimal units to base units'),
    decimals: z.number().describe('The number of decimals of the token'),
  }),
) {}

export class ConvertFromBaseUnitParameters extends createToolParameters(
  z.object({
    amount: z
      .union([z.number(), z.string(), z.bigint()])
      .describe('The amount of tokens to convert from base units to decimal units'),
    decimals: z.number().describe('The number of decimals of the token'),
  }),
) {}
