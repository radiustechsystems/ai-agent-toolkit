# Radius AI Agent SDK - LangChain Uniswap Example

This example demonstrates how to build AI agents that can interact with the Uniswap decentralized exchange using LangChain and the Radius AI Agent SDK. It showcases how to execute token swaps, check approvals, and get quotes through natural language.

## Key Features

- **DEX Integration**: Connect AI agents to Uniswap's powerful trading capabilities
- **Token Swap Flows**: Complete token swap workflow from approval to execution
- **LangChain Tools**: Predefined tools for Uniswap operations
- **Instant Settlement**: Leverage Radius for near-instant transaction finality
- **Interactive Testing**: CLI interface for testing Uniswap operations

## Prerequisites

- Python >=3.10
- An OpenAI API key for LLM access
- A Radius wallet with ETH (obtain from the [Radius faucet](https://testnet.radiustech.xyz/dashboard/faucet))
- Uniswap API key
- Radius RPC endpoint URL

## Installation

```bash
# Install directly from PyPI
pip install radius-ai-agent-sdk-example-langchain-uniswap

# Or install from the repository
git clone git@github.com:radiustechsystems/ai-agent-toolkit.git
cd ai-agent-toolkit/python/examples/langchain/uniswap
pip install -e ".[dev]"
```

## Setup

1. Configure your environment variables:

```bash
cp .env.template .env
```

2. Edit the `.env` file with your credentials:

```
# AI API Keys
OPENAI_API_KEY=your_openai_api_key_here

# Radius Configuration
BASE_RPC_URL=your_radius_rpc_url_here
WALLET_PRIVATE_KEY=your_wallet_private_key_here

# Uniswap Configuration
UNISWAP_API_KEY=your_uniswap_api_key_here
UNISWAP_BASE_URL=https://trade-api.gateway.uniswap.org/v1
```

## Running the Example

```bash
python example.py
```

This will start an interactive CLI where you can test Uniswap operations through natural language, such as:

- "Check if I have enough USDC approval for Uniswap"
- "Get a quote to swap 1 RADUSD for USDC"
- "Swap 0.1 RADUSD for USDC"

## How It Works

The example configures a LangChain agent with Radius and Uniswap tools:

```python
from radius_adapters.langchain import get_on_chain_tools
from radius_plugins.erc20 import erc20, ERC20PluginOptions
from radius_plugins.uniswap import uniswap, UniswapPluginOptions
from radius_wallets.web3 import Web3EVMWalletClient

# Initialize tools with web3 wallet and Uniswap plugin
tools = get_on_chain_tools(
    wallet=Web3EVMWalletClient(w3),
    plugins=[
        erc20(options=ERC20PluginOptions(tokens=[USDC, RADUSD])),
        uniswap(options=UniswapPluginOptions(
            api_key=uniswap_api_key,
            base_url=uniswap_base_url
        )),
    ],
)
```

## Learn More

- [Radius Documentation](https://docs.radiustech.xyz)
- [AI Agent Toolkit](https://github.com/radiustechsystems/ai-agent-toolkit)
- [Uniswap Documentation](https://docs.uniswap.org/)
- [LangChain Documentation](https://python.langchain.com/docs/get_started)

## License

This project is licensed under the [MIT License](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/LICENSE).