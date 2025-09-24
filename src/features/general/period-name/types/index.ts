// features/general/period-name/types/index.ts
export interface PeriodName {
  id?: number
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface CreatePeriodNameRequest {
  name: string
  description?: string
}

export interface UpdatePeriodNameRequest {
  id: number
  name: string
  description?: string
}

export interface PeriodNameState {
  items: PeriodName[]
  currentItem: PeriodName | null
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  error: string | null
}

// Re-export common types that this module uses
export type { ApiResponse, PaginatedResponse } from '@/shared/types/api'
