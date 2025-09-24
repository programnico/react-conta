'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/shared/hooks/redux'
import { Box, CircularProgress, Typography } from '@mui/material'

const HomePage = () => {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAppSelector(state => state.auth)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login')
      } else {
        // Si está autenticado, mostrar el dashboard aquí mismo
      }
    }
  }, [isAuthenticated, isLoading, router])

  // Mostrar loading mientras se verifica autenticación
  if (isLoading) {
    return (
      <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight='100vh' gap={3}>
        <CircularProgress size={60} />
        <Typography variant='h6' color='text.secondary'>
          Verificando autenticación...
        </Typography>
      </Box>
    )
  }

  // Si no está autenticado, mostrar loading mientras redirige
  if (!isAuthenticated) {
    return (
      <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight='100vh' gap={3}>
        <CircularProgress size={60} />
        <Typography variant='h6' color='text.secondary'>
          Redirigiendo al login...
        </Typography>
      </Box>
    )
  }

  // Si está autenticado, redirigir al dashboard con layout
  if (isAuthenticated) {
    // Usar window.location para evitar loops de Next.js router
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      window.location.replace('/dashboard')
      return (
        <Box display='flex' alignItems='center' justifyContent='center' minHeight='100vh'>
          <CircularProgress />
        </Box>
      )
    }
  }

  return null
}

export default HomePage
