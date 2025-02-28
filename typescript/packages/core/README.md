
# AI Agent Toolkit for Radius - Core (TypeScript)

## Installation

1. Install the core package

```bash
npm install @radiustechsystems/ai-agent-core
```

2. Install the wallet:

```bash
npm install @radiustechsystems/ai-agent-wallet-evm
```

3. Install the plugins for the protocols you need:

```bash
npm install @radiustechsystems/ai-agent-plugin-erc20
```

4. Install the adapter for the agent framework you want to use

```bash
npm install @radiustechsystems/ai-agent-adapter-vercel-ai
```

## Usage

1. Configure your wallet

```typescript
import { createRadiusWallet } from "@radiustechsystems/ai-agent-wallet-evm"

// Create a Radius wallet using our helper
const wallet = await createRadiusWallet({
  rpcUrl: process.env.RPC_PROVIDER_URL,
  privateKey: process.env.WALLET_PRIVATE_KEY
})
```

2. Configure your tools for the framework you want to use

```typescript
import { getOnChainTools } from "@radiustechsystems/ai-agent-adapter-vercel-ai"
import { sendETH } from "@radiustechsystems/ai-agent-wallet-evm"
import { erc20, USDC } from "@radiustechsystems/ai-agent-plugin-erc20"
import { uniswap } from "@radiustechsystems/ai-agent-plugin-uniswap"

const tools = await getOnChainTools({
  wallet,
  plugins: [
    sendETH(), // Enable ETH transfers
    erc20({ tokens: [USDC] }), // Enable ERC20 token operations
    uniswap({
      baseUrl: process.env.UNISWAP_BASE_URL as string,
      apiKey: process.env.UNISWAP_API_KEY as string,
    }) // Enable Uniswap trading
  ]
})
```

3. Plug into your agent framework

```typescript
const result = await generateText({
  model: openai("gpt-4o-mini") as LanguageModelV1,
  tools,
  maxSteps: 10, // Maximum number of tool invocations per request
  prompt,
  onStepFinish: (event) => {
    console.log(event.toolResults);
  },
})

console.log(result.text)
```
