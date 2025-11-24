// app/(modules)/establishments/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Grid, Card, CardContent, Typography, Box, Button, Alert, Snackbar } from '@mui/material'
import {
  Add as AddIcon,
  Store as StoreIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon
} from '@mui/icons-material'

import { useEstablishmentsRedux } from '@/features/establishment/hooks/useEstablishmentsRedux'
import EstablishmentFilters from '@/features/establishment/components/EstablishmentFilters'
import EstablishmentsTable from '@/features/establishment/components/EstablishmentsTable'
import EstablishmentForm from '@/features/establishment/components/EstablishmentForm'
import type { Establishment } from '@/features/establishment/types'

const EstablishmentsPage = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  })

  const {
    establishments,
    pagination,
    isFormOpen,
    formMode,
    error,
    openForm,
    closeForm,
    setSelectedEstablishment,
    selectedEstablishment,
    setNeedsReload,
    clearError
  } = useEstablishmentsRedux()

  // === STATS ===
  const totalEstablishments = pagination?.totalRecords || 0
  const activeEstablishments = establishments?.filter(e => e.is_active).length || 0
  const mainEstablishments = establishments?.filter(e => e.is_main).length || 0

  // === HANDLERS ===

  const handleAddNew = () => {
    setSelectedEstablishment(null)
    openForm('create')
  }

  const handleFormClose = () => {
    closeForm()
    setSelectedEstablishment(null)
    setNeedsReload(true)
  }

  const handleFormSuccess = () => {
    setSnackbar({
      open: true,
      message: `Establecimiento ${formMode === 'create' ? 'creado' : 'actualizado'} exitosamente`,
      severity: 'success'
    })
    handleFormClose()
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  // Cleanup errors
  useEffect(() => {
    return () => {
      clearError()
    }
  }, [])

  return (
    <Box>
      {/* Header */}
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
        <Box>
          <Typography variant='h4' gutterBottom>
            Establecimientos
          </Typography>
          <Typography variant='body2' color='textSecondary'>
            Administra los establecimientos del sistema
          </Typography>
        </Box>
        <Button variant='contained' startIcon={<AddIcon />} onClick={handleAddNew}>
          Nuevo Establecimiento
        </Button>
      </Box>

      {/* Error Global */}
      {error && !isFormOpen && (
        <Box mb={3}>
          <Alert severity='error' onClose={clearError}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display='flex' alignItems='center' gap={2}>
                <StoreIcon fontSize='large' color='primary' />
                <Box>
                  <Typography variant='h4'>{totalEstablishments}</Typography>
                  <Typography variant='body2' color='textSecondary'>
                    Total de Establecimientos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display='flex' alignItems='center' gap={2}>
                <CheckCircleIcon fontSize='large' color='success' />
                <Box>
                  <Typography variant='h4'>{activeEstablishments}</Typography>
                  <Typography variant='body2' color='textSecondary'>
                    Establecimientos Activos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display='flex' alignItems='center' gap={2}>
                <StarIcon fontSize='large' color='warning' />
                <Box>
                  <Typography variant='h4'>{mainEstablishments}</Typography>
                  <Typography variant='body2' color='textSecondary'>
                    Establecimientos Principales
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box mb={3}>
        <EstablishmentFilters />
      </Box>

      {/* Table */}
      <EstablishmentsTable />

      {/* Form Dialog */}
      <EstablishmentForm
        open={isFormOpen}
        establishment={selectedEstablishment}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />

      {/* Snackbar for notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default EstablishmentsPage
