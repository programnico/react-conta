'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, CircularProgress, Typography } from '@mui/material'

const HomePage = () => {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      try {
        // Verificar directamente en localStorage
        const persistedState = localStorage.getItem('persist:root')

        if (persistedState) {
          const parsed = JSON.parse(persistedState)
          if (parsed.auth) {
            const authState = JSON.parse(parsed.auth)
            console.log('Estado de auth en localStorage:', authState)

            // Si tiene token y está autenticado, ir al dashboard
            if (authState.isAuthenticated && authState.accessToken) {
              console.log('Usuario autenticado - Redirigiendo a dashboard')
              setIsRedirecting(true)
              router.replace('/dashboard')
              return
            }
          }
        }

        // Si no está autenticado o no hay datos, ir al login
        console.log('Usuario no autenticado - Redirigiendo a login')
        setIsRedirecting(true)
        router.replace('/login')
      } catch (error) {
        console.error('Error verificando autenticación:', error)
        // En caso de error, ir al login por seguridad
        setIsRedirecting(true)
        router.replace('/login')
      }
    }

    // Ejecutar inmediatamente después del mount
    const timer = setTimeout(checkAuthAndRedirect, 100)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight='100vh' gap={3}>
      <CircularProgress size={60} />
      <Typography variant='h6' color='text.secondary'>
        {isRedirecting ? 'Redirigiendo...' : 'Verificando autenticación...'}
      </Typography>
    </Box>
  )
}

export default HomePage
