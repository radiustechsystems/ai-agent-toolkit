import { ABI, Address, type Client, Transaction } from '@radiustechsystems/sdk';
import type { RadiusTransaction, TransactionSimulationResult } from '../core/WalletTypes';
import type { WalletCache } from '../utils/Cache';
import { GasEstimationError } from '../utils/errors';

/**
 * Gas estimation service for EVM transactions
 */
export class GasEstimator {
  #client: Client;
  #cache?: WalletCache;
  #gasMultiplier: number;

  /**
   * Creates a new gas estimator
   * @param client Radius SDK client
   * @param gasMultiplier Multiplier to apply to estimated gas (default: 1.2)
   * @param cache Optional cache instance
   */
  constructor(client: Client, gasMultiplier = 1.2, cache?: WalletCache) {
    this.#client = client;
    this.#gasMultiplier = gasMultiplier;
    this.#cache = cache;
  }

  /**
   * Estimates gas for a transaction using the Radius SDK
   * @param transaction Transaction to estimate
   * @param account Account that will send the transaction
   * @returns Estimated gas limit with buffer
   */
  async estimateGas(transaction: RadiusTransaction): Promise<bigint> {
    const { to, functionName, args, value, abi, data } = transaction;

    try {
      // Simple ETH transfer (no contract interaction)
      if (!abi && !functionName) {
        const toAddress = new Address(to);

        // Use SDK's estimateGas method - proper typed access
        let gasEstimate: bigint;

        if (data) {
          // Create a Transaction object for estimation
          const transaction = new Transaction(
            data, // data
            BigInt(0), // gas (will be estimated)
            BigInt(0), // gasPrice
            undefined, // nonce
            toAddress, // to
            value || BigInt(0), // value
          );

          // Estimate gas using the SDK method
          gasEstimate = await this.#client.estimateGas(transaction);
        } else {
          // Create a Transaction object for a simple transfer
          const transaction = new Transaction(
            new Uint8Array(), // empty data for simple transfer
            BigInt(0), // gas (will be estimated)
            BigInt(0), // gasPrice
            undefined, // nonce
            toAddress, // to
            value || BigInt(0), // value
          );

          // Estimate gas using the SDK method
          gasEstimate = await this.#client.estimateGas(transaction);
        }

        return this.#applyBuffer(gasEstimate);
      }

      // Contract interaction
      if (abi && functionName) {
        // Create ABI instance
        const abiInstance = new ABI(JSON.stringify(abi));

        // Create contract instance
        const toAddress = new Address(to);

        // Encode the function call data
        const data = abiInstance.pack(functionName, ...(args || []));

        // Create a Transaction object for gas estimation
        const transaction = new Transaction(
          data, // encoded function call data
          BigInt(0), // gas (will be estimated)
          BigInt(0), // gasPrice
          undefined, // nonce
          toAddress, // to
          value || BigInt(0), // value
        );

        // Estimate gas using the client's estimateGas method
        const gasEstimate = await this.#client.estimateGas(transaction);

        return this.#applyBuffer(gasEstimate);
      }

      throw new GasEstimationError(
        'Invalid transaction: Cannot estimate gas without proper transaction data',
      );
    } catch (error) {
      throw new GasEstimationError(
        `Gas estimation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Simulates a transaction execution
   * @param transaction Transaction to simulate
   * @param account Account that will send the transaction
   * @returns Simulation result
   */
  async simulateTransaction(transaction: RadiusTransaction): Promise<TransactionSimulationResult> {
    try {
      // Estimate gas first to check if transaction would revert
      const gasEstimate = await this.estimateGas(transaction);

      // Basic simulation - just checking if transaction would succeed
      // The SDK doesn't have full state change simulation yet
      return {
        success: true,
        gasUsed: gasEstimate,
      };
    } catch (error) {
      // Gas estimation failure means transaction would revert
      return {
        success: false,
        gasUsed: BigInt(0),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Gets the current gas price using the SDK
   * @returns Current gas price in wei
   */
  async getGasPrice(): Promise<bigint> {
    // Check cache first
    if (this.#cache) {
      const cached = this.#cache.get<bigint>('gas_price');
      if (cached !== undefined) {
        return cached;
      }
    }

    try {
      // Access the underlying ethers provider
      // @ts-expect-error - accessing private ethClient
      const provider = this.#client.ethClient;

      if (provider) {
        // Use getFeeData method which replaces the deprecated getGasPrice
        const feeData = await provider.getFeeData();

        // Use maxFeePerGas if available, otherwise fall back to gasPrice
        const gasPrice = feeData.maxFeePerGas || feeData.gasPrice || BigInt(0);

        // Cache the result
        if (this.#cache) {
          this.#cache.set('gas_price', gasPrice);
        }

        return gasPrice;
      }

      // Fallback if provider is not available
      return BigInt(0);
    } catch (error) {
      console.warn('Error getting gas price:', error);
      return BigInt(0);
    }
  }

  /**
   * Applies a buffer to the gas estimate to prevent out-of-gas errors
   * @param estimate Original gas estimate
   * @returns Gas estimate with buffer applied
   */
  #applyBuffer(estimate: bigint): bigint {
    // Apply multiplier and round up
    return BigInt(Math.ceil(Number(estimate) * this.#gasMultiplier));
  }
}

/**
 * Creates a gas estimator
 * @param client Radius SDK client
 * @param gasMultiplier Multiplier for gas estimates
 * @param cache Optional cache instance
 * @returns Gas estimator instance
 */
export function createGasEstimator(
  client: Client,
  gasMultiplier?: number,
  cache?: WalletCache,
): GasEstimator {
  return new GasEstimator(client, gasMultiplier, cache);
}
