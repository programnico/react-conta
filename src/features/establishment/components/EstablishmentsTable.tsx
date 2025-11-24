// features/establishment/components/EstablishmentsTable.tsx
'use client'

import React, { useEffect, useState, useRef } from 'react'
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Box,
  Typography,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, Place as PlaceIcon } from '@mui/icons-material'

import SmartPagination from '@/components/pagination/SmartPagination'
import { useEstablishmentsRedux } from '../hooks/useEstablishmentsRedux'
import type { Establishment } from '../types'

interface EstablishmentsTableProps {
  // No props needed - everything through Redux
}

const EstablishmentsTable: React.FC<EstablishmentsTableProps> = () => {
  // Redux state
  const {
    establishments,
    pagination,
    loadingStates,
    filters,
    needsReload,
    error,
    loading,
    fetchEstablishments,
    setCurrentPage,
    setRowsPerPage,
    setNeedsReload,
    clearError,
    deleteEstablishment,
    openForm
  } = useEstablishmentsRedux()

  // Estado local para UI
  const [showSpinner, setShowSpinner] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [establishmentToDelete, setEstablishmentToDelete] = useState<Establishment | null>(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  })

  // Referencias para controlar efectos
  const isInitialMount = useRef(true)
  const lastLoadParamsRef = useRef<string>('')
  const loadTimeoutRef = useRef<NodeJS.Timeout>()

  // === EFFECTS ===

  // Controlador único de carga (inicial, needsReload, paginación, filtros)
  useEffect(() => {
    // Limpiar timeout previo
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current)
    }

    const executeLoad = () => {
      // Parámetros actuales
      const loadParams = {
        page: pagination.currentPage,
        pageSize: pagination.rowsPerPage,
        ...filters
      }
      const paramsString = JSON.stringify(loadParams)

      // Cargar si: es inicial, needsReload, o cambiaron parámetros
      const shouldLoad = isInitialMount.current || needsReload || lastLoadParamsRef.current !== paramsString

      if (shouldLoad) {
        lastLoadParamsRef.current = paramsString

        // Clear initial flag inmediatamente
        if (isInitialMount.current) {
          isInitialMount.current = false
        }

        fetchEstablishments(loadParams)
          .catch(err => {
            console.error('Error loading establishments:', err)
          })
          .finally(() => {
            if (needsReload) {
              setNeedsReload(false)
            }
          })
      }
    }

    // Carga inicial o needsReload: inmediato
    if (isInitialMount.current || needsReload) {
      executeLoad()
    } else {
      // Cambios filtros/paginación: debounce 600ms
      loadTimeoutRef.current = setTimeout(executeLoad, 600)
    }

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
      }
    }
  }, [
    pagination.currentPage,
    pagination.rowsPerPage,
    JSON.stringify(filters),
    needsReload,
    fetchEstablishments,
    setNeedsReload
  ])

  // Control de spinner con delay
  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (loadingStates?.fetching) {
      timeout = setTimeout(() => {
        setShowSpinner(true)
      }, 600)
    } else {
      setShowSpinner(false)
    }

    return () => {
      clearTimeout(timeout)
    }
  }, [loadingStates?.fetching])

  // === HANDLERS ===

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePerPageChange = (perPage: number) => {
    setRowsPerPage(perPage)
  }

  // === EDIT/DELETE HANDLERS ===
  const handleEditClick = (establishment: Establishment) => {
    openForm('edit', establishment)
  }

  const handleDeleteClick = (establishment: Establishment) => {
    if (establishment.is_main) {
      setSnackbar({
        open: true,
        message: 'No se puede eliminar el establecimiento principal',
        severity: 'warning'
      })
      return
    }
    setEstablishmentToDelete(establishment)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (establishmentToDelete) {
      try {
        await deleteEstablishment(establishmentToDelete.id).unwrap()
        setSnackbar({
          open: true,
          message: 'Establecimiento eliminado exitosamente',
          severity: 'success'
        })
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Error al eliminar el establecimiento',
          severity: 'error'
        })
      }
    }
    setDeleteConfirmOpen(false)
    setEstablishmentToDelete(null)
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  // === RENDER FUNCTIONS ===

  const renderStatusChip = (isActive?: boolean) => {
    if (isActive === undefined || isActive === null) {
      return <Chip label='N/A' size='small' />
    }

    return <Chip label={isActive ? 'Activo' : 'Inactivo'} color={isActive ? 'success' : 'default'} size='small' />
  }

  const renderMainChip = (isMain?: boolean) => {
    if (!isMain) return null

    return (
      <Tooltip title='Establecimiento principal'>
        <Chip label='Principal' color='primary' size='small' variant='outlined' />
      </Tooltip>
    )
  }

  const renderLocationIcon = (latitude: string | null, longitude: string | null) => {
    if (!latitude || !longitude) return null

    return (
      <Tooltip title={`Lat: ${latitude}, Lng: ${longitude}`}>
        <PlaceIcon fontSize='small' color='action' />
      </Tooltip>
    )
  }

  // === LOADING STATE ===

  if (showSpinner) {
    return (
      <Card>
        <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
          <CircularProgress />
        </Box>
      </Card>
    )
  }

  // === ERROR STATE ===

  if (error) {
    return (
      <Card>
        <Box p={3}>
          <Alert severity='error' onClose={clearError}>
            {error}
          </Alert>
        </Box>
      </Card>
    )
  }

  // === EMPTY STATE ===

  if (!establishments || establishments.length === 0) {
    return (
      <Card>
        <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight='400px' p={3}>
          <Typography variant='h6' color='textSecondary' gutterBottom>
            No se encontraron establecimientos
          </Typography>
          <Typography variant='body2' color='textSecondary'>
            {Object.keys(filters).length > 0
              ? 'Intenta modificar los filtros de búsqueda'
              : 'Comienza creando un nuevo establecimiento'}
          </Typography>
        </Box>
      </Card>
    )
  }

  // === MAIN RENDER ===

  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Empresa</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>Encargado</TableCell>
              <TableCell align='center'>Estado</TableCell>
              <TableCell align='center'>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {establishments.map(establishment => (
              <TableRow key={establishment.id} hover>
                <TableCell>
                  <Typography variant='body2' fontWeight={500}>
                    {establishment.code}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display='flex' alignItems='center' gap={1}>
                    <Typography variant='body2' fontWeight={500}>
                      {establishment.name}
                    </Typography>
                    {renderMainChip(establishment.is_main)}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>{establishment.company?.name || '-'}</Typography>
                </TableCell>
                <TableCell>
                  <Box display='flex' alignItems='center' gap={0.5}>
                    <Typography variant='body2'>{establishment.address || '-'}</Typography>
                    {renderLocationIcon(establishment.latitude, establishment.longitude)}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>{establishment.manager_name || '-'}</Typography>
                </TableCell>
                <TableCell align='center'>{renderStatusChip(establishment.is_active)}</TableCell>
                <TableCell align='center'>
                  <Box display='flex' justifyContent='center' gap={0.5}>
                    <Tooltip title='Editar'>
                      <IconButton size='small' onClick={() => handleEditClick(establishment)} color='primary'>
                        <EditIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title='Eliminar'>
                      <IconButton
                        size='small'
                        onClick={() => handleDeleteClick(establishment)}
                        color='error'
                        disabled={establishment.is_main}
                      >
                        <DeleteIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* SmartPagination integrado */}
      <SmartPagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalRecords}
        perPage={pagination.rowsPerPage}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
        disabled={loadingStates?.fetching}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el establecimiento <strong>{establishmentToDelete?.name}</strong>?
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }} color='error'>
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={loadingStates?.deleting}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color='error' variant='contained' disabled={loadingStates?.deleting}>
            {loadingStates?.deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  )
}

export default EstablishmentsTable
