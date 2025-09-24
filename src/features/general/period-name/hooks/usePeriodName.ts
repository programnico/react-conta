// features/general/period-name/hooks/usePeriodName.ts
import { useCrud } from '@/shared/hooks/useCrud'
import { periodNameService } from '../services/periodNameService'
import type { PeriodName, CreatePeriodNameRequest, UpdatePeriodNameRequest } from '../types'

export interface UsePeriodNameResult {
  // Data
  items: PeriodName[]
  currentItem: PeriodName | null

  // Loading states
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean

  // Error handling
  error: string | null

  // Actions
  loadItems: (filters?: Record<string, any>) => Promise<void>
  createItem: (data: CreatePeriodNameRequest) => Promise<PeriodName>
  updateItem: (id: string | number, data: UpdatePeriodNameRequest) => Promise<PeriodName>
  deleteItem: (id: string | number) => Promise<void>

  // State management
  setCurrentPeriodName: (item: PeriodName | null) => void
  clearPeriodNameError: () => void
  refresh: () => Promise<void>

  // Domain-specific helpers
  activeItems: PeriodName[]
  inactiveItems: PeriodName[]
  getByName: (name: string) => PeriodName | undefined
  searchByName: (query: string) => Promise<PeriodName[]>
  getByDescription: (description: string) => Promise<PeriodName[]>
  getStatistics: () => Promise<{ total: number; active: number; inactive: number }>
}

export const usePeriodName = (options?: {
  autoLoad?: boolean
  onError?: (error: string) => void
  onSuccess?: (message: string) => void
}): UsePeriodNameResult => {
  const crud = useCrud(periodNameService, {
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
  const getByName = (name: string): PeriodName | undefined => {
    return crud.data.find(item => item.name.toLowerCase().includes(name.toLowerCase()))
  }

  const searchByName = async (query: string): Promise<PeriodName[]> => {
    try {
      return await periodNameService.searchByName(query)
    } catch (error) {
      console.error('Failed to search by name:', error)
      throw error
    }
  }

  const getByDescription = async (description: string): Promise<PeriodName[]> => {
    try {
      return await periodNameService.getByDescription(description)
    } catch (error) {
      console.error('Failed to search by description:', error)
      throw error
    }
  }

  const getStatistics = async () => {
    try {
      return await periodNameService.getStatistics()
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
    setCurrentPeriodName: crud.setCurrentItem,
    clearPeriodNameError: crud.clearError,
    refresh: crud.refresh,

    // Domain-specific computed values
    activeItems,
    inactiveItems,

    // Domain-specific methods
    getByName,
    searchByName,
    getByDescription,
    getStatistics
  }
}
