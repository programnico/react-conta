// features/purchase/components/PurchaseFilters.tsx
'use client'

import React, { useState } from 'react'
import {
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Grid,
  Paper,
  Collapse,
  IconButton,
  Typography
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material'
import type { PurchaseFilters as IPurchaseFilters, Supplier, PurchaseStatus, DocumentType } from '../types'

interface PurchaseFiltersProps {
  filters: IPurchaseFilters
  suppliers: Supplier[]
  onFiltersChange: (filters: IPurchaseFilters) => void
  onSearch: (query: string) => void
  onClear: () => void
}

const statusOptions: { value: PurchaseStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'approved', label: 'Aprobada' },
  { value: 'received', label: 'Recibida' },
  { value: 'cancelled', label: 'Cancelada' }
]

const documentTypeOptions: { value: DocumentType; label: string }[] = [
  { value: 'factura', label: 'Factura' },
  { value: 'recibo', label: 'Recibo' },
  { value: 'nota_credito', label: 'Nota de Crédito' },
  { value: 'nota_debito', label: 'Nota de Débito' }
]

export const PurchaseFilters: React.FC<PurchaseFiltersProps> = ({
  filters,
  suppliers,
  onFiltersChange,
  onSearch,
  onClear
}) => {
  const [searchQuery, setSearchQuery] = useState(filters.search || '')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [localFilters, setLocalFilters] = useState<IPurchaseFilters>(filters)

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  const handleSearchSubmit = () => {
    onSearch(searchQuery)
  }

  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearchSubmit()
    }
  }

  const handleFilterChange = (field: keyof IPurchaseFilters, value: any) => {
    const newFilters = { ...localFilters, [field]: value || undefined }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleClear = () => {
    setSearchQuery('')
    setLocalFilters({})
    onClear()
  }

  const hasActiveFilters = Object.values(localFilters).some(value => value !== undefined && value !== '')

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2} alignItems='center'>
        {/* Search Bar */}
        <Grid item xs={12} md={6} lg={8}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder='Buscar por número de documento, proveedor...'
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
              }}
            />
            <Button variant='contained' onClick={handleSearchSubmit} sx={{ minWidth: 'auto', px: 2 }}>
              <SearchIcon />
            </Button>
          </Box>
        </Grid>

        {/* Filter Controls */}
        <Grid item xs={12} md={6} lg={4}>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              startIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant='outlined'
            >
              Filtros Avanzados
            </Button>

            {hasActiveFilters && (
              <Button startIcon={<ClearIcon />} onClick={handleClear} variant='outlined' color='secondary'>
                Limpiar
              </Button>
            )}
          </Box>
        </Grid>

        {/* Advanced Filters */}
        <Grid item xs={12}>
          <Collapse in={showAdvanced}>
            <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant='subtitle2' gutterBottom>
                Filtros Avanzados
              </Typography>

              <Grid container spacing={2}>
                {/* Status Filter */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={localFilters.status || ''}
                      onChange={e => handleFilterChange('status', e.target.value)}
                      label='Estado'
                    >
                      <MenuItem value=''>Todos</MenuItem>
                      {statusOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Supplier Filter */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Proveedor</InputLabel>
                    <Select
                      value={localFilters.supplier_id || ''}
                      onChange={e => handleFilterChange('supplier_id', Number(e.target.value))}
                      label='Proveedor'
                    >
                      <MenuItem value=''>Todos</MenuItem>
                      {suppliers?.map(supplier => (
                        <MenuItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </MenuItem>
                      )) || []}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Document Type Filter */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Tipo de Documento</InputLabel>
                    <Select
                      value={localFilters.document_type || ''}
                      onChange={e => handleFilterChange('document_type', e.target.value)}
                      label='Tipo de Documento'
                    >
                      <MenuItem value=''>Todos</MenuItem>
                      {documentTypeOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Date From */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size='small'
                    label='Fecha Desde'
                    type='date'
                    value={localFilters.date_from || ''}
                    onChange={e => handleFilterChange('date_from', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Date To */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size='small'
                    label='Fecha Hasta'
                    type='date'
                    value={localFilters.date_to || ''}
                    onChange={e => handleFilterChange('date_to', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default PurchaseFilters
