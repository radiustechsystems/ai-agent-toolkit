# Radius AI Agent Toolkit - Uniswap Plugin

This plugin enables AI agents to interact with the Uniswap protocol on Radius, allowing them to get token quotes and perform token swaps.

This package is part of the [Radius AI Agent Toolkit](https://github.com/radiustechsystems/ai-agent-toolkit), which provides tools for integrating AI agents with the Radius platform.

## Installation

```bash
# Install this specific package
pip install radius-ai-agent-sdk-plugin-uniswap

# Required dependencies
pip install radius-ai-agent-sdk
pip install radius-ai-agent-sdk-wallet-evm
pip install radius-ai-agent-sdk-wallet-web3
pip install radius-ai-agent-sdk-plugin-erc20
```

## Prerequisites

- Python >=3.10
- Uniswap API key - Get it from: [Uniswap Hub](https://hub.uniswap.org/)
- Radius wallet setup with a funded account

## Configuration

Required environment variables:

- `UNISWAP_API_KEY`: Your Uniswap API key
  - Format: 32-character string
  - Required for: Accessing Uniswap's API for quotes and swaps
- `UNISWAP_BASE_URL`: Uniswap API base URL
  - Format: Full URL with protocol and version
  - Default: `https://api.uniswap.org/v1`

## Usage

```python
from radius_plugins.uniswap import uniswap, UniswapPluginOptions
from radius_wallets.evm import create_evm_wallet_client
from radius.utils.get_tools import get_on_chain_tools

# Create a Radius wallet
wallet = await create_evm_wallet_client({
    "rpc_url": "YOUR_RPC_URL",
    "private_key": "YOUR_PRIVATE_KEY"
})

# Initialize the Uniswap plugin
uniswap_plugin = uniswap(UniswapPluginOptions(
    base_url=os.environ.get("UNISWAP_BASE_URL", "https://api.uniswap.org/v1"),
    api_key=os.environ.get("UNISWAP_API_KEY")
))

# Create AI agent tools with the Uniswap plugin
tools = await get_on_chain_tools(wallet=wallet, plugins=[uniswap_plugin])
```

## API Reference

### `uniswap(options)`

Creates a new Uniswap plugin instance.

**Parameters:**

- `options.base_url` (string): Uniswap API base URL
- `options.api_key` (string): Your Uniswap API key

**Returns:**

- A UniswapPlugin instance that can be used with AI agent frameworks

### Provided Tools

The Uniswap plugin provides the following AI agent tools:

#### `uniswap_check_approval`

Checks if a wallet has enough token approval for a swap.

**Parameters:**

- `token` (string): The token address to check approval for
- `amount` (string): The amount to approve
- `walletAddress` (string): The wallet address to check

**Example:**

```python
try:
    approval_status = await check_approval_tool.execute({
        "token": "0x51fCe89b9f6D4c530698f181167043e1bB4abf89",  # USDC on Radius testnet
        "amount": "1000000",  # 1 USDC (6 decimals)
        "walletAddress": "0xefbf7a6fa61a1602eb7630c92e79e5b6e63909e1"
    })
    
    print("Approval status:", approval_status)
    # { "status": "approved", "txHash": "0x..." }
except Exception as error:
    print(f"Approval check failed: {error}")
```

#### `uniswap_get_quote`

Gets a quote for swapping tokens.

**Parameters:**

- `tokenIn` (string): The address of the input token
- `tokenOut` (string): The address of the output token
- `amount` (string): The amount of tokenIn to swap
- `type` (string): The type of swap ("EXACT_INPUT" or "EXACT_OUTPUT")
- `protocols` (list[string]): The protocols to use for the swap (e.g., ["V3"])

**Example:**

```python
try:
    quote_params = {
        "tokenIn": "0x9aeEa4f3025940dBdbf6863C7e16a23Ea95272a4",   # RADUSD on Radius testnet
        "tokenOut": "0x51fCe89b9f6D4c530698f181167043e1bB4abf89",  # USDC on Radius testnet
        "amount": "1000000000000000000",  # 1 RADUSD (18 decimals)
        "type": "EXACT_INPUT",
        "protocols": ["V3"]
    }
    
    quote = await get_quote_tool.execute(quote_params)
    print("Swap quote result:", quote)
    # Quote data including estimated gas, output amount, etc.
except Exception as error:
    print(f"Getting quote failed: {error}")
```

#### `uniswap_swap_tokens`

Executes a token swap on Uniswap.

**Parameters:**

- `tokenIn` (string): The address of the input token
- `tokenOut` (string): The address of the output token
- `amount` (string): The amount of tokenIn to swap
- `type` (string): The type of swap ("EXACT_INPUT" or "EXACT_OUTPUT")
- `protocols` (list[string]): The protocols to use for the swap (e.g., ["V3"])

**Example:**

```python
try:
    swap_params = {
        "tokenIn": "0x9aeEa4f3025940dBdbf6863C7e16a23Ea95272a4",   # RADUSD on Radius testnet
        "tokenOut": "0x51fCe89b9f6D4c530698f181167043e1bB4abf89",  # USDC on Radius testnet
        "amount": "1000000000000000000",  # 1 RADUSD (18 decimals)
        "type": "EXACT_INPUT",
        "protocols": ["V3"]
    }
    
    swap_result = await swap_tokens_tool.execute(swap_params)
    print("Swap transaction:", swap_result)
    # { "txHash": "0x..." }
except Exception as error:
    print(f"Swap failed: {error}")
```

> **Note on Tool Naming**: The Uniswap plugin explicitly prefixes its tool names with `uniswap_` in the implementation, which is consistent with the final available tool names.

## Integration Examples

For a complete example integrating this plugin with LangChain, see:

- [Uniswap LangChain Example](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/examples/langchain/uniswap)

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

This project is licensed under the [MIT License](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/LICENSE)