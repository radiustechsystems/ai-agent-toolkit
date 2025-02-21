# Radius AI Agent SDK - Uniswap Plugin

Plugin for interacting with Uniswap protocols through the Radius AI Agent SDK.

## Installation

```bash
pip install radius-ai-agent-sdk-plugin-uniswap
```

## Prerequisites

- Python >=3.10
- radius-ai-agent-sdk >=0.1.0
- radius-ai-agent-sdk-wallet-evm >=0.1.0
- radius-ai-agent-sdk-wallet-web3 >=0.1.0
- radius-ai-agent-sdk-plugin-erc20 >=0.1.0
- aiohttp >=3.0

## Features

- Uniswap protocol integration
- Token swaps and liquidity operations
- Price quotes and routing
- Pool interactions
- Position management
- Async support for concurrent operations
- Type-safe implementations

## Development Setup

### 1. Clone the Repository
```bash
git clone git@github.com:radiustechsystems/ai-agent-toolkit.git
cd ai-agent-toolkit/python/src/plugins/uniswap
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
- [API Documentation](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/python/src/plugins/uniswap/README.md)
- [Examples](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/examples)
- [Changelog](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/python/CHANGELOG.md)

## Support

For issues and feature requests, please use our [issue tracker](https://github.com/radiustechsystems/ai-agent-toolkit/issues).

## License

This project is licensed under the MIT License.
