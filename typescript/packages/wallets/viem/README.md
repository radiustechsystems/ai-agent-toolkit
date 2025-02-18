# AI Agent Toolkit for Radius - Viem Wallet (TypeScript)

## Installation
```
npm install @radiustechsystems/ai-agent-wallet-viem
```

## Usage
```typescript
import { getOnChainTools } from "@radiustechsystems/ai-agent-adapter-vercel-ai"
import { createRadiusViemWallet } from "@radiustechsystems/ai-agent-wallet-viem"
import * as dotenv from "dotenv"


require("dotenv").config();

// Create a Radius Viem wallet using our helper
const wallet = createRadiusViemWallet({
  rpcUrl: process.env.RPC_PROVIDER_URL,
  privateKey: process.env.WALLET_PRIVATE_KEY
})

const tools = await getOnChainTools({
  wallet
})
```
