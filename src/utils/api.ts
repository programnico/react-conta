// utils/api.ts
import type { ApiError } from '@/types/auth'

// Global API configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
  ENDPOINTS: {
    AUTH: {
      BASE: '/auth',
      LOGIN: '/auth/authentication',
      VERIFY: '/auth/verify'
    },
    PEI: {
      UNIT_MERGE: '/pei/unit-merge'
    }
  }
}

// Get base API URL
export const getApiUrl = () => {
  return API_CONFIG.BASE_URL
}

// Get full endpoint URL
export const getEndpointUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Legacy support
export const getServerApiUrl = () => {
  return API_CONFIG.BASE_URL
}

// Custom error class for API errors
export class ApiErrorClass extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Request configuration interface
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  token?: string
  useFormData?: boolean // Nueva opción para FormData
  includeCredentials?: boolean // Nueva opción para controlar credentials
}

// Enhanced API client with error handling and security
export const apiClient = async <T = any>(endpoint: string, config: RequestConfig = {}): Promise<T> => {
  const apiUrl = getApiUrl()
  const url = `${apiUrl}${endpoint}`

  const { method = 'GET', headers = {}, body, token, useFormData = false, includeCredentials = false } = config

  // Default headers with security best practices
  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest' // CSRF protection
  }

  // Solo agregar Content-Type si no es FormData
  if (!useFormData) {
    defaultHeaders['Content-Type'] = 'application/json'
  }

  // Add authorization header if token provided
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  const requestConfig: RequestInit = {
    method,
    headers: { ...defaultHeaders, ...headers }
  }

  // Solo incluir credentials si se especifica explícitamente
  if (includeCredentials) {
    requestConfig.credentials = 'include'
  }

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    if (useFormData) {
      // Crear FormData
      const formData = new FormData()
      Object.keys(body).forEach(key => {
        formData.append(key, body[key])
      })
      requestConfig.body = formData
    } else {
      requestConfig.body = JSON.stringify(body)
    }
  }

  try {
    const response = await fetch(url, requestConfig)

    // Handle different response statuses
    if (!response.ok) {
      let errorMessage = 'Network error occurred'
      let errorCode = 'NETWORK_ERROR'

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
        errorCode = errorData.code || 'API_ERROR'
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage
      }

      throw new ApiErrorClass(errorMessage, response.status, errorCode)
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return {} as T
    }

    const rawData = await response.json()

    // Handle responses that might be wrapped in a 'data' property
    // or responses that come directly as the data
    let processedData = rawData

    // Si la respuesta tiene una propiedad 'data', usar esa
    if (rawData && typeof rawData === 'object' && 'data' in rawData) {
      processedData = rawData.data
    }

    // Si la respuesta tiene status y data separados (formato común de APIs)
    if (rawData && typeof rawData === 'object' && 'status' in rawData && 'data' in rawData) {
      processedData = rawData.data
    }
    return processedData
  } catch (error) {
    // Re-throw API errors
    if (error instanceof ApiErrorClass) {
      throw error
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw new ApiErrorClass('Connection failed. Please check your internet connection.', 0, 'NETWORK_ERROR')
    }

    // Handle other errors
    throw new ApiErrorClass('An unexpected error occurred', 500, 'UNKNOWN_ERROR')
  }
}

// Specialized methods for common operations
export const api = {
  get: <T = any>(endpoint: string, token?: string) => apiClient<T>(endpoint, { method: 'GET', token }),

  post: <T = any>(endpoint: string, body?: any, token?: string) =>
    apiClient<T>(endpoint, { method: 'POST', body, token }),

  // Método POST con FormData
  postFormData: <T = any>(endpoint: string, body?: any, token?: string) =>
    apiClient<T>(endpoint, { method: 'POST', body, token, useFormData: true }),

  put: <T = any>(endpoint: string, body?: any, token?: string) =>
    apiClient<T>(endpoint, { method: 'PUT', body, token }),

  delete: <T = any>(endpoint: string, token?: string) => apiClient<T>(endpoint, { method: 'DELETE', token }),

  patch: <T = any>(endpoint: string, body?: any, token?: string) =>
    apiClient<T>(endpoint, { method: 'PATCH', body, token })
}

// Legacy function for backward compatibility
export const fetchFromApi = async (endpoint: string) => {
  return api.get(endpoint)
}
