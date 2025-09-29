// features/purchase/components/PurchasesTable.tsx
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
  Typography,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon
} from '@mui/icons-material'
import type { Purchase } from '../types'

interface PurchasesTableProps {
  purchases: Purchase[]
  loading?: boolean
  onEdit: (purchase: Purchase) => void
  onDelete: (purchase: Purchase) => void
  onView?: (purchase: Purchase) => void
}

const getStatusColor = (status: Purchase['status']) => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'approved':
      return 'info'
    case 'received':
      return 'success'
    case 'cancelled':
      return 'error'
    default:
      return 'default'
  }
}

const getStatusLabel = (status: Purchase['status']) => {
  switch (status) {
    case 'pending':
      return 'Pendiente'
    case 'approved':
      return 'Aprobada'
    case 'received':
      return 'Recibida'
    case 'cancelled':
      return 'Cancelada'
    default:
      return status
  }
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

const formatCurrency = (amount: string | number) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD'
  }).format(numAmount || 0)
}

export const PurchasesTable: React.FC<PurchasesTableProps> = ({
  purchases,
  loading = false,
  onEdit,
  onDelete,
  onView
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [selectedPurchase, setSelectedPurchase] = React.useState<Purchase | null>(null)

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, purchase: Purchase) => {
    setAnchorEl(event.currentTarget)
    setSelectedPurchase(purchase)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedPurchase(null)
  }

  const handleEdit = () => {
    if (selectedPurchase) {
      onEdit(selectedPurchase)
    }
    handleMenuClose()
  }

  const handleDelete = () => {
    if (selectedPurchase) {
      onDelete(selectedPurchase)
    }
    handleMenuClose()
  }

  const handleView = () => {
    if (selectedPurchase && onView) {
      onView(selectedPurchase)
    }
    handleMenuClose()
  }

  if (loading) {
    return (
      <Paper>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Cargando compras...</Typography>
        </Box>
      </Paper>
    )
  }

  if (!purchases || purchases.length === 0) {
    return (
      <Paper>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant='body1' color='text.secondary'>
            No se encontraron compras
          </Typography>
        </Box>
      </Paper>
    )
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Documento</TableCell>
              <TableCell>Proveedor</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Vencimiento</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell align='center'>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchases
              ?.filter(purchase => purchase != null)
              ?.map(purchase => (
                <TableRow key={purchase.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant='body2' fontWeight='medium'>
                        {purchase.document_number}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {purchase.document_type.toUpperCase()}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box>
                      <Typography variant='body2' fontWeight='medium'>
                        {purchase.supplier?.name || 'N/A'}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {purchase.supplier?.business_name || ''}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant='body2'>{formatDate(purchase.purchase_date)}</Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant='body2'>{formatDate(purchase.due_date)}</Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant='body2' fontWeight='medium'>
                      {formatCurrency(purchase.total_amount)}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Subtotal: {formatCurrency(purchase.subtotal)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={getStatusLabel(purchase.status)}
                      color={getStatusColor(purchase.status)}
                      size='small'
                    />
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                        {purchase.user?.name?.charAt(0) || 'U'}
                      </Avatar>
                      <Typography variant='body2'>{purchase.user?.name || 'N/A'}</Typography>
                    </Box>
                  </TableCell>

                  <TableCell align='center'>
                    <Tooltip title='Más opciones'>
                      <IconButton size='small' onClick={e => handleMenuClick(e, purchase)}>
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {onView && (
          <MenuItem onClick={handleView}>
            <ViewIcon fontSize='small' sx={{ mr: 1 }} />
            Ver Detalles
          </MenuItem>
        )}

        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize='small' sx={{ mr: 1 }} />
          Editar
        </MenuItem>

        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize='small' sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>
    </>
  )
}

export default PurchasesTable
