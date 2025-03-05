// Base configuration for Radius testnet
export const radiusTestnetBase = {
  id: 1223953,
  name: "Radius Testnet",
  network: "radius-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH",
  },
  testnet: true
} as const

// Type for chain configuration
export type RadiusChainConfig = {
  rpcUrl: string
}

// Radius Chain type definition
export type RadiusChain = {
  id: number;
  name: string;
  network: string;
  nativeCurrency: {
    decimals: number;
    name: string;
    symbol: string;
  };
  testnet: boolean;
  rpcUrls?: {
    default: { http: string[] };
    public: { http: string[] };
  };
}

// Helper to get chain configuration with user's RPC URL
export function getRadiusChainConfig(config: RadiusChainConfig): RadiusChain {
  return {
    ...radiusTestnetBase,
    rpcUrls: {
      default: { http: [config.rpcUrl] },
      public: { http: [config.rpcUrl] }
    }
  }
}

// Helper to validate if a chain ID is a valid Radius chain
export function isRadiusChain(chainId: number): boolean {
  return chainId === radiusTestnetBase.id
}

// Get the Radius chain ID
export function getRadiusChainId(): number {
  return radiusTestnetBase.id
}
