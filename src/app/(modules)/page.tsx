'use client'

import { Typography, Box, Grid, Card, CardContent } from '@mui/material'
import Link from 'next/link'

export default function ModulesDashboard() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' component='h1' gutterBottom>
        Dashboard Principal
      </Typography>

      <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
        Sistema de gestión empresarial - Panel de control
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Link href='/general' style={{ textDecoration: 'none' }}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              <CardContent>
                <Typography variant='h2' sx={{ mb: 2, textAlign: 'center' }}>
                  ⚙️
                </Typography>
                <Typography variant='h6' gutterBottom>
                  Módulo General
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Configuraciones generales y catálogos maestros
                </Typography>
              </CardContent>
            </Card>
          </Link>
        </Grid>
      </Grid>
    </Box>
  )
}
