'use client'

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Box,
  TablePagination
} from '@mui/material'
import { Edit, Delete, Add, Person } from '@mui/icons-material'
import { RootState, AppDispatch } from '@/store'
import { fetchUsers, deleteUser, setSelectedUser, setFilters, clearFilters } from '@/store/slices/usersSlice'
import { User, UserFilters } from '../types'
import { ROLE_LABELS } from '../constants/roles'
import { UserForm } from './UserForm'
import { UsersFilters } from './UsersFilters'

export const UsersList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { users, loading, error, meta, filters } = useSelector((state: RootState) => state.users)

  const [openDialog, setOpenDialog] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null
  })

  // Estados para paginación
  const [page, setPage] = useState(0) // Material-UI usa índice 0
  const [rowsPerPage, setRowsPerPage] = useState(15)

  // Ref para prevenir llamadas duplicadas
  const lastFetchParams = React.useRef<string>('')

  useEffect(() => {
    // Cargar usuarios con parámetros de paginación y filtros
    const params = {
      page: page + 1, // API usa índice 1
      per_page: rowsPerPage,
      ...filters // Incluir filtros de búsqueda y rol
    }

    // Crear un identificador único para estos parámetros
    const paramsKey = `${params.page}-${params.per_page}-${params.search || ''}-${params.role || ''}`

    // Solo hacer la petición si los parámetros han cambiado realmente
    if (lastFetchParams.current !== paramsKey) {
      lastFetchParams.current = paramsKey
      dispatch(fetchUsers(params))
    }
  }, [dispatch, page, rowsPerPage, filters])

  const handleFiltersChange = React.useCallback(
    (newFilters: UserFilters) => {
      dispatch(setFilters(newFilters))
      // Resetear a la primera página cuando se cambian los filtros
      setPage(0)
    },
    [dispatch]
  )

  const handleClearFilters = React.useCallback(() => {
    dispatch(clearFilters())
    setPage(0)
  }, [dispatch])

  const handleCreateUser = () => {
    dispatch(setSelectedUser(null))
    setDialogMode('create')
    setOpenDialog(true)
  }

  const handleEditUser = (user: User) => {
    dispatch(setSelectedUser(user))
    setDialogMode('edit')
    setOpenDialog(true)
  }

  const handleDeleteClick = (user: User) => {
    setDeleteDialog({ open: true, user })
  }

  const handleDeleteConfirm = async () => {
    if (deleteDialog.user) {
      await dispatch(deleteUser(deleteDialog.user.id))
      setDeleteDialog({ open: false, user: null })

      // Si estamos en la última página y solo hay 1 usuario, ir a la página anterior
      const isLastPage = meta && page + 1 === meta.last_page
      const hasOnlyOneUser = users.length === 1

      if (isLastPage && hasOnlyOneUser && page > 0) {
        setPage(page - 1)
      } else {
        // Refrescar la página actual
        dispatch(
          fetchUsers({
            page: page + 1,
            per_page: rowsPerPage
          })
        )
      }
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    dispatch(setSelectedUser(null))
  }

  // Funciones de paginación
  const handleChangePage = (event: unknown, newPage: number) => {
    if (newPage !== page && !loading) {
      setPage(newPage)
    }
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10)
    if (newRowsPerPage !== rowsPerPage && !loading) {
      setRowsPerPage(newRowsPerPage)
      setPage(0) // Resetear a la primera página
    }
  }

  const getRoleChipColor = (roleName: string) => {
    switch (roleName) {
      case 'super-admin':
        return 'error'
      case 'admin':
        return 'warning'
      case 'manager':
        return 'info'
      default:
        return 'default'
    }
  }

  if (loading && users.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box display='flex' justifyContent='center' alignItems='center' minHeight='300px'>
            <Box textAlign='center'>
              <CircularProgress size={40} />
              <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
                Cargando usuarios...
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
          <Typography variant='h5' component='h2' display='flex' alignItems='center' gap={1}>
            <Person />
            Gestión de Usuarios
          </Typography>
          <Button variant='contained' startIcon={<Add />} onClick={handleCreateUser} sx={{ textTransform: 'none' }}>
            Nuevo Usuario
          </Button>
        </Box>

        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Filtros */}
        <Box mb={3}>
          <UsersFilters filters={filters} onFiltersChange={handleFiltersChange} onClearFilters={handleClearFilters} />
        </Box>

        <TableContainer component={Paper} variant='outlined' sx={{ position: 'relative' }}>
          {loading && (
            <Box
              position='absolute'
              top={0}
              left={0}
              right={0}
              bottom={0}
              display='flex'
              alignItems='center'
              justifyContent='center'
              bgcolor='rgba(255, 255, 255, 0.8)'
              zIndex={1}
            >
              <CircularProgress size={30} />
            </Box>
          )}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>2FA</TableCell>
                <TableCell>Estado Email</TableCell>
                <TableCell>Fecha Creación</TableCell>
                <TableCell align='center'>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users && users.length > 0 ? (
                users.map((user: User) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>
                      <Typography variant='body2' fontWeight='medium'>
                        {user.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role: any) => (
                          <Chip
                            key={role.id}
                            label={ROLE_LABELS[role.name as keyof typeof ROLE_LABELS] || role.name}
                            size='small'
                            color={getRoleChipColor(role.name) as any}
                            variant='outlined'
                          />
                        ))
                      ) : (
                        <Chip label='Sin rol' size='small' color='default' variant='outlined' />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.two_factor_enabled ? 'Habilitado' : 'Deshabilitado'}
                        size='small'
                        color={user.two_factor_enabled ? 'success' : 'default'}
                        variant='outlined'
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.email_verified_at ? 'Verificado' : 'Pendiente'}
                        size='small'
                        color={user.email_verified_at ? 'success' : 'warning'}
                        variant='outlined'
                      />
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell align='center'>
                      <IconButton
                        size='small'
                        onClick={() => handleEditUser(user)}
                        color='primary'
                        title='Editar usuario'
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size='small'
                        onClick={() => handleDeleteClick(user)}
                        color='error'
                        title='Eliminar usuario'
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align='center'>
                    <Box py={4}>
                      <Typography variant='body2' color='text.secondary'>
                        {loading
                          ? 'Cargando usuarios...'
                          : meta?.total === 0
                            ? 'No hay usuarios registrados'
                            : 'No hay usuarios en esta página'}
                      </Typography>
                      {meta && meta.total > 0 && users.length === 0 && (
                        <Button variant='text' onClick={() => setPage(0)} sx={{ mt: 1 }}>
                          Ir a la primera página
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Información y Paginador */}
        {meta && (
          <Box display='flex' justifyContent='space-between' alignItems='center' sx={{ mt: 2, mb: 1 }}>
            <Typography variant='body2' color='text.secondary'>
              Total: {meta.total} usuarios | Página {meta.current_page} de {meta.last_page}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Mostrando {meta.from} - {meta.to} usuarios
            </Typography>
          </Box>
        )}

        <TablePagination
          component='div'
          count={meta?.total || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 15, 25, 50]}
          labelRowsPerPage='Filas por página'
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`}
          disabled={loading}
          sx={{
            borderTop: '1px solid rgba(224, 224, 224, 1)',
            pt: 1
          }}
        />

        {/* Dialog para crear/editar usuario */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth='sm' fullWidth>
          <DialogTitle>{dialogMode === 'create' ? 'Crear Nuevo Usuario' : 'Editar Usuario'}</DialogTitle>
          <DialogContent>
            <UserForm
              mode={dialogMode}
              onSuccess={handleCloseDialog}
              currentPage={page + 1}
              rowsPerPage={rowsPerPage}
            />
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmación para eliminar */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, user: null })}>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Estás seguro de que deseas eliminar al usuario <strong>{deleteDialog.user?.name}</strong>?
            </Typography>
            <Typography variant='body2' color='text.secondary' mt={1}>
              Esta acción no se puede deshacer.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, user: null })} color='inherit'>
              Cancelar
            </Button>
            <Button onClick={handleDeleteConfirm} color='error' variant='contained'>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  )
}
