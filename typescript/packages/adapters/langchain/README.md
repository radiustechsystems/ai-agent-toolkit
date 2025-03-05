# Radius AI Agent Toolkit - LangChain Adapter

This adapter provides integration between the Radius AI Agent Toolkit and LangChain, allowing you to easily add Radius capabilities to AI agents built with LangChain.

This package is part of the [Radius AI Agent Toolkit](https://github.com/radiustechsystems/ai-agent-toolkit), which provides tools for integrating AI agents with the Radius platform.

## Installation

```bash
# Install this specific package
npm install @radiustechsystems/ai-agent-adapter-langchain

# Required peer dependencies
npm install @radiustechsystems/ai-agent-core
npm install @langchain/core
```

## Prerequisites

- Node.js >=20.12.2 <23
- LangChain installed in your project
- Radius wallet setup with a funded account

## Usage

```typescript
import { getOnChainTools } from "@radiustechsystems/ai-agent-adapter-langchain";
import { createRadiusWallet, sendETH } from "@radiustechsystems/ai-agent-wallet";
import { erc20, USDC } from "@radiustechsystems/ai-agent-plugin-erc20";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { createToolAgentExecutor } from "langchain/agents/tool";

// 1. Create a Radius wallet
const wallet = await createRadiusWallet({
  rpcUrl: process.env.RPC_PROVIDER_URL,
  privateKey: process.env.WALLET_PRIVATE_KEY
});

// 2. Configure the tools for LangChain
const tools = await getOnChainTools({
  wallet,
  plugins: [
    sendETH(), // Enable ETH transfers
    erc20({ tokens: [USDC] }) // Enable ERC20 token operations
  ]
});

// 3. Create a LangChain agent with the tools
const llm = new ChatOpenAI({ temperature: 0 });
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful AI assistant with blockchain capabilities."],
  ["human", "{input}"]
]);

const executor = await createToolAgentExecutor({
  llm,
  tools,
  prompt
});

// 4. Execute the agent with a query
const result = await executor.invoke({
  input: "Send 0.01 ETH to 0x1234..."
});

console.log(result.output);
```

## API Reference

### `getOnChainTools(options)`

Creates a collection of tools compatible with LangChain that provides access to configured Radius features.

**Parameters:**

- `options.wallet` (WalletClientBase): A Radius wallet instance
- `options.plugins` (Array): Array of plugin instances to enable

**Returns:**

- (Array): An array of LangChain-compatible tools that can be used with LangChain agents

**Example:**

```typescript
const tools = await getOnChainTools({
  wallet,
  plugins: [
    sendETH(),
    erc20({ tokens: [USDC] })
  ]
});
```

## Integration Examples

For complete examples integrating this adapter with LangChain, see:

- [Vercel AI Micropayments Example](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/examples/micropayments/vercel-ai) (Similar concept, but with Vercel AI SDK)

## Related Packages

- [@radiustechsystems/ai-agent-core](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/core): Core abstractions and base classes
- [@radiustechsystems/ai-agent-wallet](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/wallets): Wallet functionality
- [@radiustechsystems/ai-agent-plugin-erc20](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/plugins/erc20): ERC20 token operations
- [@radiustechsystems/ai-agent-adapter-vercel-ai](https://github.com/radiustechsystems/ai-agent-toolkit/tree/main/typescript/packages/adapters/vercel-ai): Vercel AI adapter

## Resources

- [Website](https://radiustech.xyz/)
- [Testnet Access](https://docs.radiustech.xyz/radius-testnet-access)
- [GitHub Issues](https://github.com/radiustechsystems/ai-agent-toolkit/issues)
- [Changelog](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CHANGELOG.md)

## Contributing

Please see the [Contributing Guide](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/CONTRIBUTING.md) for detailed information about contributing to this toolkit.

## License

This project is licensed under the [MIT License](https://github.com/radiustechsystems/ai-agent-toolkit/blob/main/LICENSE).
