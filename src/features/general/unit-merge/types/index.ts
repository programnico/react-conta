// features/general/unit-merge/types/index.ts
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

// Re-export common types that this module uses
export type { ApiResponse, PaginatedResponse } from '@/shared/types/api'
