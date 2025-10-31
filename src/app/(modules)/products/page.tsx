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
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  Stack
} from '@mui/material'
import { Add as AddIcon, Refresh as RefreshIcon, Inventory as InventoryIcon } from '@mui/icons-material'

// Components
import { useProductsRedux } from '@/features/product/hooks/useProductsRedux'
import ProductForm from '@/features/product/components/ProductForm'
import ProductsTable from '@/features/product/components/ProductsTable'
import ProductFilters from '@/features/product/components/ProductFilters'
import SmartPagination from '@/components/pagination/SmartPagination'
import type { Product, CreateProductRequest } from '@/features/product/types'

const ProductsPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  })

  // Redux-based state management (no URL dependencies)
  const {
    products,
    loading,
    error,
    pagination,
    filters,
    stats,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    refreshData,
    forceResetLoadingStates,
    // New pagination actions
    goToPage,
    changePageSize,
    setFiltersAndGoToFirstPage
  } = useProductsRedux({
    autoLoad: true, // Auto-load with default settings
    pageSize: 15,
    initialFilters: {}
  })

  const isEditing = Boolean(selectedProduct)

  // Handlers
  const handleOpenForm = (product?: Product) => {
    // If any loading states are stuck, reset them before opening the form
    if (loading.any) {
      forceResetLoadingStates()
    }

    setSelectedProduct(product || null)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedProduct(null)
  }

  const handleFormSubmit = async (data: CreateProductRequest) => {
    // Set up a timeout to force reset loading states if operation hangs
    const timeoutId = setTimeout(() => {
      forceResetLoadingStates()
    }, 10000) // 10 second timeout

    try {
      if (isEditing && selectedProduct) {
        await updateProduct(selectedProduct.id, data)
        setSnackbar({
          open: true,
          message: 'Producto actualizado exitosamente',
          severity: 'success'
        })
      } else {
        await createProduct(data)
        setSnackbar({
          open: true,
          message: 'Producto creado exitosamente',
          severity: 'success'
        })
      }
      handleCloseForm()
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Error al guardar el producto',
        severity: 'error'
      })
    } finally {
      // Clear the timeout whether success or error
      clearTimeout(timeoutId)
    }
  }

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.id)
        setSnackbar({
          open: true,
          message: 'Producto eliminado exitosamente',
          severity: 'success'
        })
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

  // Pure Redux handlers (no URL manipulation)
  const handleRefresh = async () => {
    await refreshData()
  }

  const handleFiltersChange = (newFilters: any) => {
    setFiltersAndGoToFirstPage(newFilters)
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  // Show loading spinner for initial load
  if (loading.products && products.length === 0) {
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
            <Button startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={loading.any}>
              Actualizar
            </Button>
            <Button variant='contained' startIcon={<AddIcon />} onClick={() => handleOpenForm()} disabled={loading.any}>
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
        <ProductFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={query => searchProducts(query, filters)}
        />
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Products Table */}
      <Box mb={3}>
        <ProductsTable products={products} onEdit={handleOpenForm} onDelete={handleDeleteClick} loading={loading.any} />
      </Box>

      {/* Smart Pagination - Always visible when there's data */}
      {pagination.totalItems > 0 && (
        <SmartPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          perPage={pagination.perPage}
          onPageChange={goToPage}
          onPerPageChange={changePageSize}
          perPageOptions={[5, 10, 15, 25, 50, 100]}
          disabled={loading.any}
          showPageInfo={true}
          pageWindow={3} // Mostrar 3 páginas antes y después de la actual
        />
      )}

      {/* Product Form Dialog */}
      <ProductForm
        open={isFormOpen}
        product={selectedProduct}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        loading={loading.creating || loading.updating}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          ¿Estás seguro de que deseas eliminar el producto "{productToDelete?.name}"? Esta acción no se puede deshacer.
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default ProductsPage
