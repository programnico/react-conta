'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Paper,
  useTheme,
  alpha
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  AccountTree as TreeIcon
} from '@mui/icons-material'

import SmartPagination from '@/components/pagination/SmartPagination'
import { useChartOfAccountsRedux } from '../hooks/useChartOfAccountsRedux'
import type { ChartOfAccount } from '../types'
import { getAccountTypeLabel } from '../constants/accountTypes'

interface ChartOfAccountsTableProps {
  onEdit: (account: ChartOfAccount) => void
  onDelete: (account: ChartOfAccount) => void
}

const ChartOfAccountsTableComponent: React.FC<ChartOfAccountsTableProps> = ({ onEdit, onDelete }) => {
  const theme = useTheme()

  // Redux state
  const {
    accounts,
    loading,
    loadingStates,
    needsReload,
    pagination,
    filters,
    loadAccounts,
    setNeedsReload,
    setCurrentPage,
    setRowsPerPage,
    resetPagination
  } = useChartOfAccountsRedux()

  const { currentPage, rowsPerPage, totalPages, totalRecords } = pagination

  // Referencias para controlar efectos
  const isInitialMount = useRef(true)
  const lastLoadParamsRef = useRef<string>('')
  const loadTimeoutRef = useRef<NodeJS.Timeout>()

  // === ÚNICO CONTROLADOR DE CARGA SIMPLIFICADO ===
  useEffect(() => {
    // Limpiar timeout previo
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current)
    }

    const executeLoad = () => {
      // Parámetros actuales para la carga
      const loadParams = {
        page: currentPage,
        per_page: rowsPerPage,
        ...filters
      }
      const paramsString = JSON.stringify(loadParams)

      // Solo cargar si los parámetros cambiaron o es carga inicial o needsReload
      const shouldLoad = isInitialMount.current || needsReload || lastLoadParamsRef.current !== paramsString

      if (shouldLoad) {
        lastLoadParamsRef.current = paramsString

        // Clear initial mount flag IMMEDIATELY to prevent rapid re-executions
        if (isInitialMount.current) {
          isInitialMount.current = false
        }

        loadAccounts(loadParams)
          .catch(err => {
            console.error('Error loading accounts:', err)
          })
          .finally(() => {
            if (needsReload) {
              setNeedsReload(false)
            }
          })
      }
    }

    // Para carga inicial o needsReload, ejecutar inmediatamente
    if (isInitialMount.current || needsReload) {
      executeLoad()
    } else {
      // Para cambios en filtros/paginación, debounce de 600ms
      loadTimeoutRef.current = setTimeout(executeLoad, 600)
    }

    // Cleanup
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
      }
    }
  }, [currentPage, rowsPerPage, JSON.stringify(filters), needsReload, loadAccounts, setNeedsReload])

  // === RESET PAGINATION CUANDO CAMBIEN FILTROS ===
  const previousFiltersRef = useRef<string>('')

  useEffect(() => {
    const currentFiltersString = JSON.stringify(filters)

    // Skip inicial mount
    if (isInitialMount.current) {
      previousFiltersRef.current = currentFiltersString
      return
    }

    // Solo resetear paginación si los filtros realmente cambiaron (no la página)
    if (previousFiltersRef.current !== currentFiltersString) {
      previousFiltersRef.current = currentFiltersString

      // Resetear paginación cuando cambien filtros
      if (currentPage !== 1) {
        setCurrentPage(1)
      }
    }
  }, [filters, currentPage, setCurrentPage])

  // === AJUSTAR PÁGINA SI ESTÁ FUERA DE RANGO ===
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage, setCurrentPage])

  // === PAGINATION HANDLERS (Solo cambian estado Redux, el useEffect principal carga) ===

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // El useEffect principal se encarga de cargar automáticamente
  }

  const handlePerPageChange = (perPage: number) => {
    setRowsPerPage(perPage) // Esto resetea a página 1 internamente
    // El useEffect principal se encarga de cargar automáticamente
  }

  // Ordenar cuentas por jerarquía
  const displayedAccounts = React.useMemo(() => {
    return [...accounts].sort((a, b) => {
      // Ordenar por nivel, luego por parent_account_id, luego por código
      if (a.level !== b.level) {
        return a.level - b.level
      }
      if (a.parent_account_id !== b.parent_account_id) {
        return (a.parent_account_id || 0) - (b.parent_account_id || 0)
      }
      return a.account_code.localeCompare(b.account_code)
    })
  }, [accounts])

  const getStatusChip = (isActive: boolean) => (
    <Chip
      label={isActive ? 'Activa' : 'Inactiva'}
      color={isActive ? 'success' : 'default'}
      size='small'
      variant='outlined'
    />
  )

  const getTypeChip = (accountType: string) => {
    const typeColors: Record<string, 'default' | 'primary' | 'secondary' | 'info' | 'warning' | 'success' | 'error'> = {
      A: 'primary', // Activo
      CR: 'error', // Depreciación
      P: 'secondary', // Pasivo
      C: 'info', // Capital
      G: 'warning', // Gastos
      I: 'success' // Ingresos
    }

    return (
      <Chip
        label={getAccountTypeLabel(accountType)}
        color={typeColors[accountType] || 'default'}
        size='small'
        variant='filled'
      />
    )
  }

  const getLevelIndentation = (level: number) => {
    if (level <= 1) return 0
    return (level - 1) * 24 // 24px per level
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display='flex' justifyContent='center' alignItems='center' minHeight={400}>
            <Typography>Cargando cuentas contables...</Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant='subtitle2' fontWeight='bold'>
                    Código
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='subtitle2' fontWeight='bold'>
                    Nombre de Cuenta
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='subtitle2' fontWeight='bold'>
                    Tipo
                  </Typography>
                </TableCell>
                <TableCell align='center'>
                  <Typography variant='subtitle2' fontWeight='bold'>
                    Nivel
                  </Typography>
                </TableCell>
                <TableCell align='center'>
                  <Typography variant='subtitle2' fontWeight='bold'>
                    Estado
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='subtitle2' fontWeight='bold'>
                    Descripción
                  </Typography>
                </TableCell>
                <TableCell align='center'>
                  <Typography variant='subtitle2' fontWeight='bold'>
                    Acciones
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedAccounts.map(account => (
                <TableRow
                  key={account.id}
                  hover
                  sx={{
                    backgroundColor:
                      account.level > 1 ? alpha(theme.palette.primary.main, 0.02 * account.level) : 'inherit'
                  }}
                >
                  <TableCell>
                    <Box display='flex' alignItems='center'>
                      {account.level > 1 && <Box width={getLevelIndentation(account.level)} />}
                      {account.child_accounts && account.child_accounts.length > 0 && (
                        <TreeIcon fontSize='small' sx={{ mr: 1, color: theme.palette.primary.main }} />
                      )}
                      <Typography variant='body2' fontFamily='monospace'>
                        {account.account_code}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box>
                      <Typography variant='body2' fontWeight={account.level === 1 ? 'bold' : 'normal'}>
                        {account.account_name}
                      </Typography>
                      {account.parent_account && (
                        <Typography variant='caption' color='text.secondary'>
                          Padre: {account.parent_account.account_name}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell>{getTypeChip(account.account_type)}</TableCell>

                  <TableCell align='center'>
                    <Chip label={account.level} size='small' variant='outlined' color='primary' />
                  </TableCell>

                  <TableCell align='center'>{getStatusChip(account.is_active)}</TableCell>

                  <TableCell>
                    <Typography variant='body2' color='text.secondary'>
                      {account.description || 'Sin descripción'}
                    </Typography>
                  </TableCell>

                  <TableCell align='center'>
                    <Box display='flex' justifyContent='center' gap={1}>
                      <Tooltip title='Editar cuenta'>
                        <IconButton size='small' onClick={() => onEdit(account)} color='primary'>
                          <EditIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title='Eliminar cuenta'>
                        <IconButton
                          size='small'
                          onClick={() => onDelete(account)}
                          color='error'
                          disabled={account.child_accounts && account.child_accounts.length > 0}
                        >
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              {displayedAccounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align='center'>
                    <Box py={4}>
                      <Typography variant='body2' color='text.secondary'>
                        No se encontraron cuentas contables
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginador integrado */}
        {totalRecords > 0 && (
          <Box mt={2}>
            <SmartPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalRecords}
              perPage={rowsPerPage}
              onPageChange={handlePageChange}
              onPerPageChange={handlePerPageChange}
              perPageOptions={[10, 15, 25, 50]}
              disabled={loading}
              showPageInfo={true}
              pageWindow={3}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export { ChartOfAccountsTableComponent as ChartOfAccountsTable }
