import jwt from 'jsonwebtoken';
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
import {
  CheckDataAccessParameters,
  CreateAccessTokenParameters,
  CreateChallengeParameters,
  GenerateAuthSignatureParameters,
  GetBalanceDetailsParameters,
  GetBalanceParameters,
  HandleHttp402ResponseParameters,
  RecoverSignerParameters,
  VerifySignatureParameters,
} from '../parameters';
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
    domainName: 'Radius Data Access',
    chainId: '0x12ad11',
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
      params.resourceUrl = 'http://localhost:3000/content/123';

      const result = await service.checkDataAccess(mockWalletClient, params);

      expect(result).toHaveProperty('hasAccess');
    });
  });

  describe('handleHttp402Response', () => {
    test('should handle HTTP 402 response with payment details', async () => {
      const params = new HandleHttp402ResponseParameters();
      params.resourceUrl = 'http://localhost:3000/content/123';
      params.paymentInfo = {
        contract: '0x1234...',
        networks: [{ id: '1', name: 'Radius' }],
        tiers: [
          {
            id: 1,
            name: 'Basic',
            description: 'Basic access tier',
            domains: ['http://localhost:3000/content'],
            price: 10000000000000000,
            ttl: 3600,
            active: true,
            transferable: true,
            burnable: false,
            forSale: true,
          },
        ],
      };

      const result = await service.handleHttp402Response(mockWalletClient, params);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('receipt.transactionHash');
      expect(result).toHaveProperty('authHeaders');
      expect(result.authHeaders).toHaveProperty('Authorization');
      expect(result.authHeaders?.Authorization).toMatch(/^Bearer /);
      expect(result.jwt).toBeDefined();

      // Add type guard to ensure jwt is defined
      if (!result.jwt) {
        throw new Error('JWT token is undefined');
      }

      // Now TypeScript knows result.jwt is definitely a string
      const decoded = jwt.decode(result.jwt);
      expect(decoded).toHaveProperty('tierId', 1);
      expect(decoded).toHaveProperty('iat');
      expect(decoded).toHaveProperty('exp');
    });

    test('should reject if price exceeds maximum', async () => {
      const params = new HandleHttp402ResponseParameters();
      params.resourceUrl = 'http://localhost:3000/content/123';
      params.paymentInfo = {
        contract: '0x1234...',
        networks: [{ id: '1', name: 'Radius' }],
        tiers: [
          {
            id: 1,
            name: 'Premium',
            description: 'Premium access tier',
            domains: ['http://localhost:3000/content'],
            price: 200000000000000000, // 0.2 ETH as number (BigInt conversion in service)
            ttl: 86400,
            active: true,
            transferable: true,
            burnable: false,
            forSale: true,
          },
        ],
      };

      const result = await service.handleHttp402Response(mockWalletClient, params);

      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('reason');
    });
  });

  describe('generateAuthSignature', () => {
    test('should generate an authentication signature using a wallet', async () => {
      const params = new GenerateAuthSignatureParameters();
      params.resourceUrl = 'http://localhost:3000/content/123';
      // tierId is optional, so we don't need to set it

      const result = await service.generateAuthSignature(mockWalletClient, params);

      expect(result).toHaveProperty('signature');
      expect(result).toHaveProperty('authHeaders');
      expect(result.authHeaders).toHaveProperty('Authorization');
      expect(result.authHeaders.Authorization).toMatch(/^Signature challenge=/);
    });

    test('should use provided challenge if available', async () => {
      const params = new GenerateAuthSignatureParameters();
      params.resourceUrl = 'http://localhost:3000/content/123';
      // tierId is optional
      params.challenge = 'test-challenge';

      const result = await service.generateAuthSignature(mockWalletClient, params);

      expect(result).toHaveProperty('signature');
      expect(result.authHeaders.Authorization).toContain('challenge="test-challenge"');
    });
  });

  describe('createAccessToken', () => {
    test('should create a JWT access token for a tier', async () => {
      const params = new CreateAccessTokenParameters();
      params.resourceUrl = 'http://localhost:3000/content/123';
      params.tierId = 1;

      const result = await service.createAccessToken(mockWalletClient, params);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('authHeaders');
      expect(result.authHeaders).toHaveProperty('Authorization');
      expect(result.authHeaders.Authorization).toMatch(/^Bearer /);

      const decoded = jwt.decode(result.token);
      expect(decoded).toHaveProperty('tierId', 1);
      expect(decoded).toHaveProperty('iat');
    });

    test('should respect custom expiration time', async () => {
      const params = new CreateAccessTokenParameters();
      params.resourceUrl = 'http://localhost:3000/content/123';
      params.tierId = 2;
      params.expiresIn = '2h';

      const result = await service.createAccessToken(mockWalletClient, params);
      const decoded = jwt.decode(result.token) as { exp: number; iat: number };

      // Check that expiration is roughly 2 hours after issuance
      expect(decoded.exp - decoded.iat).toBeCloseTo(7200, -2); // 2 hours in seconds, with tolerance
    });
  });

  describe('verifySignature', () => {
    test('should verify a signature and return balance', async () => {
      const params = new VerifySignatureParameters();
      params.resourceUrl = 'http://localhost:3000/content/123';
      params.challenge = JSON.stringify({ message: 'test challenge' });
      params.signature = '0xsignature';
      params.tierId = 1;

      const result = await service.verifySignature(mockWalletClient, params);

      expect(result).toHaveProperty('verified');
      expect(result).toHaveProperty('balance');
      expect(result).toHaveProperty('signer');
      expect(result.tierId).toBe(1);
    });
  });

  describe('recoverSigner', () => {
    test('should recover signer from signature', async () => {
      const params = new RecoverSignerParameters();
      params.challenge = JSON.stringify({ message: 'test challenge' });
      params.signature = '0xsignature';

      const result = await service.recoverSigner(mockWalletClient, params);

      expect(result).toHaveProperty('signer');
      expect(result.signer).toBe('0xmockaddress');
    });
  });

  describe('getBalance', () => {
    test('should get token balance for tier', async () => {
      const params = new GetBalanceParameters();
      params.tierId = 1;

      const result = await service.getBalance(mockWalletClient, params);

      expect(result).toHaveProperty('balance');
      expect(typeof result.balance).toBe('number');
    });

    test('should accept custom address parameter', async () => {
      const params = new GetBalanceParameters();
      params.tierId = 1;
      params.address = '0xcustomaddress';

      const result = await service.getBalance(mockWalletClient, params);

      expect(result).toHaveProperty('balance');
    });
  });

  describe('getBalanceDetails', () => {
    test('should get detailed balance information', async () => {
      const params = new GetBalanceDetailsParameters();
      params.tierId = 1;

      const result = await service.getBalanceDetails(mockWalletClient, params);

      expect(result).toHaveProperty('balanceGroups');
      expect(Array.isArray(result.balanceGroups)).toBe(true);

      if (result.balanceGroups.length > 0) {
        expect(result.balanceGroups[0]).toHaveProperty('balance');
        expect(result.balanceGroups[0]).toHaveProperty('expiresAt');
      }
    });
  });

  describe('createChallenge', () => {
    test('should create an authentication challenge', async () => {
      const params = new CreateChallengeParameters();
      params.address = '0xmockaddress';

      const result = await service.createChallenge(mockWalletClient, params);

      expect(result).toHaveProperty('challenge');
      expect(result.challenge).toHaveProperty('types');
      expect(result.challenge).toHaveProperty('primaryType', 'Auth');
      expect(result.challenge).toHaveProperty('domain');
      expect(result.challenge).toHaveProperty('message');
      expect(result.challenge.message).toHaveProperty('user', '0xmockaddress');
      expect(result.challenge.message).toHaveProperty('id');
      expect(result.challenge.message).toHaveProperty('time');
    });
  });
});
