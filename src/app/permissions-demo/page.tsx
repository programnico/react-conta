// app/permissions-demo/page.tsx
'use client'

import {
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert
} from '@mui/material'
import AuthGuard from '@/features/auth/components/AuthGuard'
import { usePermissions } from '@/providers/PermissionsProvider'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { PERMISSIONS } from '@/config/permissions'
import NavigationMenu from '@/components/navigation/NavigationMenu'

const PermissionsDemoPage = () => {
  const { permissions, userRole, hasPermission } = usePermissions()
  const { user } = useAuth()

  const allPermissions = Object.values(PERMISSIONS).flatMap(category => Object.values(category))

  return (
    <Grid container spacing={4}>
      {/* User Info */}
      <Grid item xs={12}>
        <Alert severity='info' sx={{ mb: 2 }}>
          <Typography variant='h6' gutterBottom>
            🧪 Página de Demostración del Sistema de Permisos
          </Typography>
          <Typography variant='body2'>
            Esta página muestra el funcionamiento del sistema de permisos y navegación basado en roles.
          </Typography>
        </Alert>
      </Grid>

      {/* Navigation Menu Demo */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              🧭 Menú Dinámico
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              El menú se adapta automáticamente a tus permisos:
            </Typography>
            <NavigationMenu />
          </CardContent>
        </Card>
      </Grid>

      {/* User Permissions */}
      <Grid item xs={12} md={8}>
        <Grid container spacing={3}>
          {/* User Info Card */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  👤 Información del Usuario
                </Typography>
                <Box display='flex' gap={2} flexWrap='wrap' mb={2}>
                  <Chip label={`Email: ${user?.email || 'N/A'}`} color='primary' />
                  <Chip label={`Rol: ${userRole}`} color='secondary' />
                  <Chip label={`Permisos: ${permissions.length}/${allPermissions.length}`} color='info' />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Current Permissions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom color='success.main'>
                  ✅ Permisos Activos ({permissions.length})
                </Typography>
                <List dense>
                  {permissions.map(permission => (
                    <ListItem key={permission} sx={{ py: 0 }}>
                      <ListItemText
                        primary={permission}
                        primaryTypographyProps={{ variant: 'body2', color: 'success.main' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Missing Permissions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom color='error.main'>
                  ❌ Permisos No Disponibles ({allPermissions.length - permissions.length})
                </Typography>
                <List dense>
                  {allPermissions
                    .filter(permission => !permissions.includes(permission))
                    .map(permission => (
                      <ListItem key={permission} sx={{ py: 0 }}>
                        <ListItemText
                          primary={permission}
                          primaryTypographyProps={{ variant: 'body2', color: 'error.main' }}
                        />
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Permission Tests */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  🧪 Pruebas de Permisos
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Box display='flex' flexDirection='column' gap={2}>
                  {Object.entries(PERMISSIONS).map(([category, categoryPermissions]) => (
                    <Box key={category}>
                      <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
                        {category}:
                      </Typography>
                      <Box display='flex' gap={1} flexWrap='wrap' mb={2}>
                        {Object.entries(categoryPermissions).map(([key, permission]) => {
                          const hasAccess = hasPermission(permission)
                          return (
                            <Chip
                              key={key}
                              label={`${key}: ${hasAccess ? '✅' : '❌'}`}
                              color={hasAccess ? 'success' : 'default'}
                              size='small'
                            />
                          )
                        })}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

const PermissionsDemoWithGuard = () => {
  return (
    <AuthGuard permissions={[PERMISSIONS.DASHBOARD.VIEW]}>
      <PermissionsDemoPage />
    </AuthGuard>
  )
}

export default PermissionsDemoWithGuard
