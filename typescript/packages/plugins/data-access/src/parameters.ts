import { createToolParameters } from '@radiustechsystems/ai-agent-core';
import { z } from 'zod';

export class CheckDataAccessParameters extends createToolParameters(
  z.object({
    resourceUrl: z.string().describe('The URL of the resource to check access for'),
    tierId: z.number().optional().describe('The specific tier ID to check access for'),
  }),
) {}

export class PurchaseDataAccessParameters extends createToolParameters(
  z.object({
    resourceUrl: z.string().describe('The URL of the resource to purchase access for'),

    // Optional tier ID if multiple tiers are available
    tierId: z
      .number()
      .optional()
      .describe('The specific access tier ID to purchase, if multiple tiers are available'),

    // Optional maximum price to pay (defaults to plugin config)
    maxPrice: z
      .string()
      .optional()
      .describe('The maximum price willing to pay for access in wei (overrides plugin config)'),
  }),
) {}

export class GenerateAccessSignatureParameters extends createToolParameters(
  z.object({
    resourceUrl: z.string().describe('The URL of the resource to generate a signature for'),
    challenge: z
      .string()
      .optional()
      .describe('The EIP-712 challenge string received from the server'),
    tierId: z.number().optional().describe('The tier ID to use for signature generation'),
  }),
) {}

export class HandleHttp402ResponseParameters extends createToolParameters(
  z.object({
    resourceUrl: z.string().describe('The URL of the resource requiring payment'),
    paymentInfo: z
      .object({
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
          }),
        ),
      })
      .describe('The payment information from the 402 response'),
    tierId: z
      .number()
      .optional()
      .describe('Specific tier ID to purchase (if multiple are available)'),
    maxPrice: z
      .string()
      .optional()
      .describe('The maximum price willing to pay for access in wei (overrides plugin config)'),
  }),
) {}

export class VerifyChallengeParameters extends createToolParameters(
  z.object({
    resourceUrl: z.string().describe('The URL of the resource'),
    challenge: z.string().describe('The challenge string to verify'),
    signature: z.string().describe('The signature of the challenge'),
  }),
) {}

export class CreateAccessTokenParameters extends createToolParameters(
  z.object({
    resourceUrl: z.string().describe('The URL of the resource'),
    tierId: z.number().describe('The tier ID to create a token for'),
  }),
) {}
