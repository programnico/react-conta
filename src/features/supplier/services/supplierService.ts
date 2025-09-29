// features/supplier/services/supplierService.ts
import { apiClient } from '@/shared/services/apiClient'
import type { Supplier, SuppliersApiResponse, CreateSupplierRequest } from '../types'

interface GetSuppliersParams {
  page?: number
  per_page?: number
  name?: string
  type?: string
  classification?: string
  is_active?: boolean
  search?: string
}

class SupplierService {
  private readonly endpoint = '/suppliers'

  /**
   * Get all suppliers with pagination and filters
   */
  async getAll(params: GetSuppliersParams = {}): Promise<SuppliersApiResponse> {
    try {
      const queryParams = new URLSearchParams()

      // Add pagination params
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.per_page) queryParams.append('per_page', params.per_page.toString())

      // Add filter params
      if (params.name) queryParams.append('name', params.name)
      if (params.type) queryParams.append('type', params.type)
      if (params.classification) queryParams.append('classification', params.classification)
      if (params.is_active !== undefined) queryParams.append('is_active', params.is_active ? '1' : '0')
      if (params.search) queryParams.append('search', params.search)

      const endpoint = queryParams.toString() ? `${this.endpoint}?${queryParams.toString()}` : this.endpoint

      const response = await apiClient.request<SuppliersApiResponse>({
        endpoint,
        method: 'GET'
      })
      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Create a new supplier
   */
  async create(data: CreateSupplierRequest): Promise<Supplier> {
    try {
      const payload = {
        name: data.name || '',
        business_name: data.business_name,
        type: data.type,
        classification: data.classification,
        registration_number: data.registration_number || '',
        email: data.email,
        phone: data.phone,
        address: data.address,
        is_active: data.is_active ? 1 : 0,
        tax_id: data.tax_id || ''
      }

      const response = await apiClient.request<Supplier>({
        endpoint: `${this.endpoint}/save`,
        method: 'POST',
        data: payload
      })
      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Update an existing supplier
   */
  async update(id: number, data: CreateSupplierRequest): Promise<Supplier> {
    try {
      const payload = {
        name: data.name || '',
        business_name: data.business_name,
        type: data.type,
        classification: data.classification,
        registration_number: data.registration_number || '',
        email: data.email,
        phone: data.phone,
        address: data.address,
        is_active: data.is_active ? 1 : 0,
        tax_id: data.tax_id || ''
      }

      const response = await apiClient.request<Supplier>({
        endpoint: `${this.endpoint}/${id}/update`,
        method: 'PUT',
        data: payload
      })
      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Delete a supplier
   */
  async delete(id: number): Promise<void> {
    try {
      await apiClient.request<void>({
        endpoint: `${this.endpoint}/${id}/delete`,
        method: 'DELETE'
      })
    } catch (error) {
      throw error
    }
  }

  /**
   * Search suppliers by query
   */
  async search(query: string, filters: any = {}): Promise<SuppliersApiResponse> {
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
   * Get a single supplier by ID
   */
  async getById(id: number): Promise<Supplier> {
    try {
      const response = await apiClient.request<Supplier>({
        endpoint: `${this.endpoint}/${id}`,
        method: 'GET'
      })
      return response
    } catch (error) {
      throw error
    }
  }
}

export const supplierService = new SupplierService()