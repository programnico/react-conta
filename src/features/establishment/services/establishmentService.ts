import { apiClient, API_CONFIG } from '@/shared/services/apiClient'
import type {
  Establishment,
  EstablishmentsApiClientResponse,
  CreateEstablishmentRequest,
  GetEstablishmentsParams
} from '../types'

class EstablishmentService {
  /**
   * Get all establishments with pagination and filters
   */
  async getAll(params: GetEstablishmentsParams = {}): Promise<EstablishmentsApiClientResponse> {
    try {
      const queryParams = new URLSearchParams()

      // Add pagination params
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.per_page) queryParams.append('per_page', params.per_page.toString())

      // Add filter params
      if (params.name) queryParams.append('name', params.name)
      if (params.company_id) queryParams.append('company_id', params.company_id.toString())
      if (params.is_active !== undefined) queryParams.append('is_active', params.is_active ? '1' : '0')
      if (params.is_main !== undefined) queryParams.append('is_main', params.is_main ? '1' : '0')
      if (params.search) queryParams.append('search', params.search)

      const endpoint = queryParams.toString()
        ? `${API_CONFIG.ENDPOINTS.ESTABLISHMENTS.LIST}?${queryParams.toString()}`
        : API_CONFIG.ENDPOINTS.ESTABLISHMENTS.LIST

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
   * Get a single establishment by ID
   */
  async getById(id: number): Promise<Establishment> {
    try {
      const response = await apiClient.request<Establishment>({
        endpoint: `${API_CONFIG.ENDPOINTS.ESTABLISHMENTS.DETAIL}/${id}`,
        method: 'GET'
      })
      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Create a new establishment
   */
  async create(data: CreateEstablishmentRequest): Promise<Establishment> {
    try {
      const formData = new FormData()

      // Datos básicos del establecimiento
      formData.append('company_id', data.company_id.toString())
      formData.append('code', data.code)
      formData.append('name', data.name)
      if (data.address) formData.append('address', data.address)
      if (data.phone) formData.append('phone', data.phone)
      if (data.email) formData.append('email', data.email)
      if (data.manager_name) formData.append('manager_name', data.manager_name)
      if (data.latitude) formData.append('latitude', data.latitude.toString())
      if (data.longitude) formData.append('longitude', data.longitude.toString())
      if (data.is_main !== undefined) formData.append('is_main', data.is_main ? '1' : '0')
      if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0')

      // Settings de inventario
      if (data.allow_negative_stock !== undefined)
        formData.append('allow_negative_stock', data.allow_negative_stock ? '1' : '0')
      if (data.require_serial_numbers !== undefined)
        formData.append('require_serial_numbers', data.require_serial_numbers ? '1' : '0')
      if (data.stock_valuation_method) formData.append('stock_valuation_method', data.stock_valuation_method)

      // Settings de numeración
      if (data.invoice_prefix) formData.append('invoice_prefix', data.invoice_prefix)
      if (data.invoice_current_number !== undefined)
        formData.append('invoice_current_number', data.invoice_current_number.toString())
      if (data.receipt_prefix) formData.append('receipt_prefix', data.receipt_prefix)
      if (data.receipt_current_number !== undefined)
        formData.append('receipt_current_number', data.receipt_current_number.toString())
      if (data.purchase_prefix) formData.append('purchase_prefix', data.purchase_prefix)
      if (data.purchase_current_number !== undefined)
        formData.append('purchase_current_number', data.purchase_current_number.toString())

      // Settings de precios
      if (data.use_custom_pricing !== undefined)
        formData.append('use_custom_pricing', data.use_custom_pricing ? '1' : '0')
      if (data.price_markup_percentage !== undefined)
        formData.append('price_markup_percentage', data.price_markup_percentage.toString())

      // Settings de documentos
      if (data.allow_partial_payments !== undefined)
        formData.append('allow_partial_payments', data.allow_partial_payments ? '1' : '0')
      if (data.require_customer_tax_id !== undefined)
        formData.append('require_customer_tax_id', data.require_customer_tax_id ? '1' : '0')
      if (data.default_payment_terms_days !== undefined)
        formData.append('default_payment_terms_days', data.default_payment_terms_days.toString())

      // Settings de compras
      if (data.require_purchase_approval !== undefined)
        formData.append('require_purchase_approval', data.require_purchase_approval ? '1' : '0')
      if (data.purchase_approval_threshold !== undefined)
        formData.append('purchase_approval_threshold', data.purchase_approval_threshold.toString())

      // Settings de reportes
      if (data.default_report_format) formData.append('default_report_format', data.default_report_format)
      if (data.include_company_logo !== undefined)
        formData.append('include_company_logo', data.include_company_logo ? '1' : '0')
      if (data.custom_footer_text) formData.append('custom_footer_text', data.custom_footer_text)

      // Settings de horarios
      if (data.opening_time) formData.append('opening_time', data.opening_time)
      if (data.closing_time) formData.append('closing_time', data.closing_time)
      if (data.working_days) formData.append('working_days', data.working_days)

      const response = await apiClient.request<Establishment>({
        endpoint: API_CONFIG.ENDPOINTS.ESTABLISHMENTS.SAVE,
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
   * Update an existing establishment
   */
  async update(id: number, data: CreateEstablishmentRequest): Promise<Establishment> {
    try {
      const formData = new FormData()
      formData.append('id', id.toString())

      // Datos básicos del establecimiento
      formData.append('company_id', data.company_id.toString())
      formData.append('code', data.code)
      formData.append('name', data.name)
      if (data.address) formData.append('address', data.address)
      if (data.phone) formData.append('phone', data.phone)
      if (data.email) formData.append('email', data.email)
      if (data.manager_name) formData.append('manager_name', data.manager_name)
      if (data.latitude) formData.append('latitude', data.latitude.toString())
      if (data.longitude) formData.append('longitude', data.longitude.toString())
      if (data.is_main !== undefined) formData.append('is_main', data.is_main ? '1' : '0')
      if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0')

      // Settings de inventario
      if (data.allow_negative_stock !== undefined)
        formData.append('allow_negative_stock', data.allow_negative_stock ? '1' : '0')
      if (data.require_serial_numbers !== undefined)
        formData.append('require_serial_numbers', data.require_serial_numbers ? '1' : '0')
      if (data.stock_valuation_method) formData.append('stock_valuation_method', data.stock_valuation_method)

      // Settings de numeración
      if (data.invoice_prefix) formData.append('invoice_prefix', data.invoice_prefix)
      if (data.invoice_current_number !== undefined)
        formData.append('invoice_current_number', data.invoice_current_number.toString())
      if (data.receipt_prefix) formData.append('receipt_prefix', data.receipt_prefix)
      if (data.receipt_current_number !== undefined)
        formData.append('receipt_current_number', data.receipt_current_number.toString())
      if (data.purchase_prefix) formData.append('purchase_prefix', data.purchase_prefix)
      if (data.purchase_current_number !== undefined)
        formData.append('purchase_current_number', data.purchase_current_number.toString())

      // Settings de precios
      if (data.use_custom_pricing !== undefined)
        formData.append('use_custom_pricing', data.use_custom_pricing ? '1' : '0')
      if (data.price_markup_percentage !== undefined)
        formData.append('price_markup_percentage', data.price_markup_percentage.toString())

      // Settings de documentos
      if (data.allow_partial_payments !== undefined)
        formData.append('allow_partial_payments', data.allow_partial_payments ? '1' : '0')
      if (data.require_customer_tax_id !== undefined)
        formData.append('require_customer_tax_id', data.require_customer_tax_id ? '1' : '0')
      if (data.default_payment_terms_days !== undefined)
        formData.append('default_payment_terms_days', data.default_payment_terms_days.toString())

      // Settings de compras
      if (data.require_purchase_approval !== undefined)
        formData.append('require_purchase_approval', data.require_purchase_approval ? '1' : '0')
      if (data.purchase_approval_threshold !== undefined)
        formData.append('purchase_approval_threshold', data.purchase_approval_threshold.toString())

      // Settings de reportes
      if (data.default_report_format) formData.append('default_report_format', data.default_report_format)
      if (data.include_company_logo !== undefined)
        formData.append('include_company_logo', data.include_company_logo ? '1' : '0')
      if (data.custom_footer_text) formData.append('custom_footer_text', data.custom_footer_text)

      // Settings de horarios
      if (data.opening_time) formData.append('opening_time', data.opening_time)
      if (data.closing_time) formData.append('closing_time', data.closing_time)
      if (data.working_days) formData.append('working_days', data.working_days)

      const response = await apiClient.request<Establishment>({
        endpoint: API_CONFIG.ENDPOINTS.ESTABLISHMENTS.SAVE,
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
   * Delete an establishment
   */
  async delete(id: number): Promise<void> {
    try {
      await apiClient.request<void>({
        endpoint: `${API_CONFIG.ENDPOINTS.ESTABLISHMENTS.DELETE}/${id}`,
        method: 'DELETE'
      })
    } catch (error) {
      throw error
    }
  }

  /**
   * Search establishments by query
   */
  async search(query: string, filters: any = {}): Promise<EstablishmentsApiClientResponse> {
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
}

export const establishmentService = new EstablishmentService()
