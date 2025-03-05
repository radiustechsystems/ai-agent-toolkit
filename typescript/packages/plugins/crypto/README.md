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

// The AI will use the validate_address and hash_data tools
```

## API Reference

### `crypto()`

Creates a new Crypto plugin instance.

**Returns:**

- A CryptoPlugin instance that can be used with AI agent frameworks

### Provided Tools

The Crypto plugin provides the following AI agent tools:

#### `validate_address`

Validates if an address is properly formatted and checksummed for Radius.

**Parameters:**

- `address` (string): The address to validate

**Example:**

```typescript
try {
  const validationResult = await validateAddressTool.execute({
    address: "0xefbf7a6fa61a1602eb7630c92e79e5b6e63909e1"
  });
  console.log(`Is valid address: ${validationResult.isValid}`);
  console.log(`Checksummed address: ${validationResult.address}`);
} catch (error) {
  console.error(`Validation failed: ${error.message}`);
}
```

#### `hash_data`

Generates a Keccak-256 hash of input data with support for different encodings.

**Parameters:**

- `data` (string): The data to hash
- `encoding` (string, optional): The encoding to use ("utf8" or "hex", defaults to "utf8")

**Example:**

```typescript
try {
  // Hash UTF-8 string
  const hashResult = await hashDataTool.execute({
    data: "Hello, Radius!",
    encoding: "utf8"
  });
  console.log(`Hash: ${hashResult.hash}`);
  
  // Hash hex data
  const hexHashResult = await hashDataTool.execute({
    data: "0x1234567890abcdef",
    encoding: "hex"
  });
  console.log(`Hash of hex: ${hexHashResult.hash}`);
} catch (error) {
  console.error(`Hashing failed: ${error.message}`);
}
```

> **Note on Tool Naming**: The tool names in this documentation (`validate_address`, `hash_data`) match the actual names used at runtime. The @Tool decorator in the implementation automatically converts camelCase method names to snake_case for the final tool names.

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
