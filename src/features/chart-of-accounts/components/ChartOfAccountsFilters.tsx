'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Chip,
  Typography,
  InputAdornment
} from '@mui/material'
import { Search as SearchIcon, Clear as ClearIcon, FilterList as FilterIcon } from '@mui/icons-material'
import type { ChartOfAccountFilters, ChartOfAccount } from '../types'
import { ACCOUNT_TYPES, getAccountTypeLabel } from '../constants/accountTypes'
import { useChartOfAccountsRedux } from '../hooks/useChartOfAccountsRedux'

interface ChartOfAccountsFiltersProps {
  rootAccounts?: ChartOfAccount[]
  showAdvancedFilters?: boolean
}

const ACCOUNT_LEVELS = [1, 2, 3, 4, 5]

// Single debounce timeout
let filterTimeout: NodeJS.Timeout

export const ChartOfAccountsFilters: React.FC<ChartOfAccountsFiltersProps> = ({
  rootAccounts = [],
  showAdvancedFilters = true
}) => {
  // Redux state and actions
  const { filters, setFilters, clearFilters, setNeedsReload, clearError } = useChartOfAccountsRedux()

  // Estados locales SOLO para UI responsiva
  const [localSearch, setLocalSearch] = useState(filters.search || '')
  const [localAccountType, setLocalAccountType] = useState(filters.account_type || '')
  const [localStatus, setLocalStatus] = useState<string>(
    filters.is_active === undefined ? '' : filters.is_active ? 'active' : 'inactive'
  )
  const [localLevel, setLocalLevel] = useState(filters.level?.toString() || '')
  const [localParentAccount, setLocalParentAccount] = useState(filters.parent_account_id?.toString() || '')

  // Ref para prevenir updates en mount inicial
  const isInitialMount = useRef(true)

  // Inicializar estados locales SOLO en mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      setLocalSearch(filters.search || '')
      setLocalAccountType(filters.account_type || '')
      setLocalStatus(filters.is_active === undefined ? '' : filters.is_active ? 'active' : 'inactive')
      setLocalLevel(filters.level?.toString() || '')
      setLocalParentAccount(filters.parent_account_id?.toString() || '')
    }
  }, [])

  // Aplicar filtros a Redux con debounce unificado
  const applyFilters = useCallback(() => {
    clearTimeout(filterTimeout)

    filterTimeout = setTimeout(() => {
      const newFilters: ChartOfAccountFilters = {}

      if (localSearch.trim()) {
        newFilters.search = localSearch.trim()
      }
      if (localAccountType) {
        newFilters.account_type = localAccountType
      }
      if (localStatus === 'active') {
        newFilters.is_active = true
      } else if (localStatus === 'inactive') {
        newFilters.is_active = false
      }
      if (localLevel) {
        newFilters.level = parseInt(localLevel, 10)
      }
      if (localParentAccount) {
        newFilters.parent_account_id = parseInt(localParentAccount, 10)
      }

      setFilters(newFilters)
    }, 700)
  }, [localSearch, localAccountType, localStatus, localLevel, localParentAccount, setFilters])

  // Trigger update cuando cambien los estados locales
  useEffect(() => {
    if (!isInitialMount.current) {
      applyFilters()
    }
  }, [localSearch, localAccountType, localStatus, localLevel, localParentAccount])

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

  const handleAccountTypeChange = (event: any) => {
    setLocalAccountType(event.target.value)
  }

  const handleStatusChange = (event: any) => {
    setLocalStatus(event.target.value)
  }

  const handleLevelChange = (event: any) => {
    setLocalLevel(event.target.value)
  }

  const handleParentAccountChange = (event: any) => {
    setLocalParentAccount(event.target.value)
  }

  const handleClearFilters = useCallback(() => {
    clearTimeout(filterTimeout)

    setLocalSearch('')
    setLocalAccountType('')
    setLocalStatus('')
    setLocalLevel('')
    setLocalParentAccount('')

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
    if (localAccountType) count++
    if (localStatus) count++
    if (localLevel) count++
    if (localParentAccount) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Card>
      <CardContent>
        <Box display='flex' alignItems='center' justifyContent='space-between' mb={2}>
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
              label='Buscar cuentas'
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
              placeholder='Código, nombre o descripción...'
            />
          </Grid>

          {/* Account Type */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Cuenta</InputLabel>
              <Select value={localAccountType} onChange={handleAccountTypeChange} label='Tipo de Cuenta'>
                <MenuItem value=''>
                  <em>Todos los tipos</em>
                </MenuItem>
                {ACCOUNT_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Status */}
          <Grid item xs={12} md={2}>
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

          {showAdvancedFilters && (
            <>
              {/* Level */}
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Nivel</InputLabel>
                  <Select value={localLevel} onChange={handleLevelChange} label='Nivel'>
                    <MenuItem value=''>
                      <em>Todos los niveles</em>
                    </MenuItem>
                    {ACCOUNT_LEVELS.map(level => (
                      <MenuItem key={level} value={level}>
                        Nivel {level}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Parent Account */}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Cuenta Padre</InputLabel>
                  <Select value={localParentAccount} onChange={handleParentAccountChange} label='Cuenta Padre'>
                    <MenuItem value=''>
                      <em>Sin filtro de padre</em>
                    </MenuItem>
                    <MenuItem value='0'>Solo cuentas raíz</MenuItem>
                    {rootAccounts.map(account => (
                      <MenuItem key={account.id} value={account.id}>
                        {account.account_code} - {account.account_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}
