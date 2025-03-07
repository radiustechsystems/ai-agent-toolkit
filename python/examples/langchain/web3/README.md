# Radius AI Agent SDK - LangChain Web3 Example

This example demonstrates how to integrate LangChain agents with Web3.py using the Radius AI Agent SDK, enabling AI agents to interact with blockchain functionalities through natural language.

## Key Features

- **LangChain Integration**: Creates AI agents with blockchain capabilities
- **Web3.py Interaction**: Connects to Radius for high-performance blockchain operations
- **Wallet Management**: Safe handling of digital assets through EVMWalletClient
- **ERC20 Integration**: Token interactions through the ERC20 plugin
- **Interactive CLI**: Test blockchain operations through conversation

## Prerequisites

- Python >=3.10
- An OpenAI API key for LLM access
- A Radius wallet with ETH (obtain from the [Radius faucet](https://testnet.tryradi.us/dashboard/faucet))
- Radius RPC endpoint URL

## Installation

```bash
# Install directly from PyPI
pip install radius-ai-agent-sdk-example-langchain-web3

# Or install from the repository
git clone git@github.com:radiustechsystems/ai-agent-toolkit.git
cd ai-agent-toolkit/python/examples/langchain/web3
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
RPC_PROVIDER_URL=your_radius_rpc_url_here
WALLET_PRIVATE_KEY=your_wallet_private_key_here
```

## Running the Example

```bash
python example.py
```

This will start an interactive CLI where you can test blockchain operations through natural language, such as:

- "What's my ETH balance?"
- "Transfer 0.01 ETH to 0x1234..."
- "Check my USDC balance"

## How It Works

The example configures a LangChain agent with Radius tools:

```python
from radius_adapters.langchain import get_on_chain_tools
from radius_plugins.erc20 import erc20, ERC20PluginOptions
from radius_wallets.evm import send_eth
from radius_wallets.web3 import Web3EVMWalletClient

# Initialize tools with web3 wallet
tools = get_on_chain_tools(
    wallet=Web3EVMWalletClient(w3),
    plugins=[
        send_eth(),
        erc20(options=ERC20PluginOptions(tokens=[USDC]))
    ],
)
```

## Learn More

- [Radius Documentation](https://docs.tryradi.us)
- [AI Agent Toolkit](https://github.com/radiustechsystems/ai-agent-toolkit)
- [LangChain Documentation](https://python.langchain.com/docs/get_started)
- [Web3.py Documentation](https://web3py.readthedocs.io/)

## License

This project is licensed under the [MIT License](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/LICENSE).