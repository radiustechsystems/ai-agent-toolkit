import type { RadiusWalletInterface } from '@radiustechsystems/ai-agent-wallet';
import { ContractError, TransactionError } from '@radiustechsystems/ai-agent-wallet';
import { dataAccessABI } from './abi';
import type { AccessTier, BalanceGroup } from './types';

/**
 * DataAccessContract provides a wrapper around the DataAccess smart contract
 * Updated to work with the new contract ABI
 */
export class DataAccessContract {
  private contractAddress: string;
  private projectId: string;
  private wallet: RadiusWalletInterface;
  private cachedTiers: Map<number, AccessTier> = new Map();

  constructor(wallet: RadiusWalletInterface, contractAddress: string, projectId: string) {
    this.wallet = wallet;
    this.contractAddress = contractAddress;
    this.projectId = projectId;
  }

  /**
   * Get the project ID from the contract
   */
  async getProjectId(): Promise<string> {
    try {
      const result = await this.wallet.read({
        address: this.contractAddress,
        abi: dataAccessABI,
        functionName: 'PROJECT_ID',
      });

      return result.value as string;
    } catch (error) {
      // If we can't get the project ID from the contract, use the one from constructor
      return this.projectId;
    }
  }

  /**
   * Check if address has a balance > 0 for a specific tier
   */
  async hasValidAccess(address: string, tierId: number): Promise<boolean> {
    try {
      const balance = await this.balanceOf(address, tierId);
      return balance > 0;
    } catch (error) {
      throw new ContractError(
        `Failed to check access validity: ${error instanceof Error ? error.message : String(error)}`,
        this.contractAddress,
        'balanceOf',
      );
    }
  }

  /**
   * Get token balance for an address and tier
   */
  async balanceOf(address: string, tierId: number): Promise<number> {
    try {
      const result = await this.wallet.read({
        address: this.contractAddress,
        abi: dataAccessABI,
        functionName: 'balanceOf',
        args: [address, tierId],
      });

      return Number(result.value);
    } catch (error) {
      throw new ContractError(
        `Failed to get token balance: ${error instanceof Error ? error.message : String(error)}`,
        this.contractAddress,
        'balanceOf',
      );
    }
  }

  /**
   * Get detailed balance information including expiration timestamps
   */
  async balanceDetails(address: string, tierId: number): Promise<BalanceGroup[]> {
    try {
      const result = await this.wallet.read({
        address: this.contractAddress,
        abi: dataAccessABI,
        functionName: 'balanceDetails',
        args: [address, tierId],
      });

      // Define a type for the raw contract response
      interface RawBalanceGroup {
        balance: string | number | bigint;
        expiresAt: string | number | bigint;
      }

      // Use proper typing for the contract response
      return (result.value as RawBalanceGroup[]).map(item => ({
        balance: BigInt(item.balance.toString()),
        expiresAt: BigInt(item.expiresAt.toString()),
      }));
    } catch (error) {
      throw new ContractError(
        `Failed to get balance details: ${error instanceof Error ? error.message : String(error)}`,
        this.contractAddress,
        'balanceDetails',
      );
    }
  }

  /**
   * Get the balance of a signer after verifying their signature
   */
  async balanceOfSigner(challenge: string, signature: string, tierId: number): Promise<number> {
    try {
      const result = await this.wallet.read({
        address: this.contractAddress,
        abi: dataAccessABI,
        functionName: 'balanceOfSigner',
        args: [challenge, signature, tierId],
      });

      return Number(result.value);
    } catch (error) {
      throw new ContractError(
        `Failed to verify signature: ${error instanceof Error ? error.message : String(error)}`,
        this.contractAddress,
        'balanceOfSigner',
      );
    }
  }

  /**
   * Recover the signer address from a signature
   */
  async recoverSigner(challenge: string, signature: string): Promise<string> {
    try {
      const result = await this.wallet.read({
        address: this.contractAddress,
        abi: dataAccessABI,
        functionName: 'recoverSigner',
        args: [challenge, signature],
      });

      return result.value as string;
    } catch (error) {
      throw new ContractError(
        `Failed to recover signer: ${error instanceof Error ? error.message : String(error)}`,
        this.contractAddress,
        'recoverSigner',
      );
    }
  }

  /**
   * Check if a tier is active
   */
  async isActive(tierId: number): Promise<boolean> {
    try {
      const result = await this.wallet.read({
        address: this.contractAddress,
        abi: dataAccessABI,
        functionName: 'active',
        args: [tierId],
      });

      return result.value as boolean;
    } catch (error) {
      throw new ContractError(
        `Failed to check if tier is active: ${error instanceof Error ? error.message : String(error)}`,
        this.contractAddress,
        'active',
      );
    }
  }

  /**
   * Check if a tier is for sale
   */
  async isForSale(tierId: number): Promise<boolean> {
    try {
      const result = await this.wallet.read({
        address: this.contractAddress,
        abi: dataAccessABI,
        functionName: 'forSale',
        args: [tierId],
      });

      return result.value as boolean;
    } catch (error) {
      throw new ContractError(
        `Failed to check if tier is for sale: ${error instanceof Error ? error.message : String(error)}`,
        this.contractAddress,
        'forSale',
      );
    }
  }

  /**
   * Check if a tier is burnable
   */
  async isBurnable(tierId: number): Promise<boolean> {
    try {
      const result = await this.wallet.read({
        address: this.contractAddress,
        abi: dataAccessABI,
        functionName: 'burnable',
        args: [tierId],
      });

      return result.value as boolean;
    } catch (error) {
      throw new ContractError(
        `Failed to check if tier is burnable: ${error instanceof Error ? error.message : String(error)}`,
        this.contractAddress,
        'burnable',
      );
    }
  }

  /**
   * Check if a tier is transferable
   */
  async isTransferable(tierId: number): Promise<boolean> {
    try {
      const result = await this.wallet.read({
        address: this.contractAddress,
        abi: dataAccessABI,
        functionName: 'transferable',
        args: [tierId],
      });

      return result.value as boolean;
    } catch (error) {
      throw new ContractError(
        `Failed to check if tier is transferable: ${error instanceof Error ? error.message : String(error)}`,
        this.contractAddress,
        'transferable',
      );
    }
  }

  /**
   * Get price for a tier
   */
  async getPrice(tierId: number): Promise<bigint> {
    try {
      const result = await this.wallet.read({
        address: this.contractAddress,
        abi: dataAccessABI,
        functionName: 'priceOf',
        args: [tierId],
      });

      // Properly handle the unknown type
      const value = result.value as string | number | bigint;
      return BigInt(value.toString());
    } catch (error) {
      throw new ContractError(
        `Failed to get tier price: ${error instanceof Error ? error.message : String(error)}`,
        this.contractAddress,
        'priceOf',
      );
    }
  }

  /**
   * Get TTL (time-to-live) for a tier
   */
  async getTTL(tierId: number): Promise<bigint> {
    try {
      const result = await this.wallet.read({
        address: this.contractAddress,
        abi: dataAccessABI,
        functionName: 'ttl',
        args: [tierId],
      });

      // Properly handle the unknown type
      const value = result.value as string | number | bigint;
      return BigInt(value.toString());
    } catch (error) {
      throw new ContractError(
        `Failed to get tier TTL: ${error instanceof Error ? error.message : String(error)}`,
        this.contractAddress,
        'ttl',
      );
    }
  }

  /**
   * Get token URI
   */
  async getTokenURI(tierId: number): Promise<string> {
    try {
      const result = await this.wallet.read({
        address: this.contractAddress,
        abi: dataAccessABI,
        functionName: 'uri',
        args: [tierId],
      });

      return result.value as string;
    } catch (error) {
      throw new ContractError(
        `Failed to get token URI: ${error instanceof Error ? error.message : String(error)}`,
        this.contractAddress,
        'uri',
      );
    }
  }

  /**
   * Get metadata for a specific tier
   */
  async getTierMetadata(tierId: number): Promise<AccessTier> {
    try {
      // Check if we have this tier in cache
      if (this.cachedTiers.has(tierId)) {
        const cachedTier = this.cachedTiers.get(tierId);
        // Safely handle the potential undefined value
        if (cachedTier) {
          return cachedTier;
        }
        // If for some reason the cached tier is undefined despite the has() check passing,
        // we'll fall through to fetching it again
      }

      // Get tier metadata from contract
      const [price, ttl, active, transferable, burnable, forSale] = await Promise.all([
        this.getPrice(tierId),
        this.getTTL(tierId),
        this.isActive(tierId),
        this.isTransferable(tierId),
        this.isBurnable(tierId),
        this.isForSale(tierId),
      ]);

      // Construct tier metadata
      // Note: Name, description, and domains would typically come from token URI 
      // or an off-chain registry. For this implementation, we use placeholders.
      const tier: AccessTier = {
        id: tierId,
        name: `Tier ${tierId}`,
        description: `Access tier ${tierId}`,
        domains: [],  // This would be populated from off-chain metadata
        price,
        ttl,
        active,
        transferable,
        burnable,
        forSale,
      };

      // Cache the tier metadata
      this.cachedTiers.set(tierId, tier);
      return tier;
    } catch (error) {
      throw new ContractError(
        `Failed to get tier metadata: ${error instanceof Error ? error.message : String(error)}`,
        this.contractAddress,
        'getTierMetadata',
      );
    }
  }

  /**
   * Get available tiers (using known tier IDs)
   * Note: Since the contract no longer has a getTiers method,
   * this is a placeholder implementation that uses known tier IDs
   */
  async getAvailableTiers(knownTierIds: number[] = [1, 2, 3]): Promise<AccessTier[]> {
    try {
      const tiers: AccessTier[] = [];
      
      for (const tierId of knownTierIds) {
        try {
          const isActive = await this.isActive(tierId);
          const isForSale = await this.isForSale(tierId);
          
          // Only include active tiers that are for sale
          if (isActive && isForSale) {
            const tier = await this.getTierMetadata(tierId);
            tiers.push(tier);
          }
        } catch (error) {
          // Skip tiers that don't exist or can't be accessed
          console.warn(`Skipping tier ${tierId}: ${error}`);
        }
      }
      
      return tiers;
    } catch (error) {
      console.error(`Error getting tiers: ${error}`);
      return [];
    }
  }

  /**
   * Purchase access to a tier
   */
  async purchase(tierId: number, amount = 1): Promise<{ txHash: string }> {
    try {
      // Get the price for this tier
      const price = await this.getPrice(tierId);
      const totalPrice = price * BigInt(amount);

      // Execute contract transaction with the agent wallet as recipient
      const hash = await this.wallet.sendTransaction({
        to: this.contractAddress,
        abi: dataAccessABI,
        functionName: 'purchase',
        args: [this.wallet.getAddress(), tierId, amount],
        value: totalPrice, // Send the calculated price with the transaction
      });

      return { txHash: hash.hash };
    } catch (error) {
      throw new TransactionError(
        `Failed to purchase access tier: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Get expiration time for a token by checking balance details
   */
  async expiresAt(walletAddress: string, tierId: number): Promise<number> {
    try {
      // Use balanceDetails to get expiration information
      const details = await this.balanceDetails(walletAddress, tierId);
      
      if (details.length === 0) {
        return 0; // No tokens, so no expiration
      }
      
      // Find the latest expiration date
      let latestExpiry = 0n;
      for (const detail of details) {
        if (detail.balance > 0n && detail.expiresAt > latestExpiry) {
          latestExpiry = detail.expiresAt;
        }
      }
      
      return Number(latestExpiry);
    } catch (error) {
      throw new ContractError(
        `Failed to get token expiration: ${error instanceof Error ? error.message : String(error)}`,
        this.contractAddress,
        'balanceDetails',
      );
    }
  }
}
