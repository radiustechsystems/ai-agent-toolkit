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
    const height = 280;
    const centerY = height / 2;

    // Setup visualization area
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Create a defs section for gradients
    const defs = svg.append("defs");
    
    // Add a title explaining the visualization
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("fill", "#FFFFFF")
      .style("font-size", "14px")
      .text("Multi-Agent Payment Network");

    // Service node (center node that pays all agents)
    const serviceNode = {
      id: "service",
      label: "Payment Service",
      x: width / 2,
      y: centerY,
      radius: 15
    };

    // Create agent nodes arranged in a circle around service node
    const agentNodes = payments.map((payment, i) => {
      const angle = (2 * Math.PI * i) / payments.length;
      const radius = Math.min(width, height) * 0.35;
      return {
        id: payment.agent,
        label: payment.role.charAt(0).toUpperCase() + payment.role.slice(1),
        role: payment.role,
        x: serviceNode.x + radius * Math.cos(angle),
        y: serviceNode.y + radius * Math.sin(angle),
        amount: payment.amount,
        token: payment.token,
        to: payment.to,
        transactionHash: payment.transactionHash,
        radius: 10
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
      let startColor, endColor;
      
      switch (agent.role) {
      case "creator":
        startColor = "#6366F1";
        endColor = "#818CF8";
        break;
      case "editor":
        startColor = "#10B981";
        endColor = "#34D399";
        break;
      case "factChecker":
        startColor = "#F472B6";
        endColor = "#F9A8D4";
        break;
      default:
        startColor = "#6366F1";
        endColor = "#F472B6";
      }
      
      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", startColor);
        
      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", endColor);

      // Draw the payment path
      svg
        .append("path")
        .attr("d", `M${serviceNode.x},${serviceNode.y} L${agent.x},${agent.y}`)
        .attr("class", `payment-path-${index}`)
        .attr("stroke", `url(#${gradientId})`)
        .attr("stroke-width", 2 + (agent.amount * 10)) // Thicker lines for larger payments
        .attr("fill", "none")
        .attr("stroke-dasharray", function() {
          return this.getTotalLength();
        })
        .attr("stroke-dashoffset", function() {
          return this.getTotalLength();
        })
        .transition()
        .delay(index * 200)
        .duration(1000)
        .ease(d3.easeExpInOut)
        .attr("stroke-dashoffset", 0);
    });

    // Draw the service node
    const serviceGroup = svg
      .append("g")
      .attr("class", "service-node")
      .attr("transform", `translate(${serviceNode.x}, ${serviceNode.y})`);
      
    serviceGroup
      .append("circle")
      .attr("r", 0)
      .attr("fill", "#4F46E5")
      .attr("stroke", "#FFFFFF")
      .attr("stroke-width", 1)
      .transition()
      .duration(800)
      .attr("r", serviceNode.radius);
      
    serviceGroup
      .append("text")
      .attr("dy", serviceNode.radius + 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#FFFFFF")
      .style("font-size", "12px")
      .style("opacity", 0)
      .text(serviceNode.label)
      .transition()
      .delay(200)
      .duration(300)
      .style("opacity", 1);

    // Draw agent nodes
    const agentGroups = svg
      .selectAll(".agent-node")
      .data(agentNodes)
      .enter()
      .append("g")
      .attr("class", "agent-node")
      .attr("transform", d => `translate(${d.x}, ${d.y})`);

    // Add agent circles
    agentGroups
      .append("circle")
      .attr("r", 0)
      .attr("fill", (d) => {
        switch (d.role) {
        case "creator": return "#818CF8";
        case "editor": return "#34D399";
        case "factChecker": return "#F9A8D4";
        default: return "#6366F1";
        }
      })
      .attr("stroke", "#FFFFFF")
      .attr("stroke-width", 1)
      .transition()
      .delay((d, i) => 200 + i * 200)
      .duration(500)
      .attr("r", d => d.radius);

    // Add agent labels
    agentGroups
      .append("text")
      .attr("dy", d => d.radius + 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#FFFFFF")
      .style("font-size", "12px")
      .style("opacity", 0)
      .text(d => d.label)
      .transition()
      .delay((d, i) => 400 + i * 200)
      .duration(300)
      .style("opacity", 1);

    // Animate payment markers
    agentNodes.forEach((agent, index) => {
      const path = svg.select(`.payment-path-${index}`).node() as SVGPathElement;
      
      svg
        .append("circle")
        .attr("cx", serviceNode.x)
        .attr("cy", serviceNode.y)
        .attr("r", 4)
        .attr("fill", "white")
        .attr("class", `payment-marker-${index}`)
        .transition()
        .delay(500 + index * 200)
        .duration(1000)
        .ease(d3.easeExpInOut)
        .attrTween("cx", () => {
          return (t: number) => {
            const point = path.getPointAtLength(path.getTotalLength() * t);
            return String(point.x); // Alternative way to convert to string
          };
        })
        .attrTween("cy", () => {
          return (t: number) => {
            const point = path.getPointAtLength(path.getTotalLength() * t);
            return String(point.y); // Alternative way to convert to string
          };
        })
        .on("end", function() {
          // Highlight the payment arrival
          d3.select(this)
            .transition()
            .duration(300)
            .attr("r", 8)
            .attr("fill", function() {
              switch (agent.role) {
              case "creator": return "#818CF8";
              case "editor": return "#34D399";
              case "factChecker": return "#F9A8D4";
              default: return "#6366F1";
              }
            })
            .transition()
            .duration(300)
            .attr("r", 4)
            .attr("fill", "white");
          
          // Display transaction amount
          svg
            .append("text")
            .attr("x", agent.x)
            .attr("y", agent.y - agent.radius - 10)
            .attr("text-anchor", "middle")
            .attr("fill", "#FFFFFF")
            .style("font-size", "11px")
            .style("font-weight", "bold")
            .style("opacity", 0)
            .text(`+${agent.amount.toFixed(8)} ${agent.token}`)
            .transition()
            .duration(300)
            .style("opacity", 1);
        });
    });

  }, [payments]);

  return (
    <div className="mt-6 mb-6 bg-radius-dark/50 p-4 rounded-lg border border-radius-dark">
      <svg 
        ref={svgRef} 
        width="100%" 
        height="280" 
        className="overflow-visible"
      />
    </div>
  );
}
