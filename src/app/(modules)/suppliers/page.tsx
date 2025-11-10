// app/(modules)/suppliers/page.tsx
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
import { Add as AddIcon, Refresh as RefreshIcon, Business as BusinessIcon } from '@mui/icons-material'

// Components
import { useSuppliersRedux } from '@/features/supplier/hooks/useSuppliersRedux'
import SupplierForm from '@/features/supplier/components/SupplierForm'
import SuppliersTable from '@/features/supplier/components/SuppliersTable'
import SupplierFilters from '@/features/supplier/components/SupplierFilters'
import type { Supplier, SupplierFilters as SupplierFiltersType } from '@/features/supplier/types'

const SuppliersPage = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  })

  // Redux state
  const {
    suppliers,
    loading,
    error,
    filters,
    selectedSupplier,
    searchSuppliers,
    clearError,
    setSelectedSupplier,
    clearSelectedSupplier,
    setFilters,
    setNeedsReload,
    isFormOpen,
    formMode,
    openForm,
    closeForm
  } = useSuppliersRedux()

  // Calculate stats from suppliers
  const stats = React.useMemo(() => {
    if (!suppliers.length) return null

    return {
      total: suppliers.length,
      active: suppliers.filter(s => s.is_active).length,
      inactive: suppliers.filter(s => !s.is_active).length,
      local: suppliers.filter(s => s.type === 'local').length,
      foreign: suppliers.filter(s => s.type === 'foreign').length,
      byClassification: {
        none: suppliers.filter(s => s.classification === 'none').length,
        small: suppliers.filter(s => s.classification === 'small').length,
        medium: suppliers.filter(s => s.classification === 'medium').length,
        large: suppliers.filter(s => s.classification === 'large').length,
        other: suppliers.filter(s => s.classification === 'other').length
      }
    }
  }, [suppliers])

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
      message: `Proveedor ${formMode === 'create' ? 'creado' : 'actualizado'} exitosamente`,
      severity: 'success'
    })
    handleCloseForm()
  }

  const handleRefresh = () => {
    // Force a complete reload by setting needsReload
    setNeedsReload(true)
  }

  const handleFiltersChange = (newFilters: SupplierFiltersType) => {
    setFilters(newFilters)

    // Si se están limpiando todos los filtros, forzar recarga para volver a datos originales
    const hasActiveFilters = Object.values(newFilters).some(
      value => value !== undefined && value !== null && value !== ''
    )

    if (!hasActiveFilters) {
      // Limpiar error y forzar recarga completa
      clearError()
      setNeedsReload(true)
    }
  }

  const handleSearch = (query: string) => {
    searchSuppliers({ query, filters, pageSize: 15 })
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  // Show loading spinner for initial load
  if (loading && suppliers.length === 0) {
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
      <Box mb={4}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
          <Box display='flex' alignItems='center' gap={2}>
            <BusinessIcon sx={{ fontSize: 32 }} />
            <Typography variant='h4' component='h1'>
              Gestión de Proveedores
            </Typography>
          </Box>

          <Box display='flex' gap={1}>
            <Button startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={loading}>
              Actualizar
            </Button>
            <Button variant='contained' startIcon={<AddIcon />} onClick={() => handleOpenForm()} disabled={loading}>
              Nuevo Proveedor
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
                  <Typography variant='h4' color='info.main'>
                    {stats.local}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Locales
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant='h4' color='warning.main'>
                    {stats.foreign}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Extranjeros
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Filters */}
      <Box mb={3}>
        <SupplierFilters filters={filters} onFiltersChange={handleFiltersChange} onSearch={handleSearch} />
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Suppliers Table con paginador integrado */}
      <SuppliersTable filters={filters} />

      {/* Supplier Form Dialog */}
      <SupplierForm open={isFormOpen} mode={formMode} onClose={handleCloseForm} onSuccess={handleFormSuccess} />

      {/* Snackbar for notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default SuppliersPage
