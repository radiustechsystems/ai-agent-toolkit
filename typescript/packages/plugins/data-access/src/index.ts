// Export main plugin factory function
export { dataAccess } from './data-access.plugin';

// Export types
export type {
  // Core types
  DataAccessOptions,
  AccessTier,
  AccessResult,
  // New types for the updated contract
  BalanceGroup,
  SignatureResult,
  TypedData,
  AuthChallenge,
  // Batch operation result types
  BatchBalanceResult,
  BalanceDetailResult,
  BatchBalanceDetailsResult,
  // Configuration types
  Contract,
  Network,
  JWTOptions,
} from './types';

// Export service and contract classes
export { DataAccessService } from './data-access.service';
export { DataAccessContract } from './data-access.contract';

// Export ABI definition
export { dataAccessABI } from './abi';

// Export parameter classes for tools
export {
  // Original parameters
  CheckDataAccessParameters,
  PurchaseDataAccessParameters,
  HandleHttp402ResponseParameters,
  CreateAccessTokenParameters,
  // New parameters for updated contract functionality
  GenerateAuthSignatureParameters,
  VerifySignatureParameters,
  GetBalanceParameters,
  GetBalanceDetailsParameters,
  RecoverSignerParameters,
  // New batch operation parameters
  GetBalanceBatchParameters,
  GetBalanceDetailsBatchParameters,
} from './parameters';
