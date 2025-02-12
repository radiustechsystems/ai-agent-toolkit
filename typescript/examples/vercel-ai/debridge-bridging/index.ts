import { randomUUID } from "node:crypto";
import readline from "node:readline";
import { openai } from "@ai-sdk/openai";
import { getOnChainTools } from "@radiustechsystems/ai-agent-adapter-vercel-ai";
import { debridge } from "@radiustechsystems/ai-agent-plugin-debridge";
import { createRadiusViemWallet } from "@radiustechsystems/ai-agent-wallet-viem";
import { Message, generateText, type LanguageModelV1 } from "ai";
import * as dotenv from "dotenv";

dotenv.config();

// Create a Radius Viem wallet using our helper
const wallet = createRadiusViemWallet({
  rpcUrl: process.env.RPC_PROVIDER_URL!,
  privateKey: process.env.WALLET_PRIVATE_KEY!
});

(async () => {
  // Initialize tools with debridge plugin
  const tools = await getOnChainTools({
    wallet,
    plugins: [
      debridge(),
      // coingecko({ apiKey: process.env.COINGECKO_API_KEY as string })
    ],
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Initialize the AI model once
  const model = openai("gpt-4o", {}) as LanguageModelV1;
  const messages: Message[] = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const prompt = await new Promise<string>((resolve) => {
      rl.question("Enter your prompt (or \"exit\" to quit): ", resolve);
    });

    if (prompt === "exit") {
      rl.close();
      break;
    }

    console.log("\n-------------------\n");
    console.log("TOOLS CALLED");
    console.log("\n-------------------\n");

    console.log("\n-------------------\n");
    console.log("RESPONSE");
    console.log("\n-------------------\n");

    try {
      // Add the system message only if this is the first message
      if (messages.length === 0) {
        messages.push({
          id: randomUUID(),
          role: "system",
          content: `You are a DeFi assistant helping users bridge tokens between chains using DeBridge.
When handling token addresses:
- For native ETH, always use 0x0000000000000000000000000000000000000000 as the token address
- Chain IDs: Ethereum = "1", Solana = "7565164"
- Always format amounts in token decimals (e.g., for ETH, multiply by 1e18)
- Always ask for confirmation before proceeding with a transaction
- When bridging to Solana, ask for the recipient's Solana address`,
        });
      }

      // Add the user's message
      messages.push({
        id: randomUUID(),
        role: "user",
        content: prompt,
      });

      const result = await generateText({
        model,
        tools,
        maxSteps: 10, // Increase max steps
        messages,
        maxTokens: 4096,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onStepFinish: (event: { toolResults: any; }) => {
          if (event.toolResults) {
            console.log(JSON.stringify(event.toolResults, null, 2));
          }
        },
      });

      // Add the assistant's response to the conversation
      messages.push({
        id: randomUUID(),
        role: "assistant",
        content: result.text,
      });

      console.log(result.text);
    } catch (error) {
      console.error(error);
    }
    console.log("\n-------------------\n");
  }
})();
