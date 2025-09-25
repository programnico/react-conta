'use client'

import { useState } from 'react'
import { Button, Card, CardContent, Typography, Box, TextField, Stack, Chip } from '@mui/material'

export default function BackendExplorer() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [customPath, setCustomPath] = useState('')

  const addResult = (message: string) => {
    setResults(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev])
  }

  const testEndpoint = async (path: string) => {
    try {
      const url = `/api${path}`
      addResult(`🔍 Testing: ${url}`)

      const response = await fetch(url, {
        method: 'GET'
      })

      let responseText = await response.text()

      // Try to parse as JSON for better display
      try {
        const jsonData = JSON.parse(responseText)
        responseText = JSON.stringify(jsonData, null, 2)
      } catch {
        // Not JSON, keep as text
      }

      if (response.ok) {
        addResult(
          `✅ ${path}: ${response.status} - ${responseText.substring(0, 300)}${responseText.length > 300 ? '...' : ''}`
        )
      } else {
        addResult(`⚠️ ${path}: ${response.status} - ${responseText.substring(0, 300)}`)
      }
    } catch (error) {
      addResult(`❌ ${path}: ${error}`)
    }
  }

  const testCommonEndpoints = async () => {
    setLoading(true)
    setResults([])

    const endpoints = [
      '/',
      '/health',
      '/status',
      '/api',
      '/auth',
      '/auth/',
      '/auth/login',
      '/auth/authentication',
      '/auth/signin',
      '/user/login',
      '/login',
      '/api/auth/login',
      '/api/auth/authentication',
      '/api/login',
      '/pei/unit-merge'
    ]

    for (const endpoint of endpoints) {
      await testEndpoint(endpoint)
      await new Promise(resolve => setTimeout(resolve, 500)) // Small delay
    }

    setLoading(false)
  }

  const testCustomPath = async () => {
    if (customPath.trim()) {
      await testEndpoint(customPath.startsWith('/') ? customPath : `/${customPath}`)
    }
  }

  const testWithDifferentMethods = async () => {
    setLoading(true)
    addResult('🔍 Testing /auth endpoint with different methods...')

    const methods = ['GET', 'POST', 'OPTIONS']

    for (const method of methods) {
      try {
        const response = await fetch('/api/auth', {
          method,
          headers: method === 'POST' ? { 'Content-Type': 'application/json' } : {},
          body: method === 'POST' ? JSON.stringify({ test: 'data' }) : undefined
        })

        const text = await response.text()
        addResult(`📡 ${method} /auth: ${response.status} - ${text.substring(0, 200)}`)
      } catch (error) {
        addResult(`❌ ${method} /auth: ${error}`)
      }
    }

    setLoading(false)
  }

  return (
    <Box p={3}>
      <Card>
        <CardContent>
          <Typography variant='h5' gutterBottom>
            Backend Endpoint Explorer
          </Typography>

          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            Let's discover what endpoints are actually available on your backend server.
          </Typography>

          <Stack direction='row' spacing={2} sx={{ mb: 3 }}>
            <Button variant='contained' onClick={testCommonEndpoints} disabled={loading}>
              Scan Common Endpoints
            </Button>

            <Button variant='outlined' onClick={testWithDifferentMethods} disabled={loading}>
              Test Auth Methods
            </Button>
          </Stack>

          <Stack direction='row' spacing={2} sx={{ mb: 3 }}>
            <TextField
              label='Custom path (e.g., /auth/signin)'
              value={customPath}
              onChange={e => setCustomPath(e.target.value)}
              size='small'
              sx={{ flexGrow: 1 }}
            />
            <Button variant='outlined' onClick={testCustomPath} disabled={loading || !customPath.trim()}>
              Test
            </Button>
          </Stack>

          <Box sx={{ mb: 2 }}>
            <Typography variant='subtitle2'>Quick Tests:</Typography>
            <Stack direction='row' spacing={1} sx={{ mt: 1 }}>
              <Chip label='/api/' onClick={() => testEndpoint('/')} clickable size='small' />
              <Chip label='/api/auth' onClick={() => testEndpoint('/auth')} clickable size='small' />
              <Chip label='/api/login' onClick={() => testEndpoint('/login')} clickable size='small' />
            </Stack>
          </Box>

          <Box
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              minHeight: 300,
              maxHeight: 500,
              overflow: 'auto'
            }}
          >
            {results.length === 0 ? (
              <Typography variant='body2' color='text.secondary'>
                Click "Scan Common Endpoints" to discover available endpoints
              </Typography>
            ) : (
              results.map((result, index) => (
                <Typography
                  key={index}
                  variant='body2'
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: result.includes('❌')
                      ? 'error.main'
                      : result.includes('✅')
                        ? 'success.main'
                        : result.includes('⚠️')
                          ? 'warning.main'
                          : 'text.primary',
                    mb: 0.5,
                    whiteSpace: 'pre-wrap'
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
