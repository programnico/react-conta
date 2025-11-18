// features/product/components/ProductsTable.tsx
'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Avatar,
  Box,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, Inventory as InventoryIcon } from '@mui/icons-material'

import SmartPagination from '@/components/pagination/SmartPagination'
import { useProductsRedux } from '../hooks/useProductsRedux'
import type { Product, ProductFilters } from '../types'

interface ProductsTableProps {
  // No props needed - everything through Redux
}

const ProductsTableComponent: React.FC<ProductsTableProps> = () => {
  // Estado local para UI
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  })

  // Redux state
  const {
    products,
    loading,
    loadingStates,
    needsReload,
    pagination,
    filters,
    loadProducts,
    deleteProduct,
    setNeedsReload,
    setCurrentPage,
    setRowsPerPage,
    resetPagination,
    openForm
  } = useProductsRedux()

  const { currentPage, rowsPerPage, totalPages, totalRecords } = pagination

  // Referencias para controlar efectos
  const isInitialMount = useRef(true)
  const lastLoadParamsRef = useRef<string>('')
  const loadTimeoutRef = useRef<NodeJS.Timeout>()

  // === ÚNICO CONTROLADOR DE CARGA SIMPLIFICADO ===
  useEffect(() => {
    // Limpiar timeout previo
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current)
    }

    const executeLoad = () => {
      // Parámetros actuales para la carga
      const loadParams = {
        page: currentPage,
        per_page: rowsPerPage,
        ...filters
      }
      const paramsString = JSON.stringify(loadParams)

      // Solo cargar si los parámetros cambiaron o es carga inicial o needsReload
      const shouldLoad = isInitialMount.current || needsReload || lastLoadParamsRef.current !== paramsString

      if (shouldLoad) {
        lastLoadParamsRef.current = paramsString

        // Clear initial mount flag IMMEDIATELY to prevent rapid re-executions
        if (isInitialMount.current) {
          isInitialMount.current = false
        }

        loadProducts(loadParams)
          .catch(err => {
            console.error('Error loading products:', err)
          })
          .finally(() => {
            if (needsReload) {
              setNeedsReload(false)
            }
          })
      }
    }

    // Para carga inicial o needsReload, ejecutar inmediatamente
    if (isInitialMount.current || needsReload) {
      executeLoad()
    } else {
      // Para cambios en filtros/paginación, debounce de 600ms
      loadTimeoutRef.current = setTimeout(executeLoad, 600)
    }

    // Cleanup
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
      }
    }
  }, [currentPage, rowsPerPage, JSON.stringify(filters), needsReload, loadProducts, setNeedsReload])

  // === RESET PAGINATION CUANDO CAMBIEN FILTROS ===
  const previousFiltersRef = useRef<string>('')

  useEffect(() => {
    const currentFiltersString = JSON.stringify(filters)

    // Skip inicial mount
    if (isInitialMount.current) {
      previousFiltersRef.current = currentFiltersString
      return
    }

    // Solo resetear paginación si los filtros realmente cambiaron (no la página)
    if (previousFiltersRef.current !== currentFiltersString) {
      previousFiltersRef.current = currentFiltersString

      // Resetear paginación cuando cambien filtros
      if (currentPage !== 1) {
        setCurrentPage(1)
      }
    }
  }, [filters, currentPage, setCurrentPage])

  // === AJUSTAR PÁGINA SI ESTÁ FUERA DE RANGO ===
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage, setCurrentPage])

  // === PAGINATION HANDLERS (Solo cambian estado Redux, el useEffect principal carga) ===

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // El useEffect principal se encarga de cargar automáticamente
  }

  const handlePerPageChange = (perPage: number) => {
    setRowsPerPage(perPage) // Esto resetea a página 1 internamente
    // El useEffect principal se encarga de cargar automáticamente
  }

  // === DELETE HANDLERS ===
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.id).unwrap()
        setSnackbar({
          open: true,
          message: 'Producto eliminado exitosamente',
          severity: 'success'
        })
        // The table will refresh automatically through needsReload
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Error al eliminar el producto',
          severity: 'error'
        })
      }
    }
    setDeleteConfirmOpen(false)
    setProductToDelete(null)
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numPrice)
  }

  const formatStock = (stock: string | number) => {
    const numStock = typeof stock === 'string' ? parseFloat(stock) : stock
    return Math.floor(numStock)
  }

  const getStockChipProps = (stock: string | number) => {
    const numStock = formatStock(stock)
    if (numStock === 0) {
      return { color: 'error' as const, label: 'Sin stock' }
    } else if (numStock < 10) {
      return { color: 'warning' as const, label: 'Stock bajo' }
    } else {
      return { color: 'success' as const, label: 'En stock' }
    }
  }

  const calculateMargin = (sellingPrice: string | number, costPrice: string | number) => {
    const selling = typeof sellingPrice === 'string' ? parseFloat(sellingPrice) : sellingPrice
    const cost = typeof costPrice === 'string' ? parseFloat(costPrice) : costPrice

    if (cost === 0) return 0
    return ((selling - cost) / cost) * 100
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell align='right'>Stock</TableCell>
              <TableCell align='right'>Precio Costo</TableCell>
              <TableCell align='right'>Precio Venta</TableCell>
              <TableCell align='right'>Margen %</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align='center'>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingStates.fetching && products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align='center'>
                  <Box py={8} display='flex' flexDirection='column' alignItems='center' gap={2}>
                    <CircularProgress size={48} />
                    <Typography variant='body1' color='text.secondary'>
                      Cargando productos...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align='center'>
                  <Box py={4}>
                    <Typography variant='body1' color='text.secondary'>
                      No se encontraron productos
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              products.map(product => {
                const stockProps = getStockChipProps(product.stock_quantity)
                const margin = calculateMargin(product.selling_price, product.cost_price)

                return (
                  <TableRow
                    key={product.id}
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <TableCell>
                      <Box display='flex' alignItems='center' gap={2}>
                        <Avatar src={product.image_url} alt={product.name} sx={{ width: 40, height: 40 }}>
                          {product.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant='body2' fontWeight='bold'>
                            {product.name}
                          </Typography>
                          {product.description && (
                            <Typography
                              variant='caption'
                              color='text.secondary'
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                maxWidth: 200
                              }}
                            >
                              {product.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant='body2' fontFamily='monospace'>
                        {product.product_code}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip label={product.category} size='small' variant='outlined' />
                    </TableCell>

                    <TableCell align='right'>
                      <Box display='flex' flexDirection='column' alignItems='flex-end' gap={0.5}>
                        <Typography variant='body2' fontWeight='bold'>
                          {formatStock(product.stock_quantity)}
                        </Typography>
                        <Chip {...stockProps} size='small' sx={{ fontSize: '0.7rem', height: 20 }} />
                      </Box>
                    </TableCell>

                    <TableCell align='right'>
                      <Typography variant='body2'>{formatPrice(product.cost_price)}</Typography>
                    </TableCell>

                    <TableCell align='right'>
                      <Typography variant='body2' fontWeight='bold'>
                        {formatPrice(product.selling_price)}
                      </Typography>
                    </TableCell>

                    <TableCell align='right'>
                      <Typography
                        variant='body2'
                        color={margin > 30 ? 'success.main' : margin > 15 ? 'warning.main' : 'error.main'}
                        fontWeight='bold'
                      >
                        {margin.toFixed(1)}%
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={product.is_active ? 'Activo' : 'Inactivo'}
                        color={product.is_active ? 'success' : 'default'}
                        size='small'
                      />
                    </TableCell>

                    <TableCell align='center'>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title='Editar'>
                          <IconButton size='small' color='primary' onClick={() => openForm('edit', product)}>
                            <EditIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Eliminar'>
                          <IconButton size='small' color='error' onClick={() => handleDeleteClick(product)}>
                            <DeleteIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* SmartPagination integrado */}
      <SmartPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalRecords}
        perPage={rowsPerPage}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
        disabled={loading}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          ¿Estás seguro de que deseas eliminar el producto "{productToDelete?.name}"? Esta acción no se puede deshacer.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color='error' variant='contained' disabled={loading}>
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  )
}

export default ProductsTableComponent
