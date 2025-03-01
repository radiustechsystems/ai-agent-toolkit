import { createToolParameters } from "@radiustechsystems/ai-agent-core";
import { z } from "zod";

export class DeployContractParameters extends createToolParameters(
  z.object({
    bytecode: z.string().describe("The compiled contract bytecode to deploy"),
    abi: z.array(z.any()).describe("The contract ABI"),
    constructorArgs: z.array(z.any()).optional().describe("Arguments for the contract constructor"),
    value: z.string().optional().describe("Amount of native currency to send with deployment")
  }),
) {}

export class CallContractParameters extends createToolParameters(
  z.object({
    contractAddress: z.string().describe("The address of the contract to interact with"),
    abi: z.array(z.any()).describe("The ABI of the contract or ABI for the specific function"),
    functionName: z.string().describe("The name of the function to call"),
    args: z.array(z.any()).optional().describe("The arguments to pass to the function call")
  }),
) {}

export class ExecuteContractParameters extends createToolParameters(
  z.object({
    contractAddress: z.string().describe("The address of the contract to interact with"),
    abi: z.array(z.any()).describe("The ABI of the contract or ABI for the specific function"),
    functionName: z.string().describe("The name of the function to execute"),
    args: z.array(z.any()).optional().describe("The arguments to pass to the function"),
    value: z.string().optional().describe("Amount of native currency to send with the transaction")
  }),
) {}

export class EstimateContractGasParameters extends createToolParameters(
  z.object({
    contractAddress: z.string().describe("The address of the contract to interact with"),
    abi: z.array(z.any()).describe("The ABI of the contract or ABI for the specific function"),
    functionName: z.string().describe("The name of the function to estimate gas for"),
    args: z.array(z.any()).optional().describe("The arguments to pass to the function"),
    value: z.string().optional().describe("Amount of native currency to send with the transaction")
  }),
) {}

export class GetContractEventsParameters extends createToolParameters(
  z.object({
    contractAddress: z.string().describe("The address of the contract to get events from"),
    abi: z.array(z.any()).describe("The ABI of the contract or ABI for the specific event"),
    eventName: z.string().describe("The name of the event to get"),
    fromBlock: z.number().optional().describe("The block number to start getting events from"),
    toBlock: z.number().optional().describe("The block number to stop getting events from"),
    filter: z.record(z.any()).optional().describe("Filters to apply to the event query")
  }),
) {}

export class EncodeAbiParameters extends createToolParameters(
  z.object({
    abi: z.array(z.any()).describe("The ABI to use for encoding"),
    functionName: z.string().describe("The name of the function to encode"),
    args: z.array(z.any()).describe("The arguments to encode")
  }),
) {}

export class DecodeAbiParameters extends createToolParameters(
  z.object({
    abi: z.array(z.any()).describe("The ABI to use for decoding"),
    functionName: z.string().describe("The name of the function to decode"),
    data: z.string().describe("The encoded data to decode")
  }),
) {}

export class SimulateContractParameters extends createToolParameters(
  z.object({
    contractAddress: z.string().describe("The address of the contract to simulate interaction with"),
    abi: z.array(z.any()).describe("The ABI of the contract or ABI for the specific function"),
    functionName: z.string().describe("The name of the function to simulate"),
    args: z.array(z.any()).optional().describe("The arguments to pass to the function"),
    value: z.string().optional().describe("Amount of native currency to send with the transaction"),
    from: z.string().optional().describe("Address to simulate transaction from (defaults to wallet address)")
  }),
) {}

export class GetContractInfoParameters extends createToolParameters(
  z.object({
    contractAddress: z.string().describe("The address of the contract to get information about"),
    abiOrVerified: z.union([
      z.array(z.any()),
      z.boolean()
    ]).describe("Either provide the contract ABI or set to true to attempt auto-fetching verified contract ABI")
  }),
) {}