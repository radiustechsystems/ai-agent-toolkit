/**
 * ABI for the Radius DataAccess contract
 * Contains only methods needed for AI agents to handle data access functionality
 * Administrative/management functions are intentionally excluded
 */
export const dataAccessABI = [
  // Core balance and access functions
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
  {
    inputs: [
      { name: 'accounts', type: 'address[]' },
      { name: 'ids', type: 'uint256[]' },
    ],
    name: 'balanceOfBatch',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' },
    ],
    name: 'balanceDetails',
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'balance', type: 'uint256' },
          { name: 'expiresAt', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'accounts', type: 'address[]' },
      { name: 'ids', type: 'uint256[]' },
    ],
    name: 'balanceDetailsBatch',
    outputs: [
      {
        name: 'result',
        type: 'tuple[][]',
        components: [
          { name: 'balance', type: 'uint256' },
          { name: 'expiresAt', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },

  // Authentication functions
  {
    inputs: [
      { name: 'challenge', type: 'string' },
      { name: 'signature', type: 'bytes' },
      { name: 'id', type: 'uint256' },
    ],
    name: 'balanceOfSigner',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'challenge', type: 'string' },
      { name: 'signature', type: 'bytes' },
    ],
    name: 'recoverSigner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },

  // Purchase function
  {
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'purchase',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },

  // Pricing functions
  {
    inputs: [{ name: 'id', type: 'uint256' }],
    name: 'priceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'ids', type: 'uint256[]' }],
    name: 'priceOfBatch',
    outputs: [{ name: 'result', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },

  // Token property functions
  {
    inputs: [{ name: 'id', type: 'uint256' }],
    name: 'ttl',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'id', type: 'uint256' }],
    name: 'active',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'id', type: 'uint256' }],
    name: 'transferable',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'id', type: 'uint256' }],
    name: 'burnable',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'id', type: 'uint256' }],
    name: 'forSale',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },

  // Metadata functions
  {
    inputs: [],
    name: 'PROJECT_ID',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'uint256' }],
    name: 'uri',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
];
