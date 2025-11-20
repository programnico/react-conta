// features/product/types/index.ts
export interface Product {
  id: number
  name: string
  stock_quantity: string
  selling_price: string
  cost_price: string
  description?: string
  image_url?: string
  product_code: string
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface CreateProductRequest {
  id?: number // Solo para actualizar
  name: string
  stock_quantity: number
  selling_price: number
  cost_price: number
  description?: string
  image_url?: string
  product_code: string
  category: string
  is_active?: boolean
  attachments?: File[]
}

export interface ProductFilters {
  name?: string
  category?: string
  is_active?: boolean
  search?: string
  min_price?: number
  max_price?: number
}

// Estructura estándar para enlaces de paginación
export interface PaginationLinks {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

// Estructura estándar de respuesta paginada (igual que purchases y suppliers)
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
export interface ProductsApiResponse {
  status: 'success' | 'error'
  message: string
  data: PaginatedResponse<Product>
}

// Respuesta después de que apiClient extrae 'data' automáticamente
export type ProductsApiClientResponse = PaginatedResponse<Product>

export interface ProductStats {
  total: number
  active: number
  inactive: number
  lowStock: number
  categories: number
}

export interface GetProductsParams {
  page?: number
  per_page?: number
  name?: string
  category?: string
  is_active?: boolean
  search?: string
  min_price?: number
  max_price?: number
}
