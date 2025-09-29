// store/slices/rolesSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RolesService } from '@/features/admin/roles/services/rolesService'
import { ApiError as ApiErrorClass } from '@/shared/services/apiClient'
import type { Role, Permission, CreateRoleRequest, UpdateRoleRequest, RoleStats } from '@/features/admin/roles/types'

// State interface
export interface RolesState {
  // Data
  roles: Role[]
  permissions: Permission[]
  stats: RoleStats | null

  // Loading states
  loading: {
    roles: boolean
    permissions: boolean
    creating: boolean
    updating: boolean
    deleting: boolean
  }

  // Error states
  errors: {
    roles: string | null
    permissions: string | null
    crud: string | null
  }

  // UI state
  selectedRole: Role | null
  lastUpdated: string | null
}

// Initial state
const initialState: RolesState = {
  roles: [],
  permissions: [],
  stats: null,
  loading: {
    roles: false,
    permissions: false,
    creating: false,
    updating: false,
    deleting: false
  },
  errors: {
    roles: null,
    permissions: null,
    crud: null
  },
  selectedRole: null,
  lastUpdated: null
}

// Async thunks
export const fetchRoles = createAsyncThunk('roles/fetchRoles', async (_, { rejectWithValue }) => {
  try {
    const roles = await RolesService.getRoles()
    return roles
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      return rejectWithValue({
        message: error.message,
        code: error.code,
        status: error.status
      })
    }
    return rejectWithValue({
      message: 'Error al cargar roles'
    })
  }
})

export const fetchPermissions = createAsyncThunk('roles/fetchPermissions', async (_, { rejectWithValue }) => {
  try {
    const permissions = await RolesService.getPermissions()
    return permissions
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      return rejectWithValue({
        message: error.message,
        code: error.code,
        status: error.status
      })
    }
    return rejectWithValue({
      message: 'Error al cargar permisos'
    })
  }
})

export const createRole = createAsyncThunk(
  'roles/createRole',
  async (roleData: CreateRoleRequest, { rejectWithValue }) => {
    try {
      const newRole = await RolesService.createRole(roleData)
      return newRole
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return rejectWithValue({
          message: error.message,
          code: error.code,
          status: error.status
        })
      }
      return rejectWithValue({
        message: 'Error al crear rol'
      })
    }
  }
)

export const updateRole = createAsyncThunk(
  'roles/updateRole',
  async (roleData: UpdateRoleRequest, { rejectWithValue }) => {
    try {
      const updatedRole = await RolesService.updateRole(roleData)
      return updatedRole
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return rejectWithValue({
          message: error.message,
          code: error.code,
          status: error.status
        })
      }
      return rejectWithValue({
        message: 'Error al actualizar rol'
      })
    }
  }
)

export const deleteRole = createAsyncThunk(
  'roles/deleteRole',
  async (roleId: number, { rejectWithValue, getState }) => {
    try {
      await RolesService.deleteRole(roleId)
      return roleId
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return rejectWithValue({
          message: error.message,
          code: error.code,
          status: error.status
        })
      }
      return rejectWithValue({
        message: 'Error al eliminar rol'
      })
    }
  }
)

// Calculate stats helper
const calculateStats = (roles: Role[]): RoleStats => {
  const total = roles.length
  const withUsers = roles.filter(role => role.users && Array.isArray(role.users) && role.users.length > 0).length
  const withoutUsers = total - withUsers
  const totalPermissions = roles.reduce((sum, role) => {
    return sum + (role.permissions && Array.isArray(role.permissions) ? role.permissions.length : 0)
  }, 0)
  const avgPermissions = total > 0 ? Math.round(totalPermissions / total) : 0

  return {
    total,
    withUsers,
    withoutUsers,
    avgPermissions
  }
}

// Roles slice
const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    // Clear errors
    clearErrors: state => {
      state.errors = {
        roles: null,
        permissions: null,
        crud: null
      }
    },

    // Clear specific error
    clearError: (state, action: PayloadAction<keyof RolesState['errors']>) => {
      state.errors[action.payload] = null
    },

    // Set selected role
    setSelectedRole: (state, action: PayloadAction<Role | null>) => {
      state.selectedRole = action.payload
    },

    // Reset state
    resetRoles: () => initialState,

    // Update stats manually (useful for filters)
    updateStats: (state, action: PayloadAction<Role[]>) => {
      state.stats = calculateStats(action.payload)
    },

    // Clear loading states (for debugging stuck states)
    clearLoadingStates: state => {
      state.loading = {
        roles: false,
        permissions: false,
        creating: false,
        updating: false,
        deleting: false
      }
    }
  },
  extraReducers: builder => {
    builder
      // Fetch roles
      .addCase(fetchRoles.pending, state => {
        state.loading.roles = true
        state.errors.roles = null
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading.roles = false

        // Normalize roles to ensure all have required properties
        const normalizedRoles = action.payload.map(role => ({
          ...role,
          users: role.users || [],
          permissions: role.permissions || []
        }))

        state.roles = normalizedRoles
        state.stats = calculateStats(normalizedRoles)
        state.lastUpdated = new Date().toISOString()
        state.errors.roles = null
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading.roles = false
        state.errors.roles = (action.payload as any)?.message || 'Error al cargar roles'
      })

      // Fetch permissions
      .addCase(fetchPermissions.pending, state => {
        state.loading.permissions = true
        state.errors.permissions = null
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading.permissions = false
        state.permissions = action.payload
        state.errors.permissions = null
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading.permissions = false
        state.errors.permissions = (action.payload as any)?.message || 'Error al cargar permisos'
      })

      // Create role
      .addCase(createRole.pending, state => {
        state.loading.creating = true
        state.errors.crud = null
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.loading.creating = false

        // Normalize the role object to ensure required properties exist
        const normalizedRole = {
          ...action.payload,
          users: action.payload.users || [],
          permissions: action.payload.permissions || []
        }

        state.roles.push(normalizedRole)
        state.stats = calculateStats(state.roles)
        state.lastUpdated = new Date().toISOString()
        state.errors.crud = null
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading.creating = false
        state.errors.crud = (action.payload as any)?.message || 'Error al crear rol'
      })

      // Update role
      .addCase(updateRole.pending, state => {
        state.loading.updating = true
        state.errors.crud = null
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.loading.updating = false
        const index = state.roles.findIndex(role => role.id === action.payload.id)
        if (index !== -1) {
          // Normalize the role object to ensure required properties exist
          const normalizedRole = {
            ...action.payload,
            users: action.payload.users || [],
            permissions: action.payload.permissions || []
          }
          state.roles[index] = normalizedRole
        }
        state.stats = calculateStats(state.roles)
        state.lastUpdated = new Date().toISOString()
        state.errors.crud = null
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading.updating = false
        state.errors.crud = (action.payload as any)?.message || 'Error al actualizar rol'
      })

      // Delete role
      .addCase(deleteRole.pending, state => {
        state.loading.deleting = true
        state.errors.crud = null
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.loading.deleting = false
        state.roles = state.roles.filter(role => role.id !== action.payload)
        state.stats = calculateStats(state.roles)
        state.selectedRole = null
        state.lastUpdated = new Date().toISOString()
        state.errors.crud = null
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loading.deleting = false
        state.errors.crud = (action.payload as any)?.message || 'Error al eliminar rol'
      })
  }
})

// Export actions
export const { clearErrors, clearError, setSelectedRole, resetRoles, updateStats, clearLoadingStates } =
  rolesSlice.actions

// Selectors
export const selectRoles = (state: { roles: RolesState }) => state.roles.roles
export const selectPermissions = (state: { roles: RolesState }) => state.roles.permissions
export const selectRoleStats = (state: { roles: RolesState }) => state.roles.stats
export const selectSelectedRole = (state: { roles: RolesState }) => state.roles.selectedRole
export const selectRolesLoading = (state: { roles: RolesState }) => state.roles.loading
export const selectRolesErrors = (state: { roles: RolesState }) => state.roles.errors
export const selectLastUpdated = (state: { roles: RolesState }) => state.roles.lastUpdated

// Composite selectors
export const selectIsLoading = (state: { roles: RolesState }) => {
  const { roles, permissions, creating, updating, deleting } = state.roles.loading
  return roles || permissions || creating || updating || deleting
}

// Selector specific for table loading (only roles, not permissions)
export const selectIsTableLoading = (state: { roles: RolesState }) => {
  const { roles } = state.roles.loading
  return roles
}

export const selectHasError = (state: { roles: RolesState }) => {
  const { roles, permissions, crud } = state.roles.errors
  return Boolean(roles || permissions || crud)
}

export const selectRoleById = (state: { roles: RolesState }, id: number) =>
  state.roles.roles.find(role => role.id === id)

export default rolesSlice.reducer
