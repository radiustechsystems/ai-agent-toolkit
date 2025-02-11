import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mode } from "viem/chains";

import { getOnChainTools } from "@radiustechsystems/ai-agent-adapter-model-context-protocol";
import { viem } from "@radiustechsystems/ai-agent-wallet-viem";

const server = new Server(
  {
    name: "goat",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
  account: account,
  transport: http(process.env.RPC_PROVIDER_URL),
  chain: mode,
});

// Initialize tools once
const toolsPromise = getOnChainTools({
  wallet: viem(walletClient)
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const { listOfTools } = await toolsPromise;
  return {
    tools: listOfTools(),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request: typeof CallToolRequestSchema._type) => {
  const { toolHandler } = await toolsPromise;
  try {
    return toolHandler(request.params.name, request.params.arguments);
  } catch (error) {
    throw new Error(`Tool ${name} failed: ${error}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GOAT MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
