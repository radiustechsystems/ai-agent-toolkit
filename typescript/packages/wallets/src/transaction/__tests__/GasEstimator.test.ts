import type { Client } from '@radiustechsystems/sdk';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createGasEstimator } from '../GasEstimator';

// Mock the SDK components
vi.mock('@radiustechsystems/sdk', () => {
  return {
    Client: {
      estimateGas: vi.fn().mockResolvedValue(BigInt(21000)),
      estimateGasRaw: vi.fn().mockResolvedValue(BigInt(50000)),
      getGasPrice: vi.fn().mockResolvedValue(BigInt(20000000000)),
    },
    Account: {},
    Address: vi.fn().mockImplementation((address) => {
      return {
        address,
        toHex: () => address,
      };
    }),
    Contract: {
      NewDeployed: vi.fn().mockImplementation(() => {
        return {
          estimateGas: vi.fn().mockResolvedValue(BigInt(50000)),
        };
      }),
    },
    ABI: vi.fn().mockImplementation(() => {
      return {
        pack: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
      };
    }),
    Transaction: vi.fn().mockImplementation(() => {
      return {};
    }),
  };
});

describe('GasEstimator', () => {
  // Type the mock functions explicitly so we can use mockResolvedValueOnce
  const mockEstimateGas = vi.fn().mockResolvedValue(BigInt(21000));
  const mockEstimateGasRaw = vi.fn().mockResolvedValue(BigInt(50000));
  const mockGetGasPrice = vi.fn().mockResolvedValue(BigInt(20000000000));
  const mockGetFeeData = vi.fn().mockResolvedValue({
    maxFeePerGas: BigInt(20000000000),
    gasPrice: BigInt(20000000000),
  });

  const mockClient = {
    estimateGas: mockEstimateGas,
    estimateGasRaw: mockEstimateGasRaw,
    getGasPrice: mockGetGasPrice,
    // Mock the ethClient property that's used in getGasPrice method
    ethClient: {
      getFeeData: mockGetFeeData,
    },
  } as unknown as Client;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('estimates gas correctly for ETH transfer', async () => {
    const estimator = createGasEstimator(mockClient, 1.2);

    const transaction = {
      to: '0xrecipient',
      value: BigInt(100000000000000000), // 0.1 ETH
    };

    const result = await estimator.estimateGas(transaction);

    // Should apply 1.2x multiplier to the 21000 gas limit
    expect(result).toBe(BigInt(25200)); // 21000 * 1.2 = 25200
    expect(mockEstimateGas).toHaveBeenCalled();
  });

  test('estimates gas correctly for contract call', async () => {
    // Mock the client estimate gas to return 50000 for this test specifically
    mockEstimateGas.mockResolvedValueOnce(BigInt(50000));

    const estimator = createGasEstimator(mockClient, 1.5);

    const transaction = {
      to: '0xcontract',
      functionName: 'transfer',
      args: ['0xrecipient', BigInt(1000000)],
      abi: [
        {
          name: 'transfer',
          type: 'function',
          inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' },
          ],
          outputs: [{ name: '', type: 'bool' }],
        },
      ],
    };

    const result = await estimator.estimateGas(transaction);

    // Should apply 1.5x multiplier to the 50000 gas limit
    expect(result).toBe(BigInt(75000)); // 50000 * 1.5 = 75000
  });

  test('simulates transaction successfully', async () => {
    // Ensure we get a consistent gas estimate
    mockEstimateGas.mockResolvedValueOnce(BigInt(21000));

    const estimator = createGasEstimator(mockClient);

    const transaction = {
      to: '0xrecipient',
      value: BigInt(100000000000000000), // 0.1 ETH
    };

    const result = await estimator.simulateTransaction(transaction);

    expect(result.success).toBe(true);
    expect(result.gasUsed).toBe(BigInt(25200)); // 21000 * 1.2 = 25200
  });

  test('caches gas price', async () => {
    const mockCache = {
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn(),
    };

    // biome-ignore lint/suspicious/noExplicitAny: Mock cache for testing
    const estimator = createGasEstimator(mockClient, 1.2, mockCache as any);

    // First call should check cache and set it
    const price1 = await estimator.getGasPrice();
    expect(mockCache.get).toHaveBeenCalledWith('gas_price');
    expect(mockCache.set).toHaveBeenCalledWith('gas_price', BigInt(20000000000));
    expect(price1).toBe(BigInt(20000000000));

    // Reset mocks
    mockCache.get.mockReset();
    mockCache.set.mockReset();

    // Setup cache hit
    mockCache.get.mockReturnValue(BigInt(25000000000));

    // Second call should use cached value
    const price2 = await estimator.getGasPrice();
    expect(mockCache.get).toHaveBeenCalledWith('gas_price');
    expect(mockCache.set).not.toHaveBeenCalled();
    expect(price2).toBe(BigInt(25000000000));
  });
});
