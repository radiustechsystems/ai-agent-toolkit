"use client";

interface ContentDisplayProps {
  content: string;
}

export function ContentDisplay({ content }: ContentDisplayProps) {
  return (
    <div className="mt-6 bg-radius-dark/50 rounded-lg p-4 border border-radius-dark">
      <h3 className="text-lg font-semibold mb-3 text-radius-primary">Generated Content</h3>
      <div className="prose prose-invert max-w-none">
        {content.split("\n").map((paragraph, i) => (
          <p key={i} className="mb-3 last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
