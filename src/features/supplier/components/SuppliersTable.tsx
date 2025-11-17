// features/supplier/components/SuppliersTable.tsx
'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
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

import { useSuppliersRedux } from '../hooks/useSuppliersRedux'
import type { Supplier, SupplierFilters } from '../types'
import SmartPagination from './SmartPagination'

interface SuppliersTableProps {
  // No props needed - everything through Redux
}

const SuppliersTableComponent: React.FC<SuppliersTableProps> = () => {
  // Estado local para UI
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
    loadingStates,
    needsReload,
    pagination,
    filters,
    loadSuppliers,
    deleteSupplier,
    setNeedsReload,
    setCurrentPage,
    setRowsPerPage,
    resetPagination,
    openForm
  } = useSuppliersRedux()

  const { currentPage, rowsPerPage, totalPages, totalRecords } = pagination

  // Referencias para controlar efectos
  const isInitialMount = useRef(true)
  const lastLoadParamsRef = useRef<string>('')
  const loadTimeoutRef = useRef<NodeJS.Timeout>()

  // Memoizar filtros para evitar recreaciones de JSON.stringify
  const memoizedFilters = useMemo(() => filters, [JSON.stringify(filters)])

  // === ÚNICO CONTROLADOR DE CARGA CON DEBOUNCE INTERNO ===
  // Este useEffect maneja TODA la lógica de carga: inicial, filtros, paginación, needsReload
  useEffect(() => {
    // Limpiar timeout previo
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current)
    }

    const executeLoad = () => {
      // Parámetros actuales para la carga
      const loadParams = {
        page: currentPage,
        per_page: rowsPerPage,
        ...memoizedFilters
      }
      const paramsString = JSON.stringify(loadParams)

      // Condiciones para cargar
      const shouldLoad =
        isInitialMount.current || // Carga inicial
        needsReload || // Forzar recarga (CRUD operations, limpiar filtros, etc.)
        lastLoadParamsRef.current !== paramsString // Cambio en filtros/paginación

      // Prevenir llamada si ya está cargando la misma petición
      const isAlreadyLoading = loadingStates?.fetching || loadingStates?.searching

      if (shouldLoad && !isAlreadyLoading) {
        lastLoadParamsRef.current = paramsString

        loadSuppliers(loadParams).finally(() => {
          isInitialMount.current = false

          // Limpiar needsReload solo si era por esa razón
          if (needsReload) {
            setNeedsReload(false)
          }
        })
      }
    }

    // Para carga inicial o needsReload, ejecutar inmediatamente
    if (isInitialMount.current || needsReload) {
      executeLoad()
    } else {
      // Para otros cambios, debounce de 100ms para prevenir bucles
      loadTimeoutRef.current = setTimeout(executeLoad, 100)
    }

    // Cleanup
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
      }
    }
  }, [
    currentPage,
    rowsPerPage,
    memoizedFilters,
    needsReload,
    loadingStates?.fetching,
    loadingStates?.searching,
    loadSuppliers,
    setNeedsReload
  ])

  // === RESET PAGINATION CUANDO CAMBIEN FILTROS ===
  const previousFiltersRef = useRef<string>('')

  useEffect(() => {
    const filtersString = JSON.stringify(memoizedFilters)

    // Skip inicial mount
    if (isInitialMount.current) {
      previousFiltersRef.current = filtersString
      return
    }

    // Solo resetear paginación si los filtros realmente cambiaron
    if (previousFiltersRef.current !== filtersString) {
      previousFiltersRef.current = filtersString
      resetPagination() // Esto activará el useEffect principal para cargar página 1
    }
  }, [memoizedFilters, resetPagination])

  // === AJUSTAR PÁGINA SI ESTÁ FUERA DE RANGO ===
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage, setCurrentPage])

  // === PAGINATION HANDLERS (Solo cambian estado Redux, el useEffect principal carga) ===

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // El useEffect principal se encarga de cargar automáticamente
  }

  const handlePerPageChange = (perPage: number) => {
    setRowsPerPage(perPage) // Esto resetea a página 1 internamente
    // El useEffect principal se encarga de cargar automáticamente
  }

  // === DELETE HANDLERS ===
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
        totalPages={totalPages}
        totalItems={totalRecords}
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
