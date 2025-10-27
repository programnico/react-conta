export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  two_factor_enabled: boolean
  two_factor_verified_at: string | null
  created_at: string
  updated_at: string
  roles: Role[]
  permissions: Permission[]
}

export interface Role {
  id: number
  name: string
  guard_name: string
  created_at: string
  updated_at: string
  pivot: {
    model_type: string
    model_id: number
    role_id: number
  }
}

export interface Permission {
  id: number
  name: string
  guard_name: string
  created_at: string
  updated_at: string
}

export interface UsersResponse {
  status: string
  message: string
  data: User[]
  meta: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
  }
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: string
}

export interface UpdateUserData {
  id: number
  name: string
  email: string
  password?: string
  role: string
}

export interface UserFormData {
  name: string
  email: string
  password: string
  role: string
}

export interface UserFormErrors {
  name?: string
  email?: string
  password?: string
  role?: string
}

export interface ApiValidationErrors {
  [key: string]: string[]
}

export interface UserFilters {
  search?: string
  role?: string
}
