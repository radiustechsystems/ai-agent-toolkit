import { type RadiusChain, type Signature, WalletClientBase } from "@radiustechsystems/ai-agent-core";
import type { 
  RadiusReadRequest, 
  RadiusReadResult, 
  RadiusTransaction, 
  RadiusTypedData, 
  BalanceInfo,
  TransactionDetails,
  TransactionSimulationResult
} from "./types";

/**
 * Interface defining the contract for Radius wallet clients
 */
export interface RadiusWalletInterface extends WalletClientBase {
    /**
     * Returns the chain information for this wallet
     */
    getChain(): RadiusChain;
    
    /**
     * Sends a transaction
     */
    sendTransaction(transaction: RadiusTransaction): Promise<{ hash: string }>;
    
    /**
     * Sends multiple transactions as a batch
     */
    sendBatchOfTransactions(transactions: RadiusTransaction[]): Promise<{ hash: string }>;
    
    /**
     * Reads data from a contract
     */
    read(request: RadiusReadRequest): Promise<RadiusReadResult>;
    
    /**
     * Resolves an address which may be an ENS name or hex address
     */
    resolveAddress(address: string): Promise<`0x${string}`>;
    
    /**
     * Signs typed data (EIP-712)
     */
    signTypedData(data: RadiusTypedData): Promise<Signature>;
    
    /**
     * Gets the balance of an address
     */
    balanceOf(address: string): Promise<BalanceInfo>;
    
    /**
     * Simulates a transaction without sending it
     */
    simulateTransaction(transaction: RadiusTransaction): Promise<TransactionSimulationResult>;
    
    /**
     * Gets transaction details by hash
     */
    getTransactionDetails(hash: string): Promise<TransactionDetails>;
    
    /**
     * Waits for a transaction to be confirmed
     */
    waitForTransaction(hash: string, confirmations?: number): Promise<TransactionDetails>;
    
    /**
     * Disposes of any resources used by the wallet
     */
    dispose(): void;
}
