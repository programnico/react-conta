// features/product/components/ProductFilters.tsx
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
  Slider,
  Typography
} from '@mui/material'
import { Search as SearchIcon, Clear as ClearIcon, FilterList as FilterIcon } from '@mui/icons-material'

import type { ProductFilters } from '../types'

interface ProductFiltersProps {
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void
  onSearch?: (query: string) => void
}

const ProductFiltersComponent: React.FC<ProductFiltersProps> = ({ filters, onFiltersChange, onSearch }) => {
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters)
  const [searchQuery, setSearchQuery] = useState(filters.search || '')
  const [priceRange, setPriceRange] = useState<number[]>([filters.min_price || 0, filters.max_price || 1000])

  // Common categories - you can fetch these from an API
  const categories = [
    'Celular',
    'Laptop',
    'Tablet',
    'Computadora',
    'Accesorio',
    'Papelería',
    'Oficina',
    'Hogar',
    'Electrónico',
    'Otros'
  ]

  useEffect(() => {
    setLocalFilters(filters)
    setSearchQuery(filters.search || '')
    setPriceRange([filters.min_price || 0, filters.max_price || 1000])
  }, [filters])

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value
    setSearchQuery(query)
    handleFilterChange('search', query)
  }

  const handleSearchSubmit = () => {
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim())
    }
  }

  const handlePriceRangeChange = (event: Event, newValue: number | number[]) => {
    const range = newValue as number[]
    setPriceRange(range)
    handleFilterChange('min_price', range[0])
    handleFilterChange('max_price', range[1])
  }

  const clearFilters = () => {
    const emptyFilters: ProductFilters = {}
    setLocalFilters(emptyFilters)
    setSearchQuery('')
    setPriceRange([0, 1000])
    onFiltersChange(emptyFilters)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (localFilters.search) count++
    if (localFilters.category) count++
    if (localFilters.is_active !== undefined) count++
    if (localFilters.min_price || localFilters.max_price) count++
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
              label='Buscar productos'
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
                        handleFilterChange('search', '')
                      }}
                    >
                      <ClearIcon />
                    </Button>
                  </InputAdornment>
                )
              }}
              placeholder='Nombre, código o descripción del producto...'
            />
          </Grid>

          {/* Category */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={localFilters.category || ''}
                onChange={e => handleFilterChange('category', e.target.value || undefined)}
                label='Categoría'
              >
                <MenuItem value=''>
                  <em>Todas las categorías</em>
                </MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
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

          {/* Price Range */}
          <Grid item xs={12}>
            <Typography variant='body2' gutterBottom>
              Rango de precio: ${priceRange[0]} - ${priceRange[1]}
            </Typography>
            <Slider
              value={priceRange}
              onChange={handlePriceRangeChange}
              valueLabelDisplay='auto'
              min={0}
              max={5000}
              step={10}
              valueLabelFormat={value => `$${value}`}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ProductFiltersComponent
