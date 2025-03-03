/* eslint-disable max-len */
import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { createRadiusWallet, RadiusWalletInterface } from "@radiustechsystems/ai-agent-wallet";

// Constants for payment calculation
const PAYMENT_PER_TOKEN = 0.0001; // Very small ETH payment per token

// Agent roles and capabilities
const AGENT_ROLES = {
  CREATOR: "creator",
  EDITOR: "editor",
  FACT_CHECKER: "factChecker",
};

// Agent registry (in a production app, this would be stored in a database)
const AGENT_REGISTRY = [
  {
    id: "claude-creator",
    name: "Claude Creator",
    role: AGENT_ROLES.CREATOR,
    model: "claude-3-haiku-20240307",
    fee: 0.7, // 70% of payment
    walletAddress: process.env.CREATOR_AGENT_ADDRESS || "0x1234567890123456789012345678901234567890",
    systemPrompt: "You are a creative AI assistant that generates original content based on user prompts. Generate complete and well-structured content that addresses the user's request.",
  },
  {
    id: "claude-editor",
    name: "Claude Editor",
    role: AGENT_ROLES.EDITOR,
    model: "claude-3-haiku-20240307",
    fee: 0.2, // 20% of payment
    walletAddress: process.env.EDITOR_AGENT_ADDRESS || "0x2345678901234567890123456789012345678901",
    systemPrompt: `You are an expert editor in a multi-agent workflow. Your job is to improve content created by another agent. 
      Enhance clarity, coherence, flow, and style while preserving the original meaning. Return the complete edited 
      content in your response, not just feedback or changes. Your output will be passed to the next agent in the workflow.`,
  },
  {
    id: "claude-fact-checker",
    name: "Claude Fact Checker",
    role: AGENT_ROLES.FACT_CHECKER,
    model: "claude-3-haiku-20240307",
    fee: 0.1, // 10% of payment
    walletAddress: process.env.FACT_CHECKER_AGENT_ADDRESS || "0x3456789012345678901234567890123456789012",
    systemPrompt: `You are a fact-checking assistant in a multi-agent workflow. Your job is to verify 
      factual claims in content that has already been edited by another agent. Provide the complete 
      fact-checked content in your response, incorporating any necessary corrections. Your output 
      will be the final result shown to the user, so it must be complete and well-formatted.`,
  },
];

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { prompt, creatorAddress, workflowType = "full" } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }
    
    // Define workflow based on requested type
    const workflow = getWorkflow(workflowType);
    
    // Create Radius wallet for service payments
    const walletStartTime = Date.now();
    const serviceWallet = await createRadiusWallet({
      rpcUrl: process.env.NEXT_PUBLIC_RPC_PROVIDER_URL!,
      privateKey: process.env.WALLET_PRIVATE_KEY!
    });
    
    const walletInitTime = Date.now() - walletStartTime;
    
    // Execute the multi-agent workflow
    const { 
      finalContent, 
      agentOutputs,
      workflowMetrics,
      tokenCount 
    } = await executeWorkflow(workflow, prompt);
    
    // Process payments to all agents in the workflow
    const paymentStartTime = Date.now();
    const paymentAmount = tokenCount * PAYMENT_PER_TOKEN;
    const paymentTransactions = await processAgentPayments(
      serviceWallet, 
      workflow, 
      paymentAmount,
      creatorAddress
    );
    const paymentConfirmationTime = Date.now() - paymentStartTime;
    
    // Return results, including all agent contributions and payments
    return NextResponse.json({
      content: finalContent,
      tokenCount,
      agentContributions: agentOutputs,
      payments: paymentTransactions,
      metrics: {
        totalProcessingTime: Date.now() - startTime,
        contentGenerationTime: workflowMetrics.totalGenerationTime,
        walletInitTime,
        paymentConfirmationTime,
        agentCommunicationTime: workflowMetrics.communicationTime,
        agentCount: workflow.length
      }
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error processing request:", error);
    
    return NextResponse.json(
      { error: error.message || "An error occurred during processing" },
      { status: 500 }
    );
  }
}

// Helper functions

function getWorkflow(workflowType: string) {
  switch (workflowType) {
  case "creator-only":
    return AGENT_REGISTRY.filter(agent => agent.role === AGENT_ROLES.CREATOR);
  case "create-edit":
    return AGENT_REGISTRY.filter(agent => 
      agent.role === AGENT_ROLES.CREATOR || agent.role === AGENT_ROLES.EDITOR
    );
  case "full":
  default:
    return AGENT_REGISTRY;
  }
}

async function executeWorkflow(agents: typeof AGENT_REGISTRY, userPrompt: string) {
  const startTime = Date.now();
  const agentOutputs: Record<string, { content: string, processingTime: number }> = {};
  let currentContent = "";
  let communicationTime = 0;
  
  // Execute each agent in sequence, passing output from one to the next
  for (const agent of agents) {
    const agentStartTime = Date.now();
    
    // Create agent-specific prompt based on its role
    let agentPrompt = "";
    
    if (agent.role === AGENT_ROLES.CREATOR) {
      // First agent in the workflow gets the original user prompt
      agentPrompt = userPrompt;
    } else {
      // Other agents get the output from the previous agent + instructions based on their role
      const communicationStart = Date.now();
      agentPrompt = createAgentPrompt(agent.role, currentContent, userPrompt);
      communicationTime += Date.now() - communicationStart;
    }
    
    // Generate content using this agent
    const result = await generateText({
      model: anthropic(agent.model),
      prompt: agentPrompt,
      system: agent.systemPrompt,
    });
    
    // Store this agent's output
    agentOutputs[agent.id] = {
      content: result.text,
      processingTime: Date.now() - agentStartTime
    };
    
    // Update current content for next agent in the chain
    currentContent = result.text;
  }
  
  // For the demo purpose, we'll add a summary of the workflow if using multiple agents
  const finalContent = currentContent;
  
  // If we're using multiple agents, let's build a better view of the final content
  if (agents.length > 1) {
    // Now we'll add structured access to see all versions through the workflow
    // const factCheckerAgent = agents.find(a => a.role === AGENT_ROLES.FACT_CHECKER);
    // const editorAgent = agents.find(a => a.role === AGENT_ROLES.EDITOR);
    // const creatorAgent = agents.find(a => a.role === AGENT_ROLES.CREATOR);
    
    // The lastAgent (either fact-checker, editor, or creator) has already set the currentContent
    // So there's no need to change finalContent - it's already the output of the last agent in the chain
  }
  
  // Calculate total tokens in final content
  const tokenCount = finalContent.split(/\\s+/).length;
  
  return {
    finalContent,
    agentOutputs,
    tokenCount,
    workflowMetrics: {
      totalGenerationTime: Date.now() - startTime - communicationTime,
      communicationTime,
    }
  };
}

function createAgentPrompt(role: string, previousContent: string, originalPrompt: string) {
  switch (role) {
  case AGENT_ROLES.EDITOR:
    return `Below is content created by another AI. Edit it to improve clarity, 
      flow, and style while preserving the original meaning. 
      Return the COMPLETE edited content in your response.
      
      Original user prompt: ${originalPrompt}

      Content to edit:
      ${previousContent}`;

  case AGENT_ROLES.FACT_CHECKER:
    return `Below is content that needs fact-checking. Verify any factual claims 
    and provide corrections if needed. If no corrections are needed, return the 
    original content unchanged. Return the COMPLETE final fact-checked content.
    
    Original user prompt: ${originalPrompt}

    Content to fact-check:
    ${previousContent}`;

  default:
    return previousContent;
  }
}

async function processAgentPayments(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceWallet: RadiusWalletInterface,
  agents: typeof AGENT_REGISTRY,
  totalAmount: number,
  userSpecifiedAddress?: string
) {
  const transactions = [];
  
  // If a specific address was provided by the user, override the creator agent's address
  const workflowAgents = [...agents];
  if (userSpecifiedAddress && workflowAgents.find(a => a.role === AGENT_ROLES.CREATOR)) {
    const creatorIndex = workflowAgents.findIndex(a => a.role === AGENT_ROLES.CREATOR);
    workflowAgents[creatorIndex] = {
      ...workflowAgents[creatorIndex],
      walletAddress: userSpecifiedAddress
    };
  }
  
  // Process payments to each agent based on their fee percentage
  for (const agent of workflowAgents) {
    // Calculate payment amount for this agent
    const agentPayment = totalAmount * agent.fee;

    const tx = await serviceWallet.sendTransaction({
      to: agent.walletAddress,
      value: BigInt(Math.floor(agentPayment * 1e18)),
    })
    
    // Record simulated transaction
    transactions.push({
      agent: agent.id,
      role: agent.role,
      amount: agentPayment,
      token: "ETH",
      to: agent.walletAddress,
      transactionHash: tx.hash
    });
  }
  
  return transactions;
}
