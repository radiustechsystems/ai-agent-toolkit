import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  CheckApprovalBodySchema,
  GetQuoteParameters,
  Protocol,
  Routing,
  SwapType,
} from '../uniswap.parameters';
import { UniswapService } from '../uniswap.service';

// Setup mock for global fetch
const mockFetch = vi.fn();

// Mock the wallet module instead of defining our own interface
vi.mock('@radiustechsystems/ai-agent-wallet', () => ({
  TransactionError: class extends Error {
    constructor(message: string) {
      super(message);
    }
  },
}));

// Use any for the wallet client to bypass type issues without affecting runtime behavior

type RadiusWalletInterface = any;

// Mock Tool decorator
vi.mock('@radiustechsystems/ai-agent-core', () => ({
  Tool: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => descriptor,

  createToolParameters: (schema: any) => {
    return class {
      static schema = schema;
    };
  },
}));

describe('UniswapService', () => {
  let service: UniswapService;
  let mockWalletClient: RadiusWalletInterface;

  const testConfig = {
    apiKey: 'test-api-key',
    baseUrl: 'https://api.uniswap.test',
  };

  // Mock responses
  const mockQuoteResponse = {
    routing: Routing.CLASSIC,
    quote: {
      tokenIn: '0xTokenIn',
      tokenOut: '0xTokenOut',
      amount: '1000000000000000000',
      chainId: 1223953,
    },
  };

  const mockApprovalResponse = {
    approval: {
      to: '0xTokenAddress',
      value: '0',
      data: '0xapprovalData',
    },
  };

  const mockSwapResponse = {
    swap: {
      to: '0xUniswapRouter',
      value: '0',
      data: '0xswapData',
    },
  };

  // Set up mock wallet client and fetch responses
  beforeEach(() => {
    mockWalletClient = {
      getChain: vi.fn().mockReturnValue({ id: 1223953, type: 'evm' }),
      getAddress: vi.fn().mockResolvedValue('0xmockaddress'),
      sendTransaction: vi.fn().mockResolvedValue({
        hash: '0xhash',
      }),
    };

    // Reset mocks
    vi.clearAllMocks();

    // Setup fetch mock responses
    mockFetch.mockImplementation((url) => {
      const endpoint = url.toString().split('/').pop();

      let responseData = {};

      if (endpoint === 'quote') {
        responseData = mockQuoteResponse;
      } else if (endpoint === 'check_approval') {
        responseData = mockApprovalResponse;
      } else if (endpoint === 'swap') {
        responseData = mockSwapResponse;
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responseData),
      });
    });

    // Replace global fetch with our mock
    global.fetch = mockFetch;

    service = new UniswapService(testConfig);
  });

  describe('checkApproval', () => {
    test('should successfully check and submit approval transaction', async () => {
      const params = new CheckApprovalBodySchema();
      params.token = '0xTokenAddress';
      params.amount = '1000000000000000000';
      params.walletAddress = '0xmockaddress';

      const result = await service.checkApproval(mockWalletClient, params);

      expect(result).toHaveProperty('status', 'approved');
      expect(result).toHaveProperty('txHash', '0xhash');
      expect(result).toHaveProperty('message', 'Token approval transaction successful');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('check_approval'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': testConfig.apiKey,
          }),
        }),
      );

      expect(mockWalletClient.sendTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '0xTokenAddress',
          data: expect.any(String),
        }),
      );
    });

    test('should handle already approved tokens', async () => {
      // Mock response for already approved token
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ approval: null }),
        }),
      );

      const params = new CheckApprovalBodySchema();
      params.token = '0xTokenAddress';
      params.amount = '1000000000000000000';
      params.walletAddress = '0xmockaddress';

      const result = await service.checkApproval(mockWalletClient, params);

      expect(result).toHaveProperty('status', 'approved');
      expect(result).toHaveProperty('message', 'Token already has sufficient approval');
      expect(result).not.toHaveProperty('txHash');

      expect(mockWalletClient.sendTransaction).not.toHaveBeenCalled();
    });

    test('should handle API errors', async () => {
      // Mock API error
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'API Error' }),
        }),
      );

      const params = new CheckApprovalBodySchema();
      params.token = '0xTokenAddress';
      params.amount = '1000000000000000000';
      params.walletAddress = '0xmockaddress';

      await expect(service.checkApproval(mockWalletClient, params)).rejects.toThrow(
        'Token approval failed',
      );
    });
  });

  describe('getQuote', () => {
    test('should fetch quote from Uniswap API', async () => {
      const params = new GetQuoteParameters();
      params.tokenIn = '0xTokenIn';
      params.tokenOut = '0xTokenOut';
      params.amount = '1000000000000000000';
      params.type = SwapType.EXACT_INPUT;
      params.protocols = [Protocol.V3];
      params.routingPreference = Routing.CLASSIC;

      const result = await service.getQuote(mockWalletClient, params);

      expect(result).toEqual(mockQuoteResponse);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('quote'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('tokenIn'),
          headers: expect.objectContaining({
            'x-api-key': testConfig.apiKey,
          }),
        }),
      );
    });

    test('should handle API errors', async () => {
      // Mock API error
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'API Error' }),
        }),
      );

      const params = new GetQuoteParameters();
      params.tokenIn = '0xTokenIn';
      params.tokenOut = '0xTokenOut';
      params.amount = '1000000000000000000';
      params.protocols = [Protocol.V3];

      await expect(service.getQuote(mockWalletClient, params)).rejects.toThrow(
        /Uniswap API request failed/,
      );
    });
  });

  describe('swapTokens', () => {
    test('should execute swap transaction', async () => {
      const params = new GetQuoteParameters();
      params.tokenIn = '0xTokenIn';
      params.tokenOut = '0xTokenOut';
      params.amount = '1000000000000000000';
      params.type = SwapType.EXACT_INPUT;
      params.protocols = [Protocol.V3];

      const result = await service.swapTokens(mockWalletClient, params);

      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('txHash', '0xhash');
      expect(result).toHaveProperty('message', 'Token swap transaction successful');
      expect(result).toHaveProperty('tokenIn', '0xTokenIn');
      expect(result).toHaveProperty('tokenOut', '0xTokenOut');

      // Should have made request to quote and swap endpoints
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // Verify sendTransaction was called with correct parameters
      expect(mockWalletClient.sendTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '0xUniswapRouter',
          data: expect.any(String),
        }),
      );
    });

    test('should handle transaction errors', async () => {
      // Mock transaction error
      mockWalletClient.sendTransaction.mockRejectedValueOnce(new Error('Transaction failed'));

      const params = new GetQuoteParameters();
      params.tokenIn = '0xTokenIn';
      params.tokenOut = '0xTokenOut';
      params.amount = '1000000000000000000';
      params.protocols = [Protocol.V3];

      await expect(service.swapTokens(mockWalletClient, params)).rejects.toThrow(
        'Token swap failed',
      );
    });
  });
});
