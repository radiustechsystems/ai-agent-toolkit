// Core types for EVM transactions and contracts

/**
 * Type representing an ABI item
 */
export type AbiItem = {
  name?: string
  type: string
  stateMutability?: string
  inputs?: Array<{
    name: string
    type: string
    components?: AbiItem[]
  }>
  outputs?: Array<{
    name: string
    type: string
    components?: AbiItem[]
  }>
}

/**
 * Type representing a contract ABI
 */
export type Abi = AbiItem[]

/**
 * Type for a typed data domain (EIP-712)
 */
export type TypedDataDomain = {
  name?: string
  version?: string
  chainId?: number | bigint
  verifyingContract?: string
  salt?: string
}

/**
 * Transaction request for EVM
 */
export type EVMTransaction = {
  to: string
  functionName?: string
  args?: unknown[]
  value?: bigint
  abi?: Abi
  options?: EVMTransactionOptions
  data?: `0x${string}`
}

/**
 * Extra options for transactions
 */
export type EVMTransactionOptions = {
  paymaster?: {
    address: `0x${string}`
    input: `0x${string}`
  }
}

/**
 * Typed data for EIP-712 signing
 */
export type EVMTypedData = {
  domain: TypedDataDomain
  types: Record<string, unknown>
  primaryType: string
  message: Record<string, unknown>
}

/**
 * Request for reading from an EVM contract
 */
export type EVMReadRequest = {
  address: string
  functionName: string
  args?: unknown[]
  abi: Abi
}

/**
 * Result from reading an EVM contract
 */
export type EVMReadResult = {
  value: unknown
}
