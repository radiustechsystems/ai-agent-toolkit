import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { TransactionMonitor, createTransactionMonitor } from "../transaction-monitor";
import { EventEmitter } from "events";
import { TransactionError } from "../../utils/errors";

vi.mock("@radiustechsystems/sdk", () => ({
  Client: vi.fn()
}));

describe("TransactionMonitor", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockClient: any;
  let txMonitor: TransactionMonitor;
  
  beforeEach(() => {
    mockClient = {
      getTransactionReceipt: vi.fn().mockImplementation((hash) => {
        if (hash === "0xpending") return null;
        if (hash === "0xfailed") {
          return {
            blockNumber: 100,
            status: 0,
            gasUsed: BigInt(21000),
            effectiveGasPrice: BigInt(10000000000)
          };
        }
        return {
          blockNumber: 100,
          status: 1,
          gasUsed: BigInt(21000),
          effectiveGasPrice: BigInt(10000000000)
        };
      }),
      getBlockNumber: vi.fn().mockResolvedValue(101)
    };
    
    txMonitor = createTransactionMonitor(mockClient, {
      pollingInterval: 100,
      confirmations: 1,
      timeout: 500
    });
    
    // Mock EventEmitter emit method to track events
    vi.spyOn(EventEmitter.prototype, "emit");
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });
  
  test("should emit confirmed and finalized events for successful transaction", async () => {
    const txHash = "0xsuccessful";
    
    // Start monitoring
    txMonitor.monitorTransaction(txHash);
    
    // Trigger polling manually
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (txMonitor as any)["#poll"]();
    
    // Check if events were emitted
    expect(EventEmitter.prototype.emit).toHaveBeenCalledWith(
      "confirmed", 
      expect.objectContaining({ hash: txHash, status: 1 })
    );
    
    expect(EventEmitter.prototype.emit).toHaveBeenCalledWith(
      "finalized", 
      expect.objectContaining({ hash: txHash, status: 1 })
    );
  });
  
  test("should emit failed event for failed transaction", async () => {
    const txHash = "0xfailed";
    
    // Start monitoring
    txMonitor.monitorTransaction(txHash);
    
    // Trigger polling manually
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (txMonitor as any)["#poll"]();
    
    // Check if failed event was emitted
    expect(EventEmitter.prototype.emit).toHaveBeenCalledWith(
      "failed", 
      expect.any(TransactionError)
    );
  });
  
  test("should not emit events for pending transactions", async () => {
    const txHash = "0xpending";
    
    // Start monitoring
    txMonitor.monitorTransaction(txHash);
    
    // Trigger polling manually
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (txMonitor as any)["#poll"]();
    
    // Check no confirmation events were emitted
    expect(EventEmitter.prototype.emit).not.toHaveBeenCalledWith(
      "confirmed", 
      expect.anything()
    );
  });
  
  test("waitForTransaction should return transaction details when resolved", async () => {
    const txHash = "0xsuccessful";
    
    // Mock the polling to immediately resolve
    vi.spyOn(txMonitor, "monitorTransaction").mockImplementation(() => {
      setTimeout(() => {
        (EventEmitter.prototype.emit).call(
          txMonitor, 
          "finalized",
          { 
            hash: txHash, 
            blockNumber: 100, 
            status: 1, 
            gasUsed: BigInt(21000),
            effectiveGasPrice: BigInt(10000000000)
          }
        );
      }, 10);
    });
    
    const result = await txMonitor.waitForTransaction(txHash, 1, 1000);
    
    expect(result).toEqual(expect.objectContaining({
      hash: txHash,
      blockNumber: 100,
      status: 1
    }));
  });
  
  test("waitForTransaction should reject when transaction fails", async () => {
    const txHash = "0xfailed";
    
    // Mock the polling to immediately reject
    vi.spyOn(txMonitor, "monitorTransaction").mockImplementation((hash) => {
      setTimeout(() => {
        (EventEmitter.prototype.emit).call(
          txMonitor, 
          "failed",
          new TransactionError("Transaction failed", { hash })
        );
      }, 10);
    });
    
    await expect(txMonitor.waitForTransaction(txHash, 1, 1000))
      .rejects.toThrow(TransactionError);
  });
  
  test("getTransactionDetails should return transaction info", async () => {
    const txHash = "0xsuccessful";
    const details = await txMonitor.getTransactionDetails(txHash);
    
    expect(details).toEqual(expect.objectContaining({
      hash: txHash,
      blockNumber: 100,
      status: 1,
      gasUsed: BigInt(21000),
      effectiveGasPrice: BigInt(10000000000),
      fee: BigInt(210000000000000)
    }));
  });
  
  test("dispose should clean up resources", () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
    
    // Start monitoring a transaction to create a timer
    txMonitor.monitorTransaction("0xhash");
    
    // Dispose should clear timers
    txMonitor.dispose();
    
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});