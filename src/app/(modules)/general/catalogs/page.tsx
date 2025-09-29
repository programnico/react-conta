'use client'

import { Typography, Box, Card, CardContent, Grid } from '@mui/material'
import Link from 'next/link'

export default function CatalogsPage() {
  const catalogs = [
    {
      title: 'Period Name',
      description: 'Manage period names for your system',
      path: '/general/catalogs/period-name',
      icon: '📅'
    }
  ]

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' component='h1' gutterBottom>
        Catálogos Generales
      </Typography>

      <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
        Manage system catalogs and configurations
      </Typography>

      <Grid container spacing={3}>
        {catalogs.map(catalog => (
          <Grid item xs={12} sm={6} md={4} key={catalog.path}>
            <Link href={catalog.path} style={{ textDecoration: 'none' }}>
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
                    {catalog.icon}
                  </Typography>
                  <Typography variant='h6' gutterBottom>
                    {catalog.title}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {catalog.description}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
