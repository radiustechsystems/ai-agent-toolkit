
# Radius AI Agent Toolkit - Core

Core abstractions and base classes for the Radius AI Agent Toolkit. This package provides the foundation for building AI agent tools and plugins for interacting with the Radius platform.

This package is part of the [Radius AI Agent Toolkit](https://github.com/radiustechsystems/ai-agent-toolkit), which provides tools for integrating AI agents with the Radius platform.

## Installation

```bash
# Install this specific package
npm install @radiustechsystems/ai-agent-core

# Peer dependencies
npm install zod
```

## Prerequisites

- Node.js >=20.12.2 <23

## Usage

The core package provides base classes and decorators for building AI agent tools and plugins:

```typescript
import { PluginBase, ToolBase, Tool } from "@radiustechsystems/ai-agent-core";
import { z } from "zod";

// Create a custom plugin by extending PluginBase
class MyCustomPlugin extends PluginBase {
  constructor() {
    super("my_custom_plugin");
  }
  
  // Define a tool using the @Tool decorator
  @Tool({
    name: "my_custom_tool",
    description: "Does something useful",
    parameters: z.object({
      param1: z.string().describe("A string parameter"),
      param2: z.number().describe("A number parameter")
    })
  })
  async myCustomTool(params: { param1: string; param2: number }): Promise<string> {
    // Tool implementation
    return `Processed ${params.param1} with value ${params.param2}`;
  }
}

// Create an instance of your plugin
const myPlugin = new MyCustomPlugin();

// Get all tools from the plugin
const tools = myPlugin.getTools();
```

## API Reference

### Base Classes

#### `PluginBase`

Base class for creating Radius AI agent plugins.

**Methods:**

- `getTools()`: Returns all tools defined in the plugin
- `getName()`: Returns the plugin name

#### `ToolBase`

Base class for creating standalone AI agent tools outside of a plugin.

**Methods:**

- `execute(params: unknown)`: Method to be implemented by child classes

### Decorators

#### `@Tool(params)`

Decorator for marking methods as AI agent tools.

**Parameters:**

- `params.name` (string): The name of the tool
- `params.description` (string): Description of what the tool does
- `params.parameters` (z.ZodObject): Zod schema defining the tool's parameters

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
