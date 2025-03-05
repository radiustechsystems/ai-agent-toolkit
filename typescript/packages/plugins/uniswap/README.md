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

#### `uniswap_get_quote`

Gets a quote for swapping tokens.

#### `uniswap_swap`

Executes a token swap on Uniswap.

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
