// shared/hooks/useCrud.ts
import { useState, useCallback, useEffect } from 'react'
import type { BaseCrudService, CrudHookResult } from '@/shared/services/BaseCrudService'

export interface CrudOptions {
  autoLoad?: boolean
  onError?: (error: string) => void
  onSuccess?: (message: string) => void
}

export function useCrud<T, CreateT, UpdateT>(
  service: BaseCrudService<T, CreateT, UpdateT>,
  options: CrudOptions = {}
): CrudHookResult<T, CreateT, UpdateT> {
  // State
  const [data, setData] = useState<T[]>([])
  const [currentItem, setCurrentItem] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Load all items
  const load = useCallback(
    async (filters?: Record<string, any>) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await service.getAll(filters)
        setData(result)
        options.onSuccess?.('Data loaded successfully')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
        setError(errorMessage)
        options.onError?.(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [service, options]
  )

  // Load single item by ID
  const loadById = useCallback(
    async (id: string | number): Promise<T> => {
      setError(null)

      try {
        const result = await service.getById(id)
        setCurrentItem(result)
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load item'
        setError(errorMessage)
        options.onError?.(errorMessage)
        throw err
      }
    },
    [service, options]
  )

  // Create new item
  const create = useCallback(
    async (itemData: CreateT): Promise<T> => {
      setIsCreating(true)
      setError(null)

      try {
        const newItem = await service.create(itemData)
        setData(prev => [...prev, newItem])
        options.onSuccess?.('Item created successfully')
        return newItem
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create item'
        setError(errorMessage)
        options.onError?.(errorMessage)
        throw err
      } finally {
        setIsCreating(false)
      }
    },
    [service, options]
  )

  // Update existing item
  const update = useCallback(
    async (id: string | number, itemData: UpdateT): Promise<T> => {
      setIsUpdating(true)
      setError(null)

      try {
        const updatedItem = await service.update(id, itemData)

        // Update the item in the local state
        setData(prev => prev.map(item => ((item as any).id === id ? updatedItem : item)))

        // Update current item if it's the one being edited
        if (currentItem && (currentItem as any).id === id) {
          setCurrentItem(updatedItem)
        }

        options.onSuccess?.('Item updated successfully')
        return updatedItem
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update item'
        setError(errorMessage)
        options.onError?.(errorMessage)
        throw err
      } finally {
        setIsUpdating(false)
      }
    },
    [service, currentItem, options]
  )

  // Delete item
  const deleteItem = useCallback(
    async (id: string | number): Promise<void> => {
      setIsDeleting(true)
      setError(null)

      try {
        await service.delete(id)

        // Remove the item from local state
        setData(prev => prev.filter(item => (item as any).id !== id))

        // Clear current item if it's the one being deleted
        if (currentItem && (currentItem as any).id === id) {
          setCurrentItem(null)
        }

        options.onSuccess?.('Item deleted successfully')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete item'
        setError(errorMessage)
        options.onError?.(errorMessage)
        throw err
      } finally {
        setIsDeleting(false)
      }
    },
    [service, currentItem, options]
  )

  // Refresh data
  const refresh = useCallback(async () => {
    return load()
  }, [load])

  // Auto-load on mount if requested
  useEffect(() => {
    if (options.autoLoad) {
      load()
    }
  }, [options.autoLoad, load])

  return {
    // Data
    data,
    currentItem,

    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,

    // Error handling
    error,

    // Actions
    load,
    loadById,
    create,
    update,
    delete: deleteItem,

    // State management
    setCurrentItem,
    clearError,
    refresh
  }
}
