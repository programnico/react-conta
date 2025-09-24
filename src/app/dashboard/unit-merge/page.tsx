'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material'
import { useUnitMerge } from '@/hooks/useUnitMerge'
import type { UnitMerge, CreateUnitMergeRequest, UpdateUnitMergeRequest } from '@/types/unitMerge'

const UnitMergePage = () => {
  const {
    items,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    loadItems,
    createItem,
    updateItem,
    deleteItem,
    clearUnitMergeError
  } = useUnitMerge()

  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentItem, setCurrentItem] = useState<UnitMerge | null>(null)
  const [formData, setFormData] = useState({ name: '' })

  // Load items on component mount
  useEffect(() => {
    loadItems()
  }, [])

  // Clear error when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      clearUnitMergeError()
    }
  }, [isDialogOpen])

  const handleOpenDialog = (item?: UnitMerge) => {
    if (item) {
      // Edit mode
      setIsEditMode(true)
      setCurrentItem(item)
      setFormData({ name: item.name })
    } else {
      // Create mode
      setIsEditMode(false)
      setCurrentItem(null)
      setFormData({ name: '' })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setIsEditMode(false)
    setCurrentItem(null)
    setFormData({ name: '' })
  }

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        return
      }

      if (isEditMode && currentItem) {
        const updateData: UpdateUnitMergeRequest = {
          id: currentItem.id!,
          name: formData.name.trim()
        }
        await updateItem(updateData)
      } else {
        const createData: CreateUnitMergeRequest = {
          name: formData.name.trim()
        }
        await createItem(createData)
      }

      handleCloseDialog()
      // Refresh the list
      await loadItems()
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este elemento?')) {
      try {
        await deleteItem(id)
        // Refresh the list
        await loadItems()
      } catch (error) {
        console.error('Error deleting item:', error)
      }
    }
  }

  const handleRefresh = () => {
    loadItems()
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardHeader
          title='Gestión de Unit Merge'
          subheader='Administrar unidades de fusión del sistema'
          action={
            <Stack direction='row' spacing={1}>
              <Button variant='outlined' startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={isLoading}>
                Actualizar
              </Button>
              <Button variant='contained' startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                Agregar Unit Merge
              </Button>
            </Stack>
          }
        />

        <CardContent>
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {isLoading ? (
            <Box display='flex' justifyContent='center' alignItems='center' minHeight={200}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} variant='outlined'>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Fecha de Creación</TableCell>
                    <TableCell align='right'>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align='center'>
                        <Typography variant='body2' color='text.secondary'>
                          No hay elementos para mostrar
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>
                          <Typography variant='body2' fontWeight='medium'>
                            {item.name}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</TableCell>
                        <TableCell align='right'>
                          <IconButton size='small' onClick={() => handleOpenDialog(item)} disabled={isUpdating}>
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size='small'
                            color='error'
                            onClick={() => handleDelete(item.id!)}
                            disabled={isDeleting}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth='sm' fullWidth>
        <DialogTitle>{isEditMode ? 'Editar Unit Merge' : 'Crear Unit Merge'}</DialogTitle>

        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label='Nombre'
              value={formData.name}
              onChange={e => setFormData({ name: e.target.value })}
              error={!formData.name.trim()}
              helperText={!formData.name.trim() ? 'El nombre es requerido' : ''}
              disabled={isCreating || isUpdating}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isCreating || isUpdating}>
            Cancelar
          </Button>
          <Button
            variant='contained'
            onClick={handleSubmit}
            disabled={!formData.name.trim() || isCreating || isUpdating}
            startIcon={isCreating || isUpdating ? <CircularProgress size={16} /> : null}
          >
            {isEditMode ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UnitMergePage
