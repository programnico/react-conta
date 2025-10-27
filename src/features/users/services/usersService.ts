import { CreateUserData, UpdateUserData, UsersResponse, User } from '../types'
import { apiClient, API_CONFIG } from '@/shared/services/apiClient'

interface GetUsersParams {
  page?: number
  per_page?: number
  search?: string
  role?: string
}

class UsersService {
  async getUsers(params: GetUsersParams = {}): Promise<UsersResponse> {
    const queryParams = new URLSearchParams()

    if (params.page) queryParams.append('page', params.page.toString())
    if (params.per_page) queryParams.append('per_page', params.per_page.toString())
    if (params.search) queryParams.append('search', params.search)
    if (params.role) queryParams.append('role', params.role)

    const endpoint = queryParams.toString()
      ? `${API_CONFIG.ENDPOINTS.USERS.LIST}?${queryParams.toString()}`
      : API_CONFIG.ENDPOINTS.USERS.LIST

    // Hacer la petición directamente con fetch para mantener la estructura completa
    const token = await this.getAuthToken()

    // Construir la URL correctamente
    let url: string
    if (API_CONFIG.BASE_URL) {
      url = `${API_CONFIG.BASE_URL}${endpoint}`
    } else {
      // En desarrollo, usar proxy
      url = `/api${endpoint}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    return result
  }

  private async getAuthToken(): Promise<string | null> {
    if (typeof window !== 'undefined') {
      try {
        // Import store dynamically to avoid SSR issues
        const { store } = await import('@/store')
        const state = store.getState()
        return state.auth.accessToken
      } catch (error) {
        // Fallback to localStorage if Redux store is not available
        return localStorage.getItem('accessToken')
      }
    }
    return null
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const payload = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role
    }

    return await apiClient.request<User>({
      endpoint: API_CONFIG.ENDPOINTS.USERS.SAVE,
      method: 'POST',
      data: payload,
      useFormData: true
    })
  }

  async updateUser(userData: UpdateUserData): Promise<User> {
    const payload = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      ...(userData.password && { password: userData.password })
    }

    return await apiClient.request<User>({
      endpoint: API_CONFIG.ENDPOINTS.USERS.SAVE,
      method: 'POST',
      data: payload,
      useFormData: true
    })
  }

  async deleteUser(userId: number): Promise<void> {
    await apiClient.request<void>({
      endpoint: `${API_CONFIG.ENDPOINTS.USERS.DELETE}/${userId}`,
      method: 'DELETE'
    })
  }

  async getUserById(id: number): Promise<User> {
    return await apiClient.request<User>({
      endpoint: `${API_CONFIG.ENDPOINTS.USERS.DETAIL}/${id}`,
      method: 'GET'
    })
  }

  async searchUsers(query: string, filters: Omit<GetUsersParams, 'search'> = {}): Promise<UsersResponse> {
    const params = {
      search: query,
      ...filters
    }
    return await this.getUsers(params)
  }
}

export const usersService = new UsersService()
