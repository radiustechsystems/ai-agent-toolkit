import { type EvmChain, type Signature, WalletClientBase } from "@radiustechsystems/ai-agent-core";
import type { EVMReadRequest, EVMReadResult, EVMTransaction, EVMTypedData, BalanceInfo } from "./types";

/**
 * Interface defining the contract for all wallet clients
 */
export interface EVMWalletClient extends WalletClientBase {
    /**
     * Returns the chain information for this wallet
     */
    getChain(): EvmChain;
    
    /**
     * Sends a transaction
     */
    sendTransaction(transaction: EVMTransaction): Promise<{ hash: string }>;
    
    /**
     * Reads data from a contract
     */
    read(request: EVMReadRequest): Promise<EVMReadResult>;
    
    /**
     * Resolves an address which may be an ENS name or hex address
     */
    resolveAddress(address: string): Promise<`0x${string}`>;
    
    /**
     * Signs typed data (EIP-712)
     */
    signTypedData(data: EVMTypedData): Promise<Signature>;
    
    /**
     * Gets the balance of an address
     */
    balanceOf(address: string): Promise<BalanceInfo>;
}
