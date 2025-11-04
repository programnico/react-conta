// features/product/components/ProductsTable.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
  TableSortLabel
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, Inventory as InventoryIcon } from '@mui/icons-material'

import SmartPagination from '@/components/pagination/SmartPagination'
import { useProductsRedux } from '../hooks/useProductsRedux'
import type { Product, ProductFilters } from '../types'

interface ProductsTableProps {
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  filters?: ProductFilters
}

const ProductsTableComponent: React.FC<ProductsTableProps> = ({ onEdit, onDelete, filters = {} }) => {
  // Redux state - Ya no necesitamos estado local
  const {
    products,
    loading,
    meta,
    needsReload,
    pagination,
    loadProducts,
    setNeedsReload,
    setCurrentPage,
    setRowsPerPage,
    resetPagination
  } = useProductsRedux()

  const { currentPage, rowsPerPage } = pagination

  // Memoizar filtros para evitar dependencias circulares
  const filtersString = JSON.stringify(filters)

  // Memoizar la función de carga para evitar dependencias circulares
  const loadProductsWithFilters = useCallback(() => {
    loadProducts(filters)
  }, [loadProducts, filtersString])

  // Load initial data and reload when filters or pagination change
  useEffect(() => {
    loadProductsWithFilters()
  }, [currentPage, rowsPerPage, loadProductsWithFilters])

  // Recargar productos cuando se marque needsReload
  useEffect(() => {
    if (needsReload) {
      loadProductsWithFilters()
      setNeedsReload(false)
    }
  }, [needsReload, loadProductsWithFilters, setNeedsReload])

  // Reset pagination cuando cambien los filtros
  useEffect(() => {
    resetPagination()
  }, [filtersString, resetPagination])

  // Ajustar página si está fuera del rango disponible
  useEffect(() => {
    if (meta && meta.last_page > 0 && currentPage > meta.last_page) {
      setCurrentPage(meta.last_page)
    }
  }, [meta?.last_page, currentPage, setCurrentPage])

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePerPageChange = (perPage: number) => {
    setRowsPerPage(perPage) // Esto ya resetea a página 1 internamente
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

  if (products.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <InventoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant='h6' color='text.secondary'>
          No se encontraron productos
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Los productos aparecerán aquí una vez que los agregues.
        </Typography>
      </Paper>
    )
  }

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
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
            {products.map(product => {
              const stockProps = getStockChipProps(product.stock_quantity)
              const margin = calculateMargin(product.selling_price, product.cost_price)

              return (
                <TableRow key={product.id} hover>
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
                    <Box display='flex' justifyContent='center' gap={1}>
                      <Tooltip title='Editar producto'>
                        <IconButton size='small' onClick={() => onEdit(product)} disabled={loading}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Eliminar producto'>
                        <IconButton size='small' onClick={() => onDelete(product)} disabled={loading} color='error'>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginador integrado */}
      {meta && meta.total > 0 && (
        <Box mt={2}>
          <SmartPagination
            currentPage={currentPage}
            totalPages={meta.last_page}
            totalItems={meta.total}
            perPage={rowsPerPage}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            perPageOptions={[5, 10, 15, 25, 50, 100]}
            disabled={loading}
            showPageInfo={true}
            pageWindow={3}
          />
        </Box>
      )}
    </Box>
  )
}

export default ProductsTableComponent
