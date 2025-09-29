// features/admin/roles/types/index.ts
export interface Permission {
  id: number
  name: string
  guard_name: string
  created_at: string
  updated_at: string
  pivot?: {
    role_id: number
    permission_id: number
  }
}

export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  two_factor_enabled: boolean
  two_factor_verified_at: string | null
  created_at: string
  updated_at: string
  pivot?: {
    model_type: string
    role_id: number
    model_id: number
  }
}

export interface Role {
  id: number
  name: string
  guard_name: string
  created_at: string
  updated_at: string
  permissions: Permission[]
  users: User[]
}

export interface CreateRoleRequest {
  name: string
  guard_name?: string
  permissions: string[]
}

export interface UpdateRoleRequest extends CreateRoleRequest {
  id: number
}

export interface RolesResponse {
  status: string
  message: string
  data: Role[]
}

export interface PermissionsResponse {
  status: string
  message: string
  data: Permission[]
}

export interface RoleFormData {
  id?: number
  name: string
  guard_name: string
  permissions: string[]
}

export interface RoleStats {
  total: number
  withUsers: number
  withoutUsers: number
  avgPermissions: number
}
