'use client'

// MUI Imports
import { Box, Typography, Container, Paper } from '@mui/material'

const RegisterPage = () => {
  return (
    <Container maxWidth='sm'>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: 3
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant='h4' component='h1' gutterBottom textAlign='center'>
            Registro
          </Typography>
          <Typography variant='body1' color='text.secondary' textAlign='center' sx={{ mb: 3 }}>
            La funcionalidad de registro estará disponible próximamente.
          </Typography>
          <Typography variant='body2' color='text.secondary' textAlign='center'>
            Por favor, contacta al administrador para crear una cuenta.
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}

export default RegisterPage
