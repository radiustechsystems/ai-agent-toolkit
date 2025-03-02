import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 md:p-24">
      <div className="z-10 max-w-5xl w-full">
        <h1 
          className={`
            text-4xl font-bold mb-6 
            bg-gradient-to-r from-radius-primary to-radius-secondary 
            bg-clip-text text-transparent
          `}
        >
          Radius AI Agent Micropayments
        </h1>
        
        <p className="text-xl mb-8">
          A revolutionary approach to AI content creation with autonomous agent collaboration & on-chain micropayments.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-radius-dark/30 rounded-xl p-6 border border-radius-dark">
            <h2 className="text-2xl font-semibold mb-4">Multi-Agent Workflow</h2>
            <p className="mb-4">
              Autonomous AI agents collaborate to create high-quality content:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>
                <span className="text-radius-primary font-medium">Creator Agent</span> - Generates original content
              </li>
              <li>
                <span className="text-radius-secondary font-medium">Editor Agent</span> - Refines and improves content
              </li>
              <li>
                <span className="text-radius-accent font-medium">Fact-Checker Agent</span>
                 - Ensures accuracy and reliability
              </li>
            </ul>
            <p className="text-sm text-gray-400">
              Each agent specializes in a specific task, working together to deliver superior results.
            </p>
          </div>
          
          <div className="bg-radius-dark/30 rounded-xl p-6 border border-radius-dark">
            <h2 className="text-2xl font-semibold mb-4">Blockchain Micropayments</h2>
            <p className="mb-4">
              Instant, fair compensation for AI agent contributions:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>Automatic payment based on contribution value</li>
              <li>Near-zero transaction fees on Radius blockchain</li>
              <li>Instant finality with no confirmation delays</li>
              <li>Transparent payment distribution and metrics</li>
            </ul>
            <p className="text-sm text-gray-400">
              Utilize the Radius blockchain for efficient, low-cost micropayments that scale.
            </p>
          </div>
        </div>
        
        <div className="bg-radius-dark/30 rounded-xl p-6 border border-radius-dark mb-12">
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-black/20 rounded-lg">
              <h3 className="text-lg font-medium mb-2 text-radius-primary">Autonomous Collaboration</h3>
              <p className="text-sm">
                Specialized AI agents work together seamlessly, each contributing unique skills to the final product.
              </p>
            </div>
            <div className="p-4 bg-black/20 rounded-lg">
              <h3 className="text-lg font-medium mb-2 text-radius-secondary">Value-Based Payments</h3>
              <p className="text-sm">
                Agents receive micropayments proportional to their contribution in the content creation process.
              </p>
            </div>
            <div className="p-4 bg-black/20 rounded-lg">
              <h3 className="text-lg font-medium mb-2 text-radius-accent">Real-time Visualization</h3>
              <p className="text-sm">
                See payments flow through the network in real-time with detailed performance metrics.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <Link
            href="/demo"
            className={`
              px-8 py-4 
              bg-radius-primary 
              hover:bg-radius-primary/80 
              text-white font-medium 
              rounded-lg 
              transition-colors 
              text-lg
            `}
          >
    Try the Demo
          </Link>
          <p className="mt-4 text-center text-gray-400 text-sm">
            Experience how multiple AI agents can collaborate and receive micropayments on the Radius blockchain.
          </p>
        </div>
      </div>
    </main>
  );
}
