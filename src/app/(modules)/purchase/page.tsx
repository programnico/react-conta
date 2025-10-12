// app/(modules)/purchase/page.tsx
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
  Pagination,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material'
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material'

// Components
import { usePurchasesRedux as usePurchases } from '@/features/purchase/hooks/usePurchasesRedux'
import PurchaseForm from '@/features/purchase/components/PurchaseForm'
import PurchasesTable from '@/features/purchase/components/PurchasesTable'
import PurchaseFilters from '@/features/purchase/components/PurchaseFilters'
import type { Purchase, CreatePurchaseRequest } from '@/features/purchase/types'

const PurchasePage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [purchaseToDelete, setPurchaseToDelete] = useState<Purchase | null>(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  })

  const {
    purchases,
    suppliers,
    loading,
    error,
    pagination,
    filters,
    stats,
    loadPurchases,
    createPurchase,
    updatePurchase,
    deletePurchase,
    setFilters,
    clearFilters,
    searchPurchases,
    refreshData,
    forceResetLoadingStates
  } = usePurchases({
    autoLoad: true,
    pageSize: 15
  })

  const isEditing = Boolean(selectedPurchase)

  // Handlers
  const handleOpenForm = (purchase?: Purchase) => {
    // If any loading states are stuck, reset them before opening the form
    if (loading.any) {
      forceResetLoadingStates()
    }

    setSelectedPurchase(purchase || null)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedPurchase(null)
  }

  const handleFormSubmit = async (data: CreatePurchaseRequest) => {
    // Set up a timeout to force reset loading states if operation hangs
    const timeoutId = setTimeout(() => {
      forceResetLoadingStates()
    }, 10000) // 10 second timeout

    try {
      if (isEditing && selectedPurchase) {
        await updatePurchase(selectedPurchase.id, data)
        setSnackbar({
          open: true,
          message: 'Compra actualizada exitosamente',
          severity: 'success'
        })
      } else {
        await createPurchase(data)
        setSnackbar({
          open: true,
          message: 'Compra creada exitosamente',
          severity: 'success'
        })
      }
      handleCloseForm()
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Error al guardar la compra',
        severity: 'error'
      })
    } finally {
      // Clear the timeout whether success or error
      clearTimeout(timeoutId)
    }
  }

  const handleDeleteClick = (purchase: Purchase) => {
    setPurchaseToDelete(purchase)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (purchaseToDelete) {
      try {
        await deletePurchase(purchaseToDelete.id)
        setSnackbar({
          open: true,
          message: 'Compra eliminada exitosamente',
          severity: 'success'
        })
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Error al eliminar la compra',
          severity: 'error'
        })
      }
    }
    setDeleteConfirmOpen(false)
    setPurchaseToDelete(null)
  }

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    loadPurchases(page, filters)
  }

  const handleRefresh = () => {
    refreshData()
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // Show loading spinner for initial load
  if (loading.purchases && purchases.length === 0) {
    return (
      <Container maxWidth='xl' sx={{ py: 4 }}>
        <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
          <CircularProgress size={60} />
          <Typography variant='h6' sx={{ ml: 2 }}>
            Cargando gestión de compras...
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth='xl' sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant='h4' component='h1' gutterBottom>
              Gestión de Compras
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Administra las compras, proveedores y documentos de la empresa
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button startIcon={<RefreshIcon />} onClick={handleRefresh} variant='outlined' disabled={loading.purchases}>
              Actualizar
            </Button>
            {loading.any && (
              <Button onClick={forceResetLoadingStates} variant='outlined' color='warning' size='small'>
                Reset Loading
              </Button>
            )}
            <Button
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
              variant='contained'
              disabled={loading.creating}
            >
              Nueva Compra
            </Button>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant='h6' color='text.secondary'>
                  Total Compras
                </Typography>
                <Typography variant='h4'>{pagination.totalItems}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant='h6' color='warning.main'>
                  Pendientes
                </Typography>
                <Typography variant='h4'>{stats.pending}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant='h6' color='success.main'>
                  Recibidas
                </Typography>
                <Typography variant='h4'>{stats.received}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant='h6' color='text.secondary'>
                  Total Monto
                </Typography>
                <Typography variant='h4'>${stats.totalAmount.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Error Display */}
        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Filters */}
      <PurchaseFilters
        filters={filters}
        suppliers={suppliers}
        onFiltersChange={setFilters}
        onSearch={searchPurchases}
        onClear={clearFilters}
      />

      {/* Purchases Table */}
      <PurchasesTable
        purchases={purchases}
        loading={loading.purchases}
        onEdit={handleOpenForm}
        onDelete={handleDeleteClick}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={handlePageChange}
            color='primary'
            size='large'
            disabled={loading.purchases}
          />
        </Box>
      )}

      {/* Purchase Form Dialog */}
      <PurchaseForm
        open={isFormOpen}
        purchase={selectedPurchase}
        suppliers={suppliers}
        loading={loading.creating || loading.updating}
        onSubmit={handleFormSubmit}
        onClose={handleCloseForm}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de que desea eliminar la compra {purchaseToDelete?.document_number}? Esta acción no se puede
            deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color='error' variant='contained' disabled={loading.deleting}>
            {loading.deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant='filled'>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default PurchasePage
