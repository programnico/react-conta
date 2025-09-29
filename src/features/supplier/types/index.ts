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
  type?: SupplierType
  classification?: SupplierClassification
  is_active?: boolean
  search?: string
}

export interface SuppliersApiResponse {
  status: string
  message: string
  data: {
    current_page: number
    data: Supplier[]
    first_page_url: string
    from: number
    last_page: number
    last_page_url: string
    links: Array<{
      url: string | null
      label: string
      page: number | null
      active: boolean
    }>
    next_page_url: string | null
    path: string
    per_page: number
    prev_page_url: string | null
    to: number
    total: number
  }
}

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
