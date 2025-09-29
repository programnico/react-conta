// store/migrations.ts
export const migratePersistentState = (state: any, version: number) => {
  console.log('🔧 Migration called - version:', version, 'state exists:', !!state)

  // If no state, return undefined to let Redux Persist handle it
  if (!state) {
    console.log('📝 No existing state found, letting Redux Persist initialize')
    return undefined
  }

  // Clone state to avoid mutations
  const newState = { ...state }

  // Migration from version 1 to 2: Fix supplier loading state
  if (version === 2) {
    console.log('🔧 Running migration to version 2...')

    // Migrate supplier state if needed
    if (newState.suppliers) {
      // Fix loading state if it's corrupted
      if (typeof newState.suppliers.loading !== 'object' || newState.suppliers.loading === null) {
        console.log('🔧 Migrating supplier loading state from:', newState.suppliers.loading)
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

  console.log('✅ Migration completed successfully')
  return newState
}
