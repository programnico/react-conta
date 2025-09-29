// features/admin/roles/hooks/useRolesRedux.ts
import React, { useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  // Actions
  fetchRoles,
  fetchPermissions,
  createRole,
  updateRole,
  deleteRole,
  setSelectedRole,
  clearErrors,
  clearError,
  updateStats,
  clearLoadingStates,

  // Selectors
  selectRoles,
  selectPermissions,
  selectRoleStats,
  selectSelectedRole,
  selectRolesLoading,
  selectRolesErrors,
  selectIsLoading,
  selectIsTableLoading,
  selectHasError,
  selectRoleById,
  selectLastUpdated
} from '@/shared/store/rolesSlice'
import type { CreateRoleRequest, UpdateRoleRequest, Role } from '../types'
import type { AppDispatch } from '@/store'

/**
 * Hook centralizado para manejar roles con Redux
 * Reemplaza el useRoles anterior que usaba estado local
 */
export function useRolesRedux() {
  const dispatch = useDispatch<AppDispatch>()

  // Selectors - datos del estado global
  const roles = useSelector(selectRoles)
  const permissions = useSelector(selectPermissions)
  const stats = useSelector(selectRoleStats)
  const selectedRole = useSelector(selectSelectedRole)
  const loading = useSelector(selectRolesLoading)
  const errors = useSelector(selectRolesErrors)
  const isLoading = useSelector(selectIsLoading)
  const isTableLoading = useSelector(selectIsTableLoading)
  const hasError = useSelector(selectHasError)
  const lastUpdated = useSelector(selectLastUpdated)

  // Actions - funciones para modificar el estado
  const fetchRolesData = useCallback(() => {
    dispatch(fetchRoles())
  }, [dispatch])

  const fetchPermissionsData = useCallback(() => {
    dispatch(fetchPermissions())
  }, [dispatch])

  const createRoleData = useCallback(
    (roleData: CreateRoleRequest) => {
      return dispatch(createRole(roleData))
    },
    [dispatch]
  )

  const updateRoleData = useCallback(
    (roleData: UpdateRoleRequest) => {
      return dispatch(updateRole(roleData))
    },
    [dispatch]
  )

  const deleteRoleData = useCallback(
    (roleId: number) => {
      return dispatch(deleteRole(roleId))
    },
    [dispatch]
  )

  const selectRole = useCallback(
    (role: Role | null) => {
      dispatch(setSelectedRole(role))
    },
    [dispatch]
  )

  const clearAllErrors = useCallback(() => {
    dispatch(clearErrors())
  }, [dispatch])

  const clearSpecificError = useCallback(
    (errorType: 'roles' | 'permissions' | 'crud') => {
      dispatch(clearError(errorType))
    },
    [dispatch]
  )

  const clearLoadingStatesAction = useCallback(() => {
    dispatch(clearLoadingStates())
  }, [dispatch])

  // Auto-fix stuck loading states
  React.useEffect(() => {
    if ((loading.creating || loading.updating || loading.deleting) && roles.length > 0 && permissions.length > 0) {
      setTimeout(() => {
        dispatch(clearLoadingStates())
      }, 1000) // Clear after 1 second
    }
  }, [loading.creating, loading.updating, loading.deleting, roles.length, permissions.length, dispatch])

  // Utility functions - funciones derivadas que no necesitan dispatch
  const searchRoles = useCallback(
    (query: string): Role[] => {
      if (!query.trim()) return roles

      const lowercaseQuery = query.toLowerCase()
      return roles.filter(
        role =>
          role.name.toLowerCase().includes(lowercaseQuery) ||
          role.permissions.some(permission => permission.name.toLowerCase().includes(lowercaseQuery)) ||
          role.users.some(
            user =>
              user.name.toLowerCase().includes(lowercaseQuery) || user.email.toLowerCase().includes(lowercaseQuery)
          )
      )
    },
    [roles]
  )

  const filterRolesByPermission = useCallback(
    (permissionName: string): Role[] => {
      if (!permissionName) return roles

      return roles.filter(role => role.permissions.some(permission => permission.name === permissionName))
    },
    [roles]
  )

  const getRoleById = useCallback(
    (id: number): Role | undefined => {
      return roles.find(role => role.id === id)
    },
    [roles]
  )

  // Computed values
  const computedValues = useMemo(
    () => ({
      hasRoles: roles.length > 0,
      hasPermissions: permissions.length > 0,
      totalRoles: roles.length,
      totalPermissions: permissions.length,
      isInitialized: roles.length > 0 && permissions.length > 0,
      needsRefresh: lastUpdated
        ? Date.now() - new Date(lastUpdated).getTime() > 5 * 60 * 1000 // 5 minutes
        : true
    }),
    [roles.length, permissions.length, lastUpdated]
  )

  // Initialize data if not loaded
  const initializeData = useCallback(() => {
    if (!computedValues.hasRoles) {
      dispatch(fetchRoles())
    }
    if (!computedValues.hasPermissions) {
      dispatch(fetchPermissions())
    }

    // Force fetch permissions if they're not loading but empty or if loading state is stuck
    if (permissions.length === 0 && !loading.permissions) {
      dispatch(fetchPermissions())
    }
  }, [dispatch, computedValues.hasRoles, computedValues.hasPermissions, roles.length, permissions.length, loading])

  // Refresh all data
  const refreshAll = useCallback(() => {
    dispatch(fetchRoles())
    dispatch(fetchPermissions())
  }, [dispatch])

  // Force permissions load for testing
  React.useEffect(() => {
    if (permissions.length === 0) {
      dispatch(fetchPermissions())
    }
  }, [dispatch, permissions.length])

  // Update stats for filtered data
  const updateStatsForFiltered = useCallback(
    (filteredRoles: Role[]) => {
      dispatch(updateStats(filteredRoles))
    },
    [dispatch]
  )

  return {
    // Data
    roles,
    permissions,
    stats,
    selectedRole,

    // Loading states
    loading: {
      roles: loading.roles,
      permissions: loading.permissions,
      creating: loading.creating,
      updating: loading.updating,
      deleting: loading.deleting,
      isLoading,
      isTableLoading
    },

    // Error states
    errors: {
      roles: errors.roles,
      permissions: errors.permissions,
      crud: errors.crud,
      hasError
    },

    // Computed values
    computed: computedValues,

    // Actions
    actions: {
      fetchRoles: fetchRolesData,
      fetchPermissions: fetchPermissionsData,
      createRole: createRoleData,
      updateRole: updateRoleData,
      deleteRole: deleteRoleData,
      selectRole,
      clearAllErrors,
      clearSpecificError,
      clearLoadingStates: clearLoadingStatesAction,
      initializeData,
      refreshAll,
      updateStatsForFiltered
    },

    // Utility functions
    utils: {
      searchRoles,
      filterRolesByPermission,
      getRoleById
    },

    // Metadata
    meta: {
      lastUpdated
    }
  }
}

export default useRolesRedux
