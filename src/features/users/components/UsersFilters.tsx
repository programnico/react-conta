'use client'

import { useCallback, memo } from 'react'
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
  Typography
} from '@mui/material'
import { Search as SearchIcon, Clear as ClearIcon, FilterList as FilterIcon } from '@mui/icons-material'
import type { UserFilters } from '../types'
import { ROLE_OPTIONS } from '../constants/roles'

interface UsersFiltersProps {
  filters?: UserFilters
  onFiltersChange?: (filters: UserFilters) => void
  onClearFilters?: () => void
}

const UsersFiltersComponent = ({ filters = {}, onFiltersChange, onClearFilters }: UsersFiltersProps) => {
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      const newFilters = { ...filters, search: value || undefined }
      onFiltersChange?.(newFilters)
    },
    [filters, onFiltersChange]
  )

  const handleFilterChange = useCallback(
    (key: keyof UserFilters, value: any) => {
      const newFilters = {
        ...filters,
        [key]: value === '' ? undefined : value
      }
      onFiltersChange?.(newFilters)
    },
    [filters, onFiltersChange]
  )

  const handleClearFilters = useCallback(() => {
    onClearFilters?.()
  }, [onClearFilters])

  const activeFiltersCount = Object.values(filters).filter(
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
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label='Buscar'
              placeholder='Nombre o email del usuario...'
              value={filters.search || ''}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>

          {/* Role Filter */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select value={filters.role || ''} onChange={e => handleFilterChange('role', e.target.value)} label='Rol'>
                <MenuItem value=''>Todos los roles</MenuItem>
                {ROLE_OPTIONS.map(role => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <Box mt={2}>
            <Typography variant='caption' color='text.secondary' gutterBottom>
              Filtros activos:
            </Typography>
            <Box display='flex' flexWrap='wrap' gap={1} mt={1}>
              {filters.search && (
                <Chip
                  label={`Búsqueda: ${filters.search}`}
                  size='small'
                  onDelete={() => handleFilterChange('search', undefined)}
                />
              )}
              {filters.role && (
                <Chip
                  label={`Rol: ${ROLE_OPTIONS.find(r => r.value === filters.role)?.label || filters.role}`}
                  size='small'
                  onDelete={() => handleFilterChange('role', undefined)}
                />
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export const UsersFilters = memo(UsersFiltersComponent)
