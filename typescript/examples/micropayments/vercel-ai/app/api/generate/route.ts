import { anthropic } from '@ai-sdk/anthropic';
import { getTools } from '@radiustechsystems/ai-agent-core';
import { type RadiusWalletInterface, createRadiusWallet } from '@radiustechsystems/ai-agent-wallet';
import { sendETH } from '@radiustechsystems/ai-agent-wallet';
import { generateText } from 'ai';
import { type NextRequest, NextResponse } from 'next/server';

// Constants for payment calculation
const PAYMENT_PER_TOKEN = 0.0001; // Very small ETH payment per token

// Agent roles and capabilities
const AGENT_ROLES = {
  CREATOR: 'creator',
  EDITOR: 'editor',
  FACT_CHECKER: 'factChecker',
  RESEARCHER: 'researcher',
  TRANSLATOR: 'translator',
  REVIEWER: 'reviewer',
};

// Define the service types for strong typing
type ServiceType =
  | 'research'
  | 'editing'
  | 'review'
  | 'fact-checking'
  | 'translation'
  | 'content-creation';

// Agent registry (in a production app, this would be stored in a database)
const AGENT_REGISTRY = [
  {
    id: 'claude-creator',
    name: 'Claude Creator',
    role: AGENT_ROLES.CREATOR,
    model: 'claude-3-haiku-20240307',
    fee: 0.4, // 40% of user payment
    walletAddress:
      process.env.CREATOR_AGENT_ADDRESS || '0x1234567890123456789012345678901234567890',
    privateKey: process.env.CREATOR_AGENT_PRIVATE_KEY,
    systemPrompt:
      "You are a creative AI assistant that generates original content based on user prompts. Generate complete and well-structured content that addresses the user's request.",
    canPayOthers: true,
    acceptsPayments: true,
    serviceRates: {
      'content-creation': 0.00005, // per token
    },
    servicesNeeded: ['research', 'editing'] as ServiceType[],
  },
  {
    id: 'claude-editor',
    name: 'Claude Editor',
    role: AGENT_ROLES.EDITOR,
    model: 'claude-3-haiku-20240307',
    fee: 0.15, // 15% of user payment
    walletAddress: process.env.EDITOR_AGENT_ADDRESS || '0x2345678901234567890123456789012345678901',
    privateKey: process.env.EDITOR_AGENT_PRIVATE_KEY,
    systemPrompt: `You are an expert editor in a multi-agent workflow. Your job is to improve content created by another agent. 
      Enhance clarity, coherence, flow, and style while preserving the original meaning. Return the complete edited 
      content in your response, not just feedback or changes. Your output will be passed to the next agent in the workflow.`,
    canPayOthers: true,
    acceptsPayments: true,
    serviceRates: {
      editing: 0.00003, // per token
    },
    servicesNeeded: ['review'] as ServiceType[],
  },
  {
    id: 'claude-fact-checker',
    name: 'Claude Fact Checker',
    role: AGENT_ROLES.FACT_CHECKER,
    model: 'claude-3-haiku-20240307',
    fee: 0.1, // 10% of user payment
    walletAddress:
      process.env.FACT_CHECKER_AGENT_ADDRESS || '0x3456789012345678901234567890123456789012',
    privateKey: process.env.FACT_CHECKER_AGENT_PRIVATE_KEY,
    systemPrompt: `You are a fact-checking assistant in a multi-agent workflow. Your job is to verify 
      factual claims in content that has already been edited by another agent. Provide the complete 
      fact-checked content in your response, incorporating any necessary corrections. Your output 
      will be the final result shown to the user, so it must be complete and well-formatted.`,
    canPayOthers: false,
    acceptsPayments: true,
    serviceRates: {
      'fact-checking': 0.00002, // per token
    },
    servicesNeeded: [] as ServiceType[],
  },
  {
    id: 'claude-researcher',
    name: 'Claude Researcher',
    role: AGENT_ROLES.RESEARCHER,
    model: 'claude-3-haiku-20240307',
    fee: 0.15, // 15% of user payment
    walletAddress:
      process.env.RESEARCHER_AGENT_ADDRESS || '0x4567890123456789012345678901234567890123',
    privateKey: process.env.RESEARCHER_AGENT_PRIVATE_KEY,
    systemPrompt: `You are a research specialist in a multi-agent workflow. Your job is to find and provide 
      accurate information on topics requested by other agents. Return concise, well-organized research 
      that provides valuable context and factual support. Focus on recent, accurate information.`,
    canPayOthers: false,
    acceptsPayments: true,
    serviceRates: {
      research: 0.00004, // per token
    },
    servicesNeeded: [] as ServiceType[],
  },
  {
    id: 'claude-translator',
    name: 'Claude Translator',
    role: AGENT_ROLES.TRANSLATOR,
    model: 'claude-3-haiku-20240307',
    fee: 0.1, // 10% of user payment
    walletAddress:
      process.env.TRANSLATOR_AGENT_ADDRESS || '0x5678901234567890123456789012345678901234',
    privateKey: process.env.TRANSLATOR_AGENT_PRIVATE_KEY,
    systemPrompt: `You are a translation specialist in a multi-agent workflow. Your job is to translate content 
      from one language to another while preserving meaning, tone, and cultural context. Provide complete 
      translations that maintain the original intent and style.`,
    canPayOthers: false,
    acceptsPayments: true,
    serviceRates: {
      translation: 0.00003, // per token
    },
    servicesNeeded: [] as ServiceType[],
  },
  {
    id: 'claude-reviewer',
    name: 'Claude Reviewer',
    role: AGENT_ROLES.REVIEWER,
    model: 'claude-3-haiku-20240307',
    fee: 0.1, // 10% of user payment
    walletAddress:
      process.env.REVIEWER_AGENT_ADDRESS || '0x6789012345678901234567890123456789012345',
    privateKey: process.env.REVIEWER_AGENT_PRIVATE_KEY,
    systemPrompt: `You are a quality reviewer in a multi-agent workflow. Your job is to evaluate content 
      for quality, accuracy, and adherence to best practices. Provide a final quality assessment 
      and suggest any necessary improvements. Rate the content on a scale of 1-10.`,
    canPayOthers: false,
    acceptsPayments: true,
    serviceRates: {
      review: 0.00002, // per token
    },
    servicesNeeded: [] as ServiceType[],
  },
];

// Helper interface for agent wallets
interface AgentWallet {
  wallet: RadiusWalletInterface;
  tools?: Record<string, unknown>;
}

// Track agent wallets to avoid recreating them
const agentWallets: Record<string, AgentWallet> = {};

// Get or create an agent's wallet
async function getAgentWallet(agent: (typeof AGENT_REGISTRY)[0]): Promise<AgentWallet> {
  if (agentWallets[agent.id]) {
    return agentWallets[agent.id];
  }

  if (!agent.privateKey) {
    throw new Error(`Agent ${agent.id} does not have a private key configured`);
  }

  const wallet = await createRadiusWallet({
    rpcUrl: process.env.NEXT_PUBLIC_RPC_PROVIDER_URL || 'http://localhost:8545',
    privateKey: agent.privateKey,
  });

  const toolList = await getTools({
    wallet,
    plugins: [sendETH()],
  });

  // Convert tools array to a record for compatibility
  const toolsRecord: Record<string, unknown> = {};
  toolList.forEach((tool, index) => {
    toolsRecord[`tool_${index}`] = tool;
  });

  agentWallets[agent.id] = { wallet, tools: toolsRecord };
  return agentWallets[agent.id];
}

// Interface for agent-to-agent service transactions
interface ServiceTransaction {
  from: string;
  to: string;
  service: string;
  amount: number;
  tokenCount: number;
  transactionHash: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { prompt, creatorAddress, workflowType = 'full' } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Define workflow based on requested type
    const workflow = getWorkflow(workflowType);

    // Create Radius wallet for service payments
    const walletStartTime = Date.now();
    const serviceWallet = await createRadiusWallet({
      rpcUrl: process.env.NEXT_PUBLIC_RPC_PROVIDER_URL || 'http://localhost:8545',
      privateKey:
        process.env.WALLET_PRIVATE_KEY ||
        '0x0000000000000000000000000000000000000000000000000000000000000001',
    });

    const walletInitTime = Date.now() - walletStartTime;

    // Execute the multi-agent workflow
    const {
      finalContent,
      agentOutputs,
      workflowMetrics,
      tokenCount,
      serviceTransactions = [],
    } = await executeWorkflow(workflow, prompt);

    // Process payments to all agents in the workflow
    const paymentStartTime = Date.now();
    const paymentAmount = tokenCount * PAYMENT_PER_TOKEN;
    const paymentTransactions = await processAgentPayments(
      serviceWallet,
      workflow,
      paymentAmount,
      creatorAddress,
    );
    const paymentConfirmationTime = Date.now() - paymentStartTime;

    // Combine all transactions for visualization
    const allTransactions = [
      ...paymentTransactions,
      ...serviceTransactions.map((st) => ({
        agent: st.from,
        role: workflow.find((a) => a.id === st.from)?.role || '',
        amount: st.amount,
        token: 'ETH',
        to: st.to,
        service: st.service,
        tokenCount: st.tokenCount,
        transactionHash: st.transactionHash,
        isAgentToAgent: true,
      })),
    ];

    // Return results, including all agent contributions and payments
    return NextResponse.json({
      content: finalContent,
      tokenCount,
      agentContributions: agentOutputs,
      payments: allTransactions,
      metrics: {
        totalProcessingTime: Date.now() - startTime,
        contentGenerationTime: workflowMetrics.totalGenerationTime,
        walletInitTime,
        paymentConfirmationTime,
        agentCommunicationTime: workflowMetrics.communicationTime,
        agentCount: workflow.length,
        agentToAgentTransactions: serviceTransactions.length,
      },
    });
  } catch (error: unknown) {
    console.error('Error processing request:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred during processing';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Helper functions

function getWorkflow(workflowType: string) {
  switch (workflowType) {
    case 'creator-only':
      return AGENT_REGISTRY.filter((agent) => agent.role === AGENT_ROLES.CREATOR);
    case 'create-edit':
      return AGENT_REGISTRY.filter(
        (agent) => agent.role === AGENT_ROLES.CREATOR || agent.role === AGENT_ROLES.EDITOR,
      );
    case 'autonomous':
      // New workflow type that adds researcher and reviewer
      return AGENT_REGISTRY.filter(
        (agent) =>
          agent.role === AGENT_ROLES.CREATOR ||
          agent.role === AGENT_ROLES.EDITOR ||
          agent.role === AGENT_ROLES.FACT_CHECKER ||
          agent.role === AGENT_ROLES.RESEARCHER ||
          agent.role === AGENT_ROLES.REVIEWER,
      );
    default:
      return AGENT_REGISTRY;
  }
}

async function executeWorkflow(agents: typeof AGENT_REGISTRY, userPrompt: string) {
  const startTime = Date.now();
  const agentOutputs: Record<
    string,
    {
      content: string;
      processingTime: number;
      servicesRequested?: string[];
      tokensGenerated?: number;
    }
  > = {};

  const serviceTransactions: ServiceTransaction[] = [];
  const communicationTime = 0;
  let currentContent = '';
  let totalTokenCount = 0;

  // First pass: Execute the main workflow with the creator as the starting point
  const creatorAgent = agents.find((a) => a.role === AGENT_ROLES.CREATOR);
  if (!creatorAgent) {
    throw new Error('Creator agent is required for the workflow');
  }

  // Create a map of agents by role for easy lookup
  const agentsByRole = agents.reduce(
    (acc, agent) => {
      acc[agent.role.toLowerCase()] = agent;
      return acc;
    },
    {} as Record<string, (typeof AGENT_REGISTRY)[0]>,
  );

  // Start with the creator agent
  const creatorStartTime = Date.now();

  // Execute creator agent to generate initial content
  const creatorResult = await generateText({
    model: anthropic(creatorAgent.model),
    prompt: userPrompt,
    system: creatorAgent.systemPrompt,
  });

  const creatorContent = creatorResult.text;
  const creatorTokenCount = creatorContent.split(/\s+/).length;
  totalTokenCount += creatorTokenCount;

  // Store the creator's output
  agentOutputs[creatorAgent.id] = {
    content: creatorContent,
    processingTime: Date.now() - creatorStartTime,
    tokensGenerated: creatorTokenCount,
    servicesRequested: [],
  };

  currentContent = creatorContent;

  // Now process the specialized services needed by the creator
  const servicesNeeded = [...(creatorAgent.servicesNeeded || [])] as ServiceType[];
  const servicesRequested: ServiceType[] = [];

  // Initialize the agent's wallet for payments if it can pay others
  if (creatorAgent.canPayOthers && servicesNeeded.length > 0) {
    try {
      const creatorWallet = await getAgentWallet(creatorAgent);

      // Pay for research services if needed
      if (servicesNeeded.includes('research') && agentsByRole.researcher) {
        const researcherAgent = agentsByRole.researcher;
        const researchStartTime = Date.now();

        // Create research request
        const researchPrompt = `I need research on the following topic to create accurate content:
          
          ${userPrompt}
          
          Please provide concise, well-organized research that gives me valuable context and factual support.
          Focus on recent, accurate information that will help me create authoritative content.`;

        // Generate research
        const researchResult = await generateText({
          model: anthropic(researcherAgent.model),
          prompt: researchPrompt,
          system: researcherAgent.systemPrompt,
        });

        const researchContent = researchResult.text;
        const researchTokenCount = researchContent.split(/\s+/).length;
        totalTokenCount += researchTokenCount;

        // Store researcher output
        agentOutputs[researcherAgent.id] = {
          content: researchContent,
          processingTime: Date.now() - researchStartTime,
          tokensGenerated: researchTokenCount,
          servicesRequested: [],
        };

        // Calculate payment for research
        const researchRate = researcherAgent.serviceRates?.research || 0.00001; // Default rate if undefined
        const researchPayment = researchTokenCount * researchRate;

        // Process the payment
        const tx = await creatorWallet.wallet.sendTransaction({
          to: researcherAgent.walletAddress,
          value: BigInt(Math.floor(researchPayment * 1e18)),
        });

        // Record the transaction
        serviceTransactions.push({
          from: creatorAgent.id,
          to: researcherAgent.id,
          service: 'research',
          amount: researchPayment,
          tokenCount: researchTokenCount,
          transactionHash: tx.hash,
        });

        servicesRequested.push('research');

        // Use the research to enhance the content
        const enhancedContentPrompt = `I've received this research on the topic:
          
          ${researchContent}
          
          Now I need to incorporate this information into my content. Here's my current content:
          
          ${currentContent}
          
          Please enhance this content with the research data while maintaining the style and flow.`;

        // Generate enhanced content
        const enhancedResult = await generateText({
          model: anthropic(creatorAgent.model),
          prompt: enhancedContentPrompt,
          system: creatorAgent.systemPrompt,
        });

        // Update current content with enhanced version
        currentContent = enhancedResult.text;
      }

      // Pay for editing services if needed
      if (servicesNeeded.includes('editing') && agentsByRole.editor) {
        const editorAgent = agentsByRole.editor;
        const editStartTime = Date.now();

        // Create editing request
        const editPrompt = createAgentPrompt(AGENT_ROLES.EDITOR, currentContent, userPrompt);

        // Generate edits
        const editResult = await generateText({
          model: anthropic(editorAgent.model),
          prompt: editPrompt,
          system: editorAgent.systemPrompt,
        });

        const editedContent = editResult.text;
        const editTokenCount = editedContent.split(/\s+/).length;
        totalTokenCount += editTokenCount;

        // Store editor output
        agentOutputs[editorAgent.id] = {
          content: editedContent,
          processingTime: Date.now() - editStartTime,
          tokensGenerated: editTokenCount,
          servicesRequested: [],
        };

        // Calculate payment for editing
        const editingRate = editorAgent.serviceRates?.editing || 0.00001; // Default rate if undefined
        const editingPayment = editTokenCount * editingRate;

        // Process the payment
        const tx = await creatorWallet.wallet.sendTransaction({
          to: editorAgent.walletAddress,
          value: BigInt(Math.floor(editingPayment * 1e18)),
        });

        // Record the transaction
        serviceTransactions.push({
          from: creatorAgent.id,
          to: editorAgent.id,
          service: 'editing',
          amount: editingPayment,
          tokenCount: editTokenCount,
          transactionHash: tx.hash,
        });

        servicesRequested.push('editing');

        // Update current content with edited version
        currentContent = editedContent;

        // If the editor needs review services, provide them
        if (editorAgent.servicesNeeded?.includes('review') && agentsByRole.reviewer) {
          const reviewerAgent = agentsByRole.reviewer;
          const reviewStartTime = Date.now();

          // Create the editor's wallet if needed
          const editorWallet = await getAgentWallet(editorAgent);

          // Create review request
          const reviewPrompt = `Please review the following edited content for quality, accuracy, and adherence to best practices:
            
            ${editedContent}
            
            Provide a final quality assessment and suggest any necessary improvements.
            Rate the content on a scale of 1-10.
            
            Original user prompt for context:
            ${userPrompt}`;

          // Generate review
          const reviewResult = await generateText({
            model: anthropic(reviewerAgent.model),
            prompt: reviewPrompt,
            system: reviewerAgent.systemPrompt,
          });

          const reviewContent = reviewResult.text;
          const reviewTokenCount = reviewContent.split(/\s+/).length;
          totalTokenCount += reviewTokenCount;

          // Store reviewer output
          agentOutputs[reviewerAgent.id] = {
            content: reviewContent,
            processingTime: Date.now() - reviewStartTime,
            tokensGenerated: reviewTokenCount,
            servicesRequested: [],
          };

          // Calculate payment for review
          const reviewRate = reviewerAgent.serviceRates?.review || 0.00001; // Default rate if undefined
          const reviewPayment = reviewTokenCount * reviewRate;

          // Process the payment
          const reviewTx = await editorWallet.wallet.sendTransaction({
            to: reviewerAgent.walletAddress,
            value: BigInt(Math.floor(reviewPayment * 1e18)),
          });

          // Record the transaction
          serviceTransactions.push({
            from: editorAgent.id,
            to: reviewerAgent.id,
            service: 'review',
            amount: reviewPayment,
            tokenCount: reviewTokenCount,
            transactionHash: reviewTx.hash,
          });

          // Update agentOutputs to record the services requested
          if (agentOutputs[editorAgent.id] && !agentOutputs[editorAgent.id].servicesRequested) {
            agentOutputs[editorAgent.id].servicesRequested = ['review'];
          } else if (agentOutputs[editorAgent.id]) {
            agentOutputs[editorAgent.id].servicesRequested = [
              ...(agentOutputs[editorAgent.id].servicesRequested || []),
              'review',
            ];
          }
        }
      }

      // Update the creator's agent output to record services requested
      if (agentOutputs[creatorAgent.id]) {
        agentOutputs[creatorAgent.id].servicesRequested = servicesRequested;
      }
    } catch (error) {
      console.error('Error in agent-to-agent payments:', error);
      // Continue workflow even if agent-to-agent payments fail
    }
  }

  // Final fact checking if needed
  if (agentsByRole.factchecker) {
    const factCheckerAgent = agentsByRole.factchecker;
    const factCheckStartTime = Date.now();

    // Create fact check request
    const factCheckPrompt = createAgentPrompt(AGENT_ROLES.FACT_CHECKER, currentContent, userPrompt);

    // Generate fact check
    const factCheckResult = await generateText({
      model: anthropic(factCheckerAgent.model),
      prompt: factCheckPrompt,
      system: factCheckerAgent.systemPrompt,
    });

    const factCheckedContent = factCheckResult.text;
    const factCheckTokenCount = factCheckedContent.split(/\s+/).length;
    totalTokenCount += factCheckTokenCount;

    // Store fact checker output
    agentOutputs[factCheckerAgent.id] = {
      content: factCheckedContent,
      processingTime: Date.now() - factCheckStartTime,
      tokensGenerated: factCheckTokenCount,
      servicesRequested: [],
    };

    // Update current content with fact-checked version
    currentContent = factCheckedContent;
  }

  // For the demo purpose, we'll use the final agent's output as the result
  const finalContent = currentContent;

  return {
    finalContent,
    agentOutputs,
    tokenCount: totalTokenCount,
    serviceTransactions,
    workflowMetrics: {
      totalGenerationTime: Date.now() - startTime - communicationTime,
      communicationTime,
    },
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

    case AGENT_ROLES.RESEARCHER:
      return `I need comprehensive research on the following topic:
    
    ${originalPrompt}
    
    Please provide concise, well-organized research that provides valuable context and factual support.
    Focus on recent, accurate information.`;

    case AGENT_ROLES.REVIEWER:
      return `Please review the following content for quality, accuracy, and adherence to best practices:
    
    ${previousContent}
    
    Provide a final quality assessment and suggest any necessary improvements.
    Rate the content on a scale of 1-10.`;

    default:
      return previousContent;
  }
}

async function processAgentPayments(
  serviceWallet: RadiusWalletInterface,
  agents: typeof AGENT_REGISTRY,
  totalAmount: number,
  userSpecifiedAddress?: string,
) {
  const transactions = [];

  // If a specific address was provided by the user, override the creator agent's address
  const workflowAgents = [...agents];
  if (userSpecifiedAddress && workflowAgents.find((a) => a.role === AGENT_ROLES.CREATOR)) {
    const creatorIndex = workflowAgents.findIndex((a) => a.role === AGENT_ROLES.CREATOR);
    workflowAgents[creatorIndex] = {
      ...workflowAgents[creatorIndex],
      walletAddress: userSpecifiedAddress,
    };
  }

  // Process payments to each agent based on their fee percentage
  for (const agent of workflowAgents) {
    // Calculate payment amount for this agent
    const agentPayment = totalAmount * agent.fee;

    const tx = await serviceWallet.sendTransaction({
      to: agent.walletAddress,
      value: BigInt(Math.floor(agentPayment * 1e18)),
    });

    // Record transaction
    transactions.push({
      agent: agent.id,
      role: agent.role,
      amount: agentPayment,
      token: 'ETH',
      to: agent.walletAddress,
      transactionHash: tx.hash,
      isBasePayment: true,
    });
  }

  return transactions;
}
