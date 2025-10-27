// shared/config/apiConfig.ts
// Centralized API configuration for the application

/**
 * Environment detection
 */
const isDevelopment = process.env.NODE_ENV === 'development'
const isClient = typeof window !== 'undefined'

/**
 * API Base URLs configuration
 * Note: These URLs should already include /api in the path as per standard
 * Example: https://api.tudominio.com/api
 */
export const API_BASE_URLS = {
  // Development: Use proxy (empty string) to leverage Next.js rewrites
  DEVELOPMENT: '',

  // Production: Use environment variable or default (includes /api)
  PRODUCTION: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api',

  // Alternative environments (should include /api)
  STAGING: process.env.NEXT_PUBLIC_API_BASE_URL_STAGING || 'http://staging-api.example.com/api',
  TESTING: process.env.NEXT_PUBLIC_API_BASE_URL_TEST || 'http://test-api.example.com/api'
}

/**
 * Get the appropriate base URL based on environment
 */
export const getApiBaseUrl = (): string => {
  if (isDevelopment && isClient) {
    return API_BASE_URLS.DEVELOPMENT
  }

  // Check for specific environment override
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT
  switch (environment) {
    case 'staging':
      return API_BASE_URLS.STAGING
    case 'testing':
      return API_BASE_URLS.TESTING
    default:
      return API_BASE_URLS.PRODUCTION
  }
}

/**
 * API Endpoints configuration
 * Organized by feature/module for better maintainability
 */
export const API_ENDPOINTS = {
  /**
   * Authentication endpoints
   */
  AUTH: {
    LOGIN: '/auth/login',
    VERIFY: '/auth/verify-2fa',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    PASSWORD_RESET_REQUEST: '/auth/password-reset-request',
    ME: '/auth/me'
  },

  /**
   * Admin/Role management endpoints
   */
  ADMIN: {
    ROLES: '/roles',
    ROLES_SAVE: '/roles/save',
    PERMISSIONS: '/permissions'
  },

  /**
   * Purchase management endpoints
   */
  PURCHASE: {
    LIST: '/purchases',
    SAVE: '/purchases/save',
    DELETE: '/purchases',
    SUPPLIERS: '/suppliers-all'
  },

  /**
   * Supplier management endpoints
   */
  SUPPLIERS: {
    LIST: '/suppliers',
    SAVE: '/suppliers/save',
    UPDATE: '/suppliers',
    DELETE: '/suppliers',
    DETAIL: '/suppliers'
  },

  /**
   * Product management endpoints
   */
  PRODUCTS: {
    LIST: '/products',
    SAVE: '/products/save',
    DELETE: '/products',
    DETAIL: '/products'
  },

  /**
   * Chart of Accounts endpoints
   */
  CHART_OF_ACCOUNTS: {
    LIST: '/chart-of-accounts',
    SAVE: '/chart-of-accounts/save',
    DELETE: '/chart-of-accounts',
    DETAIL: '/chart-of-accounts'
  },

  /**
   * User management endpoints
   */
  USERS: {
    LIST: '/users',
    SAVE: '/users/save',
    DELETE: '/users',
    DETAIL: '/users'
  }
}

/**
 * API Client configuration
 */
export const API_CLIENT_CONFIG = {
  // Request timeout in milliseconds
  TIMEOUT: 30000,

  // Default headers for all requests
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },

  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY_MS: 1000
  },

  // Auth configuration
  AUTH: {
    TOKEN_HEADER: 'Authorization',
    TOKEN_PREFIX: 'Bearer ',
    STORAGE_KEYS: {
      ACCESS_TOKEN: 'accessToken',
      REFRESH_TOKEN: 'refreshToken',
      USER_DATA: 'userData'
    }
  }
}

/**
 * Main API Configuration object
 * Combines all configuration pieces
 */
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  ENDPOINTS: API_ENDPOINTS,
  CLIENT: API_CLIENT_CONFIG
} as const

/**
 * Helper function to build full endpoint URLs
 * @param endpoint - The endpoint path (e.g., '/chart-of-accounts')
 * @returns Full URL for the endpoint
 */
export const getEndpointUrl = (endpoint: string): string => {
  if (isDevelopment && isClient) {
    // In development, use proxy which adds /api automatically
    return `/api${endpoint}`
  }
  // In production, BASE_URL already includes /api
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

/**
 * Helper function to get endpoint by path
 * Useful for dynamic endpoint resolution
 * @param path - Dot notation path (e.g., 'CHART_OF_ACCOUNTS.LIST')
 * @returns The endpoint string
 */
export const getEndpointByPath = (path: string): string => {
  const keys = path.split('.')
  let current: any = API_ENDPOINTS

  for (const key of keys) {
    current = current[key]
    if (!current) {
      throw new Error(`Endpoint path "${path}" not found in API_ENDPOINTS`)
    }
  }

  return current
}

/**
 * Development/Debug helpers
 */
export const API_DEBUG = {
  LOG_REQUESTS: process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_API_DEBUG === 'true',
  LOG_RESPONSES: process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_API_DEBUG === 'true',
  LOG_ERRORS: true
}
