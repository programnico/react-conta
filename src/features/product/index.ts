// features/product/index.ts
// Types
export type {
  Product,
  CreateProductRequest,
  ProductFilters as ProductFiltersType,
  ProductsApiResponse,
  ProductStats
} from './types'

// Components
export { default as ProductForm } from './components/ProductForm'
export { default as ProductsTable } from './components/ProductsTable'
export { default as ProductFilters } from './components/ProductFilters'

// Hooks
export { useProductsRedux } from './hooks/useProductsRedux'
export { useProductForm } from './hooks/useProductForm'

// Services
export { productService } from './services/productService'
