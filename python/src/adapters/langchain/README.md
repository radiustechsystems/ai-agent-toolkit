# Radius AI Agent Toolkit - LangChain Adapter

This adapter provides integration between the Radius AI Agent Toolkit and LangChain, allowing you to easily add Radius capabilities to AI agents built with LangChain.

This package is part of the [Radius AI Agent Toolkit](https://github.com/radiustechsystems/ai-agent-toolkit), which provides tools for integrating AI agents with the Radius platform.

## Installation

```bash
# Install this specific package
pip install radius-ai-agent-sdk-adapter-langchain

# Required dependencies
pip install radius-ai-agent-sdk
pip install langchain langchain-core
```

## Prerequisites

- Python >=3.10
- LangChain installed in your project:
  - `pip install langchain langchain-core langchain-openai`
- OpenAI API key or other LLM provider credentials
- Radius wallet setup with a funded account

## Usage

```python
import os
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from web3 import Web3
from eth_account import Account

from radius_adapters.langchain import get_on_chain_tools
from radius_wallets.evm import send_eth
from radius_wallets.web3 import Web3EVMWalletClient

# Load environment variables
load_dotenv()

# 1. Setup Web3 and wallet
w3 = Web3(Web3.HTTPProvider(os.getenv("RPC_PROVIDER_URL")))
private_key = os.getenv("WALLET_PRIVATE_KEY")
assert private_key is not None, "You must set WALLET_PRIVATE_KEY environment variable"

account = Account.from_key(private_key)
print(f"Wallet address: {account.address}")

# 2. Configure the tools for LangChain
tools = get_on_chain_tools(
    wallet=Web3EVMWalletClient(w3),
    plugins=[
        send_eth(),  # Enable ETH transfers
    ],
)

print(f"Configured {len(tools)} tools for LangChain")
for tool in tools:
    print(f" - {tool.name}: {tool.description}")

# 3. Create a LangChain agent with the tools
llm = ChatOpenAI(temperature=0)
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful AI assistant with blockchain capabilities."),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

# Create and run the agent
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# Example usage
result = agent_executor.invoke({
    "input": "What is my wallet address?"
})

print(result["output"])
```

If you want to include ERC20 token support, you would add:

```python
from radius_plugins.erc20 import erc20, ERC20PluginOptions
from radius_plugins.erc20.token import USDC

# Then in the plugins array:
tools = get_on_chain_tools(
    wallet=Web3EVMWalletClient(w3),
    plugins=[
        send_eth(),
        erc20(options=ERC20PluginOptions(tokens=[USDC]))  # Add ERC20 token support
    ],
)
```

## API Reference

### `get_on_chain_tools(wallet, plugins)`

Creates a collection of tools compatible with LangChain that provides access to configured Radius features.

**Parameters:**

- `wallet` (WalletClientBase): A Radius wallet instance
- `plugins` (List[Any]): List of plugin instances to enable

**Returns:**

- (List[BaseTool]): An array of LangChain-compatible tools that can be used with LangChain agents

**Default Tools:**

The `get_on_chain_tools` function automatically provides the following wallet-related tools:

- `get_address`: Get the address of the wallet
- `get_chain`: Get the chain of the wallet
- `get_balance`: Get the balance of an address
- `sign_message`: Sign a message with the wallet
- `simulate_transaction`: Simulate a transaction to check if it would succeed
- `resolve_address`: Resolve an ENS name to an address
- `get_transaction_status`: Check the status of a transaction

**Example:**

```python
tools = get_on_chain_tools(
    wallet=Web3EVMWalletClient(w3),
    plugins=[
        send_eth(),
        erc20(options=ERC20PluginOptions(tokens=[USDC]))
    ],
)
```

## Integration Examples

For complete examples integrating this adapter with LangChain, see:

- [Web3 Integration Example](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/examples/langchain/web3)
- [Uniswap Integration Example](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/examples/langchain/uniswap)

## Development Setup

### 1. Clone the Repository

```bash
git clone git@github.com:radiustechsystems/ai-agent-toolkit.git
cd ai-agent-toolkit/python/src/adapters/langchain
```

### 2. Install Development Dependencies

```bash
pip install -e ".[dev]"
```

### 3. Run Tests

```bash
pytest
```

## Troubleshooting

### Error: Missing LangChain Dependencies

If you encounter errors related to missing LangChain dependencies, ensure you have installed all required packages:

```bash
pip install langchain langchain-core langchain-openai
```

### Error: Cannot Create Agent Executor

The LangChain agent creation API may change between versions. If you encounter errors creating the agent executor:

1. Check your LangChain version and ensure compatibility
2. Verify that your tools have the expected structure (name, description, and function)
3. Check the [LangChain documentation](https://python.langchain.com/docs/modules/agents/) for the latest API patterns

## Related Packages

- [radius-ai-agent-sdk](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/src/radius_ai_agent_sdk): Core abstractions and base classes
- [radius-ai-agent-sdk-wallet-evm](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/src/wallets/evm): EVM wallet functionality
- [radius-ai-agent-sdk-plugin-erc20](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/src/plugins/erc20): ERC20 token operations
- [radius-ai-agent-sdk-plugin-uniswap](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/src/plugins/uniswap): Uniswap operations

## Resources

- [Website](https://radiustech.xyz/)
- [Testnet Access](https://docs.radiustech.xyz/radius-testnet-access)
- [GitHub Issues](https://github.com/radiustechsystems/ai-agent-toolkit/issues)
- [Changelog](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CHANGELOG.md)

## Contributing

Please see the [Contributing Guide](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CONTRIBUTING.md) for detailed information about contributing to this toolkit.

## License

This project is licensed under the [MIT License](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/LICENSE)