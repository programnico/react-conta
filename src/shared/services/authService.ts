// services/authService.ts
import { apiClient, ApiError as ApiErrorClass, API_CONFIG } from '@/shared/services/apiClient'
import type { LoginCredentials, LoginResponse, VerificationRequest, VerificationResponse } from '@/shared/types/auth'

class AuthService {
  /**
   * Authenticate user with credentials
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.postFormData<LoginResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        email: credentials.email.trim(),
        password: credentials.password
      })

      // Validate response structure
      if (!response) {
        throw new ApiErrorClass(500, 'No response from server', 'NO_RESPONSE')
      }

      if (typeof response !== 'object') {
        throw new ApiErrorClass(500, 'Invalid response format', 'INVALID_FORMAT')
      }

      // Detectar si la respuesta tiene la estructura nueva con status/data o la estructura directa
      let normalizedResponse: LoginResponse
      const responseData = response as any // Usar any para manejar estructuras flexibles

      if ('status' in responseData && responseData.status && 'data' in responseData) {
        // Estructura nueva con status y data wrapper
        if (responseData.status === 'error') {
          const errorMessage = responseData.message || 'Credenciales incorrectas'
          throw new ApiErrorClass(401, errorMessage, 'INVALID_CREDENTIALS')
        }

        if (responseData.status !== 'success') {
          throw new ApiErrorClass(500, 'Unexpected response status', 'INVALID_STATUS')
        }

        normalizedResponse = responseData
      } else if ('requires_2fa' in responseData || 'user' in responseData || 'token' in responseData) {
        // Estructura directa (respuesta actual del servidor)
        if ('requires_2fa' in responseData) {
          // Es respuesta de 2FA requerido
          normalizedResponse = {
            status: 'success',
            message: responseData.message || 'Verificación de dos factores requerida',
            data: {
              requires_2fa: responseData.requires_2fa,
              user_id: responseData.user_id,
              email_masked: responseData.email_masked,
              verification_token: responseData.verification_token
            }
          }
        } else if ('user' in responseData && 'token' in responseData) {
          // Es respuesta de login directo exitoso
          normalizedResponse = {
            status: 'success',
            message: responseData.message || 'Inicio de sesión exitoso',
            data: {
              user: responseData.user,
              token: responseData.token
            }
          }
        } else {
          throw new ApiErrorClass(500, 'Unknown response structure', 'UNKNOWN_STRUCTURE')
        }
      } else {
        throw new ApiErrorClass(500, 'Invalid response structure', 'INVALID_STRUCTURE')
      }

      return normalizedResponse
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        throw error
      }
      throw new ApiErrorClass(500, 'Login failed', 'LOGIN_ERROR')
    }
  }

  /**
   * Verify two-factor authentication code
   */
  static async verifyCode(verificationData: VerificationRequest): Promise<VerificationResponse> {
    try {
      const response = await apiClient.postFormData<VerificationResponse>(API_CONFIG.ENDPOINTS.AUTH.VERIFY, {
        code: verificationData.code.trim(),
        verification_token: verificationData.verification_token
      })

      // Validate response structure
      if (!response) {
        throw new ApiErrorClass(500, 'No response from server', 'NO_RESPONSE')
      }

      // Detectar estructura de respuesta flexible
      let normalizedResponse: VerificationResponse
      const responseData = response as any

      if ('status' in responseData && responseData.status && 'data' in responseData) {
        // Estructura nueva con status y data wrapper
        if (responseData.status === 'error') {
          const errorMessage = responseData.message || 'Código de verificación inválido'
          throw new ApiErrorClass(401, errorMessage, 'INVALID_VERIFICATION_CODE')
        }

        if (responseData.status !== 'success') {
          throw new ApiErrorClass(500, 'Unexpected response status', 'INVALID_STATUS')
        }

        normalizedResponse = responseData
      } else if ('user' in responseData && 'token' in responseData) {
        // Estructura directa (respuesta actual del servidor)
        normalizedResponse = {
          status: 'success',
          message: responseData.message || 'Autenticación de dos factores completada exitosamente',
          data: {
            user: responseData.user,
            token: responseData.token
          }
        }
      } else {
        throw new ApiErrorClass(500, 'Invalid response structure', 'INVALID_STRUCTURE')
      }

      return normalizedResponse
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        throw error
      }
      throw new ApiErrorClass(500, 'Verification failed', 'VERIFICATION_ERROR')
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<{
    access_token: string
    refresh_token?: string
  }> {
    try {
      const response = await apiClient.post<{
        access_token: string
        refresh_token?: string
      }>('/auth/refresh', {
        refresh_token: refreshToken
      })

      if (!response.access_token) {
        throw new ApiErrorClass(401, 'Invalid refresh response', 'INVALID_REFRESH')
      }

      return response
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        throw error
      }
      throw new ApiErrorClass(401, 'Token refresh failed', 'REFRESH_ERROR')
    }
  }

  /**
   * Logout user
   */
  static async logout(accessToken: string): Promise<void> {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {})
    } catch (error) {
      // Logout errors are not critical, we'll proceed anyway
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(accessToken: string): Promise<any> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE)
      return response
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        throw error
      }
      throw new ApiErrorClass(500, 'Failed to fetch user profile', 'PROFILE_ERROR')
    }
  }

  /**
   * Change password
   */
  static async changePassword(currentPassword: string, newPassword: string, accessToken: string): Promise<void> {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        current_password: currentPassword,
        new_password: newPassword
      })
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        throw error
      }
      throw new ApiErrorClass(500, 'Password change failed', 'PASSWORD_CHANGE_ERROR')
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(identity: string): Promise<void> {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.PASSWORD_RESET_REQUEST, {
        identity: identity.trim()
      })
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        throw error
      }
      throw new ApiErrorClass(500, 'Password reset request failed', 'PASSWORD_RESET_ERROR')
    }
  }

  /**
   * Validate token with server using profile endpoint
   */
  static async validateToken(token: string): Promise<boolean> {
    try {
      // Use profile endpoint as a lightweight way to validate token
      await apiClient.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE)
      return true
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        // Log specific validation errors for debugging
        if (error.status === 401) {
          console.info('Token validation failed: token expired or invalid')
          return false
        } else if (error.status === 404) {
          // If profile endpoint doesn't exist, try me endpoint
          try {
            await apiClient.get(API_CONFIG.ENDPOINTS.AUTH.ME)
            return true
          } catch (meError) {
            if (meError instanceof ApiErrorClass && meError.status === 401) {
              return false
            }
            // For other errors, assume token is still valid to avoid unnecessary logouts
            console.warn('Token validation inconclusive, assuming valid to avoid disruption')
            return true
          }
        } else if (error.status >= 500) {
          console.warn('Token validation failed: server error, assuming token is still valid')
          return true // Don't logout user for server errors
        }
      }

      // For network errors or other issues, assume token is valid to avoid disrupting user
      console.warn('Token validation error, assuming valid:', error)
      return true
    }
  }

  /**
   * Get current user info (light validation)
   */
  static async getCurrentUser(): Promise<any> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.AUTH.ME)
      return response
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        throw error
      }
      throw new ApiErrorClass(500, 'Failed to get current user', 'USER_FETCH_ERROR')
    }
  }
}

// Named export for consistency with new architecture
export { AuthService }

// Default export for backward compatibility
export default AuthService
