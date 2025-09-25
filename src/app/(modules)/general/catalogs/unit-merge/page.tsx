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
  Stack,
  Chip
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon
} from '@mui/icons-material'
import { useUnitMerge } from '@/features/general/unit-merge/hooks/useUnitMerge'
import type { UnitMerge, CreateUnitMergeRequest, UpdateUnitMergeRequest } from '@/features/general/unit-merge/types'

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
    setCurrentUnitMerge,
    clearUnitMergeError,
    activeItems,
    getByName
  } = useUnitMerge({
    autoLoad: false
  })

  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentItem, setCurrentItem] = useState<UnitMerge | null>(null)
  const [formData, setFormData] = useState({ name: '' })
  const [searchQuery, setSearchQuery] = useState('')

  // Load data on component mount
  useEffect(() => {
    loadItems()
  }, [])

  // Clear error when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      clearUnitMergeError()
    }
  }, [isDialogOpen, clearUnitMergeError])

  // Filter items based on search
  const filteredItems = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleOpenDialog = (item?: UnitMerge) => {
    if (item) {
      // Edit mode
      setIsEditMode(true)
      setCurrentItem(item)
      setCurrentUnitMerge(item)
      setFormData({ name: item.name })
    } else {
      // Create mode
      setIsEditMode(false)
      setCurrentItem(null)
      setCurrentUnitMerge(null)
      setFormData({ name: '' })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setIsEditMode(false)
    setCurrentItem(null)
    setCurrentUnitMerge(null)
    setFormData({ name: '' })
    clearUnitMergeError()
  }

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        return
      }

      if (isEditMode && currentItem?.id) {
        const updateData: UpdateUnitMergeRequest = {
          id: currentItem.id,
          name: formData.name.trim()
        }
        await updateItem(currentItem.id, updateData)
      } else {
        const createData: CreateUnitMergeRequest = {
          name: formData.name.trim()
        }
        await createItem(createData)
      }

      handleCloseDialog()
    } catch (error) {
      // Error is handled by the hook
    }
  }

  const handleDelete = async (item: UnitMerge) => {
    if (!item.id) return

    if (window.confirm(`¿Estás seguro de que deseas eliminar "${item.name}"?`)) {
      try {
        await deleteItem(item.id)
      } catch (error) {
        // Error is handled by the hook
      }
    }
  }

  const handleRefresh = () => {
    loadItems()
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title={
            <Box display='flex' alignItems='center' gap={2}>
              <Typography variant='h5' component='h1'>
                Unit Merge Catalog
              </Typography>
              <Chip label={`${items.length} items`} color='primary' variant='outlined' size='small' />
            </Box>
          }
          action={
            <Stack direction='row' spacing={1}>
              <TextField
                size='small'
                placeholder='Search by name...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ minWidth: 200 }}
              />
              <Button variant='outlined' startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={isLoading}>
                Refresh
              </Button>
              <Button
                variant='contained'
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                disabled={isCreating}
              >
                New Unit Merge
              </Button>
            </Stack>
          }
        />
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }} onClose={clearUnitMergeError}>
          {error}
        </Alert>
      )}

      {/* Data Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} variant='outlined'>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align='center' sx={{ py: 4 }}>
                      <CircularProgress />
                      <Typography variant='body2' sx={{ mt: 1 }}>
                        Loading unit merges...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align='center' sx={{ py: 4 }}>
                      <Typography variant='body2' color='text.secondary'>
                        {searchQuery ? 'No items match your search' : 'No unit merges found'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map(item => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>
                        <Typography variant='body2' fontWeight='medium'>
                          {item.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '-'}</TableCell>
                      <TableCell align='right'>
                        <Stack direction='row' spacing={1} justifyContent='flex-end'>
                          <IconButton
                            size='small'
                            color='primary'
                            onClick={() => handleOpenDialog(item)}
                            disabled={isUpdating}
                          >
                            <EditIcon fontSize='small' />
                          </IconButton>
                          <IconButton
                            size='small'
                            color='error'
                            onClick={() => handleDelete(item)}
                            disabled={isDeleting}
                          >
                            <DeleteIcon fontSize='small' />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth='sm' fullWidth>
        <DialogTitle>{isEditMode ? 'Edit Unit Merge' : 'Create New Unit Merge'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='normal'
            label='Name'
            fullWidth
            variant='outlined'
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            error={!formData.name.trim() && formData.name.length > 0}
            helperText={!formData.name.trim() && formData.name.length > 0 ? 'Name is required' : ''}
            disabled={isCreating || isUpdating}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isCreating || isUpdating}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant='contained'
            disabled={!formData.name.trim() || isCreating || isUpdating}
            startIcon={(isCreating || isUpdating) && <CircularProgress size={16} />}
          >
            {isCreating || isUpdating ? (isEditMode ? 'Updating...' : 'Creating...') : isEditMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UnitMergePage
