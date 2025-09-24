'use client'

import { useState } from 'react'
import { Button, Card, CardContent, Typography, Box, Stack } from '@mui/material'

export default function BackendTest() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testBackendDirect = async () => {
    setLoading(true)
    addResult('🔍 Testing direct backend connection...')

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/authentication', {
        method: 'POST',
        mode: 'no-cors', // Avoid CORS for this test
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identity: 'test', password: 'test' })
      })
      addResult(`📡 Direct backend response: ${response.status}`)
    } catch (error) {
      addResult(`❌ Direct backend failed: ${error}`)
    }
  }

  const testBackendRoot = async () => {
    addResult('🔍 Testing backend root endpoint...')

    try {
      const response = await fetch('/api/', {
        method: 'GET'
      })
      const text = await response.text()
      addResult(`📡 Backend root: ${response.status} - ${text.substring(0, 100)}`)
    } catch (error) {
      addResult(`❌ Backend root failed: ${error}`)
    }
  }

  const testAuthEndpoint = async () => {
    addResult('🔍 Testing auth endpoint through proxy...')

    try {
      const response = await fetch('/api/auth/authentication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identity: 'test', password: 'test' })
      })
      const text = await response.text()
      addResult(`📡 Proxy auth: ${response.status} - ${text.substring(0, 100)}`)
    } catch (error) {
      addResult(`❌ Proxy auth failed: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const runAllTests = async () => {
    setResults([])
    setLoading(true)

    await testBackendRoot()
    await new Promise(resolve => setTimeout(resolve, 1000))

    await testAuthEndpoint()
    await new Promise(resolve => setTimeout(resolve, 1000))

    await testBackendDirect()
    setLoading(false)
  }

  const clearResults = () => setResults([])

  return (
    <Box p={3}>
      <Card>
        <CardContent>
          <Typography variant='h5' gutterBottom>
            Backend Connection Diagnostics
          </Typography>

          <Stack direction='row' spacing={2} sx={{ mb: 2 }}>
            <Button variant='contained' onClick={runAllTests} disabled={loading}>
              {loading ? 'Testing...' : 'Run All Tests'}
            </Button>

            <Button variant='outlined' onClick={clearResults}>
              Clear Results
            </Button>
          </Stack>

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
                Click "Run All Tests" to diagnose backend connectivity
              </Typography>
            ) : (
              results.map((result, index) => (
                <Typography
                  key={index}
                  variant='body2'
                  sx={{
                    fontFamily: 'monospace',
                    color: result.includes('❌')
                      ? 'error.main'
                      : result.includes('✅')
                        ? 'success.main'
                        : 'text.primary'
                  }}
                >
                  {result}
                </Typography>
              ))
            )}
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant='h6' gutterBottom>
              Expected Results:
            </Typography>
            <Typography variant='body2'>
              • Backend Root: Should return backend info or 200 status
              <br />
              • Proxy Auth: Should return backend auth response (might be 401/400 for invalid credentials)
              <br />• Direct Backend: Will likely fail due to CORS (expected)
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
