'use client'

import { useState } from 'react'
import { Button, Card, CardContent, Typography, Box, TextField, Stack } from '@mui/material'

export default function EndpointTest() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [credentials, setCredentials] = useState({ identity: 'test', password: 'test' })

  const addResult = (message: string) => {
    setResults(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev])
  }

  const testLoginEndpoint = async () => {
    setLoading(true)
    addResult('🔍 Testing /auth/login endpoint...')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identity: credentials.identity,
          password: credentials.password
        })
      })

      const responseText = await response.text()
      addResult(
        `📡 /auth/login: ${response.status} - ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`
      )

      if (response.status === 200) {
        addResult('✅ SUCCESS! Login endpoint is working!')
      } else if (response.status === 401 || response.status === 400) {
        addResult('✅ Endpoint exists! (Invalid credentials expected)')
      }
    } catch (error) {
      addResult(`❌ /auth/login failed: ${error}`)
    }
  }

  const testOldEndpoint = async () => {
    addResult('🔍 Testing old /auth/authentication endpoint...')

    try {
      const response = await fetch('/api/auth/authentication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identity: credentials.identity,
          password: credentials.password
        })
      })

      const responseText = await response.text()
      addResult(`📡 /auth/authentication: ${response.status} - ${responseText.substring(0, 200)}`)
    } catch (error) {
      addResult(`❌ /auth/authentication failed: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const runTests = async () => {
    setResults([])
    setLoading(true)
    await testLoginEndpoint()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await testOldEndpoint()
    setLoading(false)
  }

  return (
    <Box p={3}>
      <Card>
        <CardContent>
          <Typography variant='h5' gutterBottom>
            Authentication Endpoint Test
          </Typography>

          <Stack spacing={2} sx={{ mb: 3 }}>
            <TextField
              label='Identity'
              value={credentials.identity}
              onChange={e => setCredentials(prev => ({ ...prev, identity: e.target.value }))}
              size='small'
            />
            <TextField
              label='Password'
              type='password'
              value={credentials.password}
              onChange={e => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              size='small'
            />
          </Stack>

          <Button variant='contained' onClick={runTests} disabled={loading} sx={{ mb: 2 }}>
            {loading ? 'Testing...' : 'Test Auth Endpoints'}
          </Button>

          <Box
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              minHeight: 200,
              maxHeight: 400,
              overflow: 'auto'
            }}
          >
            {results.length === 0 ? (
              <Typography variant='body2' color='text.secondary'>
                Click "Test Auth Endpoints" to check connectivity
              </Typography>
            ) : (
              results.map((result, index) => (
                <Typography
                  key={index}
                  variant='body2'
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    color: result.includes('❌')
                      ? 'error.main'
                      : result.includes('✅')
                        ? 'success.main'
                        : 'text.primary',
                    mb: 0.5
                  }}
                >
                  {result}
                </Typography>
              ))
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
