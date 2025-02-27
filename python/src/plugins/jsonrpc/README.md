# Radius AI Agent SDK - JSON-RPC Plugin

JSON-RPC plugin for making remote procedure calls through the Radius AI Agent SDK.

## Installation

```bash
pip install radius-ai-agent-sdk-plugin-jsonrpc
```

## Prerequisites

- Python >=3.10
- radius-ai-agent-sdk >=0.1.0
- aiohttp >=3.8.6

## Features

- Asynchronous JSON-RPC calls
- HTTP/HTTPS transport support
- Batch request handling
- Error handling and response parsing
- Type-safe implementations
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

### 3. Build the Package

```bash
pip install build
python -m build
```

## Testing

Run tests with pytest:

```bash
pytest
```

## Documentation

For detailed documentation:

- [API Documentation](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/python/src/plugins/jsonrpc/README.md)
- [Examples](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/examples)
- [Changelog](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/python/CHANGELOG.md)

## Support

For issues and feature requests, please use our [issue tracker](https://github.com/radiustechsystems/ai-agent-toolkit/issues).

## License

This project is licensed under the MIT License.
