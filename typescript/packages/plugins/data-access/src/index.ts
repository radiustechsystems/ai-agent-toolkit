export { dataAccess } from './data-access.plugin';
export type { DataAccessOptions, AccessTier, AccessResult } from './types';
export { DataAccessService } from './data-access.service';
export { 
  CheckDataAccessParameters, 
  PurchaseDataAccessParameters,
  GenerateAccessSignatureParameters,
  HandleHttp402ResponseParameters 
} from './parameters';