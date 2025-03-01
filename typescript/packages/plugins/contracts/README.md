# Radius AI Agent Contracts Plugin

This plugin provides AI agents with the ability to interact with any smart contract on the Radius blockchain through a standardized interface.

## Features

- Deploy new smart contracts
- Call read-only contract methods
- Execute state-changing contract methods
- Retrieve and parse contract events
- Estimate gas for contract interactions
- Encode and decode ABI data
- Simulate contract execution (dry-run)
- Get information about existing contracts

## Installation

```bash
npm install @radiustechsystems/ai-agent-plugin-contracts
# or
pnpm add @radiustechsystems/ai-agent-plugin-contracts
```

## Usage

```typescript
import { contracts } from "@radiustechsystems/ai-agent-plugin-contracts";
import { radiusWallet } from "@radiustechsystems/ai-agent-wallet";

// Create a wallet client
const wallet = radiusWallet({
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: process.env.RADIUS_RPC_URL,
});

// Add the contracts plugin to your agent
const tools = getTools({
  wallet,
  plugins: [
    contracts(),
  ],
});
```

## Tools

The contracts plugin provides the following tools:

- `call_contract`: Call a read-only method on a smart contract
- `execute_contract`: Execute a state-changing method on a smart contract
- `deploy_contract`: Deploy a new smart contract from bytecode
- `estimate_contract_gas`: Estimate gas needed for a contract interaction
- `get_contract_events`: Retrieve events emitted by a contract
- `encode_abi`: Encode function call data using a contract ABI
- `decode_abi`: Decode function call data or return data
- `simulate_contract`: Simulate a contract interaction without submitting a transaction
- `get_contract_info`: Get information about a smart contract at a specific address

## License

MIT