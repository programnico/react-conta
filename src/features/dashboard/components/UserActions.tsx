// features/dashboard/components/UserActions.tsx
'use client'

import { Card, CardContent, Typography, Button, Box, Divider } from '@mui/material'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { usePermissions } from '@/providers/PermissionsProvider'
import { PERMISSIONS } from '@/config/permissions'
import { ROUTES } from '@/config/routes'
import Link from 'next/link'

// Icons
import LogoutIcon from '@mui/icons-material/Logout'
import SettingsIcon from '@mui/icons-material/Settings'
import PersonIcon from '@mui/icons-material/Person'
import SecurityIcon from '@mui/icons-material/Security'

const UserActions = () => {
  const { logout } = useAuth()
  const { hasPermission } = usePermissions()

  const handleLogout = async () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      await logout()
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          🚀 Acciones Rápidas
        </Typography>

        <Box display='flex' flexDirection='column' gap={2}>
          {/* Profile Link */}
          {hasPermission(PERMISSIONS.USERS.VIEW_PROFILE) && (
            <Link href={ROUTES.PROTECTED.USER_PROFILE} style={{ textDecoration: 'none' }}>
              <Button fullWidth variant='outlined' startIcon={<PersonIcon />} sx={{ justifyContent: 'flex-start' }}>
                Ver mi Perfil
              </Button>
            </Link>
          )}

          {/* Settings Link */}
          {hasPermission(PERMISSIONS.SETTINGS.VIEW) && (
            <Link href={ROUTES.PROTECTED.ACCOUNT_SETTINGS} style={{ textDecoration: 'none' }}>
              <Button fullWidth variant='outlined' startIcon={<SettingsIcon />} sx={{ justifyContent: 'flex-start' }}>
                Configuración de Cuenta
              </Button>
            </Link>
          )}

          {/* Change Password */}
          {hasPermission(PERMISSIONS.AUTH.CHANGE_PASSWORD) && (
            <Button
              fullWidth
              variant='outlined'
              startIcon={<SecurityIcon />}
              sx={{ justifyContent: 'flex-start' }}
              onClick={() => alert('Función de cambio de contraseña próximamente')}
            >
              Cambiar Contraseña
            </Button>
          )}

          <Divider />

          {/* Logout */}
          <Button fullWidth variant='contained' color='error' startIcon={<LogoutIcon />} onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default UserActions
