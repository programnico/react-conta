// features/purchase/types/index.ts

export interface Supplier {
  id: number
  type: 'local' | 'foreign'
  classification: 'none' | 'small' | 'large'
  tax_id: string | null
  registration_number: string
  name: string
  business_name: string
  address: string
  phone: string
  email: string
  business_activity?: string | null
  is_large_taxpayer?: boolean
  municipality?: string | null
  department?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  two_factor_enabled: boolean
  two_factor_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface PurchaseDetail {
  id?: number
  purchase_id?: number
  product_id?: number | null
  description: string
  quantity: number | string
  unit_price: number | string
  line_total: number | string
  tax_rate: number | string
  tax_amount: number | string
  notes?: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  product?: any | null // Define product type if needed
}

export interface Purchase {
  id: number
  supplier_id: number
  document_number: string
  document_type: string
  purchase_date: string
  subtotal: string | number
  tax_amount: string | number
  total_amount: string | number
  payment_terms: string
  due_date: string
  user_id: number
  approved_at: string | null
  approved_by: number | null
  received_at: string | null
  received_by: number | null
  notes: string | null
  status: 'pending' | 'approved' | 'received' | 'cancelled'
  created_at: string
  updated_at: string
  deleted_at: string | null
  supplier?: Supplier
  details?: PurchaseDetail[]
  user?: User
}

export interface PaginationLinks {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

export interface PaginatedResponse<T> {
  current_page: number
  data: T[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: PaginationLinks[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

export interface PurchasesApiResponse {
  status: 'success' | 'error'
  message: string
  data: PaginatedResponse<Purchase>
}

export interface SuppliersApiResponse {
  status: 'success' | 'error'
  message: string
  data: Supplier[]
}

// Form data types for creating/updating purchases
export interface CreatePurchaseRequest {
  supplier_id: number
  purchase_date: string
  document_number: string
  document_type: string
  subtotal: number
  tax_amount: number
  total_amount: number
  payment_terms: string
  due_date: string
  notes?: string
  details: CreatePurchaseDetailRequest[]
}

export interface CreatePurchaseDetailRequest {
  product_id?: number | null
  description: string
  quantity: number
  unit_price: number
  line_total: number
  tax_rate: number
  tax_amount: number
  notes?: string | null
}

export interface UpdatePurchaseRequest extends CreatePurchaseRequest {
  id: number
}

// Form state types
export interface PurchaseFormData {
  supplier_id: number | null
  purchase_date: string
  document_number: string
  document_type: string
  subtotal: number
  tax_amount: number
  total_amount: number
  payment_terms: string
  due_date: string
  notes: string
  details: PurchaseDetailFormData[]
}

export interface PurchaseDetailFormData {
  product_id?: number | null
  description: string
  quantity: number
  unit_price: number
  line_total: number
  tax_rate: number
  tax_amount: number
  notes?: string
}

// Filter and search types
export interface PurchaseFilters {
  status?: Purchase['status']
  supplier_id?: number
  document_type?: string
  date_from?: string
  date_to?: string
  search?: string
}

export interface PurchaseStats {
  total: number
  pending: number
  approved: number
  received: number
  cancelled: number
  totalAmount: number
}

export type PurchaseStatus = Purchase['status']
export type DocumentType = 'factura' | 'recibo' | 'nota_credito' | 'nota_debito'

// Export commonly used types
export type { Purchase as default, PaginatedResponse as PaginatedPurchases }
