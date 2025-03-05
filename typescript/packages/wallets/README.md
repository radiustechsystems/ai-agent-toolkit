# Radius AI Agent Toolkit - Wallet

The Radius Wallet package provides a simple, unified interface for interacting with Radius from AI agents. It offers high-performance wallet operations and tool-based interactions that integrate seamlessly with AI agent frameworks.

This package is part of the [Radius AI Agent Toolkit](https://github.com/radiustechsystems/ai-agent-toolkit), which provides tools for integrating AI agents with the Radius platform.

## Installation

```bash
# Install this specific package
npm install @radiustechsystems/ai-agent-wallet

# Required peer dependencies
npm install @radiustechsystems/ai-agent-core
```

## Prerequisites

- Node.js >=20.12.2 <23
- Access to a Radius RPC endpoint
- A funded private key for the Radius network

## Usage

```typescript
import { createRadiusWallet, sendETH } from "@radiustechsystems/ai-agent-wallet";
import { getOnChainTools } from "@radiustechsystems/ai-agent-adapter-vercel-ai";

// Create a Radius wallet
const wallet = await createRadiusWallet({
  rpcUrl: process.env.RPC_PROVIDER_URL,
  privateKey: process.env.WALLET_PRIVATE_KEY
});

// Get wallet address
const address = await wallet.getAddress();
console.log(`Wallet address: ${address}`);

// Check wallet balance using balanceOf method
const balance = await wallet.balanceOf(address);
console.log(`Balance: ${balance.value} ${balance.symbol}`);

// Create sendETH plugin
const sendEthPlugin = sendETH();

// Get the tools provided by the plugin
const tools = sendEthPlugin.getTools(wallet);

// Or create tools for AI agents with the adapter
const aiTools = await getOnChainTools({
  wallet,
  plugins: [sendETH()] // Enable ETH transfers
});
```

## API Reference

### `createRadiusWallet(options, enableBatch?, logger?)`

Creates a new Radius wallet instance.

**Parameters:**

- `options.rpcUrl` (string): URL of the Radius RPC endpoint
- `options.privateKey` (string): Private key for the wallet
- `enableBatch` (boolean, optional): Whether to enable batch transactions
- `logger` (function, optional): Custom logger function

**Returns:**

- A RadiusWalletInterface instance that can be used with AI agent tools

### `sendETH()`

Creates a plugin that enables ETH transfer functionality for AI agents.

**Returns:**

- A plugin that can be used with the `getOnChainTools` function

### Wallet Methods

#### `wallet.getAddress()`

Returns the wallet's address.

#### `wallet.balanceOf(address)`

Returns the balance info for the specified address, including value, symbol, and other details.

#### `wallet.sendTransaction(tx)`

Sends a transaction to the network.

#### `wallet.sendBatchOfTransactions(txs)`

Sends multiple transactions as a batch (if batch mode is enabled).

## Advanced Usage

### Batch Transactions

```typescript
// Create a wallet with batch transaction support
const wallet = await createRadiusWallet(
  {
    rpcUrl: process.env.RPC_PROVIDER_URL,
    privateKey: process.env.WALLET_PRIVATE_KEY
  },
  true // Enable batch transactions
);

// Send a batch of transactions
const result = await wallet.sendBatchOfTransactions([
  { to: "0x123...", value: parseEther("0.1") },
  { to: "0x456...", value: parseEther("0.2") }
]);
```

### Smart Contract Interactions

```typescript
// Read from a contract
const result = await wallet.read({
  address: "0xContractAddress",
  functionName: "balanceOf",
  args: ["0xUserAddress"],
  abi: [...] // Contract ABI
});

// Write to a contract
const tx = await wallet.sendTransaction({
  to: "0xContractAddress",
  functionName: "transfer",
  args: ["0xRecipient", parseEther("1.0")],
  abi: [...] // Contract ABI
});
```

## Integration Examples

For a complete example integrating this package with AI frameworks, see:

- [Micropayments Example](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/examples/micropayments/vercel-ai)

## Related Packages

- [@radiustechsystems/ai-agent-core](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/core): Core abstractions and base classes
- [@radiustechsystems/ai-agent-plugin-erc20](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/plugins/erc20): ERC20 token operations
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
