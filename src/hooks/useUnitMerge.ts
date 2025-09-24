// hooks/useUnitMerge.ts
import { useAppDispatch, useAppSelector } from '@/shared/hooks/redux'
import {
  fetchUnitMerges,
  createUnitMerge,
  updateUnitMerge,
  deleteUnitMerge,
  clearError,
  setCurrentItem,
  clearCurrentItem,
  selectUnitMerge,
  selectUnitMergeItems,
  selectCurrentUnitMerge,
  selectUnitMergeLoading,
  selectUnitMergeError
} from '@/store/slices/unitMergeSlice'
import type { CreateUnitMergeRequest, UpdateUnitMergeRequest, UnitMerge } from '@/types/unitMerge'

export const useUnitMerge = () => {
  const dispatch = useAppDispatch()

  // Selectors
  const unitMergeState = useAppSelector(selectUnitMerge)
  const items = useAppSelector(selectUnitMergeItems)
  const currentItem = useAppSelector(selectCurrentUnitMerge)
  const isLoading = useAppSelector(selectUnitMergeLoading)
  const error = useAppSelector(selectUnitMergeError)

  // Actions
  const loadItems = async () => {
    try {
      await dispatch(fetchUnitMerges()).unwrap()
    } catch (error) {
      console.error('Failed to load unit merges:', error)
      throw error
    }
  }

  const createItem = async (data: CreateUnitMergeRequest) => {
    try {
      const result = await dispatch(createUnitMerge(data)).unwrap()
      return result
    } catch (error) {
      console.error('Failed to create unit merge:', error)
      throw error
    }
  }

  const updateItem = async (data: UpdateUnitMergeRequest) => {
    try {
      const result = await dispatch(updateUnitMerge(data)).unwrap()
      return result
    } catch (error) {
      console.error('Failed to update unit merge:', error)
      throw error
    }
  }

  const deleteItem = async (id: number) => {
    try {
      await dispatch(deleteUnitMerge(id)).unwrap()
    } catch (error) {
      console.error('Failed to delete unit merge:', error)
      throw error
    }
  }

  const setCurrentUnitMerge = (item: UnitMerge | null) => {
    dispatch(setCurrentItem(item))
  }

  const clearCurrentUnitMerge = () => {
    dispatch(clearCurrentItem())
  }

  const clearUnitMergeError = () => {
    dispatch(clearError())
  }

  return {
    // State
    items,
    currentItem,
    isLoading,
    error,
    isCreating: unitMergeState.isCreating,
    isUpdating: unitMergeState.isUpdating,
    isDeleting: unitMergeState.isDeleting,

    // Actions
    loadItems,
    createItem,
    updateItem,
    deleteItem,
    setCurrentUnitMerge,
    clearCurrentUnitMerge,
    clearUnitMergeError
  }
}
