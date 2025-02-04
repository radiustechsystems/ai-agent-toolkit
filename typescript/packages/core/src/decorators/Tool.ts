import type { z } from "zod";
import "reflect-metadata";
import { snakeCase } from "../utils/snakeCase";

/**
 * Parameters for the Tool decorator
 */
export type ToolDecoratorParams = {
  /**
   * The name of the tool
   * @default snakeCase(methodName)
   */
  name?: string;
  /** A description of what the tool does */
  description: string;
  /** The parameters schema for the tool */
  parameters: z.ZodSchema;
};

export const toolMetadataKey = Symbol("radius:tool");

/**
 * Decorator that marks a class method as a tool accessible to the LLM
 * @param params - Configuration parameters for the tool
 * @returns A decorator function that can be applied to class methods
 *
 * @example
 * class MyToolService {
 *   @Tool({
 *     description: "Get token balance",
 *     parameters: z.object({ address: z.string() })
 *   })
 *   async getBalance(params: { address: string }) {
 *     return balance;
 *   }
 * }
 */
export function Tool(params: ToolDecoratorParams) {
  return (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const existingTools = Reflect.getMetadata(toolMetadataKey, target.constructor) || new Map();

    existingTools.set(propertyKey, {
      target: descriptor.value,
      name: params.name ?? snakeCase(propertyKey),
      description: params.description,
      parameters: params.parameters
    });

    Reflect.defineMetadata(toolMetadataKey, existingTools, target.constructor);
    return descriptor;
  };
}
