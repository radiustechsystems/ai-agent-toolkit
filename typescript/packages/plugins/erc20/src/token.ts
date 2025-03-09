export type Token = {
  decimals: number;
  symbol: string;
  name: string;
  chains: Record<number, { contractAddress: `0x${string}` }>;
};

export type ChainSpecificToken = {
  chainId: number;
  decimals: number;
  symbol: string;
  name: string;
  contractAddress: `0x${string}`;
};

export const USDC: Token = {
  decimals: 6,
  symbol: 'USDC',
  name: 'USDC',
  chains: {
    '1223953': {
      // TODO: Fix this contract address
      contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    },
  },
};

export const RAD: Token = {
  decimals: 18,
  symbol: 'RAD',
  name: 'Radius Token',
  chains: {
    '1223953': {
      contractAddress: '0xB73AAc53149af16DADA10D7cC99a9c4Cb722e21E',
    },
  },
};

export function getTokensForNetwork(chainId: number, tokens: Token[]): ChainSpecificToken[] {
  const result: ChainSpecificToken[] = [];

  for (const token of tokens) {
    const chainData = token.chains[chainId];
    if (chainData) {
      result.push({
        chainId: chainId,
        decimals: token.decimals,
        symbol: token.symbol,
        name: token.name,
        contractAddress: chainData.contractAddress,
      });
    }
  }

  return result;
}
