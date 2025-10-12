// store/migrations.ts
export const migratePersistentState = (state: any, version: number) => {
  // If no state, return undefined to let Redux Persist handle it
  if (!state) {
    return undefined
  }

  // Clone state to avoid mutations
  const newState = { ...state }

  // Migration from version 1 to 2: Fix supplier loading state
  if (version === 2) {
    // Migrate supplier state if needed
    if (newState.suppliers) {
      // Fix loading state if it's corrupted
      if (typeof newState.suppliers.loading !== 'object' || newState.suppliers.loading === null) {
        newState.suppliers = {
          ...newState.suppliers,
          loading: {
            list: false,
            create: false,
            update: false,
            delete: false,
            search: false
          }
        }
      }

      // Ensure pagination exists
      if (!newState.suppliers.pagination) {
        newState.suppliers.pagination = {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          perPage: 15,
          hasNextPage: false,
          hasPreviousPage: false
        }
      }

      // Ensure suppliers array exists
      if (!Array.isArray(newState.suppliers.suppliers)) {
        newState.suppliers.suppliers = []
      }
    }
  }

  return newState
}
