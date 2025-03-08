# Radius AI Agent Toolkit - Core

Core abstractions and base classes for the Radius AI Agent Toolkit. This package provides the foundation for building AI agent tools and plugins for interacting with the Radius platform.

This package is part of the [Radius AI Agent Toolkit](https://github.com/radiustechsystems/ai-agent-toolkit), which provides tools for integrating AI agents with the Radius platform.

## Installation

```bash
# Install this specific package
pip install radius-ai-agent-sdk

# Required dependencies will be installed automatically:
# pydantic>=2.0.0, asyncio>=3.4.1, typing-extensions>=4.12.2
```

## Prerequisites

- Python >=3.10
- pydantic >=2.0.0
- asyncio >=3.4.1
- typing-extensions >=4.12.2

## Usage

The core package provides base classes and decorators for building AI agent tools and plugins:

```python
from radius.classes.plugin_base import PluginBase
from radius.decorators.tool import Tool
from pydantic import BaseModel

# First, create parameter models using Pydantic
class MyToolParams(BaseModel):
    param1: str = "A string parameter"
    param2: int = "A number parameter"

# Create service class that implements the tool logic
class MyService:
    @Tool({
        "description": "Does something useful",
        "parameters_schema": MyToolParams
    })
    def my_custom_tool(self, params: dict) -> str:
        # Tool implementation
        return f"Processed {params['param1']} with value {params['param2']}"

# Create a custom plugin by extending PluginBase
class MyCustomPlugin(PluginBase):
    def __init__(self):
        # Pass the name and tool providers to the parent constructor
        service = MyService()
        super().__init__("my_custom_plugin", [service])
        self.service = service
    
    # Implement required abstract method
    def supports_chain(self, chain) -> bool:
        # For simplicity, support all chains in this example
        return True

# Create a mock wallet client (simplified for example)
class MockWalletClient:
    def get_address(self):
        return "0x..."
    def get_chain(self):
        return {"type": "evm", "id": 1}
    # Other required wallet methods

# Create an instance of your plugin
my_plugin = MyCustomPlugin()
wallet_client = MockWalletClient()

# Get all tools from the plugin (passing required wallet client)
tools = my_plugin.get_tools(wallet_client)

# Execute a tool
if tools:
    result = tools[0].execute({
        "param1": "test-string",
        "param2": 42
    })
    print(result)  # "Processed test-string with value 42"
```

## API Reference

### Base Classes

#### `PluginBase`

Abstract base class for creating Radius AI agent plugins. Plugins provide a way to organize related tools.

**Constructor:**

- `__init__(name: str, tool_providers: List[object])`: Creates a new plugin with the given name and tool providers

**Properties:**

- `name`: The name of the plugin
- `tool_providers`: Array of objects that provide tools (using the `@Tool` decorator)

**Methods:**

- `get_tools(wallet_client: WalletClientBase)`: Returns all tools defined in the plugin
- `supports_chain(chain: Chain)`: Abstract method that must be implemented to check if the plugin supports a chain

#### `ToolBase`

Base class for creating standalone AI agent tools. Tools created with this class can be used directly without a plugin.

**Constructor:**

- `__init__(config: ToolConfig)`: Creates a new tool with configuration containing name, description, and parameters

**Properties:**

- `name`: The name of the tool
- `description`: Description of what the tool does
- `parameters`: Pydantic model class defining the tool's parameters

**Methods:**

- `execute(parameters: dict[str, Any])`: Executes the tool with the given parameters

**Factory Function:**

The `create_tool` function can be used to create a new `ToolBase` instance:

```python
from radius.classes.tool_base import create_tool
from pydantic import BaseModel

class MyParams(BaseModel):
    value: str = "A parameter"

my_tool = create_tool(
    {
        "name": "my_tool",
        "description": "Does something useful",
        "parameters": MyParams
    },
    lambda params: f"Processed {params['value']}"
)
```

### Decorators

#### `@Tool(params)`

Decorator for marking methods as AI agent tools.

**Parameters:**

- `params["name"]` (str, optional): The name of the tool (defaults to the method name in snake_case)
- `params["description"]` (str): Description of what the tool does
- `params["parameters_schema"]` (Type[BaseModel]): Pydantic model class to validate parameters

```python
from radius.decorators.tool import Tool
from pydantic import BaseModel

class AddNumbersParams(BaseModel):
    a: int = "First number"
    b: int = "Second number"

class MathService:
    @Tool({
        "description": "Adds two numbers together",
        "parameters_schema": AddNumbersParams
    })
    def add_numbers(self, params: dict) -> int:
        return params["a"] + params["b"]
```

## Integration Examples

For complete examples integrating this package with AI frameworks, see:

- [LangChain Web3 Example](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/examples/langchain/web3)
- [LangChain Uniswap Example](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/examples/langchain/uniswap)

## Related Packages

- [radius-ai-agent-sdk-wallet-evm](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/src/wallets/evm): Wallet functionality for interacting with EVM blockchains
- [radius-ai-agent-sdk-adapter-langchain](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/src/adapters/langchain): Adapter for LangChain integration
- [radius-ai-agent-sdk-plugin-erc20](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/src/plugins/erc20): Plugin for ERC20 token interactions

## Resources

- [Website](https://radiustech.xyz/)
- [Testnet Access](https://docs.radiustech.xyz/radius-testnet-access)
- [GitHub Issues](https://github.com/radiustechsystems/ai-agent-toolkit/issues)
- [Changelog](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/python/CHANGELOG.md)

## Contributing

Please see the [Contributing Guide](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CONTRIBUTING.md) for detailed information about contributing to this toolkit.

## License

This project is licensed under the [MIT License](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/LICENSE).