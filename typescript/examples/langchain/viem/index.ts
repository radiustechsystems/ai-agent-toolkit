import type { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createStructuredChatAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import * as dotenv from "dotenv";

import { getOnChainTools } from "@radiustechsystems/ai-agent-adapter-langchain";
import { USDC, erc20 } from "@radiustechsystems/ai-agent-plugin-erc20";
import { createRadiusWallet, sendETH } from "@radiustechsystems/ai-agent-wallet-evm";

dotenv.config();

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
});

(async (): Promise<void> => {
  // Create a Radius wallet using our helper
  const wallet = await createRadiusWallet({
    rpcUrl: process.env.RPC_PROVIDER_URL!,
    privateKey: process.env.WALLET_PRIVATE_KEY!
  });

  const prompt = await pull<ChatPromptTemplate>("hwchase17/structured-chat-agent");

  const tools = await getOnChainTools({
    wallet,
    plugins: [sendETH(), erc20({ tokens: [USDC] })]
  });

  const agent = await createStructuredChatAgent({
    llm,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
  });

  const response = await agentExecutor.invoke({
    input: "Get my balance in ETH",
  });

  console.log(response);
})();
