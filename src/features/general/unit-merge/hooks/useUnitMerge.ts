// features/general/unit-merge/hooks/useUnitMerge.ts
import { useCrud } from '@/shared/hooks/useCrud'
import { unitMergeService } from '../services/unitMergeService'
import type { UnitMerge, CreateUnitMergeRequest, UpdateUnitMergeRequest } from '../types'

export interface UseUnitMergeResult {
  // Data
  items: UnitMerge[]
  currentItem: UnitMerge | null

  // Loading states
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean

  // Error handling
  error: string | null

  // Actions
  loadItems: (filters?: Record<string, any>) => Promise<void>
  createItem: (data: CreateUnitMergeRequest) => Promise<UnitMerge>
  updateItem: (id: string | number, data: UpdateUnitMergeRequest) => Promise<UnitMerge>
  deleteItem: (id: string | number) => Promise<void>

  // State management
  setCurrentUnitMerge: (item: UnitMerge | null) => void
  clearUnitMergeError: () => void
  refresh: () => Promise<void>

  // Domain-specific helpers
  activeItems: UnitMerge[]
  inactiveItems: UnitMerge[]
  getByName: (name: string) => UnitMerge | undefined
  searchByName: (query: string) => Promise<UnitMerge[]>
  getStatistics: () => Promise<{ total: number; active: number; inactive: number }>
}

export const useUnitMerge = (options?: {
  autoLoad?: boolean
  onError?: (error: string) => void
  onSuccess?: (message: string) => void
}): UseUnitMergeResult => {
  const crud = useCrud(unitMergeService, {
    autoLoad: options?.autoLoad ?? true,
    onError: options?.onError,
    onSuccess: options?.onSuccess
  })

  // Domain-specific computed values
  const activeItems = crud.data.filter(
    item =>
      // Assuming we have a status field, or all items are active by default
      !item.hasOwnProperty('status') || (item as any).status === 'active'
  )

  const inactiveItems = crud.data.filter(item => item.hasOwnProperty('status') && (item as any).status === 'inactive')

  // Helper functions
  const getByName = (name: string): UnitMerge | undefined => {
    return crud.data.find(item => item.name.toLowerCase().includes(name.toLowerCase()))
  }

  const searchByName = async (query: string): Promise<UnitMerge[]> => {
    try {
      return await unitMergeService.searchByName(query)
    } catch (error) {
      console.error('Failed to search by name:', error)
      throw error
    }
  }

  const getStatistics = async () => {
    try {
      return await unitMergeService.getStatistics()
    } catch (error) {
      console.error('Failed to get statistics:', error)
      throw error
    }
  }

  return {
    // Basic CRUD data and states
    items: crud.data,
    currentItem: crud.currentItem,
    isLoading: crud.isLoading,
    isCreating: crud.isCreating,
    isUpdating: crud.isUpdating,
    isDeleting: crud.isDeleting,
    error: crud.error,

    // Basic CRUD actions with renamed methods for compatibility
    loadItems: crud.load,
    createItem: crud.create,
    updateItem: crud.update,
    deleteItem: crud.delete,

    // State management with renamed methods
    setCurrentUnitMerge: crud.setCurrentItem,
    clearUnitMergeError: crud.clearError,
    refresh: crud.refresh,

    // Domain-specific computed values
    activeItems,
    inactiveItems,

    // Domain-specific methods
    getByName,
    searchByName,
    getStatistics
  }
}
