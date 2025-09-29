// types/auth.ts
export interface LoginCredentials {
  email: string
  password: string
}

// API Response que puede venir en diferentes formatos
export interface ApiResponse<T = any> {
  data?: T
  status?: number | string
  message?: string
  success?: boolean
  [key: string]: any // Permitir propiedades adicionales
}

export interface LoginResponse {
  status: string
  message: string
  data?: {
    requires_2fa?: boolean
    user_id?: number
    email_masked?: string
    verification_token?: string
    user?: UserData
    token?: string
  }
  [key: string]: any // Permitir propiedades adicionales flexibles
}

export interface VerificationRequest {
  code: string
  verification_token: string
}

export interface VerificationResponse {
  status: string
  message: string
  data?: {
    user?: UserData
    token?: string
  }
  [key: string]: any // Permitir propiedades adicionales
}

export interface UserData {
  id: number
  email: string
  name: string
  email_verified_at?: string
  created_at?: string
  updated_at?: string
  avatar?: string
  roles?: Array<{
    id: number
    name: string
    guard_name: string
    permissions: string[]
    created_at: string
    updated_at: string
  }>
  permissions?: string[]
  all_permissions?: string[]
}

export interface AuthState {
  // Authentication status
  isAuthenticated: boolean
  isLoading: boolean

  // User data
  user: UserData | null

  // Tokens
  accessToken: string | null
  refreshToken: string | null

  // Two-factor authentication
  requiresVerification: boolean
  verificationToken: string | null
  changePasswordRequired: boolean

  // Error handling
  error: string | null

  // Login flow
  loginStep: 'credentials' | 'verification' | 'completed'
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}
