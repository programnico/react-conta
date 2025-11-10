// features/supplier/components/SuppliersTable.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Typography,
  Tooltip,
  TableSortLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, Business as BusinessIcon } from '@mui/icons-material'

import SmartPagination from '@/components/pagination/SmartPagination'
import { useSuppliersRedux } from '../hooks/useSuppliersRedux'
import type { Supplier, SupplierFilters } from '../types'

interface SuppliersTableProps {
  filters?: SupplierFilters
}

const SuppliersTableComponent: React.FC<SuppliersTableProps> = ({ filters = {} }) => {
  // Estado local para el diálogo de confirmación de eliminación
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  })

  // Redux state
  const {
    suppliers,
    loading,
    meta,
    needsReload,
    pagination,
    loadSuppliers,
    deleteSupplier,
    setNeedsReload,
    setCurrentPage,
    setRowsPerPage,
    resetPagination,
    openForm
  } = useSuppliersRedux()

  const { currentPage, rowsPerPage } = pagination

  // Memoizar la función de carga para evitar dependencias circulares
  const loadSuppliersWithFilters = useCallback(() => {
    loadSuppliers({
      page: currentPage,
      per_page: rowsPerPage,
      ...filters
    })
  }, [loadSuppliers, currentPage, rowsPerPage, JSON.stringify(filters)])

  // Load initial data and reload when filters or pagination change
  useEffect(() => {
    loadSuppliersWithFilters()
  }, [currentPage, rowsPerPage, loadSuppliersWithFilters])

  // Recargar suppliers cuando se marque needsReload
  useEffect(() => {
    if (needsReload) {
      loadSuppliersWithFilters()
      setNeedsReload(false)
    }
  }, [needsReload, loadSuppliersWithFilters, setNeedsReload])

  // Reset pagination cuando cambien los filtros
  useEffect(() => {
    resetPagination()
  }, [JSON.stringify(filters), resetPagination])

  // Ajustar página si está fuera del rango disponible
  useEffect(() => {
    if (meta && meta.last_page > 0 && currentPage > meta.last_page) {
      setCurrentPage(meta.last_page)
    }
  }, [meta?.last_page, currentPage, setCurrentPage])

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePerPageChange = (perPage: number) => {
    setRowsPerPage(perPage) // Esto ya resetea a página 1 internamente
  }

  // Handlers para eliminación
  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (supplierToDelete) {
      try {
        await deleteSupplier(supplierToDelete.id).unwrap()
        setSnackbar({
          open: true,
          message: 'Proveedor eliminado exitosamente',
          severity: 'success'
        })
        // The table will refresh automatically through needsReload
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

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const formatType = (type: string) => {
    const types = {
      local: 'Local',
      foreign: 'Extranjero'
    }
    return types[type as keyof typeof types] || type
  }

  const formatClassification = (classification: string) => {
    const classifications = {
      none: 'Ninguna',
      small: 'Pequeña',
      medium: 'Mediana',
      large: 'Grande',
      other: 'Otra'
    }
    return classifications[classification as keyof typeof classifications] || classification
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'local':
        return 'primary'
      case 'foreign':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'small':
        return 'success'
      case 'medium':
        return 'warning'
      case 'large':
        return 'error'
      case 'other':
        return 'info'
      default:
        return 'default'
    }
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Razón Social</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Clasificación</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align='center'>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align='center'>
                  <Box py={4}>
                    <Typography variant='body1' color='text.secondary'>
                      No se encontraron proveedores
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map(supplier => (
                <TableRow
                  key={supplier.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <TableCell>
                    <Typography variant='body2' fontWeight='medium'>
                      {supplier.business_name}
                    </Typography>
                    {supplier.tax_id && (
                      <Typography variant='caption' color='text.secondary'>
                        {supplier.tax_id}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>{supplier.name || '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={formatType(supplier.type)}
                      color={getTypeColor(supplier.type) as any}
                      size='small'
                      variant='outlined'
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={formatClassification(supplier.classification)}
                      color={getClassificationColor(supplier.classification) as any}
                      size='small'
                      variant='outlined'
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>{supplier.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>{supplier.phone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={supplier.is_active ? 'Activo' : 'Inactivo'}
                      color={supplier.is_active ? 'success' : 'default'}
                      size='small'
                    />
                  </TableCell>
                  <TableCell align='center'>
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title='Editar'>
                        <IconButton size='small' color='primary' onClick={() => openForm('edit', supplier)}>
                          <EditIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Eliminar'>
                        <IconButton size='small' color='error' onClick={() => handleDeleteClick(supplier)}>
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* SmartPagination integrado */}
      <SmartPagination
        currentPage={currentPage}
        totalPages={meta?.last_page || 1}
        totalItems={meta?.total || 0}
        perPage={rowsPerPage}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
        disabled={loading}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          ¿Estás seguro de que deseas eliminar el proveedor "{supplierToDelete?.business_name}"? Esta acción no se puede
          deshacer.
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
    </Paper>
  )
}

export default SuppliersTableComponent
