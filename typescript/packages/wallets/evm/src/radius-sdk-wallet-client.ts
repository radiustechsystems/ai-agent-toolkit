import { 
  Account,
  Address,
  Client,
  Contract,
  ABI,
  KeySigner
} from "@radiustechsystems/sdk";

import {
  type EVMReadRequest,
  type EVMReadResult,
  type EVMTransaction,
  type EVMTypedData
} from "./types";

import { EVMWalletClient } from "./evm-wallet-client"
import { radiusTestnetBase } from "./radius-chain"

import { Signature } from "@radiustechsystems/ai-agent-core";

/**
 * Wallet client implementation using the Radius SDK
 */
export class RadiusSDKWalletClient extends EVMWalletClient {
  #account: Account;
  #client: Client;
  #address: Address;

  /**
   * Creates a new RadiusSDKWalletClient
   * @param account Radius SDK Account 
   * @param client Radius SDK Client
   */
  constructor(account: Account, client: Client) {
    super();
    this.#account = account;
    this.#client = client; 
    this.#address = account.address;
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
  getAddress() {
    return this.#address.toHex();
  }

  /**
   * Resolves an address which may be an ENS name or hex address
   * @param address Address to resolve
   * @returns Normalized address as hex string
   */
  async resolveAddress(address: string): Promise<`0x${string}`> {
    // For now, simple implementation - the SDK doesn't have ENS support yet
    // Just check if it's a hex address and if so, return it
    if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return address as `0x${string}`;
    }
    
    // If we get here and the SDK doesn't support ENS, throw error
    throw new Error(`Cannot resolve non-hex address: ${address}`);
  }

  /**
   * Signs a message using the account
   * @param message Message to sign
   * @returns Signature object
   */
  async signMessage(message: string): Promise<Signature> {
    const signature = await this.#account.signMessage(message);
    return { signature };
  }

  /**
   * Signs typed data (EIP-712)
   * @param data Typed data to sign
   * @returns Signature object
   */
  async signTypedData(data: EVMTypedData): Promise<Signature> {
    // The SDK doesn't have native EIP-712 support yet, so we need to handle this differently
    // This would typically involve hashing the typed data and signing it
    throw new Error("EIP-712 signing not yet implemented in the Radius SDK wrapper");
  }

  /**
   * Sends a transaction
   * @param transaction Transaction to send
   * @returns Transaction hash
   */
  async sendTransaction(transaction: EVMTransaction): Promise<{ hash: string }> {
    const { to, abi, functionName, args, value, data } = transaction;
    
    // Validate chain before proceeding
    const chainId = await this.#client.getChainId();
    this.validateChain(chainId);
    
    try {
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
  async balanceOf(address: string) {
    try {
      const addr = new Address(address);
      const balance = await this.#client.getBalance(addr);
      
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
}

/**
 * Creates a RadiusSDKWalletClient
 * @param account Radius SDK Account
 * @param client Radius SDK Client
 * @returns RadiusSDKWalletClient instance
 */
export function radiusSdk(account: Account, client: Client) {
  return new RadiusSDKWalletClient(account, client);
}
