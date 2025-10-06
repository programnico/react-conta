// app/(modules)/products/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import type { Product, CreateProductRequest } from '@/features/product/types'

const ProductsPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  })

  // Get URL parameters
  const urlPage = Number(searchParams.get('page')) || 1
  const urlPerPage = Number(searchParams.get('per_page')) || 15
  const urlSearch = searchParams.get('search') || ''
  const urlCategory = searchParams.get('category') || ''
  const urlIsActive = searchParams.get('is_active')

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
    setFilters,
    clearFilters,
    searchProducts,
    refreshData,
    forceResetLoadingStates
  } = useProductsRedux({
    autoLoad: false, // We'll manually load with URL params
    pageSize: urlPerPage,
    initialFilters: {
      search: urlSearch,
      category: urlCategory,
      is_active: urlIsActive === 'true' ? true : urlIsActive === 'false' ? false : undefined
    }
  })

  const isEditing = Boolean(selectedProduct)

  // Load data based on URL parameters
  useEffect(() => {
    const urlFilters = {
      search: urlSearch,
      category: urlCategory,
      is_active: urlIsActive === 'true' ? true : urlIsActive === 'false' ? false : undefined
    }

    loadProducts(urlPage, urlFilters)
  }, [urlPage, urlPerPage, urlSearch, urlCategory, urlIsActive, loadProducts])

  // Function to update URL parameters
  const updateUrlParams = (page: number, newFilters?: any) => {
    const params = new URLSearchParams()

    if (page > 1) params.set('page', page.toString())
    if (urlPerPage !== 15) params.set('per_page', urlPerPage.toString())

    const currentFilters = newFilters || filters
    if (currentFilters.search) params.set('search', currentFilters.search)
    if (currentFilters.category) params.set('category', currentFilters.category)
    if (currentFilters.is_active !== undefined) params.set('is_active', currentFilters.is_active.toString())

    // Always use relative path for current page
    const queryString = params.toString()
    const url = queryString ? `?${queryString}` : ''

    const currentPath = window.location.pathname
    const finalUrl = `${currentPath}${url}`

    router.replace(finalUrl, { scroll: false })
  }

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

  const handlePageChange = async (event: React.ChangeEvent<unknown>, page: number) => {
    // Only update URL if it's different from current page
    if (page !== urlPage) {
      updateUrlParams(page)
    }
    // Note: loadProducts will be called by the useEffect when URL changes
  }

  const handlePageSizeChange = (event: any) => {
    const newPageSize = Number(event.target.value)

    // Update URL with new page size and reset to page 1
    const params = new URLSearchParams()
    params.set('per_page', newPageSize.toString())

    // Keep current filters
    if (filters.search) params.set('search', filters.search)
    if (filters.category) params.set('category', filters.category)
    if (filters.is_active !== undefined) params.set('is_active', filters.is_active.toString())

    const currentPath = window.location.pathname
    const queryString = params.toString()
    const finalUrl = `${currentPath}?${queryString}`

    router.replace(finalUrl, { scroll: false })
  }

  const handleRefresh = async () => {
    await refreshData()
  }

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
    updateUrlParams(1, newFilters) // Reset to page 1 when filters change
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box display='flex' justifyContent='space-between' alignItems='center' mt={3}>
          <Stack direction='row' spacing={2} alignItems='center'>
            <Typography variant='body2' color='text.secondary'>
              Elementos por página:
            </Typography>
            <FormControl size='small'>
              <Select value={pagination.perPage} onChange={handlePageSizeChange} disabled={loading.any}>
                {[5, 10, 15, 25, 50, 100].map(size => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant='body2' color='text.secondary'>
              {`${(pagination.currentPage - 1) * pagination.perPage + 1}-${Math.min(
                pagination.currentPage * pagination.perPage,
                pagination.totalItems
              )} de ${pagination.totalItems}`}
            </Typography>
          </Stack>

          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={handlePageChange}
            disabled={loading.any}
            showFirstButton
            showLastButton
            size='large'
          />
        </Box>
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
