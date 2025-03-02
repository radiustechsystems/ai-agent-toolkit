# Radius AI Agent SDK - LangChain Web3 Example

Example implementation of a LangChain agent interacting with Web3.py using the Radius AI Agent SDK.

## Installation

```bash
pip install radius-ai-agent-sdk-example-langchain-web3
```

## Prerequisites

- Python >=3.10
- langchain >=0.3.2
- langchain-openai >=0.2.14
- python-dotenv >=1.0.1
- web3 >=6.20.3
- radius-ai-agent-sdk >=0.1.0
- radius-ai-agent-sdk-wallet-evm >=0.1.0
- radius-ai-agent-sdk-wallet-web3 >=0.1.0
- radius-ai-agent-sdk-plugin-erc20 >=0.1.0
- radius-ai-agent-sdk-adapter-langchain >=0.1.0

## Features

- Complete example of LangChain integration
- Web3.py interaction examples
- EVM wallet integration
- Smart contract interactions
- Transaction handling
- Environment configuration
- Async operation examples

## Development Setup

### 1. Clone the Repository

```bash
git clone git@github.com:radiustechsystems/ai-agent-toolkit.git
cd ai-agent-toolkit/python/examples/langchain/web3
```

### 2. Install Development Dependencies

```bash
pip install -e ".[dev]"
```

### 3. Configure Environment

```bash
cp .env.template .env
# Edit .env with your configuration
```

### 4. Run the Example

```bash
python example.py
```

## Testing

Run tests with pytest:

```bash
pytest
```

## Documentation

For detailed documentation:

- [API Documentation](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/python/examples/langchain/web3/README.md)
- [Examples](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/examples)
- [Changelog](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/python/CHANGELOG.md)

## Support

For issues and feature requests, please use our [issue tracker](https://github.com/radiustechsystems/ai-agent-toolkit/issues).

## License

This project is licensed under the MIT License.
