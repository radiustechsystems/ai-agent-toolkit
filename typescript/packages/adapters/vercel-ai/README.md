# AI Agent Toolkit for Radius - Vercel AI Adapter (TypeScript)

This adapter provides integration between the Radius AI Agent Toolkit and the Vercel AI SDK, allowing you to easily add Radius capabilities to AI agents built with Vercel AI.

## Installation

```bash
npm install @radiustechsystems/ai-agent-adapter-vercel-ai
```

## Prerequisites

- Radius wallet setup with a funded account
- Vercel AI SDK installed in your project
- Node.js >= 20.12.2 < 23

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
  model: openai("gpt-4o-mini"),
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

- `options` - Configuration object with:

  - `wallet` - A Radius wallet instance
  - `plugins` - Array of plugin instances to enable
  - `config` (optional) - Additional configuration options

**Returns:**

- An array of Vercel AI SDK compatible tools

## Examples

See the [micropayments example](../../../examples/micropayments/vercel-ai) for a complete implementation.
