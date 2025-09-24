// components/ui/LoadingSpinner.tsx
import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'

interface LoadingSpinnerProps {
  message?: string
  size?: number
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Cargando...', size = 40 }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2
      }}
    >
      <CircularProgress size={size} />
      <Typography variant='body2' color='text.secondary'>
        {message}
      </Typography>
    </Box>
  )
}
