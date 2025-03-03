# AI-Driven Micropayments Platform with Radius

This example demonstrates a real-time AI content generation platform with instant micropayments on Radius. It showcases Radius's unique capabilities for high-throughput, near-zero transaction fees, and instant finality - perfect for AI payment interactions.

## Key Features

- **Real-time AI content generation** using Anthropic's Claude models and Vercel AI SDK
- **Instant micropayments** directly to content creators
- **Visual transaction processing** with beautiful D3.js animations
- **Performance metrics** highlighting Radius's speed
- **Near-zero transaction fees** perfect for micropayment business models

## Getting Started

### Prerequisites

1. Node.js (v18+) and pnpm installed
2. A Radius wallet with some ETH (obtain from the [Radius faucet](https://testnet.tryradi.us/dashboard/faucet))
3. Anthropic API key for Claude models

### Setup

1. Copy the `.env.example` file to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Architecture

This Next.js application demonstrates:

- **Server Components**: For handling Radius interactions
- **Client Components**: For UI visualization and interactivity
- **API Routes**: For content generation and payment processing
- **D3.js Visualizations**: For beautiful transaction animations

## Business Model Possibilities

This example shows how Radius enables new business models for AI:

- **Pay-per-token**: Micropayments based on AI content length
- **Ultra-low fees**: Transactions costing fractions of a cent
- **Instant settlements**: No waiting for confirmations
- **High throughput**: Supporting massive scale

## Learn More

- [Radius Documentation](https://docs.tryradi.us)
- [AI Agent Toolkit](https://github.com/radiustechsystems/ai-agent-toolkit)
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
