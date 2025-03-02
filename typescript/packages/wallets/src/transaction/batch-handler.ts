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
    
    // Validate that account has a signer
    if (!account.signer) {
      throw new Error("Account must have a signer to use batch transactions");
    }
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
    return this.executeSequentialBatch(transactions);
  }
  
  /**
   * Converts a RadiusTransaction to SDK transaction format
   * @param tx The wallet transaction to convert
   * @returns Transaction in SDK format
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #convertToSdkTransaction(tx: RadiusTransaction): any {
    // Extract basic properties
    const { to, value, data, gasLimit, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce } = tx;
    
    // Create an SDK-compatible transaction object
    // The exact format will depend on the SDK's batchTransactions implementation
    return {
      to: new Address(to),
      value: value || BigInt(0),
      data,
      gasLimit,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce
    };
  }
  
  /**
   * Executes a single transaction
   * @param transaction Transaction to execute
   * @returns Transaction hash
   */
  async #executeSingleTransaction(transaction: RadiusTransaction): Promise<{ hash: string }> {
    const { to, functionName, args, value, abi } = transaction;
    
    // Ensure account has a signer before proceeding
    if (!this.#account.signer) {
      throw new Error("Account must have a signer to execute transactions");
    }
    
    // Simple ETH transfer (no contract interaction)
    if (!abi && !functionName) {
      const toAddress = new Address(to);
      // Using account.signer directly as required by the Client.send method
      const receipt = await this.#client.send(this.#account.signer, toAddress, value || BigInt(0));
      return { hash: receipt.txHash.hex() };
    }
    
    // Contract interaction
    if (abi && functionName) {
      // Create ABI instance
      const abiInstance = new ABI(JSON.stringify(abi));
      
      // Create contract instance for an already deployed contract
      const toAddress = new Address(to);
      const contract = new Contract(toAddress, abiInstance);
      
      // Execute contract method using the account's signer
      const receipt = await contract.execute(
        this.#client,
        this.#account.signer,
        functionName,
        ...(args || [])
      );
      
      return { hash: receipt.txHash.hex() };
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
export function createBatchHandler(
  client: Client, 
  account: Account
): BatchTransactionHandler {
  return new BatchTransactionHandler(client, account);
}