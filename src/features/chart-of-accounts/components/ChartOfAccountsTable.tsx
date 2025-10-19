'use client'

import { useState, useMemo } from 'react'
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
  TablePagination,
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
import type { ChartOfAccount, ChartOfAccountFilters } from '../types'
import { getAccountTypeLabel } from '../constants/accountTypes'

interface ChartOfAccountsTableProps {
  accounts?: ChartOfAccount[]
  loading?: {
    accounts: boolean
    creating: boolean
    updating: boolean
    deleting: boolean
    searching: boolean
    any: boolean
  }
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
    perPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  filters?: ChartOfAccountFilters
  onEdit?: (account: ChartOfAccount) => void
  onDelete?: (account: ChartOfAccount) => void
  onView?: (account: ChartOfAccount) => void
  onPageChange?: (page: number) => void
  onRowsPerPageChange?: (rowsPerPage: number) => void
  showHierarchy?: boolean
  enableActions?: boolean
}

export const ChartOfAccountsTable = ({
  accounts = [],
  loading = {
    accounts: false,
    creating: false,
    updating: false,
    deleting: false,
    searching: false,
    any: false
  },
  pagination = {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 15,
    hasNextPage: false,
    hasPreviousPage: false
  },
  filters = {},
  onEdit,
  onDelete,
  onView,
  onPageChange,
  onRowsPerPageChange,
  showHierarchy = false,
  enableActions = true
}: ChartOfAccountsTableProps) => {
  const theme = useTheme()
  // Sync local state with Redux pagination
  const page = pagination.currentPage - 1 // Material-UI uses 0-based indexing
  const rowsPerPage = pagination.perPage

  // Memoized data for performance
  const displayedAccounts = useMemo(() => {
    if (showHierarchy) {
      // Group by parent-child relationship
      return accounts.sort((a, b) => {
        // First sort by level, then by parent_account_id, then by account_code
        if (a.level !== b.level) {
          return a.level - b.level
        }
        if (a.parent_account_id !== b.parent_account_id) {
          return (a.parent_account_id || 0) - (b.parent_account_id || 0)
        }
        return a.account_code.localeCompare(b.account_code)
      })
    }
    return accounts
  }, [accounts, showHierarchy])

  const handleChangePage = async (event: unknown, newPage: number) => {
    const pageNumber = newPage + 1
    // Call parent handler with 1-based indexing
    onPageChange?.(pageNumber)
  }

  const handleChangeRowsPerPage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10)
    // Call parent handler to change page size and reset to page 1
    onRowsPerPageChange?.(newRowsPerPage)
  }

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
    if (!showHierarchy || level <= 1) return 0
    return (level - 1) * 24 // 24px per level
  }

  if (loading.accounts) {
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
                {enableActions && (
                  <TableCell align='center'>
                    <Typography variant='subtitle2' fontWeight='bold'>
                      Acciones
                    </Typography>
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedAccounts.map(account => (
                <TableRow
                  key={account.id}
                  hover
                  sx={{
                    backgroundColor:
                      account.level > 1 && showHierarchy
                        ? alpha(theme.palette.primary.main, 0.02 * account.level)
                        : 'inherit'
                  }}
                >
                  <TableCell>
                    <Box display='flex' alignItems='center'>
                      {showHierarchy && account.level > 1 && <Box width={getLevelIndentation(account.level)} />}
                      {showHierarchy && account.child_accounts && account.child_accounts.length > 0 && (
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

                  {enableActions && (
                    <TableCell align='center'>
                      <Box display='flex' justifyContent='center' gap={1}>
                        {onView && (
                          <Tooltip title='Ver detalles'>
                            <IconButton size='small' onClick={() => onView(account)} color='info'>
                              <ViewIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        )}

                        {onEdit && (
                          <Tooltip title='Editar cuenta'>
                            <IconButton size='small' onClick={() => onEdit(account)} color='primary'>
                              <EditIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        )}

                        {onDelete && (
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
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}

              {displayedAccounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={enableActions ? 7 : 6} align='center'>
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

        <TablePagination
          component='div'
          count={pagination.totalItems}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 15, 25, 50]}
          labelRowsPerPage='Filas por página'
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`}
          disabled={loading.accounts}
        />
      </CardContent>
    </Card>
  )
}
