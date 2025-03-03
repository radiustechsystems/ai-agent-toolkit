# Radius TypeScript AI Agent Toolkit

A TypeScript implementation for integrating [Radius](https://radiustech.xyz/) capabilities into AI agent workflows, providing a simple and type-safe way to incorporate Radius functionality into AI agents.

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

## Quick Links

- [Radius Docs](https://docs.radiustech.xyz/)
- [Testnet Access](https://docs.radiustech.xyz/radius-testnet-access)
- [GitHub Issues](https://github.com/radiustechsystems/ai-agent-toolkit/issues)

### Basic Usage

Here's a guide to spinning up an example that demonstrates multi-agent micropayments on Radius using the Vercel AI SDK:

### 1. Clone the Repository

```bash
git clone git@github.com:radiustechsystems/ai-agent-toolkit.git
cd ai-agent-toolkit/typescript
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
cd examples/micropayments/vercel-ai
```

### 5. Configure Environment Variables

Copy the `.env.example` file and populate it with your values:

```bash
cp .env.example .env.local
```

```bash
# AI API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key_here  # Required for Claude AI models

# Radius Configuration
NEXT_PUBLIC_RPC_PROVIDER_URL=your_radius_testnet_rpc_url_here  # Radius testnet RPC URL
WALLET_PRIVATE_KEY=your_service_wallet_private_key_here        # Private key for service wallet that sends base payments (must be funded)

# Agent Wallet Addresses (for RECEIVING payments)
NEXT_PUBLIC_CREATOR_ADDRESS=0x1234...          # Default creator address shown in UI form (can be overridden by user)
CREATOR_AGENT_ADDRESS=0x1234...                # Address for the Creator agent (receives 40% of payment)
EDITOR_AGENT_ADDRESS=0x2345...                 # Address for the Editor agent (receives 15% of payment)
FACT_CHECKER_AGENT_ADDRESS=0x3456...           # Address for the Fact-Checker agent (receives 10% of payment)
RESEARCHER_AGENT_ADDRESS=0x4567...             # Address for the Researcher agent (receives 15% of payment)
REVIEWER_AGENT_ADDRESS=0x5678...               # Address for the Reviewer agent (receives 10% of payment)
TRANSLATOR_AGENT_ADDRESS=0x6789...             # Address for the Translator agent (receives 10% of payment)

# Agent Wallet Private Keys (for SENDING agent-to-agent payments)
# IMPORTANT: Each agent that can pay others needs its own private key
CREATOR_AGENT_PRIVATE_KEY=your_creator_private_key_here        # Creator agent wallet private key (for paying researcher/editor)
EDITOR_AGENT_PRIVATE_KEY=your_editor_private_key_here          # Editor agent wallet private key (for paying reviewer)
FACT_CHECKER_AGENT_PRIVATE_KEY=your_fact_checker_private_key_here  # Fact-checker agent wallet private key
RESEARCHER_AGENT_PRIVATE_KEY=your_researcher_private_key_here  # Researcher agent wallet private key
REVIEWER_AGENT_PRIVATE_KEY=your_reviewer_private_key_here      # Reviewer agent wallet private key
TRANSLATOR_AGENT_PRIVATE_KEY=your_translator_private_key_here  # Translator agent wallet private key
```

### 6. Run the example

```bash
# Run the example
pnpm dev
```

## Troubleshooting

If you encounter issues during setup or execution:

### Verify Versions

Ensure your environment meets the requirements:

```bash
node --version  # Should be >=20.12.2 <23
pnpm --version  # Should be >=9
```

## Resources

- [Website](https://radiustech.xyz/)
- [Testnet Access](https://docs.radiustech.xyz/radius-testnet-access)
- [GitHub Issues](https://github.com/radiustechsystems/ai-agent-toolkit/issues)
- [Changelog](CHANGELOG.md)

## Contributing

Please see the [TypeScript Contributing Guide](CONTRIBUTING.md) for detailed information about contributing to this toolkit. For repository-wide guidelines and principles, see the [General Contributing Guide](../CONTRIBUTING.md).

## License

This project is licensed under the [MIT License](../LICENSE).
