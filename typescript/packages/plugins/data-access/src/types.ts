import type { Secret, SignOptions, VerifyOptions } from 'jsonwebtoken';

/**
 * Access tier information from the DataAccess contract
 */
export interface AccessTier {
  id: number;
  name: string;
  description: string;
  domains: string[];
  price: bigint;
  ttl: bigint;
  active: boolean;
}

/**
 * Challenge for signed message verification
 */
export interface Challenge {
  types: {
    EIP712Domain: { name: string; type: string }[];
    AccessVerification: { name: string; type: string }[];
  };
  primaryType: string;
  domain: {
    name: string;
    version: string;
    verifyingContract: string;
  };
  message: ChallengeToken;
}

/**
 * Challenge token payload
 */
export interface ChallengeToken {
  projectId: string;
  tierId: number;
  jwt: string;
}

/**
 * Contract configuration
 */
export interface Contract {
  address: string;
  projectId: string;
}

/**
 * JWT configuration
 */
export interface JWTOptions {
  secret: Secret;
  signOpts: SignOptions;
  verifyOpts: VerifyOptions;
}

/**
 * Payment network information
 */
export interface PaymentNetwork {
  id: string;
  name: string;
  verifier: PaymentVerifier;
}

/**
 * Payment verification function
 */
export type PaymentVerifier = (tierID: number, challenge: string, sig: string) => Promise<boolean>;

/**
 * Plugin configuration options
 */
export interface DataAccessOptions {
  contractAddress: string; // DataAccess contract address
  projectId: string; // Project identifier
  defaultTierId?: number; // Optional default tier to purchase
  autoRenew?: boolean; // Auto-renew expired tokens
  maxPrice?: bigint; // Maximum price willing to pay
  tierSelectionStrategy?: 'cheapest' | 'longest' | 'custom'; // How to choose tiers
  customTierSelector?: (tiers: AccessTier[]) => Promise<AccessTier | undefined>;
  jwt?: JWTOptions; // JWT configuration
  networks?: PaymentNetwork[]; // Supported payment networks
  domainName?: string; // Domain name for EIP-712 signatures
}

/**
 * Result of access operations
 */
export interface AccessResult {
  success: boolean;
  tierId?: number;
  jwt?: string;
  receipt?: {
    transactionHash: string;
    price: string;
    expiry: number;
  };
  reason?: string;
  authHeaders?: Record<string, string>;
}

/**
 * HTTP 402 Payment Required response
 */
export interface PaymentRequiredResponse {
  contract: string;
  networks: PaymentNetwork[];
  tiers: AccessTier[];
}
