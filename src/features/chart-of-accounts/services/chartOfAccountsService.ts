// features/chart-of-accounts/services/chartOfAccountsService.ts
import { apiClient, API_CONFIG } from '@/shared/services/apiClient'
import type {
  ChartOfAccount,
  ChartOfAccountsApiResponse,
  ChartOfAccountsApiClientResponse,
  CreateChartOfAccountRequest,
  GetChartOfAccountsParams
} from '../types'

class ChartOfAccountsService {
  // Using centralized API_CONFIG endpoints

  /**
   * Get all chart of accounts with pagination and filters
   */
  async getAll(params: GetChartOfAccountsParams = {}): Promise<ChartOfAccountsApiClientResponse> {
    try {
      const queryParams = new URLSearchParams()

      // Add pagination params
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.per_page) queryParams.append('per_page', params.per_page.toString())

      // Add filter params
      if (params.search) queryParams.append('search', params.search)
      if (params.account_type) queryParams.append('account_type', params.account_type)
      if (params.level) queryParams.append('level', params.level.toString())
      if (params.is_active !== undefined) queryParams.append('is_active', params.is_active ? '1' : '0')
      if (params.parent_account_id) queryParams.append('parent_account_id', params.parent_account_id.toString())

      const endpoint = queryParams.toString()
        ? `${API_CONFIG.ENDPOINTS.CHART_OF_ACCOUNTS.LIST}?${queryParams.toString()}`
        : API_CONFIG.ENDPOINTS.CHART_OF_ACCOUNTS.LIST

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
   * Create a new chart of account
   */
  async create(data: CreateChartOfAccountRequest): Promise<ChartOfAccount> {
    try {
      const payload = {
        account_code: data.account_code,
        account_name: data.account_name,
        account_type: data.account_type,
        level: data.level,
        is_active: data.is_active ? 1 : 0,
        description: data.description || ''
      }

      const response = await apiClient.request<ChartOfAccount>({
        endpoint: API_CONFIG.ENDPOINTS.CHART_OF_ACCOUNTS.SAVE,
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
   * Update an existing chart of account
   */
  async update(id: number, data: CreateChartOfAccountRequest): Promise<ChartOfAccount> {
    try {
      const payload = {
        id: id,
        account_code: data.account_code,
        account_name: data.account_name,
        account_type: data.account_type,
        level: data.level,
        is_active: data.is_active ? 1 : 0,
        description: data.description || ''
      }

      const response = await apiClient.request<ChartOfAccount>({
        endpoint: API_CONFIG.ENDPOINTS.CHART_OF_ACCOUNTS.SAVE,
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
   * Delete a chart of account
   */
  async delete(id: number): Promise<void> {
    try {
      await apiClient.request<void>({
        endpoint: `${API_CONFIG.ENDPOINTS.CHART_OF_ACCOUNTS.DELETE}/${id}`,
        method: 'DELETE'
      })
    } catch (error) {
      throw error
    }
  }

  /**
   * Search chart of accounts by query
   */
  async search(query: string, filters: any = {}): Promise<ChartOfAccountsApiClientResponse> {
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
   * Get a single chart of account by ID
   */
  async getById(id: number): Promise<ChartOfAccount> {
    try {
      const response = await apiClient.request<ChartOfAccount>({
        endpoint: `${API_CONFIG.ENDPOINTS.CHART_OF_ACCOUNTS.DETAIL}/${id}`,
        method: 'GET'
      })
      return response
    } catch (error) {
      throw error
    }
  }
}

export const chartOfAccountsService = new ChartOfAccountsService()
