// features/supplier/components/SuppliersTable.tsx
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
  Visibility as ViewIcon,
  Business as BusinessIcon
} from '@mui/icons-material'
import type { Supplier, SupplierType, SupplierClassification } from '../types'

interface SuppliersTableProps {
  suppliers: Supplier[]
  loading?: boolean
  onEdit: (supplier: Supplier) => void
  onDelete: (supplier: Supplier) => void
  onView?: (supplier: Supplier) => void
}

const getTypeColor = (type: SupplierType) => {
  switch (type) {
    case 'local':
      return 'primary'
    case 'foreign':
      return 'secondary'
    default:
      return 'default'
  }
}

const getTypeLabel = (type: SupplierType) => {
  switch (type) {
    case 'local':
      return 'Local'
    case 'foreign':
      return 'Extranjero'
    default:
      return type
  }
}

const getClassificationColor = (classification: SupplierClassification) => {
  switch (classification) {
    case 'large':
      return 'error'
    case 'medium':
      return 'warning'
    case 'small':
      return 'info'
    case 'none':
      return 'default'
    case 'other':
      return 'secondary'
    default:
      return 'default'
  }
}

const getClassificationLabel = (classification: SupplierClassification) => {
  switch (classification) {
    case 'none':
      return 'Ninguna'
    case 'small':
      return 'Pequeña'
    case 'medium':
      return 'Mediana'
    case 'large':
      return 'Grande'
    case 'other':
      return 'Otra'
    default:
      return classification
  }
}

const getStatusColor = (isActive: boolean) => {
  return isActive ? 'success' : 'error'
}

const getStatusLabel = (isActive: boolean) => {
  return isActive ? 'Activo' : 'Inactivo'
}

export const SuppliersTable: React.FC<SuppliersTableProps> = ({
  suppliers,
  loading = false,
  onEdit,
  onDelete,
  onView
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [selectedSupplier, setSelectedSupplier] = React.useState<Supplier | null>(null)

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, supplier: Supplier) => {
    setAnchorEl(event.currentTarget)
    setSelectedSupplier(supplier)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedSupplier(null)
  }

  const handleEdit = () => {
    if (selectedSupplier) {
      onEdit(selectedSupplier)
    }
    handleMenuClose()
  }

  const handleDelete = () => {
    if (selectedSupplier) {
      onDelete(selectedSupplier)
    }
    handleMenuClose()
  }

  const handleView = () => {
    if (selectedSupplier && onView) {
      onView(selectedSupplier)
    }
    handleMenuClose()
  }

  if (loading) {
    return (
      <Paper>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Cargando proveedores...</Typography>
        </Box>
      </Paper>
    )
  }

  if (!suppliers || suppliers.length === 0) {
    return (
      <Paper>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <BusinessIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant='body1' color='text.secondary'>
            No se encontraron proveedores
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
              <TableCell>Proveedor</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Clasificación</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Información Legal</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align='center'>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers
              ?.filter(supplier => supplier != null)
              ?.map(supplier => (
                <TableRow key={supplier.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>{supplier.business_name?.charAt(0) || 'P'}</Avatar>
                      <Box>
                        <Typography variant='body2' fontWeight='medium'>
                          {supplier.business_name}
                        </Typography>
                        {supplier.name && (
                          <Typography variant='caption' color='text.secondary'>
                            {supplier.name}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip label={getTypeLabel(supplier.type)} color={getTypeColor(supplier.type)} size='small' />
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={getClassificationLabel(supplier.classification)}
                      color={getClassificationColor(supplier.classification)}
                      size='small'
                      variant='outlined'
                    />
                  </TableCell>

                  <TableCell>
                    <Box>
                      <Typography variant='body2'>{supplier.email}</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {supplier.phone}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box>
                      {supplier.tax_id && <Typography variant='body2'>NIT: {supplier.tax_id}</Typography>}
                      {supplier.registration_number && (
                        <Typography variant='caption' color='text.secondary'>
                          Reg: {supplier.registration_number}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={getStatusLabel(supplier.is_active)}
                      color={getStatusColor(supplier.is_active)}
                      size='small'
                    />
                  </TableCell>

                  <TableCell align='center'>
                    <Tooltip title='Más opciones'>
                      <IconButton size='small' onClick={e => handleMenuClick(e, supplier)}>
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {onView && (
          <MenuItem onClick={handleView}>
            <ViewIcon sx={{ mr: 1, fontSize: 20 }} />
            Ver Detalles
          </MenuItem>
        )}
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Eliminar
        </MenuItem>
      </Menu>
    </>
  )
}

export default SuppliersTable
