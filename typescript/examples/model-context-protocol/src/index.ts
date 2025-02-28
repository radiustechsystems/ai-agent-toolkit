import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import * as dotenv from "dotenv";

import { getOnChainTools } from "@radiustechsystems/ai-agent-adapter-model-context-protocol";
import { createRadiusSDKWallet, sendETH } from "@radiustechsystems/ai-agent-wallet-evm";
import { erc20, USDC } from "@radiustechsystems/ai-agent-plugin-erc20";

dotenv.config();

const server = new Server(
  {
    name: "radius",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Create a Radius SDK wallet using our helper
const wallet = await createRadiusSDKWallet({
  rpcUrl: process.env.RPC_PROVIDER_URL!,
  privateKey: process.env.WALLET_PRIVATE_KEY!
});

// Initialize tools once
const toolsPromise = getOnChainTools({
  wallet,
  plugins: [sendETH(), erc20({ tokens: [USDC] })],
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
  console.error("RADIUS MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
