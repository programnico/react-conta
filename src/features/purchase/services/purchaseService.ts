// features/purchase/services/purchaseService.ts
import { apiClient, API_CONFIG } from '@/shared/services/apiClient'
import type { ApiResponse } from '@/shared/types/api'
import type {
  Purchase,
  PurchasesApiResponse,
  SuppliersApiResponse,
  CreatePurchaseRequest,
  UpdatePurchaseRequest,
  PurchaseFilters,
  Supplier
} from '../types'

class PurchaseService {
  // Using centralized API_CONFIG endpoints

  /**
   * Get all purchases with pagination and filters
   */
  async getAll(filters?: PurchaseFilters & { page?: number; per_page?: number }): Promise<PurchasesApiResponse> {
    try {
      const params = new URLSearchParams()

      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.per_page) params.append('per_page', filters.per_page.toString())
      if (filters?.status) params.append('status', filters.status)
      if (filters?.supplier_id) params.append('supplier_id', filters.supplier_id.toString())
      if (filters?.document_type) params.append('document_type', filters.document_type)
      if (filters?.date_from) params.append('date_from', filters.date_from)
      if (filters?.date_to) params.append('date_to', filters.date_to)
      if (filters?.search) params.append('search', filters.search)

      const queryString = params.toString()
      const url = queryString
        ? `${API_CONFIG.ENDPOINTS.PURCHASE.LIST}?${queryString}`
        : API_CONFIG.ENDPOINTS.PURCHASE.LIST

      // Use direct request to get the full API response structure
      const response = await apiClient.request<PurchasesApiResponse>({
        endpoint: url,
        method: 'GET'
      })
      return response
    } catch (error) {
      console.error('Error fetching purchases:', error)
      throw error
    }
  }

  /**
   * Get a single purchase by ID
   */
  async getById(id: number): Promise<Purchase> {
    try {
      const response = await apiClient.get<ApiResponse<Purchase>>(`${API_CONFIG.ENDPOINTS.PURCHASE.LIST}/${id}`)
      return response.data!
    } catch (error) {
      console.error('Error fetching purchase:', error)
      throw error
    }
  }

  /**
   * Create a new purchase
   */
  async create(data: CreatePurchaseRequest): Promise<Purchase> {
    try {
      // Convert details array to FormData format expected by Laravel
      const formData = new FormData()

      // Add main purchase fields
      formData.append('supplier_id', data.supplier_id.toString())
      formData.append('purchase_date', data.purchase_date)
      formData.append('document_number', data.document_number)
      formData.append('document_type', data.document_type)
      formData.append('subtotal', data.subtotal.toString())
      formData.append('tax_amount', data.tax_amount.toString())
      formData.append('total_amount', data.total_amount.toString())
      formData.append('payment_terms', data.payment_terms)
      formData.append('due_date', data.due_date)

      if (data.notes) {
        formData.append('notes', data.notes)
      }

      // Add details as individual FormData fields
      data.details.forEach((detail, index) => {
        // Add each field of the detail item
        if (detail.product_id !== null && detail.product_id !== undefined) {
          formData.append(`details[${index}][product_id]`, detail.product_id.toString())
        }
        formData.append(`details[${index}][description]`, detail.description)
        formData.append(`details[${index}][quantity]`, detail.quantity.toString())
        formData.append(`details[${index}][unit_price]`, detail.unit_price.toString())
        formData.append(`details[${index}][line_total]`, detail.line_total.toString())
        formData.append(`details[${index}][tax_rate]`, detail.tax_rate.toString())
        formData.append(`details[${index}][tax_amount]`, detail.tax_amount.toString())

        if (detail.notes) {
          formData.append(`details[${index}][notes]`, detail.notes)
        }
      })

      // Debug FormData content
      console.log('🔍 FormData contents:')
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value)
      }

      const response = await apiClient.request<Purchase>({
        endpoint: API_CONFIG.ENDPOINTS.PURCHASE.SAVE,
        method: 'POST',
        data: formData,
        useFormData: true
      })
      return response
    } catch (error) {
      console.error('Error creating purchase:', error)
      throw error
    }
  }

  /**
   * Update an existing purchase
   */
  async update(id: number, data: CreatePurchaseRequest): Promise<Purchase> {
    try {
      const formData = new FormData()

      // Add ID for update
      formData.append('id', id.toString())

      // Add main purchase fields
      formData.append('supplier_id', data.supplier_id.toString())
      formData.append('purchase_date', data.purchase_date)
      formData.append('document_number', data.document_number)
      formData.append('document_type', data.document_type)
      formData.append('subtotal', data.subtotal.toString())
      formData.append('tax_amount', data.tax_amount.toString())
      formData.append('total_amount', data.total_amount.toString())
      formData.append('payment_terms', data.payment_terms)
      formData.append('due_date', data.due_date)

      if (data.notes) {
        formData.append('notes', data.notes)
      }

      // Add details as individual FormData fields
      data.details.forEach((detail, index) => {
        // Add each field of the detail item
        if (detail.product_id !== null && detail.product_id !== undefined) {
          formData.append(`details[${index}][product_id]`, detail.product_id.toString())
        }
        formData.append(`details[${index}][description]`, detail.description)
        formData.append(`details[${index}][quantity]`, detail.quantity.toString())
        formData.append(`details[${index}][unit_price]`, detail.unit_price.toString())
        formData.append(`details[${index}][line_total]`, detail.line_total.toString())
        formData.append(`details[${index}][tax_rate]`, detail.tax_rate.toString())
        formData.append(`details[${index}][tax_amount]`, detail.tax_amount.toString())

        if (detail.notes) {
          formData.append(`details[${index}][notes]`, detail.notes)
        }
      })

      const response = await apiClient.request<Purchase>({
        endpoint: API_CONFIG.ENDPOINTS.PURCHASE.SAVE,
        method: 'POST',
        data: formData,
        useFormData: true
      })
      console.log('🔍 Purchase update API response:', response)
      console.log('🔍 Purchase data being returned:', response)
      return response
    } catch (error) {
      console.error('Error updating purchase:', error)
      throw error
    }
  }

  /**
   * Delete a purchase
   */
  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`${API_CONFIG.ENDPOINTS.PURCHASE.DELETE}/${id}`)
    } catch (error) {
      console.error('Error deleting purchase:', error)
      throw error
    }
  }

  /**
   * Get all suppliers for selection
   */
  async getSuppliers(): Promise<Supplier[]> {
    try {
      // Use direct request to get the full API response structure
      const response = await apiClient.request<SuppliersApiResponse>({
        endpoint: API_CONFIG.ENDPOINTS.PURCHASE.SUPPLIERS,
        method: 'GET'
      })

      // The response is directly an array, not an object with .data property
      if (Array.isArray(response)) {
        return response
      } else {
        // If it has a .data property, use it
        return response.data || []
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      throw error
    }
  }

  /**
   * Search purchases by document number or supplier name
   */
  async search(query: string, filters?: PurchaseFilters): Promise<PurchasesApiResponse> {
    return this.getAll({ ...filters, search: query })
  }

  /**
   * Get purchases by status
   */
  async getByStatus(status: Purchase['status'], filters?: PurchaseFilters): Promise<PurchasesApiResponse> {
    return this.getAll({ ...filters, status })
  }

  /**
   * Get purchases by supplier
   */
  async getBySupplier(supplierId: number, filters?: PurchaseFilters): Promise<PurchasesApiResponse> {
    return this.getAll({ ...filters, supplier_id: supplierId })
  }

  /**
   * Get purchases in date range
   */
  async getByDateRange(dateFrom: string, dateTo: string, filters?: PurchaseFilters): Promise<PurchasesApiResponse> {
    return this.getAll({ ...filters, date_from: dateFrom, date_to: dateTo })
  }
}

// Export singleton instance
export const purchaseService = new PurchaseService()
export default purchaseService
