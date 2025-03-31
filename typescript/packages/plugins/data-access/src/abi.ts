/**
 * ABI for the DataAccess contract
 * This defines the interface for interacting with the contract
 */
export const dataAccessABI = [
  // Check if an address has valid access to a tier
  {
    inputs: [
      { name: 'address', type: 'address' },
      { name: 'tierId', type: 'uint256' },
    ],
    name: 'isValid',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Get token balance for a specific tier
  {
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' },
    ],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Get all available tiers for a project
  {
    inputs: [{ name: 'projectId', type: 'string' }],
    name: 'getTiers',
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'name', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'domains', type: 'string[]' },
          { name: 'price', type: 'uint256' },
          { name: 'ttl', type: 'uint256' },
          { name: 'active', type: 'bool' },
        ],
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Purchase access to a tier
  {
    inputs: [
      { name: 'projectId', type: 'string' },
      { name: 'tierId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'purchase',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  // Verify a challenge signature
  {
    inputs: [
      { name: 'projectId', type: 'string' },
      { name: 'tierId', type: 'uint256' },
      { name: 'challenge', type: 'string' },
      { name: 'signature', type: 'bytes' },
    ],
    name: 'verifyChallenge',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Get expiration time for a token
  {
    inputs: [
      { name: 'address', type: 'address' },
      { name: 'projectId', type: 'string' },
      { name: 'tierId', type: 'uint256' },
    ],
    name: 'expiresAt',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];
