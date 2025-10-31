// features/product/services/productService.ts
import { apiClient, API_CONFIG } from '@/shared/services/apiClient'
import type {
  Product,
  ProductsApiResponse,
  ProductsApiClientResponse,
  CreateProductRequest,
  GetProductsParams
} from '../types'

class ProductService {
  // Using centralized API_CONFIG endpoints

  /**
   * Get all products with pagination and filters
   */
  async getAll(params: GetProductsParams = {}): Promise<ProductsApiClientResponse> {
    try {
      const queryParams = new URLSearchParams()

      // Add pagination params
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.per_page) queryParams.append('per_page', params.per_page.toString())

      // Add filter params
      if (params.name) queryParams.append('name', params.name)
      if (params.category) queryParams.append('category', params.category)
      if (params.is_active !== undefined) queryParams.append('is_active', params.is_active ? '1' : '0')
      if (params.search) queryParams.append('search', params.search)
      if (params.min_price) queryParams.append('min_price', params.min_price.toString())
      if (params.max_price) queryParams.append('max_price', params.max_price.toString())

      const endpoint = queryParams.toString()
        ? `${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}?${queryParams.toString()}`
        : API_CONFIG.ENDPOINTS.PRODUCTS.LIST

      const response = await apiClient.request<any>({
        endpoint,
        method: 'GET'
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Create a new product
   */
  async create(data: CreateProductRequest): Promise<Product> {
    try {
      const payload = {
        name: data.name,
        stock_quantity: data.stock_quantity,
        selling_price: data.selling_price,
        cost_price: data.cost_price,
        description: data.description || '',
        image_url: data.image_url || '',
        product_code: data.product_code,
        category: data.category,
        is_active: data.is_active ? 1 : 0
      }

      const response = await apiClient.request<Product>({
        endpoint: API_CONFIG.ENDPOINTS.PRODUCTS.SAVE,
        method: 'POST',
        data: payload,
        useFormData: true
      })
      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Update an existing product
   */
  async update(id: number, data: CreateProductRequest): Promise<Product> {
    try {
      const payload = {
        id: id,
        name: data.name,
        stock_quantity: data.stock_quantity,
        selling_price: data.selling_price,
        cost_price: data.cost_price,
        description: data.description || '',
        image_url: data.image_url || '',
        product_code: data.product_code,
        category: data.category,
        is_active: data.is_active ? 1 : 0
      }

      const response = await apiClient.request<Product>({
        endpoint: API_CONFIG.ENDPOINTS.PRODUCTS.SAVE,
        method: 'POST',
        data: payload,
        useFormData: true
      })
      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Delete a product
   */
  async delete(id: number): Promise<void> {
    try {
      await apiClient.request<void>({
        endpoint: `${API_CONFIG.ENDPOINTS.PRODUCTS.DELETE}/${id}`,
        method: 'DELETE'
      })
    } catch (error) {
      throw error
    }
  }

  /**
   * Search products by query
   */
  async search(query: string, filters: any = {}): Promise<ProductsApiClientResponse> {
    try {
      const params = {
        search: query,
        ...filters
      }
      return await this.getAll(params)
    } catch (error) {
      throw error
    }
  }

  /**
   * Get a single product by ID
   */
  async getById(id: number): Promise<Product> {
    try {
      const response = await apiClient.request<Product>({
        endpoint: `${API_CONFIG.ENDPOINTS.PRODUCTS.DETAIL}/${id}`,
        method: 'GET'
      })
      return response
    } catch (error) {
      throw error
    }
  }
}

export const productService = new ProductService()
