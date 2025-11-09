// features/chart-of-accounts/types/index.ts
export interface ChartOfAccount {
  id: number
  account_code: string
  account_name: string
  account_type: string
  parent_account_id: number | null
  level: number
  is_active: boolean
  description: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  parent_account?: ChartOfAccount | null
  child_accounts?: ChartOfAccount[]
}

export interface CreateChartOfAccountRequest {
  id?: number // Solo para actualizar
  account_code: string
  account_name: string
  account_type: string
  level: string
  is_active?: boolean
  description?: string
}

export interface ChartOfAccountFilters {
  search?: string
  account_type?: string
  level?: number
  is_active?: boolean
  parent_account_id?: number
}

// Estructura estándar para enlaces de paginación
export interface PaginationLinks {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

// Estructura estándar de respuesta paginada (igual que products, purchases y suppliers)
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
export interface ChartOfAccountsApiResponse {
  status: 'success' | 'error'
  message: string
  data: PaginatedResponse<ChartOfAccount>
}

// Respuesta después de que apiClient extrae 'data' automáticamente
export type ChartOfAccountsApiClientResponse = PaginatedResponse<ChartOfAccount>

export interface ChartOfAccountStats {
  total: number
  active: number
  inactive: number
  byType: Record<string, number>
  byLevel: Record<number, number>
}

export interface GetChartOfAccountsParams {
  page?: number
  per_page?: number
  search?: string
  account_type?: string
  level?: number
  is_active?: boolean
  parent_account_id?: number
}
