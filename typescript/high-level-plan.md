# Data Access Plugin Implementation Guide

## Introduction

This document provides guidance for implementing the `@radiustechsystems/ai-agent-plugin-data-access` package for the Radius TypeScript AI Agent Toolkit. This plugin enables AI agents to interact with token-gated resources using the DataAccess smart contract, handle HTTP 402 responses, and purchase access when needed - all autonomously without human intervention.

## Project Background

The Radius AI Agent Toolkit enables AI agents to interact with blockchain functionality through a consistent interface. The data-access plugin extends this toolkit to support token-gated API access using ERC-1155 tokens. This implementation follows the HTTP 402 Payment Required standard while leveraging Radius's high-performance blockchain for near-instant verification and token operations.

## Architecture Overview

The data-access plugin is designed to be framework-agnostic, working with any AI adapter supported by the Radius AI Agent Toolkit. It provides tools that allow AI agents to:

1. Check if they have access to a dataset
2. Purchase access to datasets
3. Generate cryptographic signatures for authentication
4. Handle HTTP 402 responses automatically

### Integration Points

The plugin interacts with these key components:

- **DataAccess Smart Contract**: An ERC-1155 implementation that manages access tokens
- **Radius SDK**: Provides core blockchain interaction capabilities
- **AI Agent Wallet**: Manages the agent's wallet and signing capabilities
- **HTTP 402 Responses**: Handles token-gated API responses

## Implementation Requirements

### 1. Plugin Structure

Create a TypeScript package that follows the standard plugin pattern used in the Radius AI Agent Toolkit:

```typescript
// Export the main plugin factory function
export function dataAccess(options: DataAccessOptions): Plugin {
  return new DataAccessPlugin(options);
}

// Implement the plugin class
class DataAccessPlugin extends PluginBase {
  // Implementation details
}
```

### 2. Core Interfaces

Define these key interfaces:

```typescript
// Plugin configuration options
export interface DataAccessOptions {
  contractAddress: string;                  // DataAccess contract address
  defaultTierId?: number;                   // Optional default tier to purchase
  autoRenew?: boolean;                      // Auto-renew expired tokens
  maxPrice?: bigint;                        // Maximum price willing to pay
  tierSelectionStrategy?: 'cheapest' | 'longest' | 'custom'; // How to choose tiers
  customTierSelector?: (tiers: AccessTier[]) => Promise<AccessTier | undefined>;
}

// Access tier information
export interface AccessTier {
  id: number;
  price: bigint;
  ttl: bigint;
  active: boolean;
}

// Result of access operations
export interface AccessResult {
  success: boolean;
  tierId?: number;
  jwt?: string;
  receipt?: any;
  reason?: string;
}
```

### 3. Required Tools

Implement the following tools:

1. **`checkDataAccess`**: Check if the agent has access to a specific dataset
2. **`purchaseDataAccess`**: Purchase access to a dataset directly from the provider
3. **`generateAccessSignature`**: Generate authentication signature for API requests
4. **`handleHttp402Response`**: Handle HTTP 402 Payment Required responses

### 4. DataAccess Contract Integration

The plugin must integrate with the DataAccess smart contract, which has these key methods:

- `hasAccess(address wallet, uint256 tokenId)`: Check if a wallet has access
- `purchase(uint256 tokenId)`: Purchase token for a specific tier
- `verify(uint256 id, string challenge, bytes signature)`: Verify a signed challenge
- `getAccessChallengeMessage(uint256 id, address wallet, uint256 timestamp)`: Generate challenge

For these interactions, use the DataAccess namespace from the Radius SDK:

```typescript
import { DataAccess } from "@radiustechsystems/sdk";

// Create instance
const tokenGating = new DataAccess.TokenGating(wallet.client, contractAddress);

// Check access
const hasAccess = await tokenGating.hasAccess(wallet.address.hex(), datasetId);

// Purchase access
const receipt = await tokenGating.purchaseAccess(wallet.signer, datasetId, price);
```

### 5. HTTP 402 Response Handling

The plugin must properly handle HTTP 402 Payment Required responses from token-gated APIs. These responses include:

```json
{
  "error": "Payment required",
  "datasetId": "123",
  "price": "5000000000000000",
  "metadataURI": "https://example.com/metadata/123",
  "message": "Purchase required to access this dataset"
}
```

The plugin should extract this information, purchase the required token, generate authentication headers, and retry the request.

## Implementation Guidance

### Core Plugin Implementation

Start with the basic implementation of the `DataAccessPlugin` class:

```typescript
import { PluginBase } from "@radiustechsystems/ai-agent-core";
import { DataAccess } from "@radiustechsystems/sdk";
import { RadiusWallet } from "@radiustechsystems/ai-agent-wallet";

export class DataAccessPlugin extends PluginBase {
  private contractAddress: string;
  private config: DataAccessOptions;
  private tokenCache: Map<number, { jwt: string, expires: number }>;
  
  constructor(options: DataAccessOptions) {
    super("dataAccess");
    this.contractAddress = options.contractAddress;
    this.config = options;
    this.tokenCache = new Map();
  }
  
  // Implement getTools() which returns the plugin's tools
  getTools() {
    return [
      // Tool implementations go here
    ];
  }
}
```

### Tool Implementation Examples

#### 1. Check Data Access Tool

```typescript
{
  name: "checkDataAccess",
  description: "Check if you have access to a specific dataset",
  parameters: {
    type: "object",
    properties: {
      datasetId: {
        type: "string",
        description: "The ID of the dataset to check access for"
      }
    },
    required: ["datasetId"]
  },
  execute: async ({ datasetId }, { wallet }) => {
    const tokenGating = new DataAccess.TokenGating(wallet.client, this.contractAddress);
    const hasAccess = await tokenGating.hasAccess(wallet.address.hex(), datasetId);
    
    if (!hasAccess) {
      const expiry = await tokenGating.getAccessExpiration(wallet.address.hex(), datasetId);
      return {
        hasAccess: false,
        reason: expiry > 0 ? "Access expired" : "No access token"
      };
    }
    
    return { hasAccess: true };
  }
}
```

#### 2. HTTP 402 Handler Tool

```typescript
{
  name: "handleHttp402Response",
  description: "Handle HTTP 402 Payment Required responses from token-gated APIs",
  parameters: {
    type: "object",
    properties: {
      datasetId: {
        type: "string",
        description: "The ID of the dataset requiring payment"
      },
      price: {
        type: "string",
        description: "The price in wei"
      }
    },
    required: ["datasetId", "price"]
  },
  execute: async ({ datasetId, price }, { wallet }) => {
    // Convert price to BigInt
    const priceValue = BigInt(price);
    
    // Check if price exceeds maximum allowed
    if (this.config.maxPrice && priceValue > this.config.maxPrice) {
      return {
        success: false,
        reason: `Price ${price} exceeds maximum allowed price ${this.config.maxPrice.toString()}`
      };
    }
    
    // Get TokenGating instance
    const tokenGating = new DataAccess.TokenGating(wallet.client, this.contractAddress);
    
    // Purchase the token
    const receipt = await tokenGating.purchaseAccess(wallet.signer, datasetId, priceValue);
    
    // Generate signature for access
    const timestamp = Math.floor(Date.now() / 1000);
    const message = await tokenGating.getAccessChallengeMessage(
      datasetId,
      wallet.address.hex(),
      timestamp
    );
    const signature = await wallet.signer.signMessage(message);
    
    return {
      success: true,
      transactionHash: receipt.txHash.hex(),
      authHeaders: {
        'x-wallet-address': wallet.address.hex(),
        'x-wallet-signature': signature,
        'x-request-timestamp': timestamp.toString()
      }
    };
  }
}
```

## Usage Examples

### Basic Usage

Here's how the plugin would be used in an AI agent:

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

### HTTP 402 Handling Example

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

## Testing Guidelines

The plugin should be tested with these scenarios:

1. **Access Checking**: Verify the plugin correctly identifies when the agent has/doesn't have access
2. **Token Purchase**: Test the purchase flow with various price points
3. **HTTP 402 Handling**: Test the complete flow from 402 response to authenticated request
4. **Price Limits**: Ensure the maxPrice setting properly blocks too-expensive purchases
5. **Signature Generation**: Verify signatures are correctly generated and verified

## Development Notes

- All wallet interactions should use the RadiusWallet from the AI Agent Toolkit
- The plugin should work with any AI framework adapter (Vercel AI, LangChain, etc.)
- Error handling should be robust and provide clear feedback to the agent
- Keep track of tokens and their expiration to avoid unnecessary purchases

## Conclusion

This plugin enables AI agents to autonomously interact with token-gated resources, automatically handling authentication, purchasing access when needed, and managing HTTP 402 responses. By implementing this plugin, you'll extend the capabilities of the Radius AI Agent Toolkit to support a critical use case for AI agents in the data economy.

Please follow the TypeScript and package structure conventions used in the existing Radius AI Agent Toolkit repositories, ensuring proper typing, error handling, and documentation.
