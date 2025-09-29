// features/supplier/components/SupplierFilters.tsx
'use client'

import React from 'react'
import {
  Paper,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Chip,
  Typography
} from '@mui/material'
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material'
import type { SupplierFilters, SupplierType, SupplierClassification } from '../types'

interface SupplierFiltersComponentProps {
  filters: SupplierFilters
  onFiltersChange: (filters: SupplierFilters) => void
  onSearch: (query: string) => void
  onClear: () => void
}

export const SupplierFiltersComponent: React.FC<SupplierFiltersComponentProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClear
}) => {
  const [searchQuery, setSearchQuery] = React.useState('')

  const handleFilterChange = (field: keyof SupplierFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [field]: value === '' ? undefined : value
    })
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim())
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  const handleClear = () => {
    setSearchQuery('')
    onClear()
  }

  const activeFiltersCount = Object.values(filters).filter(
    value => value !== undefined && value !== '' && value !== null
  ).length

  const typeOptions: { value: SupplierType; label: string }[] = [
    { value: 'local', label: 'Local' },
    { value: 'foreign', label: 'Extranjero' }
  ]

  const classificationOptions: { value: SupplierClassification; label: string }[] = [
    { value: 'none', label: 'Ninguna' },
    { value: 'small', label: 'Pequeña' },
    { value: 'medium', label: 'Mediana' },
    { value: 'large', label: 'Grande' },
    { value: 'other', label: 'Otra' }
  ]

  const statusOptions = [
    { value: true, label: 'Activos' },
    { value: false, label: 'Inactivos' }
  ]

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant='h6'>Filtros de Proveedores</Typography>
          {activeFiltersCount > 0 && (
            <Chip
              label={`${activeFiltersCount} filtro${activeFiltersCount > 1 ? 's' : ''}`}
              size='small'
              color='primary'
              variant='outlined'
            />
          )}
        </Box>
        <Button
          startIcon={<ClearIcon />}
          onClick={handleClear}
          disabled={activeFiltersCount === 0}
          variant='outlined'
          size='small'
        >
          Limpiar Filtros
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Búsqueda por texto */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder='Buscar por nombre, razón social, email...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              size='small'
            />
            <Button
              variant='contained'
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              <SearchIcon />
            </Button>
          </Box>
        </Grid>

        {/* Filtro por nombre */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label='Filtrar por nombre'
            value={filters.name || ''}
            onChange={e => handleFilterChange('name', e.target.value)}
            size='small'
          />
        </Grid>

        {/* Filtro por tipo */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth size='small'>
            <InputLabel>Tipo</InputLabel>
            <Select value={filters.type || ''} label='Tipo' onChange={e => handleFilterChange('type', e.target.value)}>
              <MenuItem value=''>Todos</MenuItem>
              {typeOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Filtro por clasificación */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth size='small'>
            <InputLabel>Clasificación</InputLabel>
            <Select
              value={filters.classification || ''}
              label='Clasificación'
              onChange={e => handleFilterChange('classification', e.target.value)}
            >
              <MenuItem value=''>Todas</MenuItem>
              {classificationOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Filtro por estado */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth size='small'>
            <InputLabel>Estado</InputLabel>
            <Select
              value={filters.is_active === undefined ? '' : filters.is_active.toString()}
              label='Estado'
              onChange={e => {
                const value = e.target.value
                handleFilterChange('is_active', value === '' ? undefined : value === 'true')
              }}
            >
              <MenuItem value=''>Todos</MenuItem>
              {statusOptions.map(option => (
                <MenuItem key={option.value.toString()} value={option.value.toString()}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default SupplierFiltersComponent
