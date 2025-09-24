'use client'

import { useState } from 'react'
import { Button, Card, CardContent, Typography, Box } from '@mui/material'

export default function ProxyTest() {
  const [testResult, setTestResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testProxy = async () => {
    setLoading(true)
    setTestResult('Testing API route proxy...')

    try {
      console.log('Testing proxy with POST method...')
      const response = await fetch('/api/auth/authentication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identity: 'test',
          password: 'test'
        })
      })

      const responseText = await response.text()
      setTestResult(
        `✅ Proxy route working! Status: ${response.status}, Response: ${responseText.substring(0, 100)}...`
      )
      console.log('Proxy test response:', response)
      console.log('Response body:', responseText)
    } catch (error) {
      setTestResult(`❌ Proxy failed: ${error}`)
      console.error('Proxy test error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box p={3}>
      <Card>
        <CardContent>
          <Typography variant='h5' gutterBottom>
            Proxy Configuration Test
          </Typography>

          <Typography variant='body1' gutterBottom>
            Expected URL: <code>/api/auth/authentication</code>
          </Typography>

          <Typography variant='body1' gutterBottom>
            Should proxy to: <code>http://127.0.0.1:8000/auth/authentication</code>
          </Typography>

          <Button variant='contained' onClick={testProxy} disabled={loading} sx={{ my: 2 }}>
            {loading ? 'Testing...' : 'Test Proxy'}
          </Button>

          {testResult && (
            <Typography
              variant='body2'
              sx={{
                mt: 2,
                p: 1,
                bgcolor: testResult.includes('✅') ? 'success.light' : 'error.light',
                borderRadius: 1
              }}
            >
              {testResult}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
