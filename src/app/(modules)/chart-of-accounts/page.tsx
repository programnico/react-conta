'use client'

import React, { useState, useEffect } from 'react'
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
import {
  ChartOfAccountsTable,
  ChartOfAccountsFilters,
  ChartOfAccountsForm,
  useChartOfAccounts
} from '@/features/chart-of-accounts'
import type { ChartOfAccount, CreateChartOfAccountRequest } from '@/features/chart-of-accounts'

const ChartOfAccountsPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccount | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<ChartOfAccount | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  })

  const {
    accounts,
    loading,
    error,
    stats,
    pagination,
    filters,
    rootAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    refreshData,
    clearError,
    loadAccounts,
    setFilters,
    clearFilters
  } = useChartOfAccounts({
    autoLoad: false,
    pageSize: 15
  })

  const isEditing = formMode === 'edit'

  // Load data on component mount
  useEffect(() => {
    loadAccounts(1, {})
  }, []) // Sin dependencias para evitar bucles

  // Handlers
  const handleOpenForm = (account?: ChartOfAccount) => {
    setSelectedAccount(account || null)
    setFormMode(account ? 'edit' : 'create')
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedAccount(null)
    clearError()
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
        await deleteAccount(accountToDelete.id)
        setSnackbar({
          open: true,
          message: 'Cuenta eliminada exitosamente',
          severity: 'success'
        })
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

  const handleRefresh = async () => {
    await refreshData()
  }

  const handlePageChange = async (page: number) => {
    await loadAccounts(page, filters)
  }

  const handleRowsPerPageChange = async (rowsPerPage: number) => {
    // Reset to page 1 when changing page size
    await loadAccounts(1, filters, rowsPerPage)
  }

  const handleFiltersChange = async (newFilters: any) => {
    setFilters(newFilters)
    await loadAccounts(1, newFilters)
  }

  const handleClearFilters = async () => {
    clearFilters()
    await loadAccounts(1, {})
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  // Show loading spinner for initial load
  if (loading.accounts && accounts.length === 0) {
    return (
      <Container maxWidth='xl' sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant='h6' sx={{ mt: 2 }}>
          Cargando plan de cuentas...
        </Typography>
      </Container>
    )
  }

  return (
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
            <Button startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={loading.any}>
              Actualizar
            </Button>
            <Button variant='contained' startIcon={<AddIcon />} onClick={() => handleOpenForm()} disabled={loading.any}>
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
        <ChartOfAccountsFilters
          filters={filters}
          rootAccounts={rootAccounts}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Chart of Accounts Table */}
      <Box mb={3}>
        <ChartOfAccountsTable
          accounts={accounts}
          loading={loading}
          pagination={pagination}
          filters={filters}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          enableActions={true}
        />
      </Box>

      {/* Chart of Accounts Form Dialog */}
      <ChartOfAccountsForm open={isFormOpen} onClose={handleCloseForm} account={selectedAccount} mode={formMode} />

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
            disabled={
              loading.deleting || (accountToDelete?.child_accounts && accountToDelete.child_accounts.length > 0)
            }
          >
            {loading.deleting ? 'Eliminando...' : 'Eliminar'}
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
  )
}

export default ChartOfAccountsPage
