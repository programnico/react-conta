// services/authService.ts
import { api, ApiErrorClass } from '@/utils/api'
import type { LoginCredentials, LoginResponse, VerificationRequest, VerificationResponse } from '@/types/auth'

export class AuthService {
  /**
   * Authenticate user with credentials
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('🔐 Starting login process for:', credentials.identity)
      console.log('🔗 About to call API with endpoint: /authentication')
      console.log('📦 Data to send:', {
        identity: credentials.identity.trim(),
        password: '***hidden***'
      })

      const response = await api.postFormData<LoginResponse>('/authentication', {
        identity: credentials.identity.trim(),
        password: credentials.password
      })

      console.log('🔐 Login response received:', response)
      console.log('🔍 Response type:', typeof response)
      console.log('🔍 Response keys:', response ? Object.keys(response) : 'no keys')

      // Validate response structure - check for different possible structures
      console.log('🧪 Validating response structure...')
      if (!response) {
        console.error('🔴 No response received from server')
        throw new ApiErrorClass('No response from server', 500, 'NO_RESPONSE')
      }

      if (typeof response !== 'object') {
        console.error('🔴 Response is not an object:', typeof response)
        throw new ApiErrorClass('Invalid response format', 500, 'INVALID_FORMAT')
      }

      // Check if response has token in different possible properties
      const token = response.tk || response.token || response.access_token

      if (!token) {
        console.error('🔴 Invalid response structure:', response)
        throw new ApiErrorClass('Invalid server response: missing token', 500, 'INVALID_RESPONSE')
      }

      // Normalize response to expected format
      const normalizedResponse: LoginResponse = {
        tk: token,
        message: response.message || 'Login successful',
        requiresTwoFactor: response.requiresTwoFactor || false,
        user: response.user || null
      }

      console.log('✅ Login successful, normalized response:', normalizedResponse)
      return normalizedResponse
    } catch (error) {
      console.error('🔴 Login error:', error)
      if (error instanceof ApiErrorClass) {
        throw error
      }
      throw new ApiErrorClass('Login failed', 500, 'LOGIN_ERROR')
    }
  }

  /**
   * Verify two-factor authentication code
   */
  static async verifyCode(verificationData: VerificationRequest): Promise<VerificationResponse> {
    try {
      const response = await api.postFormData<VerificationResponse>('/verify', {
        code: verificationData.code.trim(),
        tk: verificationData.tk
      })

      return response
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        throw error
      }
      throw new ApiErrorClass('Verification failed', 500, 'VERIFICATION_ERROR')
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
      const response = await api.post('/auth/refresh', {
        refresh_token: refreshToken
      })

      if (!response.access_token) {
        throw new ApiErrorClass('Invalid refresh response', 401, 'INVALID_REFRESH')
      }

      return response
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        throw error
      }
      throw new ApiErrorClass('Token refresh failed', 401, 'REFRESH_ERROR')
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
      console.warn('Logout request failed:', error)
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
