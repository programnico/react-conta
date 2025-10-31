// store/slices/productSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import { productService } from '@/features/product/services/productService'
import type { Product, ProductsApiClientResponse, CreateProductRequest, ProductFilters } from '@/features/product/types'

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: { page?: number; filters?: ProductFilters; pageSize?: number }) => {
    const { page = 1, filters = {}, pageSize = 15 } = params
    const response = await productService.getAll({
      ...filters,
      page,
      per_page: pageSize
    })
    // El apiClient ya extrae la propiedad 'data' automáticamente,
    // así que response ya es la estructura de paginación
    return response
  }
)

export const createProduct = createAsyncThunk('products/createProduct', async (data: CreateProductRequest) => {
  const product = await productService.create(data)
  return product
})

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, data }: { id: number; data: CreateProductRequest }) => {
    const product = await productService.update(id, data)
    return product
  }
)

export const deleteProduct = createAsyncThunk('products/deleteProduct', async (id: number) => {
  await productService.delete(id)
  return id
})

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (params: { query: string; filters?: ProductFilters; pageSize?: number }) => {
    const { query, filters = {}, pageSize = 15 } = params
    const searchFilters = {
      ...filters,
      per_page: pageSize
    }
    const response = await productService.search(query, searchFilters)
    // El apiClient ya extrae la propiedad 'data' automáticamente
    return response
  }
)

// Initial state
interface ProductState {
  products: Product[]
  loading: {
    list: boolean
    create: boolean
    update: boolean
    delete: boolean
    search: boolean
  }
  error: string | null
  filters: ProductFilters
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    perPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

const initialState: ProductState = {
  products: [],
  loading: {
    list: false,
    create: false,
    update: false,
    delete: false,
    search: false
  },
  error: null,
  filters: {},
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 15,
    hasNextPage: false,
    hasPreviousPage: false
  }
}

// Slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProductFilters: (state, action: PayloadAction<ProductFilters>) => {
      state.filters = action.payload
    },
    clearProductFilters: state => {
      state.filters = {}
    },
    clearProductError: state => {
      state.error = null
    },
    resetProducts: state => {
      state.products = []
      state.pagination = initialState.pagination
    },
    resetProductLoadingStates: state => {
      state.loading = {
        list: false,
        create: false,
        update: false,
        delete: false,
        search: false
      }
    },
    // Nuevas acciones para manejo de paginación
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.perPage = action.payload
      state.pagination.currentPage = 1 // Reset to page 1 when changing page size
    },
    // Acción combinada para cambiar filtros y resetear página
    setFiltersAndResetPage: (state, action: PayloadAction<ProductFilters>) => {
      state.filters = action.payload
      state.pagination.currentPage = 1 // Reset to page 1 when filters change
    }
  },
  extraReducers: builder => {
    // Fetch products
    builder
      .addCase(fetchProducts.pending, state => {
        if (typeof state.loading !== 'object' || state.loading === null) {
          state.loading = {
            list: false,
            create: false,
            update: false,
            delete: false,
            search: false
          }
        }
        state.loading.list = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        if (typeof state.loading !== 'object' || state.loading === null) {
          state.loading = {
            list: false,
            create: false,
            update: false,
            delete: false,
            search: false
          }
        }
        state.loading.list = false

        // El apiClient extrae automáticamente 'data', así que recibimos directamente la estructura de paginación
        // Estructura esperada: { current_page, data: [...], last_page, total, per_page, next_page_url, etc. }
        if (
          action.payload &&
          typeof action.payload === 'object' &&
          'data' in action.payload &&
          Array.isArray(action.payload.data)
        ) {
          // Estructura de paginación estándar (apiClient ya extrajo el nivel superior 'data')
          state.products = action.payload.data
          state.pagination = {
            currentPage: action.payload.current_page || 1,
            totalPages: action.payload.last_page || 1,
            totalItems: action.payload.total || 0,
            perPage: action.payload.per_page || state.pagination.perPage,
            hasNextPage: action.payload.next_page_url !== null,
            hasPreviousPage: action.payload.prev_page_url !== null
          }
        } else if (Array.isArray(action.payload)) {
          // Payload es array directo (fallback para compatibilidad)
          state.products = action.payload
          state.pagination = {
            currentPage: 1,
            totalPages: 1,
            totalItems: action.payload.length,
            perPage: action.payload.length,
            hasNextPage: false,
            hasPreviousPage: false
          }
        } else {
          // Fallback a array vacío
          state.products = []
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        if (typeof state.loading !== 'object' || state.loading === null) {
          state.loading = {
            list: false,
            create: false,
            update: false,
            delete: false,
            search: false
          }
        }
        state.loading.list = false
        state.error = action.error.message || 'Error fetching products'
      })

    // Create product
    builder
      .addCase(createProduct.pending, state => {
        state.loading.create = true
        state.error = null
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading.create = false
        // Add new product to the beginning of the list
        state.products.unshift(action.payload)
        state.pagination.totalItems += 1
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading.create = false
        state.error = action.error.message || 'Error creating product'
      })

    // Update product
    builder
      .addCase(updateProduct.pending, state => {
        state.loading.update = true
        state.error = null
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading.update = false
        const index = state.products.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.products[index] = action.payload
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading.update = false
        state.error = action.error.message || 'Error updating product'
      })

    // Delete product
    builder
      .addCase(deleteProduct.pending, state => {
        state.loading.delete = true
        state.error = null
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading.delete = false
        state.products = state.products.filter(p => p.id !== action.payload)
        state.pagination.totalItems -= 1
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading.delete = false
        state.error = action.error.message || 'Error deleting product'
      })

    // Search products
    builder
      .addCase(searchProducts.pending, state => {
        state.loading.search = true
        state.error = null
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading.search = false

        // Usar la misma lógica que fetchProducts para consistencia
        // El apiClient extrae automáticamente 'data', recibimos la estructura de paginación directamente
        if (
          action.payload &&
          typeof action.payload === 'object' &&
          'data' in action.payload &&
          Array.isArray(action.payload.data)
        ) {
          state.products = action.payload.data
          state.pagination = {
            currentPage: action.payload.current_page || 1,
            totalPages: action.payload.last_page || 1,
            totalItems: action.payload.total || 0,
            perPage: action.payload.per_page || state.pagination.perPage,
            hasNextPage: action.payload.next_page_url !== null,
            hasPreviousPage: action.payload.prev_page_url !== null
          }
        } else if (Array.isArray(action.payload)) {
          // Fallback si es array directo
          state.products = action.payload
          state.pagination = {
            currentPage: 1,
            totalPages: 1,
            totalItems: action.payload.length,
            perPage: action.payload.length,
            hasNextPage: false,
            hasPreviousPage: false
          }
        } else {
          state.products = []
          state.pagination = {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            perPage: 15,
            hasNextPage: false,
            hasPreviousPage: false
          }
        }
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading.search = false
        state.error = action.error.message || 'Error searching products'
      })
  }
})

export const {
  setProductFilters,
  clearProductFilters,
  clearProductError,
  resetProducts,
  resetProductLoadingStates,
  setCurrentPage,
  setPageSize,
  setFiltersAndResetPage
} = productSlice.actions

export default productSlice.reducer
