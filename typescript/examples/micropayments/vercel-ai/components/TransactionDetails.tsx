'use client';

import { useState } from 'react';

interface TransactionDetailsProps {
  payments: Array<{
    agent: string;
    role: string;
    amount: number;
    token: string;
    to: string;
    transactionHash: string;
    fee?: string;
    blockNumber?: number;
    service?: string;
    tokenCount?: number;
    isAgentToAgent?: boolean;
    isBasePayment?: boolean;
  }>;
  metrics: {
    totalProcessingTime: number;
    contentGenerationTime: number;
    walletInitTime: number;
    paymentConfirmationTime: number;
    agentCommunicationTime: number;
    agentCount: number;
    agentToAgentTransactions?: number;
  };
  agentContributions?: Record<
    string,
    {
      content: string;
      processingTime: number;
      servicesRequested?: string[];
      tokensGenerated?: number;
    }
  > | null;
}

export function TransactionDetails({
  payments,
  metrics,
  agentContributions,
}: TransactionDetailsProps) {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  // Calculate total payment amount
  const totalPayment = payments.reduce((sum, payment) => sum + payment.amount, 0);

  // Helper to format time for display
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Helper to format agent role for display
  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Toggle agent contribution display
  const toggleAgentExpand = (agentId: string) => {
    if (expandedAgent === agentId) {
      setExpandedAgent(null);
    } else {
      setExpandedAgent(agentId);
    }
  };

  return (
    <div className="mt-8 bg-radius-dark/70 rounded-lg p-4 border border-radius-dark">
      <h3 className="text-xl font-semibold mb-4 text-radius-accent">Multi-Agent Payment Details</h3>

      <div className="mb-6 pb-4 border-b border-radius-dark/30">
        <h4 className="text-md font-medium text-gray-300 mb-3">Agent Payment Distribution</h4>

        {/* Group payments by type */}
        <div className="mb-2">
          <h5 className="text-sm font-medium text-radius-accent mb-2">Base Payments</h5>
          <div className="space-y-3">
            {payments
              .filter((p) => !p.isAgentToAgent)
              .map((payment) => (
                <div
                  key={`base-${payment.agent}`}
                  className="bg-black/20 p-3 rounded-md hover:bg-black/30 transition-colors"
                >
                  <button
                    className="flex items-center justify-between w-full text-left bg-transparent border-0 cursor-pointer"
                    onClick={() => agentContributions && toggleAgentExpand(payment.agent)}
                    aria-expanded={expandedAgent === payment.agent}
                    type="button"
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-radius-accent mr-2" />
                      <span className="font-medium">{formatRole(payment.role)} Agent</span>
                      {agentContributions && (
                        <span className="ml-2 text-xs text-gray-400">
                          {expandedAgent === payment.agent ? '▼' : '▶'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className="font-bold text-radius-accent">
                        {payment.amount.toFixed(8)}
                      </span>
                      <span className="ml-1">{payment.token}</span>
                      <span className="ml-2 text-xs text-gray-400">
                        ({((payment.amount / totalPayment) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </button>

                  {expandedAgent === payment.agent &&
                    agentContributions &&
                    agentContributions[payment.agent] && (
                      <div className="mt-3 border-t border-radius-dark/20 pt-3 text-sm">
                        <div className="mb-2 flex justify-between">
                          <span className="text-gray-400">Processing Time:</span>
                          <span>
                            {formatTime(agentContributions?.[payment.agent]?.processingTime || 0)}
                          </span>
                        </div>

                        {agentContributions?.[payment.agent]?.servicesRequested &&
                          // @ts-ignore - Suppressing TS error
                          agentContributions?.[payment.agent]?.servicesRequested?.length > 0 && (
                            <div className="mb-2">
                              <span className="text-gray-400">Services Requested:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {agentContributions?.[payment.agent]?.servicesRequested?.map(
                                  (service) => (
                                    <span
                                      key={service}
                                      className="text-xs bg-radius-dark/50 px-2 py-1 rounded"
                                    >
                                      {service}
                                    </span>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                        <div className="mt-2">
                          <div className="text-gray-400 mb-1">
                            {payment.role === 'creator'
                              ? 'Original Content:'
                              : payment.role === 'editor'
                                ? 'Edited Content:'
                                : payment.role === 'factChecker'
                                  ? 'Fact-Checked Content:'
                                  : payment.role === 'researcher'
                                    ? 'Research:'
                                    : payment.role === 'reviewer'
                                      ? 'Review:'
                                      : 'Contribution:'}
                          </div>
                          <div className="bg-black/40 p-2 rounded-md text-xs font-mono max-h-32 overflow-y-auto">
                            {agentContributions?.[payment.agent]?.content}
                          </div>
                        </div>
                      </div>
                    )}

                  <div className="mt-2 flex text-xs text-gray-500">
                    <div className="truncate max-w-32">
                      {payment.to.substring(0, 6)}...{payment.to.substring(payment.to.length - 4)}
                    </div>
                    <div className="ml-auto">
                      Tx: {payment.transactionHash.substring(0, 6)}...
                      {payment.transactionHash.substring(payment.transactionHash.length - 4)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Agent-to-Agent Payments Section */}
        {payments.filter((p) => p.isAgentToAgent).length > 0 && (
          <div className="mt-6">
            <h5 className="text-sm font-medium text-radius-accent mb-2">Agent-to-Agent Payments</h5>
            <div className="space-y-3">
              {payments
                .filter((p) => p.isAgentToAgent)
                .map((payment, _idx) => {
                  const toAgentId = payment.to;
                  const fromRole = payment.role;
                  const toRole = payments.find((p) => p.agent === toAgentId)?.role || 'unknown';

                  return (
                    <div
                      key={`a2a-${payment.agent}-${payment.to}-${payment.transactionHash.substring(0, 8)}`}
                      className="bg-black/20 p-3 rounded-md hover:bg-black/30 transition-colors border-l-2"
                      style={{
                        borderColor:
                          payment.service === 'research'
                            ? '#FF5722'
                            : payment.service === 'editing'
                              ? '#059669'
                              : payment.service === 'review'
                                ? '#9C27B0'
                                : '#4F46E5',
                      }}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex items-center">
                              <span className="font-medium">{formatRole(fromRole)}</span>
                              <span className="mx-2 text-gray-400">→</span>
                              <span className="font-medium">{formatRole(toRole)}</span>
                            </div>
                            {payment.service && (
                              <span className="ml-2 text-xs px-2 py-0.5 rounded bg-radius-dark/40 text-gray-300">
                                {payment.service}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center">
                            <span className="font-bold text-radius-accent">
                              {payment.amount.toFixed(8)}
                            </span>
                            <span className="ml-1">{payment.token}</span>
                          </div>
                        </div>

                        {payment.tokenCount && (
                          <div className="text-xs text-gray-400 mt-1">
                            {payment.tokenCount} tokens processed at{' '}
                            {(payment.amount / payment.tokenCount).toFixed(8)} ETH/token
                          </div>
                        )}

                        <div className="mt-2 flex text-xs text-gray-500">
                          <div className="truncate max-w-32">
                            {payment.agent.substring(0, 6)}...
                            {payment.agent.substring(payment.agent.length - 4)}
                            <span className="mx-1">→</span>
                            {payment.to.substring(0, 6)}...
                            {payment.to.substring(payment.to.length - 4)}
                          </div>
                          <div className="ml-auto">
                            Tx: {payment.transactionHash.substring(0, 6)}...
                            {payment.transactionHash.substring(payment.transactionHash.length - 4)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2 text-gray-300">Multi-Agent Workflow Metrics</h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Content Generation</span>
              <span className="text-xs font-medium">
                {formatTime(metrics.contentGenerationTime)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Agent Communication</span>
              <span className="text-xs font-medium text-radius-primary">
                {formatTime(metrics.agentCommunicationTime)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Agents in Workflow</span>
              <span className="text-xs font-medium">{metrics.agentCount}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Payment Processing</span>
              <span className="text-xs font-medium text-radius-accent">
                {formatTime(metrics.paymentConfirmationTime)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Base Payments</span>
              <span className="text-xs font-medium">
                {payments.filter((p) => !p.isAgentToAgent).length}
              </span>
            </div>

            {metrics.agentToAgentTransactions && metrics.agentToAgentTransactions > 0 && (
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Agent-to-Agent Payments</span>
                <span className="text-xs font-medium text-radius-primary">
                  {metrics.agentToAgentTransactions}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Total Processing</span>
              <span className="text-xs font-medium">{formatTime(metrics.totalProcessingTime)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
