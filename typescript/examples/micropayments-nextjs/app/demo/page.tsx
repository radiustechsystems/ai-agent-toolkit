"use client";

import { useState } from "react";
import Link from "next/link";
import { PaymentVisualization } from "@/components/PaymentVisualization";
import { ContentForm } from "@/components/ContentForm";
import { ContentDisplay } from "@/components/ContentDisplay";
import { TransactionDetails } from "@/components/TransactionDetails";

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-6">AI Content with Multi-Agent Micropayments</h1>
          <p className="mb-4 text-gray-300">
            Generate AI content using a team of specialized agents that collaborate autonomously and receive
            micropayments on the Radius blockchain based on their contributions.
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
        
        <div>
          {isGenerating ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <div 
                  className={`
                    inline-block animate-spin rounded-full h-12 w-12
                    border-t-2 border-radius-primary border-r-2 mb-4
                  `}
                ></div>
                <p>Generating content with AI agents and processing payments...</p>
              </div>
            </div>
          ) : (
            <>
              {payments.length > 0 && <PaymentVisualization payments={payments} />}
              {generatedContent && <ContentDisplay content={generatedContent} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
