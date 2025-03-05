import { createToolParameters } from '@radiustechsystems/ai-agent-core';
import { z } from 'zod';

/**
 * Parameters for contract-related tools
 * Note: Only includes parameters for methods that are fully supported by the current wallet interface
 */

export class CallContractParameters extends createToolParameters(
  z.object({
    contractAddress: z.string().describe('The address of the contract to interact with'),
    abi: z.array(z.any()).describe('The ABI of the contract or ABI for the specific function'),
    functionName: z.string().describe('The name of the function to call'),
    args: z.array(z.any()).optional().describe('The arguments to pass to the function call'),
  }),
) {}

export class ExecuteContractParameters extends createToolParameters(
  z.object({
    contractAddress: z.string().describe('The address of the contract to interact with'),
    abi: z.array(z.any()).describe('The ABI of the contract or ABI for the specific function'),
    functionName: z.string().describe('The name of the function to execute'),
    args: z.array(z.any()).optional().describe('The arguments to pass to the function'),
    value: z.string().optional().describe('Amount of native currency to send with the transaction'),
  }),
) {}

export class SimulateContractParameters extends createToolParameters(
  z.object({
    contractAddress: z
      .string()
      .describe('The address of the contract to simulate interaction with'),
    abi: z.array(z.any()).describe('The ABI of the contract or ABI for the specific function'),
    functionName: z.string().describe('The name of the function to simulate'),
    args: z.array(z.any()).optional().describe('The arguments to pass to the function'),
    value: z.string().optional().describe('Amount of native currency to send with the transaction'),
  }),
) {}
