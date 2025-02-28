import { describe, test, expect, vi, beforeEach } from "vitest";
import { BatchTransactionHandler, createBatchHandler } from "../batch-handler";
import { BatchTransactionError } from "../../utils/errors";

// Mock the Radius SDK components
vi.mock("@radiustechsystems/sdk", () => {
  return {
    Account: vi.fn(),
    Client: vi.fn(),
    Contract: {
      NewDeployed: vi.fn().mockImplementation(() => {
        return {
          execute: vi.fn().mockImplementation((client, account, functionName) => {
            // Simulate failure for a specific method
            if (functionName === "failingMethod") {
              return Promise.reject(new Error("Method execution failed"));
            }
            return Promise.resolve({ hash: `0xcontract-${functionName}-hash` });
          })
        };
      })
    },
    ABI: vi.fn().mockImplementation((abiJson) => {
      return { abiJson };
    }),
    Address: vi.fn().mockImplementation((address) => {
      return {
        toHex: vi.fn().mockReturnValue(address)
      };
    })
  };
});

describe("BatchTransactionHandler", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockClient: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockAccount: any;
  let batchHandler: BatchTransactionHandler;
  
  beforeEach(() => {
    mockClient = {
      send: vi.fn().mockImplementation((account, to, value) => {
        // Simulate failure for specific address
        if (to.toHex && to.toHex() === "0xfailure") {
          return Promise.reject(new Error("Transaction failed"));
        }
        return Promise.resolve({ hash: `0xtx-to-${to}-value-${value}` });
      })
    };
    
    mockAccount = {};
    
    batchHandler = createBatchHandler(mockClient, mockAccount);
  });
  
  describe("executeSequentialBatch", () => {
    test("should execute transactions in sequence and return last hash", async () => {
      const transactions = [
        { to: "0xrecipient1", value: BigInt(100) },
        { to: "0xrecipient2", value: BigInt(200) }
      ];
      
      const result = await batchHandler.executeSequentialBatch(transactions);
      
      expect(mockClient.send).toHaveBeenCalledTimes(2);
      expect(mockClient.send).toHaveBeenNthCalledWith(1, mockAccount, expect.anything(), BigInt(100));
      expect(mockClient.send).toHaveBeenNthCalledWith(2, mockAccount, expect.anything(), BigInt(200));
      
      // Should return the hash of the last transaction
      expect(result.hash).toBe("0xtx-to-0xrecipient2-value-200");
    });
    
    test("should throw BatchTransactionError when a transaction fails", async () => {
      const transactions = [
        { to: "0xrecipient1", value: BigInt(100) },
        { to: "0xfailure", value: BigInt(200) }, // This one will fail
        { to: "0xrecipient3", value: BigInt(300) }
      ];
      
      await expect(batchHandler.executeSequentialBatch(transactions)).rejects.toThrow(BatchTransactionError);
      // eslint-disable-next-line max-len
      await expect(batchHandler.executeSequentialBatch(transactions)).rejects.toThrow(/Batch transaction failed at index 1/);
      
      expect(mockClient.send).toHaveBeenCalledTimes(2); // Only first two should be called
    });
    
    test("should handle contract interactions", async () => {
      const contractTransactions = [
        {
          to: "0xcontract",
          abi: [{ type: "function", name: "transfer", inputs: [], outputs: [] }],
          functionName: "transfer",
          args: ["0xrecipient", BigInt(100)]
        }
      ];
      
      const result = await batchHandler.executeSequentialBatch(contractTransactions);
      
      expect(result.hash).toBe("0xcontract-transfer-hash");
    });
    
    test("should throw for invalid transaction format", async () => {
      const invalidTx = [
        {
          to: "0xcontract",
          // Missing either both abi/functionName or neither
          abi: [{ type: "function", name: "transfer", inputs: [], outputs: [] }]
        }
      ];
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(batchHandler.executeSequentialBatch(invalidTx as any)).rejects.toThrow(/Invalid transaction/);
    });
  });
  
  describe("executeTrueBatch", () => {
    test("should fall back to sequential execution", async () => {
      // Since true batching is not implemented yet, it should fall back to sequential
      const executeSpy = vi.spyOn(batchHandler, "executeSequentialBatch");
      
      const transactions = [
        { to: "0xrecipient1", value: BigInt(100) },
        { to: "0xrecipient2", value: BigInt(200) }
      ];
      
      const result = await batchHandler.executeTrueBatch(transactions);
      
      expect(executeSpy).toHaveBeenCalledWith(transactions);
      expect(result.hash).toBe("0xtx-to-0xrecipient2-value-200");
    });
  });
  
  describe("createBatchHandler", () => {
    test("should return a new BatchTransactionHandler instance", () => {
      const handler = createBatchHandler(mockClient, mockAccount);
      expect(handler).toBeInstanceOf(BatchTransactionHandler);
    });
  });
});