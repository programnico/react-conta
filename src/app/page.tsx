'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const HomePage = () => {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(true)

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      try {
        // Solo ejecutar en el cliente para evitar diferencias de hidratación
        if (typeof window === 'undefined') return

        // Verificar directamente en localStorage
        const persistedState = localStorage.getItem('persist:root')

        if (persistedState) {
          const parsed = JSON.parse(persistedState)
          if (parsed.auth) {
            const authState = JSON.parse(parsed.auth)

            // Si tiene token y está autenticado, ir al dashboard
            if (authState.isAuthenticated && authState.accessToken) {
              router.replace('/dashboard')
              return
            }
          }
        }

        // Si no está autenticado o no hay datos, ir al login
        router.replace('/login')
      } catch (error) {
        // En caso de error, ir al login por seguridad
        router.replace('/login')
      } finally {
        setIsRedirecting(false)
      }
    }

    // Ejecutar después de que se monte el componente
    checkAuthAndRedirect()
  }, [router])

  // Siempre mostrar el mismo contenido inicial para servidor y cliente
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
      }}
    >
      <div
        style={{
          width: '24px',
          height: '24px',
          border: '2px solid #f3f3f3',
          borderTop: '2px solid #1976d2',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
    </div>
  )
}

export default HomePage
