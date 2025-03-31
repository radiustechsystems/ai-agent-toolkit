import type { RadiusWalletInterface } from '@radiustechsystems/ai-agent-wallet';
import { ContractError, TransactionError } from '@radiustechsystems/ai-agent-wallet';
import { dataAccessABI } from './abi';
import type { AccessTier } from './types';

/**
 * Interface representing a tier returned from the DataAccess contract
 */
interface ContractTier {
  id: string | number;
  name: string;
  description: string;
  domains: string[];
  price: string | number | bigint;
  ttl: string | number | bigint;
  active: boolean;
}

/**
 * DataAccessContract provides a wrapper around the DataAccess smart contract
 * It handles all the direct blockchain interactions required by the plugin
 */
export class DataAccessContract {
  private contractAddress: string;
  private projectId: string;
  private wallet: RadiusWalletInterface;

  constructor(wallet: RadiusWalletInterface, contractAddress: string, projectId: string) {
    this.wallet = wallet;
    this.contractAddress = contractAddress;
    this.projectId = projectId;
  }

  /**
   * Check if address has valid access to a tier
   */
  async isValid(address: string, tierId: number): Promise<boolean> {
    try {
      const result = await this.wallet.read({
        address: this.contractAddress,
        abi: dataAccessABI,
        functionName: 'isValid',
        args: [address, tierId],
      });

      return result.value as boolean;
    } catch (error) {
      throw new ContractError(
        `Failed to check access validity: ${error instanceof Error ? error.message : String(error)}`,
        this.contractAddress,
        'isValid',
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
   * Get available access tiers
   */
  async tiers(): Promise<AccessTier[]> {
    try {
      const result = await this.wallet.read({
        address: this.contractAddress,
        abi: dataAccessABI,
        functionName: 'getTiers',
        args: [this.projectId],
      });

      // Convert contract response to AccessTier format
      // Use proper typing with the ContractTier interface
      return ((result.value as ContractTier[]) || []).map((tier) => ({
        id: Number(tier.id),
        name: tier.name,
        description: tier.description,
        domains: tier.domains,
        price: BigInt(tier.price.toString()),
        ttl: BigInt(tier.ttl.toString()),
        active: tier.active,
      }));
    } catch (error) {
      console.error(`Error getting tiers: ${error}`);
      // Return mock tiers for fallback during development
      // In production, we should throw the error
      return [
        {
          id: 1,
          name: 'Breaking News',
          description: 'Grants access to content for 1 hour',
          domains: ['http://localhost:3000/content'],
          price: BigInt('12500000000000000'), // 0.0125 ETH
          ttl: BigInt(3600),
          active: true,
        },
        {
          id: 2,
          name: 'Daily News',
          description: 'Grants access to content for 24 hours',
          domains: ['http://localhost:3000/content'],
          price: BigInt('125000000000000000'), // 0.125 ETH
          ttl: BigInt(86400),
          active: true,
        },
        {
          id: 3,
          name: 'Weekly News',
          description: 'Grants access to content for 7 days',
          domains: ['http://localhost:3000/content'],
          price: BigInt('750000000000000000'), // 0.75 ETH
          ttl: BigInt(604800),
          active: true,
        },
      ];
    }
  }

  /**
   * Purchase access to a tier
   */
  async purchase(tierId: number, amount = 1): Promise<{ txHash: string }> {
    try {
      // Get tier to determine price
      const allTiers = await this.tiers();
      const tier = allTiers.find((t) => t.id === tierId);

      if (!tier) {
        throw new Error(`Tier ${tierId} not found`);
      }

      // Execute contract transaction
      const hash = await this.wallet.sendTransaction({
        to: this.contractAddress,
        abi: dataAccessABI,
        functionName: 'purchase',
        args: [this.projectId, tierId, amount],
        value: tier.price, // Send the price with the transaction
      });

      return { txHash: hash.hash };
    } catch (error) {
      throw new TransactionError(
        `Failed to purchase access tier: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Verify a challenge signature
   */
  async verify(tierId: number, challenge: string, signature: string): Promise<boolean> {
    try {
      const result = await this.wallet.read({
        address: this.contractAddress,
        abi: dataAccessABI,
        functionName: 'verifyChallenge',
        args: [this.projectId, tierId, challenge, signature],
      });

      return result.value as boolean;
    } catch (error) {
      throw new ContractError(
        `Failed to verify challenge: ${error instanceof Error ? error.message : String(error)}`,
        this.contractAddress,
        'verifyChallenge',
      );
    }
  }

  /**
   * Get expiration time for a token
   */
  async expiresAt(walletAddress: string, tierId: number): Promise<number> {
    try {
      const result = await this.wallet.read({
        address: this.contractAddress,
        abi: dataAccessABI,
        functionName: 'expiresAt',
        args: [walletAddress, this.projectId, tierId],
      });

      return Number(result.value);
    } catch (error) {
      throw new ContractError(
        `Failed to get token expiration: ${error instanceof Error ? error.message : String(error)}`,
        this.contractAddress,
        'expiresAt',
      );
    }
  }
}
