# Radius AI Agent Toolkit - ERC20 Plugin

This plugin enables AI agents to interact with ERC20 tokens on Radius, allowing them to check balances, transfer tokens, and manage token approvals.

This package is part of the [Radius AI Agent Toolkit](https://github.com/radiustechsystems/ai-agent-toolkit), which provides tools for integrating AI agents with the Radius platform.

## Installation

```bash
# Install this specific package
npm install @radiustechsystems/ai-agent-plugin-erc20

# Required peer dependencies
npm install @radiustechsystems/ai-agent-core
npm install @radiustechsystems/ai-agent-wallet
```

## Prerequisites

- Node.js >=20.12.2 <23
- Radius wallet setup with a funded account

## Usage

```typescript
import { erc20, USDC } from "@radiustechsystems/ai-agent-plugin-erc20";
import { createRadiusWallet } from "@radiustechsystems/ai-agent-wallet";
import { getOnChainTools } from "@radiustechsystems/ai-agent-adapter-vercel-ai";

// Create a Radius wallet
const wallet = await createRadiusWallet({
  rpcUrl: process.env.RPC_PROVIDER_URL,
  privateKey: process.env.WALLET_PRIVATE_KEY
});

// Initialize the ERC20 plugin with predefined tokens
const erc20Plugin = erc20({
  tokens: [USDC]
});

// Create AI agent tools with the ERC20 plugin
const tools = await getOnChainTools({
  wallet,
  plugins: [erc20Plugin]
});
```

## Adding Custom Tokens

You can add your own custom tokens by defining their details:

```typescript
import { erc20, USDC } from "@radiustechsystems/ai-agent-plugin-erc20";

// Create an ERC20 plugin with both predefined and custom tokens
const erc20Plugin = erc20({
  tokens: [
    USDC, // Predefined token
    {
      // Custom token definition
      decimals: 18,
      symbol: "RAD",
      name: "Radius Token",
      chains: {
        "1223953": { // Radius testnet chain ID
          contractAddress: "0xB73AAc53149af16DADA10D7cC99a9c4Cb722e21E"
        }
      }
    }
  ]
});
```

## API Reference

### `erc20(options)`

Creates a new ERC20 plugin instance.

**Parameters:**

- `options.tokens` (Token[]): Array of token definitions to enable

**Returns:**

- An ERC20Plugin instance that can be used with AI agent frameworks

### Predefined Tokens

The package includes these predefined tokens:

- `USDC`: USD Coin stablecoin
- `WETH`: Wrapped Ether

### Provided Tools

The ERC20 plugin provides the following AI agent tools:

#### `erc20_get_balance`

Gets the balance of a specific token for an address.

#### `erc20_transfer`

Transfers tokens from the wallet to another address.

#### `erc20_get_token_info_by_symbol`

Gets information about a token by its symbol.

#### `erc20_approve`

Approves a spender to use a specific amount of tokens.

#### `erc20_get_allowance`

Gets the current allowance for a spender.

#### `erc20_convert_to_base_unit`

Converts a human-readable token amount to its base unit (e.g., USDC to 6 decimal places).

#### `erc20_convert_from_base_unit`

Converts a base unit token amount to its human-readable form.

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
