// components/auth/AuthGuard.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/shared/hooks/redux'

// MUI Imports
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'

// Import permission validation
import { usePermissions } from '@/providers/PermissionsProvider'
import type { Permission } from '@/config/permissions'

// Variable global para evitar verificaciones múltiples
let globalAuthChecked = false

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requiredPermission?: Permission
}

const AuthGuard = ({ children, fallback, requiredPermission }: AuthGuardProps) => {
  const { isAuthenticated, isLoading, user, error } = useAppSelector(state => state.auth)
  const { hasPermission } = usePermissions()
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()

  // Solo mostrar loader si es la primera vez Y no está autenticado
  const [showLoader, setShowLoader] = useState(() => {
    // Si ya está autenticado, nunca mostrar loader
    if (isAuthenticated && user) {
      globalAuthChecked = true
      return false
    }
    // Solo mostrar si no se ha verificado globalmente Y está cargando
    return !globalAuthChecked && isLoading
  })

  const mountedRef = useRef(true)

  // Efecto para limpiar el loader una vez que se autentica
  useEffect(() => {
    if (isAuthenticated && user) {
      globalAuthChecked = true
      setShowLoader(false)
    }
  }, [isAuthenticated, user])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    // Si ya está autenticado, limpiar loader y marcar como verificado
    if (isAuthenticated && user) {
      globalAuthChecked = true
      setShowLoader(false)
      return
    }

    // Si no está autenticado y no está cargando, redirigir inmediatamente
    if (!isAuthenticated && !isLoading) {
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
      router.replace(loginUrl)
      return
    }

    // Si está cargando, esperar un poco antes de redirigir
    if (isLoading) {
      const timer = setTimeout(() => {
        if (mountedRef.current && !isAuthenticated) {
          const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
          router.replace(loginUrl)
        }
      }, 2000) // Esperar máximo 2 segundos

      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, isLoading, user, router, pathname])

  // Check permissions after authentication
  useEffect(() => {
    if (isAuthenticated && user && requiredPermission && !hasPermission(requiredPermission)) {
      // Redirect to unauthorized page or dashboard
      router.replace('/dashboard?error=unauthorized')
    }
  }, [isAuthenticated, user, requiredPermission, hasPermission, router])

  // Solo mostrar loading mientras realmente esté cargando
  if (isLoading || (showLoader && !isAuthenticated)) {
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
          <CircularProgress size={40} />
          <Typography variant='body2' color='text.secondary'>
            Verificando autenticación...
          </Typography>
        </Box>
      )
    )
  }

  // Show error if authentication failed
  if (error) {
    return (
      <Box
        display='flex'
        flexDirection='column'
        justifyContent='center'
        alignItems='center'
        minHeight='100vh'
        gap={2}
        p={3}
      >
        <Alert severity='error' sx={{ maxWidth: 400 }}>
          <Typography variant='h6' gutterBottom>
            Error de Autenticación
          </Typography>
          <Typography variant='body2' gutterBottom>
            {error}
          </Typography>
          <Box mt={2}>
            <Button variant='contained' onClick={() => router.replace('/login')} size='small'>
              Volver a Login
            </Button>
          </Box>
        </Alert>
      </Box>
    )
  }

  // Check permission if required
  if (requiredPermission && isAuthenticated && user && !hasPermission(requiredPermission)) {
    return (
      <Box
        display='flex'
        flexDirection='column'
        justifyContent='center'
        alignItems='center'
        minHeight='50vh'
        gap={2}
        p={3}
      >
        <Alert severity='warning' sx={{ maxWidth: 500 }}>
          <Typography variant='h6' gutterBottom>
            Acceso No Autorizado
          </Typography>
          <Typography variant='body2' gutterBottom>
            No tienes permisos para acceder a esta página.
          </Typography>
          <Box mt={2}>
            <Button variant='contained' onClick={() => router.back()} size='small'>
              Volver
            </Button>
          </Box>
        </Alert>
      </Box>
    )
  }

  // Show children if authenticated (and authorized if permission required)
  if (isAuthenticated && user) {
    return <>{children}</>
  }

  // Return null while redirecting
  return null
}

export default AuthGuard
