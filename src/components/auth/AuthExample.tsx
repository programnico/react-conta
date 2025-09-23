// components/auth/AuthExample.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'

const AuthExample = () => {
  const {
    isAuthenticated,
    user,
    login,
    verifyCode,
    logout,
    isLoading,
    error,
    loginStep,
    requiresVerification,
    clearAuthError
  } = useAuth()

  const [identity, setIdentity] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')

  const handleLogin = async () => {
    if (identity && password) {
      await login({ identity, password })
    }
  }

  const handleVerify = async () => {
    if (code) {
      await verifyCode({ code, tk: 'temp-token' }) // El tk real viene del estado
    }
  }

  if (isAuthenticated) {
    return (
      <Card className='max-w-md mx-auto mt-8'>
        <CardContent>
          <Typography variant='h5' className='mb-4 text-center'>
            ¡Bienvenido! 🎉
          </Typography>

          <Box className='space-y-4'>
            <div>
              <Typography variant='body2' color='text.secondary'>
                Usuario:
              </Typography>
              <Typography variant='body1'>{user?.name || user?.email || 'Usuario autenticado'}</Typography>
            </div>

            <div>
              <Typography variant='body2' color='text.secondary'>
                Estado:
              </Typography>
              <Chip label='Autenticado' color='success' size='small' />
            </div>

            <Button variant='outlined' color='error' fullWidth onClick={logout} disabled={isLoading}>
              Cerrar Sesión
            </Button>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='max-w-md mx-auto mt-8'>
      <CardContent>
        <Typography variant='h5' className='mb-4 text-center'>
          Sistema de Autenticación Redux
        </Typography>

        {error && (
          <Alert severity='error' className='mb-4' onClose={clearAuthError}>
            {error}
          </Alert>
        )}

        {loginStep === 'credentials' && (
          <Box className='space-y-4'>
            <TextField
              fullWidth
              label='Usuario o Email'
              value={identity}
              onChange={e => setIdentity(e.target.value)}
              disabled={isLoading}
            />

            <TextField
              fullWidth
              label='Contraseña'
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
            />

            <Button fullWidth variant='contained' onClick={handleLogin} disabled={isLoading || !identity || !password}>
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </Box>
        )}

        {loginStep === 'verification' && (
          <Box className='space-y-4'>
            <Alert severity='info' className='mb-4'>
              Se ha enviado un código de verificación. Ingresa el código para continuar.
            </Alert>

            <TextField
              fullWidth
              label='Código de Verificación'
              value={code}
              onChange={e => setCode(e.target.value)}
              disabled={isLoading}
              placeholder='123456'
            />

            <Button fullWidth variant='contained' onClick={handleVerify} disabled={isLoading || code.length < 6}>
              {isLoading ? 'Verificando...' : 'Verificar Código'}
            </Button>
          </Box>
        )}

        <Box className='mt-4 p-4 bg-gray-50 rounded'>
          <Typography variant='caption' className='block mb-2'>
            Estado Debug:
          </Typography>
          <Typography variant='caption' className='block'>
            Paso: {loginStep}
          </Typography>
          <Typography variant='caption' className='block'>
            Requiere Verificación: {requiresVerification ? 'Sí' : 'No'}
          </Typography>
          <Typography variant='caption' className='block'>
            Cargando: {isLoading ? 'Sí' : 'No'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default AuthExample
