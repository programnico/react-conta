// types/unitMerge.ts
export interface UnitMerge {
  id?: number
  name: string
  created_at?: string
  updated_at?: string
}

export interface CreateUnitMergeRequest {
  name: string
}

export interface UpdateUnitMergeRequest {
  id: number
  name: string
}

export interface UnitMergeState {
  items: UnitMerge[]
  currentItem: UnitMerge | null
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  error: string | null
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  last_page: number
}
