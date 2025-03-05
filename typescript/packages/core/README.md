
# Radius AI Agent Toolkit - Core

Core abstractions and base classes for the Radius AI Agent Toolkit. This package provides the foundation for building AI agent tools and plugins for interacting with the Radius platform.

This package is part of the [Radius AI Agent Toolkit](https://github.com/radiustechsystems/ai-agent-toolkit), which provides tools for integrating AI agents with the Radius platform.

## Installation

```bash
# Install this specific package
npm install @radiustechsystems/ai-agent-core

# Peer dependencies
npm install zod reflect-metadata
```

## Prerequisites

- Node.js >=20.12.2 <23
- TypeScript configuration with:
  - `experimentalDecorators: true`
  - `emitDecoratorMetadata: true`

Example tsconfig.json:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    // ... other options
  }
}
```

## Usage

The core package provides base classes and decorators for building AI agent tools and plugins:

```typescript
import { PluginBase, Tool, createToolParameters } from "@radiustechsystems/ai-agent-core";
import { z } from "zod";

// First, create parameter types using createToolParameters
const MyToolParams = createToolParameters(
  z.object({
    param1: z.string().describe("A string parameter"),
    param2: z.number().describe("A number parameter")
  })
);

// Create service class that implements the tool logic
class MyService {
  @Tool({
    description: "Does something useful"
  })
  async myCustomTool(params: MyToolParams): Promise<string> {
    // Tool implementation
    return `Processed ${params.param1} with value ${params.param2}`;
  }
}

// Create a custom plugin by extending PluginBase
class MyCustomPlugin extends PluginBase {
  private service: MyService;
  
  constructor() {
    // Pass the name and tool providers to the parent constructor
    const service = new MyService();
    super("my_custom_plugin", [service]);
    this.service = service;
  }
  
  // Implement required abstract method
  supportsChain(chain: any): boolean {
    // For simplicity, support all chains in this example
    return true;
  }
}

// Create a mock wallet client (simplified for example)
class MockWalletClient {
  getAddress() { return "0x..."; }
  getChain() { return { type: "evm", id: 1 }; }
  // Other required wallet methods
}

// Create an instance of your plugin
const myPlugin = new MyCustomPlugin();
const walletClient = new MockWalletClient();

// Get all tools from the plugin (passing required wallet client)
const tools = myPlugin.getTools(walletClient);

// Execute a tool
if (tools.length > 0) {
  const result = await tools[0].execute({
    param1: "test-string",
    param2: 42
  });
  console.log(result); // "Processed test-string with value 42"
}
```

## API Reference

### Base Classes

#### `PluginBase`

Abstract base class for creating Radius AI agent plugins. Plugins provide a way to organize related tools.

**Constructor:**

- `constructor(name: string, toolProviders: object[])`: Creates a new plugin with the given name and tool providers

**Properties:**

- `name`: The name of the plugin
- `toolProviders`: Array of objects that provide tools (using the `@Tool` decorator)

**Methods:**

- `getTools(walletClient: WalletClientBase)`: Returns all tools defined in the plugin
- `supportsChain(chain: Chain)`: Abstract method that must be implemented to check if the plugin supports a chain

#### `ToolBase`

Base class for creating standalone AI agent tools. Tools created with this class can be used directly without a plugin.

**Constructor:**

- `constructor(options: { name: string; description: string; parameters: z.ZodSchema }, executeFunction: (params: any) => Promise<any>)`: Creates a new tool

**Properties:**

- `name`: The name of the tool
- `description`: Description of what the tool does
- `parameters`: Zod schema defining the tool's parameters

**Methods:**

- `execute(params: unknown)`: Executes the tool with the given parameters

**Factory Function:**

The `createTool` function can be used to create a new `ToolBase` instance:

```typescript
import { createTool } from "@radiustechsystems/ai-agent-core";
import { z } from "zod";

const myTool = createTool(
  {
    name: "my_tool",
    description: "Does something useful",
    parameters: z.object({
      value: z.string().describe("A parameter")
    })
  },
  async (params) => {
    // Tool implementation
    return `Processed ${params.value}`;
  }
);
```

### Decorators

#### `@Tool(params)`

Decorator for marking methods as AI agent tools.

**Parameters:**

- `params.name` (string, optional): The name of the tool (defaults to the method name in snake_case)
- `params.description` (string): Description of what the tool does

### Utility Functions

#### `createToolParameters(schema)`

Creates a class with a static schema property that can be used as a parameter type for tools.

**Parameters:**

- `schema` (z.ZodSchema): Zod schema defining the tool's parameters

**Returns:**

- A class that can be used as a parameter type for tools

**Example:**

```typescript
import { createToolParameters } from "@radiustechsystems/ai-agent-core";
import { z } from "zod";

// Create parameter type
const MyParams = createToolParameters(
  z.object({
    name: z.string().describe("The name parameter"),
    value: z.number().describe("The value parameter")
  })
);

// Use in a tool method
@Tool({
  description: "Example tool"
})
async myTool(params: MyParams): Promise<string> {
  // Params are fully typed
  return `Name: ${params.name}, Value: ${params.value}`;
}
```

## Integration Examples

For complete examples integrating this package with AI frameworks, see:

- [Vercel AI Micropayments Example](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/examples/micropayments/vercel-ai)

## Related Packages

- [@radiustechsystems/ai-agent-wallet](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/wallets): Wallet functionality for interacting with blockchain
- [@radiustechsystems/ai-agent-adapter-vercel-ai](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/adapters/vercel-ai): Adapter for Vercel AI SDK integration
- [@radiustechsystems/ai-agent-plugin-erc20](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/plugins/erc20): Plugin for ERC20 token interactions

## Resources

- [Website](https://radiustech.xyz/)
- [Testnet Access](https://docs.radiustech.xyz/radius-testnet-access)
- [GitHub Issues](https://github.com/radiustechsystems/ai-agent-toolkit/issues)
- [Changelog](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CHANGELOG.md)

## Contributing

Please see the [Contributing Guide](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CONTRIBUTING.md) for detailed information about contributing to this toolkit.

## License

This project is licensed under the [MIT License](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/LICENSE).
