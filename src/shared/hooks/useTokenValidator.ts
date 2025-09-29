// shared/hooks/useTokenValidator.ts
import { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectAuth, resetAuth, setLoading } from '@/shared/store/authSlice'
import { AuthService } from '@/shared/services/authService'

interface UseTokenValidatorOptions {
  validateOnMount?: boolean
  validateOnFocus?: boolean
  inactivityTimeout?: number
  validationInterval?: number
}

/**
 * Hook para validar automáticamente tokens y manejar seguridad de sesión
 */
export function useTokenValidator(options: UseTokenValidatorOptions = {}) {
  const {
    validateOnMount = true,
    validateOnFocus = true,
    inactivityTimeout = 30 * 60 * 1000, // 30 minutos
    validationInterval = 5 * 60 * 1000 // 5 minutos
  } = options

  const dispatch = useDispatch()
  const { isAuthenticated, accessToken } = useSelector(selectAuth)

  /**
   * Valida el token en el servidor
   */
  const validateToken = useCallback(
    async (forceful = false): Promise<boolean> => {
      if (!isAuthenticated || !accessToken) {
        return false
      }

      try {
        const isValid = await AuthService.validateToken(accessToken)

        if (!isValid) {
          console.warn('Token validation failed - logging out user')
          dispatch(resetAuth())

          // Redirect to login if not already there
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login?reason=token_expired'
          }
          return false
        }

        return true
      } catch (error) {
        console.error('Token validation error:', error)

        // Only logout on forceful validation or 401 errors
        if (forceful && error instanceof Error && error.message.includes('401')) {
          console.warn('Forceful token validation failed - logging out user')
          dispatch(resetAuth())

          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login?reason=token_expired'
          }
          return false
        }

        // Don't logout on network errors during normal validation
        return false
      }
    },
    [isAuthenticated, accessToken, dispatch]
  )

  /**
   * Maneja la inactividad del usuario
   */
  const handleInactivity = useCallback(() => {
    if (isAuthenticated) {
      console.info('User inactive for too long - logging out')
      dispatch(resetAuth())

      if (typeof window !== 'undefined') {
        window.location.href = '/login?reason=inactivity'
      }
    }
  }, [isAuthenticated, dispatch])

  /**
   * Valida cuando la página se vuelve visible
   */
  const handleVisibilityChange = useCallback(async () => {
    if (document.visibilityState === 'visible' && isAuthenticated) {
      const lastActivity = localStorage.getItem('lastActivity')
      const now = Date.now()

      // Si ha pasado más de 1 hora, validar token
      if (lastActivity && now - parseInt(lastActivity) > 60 * 60 * 1000) {
        console.info('User returned after extended absence - validating token')
        dispatch(setLoading(true))

        const isValid = await validateToken(true) // true = forceful validation

        dispatch(setLoading(false))

        if (isValid) {
          localStorage.setItem('lastActivity', now.toString())
        }
      }
    }
  }, [isAuthenticated, validateToken, dispatch])

  /**
   * Actualiza timestamp de última actividad
   */
  const updateLastActivity = useCallback(() => {
    if (isAuthenticated) {
      localStorage.setItem('lastActivity', Date.now().toString())
    }
  }, [isAuthenticated])

  // Validar token al montar el componente (solo si es necesario)
  useEffect(() => {
    if (validateOnMount && isAuthenticated) {
      // Solo validar si ha pasado tiempo significativo desde la última actividad
      const lastActivity = localStorage.getItem('lastActivity')
      const now = Date.now()

      if (!lastActivity || now - parseInt(lastActivity) > 10 * 60 * 1000) {
        // 10 minutos
        // Solo hacer validación suave en mount
        console.info('Performing soft token validation on app mount')
        validateToken(false) // false = no forceful
      }

      updateLastActivity()
    }
  }, [validateOnMount, isAuthenticated]) // Removemos validateToken y updateLastActivity de deps

  // Configurar validación periódica
  useEffect(() => {
    if (!isAuthenticated || !validationInterval) return

    const interval = setInterval(() => {
      // Solo validar si la página está visible
      if (document.visibilityState === 'visible') {
        validateToken()
      }
    }, validationInterval)

    return () => clearInterval(interval)
  }, [isAuthenticated, validationInterval, validateToken])

  // Manejar cambios de visibilidad de la página
  useEffect(() => {
    if (!validateOnFocus) return

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [validateOnFocus, handleVisibilityChange])

  // Configurar timeout de inactividad
  useEffect(() => {
    if (!isAuthenticated || !inactivityTimeout) return

    let inactivityTimer: NodeJS.Timeout

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer)
      inactivityTimer = setTimeout(handleInactivity, inactivityTimeout)
      updateLastActivity()
    }

    // Eventos que indican actividad del usuario
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

    activityEvents.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true)
    })

    // Iniciar timer
    resetInactivityTimer()

    return () => {
      clearTimeout(inactivityTimer)
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true)
      })
    }
  }, [isAuthenticated, inactivityTimeout, handleInactivity, updateLastActivity])

  return {
    validateToken,
    isAuthenticated
  }
}

export default useTokenValidator
