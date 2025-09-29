// features/admin/roles/components/RoleFilters.tsx
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
  InputAdornment
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon
} from '@mui/icons-material'
import { useDebounce } from '@/shared/hooks/useDebounce'
import type { Permission } from '../types'

interface RoleFiltersProps {
  permissions: Permission[]
  onSearch: (query: string) => void
  onFilterByPermission: (permission: string) => void
  onRefresh: () => void
  onCreate: () => void
  loading?: boolean
}

export function RoleFilters({
  permissions,
  onSearch,
  onFilterByPermission,
  onRefresh,
  onCreate,
  loading = false
}: RoleFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPermission, setSelectedPermission] = useState('')

  // Debounce search to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Trigger search when debounced query changes
  useEffect(() => {
    onSearch(debouncedSearchQuery)
  }, [debouncedSearchQuery]) // Eliminar onSearch de dependencias para evitar bucle

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handlePermissionFilter = (permission: string) => {
    setSelectedPermission(permission)
    onFilterByPermission(permission)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedPermission('')
    onSearch('')
    onFilterByPermission('')
  }

  const hasActiveFilters = searchQuery.trim() || selectedPermission

  return (
    <Card>
      <CardContent>
        <Grid container spacing={3} alignItems='center'>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label='Buscar roles'
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder='Buscar por nombre, permisos o usuarios...'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon color='action' />
                  </InputAdornment>
                )
              }}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filtrar por Permiso</InputLabel>
              <Select
                value={selectedPermission}
                onChange={e => handlePermissionFilter(e.target.value)}
                label='Filtrar por Permiso'
                disabled={loading}
                startAdornment={
                  <InputAdornment position='start'>
                    <FilterIcon color='action' />
                  </InputAdornment>
                }
              >
                <MenuItem value=''>
                  <em>Todos los permisos</em>
                </MenuItem>
                {permissions.map(permission => (
                  <MenuItem key={permission.id} value={permission.name}>
                    {permission.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={5}>
            <Box display='flex' gap={2} justifyContent='flex-end'>
              {hasActiveFilters && (
                <Button variant='outlined' onClick={handleClearFilters} disabled={loading}>
                  Limpiar Filtros
                </Button>
              )}

              <Button variant='outlined' startIcon={<RefreshIcon />} onClick={onRefresh} disabled={loading}>
                Actualizar
              </Button>

              <Button variant='contained' startIcon={<AddIcon />} onClick={onCreate} disabled={loading}>
                Nuevo Rol
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Active filters display */}
        {hasActiveFilters && (
          <Box mt={2} display='flex' gap={1} flexWrap='wrap' alignItems='center'>
            <FilterIcon color='action' fontSize='small' />

            {searchQuery.trim() && (
              <Chip
                label={`Búsqueda: "${searchQuery}"`}
                size='small'
                onDelete={() => {
                  setSearchQuery('')
                  onSearch('')
                }}
                color='primary'
                variant='outlined'
              />
            )}

            {selectedPermission && (
              <Chip
                label={`Permiso: ${selectedPermission}`}
                size='small'
                onDelete={() => handlePermissionFilter('')}
                color='secondary'
                variant='outlined'
              />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default RoleFilters
