// hooks/useAuth.ts
import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from './redux'
import {
  loginAsync,
  verifyCodeAsync,
  logoutAsync,
  refreshTokenAsync,
  getUserProfileAsync,
  clearError,
  resetAuth,
  selectAuth,
  selectIsAuthenticated,
  selectUser,
  selectIsLoading,
  selectError,
  selectLoginStep,
  selectRequiresVerification,
  selectChangePasswordRequired
} from '@/shared/store/authSlice'
import type { LoginCredentials, VerificationRequest } from '@/shared/types/auth'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()

  // Selectors
  const auth = useAppSelector(selectAuth)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectUser)
  const isLoading = useAppSelector(selectIsLoading)
  const error = useAppSelector(selectError)
  const loginStep = useAppSelector(selectLoginStep)
  const requiresVerification = useAppSelector(selectRequiresVerification)
  const changePasswordRequired = useAppSelector(selectChangePasswordRequired)

  // Actions
  const login = useCallback(
    (credentials: LoginCredentials) => {
      return dispatch(loginAsync(credentials))
    },
    [dispatch]
  )

  const verifyCode = useCallback(
    (verificationData: VerificationRequest) => {
      return dispatch(verifyCodeAsync(verificationData))
    },
    [dispatch]
  )

  const logout = useCallback(async () => {
    await dispatch(logoutAsync())
    router.push('/login')
  }, [dispatch, router])

  const refreshToken = useCallback(() => {
    if (auth.refreshToken) {
      return dispatch(refreshTokenAsync(auth.refreshToken))
    }
    return Promise.reject(new Error('No refresh token available'))
  }, [dispatch, auth.refreshToken])

  const getUserProfile = useCallback(() => {
    return dispatch(getUserProfileAsync())
  }, [dispatch])

  const clearAuthError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  const resetAuthState = useCallback(() => {
    dispatch(resetAuth())
  }, [dispatch])

  // Auto-refresh token logic
  useEffect(() => {
    if (!isAuthenticated || !auth.accessToken) {
      return
    }

    // Set up token refresh interval (15 minutes)
    const refreshInterval = setInterval(
      () => {
        if (auth.refreshToken) {
          refreshToken().catch(() => {
            // If refresh fails, logout user
            logout()
          })
        }
      },
      15 * 60 * 1000
    ) // 15 minutes

    return () => clearInterval(refreshInterval)
  }, [isAuthenticated, auth.accessToken, auth.refreshToken, refreshToken, logout])

  // Redirect logic
  const redirectToLogin = useCallback(() => {
    router.push('/login')
  }, [router])

  const redirectToDashboard = useCallback(() => {
    router.push('/')
  }, [router])

  // Check if user needs to change password
  const needsPasswordChange = changePasswordRequired

  return {
    // State
    isAuthenticated,
    user,
    isLoading,
    error,
    loginStep,
    requiresVerification,
    needsPasswordChange,
    auth,

    // Actions
    login,
    verifyCode,
    logout,
    refreshToken,
    getUserProfile,
    clearAuthError,
    resetAuthState,

    // Navigation
    redirectToLogin,
    redirectToDashboard
  }
}

export default useAuth
