import { Tool } from '@radiustechsystems/ai-agent-core';
import {
  ContractError,
  type RadiusWalletInterface,
  TransactionError,
} from '@radiustechsystems/ai-agent-wallet';
import type {
  CheckDataAccessParameters,
  GenerateAccessSignatureParameters,
  HandleHttp402ResponseParameters,
  PurchaseDataAccessParameters,
} from './parameters';
import type { AccessResult, AccessTier, DataAccessOptions } from './types';

/**
 * Service class for the DataAccess plugin
 * Provides functionality for handling token-gated API access
 */
export class DataAccessService {
  private contractAddress: string;
  private config: DataAccessOptions;
  private tokenCache: Map<string, { jwt: string; expires: number }>;

  constructor(options: DataAccessOptions) {
    this.contractAddress = options.contractAddress;
    this.config = options;
    this.tokenCache = new Map();
  }

  /**
   * Helper method to get data access contract instance
   * This is a mock implementation until the SDK is available
   */
  private getTokenGating(walletClient: RadiusWalletInterface) {
    // Mock implementation for now - will be replaced with SDK call once available
    return {
      hasAccess: async (address: string, datasetId: string) => {
        console.log(`Checking access for ${address} to ${datasetId}`);
        return false;
      },
      getAccessExpiration: async (address: string, datasetId: string) => {
        console.log(`Getting expiration for ${address} to ${datasetId}`);
        return 0;
      },
      getAccessTiers: async (datasetId: string) => {
        console.log(`Getting access tiers for ${datasetId}`);
        return [
          {
            id: 1,
            price: BigInt('10000000000000000'),
            ttl: BigInt(86400),
            active: true,
          },
        ];
      },
      purchaseAccess: async (signer: any, datasetId: string, price: bigint) => {
        console.log(`Purchasing access to ${datasetId} for ${price}`);
        return { txHash: { hex: () => '0x123' } };
      },
      getAccessChallengeMessage: async (datasetId: string, wallet: string, timestamp: number) => {
        return `Access challenge for dataset ${datasetId} by wallet ${wallet} at ${timestamp}`;
      },
    };
  }

  /**
   * Select the best tier based on the configured strategy
   */
  private async selectTier(
    tiers: AccessTier[],
    maxPrice?: bigint,
  ): Promise<AccessTier | undefined> {
    // Filter by price constraint if set
    const affordableTiers = tiers.filter(
      (tier) => tier.active && (!maxPrice || tier.price <= maxPrice),
    );

    if (affordableTiers.length === 0) {
      return undefined;
    }

    // Apply tier selection strategy
    switch (this.config.tierSelectionStrategy) {
      case 'cheapest':
        return affordableTiers.reduce((a, b) => (a.price < b.price ? a : b));

      case 'longest':
        return affordableTiers.reduce((a, b) => (a.ttl > b.ttl ? a : b));

      case 'custom':
        if (this.config.customTierSelector) {
          return this.config.customTierSelector(affordableTiers);
        }
        // Fall through to default if custom selector not provided

      default:
        // Default to cheapest
        return affordableTiers.reduce((a, b) => (a.price < b.price ? a : b));
    }
  }

  @Tool({
    description: 'Check if you have access to a specific dataset',
  })
  async checkDataAccess(
    walletClient: RadiusWalletInterface,
    parameters: CheckDataAccessParameters,
  ): Promise<{ hasAccess: boolean; reason?: string; expiry?: number }> {
    try {
      const tokenGating = this.getTokenGating(walletClient);
      const walletAddress = walletClient.getAddress();

      // Check if we have access in the cache first
      const cacheKey = `${walletAddress}:${parameters.datasetId}`;
      const cachedAccess = this.tokenCache.get(cacheKey);
      
      if (cachedAccess && cachedAccess.expires > Date.now()) {
        return {
          hasAccess: true,
          expiry: cachedAccess.expires,
        };
      }

      // Check on-chain access
      const hasAccess = await tokenGating.hasAccess(walletAddress, parameters.datasetId);

      if (!hasAccess) {
        const expiry = await tokenGating.getAccessExpiration(
          walletAddress,
          parameters.datasetId,
        );

        return {
          hasAccess: false,
          reason: expiry > 0 ? 'Access expired' : 'No access token',
          expiry: expiry > 0 ? Number(expiry) : undefined,
        };
      }

      return { hasAccess: true };
    } catch (error) {
      throw new ContractError(
        `Failed to check data access: ${error instanceof Error ? error.message : String(error)}`,
        this.contractAddress,
        'hasAccess',
      );
    }
  }

  @Tool({
    description: 'Purchase access to a dataset directly from the provider',
  })
  async purchaseDataAccess(
    walletClient: RadiusWalletInterface,
    parameters: PurchaseDataAccessParameters,
  ): Promise<AccessResult> {
    try {
      const tokenGating = this.getTokenGating(walletClient);
      const walletAddress = walletClient.getAddress();

      // If a specific tier ID is provided, use it
      if (parameters.tierId !== undefined) {
        // Purchase specified tier
        const tiers = await tokenGating.getAccessTiers(parameters.datasetId);
        const tier = tiers.find((t) => t.id === parameters.tierId);

        if (!tier) {
          return {
            success: false,
            reason: `Access tier ${parameters.tierId} not found`,
          };
        }

        const maxPrice = parameters.maxPrice
          ? BigInt(parameters.maxPrice)
          : this.config.maxPrice;

        // Check if the price exceeds maximum allowed
        if (maxPrice && tier.price > maxPrice) {
          return {
            success: false,
            reason: `Price ${tier.price.toString()} exceeds maximum allowed price ${maxPrice.toString()}`,
          };
        }

        // Purchase access (we're mocking the signer for now)
        const mockSigner = { signMessage: async (msg: string) => ({ signature: msg }) };
        const receipt = await tokenGating.purchaseAccess(
          mockSigner,
          parameters.datasetId,
          tier.price,
        );

        // Generate access signature
        const timestamp = Math.floor(Date.now() / 1000);
        const message = await tokenGating.getAccessChallengeMessage(
          parameters.datasetId,
          walletAddress,
          timestamp,
        );
        const signResult = await walletClient.signMessage(message);

        // Store in cache
        const expiryTime = Date.now() + Number(tier.ttl) * 1000;
        const jwt = Buffer.from(signResult.signature).toString('base64');
        this.tokenCache.set(`${walletAddress}:${parameters.datasetId}`, {
          jwt,
          expires: expiryTime,
        });

        return {
          success: true,
          tierId: tier.id,
          jwt,
          receipt: {
            transactionHash: receipt.txHash.hex(),
            price: tier.price.toString(),
            expiry: expiryTime,
          },
        };
      } else {
        // Select tier based on strategy
        const tiers = await tokenGating.getAccessTiers(parameters.datasetId);

        // Determine max price (parameter overrides config)
        const maxPrice = parameters.maxPrice
          ? BigInt(parameters.maxPrice)
          : this.config.maxPrice;

        const selectedTier = await this.selectTier(tiers, maxPrice);

        if (!selectedTier) {
          return {
            success: false,
            reason: 'No suitable access tier found',
          };
        }

        // Purchase selected tier (we're mocking the signer for now)
        const mockSigner = { signMessage: async (msg: string) => ({ signature: msg }) };
        const receipt = await tokenGating.purchaseAccess(
          mockSigner,
          parameters.datasetId,
          selectedTier.price,
        );

        // Generate access signature
        const timestamp = Math.floor(Date.now() / 1000);
        const message = await tokenGating.getAccessChallengeMessage(
          parameters.datasetId,
          walletAddress,
          timestamp,
        );
        const signResult = await walletClient.signMessage(message);

        // Store in cache
        const expiryTime = Date.now() + Number(selectedTier.ttl) * 1000;
        const jwt = Buffer.from(signResult.signature).toString('base64');
        this.tokenCache.set(`${walletAddress}:${parameters.datasetId}`, {
          jwt,
          expires: expiryTime,
        });

        return {
          success: true,
          tierId: selectedTier.id,
          jwt,
          receipt: {
            transactionHash: receipt.txHash.hex(),
            price: selectedTier.price.toString(),
            expiry: expiryTime,
          },
        };
      }
    } catch (error) {
      throw new TransactionError(
        `Failed to purchase data access: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Tool({
    description: 'Generate authentication signature for API requests to a dataset',
  })
  async generateAccessSignature(
    walletClient: RadiusWalletInterface,
    parameters: GenerateAccessSignatureParameters,
  ): Promise<{ jwt: string; authHeaders: Record<string, string> }> {
    try {
      const tokenGating = this.getTokenGating(walletClient);
      const walletAddress = walletClient.getAddress();

      // Check cache first
      const cacheKey = `${walletAddress}:${parameters.datasetId}`;
      const cachedAccess = this.tokenCache.get(cacheKey);
      
      if (cachedAccess && cachedAccess.expires > Date.now()) {
        return {
          jwt: cachedAccess.jwt,
          authHeaders: {
            'x-wallet-address': walletAddress,
            'x-access-token': cachedAccess.jwt,
          },
        };
      }

      // Generate fresh signature
      const timestamp = Math.floor(Date.now() / 1000);
      const message = await tokenGating.getAccessChallengeMessage(
        parameters.datasetId,
        walletAddress,
        timestamp,
      );
      
      const signResult = await walletClient.signMessage(message);
      const jwt = Buffer.from(signResult.signature).toString('base64');

      // Cache for future use (with short expiry since we don't know the actual expiry)
      this.tokenCache.set(cacheKey, {
        jwt,
        expires: Date.now() + 30 * 60 * 1000, // 30 minutes default
      });

      return {
        jwt,
        authHeaders: {
          'x-wallet-address': walletAddress,
          'x-wallet-signature': signResult.signature,
          'x-request-timestamp': timestamp.toString(),
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to generate access signature: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Tool({
    description: 'Handle HTTP 402 Payment Required responses from token-gated APIs',
  })
  async handleHttp402Response(
    walletClient: RadiusWalletInterface,
    parameters: HandleHttp402ResponseParameters,
  ): Promise<{
    success: boolean;
    reason?: string;
    authHeaders?: Record<string, string>;
    transactionHash?: string;
  }> {
    try {
      // Convert price to BigInt
      const priceValue = BigInt(parameters.price);
      const walletAddress = walletClient.getAddress();

      // Check if price exceeds maximum allowed
      if (this.config.maxPrice && priceValue > this.config.maxPrice) {
        return {
          success: false,
          reason: `Price ${parameters.price} exceeds maximum allowed price ${this.config.maxPrice.toString()}`,
        };
      }

      // Get TokenGating instance
      const tokenGating = this.getTokenGating(walletClient);

      // Purchase the token (we're mocking the signer for now)
      const mockSigner = { signMessage: async (msg: string) => ({ signature: msg }) };
      const receipt = await tokenGating.purchaseAccess(
        mockSigner,
        parameters.datasetId,
        priceValue,
      );

      // Generate signature for access
      const timestamp = Math.floor(Date.now() / 1000);
      const message = await tokenGating.getAccessChallengeMessage(
        parameters.datasetId,
        walletAddress,
        timestamp,
      );
      const signResult = await walletClient.signMessage(message);

      // Cache the token
      const jwt = Buffer.from(signResult.signature).toString('base64');
      this.tokenCache.set(`${walletAddress}:${parameters.datasetId}`, {
        jwt,
        expires: Date.now() + 3600 * 1000, // 1 hour default, will be updated when we get actual expiry
      });

      return {
        success: true,
        transactionHash: receipt.txHash.hex(),
        authHeaders: {
          'x-wallet-address': walletAddress,
          'x-wallet-signature': signResult.signature,
          'x-request-timestamp': timestamp.toString(),
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new TransactionError(`Failed to handle HTTP 402 response: ${error.message}`);
      }
      throw new TransactionError(`Failed to handle HTTP 402 response: ${String(error)}`);
    }
  }
}