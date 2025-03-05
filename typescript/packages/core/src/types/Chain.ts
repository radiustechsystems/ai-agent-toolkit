/**
 * Defines the chain type supported by the Radius AI Agent Toolkit
 * Radius is the only supported chain (which is EVM-compatible)
 */
export type Chain = RadiusChain;

export type RadiusChain = {
  type: 'evm';
  id: number;
};

export type ChainType = Chain['type'];
