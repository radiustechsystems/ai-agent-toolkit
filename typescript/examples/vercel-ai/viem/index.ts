import readline from "node:readline";
import { openai } from "@ai-sdk/openai";
import { generateText, LanguageModelV1 } from "ai";
import { getOnChainTools } from "@radiustechsystems/ai-agent-adapter-vercel-ai";
import { createRadiusWallet, sendETH } from "@radiustechsystems/ai-agent-wallet";
import * as dotenv from "dotenv";
import { erc20, USDC } from "@radiustechsystems/ai-agent-plugin-erc20";
import { uniswap } from "@radiustechsystems/ai-agent-plugin-uniswap";

dotenv.config();

(async () => {
  // Create a Radius wallet using our helper
  const wallet = await createRadiusWallet({
    rpcUrl: process.env.RPC_PROVIDER_URL!,
    privateKey: process.env.WALLET_PRIVATE_KEY!
  });

  const tools = await getOnChainTools({
    wallet,
    plugins: [
      sendETH(), // Enable ETH transfers
      erc20({ tokens: [USDC] }), // Enable ERC20 token operations
      uniswap({
        baseUrl: process.env.UNISWAP_BASE_URL as string,
        apiKey: process.env.UNISWAP_API_KEY as string,
      }), // Enable Uniswap trading
    ]
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const prompt = await new Promise<string>((resolve) => {
      rl.question("Enter your prompt (or \"exit\" to quit): ", resolve);
    });

    if (prompt === "exit") {
      rl.close();
      break;
    }

    try {
      const result = await generateText({
        model: openai("gpt-4o-mini") as LanguageModelV1,
        tools: tools,
        maxSteps: 10, // Maximum number of tool invocations per request
        prompt: prompt,
        onStepFinish: (event) => {
          console.log(event.toolResults);
        },
      });
      console.log(result.text);
    } catch (error) {
      console.error(error);
    }
  }
})();
