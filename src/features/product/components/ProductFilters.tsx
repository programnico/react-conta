// features/product/components/ProductFilters.tsx
'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
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

import { useProductsRedux } from '../hooks/useProductsRedux'
import type { ProductFilters } from '../types'

interface ProductFiltersProps {
  // No props needed - everything through Redux
}

// Single debounce timeout
let filterTimeout: NodeJS.Timeout

const ProductFiltersComponent: React.FC<ProductFiltersProps> = () => {
  // Redux state y actions
  const { filters, setFilters, clearFilters, setNeedsReload, clearError } = useProductsRedux()

  // Estados locales SOLO para UI responsiva
  const [localSearch, setLocalSearch] = useState(filters.search || '')
  const [localCategory, setLocalCategory] = useState(filters.category || '')
  const [localStatus, setLocalStatus] = useState<string>(
    filters.is_active === undefined ? '' : filters.is_active ? 'active' : 'inactive'
  )

  // Ref para prevenir updates en mount inicial
  const isInitialMount = useRef(true)

  // Common categories
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

  // Inicializar estados locales SOLO en mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      setLocalSearch(filters.search || '')
      setLocalCategory(filters.category || '')
      setLocalStatus(filters.is_active === undefined ? '' : filters.is_active ? 'active' : 'inactive')
    }
  }, [])

  // Aplicar filtros a Redux con debounce unificado
  const applyFilters = useCallback(() => {
    clearTimeout(filterTimeout)

    filterTimeout = setTimeout(() => {
      const newFilters: ProductFilters = {}

      if (localSearch.trim()) {
        newFilters.search = localSearch.trim()
      }
      if (localCategory) {
        newFilters.category = localCategory
      }
      if (localStatus === 'active') {
        newFilters.is_active = true
      } else if (localStatus === 'inactive') {
        newFilters.is_active = false
      }

      setFilters(newFilters)
    }, 700)
  }, [localSearch, localCategory, localStatus, setFilters])

  // Trigger update cuando cambien los estados locales
  useEffect(() => {
    if (!isInitialMount.current) {
      applyFilters()
    }
  }, [localSearch, localCategory, localStatus])

  // === HANDLERS ===

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(event.target.value)
  }

  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      clearTimeout(filterTimeout)
      applyFilters()
    }
  }

  const handleSearchClear = () => {
    setLocalSearch('')
  }

  const handleCategoryChange = (event: any) => {
    setLocalCategory(event.target.value)
  }

  const handleStatusChange = (event: any) => {
    setLocalStatus(event.target.value)
  }

  const handleClearFilters = useCallback(() => {
    clearTimeout(filterTimeout)

    setLocalSearch('')
    setLocalCategory('')
    setLocalStatus('')

    clearFilters()
    clearError()
    setNeedsReload(true)
  }, [clearFilters, clearError, setNeedsReload])

  // Cleanup
  useEffect(() => {
    return () => {
      clearTimeout(filterTimeout)
    }
  }, [])

  const getActiveFiltersCount = () => {
    let count = 0
    if (localSearch.trim()) count++
    if (localCategory) count++
    if (localStatus) count++
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
            <Button startIcon={<ClearIcon />} onClick={handleClearFilters} size='small' variant='outlined'>
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
              value={localSearch}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: localSearch && (
                  <InputAdornment position='end'>
                    <Button size='small' onClick={handleSearchClear}>
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
              <Select value={localCategory} onChange={handleCategoryChange} label='Categoría'>
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
              <Select value={localStatus} onChange={handleStatusChange} label='Estado'>
                <MenuItem value=''>
                  <em>Todos los estados</em>
                </MenuItem>
                <MenuItem value='active'>Activo</MenuItem>
                <MenuItem value='inactive'>Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ProductFiltersComponent
