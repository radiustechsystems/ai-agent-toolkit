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
  type RadiusReadRequest,
  type RadiusReadResult,
  type RadiusTransaction,
  type RadiusTypedData,
  type RadiusWalletOptions,
  type BalanceInfo,
  type RadiusWalletConfig
} from "./types";

import { RadiusWalletInterface } from "./radius-wallet-interface";
import { radiusTestnetBase } from "../chain/radius-chain";
import { Signature } from "@radiustechsystems/ai-agent-core";
import { validateChain } from "../utils/utilities";
import { validateWalletConfig } from "../utils/helpers";

/**
 * Unified wallet client implementation using the Radius SDK.
 * Supports both standard and smart wallet functionality based on configuration options.
 */
// Import new services
import { 
  createCache, 
  WalletCache 
} from "../utils/cache";
import { 
  createTransactionMonitor, 
  TransactionMonitor 
} from "../transaction/transaction-monitor";
import { 
  createGasEstimator, 
  GasEstimator 
} from "../transaction/gas-estimator";
import { 
  createEnsResolver, 
  EnsResolver 
} from "../transaction/ens-resolver";
import { 
  createTypedDataSigner, 
  TypedDataSigner 
} from "../transaction/typed-data-signer";
import { 
  createBatchHandler, 
  BatchTransactionHandler 
} from "../transaction/batch-handler";
import {
  TransactionError,
  BatchTransactionError,
  AddressResolutionError,
  ChainValidationError,
  SigningError
} from "../utils/errors";
import {
  formatUnits
} from "../utils/helpers";

export class RadiusWalletClient implements RadiusWalletInterface {
  #account: Account;
  #client: Client;
  #address: Address;
  #options: RadiusWalletOptions;
  
  // Advanced services
  #cache?: WalletCache;
  #txMonitor?: TransactionMonitor;
  #gasEstimator?: GasEstimator;
  #ensResolver?: EnsResolver;
  #typedDataSigner?: TypedDataSigner;
  #batchHandler?: BatchTransactionHandler;

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
    
    // Initialize services if enabled
    if (options.enableCaching !== false) {
      this.#cache = createCache(options.maxCacheAge);
    }
    
    if (options.enableENS) {
      this.#ensResolver = createEnsResolver(
        client, 
        options.ensRegistryAddress,
        this.#cache
      );
    }
    
    if (options.enableTransactionMonitoring) {
      this.#txMonitor = createTransactionMonitor(client, {
        confirmations: options.confirmations,
        timeout: options.transactionTimeout,
        pollingInterval: 5000
      });
    }
    
    this.#log("Wallet initialized", { 
      address: this.getAddress(),
      batchEnabled: !!options.enableBatchTransactions,
      ensEnabled: !!options.enableENS,
      cacheEnabled: options.enableCaching !== false,
      monitoringEnabled: !!options.enableTransactionMonitoring,
      gasEstimationEnabled: options.enableGasEstimation !== false
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
    try {
      // If ENS resolution is enabled, try to resolve through the ENS resolver
      if (this.#options.enableENS && this.#ensResolver) {
        return await this.#ensResolver.resolveAddress(address);
      }
      
      // Basic validation for hex addresses
      if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return address.toLowerCase() as `0x${string}`;
      }
      
      throw new AddressResolutionError(`Cannot resolve address: ${address}. ENS resolution is ${this.#options.enableENS ? 'enabled but failed' : 'disabled'}`, address);
    } catch (error) {
      if (error instanceof AddressResolutionError) {
        throw error;
      }
      throw new AddressResolutionError(
        `Address resolution failed: ${error instanceof Error ? error.message : String(error)}`,
        address
      );
    }
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
  async signTypedData(data: RadiusTypedData): Promise<Signature> {
    try {
      this.#log("Signing typed data", { domain: data.domain });
      
      if (!this.#typedDataSigner) {
        this.#typedDataSigner = createTypedDataSigner();
      }
      
      const signature = await this.#typedDataSigner.signTypedData(this.#account, data);
      return { signature };
    } catch (error) {
      throw new SigningError(
        `Failed to sign typed data: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Sends a transaction or routes to batch implementation if smart wallet mode is enabled
   * @param transaction Transaction to send
   * @returns Transaction hash
   */
  async sendTransaction(transaction: RadiusTransaction): Promise<{ hash: string }> {
    try {
      // If transaction has the simulate flag, only simulate without sending
      if (transaction.simulate) {
        await this.simulateTransaction(transaction);
        return { hash: "0x0000000000000000000000000000000000000000000000000000000000000000" };
      }
      
      // Estimate gas if enabled and not explicitly provided
      if (this.#options.enableGasEstimation !== false && !transaction.gasLimit) {
        if (!this.#gasEstimator) {
          this.#gasEstimator = createGasEstimator(
            this.#client, 
            this.#options.gasMultiplier,
            this.#options.enableCaching ? this.#cache : undefined
          );
        }
        
        const estimatedGas = await this.#gasEstimator.estimateGas(transaction, this.#account);
        transaction = { ...transaction, gasLimit: estimatedGas };
      }
      
      // If batch transactions are enabled, route through the batch implementation
      if (this.#options.enableBatchTransactions) {
        this.#log("Using batch transaction for single transaction", { transaction });
        return this.sendBatchOfTransactions([transaction]);
      }
      
      // Standard implementation follows
      const result = await this.#sendSingleTransaction(transaction);
      
      // Start monitoring transaction if enabled
      if (this.#options.enableTransactionMonitoring && this.#txMonitor) {
        this.#txMonitor.monitorTransaction(
          result.hash,
          {
            confirmations: this.#options.confirmations,
            timeout: this.#options.transactionTimeout
          }
        );
      }
      
      return result;
    } catch (error) {
      throw new TransactionError(
        `Transaction failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Sends multiple transactions as a batch
   * @param transactions Array of transactions to execute
   * @returns Hash of the last transaction in the batch
   */
  async sendBatchOfTransactions(transactions: RadiusTransaction[]): Promise<{ hash: string }> {
    if (transactions.length === 0) {
      throw new BatchTransactionError("Cannot send an empty batch of transactions", 0, []);
    }

    try {
      // Validate chain before proceeding
      const chainId = await this.#client.getChainId();
      validateChain(chainId);
      
      this.#log("Processing batch of transactions", { count: transactions.length });
      
      // Estimate gas for each transaction if enabled
      if (this.#options.enableGasEstimation !== false) {
        if (!this.#gasEstimator) {
          this.#gasEstimator = createGasEstimator(
            this.#client, 
            this.#options.gasMultiplier,
            this.#options.enableCaching ? this.#cache : undefined
          );
        }
        
        // Add gas estimates to each transaction that doesn't have it
        for (let i = 0; i < transactions.length; i++) {
          if (!transactions[i].gasLimit) {
            const estimatedGas = await this.#gasEstimator.estimateGas(transactions[i], this.#account);
            transactions[i] = { ...transactions[i], gasLimit: estimatedGas };
          }
        }
      }
      
      // Create batch handler if needed
      if (!this.#batchHandler) {
        this.#batchHandler = createBatchHandler(this.#client, this.#account);
      }
      
      // Execute the batch using the batch handler
      const result = await this.#batchHandler.executeTrueBatch(transactions);
      
      // Start monitoring the transaction if enabled
      if (this.#options.enableTransactionMonitoring && this.#txMonitor) {
        this.#txMonitor.monitorTransaction(
          result.hash,
          {
            confirmations: this.#options.confirmations,
            timeout: this.#options.transactionTimeout
          }
        );
      }
      
      return result;
    } catch (error) {
      if (error instanceof BatchTransactionError) {
        throw error;
      }
      
      throw new BatchTransactionError(
        `Batch transaction failed: ${error instanceof Error ? error.message : String(error)}`,
        0,
        []
      );
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
      ),
      createTool(
        {
          name: "simulate_transaction",
          description: "Simulate a transaction to check if it would succeed",
          parameters: z.object({
            to: z.string(),
            value: z.optional(z.string()),
            functionName: z.optional(z.string()),
            args: z.optional(z.array(z.any())),
            abi: z.optional(z.array(z.any()))
          })
        },
        async (parameters) => {
          const { to, value, functionName, args, abi } = parameters;
          return this.simulateTransaction({
            to,
            value: value ? BigInt(value) : undefined,
            functionName,
            args,
            abi,
            simulate: true
          });
        }
      ),
      createTool(
        {
          name: "resolve_address",
          description: "Resolve an ENS name to an address",
          parameters: z.object({ name: z.string() })
        },
        (parameters) => this.resolveAddress(parameters.name)
      ),
      createTool(
        {
          name: "get_transaction_status",
          description: "Check the status of a transaction",
          parameters: z.object({ hash: z.string() })
        },
        (parameters) => this.getTransactionDetails(parameters.hash)
      )
    ];
  }

  /**
   * Internal implementation for sending a single transaction
   * @param transaction Transaction to send
   * @returns Transaction hash
   */
  async #sendSingleTransaction(transaction: RadiusTransaction): Promise<{ hash: string }> {
    const { to, abi, functionName, args, value, data, gasLimit, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce } = transaction;
    
    try {
      // Validate chain before proceeding
      const chainId = await this.#client.getChainId();
      validateChain(chainId);
      
      // Resolve the recipient address (handles ENS names if enabled)
      const resolvedTo = await this.resolveAddress(to);
      
      this.#log("Sending transaction", { 
        to: resolvedTo,
        functionName, 
        value: value?.toString(),
        gasLimit: gasLimit?.toString()
      });
      
      // Simple ETH transfer (no contract interaction)
      if (!abi && !functionName) {
        const toAddress = new Address(resolvedTo);
        
        // SDK doesn't yet support explicit gas parameters, 
        // but we could pass them if/when it does
        const receipt = await this.#client.send(this.#account, toAddress, value || BigInt(0));
        return { hash: receipt.hash };
      }
      
      // Contract interaction
      if (abi && functionName) {
        // Create ABI instance from the JSON string
        const abiInstance = new ABI(JSON.stringify(abi));
        
        // Create contract instance
        const contract = await Contract.NewDeployed(abiInstance, resolvedTo);
        
        // Execute contract method
        // SDK doesn't directly support gas parameters for contract.execute yet
        const receipt = await contract.execute(
          this.#client,
          this.#account,
          functionName,
          ...(args || [])
        );
        
        return { hash: receipt.hash };
      }
      
      throw new TransactionError("Invalid transaction: Either both abi and functionName must be provided, or neither");
    } catch (error) {
      if (error instanceof TransactionError || 
          error instanceof AddressResolutionError || 
          error instanceof ChainValidationError) {
        throw error;
      }
      
      throw new TransactionError(
        `Transaction failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Reads data from a contract
   * @param request Contract read request
   * @returns Result from the contract call
   */
  async read(request: RadiusReadRequest): Promise<RadiusReadResult> {
    const { address, functionName, args, abi } = request;
    
    try {
      this.#log("Reading contract data", { request });
      
      // Check cache first if enabled
      if (this.#options.enableCaching && this.#cache) {
        const cacheKey = WalletCache.createContractReadKey(address, functionName, args || []);
        const cached = this.#cache.get<unknown>(cacheKey);
        
        if (cached !== undefined) {
          this.#log("Cache hit for contract read", { request, cacheKey });
          return { 
            value: cached,
            success: true 
          };
        }
      }
      
      // Create ABI instance
      const abiInstance = new ABI(JSON.stringify(abi));
      
      // Create contract instance
      const contract = await Contract.NewDeployed(abiInstance, address);
      
      // Call contract method
      const result = await contract.call(this.#client, functionName, ...(args || []));
      
      // Cache the result if caching is enabled
      if (this.#options.enableCaching && this.#cache) {
        const cacheKey = WalletCache.createContractReadKey(address, functionName, args || []);
        this.#cache.set(cacheKey, result);
      }
      
      return { 
        value: result,
        success: true 
      };
    } catch (error) {
      return {
        value: null,
        success: false,
        error: `Contract read failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  
  /**
   * Simulates a transaction without sending it
   * @param transaction Transaction to simulate
   * @returns Simulation result
   */
  async simulateTransaction(transaction: RadiusTransaction): Promise<TransactionSimulationResult> {
    try {
      this.#log("Simulating transaction", { transaction });
      
      if (!this.#gasEstimator) {
        this.#gasEstimator = createGasEstimator(
          this.#client, 
          this.#options.gasMultiplier,
          this.#options.enableCaching ? this.#cache : undefined
        );
      }
      
      return await this.#gasEstimator.simulateTransaction(transaction, this.#account);
    } catch (error) {
      return {
        success: false,
        gasUsed: BigInt(0),
        error: `Simulation failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  
  /**
   * Gets a transaction receipt and details
   * @param hash Transaction hash
   * @returns Transaction details
   */
  async getTransactionDetails(hash: string): Promise<TransactionDetails> {
    try {
      if (!this.#txMonitor) {
        this.#txMonitor = createTransactionMonitor(this.#client, {
          confirmations: this.#options.confirmations,
          timeout: this.#options.transactionTimeout
        });
      }
      
      return await this.#txMonitor.getTransactionDetails(hash);
    } catch (error) {
      throw new TransactionError(
        `Failed to get transaction details: ${error instanceof Error ? error.message : String(error)}`,
        { hash }
      );
    }
  }
  
  /**
   * Waits for a transaction to be confirmed
   * @param hash Transaction hash to wait for
   * @param confirmations Number of confirmations to wait for
   * @returns Transaction details once confirmed
   */
  async waitForTransaction(
    hash: string, 
    confirmations?: number
  ): Promise<TransactionDetails> {
    try {
      if (!this.#txMonitor) {
        this.#txMonitor = createTransactionMonitor(this.#client, {
          confirmations: this.#options.confirmations,
          timeout: this.#options.transactionTimeout
        });
      }
      
      return await this.#txMonitor.waitForTransaction(
        hash, 
        confirmations || this.#options.confirmations, 
        this.#options.transactionTimeout
      );
    } catch (error) {
      throw new TransactionError(
        `Failed waiting for transaction: ${error instanceof Error ? error.message : String(error)}`,
        { hash }
      );
    }
  }

  /**
   * Gets the balance of an address
   * @param address Address to check
   * @returns Balance information
   */
  async balanceOf(address: string): Promise<BalanceInfo> {
    try {
      // Resolve the address if it's an ENS name
      const resolvedAddress = await this.resolveAddress(address);
      
      // Check cache first if enabled
      if (this.#options.enableCaching && this.#cache) {
        const cacheKey = WalletCache.createBalanceKey(resolvedAddress);
        const cached = this.#cache.get<BalanceInfo>(cacheKey);
        
        if (cached !== undefined) {
          this.#log("Cache hit for balance check", { address, cacheKey });
          return cached;
        }
      }
      
      const addr = new Address(resolvedAddress);
      const balance = await this.#client.getBalance(addr);
      
      this.#log("Retrieved balance", { address: resolvedAddress, balance: balance.toString() });
      
      // Get chain token info
      const chainId = await this.#client.getChainId();
      const token = getChainToken(chainId);
      
      // Format to match the expected return structure
      const result: BalanceInfo = {
        value: formatUnits(balance, token.decimals),
        decimals: token.decimals,
        symbol: token.symbol,
        name: token.name,
        inBaseUnits: balance.toString(),
      };
      
      // Cache the result if caching is enabled
      if (this.#options.enableCaching && this.#cache) {
        const cacheKey = WalletCache.createBalanceKey(resolvedAddress);
        this.#cache.set(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      throw new Error(`Failed to get balance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Disposes of any resources used by the wallet
   * Should be called when the wallet is no longer needed
   */
  dispose(): void {
    // Clean up transaction monitor
    if (this.#txMonitor) {
      this.#txMonitor.dispose();
    }
    
    // Clear cache
    if (this.#cache) {
      this.#cache.clear();
    }
    
    this.#log("Wallet resources disposed");
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
): Promise<RadiusWalletInterface> {
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
    
    // Create wallet with all the new features enabled
    return new RadiusWalletClient(account, client, { 
      // Basic features
      enableBatchTransactions,
      logger,
      
      // Advanced features
      enableENS: true,
      enableCaching: true,
      enableGasEstimation: true,
      enableTransactionMonitoring: true,
      
      // Default configurations
      gasMultiplier: 1.2,
      confirmations: 1,
      transactionTimeout: 60000,
      maxCacheAge: 30000
    });
  } catch (error) {
    throw new Error(`Failed to create Radius wallet: ${error instanceof Error ? error.message : String(error)}`);
  }
}
