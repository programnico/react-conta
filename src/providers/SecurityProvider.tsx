// providers/SecurityProvider.tsx
'use client'

import { ReactNode, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useTokenValidator } from '@/shared/hooks/useTokenValidator'
import { selectAuth } from '@/shared/store/authSlice'
import SessionWarning from '@/components/SessionWarning'

interface SecurityProviderProps {
  children: ReactNode
}

/**
 * Provider que maneja la seguridad global de la aplicación
 * - Validación automática de tokens
 * - Manejo de inactividad
 * - Detección de sesiones expiradas
 */
export function SecurityProvider({ children }: SecurityProviderProps) {
  const { isAuthenticated } = useSelector(selectAuth)

  // Hook que maneja toda la validación de tokens y seguridad (DESACTIVADO temporalmente)
  // useTokenValidator({
  //   validateOnMount: false,
  //   validateOnFocus: true,
  //   inactivityTimeout: 60 * 60 * 1000,
  //   validationInterval: 0
  // })

  // Limpiar datos sensibles al cerrar la ventana/pestaña
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isAuthenticated) {
        // Marcar que la sesión debe ser validada en el próximo acceso
        localStorage.setItem('sessionRequiresValidation', 'true')
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isAuthenticated])

  return (
    <>
      {children}
      <SessionWarning />
    </>
  )
}

export default SecurityProvider
