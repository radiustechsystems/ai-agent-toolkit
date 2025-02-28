import { Client, Account, Contract, ABI, Address } from "@radiustechsystems/sdk";
import { RadiusTransaction, TransactionSimulationResult } from "./types";
import { GasEstimationError } from "./errors";
import { WalletCache } from "./cache";

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
  constructor(
    client: Client, 
    gasMultiplier: number = 1.2,
    cache?: WalletCache
  ) {
    this.#client = client;
    this.#gasMultiplier = gasMultiplier;
    this.#cache = cache;
  }
  
  /**
   * Estimates gas for a transaction
   * @param transaction Transaction to estimate
   * @param account Account that will send the transaction
   * @returns Estimated gas limit with buffer
   */
  async estimateGas(
    transaction: RadiusTransaction,
    account: Account
  ): Promise<bigint> {
    const { to, functionName, args, value, abi, data } = transaction;
    
    try {
      // Simple ETH transfer (no contract interaction)
      if (!abi && !functionName) {
        const toAddress = new Address(to);
        const gasEstimate = await this.#client.estimateGas(account, toAddress, value || BigInt(0));
        return this.#applyBuffer(gasEstimate);
      }
      
      // Contract interaction
      if (abi && functionName) {
        // Create ABI instance
        const abiInstance = new ABI(JSON.stringify(abi));
        
        // Create contract instance
        const contract = await Contract.NewDeployed(abiInstance, to);
        
        // Estimate gas for contract call
        const gasEstimate = await contract.estimateGas(
          this.#client,
          account,
          functionName,
          ...(args || [])
        );
        
        return this.#applyBuffer(gasEstimate);
      }
      
      // Raw transaction with data
      if (data) {
        const toAddress = new Address(to);
        const gasEstimate = await this.#client.estimateGasRaw(
          account, 
          toAddress, 
          value || BigInt(0), 
          data
        );
        return this.#applyBuffer(gasEstimate);
      }
      
      throw new GasEstimationError(
        "Invalid transaction: Cannot estimate gas without proper transaction data"
      );
    } catch (error) {
      throw new GasEstimationError(
        `Gas estimation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
  
  /**
   * Simulates a transaction execution
   * @param transaction Transaction to simulate
   * @param account Account that will send the transaction
   * @returns Simulation result
   */
  async simulateTransaction(
    transaction: RadiusTransaction,
    account: Account
  ): Promise<TransactionSimulationResult> {
    try {
      // Estimate gas first to check if transaction would revert
      const gasEstimate = await this.estimateGas(transaction, account);
      
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
   * Gets the current gas price
   * @returns Current gas price in wei
   */
  async getGasPrice(): Promise<bigint> {
    // Check cache first
    if (this.#cache) {
      const cached = this.#cache.get<bigint>("gas_price");
      if (cached !== undefined) {
        return cached;
      }
    }
    
    // Get current gas price
    const gasPrice = await this.#client.getGasPrice();
    
    // Cache the result
    if (this.#cache) {
      this.#cache.set("gas_price", gasPrice);
    }
    
    return gasPrice;
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
  cache?: WalletCache
): GasEstimator {
  return new GasEstimator(client, gasMultiplier, cache);
}