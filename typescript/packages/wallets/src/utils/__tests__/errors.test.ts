import { describe, test, expect } from "vitest";
import {
  WalletError,
  TransactionError,
  ContractError,
  ChainValidationError,
  AddressResolutionError,
  SigningError,
  GasEstimationError,
  BatchTransactionError
} from "../errors";

describe("Error Classes", () => {
  describe("WalletError", () => {
    test("should create error with correct properties", () => {
      const message = "Base wallet error";
      const error = new WalletError(message);
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(message);
      expect(error.name).toBe("WalletError");
    });
  });
  
  describe("TransactionError", () => {
    test("should create error with message only", () => {
      const message = "Transaction failed";
      const error = new TransactionError(message);
      
      expect(error).toBeInstanceOf(WalletError);
      expect(error.message).toBe(message);
      expect(error.name).toBe("TransactionError");
      expect(error.transactionHash).toBeUndefined();
      expect(error.code).toBeUndefined();
    });
    
    test("should create error with hash and code", () => {
      const message = "Transaction failed";
      const hash = "0xhash123";
      const code = "UNPREDICTABLE_GAS_LIMIT";
      const error = new TransactionError(message, { hash, code });
      
      expect(error).toBeInstanceOf(WalletError);
      expect(error.message).toBe(message);
      expect(error.transactionHash).toBe(hash);
      expect(error.code).toBe(code);
    });
  });
  
  describe("ContractError", () => {
    test("should create error with contract address", () => {
      const message = "Contract call failed";
      const address = "0xcontract123";
      const error = new ContractError(message, address);
      
      expect(error).toBeInstanceOf(WalletError);
      expect(error.message).toBe(message);
      expect(error.name).toBe("ContractError");
      expect(error.contractAddress).toBe(address);
      expect(error.functionName).toBeUndefined();
    });
    
    test("should create error with contract address and function name", () => {
      const message = "Contract call failed";
      const address = "0xcontract123";
      const functionName = "transfer";
      const error = new ContractError(message, address, functionName);
      
      expect(error).toBeInstanceOf(WalletError);
      expect(error.message).toBe(message);
      expect(error.contractAddress).toBe(address);
      expect(error.functionName).toBe(functionName);
    });
  });
  
  describe("ChainValidationError", () => {
    test("should create error with chain ID", () => {
      const message = "Unsupported chain";
      const chainId = 1234;
      const error = new ChainValidationError(message, chainId);
      
      expect(error).toBeInstanceOf(WalletError);
      expect(error.message).toBe(message);
      expect(error.name).toBe("ChainValidationError");
      expect(error.chainId).toBe(chainId);
    });
  });
  
  describe("AddressResolutionError", () => {
    test("should create error with address", () => {
      const message = "Cannot resolve ENS name";
      const address = "user.eth";
      const error = new AddressResolutionError(message, address);
      
      expect(error).toBeInstanceOf(WalletError);
      expect(error.message).toBe(message);
      expect(error.name).toBe("AddressResolutionError");
      expect(error.address).toBe(address);
    });
  });
  
  describe("SigningError", () => {
    test("should create error with message", () => {
      const message = "Failed to sign message";
      const error = new SigningError(message);
      
      expect(error).toBeInstanceOf(WalletError);
      expect(error.message).toBe(message);
      expect(error.name).toBe("SigningError");
    });
  });
  
  describe("GasEstimationError", () => {
    test("should create error with message", () => {
      const message = "Gas estimation failed";
      const error = new GasEstimationError(message);
      
      expect(error).toBeInstanceOf(WalletError);
      expect(error.message).toBe(message);
      expect(error.name).toBe("GasEstimationError");
    });
  });
  
  describe("BatchTransactionError", () => {
    test("should create error with failed index", () => {
      const message = "Batch transaction failed";
      const failedIndex = 2;
      const error = new BatchTransactionError(message, failedIndex);
      
      expect(error).toBeInstanceOf(WalletError);
      expect(error.message).toBe(message);
      expect(error.name).toBe("BatchTransactionError");
      expect(error.failedIndex).toBe(failedIndex);
      expect(error.previousTransactions).toEqual([]);
    });
    
    test("should create error with failed index and previous transactions", () => {
      const message = "Batch transaction failed";
      const failedIndex = 2;
      const previousTransactions = ["0xtx1", "0xtx2"];
      const error = new BatchTransactionError(message, failedIndex, previousTransactions);
      
      expect(error).toBeInstanceOf(WalletError);
      expect(error.message).toBe(message);
      expect(error.failedIndex).toBe(failedIndex);
      expect(error.previousTransactions).toEqual(previousTransactions);
    });
  });
});
