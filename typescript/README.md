# Radius TypeScript AI Agent Toolkit

A TypeScript implementation for integrating [Radius](https://radiustech.xyz/) capabilities into AI agent workflows, providing a simple and type-safe way to incorporate Radius functionality into AI agents.

## Quick Links

- [Radius Docs](https://docs.radiustech.xyz/)
- [Testnet Access](https://docs.radiustech.xyz/radius-testnet-access)
- [GitHub Issues](https://github.com/radiustechsystems/ai-agent-toolkit/issues)

## Features

- Seamless integration with Radius
- Support for major AI agent frameworks:
  - Vercel AI SDK
- Wallet management and transaction capabilities
- Clean, idiomatic TypeScript implementation
- Type-safe contract interactions
- EVM compatibility

## Requirements

- Node.js >= 20.12.2 < 23
- pnpm >= 9

## Installation

```bash
pnpm add @radiustechsystems/ai-agent-toolkit
```

Or using npm:

```bash
npm install @radiustechsystems/ai-agent-toolkit
```

### Basic Usage

Here's a guide to spinning up an example that demonstrates how to integrate Radius tools into a Vercel AI SDK agent backed by calls to the OpenAI API:

### 1. Clone the Repository

```bash
git clone git@github.com:radiustechsystems/ai-agent-toolkit.git
cd ai-agent-toolkit
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Build the Packages

```bash
pnpm build
```

### 4. Navigate to the Vercel AI SDK Example

```bash
cd examples/vercel-ai/viem
```

### 5. Configure Environment Variables

Copy the `.env.template` file and populate it with your values:

```bash
cp .env.template .env
```

```bash
OPENAI_API_KEY=your_openai_api_key_here
WALLET_PRIVATE_KEY=your_wallet_private_key_here
RPC_PROVIDER_URL=your_rpc_provider_url_here
```

### 6. Run the example

```bash
# First install ts-node if you don't have it globally
npm install -g ts-node

# Run the example
npx ts-node index.ts
```

## Troubleshooting

If you encounter issues during setup or execution:

### Clean and Rebuild

```bash
pnpm clean:dist
pnpm clean:node_modules
pnpm install
pnpm build
```

### Verify Versions

Ensure your environment meets the requirements:

```bash
node --version  # Should be >=20.12.2 <23
pnpm --version  # Should be >=9
```

## Changelog

See the [CHANGELOG](CHANGELOG.md) for a list of changes.

## Contributing

Please see the [TypeScript Contributing Guide](CONTRIBUTING.md) for detailed information about contributing to this toolkit. For repository-wide guidelines and principles, see the [General Contributing Guide](../CONTRIBUTING.md).

## License

This project is licensed under the [MIT License](../LICENSE).
