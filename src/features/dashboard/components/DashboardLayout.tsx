// features/dashboard/components/DashboardLayout.tsx
'use client'

import React from 'react'
import { Grid, Card, CardContent, Typography, Box, Button } from '@mui/material'
import { useAppSelector, useAppDispatch } from '@/shared/hooks/redux'
import { logoutAsync } from '@/shared/store/authSlice'
import DashboardStats from './DashboardStats'
import UserActions from './UserActions'

const DashboardLayout = () => {
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector(state => state.auth)

  const handleLogout = () => {
    dispatch(logoutAsync())
  }

  return (
    <Grid container spacing={6}>
      {/* Header Section */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box display='flex' justifyContent='space-between' alignItems='center'>
              <Box>
                <Typography variant='h4' component='h1' gutterBottom>
                  Dashboard
                </Typography>
                <Typography variant='h6' color='text.secondary'>
                  Bienvenido, {user?.name || 'Usuario'}
                </Typography>
              </Box>
              <UserActions />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Stats Section */}
      <Grid item xs={12}>
        <DashboardStats />
      </Grid>

      {/* Quick Actions */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Acciones Rápidas
            </Typography>
            <Box display='flex' gap={2} flexWrap='wrap'>
              <Button variant='contained' color='primary'>
                Nueva Compra
              </Button>
              <Button variant='outlined' color='primary'>
                Ver Proveedores
              </Button>
              <Button variant='outlined' color='primary'>
                Gestionar Productos
              </Button>
              <Button variant='outlined' color='secondary'>
                Reportes
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Additional Dashboard Content */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Actividad Reciente
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              No hay actividad reciente para mostrar.
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Notificaciones
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              No hay notificaciones nuevas.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default DashboardLayout
