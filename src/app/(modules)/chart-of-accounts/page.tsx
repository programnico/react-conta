'use client'

import React, { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material'
import { Add as AddIcon, Refresh as RefreshIcon, AccountTree as AccountTreeIcon } from '@mui/icons-material'

// Components
import AuthGuard from '@/components/auth/AuthGuard'
import {
  ChartOfAccountsTable,
  ChartOfAccountsFilters,
  ChartOfAccountsForm,
  useChartOfAccountsRedux
} from '@/features/chart-of-accounts'
import type { ChartOfAccount, CreateChartOfAccountRequest } from '@/features/chart-of-accounts'

const ChartOfAccountsPage = () => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<ChartOfAccount | null>(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  })

  const {
    accounts,
    loading,
    loadingStates,
    error,
    clearError,
    setNeedsReload,
    isFormOpen,
    formMode,
    openForm,
    closeForm,
    deleteAccount
  } = useChartOfAccountsRedux()

  // Calculate stats from accounts for display
  const stats = React.useMemo(() => {
    if (!accounts.length) return null

    return {
      total: accounts.length,
      active: accounts.filter(acc => acc.is_active).length,
      inactive: accounts.filter(acc => !acc.is_active).length,
      byType: accounts.reduce(
        (acc, account) => {
          acc[account.account_type] = (acc[account.account_type] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),
      byLevel: accounts.reduce(
        (acc, account) => {
          acc[account.level] = (acc[account.level] || 0) + 1
          return acc
        },
        {} as Record<number, number>
      )
    }
  }, [accounts])

  const rootAccounts = React.useMemo(() => {
    return accounts.filter(acc => acc.parent_account_id === null)
  }, [accounts])

  // Handlers
  const handleOpenForm = (account?: ChartOfAccount) => {
    if (account) {
      openForm('edit', account)
    } else {
      openForm('create')
    }
  }

  const handleCloseForm = () => {
    closeForm()
    clearError()
  }

  const handleFormSuccess = () => {
    setSnackbar({
      open: true,
      message: `Cuenta ${formMode === 'create' ? 'creada' : 'actualizada'} exitosamente`,
      severity: 'success'
    })
    handleCloseForm()
  }

  const handleEdit = (account: ChartOfAccount) => {
    handleOpenForm(account)
  }

  const handleDeleteClick = (account: ChartOfAccount) => {
    setAccountToDelete(account)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (accountToDelete) {
      try {
        await deleteAccount(accountToDelete.id).unwrap()
        setSnackbar({
          open: true,
          message: 'Cuenta eliminada exitosamente',
          severity: 'success'
        })
        // The table will refresh automatically through needsReload
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Error al eliminar la cuenta',
          severity: 'error'
        })
      }
    }
    setDeleteConfirmOpen(false)
    setAccountToDelete(null)
  }

  const handleRefresh = () => {
    // Force a complete reload by setting needsReload
    setNeedsReload(true)
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  return (
    <AuthGuard>
      <Container maxWidth='xl' sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
            <Box display='flex' alignItems='center' gap={2}>
              <AccountTreeIcon sx={{ fontSize: 32 }} />
              <Typography variant='h4' component='h1'>
                Plan de Cuentas
              </Typography>
            </Box>

            <Box display='flex' gap={1}>
              <Button startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={loadingStates?.fetching}>
                Actualizar
              </Button>
              <Button
                variant='contained'
                startIcon={<AddIcon />}
                onClick={() => handleOpenForm()}
                disabled={loadingStates?.fetching}
              >
                Nueva Cuenta
              </Button>
            </Box>
          </Box>

          {/* Stats Cards */}
          {stats && (
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant='h4' color='primary.main'>
                      {stats.total}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Total Cuentas
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant='h4' color='success.main'>
                      {stats.active}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Activas
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant='h4' color='text.secondary'>
                      {stats.inactive}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Inactivas
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant='h4' color='info.main'>
                      {Object.keys(stats.byType).length}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Tipos
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant='h4' color='warning.main'>
                      {Object.keys(stats.byLevel).length}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Niveles
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>

        {/* Filters */}
        <Box mb={3}>
          <ChartOfAccountsFilters rootAccounts={rootAccounts} />
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Chart of Accounts Table */}
        <ChartOfAccountsTable onEdit={handleEdit} onDelete={handleDeleteClick} />

        {/* Chart of Accounts Form Dialog */}
        <ChartOfAccountsForm
          open={isFormOpen}
          mode={formMode}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent>
            ¿Estás seguro de que deseas eliminar la cuenta "{accountToDelete?.account_name}"?
            {accountToDelete?.child_accounts && accountToDelete.child_accounts.length > 0 && (
              <Alert severity='warning' sx={{ mt: 2 }}>
                Esta cuenta tiene subcuentas asociadas y no puede ser eliminada.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleConfirmDelete}
              color='error'
              variant='contained'
              disabled={loading || (accountToDelete?.child_accounts && accountToDelete.child_accounts.length > 0)}
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </AuthGuard>
  )
}

export default ChartOfAccountsPage
