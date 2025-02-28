import { TransactionDetails } from "../core/types";
import { Client } from "@radiustechsystems/sdk";
import { EventEmitter } from "events";
import { TransactionError } from "../utils/errors";

interface TransactionMonitorOptions {
  /** Polling interval in milliseconds */
  pollingInterval?: number;
  /** Number of confirmations required */
  confirmations?: number;
  /** Timeout in milliseconds */
  timeout?: number;
}

/**
 * Events emitted by the transaction monitor
 */
export interface TransactionMonitorEvents {
  /** Transaction received first confirmation */
  confirmed: (details: TransactionDetails) => void;
  /** Transaction received required number of confirmations */
  finalized: (details: TransactionDetails) => void;
  /** Transaction failed */
  failed: (error: TransactionError) => void;
  /** Transaction timed out waiting for confirmation */
  timeout: (hash: string) => void;
}

/**
 * Transaction monitoring service
 * Tracks transaction status and emits events
 */
export class TransactionMonitor {
  #client: Client;
  #emitter: EventEmitter;
  #transactions: Map<string, {
    startTime: number;
    confirmations: number;
    requiredConfirmations: number;
    timer?: NodeJS.Timeout;
    lastChecked?: number;
  }>;
  #pollingInterval: number;
  #defaultConfirmations: number;
  #defaultTimeout: number;
  #isPolling: boolean = false;
  
  /**
   * Creates a new transaction monitor
   * @param client Radius SDK client
   * @param options Monitoring options
   */
  constructor(
    client: Client, 
    options: TransactionMonitorOptions = {}
  ) {
    this.#client = client;
    this.#emitter = new EventEmitter();
    this.#transactions = new Map();
    this.#pollingInterval = options.pollingInterval || 5000; // 5 seconds default
    this.#defaultConfirmations = options.confirmations || 1; 
    this.#defaultTimeout = options.timeout || 60000; // 1 minute default
  }
  
  /**
   * Starts monitoring a transaction
   * @param hash Transaction hash
   * @param options Monitoring options for this specific transaction
   */
  monitorTransaction(
    hash: string, 
    options: { confirmations?: number; timeout?: number } = {}
  ): void {
    const requiredConfirmations = options.confirmations || this.#defaultConfirmations;
    const timeout = options.timeout || this.#defaultTimeout;
    
    // Start tracking transaction
    this.#transactions.set(hash, {
      startTime: Date.now(),
      confirmations: 0,
      requiredConfirmations,
      timer: setTimeout(() => this.#handleTimeout(hash), timeout)
    });
    
    // Start polling if not already
    if (!this.#isPolling) {
      this.#startPolling();
    }
  }
  
  /**
   * Stops monitoring a transaction
   * @param hash Transaction hash
   */
  stopMonitoring(hash: string): void {
    const tx = this.#transactions.get(hash);
    if (tx?.timer) {
      clearTimeout(tx.timer);
    }
    this.#transactions.delete(hash);
    
    // Stop polling if no transactions left
    if (this.#transactions.size === 0) {
      this.#stopPolling();
    }
  }
  
  /**
   * Add event listener
   * @param event Event name
   * @param listener Event handler
   */
  on<E extends keyof TransactionMonitorEvents>(
    event: E, 
    listener: TransactionMonitorEvents[E]
  ): void {
    this.#emitter.on(event, listener as (...args: any[]) => void);
  }
  
  /**
   * Remove event listener
   * @param event Event name
   * @param listener Event handler
   */
  off<E extends keyof TransactionMonitorEvents>(
    event: E, 
    listener: TransactionMonitorEvents[E]
  ): void {
    this.#emitter.off(event, listener as (...args: any[]) => void);
  }
  
  /**
   * Add one-time event listener
   * @param event Event name
   * @param listener Event handler
   */
  once<E extends keyof TransactionMonitorEvents>(
    event: E, 
    listener: TransactionMonitorEvents[E]
  ): void {
    this.#emitter.once(event, listener as (...args: any[]) => void);
  }
  
  /**
   * Wait for transaction to be confirmed
   * @param hash Transaction hash
   * @param confirmations Number of confirmations to wait for
   * @param timeout Timeout in milliseconds
   * @returns Transaction details
   */
  waitForTransaction(
    hash: string, 
    confirmations?: number, 
    timeout?: number
  ): Promise<TransactionDetails> {
    return new Promise((resolve, reject) => {
      // Setup event handlers
      const onFinalized = (details: TransactionDetails) => {
        if (details.hash === hash) {
          cleanup();
          resolve(details);
        }
      };
      
      const onFailed = (error: TransactionError) => {
        if (error.transactionHash === hash) {
          cleanup();
          reject(error);
        }
      };
      
      const onTimeout = (timeoutHash: string) => {
        if (timeoutHash === hash) {
          cleanup();
          reject(new TransactionError(`Transaction ${hash} timed out waiting for confirmation`));
        }
      };
      
      // Clean up event listeners
      const cleanup = () => {
        this.off("finalized", onFinalized);
        this.off("failed", onFailed);
        this.off("timeout", onTimeout);
        this.stopMonitoring(hash);
      };
      
      // Register event handlers
      this.on("finalized", onFinalized);
      this.on("failed", onFailed);
      this.on("timeout", onTimeout);
      
      // Start monitoring
      this.monitorTransaction(hash, { 
        confirmations, 
        timeout 
      });
    });
  }
  
  /**
   * Gets the current transaction details
   * @param hash Transaction hash
   * @returns Transaction details
   */
  async getTransactionDetails(hash: string): Promise<TransactionDetails> {
    try {
      const receipt = await this.#client.getTransactionReceipt(hash);
      
      // Check if transaction exists
      if (!receipt) {
        return { hash };
      }
      
      // Extract transaction details
      return {
        hash,
        blockNumber: receipt.blockNumber,
        status: receipt.status,
        gasUsed: receipt.gasUsed,
        effectiveGasPrice: receipt.effectiveGasPrice,
        fee: receipt.gasUsed * receipt.effectiveGasPrice,
      };
    } catch (error) {
      // Return minimal details if transaction not found
      return { hash };
    }
  }
  
  /**
   * Start polling for transaction updates
   */
  #startPolling(): void {
    this.#isPolling = true;
    this.#poll();
  }
  
  /**
   * Stop polling for transaction updates
   */
  #stopPolling(): void {
    this.#isPolling = false;
  }
  
  /**
   * Poll for transaction updates
   */
  async #poll(): Promise<void> {
    if (!this.#isPolling) return;
    
    try {
      // Get current block number
      const blockNumber = await this.#client.getBlockNumber();
      
      // Check each transaction
      for (const [hash, tx] of this.#transactions.entries()) {
        // Skip if we just checked recently
        if (tx.lastChecked && Date.now() - tx.lastChecked < 2000) continue;
        
        try {
          const details = await this.getTransactionDetails(hash);
          tx.lastChecked = Date.now();
          
          // Skip if not yet mined
          if (!details.blockNumber) continue;
          
          // Calculate confirmations
          const confirmations = blockNumber - details.blockNumber + 1;
          
          // Check if transaction failed
          if (details.status === 0) {
            clearTimeout(tx.timer);
            this.#transactions.delete(hash);
            this.#emitter.emit("failed", new TransactionError(
              `Transaction failed on-chain`,
              { hash }
            ));
            continue;
          }
          
          // Check if transaction has more confirmations than before
          if (confirmations > tx.confirmations) {
            tx.confirmations = confirmations;
            
            // Emit confirmed if just received first confirmation
            if (confirmations === 1) {
              this.#emitter.emit("confirmed", details);
            }
            
            // Emit finalized if reached required confirmations
            if (confirmations >= tx.requiredConfirmations) {
              clearTimeout(tx.timer);
              this.#transactions.delete(hash);
              this.#emitter.emit("finalized", details);
            }
          }
        } catch (error) {
          // Ignore errors, will retry on next poll
          console.error(`Error polling transaction ${hash}:`, error);
        }
      }
    } catch (error) {
      // Log error but continue polling
      console.error("Error in transaction polling:", error);
    }
    
    // Schedule next poll if still active
    if (this.#isPolling) {
      setTimeout(() => this.#poll(), this.#pollingInterval);
    }
  }
  
  /**
   * Handle transaction timeout
   * @param hash Transaction hash
   */
  #handleTimeout(hash: string): void {
    this.#transactions.delete(hash);
    this.#emitter.emit("timeout", hash);
  }
  
  /**
   * Dispose resources
   */
  dispose(): void {
    this.#stopPolling();
    
    // Clear all timeout timers
    for (const [hash, tx] of this.#transactions.entries()) {
      if (tx.timer) {
        clearTimeout(tx.timer);
      }
    }
    
    this.#transactions.clear();
    this.#emitter.removeAllListeners();
  }
}

/**
 * Creates a transaction monitor
 * @param client Radius SDK client
 * @param options Monitor options
 * @returns Transaction monitor instance
 */
export function createTransactionMonitor(
  client: Client,
  options?: TransactionMonitorOptions
): TransactionMonitor {
  return new TransactionMonitor(client, options);
}