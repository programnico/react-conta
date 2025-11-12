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

import { useSuppliersRedux } from '../hooks/useSuppliersRedux'
import type { SupplierFilters, SupplierType, SupplierClassification } from '../types'

interface SupplierFiltersProps {
  // No props needed - everything through Redux
}

const SupplierFiltersComponent: React.FC<SupplierFiltersProps> = () => {
  // Redux state y actions
  const { filters, pagination, setFilters, clearFilters, searchSuppliers, clearError, setNeedsReload } =
    useSuppliersRedux()

  const [localFilters, setLocalFilters] = useState<SupplierFilters>(filters)
  const [searchQuery, setSearchQuery] = useState(filters.search || '')
  const [emailQuery, setEmailQuery] = useState(filters.email || '')
  const [businessNameQuery, setBusinessNameQuery] = useState(filters.business_name || '')
  const [typeQuery, setTypeQuery] = useState(filters.type || '')
  const [classificationQuery, setClassificationQuery] = useState(filters.classification || '')

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
    setEmailQuery(filters.email || '')
    setBusinessNameQuery(filters.business_name || '')
    setTypeQuery(filters.type || '')
    setClassificationQuery(filters.classification || '')
  }, [filters])

  const handleFilterChange = (key: keyof SupplierFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    setFilters(newFilters) // Usar Redux directamente
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value
    setSearchQuery(query)
    // Solo actualizar el filtro local, no disparar búsqueda automáticamente
    setLocalFilters(prev => ({ ...prev, search: query }))
  }

  const handleSearchSubmit = () => {
    // Paso 1: Actualizar filtros para persistencia (como razón social)
    const newFilters = { ...localFilters }
    if (searchQuery.trim()) {
      newFilters.search = searchQuery.trim()
    } else {
      delete newFilters.search
    }
    setLocalFilters(newFilters)
    setFilters(newFilters)

    // Paso 2: Disparar carga inmediata para UX esperada de búsqueda
    // Esto hará que se carguen los datos con TODOS los filtros activos
    setNeedsReload(true)
  }

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const email = event.target.value
    setEmailQuery(email)
    // Solo actualizar el estado local, no aplicar filtro inmediatamente
  }

  const handleEmailSubmit = () => {
    // Solo actualizar filtros, no disparar búsqueda automática
    const newFilters = { ...localFilters }
    if (emailQuery.trim()) {
      newFilters.email = emailQuery.trim()
    } else {
      delete newFilters.email
    }
    setLocalFilters(newFilters)
    setFilters(newFilters)

    // El email funciona como filtro para la próxima búsqueda
    // No dispara búsqueda inmediata para evitar bucles infinitos
  }

  const handleEmailBlur = () => {
    handleEmailSubmit()
  }

  const handleBusinessNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const businessName = event.target.value
    setBusinessNameQuery(businessName)
    // Solo actualizar el estado local, no aplicar filtro inmediatamente
  }

  const handleBusinessNameSubmit = () => {
    const newFilters = { ...localFilters }
    if (businessNameQuery.trim()) {
      newFilters.business_name = businessNameQuery.trim()
    } else {
      delete newFilters.business_name
    }
    setLocalFilters(newFilters)
    setFilters(newFilters)
  }

  const handleBusinessNameBlur = () => {
    handleBusinessNameSubmit()
  }

  const handleTypeChange = (value: any) => {
    setTypeQuery(value || '')
    // Solo actualizar el estado local inmediatamente
    setLocalFilters(prev => ({ ...prev, type: value || undefined }))

    // Aplicar filtro después de un delay pequeño para evitar bucles
    setTimeout(() => {
      const newFilters = { ...localFilters, type: value || undefined }
      if (!value) {
        delete newFilters.type
      }
      setFilters(newFilters)
    }, 100)
  }

  const handleClassificationChange = (value: any) => {
    setClassificationQuery(value || '')
    // Solo actualizar el estado local inmediatamente
    setLocalFilters(prev => ({ ...prev, classification: value || undefined }))

    // Aplicar filtro después de un delay pequeño para evitar bucles
    setTimeout(() => {
      const newFilters = { ...localFilters, classification: value || undefined }
      if (!value) {
        delete newFilters.classification
      }
      setFilters(newFilters)
    }, 100)
  }

  const handleClearFilters = () => {
    const emptyFilters: SupplierFilters = {}
    setLocalFilters(emptyFilters)
    setSearchQuery('')
    setEmailQuery('')
    setBusinessNameQuery('')
    setTypeQuery('')
    setClassificationQuery('')
    setFilters(emptyFilters)

    // Limpiar error y forzar recarga completa usando Redux
    clearError()
    setNeedsReload(true)
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
              label='Buscar proveedores'
              value={searchQuery}
              onChange={handleSearchChange}
              onBlur={handleSearchSubmit}
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
                        setFilters(newFilters)
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
              value={businessNameQuery}
              onChange={handleBusinessNameChange}
              onBlur={handleBusinessNameBlur}
              onKeyPress={e => e.key === 'Enter' && handleBusinessNameSubmit()}
              placeholder='Filtrar por razón social'
              InputProps={{
                endAdornment: businessNameQuery && (
                  <InputAdornment position='end'>
                    <Button
                      size='small'
                      onClick={() => {
                        setBusinessNameQuery('')
                        const newFilters = { ...localFilters }
                        delete newFilters.business_name
                        setLocalFilters(newFilters)
                        setFilters(newFilters)
                      }}
                    >
                      <ClearIcon />
                    </Button>
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Type */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select value={typeQuery} onChange={e => handleTypeChange(e.target.value || undefined)} label='Tipo'>
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
                value={classificationQuery}
                onChange={e => handleClassificationChange(e.target.value || undefined)}
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
              value={emailQuery}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              onKeyPress={e => e.key === 'Enter' && handleEmailSubmit()}
              placeholder='Filtrar por email'
              InputProps={{
                endAdornment: emailQuery && (
                  <InputAdornment position='end'>
                    <Button
                      size='small'
                      onClick={() => {
                        setEmailQuery('')
                        const newFilters = { ...localFilters }
                        delete newFilters.email
                        setLocalFilters(newFilters)
                        setFilters(newFilters)
                      }}
                    >
                      <ClearIcon />
                    </Button>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default SupplierFiltersComponent
