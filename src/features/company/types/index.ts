// features/company/types/index.ts

export interface CompanySettings {
  // === INVENTARIO ===
  separate_stock_by_establishment?: boolean
  allow_negative_stock?: boolean
  require_serial_numbers?: boolean
  auto_update_cost_price?: boolean
  stock_valuation_method?: 'fifo' | 'lifo' | 'average' | 'standard'

  // === NUMERACIÓN ===
  separate_numbering_by_establishment?: boolean
  invoice_prefix?: string
  receipt_prefix?: string
  purchase_prefix?: string

  // === COMPARTIR DATOS ===
  share_clients_across_establishments?: boolean
  share_suppliers_across_establishments?: boolean
  share_products_across_establishments?: boolean
  share_pricing_across_establishments?: boolean

  // === CONTABLE ===
  consolidated_accounting?: boolean
  fiscal_year_start_month?: number
  use_cost_centers?: boolean
  require_budget_approval?: boolean
  auto_post_journal_entries?: boolean

  // === DOCUMENTOS ===
  allow_partial_payments?: boolean
  allow_edit_posted_documents?: boolean
  require_customer_tax_id?: boolean
  default_payment_terms_days?: number

  // === COMPRAS ===
  require_purchase_approval?: boolean
  purchase_approval_threshold?: string | number
  auto_receive_purchases?: boolean

  // === REPORTES ===
  default_report_format?: 'pdf' | 'excel' | 'html'
  include_company_logo?: boolean

  // === IMPUESTOS ===
  default_tax_rate?: string | number
  calculate_tax_inclusive?: boolean
}

export interface Company {
  id: number
  name: string
  tax_id: string | null
  legal_name: string
  address: string | null
  phone: string | null
  email: string | null
  website?: string | null
  country?: string | null
  state?: string | null
  city?: string | null
  postal_code?: string | null
  logo_path: string | null
  currency: string
  timezone?: string
  locale?: string
  fiscal_year_end?: string | null
  is_active: boolean
  is_default?: boolean
  has_establishments?: boolean
  establishment_mode?: 'none' | 'statistical' | 'operational'
  created_at: string
  updated_at: string
  deleted_at: string | null
  settings?: CompanySettings
}

export interface CreateCompanyRequest {
  id?: number // Solo para actualizar
  // Datos básicos
  name: string
  legal_name?: string
  tax_id?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  website?: string
  currency?: string
  timezone?: string
  locale?: string
  fiscal_year_end?: string
  is_active?: boolean
  is_default?: boolean
  has_establishments?: boolean
  establishment_mode?: 'none' | 'statistical' | 'operational'
  logo?: File
  // Settings anidados
  settings?: CompanySettings
}

export interface CompanyFilters {
  name?: string
  search?: string
  is_active?: boolean
}

// Estructura estándar para enlaces de paginación
export interface PaginationLinks {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

// Estructura estándar de respuesta paginada
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
export interface CompaniesApiResponse {
  status: 'success' | 'error'
  message: string | null
  data: PaginatedResponse<Company>
}

// Respuesta después de que apiClient extrae 'data' automáticamente
export type CompaniesApiClientResponse = PaginatedResponse<Company>

export interface CompanyStats {
  total: number
  active: number
  inactive: number
  withEstablishments: number
  byCurrency: Record<string, number>
}

export interface GetCompaniesParams {
  page?: number
  per_page?: number
  name?: string
  search?: string
  is_active?: boolean
}
