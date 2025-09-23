'use client'

import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { loginAsync, selectAuth } from '@/store/slices/authSlice'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'

const LoginDebug = () => {
  const dispatch = useAppDispatch()
  const auth = useAppSelector(selectAuth)

  const [identity, setIdentity] = useState('test@test.com')
  const [password, setPassword] = useState('password123')
  const [apiResponse, setApiResponse] = useState<any>(null)

  const handleLogin = async () => {
    console.log('🚀 Starting login process...')
    console.log('Redux state before:', auth)

    try {
      const result = await dispatch(loginAsync({ identity, password }))
      console.log('🔥 Login result:', result)
      setApiResponse(result)
    } catch (error) {
      console.error('❌ Login error:', error)
      setApiResponse({ error: String(error) })
    }
  }

  const testDirectAPI = async () => {
    console.log('🧪 Testing direct API call...')

    try {
      // Crear FormData
      const formData = new FormData()
      formData.append('identity', identity)
      formData.append('password', password)

      const response = await fetch('http://127.0.0.1:8000/api/authentication', {
        method: 'POST',
        body: formData // Enviar como FormData, no JSON
      })

      const data = await response.json()
      console.log('📡 Direct API response:', data)
      setApiResponse({ directAPI: data, status: response.status })
    } catch (error) {
      console.error('❌ Direct API error:', error)
      setApiResponse({ directAPIError: String(error) })
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <Card className='w-full max-w-2xl'>
        <CardContent>
          <Typography variant='h4' className='mb-6 text-center'>
            🐛 Login Debug Tool
          </Typography>

          <div className='space-y-4 mb-6'>
            <TextField fullWidth label='Identity' value={identity} onChange={e => setIdentity(e.target.value)} />

            <TextField
              fullWidth
              label='Password'
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div className='flex gap-4 mb-6'>
            <Button variant='contained' onClick={handleLogin} disabled={auth.isLoading}>
              🔐 Login with Redux
            </Button>

            <Button variant='outlined' onClick={testDirectAPI}>
              🧪 Test Direct API
            </Button>
          </div>

          {auth.error && (
            <Alert severity='error' className='mb-4'>
              Redux Error: {auth.error}
            </Alert>
          )}

          <div className='bg-gray-100 p-4 rounded mb-4'>
            <Typography variant='h6'>🔍 Redux State:</Typography>
            <pre className='text-xs overflow-auto'>{JSON.stringify(auth, null, 2)}</pre>
          </div>

          {apiResponse && (
            <div className='bg-blue-50 p-4 rounded'>
              <Typography variant='h6'>📡 API Response:</Typography>
              <pre className='text-xs overflow-auto'>{JSON.stringify(apiResponse, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginDebug
