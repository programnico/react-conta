// features/admin/roles/services/rolesService.ts
import { apiClient, ApiError as ApiErrorClass, API_CONFIG } from '@/shared/services/apiClient'
import type {
  Role,
  Permission,
  CreateRoleRequest,
  UpdateRoleRequest,
  RolesResponse,
  PermissionsResponse,
  RoleStats
} from '../types'

export class RolesService {
  // Using centralized API_CONFIG endpoints

  /**
   * Get all roles with permissions and users
   */
  static async getRoles(): Promise<Role[]> {
    try {
      // ApiClient automatically extracts 'data' property from API response
      const roles = await apiClient.get<Role[]>(API_CONFIG.ENDPOINTS.ADMIN.ROLES)
      return roles
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        throw error
      }
      throw new ApiErrorClass(500, 'Failed to fetch roles', 'FETCH_ROLES_ERROR')
    }
  }

  /**
   * Get all available permissions
   */
  static async getPermissions(): Promise<Permission[]> {
    try {
      // ApiClient automatically extracts 'data' property from API response
      const permissions = await apiClient.get<Permission[]>(API_CONFIG.ENDPOINTS.ADMIN.PERMISSIONS)
      return permissions
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        throw error
      }
      throw new ApiErrorClass(500, 'Failed to fetch permissions', 'FETCH_PERMISSIONS_ERROR')
    }
  }

  /**
   * Create a new role
   */
  static async createRole(roleData: CreateRoleRequest): Promise<Role> {
    try {
      const payload = {
        name: roleData.name.trim(),
        guard_name: roleData.guard_name || 'api',
        permissions: roleData.permissions
      }

      // ApiClient will automatically handle FormData creation
      const role = await apiClient.postFormData<Role>(API_CONFIG.ENDPOINTS.ADMIN.ROLES_SAVE, payload)
      return role
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        throw error
      }
      throw new ApiErrorClass(500, 'Failed to create role', 'CREATE_ROLE_ERROR')
    }
  }

  /**
   * Update an existing role
   */
  static async updateRole(roleData: UpdateRoleRequest): Promise<Role> {
    try {
      const payload = {
        id: roleData.id,
        name: roleData.name.trim(),
        guard_name: roleData.guard_name || 'api',
        permissions: roleData.permissions
      }

      // ApiClient will automatically handle FormData creation
      const role = await apiClient.postFormData<Role>(API_CONFIG.ENDPOINTS.ADMIN.ROLES_SAVE, payload)
      return role
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        throw error
      }
      throw new ApiErrorClass(500, 'Failed to update role', 'UPDATE_ROLE_ERROR')
    }
  }

  /**
   * Delete a role
   */
  static async deleteRole(id: number): Promise<void> {
    try {
      await apiClient.delete(`${API_CONFIG.ENDPOINTS.ADMIN.ROLES}/${id}`)
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        throw error
      }
      throw new ApiErrorClass(500, 'Failed to delete role', 'DELETE_ROLE_ERROR')
    }
  }

  /**
   * Get role statistics
   */
  static async getRoleStats(roles: Role[]): Promise<RoleStats> {
    try {
      const total = roles.length
      const withUsers = roles.filter(role => role.users.length > 0).length
      const withoutUsers = total - withUsers
      const totalPermissions = roles.reduce((sum, role) => sum + role.permissions.length, 0)
      const avgPermissions = total > 0 ? Math.round(totalPermissions / total) : 0

      return {
        total,
        withUsers,
        withoutUsers,
        avgPermissions
      }
    } catch (error) {
      throw new ApiErrorClass(500, 'Failed to calculate role stats', 'STATS_ERROR')
    }
  }
}

export default RolesService
