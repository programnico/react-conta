'use client'

import { useState, useEffect } from 'react'
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
  Switch,
  FormControlLabel
} from '@mui/material'
import { Search as SearchIcon, Clear as ClearIcon, FilterList as FilterIcon } from '@mui/icons-material'
import type { ChartOfAccountFilters, ChartOfAccount } from '../types'
import { ACCOUNT_TYPES, getAccountTypeLabel } from '../constants/accountTypes'

interface ChartOfAccountsFiltersProps {
  filters?: ChartOfAccountFilters
  rootAccounts?: ChartOfAccount[]
  onFiltersChange?: (filters: ChartOfAccountFilters) => void
  onClearFilters?: () => void
  showAdvancedFilters?: boolean
}

const ACCOUNT_LEVELS = [1, 2, 3, 4, 5]

export const ChartOfAccountsFilters = ({
  filters = {},
  rootAccounts = [],
  onFiltersChange,
  onClearFilters,
  showAdvancedFilters = true
}: ChartOfAccountsFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<ChartOfAccountFilters>(filters)
  const [searchTerm, setSearchTerm] = useState(filters.search || '')

  // Sync with Redux state
  useEffect(() => {
    setLocalFilters(filters)
    setSearchTerm(filters.search || '')
  }, [filters])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchTerm(value)

    const newFilters = { ...localFilters, search: value || undefined }
    setLocalFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleFilterChange = (key: keyof ChartOfAccountFilters, value: any) => {
    const newFilters = {
      ...localFilters,
      [key]: value === '' ? undefined : value
    }
    setLocalFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleClearFilters = () => {
    const emptyFilters = {}
    setLocalFilters(emptyFilters)
    setSearchTerm('')
    onClearFilters?.()
    onFiltersChange?.(emptyFilters)
  }

  const activeFiltersCount = Object.values(localFilters).filter(
    value => value !== undefined && value !== null && value !== ''
  ).length

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
            <Button startIcon={<ClearIcon />} onClick={handleClearFilters} variant='outlined' size='small'>
              Limpiar filtros
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label='Buscar'
              placeholder='Código, nombre o descripción...'
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>

          {/* Account Type */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Cuenta</InputLabel>
              <Select
                value={localFilters.account_type || ''}
                onChange={e => handleFilterChange('account_type', e.target.value)}
                label='Tipo de Cuenta'
              >
                <MenuItem value=''>Todos los tipos</MenuItem>
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
              <Select
                value={localFilters.is_active === undefined ? '' : localFilters.is_active.toString()}
                onChange={e =>
                  handleFilterChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')
                }
                label='Estado'
              >
                <MenuItem value=''>Todos</MenuItem>
                <MenuItem value='true'>Activa</MenuItem>
                <MenuItem value='false'>Inactiva</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {showAdvancedFilters && (
            <>
              {/* Level */}
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Nivel</InputLabel>
                  <Select
                    value={localFilters.level || ''}
                    onChange={e => handleFilterChange('level', e.target.value)}
                    label='Nivel'
                  >
                    <MenuItem value=''>Todos los niveles</MenuItem>
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
                  <Select
                    value={localFilters.parent_account_id || ''}
                    onChange={e => handleFilterChange('parent_account_id', e.target.value)}
                    label='Cuenta Padre'
                  >
                    <MenuItem value=''>Sin filtro de padre</MenuItem>
                    <MenuItem value={0}>Solo cuentas raíz</MenuItem>
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

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <Box mt={2}>
            <Typography variant='caption' color='text.secondary' gutterBottom>
              Filtros activos:
            </Typography>
            <Box display='flex' flexWrap='wrap' gap={1} mt={1}>
              {localFilters.search && (
                <Chip
                  label={`Búsqueda: ${localFilters.search}`}
                  size='small'
                  onDelete={() => handleFilterChange('search', undefined)}
                />
              )}
              {localFilters.account_type && (
                <Chip
                  label={`Tipo: ${getAccountTypeLabel(localFilters.account_type)}`}
                  size='small'
                  onDelete={() => handleFilterChange('account_type', undefined)}
                />
              )}
              {localFilters.is_active !== undefined && (
                <Chip
                  label={`Estado: ${localFilters.is_active ? 'Activa' : 'Inactiva'}`}
                  size='small'
                  onDelete={() => handleFilterChange('is_active', undefined)}
                />
              )}
              {localFilters.level && (
                <Chip
                  label={`Nivel: ${localFilters.level}`}
                  size='small'
                  onDelete={() => handleFilterChange('level', undefined)}
                />
              )}
              {localFilters.parent_account_id && (
                <Chip
                  label='Con cuenta padre específica'
                  size='small'
                  onDelete={() => handleFilterChange('parent_account_id', undefined)}
                />
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
