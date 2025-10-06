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
}

export interface ProductFilters {
  name?: string
  category?: string
  is_active?: boolean
  search?: string
  min_price?: number
  max_price?: number
}

export interface ProductsApiResponse {
  status: string
  message: string
  data: {
    products: Product[]
    pagination: {
      current_page: number
      per_page: number
      total: number
      last_page: number
      from: number
      to: number
      has_more_pages: boolean
    }
  }
}

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
