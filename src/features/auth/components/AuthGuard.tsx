// features/auth/components/AuthGuard.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/hooks/redux'
import { usePermissions, ProtectedRoute } from '@/providers/PermissionsProvider'
import { Permission } from '@/config/permissions'
import { ROUTES } from '@/config/routes'

// MUI Imports
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  permissions?: Permission[]
  requireAll?: boolean
  redirectTo?: string
}

const AuthGuard = ({
  children,
  fallback,
  permissions = [],
  requireAll = false,
  redirectTo = ROUTES.PUBLIC.LOGIN
}: AuthGuardProps) => {
  const { isAuthenticated, isLoading, user } = useAppSelector(state => state.auth)
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      // Wait a bit for hydration
      await new Promise(resolve => setTimeout(resolve, 100))

      if (!isLoading && !isAuthenticated) {
        console.log('🔒 User not authenticated, redirecting to login...')
        router.replace(redirectTo)
        return
      }

      setIsChecking(false)
    }

    checkAuth()
  }, [isAuthenticated, isLoading, router, redirectTo])

  // Show loading while checking auth
  if (isChecking || isLoading) {
    return (
      fallback || (
        <Box
          display='flex'
          flexDirection='column'
          justifyContent='center'
          alignItems='center'
          minHeight='100vh'
          gap={2}
        >
          <CircularProgress size={48} />
          <Typography variant='body1' color='text.secondary'>
            Verificando autenticación...
          </Typography>
        </Box>
      )
    )
  }

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null
  }

  // If no specific permissions required, show content
  if (permissions.length === 0) {
    return <>{children}</>
  }

  // Check permissions and wrap with ProtectedRoute
  const NoPermissionFallback = (
    <Box
      display='flex'
      flexDirection='column'
      justifyContent='center'
      alignItems='center'
      minHeight='50vh'
      gap={3}
      p={4}
    >
      <Alert severity='warning' sx={{ width: '100%', maxWidth: 500 }}>
        <Typography variant='h6' gutterBottom>
          Acceso Restringido
        </Typography>
        <Typography variant='body2'>No tienes los permisos necesarios para acceder a esta página.</Typography>
      </Alert>
      <Button variant='outlined' onClick={() => router.back()}>
        Volver
      </Button>
    </Box>
  )

  return (
    <ProtectedRoute permissions={permissions} requireAll={requireAll} fallback={NoPermissionFallback}>
      {children}
    </ProtectedRoute>
  )
}

export default AuthGuard
