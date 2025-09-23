// types/auth.ts
export interface LoginCredentials {
  identity: string
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
  message?: string
  tk?: string
  token?: string // Alternativa común
  access_token?: string // Otra alternativa común
  change_password?: boolean
  requiresTwoFactor?: boolean
  user?: UserData | null
  [key: string]: any // Permitir propiedades adicionales flexibles
}

export interface VerificationRequest {
  code: string
  tk: string
}

export interface VerificationResponse {
  message?: string
  success?: boolean
  user?: UserData
  access_token?: string
  refresh_token?: string
  token?: string // Alternativa
  tk?: string // Otra alternativa
  [key: string]: any // Permitir propiedades adicionales
}

export interface UserData {
  id: string
  email: string
  name: string
  avatar?: string
  role?: string
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
