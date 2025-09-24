// services/authService.ts
import { apiClient, ApiError as ApiErrorClass, API_CONFIG } from '@/shared/services/apiClient'
import type { LoginCredentials, LoginResponse, VerificationRequest, VerificationResponse } from '@/shared/types/auth'

export class AuthService {
  /**
   * Authenticate user with credentials
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.postFormData<LoginResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        identity: credentials.identity.trim(),
        password: credentials.password
      })

      // Validate response structure - check for different possible structures
      if (!response) {
        console.error('🔴 No response received from server')
        throw new ApiErrorClass(500, 'No response from server', 'NO_RESPONSE')
      }

      if (typeof response !== 'object') {
        console.error('🔴 Response is not an object:', typeof response)
        throw new ApiErrorClass(500, 'Invalid response format', 'INVALID_FORMAT')
      }

      // Check if response has token in different possible properties
      const token = response.tk || response.token || response.access_token

      if (!token) {
        console.error('🔴 Invalid response structure:', response)
        throw new ApiErrorClass(500, 'Invalid server response: missing token', 'INVALID_RESPONSE')
      }

      // Normalize response to expected format
      const normalizedResponse: LoginResponse = {
        tk: token,
        message: response.message || 'Login successful',
        requiresTwoFactor: response.requiresTwoFactor || false,
        user: response.user || null
      }

      return normalizedResponse
    } catch (error) {
      console.error('🔴 Login error:', error)
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
        tk: verificationData.tk
      })

      return response
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
      const response = await apiClient.post('/auth/refresh', {
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
      await api.post('/auth/logout', {}, accessToken)
    } catch (error) {
      // Logout errors are not critical, we'll proceed anyway
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(accessToken: string): Promise<any> {
    try {
      const response = await api.get('/auth/profile', accessToken)
      return response
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        throw error
      }
      throw new ApiErrorClass('Failed to fetch user profile', 500, 'PROFILE_ERROR')
    }
  }

  /**
   * Change password
   */
  static async changePassword(currentPassword: string, newPassword: string, accessToken: string): Promise<void> {
    try {
      await api.post(
        '/auth/change-password',
        {
          current_password: currentPassword,
          new_password: newPassword
        },
        accessToken
      )
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        throw error
      }
      throw new ApiErrorClass('Password change failed', 500, 'PASSWORD_CHANGE_ERROR')
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(identity: string): Promise<void> {
    try {
      await api.post('/auth/password-reset-request', {
        identity: identity.trim()
      })
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        throw error
      }
      throw new ApiErrorClass('Password reset request failed', 500, 'PASSWORD_RESET_ERROR')
    }
  }

  /**
   * Validate token
   */
  static async validateToken(token: string): Promise<boolean> {
    try {
      await api.get('/auth/validate', token)
      return true
    } catch (error) {
      return false
    }
  }
}

export default AuthService
