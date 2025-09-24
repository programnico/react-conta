// features/auth/hooks/useAuth.ts
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { usePermissions } from '@/providers/PermissionsProvider'
import { loginAsync, logoutAsync, verifyCodeAsync } from '@/store/slices/authSlice'
import { ROUTES } from '@/config/routes'
import { Permission } from '@/config/permissions'
import type { LoginCredentials, VerificationRequest } from '@/types/auth'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const authState = useAppSelector(state => state.auth)
  const permissions = usePermissions()

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      const result = await dispatch(loginAsync(credentials)).unwrap()

      if (result.requiresVerification) {
        console.log('✅ Login successful, verification required')
        return { success: true, requiresVerification: true }
      } else {
        console.log('✅ Login successful, redirecting to dashboard')
        router.replace(ROUTES.PROTECTED.DASHBOARD)
        return { success: true, requiresVerification: false }
      }
    } catch (error: any) {
      console.error('❌ Login failed:', error)
      return {
        success: false,
        error: error.message || 'Error al iniciar sesión'
      }
    }
  }

  // Verify 2FA code function
  const verifyCode = async (verificationData: VerificationRequest) => {
    try {
      const result = await dispatch(verifyCodeAsync(verificationData)).unwrap()
      console.log('✅ Verification successful, redirecting to dashboard')
      router.replace(ROUTES.PROTECTED.DASHBOARD)
      return { success: true }
    } catch (error: any) {
      console.error('❌ Verification failed:', error)
      return {
        success: false,
        error: error.message || 'Código de verificación incorrecto'
      }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await dispatch(logoutAsync()).unwrap()
      router.replace(ROUTES.PUBLIC.LOGIN)
      return { success: true }
    } catch (error: any) {
      console.error('❌ Logout failed:', error)
      // Even if logout fails on server, clear local state
      router.replace(ROUTES.PUBLIC.LOGIN)
      return { success: true }
    }
  }

  // Clear error function
  const clearError = () => {
    // Dispatch clear error action if available
    if (dispatch && typeof dispatch === 'function') {
      try {
        // This assumes you have a clearError action in your auth slice
        dispatch({ type: 'auth/clearError' })
      } catch (error) {
        console.log('No clearError action available')
      }
    }
  }

  // Check if user has specific permission
  const hasPermission = (permission: Permission): boolean => {
    return permissions.hasPermission(permission)
  }

  // Check if user can access route
  const canAccessRoute = (routePath: string): boolean => {
    // This would be implemented based on route configuration
    // For now, just check if authenticated for protected routes
    if (routePath.startsWith('/login') || routePath.startsWith('/register')) {
      return true
    }
    return authState.isAuthenticated
  }

  // Redirect to appropriate page based on auth state
  const redirectBasedOnAuth = () => {
    if (authState.isAuthenticated) {
      router.replace(ROUTES.PROTECTED.DASHBOARD)
    } else {
      router.replace(ROUTES.PUBLIC.LOGIN)
    }
  }

  return {
    // Auth state
    ...authState,

    // Permissions
    userPermissions: permissions.permissions,
    userRole: permissions.userRole,

    // Auth actions
    login,
    logout,
    verifyCode,
    clearError,

    // Permission helpers
    hasPermission,
    canAccessRoute,
    redirectBasedOnAuth,

    // Convenience flags
    isLoggedIn: authState.isAuthenticated,
    needsVerification: authState.requiresVerification,
    hasError: !!authState.error
  }
}
