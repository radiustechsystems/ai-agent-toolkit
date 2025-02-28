import { 
  Account,
  Address,
  Client,
  Contract,
  ABI,
  withPrivateKey,
  withLogger
} from "@radiustechsystems/sdk";

import { z } from "zod";
import { ToolBase, createTool } from "@radiustechsystems/ai-agent-core";

import {
  type EVMReadRequest,
  type EVMReadResult,
  type EVMTransaction,
  type EVMTypedData,
  type RadiusWalletOptions,
  type BalanceInfo,
  type RadiusWalletConfig
} from "./types";

import { EVMWalletClient } from "./evm-wallet-client";
import { radiusTestnetBase } from "./radius-chain";
import { Signature } from "@radiustechsystems/ai-agent-core";
import { validateChain } from "./utilities";
import { validateWalletConfig } from "./helpers";

/**
 * Unified wallet client implementation using the Radius SDK.
 * Supports both standard and smart wallet functionality based on configuration options.
 */
export class RadiusWalletClient implements EVMWalletClient {
  #account: Account;
  #client: Client;
  #address: Address;
  #options: RadiusWalletOptions;

  /**
   * Creates a new RadiusWalletClient
   * @param account Radius SDK Account 
   * @param client Radius SDK Client
   * @param options Configuration options
   */
  constructor(
    account: Account, 
    client: Client,
    options: RadiusWalletOptions = {}
  ) {
    this.#account = account;
    this.#client = client; 
    this.#address = account.address;
    this.#options = options;
    
    this.#log("Wallet initialized", { 
      address: this.getAddress(),
      batchEnabled: !!this.#options.enableBatchTransactions
    });
  }

  /**
   * Returns the wallet's chain information
   * @returns Chain object with type and id
   */
  getChain() {
    return {
      type: "evm" as const,
      id: radiusTestnetBase.id,
    };
  }

  /**
   * Gets the wallet's address as a string
   * @returns Wallet address
   */
  getAddress(): string {
    return this.#address.toHex();
  }

  /**
   * Resolves an address which may be an ENS name or hex address
   * @param address Address to resolve
   * @returns Normalized address as hex string
   */
  async resolveAddress(address: string): Promise<`0x${string}`> {
    // For now, simple implementation - the SDK doesn't have ENS support yet
    if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return address as `0x${string}`;
    }
    
    throw new Error(`Cannot resolve non-hex address: ${address}`);
  }

  /**
   * Signs a message using the account
   * @param message Message to sign
   * @returns Signature object
   */
  async signMessage(message: string): Promise<Signature> {
    try {
      this.#log("Signing message", { message });
      const signature = await this.#account.signMessage(message);
      return { signature };
    } catch (error) {
      throw new Error(`Failed to sign message: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Signs typed data (EIP-712)
   * @param data Typed data to sign
   * @returns Signature object
   */
  async signTypedData(data: EVMTypedData): Promise<Signature> {
    // The SDK doesn't have native EIP-712 support yet
    throw new Error("EIP-712 signing not yet implemented in the Radius SDK wrapper");
  }

  /**
   * Sends a transaction or routes to batch implementation if smart wallet mode is enabled
   * @param transaction Transaction to send
   * @returns Transaction hash
   */
  async sendTransaction(transaction: EVMTransaction): Promise<{ hash: string }> {
    // If batch transactions are enabled, route through the batch implementation
    if (this.#options.enableBatchTransactions) {
      this.#log("Using batch transaction for single transaction", { transaction });
      return this.sendBatchOfTransactions([transaction]);
    }
    
    // Standard implementation follows
    return this.#sendSingleTransaction(transaction);
  }

  /**
   * Sends multiple transactions as a batch
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
      validateChain(chainId);
      
      this.#log("Processing batch of transactions", { count: transactions.length });
      
      let lastHash = { hash: "" };
      
      // Execute each transaction sequentially
      for (const tx of transactions) {
        lastHash = await this.#sendSingleTransaction(tx);
      }
      
      return lastHash;
    } catch (error) {
      throw new Error(`Batch transaction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Returns the core tools provided by this wallet client
   * @returns Array of core wallet tools
   */
  getCoreTools(): ToolBase[] {
    return [
      createTool(
        {
          name: "get_address",
          description: "Get the address of the wallet",
          parameters: z.object({})
        },
        () => this.getAddress()
      ),
      createTool(
        {
          name: "get_chain",
          description: "Get the chain of the wallet",
          parameters: z.object({})
        },
        () => this.getChain()
      ),
      createTool(
        {
          name: "get_balance",
          description: "Get the balance of an address",
          parameters: z.object({ address: z.string() })
        },
        (parameters) => this.balanceOf(parameters.address)
      ),
      createTool(
        {
          name: "sign_message",
          description: "Sign a message with the wallet",
          parameters: z.object({ message: z.string() })
        },
        (parameters) => this.signMessage(parameters.message)
      )
    ];
  }

  /**
   * Internal implementation for sending a single transaction
   * @param transaction Transaction to send
   * @returns Transaction hash
   */
  async #sendSingleTransaction(transaction: EVMTransaction): Promise<{ hash: string }> {
    const { to, abi, functionName, args, value, data } = transaction;
    
    try {
      // Validate chain before proceeding
      const chainId = await this.#client.getChainId();
      validateChain(chainId);
      
      this.#log("Sending transaction", { transaction });
      
      // Simple ETH transfer (no contract interaction)
      if (!abi && !functionName) {
        const toAddress = new Address(to);
        const receipt = await this.#client.send(this.#account, toAddress, value || BigInt(0));
        return { hash: receipt.hash };
      }
      
      // Contract interaction
      if (abi && functionName) {
        // Create ABI instance from the JSON string
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
    } catch (error) {
      throw new Error(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Reads data from a contract
   * @param request Contract read request
   * @returns Result from the contract call
   */
  async read(request: EVMReadRequest): Promise<EVMReadResult> {
    const { address, functionName, args, abi } = request;
    
    try {
      this.#log("Reading contract data", { request });
      
      // Create ABI instance
      const abiInstance = new ABI(JSON.stringify(abi));
      
      // Create contract instance
      const contract = await Contract.NewDeployed(abiInstance, address);
      
      // Call contract method
      const result = await contract.call(this.#client, functionName, ...(args || []));
      
      return { value: result };
    } catch (error) {
      throw new Error(`Contract read failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Gets the balance of an address
   * @param address Address to check
   * @returns Balance information
   */
  async balanceOf(address: string): Promise<BalanceInfo> {
    try {
      const addr = new Address(address);
      const balance = await this.#client.getBalance(addr);
      
      this.#log("Retrieved balance", { address, balance: balance.toString() });
      
      // Format to match the expected return structure
      return {
        value: (Number(balance) / 10**18).toString(), // Convert wei to ETH
        decimals: 18,
        symbol: radiusTestnetBase.nativeCurrency.symbol,
        name: radiusTestnetBase.nativeCurrency.name,
        inBaseUnits: balance.toString(),
      };
    } catch (error) {
      throw new Error(`Failed to get balance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Internal logging method
   * @param message Log message
   * @param data Optional data to log
   */
  #log(message: string, data?: Record<string, unknown>): void {
    if (this.#options.logger) {
      this.#options.logger(message, data);
    }
  }
}

/**
 * Creates a Radius wallet client with the specified configuration
 * @param config Wallet configuration (RPC URL and private key)
 * @param enableBatchTransactions Whether to enable batch transaction support
 * @param logger Optional logging function for wallet operations
 * @returns A configured EVMWalletClient ready for use
 */
export async function createRadiusWallet(
  config: RadiusWalletConfig,
  enableBatchTransactions: boolean = false,
  logger?: (message: string, data?: Record<string, unknown>) => void
): Promise<EVMWalletClient> {
  // Validate configuration
  validateWalletConfig(config);

  try {
    // Create SDK client
    const client = await Client.New(
      config.rpcUrl,
      withLogger((message, data) => {
        // Use provided logger if available
        if (logger) {
          logger(message, data);
        } 
        // Fall back to debug logging
        else if (process.env.DEBUG === "true") {
          console.log(`[Radius] ${message}`, data);
        }
      })
    );
    
    // Create account with private key
    const account = await Account.New(
      withPrivateKey(config.privateKey, client)
    );
    
    // Create wallet with specified options
    return new RadiusWalletClient(account, client, { 
      enableBatchTransactions,
      logger
    });
  } catch (error) {
    throw new Error(`Failed to create Radius wallet: ${error instanceof Error ? error.message : String(error)}`);
  }
}
