import { 
  Account, 
  Client
} from "@radiustechsystems/sdk";

import { EVMSmartWalletClient } from "./evm-smart-wallet-client";
import { EVMReadRequest, EVMReadResult, EVMTransaction, EVMTypedData } from "./types";
import { RadiusSDKWalletClient, radiusSdk } from "./radius-sdk-wallet-client";
import { Signature } from "@radiustechsystems/ai-agent-core";

/**
 * Implementation of a smart wallet client using the Radius SDK
 * Extends the base RadiusSDKWalletClient with batch transaction support
 */
export class RadiusSmartWalletClient extends EVMSmartWalletClient {
  #account: Account;
  #client: Client;
  #baseClient: RadiusSDKWalletClient;

  /**
   * Creates a new RadiusSmartWalletClient
   * @param account SDK Account
   * @param client SDK Client
   */
  constructor(account: Account, client: Client) {
    super();
    this.#account = account;
    this.#client = client;
    this.#baseClient = radiusSdk(account, client);
  }

  /**
   * Gets the chain information
   */
  getChain() {
    return this.#baseClient.getChain();
  }

  /**
   * Gets the wallet address
   */
  getAddress() {
    return this.#baseClient.getAddress();
  }

  /**
   * Resolves an address (ENS or hex)
   */
  async resolveAddress(address: string): Promise<`0x${string}`> {
    return this.#baseClient.resolveAddress(address);
  }

  /**
   * Signs a message
   */
  async signMessage(message: string) {
    return this.#baseClient.signMessage(message);
  }

  /**
   * Signs typed data (EIP-712)
   * @param data The typed data to sign according to EIP-712 standard
   * @returns A signature object
   */
  async signTypedData(data: EVMTypedData): Promise<Signature> {
    return this.#baseClient.signTypedData(data);
  }

  /**
   * Reads data from a contract
   * @param request The read request containing contract address, function name, arguments and ABI
   * @returns The result of the contract call
   */
  async read(request: EVMReadRequest): Promise<EVMReadResult> {
    return this.#baseClient.read(request);
  }

  /**
   * Gets the balance of an address
   * @param address Address to check
   * @returns Balance information
   */
  async balanceOf(address: string) {
    return this.#baseClient.balanceOf(address);
  }

  /**
   * Sends a batch of transactions
   * Note: This is a simplified implementation that executes transactions
   * sequentially rather than in a true batch. A real implementation would
   * use a batch transaction contract.
   * 
   * @param transactions Array of transactions to execute
   * @returns Hash of the last transaction in the batch
   */
  async sendBatchOfTransactions(transactions: EVMTransaction[]): Promise<{ hash: string }> {
    if (transactions.length === 0) {
      throw new Error("Cannot send an empty batch of transactions");
    }

    try {
      // Validate chain before proceeding
      const chainId = await this.#client.getChainId();
      this.validateChain(chainId);
      
      let lastHash = { hash: "" };
      
      // Execute each transaction sequentially
      // In a real implementation, we would use a batch transaction contract
      for (const tx of transactions) {
        lastHash = await this.#baseClient.sendTransaction(tx);
      }
      
      return lastHash;
    } catch (error) {
      throw new Error(`Batch transaction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Creates a RadiusSmartWalletClient
 * @param account SDK Account
 * @param client SDK Client
 * @returns Smart wallet client
 */
export function radiusSmartWallet(account: Account, client: Client) {
  return new RadiusSmartWalletClient(account, client);
}
