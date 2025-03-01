# AI Agent Toolkit for Radius - Uniswap Plugin (TypeScript)

Uniswap plugin for AI Agent Toolkit for Radius. Allows you to create tools for interacting with Uniswap.

## Configuration

Required environment variables:

- `UNISWAP_API_KEY`: Your Uniswap API key
  - Get it from: <https://hub.uniswap.org/>
  - Format: 32-character string
  - Required for: Accessing Uniswap's API for quotes and swaps
- `UNISWAP_BASE_URL`: Uniswap API base URL
  - Format: Full URL with protocol and version
  - Default: <https://api.uniswap.org/v1>

## Installation

```bash
npm install @radiustechsystems/ai-agent-plugin-uniswap
```

## Usage

```typescript
import { uniswap } from "@radiustechsystems/ai-agent-plugin-uniswap"


const plugin = uniswap({
  baseUrl: process.env.UNISWAP_BASE_URL as string,
  apiKey: process.env.UNISWAP_API_KEY as string
})
```
