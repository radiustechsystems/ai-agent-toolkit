# ERC20 Plugin for Radius AI Agent SDK

A plugin for the AI Agent SDK that provides ERC20 token interaction functionality.

## Installation

```bash
# Install the plugin
poetry add radius-ai-agent-sdk-plugin-erc20

# Install required wallet dependency
poetry add radius-ai-agent-sdk-wallet-evm
```

## Usage

```python
from radius_plugins.erc20 import erc20, ERC20PluginOptions

# Initialize the plugin
options = ERC20PluginOptions(
    rpc_url="${RPC_PROVIDER_URL}"  # Your Radius RPC provider URL
)
plugin = erc20(options)

# Get token balance
balance = await plugin.balance_of(
    token_address="0xB73AAc53149af16DADA10D7cC99a9c4Cb722e21E",  # RAD token
    wallet_address="0xefbF7a6fa61A1602eb7630C92E79E5b6E63909E1"
)
```

## Features

- Token balance checking
- Allowance management
- Token transfers
- Token approvals
- Supported chains:
  - Radius

## License

This project is licensed under the terms of the MIT license.
