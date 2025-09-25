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
  const { autoLoad = false, onError, onSuccess } = options

  const [data, setData] = useState<T[]>([])
  const [currentItem, setCurrentItem] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const load = useCallback(
    async (filters?: Record<string, any>) => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await service.getAll(filters)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    },
    [service]
  )

  const create = useCallback(
    async (data: CreateT): Promise<T> => {
      try {
        setIsCreating(true)
        setError(null)
        const result = await service.create(data)
        setData(prev => [...prev, result])
        return result
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        throw err
      } finally {
        setIsCreating(false)
      }
    },
    [service]
  )

  const update = useCallback(
    async (id: string | number, data: UpdateT): Promise<T> => {
      try {
        setIsUpdating(true)
        setError(null)
        const result = await service.update(id, data)
        setData(prev => prev.map(item => ((item as any).id === id ? result : item)))
        return result
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        throw err
      } finally {
        setIsUpdating(false)
      }
    },
    [service]
  )

  const remove = useCallback(
    async (id: string | number): Promise<void> => {
      try {
        setIsDeleting(true)
        setError(null)
        await service.delete(id)
        setData(prev => prev.filter(item => (item as any).id !== id))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        throw err
      } finally {
        setIsDeleting(false)
      }
    },
    [service]
  )

  const setCurrent = useCallback((item: T | null) => {
    setCurrentItem(item)
  }, [])

  useEffect(() => {
    if (autoLoad) {
      load()
    }
  }, [autoLoad])

  return {
    data,
    currentItem,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    clearError,
    load,
    loadById: async (id: string | number) => service.getById(id),
    create,
    update,
    delete: remove,
    refresh: load,
    setCurrentItem: setCurrent
  }
}
