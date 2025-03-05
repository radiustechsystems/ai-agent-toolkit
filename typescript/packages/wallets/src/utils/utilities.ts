import { isRadiusChain, radiusTestnetBase } from '../chain/RadiusChain';

/**
 * Checks if the provided chain ID is for Radius and logs a warning if not
 * @param chainId Chain ID to check
 * @returns true if the chain is Radius, false otherwise
 */
export function checkChain(chainId: number): boolean {
  if (!isRadiusChain(chainId)) {
    console.warn(
      `Chain ${chainId} is not for Radius.
      This toolkit is optimized for Radius and may not work as expected on other chains.`,
    );
    return false;
  }
  return true;
}

/**
 * Get token information for a chain
 * @param chainId Chain ID
 * @returns Token info (symbol, name, decimals)
 */
export function getChainToken(chainId: number) {
  // Currently only supporting Radius
  if (chainId === radiusTestnetBase.id) {
    return {
      symbol: radiusTestnetBase.nativeCurrency.symbol,
      name: radiusTestnetBase.nativeCurrency.name,
      decimals: radiusTestnetBase.nativeCurrency.decimals,
    };
  }

  // Default to ETH if unknown
  return {
    symbol: 'ETH',
    name: 'ETH',
    decimals: 18,
  };
}
