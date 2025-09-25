// shared/services/apiClient.ts
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
    public code?: string
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
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  }

  private buildURL(endpoint: string, params?: Record<string, any>): string {
    // Handle relative base URLs (like /api/proxy) for development proxy
    let fullURL: string

    if (this.baseURL.startsWith('/')) {
      // Relative URL - just concatenate
      fullURL = `${this.baseURL}${endpoint}`
    } else {
      // Absolute URL - use URL constructor
      const url = new URL(endpoint, this.baseURL)
      fullURL = url.toString()
    }

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
        console.error('Error accessing Redux store for token:', error)
        // Fallback to localStorage
        return localStorage.getItem('accessToken')
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
      requestHeaders.Authorization = `Bearer ${token}`
    }

    let body: any = undefined
    if (data) {
      if (useFormData) {
        body = new FormData()
        Object.entries(data).forEach(([key, value]) => {
          body.append(key, value)
        })
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

        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
          errorCode = errorData.code || 'API_ERROR'
        } catch {
          // If response is not JSON, use default message
        }

        throw new ApiError(response.status, errorMessage, errorCode)
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
}

// API Configuration
const isDevelopment = process.env.NODE_ENV === 'development'
const isClient = typeof window !== 'undefined'

export const API_CONFIG = {
  // Use proxy in development to avoid CORS, direct URL in production
  BASE_URL: isDevelopment && isClient ? '/api' : process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',

  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/authentication',
      VERIFY: '/auth/verify',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      PROFILE: '/auth/profile'
    },
    PEI: {
      UNIT_MERGE: '/pei/unit-merge',
      PERIOD_NAME: '/pei/period-name'
    }
  }
}

// Create default API client instance
export const apiClient = new ApiClient({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000
})

// Helper to build full endpoint URLs
export const getEndpointUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}
