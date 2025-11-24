// features/establishment/types/index.ts

import type { Company } from '@/features/company/types'

export interface EstablishmentSettings {
  id?: number
  establishment_id?: number
  company_id?: number
  // === INVENTARIO ===
  allow_negative_stock?: boolean
  require_serial_numbers?: boolean
  stock_valuation_method?: 'fifo' | 'lifo' | 'average' | 'standard'

  // === NUMERACIÓN ===
  invoice_prefix?: string
  invoice_current_number?: number
  receipt_prefix?: string
  receipt_current_number?: number
  purchase_prefix?: string
  purchase_current_number?: number

  // === PRECIOS ===
  use_custom_pricing?: boolean
  price_markup_percentage?: string | number

  // === DOCUMENTOS ===
  allow_partial_payments?: boolean
  require_customer_tax_id?: boolean
  default_payment_terms_days?: number

  // === COMPRAS ===
  require_purchase_approval?: boolean
  purchase_approval_threshold?: string | number

  // === REPORTES ===
  default_report_format?: 'pdf' | 'excel' | 'html'
  include_company_logo?: boolean
  custom_footer_text?: string

  // === HORARIOS ===
  opening_time?: string
  closing_time?: string
  working_days?: string // Comma-separated: "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday"

  created_at?: string
  updated_at?: string
}

export interface Establishment {
  id: number
  company_id: number
  code: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  manager_name: string | null
  latitude: string | null
  longitude: string | null
  is_main: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
  settings?: EstablishmentSettings | null
  company?: Company
}

export interface CreateEstablishmentRequest {
  id?: number // Solo para actualización
  // Datos básicos del establecimiento
  company_id: number
  code: string
  name: string
  address?: string
  phone?: string
  email?: string
  manager_name?: string
  latitude?: string | number
  longitude?: string | number
  is_main?: boolean
  is_active?: boolean

  // Settings de inventario
  allow_negative_stock?: boolean
  require_serial_numbers?: boolean
  stock_valuation_method?: 'fifo' | 'lifo' | 'average' | 'standard'

  // Settings de numeración
  invoice_prefix?: string
  invoice_current_number?: number
  receipt_prefix?: string
  receipt_current_number?: number
  purchase_prefix?: string
  purchase_current_number?: number

  // Settings de precios
  use_custom_pricing?: boolean
  price_markup_percentage?: string | number

  // Settings de documentos
  allow_partial_payments?: boolean
  require_customer_tax_id?: boolean
  default_payment_terms_days?: number

  // Settings de compras
  require_purchase_approval?: boolean
  purchase_approval_threshold?: string | number

  // Settings de reportes
  default_report_format?: 'pdf' | 'excel' | 'html'
  include_company_logo?: boolean
  custom_footer_text?: string

  // Settings de horarios
  opening_time?: string
  closing_time?: string
  working_days?: string
}

export interface EstablishmentFilters {
  name?: string
  search?: string
  company_id?: number
  is_active?: boolean
  is_main?: boolean
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
export interface EstablishmentsApiResponse {
  status: 'success' | 'error'
  message: string | null
  data: PaginatedResponse<Establishment>
}

// Respuesta después de que apiClient extrae 'data' automáticamente
export type EstablishmentsApiClientResponse = PaginatedResponse<Establishment>

export interface EstablishmentStats {
  total: number
  active: number
  inactive: number
  byCompany: Record<string, number>
  mainEstablishments: number
}

export interface GetEstablishmentsParams {
  page?: number
  per_page?: number
  name?: string
  search?: string
  company_id?: number
  is_active?: boolean
  is_main?: boolean
}
