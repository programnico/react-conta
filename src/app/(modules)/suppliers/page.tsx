// app/(modules)/suppliers/page.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
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
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material'
import { Add as AddIcon, Refresh as RefreshIcon, Business as BusinessIcon } from '@mui/icons-material'

// Components
import { useSuppliersRedux } from '@/features/supplier/hooks/useSuppliersRedux'
import SupplierForm from '@/features/supplier/components/SupplierForm'
import SuppliersTable from '@/features/supplier/components/SuppliersTable'
import SupplierFilters from '@/features/supplier/components/SupplierFilters'
import type { Supplier, CreateSupplierRequest } from '@/features/supplier/types'

const SuppliersPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  })

  // Get URL parameters
  const urlPage = Number(searchParams.get('page')) || 1
  const urlPerPage = Number(searchParams.get('per_page')) || 15
  const urlSearch = searchParams.get('search') || ''
  const urlType = searchParams.get('type') || ''
  const urlClassification = searchParams.get('classification') || ''

  const {
    suppliers,
    loading,
    error,
    pagination,
    filters,
    stats,
    loadSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    setFilters,
    clearFilters,
    searchSuppliers,
    refreshData,
    forceResetLoadingStates
  } = useSuppliersRedux({
    autoLoad: false, // We'll manually load with URL params
    pageSize: urlPerPage,
    initialFilters: {
      search: urlSearch,
      type: urlType as any,
      classification: urlClassification as any
    }
  })

  const isEditing = Boolean(selectedSupplier)

  // Load data based on URL parameters
  useEffect(() => {
    const urlFilters = {
      search: urlSearch,
      type: urlType as any,
      classification: urlClassification as any
    }

    loadSuppliers(urlPage, urlFilters)
  }, [urlPage, urlPerPage, urlSearch, urlType, urlClassification])

  // Function to update URL parameters
  const updateUrlParams = (page: number, newFilters?: any) => {
    const params = new URLSearchParams()

    if (page > 1) params.set('page', page.toString())
    if (urlPerPage !== 15) params.set('per_page', urlPerPage.toString())

    const currentFilters = newFilters || filters
    if (currentFilters.search) params.set('search', currentFilters.search)
    if (currentFilters.type) params.set('type', currentFilters.type)
    if (currentFilters.classification) params.set('classification', currentFilters.classification)

    // Always use relative path for current page
    const queryString = params.toString()
    const url = queryString ? `?${queryString}` : ''

    const currentPath = window.location.pathname
    const finalUrl = `${currentPath}${url}`

    router.replace(finalUrl, { scroll: false })
  }

  // Handlers
  const handleOpenForm = (supplier?: Supplier) => {
    // If any loading states are stuck, reset them before opening the form
    if (loading.any) {
      forceResetLoadingStates()
    }

    setSelectedSupplier(supplier || null)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedSupplier(null)
  }

  const handleFormSubmit = async (data: CreateSupplierRequest) => {
    // Set up a timeout to force reset loading states if operation hangs
    const timeoutId = setTimeout(() => {
      forceResetLoadingStates()
    }, 10000) // 10 second timeout

    try {
      if (isEditing && selectedSupplier) {
        await updateSupplier(selectedSupplier.id, data)
        setSnackbar({
          open: true,
          message: 'Proveedor actualizado exitosamente',
          severity: 'success'
        })
      } else {
        await createSupplier(data)
        setSnackbar({
          open: true,
          message: 'Proveedor creado exitosamente',
          severity: 'success'
        })
      }
      handleCloseForm()
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Error al guardar el proveedor',
        severity: 'error'
      })
    } finally {
      // Clear the timeout whether success or error
      clearTimeout(timeoutId)
    }
  }

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (supplierToDelete) {
      try {
        await deleteSupplier(supplierToDelete.id)
        setSnackbar({
          open: true,
          message: 'Proveedor eliminado exitosamente',
          severity: 'success'
        })
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Error al eliminar el proveedor',
          severity: 'error'
        })
      }
    }
    setDeleteConfirmOpen(false)
    setSupplierToDelete(null)
  }

  const handlePageChange = async (event: React.ChangeEvent<unknown>, page: number) => {
    // Only update URL if it's different from current page
    if (page !== urlPage) {
      updateUrlParams(page)
    }
    // Note: loadSuppliers will be called by the useEffect when URL changes
  }

  const handlePageSizeChange = (event: any) => {
    const newPageSize = Number(event.target.value)

    // Update URL with new page size and reset to page 1
    const params = new URLSearchParams()
    params.set('per_page', newPageSize.toString())

    // Keep current filters
    if (filters.search) params.set('search', filters.search)
    if (filters.type) params.set('type', filters.type)
    if (filters.classification) params.set('classification', filters.classification)

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
  if (loading.suppliers && suppliers.length === 0) {
    return (
      <Container maxWidth='xl' sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant='h6' sx={{ mt: 2 }}>
          Cargando proveedores...
        </Typography>
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
              Gestión de Proveedores
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Administra la información de proveedores y sus datos de contacto
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button startIcon={<RefreshIcon />} onClick={handleRefresh} variant='outlined' disabled={loading.suppliers}>
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
              Nuevo Proveedor
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <BusinessIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant='h4' component='div' color='primary'>
                  {stats.total}
                </Typography>
                <Typography color='text.secondary'>Total Proveedores</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant='h4' component='div' color='success.main'>
                  {stats.active}
                </Typography>
                <Typography color='text.secondary'>Activos</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant='h4' component='div' color='info.main'>
                  {stats.local}
                </Typography>
                <Typography color='text.secondary'>Locales</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant='h4' component='div' color='secondary.main'>
                  {stats.foreign}
                </Typography>
                <Typography color='text.secondary'>Extranjeros</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <SupplierFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={searchSuppliers}
        onClear={() => {
          clearFilters()
          updateUrlParams(1, {})
        }}
      />

      {/* Suppliers Table */}
      <SuppliersTable
        suppliers={suppliers}
        loading={loading.suppliers}
        onEdit={handleOpenForm}
        onDelete={handleDeleteClick}
      />

      {/* Pagination */}
      <Box sx={{ mt: 3 }}>
        <Stack spacing={2} alignItems='center'>
          {/* Page Size Selector */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant='body2' color='text.secondary'>
              Elementos por página:
            </Typography>
            <FormControl size='small' sx={{ minWidth: 80 }}>
              <Select value={urlPerPage} onChange={handlePageSizeChange} disabled={loading.suppliers}>
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={15}>15</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
            <Typography variant='body2' color='text.secondary'>
              Total: {pagination.totalItems} elementos
            </Typography>
          </Box>

          {/* Debug Info */}
          <Typography variant='caption' display='block' color='text.disabled'>
            Debug: totalPages={pagination.totalPages}, currentPage={pagination.currentPage}, perPage=
            {pagination.perPage}
          </Typography>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 ? (
            <Pagination
              count={pagination.totalPages}
              page={pagination.currentPage}
              onChange={handlePageChange}
              color='primary'
              size='large'
              disabled={loading.suppliers}
              showFirstButton
              showLastButton
            />
          ) : (
            <Typography variant='body2' color='text.secondary'>
              Todos los elementos están en una sola página
            </Typography>
          )}

          {/* Items Range Info */}
          <Typography variant='caption' color='text.secondary'>
            Mostrando {Math.min((pagination.currentPage - 1) * pagination.perPage + 1, pagination.totalItems)} -{' '}
            {Math.min(pagination.currentPage * pagination.perPage, pagination.totalItems)} de {pagination.totalItems}{' '}
            elementos
          </Typography>
        </Stack>
      </Box>

      {/* Supplier Form Dialog */}
      <SupplierForm
        open={isFormOpen}
        supplier={selectedSupplier}
        loading={loading.creating || loading.updating}
        onSubmit={handleFormSubmit}
        onClose={handleCloseForm}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el proveedor "{supplierToDelete?.business_name}"? Esta acción no se
            puede deshacer.
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
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default SuppliersPage
