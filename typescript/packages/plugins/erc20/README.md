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
- `RAD`: Radius Token

### Provided Tools

The ERC20 plugin provides the following AI agent tools:

#### `get_token_info_by_symbol`

Gets information about a token by its symbol.

**Parameters:**

- `symbol` (string): The token symbol to lookup

**Example:**

```typescript
try {
  const tokenInfo = await getTokenInfoBySymbolTool.execute({ 
    symbol: "USDC" 
  });
  console.log("Token info:", tokenInfo);
  // { symbol: "USDC", name: "USD Coin", decimals: 6, address: "0x..." }
} catch (error) {
  console.error(`Token info lookup failed: ${error.message}`);
}
```

#### `get_token_balance`

Gets the balance of a specific token for an address.

**Parameters:**

- `tokenAddress` (string): The token contract address
- `wallet` (string, optional): The wallet address to check (defaults to connected wallet)

**Example:**

```typescript
try {
  const balance = await getTokenBalanceTool.execute({
    tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    wallet: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
  });
  console.log(`Balance: ${balance.formatted} ${balance.symbol}`);
} catch (error) {
  console.error(`Balance check failed: ${error.message}`);
}
```

#### `transfer`

Transfers tokens from the wallet to another address.

**Parameters:**

- `tokenAddress` (string): The token contract address
- `to` (string): The recipient address
- `amount` (string): The amount to transfer
- `formatAmount` (boolean, optional): Whether the amount is in decimal format (default: false)

#### `get_token_allowance`

Gets the current allowance for a spender.

**Parameters:**

- `tokenAddress` (string): The token contract address
- `spender` (string): The spender address
- `owner` (string, optional): The token owner (defaults to connected wallet)

#### `approve`

Approves a spender to use a specific amount of tokens.

**Parameters:**

- `tokenAddress` (string): The token contract address
- `spender` (string): The spender address
- `amount` (string): The amount to approve
- `formatAmount` (boolean, optional): Whether the amount is in decimal format (default: false)

#### `convert_to_base_unit`

Converts a human-readable token amount to its base unit.

**Parameters:**

- `amount` (string): The decimal amount (e.g., "10.5")
- `decimals` (number): The token decimals (e.g., 6 for USDC, 18 for most tokens)

**Example:**

```typescript
try {
  const baseUnitResult = await convertToBaseUnitTool.execute({
    amount: "100",
    decimals: 6 // USDC has 6 decimals
  });
  console.log(`100 USDC in base units: ${baseUnitResult}`); // 100000000
} catch (error) {
  console.error(`Conversion failed: ${error.message}`);
}
```

#### `convert_from_base_unit`

Converts a base unit token amount to its human-readable form.

**Parameters:**

- `amount` (string): The amount in base units
- `decimals` (number): The token decimals

**Example:**

```typescript
try {
  const decimalResult = await convertFromBaseUnitTool.execute({
    amount: "100000000", // 100 USDC in base units
    decimals: 6 // USDC has 6 decimals
  });
  console.log(`100000000 base units in USDC: ${decimalResult}`); // "100"
} catch (error) {
  console.error(`Conversion failed: ${error.message}`);
}
```

> **Note on Tool Naming**: The tool names in this documentation match the actual names used at runtime. The @Tool decorator in the implementation automatically converts camelCase method names to snake_case for the final tool names.

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
