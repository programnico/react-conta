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

// Single debounce timeout
let filterTimeout: NodeJS.Timeout

const SupplierFiltersComponent: React.FC<SupplierFiltersProps> = () => {
  // Redux state y actions
  const { filters, setFilters, clearFilters, setNeedsReload, clearError } = useSuppliersRedux()

  // Estados locales SOLO para UI responsiva
  const [localSearch, setLocalSearch] = useState(filters.search || '')
  const [localEmail, setLocalEmail] = useState(filters.email || '')
  const [localBusinessName, setLocalBusinessName] = useState(filters.business_name || '')
  const [localType, setLocalType] = useState(filters.type || '')
  const [localClassification, setLocalClassification] = useState(filters.classification || '')
  const [localStatus, setLocalStatus] = useState<string>(
    filters.is_active === undefined ? '' : filters.is_active ? 'active' : 'inactive'
  )

  // Ref para prevenir updates en mount inicial
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

  // Inicializar estados locales SOLO en mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      setLocalSearch(filters.search || '')
      setLocalEmail(filters.email || '')
      setLocalBusinessName(filters.business_name || '')
      setLocalType(filters.type || '')
      setLocalClassification(filters.classification || '')
      setLocalStatus(filters.is_active === undefined ? '' : filters.is_active ? 'active' : 'inactive')
    }
  }, [])

  // Aplicar filtros a Redux con debounce unificado
  const applyFilters = useCallback(() => {
    clearTimeout(filterTimeout)

    filterTimeout = setTimeout(() => {
      const newFilters: SupplierFilters = {}

      if (localSearch.trim()) {
        newFilters.search = localSearch.trim()
      }
      if (localEmail.trim()) {
        newFilters.email = localEmail.trim()
      }
      if (localBusinessName.trim()) {
        newFilters.business_name = localBusinessName.trim()
      }
      if (localType) {
        newFilters.type = localType as SupplierType
      }
      if (localClassification) {
        newFilters.classification = localClassification as SupplierClassification
      }
      if (localStatus === 'active') {
        newFilters.is_active = true
      } else if (localStatus === 'inactive') {
        newFilters.is_active = false
      }

      setFilters(newFilters)
    }, 700)
  }, [localSearch, localEmail, localBusinessName, localType, localClassification, localStatus, setFilters])

  // Trigger update cuando cambien los estados locales
  useEffect(() => {
    if (!isInitialMount.current) {
      applyFilters()
    }
  }, [localSearch, localEmail, localBusinessName, localType, localClassification, localStatus])

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

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalEmail(event.target.value)
  }

  const handleEmailKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      clearTimeout(filterTimeout)
      applyFilters()
    }
  }

  const handleEmailClear = () => {
    setLocalEmail('')
  }

  const handleBusinessNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalBusinessName(event.target.value)
  }

  const handleBusinessNameKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      clearTimeout(filterTimeout)
      applyFilters()
    }
  }

  const handleBusinessNameClear = () => {
    setLocalBusinessName('')
  }

  const handleTypeChange = (event: any) => {
    setLocalType(event.target.value)
  }

  const handleClassificationChange = (event: any) => {
    setLocalClassification(event.target.value)
  }

  const handleStatusChange = (event: any) => {
    setLocalStatus(event.target.value)
  }

  // === UTILITY HANDLERS ===

  const handleClearFilters = useCallback(() => {
    clearTimeout(filterTimeout)

    setLocalSearch('')
    setLocalEmail('')
    setLocalBusinessName('')
    setLocalType('')
    setLocalClassification('')
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
    if (localEmail.trim()) count++
    if (localBusinessName.trim()) count++
    if (localType) count++
    if (localClassification) count++
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
              label='Buscar proveedores'
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
              placeholder='Nombre, razón social, email...'
            />
          </Grid>

          {/* Business Name */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label='Razón Social'
              value={localBusinessName}
              onChange={handleBusinessNameChange}
              onKeyPress={handleBusinessNameKeyPress}
              placeholder='Filtrar por razón social'
              InputProps={{
                endAdornment: localBusinessName && (
                  <InputAdornment position='end'>
                    <Button size='small' onClick={handleBusinessNameClear}>
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
              <Select value={localType} onChange={handleTypeChange} label='Tipo'>
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
              <Select value={localClassification} onChange={handleClassificationChange} label='Clasificación'>
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
              <Select value={localStatus} onChange={handleStatusChange} label='Estado'>
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
              value={localEmail}
              onChange={handleEmailChange}
              onKeyPress={handleEmailKeyPress}
              placeholder='Filtrar por email'
              InputProps={{
                endAdornment: localEmail && (
                  <InputAdornment position='end'>
                    <Button size='small' onClick={handleEmailClear}>
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
