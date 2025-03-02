# Radius AI Agent Toolkit (Python)

Python implementation of the AI Agent Toolkit for Radius integration.

## Installation

```bash
pip install radius-ai-agent-sdk
```

## Getting Started

This guide will help you set up and run the AI Agent Toolkit project.

## Prerequisites

- Python >=3.10
- pip (for installation)
- git

## Development Setup

### 1. Clone the Repository

```bash
git clone git@github.com:radiustechsystems/ai-agent-toolkit.git
cd ai-agent-toolkit/python
```

### 2. Install Dependencies

```bash
pip install -e .
```

### 3. Build the Package

```bash
pip install build
python -m build
```

### 4. Configure Environment Variables

```bash
cd examples/langchain/web3
cp .env.template .env
```

Open `.env` and set the following variables:

- OPENAI_API_KEY=your_openai_api_key_here
- WALLET_PRIVATE_KEY=your_wallet_private_key_here
- RPC_PROVIDER_URL=your_rpc_provider_url_here

Note:

- Get an OpenAI API key from: <https://platform.openai.com/api-keys>
- The wallet private key should be from an EVM-compatible wallet
- RPC provider URL from Radius testnet: <https://testnet.tryradi.us/dashboard/rpc-endpoints>

### 5. Run the Example

```bash
python examples/langchain/web3/main.py
```

## Troubleshooting

If you encounter any issues:

### Clean and Rebuild

```bash
# Remove build artifacts
rm -rf dist/
rm -rf *.egg-info/

# Fresh install
pip install -e .
```

### Verify Python Version

```bash
python --version  # Should be >=3.10
```

## Additional Notes

- The project uses a monorepo structure
- Built with setuptools
- Examples include LangChain integration
- Compatible with Python 3.10, 3.11, and 3.12
- Make sure all environment variables are properly set before running examples

## Documentation

For detailed documentation:

- [API Documentation](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/python/src/radius_ai_agent_sdk/README.md)
- [Examples](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/python/examples)
- [Changelog](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/python/CHANGELOG.md)

## Support

For issues and feature requests, please use our [issue tracker](https://github.com/radiustechsystems/ai-agent-toolkit/issues).

## License

This project is licensed under the MIT License.
