'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/hooks/redux'
import LoginForm from '@/components/auth/LoginForm'
import { Box, Paper, Typography } from '@mui/material'

const LoginPage = () => {
  const router = useRouter()
  const { isAuthenticated } = useAppSelector(state => state.auth)

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ User already authenticated, redirecting to dashboard...')
      router.replace('/dashboard')
    }
  }, [isAuthenticated, router])

  // Si ya está autenticado, no mostrar el formulario
  if (isAuthenticated) {
    return null
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: 2
      }}
    >
      <Paper
        elevation={8}
        sx={{
          padding: 4,
          maxWidth: 400,
          width: '100%',
          borderRadius: 2
        }}
      >
        <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
          <Typography variant='h4' component='h1' gutterBottom>
            🔐 Iniciar Sesión
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Sistema de Autenticación con Redux
          </Typography>
        </Box>

        <LoginForm />

        <Box sx={{ marginTop: 3, textAlign: 'center' }}>
          <Typography variant='caption' color='text.secondary'>
            Powered by Next.js + Redux Toolkit
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default LoginPage
