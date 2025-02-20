# Uniswap Plugin for Radius AI Agent SDK

A plugin for the Radius AI Agent SDK that provides Uniswap DEX functionality for token swaps and liquidity operations.

## Installation

```bash
# Install the plugin
poetry add radius-ai-agent-sdk-plugin-uniswap

# Install required dependencies
poetry add radius-ai-agent-sdk-wallet-evm
poetry add radius-ai-agent-sdk-plugin-erc20
```

## Usage

```python
from radius_plugins.uniswap import uniswap, UniswapPluginOptions

# Initialize the plugin
options = UniswapPluginOptions(
    api_key="${UNISWAP_API_KEY}",  # Optional: API key for higher rate limits
    rpc_url="${RPC_PROVIDER_URL}"   # Your Radius RPC provider URL
)
plugin = uniswap(options)

# Get token price
price = await plugin.get_token_price(
    token_address="0xB73AAc53149af16DADA10D7cC99a9c4Cb722e21E",  # RadToken
    chain_id=1223953  # Radius testnet
)

# Get swap quote
quote = await plugin.get_swap_quote(
    chain_id=1223953,
    token_in="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",   # WETH
    token_out="0xB73AAc53149af16DADA10D7cC99a9c4Cb722e21E",  # RadToken
    amount="1000000000000000000",  # 1 WETH in wei
    slippage=50  # 0.5% slippage tolerance
)
```

## Features

- Token price discovery
- Swap quote generation
- Token swap execution
- Liquidity pool information
- Position management
- Supported chains:
  - Radius

## License

This project is licensed under the terms of the MIT license.
