import type { z } from "zod";
import { WalletClientBase } from "../classes";
import { snakeCase } from "../utils/snakeCase";
import "reflect-metadata";

export type ToolDecoratorParams = {
    name?: string;
    description: string;
};

export type StoredToolMetadata = {
    name: string;
    description: string;
    parameters: {
        index: number;
        schema: z.ZodSchema;
    };
    walletClient?: {
        index: number;
    };
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: Function;
};

export type StoredToolMetadataMap = Map<string, StoredToolMetadata>;

export const toolMetadataKey = Symbol("radius:tool");

export function Tool(params: ToolDecoratorParams) {
  return function(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any,
    propertyKey: string | symbol,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptor: TypedPropertyDescriptor<any>
  ) {
    // Store the original method
    const originalMethod = descriptor.value;
        
    // Get the parameter types using the design:paramtypes metadata
    const paramTypes = Reflect.getMetadata("design:paramtypes", target, propertyKey);
        
    if (!paramTypes) {
      throw new Error(
        `No parameter type metadata found for ${String(propertyKey)}. ` +
                "Ensure TypeScript is configured with emitDecoratorMetadata: true"
      );
    }

    // Find the wallet client and parameters in the method signature
    const walletClientIndex = paramTypes.findIndex(isWalletClientParameter);
    const parametersIndex = paramTypes.findIndex(isParametersParameter);

    if (parametersIndex === -1) {
      throw new Error(
        `Method ${String(propertyKey)} must have a parameters argument ` +
                "created with createToolParameters"
      );
    }

    // Get the parameters schema from the parameters class
    const parametersType = paramTypes[parametersIndex];
    const schema = parametersType.prototype.constructor.schema;

    if (!schema) {
      throw new Error(
        `Parameters type for ${String(propertyKey)} must have a schema property`
      );
    }

    // Get or create the tools metadata map on the constructor
    const existingTools: StoredToolMetadataMap = 
            Reflect.getMetadata(toolMetadataKey, target.constructor) || new Map();

    // Store the tool metadata
    existingTools.set(propertyKey.toString(), {
      name: params.name ?? snakeCase(propertyKey.toString()),
      description: params.description,
      parameters: {
        index: parametersIndex,
        schema: schema
      },
      ...(walletClientIndex !== -1 ? {
        walletClient: {
          index: walletClientIndex
        }
      } : {}),
      target: originalMethod
    });

    // Update the metadata on the constructor
    Reflect.defineMetadata(toolMetadataKey, existingTools, target.constructor);

    // Return the original method
    return descriptor;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isWalletClientParameter(param: any): boolean {
  if (!param || !param.prototype) return false;
  if (param === WalletClientBase) return true;
  return param.prototype instanceof WalletClientBase;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isParametersParameter(param: any): boolean {
  return param?.prototype?.constructor?.schema != null;
}
