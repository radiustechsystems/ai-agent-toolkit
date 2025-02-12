import type { z } from "zod";
import { WalletClientBase } from "../classes";
import { snakeCase } from "../utils/snakeCase";
import "reflect-metadata";

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

/**
 * Decorator that marks a class method as a tool accessible to the LLM
 * @param params - Configuration parameters for the tool
 * @returns A decorator function that can be applied to class methods
 * 
 * @example
 * class MyToolService {
 *     @Tool({
 *         description: "Adds two numbers",
 *     })
 *     add({a, b}: AddParameters) {
 *         return a + b;
 *     }
 * }
 */
export function Tool(params: ToolDecoratorParams) {
  return function(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any,
    context: ClassMethodDecoratorContext
  ) {
    // Store the original method
    const originalMethod = target;
        
    // Validate method parameters
    const { parameters, walletClient } = validateMethodParameters(
      target, 
      context.name.toString()
    );

    // Get or create the tools metadata map
    const existingTools: StoredToolMetadataMap =
            Reflect.getMetadata(toolMetadataKey, context.constructor) || new Map();

    // Add this tool's metadata
    existingTools.set(context.name.toString(), {
      target: originalMethod,
      name: params.name ?? snakeCase(context.name.toString()),
      description: params.description,
      parameters,
      ...(walletClient ? { walletClient } : {})
    });

    // Store the metadata
    Reflect.defineMetadata(
      toolMetadataKey, 
      existingTools, 
      context.constructor
    );

    // Return the original method
    return originalMethod;
  };
}

function validateMethodParameters(
  // eslint-disable-next-line @typescript-eslint/ban-types
  target: Function,
  methodName: string,
): {
    parameters: {
        index: number;
        schema: z.ZodSchema;
    };
    walletClient?: {
        index: number;
    };
} {
  const className = target.constructor?.name;
  const logPrefix = `Method '${methodName}'${className ? ` on class '${className}'` : ""}`;
  const explainer = `
        Tool methods must have at least one parameter that is a Zod 
        schema class created with the createToolParameters function.
    `;

  const methodParameters = Reflect.getMetadata(
    "design:paramtypes", 
    target.constructor, 
    methodName
  );

  if (methodParameters == null) {
    throw new Error(`Failed to get parameters for ${logPrefix}.`);
  }
  if (methodParameters.length === 0) {
    throw new Error(`${logPrefix} has no parameters. ${explainer}`);
  }
  if (methodParameters.length > 2) {
    throw new Error(
      `${logPrefix} has ${methodParameters.length} parameters. ${explainer}`
    );
  }

  const parametersParameter = methodParameters.find(isParametersParameter);
  if (parametersParameter == null) {
    throw new Error(`
            ${logPrefix} has no parameters parameter.\n\n
            1.) ${explainer}\n\n
            2.) Ensure that you are not using 'import type' for the parameters.
        `);
  }

  const walletClientParameter = methodParameters.find(isWalletClientParameter);

  return {
    parameters: {
      index: methodParameters.indexOf(parametersParameter),
      schema: parametersParameter.prototype.constructor.schema,
    },
    ...(walletClientParameter
      ? { walletClient: { index: methodParameters.indexOf(walletClientParameter) } }
      : {}),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isWalletClientParameter(param: any) {
  if (!param || !param.prototype) return false;
  if (param === WalletClientBase) return true;
  return param.prototype instanceof WalletClientBase;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isParametersParameter(param: any) {
  return param.prototype?.constructor?.schema != null;
}
