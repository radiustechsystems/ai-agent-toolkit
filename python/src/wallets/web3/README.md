# Radius AI Agent SDK - Web3 Wallet

The Radius Web3 Wallet package provides a simple, unified interface for interacting with Radius from AI agents using Web3.py. It offers a Python implementation of wallet operations that integrate seamlessly with AI agent frameworks.

This package is part of the [Radius AI Agent Toolkit](https://github.com/radiustechsystems/ai-agent-toolkit), which provides tools for integrating AI agents with the Radius platform.

## Installation

```bash
pip install radius-ai-agent-sdk-wallet-web3
```

## Prerequisites

- Python >=3.10
- Access to a Radius RPC endpoint
- A funded private key for the Radius network
- web3 >=6.20.3
- radius-ai-agent-sdk >=0.1.0
- radius-ai-agent-sdk-wallet-evm >=0.1.0

## Usage

```python
from web3 import Web3
from radius_wallets.web3 import web3
from radius_wallets.evm import send_eth

# Create a Web3 instance
w3 = Web3(Web3.HTTPProvider(RPC_PROVIDER_URL))
w3.eth.default_account = w3.eth.account.from_key(WALLET_PRIVATE_KEY).address
w3.eth.default_local_account = w3.eth.account.from_key(WALLET_PRIVATE_KEY)

# Create a Radius wallet
wallet = web3(w3)

# Get wallet address
address = wallet.get_address()
print(f"Wallet address: {address}")

# Check wallet balance
balance = wallet.balance_of(address)
print(f"Balance: {balance['value']} {balance['symbol']}")

# Create sendETH function
send_eth_tool = send_eth.send_eth()

# Use the send_eth tool
transaction = await send_eth_tool(
    wallet=wallet,
    to="0xRecipientAddress",
    amount="0.01",
    wait_for_receipt=True
)
```

## API Reference

### `web3(client, options=None)`

Creates a new Web3EVMWalletClient instance.

**Parameters:**

- `client` (Web3): Configured Web3.py client instance
- `options` (Web3Options, optional): Configuration options

**Returns:**

- A Web3EVMWalletClient instance that can be used with AI agent tools

### `send_eth.send_eth()`

Creates a function that enables ETH transfer functionality for AI agents.

**Returns:**

- A tool function that can be used to send ETH

### Wallet Methods

#### `wallet.get_address()`

Returns the wallet's address.

#### `wallet.balance_of(address)`

Returns the balance info for the specified address, including value, symbol, and other details.

#### `wallet.send_transaction(transaction)`

Sends a transaction to the network.

**Parameters:**
- `transaction` (EVMTransaction): Transaction parameters including `to`, `value`, and optional contract interaction details

#### `wallet.read(request)`

Reads data from a smart contract without modifying state.

**Parameters:**
- `request` (EVMReadRequest): Request parameters including `address`, `functionName`, `abi`, and optional `args`

#### `wallet.sign_message(message)`

Signs a given message using the wallet's private key.

#### `wallet.sign_typed_data(data)`

Signs EIP-712 typed data.

## Advanced Usage

### Smart Contract Interactions

```python
# Read from a contract
result = wallet.read({
    "address": "0xContractAddress",
    "functionName": "balanceOf",
    "args": ["0xUserAddress"],
    "abi": [...] # Contract ABI
})

# Write to a contract
tx = wallet.send_transaction({
    "to": "0xContractAddress",
    "functionName": "transfer",
    "args": ["0xRecipient", 1000000000000000000],  # 1 ETH in wei
    "abi": [...] # Contract ABI
})
```

### ENS Resolution

```python
# Resolve ENS name to address
address = wallet.resolve_address("vitalik.eth")
print(f"Resolved address: {address}")
```

## Integration Examples

For a complete example integrating this package with AI frameworks, see:

- [LangChain Web3 Example](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/examples/langchain/web3)

## Development Setup

### 1. Clone the Repository

```bash
git clone git@github.com:radiustechsystems/ai-agent-toolkit.git
cd ai-agent-toolkit/python/src/wallets/web3
```

### 2. Install Development Dependencies

```bash
pip install -e ".[dev]"
```

### 3. Run Tests

```bash
pytest
```

## Related Packages

- [radius-ai-agent-sdk](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/src/radius_ai_agent_sdk): Core abstractions and base classes
- [radius-ai-agent-sdk-wallet-evm](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/src/wallets/evm): EVM wallet base implementation
- [radius-ai-agent-sdk-plugin-erc20](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/src/plugins/erc20): ERC20 token operations

## Resources

- [Website](https://radiustech.xyz/)
- [Testnet Access](https://docs.radiustech.xyz/radius-testnet-access)
- [GitHub Issues](https://github.com/radiustechsystems/ai-agent-toolkit/issues)
- [Changelog](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CHANGELOG.md)

## Contributing

Please see the [Contributing Guide](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CONTRIBUTING.md) for detailed information about contributing to this toolkit.

## License

This project is licensed under the [MIT License](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/LICENSE)