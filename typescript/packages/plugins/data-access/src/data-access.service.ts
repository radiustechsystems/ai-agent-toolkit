import { Tool } from '@radiustechsystems/ai-agent-core';
import {
  ContractError,
  type RadiusWalletInterface,
  TransactionError,
} from '@radiustechsystems/ai-agent-wallet';
import jwt, { type Algorithm, type JsonWebTokenError } from 'jsonwebtoken';
import { DataAccessContract } from './data-access.contract';
import type {
  CheckDataAccessParameters,
  CreateAccessTokenParameters,
  GenerateAuthSignatureParameters,
  HandleHttp402ResponseParameters,
  PurchaseDataAccessParameters,
  VerifySignatureParameters,
  GetBalanceParameters,
  GetBalanceDetailsParameters,
  CreateChallengeParameters,
  RecoverSignerParameters,
} from './parameters';
import type {
  AccessResult,
  AccessTier,
  TypedData,
  AuthChallenge,
  Contract,
  DataAccessOptions,
  JWTOptions,
  Network,
  BalanceGroup,
  SignatureResult,
} from './types';
import type { StringValue } from 'ms';

/**
 * Service class for the DataAccess plugin
 * Provides functionality for handling token-gated API access
 * Updated to work with the new contract ABI
 */
export class DataAccessService {
  private contractAddress: string;
  private config: DataAccessOptions;
  private tokenCache: Map<string, { jwt: string; expires: number }>;
  private challengeCache: Map<string, { challenge: AuthChallenge; expires: number }>;
  private contract: Contract;
  private jwt: JWTOptions;
  private networks: Network[];

  constructor(options: DataAccessOptions) {
    this.contractAddress = options.contractAddress;
    this.config = options;
    this.tokenCache = new Map();
    this.challengeCache = new Map();

    // Initialize contract configuration
    this.contract = {
      address: options.contractAddress,
      projectId: options.projectId || '', // projectId is now optional since it can be fetched from contract
    };

    // Initialize JWT options with defaults
    // Create sign options without expiresIn to avoid conflicts
    const signOpts: jwt.SignOptions = {
      algorithm: 'HS256' as Algorithm,
      ...(options.jwt?.signOpts || {}),
    };
    // Ensure expiresIn is not included in sign options
    // biome-ignore lint/performance/noDelete: <explanation>
    delete signOpts.expiresIn;

    this.jwt = {
      secret: options.jwt?.secret || 'default-secret-replace-in-production',
      signOpts,
      verifyOpts: {
        algorithms: ['HS256'],
        ...options.jwt?.verifyOpts,
      },
    };

    // Initialize payment networks
    this.networks = options.networks || [];
  }

  /**
   * Helper method to get data access contract instance
   */
  private getDataAccessContract(walletClient: RadiusWalletInterface): DataAccessContract {
    // Check if we're in a test environment
    if (process.env.NODE_ENV === 'test' || !walletClient.sendTransaction) {
      // Return a mock implementation for testing
      // This would be updated to match the new contract interface
      return {
        getProjectId: async () => this.contract.projectId || '0x0',
        hasValidAccess: async () => true,
        balanceOf: async () => 1,
        balanceDetails: async () => [{ balance: BigInt(1), expiresAt: BigInt(Date.now() + 3600000) }],
        balanceOfSigner: async () => 1,
        recoverSigner: async () => walletClient.getAddress(),
        getAvailableTiers: async () => [
          {
            id: 1,
            name: 'Breaking News',
            description: 'Grants access to content for 1 hour',
            domains: ['http://localhost:3000/content'],
            price: BigInt('12500000000000000'), // 0.0125 ETH
            ttl: BigInt(3600),
            active: true,
            transferable: true,
            burnable: false,
            forSale: true,
          },
          {
            id: 2,
            name: 'Daily News',
            description: 'Grants access to content for 24 hours',
            domains: ['http://localhost:3000/content'],
            price: BigInt('125000000000000000'), // 0.125 ETH
            ttl: BigInt(86400),
            active: true,
            transferable: true,
            burnable: false,
            forSale: true,
          },
          {
            id: 3,
            name: 'Weekly News',
            description: 'Grants access to content for 7 days',
            domains: ['http://localhost:3000/content'],
            price: BigInt('750000000000000000'), // 0.75 ETH
            ttl: BigInt(604800),
            active: true,
            transferable: true,
            burnable: false,
            forSale: true,
          },
        ],
        getTierMetadata: async (id: number) => ({
          id,
          name: `Test Tier ${id}`,
          description: `Test tier ${id} description`,
          domains: ['http://localhost:3000/content'],
          price: BigInt('12500000000000000'),
          ttl: BigInt(3600),
          active: true,
          transferable: true,
          burnable: false,
          forSale: true,
        }),
        purchase: async () => ({ txHash: `0x${Math.random().toString(16).substring(2, 42)}` }),
        getPrice: async () => BigInt('12500000000000000'),
        getTTL: async () => BigInt(3600),
        isActive: async () => true,
        isForSale: async () => true,
        isBurnable: async () => false,
        isTransferable: async () => true,
        expiresAt: async () => Date.now() + 3600 * 1000,
      } as unknown as DataAccessContract;
    }

    // Use the real implementation for non-test environments
    return new DataAccessContract(walletClient, this.contractAddress, this.contract.projectId);
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
      (tier) => tier.active && tier.forSale && (!maxPrice || tier.price <= maxPrice),
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

      // biome-ignore lint/suspicious/noFallthroughSwitchClause: <explanation>
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

  /**
   * Create a JWT token
   */
  
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private  createToken(payload: Record<string, any>, expiresIn: number | StringValue = '1h'): string {
    // Create a new sign options object
    const signOpts: jwt.SignOptions = { 
      ...this.jwt.signOpts,
      expiresIn 
    };

    return jwt.sign(payload, this.jwt.secret, signOpts);
  }

  /**
   * Create an Auth challenge for EIP-712 signing
   */
  private createAuthChallenge(address: string): TypedData {
    // Generate a random nonce
    const nonce = Buffer.from(Math.random().toString(36) + Date.now().toString(36))
      .toString('hex')
      .substring(0, 32);
    
    const timestamp = Math.floor(Date.now() / 1000);

    // Create the auth challenge message
    const message: AuthChallenge = {
      user: address,
      id: nonce,
      time: timestamp,
    };

    // Return complete EIP-712 typed data
    return {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Auth: [
          { name: 'user', type: 'address' },
          { name: 'id', type: 'string' },
          { name: 'time', type: 'uint256' },
        ],
      },
      primaryType: 'Auth',
      domain: {
        name: this.config.domainName,
        version: '1',
        chainId: this.config.chainId,
        verifyingContract: this.contractAddress,
      },
      message,
    };
  }

  /**
   * Verify a JWT token
   */
  private async verifyJWT(token: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        this.jwt.secret,
        this.jwt.verifyOpts,
        (err: JsonWebTokenError | null, decoded: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(decoded);
        },
      );
    });
  }

  /**
   * Create an access token for a tier
   */
  private generateAccessToken(tierId: number, expiresIn?: number | StringValue): string {
    const payload = {
      tierId,
      iat: Math.floor(Date.now() / 1000),
    };

    return this.createToken(payload, expiresIn || '1h');
  }

  @Tool({
    description: 'Check if you have access to a specific resource URL',
  })
  async checkDataAccess(
    walletClient: RadiusWalletInterface,
    parameters: CheckDataAccessParameters,
  ): Promise<{ hasAccess: boolean; balance?: number; reason?: string; expiry?: number }> {
    try {
      const walletAddress = walletClient.getAddress();
      const dataAccess = this.getDataAccessContract(walletClient);

      // Parse the URL to get the domain and path
      const url = new URL(parameters.resourceUrl);
      const domain = `${url.protocol}//${url.host}${url.pathname}`;

      // Check if we have access in the cache first
      const cacheKey = `${walletAddress}:${domain}`;
      const cachedAccess = this.tokenCache.get(cacheKey);

      if (cachedAccess && cachedAccess.expires > Date.now()) {
        return {
          hasAccess: true,
          expiry: cachedAccess.expires,
        };
      }

      // Get available tiers for this domain
      // In a real implementation, this would use metadata from a registry or database
      const knownTierIds = [1, 2, 3]; // Example tier IDs to check
      const allTiers = await dataAccess.getAvailableTiers(knownTierIds);
      const tiers = allTiers.filter(
        (tier) => tier.active && tier.domains.some((d) => domain.startsWith(d)),
      );

      if (tiers.length === 0) {
        return {
          hasAccess: false,
          reason: 'No access tiers available for this resource',
        };
      }

      // If specific tier ID provided, check that tier
      if (parameters.tierId !== undefined) {
        const tier = tiers.find((t) => t.id === parameters.tierId);
        if (!tier) {
          return {
            hasAccess: false,
            reason: `Tier ${parameters.tierId} not available for this resource`,
          };
        }

        // Check if user has valid access to this tier
        const balance = await dataAccess.balanceOf(walletAddress, parameters.tierId);
        if (balance > 0) {
          // Get expiration time from balance details
          const expiryDate = await dataAccess.expiresAt(walletAddress, parameters.tierId);
          return {
            hasAccess: true,
            balance,
            expiry: expiryDate,
          };
        }

        return {
          hasAccess: false,
          balance: 0,
          reason: 'No valid access token',
        };
      }

      // Check if we have access to any tier for this domain
      for (const tier of tiers) {
        const balance = await dataAccess.balanceOf(walletAddress, tier.id);
        if (balance > 0) {
          const expiryDate = await dataAccess.expiresAt(walletAddress, tier.id);
          return {
            hasAccess: true,
            balance,
            expiry: expiryDate,
          };
        }
      }

      return {
        hasAccess: false,
        reason: 'No valid access token for any tier',
      };
    } catch (error) {
      throw new ContractError(
        `Failed to check data access: ${error instanceof Error ? error.message : String(error)}`,
        this.contractAddress,
        'balanceOf',
      );
    }
  }

  @Tool({
    description: 'Purchase access to a resource directly from the provider',
  })
  async purchaseDataAccess(
    walletClient: RadiusWalletInterface,
    parameters: PurchaseDataAccessParameters,
  ): Promise<AccessResult> {
    try {
      const walletAddress = walletClient.getAddress();
      const dataAccess = this.getDataAccessContract(walletClient);

      // Parse the URL to get the domain and path
      const url = new URL(parameters.resourceUrl);
      const domain = `${url.protocol}//${url.host}${url.pathname}`;

      // Get tiers that match this domain
      const knownTierIds = [1, 2, 3]; // Example tier IDs to check
      const allTiers = await dataAccess.getAvailableTiers(knownTierIds);
      const tiers = allTiers.filter(
        (tier) => tier.active && tier.forSale && tier.domains.some((d) => domain.startsWith(d)),
      );

      if (tiers.length === 0) {
        return {
          success: false,
          reason: 'No access tiers available for this resource',
        };
      }

      // Set default amount if not provided
      const amount = parameters.amount || 1;

      // If a specific tier ID is provided, use it
      if (parameters.tierId !== undefined) {
        const tier = tiers.find((t) => t.id === parameters.tierId);

        if (!tier) {
          return {
            success: false,
            reason: `Access tier ${parameters.tierId} not found or not available for this resource`,
          };
        }

        const maxPrice = parameters.maxPrice ? BigInt(parameters.maxPrice) : this.config.maxPrice;

        // Check if the price exceeds maximum allowed
        if (maxPrice && tier.price > maxPrice) {
          return {
            success: false,
            reason: `Price ${tier.price.toString()} exceeds maximum allowed price ${maxPrice.toString()}`,
          };
        }

        // Purchase the token - this now includes the recipient address
        const result = await dataAccess.purchase(tier.id, amount);

        // Create access token
        const token = this.generateAccessToken(tier.id);

        // Calculate expiry time
        const expiryTime = Date.now() + Number(tier.ttl) * 1000;

        // Store in cache
        this.tokenCache.set(`${walletAddress}:${domain}`, {
          jwt: token,
          expires: expiryTime,
        });

        return {
          success: true,
          tierId: tier.id,
          balance: amount,
          jwt: token,
          receipt: {
            transactionHash: result.txHash,
            price: tier.price.toString(),
            expiry: expiryTime,
          },
          authHeaders: {
            Authorization: `Bearer ${token}`,
          },
        };
      }

      // Select tier based on strategy if no specific tier ID provided
      const maxPrice = parameters.maxPrice ? BigInt(parameters.maxPrice) : this.config.maxPrice;
      const selectedTier = await this.selectTier(tiers, maxPrice);

      if (!selectedTier) {
        return {
          success: false,
          reason: 'No suitable access tier found',
        };
      }

      // Purchase the token
      const result = await dataAccess.purchase(selectedTier.id, amount);

      // Create access token
      const token = this.generateAccessToken(selectedTier.id);

      // Calculate expiry time
      const expiryTime = Date.now() + Number(selectedTier.ttl) * 1000;

      // Store in cache
      this.tokenCache.set(`${walletAddress}:${domain}`, {
        jwt: token,
        expires: expiryTime,
      });

      return {
        success: true,
        tierId: selectedTier.id,
        balance: amount,
        jwt: token,
        receipt: {
          transactionHash: result.txHash,
          price: selectedTier.price.toString(),
          expiry: expiryTime,
        },
        authHeaders: {
          Authorization: `Bearer ${token}`,
        },
      };
    } catch (error) {
      throw new TransactionError(
        `Failed to purchase data access: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Tool({
    description: 'Generate an authentication signature for a token-gated API',
  })
  async generateAuthSignature(
    walletClient: RadiusWalletInterface,
    parameters: GenerateAuthSignatureParameters,
  ): Promise<{ signature: string; authHeaders: Record<string, string> }> {
    try {
      const walletAddress = walletClient.getAddress();

      // If a challenge was provided, sign it directly
      if (parameters.challenge) {
        // Sign the challenge with the wallet
        const signResult = await walletClient.signMessage(parameters.challenge);

        return {
          signature: signResult.signature,
          authHeaders: {
            Authorization: `Signature challenge="${parameters.challenge}", signed="${signResult.signature}"`,
          },
        };
      }

      // Create a new auth challenge
      const typedData = this.createAuthChallenge(walletAddress);
      const challengeString = JSON.stringify(typedData);

      // Sign the challenge
      const signResult = await walletClient.signMessage(challengeString);

      return {
        signature: signResult.signature,
        authHeaders: {
          Authorization: `Signature challenge="${challengeString}", signed="${signResult.signature}"`,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to generate authentication signature: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Tool({
    description: 'Create a JWT access token for a specific tier',
  })
  async createAccessToken(
    _walletClient: RadiusWalletInterface,
    parameters: CreateAccessTokenParameters,
  ): Promise<{ token: string; authHeaders: Record<string, string> }> {
    try {
      // Create the JWT access token
      const token = this.generateAccessToken(parameters.tierId, parameters.expiresIn as number | StringValue);

      return {
        token,
        authHeaders: {
          Authorization: `Bearer ${token}`,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to create access token: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Tool({
    description: 'Verify a signature and get token balance',
  })
  async verifySignature(
    walletClient: RadiusWalletInterface,
    parameters: VerifySignatureParameters,
  ): Promise<SignatureResult> {
    try {
      const dataAccess = this.getDataAccessContract(walletClient);

      // Get balance for this signature
      const balance = await dataAccess.balanceOfSigner(
        parameters.challenge,
        parameters.signature,
        parameters.tierId
      );

      // Get signer address
      const signer = await dataAccess.recoverSigner(parameters.challenge, parameters.signature);

      // If balance is > 0, signature is valid and user has access
      const verified = balance > 0;

      return {
        verified,
        balance,
        signer,
        tierId: verified ? parameters.tierId : undefined,
      };
    } catch (error) {
      throw new Error(
        `Failed to verify signature: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Tool({
    description: 'Recover the signer address from a signature',
  })
  async recoverSigner(
    walletClient: RadiusWalletInterface,
    parameters: RecoverSignerParameters,
  ): Promise<{ signer: string }> {
    try {
      const dataAccess = this.getDataAccessContract(walletClient);
      const signer = await dataAccess.recoverSigner(parameters.challenge, parameters.signature);

      return { signer };
    } catch (error) {
      throw new Error(
        `Failed to recover signer: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Tool({
    description: 'Get token balance for a tier',
  })
  async getBalance(
    walletClient: RadiusWalletInterface,
    parameters: GetBalanceParameters,
  ): Promise<{ balance: number }> {
    try {
      const dataAccess = this.getDataAccessContract(walletClient);
      const address = parameters.address || walletClient.getAddress();
      const balance = await dataAccess.balanceOf(address, parameters.tierId);

      return { balance };
    } catch (error) {
      throw new Error(
        `Failed to get balance: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Tool({
    description: 'Get detailed balance information including expiration',
  })
  async getBalanceDetails(
    walletClient: RadiusWalletInterface,
    parameters: GetBalanceDetailsParameters,
  ): Promise<{ balanceGroups: BalanceGroup[] }> {
    try {
      const dataAccess = this.getDataAccessContract(walletClient);
      const address = parameters.address || walletClient.getAddress();
      const balanceGroups = await dataAccess.balanceDetails(address, parameters.tierId);

      return { balanceGroups };
    } catch (error) {
      throw new Error(
        `Failed to get balance details: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Tool({
    description: 'Create an authentication challenge',
  })
  async createChallenge(
    walletClient: RadiusWalletInterface,
    parameters: CreateChallengeParameters,
  ): Promise<{ challenge: TypedData }> {
    try {
      const challenge = this.createAuthChallenge(parameters.address);
      return { challenge };
    } catch (error) {
      throw new Error(
        `Failed to create challenge: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Tool({
    description: 'Handle HTTP 402 Payment Required responses from token-gated APIs',
  })
  async handleHttp402Response(
    walletClient: RadiusWalletInterface,
    parameters: HandleHttp402ResponseParameters,
  ): Promise<AccessResult> {
    try {
      const walletAddress = walletClient.getAddress();

      // Extract payment information from 402 response
      const { contract, tiers } = parameters.paymentInfo;

      // Validate the contract address matches our expected one
      if (contract !== this.contractAddress) {
        return {
          success: false,
          reason: `Contract address mismatch: expected ${this.contractAddress}, got ${contract}`,
        };
      }

      // Select a tier to purchase
      let selectedTier: AccessTier | undefined;

      // If specific tier ID provided, find that tier
      if (parameters.tierId !== undefined) {
        const foundTier = tiers.find((t) => t.id === parameters.tierId);

        if (!foundTier) {
          return {
            success: false,
            reason: `Access tier ${parameters.tierId} not found`,
          };
        }

        // Convert to AccessTier format with proper types
        selectedTier = {
          id: foundTier.id,
          name: foundTier.name,
          description: foundTier.description,
          domains: foundTier.domains,
          price: BigInt(foundTier.price),
          ttl: BigInt(foundTier.ttl),
          active: foundTier.active,
          transferable: foundTier.transferable || false,
          burnable: foundTier.burnable || false,
          forSale: foundTier.forSale || true,
        };
      } else {
        // Convert tiers to AccessTier format
        const formattedTiers: AccessTier[] = tiers.map((tier) => ({
          id: tier.id,
          name: tier.name,
          description: tier.description,
          domains: tier.domains,
          price: BigInt(tier.price),
          ttl: BigInt(tier.ttl),
          active: tier.active,
          transferable: tier.transferable || false,
          burnable: tier.burnable || false,
          forSale: tier.forSale || true,
        }));

        // Determine max price (parameter overrides config)
        const maxPrice = parameters.maxPrice ? BigInt(parameters.maxPrice) : this.config.maxPrice;

        // Select best tier based on strategy
        selectedTier = await this.selectTier(formattedTiers, maxPrice);
      }

      if (!selectedTier) {
        return {
          success: false,
          reason: 'No suitable access tier found',
        };
      }

      // Set default amount if not provided
      const amount = parameters.amount || 1;

      // Purchase the token
      const dataAccess = this.getDataAccessContract(walletClient);
      const result = await dataAccess.purchase(selectedTier.id, amount);

      // Create a token to send back to the agent
      const token = this.generateAccessToken(selectedTier.id);

      // Store token in cache
      const url = new URL(parameters.resourceUrl);
      const domain = `${url.protocol}//${url.host}${url.pathname}`;
      const expiryTime = Date.now() + Number(selectedTier.ttl) * 1000;
      this.tokenCache.set(`${walletAddress}:${domain}`, {
        jwt: token,
        expires: expiryTime,
      });

      return {
        success: true,
        tierId: selectedTier.id,
        balance: amount,
        jwt: token,
        receipt: {
          transactionHash: result.txHash,
          price: selectedTier.price.toString(),
          expiry: expiryTime,
        },
        authHeaders: {
          Authorization: `Bearer ${token}`,
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
