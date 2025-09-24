// app/login/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/hooks/redux'
import LoginForm from '@/components/auth/LoginForm'
import { Box } from '@mui/material'

const LoginPage = () => {
  const router = useRouter()
  const { isAuthenticated } = useAppSelector(state => state.auth)

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (isAuthenticated) {
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
      <LoginForm />
    </Box>
  )
}

export default LoginPage
