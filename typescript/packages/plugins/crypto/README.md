# Radius AI Agent Crypto Plugin

This plugin provides AI agents with cryptographic utilities for working with the Radius blockchain.

## Features

- Generate Keccak-256 hashes
- Verify message signatures
- Recover addresses from signatures
- Validate address formats
- Format addresses (checksum or lowercase)
- Hash messages according to EIP-191 standard

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

- `generate_hash`: Generate a Keccak-256 hash of input data
- `verify_signature`: Verify that a signature was created by a specific address
- `recover_address`: Recover the address that created a signature
- `validate_address`: Validate if an address is properly formatted
- `format_address`: Format an address in either checksum or lowercase format
- `hash_message`: Hash a message according to EIP-191 standard for signing

## License

MIT