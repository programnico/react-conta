// features/admin/roles/components/RolesTable.tsx
'use client'

import { useState } from 'react'
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
  IconButton,
  Chip,
  Box,
  Tooltip,
  Avatar,
  AvatarGroup
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Group as GroupIcon
} from '@mui/icons-material'
import type { Role } from '../types'

interface RolesTableProps {
  roles: Role[]
  loading?: boolean
  onEdit: (role: Role) => void
  onDelete: (id: number) => void
}

export function RolesTable({ roles, loading = false, onEdit, onDelete }: RolesTableProps) {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const paginatedRoles = roles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card>
      <CardContent>
        <Box display='flex' alignItems='center' gap={1} mb={2}>
          <SecurityIcon color='primary' />
          <Typography variant='h6'>Gestión de Roles</Typography>
          <Chip label={`${roles.length} roles`} size='small' color='primary' variant='outlined' />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rol</TableCell>
                <TableCell>Guard</TableCell>
                <TableCell align='center'>Permisos</TableCell>
                <TableCell align='center'>Usuarios</TableCell>
                <TableCell>Fecha Creación</TableCell>
                <TableCell align='center'>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align='center'>
                    <Typography color='textSecondary'>Cargando roles...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center'>
                    <Typography color='textSecondary'>No se encontraron roles</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRoles.map(role => (
                  <TableRow key={role.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant='subtitle2' fontWeight='medium'>
                          {role.name}
                        </Typography>
                        <Typography variant='caption' color='textSecondary'>
                          ID: {role.id}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={role.guard_name}
                        size='small'
                        color={role.guard_name === 'api' ? 'success' : 'default'}
                        variant='outlined'
                      />
                    </TableCell>

                    <TableCell align='center'>
                      <Tooltip title={role.permissions.map(p => p.name).join(', ')} arrow>
                        <Chip
                          icon={<SecurityIcon />}
                          label={role.permissions.length}
                          size='small'
                          color='info'
                          variant='filled'
                        />
                      </Tooltip>
                    </TableCell>

                    <TableCell align='center'>
                      <Box display='flex' alignItems='center' justifyContent='center' gap={1}>
                        {role.users.length > 0 ? (
                          <>
                            <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24 } }}>
                              {role.users.slice(0, 3).map((user, index) => (
                                <Avatar key={user.id} sx={{ fontSize: '0.75rem' }}>
                                  {user.name.charAt(0).toUpperCase()}
                                </Avatar>
                              ))}
                            </AvatarGroup>
                            <Typography variant='caption'>{role.users.length}</Typography>
                          </>
                        ) : (
                          <Chip icon={<GroupIcon />} label='0' size='small' color='default' variant='outlined' />
                        )}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant='body2'>{formatDate(role.created_at)}</Typography>
                    </TableCell>

                    <TableCell align='center'>
                      <Box display='flex' gap={1} justifyContent='center'>
                        <Tooltip title='Editar rol'>
                          <span>
                            <IconButton size='small' color='primary' onClick={() => onEdit(role)}>
                              <EditIcon fontSize='small' />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip
                          title={
                            role.users && role.users.length > 0
                              ? `No se puede eliminar. El rol tiene ${role.users.length} usuario(s) asignado(s).`
                              : 'Eliminar rol'
                          }
                        >
                          <span>
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() => onDelete(role.id)}
                              disabled={role.users && role.users.length > 0}
                            >
                              <DeleteIcon fontSize='small' />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          count={roles.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage='Filas por página:'
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
        />
      </CardContent>
    </Card>
  )
}

export default RolesTable
