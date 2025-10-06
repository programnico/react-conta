// components/NotFound.tsx
'use client'

import { Typography, Box, Button } from '@mui/material'
import Link from 'next/link'

interface NotFoundProps {
  mode?: 'light' | 'dark'
}

const NotFound = ({ mode = 'light' }: NotFoundProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        padding: 3
      }}
    >
      <Typography variant='h1' component='h1' sx={{ fontSize: '6rem', fontWeight: 'bold', mb: 2 }}>
        404
      </Typography>
      <Typography variant='h4' component='h2' sx={{ mb: 2 }}>
        Página no encontrada
      </Typography>
      <Typography variant='body1' sx={{ mb: 4, maxWidth: '500px' }}>
        Lo sentimos, la página que está buscando no existe o ha sido movida.
      </Typography>
      <Button component={Link} href='/dashboard' variant='contained' color='primary' size='large'>
        Volver al Dashboard
      </Button>
    </Box>
  )
}

export default NotFound
