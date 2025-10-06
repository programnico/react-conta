'use client'

// features/auth/hooks/useAuth.ts
import { useAppSelector, useAppDispatch } from '@/shared/hooks/redux'
import { useRouter } from 'next/navigation'
import { logoutAsync } from '@/shared/store/authSlice'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAppSelector(state => state.auth)

  const handleLogout = () => {
    dispatch(logoutAsync())
    router.push('/login')
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    userRole: user?.roles?.[0]?.name || 'guest',
    userPermissions: user?.permissions || [],
    logout: handleLogout
  }
}
