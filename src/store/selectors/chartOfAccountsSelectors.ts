import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import type { ChartOfAccount } from '@/features/chart-of-accounts/types'

// Base selectors
export const selectChartOfAccountsState = (state: RootState) => state.chartOfAccounts

// Data selectors
export const selectChartOfAccounts = createSelector(
  [selectChartOfAccountsState],
  chartOfAccountsState => chartOfAccountsState?.accounts || []
)

export const selectChartOfAccountById = (id: number) =>
  createSelector([selectChartOfAccounts], accounts => accounts?.find(account => account.id === id))

// Loading selectors
export const selectChartOfAccountsLoading = createSelector(
  [selectChartOfAccountsState],
  chartOfAccountsState =>
    chartOfAccountsState?.loading || {
      list: false,
      create: false,
      update: false,
      delete: false,
      search: false
    }
)

export const selectIsAnyChartOfAccountLoading = createSelector(
  [selectChartOfAccountsLoading],
  loading => loading.list || loading.create || loading.update || loading.delete || loading.search
)

// Error selectors
export const selectChartOfAccountsError = createSelector(
  [selectChartOfAccountsState],
  chartOfAccountsState => chartOfAccountsState?.error || null
)

export const selectChartOfAccountsValidationErrors = createSelector(
  [selectChartOfAccountsState],
  chartOfAccountsState => chartOfAccountsState?.validationErrors || null
)

// Pagination selectors
export const selectChartOfAccountsPagination = createSelector(
  [selectChartOfAccountsState],
  chartOfAccountsState =>
    chartOfAccountsState?.pagination || {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      perPage: 15,
      hasNextPage: false,
      hasPreviousPage: false
    }
)

// Filters selectors
export const selectChartOfAccountsFilters = createSelector(
  [selectChartOfAccountsState],
  chartOfAccountsState => chartOfAccountsState?.filters || {}
)

// Stats selectors (con verificación de seguridad)
export const selectChartOfAccountsStats = createSelector([selectChartOfAccounts], accounts => {
  // Verificar que accounts existe y es un array
  if (!accounts || !Array.isArray(accounts)) {
    return {
      total: 0,
      active: 0,
      inactive: 0,
      byType: {},
      byLevel: {}
    }
  }

  return {
    total: accounts.length,
    active: accounts.filter(account => account?.is_active).length,
    inactive: accounts.filter(account => !account?.is_active).length,
    byType: accounts.reduce(
      (acc, account) => {
        if (account?.account_type) {
          acc[account.account_type] = (acc[account.account_type] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>
    ),
    byLevel: accounts.reduce(
      (acc, account) => {
        if (account?.level !== undefined) {
          acc[account.level] = (acc[account.level] || 0) + 1
        }
        return acc
      },
      {} as Record<number, number>
    )
  }
})

// Hierarchical selectors (con verificación de seguridad)
export const selectRootChartOfAccounts = createSelector([selectChartOfAccounts], accounts => {
  if (!accounts || !Array.isArray(accounts)) return []
  return accounts.filter(account => account?.parent_account_id === null)
})

export const selectChildChartOfAccounts = (parentId: number) =>
  createSelector([selectChartOfAccounts], accounts => {
    if (!accounts || !Array.isArray(accounts)) return []
    return accounts.filter(account => account?.parent_account_id === parentId)
  })

// Filter-based selectors (con verificación de seguridad)
export const selectChartOfAccountsByType = (accountType: string) =>
  createSelector([selectChartOfAccounts], accounts => {
    if (!accounts || !Array.isArray(accounts)) return []
    return accounts.filter(account => account?.account_type === accountType)
  })

export const selectActiveChartOfAccounts = createSelector([selectChartOfAccounts], accounts => {
  if (!accounts || !Array.isArray(accounts)) return []
  return accounts.filter(account => account?.is_active)
})

export const selectChartOfAccountsByLevel = (level: number) =>
  createSelector([selectChartOfAccounts], accounts => {
    if (!accounts || !Array.isArray(accounts)) return []
    return accounts.filter(account => account?.level === level)
  })

// Search selectors (con verificación de seguridad)
export const selectFilteredChartOfAccounts = createSelector(
  [selectChartOfAccounts, selectChartOfAccountsFilters],
  (accounts, filters) => {
    if (!accounts || !Array.isArray(accounts)) return []

    let filtered = accounts

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        account =>
          account?.account_name?.toLowerCase().includes(searchLower) ||
          account?.account_code?.toLowerCase().includes(searchLower) ||
          account?.description?.toLowerCase().includes(searchLower)
      )
    }

    if (filters?.account_type) {
      filtered = filtered.filter(account => account?.account_type === filters.account_type)
    }

    if (filters?.level !== undefined) {
      filtered = filtered.filter(account => account?.level === filters.level)
    }

    if (filters?.is_active !== undefined) {
      filtered = filtered.filter(account => account?.is_active === filters.is_active)
    }

    if (filters?.parent_account_id !== undefined) {
      filtered = filtered.filter(account => account?.parent_account_id === filters.parent_account_id)
    }

    return filtered
  }
)
