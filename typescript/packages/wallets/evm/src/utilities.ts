import { isRadiusChain, radiusTestnetBase } from "./radius-chain";

/**
 * Validates that the provided chain ID is supported
 * @param chainId Chain ID to validate
 * @throws Error if the chain is not supported
 */
export function validateChain(chainId: number): void {
  if (!isRadiusChain(chainId)) {
    throw new Error(
      `Chain ${chainId} is not supported. This toolkit only supports the Radius testnet.`
    );
  }
}

/**
 * Get token information for a chain
 * @param chainId Chain ID
 * @returns Token info (symbol, name, decimals)
 */
export function getChainToken(chainId: number) {
  // Currently only supporting Radius testnet
  if (chainId === radiusTestnetBase.id) {
    return {
      symbol: radiusTestnetBase.nativeCurrency.symbol,
      name: radiusTestnetBase.nativeCurrency.name,
      decimals: radiusTestnetBase.nativeCurrency.decimals,
    };
  }

  // Default to ETH if unknown
  return {
    symbol: "ETH",
    name: "ETH",
    decimals: 18,
  };
}
