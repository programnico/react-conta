// store/slices/productSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import { productService } from '@/features/product/services/productService'
import type {
  Product,
  ProductsApiClientResponse,
  ProductsApiResponse,
  CreateProductRequest,
  ProductFilters
} from '@/features/product/types'

// Async thunks
export const fetchProducts = createAsyncThunk<
  ProductsApiResponse | ProductsApiClientResponse, // Tipo de retorno: puede ser cualquiera de los dos
  { page?: number; filters?: ProductFilters; pageSize?: number }
>('products/fetchProducts', async (params, { rejectWithValue }) => {
  try {
    const { page = 1, filters = {}, pageSize = 15 } = params
    const response = await productService.getAll({
      page,
      per_page: pageSize,
      ...filters
    })
    return response
  } catch (error: any) {
    console.error('Error fetching products:', error)
    return rejectWithValue(error.message || 'Error al obtener productos')
  }
})

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (data: CreateProductRequest, { rejectWithValue }) => {
    try {
      const product = await productService.create(data)
      return product
    } catch (error: any) {
      // Si es un ApiError con errores de validación, los incluimos
      if (error.errors) {
        return rejectWithValue({
          message: error.message || 'Error al crear producto',
          validationErrors: error.errors
        })
      }
      return rejectWithValue({
        message: error.message || 'Error al crear producto',
        validationErrors: null
      })
    }
  }
)

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, data }: { id: number; data: CreateProductRequest }, { rejectWithValue }) => {
    try {
      const product = await productService.update(id, data)
      return product
    } catch (error: any) {
      // Si es un ApiError con errores de validación, los incluimos
      if (error.errors) {
        return rejectWithValue({
          message: error.message || 'Error al actualizar producto',
          validationErrors: error.errors
        })
      }
      return rejectWithValue({
        message: error.message || 'Error al actualizar producto',
        validationErrors: null
      })
    }
  }
)

export const deleteProduct = createAsyncThunk('products/deleteProduct', async (id: number, { rejectWithValue }) => {
  try {
    await productService.delete(id)
    return id
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error al eliminar producto')
  }
})

export const searchProducts = createAsyncThunk<
  ProductsApiResponse | ProductsApiClientResponse,
  { query: string; filters?: ProductFilters; pageSize?: number }
>('products/searchProducts', async (params, { rejectWithValue }) => {
  try {
    const { query, filters = {}, pageSize = 15 } = params
    const searchFilters = {
      ...filters,
      per_page: pageSize
    }
    const response = await productService.search(query, searchFilters)
    return response
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error al buscar productos')
  }
})

// Helper function para extraer datos de paginación de la respuesta
const extractPaginationData = (payload: ProductsApiResponse | ProductsApiClientResponse) => {
  // Caso 1: Respuesta completa del API { status, message, data: {...} }
  if ('status' in payload && 'data' in payload && payload.data && typeof payload.data === 'object') {
    return payload.data
  }
  // Caso 2: ApiClient ya extrajo 'data' - solo estructura de paginación { current_page, data: [], ... }
  else if ('current_page' in payload && 'data' in payload) {
    return payload
  }
  return null
}

// Initial state
interface ProductState {
  products: Product[]
  loading: boolean
  error: string | null
  validationErrors: Record<string, string[]> | null
  filters: ProductFilters
  selectedProduct: Product | null
  needsReload: boolean
  // Estado de paginación local (separado de meta del servidor)
  pagination: {
    currentPage: number
    rowsPerPage: number
  }
  meta: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
  } | null
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  validationErrors: null,
  filters: {},
  selectedProduct: null,
  needsReload: false,
  pagination: {
    currentPage: 1,
    rowsPerPage: 15
  },
  meta: null
}

// Slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null
    },
    clearValidationErrors: state => {
      state.validationErrors = null
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload
    },
    clearSelectedProduct: state => {
      state.selectedProduct = null
    },
    setFilters: (state, action: PayloadAction<ProductFilters>) => {
      state.filters = action.payload
    },
    clearFilters: state => {
      state.filters = {}
    },
    setNeedsReload: (state, action: PayloadAction<boolean>) => {
      state.needsReload = action.payload
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload
    },
    setRowsPerPage: (state, action: PayloadAction<number>) => {
      state.pagination.rowsPerPage = action.payload
      // Resetear a página 1 cuando cambie el tamaño de página
      state.pagination.currentPage = 1
    },
    resetPagination: state => {
      state.pagination.currentPage = 1
    }
  },
  extraReducers: builder => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.needsReload = false // Limpiar flag de recarga

        const paginationData = extractPaginationData(action.payload)

        if (paginationData && 'data' in paginationData && Array.isArray(paginationData.data)) {
          state.products = paginationData.data
          state.meta = {
            current_page: paginationData.current_page || 1,
            from: paginationData.from || 0,
            last_page: paginationData.last_page || 1,
            per_page: paginationData.per_page || 15,
            to: paginationData.to || 0,
            total: paginationData.total || 0
          }
        } else {
          // Fallback
          console.error('Unexpected products response structure:', action.payload)
          state.products = []
          state.meta = null
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Create product
      .addCase(createProduct.pending, state => {
        state.loading = true
        state.error = null
        state.validationErrors = null
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        state.validationErrors = null
        // Marcar que necesita recarga
        state.needsReload = true
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false
        const payload = action.payload as any
        if (payload && typeof payload === 'object') {
          state.error = payload.message
          state.validationErrors = payload.validationErrors
        } else {
          state.error = payload as string
          state.validationErrors = null
        }
      })
      // Update product
      .addCase(updateProduct.pending, state => {
        state.loading = true
        state.error = null
        state.validationErrors = null
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        state.validationErrors = null
        // Marcar que necesita recarga para mantener consistencia
        state.needsReload = true
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false
        const payload = action.payload as any
        if (payload && typeof payload === 'object') {
          state.error = payload.message
          state.validationErrors = payload.validationErrors
        } else {
          state.error = payload as string
          state.validationErrors = null
        }
      })
      // Delete product
      .addCase(deleteProduct.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false
        // Marcar que necesita recarga
        state.needsReload = true
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Search products
      .addCase(searchProducts.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading = false

        const paginationData = extractPaginationData(action.payload)

        if (paginationData && 'data' in paginationData && Array.isArray(paginationData.data)) {
          state.products = paginationData.data
          state.meta = {
            current_page: paginationData.current_page || 1,
            from: paginationData.from || 0,
            last_page: paginationData.last_page || 1,
            per_page: paginationData.per_page || 15,
            to: paginationData.to || 0,
            total: paginationData.total || 0
          }
        } else {
          // Fallback
          console.error('Unexpected search products response structure:', action.payload)
          state.products = []
          state.meta = null
        }
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const {
  clearError,
  clearValidationErrors,
  setSelectedProduct,
  clearSelectedProduct,
  setFilters,
  clearFilters,
  setNeedsReload,
  setCurrentPage,
  setRowsPerPage,
  resetPagination
} = productSlice.actions

export default productSlice.reducer
