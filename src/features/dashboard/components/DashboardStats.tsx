// features/dashboard/components/DashboardStats.tsx
'use client'

import { Grid, Card, CardContent, Typography, Box, Chip } from '@mui/material'
import { useAuth } from '@/features/auth/hooks/useAuth'

const DashboardStats = () => {
  const { user, userRole, userPermissions } = useAuth()

  return (
    <Grid container spacing={3}>
      {/* Welcome Card */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box display='flex' justifyContent='space-between' alignItems='center'>
              <Box>
                <Typography variant='h4' component='h1' gutterBottom>
                  🎉 ¡Bienvenido al Dashboard! Archivo modificado poor nicolas
                </Typography>
                <Typography variant='h6' color='text.secondary' gutterBottom>
                  Sistema de autenticación profesional funcionando correctamente
                </Typography>
                <Box display='flex' gap={1} alignItems='center' flexWrap='wrap' mt={2}>
                  <Chip label={`👤 Usuario: ${user?.email || user?.name || 'N/A'}`} color='primary' size='medium' />
                  <Chip label={`🛡️ Rol: ${userRole}`} color='secondary' size='medium' />
                  <Chip label={`🔑 Permisos: ${userPermissions.length}`} color='info' size='medium' />
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Stats Cards */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Total de Permisos
            </Typography>
            <Typography variant='h3' color='primary'>
              {userPermissions.length}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Permisos activos en tu cuenta
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Nivel de Acceso
            </Typography>
            {/* <Typography variant='h3' color='success.main'>
              {userRole}
            </Typography> */}
            <Typography variant='body2' color='text.secondary'>
              Tu rol actual en el sistema
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Estado
            </Typography>
            <Typography variant='h3' color='success.main'>
              Activo
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Sesión autenticada correctamente
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default DashboardStats
