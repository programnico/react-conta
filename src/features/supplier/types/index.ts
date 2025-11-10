// features/supplier/types/index.ts
export type SupplierType = 'local' | 'foreign'
export type SupplierClassification = 'none' | 'small' | 'medium' | 'large' | 'other'

export interface Supplier {
  id: number
  name?: string
  business_name: string
  type: SupplierType
  classification: SupplierClassification
  registration_number?: string
  email: string
  phone: string
  address: string
  is_active: boolean
  tax_id?: string
  business_activity?: string
  is_large_taxpayer: boolean
  municipality?: string
  department?: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface CreateSupplierRequest {
  id?: number // Solo para actualizar
  name?: string
  business_name: string
  type: SupplierType
  classification: SupplierClassification
  registration_number?: string
  email: string
  phone: string
  address: string
  is_active: boolean
  tax_id?: string
}

export interface SupplierFilters {
  name?: string
  business_name?: string
  type?: SupplierType
  classification?: SupplierClassification
  is_active?: boolean
  search?: string
  email?: string
}

// Estructura estándar para enlaces de paginación
export interface PaginationLinks {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

// Estructura estándar de respuesta paginada (igual que products y chart-of-accounts)
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

// Respuesta API completa (antes de que apiClient extraiga 'data')
export interface SuppliersApiResponse {
  status: 'success' | 'error'
  message: string
  data: PaginatedResponse<Supplier>
}

// Respuesta después de que apiClient extrae 'data' automáticamente
export type SuppliersApiClientResponse = PaginatedResponse<Supplier>

export interface SupplierStats {
  total: number
  active: number
  inactive: number
  local: number
  foreign: number
  byClassification: {
    none: number
    small: number
    medium: number
    large: number
    other: number
  }
}

export interface GetSuppliersParams {
  page?: number
  per_page?: number
  name?: string
  business_name?: string
  type?: SupplierType
  classification?: SupplierClassification
  is_active?: boolean
  search?: string
  email?: string
}
