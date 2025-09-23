'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import { Card, CardContent, Typography, Box, Chip, Button } from '@mui/material'

// Components Imports
import AuthGuard from '@/components/auth/AuthGuard'
import { useAppSelector, useAppDispatch } from '@/hooks/redux'
import { logoutAsync } from '@/store/slices/authSlice'

// Views Imports
import Award from '@views/dashboard/Award'
import Transactions from '@views/dashboard/Transactions'
import WeeklyOverview from '@views/dashboard/WeeklyOverview'
import TotalEarning from '@views/dashboard/TotalEarning'
import LineChart from '@views/dashboard/LineChart'
import DistributedColumnChart from '@views/dashboard/DistributedColumnChart'
import DepositWithdraw from '@views/dashboard/DepositWithdraw'
import SalesByCountries from '@views/dashboard/SalesByCountries'
import CardStatVertical from '@components/card-statistics/Vertical'
import Table from '@views/dashboard/Table'

const DashboardContent = () => {
  const dispatch = useAppDispatch()
  const { user, accessToken, isAuthenticated } = useAppSelector(state => state.auth)

  const handleLogout = () => {
    dispatch(logoutAsync())
  }

  return (
    <Grid container spacing={6}>
      {/* User Info Card */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box display='flex' justifyContent='space-between' alignItems='center'>
              <Box>
                <Typography variant='h5' component='h1' gutterBottom>
                  🎉 ¡Bienvenido al Dashboard!
                </Typography>
                <Typography variant='body1' color='text.secondary' gutterBottom>
                  Sistema de autenticación con Redux funcionando correctamente
                </Typography>
                <Box display='flex' gap={1} alignItems='center' flexWrap='wrap'>
                  <Chip label={`✅ Autenticado: ${isAuthenticated ? 'Sí' : 'No'}`} color='success' size='small' />
                  {user && (
                    <Chip label={`👤 Usuario: ${user.email || user.name || 'N/A'}`} color='primary' size='small' />
                  )}
                  <Chip
                    label={`🔑 Token: ${accessToken ? 'Presente' : 'No disponible'}`}
                    color={accessToken ? 'success' : 'warning'}
                    size='small'
                  />
                </Box>
              </Box>
              <Button variant='outlined' color='error' onClick={handleLogout} size='small'>
                🚪 Cerrar Sesión
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Dashboard Components */}
      <Grid item xs={12} md={4}>
        <Award />
      </Grid>
      <Grid item xs={12} md={8} lg={8}>
        <Transactions />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <WeeklyOverview />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <TotalEarning />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={6}>
            <LineChart />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CardStatVertical
              title='Total Profit'
              stats='$25.6k'
              avatarIcon='ri-pie-chart-2-line'
              avatarColor='secondary'
              subtitle='Weekly Profit'
              trendNumber='42%'
              trend='positive'
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CardStatVertical
              stats='862'
              trend='negative'
              trendNumber='18%'
              title='New Project'
              subtitle='Yearly Project'
              avatarColor='primary'
              avatarIcon='ri-file-word-2-line'
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DistributedColumnChart />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <SalesByCountries />
      </Grid>
      <Grid item xs={12} lg={8}>
        <DepositWithdraw />
      </Grid>
      <Grid item xs={12}>
        <Table />
      </Grid>
    </Grid>
  )
}

const DashboardAnalytics = () => {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}

export default DashboardAnalytics
