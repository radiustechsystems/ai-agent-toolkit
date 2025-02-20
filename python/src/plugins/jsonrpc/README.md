# JSON-RPC Plugin for Radius AI Agent SDK

A plugin for the Radius AI Agent SDK that enables making JSON-RPC calls to Radius endpoints supporting the JSON-RPC 2.0 specification.

## Installation

```bash
# Install the plugin
poetry add radius-ai-agent-sdk-plugin-jsonrpc

# Install optional wallet dependencies for chain-specific operations
poetry add radius-ai-agent-sdk-wallet-evm
```

## Usage

```python
from radius_plugins.jsonrpc import jsonrpc, JSONRpcPluginOptions

# Initialize the plugin for Radius
evm_options = JSONRpcPluginOptions(
    endpoint="${RPC_PROVIDER_URL}"  # Your Radius RPC endpoint
)
evm_plugin = jsonrpc(evm_options)

# Get latest block number on Radius
eth_response = await evm_plugin.call({
    "method": "eth_blockNumber",
    "params": [],
    "id": 1,
    "jsonrpc": "2.0"
})
```

## Features

- Protocol Support:
  - JSON-RPC 2.0 specification
  - WebSocket connections
  - Batch requests
  - Error handling
  
- Chain Compatibility:
  - Radius
  
- Advanced Features:
  - Async implementation
  - Request retries
  - Rate limiting
  - Response validation
  
- Integration Support:
  - Radius SDK integration
  - LangChain compatibility
  - Custom middleware support
  - Error event handling

## License

This project is licensed under the terms of the MIT license.
