import type { Secret, SignOptions, VerifyOptions } from 'jsonwebtoken';

/**
 * Access tier metadata from the DataAccess contract
 */
export interface AccessTier {
  id: number;
  name: string;
  description: string;
  domains: string[];
  price: bigint;
  ttl: bigint;
  active: boolean;
  transferable: boolean;
  burnable: boolean;
  forSale: boolean;
}

/**
 * Token balance group with expiration
 */
export interface BalanceGroup {
  balance: bigint;
  expiresAt: bigint;
}

/**
 * EIP-712 domain for typed data signing
 */
export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number | string;
  verifyingContract: string;
}

/**
 * Auth challenge for signature verification
 */
export interface AuthChallenge {
  user: string; // Wallet address
  id: string; // Nonce
  time: number; // Timestamp
}

/**
 * Complete EIP-712 typed data structure
 */
export interface TypedData {
  types: {
    EIP712Domain: Array<{ name: string; type: string }>;
    Auth: Array<{ name: string; type: string }>;
  };
  primaryType: string;
  domain: EIP712Domain;
  message: AuthChallenge;
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
 * Network information
 */
export interface Network {
  id: string;
  name: string;
  rpcUrl?: string;
}

/**
 * Plugin configuration
 */
export interface DataAccessOptions {
  contractAddress: string;
  projectId?: string; // Optional now that PROJECT_ID can be fetched from contract
  defaultTierId?: number;
  maxPrice?: bigint;
  tierSelectionStrategy?: 'cheapest' | 'longest' | 'custom';
  customTierSelector?: (tiers: AccessTier[]) => Promise<AccessTier | undefined>;
  jwt?: JWTOptions;
  networks?: Network[];
  domainName: string; // Required for EIP-712 signing
  chainId: string; // Required for EIP-712 signing
}

/**
 * Result of access operations
 */
export interface AccessResult {
  success: boolean;
  tierId?: number;
  balance?: number;
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
  status: number;
  message: string;
  contract: string;
  networks: Network[];
  tiers: Array<{
    id: number;
    name: string;
    description: string;
    domains: string[];
    price: number;
    ttl: number;
    active: boolean;
  }>;
}

/**
 * Signature verification result
 */
export interface SignatureResult {
  verified: boolean;
  balance: number;
  signer: string;
  tierId?: number;
}

/**
 * Batch balance check result
 */
export interface BatchBalanceResult {
  balances: number[];
  tierIds: number[];
  addresses: string[];
}

/**
 * Balance details for a specific address and tier
 */
export interface BalanceDetailResult {
  address: string;
  tierId: number;
  balanceGroups: BalanceGroup[];
}

/**
 * Batch balance details result
 */
export interface BatchBalanceDetailsResult {
  results: BalanceDetailResult[];
}

/**
 * Challenge creation parameters
 */
export interface ChallengeParams {
  address: string;
  nonce?: string;
  timestamp?: number;
}

/**
 * Contract configuration
 * Simple interface to store contract address and project ID
 */
export interface Contract {
  address: string;
  projectId: string;
}
