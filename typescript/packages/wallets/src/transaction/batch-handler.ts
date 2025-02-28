import { Account, Client, Contract, ABI, Address } from "@radiustechsystems/sdk";
import { RadiusTransaction } from "../core/types";
import { BatchTransactionError } from "../utils/errors";

/**
 * Handlers for batch transaction processing
 */
export class BatchTransactionHandler {
  #client: Client;
  #account: Account;
  
  /**
   * Creates a new batch transaction handler
   * @param client Radius SDK client
   * @param account Radius SDK account
   */
  constructor(client: Client, account: Account) {
    this.#client = client;
    this.#account = account;
  }
  
  /**
   * Executes a batch of transactions in sequence
   * @param transactions Array of transactions to execute
   * @returns Hash of the last transaction
   */
  async executeSequentialBatch(transactions: RadiusTransaction[]): Promise<{ hash: string }> {
    const results: string[] = [];
    
    try {
      for (let i = 0; i < transactions.length; i++) {
        const tx = transactions[i];
        const result = await this.#executeSingleTransaction(tx);
        results.push(result.hash);
      }
      
      // Return the last transaction hash
      return { hash: results[results.length - 1] };
    } catch (error) {
      // Find which transaction failed
      const failedIndex = results.length;
      
      throw new BatchTransactionError(
        `Batch transaction failed at index ${failedIndex}: ${error instanceof Error ? error.message : String(error)}`,
        failedIndex,
        results
      );
    }
  }
  
  /**
   * Executes a true batch transaction if supported by the chain
   * @param transactions Array of transactions to execute
   * @returns Transaction hash
   */
  async executeTrueBatch(transactions: RadiusTransaction[]): Promise<{ hash: string }> {
    // First check if the chain supports multicall/batching
    // The SDK doesn't have direct support for this yet
    // This is a placeholder for future implementation
    
    // Fall back to sequential execution for now
    return this.executeSequentialBatch(transactions);
  }
  
  /**
   * Executes a single transaction
   * @param transaction Transaction to execute
   * @returns Transaction hash
   */
  async #executeSingleTransaction(transaction: RadiusTransaction): Promise<{ hash: string }> {
    const { to, functionName, args, value, abi, data } = transaction;
    
    // Simple ETH transfer (no contract interaction)
    if (!abi && !functionName) {
      const toAddress = new Address(to);
      const receipt = await this.#client.send(this.#account, toAddress, value || BigInt(0));
      return { hash: receipt.hash };
    }
    
    // Contract interaction
    if (abi && functionName) {
      // Create ABI instance
      const abiInstance = new ABI(JSON.stringify(abi));
      
      // Create contract instance
      const contract = await Contract.NewDeployed(abiInstance, to);
      
      // Execute contract method
      const receipt = await contract.execute(
        this.#client,
        this.#account,
        functionName,
        ...(args || [])
      );
      
      return { hash: receipt.hash };
    }
    
    throw new Error("Invalid transaction: Either both abi and functionName must be provided, or neither");
  }
}

/**
 * Creates a batch transaction handler
 * @param client Radius SDK client
 * @param account Radius SDK account
 * @returns Batch transaction handler instance
 */
export function createBatchHandler(client: Client, account: Account): BatchTransactionHandler {
  return new BatchTransactionHandler(client, account);
}