import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the wallet module
vi.mock('@radiustechsystems/ai-agent-wallet', () => ({
  TransactionError: class extends Error {},
  ContractError: class extends Error {
    constructor(message: string, address: string, functionName?: string) {
      super(`${message} (${address}${functionName ? `:${functionName}` : ''})`);
    }
  },
}));

// Use any for the wallet client to bypass type issues without affecting runtime behavior
// biome-ignore lint/suspicious/noExplicitAny: Simplified mock type for testing
type RadiusWalletInterface = any;

import { DataAccessService } from '../data-access.service';
import { CheckDataAccessParameters, HandleHttp402ResponseParameters } from '../parameters';
import type { DataAccessOptions } from '../types';

// Mock Tool decorator
vi.mock('@radiustechsystems/ai-agent-core', () => ({
  // biome-ignore lint/suspicious/noExplicitAny: Mock decorator implementation
  Tool: () => (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => descriptor,

  // biome-ignore lint/suspicious/noExplicitAny: Mock function implementation
  createToolParameters: (schema: any) => {
    // biome-ignore lint/complexity/noStaticOnlyClass: Intentional for testing
    return class {
      static schema = schema;
    };
  },
}));

describe('DataAccessService', () => {
  let service: DataAccessService;
  let mockWalletClient: RadiusWalletInterface;

  type TierStrategy = 'cheapest' | 'longest' | 'custom';

  const testOptions: DataAccessOptions = {
    contractAddress: '0x1234...',
    // Increase maxPrice to allow for test transaction
    maxPrice: BigInt('100000000000000000'), // 0.1 ETH
    tierSelectionStrategy: 'cheapest' as TierStrategy,
  };

  // Set up mock wallet client
  beforeEach(() => {
    mockWalletClient = {
      getAddress: vi.fn().mockReturnValue('0xmockaddress'),
      client: {},
      signMessage: vi.fn().mockResolvedValue({ signature: '0xsignature' }),
      getChain: vi.fn().mockReturnValue({ id: 1, type: 'evm' }),
      resolveAddress: vi.fn().mockImplementation((addr) => `0x${addr.replace(/^0x/, '')}`),
    };

    service = new DataAccessService(testOptions);
    vi.clearAllMocks();
  });

  describe('checkDataAccess', () => {
    test('should check if user has access to a dataset', async () => {
      const params = new CheckDataAccessParameters();
      params.datasetId = '123';

      const result = await service.checkDataAccess(mockWalletClient, params);

      expect(result).toHaveProperty('hasAccess');
    });
  });

  describe('handleHttp402Response', () => {
    test('should handle HTTP 402 response with payment details', async () => {
      const params = new HandleHttp402ResponseParameters();
      params.datasetId = '123';
      params.price = '10000000000000000'; // 0.01 ETH

      const result = await service.handleHttp402Response(mockWalletClient, params);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('transactionHash');
      expect(result).toHaveProperty('authHeaders');
    });

    test('should reject if price exceeds maximum', async () => {
      const params = new HandleHttp402ResponseParameters();
      params.datasetId = '123';
      params.price = '200000000000000000'; // 0.2 ETH, which exceeds the max price of 0.1 ETH

      const result = await service.handleHttp402Response(mockWalletClient, params);

      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('reason');
    });
  });
});
