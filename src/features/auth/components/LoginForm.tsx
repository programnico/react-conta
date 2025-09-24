// components/auth/LoginForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Hook Imports
import { useAppDispatch, useAppSelector } from '@/hooks/redux'

// Store Imports
import {
  loginAsync,
  verifyCodeAsync,
  clearError,
  resetLoginStep,
  selectAuth,
  selectIsLoading,
  selectError,
  selectLoginStep,
  selectRequiresVerification,
  selectIsAuthenticated
} from '@/store/slices/authSlice'

// Type Imports
import type { LoginCredentials, VerificationRequest } from '@/types/auth'

const LoginForm = () => {
  // Redux hooks
  const dispatch = useAppDispatch()
  const router = useRouter()

  const { isAuthenticated, isLoading, error, loginStep, requiresVerification, verificationToken } =
    useAppSelector(selectAuth)

  // Local state
  const [credentials, setCredentials] = useState<LoginCredentials>({
    identity: '',
    password: ''
  })
  const [verificationCode, setVerificationCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated && loginStep === 'completed') {
      router.push('/')
    }
  }, [isAuthenticated, loginStep, router])

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!credentials.identity.trim() || !credentials.password) {
      return
    }

    dispatch(clearError())
    dispatch(loginAsync(credentials))
  }

  // Handle verification code submission
  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!verificationCode.trim() || !verificationToken) {
      return
    }

    const verificationData: VerificationRequest = {
      code: verificationCode.trim(),
      tk: verificationToken
    }

    dispatch(verifyCodeAsync(verificationData))
  }

  // Handle back to login
  const handleBackToLogin = () => {
    dispatch(resetLoginStep())
    setVerificationCode('')
  }

  // Render login step
  const renderLoginStep = () => (
    <form onSubmit={handleLogin}>
      <div className='flex flex-col gap-4'>
        <TextField
          fullWidth
          label='Email or Username'
          value={credentials.identity}
          onChange={e =>
            setCredentials(prev => ({
              ...prev,
              identity: e.target.value
            }))
          }
          disabled={isLoading}
          required
          autoComplete='username'
        />

        <TextField
          fullWidth
          label='Password'
          type={showPassword ? 'text' : 'password'}
          value={credentials.password}
          onChange={e =>
            setCredentials(prev => ({
              ...prev,
              password: e.target.value
            }))
          }
          disabled={isLoading}
          required
          autoComplete='current-password'
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton onClick={() => setShowPassword(!showPassword)} edge='end'>
                  <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <Button
          type='submit'
          variant='contained'
          size='large'
          disabled={isLoading || !credentials.identity.trim() || !credentials.password}
          startIcon={isLoading && <CircularProgress size={20} />}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </div>
    </form>
  )

  // Render verification step
  const renderVerificationStep = () => (
    <form onSubmit={handleVerification}>
      <div className='flex flex-col gap-4'>
        <Typography variant='body2' color='text.secondary' className='text-center'>
          We've sent a verification code to your registered device. Please enter the code below to complete your login.
        </Typography>

        <TextField
          fullWidth
          label='Verification Code'
          value={verificationCode}
          onChange={e => setVerificationCode(e.target.value)}
          disabled={isLoading}
          required
          inputProps={{
            maxLength: 6,
            pattern: '[0-9]*',
            inputMode: 'numeric'
          }}
          placeholder='Enter 6-digit code'
        />

        <div className='flex gap-2'>
          <Button
            type='submit'
            variant='contained'
            size='large'
            disabled={isLoading || verificationCode.length < 6}
            startIcon={isLoading && <CircularProgress size={20} />}
            className='flex-1'
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>

          <Button variant='outlined' size='large' onClick={handleBackToLogin} disabled={isLoading}>
            Back
          </Button>
        </div>

        <Typography variant='caption' color='text.secondary' className='text-center'>
          Didn't receive a code? Check your device or try again.
        </Typography>
      </div>
    </form>
  )

  return (
    <div className='flex justify-center items-center min-h-screen p-4'>
      <Card className='w-full max-w-md'>
        <CardContent className='p-6'>
          <div className='text-center mb-6'>
            <Typography variant='h4' component='h1' className='mb-2'>
              {loginStep === 'verification' ? 'Verify Your Identity' : 'Welcome Back'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {loginStep === 'verification'
                ? 'Enter the verification code to continue'
                : 'Please sign in to your account'}
            </Typography>
          </div>

          {error && (
            <Alert severity='error' className='mb-4' onClose={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}

          {loginStep === 'credentials' && renderLoginStep()}
          {loginStep === 'verification' && renderVerificationStep()}
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginForm
