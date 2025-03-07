# Radius AI Agent Toolkit - JSON-RPC Plugin

This plugin enables AI agents to make remote procedure calls using the JSON-RPC protocol through a standardized interface, allowing them to interact with any JSON-RPC endpoint.

This package is part of the [Radius AI Agent Toolkit](https://github.com/radiustechsystems/ai-agent-toolkit), which provides tools for integrating AI agents with the Radius platform.

## Installation

```bash
# Install this specific package
pip install radius-ai-agent-sdk-plugin-jsonrpc

# Required dependencies
pip install radius-ai-agent-sdk
pip install aiohttp
```

## Prerequisites

- Python >=3.10
- radius-ai-agent-sdk >=0.1.0
- aiohttp >=3.8.6

## Usage

```python
from radius_plugins.jsonrpc import jsonrpc, JSONRpcPluginOptions
from radius_wallets.web3 import create_radius_wallet
from radius_adapters.langchain import get_on_chain_tools

# Create a Radius wallet
wallet = create_radius_wallet(
    rpc_url=os.environ.get("RPC_PROVIDER_URL"),
    private_key=os.environ.get("WALLET_PRIVATE_KEY")
)

# Initialize the JSON-RPC plugin
jsonrpc_plugin = jsonrpc(JSONRpcPluginOptions(
    endpoint="https://your-json-rpc-endpoint.com"
))

# Create AI agent tools with the JSON-RPC plugin
tools = get_on_chain_tools(
    wallet=wallet,
    plugins=[jsonrpc_plugin]
)
```

## Example: Making a JSON-RPC Call

```python
# Example of using the JSON-RPC plugin through an AI agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o")
agent = model.bind_tools(tools)

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant that can make JSON-RPC calls."),
    ("user", "{input}")
])

chain = prompt | RunnablePassthrough.assign(
    agent_response=lambda x: agent.invoke(x)
) | (lambda x: x["agent_response"])

result = chain.invoke({
    "input": """Make a JSON-RPC call to get the latest block number using:
                method: 'eth_blockNumber',
                params: [],
                id: 1,
                jsonrpc: '2.0'"""
})

# The AI will use the json_rpc_func tool to execute this request
```

## API Reference

### `jsonrpc(options: JSONRpcPluginOptions)`

Creates a new JSON-RPC plugin instance.

**Parameters:**

- `options` (JSONRpcPluginOptions): Configuration options for the JSON-RPC plugin
  - `endpoint` (str): The URL of the JSON-RPC endpoint

**Returns:**

- A JSONRpcPlugin instance that can be used with AI agent frameworks

### Provided Tools

The JSON-RPC plugin provides the following AI agent tool:

#### `json_rpc_func`

Makes a remote procedure call to a JSON-RPC endpoint.

**Parameters:**

- `method` (str): A string containing the name of the method to be invoked
- `params` (list): A structured value that holds the parameter values to be used during the invocation of the method
- `id` (int): An identifier established by the client that must contain a string, number, or null
- `jsonrpc` (str): A string that specifies the version of the JSON-RPC protocol must be exactly '2.0'

**Example:**

```python
try:
    result = await json_rpc_tool.execute({
        "method": "eth_getBalance",
        "params": ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", "latest"],
        "id": 1,
        "jsonrpc": "2.0"
    })
    print(f"JSON-RPC call result: {result}")
except Exception as e:
    print(f"JSON-RPC call failed: {str(e)}")
```

> **Note on Tool Naming**: The tool name in this documentation (`json_rpc_func`) matches the actual name used at runtime. The @Tool decorator in the implementation automatically converts camelCase method names to snake_case for the final tool names.

## Features

- Asynchronous JSON-RPC calls
- HTTP/HTTPS transport support
- Error handling and response parsing
- Type-safe implementations with Pydantic
- Built on aiohttp for high performance

## Development Setup

### 1. Clone the Repository

```bash
git clone git@github.com:radiustechsystems/ai-agent-toolkit.git
cd ai-agent-toolkit/python/src/plugins/jsonrpc
```

### 2. Install Development Dependencies

```bash
pip install -e ".[dev]"
```

### 3. Run Tests

```bash
pytest
```

## Related Packages

- [radius-ai-agent-sdk](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/src/radius_ai_agent_sdk): Core abstractions and base classes
- [radius-ai-agent-sdk-wallet-web3](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/src/wallets/web3): Wallet functionality
- [radius-ai-agent-sdk-plugin-erc20](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/src/plugins/erc20): ERC20 token operations

## Resources

- [Website](https://radiustech.xyz/)
- [Testnet Access](https://docs.radiustech.xyz/radius-testnet-access)
- [GitHub Issues](https://github.com/radiustechsystems/ai-agent-toolkit/issues)
- [Changelog](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CHANGELOG.md)

## Contributing

Please see the [Contributing Guide](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CONTRIBUTING.md) for detailed information about contributing to this toolkit.

## License

This project is licensed under the [MIT License](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/LICENSE).