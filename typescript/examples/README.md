# AI Agent Toolkit for Radius - Examples (TypeScript)

## Environment Setup
Each example project requires specific environment variables to run. Copy the `.env.template` file in each project directory to `.env` and fill in the values:

### Common Variables
- `OPENAI_API_KEY`: Required for AI model interaction
  - Get from: https://platform.openai.com/api-keys
  - Format: "sk-" followed by random characters

- `RPC_PROVIDER_URL`: Radius-specific RPC endpoint
  - Testnet RPC Provider URLs can be [found/generated here](https://testnet.tryradi.us/dashboard/rpc-endpoints).

- `WALLET_PRIVATE_KEY`: Your wallet's private key
  - ⚠️ Never share or commit your private key
  - Fomrat: EVM: 64-character hex with '0x' prefix

### Project-Specific Variables
Each example project may require additional environment variables specific to the protocols or services it interacts with. See each project's README and `.env.template` for details.

### Security Best Practices
1. Never commit `.env` files to version control
2. Use `.env.template` files to document required variables without values
3. Store sensitive values securely using environment variables or secrets management

## Langchain

- [Viem](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/typescript/examples/langchain)

## Model Context Protocol

- [Viem](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/typescript/examples/model-context-protocol)

## Vercel AI SDK

- [Viem](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/typescript/examples/vercel-ai/viem)
