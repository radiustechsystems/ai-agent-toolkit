# Radius AI Agent Toolkit - Model Context Protocol Adapter

This adapter provides integration between the Radius AI Agent Toolkit and the Model Context Protocol (MCP), allowing you to easily add Radius capabilities to AI agents using models like Claude that support the MCP.

This package is part of the [Radius AI Agent Toolkit](https://github.com/radiustechsystems/ai-agent-toolkit), which provides tools for integrating AI agents with the Radius platform.

## Installation

```bash
# Install this specific package
npm install @radiustechsystems/ai-agent-adapter-model-context-protocol

# Required peer dependencies
npm install @radiustechsystems/ai-agent-core
npm install zod-to-json-schema
```

## Prerequisites

- Node.js >=20.12.2 <23
- A server setup that implements the Model Context Protocol
- Radius wallet setup with a funded account

## Usage

```typescript
import { getOnChainTools } from "@radiustechsystems/ai-agent-adapter-model-context-protocol";
import { createRadiusWallet, sendETH } from "@radiustechsystems/ai-agent-wallet";
import { erc20, USDC } from "@radiustechsystems/ai-agent-plugin-erc20";

// 1. Create a Radius wallet
const wallet = await createRadiusWallet({
  rpcUrl: process.env.RPC_PROVIDER_URL,
  privateKey: process.env.WALLET_PRIVATE_KEY
});

// 2. Configure the tools for Model Context Protocol
const { listOfTools, toolHandler } = await getOnChainTools({
  wallet,
  plugins: [
    sendETH(), // Enable ETH transfers
    erc20({ tokens: [USDC] }) // Enable ERC20 token operations
  ]
});

// 3. Use in your MCP server implementation
app.post('/tools', (req, res) => {
  // Return list of available tools
  res.json(listOfTools());
});

app.post('/tools/:name', async (req, res) => {
  try {
    // Handle tool execution
    const result = await toolHandler(req.params.name, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## API Reference

### `getOnChainTools(options)`

Creates tool handlers compatible with the Model Context Protocol that provide access to configured Radius features.

**Parameters:**

- `options.wallet` (WalletClientBase): A Radius wallet instance
- `options.plugins` (Array): Array of plugin instances to enable

**Returns:**

- An object containing:
  - `listOfTools()`: Function that returns tool definitions in MCP format
  - `toolHandler(name, parameters)`: Function that executes a tool and returns the result in MCP format

**Example:**

```typescript
const { listOfTools, toolHandler } = await getOnChainTools({
  wallet,
  plugins: [
    sendETH(),
    erc20({ tokens: [USDC] })
  ]
});
```

## Integration Examples

For a conceptual example of how to integrate this adapter with an MCP server, see:

- [Vercel AI Micropayments Example](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/examples/micropayments/vercel-ai) (Similar concept, but with Vercel AI SDK)

## Related Packages

- [@radiustechsystems/ai-agent-core](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/core): Core abstractions and base classes
- [@radiustechsystems/ai-agent-wallet](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/wallets): Wallet functionality
- [@radiustechsystems/ai-agent-plugin-erc20](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/plugins/erc20): ERC20 token operations
- [@radiustechsystems/ai-agent-adapter-vercel-ai](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/adapters/vercel-ai): Vercel AI adapter

## Resources

- [Website](https://radiustech.xyz/)
- [Testnet Access](https://docs.radiustech.xyz/radius-testnet-access)
- [GitHub Issues](https://github.com/radiustechsystems/ai-agent-toolkit/issues)
- [Changelog](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CHANGELOG.md)

## Contributing

Please see the [Contributing Guide](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CONTRIBUTING.md) for detailed information about contributing to this toolkit.

## License

This project is licensed under the [MIT License](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/LICENSE).
