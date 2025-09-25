'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, Typography, Box } from '@mui/material'
import { API_CONFIG } from '@/shared/services/apiClient'

export default function ConfigCheck() {
  const [config, setConfig] = useState<any>(null)

  useEffect(() => {
    // Get current configuration
    const currentConfig = {
      BASE_URL: API_CONFIG.BASE_URL,
      LOGIN_ENDPOINT: API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      FULL_LOGIN_URL: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      ENV_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NODE_ENV: process.env.NODE_ENV,
      IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
      IS_CLIENT: typeof window !== 'undefined'
    }
    setConfig(currentConfig)
  }, [])

  if (!config) return <div>Loading...</div>

  return (
    <Box p={3}>
      <Card>
        <CardContent>
          <Typography variant='h5' gutterBottom>
            Current API Configuration
          </Typography>

          <Box
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              fontFamily: 'monospace'
            }}
          >
            <pre>{JSON.stringify(config, null, 2)}</pre>
          </Box>

          <Typography variant='h6' sx={{ mt: 2 }}>
            Expected Results:
          </Typography>
          <Typography variant='body2'>
            • BASE_URL should be "/api" (in development)
            <br />
            • LOGIN_ENDPOINT should be "/auth/authentication"
            <br />
            • FULL_LOGIN_URL should be "/api/auth/authentication"
            <br />• ENV_API_URL should be "http://127.0.0.1:8000/api"
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
