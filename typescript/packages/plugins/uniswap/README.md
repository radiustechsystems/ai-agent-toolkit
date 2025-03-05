# Radius AI Agent Toolkit - Uniswap Plugin

This plugin enables AI agents to interact with the Uniswap protocol on Radius, allowing them to get token quotes and perform token swaps.

This package is part of the [Radius AI Agent Toolkit](https://github.com/radiustechsystems/ai-agent-toolkit), which provides tools for integrating AI agents with the Radius platform.

## Installation

```bash
# Install this specific package
npm install @radiustechsystems/ai-agent-plugin-uniswap

# Required peer dependencies
npm install @radiustechsystems/ai-agent-core
npm install @radiustechsystems/ai-agent-wallet
```

## Prerequisites

- Node.js >=20.12.2 <23
- Uniswap API key - Get it from: [Uniswap Hub](https://hub.uniswap.org/)
- Radius wallet setup with a funded account

## Configuration

Required environment variables:

- `UNISWAP_API_KEY`: Your Uniswap API key
  - Format: 32-character string
  - Required for: Accessing Uniswap's API for quotes and swaps
- `UNISWAP_BASE_URL`: Uniswap API base URL
  - Format: Full URL with protocol and version
  - Default: `https://api.uniswap.org/v1`

## Usage

```typescript
import { uniswap } from "@radiustechsystems/ai-agent-plugin-uniswap";
import { createRadiusWallet } from "@radiustechsystems/ai-agent-wallet";
import { getOnChainTools } from "@radiustechsystems/ai-agent-adapter-vercel-ai";

// Create a Radius wallet
const wallet = await createRadiusWallet({
  rpcUrl: process.env.RPC_PROVIDER_URL,
  privateKey: process.env.WALLET_PRIVATE_KEY
});

// Initialize the Uniswap plugin
const uniswapPlugin = uniswap({
  baseUrl: process.env.UNISWAP_BASE_URL,
  apiKey: process.env.UNISWAP_API_KEY
});

// Create AI agent tools with the Uniswap plugin
const tools = await getOnChainTools({
  wallet,
  plugins: [uniswapPlugin]
});
```

## API Reference

### `uniswap(config)`

Creates a new Uniswap plugin instance.

**Parameters:**

- `config.baseUrl` (string): Uniswap API base URL
- `config.apiKey` (string): Your Uniswap API key

**Returns:**

- A UniswapPlugin instance that can be used with AI agent frameworks

### Provided Tools

The Uniswap plugin provides the following AI agent tools:

#### `uniswap_check_approval`

Checks if a wallet has enough token approval for a swap.

**Parameters:**

- `token` (string): The token address to check approval for
- `amount` (string): The amount to approve
- `walletAddress` (string, optional): The wallet address to check (defaults to connected wallet)

**Example:**

```typescript
try {
  const approvalStatus = await checkApprovalTool.execute({
    token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    amount: "1000000", // 1 USDC (6 decimals)
    walletAddress: "0xefbf7a6fa61a1602eb7630c92e79e5b6e63909e1"
  });
  
  console.log("Approval status:", approvalStatus);
  // { needsApproval: true, currentAllowance: "0", requiredApproval: "1000000" }
} catch (error) {
  console.error(`Approval check failed: ${error.message}`);
}
```

#### `uniswap_get_quote`

Gets a quote for swapping tokens.

**Parameters:**

- `tokenIn` (string): The address of the input token
- `tokenOut` (string): The address of the output token
- `amount` (string): The amount of tokenIn to swap
- `type` (string): The type of swap ("EXACT_INPUT" or "EXACT_OUTPUT")
- `protocols` (string[]): The protocols to use for the swap (e.g., ["V3"])

**Example:**

```typescript
try {
  const quoteParams = {
    tokenIn: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    tokenOut: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    amount: "1000000000000000000", // 1 WETH (18 decimals)
    type: "EXACT_INPUT",
    protocols: ["V3"]
  };
  
  const quote = await getQuoteTool.execute(quoteParams);
  console.log("Swap quote result:", quote);
  // { amountOut: "1800.25", estimatedGas: "150000", ... }
} catch (error) {
  console.error(`Getting quote failed: ${error.message}`);
}
```

#### `uniswap_swap_tokens`

Executes a token swap on Uniswap.

**Parameters:**

- `tokenIn` (string): The address of the input token
- `tokenOut` (string): The address of the output token
- `amount` (string): The amount of tokenIn to swap
- `type` (string): The type of swap ("EXACT_INPUT" or "EXACT_OUTPUT")
- `protocols` (string[]): The protocols to use for the swap (e.g., ["V3"])
- `slippageTolerance` (number, optional): The maximum slippage allowed (default: 0.5)

**Example:**

```typescript
try {
  const swapParams = {
    tokenIn: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    tokenOut: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    amount: "1000000000000000000", // 1 WETH (18 decimals)
    type: "EXACT_INPUT",
    protocols: ["V3"],
    slippageTolerance: 0.5
  };
  
  const swapResult = await swapTokensTool.execute(swapParams);
  console.log("Swap transaction:", swapResult);
  // { hash: "0x...", confirmations: 1, ... }
} catch (error) {
  console.error(`Swap failed: ${error.message}`);
}
```

> **Note on Tool Naming**: The Uniswap plugin explicitly prefixes its tool names with `uniswap_` in the implementation, which is consistent with the final available tool names.

## Integration Examples

For a complete example integrating this plugin with the Vercel AI SDK, see:

- [Micropayments Example](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/examples/micropayments/vercel-ai)

## Related Packages

- [@radiustechsystems/ai-agent-core](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/core): Core abstractions and base classes
- [@radiustechsystems/ai-agent-wallet](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/wallets): Wallet functionality
- [@radiustechsystems/ai-agent-adapter-vercel-ai](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/adapters/vercel-ai): Vercel AI adapter

## Resources

- [Website](https://radiustech.xyz/)
- [Testnet Access](https://docs.radiustech.xyz/radius-testnet-access)
- [GitHub Issues](https://github.com/radiustechsystems/ai-agent-toolkit/issues)
- [Changelog](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CHANGELOG.md)

## Contributing

Please see the [Contributing Guide](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CONTRIBUTING.md) for detailed information about contributing to this toolkit.

## License

This project is licensed under the [MIT License](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/LICENSE).
