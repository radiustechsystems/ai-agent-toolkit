'use client';

import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

interface PaymentVisualizationProps {
  payments: Array<{
    agent: string;
    role: string;
    amount: number;
    token: string;
    to: string;
    transactionHash: string;
    service?: string;
    tokenCount?: number;
    isAgentToAgent?: boolean;
    isBasePayment?: boolean;
  }>;
}

export function PaymentVisualization({ payments }: PaymentVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Use refs to track active intervals and check component mounted status
  const activeIntervalsRef = useRef<number[]>([]);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    if (!svgRef.current || !payments.length) return;

    // Clear any existing intervals to prevent memory leaks
    for (const interval of activeIntervalsRef.current) {
      window.clearInterval(interval);
    }
    activeIntervalsRef.current = [];

    // Clear previous visualization and tooltips
    d3.select(svgRef.current).selectAll('*').remove();
    d3.selectAll("[class^='tooltip-']").remove(); // Remove agent tooltips
    d3.selectAll("[class^='service-tooltip-']").remove(); // Remove service tooltips
    d3.selectAll('.hint-tooltip').remove(); // Remove hint tooltip

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = 650; // Significantly increased height for better visualization spacing
    const centerY = height / 2;

    // Setup visualization area
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Create layer groups for better z-index control
    const backgroundLayer = svg.append('g').attr('class', 'background-layer');
    const connectionLayer = svg.append('g').attr('class', 'connection-layer');
    const nodeLayer = svg.append('g').attr('class', 'node-layer');
    const labelLayer = svg.append('g').attr('class', 'label-layer'); // Top layer for labels

    // Create a defs section for gradients and filters
    const defs = svg.append('defs');

    // Add glow filter for nodes
    const glowFilter = defs
      .append('filter')
      .attr('id', 'glow-effect')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    glowFilter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');

    glowFilter
      .append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blur')
      .attr('operator', 'over');

    // Add a particle filter for animated paths
    const particleFilter = defs
      .append('filter')
      .attr('id', 'particle-effect')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');

    particleFilter
      .append('feTurbulence')
      .attr('type', 'fractalNoise')
      .attr('baseFrequency', '0.03')
      .attr('numOctaves', '3')
      .attr('seed', '3')
      .attr('result', 'turbulence');

    particleFilter
      .append('feDisplacementMap')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'turbulence')
      .attr('scale', '3')
      .attr('xChannelSelector', 'R')
      .attr('yChannelSelector', 'G');

    // Add a background with gradient
    defs
      .append('linearGradient')
      .attr('id', 'bg-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%')
      .selectAll('stop')
      .data([
        { offset: '0%', color: 'rgba(29, 35, 42, 0.7)' },
        { offset: '100%', color: 'rgba(15, 23, 42, 0.8)' },
      ])
      .enter()
      .append('stop')
      .attr('offset', (d) => d.offset)
      .attr('stop-color', (d) => d.color);

    // Add background to the background layer
    backgroundLayer
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#bg-gradient)')
      .attr('rx', 8);

    // Add grid lines for visual appeal
    const gridSize = 30;
    const gridOpacity = 0.1;

    // Horizontal grid lines
    for (let y = 0; y < height; y += gridSize) {
      backgroundLayer
        .append('line')
        .attr('x1', 0)
        .attr('y1', y)
        .attr('x2', width)
        .attr('y2', y)
        .attr('stroke', '#FFFFFF')
        .attr('stroke-width', 0.5)
        .attr('opacity', gridOpacity);
    }

    // Vertical grid lines
    for (let x = 0; x < width; x += gridSize) {
      backgroundLayer
        .append('line')
        .attr('x1', x)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', height)
        .attr('stroke', '#FFFFFF')
        .attr('stroke-width', 0.5)
        .attr('opacity', gridOpacity);
    }

    // Add a title explaining the visualization - moved to upper left with background
    // Add a semi-transparent background for the title (in label layer for proper z-index)
    labelLayer
      .append('rect')
      .attr('x', 20)
      .attr('y', 20)
      .attr('width', 320) // Widened to accommodate longer title text
      .attr('height', 60)
      .attr('rx', 6)
      .attr('fill', 'rgba(0, 0, 0, 0.5)') // Slightly darker for better contrast
      .attr('stroke', 'rgba(79, 70, 229, 0.5)') // Brighter border
      .attr('stroke-width', 1);

    const titleGroup = labelLayer
      .append('g')
      .attr('class', 'title')
      .attr('transform', 'translate(30, 40)'); // Positioned in upper left

    titleGroup
      .append('text')
      .attr('text-anchor', 'start') // Left-aligned
      .attr('fill', '#FFFFFF')
      .style('font-size', '18px') // Increased size for better visibility
      .style('font-weight', 'bold')
      .text('Radius Micropayment Network');

    titleGroup
      .append('text')
      .attr('y', 24) // Spacing below title
      .attr('text-anchor', 'start') // Left-aligned
      .attr('fill', 'rgba(255, 255, 255, 0.8)') // Brighter text for better readability
      .style('font-size', '14px') // Slightly larger
      .text('Real-time transactions between AI agents');

    // Add a tooltip hint in the corner (in label layer for proper z-index)
    const hintGroup = labelLayer
      .append('g')
      .attr('class', 'hint')
      .attr('transform', `translate(${width - 30}, 40)`)
      .style('cursor', 'help')
      .attr('pointer-events', 'all'); // Ensure it captures pointer events

    hintGroup
      .append('circle')
      .attr('r', 15)
      .attr('fill', 'rgba(0, 0, 0, 0.5)')
      .attr('stroke', 'rgba(79, 70, 229, 0.5)')
      .attr('stroke-width', 1);

    hintGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', '#FFFFFF')
      .style('font-size', '14px')
      .text('ℹ️');

    // Create a tooltip for the hint
    const hintTooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'hint-tooltip')
      .style('position', 'absolute')
      .style('background-color', 'rgba(0, 0, 0, 0.9)')
      .style('border', '2px solid rgba(79, 70, 229, 0.7)')
      .style('border-radius', '8px')
      .style('padding', '12px')
      .style('color', 'white')
      .style('font-weight', '400')
      .style('font-size', '14px')
      .style('box-shadow', '0 4px 12px rgba(0, 0, 0, 0.5)')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('transition', 'opacity 0.2s')
      .style('z-index', '1000')
      .style('max-width', '300px')
      .html(`
        <div>
          <div style="font-weight: bold; font-size: 16px; margin-bottom: 6px;">Interactive Visualization</div>
          <div style="margin-bottom: 8px;">
            • Hover over <span style="color: #4F46E5;">agents</span> to see detailed payment information<br>
            • Hover over <span style="color: #059669; font-weight: bold;">pulsing connection lines</span> to view service details
          </div>
          <div style="opacity: 0.8; font-size: 13px;">💡 Watch for pulsing lines between agents - these show service connections!</div>
        </div>
      `);

    // Add hover events for the hint (without transitions to avoid errors)
    hintGroup
      .on('mouseover', function (event) {
        hintTooltip
          .style('left', `${event.pageX - 150}px`) // Center the tooltip
          .style('top', `${event.pageY + 20}px`)
          .style('opacity', 1);

        // Highlight the hint without transition
        d3.select(this).select('circle').attr('r', 17);
      })
      .on('mousemove', (event) => {
        hintTooltip.style('left', `${event.pageX - 150}px`).style('top', `${event.pageY + 20}px`);
      })
      .on('mouseout', function () {
        hintTooltip.style('opacity', 0);

        // Remove highlight without transition
        d3.select(this).select('circle').attr('r', 15);
      });

    // Service node (center node that pays all agents)
    const serviceNode = {
      id: 'service',
      label: 'Payment Service',
      x: width / 2,
      y: centerY,
      radius: 35, // Larger central node
    };

    // Separate base payments from agent-to-agent payments
    const basePayments = payments.filter((p) => !p.isAgentToAgent);
    const agentToAgentPayments = payments.filter((p) => p.isAgentToAgent);

    // Create a mapping of all agents involved in transactions
    const allAgentsMap = new Map();

    // Add agents that receive base payments
    for (const payment of basePayments) {
      allAgentsMap.set(payment.agent, {
        id: payment.agent,
        label: payment.role.charAt(0).toUpperCase() + payment.role.slice(1),
        role: payment.role,
        amount: payment.amount,
        token: payment.token,
        to: payment.to,
        transactionHash: payment.transactionHash,
        radius: 25, // Larger agent nodes
        receivesBasePayment: true,
      });
    }

    // Add agents that only participate in agent-to-agent transactions
    for (const payment of agentToAgentPayments) {
      // Add sender if not already in the map
      if (!allAgentsMap.has(payment.agent)) {
        const agentRole = payment.role || 'agent';
        allAgentsMap.set(payment.agent, {
          id: payment.agent,
          label: agentRole.charAt(0).toUpperCase() + agentRole.slice(1),
          role: agentRole,
          amount: 0, // No base payment
          token: payment.token,
          radius: 25, // Consistent size
          receivesBasePayment: false,
          canPayOthers: true,
        });
      } else {
        // Mark existing agent as capable of paying others
        allAgentsMap.get(payment.agent).canPayOthers = true;
      }

      // Add recipient if not already in the map
      const recipientAgent = payments.find((p) => p.agent === payment.to);
      if (!allAgentsMap.has(payment.to) && recipientAgent) {
        allAgentsMap.set(payment.to, {
          id: recipientAgent.agent,
          label: recipientAgent.role.charAt(0).toUpperCase() + recipientAgent.role.slice(1),
          role: recipientAgent.role,
          amount: 0, // Will be calculated separately
          token: payment.token,
          radius: 25, // Consistent size
          receivesBasePayment: false,
        });
      }
    }

    // Define a type for agent nodes
    interface AgentNode {
      id: string;
      label: string;
      role: string;
      amount: number;
      token: string;
      to?: string;
      transactionHash?: string;
      radius: number;
      receivesBasePayment: boolean;
      canPayOthers?: boolean;
      x?: number;
      y?: number;
      percentage?: string;
    }

    // Convert map to array and arrange in a circle with improved spacing
    const agents = Array.from(allAgentsMap.values());
    let agentNodes: AgentNode[];

    // Use a more optimized layout for 6 agents (hexagon)
    if (agents.length === 6) {
      // Calculate positions for specific hexagon layout
      // Get roles for specific positioning
      const creator = agents.find((a) => a.role === 'creator');
      const editor = agents.find((a) => a.role === 'editor');
      const researcher = agents.find((a) => a.role === 'researcher');
      const factChecker = agents.find((a) => a.role === 'factChecker');
      const reviewer = agents.find((a) => a.role === 'reviewer');
      const translator = agents.find((a) => a.role === 'translator');

      // Arrange in optimal positions (using the image layout as reference)
      const radius = Math.min(width, height * 0.8) * 0.42; // Wider radius with more vertical space

      // Position agents by role in specific locations
      const positionMap = new Map();

      // Top position (Creator)
      if (creator) {
        positionMap.set(creator.id, {
          x: serviceNode.x,
          y: serviceNode.y - radius,
        });
      }

      // Top-right position (Editor)
      if (editor) {
        positionMap.set(editor.id, {
          x: serviceNode.x + radius * 0.866, // cos(30°)
          y: serviceNode.y - radius * 0.5, // sin(30°)
        });
      }

      // Bottom-right position (Researcher)
      if (researcher) {
        positionMap.set(researcher.id, {
          x: serviceNode.x + radius * 0.866, // cos(30°)
          y: serviceNode.y + radius * 0.5, // sin(30°)
        });
      }

      // Bottom position (Fact Checker)
      if (factChecker) {
        positionMap.set(factChecker.id, {
          x: serviceNode.x,
          y: serviceNode.y + radius,
        });
      }

      // Bottom-left position (Reviewer)
      if (reviewer) {
        positionMap.set(reviewer.id, {
          x: serviceNode.x - radius * 0.866, // cos(30°)
          y: serviceNode.y + radius * 0.5, // sin(30°)
        });
      }

      // Top-left position (Translator)
      if (translator) {
        positionMap.set(translator.id, {
          x: serviceNode.x - radius * 0.866, // cos(30°)
          y: serviceNode.y - radius * 0.5, // sin(30°)
        });
      }

      // Apply positions and calculate percentages
      agentNodes = agents.map((agent) => {
        // Calculate percentage distribution
        const totalBasePayment = basePayments.reduce((sum, p) => sum + p.amount, 0);
        const percentage = agent.receivesBasePayment
          ? ((agent.amount / totalBasePayment) * 100).toFixed(0)
          : '0';

        // Get position from map or use default positioning
        const position = positionMap.get(agent.id) || {
          x:
            serviceNode.x +
            radius * Math.cos((agents.indexOf(agent) * Math.PI * 2) / agents.length),
          y:
            serviceNode.y +
            radius * Math.sin((agents.indexOf(agent) * Math.PI * 2) / agents.length),
        };

        return {
          ...agent,
          x: position.x,
          y: position.y,
          percentage,
        };
      });
    } else {
      // For other numbers of agents, use standard circular arrangement with improved spacing
      agentNodes = agents.map((agent, i) => {
        let angle: number;

        // Special case for simple workflows
        if (agents.length <= 2) {
          if (agent.role === 'creator') {
            angle = 0; // Place creator on the right
          } else {
            angle = Math.PI; // Place other on the left
          }
        } else if (agents.length <= 4) {
          // Place in a square for 3-4 agents with better angles
          angle = (2 * Math.PI * i) / agents.length - Math.PI / 4;
        } else {
          // Default circular arrangement for 5+ agents
          angle = (2 * Math.PI * i) / agents.length - Math.PI / 2; // Start from top
        }

        const radius = Math.min(width, height * 0.8) * 0.42; // Wider radius with more vertical space

        // Calculate percentage distribution (for base payments only)
        const totalBasePayment = basePayments.reduce((sum, p) => sum + p.amount, 0);
        const percentage = agent.receivesBasePayment
          ? ((agent.amount / totalBasePayment) * 100).toFixed(0)
          : '0';

        return {
          ...agent,
          x: serviceNode.x + radius * Math.cos(angle),
          y: serviceNode.y + radius * Math.sin(angle),
          percentage,
        };
      });
    }

    // Draw links between service and agent nodes for base payments
    agentNodes
      .filter((agent) => agent.receivesBasePayment)
      .forEach((agent, index) => {
        // Create gradient for each path
        const gradientId = `agent-gradient-${index}`;
        const gradient = defs
          .append('linearGradient')
          .attr('id', gradientId)
          .attr('gradientUnits', 'userSpaceOnUse')
          .attr('x1', serviceNode.x)
          .attr('y1', serviceNode.y)
          .attr('x2', agent.x ?? 0)
          .attr('y2', agent.y ?? 0);

        // Add gradient stops with colors based on agent role
        let startColor = '';
        let endColor = '';
        let glowColor = '';

        switch (agent.role) {
          case 'creator':
            startColor = '#F59E0B'; // Service node color (amber)
            endColor = '#4F46E5'; // Creator node color (blue)
            glowColor = '#4F46E5';
            break;
          case 'editor':
            startColor = '#F59E0B'; // Service node color (amber)
            endColor = '#059669'; // Editor node color (green)
            glowColor = '#059669';
            break;
          case 'factChecker':
            startColor = '#F59E0B'; // Service node color (amber)
            endColor = '#DB2777'; // Fact-checker node color (pink)
            glowColor = '#DB2777';
            break;
          case 'researcher':
            startColor = '#F59E0B'; // Service node color (amber)
            endColor = '#FF5722'; // Researcher node color (orange)
            glowColor = '#FF5722';
            break;
          case 'reviewer':
            startColor = '#F59E0B'; // Service node color (amber)
            endColor = '#9C27B0'; // Reviewer node color (purple)
            glowColor = '#9C27B0';
            break;
          case 'translator':
            startColor = '#F59E0B'; // Service node color (amber)
            endColor = '#00BCD4'; // Translator node color (cyan)
            glowColor = '#00BCD4';
            break;
          default:
            startColor = '#F59E0B';
            endColor = '#4F46E5';
            glowColor = '#6366F1';
        }

        gradient.append('stop').attr('offset', '0%').attr('stop-color', startColor);

        gradient.append('stop').attr('offset', '100%').attr('stop-color', endColor);

        // Create a wider path for glow effect - in connection layer
        connectionLayer
          .append('path')
          .attr(
            'd',
            `M${serviceNode.x},${serviceNode.y} Q${(serviceNode.x + (agent.x ?? 0)) / 2 + (Math.random() * 20 - 10)},${(serviceNode.y + (agent.y ?? 0)) / 2 + (Math.random() * 20 - 10)} ${agent.x ?? 0},${agent.y ?? 0}`,
          )
          .attr('class', `payment-glow-${index}`)
          .attr('stroke', glowColor)
          .attr('stroke-width', 6 + agent.amount * 15) // Thicker lines for larger payments
          .attr('opacity', 0.25) // Slightly increased glow opacity
          .attr('fill', 'none')
          .attr('filter', 'url(#glow-effect)')
          .attr('stroke-dasharray', function () {
            return this.getTotalLength();
          })
          .attr('stroke-dashoffset', function () {
            return this.getTotalLength();
          })
          .transition()
          .delay(index * 200)
          .duration(1500)
          .ease(d3.easeExpInOut)
          .attr('stroke-dashoffset', 0);

        // Draw the payment path with a curve - in connection layer
        connectionLayer
          .append('path')
          .attr(
            'd',
            `M${serviceNode.x},${serviceNode.y} Q${(serviceNode.x + (agent.x ?? 0)) / 2 + (Math.random() * 20 - 10)},${(serviceNode.y + (agent.y ?? 0)) / 2 + (Math.random() * 20 - 10)} ${agent.x ?? 0},${agent.y ?? 0}`,
          )
          .attr('class', `payment-path-${index}`)
          .attr('stroke', `url(#${gradientId})`)
          .attr('stroke-width', 3 + agent.amount * 12) // Thicker lines for larger payments
          .attr('fill', 'none')
          .attr('stroke-linecap', 'round')
          .attr('stroke-dasharray', function () {
            return this.getTotalLength();
          })
          .attr('stroke-dashoffset', function () {
            return this.getTotalLength();
          })
          .transition()
          .delay(index * 200)
          .duration(1500)
          .ease(d3.easeExpInOut)
          .attr('stroke-dashoffset', 0);
      });

    // Draw the service node with glow effect (in node layer)
    const serviceGroup = nodeLayer
      .append('g')
      .attr('class', 'service-node')
      .attr('transform', `translate(${serviceNode.x}, ${serviceNode.y})`);

    // Service node shadow/glow - changed to orange/gold color for differentiation
    serviceGroup
      .append('circle')
      .attr('r', 0)
      .attr('fill', 'rgba(245, 158, 11, 0.4)') // Changed to amber/gold
      .attr('filter', 'url(#glow-effect)')
      .transition()
      .duration(1000)
      .attr('r', serviceNode.radius * 1.4);

    // Service node itself
    serviceGroup
      .append('circle')
      .attr('r', 0)
      .attr('fill', 'url(#bg-gradient)')
      .attr('stroke', '#F59E0B') // Changed to amber/gold
      .attr('stroke-width', 3) // Slightly thicker border
      .transition()
      .duration(800)
      .attr('r', serviceNode.radius);

    // Service node inner ripple animation
    const ripple = serviceGroup
      .append('circle')
      .attr('r', serviceNode.radius * 0.7)
      .attr('fill', 'none')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 1)
      .attr('opacity', 0.5);

    // Create a repeating ripple effect
    function pulseRipple() {
      ripple
        .attr('r', serviceNode.radius * 0.7)
        .attr('opacity', 0.5)
        .transition()
        .duration(2000)
        .attr('r', serviceNode.radius)
        .attr('opacity', 0)
        .on('end', pulseRipple);
    }

    pulseRipple();

    // Service node icon - a simple wallet/money icon (in label layer for better z-index)
    labelLayer
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('x', serviceNode.x)
      .attr('y', serviceNode.y)
      .attr('fill', '#FFFFFF')
      .style('font-size', '24px') // Larger icon
      .style('opacity', 0)
      .text('💰') // Wallet emoji as icon
      .transition()
      .delay(300)
      .duration(500)
      .style('opacity', 1);

    // Service node label (in label layer for better z-index)
    labelLayer
      .append('text')
      .attr('x', serviceNode.x)
      .attr('y', serviceNode.y + serviceNode.radius + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#FFFFFF')
      .style('font-size', '16px') // Larger text
      .style('font-weight', 'bold')
      .style('opacity', 0)
      .text(serviceNode.label)
      .transition()
      .delay(500)
      .duration(500)
      .style('opacity', 1);

    // Draw agent nodes (in node layer)
    const agentGroups = nodeLayer
      .selectAll('.agent-node')
      .data(agentNodes)
      .enter()
      .append('g')
      .attr('class', 'agent-node')
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`);

    // Agent node glow
    agentGroups
      .append('circle')
      .attr('r', 0)
      .attr('fill', (d) => {
        switch (d.role) {
          case 'creator':
            return 'rgba(79, 70, 229, 0.3)'; // Blue
          case 'editor':
            return 'rgba(5, 150, 105, 0.3)'; // Green
          case 'factChecker':
            return 'rgba(219, 39, 119, 0.3)'; // Pink
          case 'researcher':
            return 'rgba(255, 87, 34, 0.3)'; // Orange
          case 'reviewer':
            return 'rgba(156, 39, 176, 0.3)'; // Purple
          case 'translator':
            return 'rgba(0, 188, 212, 0.3)'; // Cyan
          default:
            return 'rgba(79, 70, 229, 0.3)';
        }
      })
      .attr('filter', 'url(#glow-effect)')
      .transition()
      .delay((_d, i) => 300 + i * 200)
      .duration(800)
      .attr('r', (d) => d.radius * 1.4);

    // Add agent circles
    agentGroups
      .append('circle')
      .attr('r', 0)
      .attr('fill', 'url(#bg-gradient)')
      .attr('stroke', (d) => {
        switch (d.role) {
          case 'creator':
            return '#4F46E5'; // Blue
          case 'editor':
            return '#059669'; // Green
          case 'factChecker':
            return '#DB2777'; // Pink
          case 'researcher':
            return '#FF5722'; // Orange
          case 'reviewer':
            return '#9C27B0'; // Purple
          case 'translator':
            return '#00BCD4'; // Cyan
          default:
            return '#4F46E5';
        }
      })
      .attr('stroke-width', 3) // Thicker border
      .transition()
      .delay((_d, i) => 200 + i * 200)
      .duration(800)
      .attr('r', (d) => d.radius);

    // Agent node icons (in label layer to appear on top)
    agentNodes.forEach((agent, i) => {
      labelLayer
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('x', agent.x ?? 0)
        .attr('y', agent.y ?? 0)
        .attr('fill', '#FFFFFF')
        .style('font-size', '20px') // Larger icon
        .style('opacity', 0)
        .text(() => {
          switch (agent.role) {
            case 'creator':
              return '✍️';
            case 'editor':
              return '📝';
            case 'factChecker':
              return '🔍';
            case 'researcher':
              return '🔬';
            case 'reviewer':
              return '⭐';
            case 'translator':
              return '🌐';
            default:
              return '🤖';
          }
        })
        .transition()
        .delay(500 + i * 200)
        .duration(500)
        .style('opacity', 1);
    });

    // Add agent labels - slightly repositioned without percentage labels (in label layer)
    agentNodes.forEach((agent, i) => {
      labelLayer
        .append('text')
        .attr('x', agent.x ?? 0)
        .attr('y', (agent.y ?? 0) + agent.radius + 30) // More space from node
        .attr('text-anchor', 'middle')
        .attr('fill', '#FFFFFF')
        .style('font-size', '16px') // Larger text
        .style('font-weight', 'bold')
        .style('opacity', 0)
        .text(agent.label)
        .transition()
        .delay(600 + i * 200)
        .duration(500)
        .style('opacity', 1);
    });

    // Add tooltips for payment amounts instead of labels
    agentNodes
      .filter((agent) => agent.receivesBasePayment)
      .forEach((agent, index) => {
        // Add transparent overlay for better tooltip detection
        // Place in label layer to ensure it captures hover events
        const tooltipArea = labelLayer
          .append('circle')
          .attr('cx', agent.x ?? 0)
          .attr('cy', agent.y ?? 0)
          .attr('r', agent.radius + 10) // Slightly larger than the node for easier hovering
          .attr('fill', 'transparent')
          .attr('class', `agent-tooltip-area-${index}`)
          .attr('pointer-events', 'all') // Ensure it captures pointer events
          .style('cursor', 'pointer');

        // Create tooltip div (hidden initially)
        const tooltip = d3
          .select('body')
          .append('div')
          .attr('class', `tooltip-${index}`)
          .style('position', 'absolute')
          .style('background-color', 'rgba(0, 0, 0, 0.9)')
          .style('border', () => {
            switch (agent.role) {
              case 'creator':
                return '2px solid #4F46E5';
              case 'editor':
                return '2px solid #059669';
              case 'factChecker':
                return '2px solid #DB2777';
              case 'researcher':
                return '2px solid #FF5722';
              case 'reviewer':
                return '2px solid #9C27B0';
              case 'translator':
                return '2px solid #00BCD4';
              default:
                return '2px solid #4F46E5';
            }
          })
          .style('border-radius', '8px')
          .style('padding', '10px')
          .style('color', 'white')
          .style('font-weight', 'bold')
          .style('font-size', '14px')
          .style('box-shadow', '0 4px 12px rgba(0, 0, 0, 0.5)')
          .style('pointer-events', 'none')
          .style('opacity', 0)
          .style('transition', 'opacity 0.2s');

        // Add tooltip content
        tooltip.html(`
        <div>
          <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <span style="font-size: 16px; margin-right: 6px;">${
              agent.role === 'creator'
                ? '✍️'
                : agent.role === 'editor'
                  ? '📝'
                  : agent.role === 'factChecker'
                    ? '🔍'
                    : agent.role === 'researcher'
                      ? '🔬'
                      : agent.role === 'reviewer'
                        ? '⭐'
                        : agent.role === 'translator'
                          ? '🌐'
                          : '🤖'
            }</span>
            <span style="font-size: 16px;">${agent.label}</span>
          </div>
          <div style="color: #16a34a; margin-bottom: 2px;">+${agent.amount.toFixed(8)} ${agent.token}</div>
          <div style="font-size: 12px; opacity: 0.8;">${agent.percentage}% of total payments</div>
        </div>
      `);

        // Add mouse event listeners for tooltip
        tooltipArea
          .on('mouseover', (event) => {
            tooltip
              .style('left', `${event.pageX + 15}px`)
              .style('top', `${event.pageY - 20}px`)
              .style('opacity', 1);

            // Highlight the agent node on hover (without transition to avoid errors)
            d3.select(agentGroups.nodes()[index])
              .select('circle:nth-child(2)') // Select the main circle
              .attr('stroke-width', 5);
          })
          .on('mousemove', (event) => {
            tooltip.style('left', `${event.pageX + 15}px`).style('top', `${event.pageY - 20}px`);
          })
          .on('mouseout', () => {
            tooltip.style('opacity', 0);

            // Remove highlight (without transition to avoid errors)
            d3.select(agentGroups.nodes()[index])
              .select('circle:nth-child(2)') // Select the main circle
              .attr('stroke-width', 3);
          })
          // Add a simpler indicator for hover functionality
          .attr('r', agent.radius + 10);

        // Pulse effect using interval instead of transition to avoid errors
        const pulseIndicator = window.setInterval(() => {
          // Check if element exists to avoid errors on unmounting
          if (document.querySelector(`.agent-tooltip-area-${index}`)) {
            const currentR = Number.parseFloat(tooltipArea.attr('r'));
            const newR = currentR === agent.radius + 10 ? agent.radius + 15 : agent.radius + 10;
            tooltipArea.attr('r', newR);
          } else {
            window.clearInterval(pulseIndicator);
          }
        }, 1800);

        // Track interval for cleanup
        activeIntervalsRef.current.push(pulseIndicator);
      });

    // Animate payment markers - tokens moving along the paths
    agentNodes
      .filter((agent) => agent.receivesBasePayment)
      .forEach((agent, index) => {
        const path = svg.select(`.payment-path-${index}`).node() as SVGPathElement;

        // Create multiple tokens moving along each path for a more dynamic effect
        const numTokens = 3;

        for (let i = 0; i < numTokens; i++) {
          // Create a group for each token so we can add a glow (in label layer for top z-index)
          const tokenGroup = labelLayer.append('g').attr('class', `payment-token-${index}-${i}`);

          // Token glow
          tokenGroup
            .append('circle')
            .attr('r', 8)
            .attr('fill', () => {
              switch (agent.role) {
                case 'creator':
                  return 'rgba(79, 70, 229, 0.6)';
                case 'editor':
                  return 'rgba(5, 150, 105, 0.6)';
                case 'factChecker':
                  return 'rgba(219, 39, 119, 0.6)';
                case 'researcher':
                  return 'rgba(255, 87, 34, 0.6)';
                case 'reviewer':
                  return 'rgba(156, 39, 176, 0.6)';
                case 'translator':
                  return 'rgba(0, 188, 212, 0.6)';
                default:
                  return 'rgba(79, 70, 229, 0.6)';
              }
            })
            .attr('filter', 'url(#glow-effect)');

          // Token circle
          tokenGroup.append('circle').attr('r', 4).attr('fill', '#FFFFFF');

          // Position the token at the start
          tokenGroup
            .attr('transform', `translate(${serviceNode.x}, ${serviceNode.y})`)
            .style('opacity', 0);

          // Use setTimeout for staggered token animation start
          const tokenDelay = window.setTimeout(
            () => {
              // Show the token
              tokenGroup.style('opacity', 1);

              // Animate token along path using interval instead of transition
              let progress = 0;
              const step = 0.02; // smaller for smoother animation

              const tokenAnimation = window.setInterval(() => {
                // Update progress
                progress += step;

                // Check if animation is complete
                if (progress >= 1) {
                  // Stop the animation
                  window.clearInterval(tokenAnimation);

                  // Fade out the token
                  tokenGroup.style('opacity', 0);
                  return;
                }

                // Calculate current position along the path
                if (!path) return;
                const point = path.getPointAtLength(path.getTotalLength() * progress);

                // Update token position
                tokenGroup.attr('transform', `translate(${point.x}, ${point.y})`);
              }, 30); // 30ms interval for smooth animation

              // Track the interval for cleanup
              activeIntervalsRef.current.push(tokenAnimation);
            },
            800 + index * 200 + i * 300,
          ); // Staggered delay

          // Track the delay timeout for cleanup
          activeIntervalsRef.current.push(tokenDelay);
        }
      });

    // Draw agent-to-agent connections with better visibility
    for (let index = 0; index < agentToAgentPayments.length; index++) {
      const payment = agentToAgentPayments[index];
      // Find the source and target nodes with proper typing
      const sourceNode = agentNodes.find((node) => node.id === payment.agent);
      const targetNode = agentNodes.find((node) => node.id === payment.to);

      if (!sourceNode || !targetNode) return;

      // Create gradient for agent-to-agent path
      const gradientId = `agent-to-agent-gradient-${index}`;
      const gradient = defs
        .append('linearGradient')
        .attr('id', gradientId)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', sourceNode.x ?? 0)
        .attr('y1', sourceNode.y ?? 0)
        .attr('x2', targetNode.x ?? 0)
        .attr('y2', targetNode.y ?? 0);

      // Add gradient stops with colors based on service type
      let startColor = '';
      let endColor = '';
      let glowColor = '';

      // Get colors based on source and target roles
      switch (sourceNode.role) {
        case 'creator':
          startColor = '#4F46E5'; // Blue
          break;
        case 'editor':
          startColor = '#059669'; // Green
          break;
        default:
          startColor = '#6366F1'; // Indigo
      }

      switch (targetNode.role) {
        case 'researcher':
          endColor = '#FF5722'; // Orange
          glowColor = '#FF5722';
          break;
        case 'editor':
          endColor = '#059669'; // Green
          glowColor = '#059669';
          break;
        case 'reviewer':
          endColor = '#9C27B0'; // Purple
          glowColor = '#9C27B0';
          break;
        default:
          endColor = '#6366F1'; // Indigo
          glowColor = '#6366F1';
      }

      gradient.append('stop').attr('offset', '0%').attr('stop-color', startColor);

      gradient.append('stop').attr('offset', '100%').attr('stop-color', endColor);

      // Create a curvy path between agents with improved visual style
      const controlPoint = {
        x: ((sourceNode.x ?? 0) + (targetNode.x ?? 0)) / 2 + (Math.random() * 30 - 15),
        y: ((sourceNode.y ?? 0) + (targetNode.y ?? 0)) / 2 + (Math.random() * 30 - 15),
      };

      // Create a dashed path for agent-to-agent payments with glow effect (in connection layer)
      connectionLayer
        .append('path')
        .attr(
          'd',
          `M${sourceNode.x ?? 0},${sourceNode.y ?? 0} Q${controlPoint.x},${controlPoint.y} ${targetNode.x ?? 0},${targetNode.y ?? 0}`,
        )
        .attr('class', `agent-payment-glow-${index}`)
        .attr('stroke', glowColor)
        .attr('stroke-width', 6) // Thicker for visibility
        .attr('opacity', 0.4) // Increased opacity
        .attr('fill', 'none')
        .attr('filter', 'url(#glow-effect)')
        .attr('stroke-dasharray', '6,4') // Clearer dash pattern
        .attr('stroke-dashoffset', 0);

      // Draw the agent-to-agent payment path (in connection layer)
      const agentPath = connectionLayer
        .append('path')
        .attr(
          'd',
          `M${sourceNode.x ?? 0},${sourceNode.y ?? 0} Q${controlPoint.x},${controlPoint.y} ${targetNode.x ?? 0},${targetNode.y ?? 0}`,
        )
        .attr('class', `agent-payment-path-${index}`)
        .attr('stroke', `url(#${gradientId})`)
        .attr('stroke-width', 3) // Thicker line
        .attr('fill', 'none')
        .attr('stroke-linecap', 'round')
        .attr('stroke-dasharray', '5,3') // Clearer dash pattern
        .attr('opacity', 1) // Full opacity
        .attr('stroke-dashoffset', 0);

      // Add hover area over entire path for tooltip instead of a visible label
      if (payment.service) {
        const pathNode = agentPath.node() as SVGPathElement;
        if (pathNode) {
          const pathLength = pathNode.getTotalLength();

          // Create an invisible wider path that follows the original path for better hover detection
          // Place in label layer to ensure it's always on top and captures hover events
          const hoverPath = labelLayer
            .append('path')
            .attr(
              'd',
              `M${sourceNode.x ?? 0},${sourceNode.y ?? 0} Q${controlPoint.x},${controlPoint.y} ${targetNode.x ?? 0},${targetNode.y ?? 0}`,
            )
            .attr('stroke-width', 15) // Much wider than the visible path for easier hovering
            .attr('stroke', 'transparent')
            .attr('fill', 'none')
            .attr('pointer-events', 'all') // Ensure it captures pointer events
            .style('cursor', 'pointer');

          // Create service tooltip
          const serviceTooltip = d3
            .select('body')
            .append('div')
            .attr('class', `service-tooltip-${index}`)
            .style('position', 'absolute')
            .style('background-color', 'rgba(0, 0, 0, 0.9)')
            .style('border', `2px solid ${glowColor}`)
            .style('border-radius', '8px')
            .style('padding', '10px')
            .style('color', 'white')
            .style('font-weight', '500')
            .style('font-size', '14px')
            .style('box-shadow', '0 4px 12px rgba(0, 0, 0, 0.5)')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('transition', 'opacity 0.2s')
            .style('z-index', '1000')
            .html(`
              <div>
                <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">
                  <span style="color: ${glowColor};">${payment.service}</span>
                </div>
                <div style="margin-bottom: 3px;">
                  <span style="opacity: 0.8;">From:</span> <b>${sourceNode.label}</b> 
                  <span style="opacity: 0.8; margin-left: 5px;">To:</span> <b>${targetNode.label}</b>
                </div>
                <div style="color: #16a34a; margin-bottom: 5px; font-weight: bold;">
                  ${payment.tokenCount ? `${payment.tokenCount.toLocaleString()} tokens processed` : 'Service completed'}
                </div>
                <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 5px; margin-top: 5px;">
                  <div style="font-size: 12px;">Agent-to-agent micropayment via Radius</div>
                  <div style="font-size: 12px; opacity: 0.7; margin-top: 2px;">Tx: ${payment.transactionHash.substring(0, 10)}...</div>
                </div>
              </div>
            `);

          // Add event listeners to hover path
          hoverPath
            .on('mouseover', (event) => {
              // Show tooltip
              serviceTooltip
                .style('left', `${event.pageX + 15}px`)
                .style('top', `${event.pageY - 20}px`)
                .style('opacity', 1);

              // Highlight the service path without transition (avoids error)
              agentPath.attr('stroke-width', 5);
            })
            .on('mousemove', (event) => {
              serviceTooltip
                .style('left', `${event.pageX + 15}px`)
                .style('top', `${event.pageY - 20}px`);
            })
            .on('mouseout', () => {
              // Hide tooltip
              serviceTooltip.style('opacity', 0);

              // Remove path highlight without transition (avoids error)
              agentPath.attr('stroke-width', 3);
            });

          // Add a more visible subtle visual indicator to make it clear the path is interactive
          // Use the class instead of transition to avoid errors
          const pulseInterval = window.setInterval(() => {
            // Check if path still exists to avoid errors on component unmount
            if (document.querySelector(`.agent-payment-path-${index}`)) {
              // Toggle between normal and highlighted state with more noticeable change
              const currentWidth = agentPath.attr('stroke-width');
              agentPath.attr('stroke-width', currentWidth === '3' ? '5' : '3');

              // Also pulse opacity slightly to draw attention
              const currentOpacity = Number.parseFloat(agentPath.attr('opacity') || '1');
              agentPath.attr('opacity', currentOpacity === 1 ? 0.7 : 1);
            } else {
              // Clear interval if element is gone
              window.clearInterval(pulseInterval);
            }
          }, 1200); // Slightly faster pulse to draw attention

          // Track interval for cleanup
          activeIntervalsRef.current.push(pulseInterval);

          // Create a simpler version of the token animation using intervals instead of transitions
          // This avoids the D3 transition errors while still having the animation effect
          // Add to label layer so tokens are always on top
          const tokenGroup = labelLayer.append('g').attr('class', `agent-token-${index}`);

          // Token glow
          tokenGroup
            .append('circle')
            .attr('r', 6)
            .attr('fill', glowColor)
            .attr('opacity', 0.8)
            .attr('filter', 'url(#glow-effect)');

          // Token circle
          tokenGroup.append('circle').attr('r', 3).attr('fill', '#FFFFFF');

          // Start with token at source node and initially hidden
          tokenGroup
            .attr('transform', `translate(${sourceNode.x}, ${sourceNode.y})`)
            .style('opacity', 0);

          // Use setTimeout to start the animation after a delay
          const animationDelay = window.setTimeout(
            () => {
              tokenGroup.style('opacity', 1);

              // Track animation progress
              let progress = 0;
              const step = 0.02; // smaller for smoother animation

              // Create animation interval
              const animationInterval = window.setInterval(() => {
                // Update progress
                progress += step;

                // If animation complete
                if (progress >= 1) {
                  // Stop the animation
                  window.clearInterval(animationInterval);

                  // Fade out the token
                  tokenGroup.style('opacity', 0);
                  return;
                }

                // Calculate current position along the path
                const point = pathNode.getPointAtLength(pathLength * progress);

                // Update token position
                tokenGroup.attr('transform', `translate(${point.x}, ${point.y})`);
              }, 30); // 30ms interval for smooth animation

              // Track intervals for cleanup
              activeIntervalsRef.current.push(animationInterval);
            },
            1000 + index * 300,
          );

          // Track the delay timeout for cleanup
          activeIntervalsRef.current.push(animationDelay);
        }
      }
    }

    // Add a legend explaining the colors with improved styling
    const legendData = [
      { role: 'service', label: 'Service', color: '#F59E0B' },
      { role: 'creator', label: 'Creator', color: '#4F46E5' },
      { role: 'editor', label: 'Editor', color: '#059669' },
      { role: 'factChecker', label: 'Fact Checker', color: '#DB2777' },
      { role: 'researcher', label: 'Researcher', color: '#FF5722' },
      { role: 'reviewer', label: 'Reviewer', color: '#9C27B0' },
      { role: 'connection', label: 'Service Path', color: '#10B981' },
    ];

    // Calculate compact legend spacing
    const legendPadding = 20; // Padding on each side

    // Create a background for the legend (in label layer for top z-index)
    labelLayer
      .append('rect')
      .attr('x', legendPadding) // Left aligned with padding
      .attr('y', height - 45) // Position at bottom
      .attr('width', width - legendPadding * 2) // Full width minus padding
      .attr('height', 35) // Taller for better readability
      .attr('rx', 8) // Rounded corners
      .attr('fill', 'rgba(0, 0, 0, 0.6)') // Darker background for better contrast
      .attr('stroke', 'rgba(79, 70, 229, 0.5)')
      .attr('stroke-width', 1.5);

    // Create legend group with proper positioning - no extra offset
    const legendGroup = labelLayer
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${legendPadding + 20}, ${height - 27})`); // 20px from left edge for first item

    // Use a much more compact fixed spacing between items - no dynamic calculation
    const itemSpacing = 120; // Very compact fixed spacing - will place items closer together

    const legend = legendGroup
      .selectAll('.legend-item')
      .data(legendData)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (_d, i) => `translate(${i * itemSpacing}, 0)`); // Even spacing between items

    // Colored circle indicators - smaller for more compact layout
    legend
      .append('circle')
      .attr('r', 5) // Smaller circles for compact layout
      .attr('fill', (d) => d.color);

    // Legend text - optimized for very compact layout
    legend
      .append('text')
      .attr('x', 12) // Extra tight spacing
      .attr('y', 4)
      .attr('fill', '#FFFFFF')
      .style('font-size', '11px') // Even smaller text for better compact fit
      .style('font-weight', '500') // Medium weight for better readability
      .text((d) => d.label)
      // Ensure text doesn't overflow with aggressive truncation
      .each(function () {
        // Truncate text if needed for very compact layout
        const textElement = d3.select(this);
        const text = textElement.text();
        // More aggressive truncation with shorter max length
        if (text.length > 12) {
          textElement.text(`${text.substring(0, 10)}...`);
        }
      });
  }, [payments]);

  // Cleanup intervals and timeouts when component unmounts
  useEffect(() => {
    return () => {
      // Set the mounted flag to false
      isMountedRef.current = false;

      // Clear all intervals and timeouts
      for (const id of activeIntervalsRef.current) {
        window.clearInterval(id);
        window.clearTimeout(id); // Also clear any timeouts
      }
      activeIntervalsRef.current = [];

      // Remove any leftover tooltips from the DOM
      d3.selectAll("[class^='tooltip-']").remove();
      d3.selectAll("[class^='service-tooltip-']").remove();
      d3.selectAll('.hint-tooltip').remove();
    };
  }, []);

  return (
    <div className="mt-4 mb-10 bg-gradient-to-br from-gray-900/90 to-gray-950/90 p-6 rounded-xl border border-indigo-500/30 shadow-lg">
      <h3 className="text-2xl font-bold mb-4 text-white flex items-center">
        <span className="mr-3 text-amber-400">✨</span>
        Agentic AI Micropayments
        <span className="text-sm ml-3 font-normal text-gray-300 bg-black/30 px-3 py-1 rounded-full">
          Real-time transaction flow
        </span>
      </h3>
      <div className="rounded-xl overflow-hidden shadow-[0_0_30px_rgba(79,70,229,0.3)] border border-indigo-500/20">
        <svg ref={svgRef} width="100%" height="650" className="overflow-visible" />
      </div>
    </div>
  );
}
