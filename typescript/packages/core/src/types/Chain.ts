/**
 * Defines the chain type supported by the Radius AI Agent Toolkit
 * Currently only supports EVM as Radius is EVM-compatible
 */
export type Chain = EvmChain;

export type EvmChain = {
  type: "evm";
  id: number;
};

export type ChainType = Chain["type"];
