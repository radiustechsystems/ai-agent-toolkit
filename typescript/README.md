# Radius TypeScript AI Agent Toolkit

A TypeScript implementation for integrating [Radius](https://radiustech.xyz/) capabilities into AI agent workflows, providing a simple and type-safe way to incorporate Radius functionality into AI agents.

## Features

- Seamless integration with Radius
- Support for major AI agent frameworks:
  - Vercel AI SDK
- Wallet management and transaction capabilities
- Clean, idiomatic TypeScript implementation
- Type-safe contract interactions
- EVM compatibility

## Requirements

- Node.js >= 20.12.2 < 23
- pnpm >= 9

## Installation

### Option 1: Complete Toolkit (Recommended)

Install the complete toolkit package which automatically installs all adapters and plugins as dependencies:

```bash
pnpm add @radiustechsystems/ai-agent-toolkit
```

Or using npm:

```bash
npm install @radiustechsystems/ai-agent-toolkit
```

This single command will install all packages in the toolkit, making them available for import.

### Option 2: Individual Packages

If you prefer to install only the specific components you need:

```bash
# Core packages (required)
pnpm add @radiustechsystems/ai-agent-core @radiustechsystems/ai-agent-wallet

# Adapters (pick one based on your AI framework)
pnpm add @radiustechsystems/ai-agent-adapter-vercel-ai
# OR
pnpm add @radiustechsystems/ai-agent-adapter-langchain
# OR
pnpm add @radiustechsystems/ai-agent-adapter-model-context-protocol

# Plugins (install the ones you need)
pnpm add @radiustechsystems/ai-agent-plugin-contracts
pnpm add @radiustechsystems/ai-agent-plugin-erc20
pnpm add @radiustechsystems/ai-agent-plugin-uniswap
# etc.
```

## Usage

### Using the Complete Toolkit

When using the complete toolkit package, you can import everything from a single entry point:

```typescript
// Import everything from the umbrella package
import { 
  // Core types and interfaces
  PluginBase, ToolBase,
  
  // Wallet functionality
  createRadiusWallet, sendETH,
  
  // Adapter for Vercel AI
  getOnChainTools,
  
  // Plugins
  erc20, USDC, uniswap
} from "@radiustechsystems/ai-agent-toolkit";

// Create a wallet
const wallet = await createRadiusWallet({
  rpcUrl: process.env.RPC_PROVIDER_URL,
  privateKey: process.env.WALLET_PRIVATE_KEY
});

// Configure tools for Vercel AI
const tools = await getOnChainTools({
  wallet,
  plugins: [
    sendETH(),
    erc20({ tokens: [USDC] }),
    uniswap({
      baseUrl: process.env.UNISWAP_BASE_URL,
      apiKey: process.env.UNISWAP_API_KEY,
    })
  ]
});

// Use with your AI framework
const result = await generateText({
  model: openai("gpt-4o"),
  tools,
  maxSteps: 10,
  prompt: "Transfer 0.01 ETH to 0x1234...",
});
```

### Using Individual Packages

When installing individual packages, import directly from each package:

```typescript
// Import from individual packages
import { PluginBase, ToolBase } from "@radiustechsystems/ai-agent-core";
import { createRadiusWallet, sendETH } from "@radiustechsystems/ai-agent-wallet";
import { getOnChainTools } from "@radiustechsystems/ai-agent-adapter-vercel-ai";
import { erc20, USDC } from "@radiustechsystems/ai-agent-plugin-erc20";
import { uniswap } from "@radiustechsystems/ai-agent-plugin-uniswap";

// The rest of the code is the same
```

### Examples

Here's a guide to spinning up an example that demonstrates multi-agent micropayments on Radius using the Vercel AI SDK:

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

### 4. Navigate to the Vercel AI SDK Example

```bash
cd examples/micropayments/vercel-ai
```

### 5. Configure Environment Variables

Copy the `.env.example` file and populate it with your values:

```bash
cp .env.example .env.local
```

```bash
# AI API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key_here  # Required for Claude AI models

# Radius Configuration
NEXT_PUBLIC_RPC_PROVIDER_URL=your_radius_rpc_url_here  # Radius RPC URL
WALLET_PRIVATE_KEY=your_service_wallet_private_key_here        # Private key for service wallet that sends base payments (must be funded)

# Agent Wallet Addresses (for RECEIVING payments)
NEXT_PUBLIC_CREATOR_ADDRESS=0x1234...          # Default creator address shown in UI form (can be overridden by user)
CREATOR_AGENT_ADDRESS=0x1234...                # Address for the Creator agent (receives 40% of payment)
EDITOR_AGENT_ADDRESS=0x2345...                 # Address for the Editor agent (receives 15% of payment)
FACT_CHECKER_AGENT_ADDRESS=0x3456...           # Address for the Fact-Checker agent (receives 10% of payment)
RESEARCHER_AGENT_ADDRESS=0x4567...             # Address for the Researcher agent (receives 15% of payment)
REVIEWER_AGENT_ADDRESS=0x5678...               # Address for the Reviewer agent (receives 10% of payment)
TRANSLATOR_AGENT_ADDRESS=0x6789...             # Address for the Translator agent (receives 10% of payment)

# Agent Wallet Private Keys (for SENDING agent-to-agent payments)
# IMPORTANT: Each agent that can pay others needs its own private key
CREATOR_AGENT_PRIVATE_KEY=your_creator_private_key_here        # Creator agent wallet private key (for paying researcher/editor)
EDITOR_AGENT_PRIVATE_KEY=your_editor_private_key_here          # Editor agent wallet private key (for paying reviewer)
FACT_CHECKER_AGENT_PRIVATE_KEY=your_fact_checker_private_key_here  # Fact-checker agent wallet private key
RESEARCHER_AGENT_PRIVATE_KEY=your_researcher_private_key_here  # Researcher agent wallet private key
REVIEWER_AGENT_PRIVATE_KEY=your_reviewer_private_key_here      # Reviewer agent wallet private key
TRANSLATOR_AGENT_PRIVATE_KEY=your_translator_private_key_here  # Translator agent wallet private key
```

### 6. Run the example

```bash
# Run the example
pnpm dev
```

## Troubleshooting

If you encounter issues during setup or execution:

### Verify Versions

Ensure your environment meets the requirements:

```bash
node --version  # Should be >=20.12.2 <23
pnpm --version  # Should be >=9
```

## Resources

- [Website](https://radiustech.xyz/)
- [Testnet Access](https://docs.radiustech.xyz/radius-testnet-access)
- [GitHub Issues](https://github.com/radiustechsystems/ai-agent-toolkit/issues)
- [Changelog](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CHANGELOG.md)

## Contributing

Please see the [TypeScript Contributing Guide](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/typescript/CONTRIBUTING.md) for detailed information about contributing to this toolkit. For repository-wide guidelines and principles, see the [General Contributing Guide](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CONTRIBUTING.md).

## License

This project is licensed under the [MIT License](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/LICENSE).
