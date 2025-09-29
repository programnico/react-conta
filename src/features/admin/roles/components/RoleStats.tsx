// features/admin/roles/components/RoleStats.tsx
'use client'

import { Grid, Card, CardContent, Typography, Box, Avatar } from '@mui/material'
import {
  Security as SecurityIcon,
  Group as GroupIcon,
  PersonOff as PersonOffIcon,
  Gavel as GavelIcon
} from '@mui/icons-material'
import type { RoleStats } from '../types'

interface RoleStatsProps {
  stats: RoleStats | null
  loading?: boolean
}

export function RoleStatsComponent({ stats, loading = false }: RoleStatsProps) {
  if (loading || !stats) {
    return (
      <Grid container spacing={3}>
        {[...Array(4)].map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' gap={2}>
                  <Avatar sx={{ bgcolor: 'grey.300' }}>
                    <SecurityIcon />
                  </Avatar>
                  <Box>
                    <Typography color='textSecondary' gutterBottom>
                      Cargando...
                    </Typography>
                    <Typography variant='h4'>-</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  }

  const statItems = [
    {
      title: 'Total de Roles',
      value: stats.total,
      icon: SecurityIcon,
      color: '#1976d2',
      bgColor: 'rgba(25, 118, 210, 0.1)'
    },
    {
      title: 'Roles con Usuarios',
      value: stats.withUsers,
      icon: GroupIcon,
      color: '#2e7d32',
      bgColor: 'rgba(46, 125, 50, 0.1)'
    },
    {
      title: 'Roles sin Usuarios',
      value: stats.withoutUsers,
      icon: PersonOffIcon,
      color: '#ed6c02',
      bgColor: 'rgba(237, 108, 2, 0.1)'
    },
    {
      title: 'Promedio Permisos',
      value: stats.avgPermissions,
      icon: GavelIcon,
      color: '#9c27b0',
      bgColor: 'rgba(156, 39, 176, 0.1)'
    }
  ]

  return (
    <Grid container spacing={3}>
      {statItems.map((item, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card
            sx={{
              height: '100%',
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <CardContent>
              <Box display='flex' alignItems='center' gap={2}>
                <Avatar
                  sx={{
                    bgcolor: item.bgColor,
                    color: item.color,
                    width: 56,
                    height: 56
                  }}
                >
                  <item.icon fontSize='large' />
                </Avatar>
                <Box flex={1}>
                  <Typography color='textSecondary' variant='body2' gutterBottom sx={{ fontSize: '0.875rem' }}>
                    {item.title}
                  </Typography>
                  <Typography
                    variant='h4'
                    component='div'
                    sx={{
                      fontWeight: 600,
                      color: item.color,
                      lineHeight: 1
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default RoleStatsComponent
