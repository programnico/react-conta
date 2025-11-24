// features/company/components/CompaniesTable.tsx
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
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'

import SmartPagination from '@/components/pagination/SmartPagination'
import { useCompaniesRedux } from '../hooks/useCompaniesRedux'
import type { Company } from '../types'

interface CompaniesTableProps {
  // No props needed - everything through Redux
}

const CompaniesTable: React.FC<CompaniesTableProps> = () => {
  // Redux state
  const {
    companies,
    pagination,
    loadingStates,
    filters,
    needsReload,
    error,
    loading,
    fetchCompanies,
    setCurrentPage,
    setRowsPerPage,
    setNeedsReload,
    clearError,
    deleteCompany,
    openForm
  } = useCompaniesRedux()

  // Estado local para UI
  const [showSpinner, setShowSpinner] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null)
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

        fetchCompanies(loadParams)
          .catch(err => {
            console.error('Error loading companies:', err)
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
    fetchCompanies,
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
    // El useEffect principal se encarga de cargar automáticamente
  }

  const handlePerPageChange = (perPage: number) => {
    setRowsPerPage(perPage) // Esto resetea a página 1 internamente
    // El useEffect principal se encarga de cargar automáticamente
  }

  // === EDIT/DELETE HANDLERS ===
  const handleEditClick = (company: Company) => {
    openForm('edit', company)
  }

  const handleDeleteClick = (company: Company) => {
    if (company.is_default) {
      setSnackbar({
        open: true,
        message: 'No se puede eliminar la empresa por defecto',
        severity: 'warning'
      })
      return
    }
    setCompanyToDelete(company)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (companyToDelete) {
      try {
        await deleteCompany(companyToDelete.id).unwrap()
        setSnackbar({
          open: true,
          message: 'Empresa eliminada exitosamente',
          severity: 'success'
        })
        // The table will refresh automatically through needsReload
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Error al eliminar la empresa',
          severity: 'error'
        })
      }
    }
    setDeleteConfirmOpen(false)
    setCompanyToDelete(null)
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  // === RENDER FUNCTIONS ===

  const renderStatusChip = (isActive?: boolean) => {
    if (isActive === undefined || isActive === null) {
      return <Chip label='N/A' size='small' />
    }

    return <Chip label={isActive ? 'Activa' : 'Inactiva'} color={isActive ? 'success' : 'default'} size='small' />
  }

  const renderDefaultChip = (isDefault?: boolean) => {
    if (!isDefault) return null

    return (
      <Tooltip title='Empresa por defecto'>
        <Chip label='Principal' color='primary' size='small' variant='outlined' />
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

  if (!companies || companies.length === 0) {
    return (
      <Card>
        <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight='400px' p={3}>
          <Typography variant='h6' color='textSecondary' gutterBottom>
            No se encontraron empresas
          </Typography>
          <Typography variant='body2' color='textSecondary'>
            {Object.keys(filters).length > 0
              ? 'Intenta modificar los filtros de búsqueda'
              : 'Comienza creando una nueva empresa'}
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
              <TableCell>Nombre</TableCell>
              <TableCell>Razón Social</TableCell>
              <TableCell>NIT</TableCell>
              <TableCell>Moneda</TableCell>
              <TableCell>País</TableCell>
              <TableCell align='center'>Estado</TableCell>
              <TableCell align='center'>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.map(company => (
              <TableRow key={company.id} hover>
                <TableCell>
                  <Box display='flex' alignItems='center' gap={1}>
                    <Typography variant='body2' fontWeight={500}>
                      {company.name}
                    </Typography>
                    {renderDefaultChip(company.is_default)}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>{company.legal_name || '-'}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>{company.tax_id || '-'}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>{company.currency || '-'}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>{company.country || '-'}</Typography>
                </TableCell>
                <TableCell align='center'>{renderStatusChip(company.is_active)}</TableCell>
                <TableCell align='center'>
                  <Box display='flex' justifyContent='center' gap={0.5}>
                    <Tooltip title='Editar'>
                      <IconButton size='small' onClick={() => handleEditClick(company)} color='primary'>
                        <EditIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title='Eliminar'>
                      <IconButton
                        size='small'
                        onClick={() => handleDeleteClick(company)}
                        color='error'
                        disabled={company.is_default}
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
            ¿Estás seguro de que deseas eliminar la empresa <strong>{companyToDelete?.name}</strong>?
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

export default CompaniesTable
