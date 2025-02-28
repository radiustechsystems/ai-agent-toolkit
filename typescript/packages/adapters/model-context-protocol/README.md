# AI Agent Toolkit for Radius - Model Context Protocol (Claude) Adapter (TypeScript)

## Installation

```bash
npm install @radiustechsystems/ai-agent-adapter-model-context-protocol
```

## Usage

Check out the [example](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/typescript/examples/model-context-protocol) for a full MCP server example.

```ts
import { getOnChainTools } from "@radiustechsystems/ai-agent-adapter-model-context-protocol"
import { createRadiusWallet, sendETH } from "@radiustechsystems/ai-agent-wallet-evm"
import { erc20, USDC } from "@radiustechsystems/ai-agent-plugin-erc20"

// Create a Radius wallet using our helper
const wallet = await createRadiusWallet({
  rpcUrl: process.env.RPC_PROVIDER_URL,
  privateKey: process.env.WALLET_PRIVATE_KEY
})

const { listOfTools, toolHandler } = await getOnChainTools({
  wallet,
  plugins: [sendETH(), erc20({ tokens: [USDC] })]
})
```
