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
- LangChain installed in your project:
  - `npm install @langchain/core @langchain/openai langchain`
- OpenAI API key or other LLM provider credentials
- Radius wallet setup with a funded account

## Usage

```typescript
import { getOnChainTools } from "@radiustechsystems/ai-agent-adapter-langchain";
import { createRadiusWallet, sendETH } from "@radiustechsystems/ai-agent-wallet";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// 1. Create a Radius wallet (always validate your environment variables)
const rpcUrl = process.env.RPC_PROVIDER_URL;
const privateKey = process.env.WALLET_PRIVATE_KEY;

if (!rpcUrl || !privateKey) {
  console.warn("WARNING: Missing required environment variables");
  console.warn("RPC_PROVIDER_URL and WALLET_PRIVATE_KEY must be set");
}

const wallet = await createRadiusWallet({
  rpcUrl,
  privateKey
});

// Retrieve the wallet address
const address = await wallet.getAddress();
console.log(`Wallet address: ${address}`);

// 2. Configure the tools for LangChain
const tools = await getOnChainTools({
  wallet,
  plugins: [
    sendETH(), // Enable ETH transfers
  ]
});

console.log(`Configured ${tools.length} tools for LangChain`);
tools.forEach(tool => {
  console.log(` - ${tool.name}: ${tool.description}`);
});

// 3. Create a LangChain agent with the tools
const llm = new ChatOpenAI({ temperature: 0 });
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful AI assistant with blockchain capabilities."],
  ["human", "{input}"]
]);

// Verify we have the components for creating a LangChain agent
if (
  llm && typeof llm.invoke === 'function' &&
  tools && Array.isArray(tools) && tools.length > 0 &&
  prompt && typeof prompt.format === 'function'
) {
  console.log("All components for creating a LangChain agent are valid");
  
  // For production use, you would create an agent executor like this:
  // const executor = await createToolAgentExecutor({
  //   llm,
  //   tools,
  //   prompt
  // });
  //
  // const result = await executor.invoke({
  //   input: "Send 0.01 ETH to 0x1234..."
  // });
  //
  // console.log(result.output);
}
```

If you want to include ERC20 token support, you would add:

```typescript
import { erc20, USDC } from "@radiustechsystems/ai-agent-plugin-erc20";

// Then in the plugins array:
const tools = await getOnChainTools({
  wallet,
  plugins: [
    sendETH(), 
    erc20({ tokens: [USDC] }) // Add ERC20 token support
  ]
});
```

## API Reference

### `getOnChainTools(options)`

Creates a collection of tools compatible with LangChain that provides access to configured Radius features.

**Parameters:**

- `options.wallet` (WalletClientBase): A Radius wallet instance
- `options.plugins` (Array): Array of plugin instances to enable

**Returns:**

- (Array): An array of LangChain-compatible tools that can be used with LangChain agents

**Default Tools:**

The `getOnChainTools` function automatically provides the following wallet-related tools:

- `get_address`: Get the address of the wallet
- `get_chain`: Get the chain of the wallet
- `get_balance`: Get the balance of an address
- `sign_message`: Sign a message with the wallet
- `simulate_transaction`: Simulate a transaction to check if it would succeed
- `resolve_address`: Resolve an ENS name to an address
- `get_transaction_status`: Check the status of a transaction

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

## Troubleshooting

### Error: Missing LangChain Dependencies

If you encounter errors related to missing LangChain dependencies, ensure you have installed all required packages:

```bash
npm install @langchain/core @langchain/openai langchain
```

### Error: Cannot Create Agent Executor

The LangChain agent creation API may change between versions. If you encounter errors creating the agent executor:

1. Check your LangChain version and ensure compatibility
2. Verify that your tools have the expected structure (name, description, and call method)
3. Check the [LangChain documentation](https://js.langchain.com/docs/modules/agents/) for the latest API patterns

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
