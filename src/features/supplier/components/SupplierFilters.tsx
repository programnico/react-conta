// features/supplier/components/SupplierFilters.tsx
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

import { useSuppliersRedux } from '../hooks/useSuppliersRedux'
import type { SupplierFilters, SupplierType, SupplierClassification } from '../types'

interface SupplierFiltersProps {
  // No props needed - everything through Redux
}

// Debounce timeouts fuera del componente para evitar recreación
let typeTimeout: NodeJS.Timeout
let classificationTimeout: NodeJS.Timeout
let statusTimeout: NodeJS.Timeout

const SupplierFiltersComponent: React.FC<SupplierFiltersProps> = () => {
  // Redux state y actions - ÚNICA fuente de verdad
  const { filters, setFilters, clearFilters, setNeedsReload, clearError } = useSuppliersRedux()

  // Estados locales SOLO para campos de texto (submit manual)
  const [searchQuery, setSearchQuery] = useState('')
  const [emailQuery, setEmailQuery] = useState('')
  const [businessNameQuery, setBusinessNameQuery] = useState('')

  // Referencias para prevenir loops en inicialización
  const isInitialMount = useRef(true)

  // Dropdowns usan directamente Redux filters (no estado local)
  // Para evitar bucles de sincronización

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

  // Inicializar estados locales UNA VEZ
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false

      // Inicializar solo campos de texto con valores de Redux
      setSearchQuery(filters.search || '')
      setEmailQuery(filters.email || '')
      setBusinessNameQuery(filters.business_name || '')
    }
  }, [filters.search, filters.email, filters.business_name]) // === TEXT INPUT HANDLERS (Submit Manual) ===

  // Search field handler
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleSearchSubmit = useCallback(() => {
    const newFilters = { ...filters }
    if (searchQuery.trim()) {
      newFilters.search = searchQuery.trim()
    } else {
      delete newFilters.search
    }

    // Solo actualizar filtros - SuppliersTable se encarga de la carga automáticamente
    setFilters(newFilters)
    // ❌ NO usar setNeedsReload aquí - causa doble carga
  }, [searchQuery, filters, setFilters])

  // Email field handler
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailQuery(event.target.value)
  }

  const handleEmailSubmit = useCallback(() => {
    const newFilters = { ...filters }
    if (emailQuery.trim()) {
      newFilters.email = emailQuery.trim()
    } else {
      delete newFilters.email
    }
    setFilters(newFilters)
  }, [emailQuery, filters, setFilters])

  // Business name field handler
  const handleBusinessNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBusinessNameQuery(event.target.value)
  }

  const handleBusinessNameSubmit = useCallback(() => {
    const newFilters = { ...filters }
    if (businessNameQuery.trim()) {
      newFilters.business_name = businessNameQuery.trim()
    } else {
      delete newFilters.business_name
    }
    setFilters(newFilters)
  }, [businessNameQuery, filters, setFilters])

  // === DROPDOWN HANDLERS (Directo a Redux con debounce) ===

  const handleTypeChange = (value: any) => {
    clearTimeout(typeTimeout)

    typeTimeout = setTimeout(() => {
      const newFilters = { ...filters }
      if (value) {
        newFilters.type = value as SupplierType
      } else {
        delete newFilters.type
      }
      setFilters(newFilters)
    }, 300)
  }

  const handleClassificationChange = (value: any) => {
    clearTimeout(classificationTimeout)

    classificationTimeout = setTimeout(() => {
      const newFilters = { ...filters }
      if (value) {
        newFilters.classification = value as SupplierClassification
      } else {
        delete newFilters.classification
      }
      setFilters(newFilters)
    }, 300)
  }

  const handleStatusChange = (value: any) => {
    clearTimeout(statusTimeout)

    statusTimeout = setTimeout(() => {
      const newFilters = { ...filters }
      if (value === 'active') {
        newFilters.is_active = true
      } else if (value === 'inactive') {
        newFilters.is_active = false
      } else {
        delete newFilters.is_active
      }
      setFilters(newFilters)
    }, 300)
  } // === UTILITY HANDLERS ===

  const handleClearFilters = useCallback(() => {
    // Limpiar filtros Redux
    clearFilters()

    // Limpiar estados locales de texto
    setSearchQuery('')
    setEmailQuery('')
    setBusinessNameQuery('')

    // Limpiar timeouts pendientes
    clearTimeout(typeTimeout)
    clearTimeout(classificationTimeout)
    clearTimeout(statusTimeout)

    // Limpiar error y forzar recarga
    clearError()
    setNeedsReload(true)
  }, [clearFilters, clearError, setNeedsReload])

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.email) count++
    if (filters.business_name) count++
    if (filters.type) count++
    if (filters.classification) count++
    if (filters.is_active !== undefined) count++
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
                        const newFilters = { ...filters }
                        delete newFilters.search
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
              onBlur={handleBusinessNameSubmit}
              onKeyPress={e => e.key === 'Enter' && handleBusinessNameSubmit()}
              placeholder='Filtrar por razón social'
              InputProps={{
                endAdornment: businessNameQuery && (
                  <InputAdornment position='end'>
                    <Button
                      size='small'
                      onClick={() => {
                        setBusinessNameQuery('')
                        const newFilters = { ...filters }
                        delete newFilters.business_name
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
              <Select value={filters.type || ''} onChange={e => handleTypeChange(e.target.value)} label='Tipo'>
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
                value={filters.classification || ''}
                onChange={e => handleClassificationChange(e.target.value)}
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
                value={filters.is_active === undefined ? '' : filters.is_active ? 'active' : 'inactive'}
                onChange={e => handleStatusChange(e.target.value)}
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
              onBlur={handleEmailSubmit}
              onKeyPress={e => e.key === 'Enter' && handleEmailSubmit()}
              placeholder='Filtrar por email'
              InputProps={{
                endAdornment: emailQuery && (
                  <InputAdornment position='end'>
                    <Button
                      size='small'
                      onClick={() => {
                        setEmailQuery('')
                        const newFilters = { ...filters }
                        delete newFilters.email
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
