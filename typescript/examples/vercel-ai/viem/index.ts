import readline from "node:readline";

import { openai } from "@ai-sdk/openai";
import { generateText, LanguageModelV1 } from "ai";

import { http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

import { getOnChainTools } from "@radiustechsystems/adapter-vercel-ai";

import { viem } from "@radiustechsystems/wallet-viem";
import * as dotenv from "dotenv";

dotenv.config();

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
  account: account,
  transport: http(process.env.RPC_PROVIDER_URL),
  chain: base,
});

(async () => {
  const tools = await getOnChainTools({
    wallet: viem(walletClient)
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

    console.log("\n-------------------\n");
    console.log("TOOLS CALLED");
    console.log("\n-------------------\n");

    console.log("\n-------------------\n");
    console.log("RESPONSE");
    console.log("\n-------------------\n");
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
    console.log("\n-------------------\n");
  }
})();
