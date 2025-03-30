/**
 * Access tier information from the DataAccess contract
 */
export interface AccessTier {
  id: number;
  price: bigint;
  ttl: bigint;
  active: boolean;
}

/**
 * Plugin configuration options
 */
export interface DataAccessOptions {
  contractAddress: string;                  // DataAccess contract address
  defaultTierId?: number;                   // Optional default tier to purchase
  autoRenew?: boolean;                      // Auto-renew expired tokens
  maxPrice?: bigint;                        // Maximum price willing to pay
  tierSelectionStrategy?: 'cheapest' | 'longest' | 'custom'; // How to choose tiers
  customTierSelector?: (tiers: AccessTier[]) => Promise<AccessTier | undefined>;
}

/**
 * Result of access operations
 */
export interface AccessResult {
  success: boolean;
  tierId?: number;
  jwt?: string;
  receipt?: any;
  reason?: string;
}