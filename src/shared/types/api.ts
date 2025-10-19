// shared/types/api.ts
export interface ApiResponse<T = any> {
  data?: T
  status?: number | string
  message?: string
  success?: boolean
  [key: string]: any // Allow additional properties
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  last_page: number
}

export interface ApiError {
  message: string
  code?: string
  status?: number
  errors?: Record<string, string[]> // Errores de validación del backend
}
