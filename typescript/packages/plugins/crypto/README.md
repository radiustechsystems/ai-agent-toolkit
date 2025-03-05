# Radius AI Agent Toolkit - Crypto Plugin

This plugin provides AI agents with cryptographic utilities for working with Radius, including address validation and hash generation capabilities.

This package is part of the [Radius AI Agent Toolkit](https://github.com/radiustechsystems/ai-agent-toolkit), which provides tools for integrating AI agents with the Radius platform.

## Installation

```bash
# Install this specific package
npm install @radiustechsystems/ai-agent-plugin-crypto

# Required peer dependencies
npm install @radiustechsystems/ai-agent-core
npm install @radiustechsystems/ai-agent-wallet
npm install @radiustechsystems/sdk
```

## Prerequisites

- Node.js >=20.12.2 <23

## Usage

```typescript
import { crypto } from "@radiustechsystems/ai-agent-plugin-crypto";
import { createRadiusWallet } from "@radiustechsystems/ai-agent-wallet";
import { getOnChainTools } from "@radiustechsystems/ai-agent-adapter-vercel-ai";

// Create a Radius wallet
const wallet = await createRadiusWallet({
  rpcUrl: process.env.RPC_PROVIDER_URL,
  privateKey: process.env.WALLET_PRIVATE_KEY
});

// Initialize the Crypto plugin
const cryptoPlugin = crypto();

// Create AI agent tools with the Crypto plugin
const tools = await getOnChainTools({
  wallet,
  plugins: [cryptoPlugin]
});
```

## Example: Using Crypto Tools

```typescript
// Example of using the crypto plugin through an AI agent
const result = await generateText({
  model: openai("gpt-4o"),
  tools,
  maxSteps: 10,
  prompt: `Validate if 0x1234abcd... is a valid Ethereum address and generate a Keccak-256 hash of the text "Hello Radius"`,
});

// The AI will use the crypto_validate_address and crypto_hash_data tools
```

## API Reference

### `crypto()`

Creates a new Crypto plugin instance.

**Returns:**

- A CryptoPlugin instance that can be used with AI agent frameworks

### Provided Tools

The Crypto plugin provides the following AI agent tools:

#### `crypto_validate_address`

Validates if an address is properly formatted and checksummed for Radius.

**Parameters:**

- `address` (string): The address to validate

**Returns:**

- Object containing:
  - `isValid` (boolean): Whether the address is valid
  - `address` (string): The checksummed address (EIP-55 compliant)
  - `bytes` (array): The address as a byte array

#### `crypto_hash_data`

Generates a Keccak-256 hash of input data with support for different encodings.

**Parameters:**

- `data` (string): The data to hash
- `encoding` (string, optional): The encoding to use ("utf8" or "hex", defaults to "utf8")

**Returns:**

- Object containing:
  - `hash` (string): The resulting Keccak-256 hash
  - `bytes` (array): The hash as a byte array

## Integration Examples

For a complete example integrating this plugin with AI frameworks, see:

- [Micropayments Example](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/examples/micropayments/vercel-ai)

## Related Packages

- [@radiustechsystems/ai-agent-core](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/core): Core abstractions and base classes
- [@radiustechsystems/ai-agent-wallet](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/wallets): Wallet functionality
- [@radiustechsystems/ai-agent-plugin-contracts](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/plugins/contracts): Smart contract interactions

## Resources

- [Website](https://radiustech.xyz/)
- [Testnet Access](https://docs.radiustech.xyz/radius-testnet-access)
- [GitHub Issues](https://github.com/radiustechsystems/ai-agent-toolkit/issues)
- [Changelog](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CHANGELOG.md)

## Contributing

Please see the [Contributing Guide](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CONTRIBUTING.md) for detailed information about contributing to this toolkit.

## License

This project is licensed under the [MIT License](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/LICENSE).
