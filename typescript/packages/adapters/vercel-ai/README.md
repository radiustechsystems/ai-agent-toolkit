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
- Vercel AI SDK installed in your project
- Radius wallet setup with a funded account

## Usage

```typescript
import { getOnChainTools } from "@radiustechsystems/ai-agent-adapter-vercel-ai";
import { createRadiusWallet, sendETH } from "@radiustechsystems/ai-agent-wallet";
import { erc20, USDC } from "@radiustechsystems/ai-agent-plugin-erc20";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

// 1. Create a Radius wallet
const wallet = await createRadiusWallet({
  rpcUrl: process.env.RPC_PROVIDER_URL,
  privateKey: process.env.WALLET_PRIVATE_KEY
});

// 2. Configure the tools for Vercel AI SDK
const tools = await getOnChainTools({
  wallet,
  plugins: [
    sendETH(), // Enable ETH transfers
    erc20({ tokens: [USDC] }) // Enable ERC20 token operations
  ]
});

// 3. Use the tools with Vercel AI SDK
const result = await generateText({
  model: openai("gpt-4o"),
  tools,
  maxSteps: 10, // Maximum number of tool invocations per request
  prompt: "Send 0.01 ETH to 0x1234...",
  onStepFinish: (event) => {
    console.log(event.toolResults);
  },
});

console.log(result.text);
```

## API Reference

### `getOnChainTools(options)`

Creates a tool collection compatible with Vercel AI SDK that provides access to configured Radius features.

**Parameters:**

- `options.wallet` (WalletClientBase): A Radius wallet instance
- `options.plugins` (Array): Array of plugin instances to enable

**Returns:**

- (Object): An object of Vercel AI SDK compatible tools that can be passed directly to the Vercel AI SDK's `generateText` function

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

For a complete example integrating this adapter with the Vercel AI SDK, see:

- [Micropayments Example](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/examples/micropayments/vercel-ai)

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
