# Radius AI Agent Toolkit - EVM Wallet

The Radius EVM Wallet package provides a simple, unified interface for interacting with Radius from AI agents. It offers high-performance wallet operations and tool-based interactions that integrate seamlessly with AI agent frameworks.

This package is part of the [Radius AI Agent Toolkit](https://github.com/radiustechsystems/ai-agent-toolkit), which provides tools for integrating AI agents with the Radius platform.

## Installation

```bash
# Install this specific package
pip install radius-ai-agent-sdk-wallet-evm

# Required dependencies
pip install radius-ai-agent-sdk
```

## Prerequisites

- Python >=3.10
- Access to a Radius RPC endpoint
- A funded private key for the Radius network

## Usage

```python
from radius_wallets.evm import create_radius_wallet, send_eth
from radius_adapters.langchain import get_on_chain_tools

# Create a Radius wallet
wallet = create_radius_wallet(
    rpc_url=os.environ.get("RPC_PROVIDER_URL"),
    private_key=os.environ.get("WALLET_PRIVATE_KEY")
)

# Get wallet address
address = wallet.get_address()
print(f"Wallet address: {address}")

# Check wallet balance using balance_of method
balance = wallet.balance_of(address)
print(f"Balance: {balance['value']} {balance['symbol']}")

# Create sendETH plugin
send_eth_plugin = send_eth()

# Get the tools provided by the plugin
tools = send_eth_plugin.get_tools(wallet)

# Or create tools for AI agents with the adapter
ai_tools = get_on_chain_tools(
    wallet=wallet,
    plugins=[send_eth()]  # Enable ETH transfers
)
```

## API Reference

### `create_radius_wallet(rpc_url, private_key, enable_batch=False, logger=None)`

Creates a new Radius wallet instance.

**Parameters:**

- `rpc_url` (str): URL of the Radius RPC endpoint
- `private_key` (str): Private key for the wallet
- `enable_batch` (bool, optional): Whether to enable batch transactions
- `logger` (callable, optional): Custom logger function

**Returns:**

- An EVMWalletClient instance that can be used with AI agent tools

### `send_eth()`

Creates a plugin that enables ETH transfer functionality for AI agents.

**Returns:**

- A plugin that can be used with the `get_on_chain_tools` function

### Wallet Methods

#### `wallet.get_address()`

Returns the wallet's address.

#### `wallet.balance_of(address)`

Returns the balance info for the specified address, including value, symbol, and other details.

#### `wallet.send_transaction(tx)`

Sends a transaction to the network.

#### `wallet.send_batch_of_transactions(txs)`

Sends multiple transactions as a batch (if batch mode is enabled).

## Advanced Usage

### Batch Transactions

```python
# Create a wallet with batch transaction support
wallet = create_radius_wallet(
    rpc_url=os.environ.get("RPC_PROVIDER_URL"),
    private_key=os.environ.get("WALLET_PRIVATE_KEY"),
    enable_batch=True  # Enable batch transactions
)

# Send a batch of transactions
result = wallet.send_batch_of_transactions([
    {"to": "0x123...", "value": 100000000000000000},  # 0.1 ETH in wei
    {"to": "0x456...", "value": 200000000000000000}   # 0.2 ETH in wei
])
```

### Smart Contract Interactions

```python
# Read from a contract
result = wallet.read({
    "address": "0xContractAddress",
    "functionName": "balanceOf",
    "args": ["0xUserAddress"],
    "abi": [...]  # Contract ABI
})

# Write to a contract
tx = wallet.send_transaction({
    "to": "0xContractAddress",
    "functionName": "transfer",
    "args": ["0xRecipient", 1000000000000000000],  # 1.0 ETH in wei
    "abi": [...]  # Contract ABI
})
```

## Integration Examples

For examples integrating this package with AI frameworks, see:

- [Langchain Web3 Example](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/examples/langchain/web3)
- [Langchain Uniswap Example](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/examples/langchain/uniswap)

## Related Packages

- [radius-ai-agent-sdk](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/src/radius_ai_agent_sdk): Core abstractions and base classes
- [radius-ai-agent-sdk-plugin-erc20](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/src/plugins/erc20): ERC20 token operations
- [radius-ai-agent-sdk-adapter-langchain](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/src/adapters/langchain): LangChain integration

## Development Setup

### 1. Clone the Repository

```bash
git clone git@github.com:radiustechsystems/ai-agent-toolkit.git
cd ai-agent-toolkit/python/src/wallets/evm
```

### 2. Install Development Dependencies

```bash
pip install -e ".[dev]"
```

### 3. Build the Package

```bash
pip install build
python -m build
```

## Testing

Run tests with pytest:

```bash
pytest
```

## Resources

- [Website](https://radiustech.xyz/)
- [Testnet Access](https://docs.radiustech.xyz/radius-testnet-access)
- [GitHub Issues](https://github.com/radiustechsystems/ai-agent-toolkit/issues)
- [Changelog](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CHANGELOG.md)

## Contributing

Please see the [Contributing Guide](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CONTRIBUTING.md) for detailed information about contributing to this toolkit.

## License

This project is licensed under the [MIT License](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/LICENSE).