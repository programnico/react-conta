import { apiClient, API_CONFIG } from '@/shared/services/apiClient'
import type { Company, CompaniesApiClientResponse, CreateCompanyRequest, GetCompaniesParams } from '../types'

class CompanyService {
  // Using centralized API_CONFIG endpoints

  /**
   * Get all companies with pagination and filters
   */
  async getAll(params: GetCompaniesParams = {}): Promise<CompaniesApiClientResponse> {
    try {
      const queryParams = new URLSearchParams()

      // Add pagination params
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.per_page) queryParams.append('per_page', params.per_page.toString())

      // Add filter params
      if (params.name) queryParams.append('name', params.name)
      if (params.is_active !== undefined) queryParams.append('is_active', params.is_active ? '1' : '0')
      if (params.search) queryParams.append('search', params.search)

      const endpoint = queryParams.toString()
        ? `${API_CONFIG.ENDPOINTS.COMPANIES.LIST}?${queryParams.toString()}`
        : API_CONFIG.ENDPOINTS.COMPANIES.LIST

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
   * Get a single company by ID
   */
  async getById(id: number): Promise<Company> {
    try {
      const response = await apiClient.request<Company>({
        endpoint: `${API_CONFIG.ENDPOINTS.COMPANIES.DETAIL}/${id}`,
        method: 'GET'
      })
      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Create a new company
   */
  async create(data: CreateCompanyRequest): Promise<Company> {
    try {
      const formData = new FormData()

      // Datos básicos
      formData.append('name', data.name)
      if (data.legal_name) formData.append('legal_name', data.legal_name)
      if (data.tax_id) formData.append('tax_id', data.tax_id)
      if (data.email) formData.append('email', data.email)
      if (data.phone) formData.append('phone', data.phone)
      if (data.address) formData.append('address', data.address)
      if (data.city) formData.append('city', data.city)
      if (data.state) formData.append('state', data.state)
      if (data.country) formData.append('country', data.country)
      if (data.postal_code) formData.append('postal_code', data.postal_code)
      if (data.website) formData.append('website', data.website)
      if (data.currency) formData.append('currency', data.currency)
      if (data.timezone) formData.append('timezone', data.timezone)
      if (data.locale) formData.append('locale', data.locale)
      if (data.fiscal_year_end) formData.append('fiscal_year_end', data.fiscal_year_end)
      if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0')
      if (data.is_default !== undefined) formData.append('is_default', data.is_default ? '1' : '0')
      if (data.has_establishments !== undefined)
        formData.append('has_establishments', data.has_establishments ? '1' : '0')
      if (data.establishment_mode) formData.append('establishment_mode', data.establishment_mode)
      if (data.logo instanceof File) formData.append('logo', data.logo)

      // Settings anidados con los nombres correctos del API
      if (data.settings) {
        const s = data.settings

        // === INVENTARIO ===
        if (s.separate_stock_by_establishment !== undefined)
          formData.append('separate_stock_by_establishment', s.separate_stock_by_establishment ? '1' : '0')
        if (s.allow_negative_stock !== undefined)
          formData.append('allow_negative_stock', s.allow_negative_stock ? '1' : '0')
        if (s.require_serial_numbers !== undefined)
          formData.append('require_serial_numbers', s.require_serial_numbers ? '1' : '0')
        if (s.auto_update_cost_price !== undefined)
          formData.append('auto_update_cost_price', s.auto_update_cost_price ? '1' : '0')
        if (s.stock_valuation_method) formData.append('stock_valuation_method', s.stock_valuation_method)

        // === NUMERACIÓN ===
        if (s.separate_numbering_by_establishment !== undefined)
          formData.append('separate_numbering_by_establishment', s.separate_numbering_by_establishment ? '1' : '0')
        if (s.invoice_prefix) formData.append('invoice_prefix', s.invoice_prefix)
        if (s.receipt_prefix) formData.append('receipt_prefix', s.receipt_prefix)
        if (s.purchase_prefix) formData.append('purchase_prefix', s.purchase_prefix)

        // === COMPARTIR DATOS ===
        if (s.share_clients_across_establishments !== undefined)
          formData.append('share_clients_across_establishments', s.share_clients_across_establishments ? '1' : '0')
        if (s.share_suppliers_across_establishments !== undefined)
          formData.append('share_suppliers_across_establishments', s.share_suppliers_across_establishments ? '1' : '0')
        if (s.share_products_across_establishments !== undefined)
          formData.append('share_products_across_establishments', s.share_products_across_establishments ? '1' : '0')
        if (s.share_pricing_across_establishments !== undefined)
          formData.append('share_pricing_across_establishments', s.share_pricing_across_establishments ? '1' : '0')

        // === CONTABLE ===
        if (s.consolidated_accounting !== undefined)
          formData.append('consolidated_accounting', s.consolidated_accounting ? '1' : '0')
        if (s.fiscal_year_start_month !== undefined)
          formData.append('fiscal_year_start_month', s.fiscal_year_start_month.toString())
        if (s.use_cost_centers !== undefined) formData.append('use_cost_centers', s.use_cost_centers ? '1' : '0')
        if (s.require_budget_approval !== undefined)
          formData.append('require_budget_approval', s.require_budget_approval ? '1' : '0')
        if (s.auto_post_journal_entries !== undefined)
          formData.append('auto_post_journal_entries', s.auto_post_journal_entries ? '1' : '0')

        // === DOCUMENTOS ===
        if (s.allow_partial_payments !== undefined)
          formData.append('allow_partial_payments', s.allow_partial_payments ? '1' : '0')
        if (s.allow_edit_posted_documents !== undefined)
          formData.append('allow_edit_posted_documents', s.allow_edit_posted_documents ? '1' : '0')
        if (s.require_customer_tax_id !== undefined)
          formData.append('require_customer_tax_id', s.require_customer_tax_id ? '1' : '0')
        if (s.default_payment_terms_days !== undefined)
          formData.append('default_payment_terms_days', s.default_payment_terms_days.toString())

        // === COMPRAS ===
        if (s.require_purchase_approval !== undefined)
          formData.append('require_purchase_approval', s.require_purchase_approval ? '1' : '0')
        if (s.purchase_approval_threshold !== undefined)
          formData.append('purchase_approval_threshold', s.purchase_approval_threshold.toString())
        if (s.auto_receive_purchases !== undefined)
          formData.append('auto_receive_purchases', s.auto_receive_purchases ? '1' : '0')

        // === REPORTES ===
        if (s.default_report_format) formData.append('default_report_format', s.default_report_format)
        if (s.include_company_logo !== undefined)
          formData.append('include_company_logo', s.include_company_logo ? '1' : '0')

        // === IMPUESTOS ===
        if (s.default_tax_rate !== undefined) formData.append('default_tax_rate', s.default_tax_rate.toString())
        if (s.calculate_tax_inclusive !== undefined)
          formData.append('calculate_tax_inclusive', s.calculate_tax_inclusive ? '1' : '0')
      }

      const response = await apiClient.request<Company>({
        endpoint: API_CONFIG.ENDPOINTS.COMPANIES.SAVE,
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
   * Update an existing company
   */
  async update(id: number, data: CreateCompanyRequest): Promise<Company> {
    try {
      const formData = new FormData()
      formData.append('id', id.toString())

      // Datos básicos
      formData.append('name', data.name)
      if (data.legal_name) formData.append('legal_name', data.legal_name)
      if (data.tax_id) formData.append('tax_id', data.tax_id)
      if (data.email) formData.append('email', data.email)
      if (data.phone) formData.append('phone', data.phone)
      if (data.address) formData.append('address', data.address)
      if (data.city) formData.append('city', data.city)
      if (data.state) formData.append('state', data.state)
      if (data.country) formData.append('country', data.country)
      if (data.postal_code) formData.append('postal_code', data.postal_code)
      if (data.website) formData.append('website', data.website)
      if (data.currency) formData.append('currency', data.currency)
      if (data.timezone) formData.append('timezone', data.timezone)
      if (data.locale) formData.append('locale', data.locale)
      if (data.fiscal_year_end) formData.append('fiscal_year_end', data.fiscal_year_end)
      if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0')
      if (data.is_default !== undefined) formData.append('is_default', data.is_default ? '1' : '0')
      if (data.has_establishments !== undefined)
        formData.append('has_establishments', data.has_establishments ? '1' : '0')
      if (data.establishment_mode) formData.append('establishment_mode', data.establishment_mode)
      if (data.logo instanceof File) formData.append('logo', data.logo)

      // Settings anidados con los nombres correctos del API (igual que create)
      if (data.settings) {
        const s = data.settings

        // === INVENTARIO ===
        if (s.separate_stock_by_establishment !== undefined)
          formData.append('separate_stock_by_establishment', s.separate_stock_by_establishment ? '1' : '0')
        if (s.allow_negative_stock !== undefined)
          formData.append('allow_negative_stock', s.allow_negative_stock ? '1' : '0')
        if (s.require_serial_numbers !== undefined)
          formData.append('require_serial_numbers', s.require_serial_numbers ? '1' : '0')
        if (s.auto_update_cost_price !== undefined)
          formData.append('auto_update_cost_price', s.auto_update_cost_price ? '1' : '0')
        if (s.stock_valuation_method) formData.append('stock_valuation_method', s.stock_valuation_method)

        // === NUMERACIÓN ===
        if (s.separate_numbering_by_establishment !== undefined)
          formData.append('separate_numbering_by_establishment', s.separate_numbering_by_establishment ? '1' : '0')
        if (s.invoice_prefix) formData.append('invoice_prefix', s.invoice_prefix)
        if (s.receipt_prefix) formData.append('receipt_prefix', s.receipt_prefix)
        if (s.purchase_prefix) formData.append('purchase_prefix', s.purchase_prefix)

        // === COMPARTIR DATOS ===
        if (s.share_clients_across_establishments !== undefined)
          formData.append('share_clients_across_establishments', s.share_clients_across_establishments ? '1' : '0')
        if (s.share_suppliers_across_establishments !== undefined)
          formData.append('share_suppliers_across_establishments', s.share_suppliers_across_establishments ? '1' : '0')
        if (s.share_products_across_establishments !== undefined)
          formData.append('share_products_across_establishments', s.share_products_across_establishments ? '1' : '0')
        if (s.share_pricing_across_establishments !== undefined)
          formData.append('share_pricing_across_establishments', s.share_pricing_across_establishments ? '1' : '0')

        // === CONTABLE ===
        if (s.consolidated_accounting !== undefined)
          formData.append('consolidated_accounting', s.consolidated_accounting ? '1' : '0')
        if (s.fiscal_year_start_month !== undefined)
          formData.append('fiscal_year_start_month', s.fiscal_year_start_month.toString())
        if (s.use_cost_centers !== undefined) formData.append('use_cost_centers', s.use_cost_centers ? '1' : '0')
        if (s.require_budget_approval !== undefined)
          formData.append('require_budget_approval', s.require_budget_approval ? '1' : '0')
        if (s.auto_post_journal_entries !== undefined)
          formData.append('auto_post_journal_entries', s.auto_post_journal_entries ? '1' : '0')

        // === DOCUMENTOS ===
        if (s.allow_partial_payments !== undefined)
          formData.append('allow_partial_payments', s.allow_partial_payments ? '1' : '0')
        if (s.allow_edit_posted_documents !== undefined)
          formData.append('allow_edit_posted_documents', s.allow_edit_posted_documents ? '1' : '0')
        if (s.require_customer_tax_id !== undefined)
          formData.append('require_customer_tax_id', s.require_customer_tax_id ? '1' : '0')
        if (s.default_payment_terms_days !== undefined)
          formData.append('default_payment_terms_days', s.default_payment_terms_days.toString())

        // === COMPRAS ===
        if (s.require_purchase_approval !== undefined)
          formData.append('require_purchase_approval', s.require_purchase_approval ? '1' : '0')
        if (s.purchase_approval_threshold !== undefined)
          formData.append('purchase_approval_threshold', s.purchase_approval_threshold.toString())
        if (s.auto_receive_purchases !== undefined)
          formData.append('auto_receive_purchases', s.auto_receive_purchases ? '1' : '0')

        // === REPORTES ===
        if (s.default_report_format) formData.append('default_report_format', s.default_report_format)
        if (s.include_company_logo !== undefined)
          formData.append('include_company_logo', s.include_company_logo ? '1' : '0')

        // === IMPUESTOS ===
        if (s.default_tax_rate !== undefined) formData.append('default_tax_rate', s.default_tax_rate.toString())
        if (s.calculate_tax_inclusive !== undefined)
          formData.append('calculate_tax_inclusive', s.calculate_tax_inclusive ? '1' : '0')
      }

      const response = await apiClient.request<Company>({
        endpoint: API_CONFIG.ENDPOINTS.COMPANIES.SAVE,
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
   * Delete a company
   */
  async delete(id: number): Promise<void> {
    try {
      await apiClient.request<void>({
        endpoint: `${API_CONFIG.ENDPOINTS.COMPANIES.DELETE}/${id}`,
        method: 'DELETE'
      })
    } catch (error) {
      throw error
    }
  }

  /**
   * Search companies by query
   */
  async search(query: string, filters: any = {}): Promise<CompaniesApiClientResponse> {
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
   * Get all companies for dropdown/select (without pagination)
   */
  async getAllForSelect(): Promise<Company[]> {
    try {
      // Este endpoint retorna { status, message, data: Company[] }
      // El apiClient ya extrae 'data' automáticamente
      const response = await apiClient.request<Company[]>({
        endpoint: API_CONFIG.ENDPOINTS.COMPANIES.LIST_ALL,
        method: 'GET'
      })
      return response
    } catch (error) {
      throw error
    }
  }
}

export const companyService = new CompanyService()
