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
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// 1. Create a Radius wallet (always validate your environment variables)
const rpcUrl = process.env.RPC_PROVIDER_URL;
const privateKey = process.env.WALLET_PRIVATE_KEY;

if (!rpcUrl || !privateKey) {
  console.warn("WARNING: Missing required environment variables");
  console.warn("RPC_PROVIDER_URL and WALLET_PRIVATE_KEY must be set");
}

const wallet = await createRadiusWallet({
  rpcUrl,
  privateKey
});

// Get wallet address
const address = await wallet.getAddress();
console.log(`Wallet address: ${address}`);

// 2. Configure the tools for Model Context Protocol
const { listOfTools, toolHandler } = await getOnChainTools({
  wallet,
  plugins: [
    sendETH(), // Enable ETH transfers
  ]
});

// 3. Get the available tools
const tools = listOfTools();
console.log(`Configured ${tools.length} tools for Model Context Protocol`);
tools.forEach(tool => {
  console.log(` - ${tool.name}: ${tool.description}`);
});

// 4. Example of using toolHandler directly (for testing)
const toolName = 'get_address';
try {
  const result = await toolHandler(toolName, {});
  console.log(`Tool result: ${JSON.stringify(result, null, 2)}`);
} catch (error: any) {
  console.error(`Tool execution error: ${error.message || String(error)}`);
}

// 5. Use in your MCP server implementation
// In your Express/Fastify/etc. server:
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

If you want to include ERC20 token support, you would add:

```typescript
import { erc20, USDC } from "@radiustechsystems/ai-agent-plugin-erc20";

// Then in the plugins array:
const { listOfTools, toolHandler } = await getOnChainTools({
  wallet,
  plugins: [
    sendETH(), 
    erc20({ tokens: [USDC] }) // Add ERC20 token support
  ]
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

**Default Tools:**

The `getOnChainTools` function automatically provides the following wallet-related tools:

- `get_address`: Get the address of the wallet
- `get_chain`: Get the chain of the wallet
- `get_balance`: Get the balance of an address
- `sign_message`: Sign a message with the wallet
- `simulate_transaction`: Simulate a transaction to check if it would succeed
- `resolve_address`: Resolve an ENS name to an address
- `get_transaction_status`: Check the status of a transaction

**Response Format:**

Tool results are formatted according to the Model Context Protocol specification:

```typescript
interface ToolResponse {
  content: Array<{
    type: 'text' | 'image';
    text?: string;
    image_url?: string;
  }>;
}
```

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

For examples of how to integrate this adapter with an MCP server, see:

- [Vercel AI Micropayments Example](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/examples/micropayments/vercel-ai) (Similar concept, but with Vercel AI SDK)

## Troubleshooting

### Error: Tool Not Found

If you encounter an error about a tool not being found:

1. Check that the tool name exactly matches what is returned by `listOfTools()`
2. Verify that the tool is provided by one of your enabled plugins
3. Remember that tool names are case-sensitive and use snake_case format

### Error: Missing Parameters

If a tool execution fails with a parameter error:

1. Check the tool's schema in `listOfTools()` to see the required parameters
2. Ensure all required parameters are included in the request body
3. Verify parameter types match what is expected (e.g., numbers for amounts, strings for addresses)

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
