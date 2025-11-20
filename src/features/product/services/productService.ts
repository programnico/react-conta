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
      // Crear FormData manualmente para adjuntar archivos
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('stock_quantity', String(data.stock_quantity))
      formData.append('selling_price', String(data.selling_price))
      formData.append('cost_price', String(data.cost_price))
      formData.append('description', data.description || '')
      formData.append('image_url', data.image_url || '')
      formData.append('product_code', data.product_code)
      formData.append('category', data.category)
      formData.append('is_active', data.is_active ? '1' : '0')

      // Adjuntar archivos si existen
      if (data.attachments && data.attachments.length > 0) {
        data.attachments.forEach((file: File) => {
          formData.append('attachments[]', file)
        })
      }

      const response = await apiClient.request<Product>({
        endpoint: API_CONFIG.ENDPOINTS.PRODUCTS.SAVE,
        method: 'POST',
        data: formData,
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
      // Crear FormData manualmente para adjuntar archivos
      const formData = new FormData()
      formData.append('id', String(id))
      formData.append('name', data.name)
      formData.append('stock_quantity', String(data.stock_quantity))
      formData.append('selling_price', String(data.selling_price))
      formData.append('cost_price', String(data.cost_price))
      formData.append('description', data.description || '')
      formData.append('image_url', data.image_url || '')
      formData.append('product_code', data.product_code)
      formData.append('category', data.category)
      formData.append('is_active', data.is_active ? '1' : '0')

      // Adjuntar archivos si existen
      if (data.attachments && data.attachments.length > 0) {
        data.attachments.forEach((file: File) => {
          formData.append('attachments[]', file)
        })
      }

      const response = await apiClient.request<Product>({
        endpoint: API_CONFIG.ENDPOINTS.PRODUCTS.SAVE,
        method: 'POST',
        data: formData,
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
