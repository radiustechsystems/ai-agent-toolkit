import { createToolParameters } from '@radiustechsystems/ai-agent-core';
import { z } from 'zod';

export class CheckDataAccessParameters extends createToolParameters(
  z.object({
    datasetId: z.string().describe('The ID of the dataset to check access for'),
  }),
) {}

export class PurchaseDataAccessParameters extends createToolParameters(
  z.object({
    datasetId: z.string().describe('The ID of the dataset to purchase access for'),

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
    datasetId: z.string().describe('The ID of the dataset to generate a signature for'),
  }),
) {}

export class HandleHttp402ResponseParameters extends createToolParameters(
  z.object({
    datasetId: z.string().describe('The ID of the dataset requiring payment'),

    price: z.string().describe('The price in wei'),

    metadataURI: z.string().optional().describe('Optional URI for dataset metadata'),

    // Optional URL to retry after purchasing access
    url: z.string().optional().describe('The URL to retry after purchasing access'),
  }),
) {}
