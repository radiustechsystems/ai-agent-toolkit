/**
 * Radius AI Agent Toolkit - Main Entry Point
 * 
 * This is the main entry point for the Radius AI Agent Toolkit.
 * It re-exports all the components from the various packages.
 */

// Export everything with namespaces to avoid conflicts
import * as Core from "@radiustechsystems/ai-agent-core";
import * as Wallet from "@radiustechsystems/ai-agent-wallet";
import * as VercelAI from "@radiustechsystems/ai-agent-adapter-vercel-ai";
import * as LangChain from "@radiustechsystems/ai-agent-adapter-langchain";
import * as ModelContextProtocol from "@radiustechsystems/ai-agent-adapter-model-context-protocol";
import * as Contracts from "@radiustechsystems/ai-agent-plugin-contracts";
import * as Crypto from "@radiustechsystems/ai-agent-plugin-crypto";
import * as ERC20 from "@radiustechsystems/ai-agent-plugin-erc20";
import * as Uniswap from "@radiustechsystems/ai-agent-plugin-uniswap";

export {
  Core,
  Wallet,
  VercelAI,
  LangChain,
  ModelContextProtocol,
  Contracts,
  Crypto,
  ERC20,
  Uniswap
};
