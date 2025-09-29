// features/purchase/index.ts

// Types
export type {
  Purchase,
  Supplier,
  PurchaseDetail,
  CreatePurchaseRequest,
  UpdatePurchaseRequest,
  PurchaseFilters,
  PurchaseStats,
  PurchaseStatus,
  DocumentType,
  PurchasesApiResponse,
  SuppliersApiResponse
} from './types'

// Services
export { purchaseService } from './services/purchaseService'

// Hooks
export { usePurchases } from './hooks/usePurchases'

// Components
export { default as PurchaseForm } from './components/PurchaseForm'
export { default as PurchasesTable } from './components/PurchasesTable'
export { default as PurchaseFiltersComponent } from './components/PurchaseFilters'
