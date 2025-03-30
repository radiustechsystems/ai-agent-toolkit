# @radiustechsystems/ai-agent-plugin-data-access

This plugin enables AI agents to interact with token-gated resources using the DataAccess smart contract, handle HTTP 402 responses, and purchase access when needed - all autonomously without human intervention.

## Features

- Check if the agent has access to a dataset
- Purchase access to datasets
- Generate cryptographic signatures for authentication
- Handle HTTP 402 responses automatically

## Installation

```bash
npm install @radiustechsystems/ai-agent-plugin-data-access
# or
yarn add @radiustechsystems/ai-agent-plugin-data-access
# or
pnpm add @radiustechsystems/ai-agent-plugin-data-access
```

## Usage

```typescript
import { createRadiusWallet } from "@radiustechsystems/ai-agent-wallet";
import { getOnChainTools } from "@radiustechsystems/ai-agent-adapter-vercel-ai";
import { dataAccess } from "@radiustechsystems/ai-agent-plugin-data-access";

async function setupAgent() {
  // Create a wallet for the AI agent
  const wallet = await createRadiusWallet({
    rpcUrl: process.env.RADIUS_ENDPOINT,
    privateKey: process.env.AGENT_PRIVATE_KEY
  });
  
  // Configure tools including our data access plugin
  const tools = await getOnChainTools({
    wallet,
    plugins: [
      dataAccess({
        contractAddress: process.env.DATA_ACCESS_CONTRACT_ADDRESS,
        maxPrice: BigInt(process.env.MAX_PRICE || "50000000000000000")
      })
    ]
  });
  
  return tools;
}
```

## HTTP 402 Handling Example

```typescript
async function fetchProtectedData(url, datasetId) {
  const tools = await setupAgent();
  const response = await fetch(url);
  
  if (response.status === 402) {
    // Extract payment requirement from response
    const paymentDetails = await response.json();
    
    // Use the toolkit to handle the 402 response
    const result = await tools.handleHttp402Response({
      datasetId: paymentDetails.datasetId,
      price: paymentDetails.price
    });
    
    if (!result.success) {
      throw new Error(`Failed to handle payment: ${result.reason}`);
    }
    
    // Retry the request with auth headers
    const authenticatedResponse = await fetch(url, {
      headers: result.authHeaders
    });
    
    return authenticatedResponse.json();
  }
  
  return response.json();
}
```

## License

MIT