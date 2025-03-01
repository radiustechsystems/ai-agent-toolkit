# Radius AI Agent Crypto Plugin

This plugin provides AI agents with cryptographic utilities for working with the Radius blockchain. It leverages the Radius SDK for robust cryptographic operations.

## Features

- Generate Keccak-256 hashes
- Validate and format Ethereum addresses
- Format addresses with proper checksumming (EIP-55)
- Hash data with different encodings (UTF-8 or hex)

## Installation

```bash
npm install @radiustechsystems/ai-agent-plugin-crypto
# or
pnpm add @radiustechsystems/ai-agent-plugin-crypto
```

## Usage

```typescript
import { crypto } from "@radiustechsystems/ai-agent-plugin-crypto";
import { radiusWallet } from "@radiustechsystems/ai-agent-wallet";

// Create a wallet client
const wallet = radiusWallet({
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: process.env.RADIUS_RPC_URL,
});

// Add the crypto plugin to your agent
const tools = getTools({
  wallet,
  plugins: [
    crypto(),
  ],
});
```

## Tools

The crypto plugin provides the following tools:

- `validateAddress`: Validate if an address is properly formatted and return checksummed version
- `hashData`: Generate a Keccak-256 hash of input data with support for different encodings

Each tool leverages the underlying Radius SDK for robust and secure cryptographic operations.

## Implementation Notes

This plugin directly uses the Radius SDK's cryptographic capabilities:

- `AddressFromHex` for address validation and formatting
- `keccak256` from the SDK's crypto/utils for Keccak-256 hash calculation
- Standard Web APIs like TextEncoder for data encoding

## License

MIT
