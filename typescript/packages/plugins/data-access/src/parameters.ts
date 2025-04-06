import { createToolParameters } from '@radiustechsystems/ai-agent-core';
import { z } from 'zod';

/**
 * Parameters for checking token balance and access
 */
export class CheckDataAccessParameters extends createToolParameters(
  z.object({
    resourceUrl: z.string().describe('The URL of the resource to check access for'),
    tierId: z.number().optional().describe('The specific tier ID to check access for'),
  }),
) {}

/**
 * Parameters for purchasing access tokens
 */
export class PurchaseDataAccessParameters extends createToolParameters(
  z.object({
    resourceUrl: z.string().describe('The URL of the resource to purchase access for'),
    tierId: z.number().optional().describe('The specific tier ID to purchase'),
    amount: z.number().optional().default(1).describe('Number of tokens to purchase'),
    maxPrice: z.string().optional().describe('Maximum price willing to pay in wei'),
  }),
) {}

/**
 * Parameters for generating authentication signature
 */
export class GenerateAuthSignatureParameters extends createToolParameters(
  z.object({
    resourceUrl: z.string().describe('The URL of the resource to generate a signature for'),
    challenge: z.string().optional().describe('The challenge data to sign'),
    tierId: z.number().optional().describe('The tier ID to authenticate for'),
  }),
) {}

/**
 * Parameters for handling HTTP 402 responses
 */
export class HandleHttp402ResponseParameters extends createToolParameters(
  z.object({
    resourceUrl: z.string().describe('The URL of the resource requiring payment'),
    paymentInfo: z.object({
      contract: z.string().describe('The contract address'),
      networks: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
        }),
      ),
      tiers: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
          description: z.string(),
          domains: z.array(z.string()),
          price: z.number(),
          ttl: z.number(),
          active: z.boolean(),
          // Additional fields from new contract
          transferable: z.boolean().optional(),
          burnable: z.boolean().optional(),
          forSale: z.boolean().optional(),
        }),
      ),
    }).describe('The payment information from the 402 response'),
    tierId: z.number().optional().describe('Specific tier ID to purchase'),
    amount: z.number().optional().default(1).describe('Number of tokens to purchase'),
    maxPrice: z.string().optional().describe('Maximum price willing to pay in wei'),
  }),
) {}

/**
 * Parameters for verifying a signature and checking balance
 */
export class VerifySignatureParameters extends createToolParameters(
  z.object({
    resourceUrl: z.string().describe('The URL of the resource'),
    challenge: z.string().describe('The challenge string that was signed'),
    signature: z.string().describe('The signature to verify'),
    tierId: z.number().describe('The tier ID to check balance for'),
  }),
) {}

/**
 * Parameters for recovering a signer address from signature
 */
export class RecoverSignerParameters extends createToolParameters(
  z.object({
    challenge: z.string().describe('The challenge string that was signed'),
    signature: z.string().describe('The signature to verify'),
  }),
) {}

/**
 * Parameters for getting token balance
 */
export class GetBalanceParameters extends createToolParameters(
  z.object({
    tierId: z.number().describe('The tier ID to check balance for'),
    address: z.string().optional().describe('Optional address to check (defaults to agent wallet)'),
  }),
) {}

/**
 * Parameters for getting balance details with expiration
 */
export class GetBalanceDetailsParameters extends createToolParameters(
  z.object({
    tierId: z.number().describe('The tier ID to check balance details for'),
    address: z.string().optional().describe('Optional address to check (defaults to agent wallet)'),
  }),
) {}

/**
 * Parameters for creating a JWT access token
 */
export class CreateAccessTokenParameters extends createToolParameters(
  z.object({
    resourceUrl: z.string().describe('The URL of the resource'),
    tierId: z.number().describe('The tier ID to create a token for'),
    expiresIn: z.string().optional().describe('Optional override for token expiration'),
  }),
) {}

/**
 * Parameters for creating an authentication challenge
 */
export class CreateChallengeParameters extends createToolParameters(
  z.object({
    address: z.string().describe('The address to create a challenge for'),
  }),
) {}
