/* eslint-disable max-len */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PaymentVisualization } from "@/components/PaymentVisualization";
import { ContentForm } from "@/components/ContentForm";
import { ContentDisplay } from "@/components/ContentDisplay";
import { TransactionDetails } from "@/components/TransactionDetails";

// Dynamic Loading Indicator Component
function DynamicLoadingIndicator({ workflowType }: { workflowType: string }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [fadeState, setFadeState] = useState("in"); // "in" or "out"
  
  // Define messages based on workflow type
  const getMessages = () => {
    switch (workflowType) {
    case "creator-only":
      return [
        { text: "Creating original content...", emoji: "✍️" },
        { text: "Generating ideas...", emoji: "💡" },
        { text: "Processing payments...", emoji: "💸" },
        { text: "Finalizing content...", emoji: "📝" }
      ];
    case "create-edit":
      return [
        { text: "Creating original content...", emoji: "✍️" },
        { text: "Editing for clarity and style...", emoji: "📝" },
        { text: "Improving structure...", emoji: "🔄" },
        { text: "Processing payments...", emoji: "💸" },
        { text: "Finalizing edited content...", emoji: "✨" }
      ];
    case "full":
    default:
      return [
        { text: "Creating original content...", emoji: "✍️" },
        { text: "Editing for clarity and style...", emoji: "📝" },
        { text: "Fact-checking content...", emoji: "🔍" },
        { text: "Verifying accuracy...", emoji: "✅" },
        { text: "Processing payments...", emoji: "💸" },
        { text: "Finalizing verified content...", emoji: "✨" }
      ];
    }
  };
  
  const messages = getMessages();
  
  // Animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (fadeState === "in") {
        setFadeState("out");
      } else {
        setFadeState("in");
        setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
      }
    }, 2000); // Cycle every 2 seconds
    
    return () => clearInterval(interval);
  }, [fadeState, messages.length]);
  
  const currentMessage = messages[messageIndex];
  
  return (
    <div className="h-96 flex items-center justify-center">
      <div className="text-center">
        {/* Concentric spinner circles based on workflow */}
        <div className="relative mb-12 flex items-center justify-center h-24">
          {/* Only show relevant spinners based on the workflow type */}
          {workflowType === "creator-only" ? (
            /* Creator-only workflow - only blue spinner */
            <div className="absolute animate-spin rounded-full h-20 w-20 border-2 border-t-[#4F46E5] border-[#4F46E5]/20"></div>
          ) : workflowType === "create-edit" ? (
            /* Creator + Editor workflow - blue and green spinners */
            <>
              <div className="absolute animate-spin rounded-full h-20 w-20 border-2 border-t-[#4F46E5] border-[#4F46E5]/20"></div>
              <div className="absolute animate-spin-slow-reverse rounded-full h-14 w-14 border-2 border-t-[#059669] border-[#059669]/20"></div>
            </>
          ) : (
            /* Full workflow - blue, green, and pink spinners */
            <>
              <div className="absolute animate-spin rounded-full h-20 w-20 border-2 border-t-[#4F46E5] border-[#4F46E5]/20"></div>
              <div className="absolute animate-spin-slow-reverse rounded-full h-14 w-14 border-2 border-t-[#059669] border-[#059669]/20"></div>
              <div className="absolute animate-spin-slow rounded-full h-8 w-8 border-2 border-t-[#DB2777] border-[#DB2777]/20"></div>
            </>
          )}
        </div>
        
        <div className={`transition-opacity duration-500 ease-in-out ${fadeState === "in" ? "opacity-100" : "opacity-0"}`}>
          <div className="text-4xl mb-3">{currentMessage.emoji}</div>
          <p className="text-lg font-medium text-white">{currentMessage.text}</p>
          
          <div className="mt-8 text-sm">
            <div className="flex justify-center gap-4">
              {workflowType === "creator-only" ? (
                <span className="bg-[#4F46E5]/20 border border-[#4F46E5]/30 text-[#4F46E5] px-3 py-1 rounded flex items-center">
                  <span className="mr-1">✍️</span> Creator Agent
                </span>
              ) : workflowType === "create-edit" ? (
                <>
                  <span className="bg-[#4F46E5]/20 border border-[#4F46E5]/30 text-[#4F46E5] px-3 py-1 rounded flex items-center">
                    <span className="mr-1">✍️</span> Creator Agent
                  </span>
                  <span className="bg-[#059669]/20 border border-[#059669]/30 text-[#059669] px-3 py-1 rounded flex items-center">
                    <span className="mr-1">📝</span> Editor Agent
                  </span>
                </>
              ) : (
                <>
                  <span className="bg-[#4F46E5]/20 border border-[#4F46E5]/30 text-[#4F46E5] px-3 py-1 rounded flex items-center">
                    <span className="mr-1">✍️</span> Creator Agent
                  </span>
                  <span className="bg-[#059669]/20 border border-[#059669]/30 text-[#059669] px-3 py-1 rounded flex items-center">
                    <span className="mr-1">📝</span> Editor Agent
                  </span>
                  <span className="bg-[#DB2777]/20 border border-[#DB2777]/30 text-[#DB2777] px-3 py-1 rounded flex items-center">
                    <span className="mr-1">🔍</span> Fact-Checker Agent
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DemoPage() {
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [payments, setPayments] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [paymentMetrics, setPaymentMetrics] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [agentContributions, setAgentContributions] = useState<any>(null);
  const [workflowType, setWorkflowType] = useState<string>("full");
  
  const handleContentSubmission = async (prompt: string, creatorAddress: string) => {
    setIsGenerating(true);
    setGeneratedContent("");
    setPayments([]);
    setAgentContributions(null);
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          creatorAddress,
          workflowType
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate content");
      }
      
      const data = await response.json();
      
      setGeneratedContent(data.content);
      setPayments(data.payments);
      setPaymentMetrics(data.metrics);
      setAgentContributions(data.agentContributions);
    } catch (error) {
      console.error("Error generating content:", error);
      setGeneratedContent("Error: Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleWorkflowChange = (type: string) => {
    setWorkflowType(type);
  };
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <div className="mb-8">
        <Link 
          href="/"
          className="text-radius-primary hover:text-radius-secondary transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5">
          <h1 className="text-3xl font-bold mb-6">AI Content with Multi-Agent Micropayments</h1>
          <p className="mb-4 text-gray-300">
            Generate AI content using a team of specialized agents that collaborate autonomously and receive
            micropayments on Radius based on their contributions.
          </p>
          
          <div className="bg-radius-dark/50 p-4 rounded-lg mb-6">
            <h3 className="text-sm font-semibold mb-2">Select Agent Workflow:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleWorkflowChange("creator-only")}
                className={`px-3 py-1 rounded-md text-sm ${
                  workflowType === "creator-only" 
                    ? "bg-radius-primary text-white" 
                    : "bg-radius-dark/70 text-gray-300 hover:bg-radius-dark"
                }`}
              >
                Creator Only
              </button>
              <button
                onClick={() => handleWorkflowChange("create-edit")}
                className={`px-3 py-1 rounded-md text-sm ${
                  workflowType === "create-edit" 
                    ? "bg-radius-primary text-white" 
                    : "bg-radius-dark/70 text-gray-300 hover:bg-radius-dark"
                }`}
              >
                Creator + Editor
              </button>
              <button
                onClick={() => handleWorkflowChange("full")}
                className={`px-3 py-1 rounded-md text-sm ${
                  workflowType === "full" 
                    ? "bg-radius-primary text-white" 
                    : "bg-radius-dark/70 text-gray-300 hover:bg-radius-dark"
                }`}
              >
                Full Team (Creator, Editor, Fact-Checker)
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Each agent performs specialized tasks and receives micropayments based on their contribution.
            </p>
          </div>
          
          <ContentForm onSubmit={handleContentSubmission} isLoading={isGenerating} />
          
          {payments.length > 0 && paymentMetrics && (
            <TransactionDetails 
              payments={payments} 
              metrics={paymentMetrics}
              agentContributions={agentContributions}
            />
          )}
        </div>
        
        <div className="md:col-span-7">
          {isGenerating ? (
            <DynamicLoadingIndicator workflowType={workflowType} />
          ) : (
            <div className="flex flex-col">
              {payments.length > 0 && <PaymentVisualization payments={payments} />}
              {generatedContent && <ContentDisplay content={generatedContent} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
