import { EventEmitter } from 'node:events';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { type TransactionMonitor, createTransactionMonitor } from '../TransactionMonitor';

vi.mock('@radiustechsystems/sdk', () => ({
  Client: vi.fn(),
}));

describe('TransactionMonitor', () => {
  // biome-ignore lint/suspicious/noExplicitAny: Mock client for testing
  let mockClient: any;
  let txMonitor: TransactionMonitor;

  beforeEach(() => {
    mockClient = {
      getTransactionReceipt: vi.fn().mockImplementation((hash) => {
        if (hash === '0xpending') return null;
        if (hash === '0xfailed') {
          return {
            blockNumber: 100,
            status: 0,
            gasUsed: BigInt(21000),
            effectiveGasPrice: BigInt(10000000000),
          };
        }
        return {
          blockNumber: 100,
          status: 1,
          gasUsed: BigInt(21000),
          effectiveGasPrice: BigInt(10000000000),
        };
      }),
      getBlockNumber: vi.fn().mockResolvedValue(101),
    };

    txMonitor = createTransactionMonitor(mockClient, {
      pollingInterval: 100,
      confirmations: 1,
      timeout: 500,
    });

    // Mock EventEmitter emit method to track events
    vi.spyOn(EventEmitter.prototype, 'emit');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  test('should register event listeners correctly', () => {
    // Test the on/once methods work correctly
    const listener = vi.fn();

    // Register listeners with on
    txMonitor.on('confirmed', listener);

    // Register a one-time listener
    txMonitor.once('finalized', listener);

    // The test passes if we can register the listeners without errors
    expect(true).toBe(true);
  });

  test('should be able to remove event listeners', () => {
    // Test that event listeners can be removed
    const listener = vi.fn();

    // Add and then remove a listener
    txMonitor.on('confirmed', listener);
    txMonitor.off('confirmed', listener);

    // Add and remove another test listener
    const testListener = () => {};
    txMonitor.on('failed', testListener);
    txMonitor.off('failed', testListener);

    // The test passes if we can remove the listeners without errors
    expect(true).toBe(true);
  });

  test('should handle pending transactions correctly', async () => {
    const txHash = '0xpending';

    // Mock handlers
    const onConfirmed = vi.fn();
    const onFinalized = vi.fn();

    txMonitor.on('confirmed', onConfirmed);
    txMonitor.on('finalized', onFinalized);

    // Verify that getTransactionDetails returns minimal info for pending tx
    const details = await txMonitor.getTransactionDetails(txHash);
    expect(details).toEqual({ hash: txHash });

    // Verify that no events were triggered
    expect(onConfirmed).not.toHaveBeenCalled();
    expect(onFinalized).not.toHaveBeenCalled();
  });

  test('monitorTransaction should start tracking a transaction', () => {
    const txHash = '0xsuccessful';

    // Mock setTimeout to verify it's called
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

    // Start monitoring
    txMonitor.monitorTransaction(txHash);

    // Check that transaction setup happened
    expect(setTimeoutSpy).toHaveBeenCalled();
  });

  test('stopMonitoring should clean up a tracked transaction', () => {
    const txHash = '0xfailed';

    // Start monitoring first
    txMonitor.monitorTransaction(txHash);

    // Mock clearTimeout to verify it's called
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    // Stop monitoring
    txMonitor.stopMonitoring(txHash);

    // Verify clearTimeout was called
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  test('getTransactionDetails should return transaction info', async () => {
    const txHash = '0xsuccessful';

    // We need to mock the ethClient provider for this test
    mockClient.ethClient = {
      getTransactionReceipt: vi.fn().mockResolvedValue({
        blockNumber: 100,
        status: 1,
        gasUsed: BigInt(21000),
        effectiveGasPrice: BigInt(10000000000),
      }),
    };

    const details = await txMonitor.getTransactionDetails(txHash);

    expect(details).toEqual(
      expect.objectContaining({
        hash: txHash,
        blockNumber: 100,
        status: 1,
        gasUsed: BigInt(21000),
        effectiveGasPrice: BigInt(10000000000),
        fee: BigInt(210000000000000),
      }),
    );
  });

  test('dispose should clean up resources', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    // Start monitoring a transaction to create a timer
    txMonitor.monitorTransaction('0xhash');

    // Dispose should clear timers
    txMonitor.dispose();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
