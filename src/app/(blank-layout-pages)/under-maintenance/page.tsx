'use client'

// MUI Imports
import { Box, Typography, Container } from '@mui/material'

const UnderMaintenancePage = () => {
  return (
    <Container maxWidth='md'>
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
        <Typography variant='h1' component='h1' sx={{ fontSize: '4rem', fontWeight: 'bold', mb: 2 }}>
          🚧
        </Typography>
        <Typography variant='h4' component='h2' sx={{ mb: 2 }}>
          Sitio en Mantenimiento
        </Typography>
        <Typography variant='body1' sx={{ mb: 4, maxWidth: '500px' }}>
          Estamos realizando actualizaciones para mejorar tu experiencia. Volveremos pronto.
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Gracias por tu paciencia.
        </Typography>
      </Box>
    </Container>
  )
}

export default UnderMaintenancePage
