/* eslint-disable max-len */
"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface PaymentVisualizationProps {
  payments: Array<{
    agent: string;
    role: string;
    amount: number;
    token: string;
    to: string;
    transactionHash: string;
  }>;
}

export function PaymentVisualization({ payments }: PaymentVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !payments.length) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = 450; // Increased height further (400 -> 450)
    const centerY = height / 2;

    // Setup visualization area
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Create a defs section for gradients and filters
    const defs = svg.append("defs");
    
    // Add glow filter for nodes
    const glowFilter = defs.append("filter")
      .attr("id", "glow-effect")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
      
    glowFilter.append("feGaussianBlur")
      .attr("stdDeviation", "4")
      .attr("result", "blur");
      
    glowFilter.append("feComposite")
      .attr("in", "SourceGraphic")
      .attr("in2", "blur")
      .attr("operator", "over");
    
    // Add a particle filter for animated paths
    const particleFilter = defs.append("filter")
      .attr("id", "particle-effect")
      .attr("x", "-20%")
      .attr("y", "-20%")
      .attr("width", "140%")
      .attr("height", "140%");
      
    particleFilter.append("feTurbulence")
      .attr("type", "fractalNoise")
      .attr("baseFrequency", "0.03")
      .attr("numOctaves", "3")
      .attr("seed", "3")
      .attr("result", "turbulence");
      
    particleFilter.append("feDisplacementMap")
      .attr("in", "SourceGraphic")
      .attr("in2", "turbulence")
      .attr("scale", "3")
      .attr("xChannelSelector", "R")
      .attr("yChannelSelector", "G");
    
    // Add a background with gradient
    defs.append("linearGradient")
      .attr("id", "bg-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%")
      .selectAll("stop")
      .data([
        { offset: "0%", color: "rgba(29, 35, 42, 0.7)" },
        { offset: "100%", color: "rgba(15, 23, 42, 0.8)" }
      ])
      .enter()
      .append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);
    
    // Add background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#bg-gradient)")
      .attr("rx", 8);
    
    // Add grid lines for visual appeal
    const gridSize = 30;
    const gridOpacity = 0.1;
    
    // Horizontal grid lines
    for (let y = 0; y < height; y += gridSize) {
      svg.append("line")
        .attr("x1", 0)
        .attr("y1", y)
        .attr("x2", width)
        .attr("y2", y)
        .attr("stroke", "#FFFFFF")
        .attr("stroke-width", 0.5)
        .attr("opacity", gridOpacity);
    }
    
    // Vertical grid lines
    for (let x = 0; x < width; x += gridSize) {
      svg.append("line")
        .attr("x1", x)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", height)
        .attr("stroke", "#FFFFFF")
        .attr("stroke-width", 0.5)
        .attr("opacity", gridOpacity);
    }
    
    // Add a title explaining the visualization - moved to upper left with background
    // Add a semi-transparent background for the title
    svg.append("rect")
      .attr("x", 20)
      .attr("y", 20)
      .attr("width", 280)
      .attr("height", 60)
      .attr("rx", 6)
      .attr("fill", "rgba(0, 0, 0, 0.4)")
      .attr("stroke", "rgba(79, 70, 229, 0.3)")
      .attr("stroke-width", 1);
    
    const titleGroup = svg.append("g")
      .attr("class", "title")
      .attr("transform", "translate(30, 40)"); // Positioned in upper left
      
    titleGroup.append("text")
      .attr("text-anchor", "start") // Left-aligned
      .attr("fill", "#FFFFFF")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Radius Micropayment Network");
      
    titleGroup.append("text")
      .attr("y", 24) // Spacing below title
      .attr("text-anchor", "start") // Left-aligned
      .attr("fill", "rgba(255, 255, 255, 0.7)")
      .style("font-size", "13px")
      .text("Real-time transactions between AI agents");

    // Service node (center node that pays all agents)
    const serviceNode = {
      id: "service",
      label: "Payment Service",
      x: width / 2,
      y: centerY,
      radius: 25
    };

    // Create agent nodes arranged around service node
    const agentNodes = payments.map((payment, i) => {
      let angle;
      
      // Special case for Creator + Editor workflow (exactly 2 agents)
      if (payments.length === 2) {
        // Place horizontally instead of vertically
        if (payment.role === "creator") {
          angle = 0; // Place creator on the right
        } else {
          angle = Math.PI; // Place editor on the left
        }
      } else {
        // Default circular arrangement for 1 or 3+ agents
        angle = (2 * Math.PI * i) / payments.length - Math.PI / 2; // Start from top
      }
      
      const radius = Math.min(width, height) * 0.35;
      
      // Calculate percentage distribution
      const percentage = (payment.amount / payments.reduce((sum, p) => sum + p.amount, 0) * 100).toFixed(0);
      
      return {
        id: payment.agent,
        label: payment.role.charAt(0).toUpperCase() + payment.role.slice(1),
        role: payment.role,
        x: serviceNode.x + radius * Math.cos(angle),
        y: serviceNode.y + radius * Math.sin(angle),
        amount: payment.amount,
        percentage,
        token: payment.token,
        to: payment.to,
        transactionHash: payment.transactionHash,
        radius: 18
      };
    });

    // Draw links between service and agent nodes
    agentNodes.forEach((agent, index) => {
      // Create gradient for each path
      const gradientId = `agent-gradient-${index}`;
      const gradient = defs
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", serviceNode.x)
        .attr("y1", serviceNode.y)
        .attr("x2", agent.x)
        .attr("y2", agent.y);
        
      // Add gradient stops with colors based on agent role
      let startColor, endColor, glowColor;
      
      switch (agent.role) {
      case "creator":
        startColor = "#F59E0B"; // Service node color (amber)
        endColor = "#4F46E5";   // Creator node color (blue)
        glowColor = "#4F46E5";
        break;
      case "editor":
        startColor = "#F59E0B"; // Service node color (amber)
        endColor = "#059669";   // Editor node color (green)
        glowColor = "#059669";
        break;
      case "factChecker":
        startColor = "#F59E0B"; // Service node color (amber)
        endColor = "#DB2777";   // Fact-checker node color (pink)
        glowColor = "#DB2777";
        break;
      default:
        startColor = "#F59E0B";
        endColor = "#4F46E5";
        glowColor = "#6366F1";
      }
      
      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", startColor);
        
      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", endColor);
      
      // Create a wider path for glow effect
      svg
        .append("path")
        .attr("d", `M${serviceNode.x},${serviceNode.y} Q${(serviceNode.x + agent.x) / 2 + (Math.random() * 20 - 10)},${(serviceNode.y + agent.y) / 2 + (Math.random() * 20 - 10)} ${agent.x},${agent.y}`)
        .attr("class", `payment-glow-${index}`)
        .attr("stroke", glowColor)
        .attr("stroke-width", 6 + (agent.amount * 15)) // Thicker lines for larger payments
        .attr("opacity", 0.2)
        .attr("fill", "none")
        .attr("filter", "url(#glow-effect)")
        .attr("stroke-dasharray", function() {
          return this.getTotalLength();
        })
        .attr("stroke-dashoffset", function() {
          return this.getTotalLength();
        })
        .transition()
        .delay(index * 200)
        .duration(1500)
        .ease(d3.easeExpInOut)
        .attr("stroke-dashoffset", 0);

      // Draw the payment path with a curve
      svg
        .append("path")
        .attr("d", `M${serviceNode.x},${serviceNode.y} Q${(serviceNode.x + agent.x) / 2 + (Math.random() * 20 - 10)},${(serviceNode.y + agent.y) / 2 + (Math.random() * 20 - 10)} ${agent.x},${agent.y}`)
        .attr("class", `payment-path-${index}`)
        .attr("stroke", `url(#${gradientId})`)
        .attr("stroke-width", 3 + (agent.amount * 12)) // Thicker lines for larger payments
        .attr("fill", "none")
        .attr("stroke-linecap", "round")
        .attr("stroke-dasharray", function() {
          return this.getTotalLength();
        })
        .attr("stroke-dashoffset", function() {
          return this.getTotalLength();
        })
        .transition()
        .delay(index * 200)
        .duration(1500)
        .ease(d3.easeExpInOut)
        .attr("stroke-dashoffset", 0);
    });

    // Draw the service node with glow effect
    const serviceGroup = svg
      .append("g")
      .attr("class", "service-node")
      .attr("transform", `translate(${serviceNode.x}, ${serviceNode.y})`);
    
    // Service node shadow/glow - changed to orange/gold color for differentiation
    serviceGroup
      .append("circle")
      .attr("r", 0)
      .attr("fill", "rgba(245, 158, 11, 0.4)") // Changed to amber/gold
      .attr("filter", "url(#glow-effect)")
      .transition()
      .duration(1000)
      .attr("r", serviceNode.radius * 1.4);
      
    // Service node itself
    serviceGroup
      .append("circle")
      .attr("r", 0)
      .attr("fill", "url(#bg-gradient)")
      .attr("stroke", "#F59E0B") // Changed to amber/gold
      .attr("stroke-width", 2)
      .transition()
      .duration(800)
      .attr("r", serviceNode.radius);
    
    // Service node inner ripple animation
    const ripple = serviceGroup
      .append("circle")
      .attr("r", serviceNode.radius * 0.7)
      .attr("fill", "none")
      .attr("stroke", "#FFFFFF")
      .attr("stroke-width", 1)
      .attr("opacity", 0.5);
    
    // Create a repeating ripple effect
    function pulseRipple() {
      ripple
        .attr("r", serviceNode.radius * 0.7)
        .attr("opacity", 0.5)
        .transition()
        .duration(2000)
        .attr("r", serviceNode.radius)
        .attr("opacity", 0)
        .on("end", pulseRipple);
    }
    
    pulseRipple();
    
    // Service node icon - a simple wallet/money icon
    serviceGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", "#FFFFFF")
      .style("font-size", "20px")
      .style("opacity", 0)
      .text("💰") // Wallet emoji as icon
      .transition()
      .delay(300)
      .duration(500)
      .style("opacity", 1);
      
    // Service node label
    serviceGroup
      .append("text")
      .attr("dy", serviceNode.radius + 20)
      .attr("text-anchor", "middle")
      .attr("fill", "#FFFFFF")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("opacity", 0)
      .text(serviceNode.label)
      .transition()
      .delay(500)
      .duration(500)
      .style("opacity", 1);

    // Draw agent nodes
    const agentGroups = svg
      .selectAll(".agent-node")
      .data(agentNodes)
      .enter()
      .append("g")
      .attr("class", "agent-node")
      .attr("transform", d => `translate(${d.x}, ${d.y})`);
    
    // Agent node glow
    agentGroups
      .append("circle")
      .attr("r", 0)
      .attr("fill", d => {
        switch (d.role) {
        case "creator": return "rgba(79, 70, 229, 0.3)";
        case "editor": return "rgba(5, 150, 105, 0.3)";
        case "factChecker": return "rgba(219, 39, 119, 0.3)";
        default: return "rgba(79, 70, 229, 0.3)";
        }
      })
      .attr("filter", "url(#glow-effect)")
      .transition()
      .delay((d, i) => 300 + i * 200)
      .duration(800)
      .attr("r", d => d.radius * 1.4);

    // Add agent circles
    agentGroups
      .append("circle")
      .attr("r", 0)
      .attr("fill", "url(#bg-gradient)")
      .attr("stroke", (d) => {
        switch (d.role) {
        case "creator": return "#4F46E5";
        case "editor": return "#059669";
        case "factChecker": return "#DB2777";
        default: return "#4F46E5";
        }
      })
      .attr("stroke-width", 2)
      .transition()
      .delay((d, i) => 200 + i * 200)
      .duration(800)
      .attr("r", d => d.radius);
    
    // Agent node icons
    agentGroups
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", "#FFFFFF")
      .style("font-size", "14px")
      .style("opacity", 0)
      .text(d => {
        switch (d.role) {
        case "creator": return "✍️";
        case "editor": return "📝";
        case "factChecker": return "🔍";
        default: return "🤖";
        }
      })
      .transition()
      .delay((d, i) => 500 + i * 200)
      .duration(500)
      .style("opacity", 1);

    // Add agent labels
    agentGroups
      .append("text")
      .attr("dy", d => d.radius + 22)
      .attr("text-anchor", "middle")
      .attr("fill", "#FFFFFF")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("opacity", 0)
      .text(d => d.label)
      .transition()
      .delay((d, i) => 600 + i * 200)
      .duration(500)
      .style("opacity", 1);
    
    // Add payment percentage label
    agentGroups
      .append("text")
      .attr("dy", d => d.radius + 42)
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(255, 255, 255, 0.8)")
      .style("font-size", "12px")
      .style("opacity", 0)
      .text(d => `${d.percentage}% Share`)
      .transition()
      .delay((d, i) => 700 + i * 200)
      .duration(500)
      .style("opacity", 1);

    // Animate payment markers - tokens moving along the paths
    agentNodes.forEach((agent, index) => {
      const path = svg.select(`.payment-path-${index}`).node() as SVGPathElement;
      
      // Create multiple tokens moving along each path for a more dynamic effect
      const numTokens = 3;
      
      for (let i = 0; i < numTokens; i++) {
        // Create a group for each token so we can add a glow
        const tokenGroup = svg.append("g")
          .attr("class", `payment-token-${index}-${i}`);
        
        // Token glow
        tokenGroup.append("circle")
          .attr("r", 8)
          .attr("fill", function() {
            switch (agent.role) {
            case "creator": return "rgba(79, 70, 229, 0.6)";
            case "editor": return "rgba(5, 150, 105, 0.6)";
            case "factChecker": return "rgba(219, 39, 119, 0.6)";
            default: return "rgba(79, 70, 229, 0.6)";
            }
          })
          .attr("filter", "url(#glow-effect)");
        
        // Token circle
        tokenGroup.append("circle")
          .attr("r", 4)
          .attr("fill", "#FFFFFF");
        
        // Position the token at the start
        tokenGroup
          .attr("transform", `translate(${serviceNode.x}, ${serviceNode.y})`)
          .style("opacity", 0);
        
        // Animate the token
        tokenGroup
          .transition()
          .delay(800 + index * 200 + i * 300) // Stagger the tokens
          .duration(50)
          .style("opacity", 1)
          .transition()
          .duration(1200)
          .ease(d3.easeExpInOut)
          .attrTween("transform", () => {
            return (t: number) => {
              const point = path.getPointAtLength(path.getTotalLength() * t);
              return `translate(${point.x}, ${point.y})`;
            };
          })
          .on("end", function() {
            // Highlight the payment arrival
            d3.select(this)
              .transition()
              .duration(300)
              .style("opacity", 0);
            
            // Only show payment amount for the last token
            if (i === numTokens - 1) {
              // Create a payment receipt effect with more padding, adjusted for position
              // Determine optimal receipt position based on agent position
              let receiptX = agent.x - 70;
              let receiptY = agent.y - agent.radius - 46;
              
              // For horizontal layout (creator + editor), adjust receipt position
              if (payments.length === 2) {
                if (agent.role === "creator") {
                  // Creator on right side - place receipt above
                  receiptY = agent.y - agent.radius - 46;
                } else if (agent.role === "editor") {
                  // Editor on left side - place receipt above
                  receiptY = agent.y - agent.radius - 46;
                }
              } else if (payments.length === 3) {
                // For 3 agents, adjust receipt positions to avoid overlap
                if (agent.role === "factChecker") {
                  // Fact-checker at bottom - place receipt to the side
                  receiptY = agent.y - 18; // Side-aligned
                  receiptX = agent.x + agent.radius + 10;
                }
              }
              
              const receiptBg = svg
                .append("rect")
                .attr("x", receiptX)
                .attr("y", receiptY)
                .attr("width", 140)
                .attr("height", 36)
                .attr("rx", 5)
                .attr("fill", "rgba(0, 0, 0, 0.7)")
                .attr("stroke", function() {
                  switch (agent.role) {
                  case "creator": return "#4F46E5";
                  case "editor": return "#059669";
                  case "factChecker": return "#DB2777";
                  default: return "#4F46E5";
                  }
                })
                .attr("stroke-width", 1)
                .style("opacity", 0);
              
              // Adjust text position to match receipt
              const receiptText = svg
                .append("text")
                .attr("x", receiptX + 70) // Center in the box
                .attr("y", receiptY + 22) // Vertically centered
                .attr("text-anchor", "middle")
                .attr("fill", "#FFFFFF")
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .style("opacity", 0)
                .text(`+${agent.amount.toFixed(8)} ${agent.token}`);
              
              // Animate receipt appearing
              receiptBg
                .transition()
                .duration(300)
                .style("opacity", 1);
              
              receiptText
                .transition()
                .duration(300)
                .style("opacity", 1);
            }
          });
      }
    });
    
    // Add a legend explaining the colors
    const legendData = [
      { role: "service", label: "Payment Service", color: "#F59E0B" },
      { role: "creator", label: "Creator Agent", color: "#4F46E5" },
      { role: "editor", label: "Editor Agent", color: "#059669" },
      { role: "factChecker", label: "Fact-Checker Agent", color: "#DB2777" }
    ];
    
    // Create a background for the legend - wider to accommodate 4 items
    svg.append("rect")
      .attr("x", width - 740)
      .attr("y", height - 40)
      .attr("width", 720)
      .attr("height", 30)
      .attr("rx", 6)
      .attr("fill", "rgba(0, 0, 0, 0.4)")
      .attr("stroke", "rgba(79, 70, 229, 0.3)")
      .attr("stroke-width", 1);
      
    const legendGroup = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 730}, ${height - 25})`); // Adjusted for wider legend
    
    const legend = legendGroup
      .selectAll(".legend-item")
      .data(legendData)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(${i * 170}, 0)`); // Reduced spacing (180 -> 170)
    
    legend
      .append("circle")
      .attr("r", 6)
      .attr("fill", d => d.color);
    
    legend
      .append("text")
      .attr("x", 12)
      .attr("y", 4)
      .attr("fill", "#FFFFFF")
      .style("font-size", "12px")
      .text(d => d.label);

  }, [payments]);

  return (
    <div className="mt-0 mb-8 bg-gradient-to-br from-radius-dark/40 to-radius-dark/20 p-5 rounded-xl border border-radius-dark/50 shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-radius-primary">
        <span className="mr-2">✨</span>
        Micropayment Visualization
        <span className="text-sm ml-2 font-normal text-gray-400">Real-time transaction flow</span>
      </h3>
      <div className="rounded-lg overflow-hidden shadow-[0_0_20px_rgba(79,70,229,0.25)]">
        <svg 
          ref={svgRef} 
          width="100%" 
          height="450" 
          className="overflow-visible"
        />
      </div>
    </div>
  );
}
