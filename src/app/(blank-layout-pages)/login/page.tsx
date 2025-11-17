// app/(blank-layout-pages)/login/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/shared/hooks/redux'

// Component Imports
import LoginForm from '@/components/auth/LoginForm'

const LoginPage = () => {
  const router = useRouter()
  const { isAuthenticated, user, loginStep } = useAppSelector(state => state.auth)

  // Redirigir si ya está autenticado y el proceso de login se completó
  useEffect(() => {
    if (isAuthenticated && user && loginStep === 'completed') {
      // Verificar si hay un parámetro de redirección en la URL
      const searchParams = new URLSearchParams(window.location.search)
      const redirect = searchParams.get('redirect') || '/dashboard'
      router.replace(redirect)
    }
  }, [isAuthenticated, user, loginStep, router])

  // No renderizar el formulario si ya está autenticado
  if (isAuthenticated && user && loginStep === 'completed') {
    return null
  }

  // Renderizado simple - la lógica de pasos se maneja internamente en LoginForm
  return <LoginForm />
}

export default LoginPage
