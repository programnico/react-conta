// features/admin/roles/hooks/useRoles.ts
import { useState, useEffect, useCallback } from 'react'
import { useApiCall } from '@/shared/hooks/useApiCall'
import { RolesService } from '../services/rolesService'
import type { Role, Permission, CreateRoleRequest, UpdateRoleRequest, RoleStats } from '../types'

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [stats, setStats] = useState<RoleStats | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  // API calls using the shared hook
  const {
    execute: executeGetRoles,
    loading: loadingRoles,
    error: errorRoles
  } = useApiCall<Role[]>({
    onSuccess: data => {
      setRoles(data)
      calculateStats(data)
    }
  })

  const {
    execute: executeGetPermissions,
    loading: loadingPermissions,
    error: errorPermissions
  } = useApiCall<Permission[]>({
    onSuccess: data => setPermissions(data)
  })

  const {
    execute: executeCreateRole,
    loading: creatingRole,
    error: errorCreate
  } = useApiCall<Role>({
    onSuccess: newRole => {
      setRoles(prev => [...prev, newRole])
      calculateStats([...roles, newRole])
    }
  })

  const {
    execute: executeUpdateRole,
    loading: updatingRole,
    error: errorUpdate
  } = useApiCall<Role>({
    onSuccess: updatedRole => {
      setRoles(prev => prev.map(role => (role.id === updatedRole.id ? updatedRole : role)))
      calculateStats(roles.map(role => (role.id === updatedRole.id ? updatedRole : role)))
    }
  })

  const {
    execute: executeDeleteRole,
    loading: deletingRole,
    error: errorDelete
  } = useApiCall<void>({
    onSuccess: () => {
      if (selectedRole) {
        const newRoles = roles.filter(role => role.id !== selectedRole.id)
        setRoles(newRoles)
        calculateStats(newRoles)
        setSelectedRole(null)
      }
    }
  })

  // Calculate statistics
  const calculateStats = useCallback(async (roleList: Role[]) => {
    try {
      const statsData = await RolesService.getRoleStats(roleList)
      setStats(statsData)
    } catch (error) {
      // Stats calculation failed, continue without stats
    }
  }, [])

  // Fetch data functions - usando directamente las funciones execute
  const fetchRoles = useCallback(() => {
    executeGetRoles(() => RolesService.getRoles())
  }, [executeGetRoles])

  const fetchPermissions = useCallback(() => {
    executeGetPermissions(() => RolesService.getPermissions())
  }, [executeGetPermissions])

  // CRUD operations
  const createRole = useCallback(
    (roleData: CreateRoleRequest) => {
      executeCreateRole(() => RolesService.createRole(roleData))
    },
    [executeCreateRole]
  )

  const updateRole = useCallback(
    (roleData: UpdateRoleRequest) => {
      executeUpdateRole(() => RolesService.updateRole(roleData))
    },
    [executeUpdateRole]
  )

  const deleteRole = useCallback(
    (id: number) => {
      const role = roles.find(r => r.id === id)
      if (role) {
        setSelectedRole(role)
        executeDeleteRole(() => RolesService.deleteRole(id))
      }
    },
    [executeDeleteRole, roles]
  )

  // Search and filter functions
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

  // Load initial data - ejecutar directamente sin funciones intermedias
  useEffect(() => {
    executeGetRoles(() => RolesService.getRoles())
    executeGetPermissions(() => RolesService.getPermissions())
  }, []) // Sin dependencias para ejecutar solo una vez

  // Compute loading states
  const isLoading = loadingRoles || loadingPermissions || creatingRole || updatingRole || deletingRole

  return {
    // Data
    roles,
    permissions,
    stats,
    selectedRole,

    // Loading states
    isLoading,
    loadingRoles,
    loadingPermissions,
    creatingRole,
    updatingRole,
    deletingRole,

    // Error states
    errorRoles,
    errorPermissions,
    errorCreate,
    errorUpdate,
    errorDelete,

    // Actions
    fetchRoles,
    fetchPermissions,
    createRole,
    updateRole,
    deleteRole,
    setSelectedRole,

    // Utility functions
    searchRoles,
    filterRolesByPermission,
    getRoleById
  }
}

export default useRoles
