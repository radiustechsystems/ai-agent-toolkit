# Radius AI Agent Toolkit - Contracts Plugin

This plugin enables AI agents to interact with any smart contract on Radius through a standardized interface, allowing them to call read-only methods and execute state-changing contract functions.

This package is part of the [Radius AI Agent Toolkit](https://github.com/radiustechsystems/ai-agent-toolkit), which provides tools for integrating AI agents with the Radius platform.

## Installation

```bash
# Install this specific package
npm install @radiustechsystems/ai-agent-plugin-contracts

# Required peer dependencies
npm install @radiustechsystems/ai-agent-core
npm install @radiustechsystems/ai-agent-wallet
npm install viem
```

## Prerequisites

- Node.js >=20.12.2 <23
- Radius wallet setup with a funded account
- Smart contract ABI definitions for contracts you wish to interact with

## Usage

```typescript
import { contracts } from "@radiustechsystems/ai-agent-plugin-contracts";
import { createRadiusWallet } from "@radiustechsystems/ai-agent-wallet";
import { getOnChainTools } from "@radiustechsystems/ai-agent-adapter-vercel-ai";

// Create a Radius wallet
const wallet = await createRadiusWallet({
  rpcUrl: process.env.RPC_PROVIDER_URL,
  privateKey: process.env.WALLET_PRIVATE_KEY
});

// Initialize the Contracts plugin
const contractsPlugin = contracts();

// Create AI agent tools with the Contracts plugin
const tools = await getOnChainTools({
  wallet,
  plugins: [contractsPlugin]
});
```

## Example: Interacting with a Contract

```typescript
// Example of using the contracts plugin through an AI agent
const result = await generateText({
  model: openai("gpt-4o"),
  tools,
  maxSteps: 10,
  prompt: `Call the 'balanceOf' function on the contract at address 0x1234... 
           using this ABI: [{"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]
           Check the balance of address 0x5678...`,
});

// The AI will use the call_contract tool to execute this request
```

## API Reference

### `contracts()`

Creates a new Contracts plugin instance.

**Returns:**

- A ContractsPlugin instance that can be used with AI agent frameworks

### Provided Tools

The Contracts plugin provides the following AI agent tools:

#### `call_contract`

Calls a read-only method on a smart contract and returns the result.

**Parameters:**

- `contractAddress` (string): The address of the contract
- `abi` (array): The ABI of the contract
- `functionName` (string): The name of the function to call
- `args` (array, optional): The arguments to pass to the function

**Example:**

```typescript
try {
  const result = await callContractTool.execute({
    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC contract
    abi: erc20Abi,
    functionName: "symbol",
    args: []
  });
  console.log(`Contract call result: ${result}`);
} catch (error) {
  console.error(`Contract call failed: ${error.message}`);
}
```

#### `execute_contract`

Executes a state-changing method on a smart contract.

**Parameters:**

- `contractAddress` (string): The address of the contract
- `abi` (array): The ABI of the contract
- `functionName` (string): The name of the function to execute
- `args` (array, optional): The arguments to pass to the function
- `value` (string, optional): The amount of ETH to send with the transaction

**Example:**

```typescript
try {
  const txResult = await executeContractTool.execute({
    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC contract
    abi: erc20Abi,
    functionName: "transfer",
    args: ["0x...", "1000000"] // recipient, amount
  });
  console.log(`Transaction hash: ${txResult.hash}`);
} catch (error) {
  console.error(`Transaction failed: ${error.message}`);
}
```

#### `simulate_contract`

Simulates a contract interaction without submitting a transaction.

**Parameters:**

- `contractAddress` (string): The address of the contract
- `abi` (array): The ABI of the contract
- `functionName` (string): The name of the function to simulate
- `args` (array, optional): The arguments to pass to the function
- `value` (string, optional): The amount of ETH to send with the transaction

**Example:**

```typescript
try {
  const simulationResult = await simulateContractTool.execute({
    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC contract
    abi: erc20Abi,
    functionName: "transfer",
    args: ["0x...", "1000000"] // recipient, amount
  });
  console.log(`Simulation result:`, simulationResult);
} catch (error) {
  console.error(`Simulation failed: ${error.message}`);
}
```

> **Note on Tool Naming**: The tool names in this documentation (`call_contract`, `execute_contract`, `simulate_contract`) match the actual names used at runtime. The @Tool decorator in the implementation automatically converts camelCase method names to snake_case for the final tool names.

## Integration Examples

For a complete example integrating this plugin with AI frameworks, see:

- [Micropayments Example](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/examples/micropayments/vercel-ai)

## Related Packages

- [@radiustechsystems/ai-agent-core](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/core): Core abstractions and base classes
- [@radiustechsystems/ai-agent-wallet](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/wallets): Wallet functionality
- [@radiustechsystems/ai-agent-plugin-erc20](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/plugins/erc20): ERC20 token operations

## Resources

- [Website](https://radiustech.xyz/)
- [Testnet Access](https://docs.radiustech.xyz/radius-testnet-access)
- [GitHub Issues](https://github.com/radiustechsystems/ai-agent-toolkit/issues)
- [Changelog](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CHANGELOG.md)

## Contributing

Please see the [Contributing Guide](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CONTRIBUTING.md) for detailed information about contributing to this toolkit.

## License

This project is licensed under the [MIT License](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/LICENSE).
