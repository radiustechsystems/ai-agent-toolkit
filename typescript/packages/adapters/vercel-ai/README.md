# Radius AI Agent Toolkit - Vercel AI Adapter

This adapter provides integration between the Radius AI Agent Toolkit and the Vercel AI SDK, allowing you to easily add Radius capabilities to AI agents built with the Vercel AI SDK.

This package is part of the [Radius AI Agent Toolkit](https://github.com/radiustechsystems/ai-agent-toolkit), which provides tools for integrating AI agents with the Radius platform.

## Installation

```bash
# Install this specific package
npm install @radiustechsystems/ai-agent-adapter-vercel-ai

# Required peer dependencies
npm install @radiustechsystems/ai-agent-core
npm install ai
```

## Prerequisites

- Node.js >=20.12.2 <23
- Vercel AI SDK installed in your project:
  - `npm install ai @ai-sdk/openai`
- OpenAI API key (or other model provider supported by Vercel AI SDK)
- Radius wallet setup with a funded account

## Usage

```typescript
import { getOnChainTools } from "@radiustechsystems/ai-agent-adapter-vercel-ai";
import { createRadiusWallet, sendETH } from "@radiustechsystems/ai-agent-wallet";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// 1. Create a Radius wallet (always validate your environment variables)
const rpcUrl = process.env.RPC_PROVIDER_URL;
const privateKey = process.env.WALLET_PRIVATE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!rpcUrl || !privateKey) {
  console.warn("WARNING: Missing required wallet environment variables");
  console.warn("RPC_PROVIDER_URL and WALLET_PRIVATE_KEY must be set");
  throw new Error("Missing wallet configuration");
}

if (!openaiApiKey) {
  console.warn("WARNING: Missing OPENAI_API_KEY environment variable");
  throw new Error("Missing OpenAI API key");
}

// Create the wallet
const wallet = await createRadiusWallet({
  rpcUrl,
  privateKey
});

// Get wallet address
const address = await wallet.getAddress();
console.log(`Wallet address: ${address}`);

// 2. Configure the tools for Vercel AI SDK
const tools = await getOnChainTools({
  wallet,
  plugins: [
    sendETH(), // Enable ETH transfers
  ]
});

// Log available tools
console.log(`Configured tools for Vercel AI SDK:`);
Object.entries(tools).forEach(([name, tool]) => {
  console.log(` - ${name}: ${tool.description}`);
});

// 3. Use the tools with Vercel AI SDK
const result = await generateText({
  model: openai("gpt-4o"),
  tools,
  maxSteps: 5, // Maximum number of tool invocations per request
  prompt: "What is my wallet address? Get the current balance of my wallet.",
  onStepFinish: (event) => {
    console.log("Step completed:", JSON.stringify(event));
  },
});

console.log("AI Response:", result.text);
```

If you want to include ERC20 token support, you would add:

```typescript
import { erc20, USDC } from "@radiustechsystems/ai-agent-plugin-erc20";

// Then in the plugins array:
const tools = await getOnChainTools({
  wallet,
  plugins: [
    sendETH(), 
    erc20({ tokens: [USDC] }) // Add ERC20 token support
  ]
});
```

## API Reference

### `getOnChainTools(options)`

Creates a tool collection compatible with Vercel AI SDK that provides access to configured Radius features.

**Parameters:**

- `options.wallet` (WalletClientBase): A Radius wallet instance
- `options.plugins` (Array): Array of plugin instances to enable

**Returns:**

- (Object): An object of Vercel AI SDK compatible tools that can be passed directly to the Vercel AI SDK's `generateText` function

**Default Tools:**

The `getOnChainTools` function automatically provides the following wallet-related tools:

- `get_address`: Get the address of the wallet
- `get_chain`: Get the chain of the wallet
- `get_balance`: Get the balance of an address
- `sign_message`: Sign a message with the wallet
- `simulate_transaction`: Simulate a transaction to check if it would succeed
- `resolve_address`: Resolve an ENS name to an address
- `get_transaction_status`: Check the status of a transaction

**Tool Structure:**

Each tool follows the Vercel AI SDK tool structure:

```typescript
{
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description: string; ... }>;
    required: string[];
  };
  execute: (params: any) => Promise<any>;
}
```

**Example:**

```typescript
const tools = await getOnChainTools({
  wallet,
  plugins: [
    sendETH(),
    erc20({ tokens: [USDC] })
  ]
});
```

## Integration Examples

For examples of how to integrate this adapter with the Vercel AI SDK, see:

- [Micropayments Example](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/examples/micropayments/vercel-ai) - More complex example with full micropayments functionality

## Troubleshooting

### Error: Missing OpenAI API Key

If you encounter an error about a missing API key:

1. Ensure you've set the `OPENAI_API_KEY` environment variable (or the appropriate key for your model provider)
2. For local development, create a `.env` file with your API key
3. For deployment, configure the environment variable in your hosting platform

### Error: Invalid Schema for Function

If you encounter schema validation errors with complex tools:

1. Start with simple tools like `get_address` and `get_balance` which have straightforward schemas
2. Some complex tool schemas (especially those with array parameters) may need additional validation
3. For complex parameters, consider creating a simplified version of the tool for use with the Vercel AI SDK
4. Update to the latest version of the adapter, as schema compatibility issues may be fixed

### Error: Tool Execution Failed

If a tool execution fails:

1. Check that the wallet has sufficient funds for the operation
2. Verify that the parameters match the expected format for the tool
3. Check your network connectivity to the RPC provider
4. Ensure your wallet private key has access to perform the requested operation

### Error: Invalid Vercel AI SDK Version

The Vercel AI SDK is actively developed and its API may change:

1. Check the version compatibility between the Vercel AI SDK and this adapter
2. Update to the latest version of both packages
3. Check the [Vercel AI SDK documentation](https://sdk.vercel.ai/docs) for any breaking changes

## Related Packages

- [@radiustechsystems/ai-agent-core](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/core): Core abstractions and base classes
- [@radiustechsystems/ai-agent-wallet](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/wallets): Wallet functionality
- [@radiustechsystems/ai-agent-plugin-erc20](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/plugins/erc20): ERC20 token operations
- [@radiustechsystems/ai-agent-plugin-contracts](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/plugins/contracts): Smart contract interactions

## Resources

- [Website](https://radiustech.xyz/)
- [Testnet Access](https://docs.radiustech.xyz/radius-testnet-access)
- [GitHub Issues](https://github.com/radiustechsystems/ai-agent-toolkit/issues)
- [Changelog](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CHANGELOG.md)

## Contributing

Please see the [Contributing Guide](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CONTRIBUTING.md) for detailed information about contributing to this toolkit.

## License

This project is licensed under the [MIT License](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/LICENSE).
