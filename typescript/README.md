# AI Agent Toolkit for Radius (TypeScript)

TypeScript implementation of the AI Agent Toolkit for Radius integration.

## Installation

```bash
npm install @radiustechsystems/ai-agent-toolkit
```

## Getting Started

This guide will help you set up and run the AI Agent Toolkit project.

## Prerequisites

- Node.js >=20.12.2 <23
- pnpm >=9 (specifically tested with 9.14.2)
- Git

## Step-by-Step Setup

### 1. Clone the Repository
```bash
git clone git@github.com:radiustechsystems/ai-agent-toolkit.git
cd ai-agent-toolkit/typescript
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Build the Packages
```bash
pnpm build
```

### 4. Configure Environment Variables
```bash
cd examples/vercel-ai/viem
cp .env.template .env
```

Open `.env` and set the following variables:

- OPENAI_API_KEY=your_openai_api_key_here
- WALLET_PRIVATE_KEY=your_wallet_private_key_here
- RPC_PROVIDER_URL=your_rpc_provider_url_here

Note:
- Get an OpenAI API key from: https://platform.openai.com/api-keys
- The wallet private key should be from an EVM-compatible wallet
- RPC provider URL from Radius testnet: https://testnet.tryradi.us/dashboard/rpc-endpoints

### 5. Run the Example
```bash
# First install ts-node if you don't have it globally
npm install -g ts-node

# Run the example
npx ts-node index.ts
```

## Troubleshooting

If you encounter any issues:

### Clean and Rebuild
```bash
pnpm clean:dist
pnpm clean:node_modules
pnpm install
pnpm build
```

### Verify Versions

#### Verify your Node.js version:
```bash
node --version  # Should be >=20.12.2 <23
```

#### Verify your pnpm version:
```bash
pnpm --version  # Should be >=9
```

## Additional Notes

- The project uses a monorepo structure managed by Turborepo
- All packages are built using tsup
- The example uses Vercel AI SDK with OpenAI integration
- Make sure all environment variables are properly set before running the example
