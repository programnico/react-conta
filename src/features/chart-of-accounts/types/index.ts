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
  account_code: string
  account_name: string
  account_type: string
  level: string
  is_active: boolean
  description: string
  id?: number // Para actualización
}

export interface ChartOfAccountsResponse {
  status: string
  message: string
  data: {
    current_page: number
    data: ChartOfAccount[]
    first_page_url: string
    from: number
    last_page: number
    last_page_url: string
    links: any[]
    next_page_url: string | null
    path: string
    per_page: number
    prev_page_url: string | null
    to: number
    total: number
  }
}

// Esta interfaz representa lo que realmente retorna el apiClient después de extraer el 'data'
export interface ChartOfAccountsApiResponse {
  current_page: number
  data: ChartOfAccount[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: any[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

export interface ChartOfAccountFilters {
  search?: string
  account_type?: string
  level?: number
  is_active?: boolean
  parent_account_id?: number
}
