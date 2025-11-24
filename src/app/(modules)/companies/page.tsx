// app/(modules)/companies/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Grid, Card, CardContent, Typography, Box, Button, Alert, Snackbar } from '@mui/material'
import { Add as AddIcon, Business as BusinessIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material'

import { useCompaniesRedux } from '@/features/company/hooks/useCompaniesRedux'
import CompanyFilters from '@/features/company/components/CompanyFilters'
import CompaniesTable from '@/features/company/components/CompaniesTable'
import CompanyForm from '@/features/company/components/CompanyForm'
import type { Company } from '@/features/company/types'

const CompaniesPage = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  })

  const {
    companies,
    pagination,
    isFormOpen,
    formMode,
    error,
    openForm,
    closeForm,
    setSelectedCompany,
    selectedCompany,
    setNeedsReload,
    clearError
  } = useCompaniesRedux()

  // === STATS ===
  const totalCompanies = pagination?.totalRecords || 0
  const activeCompanies = companies?.filter(c => c.is_active).length || 0

  // === HANDLERS ===

  const handleAddNew = () => {
    setSelectedCompany(null)
    openForm('create')
  }

  const handleFormClose = () => {
    closeForm()
    setSelectedCompany(null)
    setNeedsReload(true)
  }

  const handleFormSuccess = () => {
    setSnackbar({
      open: true,
      message: `Empresa ${formMode === 'create' ? 'creada' : 'actualizada'} exitosamente`,
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
            Empresas
          </Typography>
          <Typography variant='body2' color='textSecondary'>
            Administra las empresas del sistema
          </Typography>
        </Box>
        <Button variant='contained' startIcon={<AddIcon />} onClick={handleAddNew}>
          Nueva Empresa
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
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display='flex' alignItems='center' gap={2}>
                <BusinessIcon fontSize='large' color='primary' />
                <Box>
                  <Typography variant='h4'>{totalCompanies}</Typography>
                  <Typography variant='body2' color='textSecondary'>
                    Total de Empresas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display='flex' alignItems='center' gap={2}>
                <CheckCircleIcon fontSize='large' color='success' />
                <Box>
                  <Typography variant='h4'>{activeCompanies}</Typography>
                  <Typography variant='body2' color='textSecondary'>
                    Empresas Activas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box mb={3}>
        <CompanyFilters />
      </Box>

      {/* Table */}
      <CompaniesTable />

      {/* Form Dialog */}
      <CompanyForm
        open={isFormOpen}
        company={selectedCompany}
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

export default CompaniesPage
