// app/(modules)/products/page.tsx
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
  CircularProgress
} from '@mui/material'
import { Add as AddIcon, Refresh as RefreshIcon, Inventory as InventoryIcon } from '@mui/icons-material'

// Components
import { useProductsRedux } from '@/features/product/hooks/useProductsRedux'
import ProductForm from '@/features/product/components/ProductForm'
import ProductsTable from '@/features/product/components/ProductsTable'
import ProductFilters from '@/features/product/components/ProductFilters'

const ProductsPage = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  })

  // Redux state
  const {
    products,
    loading,
    loadingStates,
    error,
    clearError,
    setNeedsReload,
    isFormOpen,
    formMode,
    openForm,
    closeForm
  } = useProductsRedux()

  // Calculate stats from products
  const stats = React.useMemo(() => {
    if (!products.length) return null

    return {
      total: products.length,
      active: products.filter(p => p.is_active).length,
      inactive: products.filter(p => !p.is_active).length,
      lowStock: products.filter(p => parseFloat(p.stock_quantity) < 10).length,
      categories: new Set(products.map(p => p.category)).size
    }
  }, [products])

  // Handlers
  const handleOpenForm = () => {
    openForm('create')
  }

  const handleCloseForm = () => {
    closeForm()
    clearError()
  }

  const handleFormSuccess = () => {
    setSnackbar({
      open: true,
      message: `Producto ${formMode === 'create' ? 'creado' : 'actualizado'} exitosamente`,
      severity: 'success'
    })
    handleCloseForm()
  }

  const handleRefresh = () => {
    // Force a complete reload by setting needsReload
    setNeedsReload(true)
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  return (
    <Container maxWidth='xl' sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
          <Box display='flex' alignItems='center' gap={2}>
            <InventoryIcon sx={{ fontSize: 32 }} />
            <Typography variant='h4' component='h1'>
              Gestión de Productos
            </Typography>
          </Box>

          <Box display='flex' gap={1}>
            <Button startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={loadingStates.fetching}>
              Actualizar
            </Button>
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
              disabled={loadingStates.fetching}
            >
              Nuevo Producto
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
                    Total
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
                    Activos
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
                    Inactivos
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant='h4' color='warning.main'>
                    {stats.lowStock}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Stock Bajo
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant='h4' color='info.main'>
                    {stats.categories}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Categorías
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Filters */}
      <Box mb={3}>
        <ProductFilters />
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Products Table con paginador integrado */}
      <ProductsTable />

      {/* Product Form Dialog */}
      <ProductForm open={isFormOpen} mode={formMode} onClose={handleCloseForm} onSuccess={handleFormSuccess} />

      {/* Snackbar for notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default ProductsPage
