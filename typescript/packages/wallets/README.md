# Radius AI Agent Toolkit - Radius Wallet (TypeScript)

The Radius Wallet package provides a simple, unified interface for interacting with the Radius blockchain from AI agents. Built directly on the Radius SDK, it offers high performance, streamlined wallet operations, and tool-based interactions that integrate seamlessly with AI agent frameworks.

## Installation

```bash
npm install @radiustechsystems/ai-agent-wallet
```

## Key Features

- **SDK-Native Integration**: Built directly on the Radius SDK for optimal performance
- **Unified Wallet Interface**: Simple API that handles both standard and batch transactions
- **Tool-Based Architecture**: Integrates with AI agent frameworks using a tool-based approach
- **Type-Safe**: Comprehensive TypeScript definitions for a robust development experience

## Basic Usage

```typescript
import { createRadiusWallet } from "@radiustechsystems/ai-agent-wallet";
import { getOnChainTools } from "@radiustechsystems/ai-agent-adapter-vercel-ai";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  // Create a Radius wallet using the unified wallet creation function
  const wallet = await createRadiusWallet({
    rpcUrl: process.env.RPC_PROVIDER_URL,
    privateKey: process.env.WALLET_PRIVATE_KEY
  });

  // Get AI agent tools that use this wallet
  const tools = await getOnChainTools({
    wallet
  });

  // Now use these tools with your AI agent framework of choice
  // ...
}

main().catch(console.error);
```

## Advanced Usage

### Enabling Batch Transactions

For use cases that require sending multiple transactions, you can enable batch transaction support:

```typescript
// Create a wallet with batch transaction capabilities
const wallet = await createRadiusWallet(
  {
    rpcUrl: process.env.RPC_PROVIDER_URL,
    privateKey: process.env.WALLET_PRIVATE_KEY
  },
  true  // Enable batch transactions
);

// Send a batch of transactions
const result = await wallet.sendBatchOfTransactions([
  { to: "0x123...", value: parseEther("0.1") },
  { to: "0x456...", value: parseEther("0.2") }
]);
```

### Logging Operations

For debugging or monitoring, you can provide a custom logger:

```typescript
const wallet = await createRadiusWallet(
  {
    rpcUrl: process.env.RPC_PROVIDER_URL,
    privateKey: process.env.WALLET_PRIVATE_KEY
  },
  false,  // Batch transactions disabled
  (message, data) => {
    console.log(`[Radius Wallet] ${message}`, data);
  }
);
```

## Architecture

This package follows a clean, modular architecture:

- **Core Wallet Client**: A unified implementation built on the Radius SDK that handles both standard and batch transactions
- **Tools Interface**: Implements the AI Agent Toolkit's tools interface for seamless integration
- **Radius Blockchain**: Optimized specifically for the Radius blockchain and its features

## Working with Smart Contracts

```typescript
// Example of interacting with a smart contract
const result = await wallet.read({
  address: "0xContractAddress",
  functionName: "balanceOf",
  args: ["0xUserAddress"],
  abi: [...] // Contract ABI
});

// Example of executing a contract method
const tx = await wallet.sendTransaction({
  to: "0xContractAddress",
  functionName: "transfer",
  args: ["0xRecipient", parseEther("1.0")],
  abi: [...] // Contract ABI
});
```

## Utility Functions

The package includes helpful utilities for working with token amounts:

```typescript
import { parseEther, formatUnits, parseUnits } from "@radiustechsystems/ai-agent-wallet";

// Convert ETH to wei
const weiAmount = parseEther("1.5");  // 1.5 ETH in wei

// Format from wei to ETH
const ethAmount = formatUnits(weiAmount, 18);  // "1.5"

// Parse any token amount with custom decimals
const tokenAmount = parseUnits("10.5", 6);  // 10.5 tokens with 6 decimals
```

## Limitations

- This package is optimized specifically for the Radius network
- EIP-712 signing has been implemented with preliminary support

## Contributing

We welcome contributions to the Radius AI Agent Toolkit! Please see:

- [General Contributing Guide](CONTRIBUTING.md) - Repository-wide guidelines and principles
- [TypeScript Contributing Guide](typescript/CONTRIBUTING.md) - TypeScript-specific guidelines

## Support

- [Website](https://radiustech.xyz/)
- [Documentation](https://docs.radiustech.xyz/)
- [GitHub Issues](https://github.com/radiustechsystems/ai-agent-toolkit/issues)

## License

This toolkit is released under the [MIT License](LICENSE).
