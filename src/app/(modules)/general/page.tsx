'use client'

import { Typography, Box, Card, CardContent, Grid } from '@mui/material'
import Link from 'next/link'

export default function GeneralPage() {
  const modules = [
    {
      title: 'Catálogos',
      description: 'Manage system catalogs and master data',
      path: '/general/catalogs',
      icon: '📁'
    }
  ]

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' component='h1' gutterBottom>
        Módulo General
      </Typography>

      <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
        General system configuration and master data management
      </Typography>

      <Grid container spacing={3}>
        {modules.map(module => (
          <Grid item xs={12} sm={6} md={4} key={module.path}>
            <Link href={module.path} style={{ textDecoration: 'none' }}>
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
                    {module.icon}
                  </Typography>
                  <Typography variant='h6' gutterBottom>
                    {module.title}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {module.description}
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
