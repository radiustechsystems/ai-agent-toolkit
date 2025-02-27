# AI Agent Toolkit for Radius - EVM Wallet (TypeScript)

## Installation

```bash
npm install @radiustechsystems/ai-agent-wallet-evm
```

## Usage

```typescript
import { getOnChainTools } from "@radiustechsystems/ai-agent-adapter-vercel-ai"
import { createWallet } from "@radiustechsystems/ai-agent-wallet-evm"
import * as dotenv from "dotenv"


require("dotenv").config();

// Create a Radius wallet using our helper
const wallet = createWallet({
  rpcUrl: process.env.RPC_PROVIDER_URL,
  privateKey: process.env.WALLET_PRIVATE_KEY
})

const tools = await getOnChainTools({
  wallet
})
```
