import { apiClient, API_CONFIG } from '@/shared/services/apiClient'
import type {
  ChartOfAccount,
  ChartOfAccountsResponse,
  ChartOfAccountsApiResponse,
  CreateChartOfAccountRequest,
  ChartOfAccountFilters
} from '../types'

interface GetChartOfAccountsParams extends ChartOfAccountFilters {
  page?: number
  per_page?: number
}

class ChartOfAccountsService {
  async getAll(params: GetChartOfAccountsParams = {}): Promise<ChartOfAccountsApiResponse> {
    const queryParams = new URLSearchParams()

    if (params.page) queryParams.append('page', params.page.toString())
    if (params.per_page) queryParams.append('per_page', params.per_page.toString())
    if (params.search) queryParams.append('search', params.search)
    if (params.account_type) queryParams.append('account_type', params.account_type)
    if (params.level) queryParams.append('level', params.level.toString())
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active ? '1' : '0')
    if (params.parent_account_id) queryParams.append('parent_account_id', params.parent_account_id.toString())

    const endpoint = queryParams.toString()
      ? `${API_CONFIG.ENDPOINTS.CHART_OF_ACCOUNTS.LIST}?${queryParams.toString()}`
      : API_CONFIG.ENDPOINTS.CHART_OF_ACCOUNTS.LIST

    const response = await apiClient.request<ChartOfAccountsApiResponse>({
      endpoint,
      method: 'GET'
    })

    return response
  }

  async create(data: CreateChartOfAccountRequest): Promise<ChartOfAccount> {
    const payload = {
      account_code: data.account_code,
      account_name: data.account_name,
      account_type: data.account_type,
      level: data.level,
      is_active: data.is_active ? 1 : 0,
      description: data.description
    }

    return await apiClient.request<ChartOfAccount>({
      endpoint: API_CONFIG.ENDPOINTS.CHART_OF_ACCOUNTS.SAVE,
      method: 'POST',
      data: payload,
      useFormData: true
    })
  }

  async update(id: number, data: CreateChartOfAccountRequest): Promise<ChartOfAccount> {
    const payload = {
      id,
      account_code: data.account_code,
      account_name: data.account_name,
      account_type: data.account_type,
      level: data.level,
      is_active: data.is_active ? 1 : 0,
      description: data.description
    }

    return await apiClient.request<ChartOfAccount>({
      endpoint: API_CONFIG.ENDPOINTS.CHART_OF_ACCOUNTS.SAVE,
      method: 'POST',
      data: payload,
      useFormData: true
    })
  }

  async delete(id: number): Promise<void> {
    await apiClient.request<void>({
      endpoint: `${API_CONFIG.ENDPOINTS.CHART_OF_ACCOUNTS.DELETE}/${id}`,
      method: 'DELETE'
    })
  }

  async getById(id: number): Promise<ChartOfAccount> {
    return await apiClient.request<ChartOfAccount>({
      endpoint: `${API_CONFIG.ENDPOINTS.CHART_OF_ACCOUNTS.DETAIL}/${id}`,
      method: 'GET'
    })
  }

  async search(query: string, filters: ChartOfAccountFilters = {}): Promise<ChartOfAccountsApiResponse> {
    const params = {
      search: query,
      ...filters
    }
    return await this.getAll(params)
  }
}

export const chartOfAccountsService = new ChartOfAccountsService()
