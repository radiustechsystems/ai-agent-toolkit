import type { Abi } from '@radiustechsystems/ai-agent-wallet';
import { parseAbi } from 'viem';

const PARSED_ERC20_ABI = parseAbi([
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
  'function totalSupply() external view returns (uint256)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) external returns (bool)',
]);

export const ERC20_ABI: Abi = PARSED_ERC20_ABI as unknown as Abi;
