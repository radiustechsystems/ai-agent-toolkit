# Radius Python AI Agent Toolkit

A Python implementation for integrating [Radius](https://radiustech.xyz/) capabilities into AI agent workflows, providing a simple and type-safe way to incorporate Radius functionality into AI agents.

## Features

- Seamless integration with Radius
- Support for major AI agent frameworks:
  - LangChain
  - More coming soon!
- Wallet management and transaction capabilities
- Clean, idiomatic Python implementation
- Type-safe contract interactions
- EVM compatibility
- Integration with Radius' high-throughput and near-instant settlement capabilities

## Requirements

- Python >= 3.10
- pip (for installation)

## Installation

### Option 1: Complete Toolkit Package

Install the complete toolkit package:

```bash
pip install radius-ai-agent-sdk
```

This will install the core SDK, but you'll need to install adapter and plugin packages separately.

### Option 2: Individual Packages

If you prefer to install only the specific components you need:

```bash
# Core package (required)
pip install radius-ai-agent-sdk

# Adapters (pick one based on your AI framework)
pip install radius-ai-agent-sdk-adapter-langchain

# Plugins (install the ones you need)
pip install radius-ai-agent-sdk-plugin-erc20
pip install radius-ai-agent-sdk-plugin-uniswap
pip install radius-ai-agent-sdk-plugin-jsonrpc

# Wallets (install at least one)
pip install radius-ai-agent-sdk-wallet-evm
pip install radius-ai-agent-sdk-wallet-web3
```

## Usage

Here's a basic example using LangChain:

```python
from radius.classes.plugin_base import PluginBase
from radius_wallets.evm import EVMWalletClient
from radius_adapters.langchain import get_on_chain_tools
from radius_plugins.erc20 import erc20, USDC
from radius_plugins.uniswap import uniswap

# Create a wallet
wallet = EVMWalletClient(
    rpc_url=os.environ.get("RPC_PROVIDER_URL"),
    private_key=os.environ.get("WALLET_PRIVATE_KEY")
)

# Configure tools for LangChain
tools = get_on_chain_tools(
    wallet=wallet,
    plugins=[
        erc20(tokens=[USDC]),
        uniswap(
            base_url=os.environ.get("UNISWAP_BASE_URL"),
            api_key=os.environ.get("UNISWAP_API_KEY")
        )
    ]
)

# Use with LangChain
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

# Create the agent
llm = ChatOpenAI(model="gpt-4o")
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant."),
    ("user", "{input}")
])
agent = create_openai_tools_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# Execute a transaction
response = agent_executor.invoke({"input": "Transfer 0.01 ETH to 0x1234..."})
print(response["output"])
```

### Examples

Here's a guide to spinning up an example that demonstrates LangChain integration with Radius:

#### 1. Clone the Repository

```bash
git clone git@github.com:radiustechsystems/ai-agent-toolkit.git
cd ai-agent-toolkit/python
```

#### 2. Install Dependencies

```bash
pip install -e .
```

#### 3. Navigate to the LangChain Example

```bash
cd examples/langchain/web3
```

#### 4. Configure Environment Variables

Copy the `.env.template` file and populate it with your values:

```bash
cp .env.template .env
```

Open `.env` and set the following variables:

```bash
# AI API Keys
OPENAI_API_KEY=your_openai_api_key_here

# Radius Configuration
RPC_PROVIDER_URL=your_radius_rpc_url_here
WALLET_PRIVATE_KEY=your_wallet_private_key_here
```

Note:
- Get an OpenAI API key from: https://platform.openai.com/api-keys
- RPC provider URL from Radius testnet: https://testnet.tryradi.us/dashboard/rpc-endpoints
- The wallet private key should be from an EVM-compatible wallet

#### 5. Run the Example

```bash
python example.py
```

## Development Setup

For those who want to contribute or modify the SDK:

```bash
# Clone the repository
git clone git@github.com:radiustechsystems/ai-agent-toolkit.git
cd ai-agent-toolkit/python

# Install in development mode
pip install -e ".[dev]"

# Run tests
pytest

# Lint code
ruff check .
```

## Troubleshooting

If you encounter issues during setup or execution:

### Verify Python Version

Ensure your environment meets the requirements:

```bash
python --version  # Should be >=3.10
```

### Clean and Rebuild

```bash
# Remove build artifacts
rm -rf dist/
rm -rf *.egg-info/

# Fresh install
pip install -e .
```

## Package Structure

The Python toolkit is organized into several components:

- **Core SDK**: Base classes and utilities
- **Adapters**: Framework-specific integrations (LangChain, etc.)
- **Plugins**: Specialized functionality (ERC20, Uniswap, etc.)
- **Wallets**: Wallet implementations for different blockchain clients

## Resources

- [Website](https://radiustech.xyz/)
- [Testnet Access](https://docs.radiustech.xyz/radius-testnet-access)
- [GitHub Issues](https://github.com/radiustechsystems/ai-agent-toolkit/issues)
- [API Documentation](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/python/src/radius_ai_agent_sdk/README.md)
- [Examples](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/examples)

## Contributing

Please see the [General Contributing Guide](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CONTRIBUTING.md) for repository-wide guidelines and principles.

When contributing to the Python toolkit, follow these guidelines:

- Use type hints for all function parameters and returns
- Follow PEP 8 with 120 character line limit
- Use snake_case for variables/functions, PascalCase for classes
- Include docstrings for public APIs (preferably Google style)
- Create unit tests for all functionality

## License

This project is licensed under the [MIT License](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/LICENSE).