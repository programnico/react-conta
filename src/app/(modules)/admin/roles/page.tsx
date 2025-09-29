// app/(modules)/admin/roles/page.tsx
'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Container, Typography, Box, Alert, Snackbar, CircularProgress } from '@mui/material'
import { Security as SecurityIcon } from '@mui/icons-material'

// Components
import RoleStatsComponent from '@/features/admin/roles/components/RoleStats'
import RoleFilters from '@/features/admin/roles/components/RoleFilters'
import RolesTable from '@/features/admin/roles/components/RolesTable'
import RoleForm from '@/features/admin/roles/components/RoleForm'
import DeleteRoleDialog from '@/features/admin/roles/components/DeleteRoleDialog'

// Hooks and types
import { useRolesRedux } from '@/features/admin/roles/hooks/useRolesRedux'
import type { Role, RoleFormData } from '@/features/admin/roles/types'

export default function RolesPage() {
  const {
    // Data
    roles,
    permissions,
    stats,

    // Loading states
    loading,
    errors,

    // Actions
    actions,

    // Utility functions
    utils
  } = useRolesRedux()

  // Local state for UI
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPermissionFilter, setSelectedPermissionFilter] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'warning' | 'info'
  }>({
    open: false,
    message: '',
    severity: 'success'
  })

  // Filtered roles based on search and filters
  const filteredRoles = useMemo(() => {
    let result = roles

    // Apply search filter
    if (searchQuery.trim()) {
      result = utils.searchRoles(searchQuery)
    }

    // Apply permission filter
    if (selectedPermissionFilter) {
      result = utils.filterRolesByPermission(selectedPermissionFilter)
    }

    return result
  }, [roles, searchQuery, selectedPermissionFilter, utils])

  // Event handlers optimizados con useCallback
  const handleCreateRole = useCallback(() => {
    setSelectedRole(null)
    setIsFormOpen(true)
  }, [])

  const handleEditRole = useCallback((role: Role) => {
    setSelectedRole(role)
    setIsFormOpen(true)
  }, [])

  const handleDeleteRole = useCallback(
    (id: number) => {
      const role = roles.find((r: Role) => r.id === id)
      if (role) {
        setRoleToDelete(role)
        setIsDeleteDialogOpen(true)
      }
    },
    [roles]
  )

  // Funciones de filtrado optimizadas
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleFilterByPermission = useCallback((permission: string) => {
    setSelectedPermissionFilter(permission)
  }, [])

  const handleRefresh = useCallback(() => {
    actions.refreshAll()
  }, [actions])

  const handleFormSubmit = async (formData: RoleFormData) => {
    try {
      if (formData.id) {
        // Update existing role
        await actions.updateRole({
          id: formData.id,
          name: formData.name,
          guard_name: formData.guard_name,
          permissions: formData.permissions
        })
        setSnackbar({
          open: true,
          message: `Rol "${formData.name}" actualizado exitosamente`,
          severity: 'success'
        })
      } else {
        // Create new role
        await actions.createRole({
          name: formData.name,
          guard_name: formData.guard_name,
          permissions: formData.permissions
        })
        setSnackbar({
          open: true,
          message: `Rol "${formData.name}" creado exitosamente`,
          severity: 'success'
        })
      }
      setIsFormOpen(false)
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error al guardar el rol: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        severity: 'error'
      })
    }
  }

  const handleConfirmDelete = async () => {
    if (roleToDelete) {
      try {
        await actions.deleteRole(roleToDelete.id)
        setSnackbar({
          open: true,
          message: `Rol "${roleToDelete.name}" eliminado exitosamente`,
          severity: 'success'
        })
        setIsDeleteDialogOpen(false)
        setRoleToDelete(null)
      } catch (error) {
        setSnackbar({
          open: true,
          message: `Error al eliminar el rol: ${error instanceof Error ? error.message : 'Error desconocido'}`,
          severity: 'error'
        })
      }
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // Initialize data on mount
  React.useEffect(() => {
    actions.initializeData()
  }, [actions.initializeData])

  // Show loading spinner for initial load
  if (loading.isLoading && roles.length === 0) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
          <CircularProgress size={60} />
          <Typography variant='h6' sx={{ ml: 2 }}>
            Cargando gestión de roles...
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      {/* Page Header */}
      <Box mb={4}>
        <Box display='flex' alignItems='center' gap={2} mb={2}>
          <SecurityIcon fontSize='large' color='primary' />
          <Typography variant='h4' component='h1' fontWeight='bold'>
            Gestión de Roles y Permisos
          </Typography>
        </Box>
        <Typography variant='body1' color='textSecondary'>
          Administre los roles del sistema, asigne permisos y controle el acceso de usuarios.
        </Typography>
      </Box>

      {/* Error Messages */}
      {(errors.roles || errors.permissions) && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {errors.roles || errors.permissions}
        </Alert>
      )}

      {/* Statistics */}
      <Box mb={4}>
        <RoleStatsComponent stats={stats} loading={loading.isLoading} />
      </Box>

      {/* Filters */}
      <Box mb={3}>
        <RoleFilters
          permissions={permissions}
          onSearch={handleSearch}
          onFilterByPermission={handleFilterByPermission}
          onRefresh={handleRefresh}
          onCreate={handleCreateRole}
          loading={loading.isLoading}
        />
      </Box>

      {/* Roles Table */}
      <RolesTable
        roles={filteredRoles}
        loading={loading.isTableLoading}
        onEdit={handleEditRole}
        onDelete={handleDeleteRole}
      />

      {/* Role Form Dialog */}
      <RoleForm
        open={isFormOpen}
        role={selectedRole}
        permissions={permissions}
        loading={loading.creating || loading.updating}
        onSubmit={handleFormSubmit}
        onClose={() => setIsFormOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteRoleDialog
        open={isDeleteDialogOpen}
        role={roleToDelete}
        loading={loading.deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false)
          setRoleToDelete(null)
        }}
      />

      {/* Success/Error Snackbar */}
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
