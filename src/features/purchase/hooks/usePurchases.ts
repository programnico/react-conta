// features/purchase/hooks/usePurchases.ts
import { useState, useCallback, useEffect, useMemo } from 'react'
import { purchaseService } from '../services/purchaseService'
import type {
  Purchase,
  PurchasesApiResponse,
  Supplier,
  CreatePurchaseRequest,
  PurchaseFilters,
  PurchaseStats
} from '../types'

interface UsePurchasesOptions {
  autoLoad?: boolean
  initialFilters?: PurchaseFilters
  pageSize?: number
}

interface UsePurchasesReturn {
  // Data
  purchases: Purchase[]
  suppliers: Supplier[]
  loading: {
    purchases: boolean
    suppliers: boolean
    creating: boolean
    updating: boolean
    deleting: boolean
  }
  error: string | null

  // Pagination
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    perPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }

  // Actions
  loadPurchases: (page?: number, filters?: PurchaseFilters) => Promise<void>
  loadSuppliers: () => Promise<void>
  createPurchase: (data: CreatePurchaseRequest) => Promise<Purchase>
  updatePurchase: (id: number, data: CreatePurchaseRequest) => Promise<Purchase>
  deletePurchase: (id: number) => Promise<void>
  refreshData: () => Promise<void>

  // Filters
  filters: PurchaseFilters
  setFilters: (filters: PurchaseFilters) => void
  clearFilters: () => void

  // Utility functions
  getPurchaseById: (id: number) => Purchase | undefined
  getSupplierById: (id: number) => Supplier | undefined
  searchPurchases: (query: string) => Promise<void>
  filterByStatus: (status: Purchase['status']) => Promise<void>
  filterBySupplier: (supplierId: number) => Promise<void>

  // Statistics
  stats: PurchaseStats
}

export const usePurchases = (options: UsePurchasesOptions = {}): UsePurchasesReturn => {
  const { autoLoad = false, initialFilters = {}, pageSize = 15 } = options

  // State
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState({
    purchases: false,
    suppliers: false,
    creating: false,
    updating: false,
    deleting: false
  })
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<PurchaseFilters>(initialFilters)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: pageSize,
    hasNextPage: false,
    hasPreviousPage: false
  })

  // Clear error when new actions start
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Load purchases with pagination and filters
  const loadPurchases = useCallback(
    async (page: number = 1, newFilters?: PurchaseFilters) => {
      const currentFilters = newFilters || filters

      setLoading(prev => ({ ...prev, purchases: true }))
      clearError()

      try {
        const response: PurchasesApiResponse = await purchaseService.getAll({
          ...currentFilters,
          page,
          per_page: pageSize
        })

        setPurchases(response.data.data)
        setPagination({
          currentPage: response.data.current_page,
          totalPages: response.data.last_page,
          totalItems: response.data.total,
          perPage: response.data.per_page,
          hasNextPage: response.data.next_page_url !== null,
          hasPreviousPage: response.data.prev_page_url !== null
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error loading purchases'
        setError(errorMessage)
      } finally {
        setLoading(prev => ({ ...prev, purchases: false }))
      }
    },
    [filters, pageSize, clearError]
  )

  // Load suppliers
  const loadSuppliers = useCallback(async () => {
    setLoading(prev => ({ ...prev, suppliers: true }))
    clearError()

    try {
      const suppliersData = await purchaseService.getSuppliers()
      setSuppliers(suppliersData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading suppliers'
      setError(errorMessage)
    } finally {
      setLoading(prev => ({ ...prev, suppliers: false }))
    }
  }, [clearError])

  // Create purchase
  const createPurchase = useCallback(
    async (data: CreatePurchaseRequest): Promise<Purchase> => {
      setLoading(prev => ({ ...prev, creating: true }))
      clearError()

      try {
        const newPurchase = await purchaseService.create(data)

        // Refresh purchases list
        await loadPurchases(pagination.currentPage, filters)

        return newPurchase
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error creating purchase'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(prev => ({ ...prev, creating: false }))
      }
    },
    [loadPurchases, pagination.currentPage, filters, clearError]
  )

  // Update purchase
  const updatePurchase = useCallback(
    async (id: number, data: CreatePurchaseRequest): Promise<Purchase> => {
      setLoading(prev => ({ ...prev, updating: true }))
      clearError()

      try {
        const updatedPurchase = await purchaseService.update(id, data)

        // Update local state
        setPurchases(prev => prev.map(purchase => (purchase.id === id ? updatedPurchase : purchase)))

        return updatedPurchase
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error updating purchase'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(prev => ({ ...prev, updating: false }))
      }
    },
    [clearError]
  )

  // Delete purchase
  const deletePurchase = useCallback(
    async (id: number): Promise<void> => {
      setLoading(prev => ({ ...prev, deleting: true }))
      clearError()

      try {
        await purchaseService.delete(id)

        // Remove from local state
        setPurchases(prev => prev.filter(purchase => purchase.id !== id))

        // If current page becomes empty and it's not the first page, go to previous page
        if (purchases && purchases.length === 1 && pagination.currentPage > 1) {
          await loadPurchases(pagination.currentPage - 1, filters)
        } else {
          // Just reload current page to get updated pagination
          await loadPurchases(pagination.currentPage, filters)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error deleting purchase'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(prev => ({ ...prev, deleting: false }))
      }
    },
    [purchases?.length, pagination.currentPage, filters, loadPurchases, clearError]
  )

  // Refresh data
  const refreshData = useCallback(async () => {
    await Promise.all([loadPurchases(pagination.currentPage, filters), loadSuppliers()])
  }, [loadPurchases, loadSuppliers, pagination.currentPage, filters])

  // Update filters
  const handleSetFilters = useCallback(
    (newFilters: PurchaseFilters) => {
      setFilters(newFilters)
      // Reset to first page when filters change
      loadPurchases(1, newFilters)
    },
    [loadPurchases]
  )

  // Clear filters
  const clearFilters = useCallback(() => {
    const clearedFilters = {}
    setFilters(clearedFilters)
    loadPurchases(1, clearedFilters)
  }, [loadPurchases])

  // Utility functions
  const getPurchaseById = useCallback(
    (id: number) => {
      return purchases?.find(purchase => purchase.id === id)
    },
    [purchases]
  )

  const getSupplierById = useCallback(
    (id: number) => {
      return suppliers?.find(supplier => supplier.id === id)
    },
    [suppliers]
  )

  // Search purchases
  const searchPurchases = useCallback(
    async (query: string) => {
      const newFilters = { ...filters, search: query }
      setFilters(newFilters)
      await loadPurchases(1, newFilters)
    },
    [filters, loadPurchases]
  )

  // Filter by status
  const filterByStatus = useCallback(
    async (status: Purchase['status']) => {
      const newFilters = { ...filters, status }
      setFilters(newFilters)
      await loadPurchases(1, newFilters)
    },
    [filters, loadPurchases]
  )

  // Filter by supplier
  const filterBySupplier = useCallback(
    async (supplierId: number) => {
      const newFilters = { ...filters, supplier_id: supplierId }
      setFilters(newFilters)
      await loadPurchases(1, newFilters)
    },
    [filters, loadPurchases]
  )

  // Calculate statistics
  const stats = useMemo<PurchaseStats>(() => {
    if (!purchases || !Array.isArray(purchases)) {
      return {
        total: 0,
        pending: 0,
        approved: 0,
        received: 0,
        cancelled: 0,
        totalAmount: 0
      }
    }

    const total = purchases.length
    const pending = purchases.filter(p => p.status === 'pending').length
    const approved = purchases.filter(p => p.status === 'approved').length
    const received = purchases.filter(p => p.status === 'received').length
    const cancelled = purchases.filter(p => p.status === 'cancelled').length

    const totalAmount = purchases.reduce((sum, p) => {
      const amount = typeof p.total_amount === 'string' ? parseFloat(p.total_amount) : p.total_amount
      return sum + (amount || 0)
    }, 0)

    return {
      total,
      pending,
      approved,
      received,
      cancelled,
      totalAmount
    }
  }, [purchases])

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      Promise.all([loadPurchases(1, filters), loadSuppliers()]).catch(() => {})
    }
  }, []) // Only run on mount

  return {
    // Data
    purchases,
    suppliers,
    loading,
    error,

    // Pagination
    pagination,

    // Actions
    loadPurchases,
    loadSuppliers,
    createPurchase,
    updatePurchase,
    deletePurchase,
    refreshData,

    // Filters
    filters,
    setFilters: handleSetFilters,
    clearFilters,

    // Utility functions
    getPurchaseById,
    getSupplierById,
    searchPurchases,
    filterByStatus,
    filterBySupplier,

    // Statistics
    stats
  }
}

export default usePurchases
