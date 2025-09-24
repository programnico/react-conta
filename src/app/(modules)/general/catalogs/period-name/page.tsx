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
  Search as SearchIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material'
import { usePeriodName } from '@/features/general/period-name/hooks/usePeriodName'
import type { PeriodName, CreatePeriodNameRequest, UpdatePeriodNameRequest } from '@/features/general/period-name/types'

const PeriodNamePage = () => {
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
    setCurrentPeriodName,
    clearPeriodNameError,
    activeItems,
    getByName
  } = usePeriodName({
    autoLoad: true,
    onSuccess: message => console.log('Success:', message),
    onError: error => console.error('Error:', error)
  })

  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentItem, setCurrentItem] = useState<PeriodName | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [searchQuery, setSearchQuery] = useState('')

  // Clear error when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      clearPeriodNameError()
    }
  }, [isDialogOpen, clearPeriodNameError])

  // Filter items based on search
  const filteredItems = items.filter(
    item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleOpenDialog = (item?: PeriodName) => {
    if (item) {
      // Edit mode
      setIsEditMode(true)
      setCurrentItem(item)
      setCurrentPeriodName(item)
      setFormData({
        name: item.name,
        description: item.description || ''
      })
    } else {
      // Create mode
      setIsEditMode(false)
      setCurrentItem(null)
      setCurrentPeriodName(null)
      setFormData({
        name: '',
        description: ''
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setIsEditMode(false)
    setCurrentItem(null)
    setCurrentPeriodName(null)
    setFormData({
      name: '',
      description: ''
    })
    clearPeriodNameError()
  }

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        return
      }

      if (isEditMode && currentItem?.id) {
        const updateData: UpdatePeriodNameRequest = {
          id: currentItem.id,
          name: formData.name.trim(),
          description: formData.description.trim() || undefined
        }
        await updateItem(currentItem.id, updateData)
      } else {
        const createData: CreatePeriodNameRequest = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined
        }
        await createItem(createData)
      }

      handleCloseDialog()
    } catch (error) {
      // Error is handled by the hook
      console.error('Form submission error:', error)
    }
  }

  const handleDelete = async (item: PeriodName) => {
    if (!item.id) return

    if (window.confirm(`¿Estás seguro de que deseas eliminar "${item.name}"?`)) {
      try {
        await deleteItem(item.id)
      } catch (error) {
        // Error is handled by the hook
        console.error('Delete error:', error)
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
              <ScheduleIcon color='primary' />
              <Typography variant='h5' component='h1'>
                Period Name Catalog
              </Typography>
              <Chip label={`${items.length} items`} color='primary' variant='outlined' size='small' />
            </Box>
          }
          subheader='Manage period names for your system'
          action={
            <Stack direction='row' spacing={1}>
              <TextField
                size='small'
                placeholder='Search by name or description...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ minWidth: 250 }}
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
                New Period Name
              </Button>
            </Stack>
          }
        />
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }} onClose={clearPeriodNameError}>
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
                  <TableCell>Description</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align='center' sx={{ py: 4 }}>
                      <CircularProgress />
                      <Typography variant='body2' sx={{ mt: 1 }}>
                        Loading period names...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align='center' sx={{ py: 4 }}>
                      <Typography variant='body2' color='text.secondary'>
                        {searchQuery ? 'No items match your search' : 'No period names found'}
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
                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {item.description || '-'}
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
                            title='Edit period name'
                          >
                            <EditIcon fontSize='small' />
                          </IconButton>
                          <IconButton
                            size='small'
                            color='error'
                            onClick={() => handleDelete(item)}
                            disabled={isDeleting}
                            title='Delete period name'
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
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={1}>
            <ScheduleIcon color='primary' />
            {isEditMode ? 'Edit Period Name' : 'Create New Period Name'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label='Name *'
              fullWidth
              variant='outlined'
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              error={!formData.name.trim() && formData.name.length > 0}
              helperText={
                !formData.name.trim() && formData.name.length > 0 ? 'Name is required' : 'Enter the period name'
              }
              disabled={isCreating || isUpdating}
            />
            <TextField
              label='Description'
              fullWidth
              variant='outlined'
              multiline
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              helperText='Optional description for the period'
              disabled={isCreating || isUpdating}
            />
          </Stack>
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

export default PeriodNamePage
