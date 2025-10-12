// features/product/components/ProductsTable.tsx
'use client'

import React from 'react'
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

import type { Product } from '../types'

interface ProductsTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  loading?: boolean
}

const ProductsTableComponent: React.FC<ProductsTableProps> = ({ products, onEdit, onDelete, loading = false }) => {
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
  )
}

export default ProductsTableComponent
