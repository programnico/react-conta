// components/SessionWarning.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material'
import { selectAuth, resetAuth } from '@/shared/store/authSlice'
import { SECURITY } from '@/shared/constants'

/**
 * Componente que advierte al usuario sobre sesiones próximas a expirar
 */
export function SessionWarning() {
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector(selectAuth)

  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false)
      return
    }

    let warningTimer: NodeJS.Timeout
    let countdownTimer: NodeJS.Timeout

    // Simular advertencia basada en inactividad
    const showSessionWarning = () => {
      setShowWarning(true)
      setCountdown(SECURITY.SESSION_WARNING_TIME / 1000) // Convert to seconds

      // Countdown timer
      countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            handleLogout()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    // Show warning 5 minutes before inactivity logout
    const timeUntilWarning = SECURITY.INACTIVITY_TIMEOUT - SECURITY.SESSION_WARNING_TIME
    warningTimer = setTimeout(showSessionWarning, timeUntilWarning)

    return () => {
      clearTimeout(warningTimer)
      clearInterval(countdownTimer)
    }
  }, [isAuthenticated])

  const handleExtendSession = () => {
    setShowWarning(false)
    setCountdown(0)

    // Reset activity timestamp to extend session
    localStorage.setItem('lastActivity', Date.now().toString())
  }

  const handleLogout = () => {
    setShowWarning(false)
    setCountdown(0)
    dispatch(resetAuth())

    if (typeof window !== 'undefined') {
      window.location.href = '/login?reason=session_timeout'
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!showWarning || !isAuthenticated) {
    return null
  }

  return (
    <Dialog
      open={showWarning}
      disableEscapeKeyDown
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 4
        }
      }}
    >
      <DialogTitle sx={{ color: 'warning.main', fontWeight: 'bold' }}>⚠️ Sesión por Expirar</DialogTitle>

      <DialogContent>
        <Typography variant='body1' gutterBottom>
          Su sesión expirará en <strong>{formatTime(countdown)}</strong> por inactividad.
        </Typography>

        <Typography variant='body2' color='text.secondary'>
          ¿Desea extender su sesión o cerrar sesión ahora?
        </Typography>
      </DialogContent>

      <DialogActions sx={{ padding: 2, gap: 1 }}>
        <Button onClick={handleLogout} variant='outlined' color='error' size='large'>
          Cerrar Sesión
        </Button>

        <Button onClick={handleExtendSession} variant='contained' color='primary' size='large' autoFocus>
          Extender Sesión
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SessionWarning
