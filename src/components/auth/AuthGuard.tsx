// components/auth/AuthGuard.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/shared/hooks/redux'

// MUI Imports
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

const AuthGuard = ({ children, fallback }: AuthGuardProps) => {
  const { isAuthenticated, isLoading, user } = useAppSelector(state => state.auth)
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      // Wait a bit for hydration
      await new Promise(resolve => setTimeout(resolve, 100))

      if (!isLoading && !isAuthenticated) {
        router.replace('/login')
        return
      }

      setIsChecking(false)
    }

    checkAuth()
  }, [isAuthenticated, isLoading, router])

  // Show loading while checking auth
  if (isChecking || isLoading) {
    return (
      fallback || (
        <Box
          display='flex'
          flexDirection='column'
          justifyContent='center'
          alignItems='center'
          minHeight='100vh'
          gap={2}
        >
          <CircularProgress size={40} />
          <Typography variant='body2' color='text.secondary'>
            Loading...
          </Typography>
        </Box>
      )
    )
  }

  // Show children if authenticated
  if (isAuthenticated && user) {
    return <>{children}</>
  }

  // Return null while redirecting
  return null
}

export default AuthGuard
