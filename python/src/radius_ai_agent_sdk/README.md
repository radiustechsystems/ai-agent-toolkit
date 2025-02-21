# Radius AI Agent Toolkit - AI Agent SDK (Python)

The AI Agent SDK is an open-source framework for connecting AI agents to the Radius network. It provides the core functionality and base classes needed to build AI agents that can interact with the Radius network.

## Installation

```bash
pip install radius-ai-agent-sdk
```

## Prerequisites

- Python >=3.10
- pydantic >=2.0.0
- asyncio >=3.4.1
- typing-extensions >=4.12.2

## Features

- Base classes for wallet interactions
- Plugin system architecture
- Tool creation and management
- EVM (Ethereum Virtual Machine) support
- Async support for concurrent operations
- Type-safe implementations using Pydantic

## Core Components

- `WalletClientBase`: Abstract base class for wallet interactions
- `PluginBase`: Base class for creating plugins
- `ToolBase`: Base class for creating tools
- Support for the Radius network and transactions

## Basic Usage

```python
from radius import (
    WalletClientBase,
    PluginBase,
    create_tool,
    get_tools,
    EvmChain
)

# Create custom tools
tool = create_tool({
    "name": "my_tool",
    "description": "Tool description",
    "parameters": MyParametersModel
}, handler_function)

# Get tools for a wallet
tools = get_tools(wallet=my_wallet, plugins=[my_plugin])
```

## Development

This package is part of the Radius AI Agent Toolkit monorepo. For development setup, please see the [main repository](https://github.com/radiustechsystems/ai-agent-toolkit).

## Available Adapters

The core SDK can be used with various AI frameworks through our adapter packages:

- LangChain Adapter (`radius-ai-agent-sdk-adapter-langchain`)
- More coming soon...

## Available Plugins

Extend functionality with our official plugins:

- ERC20 Plugin (`radius-ai-agent-sdk-plugin-erc20`)
- JSON-RPC Plugin (`radius-ai-agent-sdk-plugin-jsonrpc`)
- Uniswap Plugin (`radius-ai-agent-sdk-plugin-uniswap`)
- More coming soon...

## Documentation

For detailed documentation:
- [API Documentation](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/python/src/radius_ai_agent_sdk/README.md)
- [Examples](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/examples)
- [Changelog](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/python/CHANGELOG.md)

## Support

For issues and feature requests, please use our [issue tracker](https://github.com/radiustechsystems/ai-agent-toolkit/issues).

## License

This project is licensed under the MIT License.
