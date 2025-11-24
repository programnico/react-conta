// features/company/components/CompanyFilters.tsx
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

import { useCompaniesRedux } from '../hooks/useCompaniesRedux'
import type { CompanyFilters } from '../types'

interface CompanyFiltersProps {
  // No props needed - everything through Redux
}

// Single debounce timeout
let filterTimeout: NodeJS.Timeout

const CompanyFiltersComponent: React.FC<CompanyFiltersProps> = () => {
  // Redux state y actions
  const { filters, setFilters, clearFilters, setNeedsReload, clearError } = useCompaniesRedux()

  // Estados locales SOLO para UI responsiva
  const [localSearch, setLocalSearch] = useState(filters.search || '')
  const [localName, setLocalName] = useState(filters.name || '')
  const [localStatus, setLocalStatus] = useState<string>(
    filters.is_active === undefined ? '' : filters.is_active ? 'active' : 'inactive'
  )

  // Ref para prevenir updates en mount inicial
  const isInitialMount = useRef(true)

  // Inicializar estados locales SOLO en mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      setLocalSearch(filters.search || '')
      setLocalName(filters.name || '')
      setLocalStatus(filters.is_active === undefined ? '' : filters.is_active ? 'active' : 'inactive')
    }
  }, [])

  // Aplicar filtros a Redux con debounce unificado
  const applyFilters = useCallback(() => {
    clearTimeout(filterTimeout)

    filterTimeout = setTimeout(() => {
      const newFilters: CompanyFilters = {}

      if (localSearch.trim()) {
        newFilters.search = localSearch.trim()
      }
      if (localName.trim()) {
        newFilters.name = localName.trim()
      }
      if (localStatus === 'active') {
        newFilters.is_active = true
      } else if (localStatus === 'inactive') {
        newFilters.is_active = false
      }

      setFilters(newFilters)
    }, 700)
  }, [localSearch, localName, localStatus, setFilters])

  // Trigger update cuando cambien los estados locales
  useEffect(() => {
    if (!isInitialMount.current) {
      applyFilters()
    }
  }, [localSearch, localName, localStatus])

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

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalName(event.target.value)
  }

  const handleStatusChange = (event: any) => {
    setLocalStatus(event.target.value)
  }

  const handleClearFilters = useCallback(() => {
    clearTimeout(filterTimeout)

    setLocalSearch('')
    setLocalName('')
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
    if (localName.trim()) count++
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
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label='Buscar empresas'
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
              placeholder='Buscar por nombre, razón social, NIT...'
            />
          </Grid>

          {/* Name */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label='Nombre de empresa'
              value={localName}
              onChange={handleNameChange}
              placeholder='Filtrar por nombre exacto'
            />
          </Grid>

          {/* Status */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select value={localStatus} onChange={handleStatusChange} label='Estado'>
                <MenuItem value=''>
                  <em>Todos los estados</em>
                </MenuItem>
                <MenuItem value='active'>Activa</MenuItem>
                <MenuItem value='inactive'>Inactiva</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default CompanyFiltersComponent
