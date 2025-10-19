// shared/services/apiClient.ts
import { API_CONFIG as CONFIG, getEndpointUrl as buildEndpointUrl } from '../config/apiConfig'

export interface RequestConfig {
  endpoint: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  params?: Record<string, any>
  headers?: Record<string, string>
  useFormData?: boolean
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public errors?: Record<string, string[]> // Errores de validación
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor(config: { baseURL: string; timeout?: number }) {
    this.baseURL = config.baseURL
    this.defaultHeaders = {
      ...CONFIG.CLIENT.DEFAULT_HEADERS
    }
  }

  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const fullURL = buildEndpointUrl(endpoint)

    // Add query parameters if any
    if (params) {
      const url = new URL(fullURL, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
      return url.toString()
    }
    return fullURL
  }

  private async getToken(): Promise<string | null> {
    // Get token from Redux store
    if (typeof window !== 'undefined') {
      try {
        // Import store dynamically to avoid SSR issues
        const { store } = await import('@/store')
        const state = store.getState()
        return state.auth.accessToken
      } catch (error) {
        // Fallback to localStorage if Redux store is not available
        return localStorage.getItem(CONFIG.CLIENT.AUTH.STORAGE_KEYS.ACCESS_TOKEN)
      }
    }
    return null
  }

  async request<T>(config: RequestConfig): Promise<T> {
    const { endpoint, method = 'GET', data, params, headers = {}, useFormData = false } = config

    const token = await this.getToken()
    const url = this.buildURL(endpoint, params)

    const requestHeaders: Record<string, string> = {
      ...this.defaultHeaders,
      ...headers
    }

    if (token) {
      requestHeaders[CONFIG.CLIENT.AUTH.TOKEN_HEADER] = `${CONFIG.CLIENT.AUTH.TOKEN_PREFIX}${token}`
    }

    let body: any = undefined
    if (data) {
      if (useFormData) {
        // Check if data is already a FormData instance
        if (data instanceof FormData) {
          body = data
        } else {
          // Create FormData from object
          body = new FormData()
          Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              // Handle arrays (e.g., permissions[])
              value.forEach(item => {
                body.append(`${key}[]`, item)
              })
            } else {
              body.append(key, value)
            }
          })
        }
        // Remove Content-Type for FormData (browser will set it)
        delete requestHeaders['Content-Type']
      } else {
        body = JSON.stringify(data)
      }
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body,
        mode: 'cors',
        credentials: 'include'
      })

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        let errorCode = 'HTTP_ERROR'
        let validationErrors: Record<string, string[]> | undefined

        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
          errorCode = errorData.code || 'API_ERROR'

          // Capturar errores de validación si existen
          if (errorData.errors && typeof errorData.errors === 'object') {
            validationErrors = errorData.errors
          }
        } catch {
          // If response is not JSON, use default message
        }

        // Handle token expiration/unauthorized access (but not for auth endpoints)
        if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/verify')) {
          await this.handleUnauthorized()
        }

        throw new ApiError(response.status, errorMessage, errorCode, validationErrors)
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        return {} as T
      }

      const rawData = await response.json()

      // Handle responses that might be wrapped in a 'data' property
      if (rawData && typeof rawData === 'object' && 'data' in rawData) {
        return rawData.data
      }

      return rawData
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      throw new ApiError(0, error instanceof Error ? error.message : 'Network error occurred', 'NETWORK_ERROR')
    }
  }

  // Convenience methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>({ endpoint, method: 'GET', params })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>({ endpoint, method: 'POST', data })
  }

  async postFormData<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>({
      endpoint,
      method: 'POST',
      data,
      useFormData: true
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>({ endpoint, method: 'PUT', data })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>({ endpoint, method: 'DELETE' })
  }

  /**
   * Handle unauthorized responses (401)
   * Attempts token refresh or forces logout
   */
  private async handleUnauthorized(): Promise<void> {
    if (typeof window === 'undefined') return // Skip on server-side

    try {
      // Import store and authSlice dynamically to avoid circular dependencies
      const [{ store }, { resetAuth }] = await Promise.all([import('@/store'), import('@/shared/store/authSlice')])

      const state = store.getState()
      const refreshToken = state.auth.refreshToken

      // Try to refresh token if available
      if (refreshToken) {
        try {
          const { AuthService } = await import('@/shared/services/authService')
          const refreshResult = await AuthService.refreshToken(refreshToken)

          // Update tokens in store
          const { setTokens } = await import('@/shared/store/authSlice')
          store.dispatch(
            setTokens({
              accessToken: refreshResult.access_token,
              refreshToken: refreshResult.refresh_token || refreshToken
            })
          )

          return // Token refreshed successfully
        } catch (refreshError) {
          // Refresh failed, continue to logout
        }
      }

      // Clear auth state and redirect to login
      store.dispatch(resetAuth())

      // Clear localStorage as fallback
      localStorage.removeItem(CONFIG.CLIENT.AUTH.STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(CONFIG.CLIENT.AUTH.STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(CONFIG.CLIENT.AUTH.STORAGE_KEYS.USER_DATA)

      // Redirect to login only if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?reason=session_expired'
      }
    } catch (error) {
      // Fallback: force reload to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?reason=error'
      }
    }
  }
}

// Re-export configuration for backward compatibility
export { API_CONFIG } from '../config/apiConfig'
export { getEndpointUrl } from '../config/apiConfig'

// Create default API client instance
export const apiClient = new ApiClient({
  baseURL: CONFIG.BASE_URL,
  timeout: CONFIG.CLIENT.TIMEOUT
})
