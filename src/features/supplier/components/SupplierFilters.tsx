// features/supplier/components/SupplierFilters.tsx
'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Chip,
  InputAdornment,
  Typography
} from '@mui/material'
import { Search as SearchIcon, Clear as ClearIcon, FilterList as FilterIcon } from '@mui/icons-material'

import type { SupplierFilters, SupplierType, SupplierClassification } from '../types'

interface SupplierFiltersProps {
  filters: SupplierFilters
  onFiltersChange: (filters: SupplierFilters) => void
  onSearch: (query: string) => void
}

const SupplierFiltersComponent: React.FC<SupplierFiltersProps> = ({ filters, onFiltersChange, onSearch }) => {
  const [localFilters, setLocalFilters] = useState<SupplierFilters>(filters)
  const [searchQuery, setSearchQuery] = useState(filters.search || '')

  // Type and classification options
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

  useEffect(() => {
    setLocalFilters(filters)
    setSearchQuery(filters.search || '')
  }, [filters])

  const handleFilterChange = (key: keyof SupplierFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value
    setSearchQuery(query)
    // Solo actualizar el filtro local, no disparar búsqueda automáticamente
    setLocalFilters(prev => ({ ...prev, search: query }))
  }

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      // Solo ejecutar búsqueda, no actualizar filtros aquí
      // Los filtros se actualizarán cuando la tabla recargue
      onSearch(searchQuery.trim())
    } else {
      // Si no hay query, limpiar búsqueda de filtros
      const newFilters = { ...localFilters }
      delete newFilters.search
      setLocalFilters(newFilters)
      onFiltersChange(newFilters)
    }
  }

  const clearFilters = () => {
    const emptyFilters: SupplierFilters = {}
    setLocalFilters(emptyFilters)
    setSearchQuery('')
    onFiltersChange(emptyFilters)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (localFilters.search) count++
    if (localFilters.name) count++
    if (localFilters.business_name) count++
    if (localFilters.type) count++
    if (localFilters.classification) count++
    if (localFilters.is_active !== undefined) count++
    if (localFilters.email) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Card>
      <CardContent>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
          <Box display='flex' alignItems='center' gap={1}>
            <FilterIcon />
            <Typography variant='h6'>Filtros</Typography>
            {activeFiltersCount > 0 && (
              <Chip
                label={`${activeFiltersCount} filtro${activeFiltersCount > 1 ? 's' : ''}`}
                size='small'
                color='primary'
              />
            )}
          </Box>
          {activeFiltersCount > 0 && (
            <Button startIcon={<ClearIcon />} onClick={clearFilters} size='small' variant='outlined'>
              Limpiar
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Search */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Buscar proveedores'
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={e => e.key === 'Enter' && handleSearchSubmit()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position='end'>
                    <Button
                      size='small'
                      onClick={() => {
                        setSearchQuery('')
                        const newFilters = { ...localFilters }
                        delete newFilters.search
                        setLocalFilters(newFilters)
                        onFiltersChange(newFilters)
                      }}
                    >
                      <ClearIcon />
                    </Button>
                  </InputAdornment>
                )
              }}
              placeholder='Nombre, razón social, email...'
            />
          </Grid>

          {/* Business Name */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label='Razón Social'
              value={localFilters.business_name || ''}
              onChange={e => handleFilterChange('business_name', e.target.value)}
              placeholder='Filtrar por razón social'
            />
          </Grid>

          {/* Type */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={localFilters.type || ''}
                onChange={e => handleFilterChange('type', e.target.value || undefined)}
                label='Tipo'
              >
                <MenuItem value=''>
                  <em>Todos los tipos</em>
                </MenuItem>
                {typeOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Classification */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Clasificación</InputLabel>
              <Select
                value={localFilters.classification || ''}
                onChange={e => handleFilterChange('classification', e.target.value || undefined)}
                label='Clasificación'
              >
                <MenuItem value=''>
                  <em>Todas las clasificaciones</em>
                </MenuItem>
                {classificationOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Status */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={localFilters.is_active === undefined ? '' : localFilters.is_active ? 'active' : 'inactive'}
                onChange={e => {
                  const value = e.target.value
                  handleFilterChange('is_active', value === '' ? undefined : value === 'active')
                }}
                label='Estado'
              >
                <MenuItem value=''>
                  <em>Todos los estados</em>
                </MenuItem>
                <MenuItem value='active'>Activo</MenuItem>
                <MenuItem value='inactive'>Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Email */}
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label='Email'
              value={localFilters.email || ''}
              onChange={e => handleFilterChange('email', e.target.value)}
              placeholder='Filtrar por email'
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default SupplierFiltersComponent
