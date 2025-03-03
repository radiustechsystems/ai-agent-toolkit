"use client";

interface ContentDisplayProps {
  content: string;
}

export function ContentDisplay({ content }: ContentDisplayProps) {
  return (
    <div className="mt-6 bg-radius-dark/50 rounded-lg p-4 border border-radius-dark">
      <h3 className="text-lg font-semibold mb-3 text-radius-primary">
        Final Generated Content
        <span className="text-xs ml-2 text-gray-400">
          (From {content.length > 500 ? "Fact-Checker/Editor" : "Creator"} agent)
        </span>
      </h3>
      <div className="prose prose-invert max-w-none">
        {content.split("\n").map((paragraph, i) => (
          <p key={i} className="mb-3 last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-radius-dark/40 text-xs text-gray-400">
        <p className="italic">Note: This is the final content after processing through the entire agent workflow. 
        To see intermediate outputs from each agent, expand the agent details in the payment section.</p>
      </div>
    </div>
  );
}
