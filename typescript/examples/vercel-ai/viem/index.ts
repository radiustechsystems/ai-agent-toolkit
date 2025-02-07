import readline from "node:readline";
import { openai } from "@ai-sdk/openai";
import { generateText, LanguageModelV1 } from "ai";
import { getOnChainTools } from "@radiustechsystems/ai-agent-adapter-vercel-ai";
import { createRadiusViemWallet } from "@radiustechsystems/ai-agent-wallet-viem";
import * as dotenv from "dotenv";

dotenv.config();

// Create a Radius Viem wallet using our helper
const wallet = createRadiusViemWallet({
  rpcUrl: process.env.RPC_PROVIDER_URL!,
  privateKey: process.env.WALLET_PRIVATE_KEY!
});

(async () => {
  const tools = await getOnChainTools({
    wallet: wallet
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
