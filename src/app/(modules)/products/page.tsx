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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material'
import { Add as AddIcon, Refresh as RefreshIcon, Inventory as InventoryIcon } from '@mui/icons-material'

// Components
import { useProductsRedux } from '@/features/product/hooks/useProductsRedux'
import ProductForm from '@/features/product/components/ProductForm'
import ProductsTable from '@/features/product/components/ProductsTable'
import ProductFilters from '@/features/product/components/ProductFilters'
import type { Product, ProductFilters as ProductFiltersType } from '@/features/product/types'

const ProductsPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  })

  // Redux state
  const {
    products,
    loading,
    error,
    filters,
    selectedProduct,
    deleteProduct,
    searchProducts,
    clearError,
    setSelectedProduct,
    clearSelectedProduct,
    setFilters
  } = useProductsRedux()

  // Calculate stats from products
  // const stats = React.useMemo(() => {
  //   if (!products.length) return null

  //   return {
  //     total: products.length,
  //     active: products.filter(p => p.is_active).length,
  //     inactive: products.filter(p => !p.is_active).length,
  //     lowStock: products.filter(p => parseFloat(p.stock_quantity) < 10).length,
  //     categories: new Set(products.map(p => p.category)).size
  //   }
  // }, [products])

  // Handlers
  const handleOpenForm = (product?: Product) => {
    if (product) {
      setSelectedProduct(product)
      setFormMode('edit')
    } else {
      clearSelectedProduct()
      setFormMode('create')
    }
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    clearSelectedProduct()
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

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.id).unwrap()
        setSnackbar({
          open: true,
          message: 'Producto eliminado exitosamente',
          severity: 'success'
        })
        // The table will refresh automatically through its useEffect
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Error al eliminar el producto',
          severity: 'error'
        })
      }
    }
    setDeleteConfirmOpen(false)
    setProductToDelete(null)
  }

  const handleRefresh = () => {
    // Force a re-render by clearing and setting filters
    setFilters({ ...filters })
  }

  const handleFiltersChange = (newFilters: ProductFiltersType) => {
    setFilters(newFilters)
  }

  const handleSearch = (query: string) => {
    searchProducts({ query, filters, pageSize: 15 })
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  // Show loading spinner for initial load
  if (loading && products.length === 0) {
    return (
      <Container maxWidth='xl' sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant='h6' sx={{ mt: 2 }}>
          Cargando productos...
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
            <InventoryIcon sx={{ fontSize: 32 }} />
            <Typography variant='h4' component='h1'>
              Gestión de Productos
            </Typography>
          </Box>

          <Box display='flex' gap={1}>
            <Button startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={loading}>
              Actualizar
            </Button>
            <Button variant='contained' startIcon={<AddIcon />} onClick={() => handleOpenForm()} disabled={loading}>
              Nuevo Producto
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        {/* {stats && (
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
        )} */}
      </Box>

      {/* Filters */}
      <Box mb={3}>
        <ProductFilters filters={filters} onFiltersChange={handleFiltersChange} onSearch={handleSearch} />
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Products Table con paginador integrado */}
      <ProductsTable onEdit={handleOpenForm} onDelete={handleDeleteClick} filters={filters} />

      {/* Product Form Dialog */}
      <ProductForm open={isFormOpen} mode={formMode} onClose={handleCloseForm} onSuccess={handleFormSuccess} />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          ¿Estás seguro de que deseas eliminar el producto "{productToDelete?.name}"? Esta acción no se puede deshacer.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color='error' variant='contained' disabled={loading}>
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
  )
}

export default ProductsPage
