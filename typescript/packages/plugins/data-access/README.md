# @radiustechsystems/ai-agent-plugin-data-access

This plugin enables AI agents to interact with token-gated resources using the DataAccess smart contract, handle HTTP 402 responses, and purchase access when needed - all autonomously without human intervention.

## Features

- Check if the agent has access to a token-gated API resource
- Purchase access to token-gated resources using ERC-1155 tokens
- Generate cryptographic signatures for EIP-712 challenge-response authentication
- Handle HTTP 402 Payment Required responses automatically
- Support JWT-based authentication after signature verification
- Automatic tier selection based on configurable strategy
- Token caching for efficient resource access

## Installation

```bash
npm install @radiustechsystems/ai-agent-plugin-data-access
# or
yarn add @radiustechsystems/ai-agent-plugin-data-access
# or
pnpm add @radiustechsystems/ai-agent-plugin-data-access
```

## Authentication Flow

This plugin implements the token-gated API authentication flow:

1. Agent attempts to access protected resource → gets 402 Payment Required
2. Agent purchases access token from DataAccess contract
3. Agent receives authorization challenge from server
4. Agent signs challenge and sends back signature
5. Server verifies signature and token ownership, issues JWT
6. Agent uses JWT for subsequent requests

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
        projectId: process.env.DATA_ACCESS_PROJECT_ID,
        maxPrice: BigInt(process.env.MAX_PRICE || "50000000000000000"), // 0.05 ETH max
        tierSelectionStrategy: 'cheapest', // Choose cheapest tier by default
        jwt: {
          secret: process.env.JWT_SECRET || 'default-secret-replace-in-production',
          signOpts: {
            algorithm: 'HS256',
            // Note: Don't include expiresIn here, as it will be explicitly set in the payload
          },
          verifyOpts: {
            algorithms: ['HS256'],
          }
        },
        domainName: 'My Data Service',
      })
    ]
  });
  
  return tools;
}
```

## Configuration Options

The plugin accepts the following configuration options:

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `contractAddress` | `string` | Yes | The address of the DataAccess contract |
| `projectId` | `string` | Yes | Unique project identifier used in challenges |
| `maxPrice` | `bigint` | No | Maximum price the agent is allowed to pay for access |
| `tierSelectionStrategy` | `'cheapest' \| 'longest' \| 'custom'` | No | Strategy for selecting which tier to purchase |
| `customTierSelector` | `(tiers: AccessTier[]) => Promise<AccessTier \| undefined>` | No | Custom tier selection function |
| `jwt` | `JWTOptions` | No | JWT configuration options (note: do not include `expiresIn` in `signOpts`) |
| `domainName` | `string` | No | Domain name to use in EIP-712 signatures |
| `autoRenew` | `boolean` | No | Automatically renew expired tokens |
| `defaultTierId` | `number` | No | Default tier ID to use when multiple tiers are available |

### JWT Configuration

When configuring JWT options, note that token expiration is handled through the token payload's `exp` claim, not through the `expiresIn` property in `signOpts`. This allows for more precise control over token expiration.

## HTTP 402 Handling Example

```typescript
import fetch from 'node-fetch';

async function fetchProtectedData(url) {
  const tools = await setupAgent();
  const response = await fetch(url);
  
  if (response.status === 402) {
    // Extract payment requirement details from 402 response
    const paymentInfo = await response.json();
    
    // Use the plugin to handle the 402 response
    const result = await tools.dataAccess.handleHttp402Response({
      resourceUrl: url,
      paymentInfo,
      // Optional: specify a tier to purchase
      // tierId: 1,
      // Optional: specify a maximum price to pay
      // maxPrice: "100000000000000000" // 0.1 ETH
    });
    
    if (!result.success) {
      throw new Error(`Failed to handle payment: ${result.reason}`);
    }
    
    // Retry the request with the authorization header
    const authenticatedResponse = await fetch(url, {
      headers: result.authHeaders
    });
    
    // Handle signature challenge if required
    if (authenticatedResponse.status === 401 && 
        authenticatedResponse.headers.get('WWW-Authenticate')?.startsWith('Signature')) {
      // Get the challenge from the response
      const challenge = await authenticatedResponse.json();
      
      // Generate signature for challenge
      const signResult = await tools.dataAccess.generateAccessSignature({
        resourceUrl: url,
        challenge: JSON.stringify(challenge)
      });
      
      // Final request with signature
      const finalResponse = await fetch(url, {
        headers: signResult.authHeaders
      });
      
      return finalResponse.json();
    }
    
    return authenticatedResponse.json();
  }
  
  return response.json();
}
```

## Available Tools

The plugin provides the following tools:

| Tool | Description |
|------|-------------|
| `checkDataAccess` | Check if the agent has access to a specific resource URL |
| `purchaseDataAccess` | Purchase access to a resource directly from the provider |
| `generateAccessSignature` | Generate a signature for a challenge received from a token-gated API |
| `verifyChallenge` | Verify a challenge signature |
| `handleHttp402Response` | Handle HTTP 402 Payment Required responses from token-gated APIs |
| `createAccessToken` | Create a JWT access token for a specific tier |

## Tier Selection Strategies

The plugin supports multiple strategies for selecting which access tier to purchase:

- `cheapest`: Select the cheapest tier that meets the requirements (default)
- `longest`: Select the tier with the longest TTL (time-to-live)
- `custom`: Use a custom function to select the tier based on your own criteria

## License

MIT
