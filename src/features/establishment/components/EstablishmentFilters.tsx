// features/establishment/components/EstablishmentFilters.tsx
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
  Typography,
  Autocomplete
} from '@mui/material'
import { Search as SearchIcon, Clear as ClearIcon, FilterList as FilterIcon } from '@mui/icons-material'

import { useEstablishmentsRedux } from '../hooks/useEstablishmentsRedux'
import { companyService } from '@/features/company/services/companyService'
import type { EstablishmentFilters } from '../types'
import type { Company } from '@/features/company/types'

interface EstablishmentFiltersProps {
  // No props needed - everything through Redux
}

// Single debounce timeout
let filterTimeout: NodeJS.Timeout

const EstablishmentFiltersComponent: React.FC<EstablishmentFiltersProps> = () => {
  // Redux state y actions
  const { filters, setFilters, clearFilters, setNeedsReload, clearError } = useEstablishmentsRedux()

  // Estados locales SOLO para UI responsiva
  const [localSearch, setLocalSearch] = useState(filters.search || '')
  const [localName, setLocalName] = useState(filters.name || '')
  const [localStatus, setLocalStatus] = useState<string>(
    filters.is_active === undefined ? '' : filters.is_active ? 'active' : 'inactive'
  )
  const [localIsMain, setLocalIsMain] = useState<string>(
    filters.is_main === undefined ? '' : filters.is_main ? 'main' : 'secondary'
  )
  const [localCompanyId, setLocalCompanyId] = useState<number | null>(filters.company_id || null)

  // Company list for dropdown
  const [companies, setCompanies] = useState<Company[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(false)

  // Ref para prevenir updates en mount inicial
  const isInitialMount = useRef(true)

  // Load companies for dropdown
  useEffect(() => {
    const loadCompanies = async () => {
      setLoadingCompanies(true)
      try {
        const companiesList = await companyService.getAllForSelect()
        setCompanies(companiesList)
      } catch (error) {
        console.error('Error loading companies:', error)
      } finally {
        setLoadingCompanies(false)
      }
    }
    loadCompanies()
  }, [])

  // Inicializar estados locales SOLO en mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      setLocalSearch(filters.search || '')
      setLocalName(filters.name || '')
      setLocalStatus(filters.is_active === undefined ? '' : filters.is_active ? 'active' : 'inactive')
      setLocalIsMain(filters.is_main === undefined ? '' : filters.is_main ? 'main' : 'secondary')
      setLocalCompanyId(filters.company_id || null)
    }
  }, [])

  // Aplicar filtros a Redux con debounce unificado
  const applyFilters = useCallback(() => {
    clearTimeout(filterTimeout)

    filterTimeout = setTimeout(() => {
      const newFilters: EstablishmentFilters = {}

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
      if (localIsMain === 'main') {
        newFilters.is_main = true
      } else if (localIsMain === 'secondary') {
        newFilters.is_main = false
      }
      if (localCompanyId) {
        newFilters.company_id = localCompanyId
      }

      setFilters(newFilters)
    }, 700)
  }, [localSearch, localName, localStatus, localIsMain, localCompanyId, setFilters])

  // Trigger update cuando cambien los estados locales
  useEffect(() => {
    if (!isInitialMount.current) {
      applyFilters()
    }
  }, [localSearch, localName, localStatus, localIsMain, localCompanyId])

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

  const handleIsMainChange = (event: any) => {
    setLocalIsMain(event.target.value)
  }

  const handleCompanyChange = (event: any, value: Company | null) => {
    setLocalCompanyId(value ? value.id : null)
  }

  const handleClearFilters = useCallback(() => {
    clearTimeout(filterTimeout)

    setLocalSearch('')
    setLocalName('')
    setLocalStatus('')
    setLocalIsMain('')
    setLocalCompanyId(null)

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
    if (localIsMain) count++
    if (localCompanyId) count++
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
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label='Buscar establecimientos'
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
              placeholder='Buscar por nombre, código, dirección...'
            />
          </Grid>

          {/* Company */}
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={companies}
              getOptionLabel={option => option.name}
              value={companies.find(c => c.id === localCompanyId) || null}
              onChange={handleCompanyChange}
              loading={loadingCompanies}
              renderInput={params => <TextField {...params} label='Empresa' placeholder='Filtrar por empresa' />}
            />
          </Grid>

          {/* Name */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label='Nombre exacto'
              value={localName}
              onChange={handleNameChange}
              placeholder='Filtrar por nombre exacto'
            />
          </Grid>

          {/* Status */}
          <Grid item xs={12} md={4}>
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

          {/* Is Main */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select value={localIsMain} onChange={handleIsMainChange} label='Tipo'>
                <MenuItem value=''>
                  <em>Todos los tipos</em>
                </MenuItem>
                <MenuItem value='main'>Principal</MenuItem>
                <MenuItem value='secondary'>Secundario</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default EstablishmentFiltersComponent
