# Radius AI Agent Toolkit - ERC20 Plugin

This plugin enables AI agents to interact with ERC20 tokens on Radius, allowing them to check balances, transfer tokens, and manage token approvals.

This package is part of the [Radius AI Agent Toolkit](https://github.com/radiustechsystems/ai-agent-toolkit), which provides tools for integrating AI agents with the Radius platform.

## Installation

```bash
# Install this specific package
pip install radius-ai-agent-sdk-plugin-erc20

# Required dependencies
pip install radius-ai-agent-sdk
pip install radius-ai-agent-sdk-wallet-evm
```

## Prerequisites

- Python >=3.10
- Radius wallet setup with a funded account

## Usage

```python
from radius_plugins.erc20 import erc20, USDC
from radius_wallets.evm import create_evm_wallet
from radius_adapters.langchain import get_on_chain_tools

# Create a Radius wallet
wallet = create_evm_wallet({
    "rpc_url": "https://testnet.radius.xyz/rpc",
    "private_key": "0x123..." # Your private key
})

# Initialize the ERC20 plugin with predefined tokens
erc20_plugin = erc20({
    "tokens": [USDC]
})

# Create AI agent tools with the ERC20 plugin
tools = get_on_chain_tools({
    "wallet_client": wallet,
    "plugins": [erc20_plugin]
})
```

## Adding Custom Tokens

You can add your own custom tokens by defining their details:

```python
from radius_plugins.erc20 import erc20, USDC, Token

# Create an ERC20 plugin with both predefined and custom tokens
erc20_plugin = erc20({
    "tokens": [
        USDC,  # Predefined token
        {
            # Custom token definition
            "decimals": 18,
            "symbol": "RAD",
            "name": "Radius Token",
            "chains": {
                1223953: {  # Radius testnet chain ID
                    "contractAddress": "0xB73AAc53149af16DADA10D7cC99a9c4Cb722e21E"
                }
            }
        }
    ]
})
```

## API Reference

### `erc20(options)`

Creates a new ERC20 plugin instance.

**Parameters:**

- `options.tokens` (List[Token]): Array of token definitions to enable

**Returns:**

- An ERC20Plugin instance that can be used with AI agent frameworks

### Predefined Tokens

The package includes these predefined tokens:

- `USDC`: USD Coin stablecoin

### Provided Tools

The ERC20 plugin provides the following AI agent tools:

#### `get_token_info_by_symbol`

Gets information about a token by its symbol.

**Parameters:**

- `symbol` (str): The token symbol to lookup

**Example:**

```python
try:
    token_info = await get_token_info_by_symbol_tool.execute({
        "symbol": "USDC"
    })
    print("Token info:", token_info)
    # { "symbol": "USDC", "name": "USD Coin", "decimals": 6, "contractAddress": "0x..." }
except Exception as error:
    print(f"Token info lookup failed: {error}")
```

#### `get_token_balance`

Gets the balance of a specific token for an address.

**Parameters:**

- `tokenAddress` (str): The token contract address
- `wallet` (str): The wallet address to check

**Example:**

```python
try:
    balance = await get_token_balance_tool.execute({
        "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",  # USDC
        "wallet": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
    })
    print(f"Balance: {balance}")
except Exception as error:
    print(f"Balance check failed: {error}")
```

#### `transfer`

Transfers tokens from the wallet to another address.

**Parameters:**

- `tokenAddress` (str): The token contract address
- `to` (str): The recipient address
- `amount` (str): The amount to transfer in base units

#### `get_token_total_supply`

Gets the total supply of a token.

**Parameters:**

- `tokenAddress` (str): The token contract address

#### `get_token_allowance`

Gets the current allowance for a spender.

**Parameters:**

- `tokenAddress` (str): The token contract address
- `owner` (str): The token owner
- `spender` (str): The spender address

#### `approve`

Approves a spender to use a specific amount of tokens.

**Parameters:**

- `tokenAddress` (str): The token contract address
- `spender` (str): The spender address
- `amount` (str): The amount to approve in base units

#### `transfer_from`

Transfers tokens from one address to another using the connected wallet as the spender.

**Parameters:**

- `tokenAddress` (str): The token contract address
- `from` (str): The address to transfer from
- `to` (str): The recipient address
- `amount` (str): The amount to transfer in base units

#### `convert_to_base_unit`

Converts a human-readable token amount to its base unit.

**Parameters:**

- `amount` (float): The decimal amount (e.g., 10.5)
- `decimals` (int): The token decimals (e.g., 6 for USDC, 18 for most tokens)

**Example:**

```python
try:
    base_unit_result = await convert_to_base_unit_tool.execute({
        "amount": 100,
        "decimals": 6  # USDC has 6 decimals
    })
    print(f"100 USDC in base units: {base_unit_result}")  # 100000000
except Exception as error:
    print(f"Conversion failed: {error}")
```

#### `convert_from_base_unit`

Converts a base unit token amount to its human-readable form.

**Parameters:**

- `amount` (float): The amount in base units
- `decimals` (int): The token decimals

**Example:**

```python
try:
    decimal_result = await convert_from_base_unit_tool.execute({
        "amount": 100000000,  # 100 USDC in base units
        "decimals": 6  # USDC has 6 decimals
    })
    print(f"100000000 base units in USDC: {decimal_result}")  # 100.0
except Exception as error:
    print(f"Conversion failed: {error}")
```

> **Note on Tool Naming**: The tool names in this documentation match the actual names used at runtime. The @Tool decorator in the implementation automatically converts camelCase method names to snake_case for the final tool names.

## Integration Examples

For examples integrating this plugin with the LangChain framework, see:

- [LangChain Uniswap Example](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/examples/langchain/uniswap)

## Related Packages

- [radius-ai-agent-sdk](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/src/radius_ai_agent_sdk): Core abstractions and base classes
- [radius-ai-agent-sdk-wallet-evm](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/src/wallets/evm): EVM wallet functionality
- [radius-ai-agent-sdk-adapter-langchain](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/src/adapters/langchain): LangChain adapter

## Resources

- [Website](https://radiustech.xyz/)
- [Testnet Access](https://docs.radiustech.xyz/radius-testnet-access)
- [GitHub Issues](https://github.com/radiustechsystems/ai-agent-toolkit/issues)
- [Changelog](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CHANGELOG.md)

## Contributing

Please see the [Contributing Guide](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CONTRIBUTING.md) for detailed information about contributing to this toolkit.

## License

This project is licensed under the [MIT License](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/LICENSE).